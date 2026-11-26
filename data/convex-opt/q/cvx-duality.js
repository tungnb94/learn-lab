LAB.extend("cvx-duality", {
  "questions": [
    {
      "id": "cvx-duality-q1",
      "type": "derive",
      "difficulty": 3,
      "prompt": "<p>Consider the factor-neutral mean–variance problem</p>$$\\max_w\\ \\mu^Tw-\\tfrac\\gamma2w^T\\Sigma w\\quad\\text{s.t.}\\quad C^Tw=d,\\qquad C=[\\mathbf 1\\ \\ B]\\in\\mathbb R^{n\\times(k+1)},$$<p>with $\\Sigma\\succ0$, $B$ the factor loadings, and $d=(1,0,\\dots,0)$ (fully invested) or $d=0$ (dollar neutral).</p><ol><li>Write the KKT conditions and solve them for $w^\\star$ and the multiplier $\\theta^\\star$.</li><li>For $d=0$, show that $\\theta^\\star$ is the generalized least-squares regression coefficient of $\\mu$ on $C$ with weight matrix $\\Sigma^{-1}$, and that $w^\\star$ is the unconstrained solution applied to the GLS residual alpha.</li><li>Interpret $\\theta^\\star_j$ as a shadow price. If the mandate allowed a small exposure $\\delta$ to factor $j$, how much objective would you gain to first order, and what happens to second order?</li><li>Derive $\\partial w^\\star/\\partial\\mu$ and show it is $\\Sigma^{-1/2}$ times a projection times $\\Sigma^{-1/2}$, scaled by $1/\\gamma$. Which alpha errors are amplified most, and which are annihilated?</li></ol>",
      "whyItMatters": "This is the closed form behind every factor-neutral book. It shows that neutrality constraints \"orthogonalise alpha\" in a Σ⁻¹ metric, prices each neutrality constraint, and explains why alpha noise in low-risk directions is so damaging.",
      "hints": [
        "Stationarity: $\\mu-\\gamma\\Sigma w-C\\theta=0$. Substitute $w$ into $C^Tw=d$.",
        "GLS of $\\mu$ on $C$ with weight $\\Sigma^{-1}$ minimises $(\\mu-C\\theta)^T\\Sigma^{-1}(\\mu-C\\theta)$.",
        "Differentiate $w^\\star(\\mu)$ with $\\theta^\\star(\\mu)$ substituted, and write $P=\\Sigma^{-1/2}C(C^T\\Sigma^{-1}C)^{-1}C^T\\Sigma^{-1/2}$."
      ],
      "keyPoints": [
        "$w^\\star=\\tfrac1\\gamma\\Sigma^{-1}(\\mu-C\\theta^\\star)$ and $\\theta^\\star=(C^T\\Sigma^{-1}C)^{-1}(C^T\\Sigma^{-1}\\mu-\\gamma d)$. KKT is a linear system because there are no inequalities.",
        "For $d=0$, $\\theta^\\star$ is exactly the GLS coefficient and $\\mu-C\\theta^\\star$ is the GLS residual, so the portfolio sees only the part of alpha that is not explained by the budget and factor directions in the $\\Sigma^{-1}$ metric.",
        "By the envelope theorem $\\partial p^\\star/\\partial d=\\theta^\\star$, so allowing exposure $\\delta$ to factor $j$ gains $\\theta^\\star_j\\delta$ to first order. The second-order term is $-\\tfrac\\gamma2\\delta^2[(C^T\\Sigma^{-1}C)^{-1}]_{jj}$, since $p^\\star$ is concave quadratic in $d$.",
        "$\\partial w^\\star/\\partial\\mu=\\tfrac1\\gamma\\Sigma^{-1/2}(I-P)\\Sigma^{-1/2}$. Errors in the span of $C$ are annihilated, and errors along low-variance eigen-directions of $\\Sigma$ are amplified by up to $1/(\\gamma\\lambda_{\\min})$.",
        "For $d=(1,0,\\dots)$ the budget multiplier picks up the extra term $-\\gamma(C^T\\Sigma^{-1}C)^{-1}d$: the alpha-free minimum-variance component of the solution."
      ],
      "followUps": [
        "Add the long-only constraint. Show that on a fixed active set the same formulas hold with C augmented by the active bound normals, and discuss what happens to the sensitivity at the moment an asset enters the support.",
        "Relate θ* to the \"factor-mimicking\" portfolio returns that a risk model attributes to each factor."
      ],
      "source": {
        "label": "B&V exercise 5.27 (adapted): equality-constrained least squares, KKT and dual solution; B&V §5.5.3 and §5.6.3",
        "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf",
        "relation": "adapted from"
      }
    },
    {
      "id": "cvx-duality-q2",
      "type": "derive",
      "difficulty": 2,
      "prompt": "<p>Your risk committee imposes \"no more than 40% of gross exposure in any 10 names\" on a 500-stock long–short book.</p><ol><li>Show that $f(x)=\\sum_{i=1}^rx_{[i]}$ equals the optimal value of an LP in a variable $y$ with $0\\preceq y\\preceq\\mathbf1$, $\\mathbf1^Ty=r$. Derive its dual and conclude that $f(x)\\le c$ iff there exist $t,u$ with $rt+\\mathbf1^Tu\\le c$, $t\\mathbf1+u\\succeq x$, $u\\succeq0$.</li><li>Apply it to absolute weights to write the committee's rule with $O(n)$ variables and constraints. Count both representations.</li><li>Interpret the optimal $t$ and $u$ and the primal $y$. What is $t$ at the optimum, and when is $y$ fractional?</li><li>Show that the same LP, applied to equally weighted scenario losses, is the CVaR representation of Rockafellar and Uryasev, with $t$ playing the role of VaR.</li></ol>",
      "whyItMatters": "Concentration limits and CVaR constraints enter production optimizers through exactly this duality trick. Without it they would need combinatorially many constraints or scenario enumeration.",
      "hints": [
        "For (1): the LP picks a fractional subset of size $r$, and its vertices are 0/1 vectors.",
        "Lagrangian with multiplier $t$ on $\\mathbf1^Ty=r$ and $u\\succeq0$ on $y\\preceq\\mathbf1$. The bound $y\\succeq0$ can stay implicit.",
        "Use $v\\succeq|w|$ elementwise. $f$ is nondecreasing, so $f(v)\\le c$ with $v\\succeq|w|$ is equivalent to $f(|w|)\\le c$."
      ],
      "keyPoints": [
        "Dual: $\\min rt+\\mathbf1^Tu$ s.t. $t\\mathbf1+u\\succeq x$, $u\\succeq0$. LP strong duality gives equality with $f(x)$, so the constraint has an \"exists\" representation with $2n+1$ linear inequalities instead of $\\binom{n}{r}$.",
        "For gross exposure $G$: $-v\\preceq w\\preceq v$, $rt+\\mathbf1^Tu\\le0.4\\,G$, $t\\mathbf1+u\\succeq v$, $u\\succeq0$, giving $3n+1$ variables and about $4n$ inequalities against $\\binom{500}{10}\\approx2.5\\times10^{20}$. Writing the right-hand side as $0.4\\|w\\|_1$ with gross free would be convex ≤ convex, i.e. nonconvex, so fix or cap gross and state the rule against that number.",
        "At the optimum $t$ can be any value between $x_{[r+1]}$ and $x_{[r]}$, and $u_i=(x_i-t)_+$. The primal $y$ is the indicator of the top $r$ entries, and it is fractional only when there are ties at the threshold. $y$ is the dual of the constraint $t\\mathbf1+u\\succeq x$.",
        "With $N$ equally likely losses $\\ell_j$ and $k=(1-\\beta)N$, $\\mathrm{CVaR}_\\beta=\\tfrac1k\\sum_{j=1}^k\\ell_{[j]}=\\min_t\\ t+\\tfrac1{k}\\sum_j(\\ell_j-t)_+$, which is the same LP. $t^\\star$ is a VaR.",
        "The B&V exercise 5.19(c) diversification QP is the long-only special case."
      ],
      "followUps": [
        "Write the dual variable of the concentration constraint as a shadow price. How would you report the alpha cost of the 40% rule?",
        "Extend to \"no more than 25% of gross in any single GICS industry plus its 3 largest names\", and check that the representation stays polynomial."
      ],
      "source": {
        "label": "B&V exercise 5.19 (adapted): the sum of the r largest elements of a vector",
        "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf",
        "relation": "adapted from"
      }
    },
    {
      "id": "cvx-duality-q3",
      "type": "counterexample",
      "difficulty": 3,
      "prompt": "<p>Shadow prices are only as good as the constraint qualification behind them. Build the failures explicitly.</p><ol><li><strong>Zero risk budget.</strong> $\\min_w -\\alpha^Tw$ s.t. $w^T\\Sigma w\\le u$, with $\\Sigma\\succ0$ and $\\alpha\\ne0$. Compute $p^\\star(u)$ and the dual at $u=0$. Is there a duality gap? Is the dual optimum attained? What happens to the global sensitivity inequality?</li><li><strong>A genuine gap.</strong> B&amp;V's example $\\min e^{-x}$ s.t. $x^2/y\\le0$ on $\\{y\\gt0\\}$. Compute $p^\\star$, $d^\\star$ and $p^\\star(u)$ for $u\\gt0$. Explain the gap through the shape of $p^\\star(u)$ near 0.</li><li>List three portfolio constraints that commonly break Slater in practice. For each, say what a solver will typically report and how to restate the constraint so the duals become meaningful.</li></ol>",
      "whyItMatters": "Desks do set limits at zero (zero tracking error to a model portfolio, zero turnover on frozen names, equal lower and upper bounds). Those are exactly the cases where reported duals are meaningless or huge.",
      "hints": [
        "For (1): $\\max_w\\alpha^Tw$ s.t. $\\|\\Sigma^{1/2}w\\|\\le\\sqrt u$ gives $\\sqrt u\\,\\mathrm{IR}$. The dual function is $g(\\lambda)=-\\alpha^T\\Sigma^{-1}\\alpha/(4\\lambda)$.",
        "For (2): the only feasible points of the unperturbed problem have $x=0$. With $u\\gt0$, let $x\\to\\infty$ and $y=x^2/u$.",
        "Strong duality with attainment would give $p^\\star(u)\\ge p^\\star(0)-\\lambda^\\star u$. Check whether any finite $\\lambda^\\star$ can satisfy that near $u=0$."
      ],
      "keyPoints": [
        "(1) $p^\\star(u)=-\\sqrt u\\,\\mathrm{IR}$. At $u=0$: $\\sup_{\\lambda\\gt0}g(\\lambda)=0=p^\\star(0)$, so there is no gap, but the supremum is not attained ($\\lambda\\to\\infty$). $p^\\star$ has infinite slope at 0, so no finite multiplier satisfies the global inequality: the shadow price of the first unit of risk is infinite.",
        "(2) $p^\\star=1$ (since $x=0$ is forced), $g(\\lambda)=0$ for all $\\lambda\\ge0$, so $d^\\star=0$ and the gap is 1. $p^\\star(u)=0$ (an infimum, not attained) for every $u\\gt0$, so $p^\\star$ jumps at 0: it is not lower semicontinuous, which is how a gap shows up in the perturbation picture.",
        "Slater fails in both: there is no strictly feasible point.",
        "Practical failures: a tracking-error limit of 0 (restate as an equality $w=w_b$ on the affected names); equal lower and upper bounds (restate as a fixed variable and remove it); a turnover cap of 0 on frozen names (substitute the fixed positions). Solvers report huge duals, \"inaccurate\" status, or duals that change wildly with tolerance.",
        "After restating, report the price of a small positive relaxation (finite differences at u = ε) instead of the dual at the degenerate point."
      ],
      "followUps": [
        "Show that if $\\Sigma$ is singular and $\\alpha$ lies outside its range, problem (1) is unbounded for every $u\\gt0$. Interpret this as \"riskless alpha\" from a rank-deficient risk model.",
        "For the Boolean relaxation of a cardinality-constrained portfolio, show the Lagrangian and LP relaxation bounds coincide (B&V exercise 5.13) and estimate the gap on a small example."
      ],
      "source": {
        "label": "B&V exercise 5.21 (adapted): a convex problem in which strong duality fails; B&V §5.6.2",
        "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf",
        "relation": "adapted from"
      }
    },
    {
      "id": "cvx-duality-q4",
      "type": "predict",
      "difficulty": 2,
      "prompt": "<p>Compare (A) $\\max\\alpha^Tw-\\tfrac\\gamma2w^T\\Sigma w$ with (B) $\\max\\alpha^Tw$ s.t. $w^T\\Sigma w\\le\\sigma^2$, with no other constraints and $\\Sigma\\succ0$. Predict, then verify:</p><ol><li>The multiplier $\\lambda^\\star$ of (B) as a function of $\\sigma$ and $\\alpha$, and the value of $\\gamma$ for which (A) and (B) give the same portfolio.</li><li>What happens to $\\lambda^\\star$ and to the portfolio of (A) and of (B) if the alpha model's scale doubles (e.g. a recalibrated IC)?</li><li>The multiplier if (B) is written as $\\|L^Tw\\|_2\\le\\sigma$ instead.</li><li>After adding long-only and position caps (so that $w=0$ is still feasible): is $p^\\star(\\sigma)$ still linear in $\\sigma$? Concave? What does that say about the marginal versus the average alpha per unit of risk?</li></ol>",
      "whyItMatters": "Choosing between risk aversion and a risk budget, and interpreting the risk multiplier, is a daily PM decision. The predictions tell you which parametrization is stable when the alpha model changes scale.",
      "hints": [
        "KKT of (B): $\\alpha=2\\lambda\\Sigma w$ with the constraint active.",
        "$p^\\star(\\sigma)$ for (B) is $\\sigma\\sqrt{\\alpha^T\\Sigma^{-1}\\alpha}$.",
        "Is $\\{(w,\\sigma):\\|L^Tw\\|_2\\le\\sigma\\}$ jointly convex? What does that imply for a maximisation's optimal value as a function of $\\sigma$?"
      ],
      "keyPoints": [
        "$w_B=\\sigma\\Sigma^{-1}\\alpha/\\mathrm{IR}$ and $\\lambda^\\star=\\mathrm{IR}/(2\\sigma)$ with $\\mathrm{IR}=\\sqrt{\\alpha^T\\Sigma^{-1}\\alpha}$. (A) matches (B) for $\\gamma=2\\lambda^\\star=\\mathrm{IR}/\\sigma$.",
        "Doubling $\\alpha$ doubles $\\lambda^\\star$ and leaves $w_B$ unchanged (risk budget fixed), but doubles $w_A$ and quadruples its variance. A risk budget is invariant to alpha scale, and risk aversion is not.",
        "With $\\|L^Tw\\|\\le\\sigma$ the multiplier is $\\mathrm{IR}$ itself, i.e. $2\\sigma\\lambda^\\star$: the same economics in different units.",
        "With extra constraints $p^\\star(\\sigma)$ is concave in $\\sigma$ (the perturbation function of a convex problem). The marginal alpha per unit of risk (the multiplier) is at most the average $p^\\star(\\sigma)/\\sigma$, and it falls as the budget grows and other constraints start to bind."
      ],
      "followUps": [
        "Show that in (B) with long-only, the multiplier is piecewise smooth in σ with breakpoints where names enter or leave. Predict the sign of the jump in its derivative.",
        "If you target realised rather than ex-ante risk, what extra term enters the shadow price?"
      ],
      "source": {
        "label": "B&V §5.6.3 (local sensitivity) and §5.5.3 (KKT)",
        "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf",
        "relation": "motivated by"
      }
    },
    {
      "id": "cvx-duality-q5",
      "type": "connect",
      "difficulty": 3,
      "prompt": "<p>Jagannathan and Ma (2003) explain why long-only minimum-variance portfolios built from a sample covariance often have <em>lower</em> out-of-sample risk than unconstrained ones, even though the constraint is \"wrong\" when the population optimum has short positions.</p><ol><li>From the KKT conditions of $\\min\\tfrac12w^T\\Sigma w$ s.t. $\\mathbf1^Tw=1$, $w\\succeq0$, show that the solution is the unconstrained minimum-variance portfolio for $\\tilde\\Sigma=\\Sigma-(\\lambda\\mathbf1^T+\\mathbf1\\lambda^T)$, where $\\lambda$ are the multipliers of $w\\succeq0$. Extend to upper bounds $w\\preceq\\bar w$.</li><li>Explain why the adjustment acts as covariance shrinkage, and which stocks it shrinks.</li><li>Connect to the norm-constrained portfolios of DeMiguel et al. (2009) and to ridge and lasso in ML: in each case, which KKT multiplier plays the role of the regularisation strength?</li><li>Connect to the Finance-ML module on portfolio construction (fml-portfolio-ml): how does hierarchical risk parity's robustness compare with \"constraints as shrinkage\"?</li></ol>",
      "whyItMatters": "It turns the folklore that \"constraints help\" into a precise statement about implied inputs. It also gives you a way to read off the covariance your position limits are implicitly using.",
      "hints": [
        "Stationarity: $\\Sigma w=\\nu\\mathbf1+\\lambda$. Use $\\lambda^Tw=0$ and $\\mathbf1^Tw=1$ to compute $\\tilde\\Sigma w$.",
        "$\\lambda_i\\gt0$ only for assets at the bound. In the sample, which assets would want short positions?",
        "For $\\|w\\|_2^2\\le\\delta$ the KKT stationarity has $(\\Sigma+\\eta I)w$. For $\\|w\\|_1\\le c$ it has a subgradient term."
      ],
      "keyPoints": [
        "$\\tilde\\Sigma w=\\Sigma w-\\lambda(\\mathbf1^Tw)-\\mathbf1(\\lambda^Tw)=\\nu\\mathbf1$, so $w$ satisfies the unconstrained minimum-variance optimality conditions under $\\tilde\\Sigma$. Upper bounds with multipliers $\\delta$ add $+(\\delta\\mathbf1^T+\\mathbf1\\delta^T)$.",
        "Assets that the sample says are great hedges (they want negative weights) usually have overestimated covariances with the rest. The constraint lowers their covariances by $\\lambda_i$, which is shrinkage toward less extreme values exactly where estimation error tends to push. Upper bounds raise the covariances of overweighted assets.",
        "For the 2-norm constraint (DeMiguel et al. 2009) the multiplier $\\eta$ gives $\\Sigma+\\eta I$, which is ridge or Ledoit–Wolf-type shrinkage. The 1-norm (gross leverage) constraint generalises the short-sale constraint: its multiplier acts like the lasso penalty and nests Jagannathan–Ma. Regularisation strength equals the multiplier of the constraint.",
        "Caveat: the shrinkage is data-dependent and only \"helps\" when the sample errors align with it. If the true optimum is heavily short, the constraint adds bias. Jagannathan and Ma report both effects empirically.",
        "HRP avoids inverting Σ altogether, while constraints keep the inversion but distort Σ. Both are implicit regularisers, and comparing their implied covariances is a concrete research exercise."
      ],
      "followUps": [
        "Compute $\\tilde\\Sigma$ for a 49-industry long-only minimum-variance portfolio and compare its eigenvalues with those of $\\Sigma$ and of a Ledoit–Wolf estimate.",
        "Is the implied covariance always positive semidefinite? If not, what does that mean?"
      ],
      "source": {
        "label": "Jagannathan & Ma (2003) — Risk reduction in large portfolios: why imposing the wrong constraints helps",
        "url": "https://doi.org/10.1111/1540-6261.00580",
        "relation": "adapted from"
      }
    },
    {
      "id": "cvx-duality-q6",
      "type": "design",
      "difficulty": 3,
      "prompt": "<p>Design an LP-based static-arbitrage checker for a listed option chain on a single stock at one expiry. The quotes are a bond, the stock, and calls and puts at strikes $K_1\\lt\\dots\\lt K_m$ with bid and ask prices.</p><ol><li>Start from B&amp;V's two-scenario example (bond, stock, one call). Show that the option price is pinned down by no arbitrage, and say which matrix property makes the market \"complete\".</li><li>Generalise: write a primal LP that searches for an arbitrage portfolio (long at ask, short at bid) and its alternative system in state prices $y\\succeq0$. Show how bid–ask spreads turn the equality $V^Ty=p$ into a pair of inequalities.</li><li>Terminal prices are a continuum. How do you choose the scenario grid so that the checker neither misses real arbitrage nor reports spurious arbitrage caused by discretisation? (Think about which payoffs are piecewise linear in $S_T$.)</li><li>Distinguish \"type I\" arbitrage (negative cost, nonnegative payoff) from \"type II\" (zero cost, nonnegative and somewhere positive payoff), and say which needs strictly positive state prices. How does strictness change the alternative?</li><li>What should the tool output when it finds arbitrage, and how would you use the dual (state prices) when it finds none?</li></ol>",
      "whyItMatters": "Option-implied inputs (implied vol surfaces, risk-neutral densities, implied correlations) are used in equity signals and risk. A theorem of alternatives gives both the cleaning tool and the certificate.",
      "hints": [
        "Two scenarios and three assets with the bond and stock payoff vectors linearly independent: $y$ is determined by two equations.",
        "Split $x=x^+-x^-$ with cost $p_{\\text{ask}}^Tx^+-p_{\\text{bid}}^Tx^-$. Dualising gives $p_{\\text{bid}}\\preceq V^Ty\\preceq p_{\\text{ask}}$.",
        "Every payoff is piecewise linear in $S_T$ with kinks only at strikes. A nonnegativity condition on such a function needs to be checked only at the kinks, at 0, and on the slope beyond the last strike."
      ],
      "keyPoints": [
        "Two-scenario case: the bond and stock payoff rows fix $(y_u,y_d)$ uniquely (risk-neutral probabilities times discount), so $C=y^T(\\text{call payoff})$. Completeness means the payoff matrix has rank equal to the number of scenarios.",
        "Primal: find $x^\\pm\\succeq0$ with $V(x^+-x^-)\\succeq0$ and cost $p_{\\text{ask}}^Tx^+-p_{\\text{bid}}^Tx^-\\lt0$ (normalise, e.g. cost $\\le-1$, to keep it an LP). Alternative: $\\exists y\\succeq0$ with $p_{\\text{bid}}\\preceq V^Ty\\preceq p_{\\text{ask}}$.",
        "Use scenarios $S_T\\in\\{0,K_1,\\dots,K_m\\}$ plus an asymptotic slope condition (or a scenario far beyond $K_m$ with a linear tail). Because payoffs are piecewise linear with kinks at strikes, nonnegativity at these points is exact. Coarser grids miss arbitrage, and grids that ignore the tail slope create spurious arbitrage.",
        "Type II arbitrage requires $y\\succ0$ for its alternative (Stiemke's lemma rather than Farkas). Numerically, use $y\\succeq\\epsilon\\mathbf1$ or a two-stage LP, and report the strictness tolerance.",
        "Output: the arbitrage portfolio as a certificate (legs, size, worst-case payoff) and the quotes involved. When there is no arbitrage, the state prices give a discrete risk-neutral density, which is non-unique in an incomplete market, so report bounds on it via LPs."
      ],
      "followUps": [
        "Extend to several expiries (calendar arbitrage). Which additional linear constraints on state prices across maturities are needed?",
        "Using the dual LPs, compute arbitrage-free bounds on an unquoted strike (B&V Example 5.10) and compare with a smooth implied-vol interpolation."
      ],
      "source": {
        "label": "B&V exercise 5.38 (adapted): option pricing; B&V Example 5.10 (arbitrage-free bounds on price)",
        "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf",
        "relation": "adapted from"
      }
    },
    {
      "id": "cvx-duality-q7",
      "type": "critique",
      "difficulty": 2,
      "prompt": "<p>A weekly portfolio-construction report contains these statements, all based on CVXPY dual values. Critique each one and say what you would report instead.</p><ol><li>\"The turnover constraint's dual is 0.0000, so turnover costs us nothing and we can tighten it further for free.\"</li><li>\"The 5% position cap has the largest dual (0.83), so it is our most expensive constraint. The risk constraint's dual is only 0.02.\"</li><li>\"Relaxing the position cap from 5% to 7% will add 0.83 × 2% = 1.66% of alpha.\"</li><li>\"The beta-neutrality dual flipped sign from last week, so our beta bet reversed.\"</li><li>\"The dual of the variance constraint fell 50% this week, so the risk model says risk is now cheap.\"</li></ol>",
      "whyItMatters": "Misread shadow prices drive bad decisions about limits. The errors are systematic: units, local versus global, degeneracy, sign conventions and confounding with alpha scale.",
      "hints": [
        "A dual describes a one-sided local derivative at the current point. What does it say about tightening an inactive constraint?",
        "Duals carry the units of objective per unit of constraint. Compare $w_i\\le0.05$ with $\\|L^Tw\\|\\le0.05$.",
        "Recall the global inequality $p^\\star(u)\\ge p^\\star(0)-\\lambda^{\\star T}u$ and the concavity of $p^\\star$ in the relaxation for a maximisation."
      ],
      "keyPoints": [
        "(1) A zero dual on an inactive constraint means only that small changes in its right-hand side do not matter. Tightening past the current turnover makes it active, with a positive and possibly large price. With $\\ell_1$ turnover and degeneracy, left and right derivatives can also differ.",
        "(2) Duals are not comparable across constraints without normalisation: alpha per 1% of position versus alpha per unit of variance (or volatility). Many position caps share the load, so compare aggregated, unit-consistent prices or use constraint attribution.",
        "(3) For a maximisation, $p^\\star$ is concave in the relaxation, so the dual is an upper bound on the gain per unit for a finite relaxation, not a forecast. Relaxing one limit can also activate others. Re-solve instead.",
        "(4) The sign of an equality multiplier tells you which direction of exposure the alpha \"wants\" under CVXPY's conventions, not the realised exposure, which is held at zero. A sign flip means the alpha's projection on beta changed sign. Check the conventions and the GLS coefficient (see q1).",
        "(5) The variance multiplier is $\\mathrm{IR}/(2\\sigma)$ in the simple case, so it moves with the scale and quality of alpha, not only with risk. A 50% drop may be a recalibrated signal. Decompose the change into alpha scale and risk-model effects."
      ],
      "followUps": [
        "Design a normalised shadow-price table (units, one-sided derivatives, degeneracy flag) that would avoid all five errors.",
        "Propose a test that detects degenerate duals automatically from solver output."
      ],
      "source": {
        "label": "B&V §5.6 (perturbation and sensitivity); Stubbs & Vandenbussche (2010) — Constraint attribution",
        "url": "https://doi.org/10.3905/jpm.2010.36.4.048",
        "relation": "motivated by"
      }
    },
    {
      "id": "cvx-duality-q8",
      "type": "debate",
      "difficulty": 2,
      "prompt": "<p>The KKT sensitivity $\\partial w^\\star/\\partial\\mu=\\tfrac1\\gamma\\Sigma^{-1/2}(I-P)\\Sigma^{-1/2}$ formalises Michaud's (1989) claim that mean–variance optimizers are \"estimation-error maximizers\". Best and Grauer (1991) and Chopra and Ziemba (1993) quantify the sensitivity to errors in the means. Michaud proposed resampled efficiency: average the optimal portfolios over bootstrap draws of the inputs. Scherer (2002) argues that resampling has no decision-theoretic foundation, inherits the estimation error of the original sample, and can be matched by simpler shrinkage or Bayesian methods.</p><ol><li>Using the KKT view, explain what averaging solutions over resampled inputs does that averaging inputs does not. Where in the solution path does the difference arise?</li><li>Argue for resampling as a practical regulariser, then argue against it as a decision rule.</li><li>Propose an experiment that would separate the two positions on public data.</li></ol>",
      "whyItMatters": "Every PM is asked how the book handles alpha uncertainty. This debate frames the choice between ad hoc averaging of solutions and principled modelling of estimation error.",
      "hints": [
        "Without inequality constraints, $w^\\star$ is affine in $\\mu$, so the average of solutions equals the solution at the average input. With inequalities it is only piecewise affine.",
        "Consider which portfolios the averaging produces near the long-only boundary, and whether they are optimal for any single (μ, Σ).",
        "A fair comparison holds risk fixed out of sample and uses the same information set for every method."
      ],
      "keyPoints": [
        "Unconstrained (equality-only) case: averaging solutions over resampled $\\mu$ equals the solution at the mean input, so it is only as good as averaging the inputs (Σ resampling adds a little nonlinearity). With bounds, the piecewise-affine map makes the averaged portfolio smoother and more diversified than any single solution.",
        "Pro-resampling: it is a cheap way to smooth across active-set changes, it produces stable and diversified weights, and it is easy to explain.",
        "Against: the averaged portfolio need not be optimal for any belief, it is centred on the sample estimate and so keeps that estimate's error, and shrinkage, Bayesian or robust methods address the root cause with a coherent objective (Scherer 2002).",
        "Experiment: same data, same risk target, compare resampled, Bayes–Stein or Ledoit–Wolf, and robust SOCP portfolios on out-of-sample Sharpe ratio, turnover and realised risk, with bootstrap CIs, on simulated data where the truth is known and on real data."
      ],
      "followUps": [
        "Show that the resampled portfolio for a long-only problem violates the KKT conditions of the original problem in general, and quantify its suboptimality in-sample.",
        "Can resampling be interpreted as a robust optimization over some uncertainty set? Try to construct one."
      ],
      "source": {
        "label": "Michaud (1989) vs Scherer (2002); sensitivity results of Best & Grauer (1991) and Chopra & Ziemba (1993)",
        "url": "https://doi.org/10.2469/faj.v58.n6.2489",
        "relation": "motivated by"
      },
      "sides": [
        {
          "position": "Mean–variance optimizers maximise estimation error, and resampling or averaging over input uncertainty gives more robust, better-diversified portfolios.",
          "refs": [
            {
              "label": "Michaud (1989) — The Markowitz optimization enigma: is 'optimized' optimal?",
              "url": "https://doi.org/10.2469/faj.v45.n1.31"
            }
          ]
        },
        {
          "position": "Resampling lacks a decision-theoretic foundation, keeps the sample estimate's error, and is matched or beaten by shrinkage and Bayesian methods.",
          "refs": [
            {
              "label": "Scherer (2002) — Portfolio resampling: review and critique",
              "url": "https://doi.org/10.2469/faj.v58.n6.2489"
            }
          ]
        }
      ]
    }
  ],
  "projects": [
    {
      "id": "cvx-duality-r1",
      "title": "Replicate Chopra & Ziemba (1993): the relative cost of errors in means, variances and covariances",
      "level": "replication",
      "hours": "8–14",
      "paper": {
        "label": "Chopra & Ziemba (1993) — The effect of errors in means, variances, and covariances on optimal portfolio choice (Journal of Portfolio Management 19(2))",
        "url": "https://doi.org/10.3905/jpm.1993.409440"
      },
      "goal": "Reproduce the paper's main simulation: perturb, one at a time, the means, the variances and the covariances of a 10-asset universe; re-solve the long-only mean–variance problem; and measure the certainty-equivalent loss (CEL) relative to the true optimum across error sizes and risk tolerances. Then explain the ranking with the KKT sensitivity formulas of this module.",
      "data": "The paper uses monthly returns on 10 Dow Jones Industrial Average stocks over the 1980s. Use public monthly prices from stooq or yfinance for 10 long-lived large US stocks over a comparable 10-year window (document the substitutions and survivorship), or the Ken French 10 Industry Portfolios as a robustness universe. Use public or personal data only, never employer data or code.",
      "steps": [
        "Read the paper and record the exact objective (how risk tolerance enters), the perturbation scheme (multiplicative noise with scale k on each parameter class), the values of k and of risk tolerance, the number of replications, and the CEL definition.",
        "Estimate the \"true\" μ and Σ from your sample. Solve the long-only problem with CVXPY and record the optimal certainty equivalent.",
        "For each parameter class (means; variances with correlations held fixed; covariances with variances held fixed) and each k, draw perturbed inputs, re-solve, and evaluate the resulting portfolio under the TRUE parameters. Average CEL over replications.",
        "Reproduce the paper's CEL table or exhibit for your universe and the ratios of CEL(means) : CEL(variances) : CEL(covariances) at each risk tolerance.",
        "Explain the results with the module's sensitivity formulas: show that, on a fixed active set, the second-order utility loss from mean errors scales with (1/γ)·εᵀ(Σ⁻¹ − projection)ε, while covariance errors enter through Σ⁻¹ΔΣ w*, and relate the ratio to risk tolerance."
      ],
      "deliverables": [
        "Simulation code with fixed seeds and a config file of all paper parameters.",
        "Reproduced CEL table next to the paper's values, with your universe documented.",
        "Plot of the CEL ratios versus risk tolerance.",
        "A one-page explanation linking the ratios to the KKT sensitivity analysis."
      ],
      "acceptance": [
        "CEL increases monotonically with the error size k for all three parameter classes, at every risk tolerance tested.",
        "The ordering CEL(means) > CEL(variances) > CEL(covariances) holds at the paper's central risk tolerance, and the reported ratios are compared numerically with the paper's (the commonly cited headline: mean errors roughly an order of magnitude costlier than variance errors, which are roughly twice as costly as covariance errors). Deviations are explained.",
        "The mean-to-variance CEL ratio is reported as a function of risk tolerance, and its trend is compared with the paper's.",
        "A second-order prediction of CEL for mean errors from the Jacobian (on the base active set) is within 15% of the simulated CEL for the smallest k."
      ],
      "extensions": [
        "Repeat with a factor-neutral long–short active portfolio instead of long-only, and check whether the ranking survives when equality constraints project out common-factor alpha errors.",
        "Replace the multiplicative noise by sampling error of a T-month estimator and report how T changes the ratios."
      ]
    }
  ]
}
);
