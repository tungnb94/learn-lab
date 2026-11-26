LAB.extend("cvx-portfolio", {
  "questions": [
    {
      "id": "cvx-portfolio-q1",
      "type": "derive",
      "difficulty": 2,
      "prompt": "<p>Markowitz++ (Boyd et al. 2024 §3.5) makes forecasts robust with two uncertainty sets: mean returns $\\mu\\in\\{\\hat\\mu+\\delta:|\\delta|\\le\\rho\\}$ and covariances $\\Sigma\\in\\{\\hat\\Sigma+\\Delta:\\Delta=\\Delta^\\top,\\ |\\Delta_{ij}|\\le\\varrho(\\hat\\Sigma_{ii}\\hat\\Sigma_{jj})^{1/2}\\}$.</p><ol><li>Derive the worst-case mean return and show it equals $\\hat\\mu^\\top w-\\rho^\\top|w|$.</li><li>Derive the worst-case variance $w^\\top\\hat\\Sigma w+\\varrho\\big(\\sum_i\\hat\\Sigma_{ii}^{1/2}|w_i|\\big)^2$. Identify the maximising $\\Delta$ and check that $\\hat\\Sigma+\\Delta$ need not be PSD. Does that matter for the bound?</li><li>Show that the worst-case volatility is $\\big\\|\\big(\\hat\\Sigma^{1/2}w,\\ \\sqrt{\\varrho}\\,s^\\top|w|\\big)\\big\\|_2$ with $s_i=\\hat\\Sigma_{ii}^{1/2}$, so it is an SOC-representable convex function of $w$.</li><li>Specialise to long-only $w$: show that the worst case is a rank-one update $\\hat\\Sigma+\\varrho ss^\\top$. What does that do to the minimum-variance portfolio (think: the market-like direction)?</li><li>For long-short books, explain why both terms behave like leverage penalties and how they differ from simply raising $\\gamma$.</li></ol>",
      "whyItMatters": "These two terms carry most of the robustness in modern Markowitz practice and cost almost nothing to add. Deriving them shows exactly which portfolio features they penalise: gross leverage weighted by forecast uncertainty and by volatility.",
      "hints": [
        "Each $\\delta_i$ appears only in $\\delta_iw_i$; minimise coordinatewise.",
        "The perturbation enters as $\\sum_{ij}\\Delta_{ij}w_iw_j$; maximise each term separately with $\\Delta_{ij}=\\varrho s_is_j\\operatorname{sign}(w_iw_j)$.",
        "With $w\\ge0$ the signs are all positive, so $\\Delta=\\varrho ss^\\top$. Compare the minimum-variance problem under $\\hat\\Sigma+\\varrho ss^\\top$ with adding a fictitious common factor with loadings proportional to volatility."
      ],
      "keyPoints": [
        "Worst-case mean is $\\hat\\mu^\\top w-\\rho^\\top|w|$ with $\\delta_i=-\\rho_i\\operatorname{sign}(w_i)$.",
        "Worst-case variance derived by termwise maximisation; the maximiser $\\varrho\\,(s\\circ\\operatorname{sign}w)(s\\circ\\operatorname{sign}w)^\\top$ is rank-one PSD, so the sum is PSD here, but the set as a whole contains non-PSD matrices; the bound is still valid as a worst case over the set.",
        "SOC representation as the norm of a stacked vector, hence convex and solver-friendly.",
        "Long-only: worst case equals $\\hat\\Sigma+\\varrho ss^\\top$, a pseudo-factor proportional to volatilities that penalises concentrated low-vol bets and pushes toward more diversified weights.",
        "Unlike raising $\\gamma$, which scales all risk directions, these penalties target gross positions (L1-type), favouring fewer, more confident and less volatile bets; they also break the pure scale invariance of the solution."
      ],
      "followUps": [
        "Replace the box set for $\\mu$ with an ellipsoid $\\|\\Sigma_\\mu^{-1/2}\\delta\\|_2\\le\\kappa$ and derive the penalty $\\kappa\\|\\Sigma_\\mu^{1/2}w\\|_2$; when is this better than the box?",
        "Propose a way to set $\\rho_i$ from the cross-model dispersion of alpha forecasts, and test whether it beats a uniform $\\rho$."
      ],
      "source": {
        "label": "Boyd, Johansson, Kahn, Schiele & Schmelzer (2024) — Markowitz Portfolio Construction at Seventy, §3.5 (eqs. 16–18); Boyd et al. (2017) §4.3, motivated by",
        "url": "https://arxiv.org/abs/2401.05080",
        "relation": "motivated by"
      }
    },
    {
      "id": "cvx-portfolio-q2",
      "type": "derive",
      "difficulty": 2,
      "prompt": "<p>Consider $\\min_w\\ -\\mu^\\top w+\\gamma w^\\top(F\\Sigma_fF^\\top+D)w$ s.t. $\\mathbf 1^\\top w=1$, with $n=2{,}500$ assets and $k=30$ factors.</p><ol><li>Give the flop count for solving the KKT system if you form $\\Sigma$ explicitly and factor it densely.</li><li>Introduce exposures $y=F^\\top w$, write the enlarged KKT system, and show how to solve it in $O(nk^2)$ flops by block elimination (or Woodbury). Count the flops.</li><li>Show that the solution is affine in $1/\\gamma$, and that the whole risk-return path for $M$ values of $\\gamma$ costs one factorisation plus $O(Mn)$ work.</li><li>Now add the long-only constraint $w\\ge0$. Which of these properties survive, and what does the solution path look like as $\\gamma$ varies?</li></ol>",
      "whyItMatters": "Exploiting factor structure is the single most important speed trick in portfolio construction, and it underlies every fast solver reformulation (OSQP’s Appendix A.4 included). Knowing the cost model tells you what is affordable inside a large backtest sweep.",
      "hints": [
        "Dense: forming $\\Sigma$ costs $O(n^2k)$, and the KKT solve costs about $\\tfrac13n^3$.",
        "Variables $(w,y,\\nu,\\lambda)$: the Hessian is block-diagonal ($D$, $\\Sigma_f$), so eliminate $w$ using the diagonal $D$, leaving a $(k+1)\\times(k+1)$ system.",
        "The KKT right-hand side is linear in $\\mu/\\gamma$ apart from the budget row. With inequality constraints, the path is piecewise affine in $1/\\gamma$ (active set changes at breakpoints)."
      ],
      "keyPoints": [
        "Dense cost about $n^3/3\\approx5\\times10^9$ flops plus $O(n^2k)$ to form $\\Sigma$.",
        "Structured elimination: $D^{-1}$ is diagonal; the reduced system involves $F^\\top D^{-1}F$ (cost $nk^2\\approx2\\times10^6$) and a $(k+1)$-dimensional solve; total about $O(nk^2)$, roughly 1,000x cheaper here.",
        "Affine in $1/\\gamma$: $w(\\gamma)=w_{\\text{mv}}+\\frac{1}{2\\gamma}w_{\\text{zero}}$, so the whole frontier costs two solves.",
        "Long-only: the solution path is piecewise affine in $1/\\gamma$ with breakpoints where assets enter or leave; a parametric QP (homotopy) traces it exactly.",
        "Mentions numerical conditioning (adding a multiple of the identity to $D$ or $\\Sigma_f$) and validation against a dense solve."
      ],
      "followUps": [
        "Count the cost of one ADMM iteration for the same problem with the exposure reformulation and compare with an interior-point iteration.",
        "With $D$ diagonal but $F$ sparse (industry dummies plus a few style factors), how does the cost change?"
      ],
      "source": {
        "label": "EE364a additional exercises 17.16 \"Efficient solution of basic portfolio optimization problem\" (adapted)",
        "url": "https://github.com/cvxgrp/cvxbook_additional_exercises",
        "relation": "adapted from"
      }
    },
    {
      "id": "cvx-portfolio-q3",
      "type": "critique",
      "difficulty": 3,
      "prompt": "<p>In Boyd et al. (2017) §7.3, single-period optimisation is back-tested on S&amp;P 500 stocks over 2012–2016. The return forecasts are realised returns plus noise, rescaled. The simulator uses a half-spread of 5 bp, $b=1$ and a holding cost of 1 bp. After a coarse grid (45 back-tests), a fine grid, and a final grid of 410 back-tests over $(\\gamma_{\\text{risk}},\\gamma_{\\text{trade}},\\gamma_{\\text{hold}})$, the Pareto-optimal points have $\\gamma_{\\text{trade}}$ around 6–8 and often $\\gamma_{\\text{hold}}$ of 10–100.</p><p>A colleague concludes: \"The transaction-cost model is underestimated by a factor of 6–8, and borrow costs are 10–100 times higher than the 1 bp we assumed. We should recalibrate the cost model.\"</p><p>Critique this inference. Address: (i) the forecast horizon and why $\\gamma_{\\text{trade}}>1$ is expected even with a perfect cost model; (ii) $\\gamma_{\\text{hold}}$ as regularisation (what it suppresses); (iii) the synthetic forecast construction and what it implies about transferability; (iv) the selection procedure (roughly 500 back-tests, one bull-market sample) and how you would deflate the reported frontier; (v) what experiment would actually test whether the cost model is mis-specified.</p>",
      "whyItMatters": "Tuned multipliers are routinely misread as physical parameters. Separating \"what the optimiser needs to behave well\" from \"what trading really costs\" avoids recalibrating a correct cost model to fix a forecasting problem.",
      "hints": [
        "A one-period alpha forecast is compared with a cost paid once but whose position persists for several periods. What does that mismatch do to the optimal trade size?",
        "A large holding-cost multiplier in that paper’s setup mostly penalises short positions. Why might that help when forecasts are noisy and the market rose steadily?",
        "Testing the cost model needs realised costs (implementation shortfall) against predicted costs, not back-test Sharpe."
      ],
      "keyPoints": [
        "Horizon mismatch: costs are paid once but the alpha is a single-period forecast; trading aversion above 1 amortises costs over the expected holding period and suppresses trading on noisy, quickly decaying signals. Even a perfect cost model gives $\\gamma_{\\text{trade}}>1$ in SPO.",
        "$\\gamma_{\\text{hold}}$ acts as a regulariser against shorts and leverage (the paper itself notes this), not as a borrow-cost estimate.",
        "Forecasts built from realised returns plus noise have unrealistic properties (no decay structure, perfect alignment with the realised return); tuned values need not transfer to real signals.",
        "Selection: about 500 back-tests on one 5-year bull market, with no hold-out; the Pareto frontier is an in-sample maximum. Deflate by using a hold-out period, CSCV/PBO across the grid, or a deflated Sharpe with the trial count.",
        "A proper test of the cost model compares predicted and realised execution costs on actual or simulated fills (slippage regressions on trade size/volume/volatility), separate from portfolio-level tuning."
      ],
      "followUps": [
        "Derive, for an AR(1) alpha with persistence $\\phi$ and linear costs, the effective trade aversion that a single-period optimiser needs to mimic the multi-period optimum.",
        "Design a back-test protocol for tuning three multipliers that reports an honest out-of-sample frontier."
      ],
      "source": {
        "label": "Boyd et al. (2017) — Multi-Period Trading via Convex Optimization, §4.8 and §7.3 (Table 7.2, Figures 7.2–7.4), motivated by",
        "url": "https://web.stanford.edu/~boyd/papers/pdf/cvx_portfolio.pdf",
        "relation": "motivated by"
      }
    },
    {
      "id": "cvx-portfolio-q4",
      "type": "debate",
      "difficulty": 2,
      "prompt": "<p>DeMiguel, Garlappi &amp; Uppal (2009) find that none of 14 sample-based allocation models consistently beats the naive $1/N$ portfolio out of sample, and estimate that a mean-variance investor needs an extremely long estimation window (on the order of 3,000 months for 25 assets) to beat $1/N$. Kritzman, Page &amp; Turkington (2010) reply that optimisation beats $1/N$ across many datasets once inputs are not estimated from short rolling samples, and that the $1/N$ result is an artefact of naive input estimation.</p><ol><li>State each side's strongest argument and the specific design choices (assets, estimation windows, input estimators, metrics) on which the conclusions depend.</li><li>Derive the intuition behind the long-window result: the expected out-of-sample loss of a plug-in mean-variance rule grows like $N/T$ times a factor that depends on the true Sharpe ratio, while the gain over $1/N$ is a fixed number.</li><li>Where do minimum-variance (no mean input), Ledoit–Wolf shrinkage and Jagannathan–Ma constraints sit in this debate?</li><li>For a single-stock equity book with 1,500 names and an alpha model, does this debate even apply? Argue precisely.</li></ol>",
      "whyItMatters": "Whether to optimise at all, and with which inputs, is the most basic construction decision. The debate shows that \"optimisation versus heuristics\" is really about input estimation error, a point that carries over to HRP and ML allocators.",
      "hints": [
        "Look at what DeMiguel et al. feed the optimiser (rolling sample means, a 60- or 120-month window) versus Kritzman et al. (longer-horizon or equal expected returns, i.e. close to minimum variance).",
        "With estimated $\\hat\\mu$, the certainty-equivalent loss contains a term like $\\frac{N}{T}\\cdot\\frac{1}{2\\gamma}$ (the cost of estimating $N$ means), which must be compared with the difference in squared Sharpe ratios between the tangency portfolio and $1/N$.",
        "In an equity book, the alpha comes from a cross-sectional model, not sample means, and $1/N$ over 1,500 names is not the relevant benchmark: the relevant comparison is optimiser versus a heuristic signal-weighting rule."
      ],
      "keyPoints": [
        "DeMiguel et al.: broad horse race, sample-based inputs, rolling windows, Sharpe/CEQ/turnover metrics; 1/N not consistently beaten; calibration implies very long windows.",
        "Kritzman et al.: input choice drives the result; with sensible (e.g. long-horizon or equal) expected returns, optimised portfolios (often close to minimum variance) beat 1/N across many datasets.",
        "Estimation-error mechanism: loss grows with $N/T$, the gain over 1/N is bounded and small when the assets are similar (industry or size portfolios, which DeMiguel et al. use).",
        "Minimum variance, shrinkage and constraints are the middle ground; Jagannathan–Ma show constraints act as shrinkage; both sides effectively agree that sample means are the problem.",
        "For an alpha-model equity book the relevant debate is optimiser versus simple signal-proportional weighting with risk controls; the estimation-error lens still applies to the covariance and to alpha scaling."
      ],
      "followUps": [
        "Re-run a small version of the horse race on Ken French 25 size/BM portfolios with three input estimators and report which side your result supports.",
        "Connect to HRP (Finance-ML module fml-portfolio-ml): is HRP better described as a covariance-regularisation method or as a different objective?"
      ],
      "source": {
        "label": "DeMiguel, Garlappi & Uppal (2009) vs Kritzman, Page & Turkington (2010): published debate on 1/N versus optimisation",
        "url": "https://doi.org/10.1093/rfs/hhm075",
        "relation": "motivated by"
      },
      "sides": [
        {
          "position": "Estimation error in sample-based optimisation is so large that 1/N is hard to beat out of sample without extremely long data histories.",
          "refs": [
            {
              "label": "DeMiguel, Garlappi & Uppal (2009) — Optimal Versus Naive Diversification: How Inefficient is the 1/N Portfolio Strategy?",
              "url": "https://doi.org/10.1093/rfs/hhm075"
            }
          ]
        },
        {
          "position": "Optimisation beats 1/N when inputs are estimated sensibly; the 1/N result reflects naive input estimation, not a flaw of optimisation.",
          "refs": [
            {
              "label": "Kritzman, Page & Turkington (2010) — In Defense of Optimization: The Fallacy of 1/N",
              "url": "https://doi.org/10.2469/faj.v66.n2.6"
            }
          ]
        }
      ]
    },
    {
      "id": "cvx-portfolio-q5",
      "type": "connect",
      "difficulty": 3,
      "prompt": "<p>The Finance-ML module (fml-portfolio-ml) presents Hierarchical Risk Parity as an alternative to \"unstable\" quadratic optimisation: it never inverts the covariance matrix, and it allocates by recursive bisection along a clustering tree using inverse-variance weights.</p><ol><li>Show that for a block-diagonal covariance (clusters uncorrelated) and inverse-variance allocation within and between clusters, HRP equals the solution of a convex problem. Write that problem: what is it minimising, and under which simplifying assumption on within-cluster correlations?</li><li>Compare HRP with long-only minimum variance under the Markowitz++ worst-case covariance $\\hat\\Sigma+\\varrho ss^\\top$. Both diversify away from low-volatility concentrations. Which one adapts to the actual correlations, and which one is guaranteed to be stable?</li><li>López de Prado (2016) reports HRP beating minimum variance out of sample in Monte Carlo. Identify what the comparison held fixed (costs, constraints, estimator for $\\Sigma$) and design a fairer comparison against a regularised convex optimiser.</li><li>Which features of a real equity book (factor neutrality, turnover costs, position limits, alpha) can HRP not express, and how would you combine the two approaches?</li></ol>",
      "whyItMatters": "HRP versus optimisation is often argued as a matter of taste. Writing HRP as (approximately) a constrained convex problem with a structured covariance turns the argument into a precise statement about regularisation, so you can compare like with like.",
      "hints": [
        "For one cluster with uncorrelated assets, inverse-variance weights are the minimum-variance portfolio. With uncorrelated clusters, combining cluster portfolios by inverse cluster variance is again minimum variance.",
        "HRP effectively replaces $\\Sigma$ with a block-diagonal (tree-structured) approximation with zero within-cluster correlations for weighting purposes; it is \"minimum variance under a misspecified, highly regularised covariance\".",
        "A fair comparison gives both methods the same covariance estimator (e.g. Ledoit–Wolf), the same long-only constraint, the same rebalancing and cost model, and tunes the convex method’s regularisation out of sample."
      ],
      "keyPoints": [
        "Under diagonal within-cluster covariance and uncorrelated clusters, HRP coincides with long-only minimum variance (positive weights by construction); in general it is minimum variance under a tree-structured surrogate covariance.",
        "Robust minimum variance with $\\varrho ss^\\top$ uses the estimated correlations but adds a penalty on concentration; HRP ignores within-cluster correlation when weighting, which gives stability at the cost of bias.",
        "The 2016 Monte Carlo compares against unregularised minimum variance with sample covariance; the fair comparison includes shrinkage and constraints, as in the DeMiguel–Kritzman debate.",
        "HRP cannot express alpha, neutrality, turnover costs or limits directly; combinations include using HRP as a prior or benchmark ($w^b$) inside a convex optimiser with an active-risk budget, or using the tree to structure the risk model.",
        "Clear statement of the bias–variance trade-off: HRP is high-bias/low-variance, the optimiser’s position is tunable via regularisation."
      ],
      "followUps": [
        "Implement HRP and robust minimum variance on the same 200-stock universe with Ledoit–Wolf covariance and compare out-of-sample variance with a bootstrap.",
        "Show how NCO (nested clustered optimisation) sits between the two, as a Galerkin restriction of minimum variance (see the Finance-ML question on NCO)."
      ],
      "source": {
        "label": "López de Prado (2016) — Building Diversified Portfolios that Outperform Out of Sample; Boyd et al. (2024) §3.5; connects to Finance-ML module fml-portfolio-ml",
        "url": "https://doi.org/10.3905/jpm.2016.42.4.059",
        "relation": "original"
      }
    },
    {
      "id": "cvx-portfolio-q6",
      "type": "predict",
      "difficulty": 3,
      "prompt": "<p>You trade two signals on the same universe: a fast reversal signal (alpha half-life 2 days) and a slow value signal (half-life 120 days), with equal single-period information ratios. Costs are linear plus 3/2-power impact. You compare SPO with trade aversion $\\gamma_{\\text{trade}}$ tuned by back-test, and MPO with horizon $H\\in\\{2,5,20\\}$ using correct alpha-decay forecasts $\\hat r_{\\tau|t}$.</p><p><strong>Before simulating</strong>, predict:</p><ol><li>How the optimal share of each signal in the realised portfolio differs between SPO and MPO, and why.</li><li>How the MPO advantage over tuned SPO scales with $H$ and with portfolio size (USD 100M versus USD 5B).</li><li>Whether a single $\\gamma_{\\text{trade}}$ in SPO can mimic MPO for both signals at once.</li></ol><p>Then check your predictions against the Gârleanu–Pedersen closed form (quadratic costs, mean-reverting signals) and a simulation with the 3/2 cost model.</p>",
      "whyItMatters": "Combining signals with different decay rates is a daily construction problem. MPO and the aim-portfolio result say the slow signal should be traded more and the fast one less than a single-period optimiser implies, and that one trade-aversion knob cannot fix both.",
      "hints": [
        "In Gârleanu–Pedersen, the aim portfolio weights each signal’s Markowitz portfolio by a factor that falls with its mean-reversion speed and with costs.",
        "With costs, a position built today earns the alpha over its remaining life; a 2-day signal decays before the cost can be amortised.",
        "A single $\\gamma_{\\text{trade}}$ scales costs for all trades; but the right effective aversion depends on each signal’s decay. Think about what SPO with one knob does when trades from the two signals net against each other."
      ],
      "keyPoints": [
        "MPO (and the closed form) tilts toward the slow signal relative to SPO: its alpha persists, so its trades are worth their costs; the fast signal is traded partially and often netted.",
        "Advantage grows with portfolio size (impact larger) and saturates in $H$ around the slow signal’s relevant horizon for planning purposes but most of the gain is from the first few periods for the fast signal; predictions should be stated with a mechanism.",
        "One $\\gamma_{\\text{trade}}$ cannot get the right effective aversion for both decay rates; a workaround is to pre-scale signals by decay-adjusted factors (approximating the aim portfolio) before SPO.",
        "Under 3/2 impact, optimal trading is less \"partial\" for small trades and more for large trades than in the quadratic case; the simulation should show this.",
        "Honest comparison of predictions with the simulation, including where the closed form fails (linear costs give no-trade regions)."
      ],
      "followUps": [
        "Derive the aim-portfolio weights for two AR(1) signals under quadratic costs and compare with the MPO plan from CVXPY with $H=20$.",
        "How should the MPO terminal condition be chosen so that a short horizon does not liquidate the slow signal at the end of the plan?"
      ],
      "source": {
        "label": "Gârleanu & Pedersen (2013) — Dynamic Trading with Predictable Returns and Transaction Costs; Boyd et al. (2017) ch. 5 and §7.4, motivated by",
        "url": "https://doi.org/10.1111/jofi.12080",
        "relation": "motivated by"
      }
    },
    {
      "id": "cvx-portfolio-q7",
      "type": "counterexample",
      "difficulty": 2,
      "prompt": "<p>A junior researcher wants at most 30 names in a long-only fund and adds $\\lambda\\|w\\|_1$ to the minimum-variance objective, raising $\\lambda$ until the portfolio is sparse enough.</p><ol><li>Show this cannot work: for every $\\lambda\\ge0$ the solution set is unchanged. Then show that in the long-short (130/30) version the same penalty does induce sparsity, as in Brodie et al. (2009), and explain the mechanism through the KKT conditions.</li><li>Construct a three-asset counterexample where an L1 penalty on <em>trades</em> $\\lambda\\|w-w_0\\|_1$ gives a portfolio with fewer trades but <em>more</em> held names than $w_0$. What does that say about using trade sparsity as a proxy for holding sparsity?</li><li>Construct an example where the reweighted-L1 heuristic (log-sum surrogate) converges to a 2-name solution while the true cardinality-2 optimum uses a different pair. Which property of the problem makes the heuristic go wrong?</li><li>Propose a heuristic that does work for the original goal, and say how you would certify how far it is from optimal.</li></ol>",
      "whyItMatters": "L1 for sparsity is a reflex. In fully invested long-only portfolios it does nothing, and even when it works it optimises a different objective. Knowing the failure modes avoids a common construction bug.",
      "hints": [
        "On $\\{w\\ge0,\\mathbf 1^\\top w=1\\}$, what is $\\|w\\|_1$?",
        "Start from $w_0$ concentrated in 2 names; make a third name attractive enough that moving a small amount into it is worth the trade penalty while the original names remain held.",
        "Reweighting follows the local landscape from the first (unweighted) solution; correlated assets with similar marginal value create multiple local minima of the log-sum surrogate. A certificate needs a lower bound: MIQP bound, or a perspective relaxation."
      ],
      "keyPoints": [
        "Long-only budget: $\\|w\\|_1=1$ is constant, so the penalty is a constant and changes nothing. In long-short, the penalty limits gross exposure (shorts), and sparsity comes from the subdifferential at zero ($|\\nabla_i f+\\nu|\\le\\lambda$ means $w_i=0$).",
        "Trade-penalty counterexample shows sparse trades but adding a name; trade sparsity is not holding sparsity.",
        "Reweighted L1 is a local method on a nonconvex surrogate (a sequential convex programming / majorisation-minimisation scheme); it can pick the wrong support when assets are nearly interchangeable.",
        "Working approach: MIQP with binaries (or perspective/cutting-plane methods) for certification, heuristics (relax-round-solve, greedy with re-optimisation) for speed, and a reported gap between heuristic and bound.",
        "Mentions that tiny weights should be thresholded and the convex problem re-solved (polishing) rather than just rounding."
      ],
      "followUps": [
        "Show that the perspective reformulation of $w_i^2/D_{ii}$ terms tightens the continuous relaxation of the cardinality-constrained problem, and quantify it on an example.",
        "For index tracking with a cardinality limit, compare greedy forward selection with reweighted L1 on public index constituents."
      ],
      "source": {
        "label": "EE364b slides: L1 methods for convex-cardinality problems (parts I and II); Brodie et al. (2009) — Sparse and stable Markowitz portfolios (PNAS), motivated by",
        "url": "https://web.stanford.edu/class/ee364b/lectures/l1_slides.pdf",
        "relation": "motivated by"
      }
    },
    {
      "id": "cvx-portfolio-q8",
      "type": "design",
      "difficulty": 3,
      "prompt": "<p>Your production optimiser must respect: minimum position size of 20 bp for any held name, minimum trade size of USD 50k, round lots in some Asian markets, and at most 400 names. Research back-tests sweep about 200 hyperparameter settings over 10 years of daily rebalances (about 500,000 solves). Production solves once per day under a 60-second limit.</p><ol><li>Design the research workflow (Boyd et al. 2024 §4.3 suggests back-testing with a convex formulation): which constraints you drop or relax, and how you check that results transfer.</li><li>Design the production solve: MIQP versus relax-round-solve versus a hybrid, how you warm-start, what you do on a time-out, and how you log the optimality gap.</li><li>Specify the monitoring that would detect when the convex research proxy and the nonconvex production portfolio diverge enough to matter (for example tracking error between them, or the gap in risk-adjusted objective).</li><li>Estimate the size of the effect of each nonconvex constraint for a USD 500M book and a USD 20B book, and say which ones can be ignored in research for each.</li></ol>",
      "whyItMatters": "Production constraints are nonconvex, but research needs speed and reproducibility. A principled split between convex research and nonconvex production, with monitoring of the gap, avoids both slow research and a back-test that production cannot reproduce.",
      "hints": [
        "Minimum position and trade sizes matter more for small books (many positions near the threshold); round lots matter when lot value is large relative to the target position.",
        "Relax-round-solve: solve convex, classify names as clearly in, clearly out, or ambiguous, fix the clear ones and re-solve; optionally give the ambiguous set to a small MIQP.",
        "Monitor the ex-ante tracking error between the research-style convex portfolio and the production portfolio, plus the objective gap, as daily statistics with alert thresholds."
      ],
      "keyPoints": [
        "Research: convex formulation (drop integrality and lots; keep min-size via L1-on-trades or ignore), with a periodic subsample re-run under the production nonconvex solver to verify transfer.",
        "Production: a hybrid with relax-round-solve to generate an incumbent, then MIQP with a time limit warm-started from it; fall back to the incumbent on time-out; log the bound and gap.",
        "Monitoring of ex-ante tracking error, objective gap and cost differences between research proxy and production, with thresholds tied to forecast-error scale.",
        "Scale analysis: at USD 500M, min trade and min position bind for many names; at USD 20B, cardinality and liquidity dominate while lots are negligible except for high-priced names in lot-heavy markets.",
        "Explicit reasoning about reproducibility: deterministic solver settings, seeds, and versioning."
      ],
      "followUps": [
        "How would you include fixed per-trade costs (Lobo, Fazel & Boyd 2007) in the same pipeline, and what relaxation would you use?",
        "Can differentiable optimisation tune hyperparameters on the convex proxy and still be valid for the nonconvex production policy?"
      ],
      "source": {
        "label": "Boyd et al. (2024) — Markowitz Portfolio Construction at Seventy §4.3; Diamond, Takapoui & Boyd (2018) on relax-round-solve; Lobo, Fazel & Boyd (2007) on fixed costs",
        "url": "https://arxiv.org/abs/2401.05080",
        "relation": "original"
      }
    }
  ],
  "projects": [
    {
      "id": "cvx-portfolio-r1",
      "title": "Replicate Boyd et al. (2017) Table 7.1 and Figure 7.2: rebalancing frequency and the SPO coarse grid",
      "level": "replication",
      "hours": "12–20",
      "paper": {
        "label": "Boyd, Busseti, Diamond, Kahn, Koh, Nystrup & Speth (2017) — Multi-Period Trading via Convex Optimization, §7.1–7.3 (Table 7.1, Figure 7.2)",
        "url": "https://doi.org/10.1561/2400000023"
      },
      "goal": "Reproduce (i) Table 7.1 — active return, active risk, annualised transaction cost and turnover of a uniform-benchmark tracking portfolio rebalanced daily, weekly, monthly, quarterly, annually or never, for USD 100M and USD 10B initial value — and (ii) the coarse SPO hyperparameter grid of Figure 7.2 (45 back-tests over gamma_risk x gamma_trade) using the paper’s synthetic forecasts. Then test how much the conclusions depend on the data source and on survivorship.",
      "data": "The paper used Quandl data for S&P 500 constituents (as of December 2016) continuously traded in 2012–2016; Quandl’s free WIKI dataset is discontinued, so use yfinance or stooq daily OHLCV for the same constituent list (document missing names), and the Fed funds or 3-month T-bill rate from FRED for cash. Cost parameters from §7.1: half-spread 5 bp, b = 1, c = 0, holding cost 1 bp; volatility proxy |log(open/close)|; 10-day moving averages for volume and volatility forecasts. The cvxportfolio repository includes code related to the paper’s examples. Public data only.",
      "steps": [
        "Rebuild the universe (S&P 500 constituents as of Dec 2016 continuously traded 2012–2016) and record how many names you could not obtain.",
        "Implement or configure the simulator with the §7.1 cost and holding parameters, separated from the policy.",
        "Table 7.1: run the six rebalancing frequencies for USD 100M and USD 10B starting from the uniform portfolio; compute active return and risk versus the uniform benchmark, annualised cost and annualised turnover as defined in §7.2.",
        "Risk model: monthly k = 15 PCA factor model from a 2-year window with diagonal matched to the empirical second moment (§7.3).",
        "Forecasts: r_hat = alpha (r + eps), eps ~ N(0, 0.02 I), alpha = 0.0005 / (0.0005 + 0.02) (eq. 7.1); check that the sign hit rate is about 54%.",
        "Run the 45-point coarse grid (gamma_risk in {0.1, 0.3, 1, 3, 10, 30, 100, 300, 1000}, gamma_trade in {1, 2, 5, 10, 20}, gamma_hold = 1) with leverage <= 3 and USD 100M start; plot excess return versus excess risk curves per gamma_trade.",
        "Robustness: repeat Figure 7.2 on 2017–2023 with the current constituent list and with a survivorship-free subset you can construct, and compare."
      ],
      "deliverables": [
        "Code that regenerates both artefacts from raw downloads with fixed seeds.",
        "Your Table 7.1 next to the paper’s.",
        "Your Figure 7.2 with the paper’s qualitative findings annotated.",
        "Short note on data differences, survivorship and what changed in the robustness run."
      ],
      "acceptance": [
        "Table 7.1: annualised turnover per frequency within 15% of the paper (e.g. about 220% daily, 106% weekly, 53% monthly, 30% quarterly, 12.5% annually), and the \"hold\" active risk of the same order as the paper’s 1.53%.",
        "Table 7.1: transaction cost is higher for USD 10B than for USD 100M at every rebalancing frequency, and decreases monotonically from daily to annual in both cases.",
        "The synthetic forecasts have a sign agreement with realised returns between 52% and 56%.",
        "Figure 7.2: gamma_trade = 1 is clearly dominated, and the best curves are at intermediate gamma_trade (around 5), as reported; deviations are explained.",
        "The robustness run reports whether the best gamma_trade region moves, with the number of back-tests run."
      ],
      "extensions": [
        "Reproduce the 2-period MPO comparison (Figure 7.7) with the same synthetic forecasts.",
        "Replace the synthetic forecasts with a genuine public signal and see whether the SPO frontier keeps its shape."
      ]
    }
  ]
}
);
