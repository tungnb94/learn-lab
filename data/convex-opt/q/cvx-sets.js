LAB.extend("cvx-sets", {
  "questions": [
    {
      "id": "cvx-sets-q1",
      "type": "derive",
      "difficulty": 2,
      "prompt": "<p>You run a long-only book benchmarked to a universe of $n$ stocks with betas $\\beta\\in\\mathbb R^n$. Risk wants every name held with strictly positive weight, the book fully invested, and a portfolio beta exactly equal to a target $\\beta_{\\rm tgt}$. In matrix form: find $w\\succ0$ with $Aw=b$, where $A=\\begin{bmatrix}\\mathbf 1^T\\\\ \\beta^T\\end{bmatrix}$ and $b=(1,\\beta_{\\rm tgt})$.</p><ol><li>Prove the alternative: there is a $w\\succ 0$ with $Aw=b$ if and only if there is no $\\lambda$ with $A^T\\lambda\\succeq0$, $A^T\\lambda\\ne0$ and $b^T\\lambda\\le0$. Assume $b\\in\\mathcal R(A)$.</li><li>Specialize it. Show that if every beta satisfies $\\beta_i\\ge\\beta_{\\min}>\\beta_{\\rm tgt}$, an explicit $\\lambda$ certifies infeasibility, and read it as a sentence a PM would understand.</li><li>Contrast with the non-strict version ($w\\succeq0$). Construct a universe where $w\\succeq0$ is feasible but $w\\succ0$ is not, and explain why the distinction matters for interior-point methods and for the strict-feasibility assumptions that appear later in duality.</li><li>Add $k$ sector-neutrality rows (benchmark-relative). Describe how you would extract, from a solver's dual output, the smallest subset of rows that is already infeasible.</li></ol>",
      "whyItMatters": "Every \"infeasible\" status from an optimizer has a separating hyperplane behind it. Being able to read that certificate in portfolio language turns a failed rebalance into a one-line diagnosis.",
      "hints": [
        "Follow the hint in B&V exercise 2.20: first characterize the linear functions that are constant on the affine set $\\{w: Aw=b\\}$.",
        "Apply the separating hyperplane theorem to the affine set $\\{w:Aw=b\\}$ and the open convex cone $\\mathbb R^n_{++}$. A hyperplane separating an affine set from something must be constant on the affine set (Example 2.19).",
        "For the beta case try $\\lambda=(-\\beta_{\\min},1)$: then $A^T\\lambda=\\beta-\\beta_{\\min}\\mathbf 1\\succeq0$ and $b^T\\lambda=\\beta_{\\rm tgt}-\\beta_{\\min}<0$."
      ],
      "keyPoints": [
        "Separation of the affine set from $\\mathbb R^n_{++}$ gives $c\\ne0$ with $c^Tw\\le d$ on the affine set and $c^Tw\\ge d$ on the open orthant. That forces $c\\succeq 0$, $c=A^T\\lambda$, $d=b^T\\lambda$, and $d\\le 0$. The converse direction is a one-line contradiction ($0<c^Tw=b^T\\lambda\\le0$).",
        "Beta certificate: $\\lambda=(-\\beta_{\\min},1)$, i.e. \"every stock has beta at least $\\beta_{\\min}$, so any fully invested long-only mix has beta at least $\\beta_{\\min}$\". Nonzero $A^T\\lambda$ needs at least one beta strictly above $\\beta_{\\min}$; if all betas equal the target, every $w\\succ0$ works.",
        "Non-strict example: one stock with beta exactly $\\beta_{\\rm tgt}$ and all others strictly above. Then $w=e_i$ is feasible, but no strictly positive $w$ exists. The feasible set has empty relative interior relative to the orthant, so interior-point methods and Slater-type conditions fail.",
        "Strict positivity is a relative-interior statement about the intersection of the affine set with the orthant, not a full-dimensional interior statement, because the equality constraints already remove dimensions.",
        "For subset extraction: the support of the certificate (rows with nonzero $\\lambda_j$) is a conflicting subset. Minimal subsets can be found by minimizing $\\|\\lambda\\|_1$ over normalized certificates, which is an LP."
      ],
      "followUps": [
        "Generalize to $w$ in a box $[\\ell,u]$ (position limits) and derive the corresponding certificate. What role do the box multipliers play?",
        "Formulate the \"smallest relaxation of $\\beta_{\\rm tgt}$ and sector bands that restores feasibility\" as an LP. How is its dual related to the certificate?"
      ],
      "source": {
        "label": "B&V exercise 2.20 (adapted) — strictly positive solution of linear equations",
        "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf",
        "relation": "adapted from"
      }
    },
    {
      "id": "cvx-sets-q2",
      "type": "counterexample",
      "difficulty": 2,
      "prompt": "<p>A risk team proposes the constraints below for a long/short equity book with weights $w\\in\\mathbb R^n$. For each one, decide whether the feasible set is convex. If it is not, give an explicit two-point counterexample with small numbers, then give the convex hull or a tight convex inner or outer approximation and say which.</p><ol><li>Cardinality: at most $K$ nonzero positions, together with $|w_i|\\le u$.</li><li>Minimum holding: each $w_i\\in\\{0\\}\\cup[m,u]$ (long-only side).</li><li>Active-risk band: $\\sigma_{\\rm lo}\\le\\|\\Sigma^{1/2}(w-w_b)\\|_2\\le\\sigma_{\\rm hi}$.</li><li>Long/short ratio cap: total longs at most $1.2\\times$ total shorts, i.e. $\\sum_i(w_i)_+\\le1.2\\sum_i(w_i)_-$.</li><li>Scenario VaR: the 95% empirical VaR of the portfolio loss over historical scenarios is at most $c$.</li><li>Gross exposure pinned: $\\|w\\|_1=L$.</li></ol>",
      "whyItMatters": "Nonconvex constraints silently break solver guarantees, warm starts and the meaning of dual prices. Spotting them, and knowing the convex replacement, is a core skill for owning an optimizer.",
      "hints": [
        "For each set, look for two feasible points whose midpoint violates the constraint. Points that are symmetric about the origin, or about $w_b$, are a good first try.",
        "Rewrite the ratio cap with $\\sum(w_i)_+=\\tfrac12(\\|w\\|_1+\\mathbf 1^Tw)$ and $\\sum(w_i)_-=\\tfrac12(\\|w\\|_1-\\mathbf 1^Tw)$, and see which side of the inequality the convex function lands on.",
        "For VaR use two assets that each lose 100 with probability 4%, independently. Compare the 95% VaR of each alone with that of the 50/50 mix."
      ],
      "keyPoints": [
        "Cardinality: $e_1,e_2$ feasible for $K=1$, midpoint has two nonzeros. With the box, $\\operatorname{conv}=\\{\\|w\\|_\\infty\\le u,\\ \\|w\\|_1\\le Ku\\}$: exactly the convex hull, which is why $\\ell_1$ penalties appear as cardinality surrogates.",
        "Minimum holding: $0$ and $m$ feasible, $m/2$ not. The hull is $[0,u]$; the exact formulation needs a binary variable, with $m z_i\\le w_i\\le u z_i$.",
        "Risk band: the upper bound is an ellipsoid (convex), the lower bound is the complement of one. $w_b\\pm d$ are feasible, but the midpoint $w_b$ has zero active risk. Hull is the outer ellipsoid.",
        "Ratio cap becomes $11\\,\\mathbf 1^Tw\\le\\|w\\|_1$, a superlevel set of a convex function. Example: $(1,-0.9)$ and $(-0.9,1)$ satisfy it (1.1 <= 1.9), but the midpoint $(0.05,0.05)$ gives 1.1 > 0.1. Pinning net exposure does not rescue it for positive net: it becomes a minimum-gross requirement.",
        "VaR: each bond alone has 95% VaR 0 (default probability 4% < 5%). For the 50/50 mix, P(loss >= 50) = 1 - 0.96^2 = 7.84% > 5%, so VaR is 50 and the set $\\{\\text{VaR}\\le0\\}$ is not convex. The standard convex inner approximation is $\\text{CVaR}_{0.95}\\le c$, since CVaR >= VaR.",
        "$\\|w\\|_1=L$ contains $\\pm Le_1$ but not their midpoint; hull is the ball $\\|w\\|_1\\le L$. Gross is usually best as an inequality, perhaps with a penalty to encourage using it."
      ],
      "followUps": [
        "For the VaR case, show that if returns are jointly Gaussian (or elliptical) and the level is above 50%, the VaR constraint becomes a second-order cone constraint. What exactly breaks for empirical scenarios?",
        "Which of the six sets become convex if you are allowed to fix the signs of all positions in advance (long names and short names chosen)? Why does that observation underlie many production heuristics?"
      ],
      "source": {
        "label": "Motivated by Artzner, Delbaen, Eber & Heath (1999) — Coherent measures of risk (VaR fails subadditivity) and B&V §2.1–2.3",
        "url": "https://doi.org/10.1111/1467-9965.00068",
        "relation": "motivated by"
      }
    },
    {
      "id": "cvx-sets-q3",
      "type": "predict",
      "difficulty": 2,
      "prompt": "<p>You stress-test a book by letting an adversary reweight historical scenarios. Scenario P&amp;L values $a_1<\\dots<a_N$ are fixed, and the adversary chooses probabilities $p$ in the simplex $\\{p\\succeq0,\\ \\mathbf 1^Tp=1\\}$ subject to \"plausibility views\". For each view below, <strong>predict first</strong> whether the set of admissible $p$ is convex, then justify. Let $x$ denote the P&amp;L under $p$.</p><ol><li>$\\mathbb E\\,f(x)\\ge\\alpha$ for a given function $f$.</li><li>$\\Pr(x<\\alpha)\\le\\beta$ (tail mass not too large).</li><li>$\\mathbb E\\,x^2\\le\\alpha$ and, separately, $\\mathbb E\\,x^2\\ge\\alpha$.</li><li>$\\operatorname{var}(x)\\le\\alpha$ and, separately, $\\operatorname{var}(x)\\ge\\alpha$.</li><li>Lower quartile of $x$ at least $\\alpha$, and separately at most $\\alpha$.</li></ol><p>Then explain the apparent paradox: as a function of portfolio <em>weights</em>, a variance cap is a convex constraint. As a function of scenario <em>probabilities</em>, the variance cap is the nonconvex one.</p>",
      "whyItMatters": "Distributionally robust stress tests and scenario reweighting schemes (entropy pooling, fully flexible probabilities) are convex only for some view types. Choosing views that keep the problem convex is what keeps the worst case computable.",
      "hints": [
        "Write each condition in terms of $p$. Anything of the form $c^Tp\\le d$ is a halfspace.",
        "Variance in $p$ is $\\sum_ip_ia_i^2-(\\sum_ip_ia_i)^2$: a linear function minus the square of a linear function. What is the curvature?",
        "Quartile conditions are statements about cumulative probabilities at fixed points. Express them as one or more linear inequalities in $p$, and watch strict versus non-strict inequalities."
      ],
      "keyPoints": [
        "Expectations of fixed functions are linear in $p$, so (1), (2) and both parts of (3) are halfspaces intersected with the simplex: convex.",
        "Variance is concave in $p$ (linear minus convex). So $\\operatorname{var}\\ge\\alpha$ is convex (superlevel set of a concave function) and $\\operatorname{var}\\le\\alpha$ is in general not. Counterexample: two point masses at the extremes each have variance 0, while their mixture has positive variance.",
        "Quartile at least $\\alpha$ means the cumulative probability below $\\alpha$ is below 0.25, and quartile at most $\\alpha$ means the cumulative probability up to $\\alpha$ is at least 0.25. Both are linear in $p$ (up to boundary strictness), hence convex.",
        "The paradox resolves because the two variables enter differently: in weights, variance is a convex quadratic form $w^T\\Sigma w$. In probabilities it is the concave function $\\mathbb E x^2-(\\mathbb E x)^2$. Convexity is a property of a function in a chosen variable, not of \"variance\".",
        "Consequence: a worst-case-variance stress test over $p$ with a variance cap is a nonconvex problem, but with moment and quantile views it is an LP over the simplex."
      ],
      "followUps": [
        "Replace the views by a KL-divergence ball around the empirical $p_0$. Show that the admissible set is convex, and derive the dual of the worst-case expected loss over it.",
        "Meucci-style entropy pooling minimizes KL divergence subject to linear views. Which of the views above can it accommodate exactly, and which require reformulation?"
      ],
      "source": {
        "label": "B&V exercise 2.15 (adapted) — some sets of probability distributions",
        "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf",
        "relation": "adapted from"
      }
    },
    {
      "id": "cvx-sets-q4",
      "type": "derive",
      "difficulty": 3,
      "prompt": "<p>Pairwise-complete correlations on a universe with staggered histories give a symmetric $A$ with unit diagonal that is not PSD.</p><ol><li>Using self-duality of $\\mathbb S^n_+$ (B&V Example 2.24) and the decomposition $A=A_+-A_-$ into PSD parts with $\\operatorname{tr}(A_+A_-)=0$, prove that the Frobenius projection of $A$ onto $\\mathbb S^n_+$ is $Q\\max(\\Lambda,0)Q^T$. Do not use unitary invariance; use the optimality condition for projection onto a closed convex cone.</li><li>Compute it for $A=\\begin{bmatrix}1&1&0\\\\1&1&1\\\\0&1&1\\end{bmatrix}$. Show that the result does not have a unit diagonal, so it is not the nearest correlation matrix.</li><li>The correlation set is $\\mathcal C=\\mathbb S^n_+\\cap\\{X:\\operatorname{diag}X=\\mathbf 1\\}$. Explain why alternating the two projections converges to <em>a</em> point of $\\mathcal C$ but in general not the nearest one, and what Dykstra's correction (as used by Higham 2002) changes.</li><li>For portfolio use, argue that the right target is $\\{X\\succeq\\epsilon I,\\ \\operatorname{diag}X=\\mathbf 1\\}$ rather than $\\mathcal C$. Show what a minimum-variance optimizer does with a matrix that has an eigenvalue exactly 0.</li></ol>",
      "whyItMatters": "Correlation repair is routine in equity risk and stress testing, and the naive version (clip eigenvalues, reset the diagonal, repeat) is both suboptimal and can leave near-zero-risk directions an optimizer will exploit.",
      "hints": [
        "For a closed convex cone $K$, $P_K(A)=X$ if and only if $X\\in K$, $X-A\\in K^*$ and $\\langle X,X-A\\rangle=0$. With $K=K^*=\\mathbb S^n_+$, check this for $X=A_+$.",
        "The matrix in part 2 is $I$ plus the adjacency matrix of a 3-node path, so its eigenvalues are $1+\\sqrt2$, $1$ and $1-\\sqrt2$.",
        "Alternating projections between two convex sets converge to a point in the intersection, but the limit depends on the path. Dykstra adds back, at each step, the increment removed by the previous projection onto the same set. This is what makes it converge to the projection of the starting point."
      ],
      "keyPoints": [
        "Cone projection conditions: $A_+\\in\\mathbb S^n_+$; $A_+-A=A_-\\in\\mathbb S^n_+=(\\mathbb S^n_+)^*$; $\\langle A_+,A_-\\rangle=0$ because their eigenvectors are orthogonal. This is the Moreau decomposition $A=P_K(A)-P_{K^*}(-A)$ specialized to a self-dual cone.",
        "For the example, $\\lambda_-=1-\\sqrt2\\approx-0.414$ with eigenvector $(1,-\\sqrt2,1)/2$. Clipping adds $0.414\\,vv^T$, raising the diagonal to roughly $(1.10,1.21,1.10)$, so the unit diagonal is lost.",
        "Plain alternating projections finds a feasible correlation matrix but not the Frobenius-nearest. Dykstra (or a Newton method on the dual, as in Qi & Sun 2006) returns the true projection. Report both distances to show the gap.",
        "Clipping at exactly 0 leaves $v$ with $v^TXv=0$. An unconstrained minimum-variance or alpha-maximizing optimizer can load on $v$ with no predicted risk; flooring at $\\epsilon$ (a convex set) bounds the leverage it can take.",
        "Frobenius distance treats all entries equally. Weighted norms (by confidence in each pairwise estimate) are still convex projections, and are often more appropriate for missing-data correlations."
      ],
      "followUps": [
        "Derive the dual of $\\min\\tfrac12\\|X-A\\|_F^2$ s.t. $X\\succeq0$, $\\operatorname{diag}X=\\mathbf 1$. Show that it is an unconstrained concave maximization over $y\\in\\mathbb R^n$ involving $\\|(A+\\operatorname{Diag}y)_+\\|_F^2$.",
        "EE364a additional exercise 2.6 asks whether nonnegative or \"highly correlated\" correlation matrices form convex sets. Use the answers to design a stress-test set of correlation matrices that stays convex."
      ],
      "source": {
        "label": "Motivated by Higham (2002) — Computing the nearest correlation matrix: a problem from finance; B&V Example 2.24 (self-duality of the PSD cone)",
        "url": "https://doi.org/10.1093/imanum/22.3.329",
        "relation": "motivated by"
      }
    },
    {
      "id": "cvx-sets-q5",
      "type": "connect",
      "difficulty": 2,
      "prompt": "<p>A PM's optimizer minimizes $\\lambda_1\\,\\text{risk}(w)+\\lambda_2\\,\\text{cost}(w)-\\lambda_3\\,\\alpha^Tw$ over a convex feasible set $W$, and the team \"explores the frontier\" by sweeping $(\\lambda_1,\\lambda_2,\\lambda_3)\\succ0$. Connect this practice to B&V §2.4.2 and §2.6.3.</p><ol><li>Define the achievable objective set $\\mathcal O=\\{(\\text{risk}(w),\\text{cost}(w),-\\alpha^Tw): w\\in W\\}$, with the cone $K=\\mathbb R^3_+$. Show that $\\mathcal O+K$ is convex when risk and cost are convex functions and $W$ is convex, even though $\\mathcal O$ itself need not be.</li><li>Explain why every minimizer for strictly positive weights is Pareto-efficient (minimal), and why weights with a zero component can return weakly efficient points that are not minimal.</li><li>Add a cardinality cap. Build a two-asset toy example where a Pareto-efficient portfolio cannot be obtained for any choice of weights.</li><li>Connect to two other places where \"penalty vs. constraint\" equivalence appears: the lasso path in ML (penalized vs. norm-constrained regression) and risk-aversion vs. risk-target formulations in portfolio construction. State the condition under which the paths coincide.</li></ol>",
      "whyItMatters": "Sweeping trade-off parameters is the standard way to calibrate an optimizer. Knowing when that sweep can miss efficient portfolios, or return dominated ones, keeps a calibration study honest.",
      "hints": [
        "Use the epigraph idea: $(r,c,a)\\in\\mathcal O+K$ if and only if some $w\\in W$ has risk$(w)\\le r$, cost$(w)\\le c$ and $-\\alpha^Tw\\le a$. Show that the set of such $(w,r,c,a)$ is convex and project it.",
        "If a minimizer for $\\lambda\\succ0$ were dominated by some point, that point would have a strictly smaller weighted sum.",
        "For the counterexample, take two assets and $K=1$: the achievable set is the union of two curves (all in asset 1, or all in asset 2). A mixture sits in the dent between them, and no supporting line touches it."
      ],
      "keyPoints": [
        "The set $\\{(w,r,c,a): w\\in W,\\ \\text{risk}(w)\\le r,\\ \\dots\\}$ is convex (intersection of epigraphs), and $\\mathcal O+K$ is its projection, so it is convex. $\\mathcal O$ itself is convex only in special cases.",
        "Strictly positive weights give minimal points (§2.6.3). For convex $\\mathcal O+K$, every minimal point is a minimizer for some nonzero $\\lambda\\succeq0$, but possibly only with a zero component, and such weights can also return weakly efficient points.",
        "With cardinality, $\\mathcal O+K$ is not convex. Points in nonconvex dents are Pareto-efficient but unsupported, so no weighted sum finds them. Use epsilon-constraint scalarization (minimize one objective with bounds on the others) to reach them.",
        "Penalty and constraint forms trace the same path when the problem is convex and a constraint qualification holds. The multiplier of the constraint form equals the penalty weight (preview of Lagrange duality). The lasso path and the risk-aversion/risk-target equivalence are both instances.",
        "In practice, a sweep over risk aversion and t-cost multiplier with integer constraints can jump between corners. That instability is a nonconvexity symptom, not noise."
      ],
      "followUps": [
        "Use the Shapley-Folkman idea (EE364a additional exercise 2.3; Udell & Boyd 2016) to argue why, with thousands of names and few coupling constraints, the dents in the cardinality-constrained frontier become relatively small.",
        "Design a calibration protocol that picks $(\\lambda_1,\\lambda_2)$ from backtests without overfitting. Which module on backtest overfitting (fml-backtest-overfitting) applies, and how?"
      ],
      "source": {
        "label": "B&V §2.4.2 and §2.6.3 (minimal elements via dual inequalities; Example 2.27 Pareto optimal production frontier), motivated by",
        "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf",
        "relation": "motivated by"
      }
    },
    {
      "id": "cvx-sets-q6",
      "type": "design",
      "difficulty": 3,
      "prompt": "<p>Design the feasible set for a 1,500-name US market-neutral book, to be solved every morning by a conic solver. Requirements: dollar neutral; ex-ante beta within $\\pm0.05$; each GICS sector net within $\\pm2\\%$ of gross; position limits $|w_i|\\le\\min(0.5\\%,\\ 5\\%\\times\\text{ADV}_i/\\text{NAV})$; gross at most 4x; daily one-way turnover at most 15%; hard-to-borrow names may not be increased short; predicted volatility at most 6% annualized using a factor model $\\Sigma=BFB^T+D$ with 60 factors.</p><ol><li>Write each requirement as a named convex set (hyperplane, slab, box, $\\ell_1$ ball, second-order cone, ...). Give the exact lifted formulation, including how you avoid forming the $1500\\times1500$ matrix $\\Sigma$.</li><li>Classify the overall problem (LP, QP, SOCP) and give its size (variables, cone dimensions, nonzeros) to within a factor of 2.</li><li>Before solving, how would you detect that the set is empty or has tiny relative interior (e.g. a sector band that conflicts with the beta band given the box)? Use a quantity from this chapter.</li><li>Two desk requests are nonconvex: a minimum trade size of \\$50k, and \"no more than 300 names traded per day\". Propose how to handle each, and the experiment that would tell you whether the convex surrogate costs real performance.</li></ol>",
      "whyItMatters": "This is the daily object an equity optimizer solves. Writing it cleanly as an intersection of convex sets fixes its solve time, its numerical robustness and the meaning of every shadow price the PM looks at.",
      "hints": [
        "Risk: introduce factor exposures $f=B^Tw\\in\\mathbb R^{60}$ and stack $(F^{1/2}f,\\ D^{1/2}w)$ inside one second-order cone with radius $\\sigma$. Use a Cholesky factor of $F$, not of $\\Sigma$.",
        "Turnover and gross: split trades and positions into positive and negative parts. Hard-to-borrow is a one-sided bound on the trade of those names.",
        "For emptiness, compute the Chebyshev radius of the polyhedral part, or solve a phase-I problem that minimizes the largest constraint violation. Its dual gives you a certificate if the set is empty."
      ],
      "keyPoints": [
        "Correct set types: dollar neutrality is a hyperplane; beta and sector bands are slabs; position limits are a box (ADV-dependent bounds are data, still a box); gross is an $\\ell_1$ ball; turnover is an $\\ell_1$ ball centred at $w_0$; HTB is a halfspace per name; risk is a second-order cone in the lifted variables $(w,f)$.",
        "Sparse formulation: variables about $w,\\ u,\\ v$ (trade split), $s,t$ (position split), $f$, so roughly 7,500 variables. The single SOC has dimension about $1+60+1500$. Constraint nonzeros are dominated by $B$ (about $90{,}000$) and the sector matrix. Problem class: SOCP. Never form $\\Sigma$ explicitly.",
        "Emptiness and conditioning: a phase-I LP or SOCP with a slack variable, or the Chebyshev radius. A negative minimum slack yields a separating-hyperplane certificate; a tiny positive one warns of a nearly empty set, where solver accuracy and stability of the solution degrade.",
        "Minimum trade size: either a MIO with indicator variables and perspective tightening, or a two-stage heuristic (solve convex, freeze the small trades to zero, re-solve). Trade-count cap: $\\ell_1$ or reweighted-$\\ell_1$ surrogate on trades, or MIO for exact.",
        "Evaluation design: compare the convex surrogate with the exact MIO on a subsample of days (a smaller universe if needed). Report the objective gap, the realized tracking of the alpha and the transaction costs, not just the solver gap."
      ],
      "followUps": [
        "Which constraints in your formulation would you convert to penalties so that the problem is always feasible, and how do you choose the penalty weights so that they behave like the original limits in normal conditions?",
        "How does the affine dimension of the feasible set change if you also add industry-level (about 70) neutrality instead of sector-level (11)? What does this do to achievable alpha?"
      ],
      "source": {
        "label": "Original design question, informed by Boyd et al. (2017) — Multi-period trading via convex optimization",
        "url": "https://doi.org/10.1561/2400000023",
        "relation": "original"
      }
    },
    {
      "id": "cvx-sets-q7",
      "type": "debate",
      "difficulty": 3,
      "prompt": "<p>Is shrinking the feasible set (no-short constraints, gross-exposure or norm caps) a good way to deal with estimation error, or does it throw away information the optimizer should use?</p><ol><li>First derive the Jagannathan-Ma (2003) result. Let $w^\\star$ solve $\\min w^TSw$ s.t. $\\mathbf 1^Tw=1$, $w\\succeq0$, with multipliers $\\lambda\\succeq0$ for the nonnegativity constraints. Show that $w^\\star$ also solves the <em>unconstrained</em> minimum-variance problem with $\\tilde S=S-(\\lambda\\mathbf 1^T+\\mathbf 1\\lambda^T)$. Interpret which covariances get shrunk.</li><li>Present the case that constraints help. Use Jagannathan &amp; Ma (2003), DeMiguel, Garlappi, Nogales &amp; Uppal (2009) on norm constraints, and Fan, Zhang &amp; Yu (2012) on gross exposure.</li><li>Present the case that constraints are costly or mis-specified. Use Green &amp; Hollifield (1992), who argue that factor structure makes extreme long/short weights a feature of truly efficient portfolios, and Clarke, de Silva &amp; Thorley (2002), whose transfer coefficient measures how constraints dilute the expression of the alpha.</li><li>Take a position for a large-cap market-neutral book with a strong risk model, and say what empirical evidence would change your mind.</li></ol>",
      "whyItMatters": "Whether the long-only or gross limit is a risk-control device, a statistical regularizer or a tax on the alpha changes how you set it, and whether relaxing it is worth the PM's capital.",
      "hints": [
        "Write the KKT conditions: $Sw-\\lambda-\\mu\\mathbf 1=0$, $\\lambda_iw_i=0$. Compute $\\tilde Sw^\\star$ and use $\\mathbf 1^Tw^\\star=1$ and $\\lambda^Tw^\\star=0$.",
        "Stocks whose constraint binds ($\\lambda_i>0$) are those the unconstrained optimizer wants to short. Which entries of $S$ does $\\tilde S$ reduce, and are those entries likely to be over- or under-estimated?",
        "The transfer coefficient is the correlation between risk-adjusted active weights and risk-adjusted forecasts. In the fundamental law it multiplies IC times square root of breadth."
      ],
      "keyPoints": [
        "Derivation: $\\tilde Sw^\\star=Sw^\\star-\\lambda(\\mathbf 1^Tw^\\star)-\\mathbf 1(\\lambda^Tw^\\star)=Sw^\\star-\\lambda=\\mu\\mathbf 1$, which is the unconstrained first-order condition. Rows and columns of names with binding constraints have their covariances reduced by $\\lambda_i+\\lambda_j$.",
        "Pro-constraint: large sample covariances tend to be overestimates in high dimensions, so the implied shrinkage can move $S$ toward $\\Sigma$. Norm balls are regularizers with a tunable radius; gross caps bound risk-estimation error by $\\|\\hat\\Sigma-\\Sigma\\|_{\\max}\\|w\\|_1^2$.",
        "Anti-constraint: with a strong factor structure, efficient portfolios legitimately take large offsetting positions (Green & Hollifield). Long-only constraints sharply cut the transfer coefficient and hence the realized information ratio (Clarke, de Silva & Thorley).",
        "Resolution hinges on how good the covariance and alpha estimates are. The shrinkage argument predicts that constraints help most with the raw sample covariance and much less once a structured or shrunk estimator is used. Treat that as a hypothesis to test on public data, not a settled fact.",
        "A good answer specifies the test, for example out-of-sample variance and IR for sample vs. shrunk vs. factor covariance with and without the constraint, over the same universe, and states which result would flip the position."
      ],
      "followUps": [
        "Derive the analogous shrinkage interpretation for an upper bound $w\\preceq u$ and for the gross-exposure constraint $\\|w\\|_1\\le c$.",
        "Measure the transfer coefficient of your own constrained backtests on public data (e.g. a momentum signal on Ken French industries) as gross leverage varies."
      ],
      "source": {
        "label": "Jagannathan & Ma (2003) — Risk reduction in large portfolios: why imposing the wrong constraints helps",
        "url": "https://doi.org/10.1111/1540-6261.00580",
        "relation": "motivated by"
      },
      "sides": [
        {
          "position": "Constraints act as shrinkage or regularization and reduce out-of-sample risk; norm and gross-exposure caps are a principled, tunable version of this.",
          "refs": [
            {
              "label": "Jagannathan & Ma (2003) — Risk reduction in large portfolios: why imposing the wrong constraints helps",
              "url": "https://doi.org/10.1111/1540-6261.00580"
            },
            {
              "label": "DeMiguel, Garlappi, Nogales & Uppal (2009) — A generalized approach to portfolio optimization: improving performance by constraining portfolio norms",
              "url": "https://doi.org/10.1287/mnsc.1080.0986"
            },
            {
              "label": "Fan, Zhang & Yu (2012) — Vast portfolio selection with gross-exposure constraints",
              "url": "https://doi.org/10.1080/01621459.2012.682825"
            }
          ]
        },
        {
          "position": "Extreme weights are a natural feature of efficient portfolios under factor structure, and constraints materially reduce how much of the forecast reaches the portfolio (transfer coefficient), so they are a costly, blunt tool.",
          "refs": [
            {
              "label": "Green & Hollifield (1992) — When will mean-variance efficient portfolios be well diversified?",
              "url": "https://doi.org/10.2307/2328996"
            },
            {
              "label": "Clarke, de Silva & Thorley (2002) — Portfolio constraints and the fundamental law of active management",
              "url": "https://doi.org/10.2469/faj.v58.n5.2468"
            }
          ]
        }
      ]
    },
    {
      "id": "cvx-sets-q8",
      "type": "critique",
      "difficulty": 2,
      "prompt": "<p>A colleague writes in a design doc: <em>\"A gross-leverage cap $\\|w\\|_1\\le L$ and an $\\ell_2$ weight cap $\\|w\\|_2\\le c$ are both norm balls, so they do the same job: they shrink the portfolio toward zero. We'll use the $\\ell_2$ cap because it is smooth and the solver likes it. As a bonus, either cap protects us from covariance estimation error equally well.\"</em></p><p>Critique each claim. In particular:</p><ol><li>Compare the geometry (vertices, faces, supporting hyperplanes) of the two balls and predict the structure of solutions when maximizing $\\alpha^Tw-\\gamma w^T\\hat\\Sigma w$ over each.</li><li>Prove $|w^T(\\hat\\Sigma-\\Sigma)w|\\le\\|\\hat\\Sigma-\\Sigma\\|_{\\max}\\|w\\|_1^2$. Then show that the best analogous bound in terms of $\\|w\\|_2$ scales with $n$, so the \"equal protection\" claim fails for large universes.</li><li>Show that adding $\\mathbf 1^Tw=1$ and $\\|w\\|_1\\le1$ gives exactly the long-only set. Show that the Lagrangian of the $\\ell_2$ cap is equivalent to replacing $\\hat\\Sigma$ by $\\hat\\Sigma+\\eta I$.</li><li>Use the dual norm to compute the maximum alpha reachable with each cap, $\\sup\\{\\alpha^Tw:\\|w\\|\\le r\\}$. Interpret it for a signal concentrated in a few names versus one spread evenly.</li></ol>",
      "whyItMatters": "The choice between $\\ell_1$ and $\\ell_2$ geometry decides whether the book is concentrated or diffuse and how risk-estimation error propagates. \"It is just a norm ball\" hides all of that.",
      "hints": [
        "Expand $w^TEw=\\sum_{ij}w_iw_jE_{ij}$ and bound each term by $\\max|E_{ij}|\\,|w_i||w_j|$.",
        "For the $\\ell_2$ version, use $\\|w\\|_1\\le\\sqrt n\\|w\\|_2$, and find a $w$ and an $E$ with bounded max-entry for which the bound is nearly tight.",
        "The support function of a norm ball of radius $r$ is $r\\|\\alpha\\|_*$: the $\\ell_\\infty$ norm for the $\\ell_1$ ball and the $\\ell_2$ norm for the $\\ell_2$ ball."
      ],
      "keyPoints": [
        "The $\\ell_1$ ball is a polytope with $2n$ vertices on the axes, so linear objectives are maximized at vertices or low-dimensional faces, giving sparse, concentrated solutions. The $\\ell_2$ ball is smooth, giving dense solutions proportional to $\\alpha$ (or $(\\hat\\Sigma+\\eta I)^{-1}\\alpha$).",
        "Bound: $|w^TEw|\\le\\max|E_{ij}|(\\sum_i|w_i|)^2$. With an $\\ell_2$ cap, $\\|w\\|_1^2\\le n\\|w\\|_2^2$ and $E=\\epsilon\\mathbf 1\\mathbf 1^T$, $w=c\\mathbf 1/\\sqrt n$ gives $w^TEw=\\epsilon c^2n$, so the protection degrades linearly in $n$.",
        "$\\|w\\|_1\\ge\\mathbf 1^Tw=1$ with equality iff $w\\succeq0$, so the long-only constraint is a special case of the gross cap (Fan, Zhang & Yu 2012; DeMiguel et al. 2009).",
        "The $\\ell_2$ cap is equivalent, via its multiplier $\\eta\\ge0$, to ridge shrinkage of the covariance toward the identity: $w^T(\\hat\\Sigma+\\eta I)w$.",
        "Max alpha: $L\\|\\alpha\\|_\\infty$ for the gross cap versus $c\\|\\alpha\\|_2$ for the $\\ell_2$ cap. A concentrated signal fares relatively well under $\\ell_1$; a diffuse signal under $\\ell_2$. The choice should match the breadth of the alpha."
      ],
      "followUps": [
        "Combine both (an elastic-net ball). What is its dual norm, and what portfolio structure does it produce?",
        "In a market-neutral book, is $\\|w\\|_1\\le L$ together with $\\mathbf 1^Tw=0$ still a cross-polytope in the subspace? Count its vertices."
      ],
      "source": {
        "label": "Fan, Zhang & Yu (2012) — Vast portfolio selection with gross-exposure constraints",
        "url": "https://doi.org/10.1080/01621459.2012.682825",
        "relation": "motivated by"
      }
    }
  ],
  "projects": [
    {
      "id": "cvx-sets-r1",
      "title": "Replicate DeMiguel, Garlappi, Nogales & Uppal (2009): norm-constrained minimum-variance portfolios",
      "level": "replication",
      "hours": "10–16",
      "paper": {
        "label": "DeMiguel, Garlappi, Nogales & Uppal (2009) — A generalized approach to portfolio optimization: improving performance by constraining portfolio norms",
        "url": "https://doi.org/10.1287/mnsc.1080.0986"
      },
      "goal": "Reproduce the paper's main out-of-sample comparison of minimum-variance policies on the Ken French datasets it uses: sample covariance, the shortsale-constrained version of Jagannathan & Ma, and the 1-norm- and 2-norm-constrained portfolios with the norm radius chosen by cross-validation. Report portfolio variance (and Sharpe ratio, turnover) out of sample. Then extend with a gross-exposure sweep that makes the set-geometry interpretation explicit.",
      "data": "Ken French Data Library: the industry and size/book-to-market portfolio datasets the paper reports on (read its data section and match datasets, frequency and sample period as closely as the current library allows; the library is revised over time, so document any difference). Any dataset in the paper that is not public (e.g. one built from CRSP) is skipped and listed. Public data only.",
      "steps": [
        "Read the paper's methodology: rolling estimation window length, rebalancing frequency, the exact constrained problems, and the calibration of the norm radius (cross-validation on the estimation window). Record every choice and any assumption you make where details are unspecified.",
        "Implement the policies in CVXPY: minimum variance with sample covariance; with no-short constraint; with ||w||_1 <= delta; with ||w||_2^2 <= delta; plus 1/N as a benchmark.",
        "Implement the cross-validation of delta exactly as the paper describes (or your closest documented reading), using only data inside each estimation window.",
        "Run the rolling out-of-sample evaluation and compute out-of-sample variance, Sharpe ratio and turnover for each policy and dataset.",
        "Extension: sweep the gross-exposure radius from 1 (long-only) to unconstrained and plot out-of-sample variance against radius, marking the cross-validated choice."
      ],
      "deliverables": [
        "Reproducible script with a config file listing datasets, dates and all assumptions.",
        "Side-by-side table: paper versus replication for each policy and dataset you could reproduce, with differences highlighted.",
        "Plot of out-of-sample variance versus gross-exposure radius per dataset.",
        "Discrepancy note (1–2 pages) explaining differences (data revisions, calibration details), backed by at least one sensitivity run."
      ],
      "acceptance": [
        "For every dataset reproduced, the ranking by out-of-sample variance of sample-covariance minimum variance versus the norm-constrained policies matches the paper's qualitative conclusion, or the note explains the discrepancy with a sensitivity run.",
        "Replicated out-of-sample standard deviations are within 15% (relative) of the paper's values for at least two datasets, or the gap is attributed to a documented data revision.",
        "At radius 1 the gross-constrained solution equals the no-short solution to 1e-6 in weights (asserted), confirming the set identity.",
        "Cross-validation never uses data from the out-of-sample month (asserted by an index check in code)."
      ],
      "extensions": [
        "Replace the sample covariance with Ledoit-Wolf and check whether the norm constraint still helps, the empirical heart of the debate question in this module.",
        "Add a market-neutral variant (1^T w = 0) and compare the l1 and l2 caps by number of positions and realized volatility."
      ]
    }
  ]
}
);
