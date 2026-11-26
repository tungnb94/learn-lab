LAB.module("finance-ml", {
  "id": "fml-feature-importance",
  "order": 6,
  "title": "Feature Importance: MDI, MDA, SFI, Clustering and SHAP",
  "summary": "How to learn what a financial ML model has learned without overfitting the backtest: in-sample MDI, purged out-of-sample MDA, single-feature importance, substitution effects, PCA consistency checks, clustered importance, and the uses and limits of SHAP.",
  "sources": [
    {
      "label": "López de Prado (2018), Advances in Financial Machine Learning, ch. 8 (Feature Importance)",
      "url": ""
    },
    {
      "label": "López de Prado (2020), Machine Learning for Asset Managers, ch. 6 (Feature Importance Analysis)",
      "url": "https://doi.org/10.1017/9781108883658"
    },
    {
      "label": "Lundberg & Lee (2017) — A Unified Approach to Interpreting Model Predictions",
      "url": "https://arxiv.org/abs/1705.07874"
    },
    {
      "label": "Strobl, Boulesteix, Kneib, Augustin & Zeileis (2008) — Conditional variable importance for random forests",
      "url": "https://doi.org/10.1186/1471-2105-9-307"
    }
  ],
  "lessons": [
    {
      "id": "fml-feature-importance-1",
      "title": "MDI, MDA and SFI",
      "minutes": 16,
      "html": "<h3>Why feature importance, not the backtest, is the research tool</h3>\n<p>A backtest answers \"how would this exact configuration have performed on this exact history?\". Used iteratively (tweak, rerun, keep what improves the Sharpe), it becomes a search over configurations scored on the same data, and the final number is the maximum of many noisy draws. López de Prado's maxim, \"backtesting is not a research tool; feature importance is\", reframes the workflow: use the model to learn <em>which variables carry information about the label and how</em>, check that against economic reasoning, and only then run one backtest as a final, logged trial. Feature importance does not look at P&amp;L, so it is much harder to overfit to the path of history. It also generalises across models: once you know that, say, short-horizon order-flow imbalance and realised-vol regimes matter, you can build different strategies on that knowledge.</p>\n<p>This lesson covers the three classical estimators from AFML ch. 8 (MDI, MDA, SFI). The next lessons take up the substitution problem that undermines the first two, handle it by construction (orthogonal features, clustering) and discuss SHAP.</p>\n\n<h3>Mean Decrease Impurity (MDI)</h3>\n<p>For a tree, every internal node $t$ that splits on feature $j$ reduces impurity $i(\\cdot)$ (Gini or entropy for classification) by</p>\n$$\\Delta i(t) = i(t) - \\frac{N_{t_L}}{N_t}\\,i(t_L) - \\frac{N_{t_R}}{N_t}\\,i(t_R).$$\n<p>MDI of feature $j$ is the node-probability-weighted sum of these reductions, averaged over the $B$ trees of a forest:</p>\n$$\\operatorname{MDI}_j = \\frac{1}{B}\\sum_{b=1}^{B}\\ \\sum_{t\\in b:\\ v(t)=j} \\frac{N_t}{N}\\,\\Delta i(t),$$\n<p>typically normalised so that $\\sum_j \\operatorname{MDI}_j = 1$. Properties that matter in practice:</p>\n<ul>\n<li><strong>In-sample.</strong> It is computed on the training data the trees were grown on. Every feature receives positive importance, even pure noise: with $F$ features and no signal the expected share is about $1/F$, which is the natural null line to draw on the bar chart.</li>\n<li><strong>Cardinality bias.</strong> Continuous or high-cardinality features offer many more candidate split points, so they win splits by chance more often and accumulate spurious impurity reductions (Strobl et al. documented this for both Gini importance and split selection). In finance most features are continuous, so the bias matters most against discrete flags, sector dummies and regime indicators.</li>\n<li><strong>Masking.</strong> With <code>max_features</code> greater than 1, a strong feature wins most splits and correlated or weaker features rarely get evaluated, so their importance is understated. Setting <code>max_features=1</code> forces each split to consider one randomly chosen feature; every feature then gets a fair chance to show what it can do, at the cost of a weaker predictor (which is acceptable, since the goal is explanation).</li>\n<li><strong>Dispersion.</strong> Report the mean and the standard error across trees, $\\operatorname{sd}_b/\\sqrt{B}$. A ranking whose top entries overlap within two standard errors is not a ranking.</li>\n<li><strong>Tree-specific and fast.</strong> No refitting is needed, so it is the cheapest first look.</li>\n</ul>\n\n<h3>Mean Decrease Accuracy (MDA, permutation importance)</h3>\n<p>Fit the model on a training fold, score it on the test fold to get $S$, then randomly permute column $j$ in the test fold and rescore to get $S_{(j)}$. Repeat over folds (and permutations):</p>\n$$\\operatorname{MDA}_j = \\frac{1}{K}\\sum_{k=1}^{K}\\left(S^{(k)} - S^{(k)}_{(j)}\\right),$$\n<p>or the normalised variant $\\big(S - S_{(j)}\\big)/\\big(S^{\\max} - S_{(j)}\\big)$, where $S^{\\max}$ is the best attainable score (1 for accuracy, 0 for negative log-loss). Properties:</p>\n<ul>\n<li><strong>Out-of-sample.</strong> Importance is measured as a loss of predictive performance on data the model did not see, so it is directly tied to generalisation. In finance the folds must be <em>purged and embargoed</em> (previous module); with leaky folds MDA rewards the features the model used to memorise near-duplicate rows.</li>\n<li><strong>Model- and score-agnostic.</strong> Works for any classifier or regressor. Use negative log-loss (with sample weights) for the reasons given in the CV module; accuracy-based MDA is coarse and noisy.</li>\n<li><strong>Can be negative.</strong> A negative MDA means the model scored better with the feature scrambled: the feature hurts out of sample. That is valuable information that MDI can never provide.</li>\n<li><strong>Extrapolation.</strong> Permuting $X_j$ independently of the other columns creates feature vectors that may never occur in the data (high momentum with impossible volatility, say). The model is then evaluated off the data manifold, and the score drop partly measures how badly it extrapolates (Hooker, Mentch and Zhou, 2021).</li>\n<li><strong>Cost.</strong> One fit per fold, plus $F$ rescorings per fold and per permutation repeat. Cheap relative to SFI.</li>\n</ul>\n\n<h3>Single Feature Importance (SFI)</h3>\n<p>SFI trains the model on <em>one feature at a time</em> and records its purged-CV score:</p>\n$$\\operatorname{SFI}_j = \\operatorname{CV\\text{-}score}\\big(\\mathcal{A},\\ \\{X_j\\},\\ y\\big).$$\n<p>Because no other feature is present, there is nothing to substitute for $X_j$, so SFI is immune to substitution effects. The price is that it ignores interactions and joint effects: a feature that only matters conditionally (e.g. a value signal that works only in low-dispersion regimes) can look useless alone. Cost scales with $F$ full CV runs. SFI is best used <em>alongside</em> MDA: a feature with high SFI but near-zero MDA almost certainly has a substitute in the set; a feature with low SFI but material MDA participates in an interaction.</p>"
    },
    {
      "id": "fml-feature-importance-2",
      "title": "Substitution effects and orthogonal features",
      "minutes": 19,
      "html": "<h3>Substitution effects</h3>\n<p>Substitution is the importance analogue of multicollinearity. Take the extreme case $X_2 = X_1$:</p>\n<ul>\n<li><strong>MDI</strong> splits the credit roughly in half (with <code>max_features=1</code>), so two copies of a strong feature each look half as strong, and a block of ten near-duplicate features dilutes a strong signal into ten mediocre bars.</li>\n<li><strong>MDA</strong> is worse: permuting $X_1$ leaves $X_2$ intact, the model routes through $X_2$, the score barely moves, and both features look unimportant. A genuinely informative concept can disappear from the ranking.</li>\n<li><strong>SFI</strong> gives both copies the full credit, which is correct for each alone but overstates the joint contribution.</li>\n</ul>\n<p>Financial feature sets are full of near-substitutes: momentum at 6, 9 and 12 months; three volatility estimators; several value ratios. Remedies, in roughly increasing sophistication: drop duplicates by hand; orthogonalise (PCA); cluster and permute clusters jointly (MLAM ch. 6); conditional permutation within strata of correlated features (Strobl et al., 2008); or refit-based \"leave-one-covariate-out\" importance with formal inference (Williamson et al., 2021). The next two lessons develop the PCA and clustering routes.</p>\n\n<pre><code class=\"language-python\">import numpy as np, pandas as pd\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.metrics import log_loss\n\ndef mdi(X, y, w, n_trees=500):\n    rf = RandomForestClassifier(n_estimators=n_trees, max_features=1,\n                                min_weight_fraction_leaf=0.0, n_jobs=-1)\n    rf.fit(X, y, sample_weight=w)\n    imp = np.array([t.feature_importances_ for t in rf.estimators_])\n    imp = pd.DataFrame(imp, columns=X.columns).replace(0, np.nan)   # unused in a tree\n    return pd.DataFrame({\"mean\": imp.mean(), \"se\": imp.std() / np.sqrt(len(imp))})\n\ndef mda(model, X, y, w, cv, n_rep=5, rng=np.random.default_rng(0)):\n    drops = []\n    for tr, te in cv.split(X):                  # cv = PurgedKFold(t1, ...)\n        m = model.fit(X.iloc[tr], y.iloc[tr], sample_weight=w.iloc[tr])\n        base = -log_loss(y.iloc[te], m.predict_proba(X.iloc[te]),\n                         sample_weight=w.iloc[te], labels=m.classes_)\n        row = {}\n        for c in X.columns:\n            s = []\n            for _ in range(n_rep):\n                Xp = X.iloc[te].copy(); Xp[c] = rng.permutation(Xp[c].values)\n                s.append(base + log_loss(y.iloc[te], m.predict_proba(Xp),\n                                         sample_weight=w.iloc[te], labels=m.classes_))\n            row[c] = np.mean(s)\n        drops.append(row)\n    d = pd.DataFrame(drops)\n    return pd.DataFrame({\"mean\": d.mean(), \"se\": d.std() / np.sqrt(len(d))})\n</code></pre>\n<p>Note the <code>replace(0, np.nan)</code> in MDI: with <code>max_features=1</code> a feature that never got selected in a tree should not drag the average down as if it had been tried and failed.</p>\n\n<div class=\"callout warn\"><strong>Pitfall: \"out-of-sample\" importance that is not.</strong> Calling <code>sklearn.inspection.permutation_importance</code> on the training set, or on a test set produced by shuffled <code>KFold</code>, gives an in-sample or leaky MDA that rewards memorisation, especially with deep trees on overlapping labels. Also beware of comparing MDA values across models with different baseline scores: normalise, or compare ranks. And with imbalanced labels, an accuracy-based MDA can be identically zero for every feature because the model predicts the majority class regardless.</div>\n\n<h3>Reading the three together</h3>\n<p>A robust single-pass diagnostic is a three-column table (MDI with <code>max_features=1</code>, purged MDA with log-loss, purged SFI), each with standard errors and a null reference (MDI: $1/F$; MDA: 0; SFI: score of a model with a shuffled label). Features that clear the null in all three are your core set; disagreements tell you where substitution or interaction lives. In synthetic tests with informative, redundant (linear combinations of informative) and noise features, expect MDI to rank informative and redundant above noise, MDA to penalise redundant features through substitution, and SFI to credit redundant features fully.</p><h3>Orthogonal features via PCA</h3>\n<p>Linear substitution disappears if the features are orthogonal. Standardise the feature matrix to $Z$ (zero mean, unit variance per column), eigen-decompose its correlation matrix $Z^\\top Z/T = W\\Lambda W^\\top$ with $\\lambda_1 \\ge \\dots \\ge \\lambda_F$, and keep the first $m$ eigenvectors $W_m$ that explain a chosen share of variance (e.g. 95%):</p>\n$$P = Z W_m, \\qquad \\frac{1}{T}P^\\top P = \\Lambda_m \\ \\ (\\text{diagonal}).$$\n<p>Running MDI, MDA and SFI on $P$ removes linear substitution among components and trims dimensionality, since low-variance directions are often noise. Two caveats. First, components lack direct economic meaning, so the payoff is diagnostic, not interpretive; you can map importance back to original features through the loadings, but that reintroduces the attribution ambiguity. Second, PCA only removes <em>linear</em> dependence; a forest can still exploit nonlinear redundancy (e.g. $|X_1|$ and $X_1^2$).</p>\n<p>Should PCA be fit inside each fold? It never sees labels, so it does not leak label information, which is why AFML fits it on the full feature set for the diagnostic. For a production pipeline, fit it on training folds only, because the test period's covariance structure is still information about the future.</p>\n\n<h3>The weighted Kendall tau consistency check</h3>\n<p>PCA ranks directions by variance <em>without looking at labels</em>; a supervised importance estimator ranks the same directions by predictive value <em>using labels</em>. If the two rankings broadly agree, the structure the model found is also the dominant structure in the features, which makes it less likely to be an overfit artefact of label noise. Kendall's tau measures rank agreement through concordant and discordant pairs; the weighted version (Vigna's hyperbolic weighting, implemented as <code>scipy.stats.weightedtau</code>) gives more weight to disagreements among top-ranked items, which is what we care about:</p>\n$$\\tau_w = \\frac{\\sum_{i\\lt j} w_{ij}\\,\\operatorname{sgn}(a_i-a_j)\\operatorname{sgn}(b_i-b_j)}{\\sqrt{\\sum_{i\\lt j} w_{ij}\\,[a_i\\ne a_j]}\\sqrt{\\sum_{i\\lt j} w_{ij}\\,[b_i\\ne b_j]}}, \\qquad w_{ij} = \\frac{1}{r_i+1}+\\frac{1}{r_j+1},$$\n<p>where $r$ is the rank under the chosen ordering. In practice compare importance with the eigenvalues (or with the inverse PC rank $1/\\text{rank}$). A value close to 1 is reassuring; a value near 0 or negative is a flag, not a verdict. It is perfectly possible for a predictive signal to live in a low-variance direction: a spread between two highly correlated characteristics is precisely a small-eigenvalue component, and in equity cross-sections many alphas are of that type. Use the check to prompt scrutiny, not to discard.</p>"
    },
    {
      "id": "fml-feature-importance-3",
      "title": "Clustered importance, SHAP and a research protocol",
      "minutes": 19,
      "html": "<h3>Clustered feature importance (MLAM ch. 6)</h3>\n<p>Clustered importance keeps interpretability by grouping substitutes instead of rotating them away.</p>\n<ol>\n<li><strong>Cluster the features.</strong> Use the correlation-based distance $d_{ij} = \\sqrt{\\tfrac12(1-\\rho_{ij})}$ (or an information-theoretic distance for nonlinear dependence) and an algorithm that picks the number of clusters, e.g. the ONC algorithm in MLAM, which runs k-means for many $k$ and seeds and chooses the partition maximising the mean-over-std of silhouette scores, recursively re-clustering weak clusters.</li>\n<li><strong>Optionally residualise.</strong> To weaken substitution <em>across</em> clusters, replace each feature by the residual of a regression on the features of other clusters that are closer to it than its own centroid.</li>\n<li><strong>Clustered MDI.</strong> Sum MDI within each cluster: $\\operatorname{MDI}_{C_k} = \\sum_{j\\in C_k}\\operatorname{MDI}_j$. Under no signal the expected share is $|C_k|/F$, so the null line differs by cluster and must be drawn accordingly.</li>\n<li><strong>Clustered MDA.</strong> Permute <em>all columns of a cluster jointly</em> (shuffle the rows of the block together, preserving within-cluster dependence) and record the score drop. Since every substitute of a feature is permuted at the same time, within-cluster substitution cannot rescue the model.</li>\n</ol>\n<p>In synthetic experiments with blocks of informative and redundant features, plain MDA often ranks entire informative blocks near zero, whereas clustered MDA restores them to the top and puts the noise cluster near zero. The economic payoff is a statement like \"the short-term reversal cluster matters, the profitability cluster does not\", which is the right granularity for research decisions.</p>\n\n<pre><code class=\"language-python\">import numpy as np, pandas as pd\nfrom sklearn.metrics import log_loss\n\ndef clustered_mda(model, X, y, w, cv, clusters, rng=np.random.default_rng(0)):\n    # clusters: dict name -&gt; list of column names (e.g. from ONC on corr distance)\n    out = []\n    for tr, te in cv.split(X):                       # purged + embargoed folds\n        m = model.fit(X.iloc[tr], y.iloc[tr], sample_weight=w.iloc[tr])\n        Xt, yt, wt = X.iloc[te], y.iloc[te], w.iloc[te]\n        base = log_loss(yt, m.predict_proba(Xt), sample_weight=wt, labels=m.classes_)\n        row = {}\n        for name, cols in clusters.items():\n            Xp = Xt.copy()\n            idx = rng.permutation(len(Xp))\n            Xp[cols] = Xt[cols].values[idx]           # joint row shuffle of the block\n            row[name] = log_loss(yt, m.predict_proba(Xp), sample_weight=wt,\n                                 labels=m.classes_) - base\n        out.append(row)\n    d = pd.DataFrame(out)\n    return pd.DataFrame({\"mean\": d.mean(), \"se\": d.std() / np.sqrt(len(d))})\n</code></pre>\n\n<h3>SHAP and its limits</h3>\n<p>SHAP (Lundberg and Lee, 2017) attributes a single prediction $f(x)$ to features using the Shapley value of a cooperative game whose value function is $v_x(S)$, the model's expected output when only features in $S$ are \"known\":</p>\n$$\\phi_j(x) = \\sum_{S\\subseteq \\mathcal{F}\\setminus\\{j\\}} \\frac{|S|!\\,(F-|S|-1)!}{F!}\\Big[v_x(S\\cup\\{j\\}) - v_x(S)\\Big], \\qquad \\sum_j \\phi_j(x) = f(x) - \\mathbb{E}[f(X)].$$\n<p>The efficiency identity on the right is the selling point: local attributions add up exactly. TreeSHAP computes them in polynomial time for tree ensembles, and global importance is usually summarised as $\\mathbb{E}\\,|\\phi_j(X)|$. The subtle part is the value function. The <em>observational</em> choice $v_x(S)=\\mathbb{E}[f(X)\\mid X_S=x_S]$ respects dependence but spreads credit to correlated features the model may not even use; the <em>interventional</em> choice $v_x(S)=\\mathbb{E}_{X_{\\bar S}}[f(x_S, X_{\\bar S})]$ breaks dependence and, like permutation, evaluates the model off the data manifold. Janzing, Minorics and Blöbaum (2020) argue the interventional version is the right one for explaining the model; Aas, Jullum and Løland (2021) develop conditional estimators for when you want the observational one. Neither resolves the attribution ambiguity among substitutes; they choose different conventions for it.</p>\n<p>For an equity quant, the practical limits are:</p>\n<ul>\n<li><strong>SHAP explains the model, not the data-generating process.</strong> Computed on training data, a forest that memorised overlapping labels yields crisp, confident attributions to noise. Compute SHAP on purged out-of-fold predictions.</li>\n<li><strong>Magnitude of influence is not predictive value.</strong> $\\mathbb{E}|\\phi_j|$ measures how much $X_j$ moves the prediction, not whether those moves improve the loss. A feature can swing predictions widely and be useless (or harmful) out of sample, which MDA would detect.</li>\n<li><strong>Correlated features.</strong> Credit is split among substitutes much as in MDI, and a cluster of five momentum variants can look weaker than a lone noisy feature. Summing $\\phi_j$ within clusters is a pragmatic fix (it is not the Shapley value of the group game, but it is consistent with efficiency).</li>\n<li><strong>No inference.</strong> SHAP returns numbers without standard errors. Bootstrap over folds or refits to get dispersion; Kumar et al. (2020) catalogue further mathematical and human-interpretation problems.</li>\n</ul>\n\n<div class=\"callout warn\"><strong>Pitfall: the in-sample SHAP beeswarm.</strong> The most common figure in ML-for-finance decks is a SHAP summary plot computed on the training sample of a gradient-boosted model. It looks authoritative and says almost nothing about generalisation. Before showing one, check that (a) attributions come from out-of-fold predictions under purged CV, (b) the ranking is stable across folds (e.g. weighted Kendall tau between fold rankings above 0.5), and (c) it is consistent with purged MDA.</div>\n\n<h3>Putting it together: a research protocol</h3>\n<ol>\n<li>State the economic hypothesis and the label; construct features; log everything.</li>\n<li>Cluster features; run clustered MDI and purged clustered MDA with log-loss; run SFI on cluster representatives.</li>\n<li>Run the PCA diagnostic and the weighted Kendall tau check; investigate disagreements.</li>\n<li>Check stability across time (subperiod rankings) and across models (forest vs boosted trees vs regularised logit).</li>\n<li>Only then design a strategy and run a single, recorded backtest, counted as a trial.</li>\n</ol>\n<p>Importance is still association, not causation: a feature can be important because it proxies for a confounder that may change. Treat the importance map as hypotheses for causal and economic scrutiny, which is the direction López de Prado's later work on causal factor investing pushes.</p>"
    }
  ],
  "cheatsheet": [
    {
      "term": "Impurity decrease at node t",
      "formula": "\\Delta i(t)=i(t)-\\tfrac{N_{t_L}}{N_t}i(t_L)-\\tfrac{N_{t_R}}{N_t}i(t_R)",
      "note": "Gini or entropy; the building block of MDI."
    },
    {
      "term": "MDI",
      "formula": "\\operatorname{MDI}_j=\\frac1B\\sum_b\\sum_{t:\\,v(t)=j}\\frac{N_t}{N}\\Delta i(t)",
      "note": "In-sample, tree-only; use max_features=1 to avoid masking."
    },
    {
      "term": "MDI null line",
      "formula": "\\mathbb{E}[\\operatorname{MDI}_j]\\approx 1/F",
      "note": "Normalised importances under no signal; noise features hover here."
    },
    {
      "term": "MDA (permutation)",
      "formula": "\\operatorname{MDA}_j=\\frac1K\\sum_k\\big(S^{(k)}-S^{(k)}_{(j)}\\big)",
      "note": "Out-of-sample score drop when column j is permuted; must use purged folds; can be negative."
    },
    {
      "term": "Normalised MDA",
      "formula": "\\frac{S-S_{(j)}}{S^{\\max}-S_{(j)}}",
      "note": "S max = 1 for accuracy, 0 for negative log-loss."
    },
    {
      "term": "SFI",
      "formula": "\\operatorname{SFI}_j=\\text{CV-score}(\\mathcal{A},\\{X_j\\},y)",
      "note": "One feature at a time; immune to substitution, blind to interactions."
    },
    {
      "term": "Substitution (duplicate feature)",
      "formula": "X_2=X_1\\Rightarrow \\operatorname{MDA}_1\\approx\\operatorname{MDA}_2\\approx 0",
      "note": "MDI halves credit, MDA erases it, SFI duplicates it."
    },
    {
      "term": "Orthogonal features",
      "formula": "P=ZW_m,\\quad P^\\top P/T=\\Lambda_m",
      "note": "Standardise, eigen-decompose, keep components to e.g. 95% variance."
    },
    {
      "term": "Weighted Kendall tau",
      "formula": "w_{ij}=\\tfrac{1}{r_i+1}+\\tfrac{1}{r_j+1}",
      "note": "Rank agreement between importance and eigenvalues, top ranks weighted more; scipy.stats.weightedtau."
    },
    {
      "term": "Correlation distance",
      "formula": "d_{ij}=\\sqrt{\\tfrac12(1-\\rho_{ij})}",
      "note": "Metric used to cluster features before clustered importance."
    },
    {
      "term": "Clustered MDI",
      "formula": "\\operatorname{MDI}_{C_k}=\\sum_{j\\in C_k}\\operatorname{MDI}_j,\\ \\ \\text{null}=|C_k|/F",
      "note": "Null line depends on cluster size."
    },
    {
      "term": "Clustered MDA",
      "formula": "S-S_{(C_k)}",
      "note": "Permute all columns of a cluster jointly so within-cluster substitutes cannot rescue the model."
    },
    {
      "term": "Shapley value",
      "formula": "\\phi_j=\\sum_{S\\subseteq\\mathcal F\\setminus\\{j\\}}\\frac{|S|!(F-|S|-1)!}{F!}\\big[v(S\\cup\\{j\\})-v(S)\\big]",
      "note": "Local attribution; value function v can be observational or interventional."
    },
    {
      "term": "SHAP efficiency",
      "formula": "\\sum_j\\phi_j(x)=f(x)-\\mathbb{E}[f(X)]",
      "note": "Attributions add to the prediction minus the base value; says nothing about loss."
    }
  ],
  "flashcards": [
    {
      "q": "Why does López de Prado call feature importance, rather than backtesting, the research tool?",
      "a": "Iterating on backtests is a search scored on one historical path, so the result is selection-biased. Importance reveals what information the model uses without looking at P&amp;L, can be checked against economics, and transfers across strategies; the backtest should be a single final trial."
    },
    {
      "q": "Three main weaknesses of MDI?",
      "a": "In-sample (noise gets about $1/F$), bias toward continuous/high-cardinality features, and masking when <code>max_features</code> &gt; 1. It is also tree-specific."
    },
    {
      "q": "Why set <code>max_features=1</code> when computing MDI?",
      "a": "Each split then considers a single random feature, so strong features cannot crowd out weaker or correlated ones; every feature gets a fair chance to reduce impurity."
    },
    {
      "q": "Why must MDA be computed on purged, embargoed folds?",
      "a": "With leaky folds the test set contains near-duplicates of training rows; permuting the features the model used for memorisation drops the score, so MDA rewards memorisation instead of generalisation."
    },
    {
      "q": "What does a negative MDA mean?",
      "a": "The model scores better out of sample with the feature scrambled: the feature hurts generalisation (overfit or unstable relationship)."
    },
    {
      "q": "How do MDI, MDA and SFI treat an exact duplicate feature pair?",
      "a": "MDI splits credit roughly in half; MDA assigns near-zero to both (each substitutes for the other); SFI gives each full credit."
    },
    {
      "q": "What is the extrapolation critique of permutation importance?",
      "a": "Independent permutation of a dependent feature creates feature vectors off the data manifold, so the score drop partly measures the model's behaviour in regions it never saw (Hooker, Mentch &amp; Zhou 2021)."
    },
    {
      "q": "When is high SFI but low MDA informative?",
      "a": "It signals a substitute: the feature is predictive alone, but other features carry the same information in the joint model."
    },
    {
      "q": "What does the weighted Kendall tau between importance and PCA eigenvalues test?",
      "a": "Whether supervised importance agrees with unsupervised variance structure. High agreement suggests the model's structure is not a label-noise artefact; low agreement is a flag, since real alphas can live in low-variance directions."
    },
    {
      "q": "How is clustered MDA computed?",
      "a": "Cluster features (e.g. ONC on $\\sqrt{\\tfrac12(1-\\rho)}$), then for each cluster permute all its columns jointly in the purged test fold and record the score drop."
    },
    {
      "q": "What is the null line for clustered MDI?",
      "a": "$|C_k|/F$, the cluster's share of features, not $1/K$."
    },
    {
      "q": "Observational vs interventional SHAP value functions?",
      "a": "Observational: $\\mathbb{E}[f(X)\\mid X_S=x_S]$, respects dependence but credits correlated unused features. Interventional: $\\mathbb{E}_{X_{\\bar S}}[f(x_S,X_{\\bar S})]$, explains the model mechanically but evaluates off-manifold points."
    },
    {
      "q": "Why is mean |SHAP| not a measure of predictive value?",
      "a": "It measures how much a feature moves predictions, not whether those moves reduce out-of-sample loss; MDA measures the latter."
    },
    {
      "q": "Does PCA used for orthogonal features leak label information?",
      "a": "No, it is unsupervised; but the test period's covariance is still future information, so fit it on training folds in a production pipeline."
    }
  ],
  "projects": [
    {
      "id": "fml-feature-importance-p1",
      "title": "Substitution lab: MDI vs MDA vs SFI vs clustered MDA on synthetic data",
      "level": "core",
      "hours": "6–10",
      "goal": "Generate a classification dataset with known informative, redundant and noise features, then show quantitatively how each importance estimator behaves, how substitution distorts MDA, and how clustering and PCA repair it. The ground truth lets you score each estimator.",
      "data": "Fully synthetic: sklearn.datasets.make_classification (n_informative=10, n_redundant=10, remaining noise, 40 features, 10,000 rows) with an artificial time index and overlapping label intervals so purged CV is meaningful. Optional real check on yfinance daily ETF features (survivorship/adjustment caveats). Public or personal data only — never employer data.",
      "steps": [
        "Generate the dataset; attach a business-day index and a t1 series with 5-day overlap; add small noise to redundant features so they are near-, not exact, substitutes.",
        "Compute MDI (max_features=1, 1,000 trees) with standard errors; purged MDA with negative log-loss (5 folds, 1% embargo, 5 permutation repeats); purged SFI.",
        "Repeat MDI with max_features='sqrt' to demonstrate masking.",
        "Cluster features with correlation distance (ONC or silhouette-optimised k-means), then compute clustered MDI and clustered MDA.",
        "Run PCA (95% variance), compute MDI/MDA on components and the weighted Kendall tau against eigenvalues.",
        "Repeat everything over 20 random seeds."
      ],
      "deliverables": [
        "Bar charts with error bars and null lines for each estimator, coloured by true feature type.",
        "Table of ranking metrics (precision@20 for signal features, mean rank of noise) per estimator across seeds.",
        "Clustering confusion matrix versus true feature types.",
        "Short write-up on when to trust each estimator."
      ],
      "acceptance": [
        "MDI with max_features=1: at least 90% of informative and redundant features rank above every noise feature, averaged over seeds.",
        "Plain purged MDA ranks at least 3 informative-or-redundant features within two standard errors of zero (substitution demonstrated), while SFI ranks them above all noise features.",
        "Clustered MDA ranks every cluster dominated by signal features above the noise cluster(s) in at least 18 of 20 seeds.",
        "The masking effect is quantified: mean MDI share of the weakest informative features falls by at least 25% under max_features='sqrt'.",
        "Weighted Kendall tau on PCA components is reported with its distribution across seeds."
      ],
      "extensions": [
        "Add a nonlinear interaction (XOR of two informative features) and show SFI missing it while MDA catches it.",
        "Compare with TreeSHAP mean |phi| computed in-sample vs out-of-fold."
      ]
    },
    {
      "id": "fml-feature-importance-p2",
      "title": "Which anomaly clusters predict anomaly returns? Clustered MDA vs SHAP on open asset-pricing data",
      "level": "stretch",
      "hours": "15–25",
      "goal": "Use the Open Source Asset Pricing long-short predictor portfolios to build a panel 'anomaly timing' problem: predict the sign of each anomaly portfolio's next-month return from its own history, its category, and market state variables. Apply purged clustered MDA, MDI and out-of-fold SHAP, measure stability across subperiods, and judge whether the importance map is economically coherent.",
      "data": "Chen & Zimmermann Open Source Asset Pricing (openassetpricing.com) predictor portfolio returns (free download; check the release date and that signals are as published, since in-sample periods differ by predictor and post-publication decay is documented). Market factors and risk-free rate from the Ken French Data Library. Optional: yfinance VIX proxy (caveats on index history). Use public or personal data only — never employer data or proprietary signals.",
      "steps": [
        "Download monthly long-short returns for all predictors; build features per anomaly-month: own returns over 1, 3, 6, 12 months, own 12-month volatility, months since publication, category dummies, market excess return, market 12-month volatility, cross-anomaly average 1-month return.",
        "Label y = sign of next-month return; t1 = end of that month; weight by absolute return and uniqueness across overlapping features if using multi-month labels.",
        "Use purged K-fold where folds are blocks of calendar months shared across all anomalies (purge by date, not by row).",
        "Cluster features; compute MDI (max_features=1), purged MDA and clustered MDA with log-loss; compute TreeSHAP on out-of-fold predictions of a gradient-boosted model.",
        "Split the sample into three subperiods; compute importance rankings per subperiod and weighted Kendall tau between them.",
        "Write an economic interpretation and decide which clusters deserve a follow-up hypothesis."
      ],
      "deliverables": [
        "Reproducible pipeline with data download script and fixed release version.",
        "Importance charts (feature-level and cluster-level) with standard errors and null lines.",
        "Stability table of weighted Kendall tau across subperiods and across models (forest, boosted trees, logit).",
        "Two-page memo comparing clustered MDA with out-of-fold SHAP and stating which findings are robust."
      ],
      "acceptance": [
        "Folds are date-blocked: asserted that no month appears in both train and test of any split and that the embargo after each test block is at least 1 month.",
        "Clustered MDA reported with standard errors; clusters whose mean is more than 2 standard errors above 0 are listed explicitly.",
        "Weighted Kendall tau between subperiod cluster rankings is reported for all three pairs, for at least two model classes.",
        "SHAP is computed out-of-fold, and the rank correlation between mean |SHAP| (summed by cluster) and clustered MDA is reported and discussed.",
        "Memo identifies at least one feature whose SHAP importance is high but whose MDA is not distinguishable from zero, or states that none exists with evidence."
      ],
      "extensions": [
        "Add model-X knockoffs or a LOCO refit importance with confidence intervals and compare with clustered MDA.",
        "Repeat with firm-level characteristics if you have legitimate personal access to a suitable dataset."
      ]
    }
  ],
  "frontier": {
    "asOf": "2026-11",
    "summary": "Feature importance has split into two research cultures. Statistics is building importance measures with formal inference (debiased impurity measures, conditional and refit-based permutation, knockoffs with false discovery control), while applied ML relies heavily on Shapley-value attributions whose meaning under dependent features is contested. In finance, López de Prado's clustered MDA remains the practical answer to substitution, and the push is toward stability analysis and toward reading importance as a step to causal hypotheses rather than as evidence of causation.",
    "threads": [
      {
        "title": "Debiasing impurity-based importance",
        "why": "MDI's in-sample nature and preference for high-cardinality features are well documented. Out-of-bag and debiased variants aim to keep MDI's speed while removing the noise-feature inflation; understanding their behaviour with persistent, overlapping financial labels is untested.",
        "refs": [
          {
            "label": "Li, Wang, Basu, Kumbier & Yu (2019) — A Debiased MDI Feature Importance Measure for Random Forests",
            "url": "https://arxiv.org/abs/1906.10845"
          },
          {
            "label": "Strobl, Boulesteix, Kneib, Augustin & Zeileis (2008) — Conditional variable importance for random forests",
            "url": "https://doi.org/10.1186/1471-2105-9-307"
          }
        ]
      },
      {
        "title": "Beyond naive permutation: conditional, refit and knockoff importance with inference",
        "why": "Permutation forces extrapolation under dependence; alternatives either permute conditionally, refit without the feature (LOCO-type measures with confidence intervals), or construct knockoff copies that control the false discovery rate. These give inference that MDA lacks, but their assumptions (known feature distribution, IID rows) clash with financial time series.",
        "refs": [
          {
            "label": "Hooker, Mentch & Zhou (2021) — Unrestricted permutation forces extrapolation: variable importance requires at least one more model, or there is no free variable importance",
            "url": "https://doi.org/10.1007/s11222-021-10057-z"
          },
          {
            "label": "Williamson, Gilbert, Carone & Simon (2021) — Nonparametric variable importance assessment using machine learning techniques",
            "url": "https://doi.org/10.1111/biom.13392"
          },
          {
            "label": "Candès, Fan, Janson & Lv (2018) — Panning for gold: model-X knockoffs for high dimensional controlled variable selection",
            "url": "https://doi.org/10.1111/rssb.12265"
          }
        ]
      },
      {
        "title": "What Shapley values mean when features are dependent",
        "why": "SHAP's popularity rests on its axioms, but the choice of value function (observational vs interventional) changes the answer under correlation, and critics argue the axioms do not match what users expect from importance. Conditional estimators exist but are expensive and approximate.",
        "refs": [
          {
            "label": "Lundberg & Lee (2017) — A Unified Approach to Interpreting Model Predictions",
            "url": "https://arxiv.org/abs/1705.07874"
          },
          {
            "label": "Janzing, Minorics & Blöbaum (2020) — Feature relevance quantification in explainable AI: A causal problem",
            "url": "https://proceedings.mlr.press/v108/janzing20a.html"
          },
          {
            "label": "Aas, Jullum & Løland (2021) — Explaining individual predictions when features are dependent: More accurate approximations to Shapley values",
            "url": "https://doi.org/10.1016/j.artint.2021.103502"
          },
          {
            "label": "Kumar, Venkatasubramanian, Scheidegger & Friedler (2020) — Problems with Shapley-value-based explanations as feature importance measures",
            "url": "https://arxiv.org/abs/2002.11097"
          }
        ]
      },
      {
        "title": "Stability of feature selection on financial data",
        "why": "With low signal-to-noise, importance rankings fluctuate across seeds, folds and periods. Comparative work measures stability of MDA, LIME and SHAP; clustered importance is the López de Prado response. A standard stability metric for financial importance studies is still missing.",
        "refs": [
          {
            "label": "Man & Chan (2020) — The best way to select features? Comparing MDA, LIME, and SHAP",
            "url": "https://arxiv.org/abs/2005.12483"
          },
          {
            "label": "López de Prado (2020) — Machine Learning for Asset Managers",
            "url": "https://doi.org/10.1017/9781108883658"
          }
        ]
      },
      {
        "title": "From importance to causal factor research",
        "why": "Importance is associational; factor research increasingly asks for causal mechanisms. Open, replicable characteristic datasets make it possible to test whether importance maps are stable across publication regimes and consistent with proposed causal graphs.",
        "refs": [
          {
            "label": "López de Prado (2023) — Causal Factor Investing: Can Factor Investing Become Scientific?",
            "url": "https://doi.org/10.1017/9781009397315"
          },
          {
            "label": "Chen & Zimmermann (2022) — Open Source Cross-Sectional Asset Pricing",
            "url": "https://doi.org/10.1561/104.00000112"
          }
        ]
      }
    ],
    "openQuestions": [
      "How should conditional permutation or knockoff constructions be adapted to serially dependent, non-stationary features with overlapping labels?",
      "Is there a principled way to attach standard errors to clustered MDA that accounts for purged-fold dependence and permutation noise jointly?",
      "Which feature-clustering distance (correlation, mutual information, variation of information) yields the most stable importance rankings on low-signal financial data?",
      "When do SHAP and purged MDA disagree systematically, and does the disagreement predict out-of-sample decay of a signal?",
      "Can importance maps be tested against a proposed causal graph so that confounded features are identified before a strategy is built?",
      "How quickly do importance rankings of published anomalies change after publication, and is that change detectable in real time?"
    ],
    "brainstorm": [
      "List the five features you trust most in your own (personal) research. Which would survive a clustered MDA with purged folds?",
      "Find a feature pair in your set with correlation above 0.8. Predict what MDI, MDA, SFI and SHAP will each say, then check.",
      "Design a synthetic data generator where a genuine signal lives in the smallest principal component. How does the weighted Kendall tau check behave?",
      "Pick one statistics paper on importance with inference (LOCO or knockoffs) and sketch what would break with overlapping labels.",
      "Choose an anomaly category from the open asset-pricing data and propose a causal story; what importance pattern would falsify it?"
    ]
  }
}
);
