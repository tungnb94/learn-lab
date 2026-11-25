LAB.module("finance-ml", {
  "id": "fml-sample-weights",
  "order": 3,
  "title": "Sample Weights for Overlapping Labels",
  "summary": "How overlapping outcome windows break the IID assumption, and how concurrency, average uniqueness, the sequential bootstrap, and return-attribution, time-decay and class weights restore a sensible effective sample for ML fitting and validation.",
  "sources": [
    {
      "label": "López de Prado (2018) — Advances in Financial Machine Learning, ch. 4 (Sample Weights)",
      "url": ""
    },
    {
      "label": "López de Prado (2018) — AFML ch. 6 (Ensemble Methods)",
      "url": ""
    },
    {
      "label": "Breiman (1996) — Bagging predictors, Machine Learning 24",
      "url": "https://doi.org/10.1007/BF00058655"
    },
    {
      "label": "Britten-Jones, Neuberger & Nolte (2011) — Improved inference in regression with overlapping observations",
      "url": "https://doi.org/10.1111/j.1468-5957.2011.02244.x"
    }
  ],
  "lessons": [
    {
      "id": "fml-sample-weights-1",
      "title": "Concurrency, Uniqueness and the Sequential Bootstrap",
      "minutes": 30,
      "html": "<h3>1. The problem: labels that share bars are not independent draws</h3>\n<p>Almost every supervised setup in AFML produces labels that span intervals. A triple-barrier event $i$ starts at $t_{i,0}$ and resolves at $t_{i,1}$ (first touch of a horizontal barrier or the vertical barrier), and its label is a function of the path on $[t_{i,0}, t_{i,1}]$. Whenever events are sampled more frequently than they resolve &mdash; CUSUM events a few bars apart, a 20-day vertical barrier, daily sampling &mdash; the intervals overlap and consecutive labels are functions of largely the same returns.</p>\n<p>The cleanest way to see the damage: let bar returns be IID with variance $\\sigma^2$ and let every label be the sign of an $h$-bar forward return, sampled every bar. Two labels $k$ bars apart share $h-k$ bars, so</p>\n$$\\operatorname{corr}\\big(r_{t,t+h},\\, r_{t+k,t+k+h}\\big) = \\max\\Big(0, 1-\\tfrac{k}{h}\\Big).$$\n<p>With $N$ such labels the sample carries roughly $N/h$ independent pieces of information. For a 20-day horizon on 10 years of daily data that is about 125 effective observations, not 2,500. Econometrics has long-standing fixes for <em>inference</em> on overlapping data (Hansen&ndash;Hodrick and Newey&ndash;West standard errors, or regressions rebuilt on non-overlapping aggregates). ML has a different problem: there is often no standard error to correct. Overlap distorts the <em>estimator itself</em>:</p>\n<ul>\n<li><strong>Greedy split search</strong> in trees treats $h$ near-copies of one outcome as $h$ confirmations, so spurious splits look statistically strong and leaves fit noise.</li>\n<li><strong>Bagging</strong> loses its variance reduction: bootstrap samples of redundant observations are nearly identical, so the trees are highly correlated.</li>\n<li><strong>Out-of-bag and naive K-fold scores</strong> are inflated because the held-out observation has near-twins in the training set (the reason for purging and embargo in AFML ch. 7).</li>\n</ul>\n<p>The tools of AFML ch. 4 do not remove the dependence; they re-express it as weights and sampling probabilities so that each observation's influence is proportional to the information it actually carries.</p>\n\n<h3>2. Concurrency and uniqueness</h3>\n<p>Fix a bar grid $t = 1,\\dots,T$ (whatever bar type you labelled on). Define the indicator $\\mathbb{1}_{t,i} = 1$ if $[t_{i,0}, t_{i,1}]$ covers bar $t$, else 0. Then:</p>\n$$c_t = \\sum_{i=1}^{N} \\mathbb{1}_{t,i}, \\qquad u_{t,i} = \\frac{\\mathbb{1}_{t,i}}{c_t}, \\qquad \\bar u_i = \\frac{\\sum_{t} u_{t,i}}{\\sum_t \\mathbb{1}_{t,i}}.$$\n<p>$c_t$ is the <strong>concurrency</strong> (number of labels alive at bar $t$), $u_{t,i}$ is label $i$'s <strong>uniqueness</strong> on bar $t$, and $\\bar u_i \\in (0,1]$ is its <strong>average uniqueness</strong> over its lifespan. Two identities are worth internalising:</p>\n<ul>\n<li>For every covered bar, $\\sum_i u_{t,i} = 1$: each bar's information is split exactly once among the labels that use it. Hence $\\sum_i \\sum_t u_{t,i}$ equals the number of covered bars.</li>\n<li>In the stylised fixed-horizon example above, interior labels have $c_t = h$ throughout, so $\\bar u_i = 1/h$ and $\\sum_i \\bar u_i \\approx N/h$ &mdash; exactly the effective sample size we derived from the correlation structure. This is why $\\sum_i \\bar u_i$ is a useful, model-free proxy for the number of independent labels.</li>\n</ul>\n<p>Uniqueness is a crude dependence measure: it ignores that partial overlap of a volatile bar matters more than overlap of a quiet one, and it is blind to cross-sectional dependence (two stocks' labels on the same dates are counted as unique if you build $c_t$ per instrument). In a panel you must decide whether concurrency is computed per asset or across the whole book; per-asset is the AFML default, but for a market-neutral cross-sectional model the cross-sectional correlation of labels on a given date is often the larger problem.</p>\n<p>Concurrency and average uniqueness can be computed in $O(N+T)$ with difference arrays and prefix sums instead of the $O(NT)$ indicator matrix:</p>\n<pre><code class=\"language-python\">import numpy as np\n\ndef concurrency_and_uniqueness(t0_idx, t1_idx, n_bars):\n    \"\"\"t0_idx, t1_idx: integer bar positions (inclusive) of each label's span.\"\"\"\n    diff = np.zeros(n_bars + 1)\n    np.add.at(diff, t0_idx, 1)\n    np.add.at(diff, t1_idx + 1, -1)\n    c = np.cumsum(diff)[:-1]                       # c_t = number of live labels at bar t\n    inv_c = np.where(c &gt; 0, 1.0 / np.maximum(c, 1), 0.0)\n    cs = np.concatenate([[0.0], np.cumsum(inv_c)])\n    span = t1_idx - t0_idx + 1\n    avg_u = (cs[t1_idx + 1] - cs[t0_idx]) / span   # mean of 1/c_t over each label's life\n    return c, avg_u\n\ndef kish_ess(w):\n    w = np.asarray(w, dtype=float)\n    return w.sum() ** 2 / (w ** 2).sum()</code></pre>\n<p>The Kish effective sample size $N_{\\text{eff}} = (\\sum w_i)^2 / \\sum w_i^2$ is a complementary diagnostic for whatever <em>weights</em> you end up using: it tells you how much the weighting itself concentrates the fit, on top of the label redundancy measured by $\\sum_i \\bar u_i$.</p>\n\n<div class=\"callout warn\"><strong>Pitfall &mdash; concurrency leaks across the train/test boundary.</strong> If you compute $c_t$ once on the full sample, training labels near the cutoff get uniqueness that depends on test-period events (and on $t_{i,1}$ values that were not yet known). Recompute concurrency inside each training fold using only training events, and drop or truncate events whose $t_{i,1}$ is still unresolved at the cutoff. Also make sure $t_{i,0}, t_{i,1}$ are mapped to the <em>same</em> bar index used for concurrency; mixing timestamps and bar positions silently produces off-by-one coverage.</div>\n\n<h3>3. Bagging when uniqueness is low</h3>\n<p>Recall the variance of a bagged average of $B$ base learners with individual variance $\\sigma^2$ and average pairwise correlation $\\bar\\rho$:</p>\n$$\\operatorname{Var}\\Big(\\tfrac{1}{B}\\textstyle\\sum_b \\hat f_b\\Big) = \\bar\\rho\\,\\sigma^2 + \\frac{1-\\bar\\rho}{B}\\,\\sigma^2.$$\n<p>Adding learners only attacks the second term. A standard bootstrap of size $N$ from $N$ highly redundant observations produces bags that contain essentially the same information, so $\\bar\\rho$ stays high and the first term dominates. Two remedies follow (AFML ch. 4 and ch. 6):</p>\n<ol>\n<li><strong>Shrink the bag:</strong> set <code>max_samples</code> to about $\\bar u = \\frac1N\\sum_i \\bar u_i$ (as a fraction). Each bag then contains roughly as many draws as there are effectively independent labels, so bags differ more and trees decorrelate. In scikit-learn this is <code>BaggingClassifier(..., max_samples=avg_u)</code> or <code>RandomForestClassifier(max_samples=avg_u)</code>.</li>\n<li><strong>Change the sampling law:</strong> the <strong>sequential bootstrap</strong> draws observations one at a time with probability proportional to the average uniqueness they <em>would have</em> relative to the observations already in the bag.</li>\n</ol>\n<p>Formally, after draws $\\phi^{(s-1)}$, let $c^{(s-1)}_t$ be the concurrency of the bag (counting repeats). Candidate $j$'s uniqueness if added is $u^{(s)}_{t,j} = \\mathbb{1}_{t,j} / (1 + c^{(s-1)}_t)$ on its bars, its average uniqueness is $\\bar u^{(s)}_j$, and the draw probability is</p>\n$$\\delta^{(s)}_j = \\frac{\\bar u^{(s)}_j}{\\sum_{k=1}^{N} \\bar u^{(s)}_k}.$$\n<p>A label that heavily overlaps what is already in the bag becomes less likely; a label covering untouched bars keeps probability close to its unconditional share. The bag is still drawn with replacement, so it remains a randomised resample, but its average uniqueness is systematically higher than under the IID bootstrap. AFML's Monte Carlo on random intervals shows a clear upward shift in the distribution of bag uniqueness.</p>\n<pre><code class=\"language-python\">def seq_bootstrap(ind, n_draws, rng):\n    \"\"\"ind: dense (T, N) 0/1 indicator matrix (fine for N up to a few thousand).\"\"\"\n    T, N = ind.shape\n    ind = ind.astype(float)\n    lengths = ind.sum(axis=0)\n    c = np.zeros(T)                                # concurrency of the bag so far\n    drawn = np.empty(n_draws, dtype=int)\n    for s in range(n_draws):\n        denom = c[:, None] + ind                   # concurrency if candidate j were added\n        u = np.divide(ind, denom, out=np.zeros_like(ind), where=denom &gt; 0)\n        avg_u = u.sum(axis=0) / lengths\n        j = rng.choice(N, p=avg_u / avg_u.sum())\n        drawn[s] = j\n        c += ind[:, j]\n    return drawn</code></pre>\n<p>The naive implementation costs $O(N\\,T)$ per draw and $O(N^2 T)$ per bag, which is prohibitive for tens of thousands of events. Practical versions use sparse indicators, update only the bars touched by the last draw, or bootstrap blocks of events. Two honest caveats for an experienced researcher: (i) replication studies frequently find that most of the decorrelation benefit comes from reducing <code>max_samples</code>, with sequential sampling adding a second-order improvement, so benchmark both on your data; (ii) the out-of-bag score remains contaminated under either scheme, because OOB observations still overlap in-bag ones &mdash; use purged CV for model selection and treat OOB only as a sanity check.</p>\n\n<h3>4. Ensemble recipe (AFML ch. 6 context)</h3>\n<p>For random forests on financial labels the chapter suggests one of: (a) a bagged decision tree with <code>max_samples</code> set to average uniqueness and balanced class weights per bag; (b) a random forest with a low <code>max_features</code> to force diversity and a non-trivial <code>min_weight_fraction_leaf</code> so leaves cannot be fit to a handful of redundant observations; (c) replacing the bootstrap with the sequential bootstrap. All three target the same quantity &mdash; the correlation term $\\bar\\rho\\sigma^2$ &mdash; and all three should be validated with the same purged, weighted scoring you will use downstream.</p>"
    },
    {
      "id": "fml-sample-weights-2",
      "title": "Return-Attribution, Time-Decay and Class Weights",
      "minutes": 28,
      "html": "<h3>1. Why uniqueness is not the end of the story</h3>\n<p>Average uniqueness tells you how much <em>independent</em> information a label carries, but not how much <em>economic</em> information. Two labels with identical $\\bar u_i$ may differ enormously in what is at stake: one spans a quiet drift of 10 bp, the other a 6% gap. Meanwhile, markets drift, so a label from 2009 may describe a different data-generating process than one from last quarter, and class frequencies are rarely balanced (meta-labels in particular are often 30/70 or worse). AFML ch. 4 handles these with three multiplicative layers of sample weights: return attribution, time decay, and class weights. The fitted model then minimises a weighted empirical risk</p>\n$$\\hat f = \\arg\\min_f \\sum_{i=1}^{N} w_i\\, \\ell\\big(y_i, f(x_i)\\big), \\qquad w_i = w^{\\text{ret}}_i \\cdot d_i \\cdot w^{\\text{cls}}_{y_i}.$$\n\n<h3>2. Return-attribution weights</h3>\n<p>Split each bar's (log) return equally among the labels alive on that bar, sum each label's share over its life, and take absolute values:</p>\n$$\\tilde w_i = \\Big|\\sum_{t = t_{i,0}}^{t_{i,1}} \\frac{r_{t-1,t}}{c_t}\\Big|, \\qquad w^{\\text{ret}}_i = \\tilde w_i\\, \\frac{N}{\\sum_{j} \\tilde w_j}.$$\n<p>Two effects are built in. Dividing by $c_t$ applies the uniqueness discount bar by bar, so redundant labels lose weight. Weighting by the magnitude of the attributed return emphasises labels whose outcomes were economically decisive, which aligns the classifier with a P&amp;L objective rather than hit rate. The absolute value matters: the sign of the outcome is already in $y_i$; the weight measures size.</p>\n<p>Use log returns so that summation over bars is coherent. Expect the weight distribution to be heavy-tailed &mdash; it inherits the tails of returns &mdash; so check $N_{\\text{eff}}$ and consider winsorising $\\tilde w$ or using $\\tilde w^{\\gamma}$ with $\\gamma &lt; 1$. A model fit on a handful of crash-period labels with enormous weight is not a robust model.</p>\n<p>A subtle point for an equity researcher: return attribution weights favour high-volatility periods and high-volatility names. If your labels already scale barriers by volatility (as triple-barrier labels typically do), return attribution partly reintroduces the volatility exposure you normalised away. One alternative is attributing <em>volatility-scaled</em> returns $r_{t-1,t}/\\hat\\sigma_{t-1}$; another is to accept the tilt deliberately because it matches how the strategy is sized.</p>\n\n<h3>3. Time-decay weights</h3>\n<p>To let recent data count more without discarding history abruptly, AFML defines decay on <em>cumulative uniqueness</em> rather than calendar time. Order labels by end time and let $x_i = \\sum_{j \\le i} \\bar u_j$ run from near 0 to $X = \\sum_j \\bar u_j$. Use a piecewise-linear decay $d(x) = \\max\\{0,\\, a + b x\\}$ with $d(X) = 1$ for the newest label and a single user parameter $c \\in (-1, 1]$:</p>\n<ul>\n<li>$c \\in [0,1]$: $b = \\frac{1-c}{X}$, so the oldest label receives weight $\\approx c$. $c = 1$ means no decay.</li>\n<li>$c \\in (-1,0)$: $b = \\frac{1}{(c+1)X}$, so the oldest fraction $|c|$ of the uniqueness mass gets zero weight &mdash; a soft rolling window.</li>\n</ul>\n$$a = 1 - bX.$$\n<p>Measuring age in uniqueness units means that a burst of heavily overlapping events does not age the sample faster than a quiet period with few events &mdash; decay is paid per unit of new information, not per event. Exponential decay is an equally valid choice; what matters is that $c$ (or the half-life) is a hyperparameter chosen inside purged CV, not a number picked after looking at the backtest. Pesaran and Timmermann's work on estimation windows under breaks is the relevant theory: when the break date is uncertain, using some pre-break data with downweighting often beats both the full window and a hard post-break window in mean squared forecast error.</p>\n<pre><code class=\"language-python\">import numpy as np\n\ndef return_attribution_weights(log_ret, t0_idx, t1_idx, c):\n    \"\"\"log_ret[t]: log return accrued on bar t; c: concurrency per bar.\n    Each bar's return is split equally among the labels alive on that bar.\"\"\"\n    r_over_c = np.where(c &gt; 0, log_ret / np.maximum(c, 1), 0.0)\n    cs = np.concatenate([[0.0], np.cumsum(r_over_c)])\n    w = np.abs(cs[t1_idx + 1] - cs[t0_idx])\n    return w * len(w) / w.sum()                    # normalise to sum to N\n\ndef time_decay(avg_u, c_last=0.5):\n    \"\"\"avg_u sorted by label end time. c_last in (-1, 1]: weight of the oldest label\n    (if &gt;= 0) or fraction of oldest 'uniqueness mass' zeroed out (if &lt; 0).\"\"\"\n    x = np.cumsum(avg_u)\n    total = x[-1]\n    slope = (1.0 - c_last) / total if c_last &gt;= 0 else 1.0 / ((c_last + 1.0) * total)\n    intercept = 1.0 - slope * total\n    return np.clip(intercept + slope * x, 0.0, None)\n\n# combined weight passed to fit(..., sample_weight=w) AND to the CV scorer\n# w = return_attribution_weights(...) * time_decay(avg_u, -0.25)</code></pre>\n\n<h3>4. Class weights</h3>\n<p>With imbalanced labels, an unweighted classifier tends to predict the majority class and the minority class &mdash; often the one that matters, e.g. the rare true positives of a meta-model &mdash; contributes little to the loss. The scikit-learn heuristic <code>class_weight=\"balanced\"</code> sets $w^{\\text{cls}}_k = N / (K N_k)$ so each class carries equal total weight. Inside a random forest, <code>\"balanced_subsample\"</code> recomputes the class weights within each bootstrap bag, which matters precisely when bags are small (low <code>max_samples</code>) and class proportions vary across bags.</p>\n<p>Keep three cautions in mind. First, class weighting changes the implied prior, so predicted probabilities are no longer calibrated to base rates; if you size bets from $\\hat p$ (AFML ch. 10), recalibrate on a purged validation fold or correct the odds analytically by the ratio of true to weighted class priors. Second, class weights should multiply the other weights, but the \"balanced\" formula counts observations; with return and uniqueness weights in play, balance on <em>total sample weight</em> per class instead. Third, very rare classes in triple-barrier labelling (e.g. vertical-barrier outcomes labelled 0) may be better dropped or merged than up-weighted.</p>\n\n<h3>5. Putting the layers together correctly</h3>\n<ol>\n<li>Compute concurrency and $\\bar u_i$ <strong>inside each training fold</strong>.</li>\n<li>Compute return-attribution weights on training bars only, normalise to sum to the number of training labels.</li>\n<li>Multiply by time decay (ordered by $t_{i,1}$) and by class weights balanced on total weight.</li>\n<li>Pass the same weights to <code>fit</code> and to the scorer: a weighted log-loss or weighted accuracy on the purged test fold. Scoring unweighted after fitting weighted answers a different question than the one you optimised.</li>\n<li>Report $N_{\\text{eff}}$, $\\sum_i \\bar u_i$, and the share of total weight in the top 1% of labels alongside every model.</li>\n</ol>\n<p>Regularisation hyperparameters interact with weights. <code>min_weight_fraction_leaf</code> is expressed in weight units, so after up-weighting a few labels a leaf can be \"large\" while containing three observations. For gradient boosting, weights scale per-sample gradients and Hessians, so <code>min_child_weight</code> and learning rate need to be re-tuned once you change the weighting scheme. For neural nets, weights interact with minibatch composition; consider weighted sampling instead of weighted loss when weights are extreme, because weighted loss with tiny batches has high gradient variance.</p>\n\n<div class=\"callout warn\"><strong>Pitfall &mdash; normalisation that leaks scale between folds.</strong> If weights are normalised to sum to $N$ on the full sample and then subset into folds, folds from volatile regimes carry systematically more total weight. Fold-level losses are then not comparable, and averaging them over-represents crisis folds in model selection. Normalise within each fold and, for reporting, show both weighted and unweighted metrics so a reader can see whether conclusions hinge on a few heavy labels.</div>\n\n<h3>6. What weights cannot fix</h3>\n<p>Weights reallocate influence among observations; they do not create information. If $\\sum_i \\bar u_i$ is 150, no weighting scheme makes a 400-leaf forest identifiable. The real decision variables are upstream: event sampling frequency (sample fewer, more distinct events with a CUSUM filter), label horizon (shorter vertical barriers mean less overlap), and model capacity. Treat ch. 4 tools as the bookkeeping that makes overlapping labels usable, and the effective-sample diagnostics as the honest budget your model complexity must respect.</p>"
    }
  ],
  "cheatsheet": [
    {
      "term": "Label indicator",
      "formula": "\\mathbb{1}_{t,i} = \\mathbb{1}\\{t_{i,0} \\le t \\le t_{i,1}\\}",
      "note": "Does label i's span cover bar t?"
    },
    {
      "term": "Concurrency",
      "formula": "c_t = \\sum_{i} \\mathbb{1}_{t,i}",
      "note": "Number of labels alive on bar t; compute per training fold."
    },
    {
      "term": "Uniqueness on a bar",
      "formula": "u_{t,i} = \\mathbb{1}_{t,i}/c_t",
      "note": "Each covered bar's information is split once: sum over i equals 1."
    },
    {
      "term": "Average uniqueness",
      "formula": "\\bar u_i = \\frac{\\sum_t u_{t,i}}{\\sum_t \\mathbb{1}_{t,i}}",
      "note": "In (0,1]; equals 1/h for interior fixed-horizon labels sampled every bar."
    },
    {
      "term": "Effective label count",
      "formula": "N_{\\text{eff}}^{\\text{lab}} \\approx \\sum_i \\bar u_i",
      "note": "Model-free proxy for number of independent outcomes."
    },
    {
      "term": "Overlap correlation (IID bars)",
      "formula": "\\rho_k = \\max(0, 1 - k/h)",
      "note": "Two h-bar returns k bars apart."
    },
    {
      "term": "Kish ESS of weights",
      "formula": "N_{\\text{eff}} = \\frac{(\\sum_i w_i)^2}{\\sum_i w_i^2}",
      "note": "How concentrated the weighting is."
    },
    {
      "term": "Bagging variance",
      "formula": "\\bar\\rho\\sigma^2 + \\frac{1-\\bar\\rho}{B}\\sigma^2",
      "note": "Redundant data keeps rho-bar high; more trees do not help."
    },
    {
      "term": "max_samples rule",
      "formula": "\\texttt{max\\_samples} \\approx \\tfrac{1}{N}\\sum_i \\bar u_i",
      "note": "Shrink bags to the effective sample to decorrelate learners."
    },
    {
      "term": "Sequential bootstrap prob.",
      "formula": "\\delta_j^{(s)} = \\bar u_j^{(s)} \\big/ \\sum_k \\bar u_k^{(s)}",
      "note": "Uniqueness of candidate j relative to the bag drawn so far."
    },
    {
      "term": "Return attribution weight",
      "formula": "\\tilde w_i = \\Big|\\sum_{t=t_{i,0}}^{t_{i,1}} \\frac{r_{t-1,t}}{c_t}\\Big|",
      "note": "Normalise to sum to N; heavy-tailed, check ESS."
    },
    {
      "term": "Time decay (piecewise linear)",
      "formula": "d(x) = \\max(0, a + bx),\\; d(X)=1,\\; X = \\sum_i \\bar u_i",
      "note": "Age measured in cumulative uniqueness; c<0 zeroes the oldest |c| share."
    },
    {
      "term": "Balanced class weight",
      "formula": "w_k^{\\text{cls}} = \\frac{N}{K N_k}",
      "note": "Use balanced_subsample in RF; breaks probability calibration."
    },
    {
      "term": "Weighted empirical risk",
      "formula": "\\sum_i w_i\\,\\ell(y_i, f(x_i)),\\; w_i = w_i^{\\text{ret}} d_i w_{y_i}^{\\text{cls}}",
      "note": "Use the same weights in fit and in CV scoring."
    }
  ],
  "flashcards": [
    {
      "q": "Why do overlapping labels hurt ML estimators even when you don't care about standard errors?",
      "a": "They distort the fitting procedure itself: greedy splits treat near-copies as independent confirmations, bootstrap bags become near-identical (high correlation between bagged learners), and OOB / unpurged CV scores are inflated by near-twins across the split."
    },
    {
      "q": "Define concurrency and average uniqueness.",
      "a": "$c_t=\\sum_i \\mathbb{1}_{t,i}$ is the number of labels covering bar $t$. Average uniqueness $\\bar u_i$ is the mean of $1/c_t$ over the bars in label $i$'s span."
    },
    {
      "q": "For h-bar forward-return labels sampled every bar with IID returns, what are the correlation of labels k apart and the average uniqueness?",
      "a": "Correlation $\\max(0,1-k/h)$; interior labels have $c_t = h$, so $\\bar u_i = 1/h$ and $\\sum_i \\bar u_i \\approx N/h$."
    },
    {
      "q": "What identity makes $\\sum_i \\bar u_i$ a natural effective sample size?",
      "a": "On every covered bar $\\sum_i u_{t,i}=1$: each bar's information is allocated exactly once across the labels using it."
    },
    {
      "q": "What does setting max_samples to average uniqueness achieve in bagging?",
      "a": "Each bag contains about as many draws as there are effectively independent labels, so bags differ more and the correlation term $\\bar\\rho\\sigma^2$ of the bagged variance falls."
    },
    {
      "q": "How does the sequential bootstrap choose the next draw?",
      "a": "With probability proportional to the candidate's average uniqueness computed against the concurrency of the observations already drawn (including itself), so heavily overlapping candidates are down-weighted."
    },
    {
      "q": "Why is the OOB score still unreliable with the sequential bootstrap?",
      "a": "OOB observations still overlap in-bag observations in time, so information leaks. Use purged/embargoed CV for model selection."
    },
    {
      "q": "Write the return-attribution weight.",
      "a": "$\\tilde w_i = |\\sum_{t=t_{i,0}}^{t_{i,1}} r_{t-1,t}/c_t|$, then rescale so weights sum to $N$. It combines a per-bar uniqueness discount with emphasis on economically large outcomes."
    },
    {
      "q": "Why use absolute values in return-attribution weights?",
      "a": "The direction of the outcome is already encoded in the label; the weight should measure the magnitude of what was at stake."
    },
    {
      "q": "Why is time decay defined on cumulative uniqueness instead of calendar time or event count?",
      "a": "So that bursts of overlapping events do not age the sample faster than quiet periods; decay is charged per unit of new information."
    },
    {
      "q": "In AFML's time-decay scheme, what does c = -0.25 mean?",
      "a": "The oldest 25% of cumulative uniqueness gets zero weight, and weights rise linearly to 1 for the newest label: a soft rolling window."
    },
    {
      "q": "Difference between class_weight='balanced' and 'balanced_subsample' in a random forest?",
      "a": "'balanced' uses class frequencies of the full training set; 'balanced_subsample' recomputes them within each bootstrap sample, which matters when bags are small."
    },
    {
      "q": "What happens to predicted probabilities after class weighting, and why does it matter for bet sizing?",
      "a": "They reflect the reweighted prior, not true base rates, so they are miscalibrated. Recalibrate on a purged validation fold (or apply a prior-ratio correction) before mapping $\\hat p$ to bet size."
    },
    {
      "q": "Name three diagnostics to report with any weighted model.",
      "a": "Kish $N_{\\text{eff}}$ of the weights, $\\sum_i \\bar u_i$, and the share of total weight in the top 1% of labels (plus weighted vs unweighted metrics)."
    }
  ],
  "projects": [
    {
      "id": "fml-sample-weights-p1",
      "title": "Uniqueness-aware bagging on daily equity/ETF labels",
      "level": "core",
      "hours": "8–12",
      "goal": "Build triple-barrier labels on daily data for a basket of liquid ETFs, quantify label redundancy with concurrency and average uniqueness, and measure how max_samples tuning, sequential bootstrap and sample weights change tree correlation and purged-CV performance relative to a naive random forest.",
      "data": "Use only public or personal data. Never use employer data, code or infrastructure. Suggested: daily adjusted prices for 10–20 liquid ETFs (SPY, QQQ, IWM, sector SPDRs, TLT, GLD) via yfinance (unofficial API: adjusted prices get revised, and an ETF list chosen today is survivorship-biased, so state the caveat). Alternative: daily 1h/1d klines from data.binance.vision for BTCUSDT/ETHUSDT. Risk-free rate from FRED (DGS3MO) if needed.",
      "steps": [
        "Download 15+ years of daily data; compute daily volatility (EWM std of log returns) and CUSUM-filtered events per instrument.",
        "Label events with triple barriers (e.g. pt/sl = 1.5 sigma, vertical barrier 20 days); keep t0, t1 as bar positions.",
        "Implement O(N+T) concurrency and average uniqueness; plot c_t over time and the histogram of average uniqueness; report sum of average uniqueness vs N.",
        "Implement the sequential bootstrap (sparse or dense for a subsample) and compare bag average uniqueness vs standard bootstrap over 500 bags.",
        "Build simple features (multi-horizon momentum, volatility, distance to moving averages) and fit: (A) RF with defaults, (B) RF with max_samples = mean uniqueness, (C) bagged trees with sequential bootstrap, (D) B plus return-attribution x time-decay weights.",
        "Evaluate with purged K-fold (embargo 1%) using weighted log-loss; measure average pairwise correlation of tree predictions on test folds."
      ],
      "deliverables": [
        "Notebook or script with all functions unit-tested on a toy interval set with hand-computed uniqueness",
        "Table: N, sum of average uniqueness, Kish ESS per weighting scheme",
        "Table: purged-CV weighted log-loss, accuracy, and mean tree correlation for A–D",
        "Short write-up (1 page) on which intervention mattered most"
      ],
      "acceptance": [
        "Unit test: for 3 hand-specified overlapping intervals, computed average uniqueness matches hand calculation to 1e-12.",
        "Sequential bootstrap mean bag uniqueness exceeds standard bootstrap mean over 500 bags, with the difference and a bootstrap CI reported.",
        "Mean pairwise tree-prediction correlation for model B is lower than for model A on the same folds (report both numbers).",
        "Concurrency and weights are recomputed inside each training fold (demonstrated by an assertion that no test-fold event enters the training-fold concurrency).",
        "All metrics reported with the purged CV scheme, with fold-level weight normalisation."
      ],
      "extensions": [
        "Compare per-asset vs pooled cross-asset concurrency.",
        "Replace the sequential bootstrap with a moving-block bootstrap of events and compare.",
        "Add calibration (isotonic on a purged fold) and measure Brier score before and after."
      ]
    },
    {
      "id": "fml-sample-weights-p2",
      "title": "Monte Carlo study: when do sample weights help?",
      "level": "stretch",
      "hours": "14–20",
      "goal": "Design a controlled simulation with known signal, tunable overlap (label horizon / sampling rate) and a regime break, and map out where uniqueness weighting, return attribution and time decay improve out-of-sample performance versus where they only add variance.",
      "data": "Synthetic data generated by you (no external data required). Optionally calibrate volatility and regime parameters to public data: Ken French daily market factor (mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html) or FRED series. Public/personal data only; do not use employer data.",
      "steps": [
        "Simulate returns r_t = beta_t * x_{t-1} + eps_t with a feature x following an AR(1), heteroskedastic eps (GARCH(1,1)) and a structural change in beta_t at a known date.",
        "Label with fixed-horizon and triple-barrier schemes for horizons h in {1, 5, 20, 60}; sample events every bar and via CUSUM.",
        "Fit a gradient-boosted classifier and an RF under weighting schemes: none, uniqueness, return attribution, attribution x time decay (grid over c), each with max_samples tuning where applicable.",
        "Evaluate on a long post-break test period using both classification metrics and a simple sign-based strategy Sharpe ratio.",
        "Repeat for 200+ seeds; report distributions, not single runs."
      ],
      "deliverables": [
        "Reusable simulation module with configurable overlap and break",
        "Heatmaps of performance gain vs (horizon, weighting scheme)",
        "Analysis of variance: fraction of gain explained by max_samples vs weights vs time decay",
        "Discussion of when time decay hurts (no break) vs helps (break)"
      ],
      "acceptance": [
        "At h=1 (no overlap) the uniqueness weights are all 1 and results match the unweighted baseline exactly (asserted).",
        "Results reported over at least 200 seeds with mean, median and 5–95% bands for each cell.",
        "Time-decay c is selected inside purged CV on the training set only; the test period is never used for selection (asserted by code structure).",
        "A paired test (same seeds) quantifies whether attribution x decay beats uniqueness-only at h=20 with a reported p-value or CI.",
        "Kish ESS and sum of average uniqueness are reported for every configuration."
      ],
      "extensions": [
        "Add cross-sectional dependence (factor structure across 50 simulated assets) and test pooled concurrency.",
        "Compare weighted loss vs weighted sampling for a small MLP.",
        "Add the probability of backtest overfitting across the weighting grid."
      ]
    }
  ],
  "frontier": {
    "asOf": "2026-11",
    "summary": "AFML's uniqueness-based weights and sequential bootstrap are now standard in open-source financial-ML toolkits, but the research frontier has moved to (i) validating models honestly under overlap, via purged and combinatorial CV and selection-bias corrections, (ii) importing dependent-data resampling and inference results from statistics and econometrics, and (iii) treating time weighting as a problem of adaptation to non-stationarity, linked to covariate shift and concept drift. Practitioners increasingly treat weighting schemes as hyperparameters to validate rather than fixed recipes, and evidence on how much the sequential bootstrap adds beyond simply shrinking bag size is mixed and mostly informal.",
    "threads": [
      {
        "title": "Validation under overlap: purged, embargoed and combinatorial CV",
        "why": "Weights fix the fit, but model selection is where overlap does the most damage. Recent controlled comparisons find combinatorial purged CV gives lower probability of backtest overfitting than walk-forward or plain K-fold, and selection-bias corrections such as the deflated Sharpe ratio are the natural complement when many weighting schemes are tried.",
        "refs": [
          {
            "label": "Arian, Norouzi Mobarekeh & Seco (2024) — Backtest overfitting in the machine learning era: A comparison of out-of-sample testing methods in a synthetic controlled environment (Knowledge-Based Systems)",
            "url": "https://doi.org/10.1016/j.knosys.2024.112477"
          },
          {
            "label": "Bailey & López de Prado (2014) — The Deflated Sharpe Ratio: Correcting for Selection Bias, Backtest Overfitting and Non-Normality",
            "url": "https://doi.org/10.3905/jpm.2014.40.5.094"
          }
        ]
      },
      {
        "title": "Dependent-data resampling as an alternative to the sequential bootstrap",
        "why": "Block and stationary bootstraps preserve serial dependence by resampling contiguous blocks; applied to events rather than bars, they offer a cheaper, theoretically grounded way to build diverse bags. Comparing these against the sequential bootstrap inside bagging is an open empirical question.",
        "refs": [
          {
            "label": "Künsch (1989) — The jackknife and the bootstrap for general stationary observations (Annals of Statistics)",
            "url": "https://doi.org/10.1214/aos/1176347265"
          },
          {
            "label": "Politis & Romano (1994) — The stationary bootstrap (JASA)",
            "url": "https://doi.org/10.1080/01621459.1994.10476870"
          },
          {
            "label": "Breiman (1996) — Bagging predictors (Machine Learning)",
            "url": "https://doi.org/10.1007/BF00058655"
          }
        ]
      },
      {
        "title": "Econometric inference with overlapping observations",
        "why": "Long-horizon regression literature shows how to recover efficient estimates and valid inference from overlapping data by transforming the regression rather than discarding data. Translating such transformations into ML loss functions or feature construction is underexplored.",
        "refs": [
          {
            "label": "Britten-Jones, Neuberger & Nolte (2011) — Improved inference in regression with overlapping observations (J. Business Finance & Accounting)",
            "url": "https://doi.org/10.1111/j.1468-5957.2011.02244.x"
          }
        ]
      },
      {
        "title": "Time weighting as adaptation to non-stationarity",
        "why": "Time decay is one instance of a broader problem: estimation windows under breaks, importance weighting under covariate shift, and concept-drift adaptation in streaming ML. These literatures give principled ways to choose decay rates or density-ratio weights instead of hand-picked c values.",
        "refs": [
          {
            "label": "Pesaran & Timmermann (2007) — Selection of estimation window in the presence of breaks (J. Econometrics)",
            "url": "https://doi.org/10.1016/j.jeconom.2006.03.010"
          },
          {
            "label": "Shimodaira (2000) — Improving predictive inference under covariate shift by weighting the log-likelihood function",
            "url": "https://doi.org/10.1016/S0378-3758(00)00115-4"
          },
          {
            "label": "Gama, Žliobaitė, Bifet, Pechenizkiy & Bouchachia (2014) — A survey on concept drift adaptation (ACM Computing Surveys)",
            "url": "https://doi.org/10.1145/2523813"
          }
        ]
      },
      {
        "title": "Effective-number reweighting, imbalance and meta-labeling",
        "why": "Deep-learning work on long-tailed data reweights by an 'effective number' of samples, an idea closely related to average uniqueness. In finance, meta-labeling creates highly imbalanced secondary labels, making the interaction between class weights, uniqueness and calibration practically important.",
        "refs": [
          {
            "label": "Cui, Jia, Lin, Song & Belongie (2019) — Class-Balanced Loss Based on Effective Number of Samples (CVPR)",
            "url": "https://arxiv.org/abs/1901.05555"
          },
          {
            "label": "Joubert (2022) — Meta-Labeling: Theory and Framework (Journal of Financial Data Science)",
            "url": "https://doi.org/10.3905/jfds.2022.1.098"
          },
          {
            "label": "Gu, Kelly & Xiu (2020) — Empirical Asset Pricing via Machine Learning (Review of Financial Studies)",
            "url": "https://doi.org/10.1093/rfs/hhaa009"
          }
        ]
      }
    ],
    "openQuestions": [
      "Is there a principled (e.g. likelihood- or information-based) derivation of uniqueness weights, and under what return dynamics are they optimal?",
      "How much of the sequential bootstrap's benefit survives once max_samples is tuned, across asset classes and label horizons?",
      "How should concurrency be defined in a cross-sectional panel where labels on the same date are correlated through common factors?",
      "Can time-decay rates be estimated adaptively (e.g. via density-ratio or drift detectors) without leaking future information into training?",
      "What is the right way to combine class weighting with probability calibration when outputs feed directly into bet sizing?"
    ],
    "brainstorm": [
      "Pick a strategy you know (e.g. 12-1 momentum with monthly rebalancing on overlapping 3-month holding periods). Compute its sum of average uniqueness: how many independent observations does your favourite backtest really have?",
      "Would a factor-adjusted concurrency (residualising labels on market and sector returns first) change which observations get weight in a cross-sectional model?",
      "Design an experiment to separate the effect of bag size from bag composition in the sequential bootstrap.",
      "Where in your workflow do you already overweight recent data implicitly (rolling windows, re-fitting schedules)? Could an explicit time-decay hyperparameter replace that?",
      "If you had to defend a weighting scheme to a sceptical PM, which diagnostic (ESS, weight concentration, weighted vs unweighted metrics) would you lead with, and why?"
    ]
  }
}
);
