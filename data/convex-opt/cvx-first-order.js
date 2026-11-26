LAB.module("convex-opt", {
  "id": "cvx-first-order",
  "order": 7,
  "title": "First-Order Methods: Subgradients, Proximal Algorithms and ADMM (EE364b)",
  "summary": "Follows the EE364b lecture groups: subgradients and subgradient methods, stochastic and mirror descent, the road from Adagrad to Adam, primal and dual decomposition, proximal algorithms with acceleration, and ADMM. The equity thread runs through prox operators for portfolio constraints, OSQP-style ADMM for large factor-model QPs, and the convergence theory behind the optimisers used to train alpha models.",
  "sources": [
    {
      "label": "Stanford EE364b lecture slides and notes (Pilanci, originally Boyd)",
      "url": "https://web.stanford.edu/class/ee364b/lectures.html"
    },
    {
      "label": "Parikh & Boyd (2014) — Proximal Algorithms, Foundations and Trends in Optimization 1(3)",
      "url": "https://doi.org/10.1561/2400000003"
    },
    {
      "label": "Boyd, Parikh, Chu, Peleato & Eckstein (2011) — Distributed Optimization and Statistical Learning via ADMM, FnT in ML 3(1)",
      "url": "https://doi.org/10.1561/2200000016"
    },
    {
      "label": "Beck & Teboulle (2009) — A Fast Iterative Shrinkage-Thresholding Algorithm for Linear Inverse Problems (FISTA)",
      "url": "https://doi.org/10.1137/080716542"
    },
    {
      "label": "Stellato, Banjac, Goulart, Bemporad & Boyd (2020) — OSQP: an operator splitting solver for quadratic programs",
      "url": "https://doi.org/10.1007/s12532-020-00179-2"
    },
    {
      "label": "Boyd & Vandenberghe (2004) — Convex Optimization, ch. 3.3 (conjugates) and ch. 5 (duality) as prerequisites",
      "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
    }
  ],
  "lessons": [
    {
      "id": "cvx-first-order-1",
      "title": "Subgradients and subgradient calculus",
      "minutes": 60,
      "links": [
        {
          "label": "EE364b slides: Subgradients",
          "url": "https://web.stanford.edu/class/ee364b/lectures/subgradients_slides.pdf"
        },
        {
          "label": "EE364b notes: Subgradients",
          "url": "https://web.stanford.edu/class/ee364b/lectures/subgradients_notes.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>The difference between the <em>weak</em> calculus (find one subgradient, which is all an algorithm needs) and the <em>strong</em> calculus (the full set $\\partial f(x)$, which optimality conditions need).</li><li>The rule for pointwise maxima: active functions only, then convex hull. Most nonsmooth portfolio objectives (max drawdown proxies, worst-case risk, CVaR) are maxima.</li><li>Why a subgradient is not a descent direction, even though $-g$ points toward every minimiser.</li></ul><h3>Predict before you read</h3><ol><li>What is $\\partial\\|x\\|_1$ at a point with some zero coordinates, and why does that set's shape explain lasso sparsity?</li><li>For $f(w)=\\max_k w^\\top\\Sigma_k w$ (worst case over $K$ risk models), which subgradient would you return cheaply?</li><li>Is $0\\in\\partial f(x)$ still necessary and sufficient when $f$ is convex but the problem has constraints? What replaces it?</li></ol><h3>Leave with</h3><p>Optimality for nonsmooth convex problems is set inclusion: $0\\in\\partial f(x^\\star)+N_C(x^\\star)$. Everything later in the module is a way of solving that inclusion.</p><h3>Equity-QR angle</h3><p>Turnover penalties $\\|w-w_0\\|_1$, tracking-error-plus-L1 objectives and worst-case risk across regimes are nonsmooth. Their subdifferentials tell you which names will sit exactly at their current weight (no trade) and why.</p>"
    },
    {
      "id": "cvx-first-order-2",
      "title": "Subgradient methods, step sizes and constrained variants",
      "minutes": 75,
      "links": [
        {
          "label": "EE364b slides: Subgradient methods",
          "url": "https://web.stanford.edu/class/ee364b/lectures/subgrad_method_slides.pdf"
        },
        {
          "label": "EE364b notes: Subgradient methods",
          "url": "https://web.stanford.edu/class/ee364b/lectures/subgrad_method_notes.pdf"
        },
        {
          "label": "EE364b slides: Subgradient methods for constrained problems",
          "url": "https://web.stanford.edu/class/ee364b/lectures/constr_subgrad_slides.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>The one-line convergence proof: expand $\\|x^{k+1}-x^\\star\\|_2^2$ and telescope. Everything (constant, diminishing, Polyak steps) is read off the same inequality.</li><li>Why the method tracks $f_{\\text{best}}^{(k)}$ and not $f(x^{(k)})$.</li><li>Projected subgradient and the \"feasibility step\" for inequality constraints.</li></ul><h3>Predict before you read</h3><ol><li>With $\\|g\\|\\le G$ and $\\|x^{(1)}-x^\\star\\|\\le R$, how many iterations to reach accuracy $\\epsilon$? Compare with gradient descent on a smooth function.</li><li>If you knew $f^\\star$ (e.g. zero tracking error is attainable), what step would you take?</li><li>Can any first-order method beat $O(1/\\sqrt{k})$ on general Lipschitz convex functions?</li></ol><h3>Leave with</h3><p>$f_{\\text{best}}-f^\\star\\le\\frac{R^2+G^2\\sum\\alpha_i^2}{2\\sum\\alpha_i}$, and the $O(RG/\\sqrt{k})$ rate is optimal for this class. It is slow, but it is robust, trivially parallel and needs only a subgradient oracle.</p><h3>Equity-QR angle</h3><p>When an objective is a maximum over thousands of scenarios (historical CVaR, worst-case regime risk), one cheap subgradient per step can beat building a large LP, provided low accuracy is enough, as it usually is for weights that will be rounded to lots anyway.</p>"
    },
    {
      "id": "cvx-first-order-3",
      "title": "Stochastic subgradient and mirror descent",
      "minutes": 75,
      "links": [
        {
          "label": "EE364b slides: Stochastic subgradient method",
          "url": "https://web.stanford.edu/class/ee364b/lectures/stoch_subgrad_slides.pdf"
        },
        {
          "label": "EE364b notes: Stochastic subgradient method",
          "url": "https://web.stanford.edu/class/ee364b/lectures/stoch_subgrad_notes.pdf"
        },
        {
          "label": "EE364b slides: Mirror descent and variable metric methods",
          "url": "https://web.stanford.edu/class/ee364b/lectures/mirror_descent_slides.pdf"
        },
        {
          "label": "Nemirovski, Juditsky, Lan & Shapiro (2009) — Robust stochastic approximation",
          "url": "https://doi.org/10.1137/070704277"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>The stochastic proof is the deterministic one with an expectation inserted: only unbiasedness and a second-moment bound are used.</li><li>Mirror descent replaces $\\tfrac12\\|x-x^k\\|_2^2$ with a Bregman divergence; the payoff is a constant that depends on the geometry of the feasible set.</li><li>On the simplex with negative entropy, mirror descent becomes multiplicative (exponentiated-gradient) updates.</li></ul><h3>Predict before you read</h3><ol><li>On the probability simplex in $\\mathbb R^n$, how does the convergence constant of projected subgradient scale with $n$, compared with entropic mirror descent?</li><li>Averaging iterates versus taking the last iterate: which does the theory support for stochastic problems, and why?</li><li>Variable-metric methods pick a matrix $H_k$ each step. Which choice of $H_k$ gives Adagrad?</li></ol><h3>Leave with</h3><p>Choose the distance-generating function to match the constraint set: $\\log n$ instead of $n$ in the bound on the simplex is the reason multiplicative weights and online portfolio selection work at scale.</p><h3>Equity-QR angle</h3><p>Online portfolio selection (exponentiated gradient over long-only weights), stochastic optimisation of expected utility over sampled scenarios, and minibatch training of return models are all instances. Their guarantees hold for regret or expected suboptimality, not for net-of-cost P&amp;L.</p>"
    },
    {
      "id": "cvx-first-order-4",
      "title": "From Adagrad to Adam: adaptive methods and their convergence theory",
      "minutes": 60,
      "links": [
        {
          "label": "EE364b slides: From Adagrad to Adam",
          "url": "https://web.stanford.edu/class/ee364b/lectures/adam_slides.pdf"
        },
        {
          "label": "Duchi, Hazan & Singer (2011) — Adaptive Subgradient Methods (JMLR)",
          "url": "https://jmlr.org/papers/v12/duchi11a.html"
        },
        {
          "label": "Kingma & Ba (2014) — Adam (arXiv)",
          "url": "https://arxiv.org/abs/1412.6980"
        },
        {
          "label": "Reddi, Kale & Kumar (2018) — On the Convergence of Adam and Beyond (arXiv)",
          "url": "https://arxiv.org/abs/1904.09237"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>Adagrad as diagonal variable-metric mirror descent with a data-dependent metric; its regret bound adapts to sparse gradients.</li><li>RMSProp and Adam replace the cumulative sum by an exponential average. That one change breaks the monotone effective-step property the Adagrad proof relies on.</li><li>Where momentum enters, and what the bias corrections actually fix.</li></ul><h3>Predict before you read</h3><ol><li>Why can an exponential moving average of squared gradients make the effective step size <em>increase</em>, and why would that hurt on a convex problem?</li><li>What modification restores a convergence proof (hint: AMSGrad)?</li><li>On sparse features (rare events, small-cap names that trade rarely), which method gives larger steps to rare coordinates?</li></ol><h3>Leave with</h3><p>Adaptive methods are preconditioned stochastic subgradient methods. Their convex guarantees are fragile and depend on hyperparameters, while their practical value comes from per-coordinate scaling on badly scaled problems.</p><h3>Equity-QR angle</h3><p>Alpha models trained with Adam on low signal-to-noise returns sit far from the regime where the optimiser theory was developed. Knowing which assumptions fail (bounded gradients, stationarity, the order of choosing hyperparameters and problem) helps you debug unstable training and seed-sensitivity.</p>"
    },
    {
      "id": "cvx-first-order-5",
      "title": "Primal and dual decomposition",
      "minutes": 60,
      "links": [
        {
          "label": "EE364b slides: Primal and dual decomposition",
          "url": "https://web.stanford.edu/class/ee364b/lectures/decomposition_slides.pdf"
        },
        {
          "label": "EE364b notes: Primal and dual decomposition",
          "url": "https://web.stanford.edu/class/ee364b/lectures/decomposition_notes.pdf"
        },
        {
          "label": "EE364b slides: Decomposition applications",
          "url": "https://web.stanford.edu/class/ee364b/lectures/decomposition_apps_slides.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>Complicating variables lead to primal decomposition (master problem over the shared variable). Complicating constraints lead to dual decomposition (master problem over prices).</li><li>In dual decomposition the subgradient of the dual is the constraint residual, so the master step is a price update: raise the price of an over-used resource.</li><li>Recovering a primal feasible point is not automatic when subproblems are not strictly convex.</li></ul><h3>Predict before you read</h3><ol><li>Two sleeves share a gross-exposure limit. Which decomposition applies, and what does the dual variable mean?</li><li>Why does dual decomposition oscillate when a subproblem is linear in its variable?</li><li>What would make the master update converge faster than $O(1/\\sqrt{k})$?</li></ol><h3>Leave with</h3><p>Prices coordinate independent agents: dual decomposition is a subgradient method on the dual, and its weaknesses (slow, needs strict convexity) motivate the augmented Lagrangian and ADMM in a later lesson.</p><h3>Equity-QR angle</h3><p>Multi-PM platforms allocate risk budgets and net trades across books. A shadow price on shared risk, capital or liquidity is exactly the dual variable of the coupling constraint, which is a principled basis for internal risk charges.</p>"
    },
    {
      "id": "cvx-first-order-6",
      "title": "Proximal operators, proximal gradient and acceleration (FISTA)",
      "minutes": 90,
      "links": [
        {
          "label": "EE364b slides: Proximal algorithms",
          "url": "https://web.stanford.edu/~boyd/papers/pdf/prox_slides.pdf"
        },
        {
          "label": "Parikh & Boyd (2014) §1–4 and §6 (prox evaluation): PDF",
          "url": "https://web.stanford.edu/~boyd/papers/pdf/prox_algs.pdf"
        },
        {
          "label": "Beck & Teboulle (2009) — FISTA",
          "url": "https://doi.org/10.1137/080716542"
        },
        {
          "label": "O’Donoghue & Candès (2015) — Adaptive Restart for Accelerated Gradient Schemes",
          "url": "https://doi.org/10.1007/s10208-013-9150-3"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>Three readings of $\\operatorname{prox}_{\\lambda f}$: a generalised projection, a backward (implicit) gradient step, and the resolvent $(I+\\lambda\\partial f)^{-1}$.</li><li>Moreau decomposition $v=\\operatorname{prox}_f(v)+\\operatorname{prox}_{f^*}(v)$ links prox of norms to projections onto dual-norm balls.</li><li>Proximal gradient pays for the smooth part only; the nonsmooth part costs one prox per iteration. Acceleration improves $O(1/k)$ to $O(1/k^2)$ but loses monotonicity.</li></ul><h3>Predict before you read</h3><ol><li>Write the prox of $\\lambda\\|x\\|_1$, of the indicator of a box, and of the indicator of the simplex. Which one needs a sort or a root-find?</li><li>Proximal gradient on a lasso where the design columns are highly correlated (e.g. stock returns sharing a market factor): what controls the iteration count?</li><li>Why does FISTA's objective sometimes go up, and what does restarting do about it?</li></ol><h3>Leave with</h3><p>If the prox of the nonsmooth part is cheap, you can solve the composite problem at nearly the cost of gradient descent on the smooth part. Many portfolio constraints have closed-form or $O(n\\log n)$ proxes.</p><h3>Equity-QR angle</h3><p>Long-only budget weights (simplex projection), position limits (clipping), turnover (soft-thresholding around $w_0$) and sparse signal-combination regressions all reduce to cheap proxes. That makes proximal methods the natural engine for very large or GPU-batched portfolio problems.</p>"
    },
    {
      "id": "cvx-first-order-7",
      "title": "ADMM, operator splitting and OSQP",
      "minutes": 90,
      "links": [
        {
          "label": "EE364b slides: ADMM",
          "url": "https://web.stanford.edu/class/ee364b/lectures/admm_slides.pdf"
        },
        {
          "label": "Boyd et al. (2011) §2–5 and §7 (consensus, sharing): PDF",
          "url": "https://web.stanford.edu/~boyd/papers/pdf/admm_distr_stats.pdf"
        },
        {
          "label": "EE364b slides: Monotone operator splitting methods",
          "url": "https://web.stanford.edu/class/ee364b/lectures/monotone_split_slides.pdf"
        },
        {
          "label": "Stellato et al. (2020) — OSQP (arXiv version)",
          "url": "https://arxiv.org/abs/1711.08013"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>The path dual ascent → method of multipliers → ADMM. The augmented Lagrangian buys robustness, and alternating minimisation restores decomposability.</li><li>Primal and dual residuals as stopping criteria, and how $\\rho$ trades one off against the other.</li><li>OSQP's splitting: one quasi-definite KKT matrix, factored once and reused across iterations and across warm-started re-solves while $\\rho$ is fixed.</li></ul><h3>Predict before you read</h3><ol><li>For a portfolio QP with a $k$-factor model, which matrix does ADMM factor, and what is its size if you introduce factor exposures $y=F^\\top w$?</li><li>What happens to ADMM iterates when the QP is infeasible? Is that useful?</li><li>Why is ADMM fast to modest accuracy and slow to high accuracy, and why is that usually acceptable in a daily rebalance?</li></ol><h3>Leave with</h3><p>ADMM turns a hard problem into repeated easy ones (a linear solve plus a projection). With caching and warm starts, a sequence of similar QPs, such as a backtest, costs little more than a single solve.</p><h3>Equity-QR angle</h3><p>Backtests solve thousands of nearly identical portfolio QPs. OSQP-style ADMM with a factor-model reformulation and warm starts is what makes large parameter sweeps feasible, and its infeasibility certificates flag broken constraint sets (e.g. a neutrality constraint that conflicts with position limits) automatically.</p>"
    }
  ],
  "cheatsheet": [
    {
      "term": "Subgradient",
      "formula": "g\\in\\partial f(x)\\iff f(y)\\ge f(x)+g^\\top(y-x)\\ \\ \\forall y",
      "note": "Exists everywhere in the relative interior of dom f for convex f. Nonsmooth optimality: 0 in the subdifferential (plus normal cone with constraints)."
    },
    {
      "term": "Subgradient of a pointwise max",
      "formula": "f=\\max_i f_i\\ \\Rightarrow\\ \\partial f(x)=\\operatorname{conv}\\bigcup_{i:\\,f_i(x)=f(x)}\\partial f_i(x)",
      "note": "Weak calculus: return the gradient of any one active function."
    },
    {
      "term": "Subgradient method bound",
      "formula": "f^{(k)}_{\\text{best}}-f^\\star\\le\\frac{R^2+G^2\\sum_{i=1}^k\\alpha_i^2}{2\\sum_{i=1}^k\\alpha_i}",
      "note": "R bounds the initial distance, G the subgradient norm. Fixed horizon k with alpha = R/(G sqrt k) gives RG/sqrt k."
    },
    {
      "term": "Polyak step",
      "formula": "\\alpha_k=\\frac{f(x^{(k)})-f^\\star}{\\|g^{(k)}\\|_2^2}",
      "note": "Optimal step when f* is known; with an estimate of f* it becomes a target-level method."
    },
    {
      "term": "Mirror descent step",
      "formula": "x^{k+1}=\\arg\\min_{x\\in C}\\ \\alpha_k g_k^\\top x+D_h(x,x^k),\\quad D_h(x,y)=h(x)-h(y)-\\nabla h(y)^\\top(x-y)",
      "note": "Negative entropy on the simplex gives multiplicative updates and a log n dimension factor."
    },
    {
      "term": "Adam update",
      "formula": "m_t=\\beta_1m_{t-1}+(1-\\beta_1)g_t,\\ v_t=\\beta_2v_{t-1}+(1-\\beta_2)g_t^{2},\\ x_{t+1}=x_t-\\alpha\\frac{\\hat m_t}{\\sqrt{\\hat v_t}+\\epsilon}",
      "note": "Bias corrections divide by 1 - beta^t. Adagrad uses a cumulative sum of squared gradients instead of the exponential average."
    },
    {
      "term": "Proximal operator",
      "formula": "\\operatorname{prox}_{\\lambda f}(v)=\\arg\\min_x\\ f(x)+\\tfrac{1}{2\\lambda}\\|x-v\\|_2^2=(I+\\lambda\\partial f)^{-1}(v)",
      "note": "Prox of an indicator is Euclidean projection. Fixed points of the prox are minimisers of f."
    },
    {
      "term": "Soft thresholding (prox of L1)",
      "formula": "\\left[\\operatorname{prox}_{\\lambda\\|\\cdot\\|_1}(v)\\right]_i=\\operatorname{sign}(v_i)\\max(|v_i|-\\lambda,0)",
      "note": "For a turnover penalty centred at w0, shift: w0 + S_lambda(v - w0)."
    },
    {
      "term": "Simplex projection",
      "formula": "\\Pi_{\\Delta}(v)=(v-\\tau\\mathbf 1)_+,\\quad \\tau:\\ \\mathbf 1^\\top(v-\\tau\\mathbf 1)_+=1",
      "note": "Find tau by sorting (O(n log n)) or by a linear-time pivot method (Duchi et al. 2008, Condat 2016). Box plus budget: clip(v - tau, l, u) with a 1-D root-find."
    },
    {
      "term": "Moreau decomposition",
      "formula": "v=\\operatorname{prox}_{\\lambda f}(v)+\\lambda\\operatorname{prox}_{f^*/\\lambda}(v/\\lambda)",
      "note": "With lambda = 1: prox of a norm = identity minus projection onto the dual-norm unit ball."
    },
    {
      "term": "Proximal gradient and FISTA rates",
      "formula": "F(x^k)-F^\\star\\le\\frac{L\\|x^0-x^\\star\\|^2}{2k}\\ \\ \\text{(ISTA)},\\qquad F(x^k)-F^\\star\\le\\frac{2L\\|x^0-x^\\star\\|^2}{(k+1)^2}\\ \\ \\text{(FISTA)}",
      "note": "Step 1/L for an L-smooth part. Strong convexity mu gives linear rates with factors 1 - mu/L and about 1 - sqrt(mu/L)."
    },
    {
      "term": "Scaled-form ADMM",
      "formula": "x^{+}=\\arg\\min_x f(x)+\\tfrac\\rho2\\|Ax+Bz-c+u\\|^2,\\ z^{+}=\\arg\\min_z g(z)+\\tfrac\\rho2\\|Ax^{+}+Bz-c+u\\|^2,\\ u^{+}=u+Ax^{+}+Bz^{+}-c",
      "note": "Residuals: r = Ax + Bz - c (primal), s = rho A^T B (z+ - z) (dual). Converges for closed proper convex f, g when a saddle point exists."
    },
    {
      "term": "OSQP problem class",
      "formula": "\\min_x\\ \\tfrac12x^\\top Px+q^\\top x\\quad\\text{s.t.}\\quad l\\le Ax\\le u",
      "note": "ADMM with one cached LDL factorisation of [[P + sigma I, A^T], [A, -diag(rho)^-1]]; detects primal and dual infeasibility from iterate differences."
    }
  ],
  "flashcards": [
    {
      "q": "What is $\\partial|x|$ at $x=0$, and what is $\\partial\\|x\\|_2$ at $x=0$?",
      "a": "$[-1,1]$, and the closed unit Euclidean ball. In general, the subdifferential of a norm at 0 is the unit ball of the dual norm."
    },
    {
      "q": "Why does the subgradient method report $f_{\\text{best}}$ rather than the last iterate?",
      "a": "A negative subgradient need not be a descent direction, so $f(x^{(k)})$ can increase. The proof bounds the distance to $x^\\star$, which decreases for small enough steps, not the objective."
    },
    {
      "q": "Lower complexity bound for first-order methods on $G$-Lipschitz convex functions with $\\|x^0-x^\\star\\|\\le R$?",
      "a": "$\\Omega(RG/\\sqrt{k})$ for $k$ up to the dimension: the subgradient method is optimal for this class."
    },
    {
      "q": "Stochastic subgradient: what assumptions on the noisy subgradient $\\tilde g$ does the basic proof use?",
      "a": "Unbiasedness, $\\mathbb E[\\tilde g\\mid x]\\in\\partial f(x)$, and a bound on $\\mathbb E\\|\\tilde g\\|_2^2$. With step sizes square-summable but not summable, $\\mathbb E f_{\\text{best}}\\to f^\\star$."
    },
    {
      "q": "Entropic mirror descent on the $n$-simplex: what replaces $R^2$ and $G$ in the bound?",
      "a": "$R^2$ becomes $\\log n$ (the Bregman radius of the simplex from the uniform point) and $G$ is measured in $\\|\\cdot\\|_\\infty$. This gives roughly $G_\\infty\\sqrt{2\\log n/k}$ versus $G_2\\sqrt{2/k}$ for projected subgradient, where $G_2$ can be $\\sqrt n$ times larger."
    },
    {
      "q": "What is the AMSGrad fix to Adam?",
      "a": "Use $\\hat v_t=\\max(\\hat v_{t-1},v_t)$ in the denominator so effective per-coordinate step sizes never increase. That restores an Adagrad-style regret proof in the online convex setting."
    },
    {
      "q": "Prox of the indicator of the box $[l,u]$?",
      "a": "Coordinatewise clipping: $\\min(\\max(v,l),u)$."
    },
    {
      "q": "Prox of $f(x)=\\tfrac12x^\\top Px+q^\\top x$?",
      "a": "$(I+\\lambda P)^{-1}(v-\\lambda q)$. For a factor model $P=FF^\\top+D$, apply the Woodbury identity for an $O(nk^2)$ solve."
    },
    {
      "q": "In dual decomposition, what is a subgradient of the dual function with respect to the price $\\lambda$ of a coupling constraint $\\sum_i A_ix_i\\le b$?",
      "a": "The residual $\\sum_iA_ix_i^\\star(\\lambda)-b$, evaluated at the subproblem minimisers. The master step is a projected price update."
    },
    {
      "q": "Why does the method of multipliers converge under weaker conditions than dual ascent?",
      "a": "The augmented Lagrangian is strictly convex in the primal along feasible directions, so the dual becomes differentiable with Lipschitz gradient. The step $\\rho$ is a valid step size and needs no strict convexity of $f$."
    },
    {
      "q": "ADMM stopping criteria?",
      "a": "Stop when $\\|r^k\\|_2\\le\\epsilon^{\\text{pri}}$ and $\\|s^k\\|_2\\le\\epsilon^{\\text{dual}}$, with absolute and relative tolerances scaled by $\\sqrt{p}$ and the norms of $Ax$, $Bz$, $c$ and $A^\\top y$."
    },
    {
      "q": "Why does OSQP rarely refactor its KKT matrix?",
      "a": "The matrix depends only on $P$, $A$, $\\sigma$ and $\\rho$. Changing $q$, $l$ or $u$ (new alphas, new bounds) leaves it unchanged. Only adapting $\\rho$ or changing values in $P$ or $A$ forces a numeric refactorisation, and the sparsity pattern lets the symbolic part be reused."
    },
    {
      "q": "FISTA momentum sequence?",
      "a": "$t_{k+1}=\\frac{1+\\sqrt{1+4t_k^2}}{2}$ and $y^{k+1}=x^{k}+\\frac{t_k-1}{t_{k+1}}(x^k-x^{k-1})$, with a proximal-gradient step taken from $y$."
    },
    {
      "q": "Linear convergence of proximal gradient requires what, and what is the rate?",
      "a": "Strong convexity $\\mu$ of the smooth part (or a quadratic-growth / error-bound condition). With step $1/L$ the error contracts by roughly $1-\\mu/L$ per step, and by about $1-\\sqrt{\\mu/L}$ with acceleration."
    }
  ],
  "projects": [
    {
      "id": "cvx-first-order-p1",
      "title": "Four solvers, one sparse tracking problem: subgradient, ISTA/FISTA and ADMM from scratch",
      "level": "core",
      "hours": "8–12",
      "goal": "Implement first-order methods from scratch in NumPy for an L1-regularised index-tracking problem with a long-only budget constraint and a turnover penalty, and check them against CVXPY. Measure empirical rates against theory and see how factor structure in returns (ill-conditioning) controls the iteration count.",
      "data": "Daily total returns for about 100 large US stocks and SPY from yfinance or stooq over 2015–2024 (survivorship and split-adjustment caveats apply; document them). Alternatively, Ken French 49 industry portfolios (daily) tracking the market factor. Public data only, never employer data or code.",
      "steps": [
        "Formulate: minimise (1/T)||Rw - r_SPY||^2 + lambda ||w - w0||_1 subject to w in the simplex (optionally w <= u). Solve with CVXPY (Clarabel) to tolerance 1e-9 as the reference.",
        "Implement the projected subgradient method with diminishing steps and the Polyak step (using the CVXPY optimum as f*); track f_best.",
        "Implement the prox of lambda||w - w0||_1 + indicator(simplex) via a 1-D root-find in the budget multiplier, and unit-test it against CVXPY on 1,000 random vectors.",
        "Implement ISTA, FISTA and FISTA with adaptive (function-value) restart, using a step from a power-iteration estimate of L.",
        "Implement ADMM with splitting w = z (smooth quadratic in w, prox on z), with residual-based stopping and a cached Cholesky factorisation.",
        "Repeat on returns whose market factor is removed (residual returns) to change conditioning, and compare iteration counts."
      ],
      "deliverables": [
        "Tested module with the four solvers and the prox.",
        "Log-log plot of suboptimality versus iteration for all methods, with the theoretical O(1/sqrt k), O(1/k) and O(1/k^2) slopes overlaid.",
        "Table of iterations and wall-clock to reach 1e-4 and 1e-6 relative suboptimality, on raw and factor-residual returns.",
        "Half-page note on which names end exactly at w0 (no trade) and why, using the subdifferential."
      ],
      "acceptance": [
        "The prox unit test passes: max abs difference to CVXPY below 1e-8 on all 1,000 random inputs, and the output always sums to 1 within 1e-10.",
        "FISTA, FISTA-restart and ADMM reach relative suboptimality 1e-6 against the CVXPY optimum; final weights agree with CVXPY to 1e-4 in max norm.",
        "Fitted log-log slopes over the asymptotic range are within 0.2 of -1 for ISTA and -2 for FISTA (or the plot shows linear convergence, if strong convexity holds, and you explain why).",
        "The set of untraded names (|w_i - w0_i| < 1e-8) is identical across FISTA, ADMM and CVXPY.",
        "The report quantifies how removing the market factor changes the estimated condition number and the FISTA iteration count."
      ],
      "extensions": [
        "Replace the squared loss by an L1 (LAD) tracking loss and compare subgradient methods with ADMM using a prox of the absolute loss.",
        "Batch 252 daily problems on a GPU (PyTorch or JAX) using warm-started FISTA and report throughput."
      ]
    },
    {
      "id": "cvx-first-order-p2",
      "title": "A warm-started ADMM QP solver for daily factor-model rebalancing",
      "level": "stretch",
      "hours": "15–25",
      "goal": "Build an OSQP-style ADMM solver specialised to a long-short factor-model portfolio QP (factor exposures as auxiliary variables, box and neutrality constraints, linear transaction costs via a split variable). Run it inside a multi-year daily backtest with warm starts and factorisation caching, and benchmark it against OSQP and an interior-point solver on accuracy, iterations and time.",
      "data": "Simulated universe of 2,000 assets with a factor model calibrated to Ken French daily factors (market, size, value, momentum, plus industries) for loadings and factor covariance, and idiosyncratic vols drawn from a realistic range. Optionally use yfinance prices for a real 500-name universe with a PCA factor model. Public data only.",
      "steps": [
        "Write the QP in variables (w, y, t) with y = F^T w and t >= |w - w0| (or use OSQP-style bounds), and derive the quasi-definite KKT matrix your ADMM will factor.",
        "Implement ADMM with over-relaxation, fixed rho, a cached sparse LDL^T factorisation (scipy or qdldl), and OSQP-style primal and dual infeasibility checks.",
        "Add residual-balancing rho adaptation that triggers a refactorisation only when rho changes by more than a factor of 5.",
        "Run a 3-year daily backtest (about 750 solves) where alphas change daily and the risk model monthly; warm-start from the previous day.",
        "Benchmark against OSQP (same tolerances) and Clarabel on accuracy (objective gap, constraint violation), iterations and time.",
        "Inject an infeasible day (a neutrality constraint contradicting position limits) and test detection."
      ],
      "deliverables": [
        "Solver code with tests.",
        "Per-day iteration and time series for cold versus warm start.",
        "Accuracy table against Clarabel.",
        "Short write-up on where the time goes (factorisation, solves, projections)."
      ],
      "acceptance": [
        "On every backtest day, max weight difference to Clarabel is below 1e-4 and the max constraint violation below 1e-5.",
        "Warm starting cuts the median iteration count by at least 2x and the median solve time by at least 3x relative to cold start.",
        "The injected infeasible day is flagged as primal infeasible with a certificate satisfying the OSQP test at tolerance 1e-4, and the backtest continues.",
        "The number of numeric refactorisations is reported and is below 10% of solves."
      ],
      "extensions": [
        "Add 3/2-power impact costs via an exponential-cone or power-cone free reformulation (e.g. a quadratic upper bound updated by sequential convex programming) and measure the accuracy loss.",
        "Port the ADMM loop to a GPU and compare with published GPU-ADMM results."
      ]
    }
  ],
  "frontier": {
    "asOf": "2026-11",
    "summary": "First-order methods have moved from \"low-accuracy fallback\" to the default for very large or highly repeated convex problems. Restarted primal-dual methods now solve large LPs and QPs on GPUs. Operator-splitting solvers (OSQP, SCS) are routine inside backtests and controllers, and are improved by Anderson acceleration, learned warm starts and differentiation through their fixed points. On the ML side, the convergence theory of adaptive methods has been partly repaired (simple proofs for Adam and Adagrad under explicit hyperparameter conditions), and new optimisers are being derived explicitly as steepest descent under chosen norms, which is mirror-descent thinking applied to neural networks.",
    "threads": [
      {
        "title": "GPU first-order solvers for LP and QP at scale",
        "why": "Restarted primal-dual hybrid gradient (PDLP) and its GPU implementations solve LPs far beyond interior-point memory limits, and the same ideas now extend to convex QPs. ADMM QP solvers have also been ported to GPUs. For portfolio work this opens very large universes, many scenarios and massive parameter sweeps.",
        "refs": [
          {
            "label": "Applegate et al. (2021) — Practical Large-Scale Linear Programming using Primal-Dual Hybrid Gradient",
            "url": "https://arxiv.org/abs/2106.04756"
          },
          {
            "label": "Lu & Yang (2023) — cuPDLP.jl: A GPU Implementation of Restarted PDHG for Linear Programming",
            "url": "https://arxiv.org/abs/2311.12180"
          },
          {
            "label": "Lu & Yang (2023) — A Practical and Optimal First-Order Method for Large-Scale Convex Quadratic Programming",
            "url": "https://arxiv.org/abs/2311.07710"
          },
          {
            "label": "Schubiger, Banjac & Lygeros (2020) — GPU Acceleration of ADMM for Large-Scale Quadratic Programming",
            "url": "https://arxiv.org/abs/1912.04263"
          }
        ]
      },
      {
        "title": "Accelerating and warm-starting splitting methods",
        "why": "ADMM-type methods converge slowly to high accuracy. Safeguarded Anderson acceleration, homogeneous self-dual embeddings, adaptive restarts and learned warm starts all attack this. For backtests the relevant metric is total time over a sequence of related problems, not single-solve time.",
        "refs": [
          {
            "label": "Zhang, O’Donoghue & Boyd (2020) — Globally Convergent Type-I Anderson Acceleration for Nonsmooth Fixed-Point Iterations",
            "url": "https://doi.org/10.1137/18M1232772"
          },
          {
            "label": "O’Donoghue (2021) — Operator Splitting for a Homogeneous Embedding of the Linear Complementarity Problem (SCS 3)",
            "url": "https://doi.org/10.1137/20M1366307"
          },
          {
            "label": "Sambharya, Hall, Amos & Stellato (2023) — Learning to Warm-Start Fixed-Point Optimization Algorithms",
            "url": "https://arxiv.org/abs/2309.07835"
          }
        ]
      },
      {
        "title": "Convergence theory of adaptive optimisers",
        "why": "After counterexamples showed that Adam can fail on simple convex problems, later work gave simple convergence proofs for Adam and Adagrad on smooth nonconvex problems and showed that the failure depends on choosing hyperparameters before the problem. Schedule-free methods revisit averaging and step-size schedules from the online-learning viewpoint.",
        "refs": [
          {
            "label": "Reddi, Kale & Kumar (2018) — On the Convergence of Adam and Beyond",
            "url": "https://arxiv.org/abs/1904.09237"
          },
          {
            "label": "Défossez, Bottou, Bach & Usunier (2022) — A Simple Convergence Proof of Adam and Adagrad",
            "url": "https://arxiv.org/abs/2003.02395"
          },
          {
            "label": "Zhang et al. (2022) — Adam Can Converge Without Any Modification On Update Rules",
            "url": "https://arxiv.org/abs/2208.09632"
          },
          {
            "label": "Defazio et al. (2024) — The Road Less Scheduled",
            "url": "https://arxiv.org/abs/2405.15682"
          }
        ]
      },
      {
        "title": "Optimisers as steepest descent under a chosen norm",
        "why": "Shampoo-style preconditioning and recent \"modular norm\" work derive deep-learning optimisers as steepest descent or mirror descent in geometry adapted to layers. This is the variable-metric idea from EE364b applied at scale.",
        "refs": [
          {
            "label": "Gupta, Koren & Singer (2018) — Shampoo: Preconditioned Stochastic Tensor Optimization",
            "url": "https://arxiv.org/abs/1802.09568"
          },
          {
            "label": "Bernstein & Newhouse (2024) — Old Optimizer, New Norm: An Anthology",
            "url": "https://arxiv.org/abs/2409.20325"
          }
        ]
      },
      {
        "title": "Differentiating through optimisation",
        "why": "Convex optimisation layers let gradients flow through a solver’s solution map. This enables end-to-end tuning of portfolio-construction parameters against realised outcomes. Splitting methods make the derivative computable at scale through their fixed-point equations.",
        "refs": [
          {
            "label": "Agrawal, Amos, Barratt, Boyd, Diamond & Kolter (2019) — Differentiable Convex Optimization Layers",
            "url": "https://arxiv.org/abs/1910.12430"
          }
        ]
      }
    ],
    "openQuestions": [
      "For daily portfolio QPs with 3,000–10,000 names, at what accuracy level does solver error become negligible next to alpha and risk-model error, and does that justify ADMM tolerances of 1e-3 to 1e-4 in production?",
      "Can restarted PDHG-type QP solvers match OSQP warm-start efficiency across a backtest sequence, or does their advantage only appear on single very large instances?",
      "Do the conditions under which Adam provably converges (large beta2, problem-dependent hyperparameters) hold for low signal-to-noise financial targets, and does violating them explain seed sensitivity in return-prediction networks?",
      "Is there a principled mirror map for long-short, gross-constrained portfolios (not the simplex) that gives online-portfolio regret bounds with a mild dependence on dimension and accounts for transaction costs?",
      "When differentiating a backtest through a sequence of portfolio QPs, do implicit-function gradients remain informative near active-set changes, or are smoothed (entropic or interior-point) versions needed?"
    ],
    "brainstorm": [
      "Profile your current backtest optimiser: what fraction of the time is factorisation versus iterations, and how much would warm starting and factor-model reformulation save?",
      "Pick one nonsmooth risk measure you use (CVaR, max drawdown proxy, worst-case regime risk) and design a prox or cheap subgradient for it; compare against the LP reformulation at your universe size.",
      "Re-train a return-prediction model with SGD + momentum, Adam and a schedule-free optimiser under the same tuning budget, and measure the out-of-sample IC dispersion across seeds, not just the mean.",
      "Write a dual-decomposition prototype for allocating a shared risk budget across several sub-strategies and interpret the converged prices as internal risk charges.",
      "Try entropic mirror descent for a long-only allocation across signals or sleeves, with a transaction-cost-aware variant, and compare its regret against a rolling mean-variance allocator."
    ]
  }
}
);
