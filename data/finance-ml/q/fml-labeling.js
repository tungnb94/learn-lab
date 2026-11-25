LAB.extend("fml-labeling", {
  "questions": [
    {
      "id": "fml-lab-q1",
      "type": "derive",
      "difficulty": 3,
      "prompt": "<p>How much information about the drift does a label carry? Let log price be Brownian motion with drift $\\mu$ and volatility $\\sigma$ (time in days), and consider local inference around $\\mu=0$. Compare:</p>\n<ul>\n<li>(A) the fixed-horizon sign label $\\operatorname{sign}(X_h)$;</li>\n<li>(B) the symmetric two-barrier label: which of $\\pm a$ is hit first, with no vertical barrier;</li>\n<li>(C) observing the full path for the same expected duration.</li>\n</ul>\n<ol>\n<li>Derive $\\mathbb{P}[\\text{upper first}]$ to first order in $\\mu$ and the expected exit time at $\\mu=0$.</li>\n<li>Compute the Fisher information about $\\mu$ per label and <em>per unit of expected holding time</em> for (A), (B) and (C). Which label is efficient, and how much does the sign label waste?</li>\n<li>Interpret the result through Wald's sequential probability ratio test.</li>\n<li>What changes when a vertical barrier is added, and when AFML exercise 3.3's convention (label 0 when the vertical barrier is hit first) is used? What changes once events overlap in time?</li>\n</ol>",
      "whyItMatters": "Labels are lossy summaries of paths. Knowing which summaries keep the information about drift tells you when the triple-barrier label is a genuine improvement over the fixed horizon and when its conventions throw information away.",
      "hints": [
        "For a Bernoulli label with success probability $P(\\mu)$, the Fisher information is $P'(\\mu)^2/\\big(P(1-P)\\big)$; divide by expected duration to compare labels with different holding times.",
        "Use the scale function $s(x)=e^{-2\\mu x/\\sigma^2}$ for the exit side, and $\\mathbb{E}[\\tau]=a^2/\\sigma^2$ for the driftless two-sided exit. For (A), $P=\\Phi(\\mu\\sqrt{h}/\\sigma)$.",
        "At $\\mu=0$: (A) $P'=\\varphi(0)\\sqrt{h}/\\sigma$, so information per day $=2/(\\pi\\sigma^2)$; (B) $P'=a/(2\\sigma^2)$, so information per day $=(a^2/\\sigma^4)/(a^2/\\sigma^2)$. For (C), a path of length $T$ carries $T/\\sigma^2$."
      ],
      "keyPoints": [
        "$\\mathbb{P}[\\text{upper}] \\approx \\tfrac12 + \\tfrac{\\mu a}{2\\sigma^2}$ and $\\mathbb{E}[\\tau]=a^2/\\sigma^2$ at $\\mu=0$ (a simulation with $a=\\sigma=1$, $\\mu=0.2$ gives about 0.60).",
        "Information per unit time: sign label $2/(\\pi\\sigma^2) \\approx 0.64/\\sigma^2$; barrier label $1/\\sigma^2$, the same as observing the full path. The exit side is locally sufficient for the drift and the fixed-horizon sign wastes about 36%.",
        "SPRT view: the exit side is the outcome of a sequential test; the optimal SPRT boundaries for $\\mu=0$ vs $\\mu=\\mu_1$ are lines with slope $\\mu_1/2$ in $(t,X)$, which become horizontal only as $\\mu_1 \\to 0$.",
        "A vertical barrier truncates the test; the vertical class still carries information through its signed return, which the 0-label convention discards.",
        "These rates count path length, not labels: overlapping events re-use the same path segments, so effective sample size is total non-overlapping time, which is what uniqueness weights correct for."
      ],
      "followUps": [
        "If barriers are set with an estimated $\\hat\\sigma_{t_0}$ that is wrong by a factor $\\kappa$, how does the efficiency of label (B) change?",
        "Derive the information in the pair (exit side, exit time). Is the exit time informative about the drift at first order?"
      ],
      "source": {
        "label": "Wald (1945), Sequential Tests of Statistical Hypotheses, Ann. Math. Statist. 16(2), applied to the triple-barrier method of López de Prado (2018), Advances in Financial Machine Learning (Wiley), ch. 3 (cf. exercise 3.3)",
        "url": "https://doi.org/10.1214/aoms/1177731118",
        "relation": "motivated by"
      }
    },
    {
      "id": "fml-lab-q2",
      "type": "predict",
      "difficulty": 2,
      "prompt": "<p>You label with close-only bars. Take driftless log price, horizontal barriers at $\\pm 1\\cdot\\sigma\\sqrt{h}$ (one standard deviation of the move over the vertical horizon) and a vertical barrier at $h$. Under continuous monitoring, the share of vertical-barrier exits is $\\mathbb{P}[\\sup_{s\\le 1}|W_s| \\lt 1] \\approx 37.1\\%$.</p>\n<ol>\n<li><strong>Predict</strong> the vertical-exit share when touches are checked only at $m=78$, $13$ and $5$ equally spaced closes within the horizon, using the Broadie–Glasserman–Kou continuity correction (a discretely monitored barrier behaves like a continuous one shifted outward by $\\beta\\sigma\\sqrt{h/m}$, with $\\beta \\approx 0.5826$). Use the series $\\mathbb{P}[\\sup_{s\\le 1}|W_s| \\lt a]=\\frac{4}{\\pi}\\sum_{j\\ge0}\\frac{(-1)^j}{2j+1}e^{-(2j+1)^2\\pi^2/(8a^2)}$.</li>\n<li>Simulate 20,000 paths on a fine grid and check your predictions. Where does the correction break down?</li>\n<li>With dollar bars, the number of bars per vertical horizon varies with activity. Predict how the label class balance then varies across calm and busy regimes, even with perfectly volatility-scaled barriers.</li>\n<li>Using bar highs and lows removes most of the bias. What ambiguity remains, and how would you resolve it?</li>\n</ol>",
      "whyItMatters": "Close-only touch detection silently inflates the vertical (or 0) class, and with activity clocks the inflation becomes regime-dependent. That creates a spurious relation between labels and activity that a classifier will happily learn.",
      "hints": [
        "The effective barrier is $a_{\\text{eff}} = 1 + 0.5826/\\sqrt{m}$ in units of $\\sigma\\sqrt{h}$.",
        "For $m=13$, $a_{\\text{eff}} \\approx 1.16$; evaluate the series with a few terms.",
        "Fewer bars per horizon in quiet periods means coarser monitoring, so more vertical exits exactly when activity is low."
      ],
      "keyPoints": [
        "Predictions from the correction: about 43% ($m=78$), 51% ($m=13$) and 59% ($m=5$), versus 37% continuous.",
        "Simulation gives roughly 43%, 50% and 56%: the correction is accurate for moderate m and overshoots slightly at very coarse monitoring (it is an asymptotic result in m).",
        "With dollar bars, quiet regimes have fewer bars per horizon and therefore more vertical exits: labels become correlated with activity even when barriers scale with volatility.",
        "Highs and lows detect touches but not the order: when a bar spans both barriers, which came first is unknown; resolve with finer data, a conservative convention (stop-loss first), or drop and report such events.",
        "Report the share of each barrier type by regime and by bar density as a routine diagnostic."
      ],
      "followUps": [
        "Derive the analogous correction for an asymmetric barrier pair and for a barrier on a drifted process. Is the shift still the same constant?",
        "Use the correction in reverse: given close-only labels, can you estimate what the continuous-monitoring class balance would have been?"
      ],
      "source": {
        "label": "Broadie, Glasserman & Kou (1997), A Continuity Correction for Discrete Barrier Options, Mathematical Finance 7(4); applied to AFML ch. 3 touch detection",
        "url": "https://doi.org/10.1111/1467-9965.00035",
        "relation": "motivated by"
      }
    },
    {
      "id": "fml-lab-q3",
      "type": "debate",
      "difficulty": 3,
      "prompt": "<p>The lower horizontal barrier is a stop-loss. AFML exercise 3.4 meta-labels a trend rule with $[u,\\ell]=[1,2]$; exercise 3.5 labels a Bollinger mean-reversion rule with $[0,2]$ (no profit-take). A colleague says stop barriers are \"free risk management\" and should always be in the labels. Engage with the published debate on stop-loss rules.</p>\n<ol>\n<li>State the random-walk result for 0/1 stop-loss rules that switch into a safer asset, and derive why: express the change in expected return in terms of the probability of being stopped out and the risk premium.</li>\n<li>Under which return dynamics can stops add value, and what does the evidence for individual stocks look like once transaction costs are included?</li>\n<li>Explain how a large improvement from stop-losses on momentum portfolios can coexist with (1).</li>\n<li>For labeling specifically: show how a stop barrier with $\\ell \\lt u$ or $u=0$ can make the meta-label partly a <em>volatility</em> label, and propose a diagnostic.</li>\n<li>Take a position and state a falsifiable test on your own data.</li>\n</ol>",
      "whyItMatters": "Barrier labels are not neutral targets; they encode a trading policy. Whether that policy adds value is a contested empirical question, and the answer changes what your classifier learns.",
      "hints": [
        "With i.i.d. returns, being out of the market in a given period is independent of that period's return, so $\\Delta\\mu = -p_{\\text{out}}(\\mu - r_f)$.",
        "Value can come only from dependence: momentum or regime persistence that makes post-stop returns lower than average, or flight-to-quality returns on the safe asset.",
        "Regress the meta-label on ex-ante volatility and on $\\ell\\hat\\sigma$: a strong relation means the label partly encodes whether a path was volatile enough to hit the stop."
      ],
      "keyPoints": [
        "Random walk: a 0/1 stop into a lower-yield asset can only reduce expected return, $\\Delta\\mu=-p_{\\text{out}}(\\mu-r_f)$; volatility also falls, so judge on the risk–return trade-off.",
        "Stops can add value under momentum or regime switching; Kaminski and Lo report 50–100 bp per month during stopped-out periods for US equities switching to bonds (1950–2004), while Lo and Remorov find tight stops underperform for individual stocks after costs unless serial correlation is high.",
        "The momentum stop-loss improvement is gross of costs and specific to a crash-prone long–short portfolio; it is evidence about momentum crash dynamics, not a general licence.",
        "With $\\ell \\lt u$ or $u=0$, the label partly measures whether the path was volatile enough to hit the stop; check with regressions on ex-ante volatility and with an i.i.d.-shuffle placebo.",
        "A falsifiable test compares label schemes by out-of-sample, net-of-cost P&L of the same policy and requires that the stop adds nothing under shuffled returns."
      ],
      "followUps": [
        "Bailey and López de Prado relate stop-out limits to Sharpe ratio and serial correlation. Translate their rule into a lower-barrier width for a meta-labeled strategy.",
        "How do overnight gaps (prices jumping through the stop) change the effective stop and the label distribution for daily equity data?"
      ],
      "source": {
        "label": "López de Prado (2018), Advances in Financial Machine Learning (Wiley), ch. 3, exercises 3.4–3.5 (barrier choices), set against the stop-loss literature",
        "url": "",
        "relation": "motivated by"
      },
      "sides": [
        {
          "position": "Stop-losses subtract expected return under random walks and usually fail to add value after transaction costs for individual stocks.",
          "refs": [
            {
              "label": "Kaminski & Lo (2014) — When Do Stop-Loss Rules Stop Losses?, Journal of Financial Markets 18",
              "url": "https://doi.org/10.1016/j.finmar.2013.07.001"
            },
            {
              "label": "Lo & Remorov (2017) — Stop-Loss Strategies with Serial Correlation, Regime Switching, and Transaction Costs, Journal of Financial Markets 34",
              "url": "https://doi.org/10.1016/j.finmar.2017.02.003"
            }
          ]
        },
        {
          "position": "Stop-losses add value when returns have momentum, regime persistence or crash risk, and can sharply cut drawdowns of momentum portfolios.",
          "refs": [
            {
              "label": "Kaminski & Lo (2014) — When Do Stop-Loss Rules Stop Losses? (empirical and regime-switching results)",
              "url": "https://doi.org/10.1016/j.finmar.2013.07.001"
            },
            {
              "label": "Han, Zhou & Zhu (2016) — Taming Momentum Crashes: A Simple Stop-Loss Strategy, SSRN 2407199",
              "url": "https://doi.org/10.2139/ssrn.2407199"
            },
            {
              "label": "Arratia & Dorador (2019) — On the Efficacy of Stop-Loss Rules in the Presence of Overnight Gaps, Quantitative Finance 19(11)",
              "url": "https://doi.org/10.1080/14697688.2019.1605188"
            }
          ]
        },
        {
          "position": "Stop-outs are best viewed as risk governance, calibrated to a strategy's Sharpe ratio and serial correlation rather than as a source of alpha.",
          "refs": [
            {
              "label": "Bailey & López de Prado (2015) — Stop-Outs under Serial Correlation and the Triple Penance Rule, Journal of Risk 18(2)",
              "url": "https://doi.org/10.21314/jor.2015.317"
            }
          ]
        }
      ]
    },
    {
      "id": "fml-lab-q4",
      "type": "critique",
      "difficulty": 3,
      "prompt": "<p>A research deck makes this claim: \"Our moving-average primary model has 52% precision on 1,000 bets per year. A meta-labeling random forest lifts precision to 58% while keeping 250 bets, so by $\\theta=\\frac{2p-1}{2\\sqrt{p(1-p)}}\\sqrt{n}$ the Sharpe ratio doubles, from 1.27 to 2.56.\" Labels come from side-aware triple barriers with $[u,\\ell]=[1,2]$ and a one-day vertical barrier (as in AFML exercise 3.4). Secondary features include \"the primary model's hit rate over its last 20 signals\". Write the referee report.</p>\n<ol>\n<li>Derive the Sharpe ratio for binary payoffs $+u\\sigma$ and $-\\ell\\sigma$ as a function of precision and frequency, the break-even precision, and recompute both Sharpe ratios.</li>\n<li>What do vertical-barrier exits do to the binary-payoff assumption and to the meaning of \"precision\"?</li>\n<li>Identify the leakage in the hit-rate feature and fix it.</li>\n<li>What does the $\\sqrt{n}$ scaling assume, and how do overlapping holding periods change it?</li>\n<li>Specify the evaluation that would make the claim credible.</li>\n</ol>",
      "whyItMatters": "Meta-labeling decks almost always quote the symmetric-payoff formula. With asymmetric barriers the break-even precision moves a long way, and the most natural secondary feature leaks the label.",
      "hints": [
        "Mean per bet $\\sigma(pu-(1-p)\\ell)$; standard deviation $\\sigma(u+\\ell)\\sqrt{p(1-p)}$.",
        "Break-even precision $p^*=\\ell/(u+\\ell)$. For $[1,2]$ that is $2/3$.",
        "A signal fired at $t_0$ can only use outcomes of earlier bets whose $t_1 \\lt t_0$; with one-day holding and frequent signals, several of the last 20 bets are still open."
      ],
      "keyPoints": [
        "Asymmetric Sharpe: $\\theta=\\dfrac{p(u+\\ell)-\\ell}{(u+\\ell)\\sqrt{p(1-p)}}\\sqrt{n}$ (AFML ch. 15); break-even $p^*=\\ell/(u+\\ell)=2/3$ for $[1,2]$.",
        "At $p=0.52$ and $0.58$ the expected payoff per bet is negative ($3p-2 \\lt 0$): both systems lose money under the deck's own barriers; the symmetric formula is simply wrong here.",
        "Vertical exits give small, non-binary payoffs; \"success\" (positive return) then includes tiny wins, so precision is not an economic quantity unless payoffs per class are reported.",
        "The hit-rate feature uses outcomes not yet known at $t_0$; compute it only from bets with $t_1 \\lt t_0$ (and purge accordingly).",
        "$\\sqrt{n}$ assumes independent bets; overlapping intervals and common shocks reduce the effective $n$. Credible evaluation: purged CV or walk-forward, net-of-cost P&L, PR curve at the operating threshold, and a random filter with the same $n$ as a baseline."
      ],
      "followUps": [
        "Exercise 3.5 uses [0, 2]: no profit-take, a 2-sigma stop and a one-day deadline. What exactly does the meta-label measure, and what payoff distribution does a \"success\" have?",
        "Derive the precision that the secondary model must reach, as a function of how many bets it removes, to raise Sharpe at all under [1, 2] barriers."
      ],
      "source": {
        "label": "López de Prado (2018), Advances in Financial Machine Learning (Wiley), ch. 3, exercise 3.4 (adapted), with the precision–frequency–payoff Sharpe relation of ch. 15",
        "url": "",
        "relation": "adapted from"
      }
    },
    {
      "id": "fml-lab-q5",
      "type": "counterexample",
      "difficulty": 3,
      "prompt": "<p>Trend scanning regresses forward log-price <em>levels</em> on a time index over windows $L \\in \\{5,10,\\dots,40\\}$ and keeps the window with the largest $|t|$ of the slope. Show that it produces confident labels from pure noise.</p>\n<ol>\n<li>Using the spurious-regression literature, state how the OLS $t$-statistic of a time-trend regression behaves when the series is a driftless random walk, as $L$ grows.</li>\n<li><strong>Predict</strong>, before simulating: under a Gaussian random walk, the share of observations with $L^*=40$ (versus 12.5% if uniform), the median $|t^*|$, and the share with $|t^*| \\gt 2$. Then simulate and compare.</li>\n<li>What does this imply for using $|t^*|$ as a sample weight, and for the serial dependence of adjacent labels?</li>\n<li>Propose a statistic with a known null distribution that preserves the spirit of trend scanning, and say how you would calibrate the maximum over the window grid.</li>\n</ol>",
      "whyItMatters": "A label that looks highly significant under the null rewards models for fitting noise, and $|t|$-weighting amplifies exactly the most spurious observations.",
      "hints": [
        "Regressing an I(1) series on a deterministic trend gives a slope $t$-statistic that diverges at rate $\\sqrt{L}$; $t/\\sqrt{L}$ has a non-degenerate limit.",
        "The maximum over the grid favours long windows, where the spurious t is largest, but very short windows also win sometimes because their t has few degrees of freedom and heavy tails.",
        "Regress returns (first differences) on a constant: the $t$-statistic of the mean is approximately $\\mathcal{N}(0,1)$ under the null for each $L$ (use HAC errors if returns are autocorrelated). Calibrate the maximum over the grid by simulation or block bootstrap."
      ],
      "keyPoints": [
        "Spurious trend: on a driftless random walk the slope $t$ grows like $\\sqrt{L}$ (Phillips; Durlauf–Phillips), so large $|t|$ is the norm, not evidence.",
        "Simulation (4,000 random walks): $L^*=40$ in about 34% of cases versus 12.5% uniform, median $|t^*| \\approx 8.5$, and $|t^*| \\gt 2$ in over 99% of cases.",
        "$|t^*|$ weights are noise that favours long windows; labels at adjacent $t$ share most of the window, so they are strongly autocorrelated, and purging must use $t_1=t+L^*-1$.",
        "Fix: scan on returns, e.g. $t_L=\\bar r_L/(\\hat\\sigma/\\sqrt{L})$ with HAC errors, and compare $\\max_L|t_L|$ with its simulated or bootstrapped null; report labels only above that critical value.",
        "Lesson: the module already says trend-scanning t-values are a ranking device; this shows the ranking is systematically biased under the null."
      ],
      "followUps": [
        "Derive the asymptotic distribution of $\\max_{L \\le L_{\\max}}|t_L|$ for the return-based statistic as the grid becomes fine. Which boundary-crossing result applies?",
        "Does the same spurious-significance problem affect the backward-looking trend-strength feature? Why is it less harmful as a feature than as a label?"
      ],
      "source": {
        "label": "López de Prado (2020), Machine Learning for Asset Managers, ch. 5 (trend-scanning labels), with Phillips (1986), Understanding Spurious Regressions in Econometrics, J. Econometrics 33",
        "url": "https://doi.org/10.1016/0304-4076(86)90001-1",
        "relation": "motivated by"
      }
    },
    {
      "id": "fml-lab-q6",
      "type": "derive",
      "difficulty": 3,
      "prompt": "<p>Compare AFML's probability-to-size map $m=2\\Phi(z)-1$, $z=(p-\\tfrac12)/\\sqrt{p(1-p)}$, with the Kelly criterion.</p>\n<ol>\n<li>Show that near $p=\\tfrac12$, $m \\approx \\sqrt{2/\\pi}\\,(2p-1) \\approx 0.80\\,(2p-1)$, and compare with the Kelly fraction for an even-money binary bet. Where is the map below Kelly and where above (find the crossing)?</li>\n<li>With triple-barrier payoffs $+u\\sigma$ and $-\\ell\\sigma$, derive the Kelly fraction of capital. Show that the map can size a negative-expectation bet positively (try $p=0.6$ with $[u,\\ell]=[1,2]$).</li>\n<li>Show that Kelly scales like $1/\\sigma$ (barrier width) while the map is scale-free. What happens to risk if $m$ is applied directly as a fraction of capital across volatility regimes?</li>\n<li>Kelly for several simultaneous bets is $\\Sigma^{-1}\\mu$. What correlation structure does simple averaging of active bets implicitly assume?</li>\n<li>Using the quadratic approximation of the growth rate, show why overconfident probabilities are more costly than underconfident ones, and connect this to fractional Kelly.</li>\n</ol>",
      "whyItMatters": "Sizing turns a classifier into P&L. The CDF map ignores payoffs, volatility and correlation, all of which matter for growth and drawdown; knowing exactly where it departs from Kelly tells you what to fix.",
      "hints": [
        "$dz/dp=2$ at $p=\\tfrac12$ and $dm/dz=2\\varphi(0)$. Evaluate both maps at $p=0.85$ and $p=0.9$.",
        "Maximise $p\\log(1+fu\\sigma)+(1-p)\\log(1-f\\ell\\sigma)$ over $f$.",
        "$g(f)\\approx f\\mu-\\tfrac12 f^2\\sigma^2$ is maximised at $f^*=\\mu/\\sigma^2$; $g(2f^*)=0$ while $g(f^*/2)=\\tfrac34 g(f^*)$."
      ],
      "keyPoints": [
        "Near $\\tfrac12$: $m\\approx 0.80(2p-1)$, i.e. about 0.8 times even-money Kelly; the map stays below Kelly up to $p\\approx 0.88$ and exceeds it above (at $p=0.9$, $m\\approx 0.82$ vs $0.80$).",
        "Barrier Kelly: $f^*=\\dfrac{pu-(1-p)\\ell}{u\\ell\\,\\sigma}$; at $p=0.6$, $[1,2]$ the expected payoff is $-0.2\\sigma$ (so $f^*\\lt 0$) while the map gives $m\\approx 0.16 \\gt 0$.",
        "Kelly $\\propto 1/\\sigma$; the map is scale-free, so using $m$ directly as capital fraction makes risk proportional to volatility: scale to a risk target.",
        "Averaging active bets is equivalent to an equal-weight rule that ignores the covariance of overlapping bets; with highly correlated concurrent bets $\\Sigma^{-1}\\mu$ would give a much smaller total position than the sum suggests.",
        "The quadratic growth approximation is symmetric in sizing error, but the consequences are not: 2x Kelly drives growth to zero at four times the variance, while half Kelly keeps 75% of growth at a quarter of the variance; overconfident probabilities push toward overbetting, so fractional Kelly is the robust choice (the Samuelson–Thorp debate)."
      ],
      "followUps": [
        "Derive a sizing map that combines a calibrated meta-label probability with the barrier payoffs and a risk target, and compare its turnover with the CDF map after discretisation.",
        "MacLean, Thorp and Ziemba list good and bad properties of Kelly. Which bad property bites hardest for a meta-labeled strategy with fat-tailed vertical-barrier exits?"
      ],
      "source": {
        "label": "López de Prado (2018), Advances in Financial Machine Learning (Wiley), ch. 10 (bet sizing from predicted probabilities), with Kelly (1956), A New Interpretation of Information Rate, Bell System Technical Journal 35(4)",
        "url": "https://doi.org/10.1002/j.1538-7305.1956.tb03809.x",
        "relation": "motivated by"
      }
    },
    {
      "id": "fml-lab-q7",
      "type": "connect",
      "difficulty": 3,
      "prompt": "<p>Recast the triple-barrier and meta-labeling pipeline in the options framework of reinforcement learning (temporally extended actions in a semi-Markov decision process).</p>\n<ol>\n<li>Map each component: initiation set, intra-option policy, termination condition, option reward. What is the meta-label in this language, and what is the secondary model learning?</li>\n<li>Barrier labels ignore holding time: a +u exit after one bar and after fifty bars get the same label. What does the SMDP view (discounting or reward per unit time) say about this, and what alternative target follows?</li>\n<li>Because the full price history is observed, any other barrier configuration can be evaluated by relabeling the same data, much like hindsight relabeling in goal-conditioned RL. What makes this powerful, and what makes it dangerous (two distinct reasons)?</li>\n<li>What would learning the termination function (the exit) rather than fixing it require, and why is off-policy evaluation of exits harder in markets than in simulators?</li>\n</ol>",
      "whyItMatters": "The RL view exposes design choices that labeling hides: duration-blind rewards, a fixed exit policy, and policy search disguised as hyperparameter tuning.",
      "hints": [
        "Initiation set = states where an event fires; policy = hold side s; termination = first barrier touch; reward = side-adjusted return over the option.",
        "In an SMDP the value of an option with duration $\\tau$ involves $\\gamma^\\tau$ or a cost per unit time; compare \"return\" with \"return per unit time\" or with a risk-adjusted target.",
        "Relabeling assumes your own trades do not move prices (no impact), and searching over many relabeled policies on the same history is multiple testing."
      ],
      "keyPoints": [
        "Mapping: initiation = CUSUM event states; intra-option policy = hold side s; termination = barrier hit or deadline; reward = side-adjusted return. The meta-label is the sign of the option return, and the secondary model approximates the decision to initiate or skip.",
        "Duration-blind labels favour slow wins; an SMDP target such as $\\gamma^\\tau$-discounted return, return per unit time, or return net of a holding cost aligns the label with capital usage.",
        "Relabeling (hindsight-style) gives free counterfactual labels for any barrier policy, but (i) it assumes no market impact or fill uncertainty and (ii) choosing among many relabeled policies on one history is policy search with multiple testing: count trials, purge, hold out.",
        "Learning exits is an optimal-stopping or option-critic problem; off-policy evaluation is hard because data come from one non-stationary path and the behaviour policy is not randomised.",
        "Concurrent overlapping options violate the single-agent SMDP assumption; averaging active bets is a crude rule for combining them."
      ],
      "followUps": [
        "Write the Bellman equation for the enter-or-skip decision with a fixed barrier policy, and show when a probability threshold on the meta-label coincides with the optimal initiation rule.",
        "Could you randomise entries in a small paper-trading account to obtain propensities for off-policy evaluation? What would you learn that historical relabeling cannot tell you?"
      ],
      "source": {
        "label": "Sutton, Precup & Singh (1999), Between MDPs and semi-MDPs: A Framework for Temporal Abstraction in Reinforcement Learning, Artificial Intelligence 112; see also Andrychowicz et al. (2017), Hindsight Experience Replay, arXiv:1707.01495",
        "url": "https://doi.org/10.1016/S0004-3702(99)00052-1",
        "relation": "motivated by"
      }
    },
    {
      "id": "fml-lab-q8",
      "type": "design",
      "difficulty": 3,
      "prompt": "<p>Your primary model is a cross-sectional equity signal (say, short-term reversal: long the bottom decile of past-week returns, short the top decile, rebalanced weekly over about 3,000 US names). Design a meta-labeling layer for it, end to end.</p>\n<ul>\n<li>Define the meta-label: absolute return, return relative to the cross-sectional median, or residual return after a point-in-time risk model? Justify.</li>\n<li>Set barriers and the vertical horizon in terms of the rebalance schedule and ex-ante idiosyncratic volatility; decide how earnings announcements inside the window are handled.</li>\n<li>Handle concurrency: thousands of events start on the same date and share common shocks. How do you weight samples and purge in cross-validation?</li>\n<li>Choose features available at $t_0$ (crowding, liquidity, borrow, recent signal efficacy) and state the leakage rule for each.</li>\n<li>Map calibrated probabilities to positions in a portfolio optimiser rather than with the per-name CDF map, and define the evaluation against the unfiltered signal.</li>\n</ul>",
      "whyItMatters": "Meta-labeling literature is built on single-asset time-series rules. Applying it to a cross-sectional factor raises the module's open question on label definition and adds cross-sectional dependence that the standard recipe ignores.",
      "hints": [
        "If the label is absolute return, the secondary model can earn its keep by timing the market; a residual label isolates the stock-specific part the signal is about.",
        "Purge by time across all names, not per name; a per-date normalisation of weights stops dates with many events from dominating.",
        "Feed $\\hat p$ times the expected payoff as an alpha, with risk and turnover penalties, so sizing respects correlations and costs."
      ],
      "keyPoints": [
        "Meta-label on residual return from a point-in-time risk model (market, industry, style) over the holding window, so success means the stock-specific bet worked.",
        "Barriers in units of ex-ante idiosyncratic volatility, vertical barrier at the rebalance horizon; earnings windows excluded, flagged or modelled separately.",
        "Cross-sectional concurrency: purge and embargo by date across all names; weight samples for both time overlap and same-date dependence (e.g. normalise weights per date).",
        "Features computed strictly from information at $t_0$; \"recent efficacy\" uses only bets with $t_1 \\lt t_0$; the universe includes delisted names.",
        "Calibrated probabilities become alphas in an optimiser with risk and turnover constraints; evaluate against the unfiltered signal at matched risk and turnover, net of costs, with the number of trials logged."
      ],
      "followUps": [
        "Should the secondary model be trained separately for the long and short legs? What asymmetries in borrow costs and crash risk argue for it?",
        "How would you detect that the secondary model has learned a known factor (e.g. low volatility) rather than signal-specific failure modes?"
      ],
      "source": {
        "label": "Original design question building on this module's open question on cross-sectional meta-labels and AFML ch. 3–4",
        "url": "",
        "relation": "original"
      }
    }
  ],
  "projects": [
    {
      "id": "fml-labeling-r1",
      "title": "Replication: when do stop-loss rules stop losses? (Kaminski & Lo, US equities vs bonds)",
      "level": "replication",
      "hours": "10–16",
      "paper": {
        "label": "Kaminski & Lo (2014) — When Do Stop-Loss Rules Stop Losses?, Journal of Financial Markets 18",
        "url": "https://doi.org/10.1016/j.finmar.2013.07.001"
      },
      "goal": "Reproduce the empirical result that simple 0/1 stop-loss rules on a monthly US equity buy-and-hold portfolio, switching to long-term government bonds when stopped out, add about 50–100 basis points per month during stopped-out periods over 1950–2004; verify the random-walk proposition with a shuffle placebo; then carry the rule out of sample and into triple-barrier meta-labels.",
      "data": "Free public data only: Ken French Data Library (monthly market excess return plus risk-free rate, as a proxy for the CRSP value-weighted index); long-term government bond returns approximated from a long-maturity yield series (Robert Shiller's online long-rate data, or FRED GS10 from 1953) with a constant-maturity duration approximation. The proxies will not match the paper's CRSP/Ibbotson data exactly; quantify the gap. Use only public or personal data; never employer data.",
      "steps": [
        "Read the paper's definition of the stop-loss-re-entry rule (exit when the cumulative return over a J-month window falls below a threshold gamma; re-enter according to the threshold delta) and of the stopping premium, stopping ratio and the random-walk proposition; reproduce the definitions in code with unit tests on hand-made sequences.",
        "Build monthly equity and bond return series for 1950–2004; check summary statistics (mean, volatility) against those reported in the paper and record the differences.",
        "Run the rule over the paper's parameter grid; report the probability of being stopped out, the stopping premium unconditionally and per stopped-out month, the change in volatility, and Sharpe ratios.",
        "Placebo: shuffle equity returns (and separately, block-bootstrap with 12-month blocks) 1,000 times and recompute the stopping premium for each parameter set.",
        "Out of sample: extend to 2005 to the latest available month with the same grid, and add transaction costs of 10 and 50 bp per switch.",
        "Bridge to labeling: use the best in-sample rule as the lower barrier of a side-aware triple-barrier label on the same monthly data, and compare label class balance and meta-label base rates with and without the stop barrier."
      ],
      "deliverables": [
        "Code with unit tests for the rule and the premium decomposition",
        "Table in the paper's layout for 1950–2004 alongside the published values, plus the out-of-sample table",
        "Placebo distribution plots",
        "Discrepancy write-up (1–2 pages): where the reproduction differs, by how much, and whether index proxy, bond-return approximation, dividend treatment or rule definition explains it"
      ],
      "acceptance": [
        "For the parameter combinations the paper highlights, the stopping premium per stopped-out month lies within the 50–100 bp range reported in the abstract, or the write-up quantifies the shortfall and attributes it to specific data or definition differences.",
        "Proxy check: full-sample monthly mean and volatility of the equity and bond proxies are tabulated next to any summary statistics the paper reports, and every difference above 0.1% per month in the mean is documented.",
        "Placebo: the average stopping premium across i.i.d. shuffles is not positive for any parameter set (within Monte Carlo error), consistent with the random-walk proposition.",
        "Out-of-sample and cost-adjusted tables are reported for the full grid, with the sign of the premium stated.",
        "Labeling bridge: class shares and meta-label base rates with and without the stop barrier are reported."
      ],
      "extensions": [
        "Replicate the serial-correlation and transaction-cost analysis of Lo & Remorov (2017) on a set of long-lived ETFs.",
        "Apply a stop-loss to the Ken French momentum factor (daily) and compare with the drawdown reduction reported by Han, Zhou and Zhu; note theirs operates at the stock level.",
        "Replace the fixed threshold with a volatility-scaled one and test whether the premium survives."
      ]
    }
  ]
});
