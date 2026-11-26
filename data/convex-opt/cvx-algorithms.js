LAB.module("convex-opt", {
  "id": "cvx-algorithms",
  "order": 6,
  "title": "Newton and Interior-Point Methods",
  "summary": "B&V chapters 9–11 plus appendix C: why Newton's method needs a nearly constant number of steps, how self-concordance makes that statement free of unknown constants, how equality constraints and infeasible starts fit in, and how barrier and primal-dual interior-point methods turn every convex program into a short sequence of structured linear solves. Read it as the explanation of what a commercial QP solver is doing on your portfolio problem and of where the time goes.",
  "sources": [
    {
      "label": "Boyd & Vandenberghe, Convex Optimization, ch. 9 (Unconstrained minimization), ch. 10 (Equality constrained minimization), ch. 11 (Interior-point methods), appendix C (Numerical linear algebra background)",
      "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
    },
    {
      "label": "EE364a slides: B. Numerical linear algebra background",
      "url": "https://web.stanford.edu/class/ee364a/lectures/num-lin-alg.pdf"
    },
    {
      "label": "EE364a slides: 9. Unconstrained minimization",
      "url": "https://web.stanford.edu/class/ee364a/lectures/unconstrained.pdf"
    },
    {
      "label": "EE364a slides: 10. Equality constrained minimization",
      "url": "https://web.stanford.edu/class/ee364a/lectures/equality.pdf"
    },
    {
      "label": "EE364a slides: 11. Interior-point methods",
      "url": "https://web.stanford.edu/class/ee364a/lectures/barrier.pdf"
    },
    {
      "label": "Nesterov & Nemirovskii (1994) — Interior-Point Polynomial Algorithms in Convex Programming (SIAM)",
      "url": "https://doi.org/10.1137/1.9781611970791"
    },
    {
      "label": "Mehrotra (1992) — On the implementation of a primal-dual interior point method (SIAM J. Optim. 2(4))",
      "url": "https://doi.org/10.1137/0802028"
    },
    {
      "label": "Wright (1997) — Primal-Dual Interior-Point Methods (SIAM)",
      "url": "https://doi.org/10.1137/1.9781611971453"
    },
    {
      "label": "Stellato, Banjac, Goulart, Bemporad & Boyd (2020) — OSQP: an operator splitting solver for quadratic programs (Math. Prog. Computation 12)",
      "url": "https://doi.org/10.1007/s12532-020-00179-2"
    }
  ],
  "lessons": [
    {
      "id": "cvx-algorithms-1",
      "title": "Numerical linear algebra: flop counts, factor-solve, block elimination",
      "minutes": 75,
      "links": [
        {
          "label": "B&V appendix C.1–C.4 (flop counts, factor-solve, LU/Cholesky/LDLT, block elimination, matrix inversion lemma)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a slides B: Numerical linear algebra background",
          "url": "https://web.stanford.edu/class/ee364a/lectures/num-lin-alg.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>The factor-solve split: factoring costs $O(n^3)$ for dense matrices, every later solve costs $O(n^2)$. Reusing a factorization is where most practical speed-ups come from.</li><li>Block elimination and Schur complements (§C.4): eliminate the block that is easy to invert (diagonal, banded) and solve a small dense system for the rest.</li><li>The matrix inversion lemma as the algebra behind \"diagonal plus low rank\" solves.</li></ul><h3>Predict before you read</h3><ol><li>Solving $(D+FF^T)x=b$ with $D$ diagonal $n\\times n$ and $F$ of size $n\\times k$: what is the flop count with and without exploiting structure, for $n=3000$, $k=40$?</li><li>Why can it be faster to solve a larger but sparse KKT system than the smaller dense system obtained by eliminating variables?</li><li>When is the matrix inversion lemma numerically dangerous?</li></ol><h3>Leave with</h3><p>The cost of an optimization method is the cost of its linear solves, and that cost is set by structure (diagonal, low rank, sparse, banded), not by the nominal size.</p><h3>Equity-QR angle</h3><p>A factor risk model $\\Sigma=FF^T+D$ makes every Newton system for a portfolio problem diagonal plus rank $k$, so a step costs $O(nk^2)$ instead of $O(n^3)$. This is the single most important fact for solving large portfolio QPs quickly, and the reason never to form the dense $n\\times n$ covariance.</p>"
    },
    {
      "id": "cvx-algorithms-2",
      "title": "Unconstrained minimization, descent methods and gradient descent",
      "minutes": 80,
      "links": [
        {
          "label": "B&V §9.1–9.3 (strong convexity, descent methods, line search, gradient descent and its convergence)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a slides 9: Terminology and assumptions, gradient descent method",
          "url": "https://web.stanford.edu/class/ee364a/lectures/unconstrained.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>Strong convexity $mI\\preceq\\nabla^2f\\preceq MI$ gives a computable suboptimality bound from the gradient norm, and a linear rate set by $\\kappa=M/m$.</li><li>Backtracking line search (Armijo condition) with parameters $\\alpha,\\beta$; why the exact line search is rarely worth it.</li><li>The zig-zag of gradient descent on ill-conditioned quadratics and its dependence on coordinates.</li></ul><h3>Predict before you read</h3><ol><li>Gradient descent on a mean-variance objective with a sample covariance whose condition number is $10^4$: roughly how many iterations to reduce the error by $10^{-6}$?</li><li>Rescaling assets by their volatility changes the condition number. Does it change what gradient descent does? What Newton does?</li><li>Why does the bound $f(x)-p^\\star\\le\\|\\nabla f(x)\\|_2^2/(2m)$ rarely help in practice?</li></ol><h3>Leave with</h3><p>First-order methods are only as fast as the problem is well conditioned in the coordinates you chose; much of practical success is preconditioning.</p><h3>Equity-QR angle</h3><p>Covariance matrices of stock returns have condition numbers in the thousands or more because of the market factor. Plain gradient steps on raw weights are slow; scaling by volatility, or working in factor coordinates, is the cheap fix, and Newton removes the issue entirely.</p>"
    },
    {
      "id": "cvx-algorithms-3",
      "title": "Steepest descent and Newton's method",
      "minutes": 85,
      "links": [
        {
          "label": "B&V §9.4–9.5 (steepest descent in general norms, Newton step and decrement, convergence analysis, examples)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a slides 9: Steepest descent method, Newton's method",
          "url": "https://web.stanford.edu/class/ee364a/lectures/unconstrained.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>Steepest descent in a quadratic norm $\\|\\cdot\\|_P$ is gradient descent after the change of variables $\\bar x=P^{1/2}x$; Newton is steepest descent in the Hessian norm at the current point.</li><li>The Newton decrement $\\lambda(x)$: it estimates $f(x)-p^\\star$ by $\\lambda^2/2$ and is affine invariant.</li><li>Two phases: a damped phase with guaranteed decrease $\\gamma$ per step and a quadratically convergent phase that finishes in a handful of steps.</li></ul><h3>Predict before you read</h3><ol><li>Run pure Newton (step 1) on $f(x)=\\log(e^x+e^{-x})$ from $x_0=1$ and $x_0=1.1$ (B&V exercise 9.10). Guess what happens before computing.</li><li>In the classical convergence bound, which constants ($m$, $M$, $L$) appear, and which of them can you actually compute for a real problem?</li><li>Why does Newton's iteration count barely change when you scale the problem from 100 to 10,000 variables?</li></ol><h3>Leave with</h3><p>Newton's method is affine invariant and converges quadratically once close; the total iteration count is dominated by the damped phase, which is short for well-behaved problems.</p><h3>Equity-QR angle</h3><p>A QP solver's iteration count is roughly independent of the number of assets because each Newton step uses the full curvature. The cost you pay is the linear solve per step, which brings you back to structure (the previous lesson).</p>"
    },
    {
      "id": "cvx-algorithms-4",
      "title": "Self-concordance and implementation",
      "minutes": 80,
      "links": [
        {
          "label": "B&V §9.6–9.7 (self-concordant functions, calculus, Newton analysis, computing the Newton step, diagonal plus low rank)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a slides 9: Self-concordant functions, implementation",
          "url": "https://web.stanford.edu/class/ee364a/lectures/unconstrained.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>The definition $|f'''(x)|\\le2f''(x)^{3/2}$ is affine invariant and closed under sums and affine composition; $-\\log x$, $-\\log\\det X$ and log barriers of LP/SOCP/SDP constraints all qualify.</li><li>The payoff: an iteration bound $\\frac{f(x_0)-p^\\star}{\\gamma}+\\log_2\\log_2(1/\\epsilon)$ with $\\gamma$ depending only on the line search parameters.</li><li>Implementation: forming the Hessian and solving the Newton system is where all the work is; §9.7.2 treats band, sparse and diagonal-plus-low-rank structure.</li></ul><h3>Predict before you read</h3><ol><li>Is $\\log(e^x+e^{-x})$ self-concordant? If not, does that explain the behaviour you predicted in the previous lesson?</li><li>Why is it important that the bound contains no Lipschitz or strong convexity constants?</li><li>For a barrier on 6,000 linear inequalities in 3,000 variables, what dominates the cost of one Newton step?</li></ol><h3>Leave with</h3><p>Self-concordance turns Newton's convergence into a statement about the starting gap only, which is what makes interior-point complexity bounds possible.</p><h3>Equity-QR angle</h3><p>The log barriers on long-only, box, turnover and leverage constraints are all self-concordant, so a barrier-based solver's iteration count on your portfolio problem is predictable and nearly independent of the data. When a solver takes hundreds of iterations, the cause is almost always numerical (bad scaling, near-infeasibility), not the size.</p>"
    },
    {
      "id": "cvx-algorithms-5",
      "title": "Equality-constrained minimization and infeasible-start Newton",
      "minutes": 80,
      "links": [
        {
          "label": "B&V §10.1–10.4 (KKT systems, Newton with equality constraints, infeasible start Newton, implementation)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a slides 10: Equality constrained minimization",
          "url": "https://web.stanford.edu/class/ee364a/lectures/equality.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>The Newton step under $Ax=b$ solves a KKT system; three equivalent views: eliminate the constraints, Newton on the reduced problem, or Newton on the dual.</li><li>Infeasible-start Newton works on the primal-dual residual; a full step makes the equality constraints hold exactly from then on (B&V exercise 10.8).</li><li>Solving KKT systems: elimination with a Schur complement versus an $LDL^T$ factorization of the full sparse system.</li></ul><h3>Predict before you read</h3><ol><li>You start today's rebalance from yesterday's weights, which violate today's budget and neutrality constraints. Feasible-start or infeasible-start Newton?</li><li>If the Hessian is diagonal plus low rank and there are $p$ equality constraints, how do you solve the KKT system in $O(n(k+p)^2)$?</li><li>How does the infeasible-start residual decay when the step size is $t<1$?</li></ol><h3>Leave with</h3><p>Equality constraints cost one KKT solve per step; infeasible starts are free, which removes the need for a phase I for equalities.</p><h3>Equity-QR angle</h3><p>Budget, dollar-neutrality, beta-neutrality and sector-neutrality constraints are linear equalities. Infeasible-start Newton lets you initialize from yesterday's holdings or a target portfolio without first projecting onto today's constraint set.</p>"
    },
    {
      "id": "cvx-algorithms-6",
      "title": "Logarithmic barrier, central path and the barrier method",
      "minutes": 90,
      "links": [
        {
          "label": "B&V §11.1–11.4 (log barrier, central path, dual points from the central path, barrier method, phase I)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a slides 11: Logarithmic barrier and central path, barrier method, phase I methods",
          "url": "https://web.stanford.edu/class/ee364a/lectures/barrier.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>Each point on the central path $x^\\star(t)$ gives a dual feasible point and the duality gap $m/t$ for free.</li><li>The barrier method: center, increase $t$ by $\\mu$, repeat. The trade-off between few outer iterations (large $\\mu$) and few Newton steps per centering (small $\\mu$) is flat over a wide range.</li><li>Phase I: finding a strictly feasible point is itself a barrier problem, and its cost grows as the feasible set gets thin.</li></ul><h3>Predict before you read</h3><ol><li>For an LP with $m=1{,}000$ constraints, target gap $10^{-6}$ and $\\mu=20$, how many outer iterations? Total Newton steps?</li><li>What does the central path look like near a degenerate optimum?</li><li>If your portfolio constraints are nearly infeasible (e.g. tight sector bounds plus a tight tracking-error limit), what happens to phase I and to the main solve?</li></ol><h3>Leave with</h3><p>The barrier method trades an inequality-constrained problem for a sequence of smooth equality-constrained ones, with a certified gap $m/t$ at every outer step.</p><h3>Equity-QR angle</h3><p>This is where the \"20–50 Newton steps regardless of universe size\" rule of thumb comes from: the number of outer steps depends only on $\\log(m/\\epsilon)$ and the steps per centering are nearly constant. Infeasibility detection by phase I is how a solver tells you your constraint set is empty.</p>"
    },
    {
      "id": "cvx-algorithms-7",
      "title": "Complexity via self-concordance; generalized inequalities",
      "minutes": 80,
      "links": [
        {
          "label": "B&V §11.5–11.6 (complexity analysis, $O(\\sqrt m)$ bound, generalized logarithms, barriers for SOCP and SDP)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a slides 11: Complexity analysis, generalized inequalities",
          "url": "https://web.stanford.edu/class/ee364a/lectures/barrier.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>The worst-case bound on total Newton steps grows like $\\sqrt m\\,\\log(m/(t_0\\epsilon))$ for $\\mu=1+1/\\sqrt m$, while practical choices of $\\mu$ give a count that barely grows with $m$.</li><li>Generalized logarithms of degree $\\theta$ (e.g. $\\theta=2$ for a second-order cone, $\\theta=p$ for $\\mathbf S^p_+$) replace $m$ by $\\sum\\theta_i$ in the gap.</li><li>The same algorithm handles LP, SOCP and SDP: only the barrier, its gradient and Hessian change.</li></ul><h3>Predict before you read</h3><ol><li>Why is the worst-case $\\sqrt m$ bound so pessimistic compared with observed iteration counts?</li><li>For an SOCP with $m$ cones, what plays the role of $m$ in the duality gap?</li><li>What does an SDP constraint of size $p\\times p$ cost per Newton step compared with $p$ scalar inequalities?</li></ol><h3>Leave with</h3><p>Polynomial-time complexity of convex programming rests on self-concordant barriers; the theory explains why IPMs work, while practice runs them much more aggressively than the theory allows.</p><h3>Equity-QR angle</h3><p>Tracking-error limits and risk constraints are second-order cone constraints, and robust or covariance-estimation problems are SDPs. Knowing the barrier degree tells you what each constraint costs, and why a single large SDP can dominate an otherwise fast portfolio solve.</p>"
    },
    {
      "id": "cvx-algorithms-8",
      "title": "Primal-dual interior-point methods and implementation",
      "minutes": 85,
      "links": [
        {
          "label": "B&V §11.7–11.8 (primal-dual search directions, surrogate duality gap, primal-dual IPM, implementation and structure)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a slides 11: Primal-dual interior-point methods",
          "url": "https://web.stanford.edu/class/ee364a/lectures/barrier.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>Primal-dual methods apply Newton to modified KKT conditions with complementarity $-\\lambda_if_i(x)=1/t$, update primal and dual together and need no inner/outer loop.</li><li>The surrogate gap $\\hat\\eta=-f(x)^T\\lambda$ and the residual norm as the progress measures; superlinear convergence near the end.</li><li>Each iteration is still one structured linear solve of the same shape as a barrier Newton step (§11.8); Mehrotra's predictor-corrector (not in B&V) reuses that factorization twice.</li></ul><h3>Predict before you read</h3><ol><li>Why do production solvers use primal-dual rather than barrier methods?</li><li>How many factorizations per iteration does a predictor-corrector step need, and why does that matter?</li><li>You warm start an IPM from yesterday's optimal solution, which sits on the boundary. What goes wrong?</li></ol><h3>Leave with</h3><p>Primal-dual IPMs are Newton's method on perturbed KKT conditions; their cost per iteration is one factorization of a structured KKT matrix, and their iteration count is small and stable.</p><h3>Equity-QR angle</h3><p>Commercial and open-source QP/SOCP solvers (MOSEK, Gurobi barrier, Clarabel, ECOS) are primal-dual IPMs. For daily rebalancing, the levers are formulation (keep the factor structure so the KKT system is sparse), tolerances, and warm starts, which work poorly for IPMs and well for first-order or active-set methods.</p>"
    }
  ],
  "cheatsheet": [
    {
      "term": "Strong convexity bounds",
      "formula": "mI\\preceq\\nabla^2f\\preceq MI\\ \\Rightarrow\\ f(x)-p^\\star\\le\\frac{1}{2m}\\|\\nabla f(x)\\|_2^2",
      "note": "Gradient norm certifies suboptimality (B&V §9.1.2)."
    },
    {
      "term": "Gradient descent rate",
      "formula": "f(x^{(k)})-p^\\star\\le c^k\\,(f(x^{(0)})-p^\\star),\\quad c=1-m/M\\ \\text{(exact line search)}",
      "note": "Linear convergence; iterations scale with the condition number $M/m$ (B&V §9.3.1)."
    },
    {
      "term": "Backtracking (Armijo) line search",
      "formula": "f(x+t\\Delta x)\\le f(x)+\\alpha t\\nabla f(x)^T\\Delta x,\\quad t:=\\beta t",
      "note": "Typical $\\alpha\\in[0.01,0.3]$, $\\beta\\in[0.1,0.8]$."
    },
    {
      "term": "Newton step and decrement",
      "formula": "\\Delta x_{\\rm nt}=-\\nabla^2f(x)^{-1}\\nabla f(x),\\quad \\lambda(x)^2=\\nabla f(x)^T\\nabla^2f(x)^{-1}\\nabla f(x)",
      "note": "$\\lambda^2/2$ estimates $f(x)-p^\\star$; affine invariant."
    },
    {
      "term": "Self-concordance",
      "formula": "|f'''(x)|\\le 2f''(x)^{3/2}\\ \\text{along every line}",
      "note": "Closed under sums, scaling by $\\ge1$ and affine composition; $-\\log x$, $-\\log\\det X$ qualify."
    },
    {
      "term": "Newton iteration bound (self-concordant)",
      "formula": "N\\le\\frac{f(x^{(0)})-p^\\star}{\\gamma}+\\log_2\\log_2(1/\\epsilon),\\quad \\gamma=\\frac{\\alpha\\beta(1-2\\alpha)^2}{20-8\\alpha}",
      "note": "No problem constants appear (B&V §9.6.4)."
    },
    {
      "term": "Equality-constrained Newton (KKT system)",
      "formula": "\\begin{bmatrix}\\nabla^2f(x)&A^T\\\\A&0\\end{bmatrix}\\begin{bmatrix}\\Delta x\\\\w\\end{bmatrix}=-\\begin{bmatrix}\\nabla f(x)\\\\Ax-b\\end{bmatrix}",
      "note": "With $Ax=b$ already satisfied the second block is zero; otherwise this is the infeasible-start step."
    },
    {
      "term": "Infeasible-start residual decay",
      "formula": "r_{\\rm pri}^+=(1-t)\\,r_{\\rm pri},\\quad r_{\\rm pri}=Ax-b",
      "note": "A full step $t=1$ makes all equalities hold for every later iterate (B&V exercise 10.8)."
    },
    {
      "term": "Log barrier and central path",
      "formula": "x^\\star(t)=\\arg\\min_x\\ tf_0(x)-\\sum_{i=1}^m\\log(-f_i(x))\\ \\text{s.t.}\\ Ax=b,\\quad f_0(x^\\star(t))-p^\\star\\le m/t",
      "note": "Dual point $\\lambda_i^\\star=-1/(tf_i(x^\\star(t)))$ (B&V §11.2)."
    },
    {
      "term": "Barrier method outer iterations",
      "formula": "\\left\\lceil\\frac{\\log(m/(\\epsilon t^{(0)}))}{\\log\\mu}\\right\\rceil",
      "note": "Plus a nearly constant number of Newton steps per centering for practical $\\mu$ (10–100)."
    },
    {
      "term": "Worst-case IPM complexity",
      "formula": "O\\!\\left(\\sqrt m\\,\\log\\frac{m}{t^{(0)}\\epsilon}\\right)\\ \\text{Newton steps for}\\ \\mu=1+1/\\sqrt m",
      "note": "Via self-concordance (B&V §11.5); for cones replace $m$ by the total barrier degree."
    },
    {
      "term": "Surrogate duality gap (primal-dual)",
      "formula": "\\hat\\eta(x,\\lambda)=-f(x)^T\\lambda,\\qquad t=\\mu m/\\hat\\eta",
      "note": "Equals the true gap when $x$ is primal feasible and $(\\lambda,\\nu)$ dual feasible (B&V §11.7.2)."
    },
    {
      "term": "Matrix inversion lemma (diagonal plus low rank)",
      "formula": "(D+FF^T)^{-1}=D^{-1}-D^{-1}F(I+F^TD^{-1}F)^{-1}F^TD^{-1}",
      "note": "Solve in $O(nk^2+k^3)$ instead of $O(n^3)$ (B&V §C.4.3, §9.7.2)."
    },
    {
      "term": "Cholesky factor-solve cost",
      "formula": "\\tfrac13n^3\\ \\text{(factor)}+2n^2\\ \\text{(two triangular solves)}",
      "note": "Factor once, solve many times (B&V §C.3.2)."
    }
  ],
  "flashcards": [
    {
      "q": "Gradient descent linear rate under $mI\\preceq\\nabla^2f\\preceq MI$ with exact line search?",
      "a": "$c=1-m/M$ per iteration, so $O(\\kappa\\log(1/\\epsilon))$ iterations with $\\kappa=M/m$."
    },
    {
      "q": "What is the Newton decrement and what does it estimate?",
      "a": "$\\lambda(x)=(\\nabla f^T\\nabla^2f^{-1}\\nabla f)^{1/2}$; $\\lambda^2/2$ estimates $f(x)-p^\\star$ and is used as the stopping criterion."
    },
    {
      "q": "Steepest descent in the norm $\\|z\\|_P=(z^TPz)^{1/2}$: what direction?",
      "a": "$\\Delta x=-P^{-1}\\nabla f(x)$: gradient descent after the change of variables $\\bar x=P^{1/2}x$. Newton uses $P=\\nabla^2f(x)$."
    },
    {
      "q": "Definition of a self-concordant function on $\\mathbf R$.",
      "a": "Convex with $|f'''(x)|\\le2f''(x)^{3/2}$ for all $x$ in the domain; on $\\mathbf R^n$, self-concordant along every line."
    },
    {
      "q": "Iteration bound for Newton on a self-concordant function.",
      "a": "$(f(x_0)-p^\\star)/\\gamma+\\log_2\\log_2(1/\\epsilon)$ with $\\gamma=\\alpha\\beta(1-2\\alpha)^2/(20-8\\alpha)$."
    },
    {
      "q": "Pure Newton on $f(x)=-\\log x+x$ from $x_0=3$?",
      "a": "$x^+=2x-x^2=-3$, outside the domain: pure Newton fails although $f$ is self-concordant, because $\\lambda(x_0)=2>1$. Damping is required."
    },
    {
      "q": "Infeasible-start Newton: what happens to $Ax-b$ along a step of size $t$?",
      "a": "It is multiplied by $(1-t)$; after the first full step it is zero forever."
    },
    {
      "q": "Duality gap at the central point $x^\\star(t)$ of the log barrier with $m$ inequalities?",
      "a": "$m/t$, with dual point $\\lambda_i=-1/(tf_i(x^\\star(t)))$."
    },
    {
      "q": "Number of outer iterations of the barrier method?",
      "a": "$\\lceil\\log(m/(\\epsilon t_0))/\\log\\mu\\rceil$."
    },
    {
      "q": "Degree $\\theta$ of the standard barrier for the second-order cone and for $\\mathbf S^p_+$?",
      "a": "$\\theta=2$ for $-\\log(t^2-\\|x\\|^2)$; $\\theta=p$ for $-\\log\\det X$. The gap is $\\sum\\theta_i/t$."
    },
    {
      "q": "Surrogate duality gap in a primal-dual IPM?",
      "a": "$\\hat\\eta=-f(x)^T\\lambda$; $t$ is set to $\\mu m/\\hat\\eta$ at each iteration."
    },
    {
      "q": "Flop count to solve $(D+FF^T)x=b$, $D$ diagonal $n\\times n$, $F\\in\\mathbf R^{n\\times k}$, via the matrix inversion lemma?",
      "a": "About $2nk^2$ to form $F^TD^{-1}F$ plus $k^3/3$ to factor it, versus $n^3/3$ for dense Cholesky."
    },
    {
      "q": "Why are interior-point methods hard to warm start?",
      "a": "The previous optimum is on the boundary (complementarity near zero), far from the new central path; Newton steps from there are tiny. Shifting the point into the interior loses most of the benefit."
    }
  ],
  "projects": [
    {
      "id": "cvx-algorithms-p1",
      "title": "Barrier and primal-dual IPMs for a factor-model portfolio QP",
      "level": "core",
      "hours": "10–15",
      "goal": "Implement, from scratch in NumPy, a barrier method and a primal-dual interior-point method for the long-only mean-variance QP with a factor risk model (B&V exercise 11.24, adapted), and show empirically the two facts this module is about: iteration counts barely change with the number of assets, and the per-iteration cost drops from cubic to linear in n when the Newton system exploits the diagonal-plus-low-rank structure.",
      "data": "Factor returns: Kenneth French daily 5 factors plus momentum (public). Asset loadings: either estimated on the 49 industry portfolios (small case) or simulated from the empirical distribution of those loadings for n up to 20,000 synthetic assets, with residual variances drawn from the industry residual variances. Expected returns: a synthetic signal with IC around 0.05. Public data and simulation only.",
      "steps": [
        "Problem: minimize γ·wᵀ(FΩFᵀ + D)w − αᵀw subject to 1ᵀw = 1, 0 ≤ w ≤ u. Write it in standard form with inequality constraints f_i(w) ≤ 0.",
        "Barrier method: centering by feasible-start equality-constrained Newton with backtracking, μ ∈ {2, 10, 50, 150}; record Newton steps per centering and the duality gap m/t.",
        "Primal-dual IPM following B&V §11.7.3: residuals, surrogate gap, backtracking that keeps λ > 0 and f(w) < 0.",
        "Newton/KKT solve two ways: dense Cholesky of the n×n Hessian, and structured (diagonal plus rank k plus one equality) via block elimination and the matrix inversion lemma, never forming FΩFᵀ.",
        "Validate both solvers against CVXPY with Clarabel or OSQP to high accuracy on n ∈ {50, 500}.",
        "Scaling study: n ∈ {100, 300, 1,000, 3,000, 10,000, 20,000} with k = 20; record iterations and wall time per iteration for both linear-algebra variants (dense only up to the size your machine allows)."
      ],
      "deliverables": [
        "Code for both methods with a pluggable KKT solver.",
        "Plots: duality gap vs cumulative Newton steps for each μ (barrier); surrogate gap and dual residual vs iteration (primal-dual), as asked in exercise 11.24.",
        "Log-log plot of time per iteration vs n for dense and structured solves; table of iteration counts vs n."
      ],
      "acceptance": [
        "Objective values match CVXPY/Clarabel to 1e-6 relative on all validation instances and the KKT residuals of your solution are below 1e-7.",
        "Primal-dual iteration count stays within a factor of 2 across all n in the scaling study (report the actual range, which should be a few tens).",
        "Fitted log-log slope of structured time per iteration vs n is below 1.3, and the dense slope above 2.5 over the range where both run.",
        "The barrier method's total Newton steps vary by less than a factor of 2 for μ between 10 and 150 (the flat trade-off of B&V §11.3.2)."
      ],
      "extensions": [
        "Add Mehrotra's predictor-corrector and measure the reduction in iterations for the same number of factorizations.",
        "Add a turnover term ‖w − w_prev‖₁ by splitting into buy and sell variables and check that the KKT system stays diagonal plus low rank."
      ]
    },
    {
      "id": "cvx-algorithms-p2",
      "title": "Daily rebalancing: warm starts, infeasible starts and factorization reuse",
      "level": "stretch",
      "hours": "14–20",
      "goal": "Measure what actually saves time in a daily rebalancing loop: warm-starting an IPM, infeasible-start Newton from yesterday's holdings, factorization caching in ADMM, or simply loosening tolerances. Quantify the trade-off between solve time and the portfolio-level cost of an inexact solution (tracking of the exact optimum, realized turnover).",
      "data": "Same factor model as the core project, rolled through 2–5 years of daily data (Kenneth French factors; loadings re-estimated monthly, alpha updated daily with a persistent synthetic signal). Universe sizes n ∈ {500, 3,000}. Public data and simulation only.",
      "steps": [
        "Formulate the daily problem with turnover costs (linear plus a 3/2-power impact term as an SOCP or power cone) and box, budget and factor-exposure constraints.",
        "Solvers: your primal-dual IPM (cold, and warm-started by shifting yesterday's primal-dual point into the interior), Clarabel (cold), and OSQP with warm start and factorization caching (QP version with the impact term approximated by a quadratic).",
        "Implement infeasible-start Newton for the equality block and verify the residual decay (1 − t) per step (B&V exercise 10.8).",
        "For each solver and tolerance (1e-3, 1e-5, 1e-8), record time, iterations, distance to the high-accuracy solution and the resulting turnover over the backtest.",
        "Summarize where time goes: factorizations, solves, and model construction (CVXPY canonicalization can dominate for small problems; use parameters to avoid recompiling)."
      ],
      "deliverables": [
        "Benchmark table: median and 95th-percentile solve time, iterations and solution error by solver, warm/cold and tolerance.",
        "Plot: cumulative turnover and tracking difference vs the exact solution for loose vs tight tolerances.",
        "One-page recommendation for a production rebalancing pipeline."
      ],
      "acceptance": [
        "All solvers agree with a high-accuracy reference on every day to the stated tolerance (assertion in code).",
        "Warm-started OSQP shows a reduction in median iterations of at least 2x versus cold start (as in Table 7 of the OSQP paper); report the actual factor.",
        "The warm-started IPM's iteration savings are reported honestly, including the case where they are negligible, with an explanation in terms of the central path.",
        "CVXPY compilation time is measured separately from solver time, and parameterized problems are used so that compilation happens once."
      ],
      "extensions": [
        "Use cvxpylayers to differentiate the optimal weights with respect to alpha and check against finite differences.",
        "Try a GPU first-order solver (e.g. cuPDLP or GPU-ADMM) on n = 20,000 and compare with the structured IPM."
      ]
    }
  ],
  "frontier": {
    "asOf": "2026-11",
    "summary": "Interior-point methods remain the default for small and medium convex problems because they need a few tens of Newton steps almost regardless of data, and their theory (self-concordance) is complete. The research has moved to three places: making very large LPs and QPs solvable with first-order methods on GPUs (PDLP and its descendants, GPU ADMM), engineering better conic IPMs (homogeneous embeddings, nonsymmetric cones, quadratic objectives handled natively), and exploiting repeated solves (warm starts, factorization reuse, code generation, differentiation through the solution). For a portfolio desk, the practical frontier is how to combine a robust IPM for accuracy with first-order or parametric methods for speed and many scenarios.",
    "threads": [
      {
        "title": "First-order and GPU methods for large LPs and QPs",
        "why": "Restarted primal-dual hybrid gradient (PDLP) and its GPU versions now solve LPs with millions of variables where factorization-based IPMs run out of memory; ADMM-based QP solvers exploit factorization caching and GPUs. Their accuracy is lower and their iteration counts data-dependent, which matters for portfolio problems with tight constraints.",
        "refs": [
          {
            "label": "Applegate, Díaz, Hinder, Lu, Lubin, O'Donoghue & Schudy (2021) — Practical large-scale linear programming using primal-dual hybrid gradient (arXiv:2106.04756)",
            "url": "https://arxiv.org/abs/2106.04756"
          },
          {
            "label": "Lu & Yang (2023) — cuPDLP.jl: a GPU implementation of restarted primal-dual hybrid gradient for linear programming in Julia (arXiv:2311.12180)",
            "url": "https://arxiv.org/abs/2311.12180"
          },
          {
            "label": "Stellato, Banjac, Goulart, Bemporad & Boyd (2020) — OSQP: an operator splitting solver for quadratic programs (Math. Prog. Computation 12)",
            "url": "https://doi.org/10.1007/s12532-020-00179-2"
          },
          {
            "label": "O'Donoghue, Chu, Parikh & Boyd (2016) — Conic optimization via operator splitting and homogeneous self-dual embedding (JOTA 169)",
            "url": "https://doi.org/10.1007/s10957-016-0892-3"
          },
          {
            "label": "Schubiger, Banjac & Lygeros (2020) — GPU acceleration of ADMM for large-scale quadratic programming (JPDC 144)",
            "url": "https://doi.org/10.1016/j.jpdc.2020.05.021"
          }
        ]
      },
      {
        "title": "Modern conic interior-point solvers",
        "why": "Clarabel handles quadratic objectives directly in a homogeneous embedding, avoiding the epigraph reformulation that inflates portfolio QPs; nonsymmetric cones (exponential, power) extend IPMs to entropy, log-utility and 3/2-power impact models. Implementation details from Mehrotra and Andersen et al. still decide practical performance.",
        "refs": [
          {
            "label": "Goulart & Chen (2024) — Clarabel: an interior-point solver for conic programs with quadratic objectives (arXiv:2405.12762)",
            "url": "https://arxiv.org/abs/2405.12762"
          },
          {
            "label": "Skajaa & Ye (2015) — A homogeneous interior-point algorithm for nonsymmetric convex conic optimization (Math. Programming 150)",
            "url": "https://doi.org/10.1007/s10107-014-0773-1"
          },
          {
            "label": "Andersen, Roos & Terlaky (2003) — On implementing a primal-dual interior-point method for conic quadratic optimization (Math. Programming 95)",
            "url": "https://doi.org/10.1007/s10107-002-0349-3"
          },
          {
            "label": "Domahidi, Chu & Boyd (2013) — ECOS: an SOCP solver for embedded systems (ECC 2013)",
            "url": "https://doi.org/10.23919/ECC.2013.6669541"
          },
          {
            "label": "Gondzio (2012) — Interior point methods 25 years later (EJOR 218(3))",
            "url": "https://doi.org/10.1016/j.ejor.2011.09.017"
          },
          {
            "label": "Mehrotra (1992) — On the implementation of a primal-dual interior point method (SIAM J. Optim. 2(4))",
            "url": "https://doi.org/10.1137/0802028"
          }
        ]
      },
      {
        "title": "Warm starting and parametric solves",
        "why": "IPMs are hard to warm start because the previous solution is on the boundary; research on shifting and unblocking strategies has had mixed success, while ADMM and active-set methods warm start well. Code generation for fixed-structure problems gives microsecond solves for embedded use.",
        "refs": [
          {
            "label": "Yildirim & Wright (2002) — Warm-start strategies in interior-point methods for linear programming (SIAM J. Optim. 12(3))",
            "url": "https://doi.org/10.1137/S1052623400369235"
          },
          {
            "label": "Gondzio & Grothey (2008) — A new unblocking technique to warmstart interior point methods based on sensitivity analysis (SIAM J. Optim. 19(3))",
            "url": "https://doi.org/10.1137/060678129"
          },
          {
            "label": "Stellato, Banjac, Goulart, Bemporad & Boyd (2020) — OSQP: an operator splitting solver for quadratic programs (Math. Prog. Computation 12)",
            "url": "https://doi.org/10.1007/s12532-020-00179-2"
          },
          {
            "label": "Mattingley & Boyd (2012) — CVXGEN: a code generator for embedded convex optimization (Optimization and Engineering 13)",
            "url": "https://doi.org/10.1007/s11081-011-9176-9"
          },
          {
            "label": "Boyd, Busseti, Diamond, Kahn, Koh, Nystrup & Speth (2017) — Multi-period trading via convex optimization (Foundations and Trends in Optimization 3(1))",
            "url": "https://doi.org/10.1561/2400000023"
          }
        ]
      },
      {
        "title": "Randomized and approximate Newton methods",
        "why": "Sketching the Hessian square root gives Newton-like convergence at near-linear cost for tall data problems; it is relevant for large regression-type subproblems in estimation pipelines rather than for structured portfolio QPs.",
        "refs": [
          {
            "label": "Pilanci & Wainwright (2017) — Newton sketch: a near linear-time optimization algorithm with linear-quadratic convergence (SIAM J. Optim. 27(1))",
            "url": "https://doi.org/10.1137/15M1021106"
          }
        ]
      },
      {
        "title": "Differentiating through optimization",
        "why": "Implicit differentiation of the KKT conditions at the solution of a convex problem gives gradients of optimal portfolios with respect to inputs (alphas, risk model, costs). This enables end-to-end training of forecasts against portfolio outcomes, with open questions about stability at degenerate solutions.",
        "refs": [
          {
            "label": "Amos & Kolter (2017) — OptNet: differentiable optimization as a layer in neural networks (arXiv:1703.00443)",
            "url": "https://arxiv.org/abs/1703.00443"
          },
          {
            "label": "Agrawal, Amos, Barratt, Boyd, Diamond & Kolter (2019) — Differentiable convex optimization layers (arXiv:1910.12430)",
            "url": "https://arxiv.org/abs/1910.12430"
          }
        ]
      }
    ],
    "openQuestions": [
      "For a 5,000-name portfolio QP with a factor model and tight constraints, at what accuracy level does a GPU first-order solver beat a structured primal-dual IPM on wall time, and does the remaining constraint violation matter for realized P&L?",
      "Is there a warm-start strategy for primal-dual IPMs that reliably halves iteration counts in daily rebalancing, where the problem data change only slightly from day to day?",
      "How should solver tolerances be set as a function of alpha and risk-model uncertainty, so that solver error is negligible relative to estimation error but no time is wasted?",
      "Can the gradients from differentiable optimization layers be trusted when the optimal portfolio sits at a degenerate vertex (many bounds active), and how should they be regularized?",
      "Does exploiting low-rank-plus-diagonal structure remain the dominant speed-up when risk models include many sparse industry factors (k in the hundreds) and multiple risk models at once?"
    ],
    "brainstorm": [
      "Time your production optimizer and split the time into model building, canonicalization, factorization and iterations. Which part would the ideas in this module change?",
      "Write out the KKT matrix of your portfolio problem with the factor structure kept explicit (y = Fᵀw as variables). How sparse is it, and does your solver see that sparsity?",
      "Pick a constraint you add \"for safety\" and measure how much it increases iteration count or makes the problem nearly infeasible.",
      "Design an experiment that checks whether loosening the solver tolerance by 100x changes realized turnover or P&L over a year of backtest.",
      "Sketch how you would use differentiable optimization to tune a risk-aversion or cost parameter directly on backtest outcomes, and list the overfitting risks."
    ]
  }
}
);
