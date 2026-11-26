LAB.module("convex-opt", {
  "id": "cvx-portfolio",
  "order": 8,
  "title": "Portfolio Optimization in Practice: Markowitz++, Costs, MPO and Nonconvex Constraints",
  "summary": "Follows Boyd et al. (2017) \"Multi-Period Trading via Convex Optimization\" and the cvxportfolio package, with Boyd et al. (2024) \"Markowitz Portfolio Construction at Seventy\", B&V §4.4/§4.6/§4.7 examples and the EE364b nonconvex heuristics. It covers single-period optimisation with a factor risk model, linear and 3/2-power costs and constraints; robust and shrinkage alternatives; multi-period optimisation as MPC; and cardinality, minimum-trade and lot constraints via L1, relax-round-solve and MIQP.",
  "sources": [
    {
      "label": "Boyd, Busseti, Diamond, Kahn, Koh, Nystrup & Speth (2017) — Multi-Period Trading via Convex Optimization, FnT in Optimization 3(1)",
      "url": "https://doi.org/10.1561/2400000023"
    },
    {
      "label": "Paper page, PDF and code (cvxportfolio)",
      "url": "https://web.stanford.edu/~boyd/papers/cvx_portfolio.html"
    },
    {
      "label": "cvxportfolio documentation",
      "url": "https://www.cvxportfolio.com/"
    },
    {
      "label": "Boyd, Johansson, Kahn, Schiele & Schmelzer (2024) — Markowitz Portfolio Construction at Seventy, J. Portfolio Management 50(8)",
      "url": "https://doi.org/10.3905/jpm.2024.50.8.117"
    },
    {
      "label": "Boyd & Vandenberghe (2004) — Convex Optimization §4.4.1–4.4.2 (Markowitz, Example 4.8), §4.6.3 (worst-case risk), §4.7.6 (risk-return trade-off)",
      "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
    },
    {
      "label": "EE364b slides: L1 methods for convex-cardinality problems; Sequential convex programming; Branch and bound; MPC",
      "url": "https://web.stanford.edu/class/ee364b/lectures.html"
    }
  ],
  "lessons": [
    {
      "id": "cvx-portfolio-1",
      "title": "Classical Markowitz as a convex program and the risk-return frontier",
      "minutes": 60,
      "links": [
        {
          "label": "B&V §4.4.1 (Markowitz QP), §4.4.2 Example 4.8 (loss-risk SOCP), §4.7.6 (risk-return trade-off): book PDF",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "Boyd et al. (2024) §1 (the original idea, alleged deficiencies, robust optimisation and regularisation)",
          "url": "https://arxiv.org/abs/2401.05080"
        },
        {
          "label": "EE364a additional exercises 17.16 (efficient solution with a factor model): repository",
          "url": "https://github.com/cvxgrp/cvxbook_additional_exercises"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>The three equivalent scalarisations (min risk s.t. return, max return s.t. risk, risk-adjusted return) and which one makes the frontier easiest to trace.</li><li>How a loss-probability constraint under Gaussian returns becomes a second-order cone constraint.</li><li>Why the frontier ends in a single-asset portfolio for long-only problems, and what that says about unconstrained mean-variance as a forecast amplifier.</li></ul><h3>Predict before you read</h3><ol><li>With $\\Sigma=F\\Sigma_fF^\\top+D$, $n=2{,}500$ and $k=30$, what does a solve cost if you ignore the structure, and what if you exploit it?</li><li>Along the risk-aversion path of the budget-only problem, is the optimal portfolio affine in $\\gamma$ or in $1/\\gamma$?</li><li>Which of the \"alleged deficiencies\" of Markowitz are about the optimiser and which are about the inputs?</li></ol><h3>Leave with</h3><p>Markowitz is a small, structured convex program. Its reputation problems come from the inputs and from leaving out costs and constraints, not from the optimisation itself.</p><h3>Equity-QR angle</h3><p>Every risk-model-based construction you run is a variant of this QP. Exploiting the factor structure ($O(nk^2)$, not $O(n^3)$) is what makes daily, large-universe backtests cheap.</p>"
    },
    {
      "id": "cvx-portfolio-2",
      "title": "The single-period model: holdings, trades, transaction and holding costs, factor risk",
      "minutes": 90,
      "links": [
        {
          "label": "Boyd et al. (2017) ch. 2 (model: trades, 3/2-power transaction cost, holding cost, self-financing) and ch. 3 (metrics): PDF",
          "url": "https://web.stanford.edu/~boyd/papers/pdf/cvx_portfolio.pdf"
        },
        {
          "label": "Boyd et al. (2017) §4.1–4.2 and §4.4–4.6 (risk measures, holding and trading constraints, soft constraints)",
          "url": "https://web.stanford.edu/~boyd/papers/pdf/cvx_portfolio.pdf"
        },
        {
          "label": "Boyd et al. (2024) §2–3 (holdings, trades, costs, factor model) and §4.1–4.2 (Markowitz++ problem, softening)",
          "url": "https://arxiv.org/abs/2401.05080"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>The normalised trade $z_t$ and post-trade weights $w_t+z_t$; costs depend on trades, risk and holding costs on post-trade weights.</li><li>The cost model $a|x|+b\\sigma|x|^{3/2}/V^{1/2}+cx$: half-spread, square-root-type impact, asymmetry. It is convex when $c$ is small enough, and the 3/2 power fits in DCP as a power cone or SOC-representable atom.</li><li>Replacing the self-financing equality by $\\mathbf 1^\\top z=0$ while keeping costs in the objective: the approximation and why it is harmless.</li></ul><h3>Predict before you read</h3><ol><li>Which constraints are naturally \"hard\" (legal, mandate) and which should be soft penalties? What goes wrong if a soft one is hard?</li><li>If impact scales as trade$^{3/2}$, how does the optimal trade size respond to doubling the alpha?</li><li>A leverage limit and a factor-neutrality constraint can make the problem infeasible. Which one would you soften?</li></ol><h3>Leave with</h3><p>A practical construction problem is \"risk-adjusted alpha minus costs, subject to a few hard constraints and many soft ones\". All of it stays convex, and the hyperparameters ($\\gamma_{\\text{risk}},\\gamma_{\\text{trade}},\\gamma_{\\text{hold}}$) are tuned by backtesting.</p><h3>Equity-QR angle</h3><p>This is the template of a production optimiser: factor risk, impact model fitted to your fills, borrow costs as holding costs, and neutrality, liquidity and position limits. The cvxportfolio code shows each piece as a separate, testable object.</p>"
    },
    {
      "id": "cvx-portfolio-3",
      "title": "Forecast error, robust formulations and shrinkage",
      "minutes": 75,
      "links": [
        {
          "label": "Boyd et al. (2017) §4.3 (return and covariance forecast error risk)",
          "url": "https://web.stanford.edu/~boyd/papers/pdf/cvx_portfolio.pdf"
        },
        {
          "label": "Boyd et al. (2024) §3.5 (making return and risk forecasts robust)",
          "url": "https://arxiv.org/abs/2401.05080"
        },
        {
          "label": "B&V §4.6.3 (bounding portfolio risk with incomplete covariance information)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364b slides: Robust optimization with uncertain data",
          "url": "https://web.stanford.edu/class/ee364b/lectures/robust_slides.pdf"
        },
        {
          "label": "Ledoit & Wolf (2004) — Honey, I Shrunk the Sample Covariance Matrix",
          "url": "https://doi.org/10.3905/jpm.2004.110"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>Box uncertainty in mean returns produces a weighted L1 penalty: an \"uncertainty-weighted leverage\".</li><li>The elementwise covariance perturbation $|\\Delta_{ij}|\\le\\varrho(\\Sigma_{ii}\\Sigma_{jj})^{1/2}$ produces an additive squared volatility-weighted leverage term.</li><li>Equivalences: constraints as shrinkage (no-short constraints shrink the covariance), robustness as regularisation, and shrinkage of the covariance as a Bayesian or decision-theoretic estimator.</li></ul><h3>Predict before you read</h3><ol><li>For a long-only portfolio, what does the worst-case covariance in that perturbation set look like?</li><li>Robust return penalty versus a larger risk aversion: which one changes the <em>direction</em> of the portfolio and which only its scale?</li><li>Why might a modest $\\varrho$ (a few percent) improve out-of-sample Sharpe by more than a careful covariance estimator does?</li></ol><h3>Leave with</h3><p>Robust versions of Markowitz are still convex, cost one or two extra norm terms, and act as regularisers. Most of the \"Markowitz is unstable\" critique disappears once you penalise leverage in the right norm.</p><h3>Equity-QR angle</h3><p>Return uncertainty per name can come from forecast dispersion across models or from signal standard errors. Penalising $\\rho^\\top|w-w^b|$ then makes the optimiser trade only where the alpha is confident, which is a cleaner substitute for ad-hoc alpha haircuts.</p>"
    },
    {
      "id": "cvx-portfolio-4",
      "title": "Using single-period optimisation: hyperparameters, back-tests, solve time",
      "minutes": 75,
      "links": [
        {
          "label": "Boyd et al. (2017) §4.7–4.8 (convexity, solve times, using SPO) and §7.1–7.3 (examples)",
          "url": "https://web.stanford.edu/~boyd/papers/pdf/cvx_portfolio.pdf"
        },
        {
          "label": "Boyd et al. (2024) §4.4 (back-testing and parameter tuning) and §5 (numerical experiments)",
          "url": "https://arxiv.org/abs/2401.05080"
        },
        {
          "label": "cvxportfolio documentation and examples",
          "url": "https://www.cvxportfolio.com/"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>Cost and risk multipliers are not physical constants. $\\gamma_{\\text{trade}}$ and $\\gamma_{\\text{hold}}$ are regularisation knobs tuned by back-test, and the best values in the paper are far from 1.</li><li>The back-test simulator uses realised costs; the optimiser uses estimated costs. Keep the two separate.</li><li>The grid searches are large (hundreds of back-tests). Note how few of the paper's conclusions survive a multiple-testing view.</li></ul><h3>Predict before you read</h3><ol><li>Daily rebalancing to a target versus monthly: which costs more, and which tracks better, at USD 100M versus USD 10B?</li><li>Why would a large holding-cost multiplier help when actual borrow costs are only 1 bp?</li><li>How should the return-forecast horizon relate to $\\gamma_{\\text{trade}}$?</li></ol><h3>Leave with</h3><p>Single-period optimisation plus honest back-testing over a few hyperparameters is a strong baseline. The tuning is itself a statistical procedure that can overfit.</p><h3>Equity-QR angle</h3><p>This is where research meets PM decisions: choosing risk aversion, cost multipliers and soft-constraint weights. Treat the hyperparameter search like any other model selection, with held-out periods and a trial count.</p>"
    },
    {
      "id": "cvx-portfolio-5",
      "title": "Multi-period optimisation and model predictive control",
      "minutes": 75,
      "links": [
        {
          "label": "Boyd et al. (2017) ch. 5 (multi-period optimisation, computation, multi-scale) and §7.4 (MPO example)",
          "url": "https://web.stanford.edu/~boyd/papers/pdf/cvx_portfolio.pdf"
        },
        {
          "label": "EE364b slides: Model predictive control",
          "url": "https://web.stanford.edu/class/ee364b/lectures/mpc_slides.pdf"
        },
        {
          "label": "EE364b slides: Stochastic model predictive control",
          "url": "https://web.stanford.edu/class/ee364b/lectures/stoch_mpc_slides.pdf"
        },
        {
          "label": "Gârleanu & Pedersen (2013) — Dynamic Trading with Predictable Returns and Transaction Costs",
          "url": "https://doi.org/10.1111/jofi.12080"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>MPO plans trades over a horizon $H$ using forecasts $\\hat r_{\\tau|t}$, executes only the first, and re-plans: MPC with certainty-equivalent forecasts.</li><li>Why MPO helps mainly through forecasts of <em>future</em> returns and costs, and how quickly the benefit saturates in $H$.</li><li>Terminal constraints and multi-scale planning (fast execution layer, slow allocation layer).</li></ul><h3>Predict before you read</h3><ol><li>With quadratic costs and an AR(1) alpha, what does the optimal trade look like relative to the current Markowitz portfolio?</li><li>If the alpha half-life is one day and costs are linear, how much can MPO add over SPO?</li><li>MPO with $H$ periods has about $H$ times the variables. Does the solve time scale linearly or worse, and why?</li></ol><h3>Leave with</h3><p>MPO is a convex program over a plan. Its value comes from anticipating alpha decay and cost-driven partial trading, which is the same insight as Gârleanu–Pedersen's \"trade partially toward an aim portfolio\".</p><h3>Equity-QR angle</h3><p>Signals with different half-lives (fast reversal versus slow value) should be traded at different speeds. MPO, or its closed-form special cases, is the principled way to combine them, instead of separate turnover caps per signal.</p>"
    },
    {
      "id": "cvx-portfolio-6",
      "title": "Nonconvex constraints: cardinality, minimum trade size, lots",
      "minutes": 90,
      "links": [
        {
          "label": "EE364b slides: L1 methods for convex-cardinality problems (parts I and II)",
          "url": "https://web.stanford.edu/class/ee364b/lectures/l1_slides.pdf"
        },
        {
          "label": "EE364b slides: L1 methods part II (reweighted L1, extensions)",
          "url": "https://web.stanford.edu/class/ee364b/lectures/l1_ext_slides.pdf"
        },
        {
          "label": "EE364b slides: Sequential convex programming",
          "url": "https://web.stanford.edu/class/ee364b/lectures/seq_slides.pdf"
        },
        {
          "label": "EE364b slides: Branch-and-bound methods",
          "url": "https://web.stanford.edu/class/ee364b/lectures/bb_slides.pdf"
        },
        {
          "label": "Boyd et al. (2024) §4.3 (nonconvex constraints, relax-round-solve)",
          "url": "https://arxiv.org/abs/2401.05080"
        },
        {
          "label": "Lobo, Fazel & Boyd (2007) — Portfolio optimization with linear and fixed transaction costs",
          "url": "https://doi.org/10.1007/s10479-006-0145-1"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>L1 as the convex envelope of cardinality on a box, and reweighted L1 as sequential convex programming on a log-sum surrogate.</li><li>The trap: on the long-only simplex $\\|w\\|_1=1$ is constant, so an L1 penalty on weights cannot sparsify. Penalise trades, or use reweighting or MIQP.</li><li>Relax-round-solve: solve the convex relaxation, fix the obvious decisions, re-solve the convex problem. Branch and bound gives certificates at much higher cost.</li></ul><h3>Predict before you read</h3><ol><li>Minimum-holding constraints ($w_i=0$ or $w_i\\ge0.1\\%$): what does the convex relaxation look like, and how far from feasible is its solution likely to be?</li><li>When does rounding share counts matter, as a function of portfolio value and price?</li><li>How large a gap between the MIQP optimum and a heuristic would show up in a back-test, compared with forecast noise?</li></ol><h3>Leave with</h3><p>Back-test with the convex version for speed and reliability, enforce nonconvex constraints with a few convex solves (or MIQP in production), and check that the gap is small.</p><h3>Equity-QR angle</h3><p>Name-count limits for small books, minimum ticket sizes, round lots in less liquid markets and fixed costs per trade are all nonconvex. Knowing which heuristic is close enough saves a lot of solver time across a parameter sweep.</p>"
    }
  ],
  "cheatsheet": [
    {
      "term": "Markowitz (risk-adjusted form)",
      "formula": "\\max_w\\ \\mu^\\top w-\\gamma\\,w^\\top\\Sigma w\\quad\\text{s.t.}\\quad\\mathbf 1^\\top w=1,\\ w\\in\\mathcal W",
      "note": "Sweeping gamma traces the Pareto frontier (B&V §4.7.6). Without inequality constraints the solution is affine in 1/gamma."
    },
    {
      "term": "Factor risk model",
      "formula": "\\Sigma=F\\Sigma_fF^\\top+D,\\qquad w^\\top\\Sigma w=y^\\top\\Sigma_fy+w^\\top Dw,\\ \\ y=F^\\top w",
      "note": "With exposures y as variables, the Hessian is block diagonal and the solve costs O(nk^2)."
    },
    {
      "term": "Transaction cost model (Boyd et al. 2017, eq. 2.2)",
      "formula": "\\phi^{\\text{trade}}_i(z_i)=a_i|z_i|+b_i\\sigma_i\\frac{|z_i|^{3/2}}{(V_i/v)^{1/2}}+c_iz_i",
      "note": "a: half-spread plus fees; b: impact coefficient (about 1 by rule of thumb); V/v: volume relative to portfolio value; c: asymmetry."
    },
    {
      "term": "SPO problem (simplified self-financing)",
      "formula": "\\max_{z}\\ \\hat r^\\top z-\\gamma_{\\text{trade}}\\hat\\phi^{\\text{trade}}(z)-\\gamma_{\\text{hold}}\\hat\\phi^{\\text{hold}}(w+z)-\\gamma_{\\text{risk}}\\psi(w+z)\\ \\ \\text{s.t.}\\ \\mathbf 1^\\top z=0,\\ z\\in\\mathcal Z,\\ w+z\\in\\mathcal W",
      "note": "The exact self-financing equality is nonconvex; relax to <= 0 (tight at optimum) or use 1^T z = 0 with costs kept in the objective."
    },
    {
      "term": "Robust mean (box uncertainty)",
      "formula": "\\min_{|\\delta|\\le\\rho}(\\hat\\mu+\\delta)^\\top w=\\hat\\mu^\\top w-\\rho^\\top|w|",
      "note": "Return forecast error penalty: uncertainty-weighted leverage. Applied to w - w_b for active portfolios."
    },
    {
      "term": "Worst-case risk (elementwise covariance uncertainty)",
      "formula": "\\max_{|\\Delta_{ij}|\\le\\varrho\\sqrt{\\Sigma_{ii}\\Sigma_{jj}}}w^\\top(\\Sigma+\\Delta)w=w^\\top\\Sigma w+\\varrho\\Big(\\sum_i\\Sigma_{ii}^{1/2}|w_i|\\Big)^2",
      "note": "Long-only: equivalent to using Sigma + rho s s^T with s the vector of volatilities."
    },
    {
      "term": "Ledoit–Wolf linear shrinkage",
      "formula": "\\hat\\Sigma_{\\text{LW}}=\\delta^\\star T+(1-\\delta^\\star)S",
      "note": "S: sample covariance; T: structured target (e.g. constant correlation); delta* minimises expected Frobenius loss, estimated from data."
    },
    {
      "term": "MPO (planning horizon H)",
      "formula": "\\max_{z_t,\\dots,z_{t+H-1}}\\ \\sum_{\\tau=t}^{t+H-1}\\Big(\\hat r_{\\tau|t}^\\top(w_\\tau+z_\\tau)-\\gamma_\\tau\\psi_\\tau(w_\\tau+z_\\tau)-\\hat\\phi_\\tau(z_\\tau)\\Big),\\ \\ w_{\\tau+1}=w_\\tau+z_\\tau",
      "note": "Execute z_t only, then re-plan (MPC). H = 1 recovers SPO."
    },
    {
      "term": "Gârleanu–Pedersen aim portfolio",
      "formula": "x_t=\\Big(1-\\tfrac{a}{\\lambda}\\Big)x_{t-1}+\\tfrac{a}{\\lambda}\\,\\mathrm{aim}_t",
      "note": "Quadratic costs, mean-reverting signals: trade a fixed fraction toward an aim that weights current and future Markowitz portfolios; slower-decaying signals get more weight."
    },
    {
      "term": "Cardinality L1 heuristic (reweighted)",
      "formula": "\\min\\ f(w)+\\lambda\\sum_i\\omega_i^{(k)}|w_i-w_{0,i}|,\\qquad \\omega_i^{(k+1)}=\\frac{1}{\\epsilon+|w_i^{(k)}-w_{0,i}|}",
      "note": "Local linearisation of the concave log-sum penalty (Candès, Wakin and Boyd 2008); penalise trades, since weights on the simplex have constant L1 norm."
    },
    {
      "term": "Minimum holding / trade size (MIQP)",
      "formula": "w_i\\in\\{0\\}\\cup[\\ell_i,u_i]\\ \\Longleftrightarrow\\ \\ell_is_i\\le w_i\\le u_is_i,\\ s_i\\in\\{0,1\\}",
      "note": "Big-M or indicator constraints; branch and bound gives a certificate; relax-round-solve gives a fast heuristic."
    },
    {
      "term": "1/N and the estimation window (DeMiguel et al. 2009)",
      "formula": "\\mathbb E[\\text{CEQ loss}]\\ \\text{of sample mean-variance}\\ \\gg\\ \\text{diversification gain unless } T \\gg N",
      "note": "Their calibrated estimate is about 3,000 months for 25 assets; disputed by Kritzman, Page and Turkington (2010)."
    }
  ],
  "flashcards": [
    {
      "q": "Unconstrained budget-only Markowitz: closed-form solution?",
      "a": "$w^\\star=\\frac{1}{2\\gamma}\\Sigma^{-1}(\\mu-\\nu\\mathbf 1)$ with $\\nu$ chosen so $\\mathbf 1^\\top w=1$. Equivalently, minimum-variance portfolio plus $\\frac1{2\\gamma}$ times a zero-net-investment portfolio, so $w$ is affine in $1/\\gamma$."
    },
    {
      "q": "Why is the long-only Markowitz frontier’s high-return end a single asset?",
      "a": "At $\\gamma\\to0$ the problem is an LP over the simplex, whose optimum is a vertex: all weight in the highest-$\\mu$ asset."
    },
    {
      "q": "How does a Gaussian loss-probability constraint $\\Pr(r\\le\\alpha)\\le\\beta$ (with $\\beta\\le1/2$) become convex?",
      "a": "$\\alpha-\\bar p^\\top x\\le\\Phi^{-1}(\\beta)\\|\\Sigma^{1/2}x\\|_2$, i.e. $\\bar p^\\top x+\\Phi^{-1}(\\beta)\\|\\Sigma^{1/2}x\\|_2\\ge\\alpha$, an SOC constraint since $\\Phi^{-1}(\\beta)\\le0$ (B&V Example 4.8)."
    },
    {
      "q": "Why is $|x|^{3/2}$ impact DCP-compliant?",
      "a": "It is convex (power $p=3/2\\ge1$ of a nonnegative convex function) and representable with second-order or power cones; CVXPY accepts power(abs(x), 1.5)."
    },
    {
      "q": "In Boyd et al. (2017), why is the exact self-financing constraint a problem, and what are the two fixes?",
      "a": "$\\mathbf 1^\\top z+\\phi^{\\text{trade}}(z)+\\phi^{\\text{hold}}(w+z)=0$ is a nonlinear equality, so it is not convex. Relax it to $\\le0$ (tight at the optimum) or replace it with $\\mathbf 1^\\top z=0$ while keeping costs in the objective."
    },
    {
      "q": "Worst-case portfolio return over box uncertainty $|\\delta_i|\\le\\rho_i$?",
      "a": "$\\hat\\mu^\\top w-\\rho^\\top|w|$: longs take the low end, shorts the high end."
    },
    {
      "q": "Jagannathan & Ma (2003): what does a no-short-sale constraint do to the minimum-variance problem?",
      "a": "It is equivalent to using a shrunk covariance $\\Sigma-(\\lambda\\mathbf 1^\\top+\\mathbf 1\\lambda^\\top)$ built from the multipliers. Large estimated covariances are reduced, which helps when they are estimation error."
    },
    {
      "q": "What does MPO add over SPO in the Boyd et al. (2017) example with $H=2$?",
      "a": "A substantially better Pareto frontier in their simulation, mostly because it sees tomorrow’s return forecast as well as today’s. The forecasts there are synthetic (noisy realised returns), so this is an illustration, not evidence."
    },
    {
      "q": "Gârleanu–Pedersen: two rules of optimal trading with quadratic costs?",
      "a": "\"Aim in front of the target\": the aim portfolio weights future expected Markowitz portfolios, more so for persistent signals. \"Trade partially toward the aim\", at a rate set by cost and risk aversion."
    },
    {
      "q": "Why does an L1 penalty on weights fail to induce sparsity in long-only, fully invested portfolios?",
      "a": "On $\\{w\\ge0,\\mathbf 1^\\top w=1\\}$, $\\|w\\|_1=1$ is constant, so the penalty adds a constant. Sparsity needs shorting (Brodie et al. 2009), a penalty on trades, a nonconvex surrogate, or explicit cardinality."
    },
    {
      "q": "Relax-round-solve for a minimum-weight constraint (Boyd et al. 2024 §4.3)?",
      "a": "Solve without the constraint. If violated, use a threshold to set tiny weights to zero and force weights near the minimum to at least it, then re-solve the convex problem with those fixed. This takes one or a few convex solves."
    },
    {
      "q": "DeMiguel, Garlappi & Uppal (2009): main finding?",
      "a": "Across 7 datasets, none of 14 sample-based optimising models consistently beats 1/N out of sample on Sharpe, certainty-equivalent return or turnover. Their calibration suggests very long estimation windows are needed for mean-variance to win."
    },
    {
      "q": "Kritzman, Page & Turkington (2010): main counterpoint?",
      "a": "Optimised portfolios beat 1/N across many datasets when inputs are sensible (long-run or simple expected returns, not short rolling means). The failure is attributed to naive input estimation, not to optimisation."
    }
  ],
  "projects": [
    {
      "id": "cvx-portfolio-p1",
      "title": "SPO back-test with a factor risk model and 3/2-power costs: Pareto frontiers vs 1/N and shrinkage",
      "level": "core",
      "hours": "10–15",
      "goal": "Build a single-period optimisation back-test on a public US large-cap universe with a PCA factor risk model, linear plus 3/2-power transaction costs, holding costs and leverage limits. Sweep risk and trading aversion, plot the realised Pareto frontier, and compare against 1/N, minimum variance with Ledoit–Wolf shrinkage and a robust (Markowitz++-style) variant, all net of the same simulated costs.",
      "data": "Daily adjusted prices and volumes for about 200 large US stocks (e.g. current S&P 100 plus large S&P 500 names) from yfinance or stooq, 2010–2024 (survivorship bias as in Boyd et al. 2017; document it). Risk-free rate from FRED (DTB3). Return forecasts: either the paper’s synthetic noisy-realised-return forecast (clearly labelled as non-tradable) or a simple public signal such as 12-1 momentum. Public data only, never employer data or code.",
      "steps": [
        "Build the data pipeline: returns, volumes, a volatility proxy |log(open/close)| and 10-day moving averages of volume and volatility, as in §7.1 of the paper.",
        "Estimate a monthly k = 15 PCA factor model from a 2-year window with the diagonal matched to the sample second moment.",
        "Implement the simulator (realised costs, holding costs, self-financing) separately from the policy (estimated costs). Unit-test the simulator on buy-and-hold and periodic-rebalance policies.",
        "Implement SPO in CVXPY (or use cvxportfolio) with leverage <= 3, the 3/2-power cost and a holding-cost term; add the Markowitz++ robust terms (return uncertainty L1 and covariance uncertainty rho).",
        "Grid-search gamma_risk in a log grid and gamma_trade in {1, 2, 5, 10, 20} on 2010–2018; select on that period and evaluate once on 2019–2024.",
        "Compare with 1/N, Ledoit–Wolf minimum variance and an unconstrained sample mean-variance portfolio, all with identical cost simulation."
      ],
      "deliverables": [
        "Reusable simulator and policy code with tests.",
        "Pareto plots (excess return vs excess risk) for each gamma_trade on the tuning period, with the selected point marked.",
        "Out-of-sample table: return, volatility, Sharpe, max drawdown, turnover, cost drag for every strategy.",
        "One-page discussion of which hyperparameters mattered and how many back-tests were run."
      ],
      "acceptance": [
        "The simulator reproduces a periodic-rebalance experiment qualitatively like Table 7.1 of the paper: turnover and cost fall monotonically from daily to annual rebalancing, and cost is larger for a USD 10B than for a USD 100M portfolio.",
        "Each SPO solve returns status optimal, with leverage <= 3 + 1e-6 and sum of weights equal to 1 within 1e-6, on every day.",
        "The hyperparameter selection uses only the tuning period, and the out-of-sample table reports the number of configurations tried.",
        "At least one gamma_trade value produces a frontier that dominates gamma_trade = 1 on the tuning period, or the report explains why not.",
        "The robust variant’s out-of-sample turnover is lower than plain SPO at the same gamma_risk, with the effect on Sharpe reported with a bootstrap confidence interval."
      ],
      "extensions": [
        "Replace PCA with a fundamental-style factor model built from public characteristics (size, value, momentum, industry) and compare risk forecasts with a bias statistic.",
        "Add a 2-period MPO with forecasts from an AR(1) alpha model and compare frontiers."
      ]
    },
    {
      "id": "cvx-portfolio-p2",
      "title": "Cardinality and minimum-trade constraints: MIQP vs L1, reweighted L1 and relax-round-solve",
      "level": "stretch",
      "hours": "15–25",
      "goal": "Quantify how close convex heuristics come to the mixed-integer optimum for a portfolio with at most K names, minimum position size and minimum trade size, both on individual problems (optimality gap, time) and over a full back-test (performance difference versus forecast noise).",
      "data": "Same universe as the core project, or a 500-name synthetic universe from a calibrated factor model (Ken French factors for factor covariance). Open-source MIQP via SCIP (PySCIPOpt or CVXPY’s SCIP interface); a commercial academic licence is optional. Public data only.",
      "steps": [
        "Formulate the MIQP with binaries for holdings and trades (big-M with tight, problem-derived bounds) for K in {20, 50, 100} and minimum sizes of 10–50 bp.",
        "Implement heuristics: L1 on trades with a lambda path, reweighted L1 (5–10 iterations), relax-round-solve as in Boyd et al. (2024) §4.3, and a simple sequential convex programming variant.",
        "On 50 random back-test dates, solve all methods and record objective gap to the best MIQP bound, run time and constraint satisfaction.",
        "Run full back-tests with the convex relaxation (no integer constraints), the best heuristic and (if time allows) the MIQP, and compare net performance.",
        "Bootstrap the difference in Sharpe ratios to see if heuristic error is distinguishable from forecast noise."
      ],
      "deliverables": [
        "Code for every method with a common interface.",
        "Table of optimality gap and time per method and K.",
        "Back-test comparison with confidence intervals.",
        "Recommendation: which method for research back-tests and which for production."
      ],
      "acceptance": [
        "Every heuristic solution satisfies the cardinality and minimum-size constraints exactly (checked in code).",
        "The MIQP reports a proven gap (best bound) for at least 80% of the 50 dates within a stated time limit.",
        "The best heuristic’s median objective gap to the MIQP incumbent is reported, together with the 90th percentile.",
        "The back-test Sharpe difference between the convex relaxation and the constrained heuristic is reported with a bootstrap 95% interval."
      ],
      "extensions": [
        "Use the perspective reformulation for the quadratic risk on binaries and measure how much it tightens the relaxation.",
        "Compare with the cutting-plane approach of Bertsimas & Cory-Wright (2022) on the same instances."
      ]
    }
  ],
  "frontier": {
    "asOf": "2026-11",
    "summary": "Practitioner portfolio construction has converged on convex, cost-aware, regularised Markowitz formulations (\"Markowitz++\"): factor risk models, robust return and covariance terms, soft constraints, and hyperparameters tuned by back-testing. Open-source stacks (CVXPY, cvxportfolio, OSQP/Clarabel) make this reproducible. Active work focuses on better covariance forecasts for optimisation, end-to-end tuning of construction policies through differentiable optimisation, scalable mixed-integer methods for cardinality and lot constraints, multi-period control with drawdown or risk targets, and the old question of when optimisation beats simple heuristics (1/N, risk parity, HRP) out of sample.",
    "threads": [
      {
        "title": "Markowitz++: robust, regularised, cost-aware single-period construction",
        "why": "The 2024 paper restates Markowitz with uncertainty-weighted leverage terms, worst-case covariance, soft constraints and back-test tuning, and argues this answers the classical criticisms. The open question is how to set the uncertainty parameters from data rather than by grid search.",
        "refs": [
          {
            "label": "Boyd, Johansson, Kahn, Schiele & Schmelzer (2024) — Markowitz Portfolio Construction at Seventy",
            "url": "https://doi.org/10.3905/jpm.2024.50.8.117"
          },
          {
            "label": "Goldfarb & Iyengar (2003) — Robust Portfolio Selection Problems",
            "url": "https://doi.org/10.1287/moor.28.1.1.14260"
          },
          {
            "label": "Boyd et al. (2017) — Multi-Period Trading via Convex Optimization",
            "url": "https://doi.org/10.1561/2400000023"
          }
        ]
      },
      {
        "title": "Covariance forecasting for optimisation",
        "why": "Construction quality is limited by risk-model quality. Recent work proposes simple, fast predictors (iterated EWMA, combinations of models) evaluated by portfolio-level metrics, complementing shrinkage and RMT cleaning.",
        "refs": [
          {
            "label": "Johansson, Ogut, Pelger, Schmelzer & Boyd (2023) — A Simple Method for Predicting Covariance Matrices of Financial Returns",
            "url": "https://arxiv.org/abs/2305.19484"
          },
          {
            "label": "Ledoit & Wolf (2004) — Honey, I Shrunk the Sample Covariance Matrix",
            "url": "https://doi.org/10.3905/jpm.2004.110"
          }
        ]
      },
      {
        "title": "Learning construction policies end to end",
        "why": "Differentiable convex optimisation lets you tune risk aversion, cost multipliers or even risk-model parameters by gradient descent on a back-test objective. This changes hyperparameter search from grids to gradients but raises new overfitting risks.",
        "refs": [
          {
            "label": "Agrawal, Barratt, Boyd & Stellato (2020) — Learning Convex Optimization Control Policies",
            "url": "https://arxiv.org/abs/1912.09529"
          },
          {
            "label": "Agrawal et al. (2019) — Differentiable Convex Optimization Layers",
            "url": "https://arxiv.org/abs/1910.12430"
          }
        ]
      },
      {
        "title": "Scalable sparse and mixed-integer portfolio selection",
        "why": "Cutting-plane and perspective methods now solve cardinality-constrained portfolio problems with hundreds to thousands of assets to certified optimality, while convex heuristics (reweighted L1, relax-round-solve) remain the back-test workhorse.",
        "refs": [
          {
            "label": "Bertsimas & Cory-Wright (2022) — A Scalable Algorithm for Sparse Portfolio Selection",
            "url": "https://doi.org/10.1287/ijoc.2021.1127"
          },
          {
            "label": "Diamond, Takapoui & Boyd (2018) — A general system for heuristic minimization of convex functions over non-convex sets",
            "url": "https://doi.org/10.1080/10556788.2017.1304548"
          },
          {
            "label": "Candès, Wakin & Boyd (2008) — Enhancing Sparsity by Reweighted L1 Minimization",
            "url": "https://doi.org/10.1007/s00041-008-9045-x"
          }
        ]
      },
      {
        "title": "Multi-period control: costs, drawdown and alpha decay",
        "why": "MPC formulations add drawdown control, risk targeting and alpha-decay-aware trading. Closed-form dynamic programming results (Gârleanu–Pedersen) give intuition and benchmarks for the convex MPC policies used in practice.",
        "refs": [
          {
            "label": "Gârleanu & Pedersen (2013) — Dynamic Trading with Predictable Returns and Transaction Costs",
            "url": "https://doi.org/10.1111/jofi.12080"
          },
          {
            "label": "Nystrup, Boyd, Lindström & Madsen (2019) — Multi-period portfolio selection with drawdown control",
            "url": "https://doi.org/10.1007/s10479-018-2947-3"
          }
        ]
      }
    ],
    "openQuestions": [
      "How should the return-uncertainty radii $\\rho$ and covariance uncertainty $\\varrho$ in Markowitz++ be estimated from forecast-model diagnostics (e.g. signal standard errors) rather than tuned, and does doing so reduce back-test overfitting?",
      "When the hyperparameters of a construction policy are tuned by hundreds of back-tests on one bull-market period, what is the right deflation of the reported Sharpe, and how much of the reported gain survives?",
      "Under realistic alpha decay and 3/2-power impact, how large is the gain of MPO over well-tuned SPO with a trade-aversion multiplier, once forecasts are genuinely out of sample?",
      "Is the empirical 3/2-power (square-root impact) cost model adequate inside the optimiser for a portfolio that trades many correlated names at once (cross-impact), and how would a convex cross-impact term change optimal trades?",
      "Do HRP-style hierarchical allocations beat robust Markowitz++ with factor risk models out of sample, once both have the same cost model and equally careful tuning?"
    ],
    "brainstorm": [
      "Write your current construction problem in the Boyd et al. (2017) notation, list every term and constraint, and mark which are hard, which soft, and which could be dropped without measurable loss.",
      "Estimate b in the 3/2-power cost model from public trade-and-quote-free proxies (daily volume, volatility) and compare the implied optimal trade sizes with your intuition for a USD 1B book.",
      "Run a mini \"1/N vs optimisation\" study on public data with three input choices (rolling mean, shrunk mean, zero mean = minimum variance) and see which side of the DeMiguel–Kritzman debate your data supports.",
      "Prototype a two-layer MPO: a slow allocation layer at monthly horizon and a fast daily execution layer with a terminal constraint, and compare it against a single SPO with a high trade-aversion multiplier.",
      "Take one nonconvex constraint you face (name count, minimum ticket, round lots) and measure the back-test cost of ignoring it during research versus enforcing it heuristically."
    ]
  }
}
);
