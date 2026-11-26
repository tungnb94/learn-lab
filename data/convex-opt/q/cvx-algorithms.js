LAB.extend("cvx-algorithms", {
  "questions": [
    {
      "id": "algorithms-q1",
      "type": "derive",
      "difficulty": 3,
      "prompt": "<p>Consider one Newton step of the barrier method for the long-only, fully invested factor-model QP</p>$$\\min_w\\ \\gamma\\,w^T(F\\Omega F^T+D)w-\\alpha^Tw\\quad\\text{s.t.}\\ \\mathbf 1^Tw=1,\\ 0\\preceq w\\preceq u,$$<p>with $n$ assets, $k\\ll n$ factors, $D$ diagonal, $\\Omega\\succ0$.</p><ol><li>Write the Hessian of $t\\cdot\\text{objective}+\\text{barrier}$ and show that it is diagonal plus rank $k$.</li><li>Derive an $O(nk^2+k^3)$ method for the KKT system with the single equality constraint, using block elimination and the matrix inversion lemma (B&V §9.7.2, §C.4). Count flops.</li><li>Alternatively introduce $y=F^Tw$ as a variable (the reformulation used by OSQP). Write the resulting KKT matrix, show it is sparse with $O(nk)$ nonzeros, and compare the cost of a sparse $LDL^T$ factorization with your elimination.</li><li>Which of the two approaches survives the addition of (a) a turnover penalty $\\|w-w_0\\|_1$, (b) a few dozen sector-neutrality equalities, (c) a second risk model with different factors?</li></ol>",
      "whyItMatters": "This is the calculation behind fast large-universe portfolio optimization: if each Newton step costs $O(nk^2)$ and the number of steps is nearly constant, the solve time grows linearly with the universe. Choosing the formulation that keeps the structure visible to the solver is often worth more than choosing the solver.",
      "hints": [
        "The barrier contributes $\\operatorname{diag}(1/w_i^2+1/(u_i-w_i)^2)$; the objective contributes $2t\\gamma(F\\Omega F^T+D)$.",
        "Let $H=\\Lambda+GG^T$ with $\\Lambda$ diagonal and $G=\\sqrt{2t\\gamma}\\,F\\Omega^{1/2}$. Solve $Hz=r$ via $(\\Lambda+GG^T)^{-1}=\\Lambda^{-1}-\\Lambda^{-1}G(I+G^T\\Lambda^{-1}G)^{-1}G^T\\Lambda^{-1}$, then handle the equality by eliminating $\\Delta w$ in the KKT system (one extra solve with $\\mathbf 1$).",
        "In the $(w,y)$ formulation the Hessian block is $\\operatorname{diag}(\\Lambda,2t\\gamma\\Omega)$ and the constraints are $F^Tw-y=0$ and $\\mathbf 1^Tw=1$; the KKT matrix has about $nk$ nonzeros from $F$."
      ],
      "keyPoints": [
        "Hessian $=\\Lambda+2t\\gamma F\\Omega F^T$ with $\\Lambda=2t\\gamma D+\\operatorname{diag}(w_i^{-2}+(u_i-w_i)^{-2})$: diagonal plus rank $k$.",
        "Elimination: forming $G^T\\Lambda^{-1}G$ costs about $nk^2$ flops, factoring it $k^3/3$; each solve then costs $O(nk)$; the equality adds one extra solve and a scalar Schur complement.",
        "The $(w,y)$ formulation gives a sparse quasi-definite KKT matrix whose $LDL^T$ factorization, with a good ordering, costs about the same, and a generic sparse solver discovers it automatically.",
        "Turnover via buy/sell splitting keeps the Hessian diagonal plus low rank (only more diagonal entries); sector equalities add $p$ rows, raising the cost to $O(n(k+p)^2)$; a second risk model adds another low-rank block, which the $(w,y)$ form handles naturally.",
        "Practical conclusion: pass the factor model to the solver in factored form; never build the $n\\times n$ covariance."
      ],
      "followUps": [
        "If the factors include 70 sparse industry dummies, $F$ is sparse. How does that change the cost of each approach?",
        "B&V exercise 9.26 treats Hessians of the form $\\sum_iA_i^TH_iA_i$ with sparse $A_i$. Map the multi-period trading problem of Boyd et al. (2017) onto it."
      ],
      "source": {
        "label": "B&V §9.7.2 (diagonal plus low rank) and appendix C.4, applied to the factor-model portfolio QP",
        "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf",
        "relation": "adapted from"
      }
    },
    {
      "id": "algorithms-q2",
      "type": "predict",
      "difficulty": 2,
      "prompt": "<p>Before running anything, write down your predictions, then check them against B&V §11.3.2 (the LP and GP examples and the family of standard-form LPs) or your own implementation.</p><ol><li>For a barrier method with $\\mu=20$, target gap $10^{-8}$, $t_0=1$, applied to random LPs with $m$ constraints and $n=m/2$ variables, how does the total number of Newton steps change as $m$ goes from 50 to 1,000? What does the worst-case bound $O(\\sqrt m\\log(m/\\epsilon))$ predict over the same range?</li><li>How does the total Newton count depend on $\\mu$ between 2 and 200? Sketch the curve.</li><li>A colleague's portfolio QP with $n=4{,}000$ assets takes 140 IPM iterations while a similar one with $n=400$ took 25. Give three hypotheses for the difference, none of which is \"the problem is bigger\".</li></ol>",
      "whyItMatters": "The near-constant iteration count of IPMs is the basis for budgeting solve time in production. Knowing what does and does not drive iteration counts tells you where to look when a solver suddenly slows down.",
      "hints": [
        "Outer iterations are $\\lceil\\log(m/(\\epsilon t_0))/\\log\\mu\\rceil$; newton steps per centering depend on $\\mu$ but hardly on $m$ in practice.",
        "For small $\\mu$ there are many outer iterations with 1–2 Newton steps each; for large $\\mu$ few outer iterations but more steps each. The product is flat over a broad middle range.",
        "Iteration counts blow up with poor scaling (assets with very different variances, huge bounds), near-infeasibility or near-degeneracy, and loose initial points."
      ],
      "keyPoints": [
        "Total Newton steps grow very slowly with $m$ (roughly like $\\log m$ in practice, staying in a band of a few tens), while the $\\sqrt m$ bound predicts a factor of about 4.5 increase from 50 to 1,000.",
        "The total vs $\\mu$ curve is U-shaped and flat for $\\mu$ roughly between 10 and 100 or more.",
        "The gap between theory and practice comes from the worst-case analysis using short steps; practical long steps work because centering from a nearby point takes few Newton steps.",
        "Credible hypotheses for 140 iterations: bad scaling of data (units, tiny residual variances), a nearly infeasible or degenerate constraint set (e.g. tight neutrality plus bounds), numerical issues in the KKT factorization (regularization kicking in), or a tolerance set much tighter than in the small case.",
        "Diagnostic: inspect the primal and dual residual histories and the step lengths; short steps signal ill-conditioning or degeneracy."
      ],
      "followUps": [
        "Reproduce the B&V plot of Newton steps vs $m$ for standard-form LPs and overlay $c\\sqrt m$ fitted at $m=50$.",
        "Repeat with a primal-dual IPM and Mehrotra's predictor-corrector: how much flatter does the curve become?"
      ],
      "source": {
        "label": "B&V §11.3.2 (examples) and §11.5 (complexity analysis)",
        "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf",
        "relation": "motivated by"
      }
    },
    {
      "id": "algorithms-q3",
      "type": "counterexample",
      "difficulty": 2,
      "prompt": "<p>Find concrete low-dimensional examples for each claim and explain what each one teaches.</p><ol><li>Pure Newton (step size 1) can diverge on a smooth strictly convex function with a unique minimizer (B&V exercise 9.10(a): $f(x)=\\log(e^x+e^{-x})$). Find the threshold starting point beyond which it diverges.</li><li>Pure Newton can leave the domain of a self-concordant function (exercise 9.10(b): $f(x)=-\\log x+x$ from $x_0=3$). Reconcile this with the self-concordant convergence theory.</li><li>The classical (non-self-concordant) bound of §9.5.3 is not affine invariant. Take $f(x)=\\sum_{j=1}^2(x_j-\\log x_j)$ on $\\mathbf R^2_{++}$ and $g_a(y)=f(y_1,ay_2)$. Show that damped Newton on $g_a$ produces exactly the transformed iterates of Newton on $f$ for every $a>0$, while the classical bound computed from $m$, $M$, $L$ on the sublevel set grows without limit as $a\\to\\infty$. What does the self-concordant bound say?</li></ol>",
      "whyItMatters": "Production solvers never take raw Newton steps; understanding exactly why line search and self-concordance are needed explains failure modes such as solvers stalling on poorly scaled or non-self-concordant formulations (e.g. exponentials of large arguments in utility or impact models).",
      "hints": [
        "For (1), the Newton map is $x^+=x-\\tanh(x)/\\operatorname{sech}^2(x)=x-\\tfrac12\\sinh(2x)$. Look for the 2-cycle $x^+=-x$.",
        "For (2), compute $x^+=2x-x^2$ and the Newton decrement $\\lambda(x_0)$. Self-concordant theory guarantees a feasible full step only when $\\lambda<1$.",
        "For (3), Newton directions transform covariantly under $y=T^{-1}x$ with $T=\\operatorname{diag}(1,a)$. Under that map the Hessian eigenvalue bounds become roughly $m\\min(1,a^2)$ and $M\\max(1,a^2)$, and $L$ picks up up to $\\max(1,a^3)$. Plug into the number of damped steps $\\propto M^2L^2/m^5$."
      ],
      "keyPoints": [
        "Threshold for (1) solves $\\sinh(2x)=4x$ (the 2-cycle $x^+=-x$), $x\\approx1.09$: starting at 1 converges, at 1.1 diverges with growing oscillation.",
        "$\\log(e^x+e^{-x})$ is not self-concordant (requires $|\\sinh x|\\le1$), so the affine-invariant theory gives no guarantee.",
        "In (2), $\\lambda(3)=2>1$: outside the region $\\lambda<1$ where the full step stays in the domain; the damped phase with backtracking handles it.",
        "In (3), the iterates are identical up to the linear map (affine invariance of Newton), but the classical damped-phase bound, proportional to $(f(x_0)-p^\\star)M^2L^2/m^5$, grows like a power of $a$; the self-concordant bound depends only on $f(x_0)-p^\\star$ and the line search parameters and is unchanged. This mismatch is why the self-concordant analysis was developed.",
        "Lesson for practice: keep the line search, formulate with self-concordant barriers (exponential cone instead of raw exponentials), and scale data."
      ],
      "followUps": [
        "Show that $f(x)=x^4$ has a Newton iteration that converges only linearly to its minimizer. Which assumption of §9.5.3 fails?",
        "Exercise 9.11: compare gradient and Newton steps for $f$ and $\\phi(f)$ with $\\phi$ increasing convex. Which method is invariant?"
      ],
      "source": {
        "label": "B&V exercise 9.10 (adapted)",
        "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf",
        "relation": "adapted from"
      }
    },
    {
      "id": "algorithms-q4",
      "type": "derive",
      "difficulty": 3,
      "prompt": "<p>Why the logarithm? Let $h:\\mathbf R\\to\\mathbf R$ be closed, increasing, convex and twice differentiable with $\\operatorname{dom}h=-\\mathbf R_{++}$ (so $h(u)\\to\\infty$ as $u\\to0^-$). Define the $h$-barrier $\\phi_h(x)=\\sum_ih(f_i(x))$ and the $h$-central path $x^\\star(t)=\\arg\\min_x tf_0(x)+\\phi_h(x)$ (B&V exercise 11.6).</p><ol><li>Show that $tf_0+\\phi_h$ is convex.</li><li>Construct a dual feasible $\\lambda$ from $x^\\star(t)$ and compute the resulting duality gap.</li><li>Show that the gap depends only on $t$ and $m$, independently of the data, if and only if $h(u)=-c\\log(-u)+d$.</li><li>Compare the inverse barrier $h(u)=-1/u$: what does the gap depend on, and what would a barrier method using it need to monitor?</li></ol>",
      "whyItMatters": "The fact that the log barrier's gap is exactly $m/t$ is what makes interior-point methods predictable: progress can be scheduled without looking at the data. Deriving it from the general family shows the choice is forced, not conventional.",
      "hints": [
        "Composition rule: $h$ increasing convex and $f_i$ convex.",
        "Stationarity of $tf_0+\\phi_h$: $t\\nabla f_0+\\sum_ih'(f_i)\\nabla f_i=0$. So $\\lambda_i=h'(f_i(x^\\star))/t\\ge0$ makes $x^\\star$ minimize the Lagrangian.",
        "Gap $=-\\sum_i\\lambda_if_i=-\\tfrac1t\\sum_ih'(f_i)f_i$. It is data-independent iff $u\\,h'(u)$ is constant on $u<0$."
      ],
      "keyPoints": [
        "Convexity by composition of an increasing convex $h$ with convex $f_i$.",
        "Dual point $\\lambda_i=h'(f_i(x^\\star(t)))/t$; gap $=-\\frac1t\\sum_if_i(x^\\star)h'(f_i(x^\\star))$.",
        "$uh'(u)=-c$ for all $u<0$ gives $h'(u)=-c/u$ and $h(u)=-c\\log(-u)+d$; conversely the log gives gap $cm/t$.",
        "Inverse barrier: $h'(u)=1/u^2$, gap $=\\frac1t\\sum_i1/|f_i|$, which depends on how close constraints are to active; the method must compute the gap from the iterate rather than schedule $t$ from $m$ alone.",
        "Connects to self-concordance: the log barrier is also the one with the right third-derivative scaling."
      ],
      "followUps": [
        "B&V exercise 11.7: derive the tangent $dx^\\star(t)/dt$ to the central path and show $f_0(x^\\star(t))$ decreases in $t$. How could the tangent be used to warm start the next centering step?",
        "For generalized inequalities, what replaces the log and what replaces $m$?"
      ],
      "source": {
        "label": "B&V exercise 11.6 (adapted)",
        "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf",
        "relation": "adapted from"
      }
    },
    {
      "id": "algorithms-q5",
      "type": "critique",
      "difficulty": 2,
      "prompt": "<p>Critique this design note from a portfolio-construction team:</p><blockquote>\"Interior-point methods cannot be warm started, so for our daily rebalance of 3,000 names we switched from an IPM to ADMM (OSQP) with warm start. OSQP is 7x faster in our tests, so we also run it at default tolerances (1e-3) in the backtest. Since both are convex solvers, they return the same portfolio.\"</blockquote><p>Address: what is and is not true about IPM warm starting; what the 7x actually measures; the accuracy of ADMM at default tolerances on problems with many active bounds; and whether \"same portfolio\" holds when the optimum is not unique or nearly so.</p>",
      "whyItMatters": "Solver choice and tolerances silently change realized turnover and constraint compliance. A 1e-3 tolerance on a fully invested, bound-constrained portfolio can mean visible constraint violations and weights that differ from the true optimum by more than the trade threshold.",
      "hints": [
        "Where on the central path does yesterday's optimum lie, and what do warm-start strategies (Yildirim & Wright 2002; Gondzio & Grothey 2008) do about it?",
        "In the OSQP paper's parametric portfolio benchmark, how much of the speed-up comes from factorization caching versus fewer iterations?",
        "ADMM tolerances are on primal and dual residuals, not on the objective gap; with a flat objective along some directions, many portfolios are near-optimal."
      ],
      "keyPoints": [
        "IPM warm starts are hard, not impossible: the old solution sits on the boundary with near-zero complementarity, so it must be pushed into the interior, which loses much of the benefit; reported gains exist but are modest and problem-dependent.",
        "The OSQP paper reports for its portfolio back test roughly 6–7x time reduction but only about 3x fewer iterations with warm start, so factorization reuse is a large part of the gain; an IPM refactors each iteration.",
        "At 1e-3 residual tolerance, budget and bound constraints can be violated at the 0.1% level and weights can differ materially from the optimum; solution polishing or tighter tolerances are needed for compliance-critical constraints.",
        "With nearly flat directions (highly correlated names, weak alphas), different solvers return different but near-optimal portfolios, so turnover and backtest P&L differ; backtests should use the same solver and tolerance as production or a high-accuracy reference.",
        "A balanced design: IPM (or ADMM with polishing) at tight tolerance for the production trade, ADMM warm-started for scenario sweeps, with a check of constraint residuals each day."
      ],
      "followUps": [
        "Measure, in a backtest, the turnover difference between tolerance 1e-3 and 1e-7 solutions and express it in basis points of cost per year.",
        "Would an active-set QP method be a better fit for daily warm starts than either? What is its worst case?"
      ],
      "source": {
        "label": "Yildirim & Wright (2002); Gondzio & Grothey (2008); Stellato et al. (2020) OSQP, Table 7",
        "url": "https://doi.org/10.1137/S1052623400369235",
        "relation": "motivated by"
      }
    },
    {
      "id": "algorithms-q6",
      "type": "design",
      "difficulty": 3,
      "prompt": "<p>Design the optimization layer of a daily rebalancing system: 3,000 names, a 60-factor risk model, alpha forecasts, transaction costs with a linear spread term and a $|\\text{trade}|^{3/2}$ impact term, position bounds, sector and beta neutrality, a gross leverage limit, and a hard tracking-error limit. The solve must finish in under 2 seconds and run 500 times per night for scenario analysis.</p><ol><li>Write the problem in a form an IPM sees as sparse: which auxiliary variables do you introduce, which cones appear, and what is the size and sparsity of the KKT system?</li><li>Choose a solver strategy for (a) the production solve and (b) the 500 scenarios. Justify with iteration counts and per-iteration costs from this module.</li><li>Specify tolerances, scaling, infeasibility handling (what if the tracking-error limit and neutrality constraints conflict?), and a test suite that would catch a silent solver failure.</li></ol>",
      "whyItMatters": "This is the concrete engineering problem that every systematic equity team faces. A design based on structure, iteration counts and per-step costs gives predictable latency; a design based on trial and error breaks when the universe or constraint set changes.",
      "hints": [
        "Use $y=F^Tw$, buy/sell splits for the linear cost, a power-cone or SOC representation for the 3/2 term, and an SOC constraint for tracking error in factored form.",
        "Count nonzeros: $F$ contributes about $nk$; each other block is diagonal or a few dense rows. Per-iteration cost is roughly a sparse $LDL^T$ with $O(nk^2)$ fill at worst.",
        "Infeasibility: IPMs with homogeneous self-dual embedding return certificates; decide in advance which constraints are soft (penalized) and which are hard."
      ],
      "keyPoints": [
        "A formulation with $w$, $y=F^Tw$, trade variables $b,s\\ge0$, cone variables for the impact term and one SOC for tracking error $\\|(\\Omega^{1/2}y,\\,D^{1/2}(w-w_b))\\|_2\\le\\sigma$, giving a KKT system with $O(nk)$ nonzeros.",
        "Production: primal-dual conic IPM (e.g. MOSEK, Clarabel) with about 20–50 iterations of $O(nk^2)$ work, comfortably within 2 seconds at $n=3{,}000$, $k=60$.",
        "Scenarios: parameterize the problem once (no recompilation), warm-start a first-order or parametric method, or exploit that only alphas change (same KKT pattern, possibly same factorization structure); parallelize across cores.",
        "Tolerances tied to economic significance (e.g. weight error far below trade threshold), data scaling (vol-normalized units), soft versions of conflict-prone constraints with large penalties, and use of infeasibility certificates.",
        "Tests: KKT residual checks on every solve, comparison with a reference solver on a sample, invariance tests (permuting assets, rescaling units), and alerting on iteration-count jumps."
      ],
      "followUps": [
        "How would you extend this to a multi-period problem with 5 periods (Boyd et al. 2017)? What happens to KKT structure and cost?",
        "Where would differentiable optimization (cvxpylayers) fit, and what would you use the gradients for?"
      ],
      "source": {
        "label": "Boyd et al. (2017) — Multi-period trading via convex optimization; B&V §11.8 (implementation)",
        "url": "https://doi.org/10.1561/2400000023",
        "relation": "motivated by"
      }
    },
    {
      "id": "algorithms-q7",
      "type": "connect",
      "difficulty": 2,
      "prompt": "<p>B&V exercise 9.31 tests two approximate Newton methods on an analytic-centering problem: reusing the Hessian factorization for $N$ steps, and replacing the Hessian by its diagonal.</p><ol><li>Explain, in terms of the change-of-coordinates view of steepest descent (§9.4.1), what the diagonal approximation does and when it recovers most of Newton's benefit.</li><li>Connect this to diagonal preconditioners in ML optimizers (AdaGrad/Adam scale each coordinate by a running root-mean-square of gradients). What curvature quantity do they approximate, and why is that not the diagonal of the Hessian in general?</li><li>Shampoo and K-FAC-type methods use Kronecker-factored, non-diagonal preconditioners. Relate them to the \"diagonal plus low rank\" and block structures of §9.7.2. Which would you expect to help most for a covariance with a dominant market factor?</li></ol>",
      "whyItMatters": "The same trade-off between curvature information and per-step cost governs portfolio solvers and neural-network training. Knowing what a diagonal preconditioner can and cannot fix explains why factor-structured curvature matters for both.",
      "hints": [
        "Diagonal scaling is steepest descent in the norm $\\|z\\|_{\\operatorname{diag}(H)}$; it is exact when the Hessian is diagonal and fails when off-diagonal correlation dominates.",
        "Adam's second-moment estimate is $\\mathbb E[g_i^2]$, related to the diagonal of the empirical Fisher (Gauss-Newton-like) matrix, not the Hessian; its square root is used, which is neither.",
        "A covariance $\\beta\\beta^T\\sigma_m^2+D$ has a dominant rank-one part that no diagonal preconditioner removes; a rank-one correction (matrix inversion lemma) does."
      ],
      "keyPoints": [
        "Diagonal approximation = coordinate rescaling; it removes ill-conditioning due to scale differences but not due to correlation.",
        "Hessian reuse trades a slower (linear) convergence rate for cheaper iterations; useful when factorization dominates and the Hessian changes slowly.",
        "Adam/AdaGrad use squared-gradient statistics (empirical Fisher diagonal), take a square root and add momentum; they are diagonal preconditioners, not diagonal Newton.",
        "For a market-factor-dominated covariance, condition number after diagonal scaling remains of order $n$ times the factor-to-idiosyncratic variance ratio; a low-rank correction is needed, which is what factor-aware solvers do.",
        "Kronecker-factored preconditioners capture block correlation cheaply, analogous to exploiting block or low-rank structure in Newton systems."
      ],
      "followUps": [
        "Run gradient descent, diagonal-scaled descent and Newton on a mean-variance problem with a one-factor covariance and plot iterations vs $n$.",
        "Show that adding a rank-one correction to the diagonal preconditioner makes the iteration count independent of the market-factor variance."
      ],
      "source": {
        "label": "B&V exercise 9.31 (adapted)",
        "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf",
        "relation": "adapted from"
      }
    },
    {
      "id": "algorithms-q8",
      "type": "derive",
      "difficulty": 2,
      "prompt": "<p>Infeasible-start Newton for equality constraints (B&V §10.3).</p><ol><li>Show that along the primal-dual Newton direction, the primal residual satisfies $r_{\\rm pri}(x+t\\Delta x)=(1-t)\\,r_{\\rm pri}(x)$. Deduce that if an equality is satisfied at the start it stays satisfied, and that after the first full step all equalities hold (exercise 10.8).</li><li>You rebalance daily starting from yesterday's weights $w_0$. Today the beta vector changes, so the beta-neutrality constraint $\\beta^Tw=0$ is violated by $\\beta^Tw_0=0.04$, while the budget constraint still holds. Trace what the infeasible-start method does to each constraint along the iterations.</li><li>Compare with first projecting $w_0$ onto $\\{w:Aw=b\\}$ and then running feasible-start Newton. When can the projection hurt (think about inequality constraints that the projected point may violate)?</li></ol>",
      "whyItMatters": "Daily rebalancing always starts from a point that is close to optimal but infeasible for today's constraints. Knowing that infeasible-start Newton handles this exactly, and how quickly, removes the need for ad hoc projection steps that can break other constraints.",
      "hints": [
        "The second block row of the KKT system is $A\\Delta x=-(Ax-b)$. Apply it to $A(x+t\\Delta x)-b$.",
        "Every equality is scaled by the same factor $(1-t)$, so constraints satisfied at the start remain satisfied for any $t$.",
        "The Euclidean projection onto $Aw=b$ is $w_0-A^T(AA^T)^{-1}(Aw_0-b)$; it can push weights below zero or above their bounds, which a barrier method cannot accept as a starting point."
      ],
      "keyPoints": [
        "Derivation: $A(x+t\\Delta x)-b=(1-t)(Ax-b)$ from the KKT system.",
        "Satisfied constraints remain satisfied; a single full step ($t=1$) makes all equalities exact, after which the method coincides with feasible-start Newton.",
        "In the example the budget residual stays zero, the beta residual shrinks geometrically with the accepted step sizes and is exactly zero after the first full step.",
        "The projection approach may break bound or long-only constraints and then needs a phase I; infeasible-start Newton (or a primal-dual IPM) avoids this.",
        "The line search is on the norm of the full residual, which can increase the objective temporarily; this is expected."
      ],
      "followUps": [
        "Exercise 10.9: for equality-constrained entropy maximization, show the sublevel set can fail to be closed for some feasible starting points, so the feasible-start analysis does not apply, while the infeasible-start one does.",
        "In a primal-dual IPM, the same residual-scaling property holds for the equality constraints. What happens to the inequality residuals?"
      ],
      "source": {
        "label": "B&V exercise 10.8 (adapted)",
        "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf",
        "relation": "adapted from"
      }
    }
  ],
  "projects": [
    {
      "id": "cvx-algorithms-p3",
      "title": "Replicate the warm-start portfolio back test of the OSQP paper and add an IPM baseline",
      "level": "replication",
      "hours": "10–16",
      "paper": {
        "label": "Stellato, Banjac, Goulart, Bemporad & Boyd (2020) — OSQP: an operator splitting solver for quadratic programs, Table 7 (portfolio rows), arXiv:1711.08013 v4",
        "url": "https://arxiv.org/abs/1711.08013"
      },
      "goal": "Reproduce the portfolio rows of Table 7 of the OSQP paper (parametric back test with and without warm start for k = 100, 200, 300, 400 factors) and extend it with an interior-point baseline to show the contrast this module is about: ADMM benefits from warm starts and factorization caching, while an IPM's iteration count is small and nearly flat but hard to reduce by warm starting.",
      "data": "Simulated exactly as in the paper: problem (37) with y = Fᵀx, n assets tied to the number of factors k as described in the paper's back test section (check the exact n–k relation in v4 before running), sparse F with Gaussian entries, diagonal D, monthly risk-model perturbations and daily expected-return updates, 20 QPs per month for 4 years (960 QPs). Optionally calibrate F and D to Kenneth French factor data.",
      "steps": [
        "Implement the problem generator and the update scheme from the paper (appendix A.4 and the parametric section).",
        "Solve each sequence with OSQP cold (no warm start, new factorization) and warm (warm start plus cached factorization), at the paper's tolerances.",
        "Record time and iterations per QP; compute averages per k and the improvement ratios as in Table 7.",
        "Add Clarabel (or another IPM) cold and with a naive warm start; record iterations and time per QP.",
        "Plot iteration counts for both solver families vs k and the distribution over the back test."
      ],
      "deliverables": [
        "Script reproducing the portfolio rows of Table 7 from a seed.",
        "Table: your numbers next to the paper's for each k, with your hardware stated.",
        "Figure and paragraph comparing ADMM and IPM iteration counts and warm-start benefits."
      ],
      "acceptance": [
        "Warm-start iteration reduction for OSQP is between 2x and 5x for every k (the paper reports roughly 2.9–3.7x); time reduction is above 3x (paper: roughly 5.8–7x).",
        "Warm-started OSQP iteration counts are roughly constant across k (paper: about 25–26).",
        "IPM iteration counts vary by less than 30% across k and the naive warm start reduces them by less than 30% (report the actual numbers and explain either way).",
        "All OSQP solutions satisfy the constraints to the stated tolerance, verified independently."
      ],
      "extensions": [
        "Add the solution-polishing step and measure its cost and accuracy gain.",
        "Replace the IPM's naive warm start with a shifted interior point (Yildirim & Wright 2002) and report whether it helps."
      ]
    }
  ]
}
);
