LAB.extend("fml-data-structures", {
  "questions": [
    {
      "id": "fml-ds-q1",
      "type": "derive",
      "difficulty": 3,
      "prompt": "<p>Treat the tick-imbalance-bar rule as a dynamical system. Let trade signs be i.i.d. with $\\mathbb{P}[b_t=1]=(1+\\delta)/2$, so the signed flow $\\theta_T=\\sum_{t\\le T} b_t$ has drift $\\delta$ and variance $1-\\delta^2$ per tick. Suppose the sign estimate is exact ($\\hat\\delta=\\delta$) and the current expected bar length is $E=\\mathbb{E}_0[T]$, so the bar closes at the first exit of $\\theta_T$ from $(-c,c)$ with $c=E|\\delta|$.</p>\n<ol>\n<li>Using a diffusion approximation, derive the expected length of the next bar and hence the update map $E \\mapsto g(E)$ that the EWMA of bar lengths tracks on average.</li>\n<li>Show that $g$ has no interior fixed point. Identify the regime in which bar length collapses quickly and the regime in which the map is nearly neutral. What does near-neutrality imply for bars-per-day over months?</li>\n<li>Now let flow become balanced while the estimate is stale, $|\\hat\\delta| \\gt |\\delta| \\approx 0$. Show that bar length can explode.</li>\n<li>Propose a modified close rule whose map has a <em>stable</em> interior fixed point ($|g'(E^*)| \\lt 1$), and say how you would verify it by simulation.</li>\n</ol>",
      "whyItMatters": "Information-driven bars are widely implemented with ad-hoc floors and caps. Knowing the update map tells you whether your bar boundaries reflect order-flow information or merely the history of your own EWMA.",
      "hints": [
        "Think of $\\theta_T$ as a random walk with drift and ask how long it takes to leave a symmetric strip whose half-width is proportional to $E$.",
        "For Brownian motion with drift $\\mu$ and variance $\\sigma^2$ started at 0, the two-sided exit time from $(-c,c)$ satisfies $\\mathbb{E}[\\tau]=\\frac{c}{\\mu}\\tanh\\!\\big(\\frac{\\mu c}{\\sigma^2}\\big)$ (optional stopping on the scale function). Substitute $\\mu=\\delta$, $\\sigma^2=1-\\delta^2$, $c=E\\delta$.",
        "$\\tanh x \\lt 1$ and $\\tanh x \\approx x$ for small $x$: compare $g(E)$ with $E$ below and above $E \\approx (1-\\delta^2)/\\delta^2$. For the stale case use the driftless exit time $c^2/\\sigma^2$ with $c=E|\\hat\\delta|$."
      ],
      "keyPoints": [
        "Exit-time result $\\mathbb{E}[\\tau]=\\frac{c}{\\delta}\\tanh\\!\\big(\\frac{\\delta c}{1-\\delta^2}\\big)$ gives $g(E)=E\\tanh\\!\\big(\\frac{\\delta^2 E}{1-\\delta^2}\\big)$ (a quick simulation with $\\delta=0.1$ matches: $E=50 \\to 23$, $E=1000 \\to 1000$).",
        "$g(E) \\lt E$ for all $E \\gt 0$: no interior fixed point; in the diffusive regime $E \\lesssim (1-\\delta^2)/\\delta^2$ the map is roughly quadratic, $g(E)\\approx \\delta^2E^2/(1-\\delta^2)$, so bars collapse toward the floor.",
        "For $E \\gg 1/\\delta^2$ the map is almost the identity, so first-passage noise makes $\\log E$ wander like a random walk; bars-per-day drifts without any change in the market.",
        "A stale estimate $|\\hat\\delta| \\gt |\\delta|$ puts the exit on the diffusive scale $(E\\hat\\delta)^2/(1-\\delta^2)$, which can be much larger than $E$: explosion. Floors and caps hide this rather than fix it.",
        "A sound rule has a stable fixed point, e.g. a threshold with a diffusive term $|\\theta_T| \\ge |\\hat\\delta|E + \\kappa\\sqrt{E(1-\\hat\\delta^2)}$, or an expected length fixed externally (from dollar volume) instead of fed back from past bar lengths; verify with simulated sign regimes and report the path of $E$."
      ],
      "followUps": [
        "Redo the analysis when $\\hat\\delta$ is a finite-span EWMA: how does estimator noise enter $g$, and what span makes it smaller than the drift term?",
        "For volume imbalance bars with heavy-tailed trade sizes (infinite variance), the diffusion approximation fails. What replaces the c-squared exit-time scaling, and does the collapse get faster or slower?"
      ],
      "source": {
        "label": "López de Prado (2018), Advances in Financial Machine Learning (Wiley), ch. 2 (information-driven bars); cf. exercise 2.2",
        "url": "",
        "relation": "motivated by"
      }
    },
    {
      "id": "fml-ds-q2",
      "type": "predict",
      "difficulty": 2,
      "prompt": "<p>Simulate a Roll (1984) market in trade time: the efficient price moves by $\\varepsilon_t \\sim \\mathcal{N}(0,\\sigma_e^2)$ per trade and each print is at $p_t = m_t + \\tfrac{s}{2}q_t$ with $q_t=\\pm1$ i.i.d. (quote side equals the trade sign). Take $s/\\sigma_e = 4$. <strong>Before running anything</strong>, write down predictions for:</p>\n<ol>\n<li>the lag-1 autocorrelation $\\rho_1(n)$ of tick-bar returns with $n$ trades per bar (closed form), and the smallest $n$ with $|\\rho_1| \\lt 0.05$;</li>\n<li>dollar bars with log-normal trade sizes and the same <em>average</em> number of trades per bar: is $\\rho_1$ different? Is excess kurtosis higher or lower, and does the answer depend on whether price impact per trade scales with trade size?</li>\n<li>AFML exercise 2.2 asks whether dollar bars or dollar-imbalance bars show more serial correlation. Add permanent impact, $m_t = m_{t-1} + \\lambda b_t + \\eta_t$, and close imbalance bars at a <em>fixed</em> threshold $|\\theta_T| \\ge c$. Predict the sign and relative size of $\\rho_1$ for the imbalance bars versus tick bars of equal mean length, and the shape of the return distribution.</li>\n</ol>\n<p>Then run the simulation (a few million trades suffices) and reconcile every prediction that failed.</p>",
      "whyItMatters": "Choosing a bar threshold is a bias–variance decision dominated by microstructure noise at small sizes. Being able to predict the bounce term analytically tells you which diagnostic differences between bar types are mechanical and which are informative.",
      "hints": [
        "A bar return is the sum of efficient increments plus $\\tfrac{s}{2}(q_{\\text{end},k}-q_{\\text{end},k-1})$; consecutive bars share exactly one endpoint quote.",
        "Write $\\operatorname{Cov}(r_k,r_{k-1})$ and $\\operatorname{Var}(r_k)$ for tick bars; for dollar bars, condition on the random trade count per bar and use the law of total variance.",
        "An imbalance bar with a fixed threshold must close on a trade whose sign equals the sign of $\\theta$. So the closing quote is not independent of the bar's direction once signs move the efficient price."
      ],
      "keyPoints": [
        "Tick bars: $\\rho_1(n) = -\\dfrac{s^2/4}{n\\sigma_e^2 + s^2/2}$; with $s/\\sigma_e=4$, $|\\rho_1| \\lt 0.05$ needs $n \\gt 72$ (simulation agrees within sampling error).",
        "Dollar bars at equal mean trade count have essentially the same $\\rho_1$ (it depends on $\\mathbb{E}[n]$); kurtosis effects are second order, $O(1/\\mathbb{E}[n])$: slightly higher than tick bars if impact is size-independent (random trade count adds variance mixing), slightly lower if impact scales with size.",
        "With uninformative signs ($\\lambda=0$) imbalance bars have the same $\\rho_1$ as tick bars of equal mean length, because the shared-endpoint covariance is still $-s^2/4$.",
        "With permanent impact the closing print sits on the side of the imbalance, so the bounce lines up with the bar's efficient move: $\\operatorname{Cov} \\approx -\\tfrac{s}{2}(\\lambda c + \\tfrac{s}{2})$, and $\\rho_1$ is more negative than for tick bars (e.g. about $-0.20$ vs $-0.12$ for $s=4$, $\\lambda=0.3$, $c=9$). Returns are lighter-tailed, closer to bimodal $\\pm\\lambda c$.",
        "Implication: a lower Jarque–Bera or different autocorrelation for imbalance bars can be a mechanical consequence of the close rule, not evidence of better information sampling."
      ],
      "followUps": [
        "Replace i.i.d. quote sides with the Binance aggressor flag and real trade sizes: does the Roll formula still predict the threshold at which bounce becomes negligible?",
        "Derive the Roll spread estimator from dollar-bar returns and compare it with the quoted spread. When does bar-based estimation bias the spread?"
      ],
      "source": {
        "label": "López de Prado (2018), Advances in Financial Machine Learning (Wiley), ch. 2, exercises 2.1(c) and 2.2 (adapted, with Roll 1984)",
        "url": "https://doi.org/10.1111/j.1540-6261.1984.tb03897.x",
        "relation": "adapted from"
      }
    },
    {
      "id": "fml-ds-q3",
      "type": "counterexample",
      "difficulty": 3,
      "prompt": "<p>The module argues that activity clocks remove much of the variance mixing that makes calendar returns fat-tailed. Construct an explicit, economically plausible data-generating process in which <strong>dollar bars produce higher excess kurtosis and stronger volatility clustering than time bars</strong> at the same average number of bars.</p>\n<ol>\n<li>Use a two-regime model: calm (calendar-time probability $1-\\pi$) and stressed ($\\pi$), with variance per unit calendar time $\\sigma_c^2,\\sigma_s^2$ and dollar-volume rates $V_c,V_s$. Derive the excess kurtosis of returns sampled by each clock as a function of these parameters (note that each clock samples the regimes with different frequencies).</li>\n<li>Give the parameter region in which dollar bars lose, and name two real mechanisms that put a market in it (think about volume that carries no information, and liquidity withdrawal that shrinks clips in stress).</li>\n<li>Relate your construction to the empirical finding that volatility clustering survives sampling in volume or transaction time.</li>\n</ol>",
      "whyItMatters": "A default bar choice should be backed by knowing when it fails. Crypto wash trading, index-rebalance prints and liquidity withdrawals are exactly the situations in which activity is a poor proxy for information.",
      "hints": [
        "In a clock with rate $\\kappa$ (units per calendar time), the return per bar has variance $\\sigma^2/\\kappa$ in each regime, and the fraction of bars drawn from a regime is proportional to calendar time times $\\kappa$.",
        "For a Gaussian scale mixture with per-bar variance $w$, kurtosis is $3\\,\\mathbb{E}[w^2]/\\mathbb{E}[w]^2$. Compute it with bar-weighted regime probabilities for $\\kappa \\equiv 1$ (time bars) and $\\kappa = V$ (dollar bars).",
        "Dollar bars win when $\\sigma^2/V$ is more homogeneous across regimes than $\\sigma^2$. They lose when $\\sigma_s^2/V_s$ is far from $\\sigma_c^2/V_c$ in either direction, e.g. $V_s/V_c \\lt 1$ while $\\sigma_s^2/\\sigma_c^2 \\gt 1$, or volume that explodes with no variance."
      ],
      "keyPoints": [
        "Correct mixture algebra: per-bar variance $w_j = \\sigma_j^2/\\kappa_j$ (up to scale) with bar-frequency weights $\\propto \\pi_j\\kappa_j$; excess kurtosis $=3\\big(\\mathbb{E}[w^2]/\\mathbb{E}[w]^2 - 1\\big)$ under those weights.",
        "Dollar bars lose when the dispersion of variance-per-dollar, $\\sigma^2/V$, exceeds the dispersion of variance-per-unit-time: volume that does not scale with information.",
        "Mechanisms: non-informational volume (crypto wash trading, index-rebalance and closing-auction prints, fee-driven splitting) makes some regimes dollar-heavy but variance-light; liquidity withdrawal in stress shrinks volume relative to variance.",
        "Link to evidence: Gillemot, Farmer and Lillo find clustering persists in volume and transaction time, and Jones, Kaul and Lipson find trade count rather than size carries the volatility relation: the activity proxy only captures part of information flow.",
        "Practical consequence: test the clock on your venue, by regime, and consider trade-count or hybrid clocks rather than assuming dollar bars dominate."
      ],
      "followUps": [
        "Extend the model to a continuum of regimes with log-normal variance and volume with correlation rho. For what rho do dollar bars and time bars tie?",
        "Design a diagnostic on Binance data that separates informational from non-informational volume (e.g. self-trade-like patterns, round sizes) and re-test the clock after filtering."
      ],
      "source": {
        "label": "Gillemot, Farmer & Lillo (2006), There's more to volatility than volume, Quantitative Finance 6(5)",
        "url": "https://doi.org/10.1080/14697680600835688",
        "relation": "motivated by"
      }
    },
    {
      "id": "fml-ds-q4",
      "type": "critique",
      "difficulty": 2,
      "prompt": "<p>AFML exercises 2.4–2.5 compare samples of dollar bars: (i) Bollinger-band crossings with a 5% band, (ii) a symmetric CUSUM filter on returns with $h=0.05$, and (iii) a CUSUM filter on <em>absolute</em> returns with $h=0.05$. They ask which sampled series is least heteroskedastic, judged by a rolling standard deviation. Critique this experimental design.</p>\n<ol>\n<li>Write out what the CUSUM recursion does when $y_t=|r_t|$ and $\\mathbb{E}_{t-1}[y_t]=0$, as typically implemented. Which side ever triggers, and what does an event then mean?</li>\n<li>Explain why a flatter rolling standard deviation of the sampled series is partly a mechanical consequence of the sampling rule in (iii), and to a lesser degree in (ii). Bound the magnitude of the return between consecutive events.</li>\n<li>With a fixed $h$ over a decade in which volatility varies fourfold, how does the event rate behave, and why does that contaminate the comparison?</li>\n<li>Design a non-circular test of whether a sampling scheme produces better-behaved observations <em>for the downstream model</em>.</li>\n</ol>",
      "whyItMatters": "Event filters choose the rows a classifier sees. If the diagnostic used to pick a filter is circular, the choice is arbitrary, and the \"better\" sample may be one in which the labels are mechanically easier.",
      "hints": [
        "With $y_t=|r_t| \\ge 0$ and zero expectation, $S^-_t=\\min(0, S^-_{t-1}+|r_t|)$ stays at 0 forever.",
        "$S^+$ is then cumulative absolute return since the last event, so an event fires each time realised absolute variation crosses $h$: this is a bar rule, not a test.",
        "Measure what the label will see: returns over a fixed forward horizon after each event, at matched event counts, out of sample."
      ],
      "keyPoints": [
        "With $y=|r|$ and $\\mathbb{E}_{t-1}[y]=0$ the downside branch is inert and the filter becomes an \"absolute-variation bar\": events fire whenever $\\sum |r|$ since the last event exceeds $h$.",
        "Between such events $|r_{\\text{event-to-event}}| \\le \\sum|r| \\lt h + |r_{\\text{last}}|$, so sampled returns are nearly homoskedastic by construction; the diagnostic largely measures the rule, not the market.",
        "Signed-return CUSUM with constant $h$ fires more often in high-volatility regimes (and the cumulative move is about $h$ by construction too), so a volatility-scaled $h_t=c\\hat\\sigma_{t-1}$ is needed for regime-comparable event rates.",
        "Bollinger counts depend on band width relative to volatility and re-fire when price hovers near the band; any comparison must hold the number of events fixed.",
        "A fair test evaluates forward-horizon returns or label/feature quality at events, at matched sample sizes and out of sample, e.g. calibration of a simple volatility forecast or downstream classifier log-loss."
      ],
      "followUps": [
        "Is there a version of CUSUM on absolute returns, with a causal estimate of the expected absolute return, that is a genuine volatility-break detector? How does it relate to the structural-break tests of AFML ch. 17?",
        "Derive the expected calendar waiting time between absolute-variation events in a stochastic-volatility model and compare it with the dollar-bar clock."
      ],
      "source": {
        "label": "López de Prado (2018), Advances in Financial Machine Learning (Wiley), ch. 2, exercises 2.4–2.5 (adapted)",
        "url": "",
        "relation": "adapted from"
      }
    },
    {
      "id": "fml-ds-q5",
      "type": "debate",
      "difficulty": 3,
      "prompt": "<p>VPIN measures order-flow imbalance on equal-volume buckets, with buy and sell volume inferred by bulk volume classification (BVC): bucket buy volume $\\hat V^B = V\\,\\Phi(\\Delta P/\\hat\\sigma_{\\Delta P})$. Its authors argued it signalled rising flow toxicity before the 6 May 2010 flash crash. A critique argued its predictive content is mostly mechanical. Take a position.</p>\n<ol>\n<li>Show from the BVC formula that bucket imbalance $|\\hat V^B - \\hat V^S|/V$ is a monotone function of the bucket's absolute standardised price change. What does that imply about the relation between VPIN, realised volatility and trading intensity in calendar time?</li>\n<li>Explain why conclusions can flip with the trade-classification method, and what a venue with a true aggressor flag (e.g. Binance) lets you test that the original studies could not.</li>\n<li>Design an out-of-sample test of VPIN's <em>incremental</em> predictive power for short-horizon volatility over realised volatility and volume, including how you handle overlapping volume buckets and the calendar-time alignment.</li>\n<li>State where you land and what result would change your mind.</li>\n</ol>",
      "whyItMatters": "VPIN is the most prominent application of the volume clock and of bulk classification. The dispute is a template for checking whether a volume-time indicator adds information beyond the activity that defines the clock.",
      "hints": [
        "$|2\\Phi(x)-1|$ is increasing in $|x|$, so with BVC, imbalance is a transform of absolute return in the bucket.",
        "In calendar time, more buckets complete per hour when volume is high, and high volume co-moves with volatility: control for both before crediting VPIN.",
        "Compare BVC, tick-rule and true-aggressor imbalances on the same buckets; then run predictive regressions with HAC errors on non-overlapping calendar windows."
      ],
      "keyPoints": [
        "BVC implies $|\\hat V^B-\\hat V^S|/V = |2\\Phi(\\Delta P/\\hat\\sigma)-1|$: per-bucket imbalance is a smoothed absolute-return measure, so VPIN co-moves with volatility partly by construction.",
        "The appropriate benchmark is incremental power over lagged realised volatility and trading intensity, measured out of sample; raw correlation with future volatility is not evidence of toxicity.",
        "Classification matters: imbalance from BVC, the tick rule and true aggressor flags can differ systematically, and the critics found VPIN properties depend on it; an aggressor-flag venue allows direct measurement of classification error.",
        "Data provenance and timing (real-time feed versus exchange history, bucket size, sample window) were part of the dispute; a credible replication fixes them in advance.",
        "A defensible position separates \"VPIN is a useful activity-and-volatility summary in volume time\" from \"VPIN measures informed trading\", and states a falsifiable test."
      ],
      "followUps": [
        "On Binance BTCUSDT, compute VPIN with BVC and with the true aggressor flag. Does the difference between them predict anything?",
        "How would you adjust VPIN so that its null distribution under uninformed flow is invariant to volatility?"
      ],
      "source": {
        "label": "Andersen & Bondarenko (2014), VPIN and the Flash Crash, Journal of Financial Markets 17",
        "url": "https://doi.org/10.1016/j.finmar.2013.05.005",
        "relation": "motivated by"
      },
      "sides": [
        {
          "position": "VPIN, computed in volume time with bulk classification, captures flow toxicity and signalled toxicity-induced volatility ahead of the flash crash; the critique tested a methodology the authors do not advocate.",
          "refs": [
            {
              "label": "Easley, López de Prado & O'Hara (2012) — Flow Toxicity and Liquidity in a High-frequency World, RFS 25(5)",
              "url": "https://doi.org/10.1093/rfs/hhs053"
            },
            {
              "label": "Easley, López de Prado & O'Hara (2011) — The Microstructure of the 'Flash Crash', Journal of Portfolio Management 37(2)",
              "url": "https://doi.org/10.3905/jpm.2011.37.2.118"
            },
            {
              "label": "Easley, López de Prado & O'Hara (2014) — VPIN and the Flash Crash: A Rejoinder, JFM 17",
              "url": "https://doi.org/10.1016/j.finmar.2013.06.007"
            }
          ]
        },
        {
          "position": "VPIN is a poor predictor of short-run volatility once trading intensity is controlled, did not peak before the crash, and its behaviour depends strongly on trade classification.",
          "refs": [
            {
              "label": "Andersen & Bondarenko (2014) — VPIN and the Flash Crash, JFM 17",
              "url": "https://doi.org/10.1016/j.finmar.2013.05.005"
            },
            {
              "label": "Andersen & Bondarenko (2014) — Reflecting on the VPIN Dispute, JFM 17",
              "url": "https://doi.org/10.1016/j.finmar.2013.08.002"
            }
          ]
        },
        {
          "position": "Whether bulk classification is accurate enough is an empirical, venue-specific question that must be settled against trade-level ground truth.",
          "refs": [
            {
              "label": "Easley, López de Prado & O'Hara (2016) — Discerning Information from Trade Data, JFE 120(2)",
              "url": "https://doi.org/10.1016/j.jfineco.2016.01.018"
            },
            {
              "label": "Chakrabarty, Pascual & Shkilko (2015) — Evaluating Trade Classification Algorithms: Bulk Volume Classification versus the Tick Rule and the Lee-Ready Algorithm, JFM 25",
              "url": "https://doi.org/10.1016/j.finmar.2015.06.001"
            }
          ]
        }
      ]
    },
    {
      "id": "fml-ds-q6",
      "type": "connect",
      "difficulty": 3,
      "prompt": "<p>Bars are a tokenizer for the market. LLM tokenizers aim for tokens of roughly comparable information content, and financial foundation models such as Kronos discretise candlesticks into tokens. Develop the analogy rigorously.</p>\n<ol>\n<li>Define an <em>equal-surprisal bar</em>: close when the cumulative surprisal $\\sum_t -\\log_2 \\hat p(b_t \\mid \\mathcal{F}_{t-1})$ of trade signs under a causal predictive model exceeds a budget of $B$ bits. Show that under an i.i.d. sign model it reduces to tick bars, and relate the number of bars to the ideal code length of the sign sequence (arithmetic coding).</li>\n<li>Explain why per-token loss (perplexity) is <em>not</em> comparable across clocks, and propose the analogue of NLP's bits-per-byte normalisation for comparing models trained on different bar types.</li>\n<li>Identify two leakage channels specific to learned clocks (hint: where is $\\hat p$ fitted, and what does a fixed context window of $K$ tokens cover in calendar time?).</li>\n<li>Specify an evaluation protocol that could convince a sceptic that a learned clock beats dollar bars for one forecasting task.</li>\n</ol>",
      "whyItMatters": "Tokenization is the learned analogue of bar construction. The same evaluation traps (incomparable per-token losses, leakage through the tokenizer) decide whether claims for market foundation models hold up.",
      "hints": [
        "With i.i.d. signs the surprisal per tick is the constant $h(p)$ bits, so the bar closes every $\\lceil B/h(p)\\rceil$ ticks.",
        "Different clocks predict different targets over different calendar spans; normalise the loss to a common unit (per hour, per unit of notional, or per trade) before comparing.",
        "A tokenizer or sign model fitted on the full sample places bar boundaries using future statistics; a K-token context covers more calendar time in quiet markets than in busy ones."
      ],
      "keyPoints": [
        "Equal-surprisal bars generalise imbalance bars: boundaries follow information as defined by a model; under an i.i.d. sign model surprisal is constant and the clock reduces to tick bars; total bars $\\approx$ code length$/B$.",
        "Per-token loss is not comparable across tokenizations; normalise by a clock-independent unit (bits per trade, per unit of notional or per hour), the analogue of bits-per-byte.",
        "Leakage channels: a sign/tokenizer model fitted on the full sample (boundaries depend on future data), and features such as position-in-context that implicitly encode future activity; both require walk-forward fitting.",
        "A fixed context of K tokens covers a variable calendar span; calendar-time features or time-aware positional encodings are needed, and evaluation must be aligned in calendar time.",
        "Protocol: fixed forecasting target in calendar time, walk-forward refitting of clock and model, matched compute and token budgets, a dollar-bar baseline, and a count of all clock variants tried."
      ],
      "followUps": [
        "Could a byte-pair-encoding style merge procedure on discretised (sign, size bucket) trades learn a useful vocabulary of order-flow patterns? How would you test that the merges are not memorising one regime?",
        "What is the information-theoretic content of the Binance aggressor flag relative to the tick rule, in bits per trade?"
      ],
      "source": {
        "label": "Shi et al. (2025), Kronos: A Foundation Model for the Language of Financial Markets, arXiv:2508.02739",
        "url": "https://arxiv.org/abs/2508.02739",
        "relation": "motivated by"
      }
    },
    {
      "id": "fml-ds-q7",
      "type": "design",
      "difficulty": 3,
      "prompt": "<p>You run a daily-rebalanced US equity model over about 3,000 names and trade market-on-close. You want intraday activity-based features (dollar-bar realised variance, imbalance, bar counts) from consolidated trades, frozen at a 15:45 decision cutoff. Design the bar specification and data pipeline under these constraints:</p>\n<ul>\n<li>average daily dollar volume spans about four orders of magnitude across names;</li>\n<li>opening and closing auctions print as single large trades, and halts and odd-lot or late reports exist;</li>\n<li>splits, ticker changes and delistings occur throughout the sample, and the universe must be point-in-time;</li>\n<li>bars are asynchronous across names, but the model consumes one cross-sectional snapshot per day;</li>\n<li>a fixed storage and compute budget.</li>\n</ul>\n<p>Specify: the threshold rule and how it is updated; auction and halt handling; the minimum-bars rule for illiquid names; how asynchronous bars are aligned to the cutoff without look-ahead (including the partially built bar); the tests that prove point-in-time correctness; and the evidence that would make you abandon dollar bars for 5-minute time bars in this application.</p>",
      "whyItMatters": "Most published evidence for activity bars comes from single liquid futures or crypto pairs. A cross-section with auctions, halts and four orders of magnitude of liquidity is where design choices, not the bar concept, determine whether features help.",
      "hints": [
        "Start from $D_{j,t}=\\overline{\\mathrm{ADV}}_{j,t-1}/k$ with a trailing window, and decide what happens when a name has fewer than a handful of bars by the cutoff.",
        "Auctions are a different price-formation mechanism: keep them out of the continuous-session clock and model them as separate features.",
        "For alignment, use only bars completed strictly before the cutoff, and record the partial bar as a separate, explicitly labelled feature; test by truncating the trade tape at the cutoff."
      ],
      "keyPoints": [
        "Per-name dollar threshold from trailing ADV (for example $k$ = 50), refreshed on a schedule with past data only and clipped so tiny names still get a minimum number of bars or fall back to time bars with a flag.",
        "Auctions, halts and late or odd-lot prints are excluded from the continuous clock and represented separately; corporate actions are irrelevant to notional but matter for share-based fields.",
        "Cross-sectional snapshot uses the last completed bar before the cutoff, with the partial bar as an explicit feature; staleness (time since last bar) is itself a feature.",
        "Point-in-time tests: truncation at the cutoff leaves features unchanged; the universe includes delisted names; identifiers are permanent IDs, not tickers.",
        "Abandon criterion stated in advance: if dollar-bar features add no out-of-sample IC or net performance over equivalent time-bar features after counting variants, choose the simpler clock."
      ],
      "followUps": [
        "How would you handle names whose closing-auction share of volume is large and rising? Should the threshold be set on continuous-session ADV only?",
        "Propose a cross-sectionally comparable intraday volatility feature that is robust to differences in bar counts across names."
      ],
      "source": {
        "label": "Original design question building on AFML ch. 2 and this module's open question on cross-sectional clocks",
        "url": "",
        "relation": "original"
      }
    },
    {
      "id": "fml-ds-q8",
      "type": "derive",
      "difficulty": 2,
      "prompt": "<p>An equal-weighted, monthly-rebalanced decile long–short backtest is built from a data source in which performance-related delisting returns are missing; delisted names simply disappear and the leg is re-weighted over survivors.</p>\n<ol>\n<li>Let leg $j$ have monthly performance-delisting hazard $h_j$, survivor mean return $\\mu_j$ and mean delisting return $-D$. Derive the bias in the observed leg mean return, and then in the long–short spread $L-S$.</li>\n<li>For momentum (short past losers) and for a strategy that is long distressed, cheap or recent-loser stocks, sign the bias in the spread. Which published anomalies are most exposed?</li>\n<li>Plug in $D=0.55$ (a correction used for missing performance-related Nasdaq delisting returns) and $h=0.5\\%$ per month in the distressed leg. What is the annualised bias?</li>\n<li>Contrast this with (a) replacing missing delisting returns by 0, and (b) a universe built from <em>currently listed</em> tickers only (survivorship). Which bias is larger, and why can no amount of careful bar construction fix (b)?</li>\n</ol>",
      "whyItMatters": "Point-in-time hygiene is a property of every column. A delisting-return gap biases different strategies in opposite directions, so it can flip the ranking of signals, not just shift their level.",
      "hints": [
        "True leg return $=(1-h)\\mu + h(-D)$; observed $=\\mu$.",
        "The spread bias is $h_L(\\mu_L + D) - h_S(\\mu_S + D)$: whichever leg holds the distressed names gets an upward bias in its own mean return.",
        "$0.005 \\times 0.55 \\approx 0.28\\%$ per month. For survivorship, condition the whole return path on survival to the end of the sample."
      ],
      "keyPoints": [
        "Leg bias $\\approx h_j(\\mu_j + D) \\approx h_j D$; spread bias $\\approx h_L D - h_S D$ (to first order).",
        "Momentum shorts high-hazard losers, so omission inflates the short leg and understates momentum; strategies long distressed or small, cheap stocks are overstated.",
        "With $D=0.55$ and $h=0.5\\%$: about $0.28\\%$ per month, roughly $3.3\\%$ per year, which is comparable to many anomaly premia.",
        "Setting missing returns to 0 still overstates (true delisting returns are strongly negative); a survivors-only universe is worse because it conditions entire histories on survival, and no bar construction can recover names that are absent from the data.",
        "Remedy: point-in-time universe with delisting returns (or documented imputation), and a sensitivity analysis over D."
      ],
      "followUps": [
        "How does the bias change for a value-weighted portfolio, and for a portfolio rebalanced daily?",
        "For a crypto universe, what plays the role of delisting (exchange delistings, rug pulls, migrations), and how would you build a survivorship-free universe from public data?"
      ],
      "source": {
        "label": "Shumway (1997), The Delisting Bias in CRSP Data, Journal of Finance 52(1); Shumway & Warther (1999) for the Nasdaq correction",
        "url": "https://doi.org/10.1111/j.1540-6261.1997.tb03818.x",
        "relation": "motivated by"
      }
    }
  ],
  "projects": [
    {
      "id": "fml-data-structures-r1",
      "title": "Replication: does the transaction clock restore normality? (Murphy & Izzeldin critique of Ané & Geman, plus BTCUSDT)",
      "level": "replication",
      "hours": "14–22",
      "paper": {
        "label": "Murphy & Izzeldin (2006, working paper) — Order Flow, Transaction Clock and Normality of Asset Returns: A Comment on Ané and Geman (2000)",
        "url": "https://ideas.repec.org/p/wpa/wuwpfi/0512005.html"
      },
      "goal": "Reproduce the Monte Carlo evidence (Table 1) that Ané and Geman's univariate moment-recovery procedure cannot identify the higher moments of the latent time change, then take the transaction-clock hypothesis to public crypto data: recover the moments of the time change and test whether returns conditioned on re-centred trade counts or volume are close to Gaussian.",
      "data": "Part A needs no data (pure simulation). Part B uses Binance public data (data.binance.vision): BTCUSDT spot trades aggregated to 5-, 10- and 15-minute intervals (return, number of trades, base and quote volume), at least six months. Check headers and millisecond vs microsecond timestamps. Use only public or personal data; never employer data or infrastructure.",
      "steps": [
        "Read Section 2 of the comment and Appendix A of Ané and Geman (2000) to pin down the moment conditions: the 2nd, 4th and 6th central moments of a normal variance–mean mixture and the approximate MGF conditions with theta = -0.7 and 0.6.",
        "Simulate the normal–lognormal DGP of Table 1: return mean 0, conditional variance scale 0.1, time change lognormal with mean 1 and variance 0.5 (true third and fourth central moments 0.875 and 3.890); T in {500, 1000, 2500, 5000, 10000}; 1,000 converged replications.",
        "Estimate the time-change moments by GMM (e.g. scipy.optimize with an optimal weighting matrix); record average estimates, average standard errors, the Monte Carlo standard deviation and the over-identification test size at 10/5/1%.",
        "Repeat with the bivariate procedure (returns plus an activity variable linear in the time change, as in their eq. 4) and confirm that higher moments become identifiable.",
        "Part B: on BTCUSDT intervals, estimate time-change moments with the univariate and bivariate procedures (trade count and volume as activity), compare them with the empirical moments of re-centred trade counts and volume, and compute Jarque–Bera statistics for raw returns and for returns divided by the square root of re-centred trade count or volume.",
        "Repeat Part B by volatility regime (e.g. terciles of trailing daily realised volatility) and on 1-trade-per-row tick bars to connect with the bar-zoo project."
      ],
      "deliverables": [
        "Simulation code and a reproduction of Table 1 in the same layout, side by side with the published numbers",
        "Bivariate-identification table",
        "BTCUSDT tables: recovered vs empirical time-change moments and JB statistics for raw and conditioned returns at three interval lengths",
        "Discrepancy write-up (1–2 pages): every cell that differs from the paper by more than the stated tolerance, with the likely cause (optimiser, weighting matrix, convergence filter, moment scaling) and what the difference implies for the conclusion"
      ],
      "acceptance": [
        "Table 1 reproduction: at T = 10,000 the average estimate of the second moment is within ±0.02 of 0.500 and the average estimate of the third moment is within ±0.10 of the true 0.875 (paper: 0.500 and 0.898).",
        "At T = 10,000 the average standard error of the third-moment estimate is within a factor of 2 of the published 0.495, and the fourth-moment estimate is visibly unidentified (average standard error above 100 at every T; paper: 1,387.8 at T = 10,000).",
        "Over-identification test rejection rates at the 5% level fall between 3% and 8% for every T (paper: 5–6%), showing the test does not flag the failure.",
        "Bivariate procedure recovers the third moment at T = 10,000 with average standard error at least 3 times smaller than the univariate one, or the write-up explains why not.",
        "BTCUSDT: JB statistics reported for raw and conditioned returns at 3 interval lengths, with a one-sentence verdict per interval on whether conditioning on trade count restores normality.",
        "Discrepancy write-up is present and quantifies every deviation outside the tolerances above."
      ],
      "extensions": [
        "Repeat Part A for the normal–gamma and normal–inverse-Gaussian DGPs (their Tables 2–3).",
        "Replace trade count by notional (dollar clock) and by the number of aggressor-side runs; which activity measure best matches the recovered time-change moments?",
        "Compare with Gillemot, Farmer and Lillo (2006): does volatility clustering survive sampling in trade-count time on BTCUSDT?"
      ]
    }
  ]
});
