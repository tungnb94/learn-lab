LAB.module("finance-ml", {
  "id": "fml-cross-validation",
  "order": 5,
  "title": "Cross-Validation in Finance: Purging, Embargo and CPCV",
  "summary": "Why standard K-fold leaks on overlapping financial labels, how purging and embargo repair it, and how walk-forward, CV and combinatorial purged CV backtests differ in bias and variance; plus honest hyperparameter tuning and scoring.",
  "sources": [
    {
      "label": "López de Prado (2018), Advances in Financial Machine Learning, ch. 7 (Cross-Validation in Finance)",
      "url": ""
    },
    {
      "label": "López de Prado (2018), AFML ch. 9 (Hyper-Parameter Tuning with Cross-Validation)",
      "url": ""
    },
    {
      "label": "López de Prado (2018), AFML ch. 12 (Backtesting through Cross-Validation)",
      "url": ""
    },
    {
      "label": "Bailey, Borwein, López de Prado & Zhu (2017) — The Probability of Backtest Overfitting",
      "url": "https://papers.ssrn.com/abstract=2326253"
    }
  ],
  "lessons": [
    {
      "id": "fml-cross-validation-1",
      "title": "Why K-fold leaks: purging and embargo",
      "minutes": 25,
      "html": "<h3>1. What K-fold silently assumes</h3>\n<p>K-fold cross-validation estimates the expected loss of a learning procedure by repeatedly fitting on $K-1$ folds and scoring on the held-out fold. The estimator is approximately unbiased for the error of a model trained on $\\tfrac{K-1}{K}T$ observations <em>only if</em> the held-out fold is a fresh draw from the same distribution, i.e. if the pairs $(X_i, y_i)$ are exchangeable. Bates, Hastie and Tibshirani (2024) show that even in the IID case CV estimates the average error over hypothetical training sets rather than the error of the model you actually fit, and its naive standard errors under-cover. In finance we have a much more basic problem: the held-out fold is not fresh at all.</p>\n<p>Two mechanisms break exchangeability in a typical supervised financial dataset:</p>\n<ul>\n<li><strong>Label overlap.</strong> A label is a function of prices over an interval, $y_i = f\\big(p_{[t_{i,0},\\,t_{i,1}]}\\big)$: a fixed-horizon return, a triple-barrier outcome, a meta-label. When observations are sampled more often than the label horizon, the intervals overlap and adjacent labels share most of their underlying returns.</li>\n<li><strong>Serially correlated features.</strong> Rolling volatility, moving-average spreads, fractionally differentiated prices, and order-flow imbalance are persistent by construction, so $X_i \\approx X_{i+1}$.</li>\n</ul>\n<p>Put the two together and a randomly assigned test observation $j$ almost always has a training neighbour $i$ with $X_i \\approx X_j$ and $y_i \\approx y_j$. A flexible learner (a deep tree, a forest without depth limits, a kNN) memorises $(X_i, y_i)$ and then \"predicts\" $y_j$ by lookup. The CV score measures memorisation of a near-duplicate, not generalisation.</p>\n\n<h3>2. How much overlap is there?</h3>\n<p>Take daily sampling with an $h$-day forward-return label $y_t = \\operatorname{sign}(r_{t,t+h})$. Under IID daily returns, the correlation between the underlying $h$-day returns of two observations $\\ell$ days apart is $\\rho_\\ell = \\max(0, 1-\\ell/h)$. Each observation overlaps with $2(h-1)$ neighbours. Under shuffled K-fold, each neighbour lands in a training fold with probability $\\tfrac{K-1}{K}$, so the probability that a test observation has <em>no</em> overlapping training neighbour is</p>\n$$\\Pr(\\text{clean}) = \\left(\\tfrac{1}{K}\\right)^{2(h-1)},$$\n<p>which for $K=5$, $h=10$ is about $10^{-13}$. Even unshuffled (contiguous) K-fold, which is what <code>KFold(shuffle=False)</code> does, contaminates only the boundaries: roughly $h-1$ observations on each side of each test block. That is a much smaller leak, but it is not zero, and it scales with $h/(T/K)$. For a 60-day label with five folds on ten years of daily data, the boundary zone is about 10% of every test fold.</p>\n<p>The link to sample uniqueness (AFML ch. 4) is direct: if $\\bar u$ is the average uniqueness of labels, the effective number of independent labels is roughly $\\bar u\\,T$, and any CV scheme that treats $T$ rows as independent is overconfident by a factor of order $1/\\bar u$ even before leakage.</p>\n\n<h3>3. Purging</h3>\n<p>Let the test set be $\\mathcal{T}$ with label intervals $\\{[t_{j,0}, t_{j,1}]\\}_{j\\in\\mathcal{T}}$. Training observation $i$ is kept only if its label interval is disjoint from every test interval:</p>\n$$i \\in \\mathcal{S}_{\\text{train}} \\iff [t_{i,0}, t_{i,1}] \\cap [t_{j,0}, t_{j,1}] = \\varnothing \\quad \\forall j \\in \\mathcal{T}.$$\n<p>There are three ways to overlap: the training label starts inside a test label, ends inside one, or envelops one. For a contiguous test block with $a = \\min_j t_{j,0}$ and $b = \\max_j t_{j,1}$, the rule collapses to removing every $i$ with $t_{i,0} \\le b$ and $t_{i,1} \\ge a$. The input you need is therefore the <strong>series of label end times</strong> $t_1$ indexed by $t_0$ (the <code>t1</code> series from triple-barrier labeling), not only the timestamps of rows. A splitter that only sees row positions cannot purge correctly when events are irregularly spaced (CUSUM-filtered events, dollar bars).</p>\n<p>Cost: you discard about one label horizon of data on each side of the test block. With $K$ folds the total training loss is roughly $2h(K-1)/T$ per split, which is negligible for short horizons and material for long ones; that trade-off is itself informative, because a long label horizon really does mean you have fewer independent observations.</p>\n\n<h3>4. Embargo</h3>\n<p>Purging handles overlap of <em>labels</em>. It does not handle leakage through <em>features</em>. Consider a training observation that starts right after the test block ends. Its features (a 20-day realised volatility, an EWMA of returns) are computed from returns that lie inside the test labels' interval. The model can learn the mapping \"high recent vol here implies the label that just happened\", which is information about the test period's outcomes. The fix is an embargo: after each test block also drop training observations with</p>\n$$t_{i,0} \\in (b,\\; b + h_e], \\qquad h_e \\approx \\delta\\, T,$$\n<p>with $\\delta$ around $0.01$ in AFML, or more defensibly $h_e$ set to the longest feature lookback. The embargo is only needed <em>after</em> the test block: training observations before the test set have features built from data that predates it, and their labels have already been purged if they reach into it. This asymmetry is easy to get wrong if you copy a symmetric \"gap\" from a generic time-series splitter.</p>\n\n<h3>5. Implementation</h3>\n<p>A minimal purged K-fold with embargo, taking the label-end series as input. It keeps folds contiguous and never shuffles.</p>\n<pre><code class=\"language-python\">import numpy as np, pandas as pd\n\nclass PurgedKFold:\n    def __init__(self, t1: pd.Series, n_splits=5, embargo_pct=0.01):\n        # t1: index = label start t0 (sorted), values = label end t1\n        self.t1, self.k, self.pct = t1, n_splits, embargo_pct\n\n    def split(self, X, y=None, groups=None):\n        t0 = self.t1.index.values; t1 = self.t1.values\n        n = len(t0); emb = int(n * self.pct)\n        for test_idx in np.array_split(np.arange(n), self.k):\n            a, b = t0[test_idx[0]], t1[test_idx].max()\n            overlap = (t0 &lt;= b) &amp; (t1 &gt;= a)          # purge\n            last = np.searchsorted(t0, b, side=\"right\")\n            embargo = np.zeros(n, bool)\n            embargo[last:last + emb] = True              # embargo after test\n            train = ~(overlap | embargo)\n            train[test_idx] = False\n            yield np.where(train)[0], test_idx\n\n    def get_n_splits(self, *a, **k): return self.k\n</code></pre>\n<p>Sanity test you should always write: for every split, assert that no training interval intersects any test interval, and that no training $t_0$ falls in $(b, b+h_e]$. Then run the same model under <code>KFold(shuffle=True)</code>, <code>KFold(shuffle=False)</code> and <code>PurgedKFold</code> on a dataset where features carry <em>no</em> information about labels. Only the last should hover at the no-skill baseline.</p>\n\n<div class=\"callout warn\"><strong>Pitfall: leakage upstream of the splitter.</strong> Purging the final CV is useless if a step before it already saw the test period: a <code>StandardScaler</code> or PCA fit on the full sample, a feature selected because it looked good on the full history, a fractional-differencing order $d$ chosen on all data, or a target encoding computed globally. Every data-dependent transformation must sit inside the pipeline and be refit per fold. Also note that scikit-learn's <code>TimeSeriesSplit(gap=g)</code> drops $g$ <em>rows</em> before the test set: it is neither label-aware nor an after-test embargo, and with irregular event sampling a fixed row gap corresponds to a variable amount of calendar time.</div>\n\n<h3>6. What survives and what does not</h3>\n<p>Purging and embargo fix the <em>leakage</em> bias. They do not fix (i) the variance of the CV estimate, which is larger than the fold-to-fold standard deviation suggests because folds share training data and because labels within a fold are correlated; (ii) non-stationarity, which makes past and future folds draws from different distributions; or (iii) selection bias from running many configurations through the same splitter. Items (ii) and (iii) motivate the next lesson: comparing walk-forward with CV backtests, generating many paths with CPCV, and counting trials when tuning.</p>"
    },
    {
      "id": "fml-cross-validation-2",
      "title": "Walk-forward vs CV vs CPCV, and tuning with purged CV",
      "minutes": 28,
      "html": "<h3>1. Three ways to backtest a learned strategy</h3>\n<p>Once a model produces positions, \"backtesting\" is just a particular cross-validation scheme whose out-of-sample predictions are stitched into a P&amp;L path. Three schemes dominate.</p>\n<h4>Walk-forward (WF)</h4>\n<p>Train on $[0, t)$, predict $[t, t+\\Delta)$, roll forward. It is the only scheme that is causal: every prediction uses only information available at the time, so it is a faithful simulation of the historical decision process. Its weaknesses are statistical. It produces <strong>one path</strong>, so its Sharpe ratio is a single draw from a distribution whose width you never see; it is <strong>easy to overfit</strong> by iterating on that single path; early predictions are made with small training sets, so the path mixes models of very different quality; and the outcome depends heavily on the specific order of regimes in history.</p>\n<h4>Cross-validation backtest</h4>\n<p>Each of $K$ purged folds is scored by a model trained on the other folds, past and future. Every observation is tested exactly once with roughly the same amount of training data. The criticism is that the model scoring 2008 has seen 2009–2020, so the path is not a historical simulation; the defence is that the goal is not to reproduce history but to estimate how a strategy behaves across scenarios, and that, after purging and embargo, the future training data shares no labels and no feature windows with the test fold. CV still produces <strong>one path</strong>.</p>\n<h4>Combinatorial Purged CV (CPCV)</h4>\n<p>CPCV generalises CV to produce <em>many</em> paths, so the backtest delivers a distribution of performance statistics rather than a point estimate.</p>\n\n<h3>2. CPCV mechanics</h3>\n<p>Partition the $T$ observations, in time order, into $N$ contiguous groups. For each split choose $k$ groups to test and train on the remaining $N-k$ (after purging and embargo around every test group). The number of splits is</p>\n$$\\#\\text{splits} = \\binom{N}{k}.$$\n<p>Each split produces $k$ group-level forecasts, giving $k\\binom{N}{k}$ group forecasts in total. Each of the $N$ groups appears in the test set the same number of times, $\\binom{N-1}{k-1}$, so the forecasts can be assembled into</p>\n$$\\varphi[N,k] = \\frac{k}{N}\\binom{N}{k} = \\binom{N-1}{k-1}$$\n<p>complete backtest paths, each covering all $T$ observations exactly once. Examples: $N=6, k=2$ gives 15 splits and 5 paths; $N=10, k=2$ gives 45 splits and 9 paths; $N=10, k=3$ gives 120 splits and 36 paths. With $k=1$ CPCV collapses to ordinary purged K-fold with $\\varphi=1$.</p>\n<p>Path assembly is a bookkeeping exercise: for each group $g$, list the splits in which $g$ was tested (there are $\\varphi$ of them) in a fixed order; path $p$ takes, for every group, the forecast from that group's $p$-th test split. The choice of ordering is arbitrary, which already tells you the paths are exchangeable but <strong>not independent</strong>.</p>\n<p>Two design dials trade off against each other:</p>\n<table>\n<thead><tr><th>$N$</th><th>$k$</th><th>splits</th><th>paths $\\varphi$</th><th>train fraction $1-k/N$</th></tr></thead>\n<tbody>\n<tr><td>6</td><td>2</td><td>15</td><td>5</td><td>0.67</td></tr>\n<tr><td>8</td><td>2</td><td>28</td><td>7</td><td>0.75</td></tr>\n<tr><td>10</td><td>2</td><td>45</td><td>9</td><td>0.80</td></tr>\n<tr><td>10</td><td>4</td><td>210</td><td>84</td><td>0.60</td></tr>\n</tbody>\n</table>\n<p>Raising $k$ buys more paths at the cost of smaller training sets (a pessimistic bias for data-hungry models) and more purging (each test group has two boundaries). Raising $N$ shortens each group, which increases the share of data lost to purging when label horizons are long. A practical rule: pick the smallest $k$ that gives a usable number of paths (say 5–10 for a first look, 30+ if you want a tail quantile of the Sharpe distribution), with groups at least an order of magnitude longer than the label horizon.</p>\n\n<h3>3. What CPCV buys and what it does not</h3>\n<p>The paths give you an empirical distribution of the Sharpe ratio $\\{\\widehat{SR}_p\\}_{p=1}^{\\varphi}$, so you can report its mean, dispersion and lower quantiles. In the controlled Heston-based experiments of Arian, Norouzi Mobarekeh and Seco (2024) CPCV produced lower probability of backtest overfitting than walk-forward and plain (purged) K-fold. Caveats worth keeping in mind:</p>\n<ul>\n<li>Paths share training data and share test observations, so the dispersion across paths understates the true sampling variance of the Sharpe ratio. Treat $\\operatorname{sd}(\\widehat{SR}_p)$ as a lower bound.</li>\n<li>CPCV inherits the non-causality of CV. If the strategy's edge depends on a structural break (a microstructure change, a regulatory change), a model trained on post-break data and tested pre-break will mislead.</li>\n<li>CPCV does nothing about selection across strategies. Running 500 configurations through CPCV and keeping the best path mean is still a multiple-testing problem; use the Deflated Sharpe Ratio or the CSCV-based PBO of Bailey et al. (2017) on top.</li>\n</ul>\n\n<pre><code class=\"language-python\">from itertools import combinations\nfrom math import comb\nimport numpy as np\n\ndef cpcv_splits(n_obs, N=6, k=2):\n    groups = np.array_split(np.arange(n_obs), N)\n    for test_groups in combinations(range(N), k):\n        test = np.concatenate([groups[g] for g in test_groups])\n        yield test_groups, test          # purge/embargo each test group before training\n\ndef n_paths(N, k):\n    return comb(N, k) * k // N           # equals comb(N-1, k-1)\n\nassert n_paths(6, 2) == 5 and n_paths(10, 3) == 36\n\ndef assemble_paths(N, k):\n    seen = {g: [] for g in range(N)}\n    for s, (tg, _) in enumerate(cpcv_splits(N * 10, N, k)):\n        for g in tg: seen[g].append(s)\n    # path p uses split seen[g][p] for group g\n    return [[seen[g][p] for g in range(N)] for p in range(n_paths(N, k))]\n</code></pre>\n\n<h3>4. Hyperparameter tuning with purged CV</h3>\n<p>Tuning is a CV exercise nested inside the backtest. The same leakage logic applies, so the inner splitter must be purged and embargoed and must receive the <code>t1</code> series aligned with the training subset. Practical points:</p>\n<ul>\n<li><strong>Search space.</strong> Scale parameters ($C$ and $\\gamma$ of an SVM, the learning rate of a booster, an $\\ell_2$ penalty) should be searched on a log scale, e.g. log-uniform priors in a randomized search. A uniform grid on $[10^{-2}, 10^{2}]$ wastes 99% of draws above 1.</li>\n<li><strong>Sample weights.</strong> If you weight observations by uniqueness and return attribution, pass the weights both to <code>fit</code> and to the scorer. A known scikit-learn pitfall is that <code>Pipeline.fit</code> requires step-prefixed fit parameters (<code>clf__sample_weight</code>); a bare <code>sample_weight</code> is rejected or, in custom wrappers, silently dropped.</li>\n<li><strong>Nested evaluation.</strong> The score of the best configuration found by the inner search is optimistically biased (it is the max over trials). Report performance from an outer purged CV or CPCV whose test folds the inner search never saw.</li>\n<li><strong>Bagging the winner.</strong> High-variance learners tuned on noisy financial labels benefit from bagging with <code>max_samples</code> set to the average uniqueness.</li>\n</ul>\n\n<h3>5. Choosing the score: log-loss versus accuracy</h3>\n<p>Accuracy counts hits. It ignores the confidence attached to each prediction, yet in a strategy the probability drives the bet size (AFML ch. 10): a correct call at $p=0.51$ earns little, a wrong call at $p=0.95$ with a large position hurts a lot. The weighted negative log-loss</p>\n$$\\mathcal{L} = -\\frac{1}{\\sum_i w_i}\\sum_{i} w_i \\sum_{c} \\mathbb{1}[y_i=c]\\log p_{i,c}$$\n<p>penalises confident mistakes and rewards calibration, so it ranks models in an order closer to their P&amp;L. Accuracy is also nearly flat around the optimum, which makes the search noisy. Exceptions: for meta-labeling, where the primary model already chose the side and the secondary model decides whether to act, class imbalance is typical and F1 (or precision at a fixed recall) on the positive class is the more relevant target; and if positions are fixed-size and side-only, accuracy weighted by absolute return can be a defensible proxy.</p>\n\n<div class=\"callout warn\"><strong>Pitfall: every trial counts.</strong> Each hyperparameter configuration you score, each label horizon you try, each feature set you swap in is a trial. If you then report the best CPCV path mean, you have a selection-biased statistic. Log the number of trials and the dispersion of their scores from day one, so you can compute a Deflated Sharpe Ratio or PBO at the end; reconstructing the trial count afterwards is almost never honest.</div>\n\n<h3>6. A decision guide</h3>\n<ul>\n<li>Use <strong>purged K-fold</strong> for model selection and feature importance (fast, one score per configuration).</li>\n<li>Use <strong>CPCV</strong> for the final research backtest of a small number of candidate strategies, to see the distribution of outcomes.</li>\n<li>Use <strong>walk-forward</strong> as a last causal check of the shortlisted strategy and to estimate operational effects (retraining cadence, model drift), not as the instrument you iterate on.</li>\n</ul>"
    }
  ],
  "cheatsheet": [
    {
      "term": "Label interval",
      "formula": "y_i = f\\big(p_{[t_{i,0},\\,t_{i,1}]}\\big)",
      "note": "Every label is attached to a start and an end time; the t1 series is the input purging needs."
    },
    {
      "term": "Overlap correlation (h-day labels)",
      "formula": "\\rho_\\ell = \\max\\left(0,\\,1-\\ell/h\\right)",
      "note": "Correlation of overlapping h-period returns sampled ell periods apart under IID increments."
    },
    {
      "term": "Clean test probability, shuffled K-fold",
      "formula": "\\Pr(\\text{clean}) = K^{-2(h-1)}",
      "note": "Chance a test row has no overlapping training neighbour; essentially zero for any realistic h."
    },
    {
      "term": "Purging rule",
      "formula": "[t_{i,0},t_{i,1}]\\cap[t_{j,0},t_{j,1}]=\\varnothing\\ \\ \\forall j\\in\\mathcal{T}",
      "note": "Keep training obs i only if its label interval is disjoint from every test label interval."
    },
    {
      "term": "Purging for a contiguous test block",
      "formula": "\\text{drop } i \\text{ if } t_{i,0}\\le b \\ \\wedge\\ t_{i,1}\\ge a",
      "note": "a = first test start, b = last test end."
    },
    {
      "term": "Embargo",
      "formula": "\\text{drop } i \\text{ if } t_{i,0}\\in(b,\\,b+h_e],\\ h_e\\approx\\delta T",
      "note": "After the test block only; delta about 0.01, or the longest feature lookback."
    },
    {
      "term": "CPCV number of splits",
      "formula": "\\binom{N}{k}",
      "note": "N contiguous groups, k test groups per split."
    },
    {
      "term": "CPCV number of paths",
      "formula": "\\varphi[N,k]=\\frac{k}{N}\\binom{N}{k}=\\binom{N-1}{k-1}",
      "note": "Each group is tested this many times; N=6,k=2 gives 5 paths."
    },
    {
      "term": "CPCV training fraction",
      "formula": "1-\\frac{k}{N}",
      "note": "Before purging/embargo losses; higher k means more paths but smaller training sets."
    },
    {
      "term": "Weighted negative log-loss",
      "formula": "-\\frac{1}{\\sum_i w_i}\\sum_i w_i\\log p_{i,y_i}",
      "note": "Preferred tuning score: rewards calibration, penalises confident errors."
    },
    {
      "term": "Effective sample size from uniqueness",
      "formula": "T_{\\text{eff}}\\approx \\bar u\\,T",
      "note": "Average label uniqueness scales down how many independent labels you really have."
    },
    {
      "term": "Log-uniform prior",
      "formula": "\\log x \\sim U(\\log a,\\log b)",
      "note": "Use for scale hyperparameters such as C, gamma, learning rate, penalties."
    },
    {
      "term": "Walk-forward",
      "formula": "\\hat f_t = \\mathcal{A}\\big(\\mathcal{D}_{[0,t)}\\big)",
      "note": "Causal, single path, small early training sets, easy to overfit by iteration."
    }
  ],
  "flashcards": [
    {
      "q": "Why does shuffled K-fold overstate performance on overlapping financial labels?",
      "a": "Test rows have training neighbours with nearly identical features (serial correlation) and nearly identical labels (shared returns in overlapping intervals). A flexible model memorises the neighbour, so the test score measures lookup, not generalisation."
    },
    {
      "q": "What exactly does purging remove?",
      "a": "Every training observation whose label interval $[t_{i,0},t_{i,1}]$ intersects any test label interval: starts inside, ends inside, or envelops a test label."
    },
    {
      "q": "Why is the embargo applied only after the test set?",
      "a": "Training observations after the test block have features computed from returns inside the test labels' interval. Observations before the test block have features built from earlier data, and any label reaching into the test block has already been purged."
    },
    {
      "q": "Why can't a row-count gap (TimeSeriesSplit gap) replace purging?",
      "a": "It ignores the actual label end times. With irregularly spaced events (CUSUM, dollar bars) or variable-horizon triple-barrier labels, a fixed number of rows corresponds to a variable time span, so some overlapping labels survive."
    },
    {
      "q": "Give $\\varphi[N,k]$ and evaluate it for $N=6,k=2$.",
      "a": "$\\varphi[N,k]=\\tfrac{k}{N}\\binom{N}{k}=\\binom{N-1}{k-1}$. For $N=6,k=2$: 15 splits and 5 paths."
    },
    {
      "q": "Why are CPCV paths not independent?",
      "a": "Different paths reuse overlapping training sets and the same test observations (each path covers all observations). Cross-path dispersion of the Sharpe ratio is therefore a lower bound on true sampling variance."
    },
    {
      "q": "Main statistical weakness of walk-forward backtests?",
      "a": "A single path: the Sharpe ratio is one draw, its dispersion is unobserved, iteration on that path overfits, and the early part of the path uses models trained on little data."
    },
    {
      "q": "Main conceptual objection to CV-style backtests, and the response?",
      "a": "They are not causal: a model trained on future data scores the past. Response: after purging and embargo there is no shared label or feature information; the goal is scenario coverage rather than historical reproduction. Structural breaks remain a genuine risk."
    },
    {
      "q": "Why prefer negative log-loss over accuracy for tuning?",
      "a": "Bet sizes depend on predicted probabilities; log-loss penalises confident errors and rewards calibration, while accuracy ignores confidence and is flat near the optimum, making the search noisy."
    },
    {
      "q": "When is F1 a better tuning score than log-loss?",
      "a": "In meta-labeling, where the secondary model decides whether to act on a primary signal and the positive class is often rare; precision/recall on positives matters more than calibration over all rows."
    },
    {
      "q": "What does increasing $k$ in CPCV trade off?",
      "a": "More paths (and splits) versus smaller training sets and more purging around more test-group boundaries, which biases performance downward for data-hungry models."
    },
    {
      "q": "Name three leaks that purged CV does not fix.",
      "a": "Scaler/PCA fit on the full sample; features or label parameters selected using the full history; target or category encodings computed globally. All transformations must be refit inside each training fold."
    },
    {
      "q": "Why must hyperparameter search be nested inside an outer evaluation?",
      "a": "The best inner-CV score is a maximum over trials, hence biased upward. Only an outer purged CV/CPCV that the search never saw gives an honest estimate."
    },
    {
      "q": "What should you log during tuning to enable a Deflated Sharpe Ratio later?",
      "a": "The number of trials (configurations, feature sets, label variants) and the distribution of their scores or Sharpe ratios, including the failures."
    }
  ],
  "projects": [
    {
      "id": "fml-cross-validation-p1",
      "title": "Leakage lab: a synthetic dataset where naive K-fold lies",
      "level": "core",
      "hours": "6–10",
      "goal": "Build a controlled experiment that isolates the leakage bias of K-fold on overlapping labels. Simulate a price path, construct persistent features with no predictive content, label with overlapping fixed-horizon (and then triple-barrier) outcomes, and show that shuffled K-fold reports skill where none exists while your purged and embargoed splitter does not. Then add a weak true signal and show that purged CV still detects it.",
      "data": "Fully synthetic (numpy) for the main experiment. For the real-data replication use free daily prices from yfinance (e.g. SPY, sector ETFs; note survivorship and adjusted-price revisions) or Binance spot klines from data.binance.vision. Use public or personal data only — never employer data or code.",
      "steps": [
        "Simulate T = 5,000 daily log-returns from a GARCH(1,1) or IID Student-t; build features with no forward information: rolling vol (20d), EWMA return (halflife 10), fractionally differenced price (d = 0.4), plus 5 AR(1) noise features with phi = 0.95.",
        "Label y_t = sign(r_{t,t+h}) for h in {1, 5, 20, 60}; store the t1 series. Also build triple-barrier labels with vertical barrier at 20 days.",
        "Implement PurgedKFold (purge from t1 + post-test embargo) and unit tests asserting no train/test interval intersection and no train start inside the embargo window.",
        "For each h, evaluate an unrestricted RandomForestClassifier (min_samples_leaf=1) under KFold(shuffle=True), KFold(shuffle=False) and PurgedKFold; repeat over 50 simulation seeds.",
        "Inject a weak true signal (one feature with corr 0.05 to the next-period return) and repeat.",
        "Replicate the null experiment on one real asset by randomly permuting feature rows in blocks (to destroy any genuine signal while keeping persistence)."
      ],
      "deliverables": [
        "Notebook or script with the splitter, tests and experiment.",
        "Table: mean accuracy and log-loss (with 95% intervals across seeds) for each scheme and horizon.",
        "Plot: inflation of accuracy over 0.5 versus label horizon h for each scheme.",
        "Half-page write-up explaining which mechanism (label overlap vs feature persistence) drives the gap, with an ablation."
      ],
      "acceptance": [
        "Under the null with h = 20, shuffled K-fold mean accuracy exceeds the no-skill rate by at least 5 percentage points, while PurgedKFold's 95% interval across seeds contains the no-skill rate.",
        "The inflation of shuffled K-fold increases monotonically with h across {1, 5, 20, 60}.",
        "Unit tests pass: zero training rows overlap test label intervals and zero training starts fall in the embargo window, on both fixed-horizon and triple-barrier labels.",
        "With the injected signal, purged CV accuracy is significantly above 0.5 (one-sided test across seeds, p < 0.05).",
        "Ablation shows the separate contribution of removing feature persistence (set phi = 0) versus removing label overlap (h = 1)."
      ],
      "extensions": [
        "Compare with sklearn TimeSeriesSplit(gap=h) and document the residual leak with triple-barrier labels.",
        "Estimate the effective sample size via average uniqueness and compare CV standard errors with the empirical spread across seeds."
      ]
    },
    {
      "id": "fml-cross-validation-p2",
      "title": "CPCV backtest engine with path distributions and PBO",
      "level": "stretch",
      "hours": "15–25",
      "goal": "Implement combinatorial purged cross-validation end to end on a real intraday or daily dataset, assemble the backtest paths, and compare the distribution of path Sharpe ratios with walk-forward and purged K-fold results. Tune a model with a nested purged search, log every trial, and compute the probability of backtest overfitting over the grid.",
      "data": "Binance spot klines (e.g. BTCUSDT, ETHUSDT 1h or 5m) from data.binance.vision — free, no survivorship issue for the chosen pair, but check for exchange outages and gaps. Alternative: yfinance daily ETF prices (survivorship and adjustment caveats) or Ken French daily factor returns. Public or personal data only — never employer data.",
      "steps": [
        "Build dollar or time bars, CUSUM-filtered events and triple-barrier labels with a t1 series; compute uniqueness weights.",
        "Implement CPCV(N, k) with purging and embargo around every test group, plus the path assembly; verify path counts against the formula for several (N, k).",
        "Train a primary rule (e.g. trend sign) and a meta-labeling classifier; tune it with a nested PurgedKFold randomized search (log-uniform priors, neg log-loss with sample weights), logging every trial.",
        "Generate positions from probabilities (simple bet sizing), compute per-path Sharpe ratios net of a fixed cost assumption.",
        "Run the same pipeline under walk-forward (expanding window) and single-path purged K-fold.",
        "Compute PBO with CSCV over the hyperparameter grid's return series and a Deflated Sharpe Ratio for the selected configuration."
      ],
      "deliverables": [
        "Reusable CPCV module with tests.",
        "Histogram of path Sharpe ratios with the walk-forward and K-fold values marked.",
        "Trial log (CSV) with configuration, score and return series identifiers.",
        "Report with PBO, Deflated Sharpe Ratio and a discussion of how N and k affected conclusions."
      ],
      "acceptance": [
        "Path counts equal C(N-1, k-1) for at least three (N, k) choices, and every observation appears exactly once per path (asserted in code).",
        "No training observation overlaps any test label interval in any of the C(N, k) splits (asserted).",
        "Report includes mean, standard deviation and 10th percentile of path Sharpe ratios for at least two (N, k) settings.",
        "PBO is computed over at least 20 configurations with S >= 8 CSCV partitions, and the DSR uses the logged trial count.",
        "Walk-forward and CPCV results are compared in a single table with identical cost assumptions."
      ],
      "extensions": [
        "Study sensitivity of the path-Sharpe distribution to the embargo length.",
        "Repeat on a synthetic Heston or regime-switching market where the true Sharpe is known, to measure bias of each scheme."
      ]
    }
  ],
  "frontier": {
    "asOf": "2026-11",
    "summary": "Purged K-fold and CPCV are now standard vocabulary in quantitative ML, and open-source libraries implement them. The research frontier has moved to (i) controlled comparisons of out-of-sample testing schemes on synthetic markets with known ground truth, (ii) understanding what CV actually estimates and how to attach honest uncertainty to it under dependence, and (iii) integrating validation with multiple-testing corrections so that the number of trials, not just the split design, enters the final verdict. Blocked and structure-aware CV from statistics and ecology offer a parallel literature that finance rarely cites.",
    "threads": [
      {
        "title": "Controlled benchmarks of out-of-sample testing schemes",
        "why": "Synthetic markets with known parameters let researchers measure the bias and false-discovery behaviour of walk-forward, K-fold, purged K-fold and CPCV directly. Results so far favour CPCV on PBO-type metrics, but depend on the simulator and the strategy class, so replication on other generative models is valuable.",
        "refs": [
          {
            "label": "Arian, Norouzi Mobarekeh & Seco (2024) — Backtest overfitting in the machine learning era: A comparison of out-of-sample testing methods in a synthetic controlled environment",
            "url": "https://doi.org/10.1016/j.knosys.2024.112477"
          },
          {
            "label": "Cerqueira, Torgo & Mozetič (2020) — Evaluating time series forecasting models: an empirical study on performance estimation methods",
            "url": "https://doi.org/10.1007/s10994-020-05910-7"
          }
        ]
      },
      {
        "title": "What CV estimates and how uncertain it is",
        "why": "Statistical work shows CV targets average error over training sets, not the error of the fitted model, and that naive CV intervals under-cover; under dependence the conditions for K-fold validity are narrower still. Transferring nested-CV variance corrections to purged financial splits is largely open.",
        "refs": [
          {
            "label": "Bates, Hastie & Tibshirani (2024) — Cross-validation: what does it estimate and how well does it do it?",
            "url": "https://doi.org/10.1080/01621459.2023.2197686"
          },
          {
            "label": "Bergmeir, Hyndman & Koo (2018) — A note on the validity of cross-validation for evaluating autoregressive time series prediction",
            "url": "https://doi.org/10.1016/j.csda.2017.11.003"
          }
        ]
      },
      {
        "title": "Validation plus multiple-testing: PBO, deflation and trial counting",
        "why": "A clean split does not protect against selection over many configurations. PBO via CSCV, the Deflated Sharpe Ratio, and clustering-based estimates of the effective number of trials turn the research log into a statistical correction; how to combine them with CPCV path distributions is still debated.",
        "refs": [
          {
            "label": "Bailey, Borwein, López de Prado & Zhu (2017) — The Probability of Backtest Overfitting",
            "url": "https://papers.ssrn.com/abstract=2326253"
          },
          {
            "label": "Bailey & López de Prado (2014) — The Deflated Sharpe Ratio: Correcting for Selection Bias, Backtest Overfitting and Non-Normality",
            "url": "https://papers.ssrn.com/abstract=2460551"
          },
          {
            "label": "López de Prado & Lewis (2019) — Detection of false investment strategies using unsupervised learning methods",
            "url": "https://doi.org/10.1080/14697688.2019.1622311"
          }
        ]
      },
      {
        "title": "Structure-aware CV outside finance and in ML asset pricing",
        "why": "Ecology and spatial statistics developed blocked CV for temporal, spatial and hierarchical dependence; cross-sectional ML asset pricing mostly uses rolling train/validation/test splits rather than purged CV. Bridging these (e.g. purging in panels where labels overlap in time and firms cluster by industry) is a practical gap.",
        "refs": [
          {
            "label": "Roberts et al. (2017) — Cross-validation strategies for data with temporal, spatial, hierarchical, or phylogenetic structure",
            "url": "https://doi.org/10.1111/ecog.02881"
          },
          {
            "label": "Gu, Kelly & Xiu (2020) — Empirical Asset Pricing via Machine Learning",
            "url": "https://doi.org/10.1093/rfs/hhaa009"
          }
        ]
      },
      {
        "title": "Overfitting control for reinforcement-learning trading agents",
        "why": "RL agents have huge configuration spaces and non-stationary training dynamics. Recent work applies PBO-style hypothesis tests to reject overfitted agents, but purging and CPCV for sequential decision problems with path-dependent rewards are not settled.",
        "refs": [
          {
            "label": "Gort, Liu, Sun, Gao, Chen & Wang (2022) — Deep Reinforcement Learning for Cryptocurrency Trading: Practical Approach to Address Backtest Overfitting",
            "url": "https://arxiv.org/abs/2209.05559"
          }
        ]
      }
    ],
    "openQuestions": [
      "How should purging be defined in a cross-sectional panel where labels overlap in time and residual returns are correlated across firms within industries?",
      "Can we derive a variance estimator for the mean CPCV path Sharpe that accounts for shared training data, analogous to nested-CV corrections?",
      "What embargo length is optimal given a feature set's lookback and the persistence of its autocorrelation, and can it be estimated from data?",
      "Under what forms of non-stationarity (breaks, slow drift, regime switching) does non-causal CV become more misleading than walk-forward?",
      "How should the effective number of trials be counted when hyperparameter searches are adaptive (Bayesian optimisation) rather than grid-based?"
    ],
    "brainstorm": [
      "Pick one model you have tuned before: how many trials did you actually run, and what would its Deflated Sharpe Ratio be?",
      "Design a synthetic market where walk-forward beats CPCV at ranking strategies. What property of the data generator drives it?",
      "Which of your features has the longest effective memory, and does your current embargo cover it?",
      "Try extending purging to a stock panel with monthly labels and 12-month momentum features: what is the minimum data loss?",
      "Compare CPCV path dispersion with a block-bootstrap Sharpe interval on the same strategy. Which is wider, and why?"
    ]
  }
}
);
