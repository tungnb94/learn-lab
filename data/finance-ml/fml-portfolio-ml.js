LAB.module("finance-ml", {
  "id": "fml-portfolio-ml",
  "order": 8,
  "title": "ML for Portfolio Construction: Denoising, HRP and NCO",
  "summary": "Use random matrix theory to separate signal from noise in correlation matrices, then allocate with Hierarchical Risk Parity and Nested Clustered Optimization; learn how these relate to Ledoit–Wolf shrinkage and when they fail.",
  "sources": [
    {
      "label": "López de Prado (2020), Machine Learning for Asset Managers, ch. 2, 4, 7 (Cambridge Elements)",
      "url": "https://doi.org/10.1017/9781108883658"
    },
    {
      "label": "López de Prado (2018), Advances in Financial Machine Learning, ch. 16 (Wiley)",
      "url": ""
    },
    {
      "label": "López de Prado (2016) — Building Diversified Portfolios that Outperform Out-of-Sample, Journal of Portfolio Management 42(4)",
      "url": "https://papers.ssrn.com/abstract=2708678"
    },
    {
      "label": "López de Prado (2019) — A Robust Estimator of the Efficient Frontier (NCO), SSRN",
      "url": "https://papers.ssrn.com/abstract=3469961"
    },
    {
      "label": "Ledoit & Wolf (2004) — A Well-Conditioned Estimator for Large-Dimensional Covariance Matrices, Journal of Multivariate Analysis 88(2)",
      "url": "https://doi.org/10.1016/S0047-259X(03)00096-4"
    }
  ],
  "lessons": [
    {
      "id": "fml-portfolio-ml-1",
      "title": "Covariance Noise, Marchenko–Pastur, Denoising and Detoning",
      "minutes": 30,
      "html": "<h3>1. Why sample covariance matrices break optimisers</h3>\n<p>Mean-variance weights take the form $w^*\\propto \\Sigma^{-1}\\mu$ (maximum Sharpe) or $w^*=\\Sigma^{-1}\\mathbf{1}/(\\mathbf{1}'\\Sigma^{-1}\\mathbf{1})$ (minimum variance). Writing $\\Sigma = W\\Lambda W'$, the inverse is $\\sum_i \\lambda_i^{-1} w_i w_i'$: the optimiser places the most weight on the directions with the <em>smallest</em> eigenvalues. Those are precisely the eigenvalues that estimation noise drags toward zero. With $N$ assets and $T$ observations, the sample covariance has $N(N+1)/2$ parameters estimated from $NT$ numbers; when $N/T$ is not small the smallest sample eigenvalues are systematically too small and the largest too large, the condition number explodes, and the optimiser bets heavily on spurious low-variance long/short combinations. This is \"Markowitz's curse\" in López de Prado's terminology: the more correlated the assets (the more you need diversification), the worse the conditioning, and the less stable the solution.</p>\n<p>Two distinct problems are mixed here and should be kept apart: <strong>noise</strong> (finite-sample error in the estimate) and <strong>signal structure</strong> (a dominant market mode and clusters, which make the true matrix ill-conditioned even without noise). Denoising targets the first; clustering-based allocation (next lesson) targets the second.</p>\n\n<h3>2. The Marchenko–Pastur benchmark</h3>\n<p>Let $X\\in\\mathbb{R}^{T\\times N}$ have IID entries with mean zero and variance $\\sigma^2$, and let $q=T/N$ (we follow MLAM's convention; many RMT texts use $N/T$). As $N,T\\to\\infty$ with $q$ fixed, the empirical eigenvalue distribution of $C=X'X/T$ converges to the Marchenko–Pastur density</p>\n$$f(\\lambda)=\\frac{q}{2\\pi\\sigma^2\\lambda}\\sqrt{(\\lambda_+-\\lambda)(\\lambda-\\lambda_-)},\\qquad \\lambda\\in[\\lambda_-,\\lambda_+],\\qquad \\lambda_\\pm=\\sigma^2\\left(1\\pm\\sqrt{1/q}\\right)^2.$$\n<p>For $q=2$ (e.g. 500 stocks, 1000 days) pure noise produces eigenvalues spread over roughly $[0.09, 2.91]$ even though every true eigenvalue is 1. Eigenvalues of an empirical correlation matrix that lie inside this band are statistically indistinguishable from noise; those above $\\lambda_+$ carry signal. Laloux, Cizeau, Bouchaud and Potters (1999) found that for S&amp;P 500 stocks the overwhelming majority of eigenvalues sit inside the band, with a market mode and a handful of sector-like modes outside it.</p>\n\n<h3>3. Fitting MP to real eigenvalues</h3>\n<p>In real data the bulk is not centred at $\\sigma^2=1$: the signal eigenvalues absorb part of the trace, so the noise variance is $\\sigma^2&lt;1$ for a correlation matrix. The MLAM recipe fits $\\sigma^2$ by matching densities:</p>\n<ol>\n<li>Compute the eigenvalues of the empirical correlation matrix.</li>\n<li>Fit a kernel density estimate (Gaussian kernel, bandwidth around 0.01–0.25 depending on $N$) to the eigenvalues.</li>\n<li>For candidate $\\sigma^2$, evaluate the MP density at the same grid points and minimise the sum of squared differences.</li>\n<li>Set $\\lambda_+=\\hat\\sigma^2(1+\\sqrt{1/q})^2$ and let $K=\\#\\{\\lambda_i&gt;\\lambda_+\\}$ be the number of signal factors.</li>\n</ol>\n<p>Equity returns are not IID (volatility clustering, heavy tails, cross-sectional heteroskedasticity), so the fitted band is an approximation. In practice standardise returns (or use correlations of vol-scaled returns), check the fit visually, and treat $K$ as a robust count rather than an exact one; small changes in bandwidth should not move $K$ by more than one or two.</p>\n\n<pre><code class=\"language-python\">import numpy as np\nfrom scipy.optimize import minimize_scalar\nfrom sklearn.neighbors import KernelDensity\n\ndef mp_pdf(var, q, pts=1000):\n    lmin, lmax = var * (1 - (1/q)**0.5)**2, var * (1 + (1/q)**0.5)**2\n    x = np.linspace(lmin, lmax, pts)\n    pdf = q / (2 * np.pi * var * x) * np.sqrt((lmax - x) * (x - lmin))\n    return x, pdf\n\ndef kde_at(obs, x, bw=0.01):\n    kd = KernelDensity(kernel=\"gaussian\", bandwidth=bw).fit(obs.reshape(-1, 1))\n    return np.exp(kd.score_samples(x.reshape(-1, 1)))\n\ndef fit_mp(evals, q, bw=0.01):\n    def sse(var):\n        x, pdf = mp_pdf(var, q)\n        return ((kde_at(evals, x, bw) - pdf) ** 2).sum()\n    var = minimize_scalar(sse, bounds=(1e-5, 1 - 1e-5), method=\"bounded\").x\n    return var, var * (1 + (1/q)**0.5)**2          # sigma^2, lambda_plus\n\ndef denoise_constant(corr, n_facts):\n    evals, evecs = np.linalg.eigh(corr)\n    idx = evals.argsort()[::-1]; evals, evecs = evals[idx], evecs[:, idx]\n    ev = evals.copy()\n    ev[n_facts:] = ev[n_facts:].mean()                 # preserve trace\n    c = evecs @ np.diag(ev) @ evecs.T\n    d = np.sqrt(np.diag(c))\n    return c / np.outer(d, d)                          # back to unit diagonal\n</code></pre>\n\n<h3>4. Denoising: constant residual eigenvalue and targeted shrinkage</h3>\n<p><strong>Constant residual eigenvalue.</strong> Keep the $K$ signal eigenpairs and replace the $N-K$ noise eigenvalues with their average, which preserves the trace:</p>\n$$\\tilde\\lambda_i=\\begin{cases}\\lambda_i & i\\le K\\\\ \\frac{1}{N-K}\\sum_{j>K}\\lambda_j & i&gt;K\\end{cases},\\qquad \\tilde C_1=W\\tilde\\Lambda W',\\qquad \\tilde C=\\operatorname{diag}(\\tilde C_1)^{-1/2}\\,\\tilde C_1\\,\\operatorname{diag}(\\tilde C_1)^{-1/2}.$$\n<p>The noise subspace becomes isotropic: the optimiser can no longer find \"cheap\" directions within it, and the condition number falls dramatically. The rescaling step is needed because flattening eigenvalues perturbs the diagonal.</p>\n<p><strong>Targeted shrinkage.</strong> Split the eigen-decomposition into signal ($L$) and noise ($R$) parts and shrink only the noise part toward its own diagonal:</p>\n$$\\tilde C = W_L\\Lambda_L W_L' + \\alpha\\, W_R\\Lambda_R W_R' + (1-\\alpha)\\operatorname{diag}\\left(W_R\\Lambda_R W_R'\\right),\\qquad \\alpha\\in[0,1].$$\n<p>Unlike Ledoit–Wolf, which shrinks the whole matrix (signal included) toward a target, this leaves the signal eigenvectors and eigenvalues untouched.</p>\n<p>The MLAM ch. 2 Monte Carlo is the canonical evidence: simulate a block-correlated \"true\" covariance, draw finite samples, and compare the root-mean-square error of the estimated minimum-variance and maximum-Sharpe weights against the true optimal weights. Denoising reduces the weight RMSE substantially, and much more than Ledoit–Wolf shrinkage alone for the maximum-Sharpe portfolio, because the error in $\\Sigma^{-1}\\mu$ is dominated by the noise eigen-directions.</p>\n\n<h3>5. Detoning</h3>\n<p>Equity correlation matrices are dominated by a market mode: the first eigenvector is nearly equal-weighted and $\\lambda_1$ often explains 30–50% of the trace. This \"tone\" hides the cluster structure. <strong>Detoning</strong> removes the top $m$ components (usually $m=1$) after denoising and renormalises:</p>\n$$C_{\\text{detoned}} \\propto \\tilde C - \\sum_{i=1}^{m} w_i\\tilde\\lambda_i w_i',\\quad\\text{rescaled to unit diagonal}.$$\n<p>The result is singular (rank $N-m$), so it is a tool for <em>clustering</em> and for studying sector or style structure, not for direct inversion. A typical pipeline denoises for optimisation and detones for clustering.</p>\n\n<h3>6. Relation to Ledoit–Wolf and nonlinear shrinkage</h3>\n<p>Ledoit and Wolf (2004) propose $\\hat\\Sigma=\\delta\\,\\bar\\lambda I+(1-\\delta)S$ with an analytically estimated optimal intensity $\\delta$ under Frobenius loss. In the eigenbasis this is a <em>linear</em> map $\\lambda_i\\mapsto\\delta\\bar\\lambda+(1-\\delta)\\lambda_i$ with unchanged eigenvectors. Constant-residual denoising is a <em>nonlinear, piecewise</em> eigenvalue map (identity above $\\lambda_+$, constant below) also with unchanged eigenvectors. Both belong to the family of rotation-equivariant estimators; the optimal member of that family under a given loss is what nonlinear shrinkage (Ledoit and Wolf 2017, 2020) and the rotationally invariant estimators of Bun, Bouchaud and Potters (2017) compute. Viewed this way, MP clipping is a simple, interpretable approximation to optimal nonlinear shrinkage. Two caveats: none of these methods fix noisy <em>eigenvectors</em>, which matter for maximum-Sharpe portfolios; and structured alternatives (fundamental factor models, sector blocks) bring prior information that pure RMT does not.</p>\n\n<div class=\"callout warn\"><strong>Pitfall — denoising correlations but not volatilities, or using look-ahead.</strong> Denoise the <em>correlation</em> matrix and then recombine with volatilities, $\\tilde\\Sigma = D\\tilde C D$; denoising the covariance directly lets high-volatility names dominate the spectrum. And fit $\\sigma^2$, $K$ and $\\alpha$ on the estimation window only: choosing $K$ by peeking at out-of-sample portfolio variance is a quiet form of backtest overfitting.</div>"
    },
    {
      "id": "fml-portfolio-ml-2",
      "title": "Hierarchical Risk Parity, NCO and the Monte Carlo Evidence",
      "minutes": 32,
      "html": "<h3>1. Hierarchical Risk Parity: the idea</h3>\n<p>HRP (López de Prado 2016; AFML ch. 16) replaces the inversion of $\\Sigma$ by a top-down allocation along a hierarchy learned from the correlation matrix. It never inverts a full matrix, so it works even when $\\Sigma$ is singular, and it limits how far noise can propagate: an estimation error between two assets only affects weights within the branch where they meet. The algorithm has three stages.</p>\n\n<h4>Stage 1 — tree clustering</h4>\n<p>Convert correlations to the metric $d_{ij}=\\sqrt{\\tfrac12(1-\\rho_{ij})}$. The original paper then computes a second-order distance between columns, $\\tilde d_{ij}=\\lVert d_{\\cdot i}-d_{\\cdot j}\\rVert_2$, so that two assets are close if they relate similarly to <em>all</em> other assets, and applies single-linkage agglomerative clustering to obtain a dendrogram (linkage matrix).</p>\n\n<h4>Stage 2 — quasi-diagonalisation</h4>\n<p>Reorder the rows and columns of $\\Sigma$ by the leaf order of the dendrogram. Similar assets become adjacent and the large covariances concentrate along the diagonal. No information is lost; this is a permutation.</p>\n\n<h4>Stage 3 — recursive bisection</h4>\n<p>Start with all assets in one list with weight 1. Repeatedly split each list into two halves $L_1,L_2$ (by the quasi-diagonal order). For each half compute an inverse-variance portfolio $\\tilde w_j\\propto 1/\\operatorname{diag}(\\Sigma_{L_j})$ and its variance $V_j=\\tilde w_j'\\Sigma_{L_j}\\tilde w_j$. Allocate between the halves by</p>\n$$\\alpha=1-\\frac{V_1}{V_1+V_2},\\qquad w_{L_1}\\leftarrow\\alpha\\,w_{L_1},\\qquad w_{L_2}\\leftarrow(1-\\alpha)\\,w_{L_2},$$\n<p>and recurse until every list has a single asset. Weights are positive and sum to one by construction.</p>\n\n<pre><code class=\"language-python\">import numpy as np\nimport scipy.cluster.hierarchy as sch\nfrom scipy.spatial.distance import squareform\n\ndef ivp(cov):\n    w = 1.0 / np.diag(cov)\n    return w / w.sum()\n\ndef cluster_var(cov, items):\n    c = cov[np.ix_(items, items)]\n    w = ivp(c)\n    return w @ c @ w\n\ndef hrp(cov):\n    sd = np.sqrt(np.diag(cov))\n    corr = cov / np.outer(sd, sd)\n    dist = np.sqrt(np.clip(0.5 * (1 - corr), 0, None))\n    np.fill_diagonal(dist, 0.0)\n    link = sch.linkage(squareform(dist, checks=False), method=\"single\")\n    order = list(sch.leaves_list(link))            # quasi-diagonal order\n    w = np.ones(len(order))\n    stack = [order]\n    while stack:\n        items = stack.pop()\n        if len(items) &lt; 2:\n            continue\n        half = len(items) // 2\n        left, right = items[:half], items[half:]\n        v1, v2 = cluster_var(cov, left), cluster_var(cov, right)\n        a = 1 - v1 / (v1 + v2)\n        w[left] *= a\n        w[right] *= 1 - a\n        stack += [left, right]\n    return w\n</code></pre>\n<p>(This sketch clusters on $d$ directly, a common simplification; the original uses $\\tilde d$. Compare both in the project.)</p>\n\n<h3>2. Nested Clustered Optimization</h3>\n<p>HRP sidesteps instability by discarding the optimiser. NCO (López de Prado 2019; MLAM ch. 7) keeps the optimiser but quarantines the instability caused by clusters:</p>\n<ol>\n<li>Denoise the covariance (lesson 1) and cluster the correlation matrix into $K$ clusters, ideally with ONC (k-means on the correlation-distance matrix with silhouette-based selection of $K$).</li>\n<li><strong>Intra-cluster:</strong> for each cluster $k$, solve the chosen problem (minimum variance or maximum Sharpe) on $\\Sigma_{kk}$ to get weights $w^{(k)}$; stack them into an $N\\times K$ matrix $W_{\\text{in}}$.</li>\n<li><strong>Reduce:</strong> each cluster becomes a synthetic asset. The reduced covariance is $\\Sigma_{\\text{red}}=W_{\\text{in}}'\\Sigma W_{\\text{in}}$ (and $\\mu_{\\text{red}}=W_{\\text{in}}'\\mu$).</li>\n<li><strong>Inter-cluster:</strong> solve the same problem on $\\Sigma_{\\text{red}}$ to get $w_{\\text{out}}\\in\\mathbb{R}^K$.</li>\n<li><strong>Combine:</strong> $w=W_{\\text{in}}\\,w_{\\text{out}}$.</li>\n</ol>\n<p>Why it helps: the condition number of a block-structured correlation matrix is driven largely by high intra-cluster correlation. Each intra-cluster problem has small dimension, and the reduced problem involves near-uncorrelated synthetic assets, so both sub-problems are well conditioned. NCO is a wrapper: any optimiser (including one with constraints) can sit inside it.</p>\n\n<h3>3. Monte Carlo evidence</h3>\n<p>Both HRP and NCO were justified by controlled simulations rather than by single historical backtests, which is the right design for comparing estimators:</p>\n<ul>\n<li><strong>AFML ch. 16 (HRP):</strong> simulate correlated returns with common and idiosyncratic shocks plus random jumps; estimate weights on a rolling in-sample window, hold out of sample, repeat many times; compare out-of-sample portfolio variance for the critical-line minimum-variance solution, inverse-variance and HRP. HRP's out-of-sample variance was substantially below the quadratic optimiser's and also below inverse-variance in that setting.</li>\n<li><strong>MLAM ch. 7 (NCO):</strong> draw a \"true\" block covariance and mean vector, simulate $T$ observations, estimate weights with Markowitz and with NCO (each with and without denoising), and measure RMSE against the true optimal weights. NCO reduces the RMSE versus plain Markowitz, especially for maximum-Sharpe allocations, and combining it with denoising helps further.</li>\n</ul>\n<p>Design lessons: compare estimators on the <em>same</em> simulated paths, measure distance to the known truth (weight RMSE) as well as realised out-of-sample variance or Sharpe, and report dispersion across simulations, not just means.</p>\n\n<h3>4. Relation to Ledoit–Wolf shrinkage</h3>\n<p>A fair benchmark for HRP or NCO is <em>not</em> sample-covariance Markowitz but minimum variance with a Ledoit–Wolf (linear or nonlinear) estimator. Shrinkage attacks the eigenvalue dispersion directly; HRP and NCO attack it through structure. They are complementary: one can feed a shrunk or denoised covariance into HRP or NCO. Empirically, once a good covariance estimator is used, the variance advantage of HRP over minimum variance tends to shrink and can reverse when $T\\gg N$; the robustness advantage (fewer extreme weights, lower turnover) is more persistent.</p>\n\n<h3>5. When HRP underperforms</h3>\n<ul>\n<li><strong>Well-estimated covariance.</strong> With long samples relative to $N$, the minimum-variance optimiser's estimation error is small and HRP's heuristic allocation leaves variance on the table.</li>\n<li><strong>Bisection ignores the tree.</strong> The original recursive bisection splits the ordered list in halves, not at dendrogram nodes, so clusters can be cut arbitrarily. Variants such as HCAA / HERC (Raffinot 2017) split along the tree.</li>\n<li><strong>Single linkage chaining.</strong> Single linkage produces elongated, chained clusters; average or Ward linkage often yields more stable hierarchies.</li>\n<li><strong>Within-cluster inverse-variance ignores correlations</strong> and the allocation is risk-only: HRP has no view on expected returns, so it can lag when return signals are informative.</li>\n<li><strong>Low-volatility concentration.</strong> Like inverse-variance, HRP tilts toward low-vol assets; in asset classes with very different volatilities (bonds vs. equities) this can mean heavy fixed-income concentration and leverage-dependence.</li>\n<li><strong>Structural instability.</strong> If the hierarchy itself changes from window to window, weights can jump. Monitor dendrogram stability (e.g. cophenetic correlation between consecutive windows).</li>\n</ul>\n\n<div class=\"callout warn\"><strong>Pitfall — comparing a robust heuristic against a strawman.</strong> Many published \"HRP beats Markowitz\" results use unconstrained sample-covariance maximum Sharpe as the opponent and a single historical path as evidence. Always include inverse-variance, Ledoit–Wolf minimum variance and an equal-weight portfolio, use identical rebalancing and costs, and treat the number of method variants you tried (linkages, distances, lookbacks) as trials for the deflation tools of the previous module.</div>"
    }
  ],
  "cheatsheet": [
    {
      "term": "Inverse in the eigenbasis",
      "formula": "\\Sigma^{-1}=\\sum_{i=1}^{N}\\lambda_i^{-1}w_iw_i'",
      "note": "Smallest (noisiest) eigenvalues dominate optimal weights."
    },
    {
      "term": "Marchenko–Pastur edges (q = T/N)",
      "formula": "\\lambda_\\pm=\\sigma^2\\left(1\\pm\\sqrt{1/q}\\right)^2",
      "note": "Eigenvalues inside the band are consistent with noise."
    },
    {
      "term": "Marchenko–Pastur density",
      "formula": "f(\\lambda)=\\frac{q}{2\\pi\\sigma^2\\lambda}\\sqrt{(\\lambda_+-\\lambda)(\\lambda-\\lambda_-)}",
      "note": "Fit sigma^2 by matching a KDE of empirical eigenvalues."
    },
    {
      "term": "Number of signal factors",
      "formula": "K=\\#\\{i:\\lambda_i>\\lambda_+\\}",
      "note": "Use the fitted sigma^2, not 1."
    },
    {
      "term": "Constant residual eigenvalue",
      "formula": "\\tilde\\lambda_{i>K}=\\frac{1}{N-K}\\sum_{j>K}\\lambda_j",
      "note": "Trace-preserving; rescale result to unit diagonal."
    },
    {
      "term": "Targeted shrinkage",
      "formula": "\\tilde C=W_L\\Lambda_LW_L'+\\alpha W_R\\Lambda_RW_R'+(1-\\alpha)\\operatorname{diag}(W_R\\Lambda_RW_R')",
      "note": "Shrinks only the noise subspace."
    },
    {
      "term": "Detoning",
      "formula": "C_{\\text{det}}\\propto\\tilde C-\\sum_{i\\le m}\\tilde\\lambda_iw_iw_i'",
      "note": "Removes market mode; singular, use for clustering."
    },
    {
      "term": "Ledoit–Wolf linear shrinkage",
      "formula": "\\hat\\Sigma=\\delta\\,\\bar\\lambda I+(1-\\delta)S",
      "note": "Linear eigenvalue map with optimal delta under Frobenius loss."
    },
    {
      "term": "Correlation distance",
      "formula": "d_{ij}=\\sqrt{\\tfrac12(1-\\rho_{ij})}",
      "note": "Metric on correlations; HRP also uses column distances of d."
    },
    {
      "term": "HRP split factor",
      "formula": "\\alpha=1-\\frac{V_1}{V_1+V_2},\\ V_j=\\tilde w_j'\\Sigma_{L_j}\\tilde w_j",
      "note": "Inverse-variance weights within each half."
    },
    {
      "term": "Inverse-variance portfolio",
      "formula": "w_i=\\frac{1/\\sigma_i^2}{\\sum_j 1/\\sigma_j^2}",
      "note": "Building block of HRP; optimal if correlations are zero."
    },
    {
      "term": "NCO reduced covariance",
      "formula": "\\Sigma_{\\text{red}}=W_{\\text{in}}'\\Sigma W_{\\text{in}}",
      "note": "Clusters become synthetic assets."
    },
    {
      "term": "NCO final weights",
      "formula": "w=W_{\\text{in}}\\,w_{\\text{out}}",
      "note": "Intra-cluster weights times inter-cluster weights."
    },
    {
      "term": "Weight RMSE (Monte Carlo)",
      "formula": "\\mathrm{RMSE}=\\sqrt{\\frac1N\\sum_i(\\hat w_i-w_i^*)^2}",
      "note": "Distance to the known true optimum in simulation."
    }
  ],
  "flashcards": [
    {
      "q": "Why do small sample eigenvalues cause unstable mean-variance weights?",
      "a": "The inverse weights directions by $1/\\lambda_i$; noise biases the smallest eigenvalues downward, so the optimiser takes large positions in spurious low-variance combinations."
    },
    {
      "q": "Give the MP upper edge for a correlation matrix with $T=1000$, $N=500$ and $\\sigma^2=1$.",
      "a": "$q=2$, $\\lambda_+=(1+\\sqrt{0.5})^2\\approx 2.91$."
    },
    {
      "q": "Why is the fitted $\\sigma^2$ of the MP bulk below 1 for real correlation matrices?",
      "a": "The trace is $N$; the signal eigenvalues (market, sectors) absorb part of it, leaving less variance for the noise bulk."
    },
    {
      "q": "What does the constant residual eigenvalue method preserve, and what extra step does it need?",
      "a": "It preserves the trace and the signal eigenpairs; afterwards the matrix must be rescaled to unit diagonal."
    },
    {
      "q": "How does targeted shrinkage differ from Ledoit–Wolf?",
      "a": "It shrinks only the noise eigen-subspace toward its diagonal, leaving signal components untouched; Ledoit–Wolf shrinks the whole matrix toward a target."
    },
    {
      "q": "Why is a detoned correlation matrix not used directly in an optimiser?",
      "a": "Removing the top $m$ components leaves a rank-deficient (singular) matrix; it is meant for clustering and structure analysis."
    },
    {
      "q": "In what sense is MP clipping related to nonlinear shrinkage?",
      "a": "Both keep sample eigenvectors and apply a (nonlinear) map to eigenvalues; clipping is a simple piecewise approximation to the optimal rotation-equivariant map."
    },
    {
      "q": "List the three stages of HRP.",
      "a": "Tree clustering on a correlation distance; quasi-diagonalisation (reorder by dendrogram leaves); recursive bisection with inverse-variance sub-portfolios and split $\\alpha=1-V_1/(V_1+V_2)$."
    },
    {
      "q": "Why can HRP handle a singular covariance matrix?",
      "a": "It never inverts the full matrix; it uses only diagonal elements and quadratic forms on sub-blocks."
    },
    {
      "q": "What does NCO do to quarantine instability?",
      "a": "Optimises within clusters (small, well-conditioned problems), reduces each cluster to a synthetic asset, then optimises across nearly uncorrelated clusters; $w=W_{\\text{in}}w_{\\text{out}}$."
    },
    {
      "q": "What is the right benchmark when claiming HRP is superior?",
      "a": "Inverse-variance and minimum variance with a shrinkage estimator (e.g. Ledoit–Wolf), not sample-covariance maximum Sharpe; same rebalancing, costs and periods."
    },
    {
      "q": "Name a structural weakness of the original HRP bisection.",
      "a": "It splits the ordered list into halves rather than at dendrogram nodes, so it can cut through natural clusters (addressed by HCAA/HERC variants)."
    },
    {
      "q": "Why denoise correlations rather than covariances?",
      "a": "Volatility differences dominate the covariance spectrum; denoise the correlation and recombine as $D\\tilde CD$."
    }
  ],
  "projects": [
    {
      "id": "fml-portfolio-ml-p1",
      "title": "Marchenko–Pastur Denoising on Industry Returns plus a Known-Truth Monte Carlo",
      "level": "core",
      "hours": "8–12",
      "goal": "Implement MP fitting, constant-residual denoising, targeted shrinkage and detoning; apply them to the Ken French 49 industry daily returns; and quantify the benefit on weights with a Monte Carlo from a known block covariance, comparing against Ledoit–Wolf.",
      "data": "Ken French Data Library, 49 Industry Portfolios (daily, value-weighted): https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html. Industry portfolios avoid single-stock survivorship issues but N = 49 is small; optionally add a yfinance universe of current S&amp;P 500 members, noting the severe survivorship bias of a current-constituent list. Use only public or personal data; never employer data, code or vendor feeds.",
      "steps": [
        "Write mp_pdf, fit_mp (KDE + SSE minimisation), denoise_constant, denoise_targeted and detone; unit-test mp_pdf integrates to 1 within 1%.",
        "Pure-noise check: simulate T x N Gaussian returns for (N, T) in {(100, 500), (200, 1000), (500, 1000)}; fit sigma^2 and lambda_plus.",
        "Empirical: on rolling 2-year windows of 49-industry daily returns (vol-standardised), fit MP, record K and the share of variance explained by signal eigenvalues; plot K through time.",
        "Monte Carlo: build a true correlation with 5–10 blocks (intra-block rho 0.5, plus a market factor), random volatilities; draw T = 2N observations 500 times; compute min-variance and max-Sharpe weights from (a) sample, (b) Ledoit–Wolf, (c) constant-residual denoised, (d) targeted shrinkage; report weight RMSE versus true weights.",
        "Detone the denoised industry correlation and show a clustered heatmap before and after detoning."
      ],
      "deliverables": [
        "Python module with tested functions",
        "Notebook with noise checks, rolling-K plot, Monte Carlo table",
        "Before/after detoning heatmaps",
        "Short memo interpreting K and the RMSE results"
      ],
      "acceptance": [
        "Pure-noise cases: fitted sigma^2 within 0.05 of 1 and at most 1% of eigenvalues above the fitted lambda_plus.",
        "Monte Carlo: denoised minimum-variance weight RMSE is at least 30% below the sample-covariance RMSE for N = 100, T = 200 (report the exact figure with a 95% interval over the 500 runs).",
        "Results table includes Ledoit–Wolf (sklearn.covariance.LedoitWolf) and states for which portfolio type denoising beats it.",
        "K varies by at most 2 across KDE bandwidths in {0.01, 0.05, 0.1} for the full-sample industry matrix."
      ],
      "extensions": [
        "Add Ledoit–Wolf (2020) analytical nonlinear shrinkage and compare its eigenvalue map with MP clipping on the same plot.",
        "Use exponentially weighted returns and check how effective T changes the MP edge."
      ]
    },
    {
      "id": "fml-portfolio-ml-p2",
      "title": "HRP vs NCO vs Markowitz: Monte Carlo and Walk-Forward Horse Race",
      "level": "stretch",
      "hours": "15–25",
      "goal": "Implement HRP (with single, average and Ward linkage and the original column-distance step) and NCO (with ONC clustering), and compare them against equal weight, inverse-variance, sample minimum variance and Ledoit–Wolf minimum variance, first in an AFML-style Monte Carlo and then in a walk-forward backtest on industry and anomaly portfolios, with deflation of the method search.",
      "data": "Ken French 49 Industry Portfolios (daily) and/or Open Source Asset Pricing long-short predictor returns (https://www.openassetpricing.com/) as a set of ~200 \"assets\" with low average correlation. Optional: a yfinance ETF universe (sector/country ETFs), noting ETF inception dates and survivorship. Use only public or personal data; do not use employer data or infrastructure.",
      "steps": [
        "Monte Carlo (AFML ch. 16 style): N = 10–50 assets with common, cluster and idiosyncratic shocks plus random jumps; 260-day estimation window, 22-day out-of-sample hold; 1,000 repetitions; record OOS variance and weight concentration for each method.",
        "Repeat with T/N varied from 2 to 20 to locate where minimum variance with Ledoit–Wolf overtakes HRP.",
        "Implement NCO for minimum variance and maximum Sharpe (with a noisy mu); measure weight RMSE versus true weights following MLAM ch. 7.",
        "Walk-forward on real data: monthly rebalancing, 1–3 year lookback, 10 bp one-way costs; report OOS volatility, Sharpe, max drawdown, turnover and effective number of bets.",
        "Count every method/parameter variant tried and compute the DSR of the best performer; run CSCV PBO across variants."
      ],
      "deliverables": [
        "Reusable library (hrp.py, nco.py, onc.py) with tests",
        "Monte Carlo report with distributions, not just means",
        "Walk-forward results table and turnover plot",
        "Discussion of when HRP underperforms, backed by the T/N sweep"
      ],
      "acceptance": [
        "HRP weights are non-negative, sum to 1 within 1e-10, and are invariant to permuting the input asset order (max abs difference < 1e-10).",
        "NCO with K = 1 cluster reproduces the plain optimiser's weights within 1e-8.",
        "Monte Carlo at T/N = 26 (N = 10, T = 260): reports OOS variance ratios HRP/IVP and HRP/sample-min-var with bootstrap 95% intervals; the T/N sweep identifies a crossover point (or documents that none exists) with intervals.",
        "Walk-forward table includes all six methods with identical costs and rebalancing dates, and the DSR of the winning method uses the logged number of variants."
      ],
      "extensions": [
        "Add HERC / HCAA (split at dendrogram nodes) and compare with original bisection.",
        "Feed denoised or nonlinear-shrinkage covariances into HRP and NCO and test whether the gains are additive.",
        "Measure dendrogram stability across windows via cophenetic correlation and relate it to turnover."
      ]
    }
  ],
  "frontier": {
    "asOf": "2026-11",
    "summary": "Covariance estimation for allocation has converged on two complementary ideas: rotation-equivariant eigenvalue cleaning (RMT clipping, nonlinear shrinkage, RIE) for noise, and hierarchical or clustered structure (HRP, HERC, NCO) for robustness. Current work focuses on theoretical justification of hierarchical methods, on shrinkage tuned directly to portfolio objectives rather than to matrix loss, and on ML-driven factor models that deliver both expected returns and covariances at scale.",
    "threads": [
      {
        "title": "RMT cleaning and nonlinear shrinkage",
        "why": "From the original finding that most of an equity correlation spectrum is noise to optimal rotationally invariant estimators and fast analytical nonlinear shrinkage, the field now has principled eigenvalue maps for large N. Open issues are non-stationarity, heavy tails and the unaddressed noise in eigenvectors.",
        "refs": [
          {
            "label": "Laloux, Cizeau, Bouchaud & Potters (1999) — Noise Dressing of Financial Correlation Matrices",
            "url": "https://doi.org/10.1103/PhysRevLett.83.1467"
          },
          {
            "label": "Bun, Bouchaud & Potters (2017) — Cleaning Large Correlation Matrices: Tools from Random Matrix Theory",
            "url": "https://arxiv.org/abs/1610.08104"
          },
          {
            "label": "Ledoit & Wolf (2020) — Analytical Nonlinear Shrinkage of Large-Dimensional Covariance Matrices",
            "url": "https://doi.org/10.1214/19-AOS1921"
          }
        ]
      },
      {
        "title": "Theory and variants of hierarchical allocation",
        "why": "HRP was introduced with Monte Carlo evidence; later work proposes tree-respecting variants (HCAA/HERC) and, more recently, analytical results on the noise in HRP weights compared with Markowitz weights, plus construction criteria for choosing clusters. This is moving HRP from heuristic toward an estimator with known error properties.",
        "refs": [
          {
            "label": "López de Prado (2016) — Building Diversified Portfolios that Outperform Out-of-Sample",
            "url": "https://doi.org/10.3905/jpm.2016.42.4.059"
          },
          {
            "label": "Raffinot (2017) — Hierarchical Clustering-Based Asset Allocation",
            "url": "https://doi.org/10.3905/jpm.2018.44.2.089"
          },
          {
            "label": "Antonov, Lipton & López de Prado (2024) — Overcoming Markowitz's Instability with the Help of the Hierarchical Risk Parity (HRP): Theoretical Evidence (SSRN)",
            "url": "https://papers.ssrn.com/abstract=4748151"
          }
        ]
      },
      {
        "title": "Shrinkage tuned to the portfolio objective",
        "why": "Instead of minimising a matrix loss, recent work shrinks principal components to maximise out-of-sample portfolio performance directly, with closed-form estimators valid when the number of assets is comparable to or exceeds the sample size. This connects RMT cleaning with the high-dimensional \"complexity\" literature in return prediction.",
        "refs": [
          {
            "label": "Kelly, Malamud, Pourmohammadi & Trojani (2023) — Universal Portfolio Shrinkage (NBER WP 32004)",
            "url": "https://www.nber.org/papers/w32004"
          },
          {
            "label": "Ledoit & Wolf (2004) — A Well-Conditioned Estimator for Large-Dimensional Covariance Matrices",
            "url": "https://doi.org/10.1016/S0047-259X(03)00096-4"
          }
        ]
      },
      {
        "title": "ML factor models as covariance and risk-premium engines",
        "why": "Latent and characteristic-based factor models estimated with ML (IPCA, autoencoders, regularised SDF estimation) produce low-rank-plus-diagonal covariances alongside expected returns. For portfolio construction the question is whether these structured estimators dominate statistical cleaning, especially for large equity universes.",
        "refs": [
          {
            "label": "Giglio, Kelly & Xiu (2022) — Factor Models, Machine Learning, and Asset Pricing",
            "url": "https://doi.org/10.1146/annurev-financial-101521-104735"
          }
        ]
      }
    ],
    "openQuestions": [
      "How should MP fitting and eigenvalue cleaning be adapted for heavy-tailed, volatility-clustered and non-stationary equity returns?",
      "Can eigenvector noise be cleaned in a way that materially improves maximum-Sharpe portfolios, beyond eigenvalue shrinkage?",
      "Under what data-generating conditions does HRP provably dominate shrinkage minimum variance, and are those conditions observable ex ante?",
      "Is portfolio-objective shrinkage (e.g. UPSA) more robust to covariate shift than matrix-loss shrinkage, or does it overfit the validation objective?",
      "Do ML characteristic-based factor covariances beat statistical cleaning for 1,000+ stock universes after costs?"
    ],
    "brainstorm": [
      "Plot the eigenvalue maps of MP clipping, Ledoit–Wolf linear and analytical nonlinear shrinkage on the same data: where do they disagree most, and does it matter for weights?",
      "Pick one HRP weakness (bisection, linkage, IVP inside clusters) and design a simulation where fixing it changes OOS variance by more than its standard error.",
      "Use OSAP anomaly returns as \"assets\": does clustering reveal economically meaningful groups (value, momentum, profitability), and does NCO on them beat equal-weighting anomalies?",
      "Explore whether denoising helps more for daily vs. monthly rebalanced books given the effective T of each.",
      "Read the Antonov–Lipton–López de Prado analytical noise result and check it numerically in your own Monte Carlo."
    ]
  }
}
);
