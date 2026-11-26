LAB.extend("cvx-modeling", {
  "questions": [
    {
      "id": "modeling-q1",
      "type": "derive",
      "difficulty": 2,
      "prompt": "<p>Consider Huber regression $\\min_x \\sum_{i=1}^m \\phi(r_i)$, $r=Ax-b$, with $\\phi(u)=u^2$ for $|u|\\le1$ and $2|u|-1$ otherwise.</p><ol><li>Derive a Lagrange dual of the problem (B&V exercise 6.6(b)). Show that the dual variables are bounded, and interpret the bound as a limit on the influence any single observation can have on the fit.</li><li>Show that $\\phi(u)=\\min_v\\{(u-v)^2+2|v|\\}$ and hence that Huber regression is equivalent to $\\min_{x,v}\\|Ax-b-v\\|_2^2+2\\|v\\|_1$: least squares with an $\\ell_1$-penalized \"outlier\" vector.</li><li>For daily returns regressed on factors, what is the natural reading of the nonzero entries of $v^\\star$? Which days end up with nonzero $v_i$ when the residual scale doubles in a crisis but $M$ is held fixed?</li></ol>",
      "whyItMatters": "The outlier-variable form shows exactly what Huber does to a fat-tailed return series: it gives each day a free, $\\ell_1$-priced correction. Knowing the dual bound tells you how much a single crash day can still move your betas.",
      "hints": [
        "Write the conjugate of $\\phi$. Since $\\phi$ is the infimal convolution of $u^2$ and $2|u|$, its conjugate is the sum of the conjugates.",
        "The conjugate of $u^2$ is $\\nu^2/4$ and the conjugate of $2|u|$ is the indicator of $|\\nu|\\le2$. So the dual is a concave quadratic in $\\nu$ with $A^T\\nu=0$ and box constraints.",
        "Dual: maximize $-b^T\\nu-\\tfrac14\\|\\nu\\|_2^2$ subject to $A^T\\nu=0$, $\\|\\nu\\|_\\infty\\le2$ (sign conventions may differ). At the optimum $\\nu_i=-\\phi'(r_i)$, which is capped at $\\pm2$."
      ],
      "keyPoints": [
        "Correct dual (up to sign convention): concave quadratic objective, $A^T\\nu=0$, and $|\\nu_i|\\le2$; for least squares the box disappears.",
        "Identification $\\nu_i^\\star=\\pm\\phi'(r_i^\\star)$: the dual variable is the influence of observation $i$, bounded by the slope of the linear tail.",
        "Proof of the infimal-convolution identity by minimizing over $v$ (soft-thresholding: $v^\\star=\\operatorname{sign}(u)\\max(|u|-1,0)$).",
        "Interpretation of $v^\\star$ as a sparse mean-shift on outlier days and of $M$ as a threshold in residual units, so it must be tied to a scale estimate.",
        "With fixed $M$ and doubled volatility, many ordinary crisis days get $v_i\\ne0$, so Huber silently down-weights the whole regime, not just the outliers."
      ],
      "followUps": [
        "Derive the analogous dual for the deadzone-linear penalty (exercise 6.6(a)) and explain why its dual box is the same while the objective changes.",
        "Show that adding a scale variable via the perspective, $\\sigma\\,\\phi(r/\\sigma)+c\\sigma$, keeps the problem jointly convex (Owen 2007)."
      ],
      "source": {
        "label": "B&V exercise 6.6(b) (adapted)",
        "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf",
        "relation": "adapted from"
      }
    },
    {
      "id": "modeling-q2",
      "type": "derive",
      "difficulty": 3,
      "prompt": "<p>Let $Y\\succ0$ be the sample covariance of $N$ zero-mean Gaussian return vectors in $\\mathbf R^n$.</p><ol><li>Show that the log-likelihood as a function of $R=\\Sigma$, $\\ell(R)=-\\tfrac N2(\\log\\det R+\\operatorname{tr}(R^{-1}Y))$, is concave on $\\{R: 0\\prec R\\preceq 2Y\\}$ and not concave in general (B&V exercise 7.4(b), mean known).</li><li>Show that in $S=R^{-1}$ the log-likelihood is concave everywhere, and derive the optimality condition for $\\max_S \\log\\det S-\\operatorname{tr}(SY)-\\lambda\\|S\\|_{1,\\text{off}}$ (graphical lasso). What happens as $\\lambda\\to\\infty$ with the diagonal unpenalized?</li><li>For each of the following constraints, say whether it is convex in $R$, in $S$, in both or in neither: (a) $R_{ij}=0$ for given pairs; (b) $S_{ij}=0$ for given pairs; (c) $R=FF^T+D$ with $F\\in\\mathbf R^{n\\times k}$, $D$ diagonal; (d) $\\lambda_{\\max}(R)\\le c$; (e) the minimum-variance portfolio has weights $\\ge 0$.</li></ol>",
      "whyItMatters": "Which constraints are convex depends on whether you parametrize risk by the covariance or the precision matrix. This is why sparse precision (graphical lasso) is easy while sparse covariance or exact factor structure are not, and it decides which risk-model restrictions you can impose with a guarantee of a global optimum.",
      "hints": [
        "Restrict to a line $R=Z+tV$ and compute the second derivative of $-\\log\\det R-\\operatorname{tr}(R^{-1}Y)$ in $t$.",
        "For $-\\log\\det R-\\operatorname{tr}(R^{-1}Y)$ you should get $+\\operatorname{tr}(R^{-1}VR^{-1}V)-2\\operatorname{tr}(R^{-1}VR^{-1}VR^{-1}Y)$. Write both in terms of $W=R^{-1/2}VR^{-1/2}$ and compare.",
        "In $S$, the objective is $\\log\\det S-\\operatorname{tr}(SY)$: a concave plus a linear function. Optimality: $S^{-1}-Y-\\lambda\\Gamma=0$ with $\\Gamma_{ij}\\in\\partial|S_{ij}|$ off the diagonal and $\\Gamma_{ii}=0$."
      ],
      "keyPoints": [
        "Second derivative along a line equals $\\operatorname{tr}(W^2)-2\\operatorname{tr}(W^2R^{-1/2}YR^{-1/2})$ (up to the factor $N/2$); it is nonpositive whenever $R^{-1/2}YR^{-1/2}\\succeq\\tfrac12I$, i.e. $R\\preceq2Y$.",
        "Concavity in $S$ everywhere; graphical lasso KKT: $(S^{-1})_{ii}=Y_{ii}$ and $|(S^{-1}-Y)_{ij}|\\le\\lambda$ with equality on the support.",
        "As $\\lambda$ grows with unpenalized diagonal, $S$ becomes diagonal with $S_{ii}=1/Y_{ii}$.",
        "Classification: (a) linear in $R$, nonconvex in $S$; (b) linear in $S$; (c) nonconvex in both; (d) convex in $R$ (and equivalent to $\\lambda_{\\min}(S)\\ge1/c$, convex in $S$); (e) $S\\mathbf 1\\ge0$ is linear in $S$, not in $R$.",
        "Consequence: sparse-precision and long-only-GMV restrictions are convex in $S$, which is the natural variable for constrained ML risk models."
      ],
      "followUps": [
        "Sparse covariance (zeros in $R$) is nonconvex in the ML formulation. Propose a convex surrogate (e.g. thresholding or a least-squares loss on $R$) and state what you lose.",
        "Extend part 1 to an unknown mean as in the full exercise 7.4 and explain why the joint problem is concave in $(R,a)$ only on the same region."
      ],
      "source": {
        "label": "B&V exercise 7.4 (adapted)",
        "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf",
        "relation": "adapted from"
      }
    },
    {
      "id": "modeling-q3",
      "type": "debate",
      "difficulty": 3,
      "prompt": "<p>Bertsimas, King & Mazumder (2016) solved best subset regression exactly with mixed-integer optimization and reported that it beat the lasso on prediction and variable selection. Hastie, Tibshirani & Tibshirani (2020) re-ran a wider set of simulations and concluded that neither dominates: best subset wins at high SNR, the lasso at low SNR, and the relaxed lasso is close to the best throughout.</p><ol><li>State each side's strongest argument and identify the experimental choice (SNR range, metric, tuning) that drives most of the disagreement.</li><li>Population $R^2$ for a combined daily alpha is often below 1%, i.e. SNR around 0.01. Using the PVE–SNR relation $\\text{PVE}=\\text{SNR}/(1+\\text{SNR})$, place alpha combination on their SNR axis and argue which estimator you would expect to win.</li><li>Give one equity-research setting where an exact cardinality constraint is worth paying for even at low SNR (think about the cost structure of the decision, not just prediction error).</li></ol>",
      "whyItMatters": "Combining many weak signals is the core regression problem of an equity desk, and the choice between sparse selection and shrinkage has a published, data-driven answer that depends on SNR. Knowing why the two papers disagree prevents choosing an estimator from a benchmark run in the wrong regime.",
      "hints": [
        "Look at the SNR ranges each paper simulated and at whether the metric was in-sample or out-of-sample prediction error.",
        "Best subset has no shrinkage of the selected coefficients; at low SNR the variance of the unshrunk estimates dominates.",
        "For part 3, think about settings where each extra included name or signal has a fixed cost: monitoring, data licences, borrow, or explainability to a risk committee."
      ],
      "keyPoints": [
        "BKM: MIO makes exact subset selection tractable for p in the hundreds to thousands, with certificates of optimality; in their high-SNR simulations it gives sparser, more accurate models.",
        "HTT: over SNR 0.05–6, lasso wins at low SNR, best subset and forward stepwise at high SNR; relaxed lasso tracks the better of the two. The SNRs studied by BKM were mostly high relative to typical observational data.",
        "Mechanism: shrinkage trades bias for variance, which pays off when noise dominates; best subset is unbiased on the selected set and suffers from high selection variance at low SNR.",
        "Alpha combination sits far below the lowest SNR in HTT, which favours shrinkage (ridge, lasso, relaxed lasso) and argues against unshrunk subset selection.",
        "A cardinality constraint can still be justified by decision costs (fixed cost per signal or per name) rather than by prediction error; then L0 plus L2 hybrids (Mazumder, Radchenko & Dedieu 2023) are the relevant compromise."
      ],
      "followUps": [
        "Simulate the HTT low setting at SNR 0.01 and 0.05; does the relaxed lasso still match the lasso, and how much of the gap is tuning noise?",
        "Hazimeh & Mazumder (2020) report fast approximate L0 algorithms. Would their speed change the conclusion if you re-tune daily in a rolling backtest?"
      ],
      "source": {
        "label": "Debate: Bertsimas, King & Mazumder (2016) vs Hastie, Tibshirani & Tibshirani (2020)",
        "url": "https://doi.org/10.1214/19-STS733",
        "relation": "motivated by"
      },
      "sides": [
        {
          "position": "Best subset via MIO is now tractable and gives better prediction and sparser models than the lasso; convex relaxation should no longer be the default.",
          "refs": [
            {
              "label": "Bertsimas, King & Mazumder (2016) — Best subset selection via a modern optimization lens (Annals of Statistics 44(2))",
              "url": "https://doi.org/10.1214/15-AOS1388"
            },
            {
              "label": "Hazimeh & Mazumder (2020) — Fast best subset selection: coordinate descent and local combinatorial optimization algorithms (Operations Research 68(5))",
              "url": "https://doi.org/10.1287/opre.2019.1919"
            }
          ]
        },
        {
          "position": "Neither dominates; at low SNR (typical of observational data) the lasso and especially the relaxed lasso match or beat best subset, so shrinkage-based methods remain the sensible default.",
          "refs": [
            {
              "label": "Hastie, Tibshirani & Tibshirani (2020) — Best subset, forward stepwise or lasso? Analysis and recommendations based on extensive comparisons (Statistical Science 35(4))",
              "url": "https://doi.org/10.1214/19-STS733"
            },
            {
              "label": "Hastie, Tibshirani & Tibshirani (2017) — Extended comparisons of best subset selection, forward stepwise selection, and the lasso (arXiv:1707.08692)",
              "url": "https://arxiv.org/abs/1707.08692"
            },
            {
              "label": "Meinshausen (2007) — Relaxed lasso (Computational Statistics & Data Analysis 52(1))",
              "url": "https://doi.org/10.1016/j.csda.2006.12.019"
            }
          ]
        },
        {
          "position": "Combine both: L0 selection with continuous shrinkage keeps best subset's sparsity while recovering the lasso's low-SNR performance.",
          "refs": [
            {
              "label": "Mazumder, Radchenko & Dedieu (2023) — Subset selection with shrinkage: sparse linear modeling when the SNR is low (Operations Research 71(1))",
              "url": "https://doi.org/10.1287/opre.2022.2276"
            }
          ]
        }
      ]
    },
    {
      "id": "modeling-q4",
      "type": "counterexample",
      "difficulty": 3,
      "prompt": "<p>You combine three standardized signals $x_1,x_2,x_3$ to predict next-period residual returns with the lasso. Construct explicit population covariances and true coefficients for each of the following.</p><ol><li>A case where the true model uses only $x_1,x_2$ but the lasso path enters $x_3$ first and keeps it in the active set for every $\\lambda>0$ (violation of the irrepresentable condition of Zhao & Yu 2006).</li><li>A case where two true signals are nearly collinear and, across bootstrap resamples of a realistic sample size, the lasso keeps one and drops the other almost at random, while out-of-sample prediction barely changes.</li><li>A case with ten equally weak, positively correlated true signals where the best-tuned ridge fit beats the best-tuned lasso fit in out-of-sample $R^2$.</li></ol><p>For each case, state what a researcher would conclude from the lasso output and why that conclusion is wrong.</p>",
      "whyItMatters": "Lasso output is often read as \"which signals matter\". With correlated signals, that reading can be systematically wrong. Explicit counterexamples show when sparse selection is a modelling error rather than a regularization choice.",
      "hints": [
        "Work in the population (infinite-sample) limit: the lasso solves $\\min_\\beta \\tfrac12\\beta^T\\Sigma\\beta-\\beta^T\\Sigma\\beta^0+\\lambda\\|\\beta\\|_1$.",
        "For part 1, make $x_3$ highly correlated with the sum $x_1+x_2$: then its correlation with $y$ exceeds that of $x_1$ or $x_2$ individually, so it enters at $\\lambda_{\\max}$.",
        "Irrepresentable condition: $\\|\\Sigma_{S^cS}\\Sigma_{SS}^{-1}\\operatorname{sign}(\\beta_S^0)\\|_\\infty<1$. Pick $\\Sigma$ so this exceeds 1. For part 3, compute the ridge and lasso risk under equicorrelation."
      ],
      "keyPoints": [
        "A valid construction for part 1: e.g. $\\beta^0=(1,1,0)$, $\\operatorname{corr}(x_1,x_2)=0$, $\\operatorname{corr}(x_3,x_j)=\\rho$ with $1/2<\\rho<1/\\sqrt2$ (positive definiteness), so $\\Sigma\\beta^0=(1,1,2\\rho)$ and the irrepresentable quantity is $2\\rho>1$. With $\\rho=0.6$ the population lasso keeps $x_3$ nonzero for every $\\lambda>0$.",
        "Part 2: with correlation near 1 between two true signals, the lasso objective is nearly flat along the direction that trades one for the other, so sampling noise decides which one is kept; ridge splits the weight (the grouping effect discussed by Zou & Hastie 2005). Selection frequency across bootstraps near 50/50 is the diagnostic.",
        "Part 3: with many small, dense effects, L2 shrinkage along the leading principal component dominates selection; lasso must drop true signals to shrink, losing predictive power.",
        "Correct diagnosis: lasso support is a statement about a penalized fit, not about which signals carry information; under correlation, stability selection or ridge plus grouping is more appropriate.",
        "Link to Kozak, Nagel & Santosh (2020): in characteristic space, dense shrinkage beat sparse selection."
      ],
      "followUps": [
        "Show that the elastic net (Zou & Hastie 2005) fixes part 1 for some mixing parameter and compute the threshold.",
        "Run the same construction in finite samples (T = 2,500, population $R^2$ = 0.5%) and report how often each pathology appears."
      ],
      "source": {
        "label": "Zhao & Yu (2006) — On model selection consistency of lasso; Kozak, Nagel & Santosh (2020)",
        "url": "https://jmlr.org/papers/v7/zhao06a.html",
        "relation": "motivated by"
      }
    },
    {
      "id": "modeling-q5",
      "type": "predict",
      "difficulty": 2,
      "prompt": "<p>A long-short portfolio $w\\in\\mathbf R^n$ must have small exposure to $k$ factors, but the loadings matrix $B\\in\\mathbf R^{k\\times n}$ is estimated: each entry is known only to lie in $[\\bar B_{ij}-\\Delta_{ij},\\bar B_{ij}+\\Delta_{ij}]$. You minimize the worst-case factor exposure $\\sup_B\\|Bw\\|_1$ (or $\\|Bw\\|_\\infty$) subject to an alpha target $\\alpha^Tw\\ge a$ and $\\|w\\|_1\\le1$.</p><ol><li>Before deriving anything, predict how the robust solution differs from the nominal one ($\\Delta=0$): more or fewer names, larger or smaller positions in names with uncertain loadings?</li><li>Now derive the robust counterpart (B&V exercise 6.8(b): interval uncertainty in the matrix entries) and show it is an LP. Identify the term that acts as a weighted $\\ell_1$ penalty on $w$.</li><li>Predict what happens if instead the uncertainty set is a spectral-norm ball $\\|B-\\bar B\\|_2\\le\\rho$ with the Euclidean norm on $Bw$. What penalty appears, and does it still produce sparsity?</li></ol>",
      "whyItMatters": "Factor-neutrality constraints are only as good as the loadings. The robust counterpart shows that uncertainty in betas turns into a weighted $\\ell_1$ penalty that pushes the optimizer away from names with poorly estimated loadings, which is often what a PM does by hand.",
      "hints": [
        "For one row, $\\sup_{|\\delta_j|\\le\\Delta_{ij}}|(\\bar b_i+\\delta)^Tw|=|\\bar b_i^Tw|+\\sum_j\\Delta_{ij}|w_j|$.",
        "Introduce $u\\ge|w|$ elementwise; then each worst-case row exposure is linear in $(w,u)$ plus an absolute value of a linear function.",
        "For the spectral ball, use $\\sup_{\\|\\Delta\\|_2\\le\\rho}\\|(\\bar B+\\Delta)w\\|_2=\\|\\bar Bw\\|_2+\\rho\\|w\\|_2$ (El Ghaoui & Lebret 1997)."
      ],
      "keyPoints": [
        "Worst-case $\\ell_1$ exposure $=\\sum_i|\\bar b_i^Tw|+\\sum_{i,j}\\Delta_{ij}|w_j|$: a weighted $\\ell_1$ penalty with weight $\\sum_i\\Delta_{ij}$ per name.",
        "LP formulation with auxiliary variables for $|\\bar b_i^Tw|$ and $|w_j|$.",
        "Prediction confirmed: names with large loading uncertainty get smaller positions or are dropped; the robust solution is sparser than the nominal.",
        "Spectral-ball uncertainty gives an unsquared $\\ell_2$ penalty $\\rho\\|w\\|_2$: shrinks all positions, no sparsity, an SOCP.",
        "The geometry of the uncertainty set determines the penalty; choosing a penalty implies an uncertainty model."
      ],
      "followUps": [
        "Do the same for polyhedral row uncertainty (exercise 6.8(c)) and interpret the dual variables of the inner maximization.",
        "Calibrate $\\Delta_{ij}$ from the standard errors of rolling-regression betas and test whether the robust portfolio has lower realized factor exposure out of sample."
      ],
      "source": {
        "label": "B&V exercise 6.8(b) (adapted)",
        "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf",
        "relation": "adapted from"
      }
    },
    {
      "id": "modeling-q6",
      "type": "critique",
      "difficulty": 2,
      "prompt": "<p>A colleague proposes this beta model: \"Daily returns are fat-tailed, so OLS is wrong. We fit Huber regression with $M=1.345$ on raw daily returns in percent, which gives 95% efficiency at the Gaussian. Better still would be a Student-t likelihood with 4 degrees of freedom, which is the correct model for returns; we use Huber only because it is convex.\"</p><p>Critique each claim. Address scale, heteroskedasticity, leverage points, the efficiency statement, and the convexity of the Student-t ML problem (relate to B&V exercise 7.6 on log-concave location-scale families).</p>",
      "whyItMatters": "Robust regression is easy to misuse: a fixed threshold in the wrong units can either do nothing or down-weight entire regimes, and the move to a heavier-tailed likelihood trades convexity for local optima. Getting these details right decides whether a beta model actually becomes more stable.",
      "hints": [
        "The 95% efficiency figure for $M=1.345$ assumes residuals standardized by their scale. What is the residual scale of a daily stock return in percent?",
        "Huber bounds the influence of large residuals, but what about observations with extreme regressors (e.g. a market crash day)?",
        "Is the Student-t density log-concave? What does exercise 7.6 then say about convexity of its ML problem, and what can go wrong in practice?"
      ],
      "keyPoints": [
        "$M=1.345$ is in units of the residual standard deviation; on raw percent returns with residual sd around 1.5–3%, it either down-weights most days or almost none. $M$ must be tied to a robust scale estimate, ideally jointly (concomitant scale, Owen 2007).",
        "Under volatility clustering a global scale makes Huber down-weight whole high-vol regimes; standardize by a conditional vol first or use time-varying scale.",
        "Huber is robust to outliers in $y$ but not to leverage points in $x$: a crash day with an extreme market return can still dominate; bounded-influence (GM) estimators or downweighting by leverage are needed.",
        "Student-t is not log-concave, so its location/regression ML is nonconvex and can have multiple local maxima; exercise 7.6's convexity result requires log-concavity. Huber can be read as the ML for a least-favourable density with Gaussian centre and Laplace tails (Huber 1964).",
        "Gaussian efficiency is the wrong yardstick when the data are not Gaussian; compare efficiency or hedging error on realistic return distributions."
      ],
      "followUps": [
        "Construct a 3-observation location problem where the Student-t (1 df) likelihood has two local maxima.",
        "Adaptive Huber regression (Sun, Zhou & Fan 2020) lets $M$ grow with $n$. What does that mean for a 252-day rolling beta?"
      ],
      "source": {
        "label": "B&V exercise 7.6 (adapted)",
        "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf",
        "relation": "adapted from"
      }
    },
    {
      "id": "modeling-q7",
      "type": "design",
      "difficulty": 3,
      "prompt": "<p>You want to calibrate a market-impact model in which the expected implementation shortfall of an order is linear in a parameter vector $\\theta\\in\\mathbf R^p$ through features $v(\\text{order})\\in\\mathbf R^p$ (e.g. participation rate, square root of size over ADV, spread, volatility, time-of-day dummies). Next quarter you may route $m=2{,}000$ \"experimental\" child orders whose characteristics you can choose from a finite menu of $K$ order types, each with feature vector $v_k$. Noise is roughly homoskedastic after normalization.</p><ol><li>Formulate the choice of how many orders of each type as a relaxed D-optimal experiment design problem (B&V §7.5). Explain why it is convex and how to round to integers.</li><li>The desk only cares about predicting cost for large orders (participation above 10%). Replace the D-criterion with one that targets that use, and show it is still convex.</li><li>Add practical constraints: each order type has a different expected cost (experiments are not free), some types are capacity-limited, and you must keep at least 30% of orders in \"normal\" types to avoid signalling. Write the full problem and say what the dual tells you about the marginal value of an extra experiment.</li></ol>",
      "whyItMatters": "Impact models are usually calibrated on whatever trades happened, which leaves the most expensive regime (large participation) poorly identified. Treating calibration as experiment design is the cheapest way to tighten the estimates that actually drive portfolio construction.",
      "hints": [
        "Error covariance of the least-squares estimate with $m_k$ orders of type $k$ is $\\sigma^2(\\sum_k m_kv_kv_k^T)^{-1}$; set $\\lambda_k=m_k/m$.",
        "For a targeted criterion, minimize the variance of predictions on the set of interest, e.g. $\\operatorname{tr}(W(\\sum_k\\lambda_kv_kv_k^T)^{-1})$ with $W$ the second moment of target features (an A-optimal style criterion). Convexity follows from convexity of $\\operatorname{tr}(WX^{-1})$ on positive definite $X$.",
        "Expected cost and capacity are linear constraints in $\\lambda$; the 30% rule is a linear inequality on a subset of $\\lambda_k$."
      ],
      "keyPoints": [
        "D-optimal: minimize $\\log\\det(\\sum_k\\lambda_kv_kv_k^T)^{-1}$ over the simplex; convex because $\\log\\det$ is concave and the argument is affine in $\\lambda$.",
        "Rounding $m\\lambda_k$ loses little when $m\\gg p$; the optimal design has at most $p(p+1)/2$ support points.",
        "Targeted criterion $\\operatorname{tr}(W M(\\lambda)^{-1})$ (or a worst-case $\\max_{v\\in\\mathcal V}v^TM(\\lambda)^{-1}v$) remains convex and SDP-representable.",
        "Full problem includes a budget constraint on expected experiment cost, capacity bounds and the normal-flow constraint, all linear; the dual variable on the budget is the marginal reduction in the criterion per unit of extra experimental cost.",
        "Recognize limits: heteroskedastic noise and nonlinearity in $\\theta$ (e.g. exponent of the impact law) require weighting or local designs around a prior estimate."
      ],
      "followUps": [
        "If the impact exponent is itself unknown (cost $\\propto$ participation$^{\\beta}$), the model is nonlinear in $\\beta$. How would you build a locally D-optimal or Bayesian design?",
        "Relate the dual of your D-optimal problem to the minimum-volume ellipsoid around the $v_k$ (B&V §7.5.2) and interpret the order types that touch the ellipsoid."
      ],
      "source": {
        "label": "B&V §7.5 (experiment design), applied to transaction-cost calibration",
        "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf",
        "relation": "motivated by"
      }
    },
    {
      "id": "modeling-q8",
      "type": "connect",
      "difficulty": 3,
      "prompt": "<p>B&V §7.4.1 computes the worst-case probability of a set over all distributions with a given mean and covariance. Connect this to portfolio risk.</p><ol><li>For portfolio return $r=w^TX$ with $\\mathbf EX=\\mu$, $\\operatorname{Cov}X=\\Sigma$, derive the worst-case probability that $r\\le-L$ (one-sided Chebyshev / Cantelli) and invert it to get a worst-case VaR at level $\\epsilon$: $\\text{WCVaR}_\\epsilon(w)=-\\mu^Tw+\\kappa(\\epsilon)\\sqrt{w^T\\Sigma w}$. Find $\\kappa(\\epsilon)$.</li><li>Compare $\\kappa(\\epsilon)$ with the Gaussian quantile at $\\epsilon=5\\%$ and $1\\%$, and with the empirical ratio VaR/sd you would expect for daily equity returns. Is the worst-case bound useful or absurdly conservative?</li><li>El Ghaoui, Oks & Oustry (2003) extend this to $\\mu,\\Sigma$ known only up to an uncertainty set. Explain why minimizing WCVaR is still a convex problem, and connect the result to mean-variance optimization: which mean-variance risk-aversion corresponds to a given $\\epsilon$?</li></ol>",
      "whyItMatters": "Distribution-free risk bounds show why mean-variance with a square-root risk term is not just a Gaussian assumption: it is the exact worst case over all distributions with given moments. That gives a defensible interpretation of risk-aversion parameters and of VaR limits.",
      "hints": [
        "Cantelli: for any distribution with mean $m$ and variance $s^2$, $\\operatorname{prob}(r\\le m-t)\\le s^2/(s^2+t^2)$, and the bound is attained.",
        "Set $s^2/(s^2+t^2)=\\epsilon$ and solve for $t/s$.",
        "The worst case over an uncertainty set of $(\\mu,\\Sigma)$ is a supremum of convex functions of $w$, hence convex; for ellipsoidal or box sets it becomes an SOCP or SDP."
      ],
      "keyPoints": [
        "$\\kappa(\\epsilon)=\\sqrt{(1-\\epsilon)/\\epsilon}$: about 4.36 at 5% and 9.95 at 1%, versus Gaussian 1.645 and 2.33.",
        "Empirical daily equity VaR/sd ratios sit near or slightly above Gaussian values at 5% and higher at 1%, far below the Chebyshev worst case, so the bound is conservative but gives a guarantee that no tail assumption can break.",
        "Minimizing $-\\mu^Tw+\\kappa\\|\\Sigma^{1/2}w\\|_2$ is an SOCP; it is the mean-standard-deviation frontier, so every $\\epsilon$ maps to a point on the usual efficient frontier.",
        "With moment uncertainty, the worst case is a supremum over the set, still convex in $w$; El Ghaoui et al. give SOCP/SDP forms.",
        "Link to B&V §7.4.1: the SDP for general sets reduces to this closed form for a half-space."
      ],
      "followUps": [
        "Add the constraint that the distribution is symmetric or unimodal; how much does $\\kappa(\\epsilon)$ drop (Gauss/Vysochanskii–Petunin type bounds)?",
        "Use the SDP of §7.4.1 for a polyhedral loss region (e.g. joint loss in two books) and compare with the product of one-dimensional bounds."
      ],
      "source": {
        "label": "B&V §7.4.1 (Chebyshev bounds) and El Ghaoui, Oks & Oustry (2003) — Worst-case value-at-risk and robust portfolio optimization",
        "url": "https://doi.org/10.1287/opre.51.4.543.16101",
        "relation": "motivated by"
      }
    }
  ],
  "projects": [
    {
      "id": "cvx-modeling-p3",
      "title": "Replicate the best subset vs lasso SNR curves (Hastie, Tibshirani & Tibshirani)",
      "level": "replication",
      "hours": "10–16",
      "paper": {
        "label": "Hastie, Tibshirani & Tibshirani (2020) — Best subset, forward stepwise or lasso? (Statistical Science 35(4)); extended version arXiv:1707.08692",
        "url": "https://arxiv.org/abs/1707.08692"
      },
      "goal": "Reproduce the relative-test-error and number-of-nonzeros curves as functions of SNR for the lasso, relaxed lasso, forward stepwise and best subset selection in the paper's low setting (n = 100, p = 10, s = 5, correlation 0.35, beta-type 2; Figure 5 of arXiv v2), and then push the SNR grid down to the range of equity alpha combination.",
      "data": "Fully simulated, following Section 3.1 of the arXiv version: X ~ N(0, Σ) with Σ_ij = ρ^|i−j|, beta-type 2 (first s coefficients equal to 1), noise variance set to βᵀΣβ / SNR, ten SNR values from 0.05 to 6 on a log scale, tuning on an independent validation set of size n.",
      "steps": [
        "Implement the simulation design exactly as in Section 3.1 (four metrics: relative risk, relative test error, PVE, number of nonzeros).",
        "Best subset in the low setting by exhaustive enumeration of all 2^10 subsets (no MIO needed); forward stepwise by greedy selection; lasso with 50 λ values from λ_max on a log grid; relaxed lasso with 10 values of the mixing parameter γ from 1 to 0.",
        "Tune each method on the validation set; average over at least 10 repetitions (use 100 if compute allows and report standard errors).",
        "Plot relative test error and number of nonzeros vs SNR for the four methods; overlay the population limits (null RTE = 1 + SNR).",
        "Extend the SNR grid down to 0.005 and 0.01 (population R² of about 0.5–1%) and repeat.",
        "Optional: medium setting (n = 500, p = 100, s = 5; Figure 6) with best subset approximated by L0Learn or solved by MIO with a time limit; document the approximation."
      ],
      "deliverables": [
        "Code that reproduces the low-setting figure from a single seed file.",
        "Side-by-side plot of your curves and a description of how they compare with Figure 5 of arXiv v2.",
        "Extended low-SNR plot and a paragraph on what it implies for alpha combination."
      ],
      "acceptance": [
        "At SNR = 0.05 the lasso's relative test error is lower than best subset's; at SNR = 6 best subset's is lower than or equal to the lasso's (the qualitative crossing reported by the authors).",
        "Relaxed lasso's relative test error is within 5% of the better of lasso and best subset at every SNR in the grid (averaged over repetitions); report any SNR where it is not.",
        "Best subset and forward stepwise curves are close throughout (mean absolute RTE difference below 0.02 across the grid).",
        "Averaged over the SNR grid, the lasso selects more nonzeros than best subset (its known tendency to over-select when tuned for prediction); report the per-SNR counts."
      ],
      "extensions": [
        "Replace Gaussian noise with Student-t (3 df) and rerun; does the crossing SNR move?",
        "Add ridge regression and the elastic net to the comparison in the extended low-SNR regime."
      ]
    }
  ]
}
);
