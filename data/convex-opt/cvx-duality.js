LAB.module("convex-opt", {
  "id": "cvx-duality",
  "order": 4,
  "title": "Duality, KKT and sensitivity",
  "summary": "B&V chapter 5 and the EE364a \"Duality\" deck: Lagrangian and dual function, weak and strong duality, Slater, the geometric and saddle-point views, KKT, perturbation and sensitivity, reformulations, and theorems of alternatives. The equity-QR thread: dual variables as the alpha price of every constraint, KKT as the closed form of mean–variance, and the sensitivity of the optimal book to alpha errors.",
  "sources": [
    {
      "label": "Boyd & Vandenberghe (2004) — Convex Optimization, ch. 5",
      "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
    },
    {
      "label": "EE364a slides, ch. 5: Duality",
      "url": "https://web.stanford.edu/class/ee364a/lectures/duality.pdf"
    },
    {
      "label": "Jagannathan & Ma (2003) — Risk reduction in large portfolios: why imposing the wrong constraints helps",
      "url": "https://doi.org/10.1111/1540-6261.00580"
    },
    {
      "label": "Clarke, de Silva & Thorley (2002) — Portfolio constraints and the fundamental law of active management",
      "url": "https://doi.org/10.2469/faj.v58.n5.2468"
    },
    {
      "label": "Best & Grauer (1991) — On the sensitivity of mean-variance-efficient portfolios to changes in asset means",
      "url": "https://doi.org/10.1093/rfs/4.2.315"
    }
  ],
  "lessons": [
    {
      "id": "cvx-duality-1",
      "title": "The Lagrangian, the dual function and conjugates",
      "minutes": 60,
      "links": [
        {
          "label": "B&V §5.1 (book PDF)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a deck: Duality (section: Lagrangian and dual function)",
          "url": "https://web.stanford.edu/class/ee364a/lectures/duality.pdf"
        },
        {
          "label": "Combined slides, 5.1–5.8",
          "url": "https://www.stanford.edu/~boyd/cvxbook/bv_cvxslides.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>The dual function $g(\\lambda,\\nu)=\\inf_xL(x,\\lambda,\\nu)$ is concave <em>whatever</em> the primal is, because it is a pointwise infimum of affine functions of $(\\lambda,\\nu)$.</li><li>The lower-bound property for $\\lambda\\succeq0$, and the \"linear approximation of the indicator\" picture in §5.1.4.</li><li>For linear constraints, $g$ is expressed through the conjugate $f_0^*$ (§5.1.6). This is the mechanical way to write duals of norm, entropy and log-det problems.</li></ul><h3>Predict before you read</h3><ol><li>For a nonconvex primal (e.g. two-way partitioning, Boolean LP), is $g$ still concave? Is the bound still valid?</li><li>Least-norm $\\min\\|x\\|_2^2$ s.t. $Ax=b$: guess $g(\\nu)$ before you compute it.</li><li>When is $g(\\lambda,\\nu)=-\\infty$, and what does that say about the dual's implicit constraints?</li></ol><h3>Leave with</h3><p>Every choice of multipliers gives a certified lower bound, for any problem, convex or not.</p><h3>Equity-QR angle</h3><p>A Lagrangian relaxation of a cardinality- or round-lot-constrained portfolio gives a provable bound on how much the nonconvex constraint can cost. Penalty versions of constraints (\"risk aversion\", \"turnover penalty\") are Lagrangians with the multiplier fixed in advance.</p>"
    },
    {
      "id": "cvx-duality-2",
      "title": "The dual problem: weak and strong duality, Slater, examples",
      "minutes": 75,
      "links": [
        {
          "label": "B&V §5.2 (book PDF)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a deck: Duality (section: Lagrange dual problem)",
          "url": "https://web.stanford.edu/class/ee364a/lectures/duality.pdf"
        },
        {
          "label": "B&V exercises 5.1, 5.5, 5.13, 5.21",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>Making implicit dual constraints explicit (§5.2.1): the standard-form LP dual appears from $g=-\\infty$ outside $A^T\\nu+c\\succeq0$.</li><li>Slater's condition: strict feasibility of the nonaffine inequalities only. Affine inequalities need not be strict (the refined version).</li><li>Mixed strategies for matrix games (§5.2.5): strong LP duality is the minimax theorem.</li></ul><h3>Predict before you read</h3><ol><li>Does a convex QP with a feasible point always have zero duality gap? What if it is infeasible?</li><li>Does strong duality imply that a dual optimum is attained? (Think of a constraint that is only just feasible.)</li><li>The dual of a QCQP with one quadratic constraint: zero gap even when nonconvex? (See the S-procedure discussion.)</li></ol><h3>Leave with</h3><p>Weak duality is free. Strong duality needs convexity plus a constraint qualification, and Slater is the one to check first.</p><h3>Equity-QR angle</h3><p>Slater fails exactly when a limit is set so tight that the feasible set has no interior: zero tracking error, zero turnover, a lower bound equal to an upper bound. Those are the cases where solvers report garbage duals and shadow prices blow up.</p>"
    },
    {
      "id": "cvx-duality-3",
      "title": "Geometric, saddle-point and price interpretations",
      "minutes": 60,
      "links": [
        {
          "label": "B&V §5.3–5.4 (book PDF)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a deck: Duality (section: Lagrange dual problem)",
          "url": "https://web.stanford.edu/class/ee364a/lectures/duality.pdf"
        },
        {
          "label": "B&V exercises 5.22, 5.24, 5.25",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>The set $\\mathcal G=\\{(f_1(x),f_0(x))\\}$ and its epigraph-like extension $\\mathcal A$: the dual function is a supporting hyperplane, and the duality gap is the non-convexity of the lower boundary.</li><li>The proof of strong duality under Slater via separating hyperplanes (§5.3.2), which uses ch. 2 directly.</li><li>The max–min inequality, saddle points, and the price or tax interpretation (§5.4.4): $\\lambda_i$ is a price per unit of violating constraint $i$.</li></ul><h3>Predict before you read</h3><ol><li>Sketch $\\mathcal A$ for a problem with a duality gap. Where does the best supporting line touch?</li><li>In the price interpretation, why does an optimal price make the firm indifferent to buying or selling constraint slack?</li><li>Is every saddle point of $L$ a primal–dual optimal pair? Is the converse true without strong duality?</li></ol><h3>Leave with</h3><p>Duality is supporting hyperplanes applied to the set of achievable (constraint, objective) values, and multipliers are the prices that make constraint slack tradeable.</p><h3>Equity-QR angle</h3><p>A risk-budget multiplier is the internal price at which the PM should be indifferent between one more unit of risk and the alpha it buys. The geometric picture explains why that price is undefined (non-unique) at kinks of the risk–return frontier.</p>"
    },
    {
      "id": "cvx-duality-4",
      "title": "Optimality conditions: certificates, complementary slackness and KKT",
      "minutes": 75,
      "links": [
        {
          "label": "B&V §5.5 (book PDF)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a deck: Duality (section: KKT conditions)",
          "url": "https://web.stanford.edu/class/ee364a/lectures/duality.pdf"
        },
        {
          "label": "B&V exercises 5.27, 5.29, 5.30, 5.31",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>Duality-gap stopping criteria: a dual feasible point certifies $\\epsilon$-suboptimality (§5.5.1). This is what solvers report.</li><li>Complementary slackness: a positive multiplier forces an active constraint, and a slack constraint forces a zero multiplier.</li><li>KKT conditions are necessary under strong duality and sufficient for convex problems. The water-filling example shows KKT used as an algorithm, not just a check.</li></ul><h3>Predict before you read</h3><ol><li>Write the KKT system for $\\max\\mu^Tw-\\tfrac\\gamma2w^T\\Sigma w$ s.t. $\\mathbf1^Tw=1$. Is it linear?</li><li>Add $w\\succeq0$. Which part of KKT makes the system combinatorial?</li><li>For a nonconvex problem, can a KKT point be a global maximum of the objective you meant to minimise?</li></ol><h3>Leave with</h3><p>For convex problems KKT is the whole story: if you can solve the KKT system, you have solved the problem, and the multipliers come for free.</p><h3>Equity-QR angle</h3><p>The closed-form mean–variance portfolio, the GLS \"alpha orthogonalisation\" behind factor-neutral books, and the active-set structure of long-only portfolios are all KKT statements. KKT residuals are also the right unit test for an in-house optimizer.</p>"
    },
    {
      "id": "cvx-duality-5",
      "title": "Perturbation and sensitivity analysis: shadow prices",
      "minutes": 60,
      "links": [
        {
          "label": "B&V §5.6 (book PDF)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a deck: Duality (section: sensitivity analysis)",
          "url": "https://web.stanford.edu/class/ee364a/lectures/duality.pdf"
        },
        {
          "label": "B&V exercises 5.32, 5.33, 5.35",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>The perturbed problem with $f_i(x)\\le u_i$ and $h_i(x)=v_i$. Its optimal value $p^\\star(u,v)$ is convex for a convex problem.</li><li>The global inequality $p^\\star(u,v)\\ge p^\\star(0,0)-\\lambda^{\\star T}u-\\nu^{\\star T}v$, which holds even without differentiability, and its asymmetric reading (tightening is costly for sure, loosening may help less than predicted).</li><li>Local sensitivity $\\lambda_i^\\star=-\\partial p^\\star/\\partial u_i$ when $p^\\star$ is differentiable, and why the scaling of a constraint changes its multiplier.</li></ul><h3>Predict before you read</h3><ol><li>If a risk constraint is written as $w^T\\Sigma w\\le\\sigma^2$ versus $\\|L^Tw\\|\\le\\sigma$, how are the two multipliers related?</li><li>A constraint has a large multiplier. Is relaxing it guaranteed to improve the objective by multiplier × relaxation?</li><li>For an LP, how does $p^\\star$ depend on a right-hand side: smooth, piecewise linear, or piecewise quadratic?</li></ol><h3>Leave with</h3><p>A multiplier is a local, scale-dependent derivative of the optimal value. The global inequality gives a one-sided bound, not a forecast.</p><h3>Equity-QR angle</h3><p>\"What does the risk budget cost in alpha?\" and \"what is the turnover limit worth?\" are sensitivity questions. Reported shadow prices must be normalised (alpha per unit of risk, bp per 1% turnover) to be comparable across constraints and days.</p>"
    },
    {
      "id": "cvx-duality-6",
      "title": "Reformulations and their duals",
      "minutes": 45,
      "links": [
        {
          "label": "B&V §5.7 (book PDF)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a deck: Duality (section: problem reformulations)",
          "url": "https://web.stanford.edu/class/ee364a/lectures/duality.pdf"
        },
        {
          "label": "B&V exercises 5.17, 5.19",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>Equivalent primals can have very different duals. Introducing a variable $y=Ax+b$ with an equality constraint is the standard way to get a useful dual for unconstrained norm problems.</li><li>Transforming the objective (e.g. $\\|\\cdot\\|$ versus $\\|\\cdot\\|^2$) and making implicit constraints explicit.</li><li>Exercise 5.19: an exponential family of linear inequalities collapses, through LP duality, into a compact representation. This is the template for CVaR and \"top-k\" constraints.</li></ul><h3>Predict before you read</h3><ol><li>What is the dual of unconstrained $\\min\\|Ax-b\\|$ before and after introducing $y=Ax-b$?</li><li>How many inequalities describe \"sum of the 10 largest weights ≤ 40%\" for 500 names, naively and after dualising?</li><li>Why is the robust LP with polyhedral uncertainty (exercise 5.17) an LP and not a semi-infinite program?</li></ol><h3>Leave with</h3><p>Dualising an inner maximisation turns \"for all\" constraints into \"there exist\" constraints. That one move underlies robust optimization and compact risk constraints.</p><h3>Equity-QR angle</h3><p>Concentration limits (top-k weight), CVaR limits and robust constraints with polyhedral uncertainty all become small LPs this way. This is how they enter production optimizers without enumerating scenarios or subsets.</p>"
    },
    {
      "id": "cvx-duality-7",
      "title": "Theorems of alternatives and generalized inequalities",
      "minutes": 60,
      "links": [
        {
          "label": "B&V §5.8–5.9 (incl. Example 5.10 arbitrage-free bounds on price)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a deck: Duality (section: theorems of alternatives)",
          "url": "https://web.stanford.edu/class/ee364a/lectures/duality.pdf"
        },
        {
          "label": "B&V exercises 5.36, 5.38, 5.43",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>Weak alternatives come from the dual function. Strong alternatives need convexity plus a strict-feasibility condition.</li><li>Farkas' lemma as a special case, and Example 5.10: no arbitrage ⇔ existence of a nonnegative state-price vector.</li><li>§5.9: the same machinery with cone multipliers ($\\lambda\\succeq_{K^*}0$), giving SOCP and SDP duals and complementary slackness as $\\operatorname{tr}(ZF(x))=0$.</li></ul><h3>Predict before you read</h3><ol><li>A solver reports \"infeasible\". Which object should it hand you to prove it?</li><li>In a two-scenario, three-asset market (bond, stock, call), why is the option price pinned down uniquely?</li><li>What is the dual cone of the second-order cone? Of $\\mathbb S^n_+$?</li></ol><h3>Leave with</h3><p>Infeasibility and arbitrage have certificates. Exactly one of two linear systems is solvable, and the solvable one proves the other is not.</p><h3>Equity-QR angle</h3><p>Infeasibility certificates tell you which combination of constraints is contradictory when the optimizer fails on rebalance day. The no-arbitrage alternative is the basis of risk-neutral density extraction and of consistency checks on option-implied inputs.</p>"
    }
  ],
  "cheatsheet": [
    {
      "term": "Lagrangian",
      "formula": "L(x,\\lambda,\\nu)=f_0(x)+\\sum_{i=1}^m\\lambda_if_i(x)+\\sum_{i=1}^p\\nu_ih_i(x)",
      "note": "λ ⪰ 0 for inequalities, ν free for equalities."
    },
    {
      "term": "Dual function",
      "formula": "g(\\lambda,\\nu)=\\inf_{x\\in\\mathcal D}L(x,\\lambda,\\nu)\\le p^\\star\\quad(\\lambda\\succeq0)",
      "note": "Always concave, even for nonconvex primals."
    },
    {
      "term": "Dual via conjugate",
      "formula": "\\min f_0(x)\\ \\text{s.t.}\\ Ax\\preceq b,\\ Cx=d:\\quad g(\\lambda,\\nu)=-b^T\\lambda-d^T\\nu-f_0^*(-A^T\\lambda-C^T\\nu)",
      "note": "B&V §5.1.6."
    },
    {
      "term": "LP dual pair",
      "formula": "\\min c^Tx\\ \\text{s.t.}\\ Ax=b,\\ x\\succeq0\\quad\\longleftrightarrow\\quad\\max -b^T\\nu\\ \\text{s.t.}\\ A^T\\nu+c\\succeq0",
      "note": "Strong duality holds whenever either problem is feasible."
    },
    {
      "term": "Slater (refined)",
      "formula": "\\exists x\\in\\operatorname{relint}\\mathcal D:\\ f_i(x)\\lt0\\ (f_i\\ \\text{nonaffine}),\\ f_i(x)\\le0\\ (f_i\\ \\text{affine}),\\ Ax=b",
      "note": "Convex problem + Slater ⇒ zero duality gap and dual optimum attained (if d* > −∞)."
    },
    {
      "term": "Max–min inequality",
      "formula": "\\sup_{z}\\inf_{w}f(w,z)\\le\\inf_{w}\\sup_{z}f(w,z)",
      "note": "Equality with a saddle point ⇔ strong duality with attained optima."
    },
    {
      "term": "KKT conditions",
      "formula": "f_i(x^\\star)\\le0,\\ h_i(x^\\star)=0,\\ \\lambda^\\star\\succeq0,\\ \\lambda_i^\\star f_i(x^\\star)=0,\\ \\nabla f_0+\\sum_i\\lambda_i^\\star\\nabla f_i+\\sum_i\\nu_i^\\star\\nabla h_i=0",
      "note": "Necessary under strong duality (differentiable). Sufficient for convex problems."
    },
    {
      "term": "Global sensitivity",
      "formula": "p^\\star(u,v)\\ge p^\\star(0,0)-\\lambda^{\\star T}u-\\nu^{\\star T}v",
      "note": "Perturbed problem: f_i ≤ u_i, h_i = v_i. Holds under strong duality without differentiability."
    },
    {
      "term": "Local sensitivity",
      "formula": "\\lambda_i^\\star=-\\frac{\\partial p^\\star(0,0)}{\\partial u_i},\\qquad \\nu_i^\\star=-\\frac{\\partial p^\\star(0,0)}{\\partial v_i}",
      "note": "When p* is differentiable at 0. Rescaling a constraint by c > 0 divides its multiplier by c."
    },
    {
      "term": "Mean–variance KKT closed form",
      "formula": "\\max\\ \\mu^Tw-\\tfrac\\gamma2w^T\\Sigma w\\ \\text{s.t.}\\ C^Tw=d:\\ \\ w^\\star=\\tfrac1\\gamma\\Sigma^{-1}(\\mu-C\\theta^\\star),\\ \\theta^\\star=(C^T\\Sigma^{-1}C)^{-1}(C^T\\Sigma^{-1}\\mu-\\gamma d)",
      "note": "θ* = ∂p*/∂d. With d = 0 it is the GLS regression of μ on C with weight Σ⁻¹."
    },
    {
      "term": "Alpha sensitivity (fixed active set)",
      "formula": "\\frac{\\partial w^\\star}{\\partial\\mu}=\\tfrac1\\gamma\\left(\\Sigma^{-1}-\\Sigma^{-1}C_A(C_A^T\\Sigma^{-1}C_A)^{-1}C_A^T\\Sigma^{-1}\\right)",
      "note": "C_A stacks equality and active-inequality normals. Errors are amplified up to 1/(γ λ_min(Σ))."
    },
    {
      "term": "Risk-budget shadow price",
      "formula": "\\max\\alpha^Tw\\ \\text{s.t.}\\ w^T\\Sigma w\\le\\sigma^2:\\ p^\\star=\\sigma\\,\\mathrm{IR},\\ \\lambda^\\star=\\frac{\\mathrm{IR}}{2\\sigma},\\ \\mathrm{IR}=\\sqrt{\\alpha^T\\Sigma^{-1}\\alpha}",
      "note": "Per unit of volatility the price is IR. Equivalent risk aversion γ = 2λ*."
    },
    {
      "term": "Jagannathan–Ma identity",
      "formula": "\\tilde\\Sigma=\\Sigma-(\\lambda\\mathbf1^T+\\mathbf1\\lambda^T),\\quad \\tilde\\Sigma w^\\star=\\nu\\mathbf1",
      "note": "Long-only min variance = unconstrained min variance under a shrunk covariance (λ: multipliers of w ⪰ 0, objective ½wᵀΣw)."
    },
    {
      "term": "Farkas lemma",
      "formula": "\\text{exactly one holds: }\\ \\exists x\\succeq0:\\ Ax=b\\quad\\text{or}\\quad\\exists y:\\ A^Ty\\succeq0,\\ b^Ty\\lt0",
      "note": "Strong alternatives for linear systems."
    },
    {
      "term": "No arbitrage (B&V Ex. 5.10)",
      "formula": "\\nexists x:\\ Vx\\succeq0,\\ p^Tx\\lt0\\iff\\exists y\\succeq0:\\ V^Ty=p",
      "note": "V: scenario payoffs (rows = scenarios), p: prices. y: state prices."
    },
    {
      "term": "Sum of r largest (B&V ex. 5.19)",
      "formula": "\\sum_{i=1}^r x_{[i]}=\\min_{t,u}\\{rt+\\mathbf1^Tu:\\ t\\mathbf1+u\\succeq x,\\ u\\succeq0\\}",
      "note": "Compact LP form of concentration and CVaR-type constraints."
    }
  ],
  "flashcards": [
    {
      "q": "Why is the dual function always concave?",
      "a": "It is a pointwise infimum over $x$ of functions that are affine in $(\\lambda,\\nu)$."
    },
    {
      "q": "Dual of $min x^Tx$ s.t. $Ax=b$?",
      "a": "$g(\\nu)=-\\tfrac14\\nu^TAA^T\\nu-b^T\\nu$, so the dual is $\\max_\\nu -\\tfrac14\\nu^TAA^T\\nu-b^T\\nu$ (unconstrained concave QP)."
    },
    {
      "q": "Dual of the standard-form LP $min c^Tx$, $Ax=b$, $xsucceq0$?",
      "a": "$\\max\\ -b^T\\nu$ s.t. $A^T\\nu+c\\succeq0$."
    },
    {
      "q": "Slater's condition for a convex problem?",
      "a": "There is a point in the relative interior of the domain with $f_i(x)\\lt0$ for nonaffine $f_i$ (affine ones may hold with equality) and $Ax=b$. It implies strong duality and attainment of the dual optimum."
    },
    {
      "q": "Complementary slackness?",
      "a": "$\\lambda_i^\\star f_i(x^\\star)=0$: either the constraint is active or its multiplier is zero."
    },
    {
      "q": "Are KKT conditions sufficient for optimality?",
      "a": "Yes for convex problems with differentiable functions. They are necessary whenever strong duality holds."
    },
    {
      "q": "Global sensitivity inequality?",
      "a": "$p^\\star(u,v)\\ge p^\\star(0,0)-\\lambda^{\\star T}u-\\nu^{\\star T}v$ for the problem perturbed to $f_i\\le u_i$, $h_i=v_i$."
    },
    {
      "q": "If you rescale a constraint $f_i(x)le0$ to $c,f_i(x)le0$ ($c>0$), what happens to its multiplier?",
      "a": "It is divided by $c$. Shadow prices are only meaningful together with the units of the constraint."
    },
    {
      "q": "Shadow price of a variance budget in $maxalpha^Tw$ s.t. $w^TSigma wlesigma^2$?",
      "a": "$\\lambda^\\star=\\mathrm{IR}/(2\\sigma)$ per unit of variance, i.e. $\\mathrm{IR}$ per unit of volatility, with $\\mathrm{IR}=\\sqrt{\\alpha^T\\Sigma^{-1}\\alpha}$."
    },
    {
      "q": "Closed form of $\\max_w \\mu^Tw-\\tfrac{\\gamma}{2}w^T\\Sigma w$ s.t. $\\mathbf{1}^Tw=1$?",
      "a": "$w^\\star=\\tfrac1\\gamma\\Sigma^{-1}(\\mu-\\nu\\mathbf1)$ with $\\nu=(\\mathbf1^T\\Sigma^{-1}\\mu-\\gamma)/(\\mathbf1^T\\Sigma^{-1}\\mathbf1)$."
    },
    {
      "q": "Farkas lemma?",
      "a": "Exactly one of: $Ax=b,\\ x\\succeq0$ is solvable, or $A^Ty\\succeq0,\\ b^Ty\\lt0$ is solvable."
    },
    {
      "q": "No-arbitrage condition in a finite-scenario market?",
      "a": "There is a state-price vector $y\\succeq0$ with $V^Ty=p$ (prices equal state-price-weighted payoffs)."
    },
    {
      "q": "Dual cone of $mathbb S^n_+$ and complementary slackness in SDP?",
      "a": "$\\mathbb S^n_+$ is self-dual. Complementary slackness is $\\operatorname{tr}(Z^\\star F(x^\\star))=0$, equivalently $Z^\\star F(x^\\star)=0$."
    },
    {
      "q": "What does a strictly positive duality gap look like geometrically?",
      "a": "The lower boundary of $\\mathcal A=\\{(u,t):\\exists x,\\ f_1(x)\\le u,\\ f_0(x)\\le t\\}$ is nonconvex near $u=0$, and no supporting line through it reaches $(0,p^\\star)$."
    }
  ],
  "projects": [
    {
      "id": "cvx-duality-p1",
      "title": "Shadow-price report for a constrained mean–variance book",
      "level": "core",
      "hours": "8–12",
      "goal": "Build a monthly long–short optimizer on public data with realistic constraints, extract every dual variable, prove numerically that the duals are correct (KKT residuals, finite-difference sensitivities, an independent hand-derived dual), and turn them into a normalised \"cost of constraints\" report: alpha lost per unit of each limit.",
      "data": "Ken French Data Library: 49 Industry Portfolios (daily for risk, monthly for rebalancing) and the F-F factors for market beta and the risk-free rate. Alpha: a public signal such as 12-1 momentum, cross-sectionally z-scored and scaled as IC × vol × score (Grinold), with an IC of your choice (e.g. 0.03). Use public or personal data only, never employer data or code.",
      "steps": [
        "Estimate Σ from 2 years of daily returns with shrinkage, and betas by regression on the market factor.",
        "Optimizer: max αᵀw subject to 1ᵀw = 0, βᵀw = 0, ‖Lᵀw‖₂ ≤ σ_target (5% annualised), ‖w‖₁ ≤ 2, ‖w − w_prev‖₁ ≤ τ, |w_i| ≤ 0.05. Solve with Clarabel through CVXPY on at least 60 monthly dates.",
        "Extract constraint.dual_value for every constraint, document CVXPY's sign conventions, and normalise: alpha per 1% of volatility, per 0.1 of beta, per 10% of turnover, per 1% of position cap.",
        "Verification 1 (complementary slackness): list every constraint with |slack| and |dual|, and flag violations.",
        "Verification 2 (sensitivity): for each active constraint, re-solve with the right-hand side perturbed by ±δ (δ = 1e-4 relative) and compare one-sided difference quotients with the dual. Explain any mismatch: degeneracy, kinks from ℓ1 terms, or solver tolerance.",
        "Verification 3 (hand-derived dual): for the equality-only version (budget, beta, and γ-penalised risk instead of the risk constraint) derive the dual by hand, solve it in closed form, and match CVXPY.",
        "Plot the time series of normalised shadow prices and relate spikes to market events."
      ],
      "deliverables": [
        "Optimizer and verification code with tests.",
        "Per-date table of slacks, duals and normalised shadow prices.",
        "Figure: shadow-price time series for risk, turnover, beta and the binding position caps.",
        "A one-page \"cost of constraints\" memo with a recommendation on which limit to revisit, and the caveats of local sensitivity."
      ],
      "acceptance": [
        "On at least 3 dates, every non-degenerate active constraint has one-sided finite-difference derivatives within 2% (relative) or 1e-7 (absolute) of its dual value.",
        "Every inactive constraint (slack > 1e-6) has |dual| < 1e-7.",
        "The implied risk aversion γ = λ_risk/σ_target reproduces the risk-constrained portfolio from the penalised problem to within 1e-5 in the ℓ∞ norm.",
        "In the equality-only version, the hand-derived θ* equals the GLS coefficients of α on [1, β] (adjusted by the budget term) and the dual value equals p* to within 1e-8 relative.",
        "At least one degenerate or kinked case is identified and documented, with left and right derivatives that differ."
      ],
      "extensions": [
        "Decompose the ex-post performance gap between the unconstrained and the constrained portfolio into per-constraint contributions (Stubbs & Vandenbussche 2010) and compare with the local dual-based attribution.",
        "Report the transfer coefficient (Clarke, de Silva & Thorley 2002) alongside the shadow prices and test whether they move together."
      ]
    },
    {
      "id": "cvx-duality-p2",
      "title": "Differentiating the optimizer: alpha-error sensitivity, active sets and the transfer coefficient",
      "level": "stretch",
      "hours": "15–25",
      "goal": "Derive and implement the Jacobian ∂w*/∂α of a constrained mean–variance optimizer by implicit differentiation of the KKT system, and verify it against finite differences and CVXPY's differentiation of DPP problems. Use it to predict the utility loss from alpha noise and to show how active constraints change the sensitivity and the transfer coefficient.",
      "data": "Same public data as the core project (Ken French industries + factors), plus fully simulated alphas with known noise levels. Use public or personal data only, never employer data or code.",
      "steps": [
        "Write the KKT system of max αᵀw − (γ/2)wᵀΣw subject to linear equalities and bounds. On a fixed active set, derive ∂w*/∂α in closed form (cheatsheet).",
        "Implement it with NumPy and compare with central finite differences and with CVXPY's solve(requires_grad=True) / backward() on a DPP-compliant model (or cvxpylayers).",
        "Simulate α̂ = α + ε, ε ~ N(0, s²I), for several s. Predict the expected utility loss as (γ/2)·E[Δwᵀ Σ Δw] with Δw = J ε, and compare with Monte Carlo.",
        "Vary the constraint set (none; budget; budget + beta; + long-only; + position caps) and record the rank and spectrum of the Jacobian, the transfer coefficient, and the predicted versus realised loss.",
        "Show where the linear prediction fails (active-set changes) by plotting prediction error against s."
      ],
      "deliverables": [
        "Implicit-differentiation module with tests against finite differences.",
        "Table: constraint set × (Jacobian rank, largest singular value, transfer coefficient, predicted and realised utility loss).",
        "Figure: prediction error of the linearisation against noise level, with the onset of active-set changes marked."
      ],
      "acceptance": [
        "At non-degenerate points the analytic Jacobian matches central finite differences with relative Frobenius error < 1e-4.",
        "The Jacobian equals the projected form (1/γ)(Σ⁻¹ − Σ⁻¹C_A(C_AᵀΣ⁻¹C_A)⁻¹C_AᵀΣ⁻¹) to within 1e-8, with C_A built from the identified active set.",
        "For noise levels at which the active set does not change in at least 95% of draws, the predicted utility loss is within 10% of a 1,000-draw Monte Carlo estimate.",
        "The rank of the Jacobian equals n minus the number of linearly independent active constraints on every tested configuration."
      ],
      "extensions": [
        "Use the Jacobian to build an alpha-error-aware penalty (expected utility loss as a function of w) and compare it with the robust term of the cvx-problems module.",
        "Repeat for the sensitivity to Σ (∂w*/∂Σ) and compare the relative importance of mean and covariance errors with Chopra & Ziemba (1993)."
      ]
    }
  ],
  "frontier": {
    "asOf": "2026-11",
    "summary": "Duality has moved from a proof device to working infrastructure. Primal–dual solvers report certificates of optimality and infeasibility as a matter of course. Implicit differentiation of KKT systems turns optimizers into differentiable layers for end-to-end learning. In portfolio management, dual variables underpin constraint attribution and the \"cost of constraints\", and they explain why seemingly ad hoc limits act as shrinkage of the inputs. The open problems are the ones where the clean local picture breaks: degeneracy and active-set changes, nonconvex constraints with duality gaps, and very large problems solved to low accuracy by first-order methods, where the duals are noisy.",
    "threads": [
      {
        "title": "Differentiable optimization: KKT as a layer",
        "why": "Implicit differentiation of the KKT conditions (or of the conic homogeneous embedding) gives gradients of the optimal portfolio with respect to alphas, risk and constraint data. This enables \"predict-then-optimize\" training and sensitivity reports. The weak point is nondifferentiability at active-set changes.",
        "refs": [
          {
            "label": "Amos & Kolter (2017) — OptNet: differentiable optimization as a layer in neural networks",
            "url": "https://arxiv.org/abs/1703.00443"
          },
          {
            "label": "Agrawal, Amos, Barratt, Boyd, Diamond & Kolter (2019) — Differentiable convex optimization layers",
            "url": "https://arxiv.org/abs/1910.12430"
          }
        ]
      },
      {
        "title": "The cost of constraints in active management",
        "why": "The transfer coefficient measures how much of the alpha signal survives constraints. Implementation efficiency and constraint attribution decompose the alpha given up into contributions from individual constraints, which is the practical form of shadow prices for a PM.",
        "refs": [
          {
            "label": "Clarke, de Silva & Thorley (2002) — Portfolio constraints and the fundamental law of active management",
            "url": "https://doi.org/10.2469/faj.v58.n5.2468"
          },
          {
            "label": "Grinold (2005) — Implementation efficiency",
            "url": "https://doi.org/10.2469/faj.v61.n5.2756"
          },
          {
            "label": "Stubbs & Vandenbussche (2010) — Constraint attribution",
            "url": "https://doi.org/10.3905/jpm.2010.36.4.048"
          }
        ]
      },
      {
        "title": "Constraints as regularization: the dual view of estimation error",
        "why": "KKT shows that long-only and norm constraints are equivalent to shrinking the covariance matrix, which explains their out-of-sample success. The same lens unifies norm-constrained portfolios, ridge-type shrinkage and robust counterparts.",
        "refs": [
          {
            "label": "Jagannathan & Ma (2003) — Risk reduction in large portfolios: why imposing the wrong constraints helps",
            "url": "https://doi.org/10.1111/1540-6261.00580"
          },
          {
            "label": "DeMiguel, Garlappi, Nogales & Uppal (2009) — A generalized approach to portfolio optimization: improving performance by constraining portfolio norms",
            "url": "https://doi.org/10.1287/mnsc.1080.0986"
          }
        ]
      },
      {
        "title": "Primal–dual solvers, certificates and GPUs",
        "why": "Homogeneous self-dual embeddings return either a solution or a certificate of infeasibility or unboundedness (a theorem of alternatives in action). Restarted primal–dual hybrid gradient methods now solve very large LPs on GPUs. The open issue for finance is the accuracy of the duals they return.",
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
          }
        ]
      },
      {
        "title": "Duality inside robust and distributionally robust optimization",
        "why": "Robust counterparts are derived by dualising the inner worst-case problem. The budget-of-uncertainty model and Wasserstein DRO both owe their tractability to strong duality, so the same tools that give shadow prices also give tractable risk-averse portfolio models.",
        "refs": [
          {
            "label": "Ben-Tal & Nemirovski (1999) — Robust solutions of uncertain linear programs",
            "url": "https://doi.org/10.1016/S0167-6377(99)00016-4"
          },
          {
            "label": "Bertsimas & Sim (2004) — The price of robustness",
            "url": "https://doi.org/10.1287/opre.1030.0065"
          },
          {
            "label": "Mohajerin Esfahani & Kuhn (2018) — Data-driven distributionally robust optimization using the Wasserstein metric",
            "url": "https://doi.org/10.1007/s10107-017-1172-1"
          }
        ]
      }
    ],
    "openQuestions": [
      "How should shadow prices be reported when the problem is degenerate and the dual is not unique: pick the minimum-norm dual, report the dual interval, or report one-sided derivatives?",
      "Can local, dual-based constraint attribution be reconciled with ex-post, path-dependent attribution over a multi-period backtest in which constraints bind intermittently?",
      "When an optimizer is trained end to end through its KKT system, how should the gradient be regularised across active-set changes so that learning does not exploit nondifferentiable points?",
      "How accurate are the duals from first-order GPU solvers at the tolerances used in practice, and is that accuracy enough for risk-budget pricing and attribution?",
      "For nonconvex portfolio constraints (cardinality, lots), how large are Lagrangian duality gaps on realistic problems, and do perspective relaxations close them enough to price those constraints?"
    ],
    "brainstorm": [
      "Log the dual of your risk constraint every day for a year. Does its normalised value (alpha per unit of vol) track the realised information ratio of the strategy, or the alpha model's scale drift?",
      "Use the Jagannathan–Ma identity to read off the implied covariance shrinkage produced by your current position limits, and ask whether you would choose that shrinkage deliberately.",
      "Build an \"infeasibility explainer\" that returns the Farkas certificate of a failed rebalance and maps it to the smallest set of contradictory constraints.",
      "Compare the alpha sensitivity Jacobian under your production constraints with the unconstrained one. Which alpha directions does the optimizer amplify, and are those the directions where your alpha model is least reliable?",
      "Turn the shadow prices of a turnover limit into an implied transaction-cost estimate and compare it with your measured costs."
    ]
  }
}
);
