LAB.extend("cvx-problems", {
  "questions": [
    {
      "id": "cvx-problems-q1",
      "type": "derive",
      "difficulty": 3,
      "prompt": "<p>You want the maximum-Sharpe portfolio under realistic constraints:</p>$$\\max_w\\ \\frac{(\\mu-r_f\\mathbf 1)^Tw}{\\sqrt{w^T\\Sigma w}}\\quad\\text{s.t.}\\quad \\mathbf 1^Tw=1,\\ \\ Aw\\preceq b,\\ \\ \\|w-w_0\\|_1\\le\\tau,$$<p>with $\\Sigma\\succ0$ and $w_0$ the current book.</p><ol><li>Show that the problem is quasiconvex (after a sign change) on the set where the numerator is positive. Explain why naive gradient ascent on the ratio is fragile.</li><li>Using the convex–concave fractional transform, derive an equivalent <em>convex</em> problem in $(y,t)$. Say exactly what each constraint becomes, including the turnover constraint.</li><li>Which of the following survive the transformation as convex constraints: (i) long-only, (ii) $\\beta^Tw=0$, (iii) a gross-leverage cap $\\|w\\|_1\\le L$, (iv) proportional costs $c\\|w-w_0\\|_1$ subtracted in the numerator, (v) \"at most 30 names\", (vi) a fixed cost per traded name?</li><li>What happens to the transformed problem if no feasible $w$ has positive excess return, or if the feasible set is unbounded?</li></ol>",
      "whyItMatters": "Max-Sharpe is the most commonly requested and most commonly mis-solved portfolio. Homogenization makes it a single convex solve and shows exactly which constraints are compatible with it.",
      "hints": [
        "Superlevel sets of the ratio, $\\{w:(\\mu-r_f\\mathbf1)^Tw\\ge s\\sqrt{w^T\\Sigma w}\\}$, are SOC constraints for $s\\ge0$.",
        "Set $y=tw$ with $t>0$ and normalise $(\\mu-r_f\\mathbf1)^Ty=1$. A convex constraint $g(w)\\le0$ becomes $t\\,g(y/t)\\le0$, the perspective (B&V §3.2.6 and exercise 4.7).",
        "For the turnover constraint, the perspective of $\\|w-w_0\\|_1-\\tau$ is $\\|y-tw_0\\|_1-\\tau t$. For (iv) use exercise 4.7(c): numerator concave and positive, denominator convex and nonnegative."
      ],
      "keyPoints": [
        "For $s\\ge0$ the superlevel sets are second-order cones, so the problem is quasiconvex and bisection on $s$ with SOCP feasibility problems is valid. The ratio is not concave, though, so gradient methods can stall or diverge near the boundary.",
        "Transformed problem: $\\min_{y,t} y^T\\Sigma y$ s.t. $(\\mu-r_f\\mathbf1)^Ty=1$, $\\mathbf1^Ty=t$, $Ay\\preceq bt$, $\\|y-tw_0\\|_1\\le\\tau t$, $t\\ge0$, and recover $w^\\star=y^\\star/t^\\star$.",
        "(i), (ii) and (iii) survive: cones stay unchanged, and non-homogeneous convex constraints become perspectives. (iv) survives by the convex–concave fractional argument, using the perspective of the concave numerator. (v) and (vi) are nonconvex before the transform and stay so.",
        "If $\\max_w(\\mu-r_f\\mathbf1)^Tw\\le0$ on the feasible set, the normalisation is infeasible and the problem should be reformulated (e.g. minimise risk). If the feasible set is unbounded, $t^\\star\\to0$ can occur, i.e. the optimum is approached only along a recession direction and is not attained.",
        "The objective can equivalently be $\\|L^Ty\\|_2$, which is better conditioned and is the SOC form a solver prefers."
      ],
      "followUps": [
        "Show that the KKT multiplier of the normalisation constraint equals twice the optimal (minimised) $y^T\\Sigma y$, and relate it to the maximal squared Sharpe ratio.",
        "Max-Sharpe with a volatility floor (risk must be at least σ_min) is no longer convex. Why, and what would you do instead?"
      ],
      "source": {
        "label": "B&V exercise 4.7 (adapted): convex–concave fractional problems",
        "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf",
        "relation": "adapted from"
      }
    },
    {
      "id": "cvx-problems-q2",
      "type": "counterexample",
      "difficulty": 2,
      "prompt": "<p>A PM asks for four extra constraints on a long-only book with $\\mathbf 1^Tw=1$: (a) no position smaller than 1% unless it is zero; (b) at most $k$ names; (c) an $\\ell_1$ \"sparsity penalty\" $\\rho\\|w\\|_1$ in the objective to get fewer names; (d) turnover $\\|w-w_0\\|_1\\le\\tau$.</p><ol><li>For each of (a), (b) and (d), either prove convexity or give an explicit two- or three-asset counterexample (two feasible points whose midpoint is infeasible).</li><li>Show that (c) cannot reduce the number of names at all in this setting.</li><li>Write (a) and (b) with binary variables and big-M bounds, and form the continuous relaxation $z\\in[0,1]^n$. Build a small example where the relaxation's optimal value is far from the integer optimum. Relate it to the LP relaxation of a Boolean LP: what does the relaxation give you, and when is it exact?</li></ol>",
      "whyItMatters": "Spotting nonconvexity before writing code saves days. The fact that ℓ1 sparsity disappears under a long-only budget catches out experienced researchers.",
      "hints": [
        "For (a), try $w=(1,0)$ and $w'=(0,1)$ in a two-asset world with a 60% floor to make the effect obvious, then scale to 1%.",
        "Under $w\\succeq0$ and $\\mathbf1^Tw=1$, what is $\\|w\\|_1$?",
        "With $w_i\\le z_i$, $z\\in[0,1]$, the relaxation can set every $z_i=w_i$. How small can $\\mathbf1^Tz$ then be?"
      ],
      "keyPoints": [
        "(a) $\\{0\\}\\cup[\\ell,u]$ per coordinate is a union of disjoint sets, hence nonconvex. Midpoints of semicontinuous points can land in $(0,\\ell)$. (b) The midpoint of two $k$-sparse portfolios with disjoint supports has $2k$ names. (d) is a norm ball, hence convex.",
        "With $w\\succeq0$ and $\\mathbf1^Tw=1$, $\\|w\\|_1=1$ is constant on the feasible set, so the penalty changes nothing. Sparsity from $\\ell_1$ needs shorting or a free budget, or a nonconvex penalty.",
        "Big-M model: $\\ell z_i\\le w_i\\le u_iz_i$, $\\mathbf1^Tz\\le k$, $z_i\\in\\{0,1\\}$. The relaxation lets $z_i=w_i/u_i$, so with $u_i=1$ the cardinality constraint $\\mathbf1^Tz\\le k$ is implied by the budget whenever $k\\ge1$, and the bound is useless.",
        "As for Boolean LPs (exercise 4.15): the relaxation gives a lower bound on the minimum, infeasibility of the relaxation proves infeasibility of the integer problem, and an integral relaxed solution is optimal for the integer problem.",
        "Tighter big-M values (smaller $u_i$) and perspective reformulations of $w_i^2/z_i$ strengthen the relaxation. This is why MIQP portfolio solvers use them."
      ],
      "followUps": [
        "Show that the perspective relaxation of $\\sum_i\\delta_iw_i^2$ (with diagonal specific risk $\\delta_i$) gives $\\sum_i\\delta_iw_i^2/z_i$, and explain why it is tighter than big-M.",
        "Is the \"minimum trade size\" constraint (|w_i − w0_i| ≥ 0.2% or no trade) also nonconvex? How does it interact with turnover?"
      ],
      "source": {
        "label": "B&V exercise 4.15 (adapted): relaxation of Boolean LP; see also Bienstock (1996)",
        "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf",
        "relation": "adapted from"
      }
    },
    {
      "id": "cvx-problems-q3",
      "type": "design",
      "difficulty": 3,
      "prompt": "<p>Your alpha model gives $\\hat\\mu$ with an estimation-error covariance $\\Omega$ (from the regression standard errors of the signal). Design a robust mean–variance optimizer.</p><ol><li>Derive the robust counterpart of $\\max_w\\min_{\\mu\\in\\mathcal U}\\mu^Tw-\\tfrac\\gamma2w^T\\Sigma w$ for (i) the ellipsoid $\\mathcal U=\\{\\hat\\mu+\\Omega^{1/2}u:\\|u\\|_2\\le\\kappa\\}$ and (ii) the box $|\\mu_i-\\hat\\mu_i|\\le\\kappa\\,\\omega_i$. State the resulting problem class.</li><li>Prove that if $\\Omega=c\\,\\Sigma$ the robust portfolio is a point on the nominal efficient frontier (under the same constraints). So in that case robustness is equivalent to choosing a different risk level.</li><li>Ceria and Stubbs argue for adjusting the uncertainty set so that the worst case does not move the whole alpha vector in one direction (a \"zero net alpha adjustment\"). Formulate one version of that constraint on $u$ and show that the counterpart is still an SOCP.</li><li>Choose $\\kappa$ and $\\Omega$ for a monthly-rebalanced equity long–short book, and propose an out-of-sample test that separates \"robustness helped\" from \"we just took less risk\".</li></ol>",
      "whyItMatters": "Robust optimization is sold as protection against alpha error. Whether it does more than de-risk depends entirely on how the uncertainty set is shaped relative to Σ.",
      "hints": [
        "$\\min_{\\|u\\|_2\\le\\kappa}u^T\\Omega^{1/2}w=-\\kappa\\|\\Omega^{1/2}w\\|_2$ (Cauchy–Schwarz). For the box, the dual norm is a weighted $\\ell_1$.",
        "If $\\Omega=c\\Sigma$, the objective is an increasing function of $\\hat\\mu^Tw$ and a decreasing function of $\\sqrt{w^T\\Sigma w}$. Any optimum must therefore be mean–standard-deviation efficient within the feasible set.",
        "Constrain $u$ to $\\{u:\\|u\\|_2\\le\\kappa,\\ \\mathbf 1^T\\Omega^{1/2}u=0\\}$. The inner minimisation is then the norm of a projection of $\\Omega^{1/2}w$."
      ],
      "keyPoints": [
        "Ellipsoid: $\\max\\ \\hat\\mu^Tw-\\kappa\\|\\Omega^{1/2}w\\|_2-\\tfrac\\gamma2\\|L^Tw\\|_2^2$, an SOCP (convex, since the norm enters with a minus sign in a maximisation). Box: $\\hat\\mu^Tw-\\kappa\\sum_i\\omega_i|w_i|$, a QP with auxiliary variables, like B&V exercise 4.13.",
        "Frontier argument: if $w_r$ were dominated by a feasible $w$ with $\\hat\\mu^Tw\\ge\\hat\\mu^Tw_r$ and $\\sigma(w)\\le\\sigma(w_r)$, at least one strictly, the robust objective would strictly improve. So $w_r$ lies on the constrained mean–σ frontier.",
        "With the zero-net constraint the inner problem gives $-\\kappa\\|P\\,\\Omega^{1/2}w\\|_2$, where $P$ projects onto the orthogonal complement of $\\Omega^{1/2}\\mathbf1$. It is still a norm of an affine map of $w$, so still an SOCP. It penalises only dispersion-type alpha errors.",
        "$\\kappa^2$ as a $\\chi^2_n$ quantile is far too conservative for large $n$. A design should pick $\\kappa$ by validation or by a target probability for portfolio-level error, not per asset.",
        "The test should compare the robust book against a nominal book at matched ex-ante risk (or matched realised volatility). Only then can a difference in Sharpe ratio or turnover be attributed to the shape of Ω."
      ],
      "followUps": [
        "Derive the robust counterpart when Σ is also uncertain within a spectral-norm ball (B&V exercise 4.28(b)) and compare its effect with ridge shrinkage of Σ.",
        "Show that robust mean–variance with ellipsoidal Ω has the same KKT structure as a Black–Litterman posterior with a particular view confidence, or explain why it does not."
      ],
      "source": {
        "label": "B&V exercise 4.13 (adapted) and B&V §4.4.2; Ceria & Stubbs (2006); Goldfarb & Iyengar (2003)",
        "url": "https://doi.org/10.1057/palgrave.jam.2240207",
        "relation": "adapted from"
      }
    },
    {
      "id": "cvx-problems-q4",
      "type": "critique",
      "difficulty": 2,
      "prompt": "<p>A junior researcher hands you this CVXPY model and says \"CVXPY is broken, it rejects a convex problem\".</p><pre><code class=\"language-python\">w = cp.Variable(n)\nrisk = cp.sqrt(cp.quad_form(w, Sigma_hat))       # (a)  Sigma_hat: sample cov, T=60, n=200\nobj  = cp.Maximize((mu @ w - rf) / risk)          # (b)\ncons = [cp.sum(w) == 1,\n        cp.abs(w) &gt;= 0.005,                       # (c) \"no dust positions\"\n        cp.norm1(w - w0) &lt;= 0.2,                  # (d)\n        cp.max(B.T @ w) == 0,                     # (e) \"no positive factor exposure\"\n        cp.quad_form(w, Sigma_hat) &lt;= s2]         # (f)\ncp.Problem(obj, cons).solve()</code></pre><p>For each line, decide whether it is (1) fine, (2) convex but not DCP, (3) genuinely nonconvex, or (4) DCP but numerically or statistically broken. Give the fix, and say what the researcher actually meant where the code differs from the intent.</p>",
      "whyItMatters": "Telling \"the modelling language is pedantic\" apart from \"the model is wrong\" is the core DCP skill, and the same mistakes recur in every optimizer codebase.",
      "hints": [
        "sqrt is concave and nondecreasing. What does the composition rule need from its argument?",
        "An equality constraint needs affine expressions on both sides. A constraint $f(w)\\ge c$ needs $f$ concave.",
        "With $T=60\\lt n=200$, what is the rank of the sample covariance, and what does that do to \"minimum risk\" directions?"
      ],
      "keyPoints": [
        "(a) Convex but not DCP: a concave increasing function of a convex argument. Rewrite as <code>cp.norm(L.T @ w)</code> with $\\Sigma=LL^T$ (or use a factor model).",
        "(b) Quasiconcave ratio, not DCP. Use the homogenized problem (B&V exercise 4.7) or DQCP bisection. Do not hand a ratio to a convex solver.",
        "(c) Genuinely nonconvex: $|w_i|\\ge\\epsilon$ is the complement of a convex set, and the intent (\"zero or at least ε\") needs binaries. As written it also forbids zero positions entirely.",
        "(d) Fine. (e) Not DCP and nonconvex as written: $\\max_k b_k^Tw=0$ forces at least one exposure to be exactly zero. The intent \"no positive exposure\" is $B^Tw\\preceq0$, which is convex.",
        "(f) DCP, but $\\hat\\Sigma$ has rank at most $59$, so there are zero-risk directions and the optimizer will load on them (risk underestimation). Tiny negative eigenvalues can also make the PSD check of <code>quad_form</code> fail. Use shrinkage or a factor model, and pass the factor form.",
        "General point: DCP is sufficient, not necessary. Failure means \"not verified\", and the fix is either a rewrite (cases a and b) or an admission that the model is nonconvex (cases c and e)."
      ],
      "followUps": [
        "Write the factor-model version of the risk (Σ = FΩFᵀ + D) in DCP form with auxiliary factor exposures. Count variables and nonzeros versus the dense version for n = 3,000 and k = 50.",
        "Which CVXPY atoms would you add to a team library (e.g. sum_largest, perspective-based costs) to stop these mistakes recurring?"
      ],
      "source": {
        "label": "Grant, Boyd & Ye (2006) — Disciplined convex programming; CVXPY DCP tutorial",
        "url": "https://doi.org/10.1007/0-387-30528-9_7",
        "relation": "motivated by"
      }
    },
    {
      "id": "cvx-problems-q5",
      "type": "predict",
      "difficulty": 2,
      "prompt": "<p>Take 49 industry portfolios, long-only, $\\mathbf 1^Tw=1$. Before computing anything, predict and justify:</p><ol><li>The shape of $V(m)=\\min\\{w^T\\Sigma w:\\mu^Tw\\ge m\\}$ as a function of $m$. Is it convex? Is $\\sqrt{V(m)}$ convex? Is the frontier in $(\\sigma,\\mu)$ concave?</li><li>Whether sweeping risk aversion $\\gamma\\in(0,\\infty)$ in $\\max\\mu^Tw-\\tfrac\\gamma2w^T\\Sigma w$ reaches every point of that frontier, including its two ends.</li><li>The same two questions after adding \"at most 5 names\". In particular, will weighted-sum scalarization find all Pareto-efficient 5-name portfolios?</li><li>As $\\gamma$ moves, which quantity in the long-only problem changes piecewise linearly, and where are the kinks?</li></ol>",
      "whyItMatters": "Frontier shape, completeness of scalarization and the piecewise structure of the solution path decide whether risk-aversion sweeps, risk targeting and hyperparameter searches over γ are trustworthy.",
      "hints": [
        "$V(m)$ is the optimal value of a convex problem perturbed in the right-hand side of a constraint. Recall what is known about such perturbation functions.",
        "B&V §4.7.4: for convex problems every Pareto point is a scalarization minimiser for some nonzero $\\lambda\\succeq0$. Which points need a zero weight?",
        "For a QP with linear constraints, on a fixed active set the KKT system is linear in $(w,\\nu,\\lambda)$ and in $1/\\gamma$."
      ],
      "keyPoints": [
        "$V(m)$ is convex: it is the perturbation function of a convex problem, jointly convex in $(w,m)$ and minimised over $w$. $\\sigma(m)=\\sqrt{V(m)}$ is also convex, because $\\sqrt{w^T\\Sigma w}$ is a norm, so the $(\\sigma,\\mu)$ frontier is concave.",
        "Interior points are reached for finite $\\gamma>0$. The maximum-return corner needs $\\gamma\\to0$ (weight 0 on risk) and the global minimum-variance point needs $\\gamma\\to\\infty$ (weight 0 on return). These are the zero-weight cases of the convex scalarization theorem.",
        "With cardinality the achievable set is a union of up to $\\binom{49}{5}$ convex pieces, so $V(m)$ is the lower envelope of convex functions. It is not convex in general, and Pareto points in non-convex dents are unsupported: no $\\gamma$ finds them. ε-constraint sweeps (fix $m$ or $\\sigma$) still find them.",
        "For the long-only convex problem, $w^\\star$ is piecewise affine in $1/\\gamma$, with breakpoints where an asset enters or leaves the support. This is the critical-line structure (Markowitz's critical line algorithm)."
      ],
      "followUps": [
        "Show that with a variance budget instead of γ the solution path is no longer piecewise affine in the parameter, and explain why this does not matter for practical sweeps.",
        "Under cardinality, can the frontier have jumps (not just kinks)? Construct an example."
      ],
      "source": {
        "label": "B&V §4.7.4–4.7.6 (scalarization, risk–return trade-off) and exercise 4.54 (adapted)",
        "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf",
        "relation": "adapted from"
      }
    },
    {
      "id": "cvx-problems-q6",
      "type": "connect",
      "difficulty": 2,
      "prompt": "<p>B&amp;V exercise 4.60 maximises long-run growth $\\sum_j\\pi_j\\log(p_j^Tx)$ over the simplex with discrete return scenarios $p_j$.</p><ol><li>Show that it is a convex problem, write it in DCP form, and identify the cone a solver uses (exponential cone).</li><li>Expand $\\log(1+r^Tw)$ to second order and show that the log-optimal problem is approximately mean–variance with a specific risk aversion. Which \"variance\" appears, centred or uncentred?</li><li>Explain, as a convex-analysis statement, why the log objective forbids any portfolio with a scenario of total loss, while mean–variance happily accepts one.</li><li>Connect to fractional Kelly as practised in sizing, and to RL agents trained with log-wealth rewards: what does the convex structure guarantee there, and what does it not?</li></ol>",
      "whyItMatters": "Kelly sizing, mean–variance and log-utility RL are often discussed as rivals. Seen as convex programs they are close relatives with different tail treatment.",
      "hints": [
        "$\\log$ of an affine function is concave. A nonnegative sum of concave functions is concave.",
        "$\\log(1+z)\\approx z-z^2/2$ with $z=r^Tw$, and $\\mathbb E[(r^Tw)^2]=w^T(\\Sigma+\\mu\\mu^T)w$.",
        "What is $\\operatorname{dom}\\log$, and what does the implicit constraint $p_j^Tx\\gt0$ do?"
      ],
      "keyPoints": [
        "Concave objective over the simplex. In CVXPY: <code>cp.Maximize(pi @ cp.log(P @ x))</code> with <code>x &gt;= 0, sum(x) == 1</code>. Each log term is an exponential-cone constraint.",
        "Second order: $\\max\\ \\mu^Tw-\\tfrac12w^T(\\Sigma+\\mu\\mu^T)w$, i.e. mean–variance with $\\gamma\\approx1$ on the uncentred second moment. Fractional Kelly with fraction $f$ corresponds roughly to $\\gamma\\approx1/f$.",
        "The implicit domain constraint $p_j^Tx\\gt0$ for every scenario with $\\pi_j\\gt0$ makes ruin infeasible: the objective is $-\\infty$ there. Mean–variance has no such barrier, so a tiny-probability total-loss scenario barely moves the variance.",
        "The approximation is poor exactly where it matters: fat left tails and leverage. The exact convex program handles scenario tails at little extra cost.",
        "For RL, a concave per-step objective in the action does not make the dynamic problem convex. The guarantee is per-period (myopic optimality of Kelly with IID returns), not for the learned policy."
      ],
      "followUps": [
        "Add a drawdown-style constraint (probability of losing more than 20% at most 5%) to the Kelly problem. Is it convex? Compare with the risk-constrained Kelly literature.",
        "With scenario returns estimated from history, how does the log-optimal portfolio respond to removing the single worst month? Relate to the influence function of the optimizer."
      ],
      "source": {
        "label": "B&V exercise 4.60 (adapted): log-optimal investment strategy",
        "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf",
        "relation": "adapted from"
      }
    },
    {
      "id": "cvx-problems-q7",
      "type": "debate",
      "difficulty": 2,
      "prompt": "<p>DeMiguel, Garlappi and Uppal (2009) report that none of 14 optimized portfolio models consistently beats the $1/N$ rule out of sample. They estimate that sample-based mean–variance needs estimation windows of thousands of months to win. Kirby and Ostdiek (2012) answer that this result depends on the design: unconstrained targets produce extreme turnover, and simple volatility- and reward-to-risk-timing rules beat $1/N$ net of costs. Tu and Zhou (2011) show that combining $1/N$ with optimized rules can beat both.</p><ol><li>Write $1/N$ as the exact solution of a convex problem in at least two ways (as a minimum-norm problem, and as a mean–variance problem under specific $\\mu,\\Sigma$).</li><li>Using that, argue each side: is $1/N$ \"no optimization\", or \"optimization with an extreme prior and a strong regulariser\"?</li><li>Which convex-modelling choices (vol targeting instead of a fixed $\\gamma$, norm constraints, turnover limits, robust terms) address the DGU critique directly, and which do not touch its root cause (noise in $\\hat\\mu$)?</li></ol>",
      "whyItMatters": "This is the empirical debate behind every \"why not just equal-weight?\" question a PM will face. The convex-problem view makes it precise.",
      "hints": [
        "$\\min\\|w\\|_2^2$ s.t. $\\mathbf1^Tw=1$. Also: minimum variance when $\\Sigma=\\sigma^2I$, or tangency when $\\mu\\propto\\Sigma\\mathbf1$.",
        "DeMiguel et al. (2009, Management Science) link norm constraints to shrinkage and show that $1/N$ is a corner of the norm-constrained family.",
        "Separate estimation error in μ from that in Σ, and separate the effect of the objective from the effect of the turnover it produces."
      ],
      "keyPoints": [
        "$1/N=\\arg\\min\\{\\|w\\|_2^2:\\mathbf1^Tw=1\\}$. It is also the minimum-variance portfolio for $\\Sigma\\propto I$ (or any $\\Sigma$ with $\\Sigma\\mathbf1\\propto\\mathbf1$), and the tangency portfolio when $\\mu\\propto\\Sigma\\mathbf1$.",
        "Pro-DGU: the estimation error of $\\hat\\mu$ dominates (an $O(n/T)$ loss in certainty equivalent), and no amount of solver sophistication repairs bad inputs.",
        "Pro-optimization: constrained and timed rules with turnover control, together with combination rules, beat 1/N in published tests. 1/N is itself an optimizer with a degenerate model, so the real question is how much shrinkage to use.",
        "Norm constraints, minimum-variance (μ-free) objectives, vol targeting and turnover limits act on variance and costs. Only better or shrunk μ estimates (or robust terms calibrated to their error) attack the root cause."
      ],
      "followUps": [
        "Replicate the industry-portfolio rows of DGU Table 3 (Sharpe ratios) and add a norm-constrained minimum-variance rule. Where does it fall?",
        "Is 1/N robust optimal for some uncertainty set? Construct one."
      ],
      "source": {
        "label": "DeMiguel, Garlappi & Uppal (2009) vs Kirby & Ostdiek (2012); Tu & Zhou (2011)",
        "url": "https://doi.org/10.1093/rfs/hhm075",
        "relation": "motivated by"
      },
      "sides": [
        {
          "position": "Optimized portfolios do not reliably beat 1/N out of sample, because estimation error in the inputs swamps the gains from optimization.",
          "refs": [
            {
              "label": "DeMiguel, Garlappi & Uppal (2009) — Optimal versus naive diversification: how inefficient is the 1/N portfolio strategy?",
              "url": "https://doi.org/10.1093/rfs/hhm075"
            }
          ]
        },
        {
          "position": "Well-designed optimized or timed strategies with turnover control, or combinations of 1/N with optimized rules, do outperform 1/N, and the negative result reflects the design of the tests.",
          "refs": [
            {
              "label": "Kirby & Ostdiek (2012) — It's all in the timing: simple active portfolio strategies that outperform naïve diversification",
              "url": "https://doi.org/10.1017/S0022109012000117"
            },
            {
              "label": "Tu & Zhou (2011) — Markowitz meets Talmud: a combination of sophisticated and naive diversification strategies",
              "url": "https://doi.org/10.1016/j.jfineco.2010.08.013"
            },
            {
              "label": "DeMiguel, Garlappi, Nogales & Uppal (2009) — A generalized approach to portfolio optimization: improving performance by constraining portfolio norms",
              "url": "https://doi.org/10.1287/mnsc.1080.0986"
            }
          ]
        }
      ]
    },
    {
      "id": "cvx-problems-q8",
      "type": "derive",
      "difficulty": 3,
      "prompt": "<p>Three modelling primitives used in equity optimizers. Show that each is SOC-representable, or prove that it is not convex.</p><ol><li><strong>Market impact.</strong> A cost $\\sum_i c_i|x_i|^{3/2}$ on trades $x$ (square-root impact times trade size), with $c\\succeq0$. Represent $\\sum_ic_i|x_i|^{3/2}\\le q$ using only hyperbolic constraints $u^2\\le vw$, $v,w\\ge0$.</li><li><strong>Worst-case variance.</strong> $\\max\\{w^T\\Sigma w:\\ \\Sigma=\\hat\\Sigma+\\Delta,\\ \\Delta\\in\\mathbb S^n,\\ \\|\\Delta\\|_2\\le\\rho\\}\\le\\sigma^2$, with $\\hat\\Sigma\\succ0$. Find a closed form and an SOC representation, and compare with ridge shrinkage $\\hat\\Sigma+\\rho I$.</li><li><strong>Loss probability.</strong> Under Gaussian returns, $\\Pr(r^Tw\\le-\\ell)\\le\\beta$. Show that it is convex for $\\beta\\le1/2$, and give a one-asset counterexample to convexity for $\\beta\\gt1/2$.</li></ol>",
      "whyItMatters": "Impact costs, covariance-robust risk limits and parametric VaR are standard optimizer features. Knowing their cone representation decides whether the whole optimizer stays a fast SOCP.",
      "hints": [
        "For $y\\ge0$: $y^{3/2}\\le t$ iff there is $s\\ge0$ with $y^2\\le st$ and $s^2\\le y$. Then bound $|x_i|\\le y_i$.",
        "Over symmetric $\\Delta$ with $\\|\\Delta\\|_2\\le\\rho$, $\\max_\\Delta w^T\\Delta w=\\rho\\|w\\|_2^2$ (take $\\Delta=\\rho\\,ww^T/\\|w\\|^2$).",
        "The constraint becomes $-\\mu^Tw+\\Phi^{-1}(1-\\beta)\\,\\sigma(w)\\le\\ell$. What is the sign of the coefficient on $\\sigma(w)$ when $\\beta\\gt1/2$?"
      ],
      "keyPoints": [
        "Impact: introduce $y_i\\ge|x_i|$, $s_i\\ge0$, $t_i\\ge0$ with $y_i^2\\le s_it_i$, $s_i^2\\le y_i$ (that is, $s_i^2\\le y_i\\cdot1$), and $\\sum_ic_it_i\\le q$. Each hyperbolic constraint is an SOC by B&V exercise 4.26. Check both directions: $s_i\\le\\sqrt{y_i}$ gives $y_i^{3/2}\\le t_i$, and $s_i=\\sqrt{y_i}$ attains it.",
        "Worst-case variance: $w^T\\hat\\Sigma w+\\rho\\|w\\|_2^2=w^T(\\hat\\Sigma+\\rho I)w\\le\\sigma^2$, i.e. $\\left\\|\\begin{bmatrix}\\hat L^Tw\\\\ \\sqrt\\rho\\,w\\end{bmatrix}\\right\\|_2\\le\\sigma$. For a spectral-norm ball, worst-case risk is exactly ridge shrinkage, so ridge has a robust interpretation.",
        "Loss probability: for $\\beta\\le1/2$, $\\Phi^{-1}(1-\\beta)\\ge0$, so the constraint is convex function ≤ constant, an SOC (B&V Example 4.8).",
        "Counterexample for $\\beta\\gt1/2$: one asset with $\\mu=0$, $\\sigma=1$. The constraint reads $\\Phi^{-1}(1-\\beta)|w|\\le\\ell$ with a negative coefficient, i.e. $|w|\\ge\\ell/|\\Phi^{-1}(1-\\beta)|$, which is nonconvex (it excludes a neighbourhood of 0).",
        "With Frobenius-norm uncertainty, symmetric $\\Delta$ with $\\|\\Delta\\|_F\\le\\rho$ gives the same $\\rho\\|w\\|_2^2$. Elementwise (box) uncertainty gives a different, $\\ell_1$-type penalty $\\rho\\|w\\|_1^2$."
      ],
      "followUps": [
        "Generalise the impact cost to |x|^p for rational p > 1 and count how many SOCs you need. Compare with CVXPY's power atom and the power cone.",
        "Under elementwise covariance uncertainty |Δ_ij| ≤ ρ_ij, is the worst-case variance still SOC-representable, or do you need an SDP?"
      ],
      "source": {
        "label": "B&V exercises 4.26 and 4.28 (adapted), with B&V §4.4.2 Example 4.8",
        "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf",
        "relation": "adapted from"
      }
    }
  ],
  "projects": [
    {
      "id": "cvx-problems-r1",
      "title": "Replicate the industry-portfolio Sharpe ratios of DeMiguel, Garlappi & Uppal (2009), then add convex regularisers",
      "level": "replication",
      "hours": "10–16",
      "paper": {
        "label": "DeMiguel, Garlappi & Uppal (2009) — Optimal versus naive diversification: how inefficient is the 1/N portfolio strategy? (Review of Financial Studies 22(5))",
        "url": "https://doi.org/10.1093/rfs/hhm075"
      },
      "goal": "Reproduce, for the Ken French industry-portfolio dataset, the out-of-sample Sharpe ratios reported in the paper's Sharpe-ratio table for 1/N, sample mean–variance, minimum-variance and their short-sale-constrained versions, using a rolling estimation window. Then add three convex variants (norm-constrained minimum variance, vol-targeted mean–variance with a turnover cap, and robust mean–variance) and place them in the same table.",
      "data": "Ken French Data Library: 10 Industry Portfolios (monthly) plus the market and the risk-free rate from the F-F factors file. Use the sample period and estimation window stated in the paper (record them; the paper uses a 120-month rolling window as its main case). Data revisions in the library mean small differences are expected. Use public or personal data only, never employer data or code.",
      "steps": [
        "Read the paper's data section and the definitions of each strategy (including how the risk-free asset and the market are treated in the industry dataset). Record every choice in a config file.",
        "Implement the strategies as CVXPY problems: sample tangency or mean–variance, minimum variance, their short-sale-constrained (w ≥ 0) versions, and 1/N. Use closed forms where they exist and check that CVXPY matches them to 1e-8.",
        "Roll the estimation window, compute monthly out-of-sample excess returns, and compute Sharpe ratios. Apply the paper's significance test for differences from 1/N (Jobson–Korkie with the Memmel correction) or a bootstrap equivalent.",
        "Add three convex variants: (i) min variance with ‖w‖₂² ≤ δ/N, with δ chosen by the paper-style cross-validation of DeMiguel et al. (2009, Management Science); (ii) max μ̂ᵀw subject to a vol target and ‖w − w_prev‖₁ ≤ τ; (iii) robust mean–variance with ellipsoidal Ω = diag(σ̂²)/T.",
        "Report turnover for every strategy."
      ],
      "deliverables": [
        "Reproduction table next to the paper's values, with absolute differences.",
        "Extended table including the three convex variants, with Sharpe ratios, p-values versus 1/N, and turnover.",
        "Short write-up: which convex modelling choices close the gap to 1/N and why, in the language of the debate question cvx-problems-q7."
      ],
      "acceptance": [
        "Every CVXPY solution matches its closed form (where one exists) to within 1e-8 in the ℓ∞ norm.",
        "Reproduced Sharpe ratios for 1/N and minimum variance are within 0.02 (monthly units) of the paper's values, and any larger deviation is explained (sample period, data revisions).",
        "The ranking of 1/N against unconstrained sample mean–variance agrees with the paper.",
        "Each strategy's Sharpe-ratio difference versus 1/N is reported with a p-value from the stated test.",
        "Turnover is reported with the paper's definition for all strategies, including the three convex extensions."
      ],
      "extensions": [
        "Repeat on the 49-industry dataset and on a post-2005 sample. Does the conclusion survive?",
        "Add the Tu & Zhou (2011) combination rule and check whether it dominates the convex variants."
      ]
    }
  ]
}
);
