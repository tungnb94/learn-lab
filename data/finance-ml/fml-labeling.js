LAB.module("finance-ml", {
  "id": "fml-labeling",
  "order": 2,
  "title": "Labeling and Bet Sizing: Triple-Barrier, Meta-Labeling, Trend Scanning",
  "summary": "How to turn price paths into targets that reflect how positions are actually managed, separate the side decision from the size decision with meta-labeling, and convert calibrated probabilities into smooth, cost-aware positions.",
  "sources": [
    {
      "label": "López de Prado (2018), Advances in Financial Machine Learning, ch. 3 and ch. 10 (Wiley)",
      "url": ""
    },
    {
      "label": "López de Prado (2020), Machine Learning for Asset Managers, ch. 5 (Cambridge Elements)",
      "url": "https://doi.org/10.1017/9781108883658"
    },
    {
      "label": "Joubert (2022), Meta-Labeling: Theory and Framework, Journal of Financial Data Science",
      "url": "https://doi.org/10.3905/jfds.2022.1.098"
    }
  ],
  "lessons": [
    {
      "id": "fml-labeling-1",
      "title": "From fixed horizons to the triple-barrier method",
      "minutes": 24,
      "html": "<h3>The fixed-horizon label and why it misleads</h3>\n<p>The default supervised setup in most equity research labels each observation by the sign (or a thresholded sign) of the return over a fixed number of periods:</p>\n$$y_i = \\begin{cases} -1 & r_{t_{i,0},\\,t_{i,0}+h} \\lt -\\tau \\\\ \\;\\;0 & |r_{t_{i,0},\\,t_{i,0}+h}| \\le \\tau \\\\ +1 & r_{t_{i,0},\\,t_{i,0}+h} \\gt \\tau \\end{cases}$$\n<p>AFML ch. 3 identifies several defects. First, when observations are calendar bars the realised volatility over $h$ periods varies enormously across regimes, so a constant $\\tau$ labels almost everything 0 in calm markets and almost everything $\\pm 1$ in turbulent ones; the class balance is then a volatility proxy, and the classifier learns the regime rather than the signal. Activity bars mitigate this, but a constant threshold is still not adaptive. Second, the label ignores the <em>path</em>. A position that would have been stopped out at $-8\\%$ before recovering to $+2\\%$ at $t+h$ is labelled a success, although no risk-managed portfolio would have survived to collect it. Third, the label is disconnected from how the strategy is actually traded: real positions have profit targets, stop-losses (explicit or implied by risk limits) and maximum holding periods.</p>\n\n<h3>Dynamic thresholds</h3>\n<p>The remedy for the first defect is to scale thresholds by a causal volatility estimate. A common choice is an exponentially weighted standard deviation of daily returns, evaluated at each event start:</p>\n$$\\hat\\sigma_{t} = \\sqrt{\\operatorname{EWMA}_{\\lambda}\\big[(r^{(d)}_{s} - \\bar r^{(d)})^2 : s \\le t\\big]}, \\qquad r^{(d)}_s = \\frac{P_s}{P_{s-1\\,\\text{day}}} - 1,$$\n<p>where $r^{(d)}$ is computed on bar data by matching each bar with the last bar at least one day earlier, and the span (e.g. 50–100 observations) is a hyperparameter. Barriers are then expressed in units of $\\hat\\sigma_{t_{i,0}}$, so a label of $+1$ means \"moved up by $k$ typical daily moves\", a quantity that is comparable across assets and regimes. For horizons other than one day, scale by $\\sqrt{h}$ or estimate volatility at the matching horizon. In a cross-section the same construction normalises labels across high- and low-volatility names, which also limits the tendency of a classifier to learn \"is this a volatile stock\".</p>\n\n<h3>The triple-barrier method</h3>\n<p>For each event $i$ (e.g. a CUSUM trigger at $t_{i,0}$), define three barriers:</p>\n<ul>\n<li>an <strong>upper horizontal barrier</strong> (profit-taking) at $P_{t_{i,0}}\\exp(u\\,\\hat\\sigma_{t_{i,0}})$,</li>\n<li>a <strong>lower horizontal barrier</strong> (stop-loss) at $P_{t_{i,0}}\\exp(-\\ell\\,\\hat\\sigma_{t_{i,0}})$,</li>\n<li>a <strong>vertical barrier</strong> at $t_{i,0} + h$ (in bars or calendar time), the maximum holding period.</li>\n</ul>\n<p>Let $t_{i,1}$ be the time of the first touch. The label is</p>\n$$y_i = \\begin{cases} +1 & \\text{upper barrier touched first} \\\\ -1 & \\text{lower barrier touched first} \\\\ \\operatorname{sign}\\big(r_{t_{i,0},t_{i,1}}\\big)\\ \\text{or}\\ 0 & \\text{vertical barrier touched first} \\end{cases}$$\n<p>The choice for the vertical case matters: assigning 0 creates a \"no conviction\" class, while assigning the sign of the return gives a binary problem with noisier positives. Disabling barriers gives useful variants: $[u,\\ell,h] = [1,1,0]$ (no vertical) waits for a decisive move; $[0,0,1]$ recovers a path-agnostic fixed horizon; $[1,0,1]$ or $[0,1,1]$ model asymmetric exits.</p>\n<p>Two outputs matter downstream. The <strong>label</strong> $y_i$ is the target. The <strong>end time</strong> $t_{i,1}$ defines the interval $[t_{i,0}, t_{i,1}]$ over which observation $i$ \"uses\" information. Because intervals of nearby events overlap, labels are not i.i.d.; the overlap matrix drives the uniqueness-based sample weights and the purging and embargo in cross-validation covered in later modules. A labeling routine that discards $t_{i,1}$ makes those corrections impossible.</p>\n\n<pre><code class=\"language-python\">import numpy as np, pandas as pd\n\ndef daily_vol(close, span=100):\n    # close: pd.Series on bars (DatetimeIndex); returns EWM std of ~1-day returns\n    idx = close.index.searchsorted(close.index - pd.Timedelta(days=1))\n    idx = idx[idx &gt; 0]\n    prev = pd.Series(close.index[idx - 1], index=close.index[close.shape[0] - idx.shape[0]:])\n    r = close.loc[prev.index] / close.loc[prev.values].values - 1\n    return r.ewm(span=span).std()\n\ndef triple_barrier(close, events, vol, u=2.0, l=2.0, h=pd.Timedelta(days=5), side=None):\n    # events: DatetimeIndex of t0; side: optional pd.Series of +1/-1 from a primary model\n    out = []\n    for t0 in events.intersection(vol.dropna().index):\n        s = 1.0 if side is None else float(side.loc[t0])\n        t_v = close.index[min(close.index.searchsorted(t0 + h), len(close) - 1)]\n        path = np.log(close.loc[t0:t_v] / close.loc[t0]) * s   # side-adjusted log return\n        trg = vol.loc[t0]\n        hit_u = path[path &gt;= u * trg].index.min() if u &gt; 0 else pd.NaT\n        hit_l = path[path &lt;= -l * trg].index.min() if l &gt; 0 else pd.NaT\n        t1 = min([t for t in (hit_u, hit_l, t_v) if pd.notna(t)])\n        ret = path.loc[t1]\n        y = np.sign(ret) if side is None else float(ret &gt; 0)   # meta-label in {0,1}\n        out.append((t0, t1, ret, y))\n    return pd.DataFrame(out, columns=[\"t0\", \"t1\", \"ret\", \"y\"]).set_index(\"t0\")\n</code></pre>\n<p>This loop is clear but $O(n \\cdot h)$; for large event sets vectorise per asset with NumPy or Numba, or parallelise over assets. Use the high and low of each bar, not just the close, if you want to detect intrabar touches; otherwise you systematically understate barrier hits and overstate the vertical class.</p>\n\n<h3>Side and size</h3>\n<p>The <code>side</code> argument separates two questions that a single classifier conflates. Without side information, the barriers are symmetric in direction and the label says which way price went. With a side $s_i \\in \\{-1,+1\\}$ supplied by some prior model or rule, the path is multiplied by $s_i$, the horizontal barriers become a genuine profit-take and stop-loss for <em>that</em> position, and the label collapses to $\\{0,1\\}$: did the bet in direction $s_i$ make money? Asymmetric barriers $u \\ne \\ell$ are then meaningful (a trend strategy might use a wide profit-take and a tight stop). This is the setup for <strong>meta-labeling</strong>, developed in the next lesson: a secondary model predicts whether the primary model's bet will succeed, and its probability becomes the bet size.</p>\n\n<div class=\"callout warn\"><strong>Pitfall: barrier parameters are hyperparameters, and labels leak through them.</strong> Choosing $u$, $\\ell$, $h$ and the volatility span by looking at backtest results on the full sample is model selection on the test set. Also check that $\\hat\\sigma_{t_{i,0}}$ uses only data up to $t_{i,0}$; a centred or full-sample volatility makes barrier widths, and therefore labels, depend on the future. Finally, intraday touches computed from close-only bars and labels that cross data gaps (halts, delistings) silently bias the class distribution. Log the share of each barrier type per year: large swings are a red flag.</div>\n\n<h3>Dropping rare labels</h3>\n<p>Classifiers perform poorly on very rare classes, and a label that occurs in 1% of events is rarely worth modelling. A practical rule is to drop observations from classes below a minimum share (e.g. 5%) iteratively, or to merge them, and to report the resulting class balance. When imbalance remains, prefer class weights or balanced bagging over naive oversampling, which duplicates overlapping observations and exaggerates leakage.</p>"
    },
    {
      "id": "fml-labeling-2",
      "title": "Meta-labeling, trend scanning and bet sizing",
      "minutes": 26,
      "html": "<h3>Meta-labeling: separating side from size</h3>\n<p>Meta-labeling, introduced in AFML ch. 3, splits the decision into two models. A <strong>primary model</strong> (a discretionary view, a fundamental signal, a simple trend rule, or an ML classifier) decides the <em>side</em> $s_i \\in \\{-1,+1\\}$ of each candidate bet. A <strong>secondary model</strong> is trained on triple-barrier labels with side information, $z_i \\in \\{0,1\\}$, to predict whether the primary bet will hit its profit-take before its stop-loss or deadline. The secondary model's output $\\hat p_i = \\hat{\\mathbb{P}}[z_i = 1 \\mid X_i]$ then determines whether to act and how much.</p>\n<p>The design has several advantages for an equity researcher. The primary model can be a white box (an economically motivated factor or rule) while the ML layer only filters and sizes, which keeps the source of alpha interpretable. The secondary model can use features unavailable to the primary (regime, liquidity, crowding, the primary's own recent hit rate). Overfitting is contained because the secondary model cannot change direction, only abstain or scale. And the size decision is naturally probabilistic, which is what portfolio construction needs.</p>\n\n<h3>The confusion-matrix view</h3>\n<p>For the binary meta-label, treat \"bet succeeded\" as the positive class. With true positives TP, false positives FP and false negatives FN among the primary model's signals,</p>\n$$\\text{precision} = \\frac{TP}{TP+FP}, \\qquad \\text{recall} = \\frac{TP}{TP+FN}, \\qquad F_1 = \\frac{2\\,\\text{precision}\\cdot\\text{recall}}{\\text{precision}+\\text{recall}}.$$\n<p>The recommended workflow is to tune the primary model for <strong>high recall</strong>, capturing most genuine opportunities even at the cost of many false positives, and let the secondary model raise <strong>precision</strong> by rejecting likely false positives. The goal is a higher $F_1$ for the combined system. Why does precision matter so much? For a strategy making $n$ independent bets per year with symmetric payoffs $\\pm\\pi$ and hit rate $p$, the annualised Sharpe ratio is</p>\n$$\\theta(p, n) = \\frac{2p-1}{2\\sqrt{p(1-p)}}\\,\\sqrt{n},$$\n<p>which is very steep near $p = 1/2$: raising precision from 0.52 to 0.56 roughly triples $\\theta$ at fixed $n$. Filtering trades reduces $n$, so the net effect depends on the trade-off, and that trade-off is exactly what the probability threshold of the secondary model controls. Evaluate it on the precision–recall curve rather than with accuracy or ROC AUC, both of which can look fine while the economically relevant region (high precision) is poor.</p>\n\n<h3>Trend-scanning labels</h3>\n<p>Triple-barrier labels need barrier widths and a horizon. <strong>Trend scanning</strong> (MLAM ch. 5) avoids fixing the horizon by asking, at each $t$, over which forward window the strongest linear trend is found. For each candidate length $L \\in \\mathcal{L}$, regress the next $L$ observations on a time index:</p>\n$$x_{t+l} = \\beta_0 + \\beta_1 l + \\varepsilon_{t+l}, \\qquad l = 0, \\dots, L-1,$$\n<p>and compute the slope t-statistic $\\hat t_{\\beta_1}(L) = \\hat\\beta_1 / \\widehat{\\mathrm{se}}(\\hat\\beta_1)$. Choose $L^* = \\arg\\max_{L \\in \\mathcal{L}} |\\hat t_{\\beta_1}(L)|$ and set</p>\n$$y_t = \\operatorname{sign}\\big(\\hat t_{\\beta_1}(L^*)\\big), \\qquad w_t = |\\hat t_{\\beta_1}(L^*)|, \\qquad t_{1} = t + L^* - 1.$$\n<p>The magnitude $w_t$ is a natural sample weight (strong trends count more) or a regression target. The same scan run <em>backwards</em> produces a causal feature: the strength of the trend ending at $t$. Caveats: OLS standard errors ignore autocorrelation in $\\varepsilon$, so the t-values are not valid test statistics (they are a ranking device); the grid $\\mathcal{L}$ is a hyperparameter; and, as with any forward-looking label, the end time $t_1$ must be retained for purging.</p>\n\n<pre><code class=\"language-python\">import numpy as np, pandas as pd\n\ndef tval_slope(y):\n    x = np.arange(len(y)); X = np.c_[np.ones_like(x), x]\n    beta, res, *_ = np.linalg.lstsq(X, y, rcond=None)\n    s2 = res[0] / (len(y) - 2) if res.size else 0.0\n    se = np.sqrt(s2 / ((x - x.mean()) ** 2).sum())\n    return beta[1] / se if se &gt; 0 else 0.0\n\ndef trend_scan_labels(log_p, spans=range(5, 40, 5)):\n    rows, v = [], log_p.to_numpy()\n    for i, t in enumerate(log_p.index):\n        cands = [(L, tval_slope(v[i:i + L])) for L in spans if i + L &lt;= len(v)]\n        if not cands: break\n        L, tv = max(cands, key=lambda c: abs(c[1]))\n        rows.append((t, log_p.index[i + L - 1], tv, np.sign(tv)))\n    return pd.DataFrame(rows, columns=[\"t0\", \"t1\", \"tval\", \"y\"]).set_index(\"t0\")\n</code></pre>\n\n<h3>From probabilities to bet sizes</h3>\n<p>Given a calibrated probability, how large should the position be? AFML ch. 10 maps it through a test statistic. For a binary outcome, consider testing $H_0: p = 1/2$. With predicted probability $p$ of the predicted side,</p>\n$$z = \\frac{p - \\tfrac12}{\\sqrt{p(1-p)}}, \\qquad m = s\\,\\big(2\\,\\Phi(z) - 1\\big) \\in [-1, 1],$$\n<p>where $\\Phi$ is the standard normal CDF and $s$ the side. For a $K$-class predictor with top-class probability $\\tilde p$, replace $1/2$ by $1/K$: $z = (\\tilde p - 1/K)/\\sqrt{\\tilde p(1-\\tilde p)}$. In meta-labeling, $p = \\hat p_i$ from the secondary model and $s = s_i$ from the primary. The mapping is monotone, flat near $p = 1/2$ (low conviction translates into small positions) and saturating near 1, which damps the effect of overconfident probabilities. It presumes calibration; isotonic or Platt calibration on a held-out fold is a prerequisite, especially for boosted trees and random forests whose raw scores are poorly calibrated.</p>\n\n<h3>Averaging active bets and discretising</h3>\n<p>Signals arrive at event times, but positions are held until $t_{i,1}$. At any time $t$, several bets with overlapping intervals may be active. Rather than letting the latest signal override the book, AFML averages the sizes of all active bets:</p>\n$$m_t = \\frac{1}{|\\mathcal{A}_t|}\\sum_{i \\in \\mathcal{A}_t} m_i, \\qquad \\mathcal{A}_t = \\{ i : t_{i,0} \\le t \\lt t_{i,1} \\}.$$\n<p>This smooths the position and reduces turnover. Small changes in $m_t$ still cause churn, so the target is discretised to a step size $d \\in (0,1]$:</p>\n$$m^*_t = \\operatorname{round}\\!\\left(\\frac{m_t}{d}\\right) d, \\qquad m^*_t \\leftarrow \\max(-1, \\min(1, m^*_t)).$$\n<p>The step $d$ trades tracking error against turnover and should be chosen with a transaction-cost model. AFML also describes a dynamic variant in which the size is a function of the gap between a forecast price and the current price, $m(\\omega, x) = x/\\sqrt{\\omega + x^2}$, with $\\omega$ calibrated so that a given divergence maps to a given size, and limit prices derived by inverting the function. That is useful for execution-aware strategies.</p>\n\n<div class=\"callout warn\"><strong>Pitfall: sizing on uncalibrated or in-sample probabilities.</strong> The Gaussian-CDF map assumes $\\hat p$ means what it says. Probabilities from a model evaluated on its own training data, or from trees with many overlapping (non-unique) samples, are typically overconfident; sizes then concentrate near $\\pm 1$ and realised volatility far exceeds the target. Calibrate on purged out-of-fold predictions, check a reliability diagram and Brier score per year, and compare against a constant-size baseline. Also remember that $|\\mathcal{A}_t|$ depends on how many events fired; scale to a risk target rather than letting event frequency drive gross exposure.</div>\n\n<h3>Putting it together</h3>\n<p>A complete pipeline for this module: CUSUM events on dollar bars → primary side (e.g. a moving-average crossover or a fundamental signal) → triple-barrier labels with side, retaining $t_{i,1}$ → secondary classifier with uniqueness weights and purged CV → calibrated $\\hat p_i$ → Gaussian-CDF sizes → averaging of active bets → discretisation → backtest with costs. Each step has a hyperparameter that is easy to overfit, so log every configuration you try; the number of trials is an input to deflated Sharpe ratio estimates later in the program.</p>"
    }
  ],
  "cheatsheet": [
    {
      "term": "Fixed-horizon label",
      "formula": "y_i = \\operatorname{sign}(r_{t_{i,0},t_{i,0}+h})\\ \\text{if}\\ |r| \\gt \\tau,\\ \\text{else}\\ 0",
      "note": "Path-blind; constant tau makes class balance a volatility proxy."
    },
    {
      "term": "Dynamic threshold",
      "formula": "\\tau_{i} = k\\,\\hat\\sigma_{t_{i,0}},\\ \\hat\\sigma = \\text{EWM std of daily returns}",
      "note": "Causal estimate at event start; scale by sqrt(h) for other horizons."
    },
    {
      "term": "Horizontal barriers",
      "formula": "P_{t_{i,0}} e^{\\pm k\\,\\hat\\sigma_{t_{i,0}}}",
      "note": "Upper = profit-take (u), lower = stop-loss (l); may be asymmetric."
    },
    {
      "term": "Triple-barrier label",
      "formula": "y_i = \\operatorname{sign}(r_{t_{i,0},t_{i,1}}),\\ t_{i,1} = \\text{first touch}",
      "note": "Vertical touch: sign or 0. Keep t1 for purging and uniqueness."
    },
    {
      "term": "Meta-label",
      "formula": "z_i = \\mathbb{1}\\{ s_i\\, r_{t_{i,0},t_{i,1}} \\gt 0 \\}",
      "note": "Side s from primary model; secondary predicts P[z=1]."
    },
    {
      "term": "F1 score",
      "formula": "F_1 = \\frac{2PR}{P+R}",
      "note": "Primary tuned for recall, secondary raises precision."
    },
    {
      "term": "Sharpe vs precision (symmetric payoffs)",
      "formula": "\\theta = \\frac{2p-1}{2\\sqrt{p(1-p)}}\\sqrt{n}",
      "note": "Steep near p = 0.5; filtering lowers n."
    },
    {
      "term": "Trend-scanning label",
      "formula": "L^* = \\arg\\max_L |\\hat t_{\\beta_1}(L)|,\\ y_t = \\operatorname{sign}(\\hat t_{\\beta_1}(L^*))",
      "note": "|t| is a sample weight; t-values are a ranking device, not valid tests."
    },
    {
      "term": "Bet size z-statistic",
      "formula": "z = \\frac{p - 1/K}{\\sqrt{p(1-p)}}",
      "note": "K = 2 for binary or meta-labels."
    },
    {
      "term": "Gaussian-CDF bet size",
      "formula": "m = s\\,(2\\Phi(z) - 1)",
      "note": "Requires calibrated p."
    },
    {
      "term": "Averaging active bets",
      "formula": "m_t = \\frac{1}{|\\mathcal{A}_t|}\\sum_{i \\in \\mathcal{A}_t} m_i",
      "note": "A_t = bets with t0 <= t < t1."
    },
    {
      "term": "Size discretisation",
      "formula": "m^* = \\operatorname{round}(m/d)\\,d",
      "note": "Step d trades tracking error vs turnover; clip to [-1, 1]."
    },
    {
      "term": "Dynamic sizing (sigmoid)",
      "formula": "m(\\omega, x) = \\frac{x}{\\sqrt{\\omega + x^2}}",
      "note": "x = forecast minus current price; invert for limit prices."
    }
  ],
  "flashcards": [
    {
      "q": "Give two reasons fixed-horizon labels with a constant threshold are problematic.",
      "a": "(1) Class balance tracks the volatility regime, so the model learns regime instead of signal. (2) They ignore the path: a trade stopped out before recovering is labelled a success."
    },
    {
      "q": "How is the volatility used for dynamic barriers estimated?",
      "a": "An exponentially weighted standard deviation of ~1-day returns computed on bars, evaluated causally at the event start $t_{i,0}$."
    },
    {
      "q": "Name the three barriers and their trading interpretation.",
      "a": "Upper horizontal = profit-take, lower horizontal = stop-loss, vertical = maximum holding period."
    },
    {
      "q": "Why must a labeling routine return $t_{i,1}$?",
      "a": "Overlapping label intervals make observations non-i.i.d.; $t_{i,1}$ is needed for uniqueness weights, purging and embargo in cross-validation."
    },
    {
      "q": "What does the barrier configuration $[0,0,1]$ reduce to?",
      "a": "A fixed-horizon label (only the vertical barrier active)."
    },
    {
      "q": "How does supplying a side change the triple-barrier output?",
      "a": "The path is multiplied by the side, barriers become profit-take/stop-loss for that position, and labels become $\\{0,1\\}$ (did the bet make money) — a meta-label."
    },
    {
      "q": "In meta-labeling, which model is tuned for recall and which for precision?",
      "a": "The primary model for high recall; the secondary model filters false positives to raise precision, improving $F_1$."
    },
    {
      "q": "Why is precision so valuable near $p = 0.5$?",
      "a": "$\\theta = \\frac{2p-1}{2\\sqrt{p(1-p)}}\\sqrt{n}$ is steep there: small precision gains multiply the Sharpe ratio at fixed bet frequency."
    },
    {
      "q": "Describe the trend-scanning label.",
      "a": "For each $t$, fit linear trends over several forward windows, pick the window with the largest $|t|$ on the slope, label with its sign and weight by $|t|$."
    },
    {
      "q": "Why are trend-scanning t-values not valid hypothesis tests?",
      "a": "Residuals are autocorrelated (OLS standard errors are wrong) and the window is chosen to maximise $|t|$; they serve as a ranking/weighting device."
    },
    {
      "q": "Write the Gaussian-CDF bet-size mapping.",
      "a": "$z = (p - 1/K)/\\sqrt{p(1-p)}$, $m = s(2\\Phi(z)-1)$."
    },
    {
      "q": "Why average active bets instead of using the latest signal?",
      "a": "Bets overlap in time; averaging smooths the position, reduces turnover and avoids letting one event override others still in force."
    },
    {
      "q": "What does size discretisation achieve?",
      "a": "It suppresses small target changes that would cause churn; $m^* = \\operatorname{round}(m/d)d$ with $d$ chosen against a cost model."
    },
    {
      "q": "What is the main prerequisite for probability-based sizing?",
      "a": "Calibrated, out-of-sample (purged out-of-fold) probabilities; otherwise sizes cluster at $\\pm1$ and risk overshoots."
    },
    {
      "q": "Why prefer the precision–recall curve over ROC AUC for a meta-labeling model?",
      "a": "The economically relevant region is high precision at the chosen threshold; ROC AUC can look fine while that region is poor, especially with class imbalance."
    }
  ],
  "projects": [
    {
      "id": "fml-labeling-p1",
      "title": "Triple-barrier vs fixed-horizon labels on liquid ETFs and crypto",
      "level": "core",
      "hours": "6–10",
      "goal": "Implement volatility-scaled triple-barrier labeling with CUSUM-sampled events, compare its label distribution and stability against fixed-horizon labels, and show how barrier choices change the class balance across regimes.",
      "data": "Option A (preferred): dollar bars and CUSUM events from the data-structures module, built from Binance public trades (data.binance.vision). Option B: daily data for long-lived, liquid ETFs (e.g. SPY, QQQ, IWM, TLT, GLD) via yfinance. yfinance returns only currently listed symbols and retroactively adjusted prices, so restrict to instruments that existed throughout the sample, use adjusted closes only for returns, and state the survivorship caveat. Use only public or personal data; never employer data.",
      "steps": [
        "Compute a causal EWM daily-volatility series; verify causality with a truncation test.",
        "Generate events with a symmetric CUSUM filter (h = c times volatility).",
        "Label events with fixed-horizon (constant tau and vol-scaled tau) and triple-barrier schemes for at least 3 barrier configurations, e.g. [2,2,5d], [1,1,5d], [2,1,10d]; use bar highs and lows to detect touches.",
        "Report per year: class shares, share of exits by barrier type, mean holding period, mean return per label.",
        "Measure label persistence: fraction of consecutive events with the same label, and correlation of label with trailing volatility.",
        "Write a short comparison of how each scheme depends on regime."
      ],
      "deliverables": [
        "Labeling module (vol, CUSUM, triple-barrier) with tests",
        "Tables and plots of label distributions by year and configuration",
        "One-page discussion"
      ],
      "acceptance": [
        "Every labelled event has t1 > t0 and t1 ≤ t0 + vertical horizon; enforced by a test.",
        "A synthetic test path that crosses the upper barrier on bar k is labelled +1 with t1 equal to bar k (and similarly for the lower barrier and vertical case).",
        "Truncating the price series after date T leaves all labels with t1 ≤ T unchanged.",
        "Report shows that the correlation between |label| (or non-zero share) and trailing volatility is lower for vol-scaled schemes than for the constant-tau fixed-horizon scheme, or explains why not.",
        "Tables cover at least 3 barrier configurations and at least 5 years (or 12 months for crypto)."
      ],
      "extensions": [
        "Vectorise or Numba-compile the barrier search and report speedup on 100k events.",
        "Add trend-scanning labels and compare their agreement with triple-barrier labels.",
        "Compute average uniqueness of labels per configuration as a preview of sample weighting."
      ]
    },
    {
      "id": "fml-labeling-p2",
      "title": "Meta-labeling a simple primary strategy with calibrated bet sizing",
      "level": "stretch",
      "hours": "14–24",
      "goal": "Wrap a transparent primary model (e.g. a moving-average crossover or a time-series momentum rule) with a meta-labeling classifier, calibrate its probabilities, convert them into averaged, discretised positions, and test whether the combined system improves precision, F1 and risk-adjusted returns net of costs.",
      "data": "Dollar bars from Binance public trades (BTCUSDT, ETHUSDT and two or three other large pairs), or daily data for a basket of long-lived ETFs via yfinance (survivorship caveat applies; avoid single stocks selected by current index membership). Public or personal data only; never employer data or infrastructure.",
      "steps": [
        "Define the primary side rule and tune it for high recall on the first 60% of data only.",
        "Create meta-labels with side-aware triple barriers (allow asymmetric u, l) and retain t1.",
        "Build secondary features available at t0: volatility, recent primary hit rate, trend-scan strength (backward), volume/dollar-bar frequency, spread proxies.",
        "Train a random forest or gradient boosting classifier with purged k-fold CV (simple purge on t1 plus a small embargo); collect out-of-fold probabilities.",
        "Calibrate (isotonic or Platt) on out-of-fold predictions; report reliability diagrams and Brier score.",
        "Map probabilities to sizes with z → 2Φ(z) − 1, average active bets, discretise with d ∈ {0.05, 0.1, 0.25}, and backtest with a stated cost per unit turnover on the final 40% holdout.",
        "Compare against (i) the primary rule with constant size and (ii) the primary rule filtered by a fixed probability threshold."
      ],
      "deliverables": [
        "End-to-end pipeline script or package",
        "PR curve, reliability diagram, and size-distribution plots",
        "Holdout performance table (precision, recall, F1, Sharpe, max drawdown, turnover) for the three systems",
        "Log of every configuration tried (count of trials)"
      ],
      "acceptance": [
        "Holdout period is untouched until final evaluation; documented by timestamps in the trial log.",
        "Out-of-fold Brier score after calibration is no worse than before calibration.",
        "Holdout table reports precision, recall, F1, Sharpe, max drawdown and turnover for all three systems, net of the stated cost.",
        "Turnover decreases monotonically as the discretisation step d increases (or deviations are explained).",
        "A unit test confirms m = 0 when p = 0.5 and |m| < 1 for p < 1, and that averaged positions only include bets with t0 ≤ t < t1.",
        "The report states the number of trials and whether the meta-labeled system beats the constant-size primary on holdout Sharpe."
      ],
      "extensions": [
        "Replace the random forest with an ensemble of secondary models in the spirit of ensemble meta-labeling and compare calibration.",
        "Use conformal prediction to abstain when the prediction set contains both classes.",
        "Replace the CDF sizing with a fractional-Kelly mapping and compare drawdowns."
      ]
    }
  ],
  "frontier": {
    "asOf": "2026-11",
    "summary": "Labeling and sizing have shifted from single-model classification toward layered systems: a transparent primary signal, an ML filter that estimates the probability the signal works, and a sizing layer that depends on how well those probabilities are calibrated. Active work formalises meta-labeling architectures, studies calibration and uncertainty quantification for position sizing, and questions the label-then-optimise pipeline itself through decision-focused and end-to-end learning that optimises trading objectives directly.",
    "threads": [
      {
        "title": "Meta-labeling as a research program",
        "why": "A series of papers turned the AFML idea into a framework with explicit architectures (sequential, ensemble, conditional), evaluation metrics and position-sizing studies. They are the best entry point for designing the secondary layer on top of an existing equity signal.",
        "refs": [
          {
            "label": "Joubert (2022) — Meta-Labeling: Theory and Framework",
            "url": "https://doi.org/10.3905/jfds.2022.1.098"
          },
          {
            "label": "Meyer, Joubert & Alfeus (2022) — Meta-Labeling Architecture",
            "url": "https://doi.org/10.3905/jfds.2022.1.108"
          },
          {
            "label": "Thumm, Barucca & Joubert (2023) — Ensemble Meta-Labeling",
            "url": "https://doi.org/10.3905/jfds.2022.1.114"
          }
        ]
      },
      {
        "title": "Calibration and uncertainty for position sizing",
        "why": "Probability-based sizing is only as good as the probabilities. Calibration methods from ML and distribution-free uncertainty quantification (conformal prediction) give tools to make sizes trustworthy and to abstain when the model is unsure; evidence suggests calibration matters most for fixed sizing functions.",
        "refs": [
          {
            "label": "Meyer, Barziy & Joubert (2023) — Meta-Labeling: Calibration and Position Sizing",
            "url": "https://doi.org/10.3905/jfds.2023.1.119"
          },
          {
            "label": "Guo, Pleiss, Sun & Weinberger (2017) — On Calibration of Modern Neural Networks",
            "url": "https://arxiv.org/abs/1706.04599"
          },
          {
            "label": "Angelopoulos & Bates (2021) — A Gentle Introduction to Conformal Prediction and Distribution-Free Uncertainty Quantification",
            "url": "https://arxiv.org/abs/2107.07511"
          }
        ]
      },
      {
        "title": "Decision-focused and end-to-end learning",
        "why": "Instead of fitting labels and then sizing, these approaches train models on the downstream decision loss (portfolio regret, Sharpe ratio). They challenge whether labels are needed at all, at the cost of noisier gradients and greater overfitting risk.",
        "refs": [
          {
            "label": "Elmachtoub & Grigas (2022) — Smart \"Predict, then Optimize\"",
            "url": "https://doi.org/10.1287/mnsc.2020.3922"
          },
          {
            "label": "Lim, Zohren & Roberts (2019) — Enhancing Time Series Momentum Strategies Using Deep Neural Networks",
            "url": "https://arxiv.org/abs/1904.04912"
          }
        ]
      },
      {
        "title": "Labels as researcher degrees of freedom",
        "why": "Barrier widths, horizons, trend-scan grids and calibration choices multiply the number of implicit trials. The multiple-testing literature argues that these choices must be counted and disclosed, which links labeling directly to backtest-overfitting corrections later in the program.",
        "refs": [
          {
            "label": "López de Prado (2020) — Machine Learning for Asset Managers",
            "url": "https://doi.org/10.1017/9781108883658"
          },
          {
            "label": "Harvey, Liu & Zhu (2016) — ...and the Cross-Section of Expected Returns",
            "url": "https://doi.org/10.1093/rfs/hhv059"
          }
        ]
      }
    ],
    "openQuestions": [
      "When the primary model is a cross-sectional equity factor rather than a time-series rule, what is the right meta-label: absolute profitability, beating the cross-sectional median, or beating a risk-model expected return?",
      "Is the Gaussian-CDF sizing map close to optimal under a utility or Kelly criterion, and how should it be adjusted for fat-tailed payoffs and correlated bets?",
      "How should calibration be maintained under regime change: rolling recalibration, conformal methods with adaptive coverage, or explicit regime features?",
      "Do end-to-end models that optimise Sharpe directly generalise better than label-then-size pipelines once the number of trials is accounted for?",
      "Can triple-barrier parameters be learned jointly with the classifier without leaking the test set?"
    ],
    "brainstorm": [
      "Take a signal you already understand well (e.g. short-term reversal or earnings drift) as the primary model. Which features would tell you, ex ante, when it tends to fail?",
      "Plot the hit rate of a simple rule by volatility decile and by year. Is there enough variation for a secondary model to exploit, or is it noise?",
      "Compare three sizing maps (constant, Gaussian-CDF, fractional Kelly) on the same calibrated probabilities. Which property of the probability distribution drives the differences?",
      "Design a labeling scheme that matches how your strategies are actually risk-managed (stops, max holding, rebalancing). How far is it from a fixed horizon?",
      "Pick one frontier reference and identify a single assumption it makes that may not hold for equities; sketch the smallest test of that assumption."
    ]
  }
}
);
