LAB.module("convex-opt", {
  "id": "cvx-modeling",
  "order": 5,
  "title": "Approximation, Estimation and Geometric Problems",
  "summary": "B&V chapters 6–8 as a modelling toolkit: penalty shapes and what they do to residuals, regularization and sparsity, robust approximation, ML/MAP and covariance estimation as convex programs, experiment design, and the geometry behind projection, ellipsoids and classifiers. Read with robust factor regression, alpha combination and precision-matrix estimation in mind.",
  "sources": [
    {
      "label": "Boyd & Vandenberghe, Convex Optimization, ch. 6 (Approximation and fitting), ch. 7 (Statistical estimation), ch. 8 (Geometric problems)",
      "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
    },
    {
      "label": "EE364a slides: 6. Approximation and fitting",
      "url": "https://web.stanford.edu/class/ee364a/lectures/approx.pdf"
    },
    {
      "label": "EE364a slides: 7. Statistical estimation",
      "url": "https://web.stanford.edu/class/ee364a/lectures/stat.pdf"
    },
    {
      "label": "EE364a slides: 8. Geometric problems",
      "url": "https://web.stanford.edu/class/ee364a/lectures/geom.pdf"
    },
    {
      "label": "EE364b slides: l1-norm methods for convex-cardinality problems",
      "url": "https://web.stanford.edu/class/ee364b/lectures/l1_slides.pdf"
    },
    {
      "label": "Tibshirani (1996) — Regression shrinkage and selection via the lasso (JRSS B 58(1))",
      "url": "https://doi.org/10.1111/j.2517-6161.1996.tb02080.x"
    },
    {
      "label": "Friedman, Hastie & Tibshirani (2008) — Sparse inverse covariance estimation with the graphical lasso (Biostatistics 9(3))",
      "url": "https://doi.org/10.1093/biostatistics/kxm045"
    },
    {
      "label": "Bertsimas, King & Mazumder (2016) — Best subset selection via a modern optimization lens (Annals of Statistics 44(2))",
      "url": "https://doi.org/10.1214/15-AOS1388"
    },
    {
      "label": "Hastie, Tibshirani & Tibshirani (2020) — Best subset, forward stepwise or lasso? Analysis and recommendations based on extensive comparisons (Statistical Science 35(4))",
      "url": "https://doi.org/10.1214/19-STS733"
    }
  ],
  "lessons": [
    {
      "id": "cvx-modeling-1",
      "title": "Norm and penalty function approximation, least-norm problems",
      "minutes": 75,
      "links": [
        {
          "label": "B&V §6.1–6.2 (book PDF)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a slides 6: Approximation and fitting (norm and penalty approximation)",
          "url": "https://web.stanford.edu/class/ee364a/lectures/approx.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>How the shape of the penalty near zero and in the tails decides the residual histogram: quadratic spreads small residuals, $\\ell_1$ makes many exact zeros, deadzone ignores small ones, log-barrier forbids large ones.</li><li>The Huber penalty as the bridge: quadratic inside $[-M,M]$, linear outside, so its influence on the fit is bounded.</li><li>Least-norm problems as the dual picture: the same norms, now applied to the solution instead of the residual.</li></ul><h3>Predict before you read</h3><ol><li>You fit a 10-year daily regression of a stock on the market with $\\ell_2$, $\\ell_1$ and $\\ell_\\infty$ penalties. Which fit moves most if you delete the single worst crash day? Which one is decided almost entirely by a handful of days?</li><li>For the sum of the $k$ largest absolute residuals (B&V exercise 6.3(e)), what do you get at $k=1$ and $k=m$, and why is the intermediate case still an LP?</li><li>Which penalty is the negative log-density of which noise model? Guess before the next chapter makes it explicit.</li></ol><h3>Leave with</h3><p>Choosing a penalty is choosing which residuals you are willing to tolerate; the histogram of residuals at the optimum is a diagnostic of that choice, not of the data alone.</p><h3>Equity-QR angle</h3><p>Daily returns have kurtosis well above 3 and crash clusters. OLS betas and factor loadings are dominated by a few extreme days; Huber or $\\ell_1$ fits give exposures that are more stable through time and better for hedging the typical day. The $\\ell_\\infty$ fit is a worst-day tracking objective, which is what some index replication mandates implicitly ask for.</p>"
    },
    {
      "id": "cvx-modeling-2",
      "title": "Regularized approximation, trade-off curves and sparse descriptions",
      "minutes": 90,
      "links": [
        {
          "label": "B&V §6.3 (bi-criterion, regularization, smoothing and de-noising) and §6.5.4 (sparse descriptions, basis pursuit)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a slides 6: Regularized approximation",
          "url": "https://web.stanford.edu/class/ee364a/lectures/approx.pdf"
        },
        {
          "label": "EE364b slides: l1-norm methods for convex-cardinality problems",
          "url": "https://web.stanford.edu/class/ee364b/lectures/l1_slides.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>Regularization as a bi-criterion problem: you are tracing a Pareto curve, and the weight $\\delta$ is just a slope on it.</li><li>Tikhonov has a closed form through the SVD (B&V exercise 6.7); $\\ell_1$ does not, but produces exact zeros. Total-variation de-noising (§6.3.3) keeps jumps that quadratic smoothing blurs.</li><li>The $\\ell_1$ heuristic for cardinality (§6.5.4 and the EE364b deck): why it works when columns are weakly correlated and fails when they are not.</li></ul><h3>Predict before you read</h3><ol><li>With 40 correlated alpha signals and a weak target, which gives a better out-of-sample IC, ridge or lasso? What property of the true coefficient vector decides it?</li><li>As the $\\ell_1$ weight decreases from $\\lambda_{\\max}=\\|A^Tb\\|_\\infty$ toward 0, does the active set only grow? Give a reason it might not.</li><li>Total-variation smoothing of a factor exposure time series: what does it produce when the true exposure has a regime break?</li></ol><h3>Leave with</h3><p>Regularization encodes a prior about the solution (small, sparse, smooth, piecewise constant); the solution path over the weight is more informative than any single point on it.</p><h3>Equity-QR angle</h3><p>Alpha combination is a high-noise regression with correlated predictors. Ridge shrinks along principal components and suits many small, dense effects; lasso picks representatives and is unstable under correlation. Kozak, Nagel & Santosh (2020) find that, in characteristic space, $\\ell_2$-type shrinkage beats sparse selection for the stochastic discount factor. Total-variation penalties are a principled way to estimate time-varying betas with breaks.</p>"
    },
    {
      "id": "cvx-modeling-3",
      "title": "Robust approximation and function fitting",
      "minutes": 75,
      "links": [
        {
          "label": "B&V §6.4 (stochastic and worst-case robust approximation) and §6.5 (function fitting and interpolation)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a slides 6: Robust approximation",
          "url": "https://web.stanford.edu/class/ee364a/lectures/approx.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>Two notions of robustness for an uncertain matrix $A$: average-case (stochastic) and worst-case over a set. Stochastic robust least squares turns into Tikhonov regularization with a data-dependent weight matrix.</li><li>Worst-case least squares with a norm-bounded perturbation becomes an SOCP (and with a spectral-norm ball, a regularized problem); with interval uncertainty in the entries and $\\ell_1$/$\\ell_\\infty$ norms it becomes an LP (B&V exercise 6.8).</li><li>Function fitting (§6.5) as linear regression in a function basis, with convex shape constraints such as monotone or convex fits.</li></ul><h3>Predict before you read</h3><ol><li>If your betas carry estimation error with covariance $P$, which regularizer does the expected tracking error add to the portfolio problem?</li><li>Under worst-case uncertainty, does robustness ever make the solution exactly zero? For which radius?</li><li>You fit a transaction-cost curve that must be convex and increasing in trade size. Is that still a convex fitting problem?</li></ol><h3>Leave with</h3><p>Robustness to errors in the data and regularization are often the same problem written two ways; knowing which uncertainty set produces which penalty lets you choose penalties for a reason.</p><h3>Equity-QR angle</h3><p>Estimated betas, factor loadings and expected returns all enter portfolio problems with error. A box on loadings yields an $\\ell_1$ penalty on positions; an ellipsoid yields a norm penalty. Shape-constrained fits (monotone, convex) are the right tool for impact curves and for signal-to-return mappings where you want monotonicity without a parametric form.</p>"
    },
    {
      "id": "cvx-modeling-4",
      "title": "Maximum likelihood and MAP estimation, nonparametric distribution estimation",
      "minutes": 90,
      "links": [
        {
          "label": "B&V §7.1–7.2 (parametric ML and MAP, nonparametric estimation)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a slides 7: Maximum likelihood estimation",
          "url": "https://web.stanford.edu/class/ee364a/lectures/stat.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>Linear measurements with IID noise: the ML problem is a penalty approximation problem with penalty $-\\log p$. Log-concave noise means convex ML.</li><li>Logistic regression and covariance estimation: the Gaussian ML for covariance is concave in the inverse covariance $S=\\Sigma^{-1}$, not in $\\Sigma$ (see B&V exercise 7.4 for the region where it is concave in $\\Sigma$).</li><li>MAP adds $-\\log$ prior: a Laplace prior gives the lasso, a Gaussian prior gives ridge. Nonparametric estimation over a finite alphabet is a convex problem in the probability vector with moment constraints.</li></ul><h3>Predict before you read</h3><ol><li>Which noise distribution gives $\\ell_1$ regression? $\\ell_\\infty$ (B&V exercise 7.2)? Is Student-t noise log-concave?</li><li>You add the constraint that the precision matrix is sparse. Convex in $S$? And the constraint that $\\Sigma$ has a $k$-factor structure: convex in anything?</li><li>Maximum entropy subject to known moments: what family appears, and how does it relate to the dual?</li></ol><h3>Leave with</h3><p>Convexity of an estimation problem is a property of the parametrization: ML for Gaussian covariance is convex in the precision matrix, which is why sparsity is imposed on $\\Sigma^{-1}$ (graphical lasso) rather than on $\\Sigma$.</p><h3>Equity-QR angle</h3><p>Covariance estimation is the core of risk models. The graphical lasso (Friedman, Hastie & Tibshirani 2008) puts sparsity on $\\Sigma^{-1}$, whose rows are hedge regressions (Stevens 1998): a zero means asset $j$ is not used to hedge asset $i$ given the rest. Goto & Xu (2015) use this for portfolio construction. Maximum entropy gives a principled way to build return scenario distributions that match chosen moments.</p>"
    },
    {
      "id": "cvx-modeling-5",
      "title": "Detector design, hypothesis testing, Chebyshev and Chernoff bounds",
      "minutes": 70,
      "links": [
        {
          "label": "B&V §7.3 (optimal detector design) and §7.4 (Chebyshev and Chernoff bounds)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a slides 7: Hypothesis testing",
          "url": "https://web.stanford.edu/class/ee364a/lectures/stat.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>Randomized detectors make the set of achievable error-probability pairs convex; the Neyman–Pearson trade-off curve becomes an LP.</li><li>The generalized Chebyshev bound: the worst-case probability of a set, over all distributions with given first and second moments, is an SDP.</li><li>Chernoff bounds as convex problems in the exponent, and how they tighten when the set is a polyhedron.</li></ul><h3>Predict before you read</h3><ol><li>Given only the mean and covariance of portfolio returns, what is the worst-case probability of a loss larger than $L$? Is it a one-sided Chebyshev (Cantelli) bound?</li><li>Why does allowing randomized decisions make the detector design problem easier rather than harder?</li><li>Is the moment-constrained worst-case VaR more or less conservative than the Gaussian VaR at 99%? At 95%?</li></ol><h3>Leave with</h3><p>Worst-case probability bounds over moment classes are computable convex problems, which turns distribution-free risk statements into SOCPs and SDPs.</p><h3>Equity-QR angle</h3><p>El Ghaoui, Oks & Oustry (2003) turn exactly this into worst-case VaR: for mean and covariance known (or known up to a set), worst-case VaR is a second-order cone function of the weights. It explains why mean-variance with a \"VaR\" constraint under moment uncertainty is still an SOCP.</p>"
    },
    {
      "id": "cvx-modeling-6",
      "title": "Experiment design",
      "minutes": 60,
      "links": [
        {
          "label": "B&V §7.5 (relaxed experiment design, D-, E-, A-optimal scalarizations)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a slides 7: Experiment design",
          "url": "https://web.stanford.edu/class/ee364a/lectures/stat.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>The error covariance of a linear estimator is $\\left(\\sum_i m_i v_iv_i^T\\right)^{-1}$; choosing how many measurements of each type is an integer problem, relaxed to fractions $\\lambda_i$.</li><li>Scalarizations: D-optimal (log det, volume of the confidence ellipsoid), E-optimal (largest eigenvalue), A-optimal (trace). Each is convex in $\\lambda$.</li><li>The dual of D-optimal design is a minimum-volume ellipsoid around the candidate vectors; the support of the optimal design touches that ellipsoid.</li></ul><h3>Predict before you read</h3><ol><li>With $p$ unknown parameters, how many distinct experiment types does a D-optimal design need at most?</li><li>Which scalarization would you choose if you care about the worst direction of uncertainty in a market-impact model?</li><li>How far from optimal is the design obtained by rounding $m\\lambda_i$ to integers?</li></ol><h3>Leave with</h3><p>Choosing what to measure is a convex problem in the fraction of effort per measurement type, and its dual is geometric.</p><h3>Equity-QR angle</h3><p>Transaction-cost and impact models are calibrated on your own trades. Deliberately varying participation rate, order size and time of day is an experiment design problem: D-optimal allocation of a limited \"experiment budget\" tightens the impact estimates where they matter. The same logic applies to allocating paper-trading capacity across signal variants.</p>"
    },
    {
      "id": "cvx-modeling-7",
      "title": "Projection, distance and separation; Euclidean distance and angle problems",
      "minutes": 70,
      "links": [
        {
          "label": "B&V §8.1–8.3 (projection on a set, distance between sets, Euclidean distance and angle problems)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>Projection onto a closed convex set is unique and gives a separating hyperplane for free (B&V exercises 8.1 and 8.4).</li><li>Distance between two convex sets and its dual: the dual optimal variables define the separating hyperplane.</li><li>Gram-matrix (§8.3) reformulations: problems on angles and distances between vectors become SDPs in $G=X^TX$.</li></ul><h3>Predict before you read</h3><ol><li>Projecting an indefinite sample correlation matrix onto the PSD cone with unit diagonal: is it a projection problem in the sense of §8.1, and in which norm?</li><li>What is the projection of a point onto the simplex, and why does it produce exact zeros?</li><li>Given bounds on some pairwise correlations, can you find the range of a correlation you did not observe? Which problem class is it?</li></ol><h3>Leave with</h3><p>Projection, separation and distance are the same convex problem seen from primal and dual sides; Gram-matrix variables turn geometry on vectors into SDPs.</p><h3>Equity-QR angle</h3><p>Fixing broken correlation matrices (stress tests, pairwise-estimated or overlapping-sample correlations) is a nearest-correlation-matrix projection. Bounds on an unknown correlation given other correlations (Gram-matrix SDP) are useful for stress scenarios. Projection onto the simplex or a box is the inner step of projected-gradient portfolio solvers.</p>"
    },
    {
      "id": "cvx-modeling-8",
      "title": "Extremal volume ellipsoids and centering",
      "minutes": 70,
      "links": [
        {
          "label": "B&V §8.4 (Löwner–John and maximum volume inscribed ellipsoids) and §8.5 (Chebyshev, MVE and analytic centers)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a slides 8: Extremal volume ellipsoids, centering",
          "url": "https://web.stanford.edu/class/ee364a/lectures/geom.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>Minimum-volume ellipsoid covering points (log det objective, SOC constraints) and maximum-volume ellipsoid inside a polyhedron; both are affine invariant.</li><li>The approximation factor: shrinking the Löwner–John ellipsoid by $n$ (or $\\sqrt n$ for symmetric sets) puts it inside the set.</li><li>Three centers of a polyhedron: Chebyshev (LP), maximum-volume ellipsoid center (log det), analytic center (log barrier). The analytic center is the starting point of the next module.</li></ul><h3>Predict before you read</h3><ol><li>The minimum-volume ellipsoid around daily factor-return vectors: how is it related to the sample covariance ellipsoid, and how does it react to one crash day?</li><li>Which center of the feasible set of a constrained portfolio problem moves when you add a redundant constraint (B&V exercise 8.18)?</li><li>Why is the analytic center a natural starting point for interior-point methods?</li></ol><h3>Leave with</h3><p>Ellipsoidal approximations of convex sets are computable via log det, and the different centers of a set differ exactly in how they react to redundant or duplicated constraints.</p><h3>Equity-QR angle</h3><p>Minimum-volume ellipsoids are a robust-covariance estimator (MVE) and give ellipsoidal uncertainty sets for robust portfolio optimization from data. The analytic center of a set of constraints is a cheap, constraint-respecting \"neutral\" portfolio and the starting point for IPMs.</p>"
    },
    {
      "id": "cvx-modeling-9",
      "title": "Classification and discrimination; placement and location",
      "minutes": 70,
      "links": [
        {
          "label": "B&V §8.6 (linear and nonlinear discrimination, SVM) and §8.7 (placement and facility location, optional)",
          "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf"
        },
        {
          "label": "EE364a slides 8: Classification, placement and facility location",
          "url": "https://web.stanford.edu/class/ee364a/lectures/geom.pdf"
        }
      ],
      "focus": "<h3>Watch for</h3><ul><li>Linear discrimination of separable sets as an LP feasibility problem; the maximum-margin separator as a QP; the soft-margin SVM as a trade-off between margin and hinge-loss violations.</li><li>Logistic regression as an alternative smooth loss; robust linear discrimination (B&V exercise 8.23) where points carry uncertainty.</li><li>Nonlinear discrimination with quadratic or polynomial features is still convex in the parameters.</li></ul><h3>Predict before you read</h3><ol><li>Which training points determine the SVM solution, and what does that imply about its sensitivity to outliers versus logistic regression?</li><li>If each feature vector is known only within a ball of radius $\\rho$, what happens to the margin problem?</li><li>Is \"maximize margin\" a regularizer? Which one?</li></ol><h3>Leave with</h3><p>Margin maximization is norm regularization in disguise, and robustness to feature noise turns directly into a margin requirement.</p><h3>Equity-QR angle</h3><p>Up/down classifiers on returns are low-signal; hinge-loss models are driven by the support vectors near the boundary, which in finance are often noisy days. The robust discrimination view says how much margin to demand given feature measurement error (e.g. stale or revised fundamentals).</p>"
    }
  ],
  "cheatsheet": [
    {
      "term": "Penalty function approximation",
      "formula": "\\min_x \\sum_{i=1}^m \\phi(a_i^Tx-b_i)",
      "note": "Convex $\\phi$; the shape of $\\phi$ determines the residual distribution at the optimum (B&V §6.1.2)."
    },
    {
      "term": "Huber penalty",
      "formula": "\\phi_M(u)=\\begin{cases}u^2 & |u|\\le M\\\\ M(2|u|-M) & |u|>M\\end{cases}=\\min_{v}\\,\\{(u-v)^2+2M|v|\\}",
      "note": "Quadratic core, linear tails; equivalent to least squares with an $\\ell_1$-penalized outlier variable $v$."
    },
    {
      "term": "Tikhonov (ridge) solution",
      "formula": "x^\\star=(A^TA+\\delta I)^{-1}A^Tb=\\sum_i \\frac{\\sigma_i}{\\sigma_i^2+\\delta}\\,(u_i^Tb)\\,v_i",
      "note": "Shrinks along singular directions; small singular values are damped most (B&V exercise 6.7)."
    },
    {
      "term": "Lasso and its entry point",
      "formula": "\\min_x \\tfrac12\\|Ax-b\\|_2^2+\\lambda\\|x\\|_1,\\qquad x^\\star=0 \\iff \\lambda\\ge\\|A^Tb\\|_\\infty",
      "note": "MAP with a Laplace prior; produces exact zeros."
    },
    {
      "term": "Stochastic robust least squares",
      "formula": "\\mathbf E\\|(\\bar A+U)x-b\\|_2^2=\\|\\bar Ax-b\\|_2^2+x^TPx,\\quad P=\\mathbf E\\,U^TU",
      "note": "Zero-mean uncertainty in $A$ becomes Tikhonov regularization with weight matrix $P$ (B&V §6.4.1)."
    },
    {
      "term": "Worst-case robust least squares (spectral ball)",
      "formula": "\\sup_{\\|\\Delta\\|_2\\le\\rho}\\|(A+\\Delta)x-b\\|_2=\\|Ax-b\\|_2+\\rho\\|x\\|_2",
      "note": "El Ghaoui & Lebret (1997); an SOCP, and a sum of norms rather than squared norms."
    },
    {
      "term": "ML for linear measurements",
      "formula": "\\hat x_{\\rm ml}=\\arg\\max_x \\sum_{i=1}^m \\log p(y_i-a_i^Tx)",
      "note": "Convex when the noise density $p$ is log-concave (Gaussian, Laplace, logistic; not Student-t)."
    },
    {
      "term": "Gaussian covariance ML in the precision matrix",
      "formula": "\\max_{S\\succ 0}\\;\\log\\det S-\\operatorname{tr}(SY)",
      "note": "Concave in $S=\\Sigma^{-1}$; solution $S=Y^{-1}$ when $Y\\succ0$ (B&V §7.1.1, exercise 7.4)."
    },
    {
      "term": "Graphical lasso",
      "formula": "\\max_{S\\succ0}\\;\\log\\det S-\\operatorname{tr}(SY)-\\lambda\\sum_{i\\ne j}|S_{ij}|",
      "note": "Friedman, Hastie & Tibshirani (2008); zeros in $S$ are conditional independences."
    },
    {
      "term": "D-optimal experiment design",
      "formula": "\\min_{\\lambda\\succeq0,\\ \\mathbf 1^T\\lambda=1}\\ \\log\\det\\Big(\\sum_{i=1}^p\\lambda_iv_iv_i^T\\Big)^{-1}",
      "note": "Minimizes the volume of the confidence ellipsoid; dual is a minimum-volume ellipsoid around the $v_i$ (B&V §7.5.2)."
    },
    {
      "term": "Generalized Chebyshev bound",
      "formula": "\\sup\\{\\operatorname{prob}(X\\in C):\\mathbf EX=\\mu,\\ \\mathbf EXX^T=\\Sigma+\\mu\\mu^T\\}",
      "note": "Computable as an SDP when $C$ is a polyhedron complement or similar (B&V §7.4.1); basis of worst-case VaR."
    },
    {
      "term": "Löwner–John (minimum-volume covering) ellipsoid",
      "formula": "\\min_{A\\succ0,b}\\ \\log\\det A^{-1}\\ \\text{s.t.}\\ \\|Ax_i+b\\|_2\\le1,\\ i=1,\\dots,m",
      "note": "Ellipsoid $\\{v:\\|Av+b\\|_2\\le1\\}$; affine invariant (B&V §8.4.1)."
    },
    {
      "term": "Analytic center",
      "formula": "x_{\\rm ac}=\\arg\\min_x -\\sum_{i=1}^m\\log(b_i-a_i^Tx)",
      "note": "Depends on the description of the set, not just the set (B&V §8.5.3)."
    },
    {
      "term": "Soft-margin SVM",
      "formula": "\\min_{a,b,u,v}\\ \\|a\\|_2+\\gamma(\\mathbf 1^Tu+\\mathbf 1^Tv)\\ \\text{s.t.}\\ a^Tx_i+b\\ge1-u_i,\\ a^Ty_i+b\\le-(1-v_i),\\ u,v\\succeq0",
      "note": "Trade-off between margin $2/\\|a\\|_2$ and hinge violations (B&V §8.6.1)."
    }
  ],
  "flashcards": [
    {
      "q": "Penalty functions and their noise models: which density gives the $\\ell_1$, $\\ell_2$ and $\\ell_\\infty$ fits?",
      "a": "Laplace noise gives $\\ell_1$, Gaussian gives $\\ell_2$, and uniform noise on $[-a,a]$ with unknown $a$ gives $\\ell_\\infty$ (B&V exercise 7.2)."
    },
    {
      "q": "Write the Huber penalty as a minimization over an outlier variable.",
      "a": "$\\phi_M(u)=\\min_v\\{(u-v)^2+2M|v|\\}$: Huber regression = least squares on $b-v$ plus an $\\ell_1$ penalty on the outlier vector $v$."
    },
    {
      "q": "Smallest $\\lambda$ for which the lasso solution of $\\tfrac12\\|Ax-b\\|_2^2+\\lambda\\|x\\|_1$ is zero?",
      "a": "$\\lambda_{\\max}=\\|A^Tb\\|_\\infty$ (the subgradient condition at $x=0$)."
    },
    {
      "q": "Ridge solution in SVD form and its effective degrees of freedom.",
      "a": "$x^\\star=\\sum_i\\frac{\\sigma_i}{\\sigma_i^2+\\delta}(u_i^Tb)v_i$, df $=\\sum_i\\frac{\\sigma_i^2}{\\sigma_i^2+\\delta}$."
    },
    {
      "q": "Stochastic robust LS with $A=\\bar A+U$, $\\mathbf EU=0$: equivalent deterministic problem?",
      "a": "$\\min\\|\\bar Ax-b\\|_2^2+x^TPx$ with $P=\\mathbf EU^TU$: Tikhonov with matrix weight."
    },
    {
      "q": "Worst-case LS over $\\|\\Delta\\|_2\\le\\rho$: closed form of the worst-case residual?",
      "a": "$\\|Ax-b\\|_2+\\rho\\|x\\|_2$ (El Ghaoui & Lebret 1997). The solution is zero once $\\rho\\ge\\|A^Tb\\|_2/\\|b\\|_2$."
    },
    {
      "q": "When is ML estimation for $y=Ax+v$ with IID noise a convex problem?",
      "a": "When the noise density is log-concave; then $-\\sum\\log p(y_i-a_i^Tx)$ is convex in $x$."
    },
    {
      "q": "Gaussian ML for the covariance: in which variable is it concave, and what is the solution?",
      "a": "Concave in $S=\\Sigma^{-1}$: $\\log\\det S-\\operatorname{tr}(SY)$, solution $S=Y^{-1}$ if $Y\\succ0$. In $\\Sigma$ it is concave only on $\\Sigma\\preceq2Y$ (B&V exercise 7.4)."
    },
    {
      "q": "What does $S_{ij}=0$ mean in a Gaussian precision matrix, and in portfolio terms?",
      "a": "Assets $i$ and $j$ are conditionally independent given the others; equivalently $j$ has zero coefficient in the regression of $i$ on all other assets (its minimum-variance hedge)."
    },
    {
      "q": "Name the three scalarizations of experiment design and what each minimizes.",
      "a": "D: $\\log\\det$ of error covariance (ellipsoid volume); E: $\\lambda_{\\max}$ (worst direction); A: trace (mean squared error)."
    },
    {
      "q": "Bound on the number of nonzero weights in an optimal D-optimal design with $p$ parameters?",
      "a": "At most $p(p+1)/2$ (Carathéodory on the symmetric matrices); often far fewer."
    },
    {
      "q": "Löwner–John ellipsoid approximation factor?",
      "a": "If $\\mathcal E$ is the minimum-volume ellipsoid covering a convex set $C\\subset\\mathbf R^n$, then shrinking $\\mathcal E$ by a factor $n$ about its center gives an ellipsoid inside $C$; $\\sqrt n$ if $C$ is symmetric."
    },
    {
      "q": "Chebyshev center vs analytic center of a polyhedron.",
      "a": "Chebyshev: center of the largest inscribed ball (an LP), depends only on the set. Analytic: minimizer of the log barrier, depends on the inequality description (redundant constraints move it)."
    },
    {
      "q": "Soft-margin SVM and the margin it maximizes.",
      "a": "Minimize $\\|a\\|_2+\\gamma\\sum(u_i+v_i)$ with hinge slacks; slab width between $a^Tz+b=\\pm1$ is $2/\\|a\\|_2$."
    }
  ],
  "projects": [
    {
      "id": "cvx-modeling-p1",
      "title": "Penalty shapes on fat-tailed returns: robust factor regressions",
      "level": "core",
      "hours": "8–12",
      "goal": "Estimate industry factor exposures with five convex losses (OLS, Huber with several M, LAD/l1, deadzone-linear, and l-infinity) written in CVXPY, and measure which loss gives exposures that hedge best out of sample. Then show, by injecting synthetic crash days, how much each estimator moves. The deliverable is an evidence-based choice of loss for a production beta model.",
      "data": "Kenneth French data library (public): daily Fama–French 5 factors plus momentum, and the 49 industry portfolios (value-weighted), 1990 to present. Optional: daily single-stock adjusted closes from stooq or yfinance for 30–50 large caps (survivorship bias: note it, do not fix it). Public data only.",
      "steps": [
        "Download and align daily factor and industry returns; use excess returns. Hold out the last 5 years.",
        "For each industry and each 252-day rolling window, fit exposures to the 6 factors with: OLS, Huber (M = 1, 1.345, 2 times a robust scale such as 1.4826·MAD of OLS residuals), LAD, deadzone-linear (dead zone = 0.5·MAD) and l-infinity. Use cvxpy.huber, cvxpy.norm1 and cvxpy.norm_inf.",
        "Verify each CVXPY fit against an independent implementation (statsmodels RLM for Huber with a fixed scale, quantile regression at 0.5 for LAD) on 5 windows.",
        "Out-of-sample metric: hedge each industry next month with the estimated exposures; record the variance and the 5% expected shortfall of the hedged return, and the month-to-month turnover of the exposures.",
        "Stress test: inject 3 synthetic crash days (−8 sigma market, idiosyncratic industry moves drawn from the empirical residual distribution) into random windows and record the change in exposures per estimator.",
        "Plot the residual histograms at the optimum for each loss on one window and relate them to B&V §6.1.2."
      ],
      "deliverables": [
        "Script or notebook with the five estimators and the verification tests.",
        "Table: hedged variance, hedged ES(5%), exposure turnover per loss, averaged over industries, with block-bootstrap 95% intervals.",
        "Plot: mean absolute change in exposures under crash injection, by loss.",
        "Half-page recommendation with the chosen loss and the scale rule for M."
      ],
      "acceptance": [
        "CVXPY Huber and LAD fits match the reference implementations to 1e-4 in coefficients on all 5 test windows.",
        "Under crash injection, the median absolute exposure change of the Huber (M = 1.345 robust scale) estimator is at most half that of OLS; report the actual ratio either way.",
        "The l-infinity fit has the largest crash sensitivity of all estimators (if not, explain why with the residual histogram).",
        "The out-of-sample comparison uses only data strictly before each hedge month, checked by an assertion on window end dates."
      ],
      "extensions": [
        "Replace the fixed M with a jointly estimated scale using the concomitant (perspective) form of Huber in Owen (2007), which stays convex.",
        "Add a total-variation penalty on the exposure path across windows and compare the hedging error with rolling windows."
      ]
    },
    {
      "id": "cvx-modeling-p2",
      "title": "Graphical lasso precision matrices for minimum-variance portfolios",
      "level": "stretch",
      "hours": "12–18",
      "goal": "Implement the graphical lasso as a CVXPY log-det problem, check it against a specialized solver, and test whether a sparse precision matrix improves out-of-sample global minimum-variance (GMV) portfolios relative to sample, Ledoit–Wolf and factor-model covariances. Interpret the sparsity pattern as a hedging graph.",
      "data": "Kenneth French data library: daily 49 industry portfolios (and the 100 size/book-to-market portfolios for a harder, more collinear test), 1990 to present. Optional single stocks from stooq/yfinance. Public data only.",
      "steps": [
        "Write the penalized ML problem max log det S − tr(SY) − λ·sum of |S_ij| (off-diagonal) in CVXPY with the SCS or Clarabel solver; standardize returns to correlations first.",
        "Validate against sklearn.covariance.graphical_lasso on 3 windows and λ values; compare objective values and supports.",
        "Check optimality yourself: verify the KKT condition that (S^-1 − Y) has entries equal to λ·sign(S_ij) on the support and bounded by λ in absolute value off it, up to tolerance.",
        "Rolling backtest: 500-day estimation window, monthly rebalance, GMV weights w = S1/(1ᵀS1) with and without a long-only constraint; choose λ by a validation block inside each window.",
        "Competitors: sample covariance, Ledoit–Wolf (2004) linear shrinkage, a 5-factor model covariance (FF5 betas plus diagonal residual variance).",
        "Plot the estimated hedging graph (nonzero S_ij) for one date and compare with the 49-industry classification."
      ],
      "deliverables": [
        "Code with the CVXPY graphical lasso, the KKT checker and the backtest.",
        "Table: annualized out-of-sample volatility, turnover and maximum weight per estimator, with a test of volatility differences (e.g. Ledoit–Wolf style bootstrap on variance ratios).",
        "Figure: support of S at a chosen date; average number of hedge partners per industry vs λ."
      ],
      "acceptance": [
        "CVXPY and sklearn objectives agree to 1e-4 relative on all test cases; supports agree after thresholding at 1e-4.",
        "The KKT residual of your solution is below 1e-3 in max norm.",
        "The backtest reports out-of-sample volatility for all four estimators on the same dates; the sample-covariance GMV on the 100 portfolios is visibly worse than the others (if not, explain via the n/T ratio).",
        "λ is chosen without using any return after the rebalance date (assertion in code)."
      ],
      "extensions": [
        "Compare with POET (Fan, Liao & Mincheva 2013): factor plus sparse residual covariance instead of sparse precision.",
        "Use the Goto & Xu (2015) interpretation and constrain the hedge graph to industry neighbours only; is the constrained problem still convex?"
      ]
    }
  ],
  "frontier": {
    "asOf": "2026-11",
    "summary": "The modelling chapters of B&V are settled as mathematics; the live research is about which convex surrogate to use when the statistics are hard. Three lines matter for an equity researcher. First, the best-subset revival through mixed-integer optimization and its sober re-evaluation at low signal-to-noise ratios, which is exactly the regime of return prediction. Second, heavy-tailed robust estimation where the Huber threshold grows with the sample size, and its use as a default loss in ML asset pricing. Third, structured covariance and precision estimation (sparse precision, factor plus sparse, shrinkage) and the recognition that robust optimization, regularization and Wasserstein distributionally robust optimization are often the same convex program.",
    "threads": [
      {
        "title": "Best subset via MIO versus convex relaxations",
        "why": "Bertsimas, King & Mazumder (2016) made exact best subset feasible for p in the hundreds and reported it beating the lasso. Hastie, Tibshirani & Tibshirani (2020) repeated the experiments across a wider SNR range and found the lasso better at low SNR, best subset better at high SNR and the relaxed lasso close to the best everywhere. Hybrid estimators (L0 plus L2 shrinkage, local combinatorial search) now aim to get both.",
        "refs": [
          {
            "label": "Bertsimas, King & Mazumder (2016) — Best subset selection via a modern optimization lens (Annals of Statistics 44(2))",
            "url": "https://doi.org/10.1214/15-AOS1388"
          },
          {
            "label": "Hastie, Tibshirani & Tibshirani (2020) — Best subset, forward stepwise or lasso? Analysis and recommendations based on extensive comparisons (Statistical Science 35(4))",
            "url": "https://doi.org/10.1214/19-STS733"
          },
          {
            "label": "Hazimeh & Mazumder (2020) — Fast best subset selection: coordinate descent and local combinatorial optimization algorithms (Operations Research 68(5))",
            "url": "https://doi.org/10.1287/opre.2019.1919"
          },
          {
            "label": "Mazumder, Radchenko & Dedieu (2023) — Subset selection with shrinkage: sparse linear modeling when the SNR is low (Operations Research 71(1))",
            "url": "https://doi.org/10.1287/opre.2022.2276"
          },
          {
            "label": "Meinshausen (2007) — Relaxed lasso (Computational Statistics & Data Analysis 52(1))",
            "url": "https://doi.org/10.1016/j.csda.2006.12.019"
          }
        ]
      },
      {
        "title": "Heavy-tailed robust regression with growing Huber thresholds",
        "why": "Adaptive Huber regression lets the threshold grow with n so that the estimator stays unbiased while keeping sub-Gaussian deviation bounds under only finite second moments. Gu, Kelly & Xiu (2020) use Huber loss as a default for return prediction. The open problem is choosing the threshold under the time-varying volatility and cross-sectional heteroskedasticity of returns.",
        "refs": [
          {
            "label": "Sun, Zhou & Fan (2020) — Adaptive Huber regression (JASA 115(529))",
            "url": "https://doi.org/10.1080/01621459.2018.1543124"
          },
          {
            "label": "Gu, Kelly & Xiu (2020) — Empirical asset pricing via machine learning (Review of Financial Studies 33(5))",
            "url": "https://doi.org/10.1093/rfs/hhaa009"
          },
          {
            "label": "Owen (2007) — A robust hybrid of lasso and ridge regression (Contemporary Mathematics 443)",
            "url": "https://doi.org/10.1090/conm/443/08555"
          },
          {
            "label": "Huber (1964) — Robust estimation of a location parameter (Annals of Mathematical Statistics 35(1))",
            "url": "https://doi.org/10.1214/aoms/1177703732"
          }
        ]
      },
      {
        "title": "Sparse precision and structured covariance for portfolios",
        "why": "The graphical lasso and its fast second-order solvers made sparse precision estimation routine; POET combines a factor structure with a sparse residual covariance. In finance the precision matrix has a direct meaning (hedge regressions), which makes sparsity priors interpretable, but the evidence that they beat good shrinkage or factor models out of sample is mixed.",
        "refs": [
          {
            "label": "Friedman, Hastie & Tibshirani (2008) — Sparse inverse covariance estimation with the graphical lasso (Biostatistics 9(3))",
            "url": "https://doi.org/10.1093/biostatistics/kxm045"
          },
          {
            "label": "Mazumder & Hastie (2012) — The graphical lasso: new insights and alternatives (Electronic Journal of Statistics 6)",
            "url": "https://doi.org/10.1214/12-EJS740"
          },
          {
            "label": "Hsieh, Sustik, Dhillon & Ravikumar (2014) — QUIC: quadratic approximation for sparse inverse covariance estimation (JMLR 15)",
            "url": "https://jmlr.org/papers/v15/hsieh14a.html"
          },
          {
            "label": "Fan, Liao & Mincheva (2013) — Large covariance estimation by thresholding principal orthogonal complements (JRSS B 75(4))",
            "url": "https://doi.org/10.1111/rssb.12016"
          },
          {
            "label": "Goto & Xu (2015) — Improving mean variance optimization through sparse hedging restrictions (JFQA 50(6))",
            "url": "https://doi.org/10.1017/S0022109015000526"
          },
          {
            "label": "Stevens (1998) — On the inverse of the covariance matrix in portfolio analysis (Journal of Finance 53(5))",
            "url": "https://doi.org/10.1111/0022-1082.00074"
          },
          {
            "label": "Ledoit & Wolf (2004) — A well-conditioned estimator for large-dimensional covariance matrices (JMVA 88(2))",
            "url": "https://doi.org/10.1016/S0047-259X(03)00096-4"
          }
        ]
      },
      {
        "title": "Robustness, regularization and distributionally robust optimization are one family",
        "why": "Worst-case least squares over a spectral ball is a norm-regularized fit (El Ghaoui & Lebret 1997). Wasserstein distributionally robust regression recovers square-root-lasso-type estimators. This gives a principled way to set regularization weights from an uncertainty radius, but the radius itself still has to be chosen from data.",
        "refs": [
          {
            "label": "El Ghaoui & Lebret (1997) — Robust solutions to least-squares problems with uncertain data (SIAM J. Matrix Anal. Appl. 18(4))",
            "url": "https://doi.org/10.1137/S0895479896298130"
          },
          {
            "label": "Mohajerin Esfahani & Kuhn (2018) — Data-driven distributionally robust optimization using the Wasserstein metric (Mathematical Programming 171)",
            "url": "https://doi.org/10.1007/s10107-017-1172-1"
          },
          {
            "label": "Blanchet, Kang & Murthy (2019) — Robust Wasserstein profile inference and applications to machine learning (Journal of Applied Probability 56(3))",
            "url": "https://doi.org/10.1017/jpr.2019.49"
          },
          {
            "label": "Belloni, Chernozhukov & Wang (2011) — Square-root lasso: pivotal recovery of sparse signals via conic programming (Biometrika 98(4))",
            "url": "https://doi.org/10.1093/biomet/asr043"
          }
        ]
      },
      {
        "title": "Shrinkage in the cross-section of expected returns",
        "why": "With hundreds of characteristics, the question of sparse versus dense shrinkage is empirical. Kozak, Nagel & Santosh (2020) argue for L2-type shrinkage in characteristic space (sparsity only in principal components); Freyberger, Neuhierl & Weber (2020) use an adaptive group lasso and find a smaller set of characteristics with incremental information. The two results disagree on what sparsity means in asset pricing.",
        "refs": [
          {
            "label": "Kozak, Nagel & Santosh (2020) — Shrinking the cross-section (Journal of Financial Economics 135(2))",
            "url": "https://doi.org/10.1016/j.jfineco.2019.06.008"
          },
          {
            "label": "Freyberger, Neuhierl & Weber (2020) — Dissecting characteristics nonparametrically (Review of Financial Studies 33(5))",
            "url": "https://doi.org/10.1093/rfs/hhz123"
          },
          {
            "label": "Gu, Kelly & Xiu (2020) — Empirical asset pricing via machine learning (Review of Financial Studies 33(5))",
            "url": "https://doi.org/10.1093/rfs/hhaa009"
          }
        ]
      }
    ],
    "openQuestions": [
      "At the SNR typical of daily or monthly alpha combination (population R² around 0.1–1%), is there any regime where best subset or L0-based selection beats ridge or relaxed lasso out of sample, after accounting for the time spent tuning?",
      "How should the Huber threshold scale with volatility regimes: a global threshold on standardized residuals, a per-asset threshold, or a time-varying one, and what does each do to the bias of estimated betas in crashes?",
      "Does sparsity in the precision matrix of stock returns survive after removing a factor structure, or is it an artefact of omitted factors?",
      "Can the radius of a Wasserstein or ellipsoidal uncertainty set for expected returns be calibrated from the sampling error of alpha forecasts, so that robust portfolio construction stops being a hand-tuned penalty?",
      "Is there a convex formulation of a factor-structured covariance estimate (low rank plus diagonal) that is tight enough to be useful, or is the nonconvex factor-analysis likelihood unavoidable?"
    ],
    "brainstorm": [
      "Take your current alpha-combination regression and plot the full lasso and ridge paths with out-of-sample IC on the y-axis; where on the path does your production choice sit, and how flat is the curve around it?",
      "List the penalty you implicitly use for each estimation step in your stack (betas, residual vol, signal weights). Which ones are quadratic only by default, and what would Huber or l1 change?",
      "Write the precision matrix of your risk model and read one row as a hedge regression. Are the large coefficients economically plausible hedges?",
      "Design an experiment-design style allocation of your next quarter of paper-trading capacity across signal variants: what is the parameter vector you are trying to learn, and which scalarization (D, E, A) matches the decision you will make?",
      "Pick one robust-optimization penalty in your portfolio construction and derive the uncertainty set it corresponds to. Is that set a reasonable description of your alpha error?"
    ]
  }
}
);
