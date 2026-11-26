LAB.module("convex-opt", {
  "id": "cvx-sets",
  "order": 1,
  "title": "Convex Sets",
  "summary": "B&V chapter 2 read through a portfolio lens: the geometry of affine sets, cones, norm balls, polyhedra and the PSD cone; the operations that keep sets convex; generalized inequalities; separation and dual cones as the source of every infeasibility certificate and every dual variable you will meet later.",
  "sources": [
    {
      "label": "Boyd & Vandenberghe (2004), Convex Optimization, ch. 2 (Convex sets) — free PDF",
      "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
    },
    {
      "label": "EE364a slides, deck 2: Convex sets (revised slides by Boyd, Vandenberghe & Nobel)",
      "url": "https://web.stanford.edu/class/ee364a/lectures/sets.pdf"
    },
    {
      "label": "EE364a full slide set (all decks in one PDF)",
      "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxslides.pdf"
    },
    {
      "label": "EE364a additional exercises (cvxgrp/cvxbook_additional_exercises), section 2",
      "url": "https://github.com/cvxgrp/cvxbook_additional_exercises"
    },
    {
      "label": "Higham (2002) — Computing the nearest correlation matrix: a problem from finance",
      "url": "https://doi.org/10.1093/imanum/22.3.329"
    },
    {
      "label": "Jagannathan & Ma (2003) — Risk reduction in large portfolios: why imposing the wrong constraints helps",
      "url": "https://doi.org/10.1111/1540-6261.00580"
    }
  ],
  "lessons": [
    {
      "id": "cvx-sets-1",
      "title": "Affine and convex sets, cones, and the standard examples",
      "minutes": 80,
      "links": [
        {
          "label": "B&V §2.1 (affine/convex sets, cones) and §2.2.1–2.2.4 (hyperplanes, balls, norm cones, polyhedra)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a deck 2, slides 2.2–2.9",
          "url": "https://web.stanford.edu/class/ee364a/lectures/sets.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>The three hulls (affine, convex, conic) differ only in the sign and sum constraints on the coefficients; keep that table in your head.</li><li>Affine dimension vs. relative interior (§2.1.3): a fully invested, dollar-neutral book lives in a set with empty interior, which matters for every later \"strictly feasible\" assumption.</li><li>Norm balls and norm cones: the cone $\\{(x,t):\\|x\\|\\le t\\}$ is what lets a leverage or tracking-error limit enter a conic solver.</li><li>The two descriptions of a polyhedron (intersection of halfspaces vs. hull of points and rays) and why converting between them is expensive.</li></ul><h3>Predict before you read</h3><ol><li>Is the set of portfolios with $\\|w\\|_1\\le 2$ and $\\mathbf 1^Tw=0$ a polyhedron? How many vertices does it have for $n$ assets?</li><li>Is an ellipsoid $\\{w: w^T\\Sigma w\\le\\sigma^2\\}$ still an ellipsoid when $\\Sigma$ is singular? What is it instead?</li><li>Which is bigger in volume for large $n$: the unit $\\ell_1$ ball or the unit $\\ell_\\infty$ ball, and by roughly what factor?</li></ol><h3>Leave with</h3><p>Almost every hard portfolio constraint is an intersection of halfspaces, hyperplanes and norm balls, so the feasible set is convex by construction. The moment you meet something that is not one of these (a minimum lot, a cardinality cap, a risk floor), you have left convexity.</p><h3>Equity-QR angle</h3><p>Write down your book's constraints as sets: budget and dollar neutrality are hyperplanes, sector and beta bands are slabs, position limits are a box, gross leverage is an $\\ell_1$ ball, turnover is an $\\ell_1$ ball centred at current holdings, and an ex-ante risk cap is an ellipsoid. Count the affine dimension that is left after the equalities. This count bounds how many independent \"bets\" the optimizer can still express.</p>"
    },
    {
      "id": "cvx-sets-2",
      "title": "The positive semidefinite cone",
      "minutes": 50,
      "links": [
        {
          "label": "B&V §2.2.5 (PSD cone), Examples 2.6–2.7; Appendix A.5.5 (Schur complements)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a deck 2, slide 2.10",
          "url": "https://web.stanford.edu/class/ee364a/lectures/sets.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>Why $\\mathbb S^n_+$ is a convex cone: it is an intersection of infinitely many halfspaces $\\{X: z^TXz\\ge 0\\}$, one for each $z$.</li><li>The $2\\times 2$ picture (Example 2.6): the boundary is curved, so this is not a polyhedral cone.</li><li>The Schur-complement trick that turns nonlinear matrix conditions into linear matrix inequalities.</li></ul><h3>Predict before you read</h3><ol><li>The set of correlation matrices is $\\mathbb S^n_+$ intersected with $\\{X_{ii}=1\\}$. Is it compact? What are its extreme points for $n=2$?</li><li>If you estimate each pairwise correlation separately with different sample windows, does the matrix you assemble have to be in the PSD cone? Why or why not?</li><li>Is $\\{\\Sigma: \\Sigma\\succeq \\epsilon I\\}$ convex? Is $\\{\\Sigma: \\operatorname{rank}\\Sigma\\le k\\}$?</li></ol><h3>Leave with</h3><p>The PSD cone is where covariance matrices live. Every covariance-repair or covariance-estimation step is a map into it (projection, shrinkage, factor structure), and convexity of the cone is what makes these maps well-posed.</p><h3>Equity-QR angle</h3><p>Pairwise-complete correlations from stocks with staggered histories, blended \"expert\" correlations for stress scenarios, and hand-edited factor covariances routinely leave the cone. An optimizer fed an indefinite matrix will find a portfolio with negative predicted variance. A repaired matrix with an eigenvalue clipped to exactly zero gives a direction of zero predicted risk, and the optimizer will lever up along it.</p>"
    },
    {
      "id": "cvx-sets-3",
      "title": "Operations that preserve convexity",
      "minutes": 60,
      "links": [
        {
          "label": "B&V §2.3 (intersection, affine maps, perspective and linear-fractional maps)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a deck 2, slides 2.12–2.17",
          "url": "https://web.stanford.edu/class/ee364a/lectures/sets.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>Proving convexity by construction (intersection, affine image and preimage) instead of from the definition. This is the set version of DCP.</li><li>Affine images: projections of convex sets are convex. A set defined by \"there exist auxiliary variables such that...\" is therefore convex if the lifted set is.</li><li>Perspective and linear-fractional maps (§2.3.3): the one non-affine map that preserves convexity, and the reason ratios like return/risk can still give tractable problems.</li></ul><h3>Predict before you read</h3><ol><li>The set of achievable (ex-ante risk, expected return) pairs over a convex feasible set of weights: is it convex? Which part of it is?</li><li>Is the set of weights whose factor exposures lie in a given convex set convex, even if the factor-loading matrix is rank deficient?</li><li>Example 2.13 shows conditional probabilities are a linear-fractional image of the joint distribution. What does that imply for a set of joint scenario probabilities consistent with a convex set of conditional views?</li></ol><h3>Leave with</h3><p>To show a set is convex, build it from known convex sets using intersection, affine maps, perspective and linear-fractional maps. Auxiliary variables are free: a projection of a convex set is convex.</p><h3>Equity-QR angle</h3><p>Turnover, gross leverage and long/short splits are all handled by lifting: introduce $w^+,w^-\\ge 0$ with $w=w^+-w^-$, and the constraint set in $(w,w^+,w^-)$ is a polyhedron whose projection on $w$ is your set. Be careful: some constraints written on $w^+$ and $w^-$ (for example a cap on the long/short ratio) do not project to convex sets in $w$. A deep question for this module works through one.</p>"
    },
    {
      "id": "cvx-sets-4",
      "title": "Generalized inequalities, minimum and minimal elements",
      "minutes": 50,
      "links": [
        {
          "label": "B&V §2.4 (proper cones, generalized inequalities, minimum and minimal elements)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a deck 2, slides 2.19–2.20",
          "url": "https://web.stanford.edu/class/ee364a/lectures/sets.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>What \"proper\" buys you (closed, solid, pointed) and which of these fail for a cone you might naturally write down.</li><li>Minimum vs. minimal: a minimum element is comparable to and below everything; a minimal element is just not dominated. The efficient frontier is a set of minimal elements.</li><li>The matrix inequality $X\\preceq Y$ on $\\mathbb S^n$ is only a partial order; Example 2.18 shows what minimal means there.</li></ul><h3>Predict before you read</h3><ol><li>Two covariance estimators $\\hat\\Sigma_1\\preceq\\hat\\Sigma_2$. What does that imply for the predicted risk of every portfolio, and for the minimum-variance weights?</li><li>For the cone $\\mathbb R^2_+$ on (risk, $-$return), which points of a portfolio cloud are minimal? Is there a minimum?</li></ol><h3>Leave with</h3><p>A generalized inequality turns multi-objective statements (\"lower risk, lower cost, higher alpha\") into a single order. Efficiency means minimality, and only rarely is there a single best point.</p><h3>Equity-QR angle</h3><p>Loewner-order statements are the cleanest way to compare risk models. If $\\hat\\Sigma_A\\succeq\\hat\\Sigma_B$, model A is more conservative for every portfolio at once. When neither dominates, the difference matrix is indefinite and some portfolios will look safer under each model. An adversarial optimizer will find those portfolios.</p>"
    },
    {
      "id": "cvx-sets-5",
      "title": "Separating and supporting hyperplanes, dual cones",
      "minutes": 90,
      "links": [
        {
          "label": "B&V §2.5 (separating and supporting hyperplanes, Examples 2.19–2.21)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "B&V §2.6 (dual cones, dual generalized inequalities, minimal elements via duals; Examples 2.22–2.27)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a deck 2, slides 2.22–2.23 (the revised deck stops at separation; read §2.6 in the book)",
          "url": "https://web.stanford.edu/class/ee364a/lectures/sets.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>The separating hyperplane theorem is an existence statement; the proof via the closest pair of points tells you how to compute one.</li><li>Theorems of alternatives (Example 2.21) are separation applied to a specific pair of sets. They are what solvers return as \"infeasibility certificates\".</li><li>Dual cones of the orthant, the PSD cone (self-dual) and norm cones (the dual-norm cone). These three cover most of what you will dualize in practice.</li><li>§2.6.3: minimal elements are exactly the minimizers of $\\lambda^Tx$ for $\\lambda\\succ_{K^*}0$, up to a gap that convexity closes.</li></ul><h3>Predict before you read</h3><ol><li>Two disjoint closed convex sets: can you always strictly separate them? (Exercise 2.23 asks for a counterexample.)</li><li>What is the dual cone of the set of long-only portfolios? Of the set $\\{Fx: x\\succeq 0\\}$ of exposures reachable with long-only weights?</li><li>If a constraint set is infeasible, what object would prove it to someone who does not trust your solver?</li></ol><h3>Leave with</h3><p>Every convex set is the intersection of the halfspaces that support it, and every infeasibility or optimality claim in convex optimization has a certificate that is a separating hyperplane. Dual cones are the bookkeeping for those certificates.</p><h3>Equity-QR angle</h3><p>When a rebalance fails with \"infeasible\", the dual ray tells you which combination of constraints conflicts, for example a beta target that no long-only mix of your universe can reach. Scalarizing the efficient frontier with weights $\\lambda\\succ 0$ on risk, cost and $-$alpha is §2.6.3 in disguise. That correspondence breaks as soon as integer constraints make the achievable set nonconvex.</p>"
    }
  ],
  "cheatsheet": [
    {
      "term": "Convex set",
      "formula": "x,y\\in C,\\ \\theta\\in[0,1]\\ \\Rightarrow\\ \\theta x+(1-\\theta)y\\in C",
      "note": "Affine: same with any real theta. Cone: theta x in C for theta >= 0."
    },
    {
      "term": "Convex / conic / affine hull",
      "formula": "\\operatorname{conv}S=\\Big\\{\\textstyle\\sum_i\\theta_ix_i:\\ x_i\\in S,\\ \\theta\\succeq0,\\ \\mathbf 1^T\\theta=1\\Big\\}",
      "note": "Conic hull: drop the sum constraint. Affine hull: drop the sign constraint."
    },
    {
      "term": "Norm cone (second-order cone for the 2-norm)",
      "formula": "\\{(x,t)\\in\\mathbb R^{n+1}:\\ \\|x\\|\\le t\\}",
      "note": "Tracking-error and leverage limits enter conic solvers through this cone."
    },
    {
      "term": "Ellipsoid",
      "formula": "\\mathcal E=\\{x_c+Au:\\ \\|u\\|_2\\le1\\}=\\{x:\\ (x-x_c)^TP^{-1}(x-x_c)\\le1\\},\\ P=AA^T\\succ0",
      "note": "A risk cap w^T Sigma w <= sigma^2 is an ellipsoid when Sigma is positive definite, and a cylinder when it is singular."
    },
    {
      "term": "Polyhedron",
      "formula": "\\mathcal P=\\{x:\\ Ax\\preceq b,\\ Cx=d\\}",
      "note": "Budget, neutrality, sector bands, box limits, l1 leverage and turnover (after lifting) are all polyhedral."
    },
    {
      "term": "PSD cone and Schur complement",
      "formula": "\\begin{bmatrix}A&B\\\\B^T&C\\end{bmatrix}\\succeq0\\iff A\\succ0,\\ C-B^TA^{-1}B\\succeq0",
      "note": "Turns nonlinear conditions (for example a quadratic-over-linear bound) into an LMI."
    },
    {
      "term": "Perspective and linear-fractional maps",
      "formula": "P(z,t)=z/t,\\ \\ f(x)=\\frac{Ax+b}{c^Tx+d},\\ c^Tx+d>0",
      "note": "Images and preimages of convex sets stay convex."
    },
    {
      "term": "Generalized inequality",
      "formula": "x\\preceq_Ky\\iff y-x\\in K,\\ \\ K\\text{ proper}",
      "note": "Orthant gives componentwise order; PSD cone gives the Loewner order on covariance matrices."
    },
    {
      "term": "Separating hyperplane",
      "formula": "C\\cap D=\\varnothing\\ \\Rightarrow\\ \\exists a\\ne0,b:\\ a^Tx\\le b\\ \\forall x\\in C,\\ a^Tx\\ge b\\ \\forall x\\in D",
      "note": "C, D convex. Strict separation needs more (e.g. one compact, both closed)."
    },
    {
      "term": "Dual cone",
      "formula": "K^*=\\{y:\\ y^Tx\\ge0\\ \\ \\forall x\\in K\\}",
      "note": "Orthant and PSD cone are self-dual; the dual of a norm cone is the dual-norm cone."
    },
    {
      "term": "Dual norm",
      "formula": "\\|y\\|_*=\\sup\\{y^Tx:\\ \\|x\\|\\le1\\}",
      "note": "Dual of l1 is l-infinity: the best alpha a gross-leverage-L book can capture is L times the largest absolute alpha."
    },
    {
      "term": "Farkas-type alternative",
      "formula": "\\exists x\\succeq0:\\ Ax=b\\quad\\text{xor}\\quad\\exists y:\\ A^Ty\\succeq0,\\ b^Ty<0",
      "note": "Exercise 2.20 gives the strict version (x strictly positive)."
    },
    {
      "term": "Minimal elements by scalarization",
      "formula": "x^\\star=\\arg\\min_{z\\in S}\\lambda^Tz,\\ \\lambda\\succ_{K^*}0\\ \\Rightarrow\\ x^\\star\\text{ minimal}",
      "note": "Converse holds for convex S with lambda in K* (nonzero), not necessarily strictly positive."
    },
    {
      "term": "Gross-exposure risk-error bound",
      "formula": "|w^T(\\hat\\Sigma-\\Sigma)w|\\le\\|\\hat\\Sigma-\\Sigma\\|_{\\max}\\,\\|w\\|_1^2",
      "note": "Fan, Zhang & Yu (2012): an l1 ball bounds how much covariance error can distort predicted risk."
    }
  ],
  "flashcards": [
    {
      "q": "Define the affine dimension of a set and say why it matters for a dollar-neutral, beta-neutral book.",
      "a": "The dimension of its affine hull. With $n$ names and 2 independent equality constraints the feasible set has affine dimension at most $n-2$ and empty interior in $\\mathbb R^n$, so \"strictly feasible\" must be read as relative interior."
    },
    {
      "q": "Is $\\{w:\\ w^T\\Sigma w\\le\\sigma^2\\}$ convex when $\\Sigma\\succeq0$ is singular? What shape is it?",
      "a": "Yes: it is the sublevel set of a convex quadratic. It is an elliptic cylinder, unbounded along $\\operatorname{null}(\\Sigma)$, so there are portfolios with zero predicted risk and unbounded size."
    },
    {
      "q": "Write a turnover limit $\\|w-w_0\\|_1\\le\\tau$ as a polyhedron in lifted variables.",
      "a": "$w-w_0=u-v$, $u,v\\succeq0$, $\\mathbf 1^T(u+v)\\le\\tau$. The projection of this polyhedron onto $w$ is the turnover ball."
    },
    {
      "q": "Why is the PSD cone convex?",
      "a": "It equals $\\bigcap_z\\{X\\in\\mathbb S^n: z^TXz\\ge0\\}$, an intersection of halfspaces in $\\mathbb S^n$ (each is linear in $X$)."
    },
    {
      "q": "State the Schur complement characterization of $\\begin{bmatrix}A&B\\\\B^T&C\\end{bmatrix}\\succeq0$ when $A\\succ0$.",
      "a": "$C-B^TA^{-1}B\\succeq0$."
    },
    {
      "q": "Name the four operations in B&V §2.3 that preserve convexity of sets.",
      "a": "Intersection (of any family), affine image and preimage, perspective map, linear-fractional map."
    },
    {
      "q": "What three properties make a cone proper?",
      "a": "Closed, solid (nonempty interior), pointed (contains no line)."
    },
    {
      "q": "Minimum vs. minimal element with respect to $K$?",
      "a": "Minimum: $x\\preceq_K y$ for every $y\\in S$. Minimal: no $y\\in S$ with $y\\preceq_K x$, $y\\ne x$. Pareto-efficient portfolios are minimal, almost never minimum."
    },
    {
      "q": "Give an example of two disjoint closed convex sets that cannot be strictly separated.",
      "a": "$C=\\{(x,y): y\\le0\\}$ and $D=\\{(x,y): x>0,\\ y\\ge1/x\\}$: disjoint and closed, but their distance is 0."
    },
    {
      "q": "Dual cones of $\\mathbb R^n_+$, $\\mathbb S^n_+$ and $\\{(x,t):\\|x\\|\\le t\\}$?",
      "a": "Themselves for the first two (self-dual). The norm cone dualizes to $\\{(u,v): \\|u\\|_*\\le v\\}$."
    },
    {
      "q": "Dual cone of $\\{Ax: x\\succeq0\\}$ (B&V exercise 2.32)?",
      "a": "$\\{y: A^Ty\\succeq0\\}$."
    },
    {
      "q": "Projection of a symmetric $A=Q\\Lambda Q^T$ onto $\\mathbb S^n_+$ in Frobenius norm?",
      "a": "$Q\\max(\\Lambda,0)Q^T$: clip negative eigenvalues to zero."
    },
    {
      "q": "With $\\mathbf 1^Tw=1$, what does $\\|w\\|_1\\le1$ mean?",
      "a": "Long-only: $\\|w\\|_1\\ge\\mathbf 1^Tw=1$ with equality iff $w\\succeq0$. So the gross-exposure family interpolates from long-only ($c=1$) to unconstrained ($c\\to\\infty$)."
    }
  ],
  "projects": [
    {
      "id": "cvx-sets-p1",
      "title": "Feasible-set lab: map, measure and certify a market-neutral constraint set",
      "level": "core",
      "hours": "6–10",
      "goal": "Build the feasible set of a realistic market-neutral equity book as an explicit intersection of convex sets. Measure how much \"room\" each constraint leaves, and produce human-readable infeasibility certificates when the constraints conflict. Use the support function $S_C(\\alpha)=\\sup_{w\\in C}\\alpha^Tw$ (maximum achievable forecast alpha) as the measure of room. Use dual rays from the solver as certificates.",
      "data": "Ken French Data Library: 49 industry portfolios, daily or monthly returns (free CSV). Treat the industries as \"assets\", estimate betas against Mkt-RF, and assign the 49 industries to about 10 coarser sectors by hand. As an alternative, use about 100 large US stocks from yfinance or stooq (survivorship bias: document it). Public data only, never employer data or signals.",
      "steps": [
        "Estimate betas on a trailing 60-month window and a shrunk covariance (Ledoit-Wolf constant-correlation or identity target); build a synthetic alpha vector, e.g. 12-1 momentum z-scores.",
        "Encode the constraints in CVXPY: dollar neutrality, |beta exposure| <= b, sector net bands |S^T w| <= s, box |w_i| <= u, gross ||w||_1 <= L, turnover ||w - w0||_1 <= tau, and ex-ante risk ||Sigma^{1/2} w||_2 <= sigma.",
        "Compute the support function S_C(alpha) on a grid of each constraint parameter while the others stay fixed; plot achievable alpha against the parameter and mark where each constraint becomes binding (nonzero dual).",
        "Compute the affine dimension of the equality-constrained set and the Chebyshev radius of the polyhedral part (largest l2 ball inside, an LP) as a second measure of room.",
        "Create infeasible configurations (e.g. beta target outside the range achievable by the box), retrieve the dual ray from the solver, and convert it into a sentence such as \"rows i, j combine to show ...\". Verify the certificate numerically and independently of the solver.",
        "Compare the l1 gross-leverage ball with an l2 weight ball of matched radius: count nonzero positions and compare achieved alpha."
      ],
      "deliverables": [
        "Notebook or script with the constraint builder (one function per set), the sweeps and the certificate checker.",
        "Plot: support function versus each constraint parameter, with binding regions shaded.",
        "Table of three infeasible configurations with their certificates in words and the numeric check.",
        "Half-page note explaining which constraints actually shape the solution and which are slack, for your chosen parameters."
      ],
      "acceptance": [
        "Each certificate y satisfies the alternative system to tolerance 1e-8 when checked with NumPy alone, without calling the solver.",
        "The support function is concave and nondecreasing in each relaxation parameter (L, tau, sigma, u). Check numerically on the grid that concavity is violated by no more than solver tolerance.",
        "Reported affine dimension equals n minus the rank of the equality-constraint matrix (asserted).",
        "In the l1 vs l2 comparison, the l1-constrained solution has at most half as many positions above 1e-4 as the l2 solution, or the note explains why not.",
        "All results reproducible from a single config file with fixed data dates."
      ],
      "extensions": [
        "Add a nonconvex minimum-position-size rule and quantify the gap between the convex relaxation and a mixed-integer solve on a small universe.",
        "Replace the ellipsoidal risk cap by a factor-model cap (||F^T w|| plus idiosyncratic term) and compare the sets visually in a 2D slice."
      ]
    },
    {
      "id": "cvx-sets-p2",
      "title": "Back into the PSD cone: repairing equity correlation matrices with missing data",
      "level": "stretch",
      "hours": "12–20",
      "goal": "Build a universe with staggered histories so that pairwise-complete correlation matrices are indefinite. Then compare repairs that map back into the PSD cone or the correlation set: eigenvalue clipping, eigenvalue flooring at epsilon, Higham alternating projections with Dykstra correction, an SDP nearest-correlation solve with an eigenvalue floor, and Ledoit-Wolf shrinkage on an imputed panel. Judge them on distance moved and on what matters downstream, the out-of-sample risk of minimum-variance portfolios.",
      "data": "Daily adjusted closes for about 300 US stocks from yfinance or stooq, including names that IPO or delist during the sample, so that histories are staggered. Survivorship and adjustment caveats must be documented. Ken French daily factors can supply a factor-model alternative. Public data only.",
      "steps": [
        "Build the return panel with NaNs for missing history; compute the pairwise-complete correlation matrix and report its negative eigenvalues and the number of them.",
        "Implement (a) clipping at 0, (b) flooring at epsilon with diagonal rescaling, (c) Higham (2002) alternating projections between S_+ and the unit-diagonal set, with Dykstra correction, (d) a CVXPY SDP: min ||X - A||_F subject to X >= eps I, diag X = 1, (e) Ledoit-Wolf on a mean-imputed panel.",
        "Check that (c) and (d) agree for eps = 0, then show what happens to (c) without the Dykstra correction.",
        "On a rolling monthly schedule, form long-only and unconstrained minimum-variance portfolios from each repaired matrix (with sample volatilities) and record realized out-of-sample volatility.",
        "Construct, for the clipped matrix, the portfolio along a zero-eigenvalue direction and report its predicted and realized risk."
      ],
      "deliverables": [
        "Library module with the five repairs and tests.",
        "Table: Frobenius distance moved, minimum eigenvalue, condition number, runtime for each repair.",
        "Plot of realized out-of-sample volatility of minimum-variance portfolios per repair method over time.",
        "Short write-up connecting the results to PSD cone geometry (projection, Moreau decomposition, self-duality)."
      ],
      "acceptance": [
        "The pairwise-complete matrix has at least one negative eigenvalue (otherwise increase the stagger) and every repaired matrix has minimum eigenvalue >= -1e-10 (>= eps - 1e-8 for floored methods).",
        "Higham-with-Dykstra and the SDP solution agree to Frobenius distance below 1e-5 for eps = 0; plain alternating projections lands measurably farther from A (report the gap).",
        "For the clipped matrix, the zero-eigenvalue portfolio has predicted volatility below 1e-6 and realized volatility reported; the write-up explains why an optimizer would exploit it.",
        "Out-of-sample comparison covers at least 60 monthly rebalances with identical universes and dates across methods."
      ],
      "extensions": [
        "Add a factor-plus-diagonal structure constraint (X = B B^T + D) as a nonconvex alternative and compare.",
        "Try the Qi & Sun (2006) Newton method and compare runtime against the alternating projections at n = 1000."
      ]
    }
  ],
  "frontier": {
    "asOf": "2026-11",
    "summary": "The theory of convex sets in chapter 2 is settled. What is active is how practitioners choose sets. Covariance estimation is increasingly treated as projection or shrinkage onto structured convex sets. Constraint sets are being reinterpreted as statistical regularizers, with explicit bias and variance trade-offs. The nonconvex sets that real books need (cardinality, minimum lots, round lots) are attacked with perspective reformulations and convex relaxations whose gap can be bounded. Conic solvers have moved well beyond LP, SOCP and SDP, to exponential and power cones and to quadratic objectives handled natively. That widens what counts as an easy feasible set.",
    "threads": [
      {
        "title": "Covariance estimation as geometry in the PSD cone",
        "why": "Nearest-correlation projections, linear and nonlinear shrinkage, and factor-plus-sparse estimators all map a noisy estimate back into (a subset of) the PSD cone. The open issue for portfolio work is that Frobenius closeness is the wrong loss. What matters is the risk of the portfolios the optimizer will pick, and that is a different geometry.",
        "refs": [
          {
            "label": "Higham (2002) — Computing the nearest correlation matrix: a problem from finance",
            "url": "https://doi.org/10.1093/imanum/22.3.329"
          },
          {
            "label": "Qi & Sun (2006) — A quadratically convergent Newton method for computing the nearest correlation matrix",
            "url": "https://doi.org/10.1137/050624509"
          },
          {
            "label": "Ledoit & Wolf (2017) — Nonlinear shrinkage of the covariance matrix for portfolio selection: Markowitz meets Goldilocks",
            "url": "https://doi.org/10.1093/rfs/hhx052"
          },
          {
            "label": "Fan, Liao & Mincheva (2013) — Large covariance estimation by thresholding principal orthogonal complements",
            "url": "https://doi.org/10.1111/rssb.12016"
          }
        ]
      },
      {
        "title": "Constraint sets as regularizers",
        "why": "No-short constraints act like covariance shrinkage, norm balls on weights act like ridge or lasso penalties, and a gross-exposure ball caps how much covariance error can leak into predicted risk. The research question is now calibration: how large should the set be, chosen by what out-of-sample criterion, and how does that interact with an alpha model that was itself fitted with regularization?",
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
        "title": "Nonconvex feasible sets: relaxations with guarantees",
        "why": "Cardinality caps, minimum holdings and fixed tickets make the feasible set a union of convex pieces. Perspective reformulations give the tightest convex relaxations for such sets. Modern MIO methods solve sparse portfolios with hundreds of names exactly. Shapley-Folkman-type results bound the relaxation gap for separable problems with few coupling constraints, which is exactly the shape of a large portfolio problem.",
        "refs": [
          {
            "label": "Frangioni & Gentile (2006) — Perspective cuts for a class of convex 0-1 mixed integer programs",
            "url": "https://doi.org/10.1007/s10107-005-0594-3"
          },
          {
            "label": "Bertsimas & Cory-Wright (2022) — A scalable algorithm for sparse portfolio selection",
            "url": "https://doi.org/10.1287/ijoc.2021.1127"
          },
          {
            "label": "Udell & Boyd (2016) — Bounding duality gap for separable problems with linear constraints",
            "url": "https://doi.org/10.1007/s10589-015-9819-4"
          }
        ]
      },
      {
        "title": "Uncertainty sets: the geometry of robustness",
        "why": "Robust portfolio construction replaces a point estimate by a convex uncertainty set (box, ellipsoid, polyhedral, Wasserstein ball). The choice of set fixes the shape of the robust counterpart (LP, SOCP, SDP) and its economics. Ellipsoidal alpha uncertainty, for instance, penalizes exposure along the directions where the alpha is estimated with most error.",
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
            "label": "Ceria & Stubbs (2006) — Incorporating estimation errors into portfolio selection: robust portfolio construction",
            "url": "https://doi.org/10.1057/palgrave.jam.2240207"
          }
        ]
      },
      {
        "title": "Richer cones in production solvers",
        "why": "Exponential and power cones now have mature primal-dual interior-point implementations, and newer open-source solvers handle quadratic objectives directly. Sets defined by entropy, log-utility or p-norms are no longer exotic. Copositive and completely positive cones remain the \"convex but intractable\" frontier for exact reformulations of nonconvex quadratic portfolio problems.",
        "refs": [
          {
            "label": "Dahl & Andersen (2022) — A primal-dual interior-point algorithm for nonsymmetric exponential-cone optimization",
            "url": "https://doi.org/10.1007/s10107-021-01631-4"
          },
          {
            "label": "Goulart & Chen (2024) — Clarabel: an interior-point solver for conic programs with quadratic objectives",
            "url": "https://arxiv.org/abs/2405.12762"
          },
          {
            "label": "Burer (2009) — On the copositive representation of binary and continuous nonconvex quadratic programs",
            "url": "https://doi.org/10.1007/s10107-008-0223-z"
          }
        ]
      }
    ],
    "openQuestions": [
      "What is the right distance for projecting an estimated covariance back into the PSD cone, if the goal is the out-of-sample risk of optimized portfolios rather than Frobenius closeness? Can that distance be made convex in the estimate?",
      "How should the radius of a weight-norm ball (gross exposure, l2 cap) be chosen when the alpha forecasts are themselves regularized, so that the two layers of shrinkage are not double-counted?",
      "For a 3,000-name universe with sector, beta and turnover coupling constraints, how large is the gap between the convex relaxation and the true cardinality-constrained optimum in practice? Does the Shapley-Folkman bound predict it?",
      "Which uncertainty-set geometry (ellipsoid, box, Wasserstein ball) best matches the empirical error structure of cross-sectional equity alphas, and can that be tested out of sample?",
      "When a constraint set is infeasible, can the dual certificate be turned automatically into the minimal relaxation that a PM would accept (smallest change to a limit)?"
    ],
    "brainstorm": [
      "Take your current production constraint list and classify each line as hyperplane, slab, box, norm ball, ellipsoid, cone or nonconvex. Which nonconvex ones could you replace with their convex hull at negligible cost?",
      "Plot the support function S_C(alpha) of your feasible set as gross leverage varies. Where is the marginal alpha per unit of leverage lowest, and does that match where your PM thinks leverage is \"expensive\"?",
      "Find a pair of risk models you use (vendor vs. internal) and compute the extreme eigenvalues of their difference. Which portfolios look safest under one and riskiest under the other?",
      "Design a stress test where scenario probabilities are chosen adversarially within a convex set of distributions (moment or quantile views). Which view types keep the set convex?",
      "Measure, on public data, how often a pairwise-complete correlation matrix of your universe leaves the PSD cone as the universe grows, and what that does to an unconstrained minimum-variance optimizer."
    ]
  }
}
);
