LAB.module("finance-ml", {
  "id": "fml-data-structures",
  "order": 1,
  "title": "Financial Data Structures: Bars, Imbalance Clocks and Event Sampling",
  "summary": "How to turn raw trade streams into statistically better-behaved observations: activity and information-driven bars, the expected-imbalance threshold, CUSUM event sampling, and the point-in-time hygiene that keeps a dataset honest.",
  "sources": [
    {
      "label": "López de Prado (2018), Advances in Financial Machine Learning, ch. 1–2 (Wiley)",
      "url": ""
    },
    {
      "label": "Ané & Geman (2000), Order Flow, Transaction Clock, and Normality of Asset Returns, Journal of Finance",
      "url": "https://doi.org/10.1111/0022-1082.00286"
    },
    {
      "label": "Easley, López de Prado & O'Hara (2012), The Volume Clock: Insights into the High-Frequency Paradigm",
      "url": "https://papers.ssrn.com/abstract=2034858"
    }
  ],
  "lessons": [
    {
      "id": "fml-data-structures-1",
      "title": "Sampling clocks: time, tick, volume and dollar bars",
      "minutes": 22,
      "html": "<h3>Why the sampling clock is a modelling decision</h3>\n<p>Every supervised model in finance consumes a matrix whose rows are observations. AFML's opening chapters argue that the choice of <em>what a row is</em> is one of the highest-leverage decisions in the pipeline, and it is usually made by default: one row per minute, per day, per month. That default is convenient for storage and joins, but it imposes a clock that markets do not follow. Information arrives in bursts (opens, closes, macro releases, earnings, liquidations), and the trading process responds with bursts of activity. A chronological clock therefore samples the information process unevenly: too often in quiet periods, too rarely in active ones.</p>\n<p>The classical formalisation is the <strong>subordination</strong> view of Clark (1973) and its successors (Ané and Geman, 2000): log-prices behave approximately like a Brownian motion evaluated at a random <em>business time</em> $\\tau(t)$ driven by trading activity,</p>\n$$\\log P_t = W\\big(\\tau(t)\\big), \\qquad \\tau(t) = \\text{cumulative trades, volume or traded value up to } t.$$\n<p>If $\\tau$ is the right clock, increments of $\\log P$ over equal business-time intervals are close to i.i.d. Gaussian, while increments over equal <em>calendar</em> intervals are a variance mixture $r_t \\mid \\Delta\\tau_t \\sim \\mathcal{N}(0, \\sigma^2 \\Delta\\tau_t)$. A variance mixture of normals is leptokurtic and, because activity clusters, conditionally heteroskedastic. In other words, much of the \"fat tails and volatility clustering\" in calendar-time returns is a sampling artefact of the clock rather than a property of the price process itself.</p>\n\n<h3>Standard bars</h3>\n<p>All bar types aggregate a trade stream $\\{(t_i, p_i, v_i)\\}$ into OHLCV-style records. They differ only in the rule that closes a bar.</p>\n<ul>\n<li><strong>Time bars</strong>: close every $\\Delta t$ of wall-clock time. Problems: activity-dependent variance (heteroskedasticity by construction), intraday seasonality (U-shape in equities), and poor statistical properties (serial correlation, non-normality). They also invite look-ahead mistakes when the bar timestamp is the <em>start</em> rather than the <em>end</em> of the interval.</li>\n<li><strong>Tick bars</strong>: close every $N$ transactions. Closer to the Ané–Geman clock, but sensitive to order fragmentation (one parent order sliced into hundreds of child prints, or exchange-level reporting conventions) and to changes in market structure such as tick-size regimes. Opening and closing auctions print as one huge trade and should be handled separately.</li>\n<li><strong>Volume bars</strong>: close every $V$ units traded, $\\sum_{i \\in \\text{bar}} v_i \\ge V$. Robust to fragmentation; closer to the microstructure models that relate price impact to volume. Weakness: share count is not invariant to price level, so splits, reverse splits and long secular price moves change the meaning of $V$.</li>\n<li><strong>Dollar bars</strong>: close every $D$ units of notional, $\\sum p_i v_i \\ge D$. Invariant to splits and approximately invariant to price level, which keeps the number of bars per day more stable across years. For a cross-section, a natural choice is $D_{j,t}$ equal to a fraction of a trailing average daily dollar volume, e.g. $D_{j,t} = \\overline{\\mathrm{ADV}}^{\\mathrm{USD}}_{j,t-1}/50$, so each name generates roughly 50 bars on a typical day. Re-estimating $D$ on a trailing window (never using future ADV) keeps it point-in-time.</li>\n</ul>\n<p>A bar's threshold is a hyperparameter with a bias-variance trade-off: small thresholds give many noisy, microstructure-dominated returns (bid-ask bounce induces negative first-order autocorrelation); large thresholds give few, cleaner observations.</p>\n\n<pre><code class=\"language-python\">import pandas as pd, numpy as np\n\n# Binance spot trades file: id, price, qty, quote_qty, time, is_buyer_maker, is_best_match\ncols = [\"id\", \"price\", \"qty\", \"quote_qty\", \"time\", \"is_buyer_maker\", \"is_best_match\"]\ntr = pd.read_csv(\"BTCUSDT-trades-2024-03.csv\", names=cols, header=None)\ntr[\"time\"] = pd.to_datetime(tr[\"time\"], unit=\"ms\")   # check: newer files use microseconds\n\ndef dollar_bars(tr, D):\n    dv = tr[\"quote_qty\"].to_numpy()\n    bar_id = np.floor(np.cumsum(dv) / D).astype(np.int64)  # bar k = cum notional in [kD, (k+1)D)\n    g = tr.groupby(bar_id)\n    out = pd.DataFrame({\n        \"t_end\": g[\"time\"].last(), \"open\": g[\"price\"].first(), \"high\": g[\"price\"].max(),\n        \"low\": g[\"price\"].min(), \"close\": g[\"price\"].last(),\n        \"volume\": g[\"qty\"].sum(), \"dollar\": g[\"quote_qty\"].sum(), \"n_ticks\": g.size(),\n    })\n    return out.set_index(\"t_end\")\n\nbars = dollar_bars(tr, D=25e6)\nr = np.log(bars[\"close\"]).diff().dropna()\n</code></pre>\n<p>The <code>cumsum // D</code> trick is vectorised but lets one large print straddle two bars without being split; that is usually the right behaviour (a trade is atomic), but it means realised bar sizes exceed $D$ and should be reported.</p>\n\n<h3>Stylized facts by bar type and how to test them</h3>\n<p>The diagnostic claims in AFML ch. 2 are empirical and should be re-run on your own data rather than taken on faith. A useful battery, computed on log returns of each bar type with thresholds chosen so all types produce a similar number of bars:</p>\n<ol>\n<li><strong>Stability of bar counts.</strong> Count bars per week; compare the coefficient of variation across bar types. Dollar bars typically show the most stable counts over multi-year windows; time bars are constant by construction, which is exactly the problem.</li>\n<li><strong>Serial correlation.</strong> First-order autocorrelation $\\hat\\rho_1$ of returns and a Ljung–Box $Q$ statistic. Activity-based bars usually show smaller $|\\hat\\rho_1|$ at comparable sample sizes, though very small thresholds reintroduce bounce.</li>\n<li><strong>Heteroskedasticity.</strong> Autocorrelation of squared returns (ARCH effects) and the variance of returns across sub-periods. A good clock flattens the variance profile.</li>\n<li><strong>Normality.</strong> Jarque–Bera statistic $\\mathrm{JB} = \\tfrac{n}{6}\\big(S^2 + \\tfrac{(K-3)^2}{4}\\big)$. JB grows with $n$, so compare at matched sample sizes, or compare skew and excess kurtosis directly.</li>\n</ol>\n<p>Expect activity bars to <em>improve</em> these diagnostics, not to make returns Gaussian. Jumps on news remain jumps in any clock.</p>\n\n<h3>Multi-instrument series, rolls and corporate actions</h3>\n<p>Bars are built per instrument, but research series often span instruments. AFML's <strong>ETF trick</strong> builds a continuous total-return series for a basket or a rolled futures position by tracking the value of one dollar invested, accounting for rebalancing, roll costs and carry; this avoids the artefacts of naive back-adjustment. For a single futures contract the simpler alternative is to roll on a rule (open interest, volume crossover) and apply a cumulative <em>gap</em> adjustment to prices; the adjusted series can go negative, so compute returns from the unadjusted contract prices and accumulate them.</p>\n<p>For equities, the corresponding hazards are corporate actions. Volume and tick bars must be built on split-adjusted volumes (or, preferably, use dollar bars). Dividend-adjusted closes, such as the \"adjusted close\" from many free APIs, are rescaled retroactively every time a new dividend is paid, so a series downloaded today differs from the one downloaded a year ago. That is harmless for total-return computation but breaks any feature that depends on price <em>level</em> (round-number effects, price-based filters, dollar thresholds).</p>\n\n<div class=\"callout warn\"><strong>Pitfall: point-in-time is a property of every column, not of the dataset.</strong> Survivorship (today's index members or today's listed tickers projected into the past), missing delisting returns (Shumway, 1997, showed the bias is economically large for small caps), restated fundamentals stamped with the fiscal period end rather than the filing date, and ticker reuse all inject future information. Free sources such as yfinance return only currently listed symbols and back-adjusted prices; a backtest on \"the S&amp;P 500\" built from today's constituents silently conditions on survival. For course projects prefer instruments that exist throughout the sample (major crypto pairs, broad ETFs) and state the caveat explicitly.</div>\n\n<h3>Where this sits in the program</h3>\n<p>AFML ch. 1 frames financial ML as a production line in which data curation is a specialised station rather than a preprocessing afterthought. The bars from this lesson feed the event sampling of the next lesson, the labels of the next module, and ultimately the sample-weighting and purged cross-validation machinery, all of which assume each row has a well-defined start time and end time. Choosing the clock well reduces the burden on every downstream component.</p>"
    },
    {
      "id": "fml-data-structures-2",
      "title": "Information-driven bars and CUSUM event sampling",
      "minutes": 25,
      "html": "<h3>From activity clocks to information clocks</h3>\n<p>Tick, volume and dollar bars sample faster when <em>more</em> trading happens. Information-driven bars sample faster when trading is <em>unusually one-sided</em>. The intuition comes from sequential-trade models: informed traders split orders in one direction, so a run of buyer-initiated trades beyond what the recent base rate predicts is evidence that information is arriving. The goal is to close a bar exactly when the order-flow imbalance exceeds its expectation.</p>\n\n<h3>Signing trades</h3>\n<p>Imbalance requires a trade sign $b_t \\in \\{-1, +1\\}$. When the venue publishes the aggressor side (Binance's <code>is_buyer_maker</code> flag, many futures feeds), use it: $b_t = -1$ if the buyer was the maker (the seller hit the bid), else $+1$. Otherwise use the <strong>tick rule</strong>:</p>\n$$b_t = \\begin{cases} \\operatorname{sign}(\\Delta p_t) & \\Delta p_t \\neq 0 \\\\ b_{t-1} & \\Delta p_t = 0 \\end{cases}$$\n<p>The tick rule misclassifies a nontrivial fraction of trades in fragmented equity markets (hidden liquidity, midpoint executions, reporting delays), and errors are not random: they cluster in calm, wide-spread regimes. Lee–Ready or bulk-volume classification are alternatives; measuring agreement with a true-aggressor flag where one exists is an instructive exercise (project 2).</p>\n\n<h3>Tick imbalance bars (TIB)</h3>\n<p>Define the running imbalance from the start of the current bar, $\\theta_T = \\sum_{t=1}^{T} b_t$. Before observing the bar, its expected imbalance is</p>\n$$\\mathbb{E}_0[\\theta_T] = \\mathbb{E}_0[T]\\,\\big(\\mathbb{P}[b_t=1] - \\mathbb{P}[b_t=-1]\\big) = \\mathbb{E}_0[T]\\,\\big(2\\,\\mathbb{P}[b_t=1]-1\\big).$$\n<p>The bar closes at the first $T$ for which the realised imbalance exceeds its expectation in absolute value:</p>\n$$T^{*} = \\arg\\min_{T} \\Big\\{ |\\theta_T| \\ge \\mathbb{E}_0[T]\\,\\big|2\\,\\mathbb{P}[b_t=1]-1\\big| \\Big\\}.$$\n<p>In practice $\\mathbb{E}_0[T]$ is an exponentially weighted mean of the lengths (in ticks) of previous bars, and $2\\mathbb{P}[b_t=1]-1$ is an EWMA of past $b_t$ values (equivalently, the mean imbalance per tick). Both are updated only at bar closes using past information, so the rule is causal.</p>\n\n<h3>Volume and dollar imbalance bars (VIB, DIB)</h3>\n<p>Weight each signed trade by its size, $\\theta_T = \\sum_{t=1}^T b_t v_t$ (volume) or $\\sum_t b_t p_t v_t$ (dollars). Writing $v^{+} = \\mathbb{P}[b_t=1]\\,\\mathbb{E}[v_t \\mid b_t=1]$ and $v^{-} = \\mathbb{P}[b_t=-1]\\,\\mathbb{E}[v_t \\mid b_t=-1]$,</p>\n$$\\mathbb{E}_0[\\theta_T] = \\mathbb{E}_0[T]\\,(v^{+} - v^{-}) = \\mathbb{E}_0[T]\\,\\big(2v^{+} - \\mathbb{E}_0[v_t]\\big),$$\n<p>and the bar closes when $|\\theta_T| \\ge \\mathbb{E}_0[T]\\,|2v^{+} - \\mathbb{E}_0[v_t]|$. In the dollar version these quantities are measured in notional, which makes thresholds comparable across price levels.</p>\n\n<h3>Run bars (TRB, VRB, DRB)</h3>\n<p>Imbalance bars net buys against sells. Run bars instead track the <em>larger one-sided total</em>, which captures sequences of informed slicing even when interleaved with opposite-side noise:</p>\n$$\\theta_T = \\max\\Big\\{ \\sum_{t \\le T,\\, b_t=1} 1,\\; \\sum_{t \\le T,\\, b_t=-1} 1 \\Big\\}, \\qquad \\mathbb{E}_0[\\theta_T] = \\mathbb{E}_0[T]\\max\\big\\{\\mathbb{P}[b_t=1],\\, 1-\\mathbb{P}[b_t=1]\\big\\}.$$\n<p>The volume/dollar versions replace the counts with sums of $v_t$ (or $p_t v_t$) and the probabilities with $v^{+}$ and $v^{-}$. Note that $\\theta_T$ for runs is non-decreasing in $T$, so run bars always close eventually, whereas a balanced imbalance path can wander near zero for a long time.</p>\n\n<h3>Implementation</h3>\n<pre><code class=\"language-python\">import numpy as np\n\ndef tick_imbalance_bars(b, E_T0=1000, span=20, T_min=50, T_max=50_000):\n    # b: array of trade signs (+1/-1). Returns indices (exclusive end) where bars close.\n    a_T, a_b = 2 / (span + 1), 2 / (span * 100 + 1)\n    E_T, E_b = float(E_T0), float(np.mean(b[:E_T0]))   # warm-up from a prefix only\n    closes, theta, start = [], 0.0, 0\n    for i, bi in enumerate(b):\n        theta += bi\n        E_b = (1 - a_b) * E_b + a_b * bi                 # EWMA of 2P[b=1]-1, tick level\n        T = i - start + 1\n        thr = E_T * max(abs(E_b), 1e-3)                  # floor avoids a zero threshold\n        if (T &gt;= T_min and abs(theta) &gt;= thr) or T &gt;= T_max:\n            closes.append(i + 1)\n            E_T = (1 - a_T) * E_T + a_T * T              # EWMA of bar length\n            E_T = min(max(E_T, T_min), T_max)            # clip: stops collapse/explosion\n            theta, start = 0.0, i + 1\n    return np.array(closes)\n</code></pre>\n\n<div class=\"callout warn\"><strong>Pitfall: the threshold feedback loop.</strong> The expected-imbalance threshold is estimated from previous bars, so the rule is self-referential. If a burst of one-sided flow produces short bars, $\\mathbb{E}_0[T]$ falls, the threshold falls, bars get even shorter, and the process can collapse to one-tick bars (or, symmetrically, explode when $|2\\mathbb{P}[b=1]-1| \\to 0$). Always floor and cap $\\mathbb{E}_0[T]$ and the imbalance estimate, use a warm-up period, monitor bars-per-day over time, and treat the EWMA spans as hyperparameters chosen on a training window only. Reporting the distribution of bar lengths is part of a credible result.</div>\n\n<h3>Event sampling: the symmetric CUSUM filter</h3>\n<p>Bars define the clock; <em>events</em> define which bars become training rows. Feeding every bar to a classifier yields many near-duplicate, low-information observations. A cleaner design samples an observation only when something has happened. The <strong>symmetric CUSUM filter</strong> (a quality-control tool from Page, 1954) detects a cumulative drift in a series $y_t$ (typically log price) away from its expectation:</p>\n$$S^{+}_t = \\max\\big(0,\\; S^{+}_{t-1} + y_t - \\mathbb{E}_{t-1}[y_t]\\big), \\qquad S^{-}_t = \\min\\big(0,\\; S^{-}_{t-1} + y_t - \\mathbb{E}_{t-1}[y_t]\\big),$$\n<p>with $S^{\\pm}_0 = 0$. An event is recorded at $t$ when $S^{+}_t \\gt h$ (then $S^{+}_t \\leftarrow 0$) or $S^{-}_t \\lt -h$ (then $S^{-}_t \\leftarrow 0$). With $\\mathbb{E}_{t-1}[y_t] = y_{t-1}$ the increment is just the return. Unlike a Bollinger-band trigger, which fires repeatedly while price hovers around the band, CUSUM requires a full move of size $h$ after each reset, so events are not clustered around a single level.</p>\n<pre><code class=\"language-python\">def cusum_events(log_p, h):\n    # log_p: pd.Series of log prices on bars; h: scalar or pd.Series aligned to log_p\n    h = h if hasattr(h, \"reindex\") else pd.Series(h, index=log_p.index)\n    events, s_pos, s_neg = [], 0.0, 0.0\n    diff = log_p.diff().dropna()\n    for t, x in diff.items():\n        s_pos, s_neg = max(0.0, s_pos + x), min(0.0, s_neg + x)\n        if s_neg &lt; -h[t]:\n            s_neg = 0.0; events.append(t)\n        elif s_pos &gt; h[t]:\n            s_pos = 0.0; events.append(t)\n    return pd.DatetimeIndex(events)\n</code></pre>\n<p>Setting $h_t$ as a multiple of a trailing volatility estimate (e.g. $h_t = c\\,\\hat\\sigma_{t-1}$ of bar returns) makes the event rate approximately regime-invariant. The resulting timestamps $t_{i,0}$ are the starting points for the triple-barrier labels of the next module. CUSUM also connects to structural-break detection (AFML ch. 17), where the same statistic, standardised, tests for departures from a random walk.</p>\n\n<h3>What to expect empirically</h3>\n<p>Information-driven bars are more adaptive but also more fragile: their properties depend on hyperparameters (spans, initial $\\mathbb{E}_0[T]$, sign classifier), and published evidence of downstream forecasting gains is mixed and venue-specific. Treat them as a hypothesis to test against dollar bars, with the same diagnostic battery and the same downstream model, rather than as a guaranteed upgrade.</p>"
    }
  ],
  "cheatsheet": [
    {
      "term": "Subordinated price process",
      "formula": "\\log P_t = W(\\tau(t)),\\; r_t \\mid \\Delta\\tau_t \\sim \\mathcal{N}(0,\\sigma^2\\Delta\\tau_t)",
      "note": "Calendar returns are a variance mixture; an activity clock removes much of the mixing."
    },
    {
      "term": "Dollar bar close rule",
      "formula": "\\sum_{i \\in \\text{bar}} p_i v_i \\ge D",
      "note": "Split-invariant and roughly price-level invariant; set D from trailing ADV."
    },
    {
      "term": "Cross-sectional dollar threshold",
      "formula": "D_{j,t} = \\overline{\\mathrm{ADV}}^{\\mathrm{USD}}_{j,t-1} / k",
      "note": "About k bars per typical day per name; trailing window only."
    },
    {
      "term": "Tick rule",
      "formula": "b_t = \\operatorname{sign}(\\Delta p_t)\\ \\text{if}\\ \\Delta p_t \\ne 0,\\ \\text{else}\\ b_{t-1}",
      "note": "Use the venue's aggressor flag when available."
    },
    {
      "term": "Tick imbalance",
      "formula": "\\theta_T = \\sum_{t=1}^{T} b_t",
      "note": "Reset at each bar close."
    },
    {
      "term": "Expected tick imbalance",
      "formula": "\\mathbb{E}_0[\\theta_T] = \\mathbb{E}_0[T]\\,(2\\mathbb{P}[b_t=1]-1)",
      "note": "Both factors estimated by EWMA over past bars/ticks."
    },
    {
      "term": "TIB close time",
      "formula": "T^* = \\arg\\min_T \\{ |\\theta_T| \\ge \\mathbb{E}_0[T]\\,|2\\mathbb{P}[b_t=1]-1| \\}",
      "note": "Floor and cap the threshold to avoid collapse."
    },
    {
      "term": "Volume imbalance expectation",
      "formula": "\\mathbb{E}_0[\\theta_T] = \\mathbb{E}_0[T]\\,(2v^{+} - \\mathbb{E}_0[v_t])",
      "note": "v+ = P[b=1] E[v | b=1]; dollar version uses notional."
    },
    {
      "term": "Tick run statistic",
      "formula": "\\theta_T = \\max\\{\\textstyle\\sum_{b_t=1} 1,\\ \\sum_{b_t=-1} 1\\}",
      "note": "Expected value E0[T] max{P[b=1], 1-P[b=1]}; non-decreasing in T."
    },
    {
      "term": "Symmetric CUSUM",
      "formula": "S^{\\pm}_t = \\max/\\min\\big(0,\\ S^{\\pm}_{t-1} + y_t - \\mathbb{E}_{t-1}[y_t]\\big)",
      "note": "Event when S+ > h or S- < -h; reset the triggered side."
    },
    {
      "term": "Jarque–Bera",
      "formula": "\\mathrm{JB} = \\tfrac{n}{6}\\left(S^2 + \\tfrac{(K-3)^2}{4}\\right)",
      "note": "Scales with n: compare bar types at matched sample sizes."
    },
    {
      "term": "Ljung–Box",
      "formula": "Q = n(n+2)\\sum_{k=1}^{m} \\frac{\\hat\\rho_k^2}{n-k}",
      "note": "Serial correlation diagnostic; apply to returns and squared returns."
    },
    {
      "term": "Bid-ask bounce",
      "formula": "\\operatorname{Cov}(r_t, r_{t-1}) \\approx -s^2/4",
      "note": "Roll (1984): tiny thresholds create negative first-order autocorrelation."
    }
  ],
  "flashcards": [
    {
      "q": "Why do calendar-time returns look fat-tailed even if the price is Brownian in business time?",
      "a": "Because each calendar interval contains a random amount of business time, so returns are a <strong>variance mixture of normals</strong>, which is leptokurtic; clustering of activity adds conditional heteroskedasticity."
    },
    {
      "q": "Main weakness of tick bars?",
      "a": "Sensitivity to order fragmentation and reporting conventions: one parent order may print as many child trades, and auctions print as a single huge trade."
    },
    {
      "q": "Why prefer dollar bars over volume bars over long histories?",
      "a": "Share volume changes meaning with splits and large price moves; notional traded is split-invariant and roughly price-level invariant, so bar counts per day are more stable."
    },
    {
      "q": "How do you set a point-in-time dollar threshold for a cross-section?",
      "a": "Use a fraction of each name's <em>trailing</em> average daily dollar volume, e.g. $D_{j,t} = \\overline{\\mathrm{ADV}}^{\\mathrm{USD}}_{j,t-1}/50$, re-estimated periodically with past data only."
    },
    {
      "q": "Write the expected imbalance for tick imbalance bars.",
      "a": "$\\mathbb{E}_0[\\theta_T] = \\mathbb{E}_0[T](2\\mathbb{P}[b_t=1]-1)$, with both factors estimated by EWMAs of past bar lengths and past signs."
    },
    {
      "q": "What instability afflicts imbalance bars and how do you guard against it?",
      "a": "A feedback loop: short bars lower $\\mathbb{E}_0[T]$, lowering the threshold, producing shorter bars (or the reverse). Guard with warm-up, floors/caps on $\\mathbb{E}_0[T]$ and on the imbalance estimate, and monitoring bars per day."
    },
    {
      "q": "How do run bars differ from imbalance bars?",
      "a": "They track the larger <em>one-sided</em> total (count, volume or dollars) instead of the net, so interleaved opposite-side noise does not cancel a sequence of informed slicing. The statistic is non-decreasing, so bars always close."
    },
    {
      "q": "How do you sign trades on Binance spot data?",
      "a": "Use <code>is_buyer_maker</code>: if true, the seller was the aggressor ($b=-1$); otherwise $b=+1$. No tick rule needed."
    },
    {
      "q": "Why is the CUSUM filter preferred to a band-crossing trigger for event sampling?",
      "a": "After each event it resets and requires a fresh cumulative move of size $h$, so it does not fire repeatedly while the price hovers around a level."
    },
    {
      "q": "How should the CUSUM threshold $h$ be chosen?",
      "a": "As a multiple of a trailing volatility estimate, $h_t = c\\,\\hat\\sigma_{t-1}$, so the event rate is roughly regime-invariant; $c$ is a hyperparameter chosen on training data."
    },
    {
      "q": "Why must Jarque–Bera comparisons across bar types use matched sample sizes?",
      "a": "JB is proportional to $n$; a bar type with more observations gets a larger statistic for the same skew and kurtosis."
    },
    {
      "q": "What is wrong with using 'adjusted close' from a free API for a price-level feature?",
      "a": "Dividend adjustment is applied retroactively, so historical price levels change every time a new dividend is paid; level-based features and dollar thresholds then embed future information."
    },
    {
      "q": "What does the ETF trick solve?",
      "a": "It builds a continuous series for a rolled futures position or a rebalanced basket as the value of one dollar invested, handling rolls, costs and carry without the artefacts (e.g. negative prices) of naive back-adjustment."
    },
    {
      "q": "Name three point-in-time hazards in equity panels.",
      "a": "Survivorship (current constituents projected backwards), missing delisting returns, and fundamentals stamped with period-end instead of filing date (plus restatements and ticker reuse)."
    }
  ],
  "projects": [
    {
      "id": "fml-data-structures-p1",
      "title": "Bar zoo: time vs tick vs volume vs dollar bars on BTCUSDT",
      "level": "core",
      "hours": "6–10",
      "goal": "Build the four standard bar types from raw trades for one liquid crypto pair over at least six months, then reproduce (or refute) the AFML stylized facts with a disciplined diagnostic battery at matched sample sizes.",
      "data": "Binance public data (data.binance.vision): spot monthly trades files for BTCUSDT (and optionally ETHUSDT). Files are large (multi-GB per month for BTC), so process month by month with chunked reads or Polars and persist bars as Parquet. Check whether each file has a header and whether timestamps are in milliseconds or microseconds. Crypto trades 24/7 and has no corporate actions, which keeps the exercise clean; note that it also has venue-specific wash trading and outages. Use only public or personal data; do not use any employer data or infrastructure.",
      "steps": [
        "Download 6–12 monthly trade files; validate row counts, monotone timestamps and trade-id continuity; document any gaps.",
        "Implement time (e.g. 5-min), tick, volume and dollar bars with a single generic function parameterised by the close rule; store OHLCV, n_ticks, notional and start/end timestamps.",
        "Calibrate thresholds so each bar type yields approximately the same total number of bars as the time bars (within 5%).",
        "Compute per-bar-type: weekly bar-count coefficient of variation, lag-1 autocorrelation and Ljung–Box Q(10) of returns, Ljung–Box Q(10) of squared returns, skew, excess kurtosis and JB.",
        "Repeat the battery at a second, 5x larger threshold to show the bounce versus information trade-off.",
        "Plot intraday (UTC hour) average bar counts per type to visualise seasonality absorption."
      ],
      "deliverables": [
        "Reusable bar-building module with unit tests",
        "Parquet bar datasets",
        "Notebook or report with a diagnostics table (rows: bar types and thresholds; columns: statistics) and 3–4 figures",
        "Half-page interpretation including where the AFML claims did not hold"
      ],
      "acceptance": [
        "Unit test: sum of notional across dollar bars equals sum of trade notional to within 1e-6 relative error; no trade assigned to two bars.",
        "All bar types have total counts within ±5% of each other at each threshold level.",
        "Diagnostics table contains all listed statistics for at least 2 thresholds × 4 bar types.",
        "Bar timestamps are bar end times, verified by a test that every bar's t_end ≥ the time of its last trade.",
        "Written conclusion states, with numbers, which bar type has the lowest weekly count CV and the lowest excess kurtosis on your data."
      ],
      "extensions": [
        "Add ETHUSDT and test whether a single dollar threshold expressed as a fraction of trailing ADV transfers across pairs.",
        "Repeat on a free equity ETF intraday sample if you have one, documenting auction handling.",
        "Bootstrap confidence intervals for the kurtosis differences."
      ]
    },
    {
      "id": "fml-data-structures-p2",
      "title": "Information-driven bars, sign accuracy and CUSUM events",
      "level": "stretch",
      "hours": "12–20",
      "goal": "Implement tick/dollar imbalance and run bars with guarded expected-imbalance thresholds, measure how much the tick rule degrades them relative to the true aggressor flag, and produce a CUSUM event set ready for triple-barrier labeling.",
      "data": "Same Binance spot trades as the core project; the is_buyer_maker field provides a ground-truth aggressor side, which is rarely available for equities. Optionally add Binance USD-M futures trades for the same pair to compare venues. Public or personal data only; never employer data.",
      "steps": [
        "Compute true signs from is_buyer_maker and tick-rule signs; report agreement overall and by volatility regime and by trade size decile.",
        "Implement TIB, DIB, TRB and DRB with configurable EWMA spans, warm-up, floors and caps; log the threshold path.",
        "Stress test: run without guards and document whether bar length collapses or explodes; then with guards.",
        "Compare information bars against dollar bars using the core project's diagnostic battery at matched counts.",
        "Implement the symmetric CUSUM filter on dollar-bar log prices with h_t = c times trailing bar-return volatility; tune c on the first half of the sample to target a chosen event rate.",
        "Save event timestamps for use in the labeling module."
      ],
      "deliverables": [
        "Bar library with information-driven bars and guard rails",
        "Sign-accuracy table and threshold-path plots",
        "Diagnostic comparison table vs dollar bars",
        "Event index file plus short report"
      ],
      "acceptance": [
        "Tick-rule vs aggressor-flag agreement reported as a single number and broken down into at least 3 regimes.",
        "With guards enabled, the daily number of DIB bars never falls below 10% or exceeds 10x its median over the sample (or the report explains why it does).",
        "An unguarded run demonstrates or rules out the feedback collapse, with a plot.",
        "CUSUM event rate on the second half of the sample is within ±30% of the target set on the first half.",
        "All estimators (EWMAs, volatility for h) verified causal by a test that truncating future data does not change past bars or events."
      ],
      "extensions": [
        "Replace the tick rule with bulk-volume classification and repeat the accuracy study.",
        "Test whether DIB returns forecast next-bar absolute returns better than dollar-bar returns (a simple out-of-sample R² comparison).",
        "Add VPIN computed on volume bars and relate it to imbalance-bar frequency."
      ]
    }
  ],
  "frontier": {
    "asOf": "2026-11",
    "summary": "The idea that sampling should follow activity rather than the calendar is settled; current work asks which representation of the order flow carries the most predictive information, how to learn it rather than hand-craft it, and how to keep the resulting datasets reproducible. Research has moved from bar construction toward order-flow features fed to tree ensembles and deep networks, toward tokenized market data for pre-trained sequence models, and toward a renewed emphasis on data provenance and replication in empirical finance.",
    "threads": [
      {
        "title": "Business-time clocks: theory and empirics",
        "why": "The volume clock and transaction clock literature underpins activity bars. It remains the cleanest theoretical justification for choosing a clock and a good source of testable predictions about which clock normalises returns best in a given market.",
        "refs": [
          {
            "label": "Ané & Geman (2000) — Order Flow, Transaction Clock, and Normality of Asset Returns",
            "url": "https://doi.org/10.1111/0022-1082.00286"
          },
          {
            "label": "Easley, López de Prado & O'Hara (2012) — The Volume Clock: Insights into the High-Frequency Paradigm",
            "url": "https://papers.ssrn.com/abstract=2034858"
          }
        ]
      },
      {
        "title": "Order-flow features and ML in microstructure",
        "why": "Rather than using imbalance only to close bars, recent work feeds order-flow imbalance and classic microstructure measures directly to ML models. Results suggest stationary order-flow inputs beat raw book states and that some cross-asset structure is universal.",
        "refs": [
          {
            "label": "Easley, López de Prado, O'Hara & Zhang (2021) — Microstructure in the Machine Age",
            "url": "https://doi.org/10.1093/rfs/hhaa078"
          },
          {
            "label": "Kolm, Turiel & Westray (2023) — Deep Order Flow Imbalance: Extracting Alpha at Multiple Horizons from the Limit Order Book",
            "url": "https://doi.org/10.1111/mafi.12413"
          },
          {
            "label": "Sirignano & Cont (2018) — Universal Features of Price Formation in Financial Markets: Perspectives from Deep Learning",
            "url": "https://arxiv.org/abs/1803.06917"
          }
        ]
      },
      {
        "title": "Tokenizing market data for foundation models",
        "why": "Pre-trained sequence models require discretising continuous market data into tokens, which is a learned analogue of bar construction. Whether tokens should be built on calendar candles or activity bars, and whether zero-shot claims survive rigorous out-of-sample evaluation, are open.",
        "refs": [
          {
            "label": "Ansari et al. (2024) — Chronos: Learning the Language of Time Series",
            "url": "https://arxiv.org/abs/2403.07815"
          },
          {
            "label": "Shi et al. (2025) — Kronos: A Foundation Model for the Language of Financial Markets",
            "url": "https://arxiv.org/abs/2508.02739"
          }
        ]
      },
      {
        "title": "Data provenance, multiple testing and replication",
        "why": "As datasets and feature sets grow, the statistical bar for discoveries rises. Work on replication and multiple testing makes point-in-time construction and full disclosure of data choices (including bar type and thresholds) part of the evidence itself.",
        "refs": [
          {
            "label": "Harvey, Liu & Zhu (2016) — ...and the Cross-Section of Expected Returns",
            "url": "https://doi.org/10.1093/rfs/hhv059"
          },
          {
            "label": "Jensen, Kelly & Pedersen (2023) — Is There a Replication Crisis in Finance?",
            "url": "https://doi.org/10.1111/jofi.13249"
          }
        ]
      }
    ],
    "openQuestions": [
      "Do information-driven bars deliver out-of-sample forecasting gains over dollar bars once hyperparameter search is accounted for, or are reported gains a researcher degree of freedom?",
      "What is the right business clock for a cross-section of equities whose activity is dominated by auctions and index rebalancing flows?",
      "Can an end-to-end model learn its own sampling clock (adaptive tokenization) that beats hand-designed bars, and is it interpretable?",
      "How should bar-based datasets be aligned across assets with asynchronous clocks without reintroducing calendar-time artefacts or look-ahead?",
      "How robust are activity bars to venue-specific artefacts such as wash trading, self-trade prevention and fee-driven order splitting in crypto?"
    ],
    "brainstorm": [
      "Pick one AFML ch. 2 claim and design the smallest experiment that could falsify it on your data. What result would change your default bar choice?",
      "If you could only add one microstructure feature to your existing equity research pipeline, which would it be (order-flow imbalance, VPIN, Kyle's lambda, Amihud) and what free data would let you prototype it?",
      "Compare a tokenizer-based foundation model against a simple model on dollar bars for one forecasting task. What evaluation protocol would convince a sceptical PM?",
      "List every column in your current research dataset and mark when its value became knowable. Which ones are you least sure about?",
      "Where does activity-based sampling interact with portfolio construction at daily frequency — is there a daily-rebalanced strategy that would benefit from event-driven signals?"
    ]
  }
}
);
