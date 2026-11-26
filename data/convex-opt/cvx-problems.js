LAB.module("convex-opt", {
  "id": "cvx-problems",
  "order": 3,
  "title": "Convex optimization problems and disciplined convex programming",
  "summary": "B&V chapter 4 and the EE364a \"Convex optimization problems\" deck: standard form, optimality, equivalent reformulations, the LP ⊂ QP ⊂ SOCP ⊂ SDP ladder, GP, vector optimization, then DCP and CVXPY as the discipline that turns modelling into certified convex programs. The equity-QR thread: which portfolio constraints keep you inside this world and which push you out.",
  "sources": [
    {
      "label": "Boyd & Vandenberghe (2004) — Convex Optimization, ch. 4",
      "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
    },
    {
      "label": "EE364a slides, ch. 4: Convex optimization problems",
      "url": "https://web.stanford.edu/class/ee364a/lectures/problems.pdf"
    },
    {
      "label": "Grant, Boyd & Ye (2006) — Disciplined convex programming",
      "url": "https://doi.org/10.1007/0-387-30528-9_7"
    },
    {
      "label": "Diamond & Boyd (2016) — CVXPY: A Python-embedded modeling language for convex optimization (JMLR)",
      "url": "https://jmlr.org/papers/v17/15-408.html"
    },
    {
      "label": "DCP analyzer (interactive ruleset)",
      "url": "https://dcp.stanford.edu/"
    },
    {
      "label": "Lobo, Vandenberghe, Boyd & Lebret (1998) — Applications of second-order cone programming",
      "url": "https://doi.org/10.1016/S0024-3795(98)10032-0"
    }
  ],
  "lessons": [
    {
      "id": "cvx-problems-1",
      "title": "Problems in standard form, convexity, optimality and equivalent reformulations",
      "minutes": 90,
      "links": [
        {
          "label": "B&V §4.1–4.2 (book PDF)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a deck: Convex optimization problems (sections: optimization problems, transforming problems, quasiconvex optimization)",
          "url": "https://web.stanford.edu/class/ee364a/lectures/problems.pdf"
        },
        {
          "label": "Combined slides, 4.2–4.12, 4.30–4.41, 4.50–4.55",
          "url": "https://www.stanford.edu/~boyd/cvxbook/bv_cvxslides.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>B&amp;V call a problem convex only when the <em>description</em> is convex: convex $f_0,f_i$ and affine equalities. A convex feasible set written with nonconvex functions does not count until you rewrite it.</li><li>The first-order criterion $\\nabla f_0(x)^T(y-x)\\ge 0$ for all feasible $y$ (§4.2.3), and the forms it takes when there are no constraints, only equalities ($\\nabla f_0(x)+A^T\\nu=0$), or only the nonnegative orthant.</li><li>Which transformations keep convexity (slack variables, removing equalities, the epigraph form, partial minimization over some variables) and which only keep the optimal set.</li></ul><h3>Predict before you read</h3><ol><li>Minimum variance subject to $\\mu^Tw=m$ versus subject to $\\mu^Tw\\ge m$: when do the two have the same solution, and what does the multiplier's sign tell you?</li><li>If $f_0$ is only quasiconvex, why do bisection and a sequence of convex feasibility problems work where plain gradient descent can stall?</li><li>Partial minimization: if you minimise a jointly convex function over the hedge leg first, is what remains convex in the core book?</li></ol><h3>Leave with</h3><p>Convexity belongs to the formulation, not to the \"real\" problem. Modelling is the work of rewriting until the description is convex, and the reward is that every local optimum is global.</p><h3>Equity-QR angle</h3><p>The epigraph form is how a risk limit turns from a penalty into a hard constraint. Partial minimization is why \"hedge optimally, then size the core book\" stays convex. The optimality criterion is the geometry behind \"no feasible trade direction improves alpha net of risk\".</p>"
    },
    {
      "id": "cvx-problems-2",
      "title": "Linear and linear-fractional programs",
      "minutes": 60,
      "links": [
        {
          "label": "B&V §4.3 (book PDF)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a deck: Convex optimization problems (section: some standard convex problems)",
          "url": "https://web.stanford.edu/class/ee364a/lectures/problems.pdf"
        },
        {
          "label": "B&V exercises 4.8, 4.11, 4.13, 4.15",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>Standard versus inequality form, and the mechanics of converting between them.</li><li>Piecewise-linear minimization and the Chebyshev center: the epigraph trick turns $\\max_i$ into linear inequalities.</li><li>Linear-fractional programs become LPs under the change of variables $y=x/(e^Tx+f)$, $z=1/(e^Tx+f)$ (§4.3.2). This is the same homogenization that later gives you max-Sharpe.</li></ul><h3>Predict before you read</h3><ol><li>How many extra variables and constraints do $\\|Ax-b\\|_1$ and $\\|Ax-b\\|_\\infty$ need as LPs?</li><li>A ratio of affine functions is neither convex nor concave. Why can you still optimise it exactly with one LP?</li><li>An LP rebalance has solutions at vertices. What does that imply about how many names actually trade?</li></ol><h3>Leave with</h3><p>Anything convex and piecewise linear is an LP after the epigraph trick, and ratios of affine functions become LPs after homogenization.</p><h3>Equity-QR angle</h3><p>Turnover ($\\ell_1$), gross leverage, position and sector caps, MAD and CVaR objectives are all LP-representable. Vertex solutions explain why LP-style rebalances concentrate trades: a basic solution has few nonzero trade variables, bounded by the number of active constraints.</p>"
    },
    {
      "id": "cvx-problems-3",
      "title": "QP, QCQP and SOCP, including robust LP and chance constraints",
      "minutes": 80,
      "links": [
        {
          "label": "B&V §4.4 (Markowitz p. 155, robust LP, Example 4.8)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a deck: Convex optimization problems (section: some standard convex problems)",
          "url": "https://web.stanford.edu/class/ee364a/lectures/problems.pdf"
        },
        {
          "label": "Lobo et al. (1998) — Applications of SOCP",
          "url": "https://doi.org/10.1016/S0024-3795(98)10032-0"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>The nesting LP ⊂ convex QP ⊂ convex QCQP ⊂ SOCP. Each step adds one kind of curvature.</li><li>Robust LP in two flavours. The deterministic one, with $a_i$ in an ellipsoid, gives $\\bar a_i^Tx+\\|P_i^Tx\\|_2\\le b_i$. The stochastic one, a Gaussian chance constraint with confidence $\\eta\\ge 1/2$, gives the same shape with $\\Phi^{-1}(\\eta)$ in front of the norm.</li><li>Example 4.8 (a loss-risk constraint) and the remark that it becomes nonconvex once the allowed loss probability goes above $1/2$.</li></ul><h3>Predict before you read</h3><ol><li>$w^T\\Sigma w\\le\\sigma^2$ and $\\|L^Tw\\|_2\\le\\sigma$ (with $\\Sigma=LL^T$) describe the same set. Which form would a conic solver rather see, and why?</li><li>If the uncertain coefficients live in a box rather than an ellipsoid, which norm replaces $\\|\\cdot\\|_2$?</li><li>A chance constraint at 40% confidence: convex or not? Draw the one-asset case.</li></ol><h3>Leave with</h3><p>Making a linear constraint robust to ellipsoidal uncertainty costs one norm term. The price of robustness is a second-order cone.</p><h3>Equity-QR angle</h3><p>Mean–variance with linear constraints is a QP, and adding a volatility cap makes it an SOCP. Robust alpha with ellipsoidal uncertainty adds $\\kappa\\|\\Omega^{1/2}w\\|_2$, a penalty on exposure weighted by estimation error (Goldfarb–Iyengar, Ceria–Stubbs). Parametric VaR limits are chance constraints and stay convex only on the right side of 50%.</p>"
    },
    {
      "id": "cvx-problems-4",
      "title": "Geometric programming",
      "minutes": 45,
      "links": [
        {
          "label": "B&V §4.5 (book PDF)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a deck: Convex optimization problems (section: geometric programming)",
          "url": "https://web.stanford.edu/class/ee364a/lectures/problems.pdf"
        },
        {
          "label": "CVXPY tutorial: disciplined geometric programming",
          "url": "https://www.cvxpy.org/tutorial/dgp/index.html"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>Monomials (positive coefficient, any real exponents) versus posynomials (sums of monomials). The positivity of coefficients carries the whole theory.</li><li>The change of variables $x=e^y$ followed by taking logs. Posynomial constraints become log-sum-exp constraints, which are convex.</li><li>A GP is not convex in its natural variables. It is convex in log coordinates.</li></ul><h3>Predict before you read</h3><ol><li>Is $x^{0.5}y^{-1.2}+3x$ a posynomial? Is $x-y$? Is $\\max(x,y)$ a generalized posynomial?</li><li>What does a monomial equality constraint become after the log transform?</li><li>Why would negative coefficients (signomials) destroy the convex form?</li></ol><h3>Leave with</h3><p>Some nonconvex problems are convex in log coordinates. The test is whether the model is built from products and positive sums.</p><h3>Equity-QR angle</h3><p>GPs are rare in day-to-day portfolio work, but log coordinates are everywhere: log-optimal (Kelly) growth, the log-barrier form of risk parity ($\\min\\tfrac12 w^T\\Sigma w-\\sum_i b_i\\log w_i$), and multiplicative capacity or impact models.</p>"
    },
    {
      "id": "cvx-problems-5",
      "title": "Generalized inequality constraints: conic form and semidefinite programming",
      "minutes": 60,
      "links": [
        {
          "label": "B&V §4.6 (incl. §4.6.3 bounding portfolio risk with incomplete covariance information)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a deck: Convex optimization problems (section: some standard convex problems, SDP)",
          "url": "https://web.stanford.edu/class/ee364a/lectures/problems.pdf"
        },
        {
          "label": "B&V exercises 4.38–4.43",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>Conic form $\\min c^Tx$ subject to $Fx+g\\preceq_K 0$, $Ax=b$, with $K$ a proper cone. LP, SOCP and SDP correspond to the cones $\\mathbb R^m_+$, products of Lorentz cones, and $\\mathbb S^m_+$.</li><li>How to embed LP and SOCP as SDPs (Schur complements), and why you should not do it in practice.</li><li>The §4.6.3 example: the worst-case portfolio variance over covariance matrices that agree with partial information is an SDP in $\\Sigma$.</li></ul><h3>Predict before you read</h3><ol><li>Is $\\lambda_{\\max}(A(x))\\le t$, with $A$ affine, an LMI in $(x,t)$? Is $\\lambda_{\\min}(A(x))\\ge t$?</li><li>You know only bounds on some entries of $\\Sigma$. Is the worst-case variance of a fixed portfolio a max or a min, and what is the decision variable?</li><li>Rank the cost per iteration of interior-point methods for LP, SOCP and SDP of comparable size.</li></ol><h3>Leave with</h3><p>LP ⊂ SOCP ⊂ SDP. Matrix inequalities let you optimise over covariance matrices themselves, not just over portfolios.</p><h3>Equity-QR angle</h3><p>Worst-case risk over a covariance uncertainty set, repairing an indefinite correlation matrix to the nearest valid one, and fitting factor-plus-diagonal covariance structures are all SDPs. B&amp;V §4.6.3 is a ready template for stress-testing risk when some correlations are unknown.</p>"
    },
    {
      "id": "cvx-problems-6",
      "title": "Vector and multicriterion optimization: Pareto curves and scalarization",
      "minutes": 60,
      "links": [
        {
          "label": "B&V §4.7 (incl. §4.7.6 risk–return trade-off)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a deck: Convex optimization problems (section: multicriterion optimization)",
          "url": "https://web.stanford.edu/class/ee364a/lectures/problems.pdf"
        },
        {
          "label": "B&V exercises 4.50–4.55",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>Optimal versus Pareto optimal, and why an optimal point in the vector sense rarely exists.</li><li>Scalarization: minimising $\\lambda^Tf_0(x)$ with $\\lambda\\succ_{K^*}0$ gives Pareto points. For <em>convex</em> problems every Pareto point is reachable with some nonzero $\\lambda\\succeq_{K^*}0$ (§4.7.4). The converse fails without convexity.</li><li>Figure 4.12, the risk–return trade-off, read as the boundary of the set of achievable values.</li></ul><h3>Predict before you read</h3><ol><li>Is minimum variance, as a function of target return, convex? What about minimum volatility?</li><li>With a cardinality constraint, can sweeping risk aversion $\\gamma$ trace every Pareto-efficient portfolio?</li><li>Why do a variance budget, a target return and a risk-aversion weight give the same curve in the convex case?</li></ol><h3>Leave with</h3><p>In convex problems, risk aversion $\\gamma$, a variance budget $\\sigma^2$ and a target return $m$ are three parametrizations of one Pareto curve, linked through multipliers.</p><h3>Equity-QR angle</h3><p>Choose the parametrization by what the mandate fixes. A volatility target (an ε-constraint) is invariant to rescaling the alphas, while a fixed $\\gamma$ silently changes risk whenever the alpha model's scale drifts.</p>"
    },
    {
      "id": "cvx-problems-7",
      "title": "Disciplined convex programming and CVXPY",
      "minutes": 60,
      "links": [
        {
          "label": "EE364a deck: Convex optimization problems (section: disciplined convex programming)",
          "url": "https://web.stanford.edu/class/ee364a/lectures/problems.pdf"
        },
        {
          "label": "Grant, Boyd & Ye (2006) — Disciplined convex programming (author PDF)",
          "url": "https://web.stanford.edu/~boyd/papers/pdf/disc_cvx_prog.pdf"
        },
        {
          "label": "CVXPY tutorial: DCP",
          "url": "https://www.cvxpy.org/tutorial/dcp/index.html"
        },
        {
          "label": "dcp.stanford.edu (interactive DCP analyzer)",
          "url": "https://dcp.stanford.edu/"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>Atoms with known curvature, sign and monotonicity, and the single composition rule that propagates curvature through an expression tree.</li><li>DCP is a <em>sufficient</em> condition. Convex expressions can fail it, for example $\\sqrt{1+x^2}$ written as <code>sqrt(1+square(x))</code>.</li><li>Canonicalization: every DCP problem is rewritten mechanically into conic form (Agrawal et al. 2018), which is why the rules exist. Extensions: DGP, DQCP and DPP for parameters.</li></ul><h3>Predict before you read</h3><ol><li>Is <code>sqrt(quad_form(w, S))</code> DCP? Is <code>norm(L.T @ w)</code>?</li><li>Is <code>inv_pos(c - x)</code> DCP when $c-x$ is affine? When it is concave?</li><li>Only the alpha vector changes between days. What do you gain by declaring it a <code>Parameter</code> rather than rebuilding the problem?</li></ol><h3>Leave with</h3><p>DCP certifies convexity by construction. When a model fails DCP, either it is convex and needs rewriting, or it is not convex and the rejection is telling you something true.</p><h3>Equity-QR angle</h3><p>Production optimisers are parameterized problems re-solved every day. DPP makes re-canonicalization cheap and lets you differentiate the portfolio with respect to alphas and risk inputs (cvxpylayers).</p>"
    }
  ],
  "cheatsheet": [
    {
      "term": "Convex problem (standard form)",
      "formula": "\\min_x f_0(x)\\ \\text{s.t.}\\ f_i(x)\\le 0,\\ i=1,\\dots,m,\\quad Ax=b",
      "note": "f_0, f_i convex and equalities affine. Feasible set convex and every local optimum is global."
    },
    {
      "term": "First-order optimality",
      "formula": "\\nabla f_0(x^\\star)^T(y-x^\\star)\\ge 0\\quad\\forall y\\in\\mathcal X",
      "note": "Differentiable f_0 over a convex feasible set X. With equalities only it becomes ∇f_0 + Aᵀν = 0."
    },
    {
      "term": "Epigraph form",
      "formula": "\\min_{x,t}\\ t\\ \\text{s.t.}\\ f_0(x)-t\\le 0,\\ f_i(x)\\le 0,\\ Ax=b",
      "note": "Every convex problem has a linear objective after this step. It is how penalties become limits."
    },
    {
      "term": "Linear-fractional → LP",
      "formula": "\\min\\frac{c^Tx+d}{e^Tx+f}\\ \\leadsto\\ \\min c^Ty+dz\\ \\text{s.t.}\\ Gy\\preceq hz,\\ Ay=bz,\\ e^Ty+fz=1,\\ z\\ge0",
      "note": "Charnes–Cooper homogenization, B&V §4.3.2."
    },
    {
      "term": "Mean–variance QP",
      "formula": "\\max_w\\ \\mu^Tw-\\tfrac{\\gamma}{2}w^T\\Sigma w\\ \\text{s.t.}\\ \\mathbf 1^Tw=1,\\ Gw\\preceq h",
      "note": "Convex QP when Σ ⪰ 0. Variance budget or target-return versions trace the same Pareto curve."
    },
    {
      "term": "SOC constraint",
      "formula": "\\|A_ix+b_i\\|_2\\le c_i^Tx+d_i",
      "note": "Covers convex QCQP (with c_i = 0) and LP (with A_i = 0)."
    },
    {
      "term": "Robust LP, ellipsoidal uncertainty",
      "formula": "a_i^Tx\\le b_i\\ \\forall a_i\\in\\{\\bar a_i+P_iu:\\|u\\|_2\\le1\\}\\iff \\bar a_i^Tx+\\|P_i^Tx\\|_2\\le b_i",
      "note": "Box uncertainty gives a dual ℓ1 norm and becomes an LP (B&V exercise 4.13)."
    },
    {
      "term": "Gaussian chance constraint",
      "formula": "\\Pr(a^Tx\\le b)\\ge\\eta\\iff \\bar a^Tx+\\Phi^{-1}(\\eta)\\|\\Sigma^{1/2}x\\|_2\\le b",
      "note": "SOC (convex) only for η ≥ 1/2."
    },
    {
      "term": "Robust mean (ellipsoid)",
      "formula": "\\min_{\\mu\\in\\{\\hat\\mu+\\Omega^{1/2}u:\\|u\\|_2\\le\\kappa\\}}\\mu^Tw=\\hat\\mu^Tw-\\kappa\\|\\Omega^{1/2}w\\|_2",
      "note": "Worst-case alpha. With Ω ∝ Σ the solution stays on the nominal (constrained) frontier."
    },
    {
      "term": "Max-Sharpe by homogenization",
      "formula": "\\min_{y,t}\\ y^T\\Sigma y\\ \\text{s.t.}\\ (\\mu-r_f\\mathbf 1)^Ty=1,\\ \\mathbf 1^Ty=t,\\ Ay\\preceq bt,\\ t\\ge0;\\quad w^\\star=y^\\star/t^\\star",
      "note": "Needs a feasible portfolio with positive excess return. Convex constraints g(w) ≤ 0 become perspectives t·g(y/t) ≤ 0."
    },
    {
      "term": "GP in convex form",
      "formula": "\\min_y \\log\\sum_k e^{a_{0k}^Ty+b_{0k}}\\ \\text{s.t.}\\ \\log\\sum_k e^{a_{ik}^Ty+b_{ik}}\\le0,\\ Gy=h",
      "note": "x = e^y; posynomials become log-sum-exp, monomials become affine."
    },
    {
      "term": "SDP (inequality form)",
      "formula": "\\min_x c^Tx\\ \\text{s.t.}\\ x_1F_1+\\cdots+x_nF_n+G\\preceq0,\\ Ax=b",
      "note": "F_i, G ∈ S^k. LP ⊂ SOCP ⊂ SDP."
    },
    {
      "term": "Scalarization",
      "formula": "\\min_x\\ \\lambda^Tf_0(x),\\ \\lambda\\succ_{K^*}0\\ \\Rightarrow\\ x\\ \\text{Pareto optimal}",
      "note": "For convex problems every Pareto point is attained for some nonzero λ ⪰_{K*} 0."
    },
    {
      "term": "DCP composition rule",
      "formula": "h(g_1,\\dots,g_k)\\ \\text{convex if } h \\text{ convex and } \\forall i:\\ g_i\\ \\text{affine, or convex with } h\\uparrow_i,\\ \\text{or concave with } h\\downarrow_i",
      "note": "Monotonicity is that of the extended-value h. Concave rule is symmetric."
    }
  ],
  "flashcards": [
    {
      "q": "When is an optimization problem in standard form called convex in B&V?",
      "a": "When $f_0$ and every $f_i$ are convex and every equality constraint is affine. Convexity of the feasible set alone is not enough."
    },
    {
      "q": "Optimality condition for $min f_0(x)$ s.t. $Ax=b$, $f_0$ convex and differentiable?",
      "a": "$Ax^\\star=b$ and $\\nabla f_0(x^\\star)+A^T\\nu=0$ for some $\\nu$. The gradient is orthogonal to $\\mathcal N(A)$."
    },
    {
      "q": "Optimality condition for $min f_0(x)$ over $xsucceq0$?",
      "a": "$x\\succeq0$, $\\nabla f_0(x)\\succeq0$, and $x_i(\\nabla f_0(x))_i=0$ for all $i$."
    },
    {
      "q": "Change of variables that turns a linear-fractional program into an LP?",
      "a": "$y=x/(e^Tx+f)$, $z=1/(e^Tx+f)$, with the normalization $e^Ty+fz=1$."
    },
    {
      "q": "Robust counterpart of $a^Tx\\le b$ for all $a\\in\\{\\bar a+Pu:\\|u\\|_2\\le 1\\}$?",
      "a": "$\\bar a^Tx+\\|P^Tx\\|_2\\le b$, a second-order cone constraint."
    },
    {
      "q": "Robust counterpart for interval (box) uncertainty $|a_j-\\bar a_j|\\le v_j$?",
      "a": "$\\bar a^Tx+\\sum_j v_j|x_j|\\le b$, which is LP-representable with auxiliary variables."
    },
    {
      "q": "Hyperbolic constraint as an SOC (B&V exercise 4.26)?",
      "a": "$x^Tx\\le yz,\\ y,z\\ge0 \\iff \\left\\|\\begin{bmatrix}2x\\\\ y-z\\end{bmatrix}\\right\\|_2\\le y+z$."
    },
    {
      "q": "For which confidence levels is a Gaussian chance constraint $Pr(a^Txle b)geeta$ convex?",
      "a": "For $\\eta\\ge 1/2$, where $\\Phi^{-1}(\\eta)\\ge0$."
    },
    {
      "q": "Posynomial vs monomial?",
      "a": "Monomial: $c\\,x_1^{a_1}\\cdots x_n^{a_n}$ with $c>0$ and real $a_i$. Posynomial: a sum of monomials."
    },
    {
      "q": "LMI form of $lambda_{max}(A(x))le t$ for affine $A$?",
      "a": "$A(x)\\preceq tI$."
    },
    {
      "q": "Which three parametrizations trace the same convex mean–variance Pareto curve?",
      "a": "Risk aversion $\\gamma$ in $\\mu^Tw-\\tfrac\\gamma2 w^T\\Sigma w$, a variance budget $w^T\\Sigma w\\le\\sigma^2$, and a return target $\\mu^Tw\\ge m$. They are linked by the multipliers."
    },
    {
      "q": "DCP rule: when is $h(g(x))$ convex for scalar $g$?",
      "a": "When $h$ is convex and either $g$ is affine, or $g$ is convex and $h$ is nondecreasing, or $g$ is concave and $h$ is nonincreasing."
    },
    {
      "q": "Why is \"|w_i| ≥ 0.5% or w_i = 0\" not expressible in DCP?",
      "a": "The set is a union of disjoint intervals, so it is nonconvex. It needs binary variables (semicontinuous variables in MIQP)."
    },
    {
      "q": "Equivalent of the cardinality constraint used in MIQP portfolio models?",
      "a": "$|w_i|\\le u_iz_i$, $z_i\\in\\{0,1\\}$, $\\mathbf 1^Tz\\le k$. Its continuous relaxation $z\\in[0,1]^n$ is usually weak."
    }
  ],
  "projects": [
    {
      "id": "cvx-problems-p1",
      "title": "The constrained efficient frontier three ways, and where convexity breaks",
      "level": "core",
      "hours": "8–12",
      "goal": "Build the long-only and long–short constrained mean–variance frontier on public industry data with CVXPY using three parametrizations: risk aversion (QP), variance budget (SOCP) and target return (QP). Show with dual variables that they trace the same Pareto curve, compute max-Sharpe exactly by homogenization, then add a cardinality / minimum-position constraint and document how the frontier, the scalarization argument and DCP all break.",
      "data": "Ken French Data Library: 49 Industry Portfolios (monthly, value-weighted) and the Fama/French 3-factor file for the risk-free rate (https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html). Caveats: industry portfolios are not directly tradable and returns ignore costs. Use public or personal data only, never employer data or code.",
      "steps": [
        "Load monthly returns 1990–2024, use a 120-month estimation window ending in a date of your choice, and estimate μ by the sample mean and Σ by Ledoit–Wolf shrinkage (sklearn). Compute a Cholesky factor L.",
        "Constraints: 1ᵀw = 1, 0 ≤ w ≤ 0.10, and group caps (map the 49 industries to about 8 super-sectors, each ≤ 30%). Second variant: long–short with ‖w‖₁ ≤ 1.6 and |w_i| ≤ 0.10.",
        "Parametrization (a): max μᵀw − (γ/2)wᵀΣw for 40 log-spaced γ. (b): max μᵀw s.t. ‖Lᵀw‖₂ ≤ σ over a σ grid. (c): min wᵀΣw s.t. μᵀw ≥ m over a target grid. Solve with Clarabel or ECOS.",
        "Use the duals: from (b) take the multiplier λ of the risk constraint and check that (a) with γ = λ/σ returns the same portfolio. From (c) relate the multiplier of the return constraint to the slope of the frontier.",
        "Compute max-Sharpe by the homogenized QP (cheatsheet) and compare with a brute-force search along the frontier.",
        "Add a minimum position (w_i = 0 or w_i ≥ 2%) and cardinality ≤ 8. Show that CVXPY rejects the naive expression, then solve on a 15-industry subset either with an MIQP solver (SCIP via PySCIPOpt, or an academic Gurobi licence) or by exhaustive enumeration of supports. Plot the convex and the cardinality-constrained frontiers.",
        "Write five formulations of the same model and record the DCP verdict for each: convex and DCP; convex but not DCP; nonconvex."
      ],
      "deliverables": [
        "Reproducible script or notebook.",
        "Plot in (σ, μ) with the three parametrizations overlaid, plus the cardinality-constrained frontier.",
        "Table mapping γ ↔ λ_risk/σ ↔ return-constraint multiplier for at least 10 frontier points.",
        "One-page note on what breaks with cardinality: the frontier shape, unsupported Pareto points and the DCP verdicts."
      ],
      "acceptance": [
        "For at least 20 matched points, portfolios from (a), (b) and (c) agree to within 1e-4 in the ℓ∞ norm after mapping the parameters through the duals.",
        "The homogenized max-Sharpe portfolio has a Sharpe ratio no lower than the best of a 200-point frontier grid (up to a 1e-6 tolerance), and its weights satisfy every constraint to 1e-7.",
        "Minimum variance as a function of target return has nonnegative discrete second differences (≥ −1e-8) on the convex frontier, and at least one clearly negative second difference, or a jump, under cardinality.",
        "At least one cardinality-constrained Pareto point is shown NOT to minimise μᵀw − (γ/2)wᵀΣw over the cardinality-constrained set for any γ on a dense grid, i.e. an unsupported point.",
        "The DCP table contains at least one convex-but-not-DCP expression with its DCP rewrite, and at least one genuinely nonconvex constraint with an explanation of why."
      ],
      "extensions": [
        "Add proportional transaction costs c‖w − w₀‖₁ to the max-Sharpe numerator and keep it convex via the convex–concave fractional transform (B&V exercise 4.7(c)).",
        "Replace the ℓ∞ position caps by a \"sum of the 5 largest weights ≤ 40%\" constraint using its LP representation (B&V exercise 5.19)."
      ]
    },
    {
      "id": "cvx-problems-p2",
      "title": "Robust versus nominal mean–variance out of sample: ellipsoidal alpha uncertainty as an SOCP",
      "level": "stretch",
      "hours": "15–25",
      "goal": "Run a monthly rolling backtest comparing nominal mean–variance with robust counterparts in which the expected return lies in an ellipsoid (SOCP) or a box (LP). Show numerically when robustification is \"just\" a move along the frontier (Ω ∝ Σ) and when it changes the portfolio genuinely (diagonal or estimation-error Ω), and measure the out-of-sample effect on Sharpe ratio, turnover and concentration with honest uncertainty bands.",
      "data": "Ken French 49 Industry Portfolios, monthly 1970–2024, plus the risk-free rate from the factors file. Optional second universe: about 100 large US stocks from stooq daily data (https://stooq.com/db/h/), with survivorship-bias caveats documented. Use public or personal data only, never employer data or code.",
      "steps": [
        "Rolling 120-month windows with monthly rebalancing. Nominal model: max μ̂ᵀw s.t. ‖Lᵀw‖₂ ≤ σ_target (10% annualised), 1ᵀw = 1, 0 ≤ w ≤ 0.1.",
        "Robust models: max μ̂ᵀw − κ‖Ω^{1/2}w‖₂ under the same constraints, with (i) Ω = Σ̂/T, (ii) Ω = diag(σ̂_i²/T), (iii) Ω equal to the covariance of a shrinkage alpha estimator. Take κ from χ² quantiles (e.g. 50%, 90%, 95%).",
        "Box version: |μ_i − μ̂_i| ≤ κ σ̂_i/√T, which gives an ℓ1-weighted penalty. Solve it as an LP plus the SOC risk constraint.",
        "For (i), find by 1-D search the nominal risk target whose portfolio matches the robust one, and confirm the \"move along the frontier\" claim.",
        "Backtest net of 10 bp one-way costs and record realised returns, turnover, maximum weight and effective number of names.",
        "Measure uncertainty with a stationary block bootstrap (block of about 12 months) for Sharpe ratios and their differences."
      ],
      "deliverables": [
        "Backtest code with every solver call logged (status, solve time).",
        "Table: annualised return, volatility, Sharpe ratio (90% bootstrap CI), turnover and effective N for nominal and at least 4 robust variants.",
        "Figure: the robust portfolios plotted in (σ, μ̂) against the in-sample nominal frontier on three dates.",
        "A short memo stating whether robustness bought anything beyond de-risking, with evidence."
      ],
      "acceptance": [
        "For Ω = Σ̂/T on at least 3 dates, the robust portfolio equals a nominal portfolio at some lower risk target to within 1e-4 in the ℓ∞ norm.",
        "For diagonal Ω, the robust portfolio lies strictly inside the in-sample nominal frontier (distance > 1e-4 in μ̂ at equal σ) on at least one date, which shows a genuine change of shape.",
        "Each Sharpe-ratio difference versus nominal is reported with a block-bootstrap 90% CI. Claims of improvement are made only when the CI excludes 0.",
        "All solves return optimal status with median solve time below 1 s for n = 49."
      ],
      "extensions": [
        "Add covariance uncertainty (spectral-norm ball around Σ̂) as in B&V exercise 4.28(b) and compare.",
        "Replace the ellipsoid with a Wasserstein ball and use the data-driven DRO reformulation of Mohajerin Esfahani & Kuhn (2018)."
      ]
    }
  ],
  "frontier": {
    "asOf": "2026-11",
    "summary": "The modelling layer of convex optimization is mature: DCP and its descendants (DGP, DQCP, DPP, disciplined saddle programming) cover most of what portfolio teams write, and conic solvers (Clarabel, SCS, MOSEK) solve medium problems in milliseconds. The live questions sit at the edges. The first is scale and hardware: first-order primal–dual LP and conic solvers on GPUs. The second is the nonconvex constraints practitioners actually impose (cardinality, minimum lots, fixed costs), now attacked with mixed-integer conic methods and perspective relaxations. The third is uncertainty handled inside the formulation (robust and distributionally robust optimization) rather than by ad hoc shrinkage. The fourth is treating the optimizer as a differentiable, parameterized map that sits inside learning pipelines.",
    "threads": [
      {
        "title": "Disciplined programming beyond DCP",
        "why": "Ruleset-based modelling has been extended to log-log convex (DGP), quasiconvex (DQCP), parameter-affine (DPP, which enables fast re-solves and differentiation) and saddle problems. For a QR this means robust and minimax portfolio problems can be written directly and checked mechanically, instead of being dualized by hand.",
        "refs": [
          {
            "label": "Agrawal, Diamond & Boyd (2019) — Disciplined geometric programming",
            "url": "https://doi.org/10.1007/s11590-019-01422-z"
          },
          {
            "label": "Agrawal & Boyd (2020) — Disciplined quasiconvex programming",
            "url": "https://doi.org/10.1007/s11590-020-01561-8"
          },
          {
            "label": "Agrawal, Amos, Barratt, Boyd, Diamond & Kolter (2019) — Differentiable convex optimization layers",
            "url": "https://arxiv.org/abs/1910.12430"
          },
          {
            "label": "Schiele, Luxenberg & Boyd (2023) — Disciplined saddle programming",
            "url": "https://arxiv.org/abs/2301.13427"
          }
        ]
      },
      {
        "title": "Robust and distributionally robust portfolio construction",
        "why": "Robust counterparts turn uncertainty sets into extra cone constraints: ellipsoids give SOCs, polyhedra give LPs, and Wasserstein balls give tractable reformulations. The open practical issue is calibration. The size and shape of the set decide whether you get real protection or just a lower-risk point on the same frontier.",
        "refs": [
          {
            "label": "Ben-Tal & Nemirovski (1998) — Robust convex optimization",
            "url": "https://doi.org/10.1287/moor.23.4.769"
          },
          {
            "label": "Goldfarb & Iyengar (2003) — Robust portfolio selection problems",
            "url": "https://doi.org/10.1287/moor.28.1.1.14260"
          },
          {
            "label": "Bertsimas & Sim (2004) — The price of robustness",
            "url": "https://doi.org/10.1287/opre.1030.0065"
          },
          {
            "label": "Ceria & Stubbs (2006) — Incorporating estimation errors into portfolio selection: robust portfolio construction",
            "url": "https://doi.org/10.1057/palgrave.jam.2240207"
          },
          {
            "label": "Mohajerin Esfahani & Kuhn (2018) — Data-driven distributionally robust optimization using the Wasserstein metric",
            "url": "https://doi.org/10.1007/s10107-017-1172-1"
          }
        ]
      },
      {
        "title": "Nonconvex portfolio constraints: cardinality, minimum lots, fixed costs",
        "why": "The constraints desks actually want (few names, no dust positions, fixed ticket costs) leave convexity. Mixed-integer QP and conic methods, with perspective reformulations and cutting planes, now solve realistic sizes to certified optimality, while convex heuristics (ℓ1, iterative reweighting, rounding) remain the production default.",
        "refs": [
          {
            "label": "Bienstock (1996) — Computational study of a family of mixed-integer quadratic programming problems",
            "url": "https://doi.org/10.1007/BF02592208"
          },
          {
            "label": "Lobo, Fazel & Boyd (2007) — Portfolio optimization with linear and fixed transaction costs",
            "url": "https://doi.org/10.1007/s10479-006-0145-1"
          },
          {
            "label": "Bertsimas & Cory-Wright (2022) — A scalable algorithm for sparse portfolio selection",
            "url": "https://doi.org/10.1287/ijoc.2021.1127"
          }
        ]
      },
      {
        "title": "Solvers at scale: first-order conic methods and GPUs",
        "why": "Operator-splitting and primal–dual hybrid gradient methods trade the high accuracy of interior-point methods for cheap matrix–vector products, so huge LPs and conic problems now run on GPUs. For portfolio work this matters for large universes, many scenarios and batched what-if solves.",
        "refs": [
          {
            "label": "O'Donoghue, Chu, Parikh & Boyd (2016) — Conic optimization via operator splitting and homogeneous self-dual embedding",
            "url": "https://doi.org/10.1007/s10957-016-0892-3"
          },
          {
            "label": "Applegate et al. (2021) — Practical large-scale linear programming using primal-dual hybrid gradient",
            "url": "https://arxiv.org/abs/2106.04756"
          },
          {
            "label": "Lu & Yang (2023) — cuPDLP.jl: a GPU implementation of restarted PDHG for linear programming",
            "url": "https://arxiv.org/abs/2311.12180"
          },
          {
            "label": "Goulart & Chen (2024) — Clarabel: an interior-point solver for conic programs with quadratic objectives",
            "url": "https://arxiv.org/abs/2405.12762"
          }
        ]
      },
      {
        "title": "Markowitz as an engineering discipline",
        "why": "Recent syntheses argue that well-posed convex formulations (hard risk limits instead of penalties, robust terms, explicit cost models, multi-period structure) settle many classical complaints about mean–variance. They make a good benchmark for your own optimizer design.",
        "refs": [
          {
            "label": "Boyd et al. (2017) — Multi-period trading via convex optimization",
            "url": "https://doi.org/10.1561/2400000023"
          },
          {
            "label": "Boyd, Johansson, Kahn, Schiele & Schmelzer (2024) — Markowitz portfolio construction at seventy",
            "url": "https://doi.org/10.3905/jpm.2024.50.8.117"
          }
        ]
      }
    ],
    "openQuestions": [
      "How should the size and shape of an alpha uncertainty set be calibrated so that a robust portfolio differs from simply targeting lower risk, and can that calibration be validated out of sample without data snooping?",
      "For cardinality-constrained mean–variance with realistic universes (n ≈ 2,000–3,000), how large is the out-of-sample gap between certified MIQP optima and ℓ1 or rounding heuristics once estimation error is accounted for?",
      "Can first-order GPU solvers reach the accuracy needed for stable day-over-day portfolios, or does their solution noise create spurious turnover?",
      "Which nonconvex practitioner constraints (minimum position, round lots, fixed costs) have tight convex relaxations in practice, and can tightness be predicted from data?",
      "How should DPP-parameterized optimizers be regularised when they are differentiated end to end, given that the portfolio map is only piecewise smooth (active-set changes)?"
    ],
    "brainstorm": [
      "Take your current production constraints and classify each one: LP, SOC, SDP-representable, or genuinely nonconvex. For each nonconvex one, estimate what a convex surrogate would cost in expected alpha.",
      "Fit a robust mean–variance model with Ω built from the standard errors of your alpha model, then measure how far the robust portfolios sit from the nominal frontier over time.",
      "Benchmark Clarabel, SCS and a GPU PDLP-type solver on a 3,000-name long–short problem with factor risk and turnover: accuracy versus time versus day-over-day turnover noise.",
      "Build a \"constraint linter\" around CVXPY that flags convex-but-not-DCP expressions and suggests rewrites, using your team's most common modelling mistakes as test cases.",
      "Compare cardinality-constrained portfolios from MIQP with ℓ1-reweighted heuristics on public data, and quantify the realised tracking error and cost difference."
    ]
  }
}
);
