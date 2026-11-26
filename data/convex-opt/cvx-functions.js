LAB.module("convex-opt", {
  "id": "cvx-functions",
  "order": 2,
  "title": "Convex Functions",
  "summary": "B&V chapter 3 with the equity desk in view: how to recognize and certify convexity (first- and second-order conditions, operations and composition rules, DCP), conjugates and perspectives, quasiconvexity, and log-concavity. Applied to the functions a QR actually optimizes: variance and CVaR, transaction-cost and impact models, log-growth and Sharpe ratios, chance constraints.",
  "sources": [
    {
      "label": "Boyd & Vandenberghe (2004), Convex Optimization, ch. 3 (Convex functions) — free PDF",
      "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
    },
    {
      "label": "EE364a slides, deck 3: Convex functions (revised slides by Boyd, Vandenberghe & Nobel)",
      "url": "https://web.stanford.edu/class/ee364a/lectures/functions.pdf"
    },
    {
      "label": "EE364a full slide set (all decks in one PDF)",
      "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxslides.pdf"
    },
    {
      "label": "EE364a additional exercises (cvxgrp/cvxbook_additional_exercises), section 3",
      "url": "https://github.com/cvxgrp/cvxbook_additional_exercises"
    },
    {
      "label": "Rockafellar & Uryasev (2000) — Optimization of conditional value-at-risk",
      "url": "https://doi.org/10.21314/JOR.2000.038"
    },
    {
      "label": "Diamond & Boyd (2016) — CVXPY: a Python-embedded modeling language for convex optimization",
      "url": "https://jmlr.org/papers/v17/15-408.html"
    }
  ],
  "lessons": [
    {
      "id": "cvx-functions-1",
      "title": "Definition, first- and second-order conditions, epigraphs and sublevel sets",
      "minutes": 70,
      "links": [
        {
          "label": "B&V §3.1.1–3.1.4 (definition, extended values, first/second-order conditions) and §3.1.6–3.1.7 (sublevel sets, epigraph)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a deck 3, slides 3.2–3.13",
          "url": "https://web.stanford.edu/class/ee364a/lectures/functions.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>Restriction to a line: a function is convex if and only if it is convex along every line through its domain. This is the most useful test in practice, and the basis of every numerical \"convexity check\".</li><li>The first-order condition says the tangent plane is a global underestimator. It is the reason a local optimum of a convex problem is global.</li><li>Extended-value extensions: treating constraints as $+\\infty$ outside the domain unifies functions and sets (indicator functions).</li><li>Epigraphs connect this chapter to chapter 2: $f$ is convex exactly when $\\operatorname{epi}f$ is a convex set.</li></ul><h3>Predict before you read</h3><ol><li>Is $f(w)=\\sqrt{w^T\\Sigma w}$ (portfolio volatility) convex? Is its Hessian PSD everywhere it exists, and where does it fail to exist?</li><li>Do convex sublevel sets imply convexity? Name a function used in portfolio construction that has convex sublevel sets but is not convex.</li><li>If a function is convex on each coordinate separately, is it convex?</li></ol><h3>Leave with</h3><p>Convexity is a property you check along lines and certify with an underestimating tangent or a PSD Hessian. Every later tool (duality, algorithms, DCP) uses one of these three views.</p><h3>Equity-QR angle</h3><p>Before you trust an optimizer's \"optimal\" output, every term in the objective needs one of these certificates. Variance and volatility pass. A fitted transaction-cost curve with a concave segment, or a risk term built from an indefinite covariance, fails. The solver will not always tell you.</p>"
    },
    {
      "id": "cvx-functions-2",
      "title": "The catalog of convex functions and Jensen's inequality",
      "minutes": 60,
      "links": [
        {
          "label": "B&V §3.1.5 (examples: norms, max, log-sum-exp, geometric mean, log-det, quadratic-over-linear) and §3.1.8–3.1.9 (Jensen, inequalities)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a deck 3, slides 3.3–3.5, 3.11–3.12 and 3.14–3.16 (Jensen, log-normal example)",
          "url": "https://web.stanford.edu/class/ee364a/lectures/functions.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>Log-sum-exp as a smooth max ($\\max_ix_i\\le\\log\\sum_ie^{x_i}\\le\\max_ix_i+\\log n$), and the Hessian proof via Cauchy-Schwarz.</li><li>Quadratic-over-linear $x^2/y$ and the matrix fractional function $x^TY^{-1}x$: the building blocks behind Sharpe-ratio and tracking-error formulations.</li><li>$\\log\\det X$ is concave on $\\mathbb S^n_{++}$. Proving it by restriction to a line is a template worth memorizing.</li><li>Jensen's inequality as the master inequality, and the log-normal example in the slides.</li></ul><h3>Predict before you read</h3><ol><li>For a stock with log-normal gross return, how does $\\log\\mathbb E[R]$ compare with $\\mathbb E[\\log R]$, and how big is the gap at 30% volatility?</li><li>Is the geometric mean of $n$ positive returns concave or convex as a function of the returns?</li><li>Is $x^TY^{-1}x$ jointly convex in $(x,Y)$ or only in $x$?</li></ol><h3>Leave with</h3><p>A small catalog (norms, max, log-sum-exp, powers, entropy, log-det, quadratic-over-linear) plus Jensen covers almost every function you will model. Learn their curvature and domains cold.</p><h3>Equity-QR angle</h3><p>The gap between arithmetic and geometric mean returns, $\\approx\\sigma^2/2$, is Jensen's inequality. It drives the difference between optimizing expected return and optimizing compounded growth, and the volatility drag in leveraged or rebalanced strategies. Joint convexity of $x^2/y$ is what makes \"risk per unit of capital\" and Sharpe-type formulations tractable.</p>"
    },
    {
      "id": "cvx-functions-3",
      "title": "Operations that preserve convexity and disciplined convex programming",
      "minutes": 85,
      "links": [
        {
          "label": "B&V §3.2.1–3.2.5 (weighted sums, affine composition, pointwise max/sup, composition, minimization)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a deck 3, slides 3.18–3.33 (operations, composition rules, DCP, CVXPY)",
          "url": "https://web.stanford.edu/class/ee364a/lectures/functions.pdf"
        },
        {
          "label": "DCP analyzer (interactive)",
          "url": "https://dcp.stanford.edu/"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>Pointwise supremum over an arbitrary family: support functions, max eigenvalue, the sum of the $r$ largest entries (Example 3.6) and worst-case risk all come from it.</li><li>The composition rule $h(g(x))$: memorize the curvature-plus-monotonicity table, and note that monotonicity must hold for the extended-value $h$.</li><li>Partial minimization (§3.2.5): minimizing a jointly convex function over some variables leaves a convex function of the rest. This is the engine behind CVaR, Huber losses and distance to a set.</li><li>DCP is a sufficient rule set (slide \"DCP is only sufficient\"): a convex function written the wrong way is rejected.</li></ul><h3>Predict before you read</h3><ol><li>Is the worst-case portfolio variance $\\max_{\\Sigma\\in\\mathcal U}w^T\\Sigma w$ convex in $w$ for an arbitrary (even nonconvex) set $\\mathcal U$?</li><li>$f(w)=\\big(\\sqrt{w^T\\Sigma w}-\\sigma_{\\rm tgt}\\big)^2$ penalizes deviation from a volatility target. Is it convex? Which composition rule fails?</li><li>Is $\\min_\\zeta\\{\\zeta+\\tfrac1{(1-\\alpha)N}\\sum_i(L_i(w)-\\zeta)_+\\}$ convex in $w$ when the $L_i$ are linear?</li></ol><h3>Leave with</h3><p>Build convex functions from a small set of atoms by composition rules, and let DCP check your work. When DCP rejects a model, either reformulate (most of the time) or you have found a genuine nonconvexity.</p><h3>Equity-QR angle</h3><p>Worst-case risk over a family of risk models, CVaR, sum of the $k$ largest position sizes, and \"distance to the target portfolio\" are all convex by these rules. The volatility-target penalty in the second prediction question is not, so model it as an inequality constraint instead.</p>"
    },
    {
      "id": "cvx-functions-4",
      "title": "Perspective and conjugate functions",
      "minutes": 75,
      "links": [
        {
          "label": "B&V §3.2.6 (perspective) and §3.3 (conjugate: Examples 3.21–3.28, Fenchel inequality, properties)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a deck 3, slides 3.35–3.37",
          "url": "https://web.stanford.edu/class/ee364a/lectures/functions.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>The perspective $g(x,t)=tf(x/t)$ preserves convexity. Quadratic-over-linear, relative entropy and the homogenization tricks for ratios all come from it.</li><li>The conjugate $f^*(y)=\\sup_x(y^Tx-f(x))$ is always convex, being a supremum of affine functions, even when $f$ is not.</li><li>Key pairs: quadratic with quadratic (inverse matrix), norm with indicator of the dual-norm ball, log-sum-exp with negative entropy on the simplex (Example 3.25), indicator with support function.</li><li>Fenchel's inequality $f(x)+f^*(y)\\ge x^Ty$ and $f^{**}=f$ for closed convex $f$.</li></ul><h3>Predict before you read</h3><ol><li>What is the conjugate of a linear-plus-$|x|^{3/2}$ trading cost? Before computing, predict how the optimal trade scales with the alpha.</li><li>The entropic risk measure $\\frac1\\gamma\\log\\mathbb E\\,e^{-\\gamma X}$ is a log-sum-exp over scenarios. What will its conjugate look like?</li></ol><h3>Leave with</h3><p>The conjugate turns \"best response to a price $y$\" into a function of $y$. Whenever you maximize alpha minus cost, its optimal value is a conjugate. Duality in chapter 5 is conjugacy applied systematically.</p><h3>Equity-QR angle</h3><p>The optimal single-name trade under alpha $y$ and cost $c(x)$ has value $c^*(y)$, and its maximizer is $\\nabla c^*(y)$. The shape of the cost curve therefore fixes the trade-size-versus-signal mapping: linear costs give a no-trade band, quadratic costs give trades linear in alpha, and 3/2-power costs give trades quadratic in alpha. Perspectives are what let you maximize a Sharpe ratio by solving a convex problem.</p>"
    },
    {
      "id": "cvx-functions-5",
      "title": "Quasiconvex functions",
      "minutes": 50,
      "links": [
        {
          "label": "B&V §3.4 (definition, properties, differentiable quasiconvex functions, operations, representation via a family of convex functions)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a deck 3, slides 3.39–3.42 (incl. internal rate of return)",
          "url": "https://web.stanford.edu/class/ee364a/lectures/functions.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>Quasiconvexity is a property of sublevel sets only. The modified Jensen inequality uses $\\max$ instead of a weighted average.</li><li>Linear-fractional functions and ratios $p(x)/q(x)$ (convex over positive concave) are quasiconvex; their sublevel sets are convex for every level.</li><li>Representation via a family of convex functions $\\phi_t$ (§3.4.5) is the basis of bisection: each level gives a convex feasibility problem.</li><li>Internal rate of return (slide 3.41) as a quasiconcave function of cash flows.</li></ul><h3>Predict before you read</h3><ol><li>Is the Sharpe ratio $\\mu^Tw/\\sqrt{w^T\\Sigma w}$ concave, quasiconcave, or neither on $\\{\\mu^Tw>0\\}$?</li><li>Does a quasiconvex function have only global minima? Can a quasiconvex function have a stationary point that is not a minimizer?</li><li>Is the sum of two quasiconvex functions quasiconvex?</li></ol><h3>Leave with</h3><p>Ratios (return per risk, cost per unit of alpha, IRR) are usually quasiconvex or quasiconcave, not convex or concave. Optimize them by bisection on convex feasibility problems or by homogenization, never by plugging them into a convex solver as is.</p><h3>Equity-QR angle</h3><p>Maximum-Sharpe and maximum-information-ratio portfolios, the \"alpha per unit of t-cost\" ranking used in trade scheduling, and break-even cost calculations are quasiconvex problems. Sums of them (for example a blended score of two ratios) generally are not.</p>"
    },
    {
      "id": "cvx-functions-6",
      "title": "Log-concave and log-convex functions; convexity with respect to generalized inequalities",
      "minutes": 70,
      "links": [
        {
          "label": "B&V §3.5 (log-concavity; Examples 3.39–3.44: densities, CDFs, yield functions, integration result)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "B&V §3.6 (monotonicity and convexity with respect to generalized inequalities; matrix convexity)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "Not covered in the revised EE364a deck: read the book sections",
          "url": "https://web.stanford.edu/class/ee364a/lectures/functions.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>Log-concavity is preserved by products and, crucially, by integration (marginals and convolutions). Sums of log-concave functions are not log-concave in general.</li><li>CDFs of log-concave densities are log-concave (Example 3.42). Yield functions $\\Pr(x+w\\in S)$ are log-concave for convex $S$ and log-concave noise (Example 3.43).</li><li>Matrix convexity: $X\\mapsto X^{-1}$ is matrix convex on $\\mathbb S^n_{++}$, $X^2$ is matrix convex, and the Schur complement is matrix concave (exercises 3.57–3.58).</li></ul><h3>Predict before you read</h3><ol><li>Which of these densities are log-concave: Gaussian, Laplace, Student-t, log-normal, uniform on a convex set?</li><li>If each stock's idiosyncratic return has a log-concave density and they are independent, is the density of a portfolio's idiosyncratic P&amp;L log-concave?</li><li>Is $\\Pr(r^Tw\\ge t)$ log-concave in $w$ when $r$ is Gaussian? When is the chance constraint $\\Pr(r^Tw\\ge t)\\ge p$ convex?</li></ol><h3>Leave with</h3><p>Log-concavity is the convexity notion for probabilities. It makes yield-type chance constraints convex and maximum-likelihood problems for log-concave families tractable, but it fails for heavy tails, which is exactly where equity risk lives.</p><h3>Equity-QR angle</h3><p>Chance constraints such as \"probability of breaching the risk limit after execution noise is at most 5%\" are convex when the noise is log-concave and the limit set is convex. Heavy-tailed return models (Student-t) are not log-concave, so their convexity, when it holds, comes from elliptical structure, not from §3.5. Matrix convexity of $X^{-1}$ underlies why averaging covariance estimates and then inverting differs systematically from averaging inverses.</p>"
    }
  ],
  "cheatsheet": [
    {
      "term": "Convex function",
      "formula": "f(\\theta x+(1-\\theta)y)\\le\\theta f(x)+(1-\\theta)f(y),\\ \\ \\theta\\in[0,1]",
      "note": "dom f must be convex. Strict and strong convexity tighten the inequality."
    },
    {
      "term": "First-order condition",
      "formula": "f(y)\\ge f(x)+\\nabla f(x)^T(y-x)\\quad\\forall x,y\\in\\operatorname{dom}f",
      "note": "Tangent is a global underestimator: stationary points are global minima."
    },
    {
      "term": "Second-order condition",
      "formula": "\\nabla^2f(x)\\succeq0\\quad\\forall x\\in\\operatorname{dom}f",
      "note": "On an open convex domain. Positive definite Hessian is sufficient, not necessary, for strict convexity."
    },
    {
      "term": "Jensen",
      "formula": "f(\\mathbb E\\,x)\\le\\mathbb E\\,f(x)",
      "note": "Arithmetic vs geometric mean gap ~ sigma^2/2 is Jensen applied to -log."
    },
    {
      "term": "Log-sum-exp bounds",
      "formula": "\\max_ix_i\\le\\log\\textstyle\\sum_{i=1}^ne^{x_i}\\le\\max_ix_i+\\log n",
      "note": "Smooth max; gradient is the softmax."
    },
    {
      "term": "Composition rule (scalar)",
      "formula": "f=h\\circ g\\ \\text{convex if } h \\text{ convex}, \\tilde h\\text{ nondecreasing}, g \\text{ convex}",
      "note": "Or h convex, extended-value h nonincreasing, g concave. This is the core of DCP."
    },
    {
      "term": "Partial minimization",
      "formula": "g(x)=\\inf_{y\\in C}f(x,y)\\ \\text{convex if } f \\text{ jointly convex}, C \\text{ convex}",
      "note": "Gives CVaR, Huber, distance to a set."
    },
    {
      "term": "Perspective",
      "formula": "g(x,t)=t\\,f(x/t),\\ t>0",
      "note": "Convex if f is. x^T x / t and relative entropy are perspectives."
    },
    {
      "term": "Conjugate and Fenchel inequality",
      "formula": "f^*(y)=\\sup_x\\big(y^Tx-f(x)\\big),\\qquad f(x)+f^*(y)\\ge x^Ty",
      "note": "f* is always convex; f** = f for closed convex f."
    },
    {
      "term": "Conjugate of log-sum-exp",
      "formula": "f^*(y)=\\textstyle\\sum_iy_i\\log y_i\\ \\ \\text{on } \\{y\\succeq0,\\ \\mathbf 1^Ty=1\\}",
      "note": "B&V Example 3.25. Underlies softmax policies and entropy pooling duals."
    },
    {
      "term": "CVaR (Rockafellar-Uryasev)",
      "formula": "\\operatorname{CVaR}_\\alpha(L)=\\min_\\zeta\\Big\\{\\zeta+\\tfrac{1}{1-\\alpha}\\mathbb E(L-\\zeta)_+\\Big\\}",
      "note": "Jointly convex in (w, zeta) for L linear in w; the minimizer zeta is a VaR."
    },
    {
      "term": "Linear + 3/2-power cost and its conjugate",
      "formula": "c(x)=a|x|+b|x|^{3/2},\\quad c^*(y)=\\tfrac{4}{27b^2}\\big(|y|-a\\big)_+^3",
      "note": "Optimal trade size (|y|-a)_+^2 * 4/(9b^2): a no-trade band, then trade size quadratic in edge."
    },
    {
      "term": "Quasiconvexity",
      "formula": "f(\\theta x+(1-\\theta)y)\\le\\max\\{f(x),f(y)\\}",
      "note": "Equivalent to convex sublevel sets. Ratios such as Sharpe are quasiconcave."
    },
    {
      "term": "Log-concavity",
      "formula": "f(\\theta x+(1-\\theta)y)\\ge f(x)^\\theta f(y)^{1-\\theta},\\quad f\\nabla^2f\\preceq\\nabla f\\nabla f^T",
      "note": "Preserved by products and integration (marginals, convolution, CDFs)."
    },
    {
      "term": "CRRA utility family (B&V ex. 3.15)",
      "formula": "u_\\alpha(x)=\\frac{x^\\alpha-1}{\\alpha},\\quad \\lim_{\\alpha\\to0}u_\\alpha(x)=\\log x",
      "note": "Relative risk aversion 1 - alpha; log utility is the Kelly criterion."
    }
  ],
  "flashcards": [
    {
      "q": "State the restriction-to-a-line characterization of convexity.",
      "a": "$f$ is convex iff $g(t)=f(x+tv)$ is convex on $\\{t: x+tv\\in\\operatorname{dom}f\\}$ for every $x\\in\\operatorname{dom}f$ and every $v$."
    },
    {
      "q": "Hessian of log-sum-exp, and why it is PSD.",
      "a": "With $z=e^x$: $\\nabla^2f=\\frac{1}{\\mathbf 1^Tz}\\operatorname{diag}(z)-\\frac{1}{(\\mathbf 1^Tz)^2}zz^T$. For any $v$, $v^T\\nabla^2fv\\ge0$ by Cauchy-Schwarz applied to $(v_i\\sqrt{z_i})$ and $(\\sqrt{z_i})$."
    },
    {
      "q": "Is $\\sqrt{w^T\\Sigma w}$ convex for $\\Sigma\\succeq0$? Why?",
      "a": "Yes: it equals $\\|\\Sigma^{1/2}w\\|_2$, a norm composed with a linear map."
    },
    {
      "q": "Composition rule for $h(g(x))$ with $g$ concave.",
      "a": "Convex if $h$ is convex and its extended-value extension is nonincreasing (e.g. $-\\log$ of a concave positive function, $1/g$ for concave positive $g$)."
    },
    {
      "q": "Why is the sum of the $r$ largest entries of $x$ convex?",
      "a": "It is the max of $\\binom nr$ linear functions (sums over all $r$-subsets), so a pointwise max of linear functions (B&V Example 3.6)."
    },
    {
      "q": "Conjugate of $f(x)=\\tfrac12x^TQx$, $Q\\succ0$?",
      "a": "$f^*(y)=\\tfrac12y^TQ^{-1}y$."
    },
    {
      "q": "Conjugate of a norm $\\|x\\|$?",
      "a": "The indicator of the dual-norm unit ball: $0$ if $\\|y\\|_*\\le1$, $+\\infty$ otherwise."
    },
    {
      "q": "What is the perspective of $f(x)=x^Tx$, and where does it show up?",
      "a": "$g(x,t)=x^Tx/t$ for $t>0$: quadratic-over-linear, used to homogenize risk in maximum-Sharpe and leverage-scaled formulations."
    },
    {
      "q": "Give the Rockafellar-Uryasev representation of CVaR and say why it is convex in $w$.",
      "a": "$\\operatorname{CVaR}_\\alpha=\\min_\\zeta\\{\\zeta+\\frac1{1-\\alpha}\\mathbb E(L(w)-\\zeta)_+\\}$. The objective is jointly convex in $(w,\\zeta)$ when $L$ is linear or convex in $w$, so partial minimization over $\\zeta$ keeps convexity."
    },
    {
      "q": "Is the Sharpe ratio $\\mu^Tw/\\|\\Sigma^{1/2}w\\|$ concave? Quasiconcave?",
      "a": "Not concave in general (it is constant along rays and can curve upward along lines that miss the origin). It is quasiconcave on $\\{\\mu^Tw>0\\}$: its superlevel sets $\\{\\mu^Tw\\ge s\\|\\Sigma^{1/2}w\\|\\}$ are second-order cones."
    },
    {
      "q": "Name three operations that preserve log-concavity and one that does not.",
      "a": "Preserved: products, affine composition, integration over some variables (marginals, convolution, CDF). Not preserved: sums."
    },
    {
      "q": "Is the Student-t density log-concave? The log-normal density?",
      "a": "Neither. Student-t has polynomial tails, so log f is eventually convex. For the log-normal, the second derivative of log f becomes positive for large x."
    },
    {
      "q": "Optimal single-name trade size under alpha $y$ and cost $a|x|+b|x|^{3/2}$?",
      "a": "$x^\\star=\\operatorname{sign}(y)\\,\\frac{4}{9b^2}(|y|-a)_+^2$: zero inside the band $|y|\\le a$, quadratic in the excess edge outside it."
    },
    {
      "q": "Merton fraction for utility $u_\\alpha(x)=(x^\\alpha-1)/\\alpha$ under geometric Brownian motion?",
      "a": "$\\pi^\\star=\\frac{\\mu-r}{(1-\\alpha)\\sigma^2}$. Log utility ($\\alpha=0$) gives full Kelly $(\\mu-r)/\\sigma^2$; half-Kelly corresponds to $\\alpha=-1$, outside B&V's $0<\\alpha\\le1$ family."
    },
    {
      "q": "Is $X\\mapsto X^{-1}$ convex on $\\mathbb S^n_{++}$? In what sense?",
      "a": "Yes, matrix convex: $(\\theta X+(1-\\theta)Y)^{-1}\\preceq\\theta X^{-1}+(1-\\theta)Y^{-1}$ (B&V exercise 3.57)."
    }
  ],
  "projects": [
    {
      "id": "cvx-functions-p1",
      "title": "Convexity audit: CVaR, impact costs and variance in one portfolio model",
      "level": "core",
      "hours": "8–12",
      "goal": "Implement the risk and cost functions an equity optimizer uses (variance, volatility, scenario CVaR via Rockafellar-Uryasev, linear plus 3/2-power impact) as DCP expressions. Certify their convexity numerically and analytically, and solve a long-only and a long/short CVaR-plus-impact problem on public data. Show where the minimum-CVaR and minimum-variance solutions differ and why.",
      "data": "Ken French Data Library: 49 industry portfolios, daily returns (free CSV) as assets; optionally about 100 large US stocks from yfinance or stooq (document survivorship and adjustment issues). Daily dollar volume proxies for impact: use yfinance volume times price for stocks, or assume a fixed ADV per industry portfolio and say so. Public data only, never employer data or cost models.",
      "steps": [
        "Build historical-scenario losses L_i(w) = -r_i^T w over a 4-year rolling window; implement CVaR_alpha both by sorting (empirical tail mean) and via the Rockafellar-Uryasev LP in CVXPY.",
        "Write a random-line convexity tester: for random points x, y and theta, check f(theta x + (1-theta) y) <= theta f(x) + (1-theta) f(y) + tol for each function; include a deliberately nonconvex function (empirical VaR, volatility-target penalty) to show the tester catches it.",
        "Implement the cost c(x) = sum_i (a_i |x_i| + b_i |x_i|^{3/2}) with b_i proportional to sigma_i / sqrt(ADV_i); check that CVXPY accepts it as DCP.",
        "Solve: minimize CVaR_0.95 + lambda * cost subject to budget, long-only (then dollar neutral with gross <= 2), and compare with minimum variance over the same constraints across rolling monthly rebalances.",
        "For one date, plot the single-name optimal trade size against alpha for linear, quadratic and 3/2 costs, overlaying the closed form from the conjugate."
      ],
      "deliverables": [
        "Module with each function as a DCP expression plus its NumPy reference implementation, and a test suite.",
        "Table comparing minimum-CVaR and minimum-variance portfolios: realized out-of-sample volatility, realized CVaR, max drawdown, turnover.",
        "Plot of trade size versus alpha for the three cost shapes, with closed forms overlaid.",
        "One-page note on where the two risk measures disagree (which industries, which periods) and why."
      ],
      "acceptance": [
        "LP CVaR equals the sorted empirical tail mean to 1e-8 when (1 - alpha) N is an integer, and the LP zeta lies within the empirical VaR interval (asserted).",
        "The convexity tester reports zero violations above 1e-9 over 10,000 random chords for every convex function, and finds at least one violation for empirical VaR and for the volatility-target penalty.",
        "Numerical single-asset optimal trades match the conjugate closed form to 1e-6 relative error over a grid of alphas.",
        "Out-of-sample comparison covers at least 48 monthly rebalances with identical constraints and cost assumptions across methods."
      ],
      "extensions": [
        "Replace historical scenarios by a filtered-historical-simulation (GARCH-scaled) scenario set and check how the minimum-CVaR weights change.",
        "Add a worst-case variance term over three covariance estimators (sample, Ledoit-Wolf, factor) as a pointwise max, and confirm DCP acceptance."
      ]
    },
    {
      "id": "cvx-functions-p2",
      "title": "Kelly, fractional Kelly and risk-constrained Kelly on factor portfolios",
      "level": "stretch",
      "hours": "15–25",
      "goal": "Treat log-growth as the concave objective it is. Compute growth-optimal (Kelly) allocations across public equity factor portfolios from historical scenarios, compare them with fractional Kelly and with the risk-constrained Kelly formulation of Busseti, Ryu & Boyd (2016), and measure the growth vs. drawdown-probability trade-off out of sample with bootstrap paths.",
      "data": "Ken French Data Library monthly factors (Mkt-RF, SMB, HML, RMW, CMA, Mom) plus the risk-free rate, 1963 onward. Treat factors as long/short portfolios with a stated gross-leverage convention and a stated financing cost. Public data only.",
      "steps": [
        "Build gross-return scenarios R_i(b) = 1 + r_f + r_i^T b for allocation b; maximize the empirical mean of log R_i(b) in CVXPY (DCP: sum of log of affine), with a leverage cap.",
        "Verify concavity and the domain constraint (all R_i(b) > 0); show what happens to the Kelly solution when a single extreme month is included or removed.",
        "Implement fractional Kelly (scaling the Kelly allocation) and the CRRA family u_alpha for alpha < 0; compare allocations with the scaled Kelly solution.",
        "Implement the risk-constrained Kelly problem of Busseti, Ryu & Boyd (2016) for a drawdown target (alpha, beta). Take its convex risk constraint from the paper and check its DCP form.",
        "Evaluate out of sample with a rolling 20-year estimation window and block-bootstrap paths: growth rate, probability of hitting a 30% drawdown, terminal-wealth quantiles."
      ],
      "deliverables": [
        "Script with Kelly, fractional Kelly, CRRA and risk-constrained Kelly solvers plus tests.",
        "Growth vs. drawdown-probability frontier plot for all methods, in sample and out of sample.",
        "Sensitivity table: Kelly weights with and without the single most extreme month.",
        "Short write-up connecting the results to the Kelly vs. Samuelson debate."
      ],
      "acceptance": [
        "All solvers return allocations with every scenario gross return strictly positive (asserted with margin 1e-6).",
        "In sample, the risk-constrained Kelly solution satisfies its drawdown-probability bound under 10,000 bootstrap paths (estimated probability <= beta plus 2 Monte Carlo standard errors).",
        "The empirical log-growth of the Kelly allocation is at least that of every other method in sample (it is the in-sample maximizer); any violation is traced to a solver tolerance.",
        "The out-of-sample evaluation uses no data after each estimation window (index assertion)."
      ],
      "extensions": [
        "Add a Wasserstein or KL ambiguity set around the empirical scenario distribution and solve the distributionally robust Kelly problem.",
        "Compare with a mean-variance allocation calibrated to the same in-sample volatility and explain the differences through the third and fourth moments of the factors."
      ]
    }
  ],
  "frontier": {
    "asOf": "2026-11",
    "summary": "Convex analysis of functions is mature; the frontier is in modeling and in where convexity is imposed. In risk, convex and coherent risk measures (CVaR, entropic, spectral) are standard, and the questions are estimation error in tails and distributional robustness. In trading, empirical impact laws (square-root impact, hence 3/2-power costs) fit convex optimization, but impact decay and cross-impact strain the static convex picture. Log-growth objectives are being revisited with explicit drawdown and ambiguity constraints. On the tooling side, disciplined convex, quasiconvex and geometric programming and differentiable convex layers have made convexity a modeling language usable inside ML pipelines.",
    "threads": [
      {
        "title": "Convex and coherent risk measures",
        "why": "CVaR is the canonical convex, coherent tail measure, and its Rockafellar-Uryasev representation turns tail-risk optimization into an LP over scenarios. Convex risk measures generalize coherence by dropping positive homogeneity, which matters for liquidity-adjusted risk. Current work focuses on tail-estimation error, robust and ambiguity-averse versions, and on how scenario CVaR behaves with few tail observations.",
        "refs": [
          {
            "label": "Artzner, Delbaen, Eber & Heath (1999) — Coherent measures of risk",
            "url": "https://doi.org/10.1111/1467-9965.00068"
          },
          {
            "label": "Föllmer & Schied (2002) — Convex measures of risk and trading constraints",
            "url": "https://doi.org/10.1007/s007800200072"
          },
          {
            "label": "Rockafellar & Uryasev (2000) — Optimization of conditional value-at-risk",
            "url": "https://doi.org/10.21314/JOR.2000.038"
          },
          {
            "label": "Rockafellar & Uryasev (2002) — Conditional value-at-risk for general loss distributions",
            "url": "https://doi.org/10.1016/S0378-4266(02)00271-6"
          },
          {
            "label": "Krokhmal, Palmquist & Uryasev (2002) — Portfolio optimization with conditional value-at-risk objective and constraints",
            "url": "https://doi.org/10.21314/JOR.2002.057"
          }
        ]
      },
      {
        "title": "Market impact: convex cost functions and their limits",
        "why": "The empirical square-root law of impact gives a cost of order sigma |Q|^{3/2}/sqrt(V), a convex power that sits naturally in DCP. Execution models built on convex costs (Almgren-Chriss) are standard, but transient impact, decay kernels and no-dynamic-arbitrage constraints show that the static convex cost is an approximation whose validity depends on horizon and participation.",
        "refs": [
          {
            "label": "Almgren & Chriss (2001) — Optimal execution of portfolio transactions",
            "url": "https://doi.org/10.21314/JOR.2001.041"
          },
          {
            "label": "Tóth, Lempérière, Deremble, de Lataillade, Kockelkoren & Bouchaud (2011) — Anomalous price impact and the critical nature of liquidity in financial markets",
            "url": "https://doi.org/10.1103/PhysRevX.1.021006"
          },
          {
            "label": "Gatheral (2010) — No-dynamic-arbitrage and market impact",
            "url": "https://doi.org/10.1080/14697680903373692"
          },
          {
            "label": "Frazzini, Israel & Moskowitz (2018) — Trading costs (SSRN working paper)",
            "url": "https://doi.org/10.2139/ssrn.3229719"
          }
        ]
      },
      {
        "title": "Log-growth, Kelly and risk-constrained growth",
        "why": "Maximizing expected log wealth is a concave program (exponential cone). The modern line adds explicit control of drawdown probability and estimation error instead of ad hoc fractional Kelly, which keeps the problem convex while addressing the classic objections.",
        "refs": [
          {
            "label": "Kelly (1956) — A new interpretation of information rate",
            "url": "https://doi.org/10.1002/j.1538-7305.1956.tb03809.x"
          },
          {
            "label": "MacLean, Thorp & Ziemba (2010) — Long-term capital growth: the good and bad properties of the Kelly and fractional Kelly capital growth criteria",
            "url": "https://doi.org/10.1080/14697688.2010.506108"
          },
          {
            "label": "Busseti, Ryu & Boyd (2016) — Risk-constrained Kelly gambling",
            "url": "https://arxiv.org/abs/1603.06183"
          }
        ]
      },
      {
        "title": "Convexity as a modeling language: DCP, DQCP and differentiable layers",
        "why": "Disciplined convex programming turned the composition rules of §3.2 into a compiler. Extensions cover quasiconvex problems (bisection handled automatically) and log-log convex problems. Differentiable convex layers let a portfolio optimizer sit inside a gradient-trained pipeline, so predict-then-optimize models can be trained end to end.",
        "refs": [
          {
            "label": "Grant, Boyd & Ye (2006) — Disciplined convex programming",
            "url": "https://doi.org/10.1007/0-387-30528-9_7"
          },
          {
            "label": "Diamond & Boyd (2016) — CVXPY: a Python-embedded modeling language for convex optimization",
            "url": "https://jmlr.org/papers/v17/15-408.html"
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
            "label": "Amos, Xu & Kolter (2017) — Input convex neural networks",
            "url": "https://arxiv.org/abs/1609.07152"
          }
        ]
      },
      {
        "title": "Log-concavity in statistics, sampling and robust optimization",
        "why": "Log-concave densities give unimodality, monotone hazard rates, convex chance constraints and fast sampling guarantees for Langevin methods. Financial returns are heavy-tailed and not log-concave, so a live question is which guarantees survive under weaker structure (elliptical, s-concave). Distributionally robust optimization offers an alternative route to tractable worst-case risk.",
        "refs": [
          {
            "label": "Bagnoli & Bergstrom (2005) — Log-concave probability and its applications",
            "url": "https://doi.org/10.1007/s00199-004-0514-4"
          },
          {
            "label": "Saumard & Wellner (2014) — Log-concavity and strong log-concavity: a review",
            "url": "https://doi.org/10.1214/14-SS107"
          },
          {
            "label": "Dalalyan (2017) — Theoretical guarantees for approximate sampling from smooth and log-concave densities",
            "url": "https://doi.org/10.1111/rssb.12183"
          },
          {
            "label": "Mohajerin Esfahani & Kuhn (2018) — Data-driven distributionally robust optimization using the Wasserstein metric",
            "url": "https://doi.org/10.1007/s10107-017-1172-1"
          }
        ]
      }
    ],
    "openQuestions": [
      "Scenario CVaR at 97.5% on a few years of daily data rests on a handful of observations. What convex regularization of the tail (or what ambiguity set) gives the best out-of-sample CVaR for equity portfolios, and how should its size be chosen?",
      "Square-root impact is concave in order size per share and convex in total cost. Over what horizons and participation rates does a static convex cost remain a good approximation once impact decay and cross-impact between correlated names are included?",
      "Is there a convex objective between log-growth and mean-variance that is robust to fat-tailed estimation error and still keeps the growth-optimality intuition, beyond fractional Kelly?",
      "When an end-to-end trained model differentiates through a convex portfolio layer, which convexity-preserving parametrizations of risk and cost keep the gradients informative rather than degenerate at constraint boundaries?",
      "Which useful non-log-concave return models (Student-t, mixtures) still give convex chance constraints, and can a general structural condition be stated that covers them?"
    ],
    "brainstorm": [
      "Fit your own impact curve on public intraday or daily data (e.g. volume and spreads from free sources) and test whether the 3/2 exponent is stable across liquidity buckets. Where does convexity break?",
      "Compare minimum-CVaR and minimum-variance portfolios on industry portfolios during 2008 and 2020. Is the difference explained by skewness, by kurtosis, or by tail dependence?",
      "Write the conjugate of every cost term in your optimizer and plot the implied trade-size-versus-alpha curve. Does it match what your traders actually do?",
      "Reformulate a maximum-Sharpe portfolio with turnover and sector constraints via homogenization, then via quasiconvex bisection, and compare speed and robustness.",
      "Take a predict-then-optimize pipeline (alpha model then convex optimizer) and train the alpha model through a differentiable CVXPY layer on public data. Does decision-focused training beat MSE training out of sample?"
    ]
  }
}
);
