LAB.extend("fml-portfolio-ml", {
  "questions": [
    {
      "id": "fml-pml-q1",
      "type": "predict",
      "difficulty": 3,
      "prompt": "<p>Simulate returns for $N=500$ assets whose true covariance is the identity plus one extra \"sector\" direction: $\\Sigma=I+(\\ell-1)vv'$ with $\\lVert v\\rVert=1$, so the true spectrum is $\\{\\ell,1,\\dots,1\\}$. Before simulating, predict the following for $\\ell\\in\\{1.5,\\,3\\}$ and $T\\in\\{250,500,1000,2000,4000\\}$:</p>\n<ol>\n<li>the Marchenko–Pastur upper edge $\\lambda_+$ of the bulk;</li>\n<li>whether the top sample eigenvalue separates from the bulk, and if it does, where it lands;</li>\n<li>the squared overlap $|\\langle\\hat u_1,v\\rangle|^2$ between the top sample eigenvector and the true direction;</li>\n<li>the Frobenius-optimal (\"oracle\") eigenvalue to attach to $\\hat u_1$, namely $\\hat u_1'\\Sigma\\hat u_1$.</li>\n</ol>\n<p>Then explain what your results imply for (i) counting factors $K$ with the MP edge in MLAM-style denoising, and (ii) clustering a universe whose sectors are small.</p>",
      "whyItMatters": "Denoising keeps eigenvalues above the MP edge and trusts them. Spiked-covariance theory says exactly when a real factor is visible at all, and how wrong its sample eigenvalue and eigenvector are even when it is visible.",
      "hints": [
        "With $\\gamma=N/T$, the bulk edge is $(1+\\sqrt\\gamma)^2$. Careful: the question is not whether $\\ell>\\lambda_+$. Can a spike of 1.5 ever produce a sample eigenvalue above the edge for these $T$?",
        "Spiked-covariance theory (Baik–Ben Arous–Péché 2005; Paul 2007): the spike separates if and only if $\\ell>1+\\sqrt\\gamma$. When it does, $\\hat\\lambda\\approx\\ell\\,(1+\\gamma/(\\ell-1))$ and $|\\langle\\hat u,v\\rangle|^2\\approx\\dfrac{1-\\gamma/(\\ell-1)^2}{1+\\gamma/(\\ell-1)}$.",
        "For $\\ell=3$ and $T=1000$: $\\gamma=0.5$, $\\hat\\lambda\\approx3.75$ against an edge of 2.91, overlap about 0.70, oracle about $3(0.70)+1(0.30)\\approx2.4$, which is below even the true value 3. For $\\ell=1.5$ the spike only separates once $\\gamma\\lt0.25$, i.e. $T\\gt2000$."
      ],
      "keyPoints": [
        "Correct edges for $N=500$: $\\lambda_+\\approx5.83,\\,4.00,\\,2.91,\\,2.25,\\,1.83$ for $T=250,\\dots,4000$.",
        "The BBP threshold is $\\ell>1+\\sqrt\\gamma$, not $\\ell>\\lambda_+$. A spike of 1.5 is undetectable for $T\\le2000$ and only just separates at $T=4000$ ($\\hat\\lambda\\approx1.88$, overlap about 0.4). A spike of 3 separates at every $T$ listed, but at $T=250$ only barely ($\\hat\\lambda\\approx6.0$ against an edge of 5.83, overlap about 0.25).",
        "Above the threshold, the sample eigenvalue is biased up and the eigenvector is only partly aligned. The oracle value $\\ell\\,|\\langle\\hat u,v\\rangle|^2+(1-|\\langle\\hat u,v\\rangle|^2)$ lies below both $\\hat\\lambda$ and $\\ell$, so the constant-residual method's habit of leaving signal eigenvalues untouched is not optimal.",
        "Implication: MP counting misses weak but real factors when $T/N$ is small. A sector of $n$ names with intra-correlation $\\rho$ has $\\ell\\approx1+(n-1)\\rho$ and is visible only if $(n-1)\\rho>\\sqrt\\gamma$, so clusters and detoned structure built on small sectors are unreliable.",
        "A simulation of about 200 draws matches the predictions up to finite-$N$ edge fluctuations (Tracy–Widom scale $N^{-2/3}$)."
      ],
      "followUps": [
        "Repeat with a correlation matrix (unit diagonal) that has a market mode. How does a fitted $\\sigma^2\\lt1$ shift the thresholds?",
        "Derive the oracle formula by minimising the Frobenius distance over all estimators that keep the sample eigenvectors."
      ],
      "source": {
        "label": "Baik, Ben Arous & Péché (2005) — Phase transition of the largest eigenvalue for nonnull complex sample covariance matrices, Annals of Probability 33(5); real-valued case in Paul (2007), Statistica Sinica 17(4)",
        "url": "https://doi.org/10.1214/009117905000000233",
        "relation": "motivated by"
      }
    },
    {
      "id": "fml-pml-q2",
      "type": "derive",
      "difficulty": 3,
      "prompt": "<p>Take $N=n_A+n_B$ assets with the same volatility $\\sigma$, split into two clusters with intra-cluster correlations $\\rho_A,\\rho_B$ and a common inter-cluster correlation $c$, where $\\rho_A,\\rho_B>c\\ge0$. Assume HRP's tree recovers the two clusters and its quasi-diagonal order lists A first, then B.</p>\n<ol>\n<li>Derive the global minimum-variance weights (fully invested, shorts allowed). Show that the weights are equal within each cluster, and give the split between clusters in terms of the variances $V_A,V_B$ of the equal-weighted cluster portfolios and their covariance $C$.</li>\n<li>Derive HRP's weights when $n_A=n_B$. Show that HRP equals minimum variance if and only if $C=0$ or $V_A=V_B$, and give the sign of the error otherwise.</li>\n<li>Now take $n_A=n_B=5$ and follow the bisection one level further inside cluster A (lists of 2 and 3). Show that HRP's within-cluster weights are unequal unless $\\rho_A=0$.</li>\n<li>Take $n_A=6$, $n_B=2$. What does the first bisection do, and why is this a different kind of error from the one in (2)?</li>\n</ol>",
      "whyItMatters": "Benchmarks usually show HRP's estimation-error advantage. This derivation shows the other side: the biases HRP has relative to the population optimum even with perfect information, and which of them tree-respecting variants remove.",
      "hints": [
        "The minimum-variance portfolio is unique, and the problem does not change when you permute assets within a cluster, so neither can the solution. That reduces the problem to two synthetic assets.",
        "Equal-weighted cluster variance: $V_A=\\sigma^2(1+(n_A-1)\\rho_A)/n_A$, and $C=\\sigma^2c$. The two-asset minimum-variance weight on A is $(V_B-C)/(V_A+V_B-2C)$. HRP's split is $\\alpha=V_B/(V_A+V_B)$.",
        "The difference between the two has the sign of $C\\,(V_B-V_A)$. For (3), the two halves of A have variances $\\sigma^2(1+\\rho_A)/2$ and $\\sigma^2(1+2\\rho_A)/3$; equal per-asset weights would require $\\alpha=2/5$."
      ],
      "keyPoints": [
        "The symmetry argument gives equal weights within clusters. The cluster weight is $w_A=(V_B-C)/(V_A+V_B-2C)$, with $V_k=\\sigma^2(1+(n_k-1)\\rho_k)/n_k$ and $C=\\sigma^2c$.",
        "HRP with an aligned split: inverse-variance within each half means equal weights (the volatilities are equal), and the split is $V_B/(V_A+V_B)$. This equals minimum variance iff $C(V_B-V_A)=0$. With $C>0$, HRP puts less weight on the lower-variance cluster than minimum variance does, because it ignores the covariance between clusters.",
        "Bisection at odd sizes breaks the symmetry within a cluster: the per-asset weights $\\alpha/2$ and $(1-\\alpha)/3$ are equal only if $\\rho_A=0$. This comes from halving the list, not from estimation error.",
        "Unequal clusters: the first split cuts cluster A (4 | 2A+2B) and mixes clusters inside one half. That is a structural error which tree-respecting variants (HCAA/HERC) fix, whereas the error in (2) remains even with perfect tree splits.",
        "Interpretation: HRP buys robustness to estimation error at the price of known biases relative to the population optimum. A T/N sweep is exactly the trade-off between these two."
      ],
      "followUps": [
        "Add estimation noise. For which T/N does HRP's bias cost less than minimum variance's estimation variance in this two-block model?",
        "Allow unequal volatilities. When does HRP's inverse-variance step inside a cluster become badly suboptimal?"
      ],
      "source": {
        "label": "López de Prado (2016) — Building Diversified Portfolios that Outperform Out-of-Sample, Journal of Portfolio Management 42(4) (recursive bisection)",
        "url": "https://doi.org/10.3905/jpm.2016.42.4.059",
        "relation": "motivated by"
      }
    },
    {
      "id": "fml-pml-q3",
      "type": "critique",
      "difficulty": 3,
      "prompt": "<p>The out-of-sample Monte Carlo in López de Prado (2016), also in AFML ch. 16, reports OOS variances of 0.1157 for CLA minimum variance (long-only), 0.0928 for IVP and 0.0671 for HRP. Read the appendix code carefully. The data-generating process works as follows:</p>\n<ul>\n<li>it draws 5 independent Gaussian series ($\\sigma=1\\%$) and adds 5 near-copies of randomly chosen originals (noise $0.25\\sigma$, parents drawn with replacement);</li>\n<li>on two random dates after the first estimation window, it injects a common shock of $-50\\%$ and then $+200\\%$ into one original and its first copy;</li>\n<li>it also injects a specific $-50\\%/+200\\%$ shock into one other original.</li>\n</ul>\n<p>Weights use a 260-day window and are rebalanced every 22 days. The reported statistic is the variance, across 10,000 runs, of the <em>terminal compounded</em> OOS return.</p>\n<ol>\n<li>List the design features that plausibly favour HRP over CLA and IVP. For each one, predict how removing it would change the ranking.</li>\n<li>Given shocks of 50 to 200 daily standard deviations, what does the reported statistic actually measure? Is it a comparison of return variances at all?</li>\n<li>Which benchmark is missing for a fair claim, and which $T/N$ regime is this experiment in?</li>\n<li>Propose a redesigned experiment (family of data-generating processes, metrics, benchmarks, inference) that could support or refute \"HRP has lower OOS risk than minimum variance\".</li>\n</ol>",
      "whyItMatters": "This Monte Carlo is the most-cited evidence for HRP. Learning to read an experiment's data-generating process and metric for hidden alignment with the method being promoted is a core research skill.",
      "hints": [
        "Ask whose structural assumption matches the data-generating process. A two-level tree of near-duplicate pairs is exactly what single-linkage clustering finds.",
        "With one-day returns of +200%, the terminal return of a run is dominated by how much weight sat on the shocked assets on the shock dates. Which method is most likely to concentrate in a shocked name before the shock enters the estimation window, and which after?",
        "T/N = 26 is a benign estimation regime, and the long-only constraint already regularises CLA. Missing: shrinkage minimum variance (Ledoit–Wolf), equal weight, and metrics such as the variance of daily returns or expected shortfall, compared with paired tests on the same simulated paths."
      ],
      "keyPoints": [
        "Alignment between the data-generating process and the method: near-duplicate pairs create a clean hierarchy that HRP is built to exploit, IVP ignores, and CLA concentrates in.",
        "The metric is the cross-run variance of terminal compounded return, dominated by exposure to rare jumps of 50 to 200 sigma. It is effectively a measure of concentration and jump exposure, not an estimate of daily OOS variance.",
        "Fair benchmarks are missing (Ledoit–Wolf or nonlinear-shrinkage minimum variance, equal weight), and a single data-generating process is used without reported sensitivity. T/N = 26, with long-only constraints.",
        "Redesign: a family of data-generating processes (factor models calibrated to data, varying T/N, cluster strength and tails), paired comparisons on identical paths, several metrics (daily variance, expected shortfall, turnover, weight RMSE against the truth), and inference with bootstrap intervals and deflation of the method grid.",
        "A fair verdict: the experiment shows that HRP is robust to concentrated jump risk under this data-generating process. It does not establish that HRP has lower variance than a well-estimated minimum-variance portfolio in general."
      ],
      "followUps": [
        "Run the ablation with the shocks removed and the daily-return variance as the metric. Does HRP still beat IVP?",
        "Design a data-generating process in which IVP beats HRP for structural reasons, for example no cluster structure but heterogeneous volatilities."
      ],
      "source": {
        "label": "López de Prado (2016) — Building Diversified Portfolios that Outperform Out-of-Sample, section 'Out-of-sample Monte Carlo simulations' and code appendix",
        "url": "https://doi.org/10.3905/jpm.2016.42.4.059",
        "relation": "motivated by"
      }
    },
    {
      "id": "fml-pml-q4",
      "type": "counterexample",
      "difficulty": 3,
      "prompt": "<p>MP denoising with the constant-residual method keeps the eigenvalues above $\\lambda_+$ and flattens everything else. Construct a covariance matrix and a sample size for which this makes the minimum-variance portfolio (shorts allowed) <em>worse</em> out of sample than the one built from the raw sample covariance, and explain the mechanism. Then ask the same question of HRP: is there a structure where any long-only hierarchical method must lose to sample minimum variance, however noisy the estimate?</p>\n<p>Make the example realistic for equities: think of instruments that carry almost the same economic exposure.</p>",
      "whyItMatters": "Denoising rests on a prior: that small eigenvalues carry no information. Real equity universes contain genuine low-variance hedges, and knowing when the prior fails tells you when to clean only one side of the spectrum.",
      "hints": [
        "Which eigenvalues does MP clipping test for significance? Only the large ones.",
        "Pairs such as dual share classes, ADR and local lines, or an ETF and its replicating basket have correlation of 0.98 or more. In correlation units, the direction $(1,-1)/\\sqrt2$ has true eigenvalue $1-\\rho\\approx0.02$, far below $\\lambda_-$. Can it be detected as an outlier below the bulk?",
        "For $\\gamma=N/T=0.5$, a small true eigenvalue $\\ell$ separates below the bulk when $\\ell\\lt1-\\sqrt\\gamma\\approx0.29$, landing near $\\ell\\,(1+\\gamma/(\\ell-1))\\approx0.01$. So $\\ell=0.02$ is a clear outlier, yet clipping resets it to the average of the bulk and removes the hedge that the true minimum-variance portfolio exploits."
      ],
      "keyPoints": [
        "Mechanism: clipping only certifies eigenvalues above the upper edge. Genuinely small eigenvalues (near-duplicate pairs) are flattened to the bulk mean, which inflates the estimated variance of a real hedge until minimum variance stops using it.",
        "A concrete construction with numbers, e.g. 25 pairs with $\\rho=0.98$ inside a 100-asset universe and $T=200$: the true eigenvalue of each pair spread is about 0.02 and its sample estimate sits isolated below $\\lambda_-$. The denoised minimum-variance portfolio loses the spread and its OOS variance rises above that of the sample minimum-variance portfolio (confirmed by simulation).",
        "Small true eigenvalues can be identified as outliers below the bulk (they separate when $\\ell\\lt1-\\sqrt\\gamma$ with $\\gamma\\lt1$). Two-sided cleaning, nonlinear shrinkage, or a structured prior (pair or ETF constraints) keeps them.",
        "Long-only hierarchical methods such as HRP cannot exploit hedges at all. When the optimal portfolio is a long-short spread with tiny variance, any long-only method loses to sample minimum variance once T/N is moderate.",
        "General lesson: in MP terms, 'noise' means 'consistent with noise at the top of the spectrum'. Treating the bottom of the spectrum as uninformative is an assumption about the universe, not a result."
      ],
      "followUps": [
        "What does Ledoit–Wolf linear shrinkage do to the 0.02 eigenvalue, and does nonlinear shrinkage do better?",
        "In a real equity universe, how would you detect such pairs ex ante without peeking at out-of-sample results?"
      ],
      "source": {
        "label": "López de Prado (2020) — Machine Learning for Asset Managers, ch. 2 (constant residual eigenvalue denoising)",
        "url": "https://doi.org/10.1017/9781108883658",
        "relation": "motivated by"
      }
    },
    {
      "id": "fml-pml-q5",
      "type": "debate",
      "difficulty": 3,
      "prompt": "<p>One camp holds that structure-based heuristics (HRP, HCAA, $1/N$, inverse variance) beat optimisation out of sample, because estimation error overwhelms the gains from optimal diversification. The other holds that this conclusion comes from poor estimators and weak opponents: with sensible inputs and a good covariance estimator, such as nonlinear shrinkage, optimisation wins. Take both sides seriously.</p>\n<ol>\n<li>Summarise the strongest evidence for each side, and identify what each piece of evidence actually compares: which opponent, which metric, which $T/N$, simulated or historical data.</li>\n<li>Specify the conditions under which you expect each side to be right ($T/N$, cluster strength, spread of volatilities, quality of return forecasts, constraints, costs), and justify each with a mechanism.</li>\n<li>Where do NCO, and HRP fed with denoised or shrunk inputs, sit in this debate? Do they dissolve it?</li>\n<li>Specify the smallest horse race (data, opponents, metrics, test) whose result would change your mind.</li>\n</ol>",
      "whyItMatters": "Choosing between HRP-style heuristics and shrinkage-based optimisation is a real production decision. Most published comparisons answer a narrower question than the one they claim to.",
      "hints": [
        "Line up each paper's opponent: López de Prado (2016) against CLA on the sample covariance; DeMiguel et al. against 14 sample-based models; Kritzman et al. against 1/N using long-horizon return estimates; Ledoit–Wolf against linear shrinkage and others; Jain &amp; Jain using SPA tests across covariance misspecifications.",
        "Estimation error in minimum-variance weights grows with N/T and with the condition number; heuristics trade bias for variance. Where the crossover falls depends on T/N and on how ill-conditioned the true matrix is.",
        "Comparing variances between strategies needs robust (bootstrap) inference; Ledoit &amp; Wolf (2011) give one such test. A fair race uses identical rebalancing, costs and constraints, and deflates the grid of methods tried."
      ],
      "keyPoints": [
        "Side A's evidence characterised correctly: López de Prado's (2016) Monte Carlo against CLA; DeMiguel et al. (2009), where no sample-based optimiser consistently beats 1/N across datasets; Raffinot's (2017) HCAA.",
        "Side B's evidence characterised correctly: Kritzman et al. (2010), where the edge of 1/N comes from short-sample return estimates; Ledoit–Wolf (2017), where minimum variance with nonlinear shrinkage dominates in backtests; Jain & Jain (2019), where HRP is more sensitive than IVP to covariance misspecification and its superiority is not robust under SPA tests.",
        "Conditions with mechanisms: heuristics win at small T/N, with strong clustering, poor return forecasts and high costs. Optimisation wins at larger T/N, with good shrinkage, informative signals, and when hedging (long/short) matters.",
        "NCO and shrunk inputs blur the dichotomy. The real axis is how much structure versus how much sample information an estimator uses (bias versus variance), not 'ML versus Markowitz'.",
        "A falsifiable horse-race design with robust inference and deflation of the variants tried."
      ],
      "followUps": [
        "Reproduce the T/N crossover in the module's stretch project and report it with intervals.",
        "If return forecasts have an IC of 0.03, does the debate change for maximum-Sharpe portfolios?"
      ],
      "source": {
        "label": "Published debate: López de Prado (2016) and DeMiguel, Garlappi & Uppal (2009) vs. Kritzman, Page & Turkington (2010), Ledoit & Wolf (2017) and Jain & Jain (2019)",
        "url": "",
        "relation": "motivated by"
      },
      "sides": [
        {
          "position": "Structure and heuristics beat optimisation out of sample: estimation error swamps the theoretical gains, and hierarchical allocation keeps the diversification while avoiding inversion of a noisy matrix.",
          "refs": [
            {
              "label": "López de Prado (2016) — Building Diversified Portfolios that Outperform Out-of-Sample, Journal of Portfolio Management 42(4)",
              "url": "https://doi.org/10.3905/jpm.2016.42.4.059"
            },
            {
              "label": "DeMiguel, Garlappi & Uppal (2009) — Optimal Versus Naive Diversification: How Inefficient is the 1/N Portfolio Strategy?, Review of Financial Studies 22(5)",
              "url": "https://doi.org/10.1093/rfs/hhm075"
            },
            {
              "label": "Raffinot (2017) — Hierarchical Clustering-Based Asset Allocation, Journal of Portfolio Management 44(2)",
              "url": "https://doi.org/10.3905/jpm.2018.44.2.089"
            }
          ]
        },
        {
          "position": "Optimisation with sensible inputs and good covariance estimators is competitive or better. Heuristic wins usually rest on weak opponents (sample covariance, short-window means) and do not survive robust testing.",
          "refs": [
            {
              "label": "Kritzman, Page & Turkington (2010) — In Defense of Optimization: The Fallacy of 1/N, Financial Analysts Journal 66(2)",
              "url": "https://doi.org/10.2469/faj.v66.n2.6"
            },
            {
              "label": "Ledoit & Wolf (2017) — Nonlinear Shrinkage of the Covariance Matrix for Portfolio Selection: Markowitz Meets Goldilocks, Review of Financial Studies 30(12)",
              "url": "https://doi.org/10.1093/rfs/hhx052"
            },
            {
              "label": "Jain & Jain (2019) — Can Machine Learning-Based Portfolios Outperform Traditional Risk-Based Portfolios? The Need to Account for Covariance Misspecification, Risks 7(3)",
              "url": "https://doi.org/10.3390/risks7030074"
            }
          ]
        }
      ]
    },
    {
      "id": "fml-pml-q6",
      "type": "connect",
      "difficulty": 3,
      "prompt": "<p>NCO solves small optimisation problems inside clusters, collapses each cluster into a synthetic asset, and solves a small problem across clusters: $w=W_{\\text{in}}w_{\\text{out}}$. A numerical analyst will recognise a two-level method: local \"subdomain\" solves plus a coarse-space (Galerkin) correction, as in domain decomposition and multigrid.</p>\n<ol>\n<li>For minimum variance, prove that NCO is exact when $\\Sigma$ is block-diagonal across clusters.</li>\n<li>Show that for any $W_{\\text{in}}$, the inter-cluster step finds the variance-minimising portfolio within $\\{W_{\\text{in}}x:\\mathbf 1'W_{\\text{in}}x=1\\}$, i.e. it is a Galerkin projection. Characterise NCO's error relative to the true minimum-variance solution in terms of the off-diagonal blocks; a Schur-complement argument for two clusters is enough.</li>\n<li>In numerical linear algebra, two-level methods are iterated or used as preconditioners. What would \"iterating NCO\" mean, where would it converge, and why would that destroy the property that motivates NCO?</li>\n<li>Explain why the condition-number argument for NCO is really about estimation error, not numerical accuracy.</li>\n</ol>",
      "whyItMatters": "Seeing NCO as a subspace restriction tells you when it is exact, what its error looks like, and why its benefit is regularisation. That changes how you would extend it, for example by adding constraints or more levels.",
      "hints": [
        "With block-diagonal $\\Sigma$, $\\Sigma^{-1}\\mathbf 1$ is $\\Sigma_{kk}^{-1}\\mathbf 1_k$ block by block. What is the intra-cluster minimum-variance portfolio, and what is its variance?",
        "The inter-cluster problem minimises $x'W_{\\text{in}}'\\Sigma W_{\\text{in}}x$: the original quadratic form restricted to range$(W_{\\text{in}})$. For two clusters, write $\\Sigma^{-1}$ using the Schur complement $S=\\Sigma_{22}-\\Sigma_{21}\\Sigma_{11}^{-1}\\Sigma_{12}$, and see how $\\Sigma_{12}$ changes the optimal mix inside each cluster.",
        "Iterating (for example, two-level additive Schwarz inside conjugate gradients) converges to the exact $\\Sigma^{-1}\\mathbf 1$ of the estimated matrix, which is the noisy sample optimum. In exact arithmetic, ill-conditioning does no harm. What hurts is that the small-eigenvalue directions of the <em>estimated</em> $\\Sigma$ are noise, and NCO's restriction to a subspace acts as regularisation."
      ],
      "keyPoints": [
        "Exactness proof for block-diagonal $\\Sigma$: intra-cluster weights $\\propto\\Sigma_{kk}^{-1}\\mathbf 1$, cluster variance $V_k=1/(\\mathbf 1'\\Sigma_{kk}^{-1}\\mathbf 1)$, a diagonal reduced matrix, inter-cluster weights $\\propto1/V_k$; the product equals $\\Sigma^{-1}\\mathbf 1$ normalised.",
        "Galerkin view: NCO is minimum variance restricted to a $K$-dimensional coarse space. Its error lies in the directions where the off-diagonal blocks rotate the optimal mix inside each cluster (the Schur complement), and it vanishes when $\\Sigma_{12}=0$.",
        "Iterating NCO, or using it as a preconditioner, recovers the full noisy minimum-variance solution. NCO's benefit is precisely that it does not converge: it is a regulariser (restriction to a structured subspace), much like early stopping or truncated Krylov methods.",
        "The condition number matters because it amplifies estimation error, not because of floating-point accuracy. The analogy holds exactly for the algebra and breaks for the statistics.",
        "Further links: truncated conjugate gradients and early stopping as implicit regularisation; coarse spaces built from data-driven clusters resemble aggregation in algebraic multigrid."
      ],
      "followUps": [
        "Compare NCO with a block-Jacobi-preconditioned conjugate-gradient solve truncated after 1–3 iterations. Which gives the lower OOS variance in your Monte Carlo?",
        "What would 'smoothing' correspond to in NCO, and would adding it help or hurt statistically?"
      ],
      "source": {
        "label": "Original cross-domain question (NCO as described in López de Prado (2020), MLAM ch. 7, viewed through two-level domain-decomposition and multigrid methods)",
        "url": "",
        "relation": "original"
      }
    },
    {
      "id": "fml-pml-q7",
      "type": "design",
      "difficulty": 3,
      "prompt": "<p>You must choose the risk model for a long/short US equity book of about 3,000 names, with risk targets rebalanced daily and alpha updated monthly. The candidate estimators are:</p>\n<ul>\n<li>a fundamental factor model (industries and styles, plus specific risk);</li>\n<li>statistical PCA factors;</li>\n<li>Ledoit–Wolf linear shrinkage;</li>\n<li>analytical nonlinear shrinkage;</li>\n<li>MP constant-residual denoising;</li>\n<li>NCO or HRP built on top of any of the above.</li>\n</ul>\n<p>Design the evaluation.</p>\n<ol>\n<li>Data reality: $T\\lt N$ for any daily window of one to two years; closing times are asynchronous; histories are missing (IPOs, delistings); the universe must be point-in-time. How does each of these break particular candidates (for example, MP fitting with $q\\lt1$)?</li>\n<li>Loss functions: choose at least three (for example, realised variance of the global minimum-variance portfolio, a bias statistic of predicted versus realised risk for random and optimised portfolios, turnover and cost), and say which decision each one mirrors.</li>\n<li>Inference: how will you test whether a difference in variance is real? How will you account for the number of estimator and hyper-parameter variants you tried?</li>\n<li>Decision rule: what result would make you prefer the factor model to pure statistical cleaning, or the reverse?</li>\n</ol>",
      "whyItMatters": "Choosing an estimator is itself a search that can be overfit, and the right loss depends on whether the matrix is used to predict risk or to optimise. This question makes you design the comparison the way a production risk team would have to.",
      "hints": [
        "Separate the estimation errors that matter for <em>predicting</em> portfolio risk from those that matter for <em>optimising</em>: optimised portfolios load on the directions whose risk is most underestimated.",
        "MP with N > T: the sample matrix has N − T zero eigenvalues, so both the KDE fit and the constant-residual average need care. Factor models sidestep the rank deficiency. For inference on variance ratios, use a studentised time-series bootstrap (Ledoit &amp; Wolf 2011).",
        "A strong design: walk-forward evaluation on identical universes and dates; metrics such as realised volatility of the global minimum-variance portfolio, bias statistics for random, optimised and factor-mimicking portfolios, and turnover; robust variance-ratio tests; and every hyper-parameter choice logged and deflated (PBO across variants)."
      ],
      "keyPoints": [
        "Identifies how T < N, asynchronous closes (the Epps effect), missing data and survivorship break specific estimators, with concrete fixes: factor structure, pairwise or EM estimation, lagged covariances, point-in-time universes.",
        "Chooses losses tied to decisions: realised risk of the global minimum-variance and optimised portfolios (optimisation), bias statistics (risk prediction), turnover and cost (implementation). Explains why Frobenius loss is not the objective.",
        "Inference: paired walk-forward comparisons with robust bootstrap variance-ratio tests, treating the estimator variants as trials (PBO or DSR on the selection).",
        "Recognises that the optimiser maximises estimation error: the estimated risk of optimised portfolios is systematically too low, so tests must include optimised portfolios, not only random ones.",
        "A clear decision rule fixed in advance, for example: prefer the simpler or more structured estimator unless another beats it by more than the bootstrap interval in every sub-period."
      ],
      "followUps": [
        "How would you combine a factor model with nonlinear shrinkage of the residual covariance, and how would you test that the combination helps?",
        "Which public dataset could you use to prototype this design without vendor data, and what biases would it introduce?"
      ],
      "source": {
        "label": "Original design question (related reading: Ledoit & Wolf (2011) — Robust Performance Hypothesis Testing with the Variance, Wilmott, Sept. 2011; Ledoit & Wolf (2017), RFS, doi:10.1093/rfs/hhx052)",
        "url": "",
        "relation": "original"
      }
    },
    {
      "id": "fml-pml-q8",
      "type": "critique",
      "difficulty": 2,
      "prompt": "<p>The lesson's recipe fits the MP density to a KDE of the empirical eigenvalues and counts the eigenvalues above the fitted $\\lambda_+$ as signal. A colleague applies it to two years of daily returns on 400 large caps and reports $K=23$ \"significant factors\".</p>\n<p>Critique this number. For each of the following, say whether it biases $K$ up or down, and why:</p>\n<ol>\n<li>volatility clustering common to all stocks;</li>\n<li>fat-tailed idiosyncratic returns;</li>\n<li>a change in the correlation regime halfway through the window;</li>\n<li>the KDE bandwidth, and the inclusion of signal eigenvalues in the fit;</li>\n<li>finite-$N$ fluctuations at the edge.</li>\n</ol>\n<p>Then propose a procedure for generating a null that gives an empirical noise edge robust to (1)–(3).</p>",
      "whyItMatters": "K drives both denoising and the number of clusters used downstream. The MP benchmark assumes IID data, which equity returns are not, so a practitioner needs an empirical null that respects the real dependence structure.",
      "hints": [
        "MP assumes IID entries. A common random variance $\\sigma_t^2$ that multiplies every stock makes the data elliptical rather than Gaussian. What does that do to the spectrum of the sample correlation matrix, even when the true correlation is the identity?",
        "Elliptical and Student ensembles (Biroli, Bouchaud &amp; Potters 2007; El Karoui 2009) have a wider spectrum than MP. A regime change halfway through makes the sample matrix an average of two different matrices. Edge fluctuations follow Tracy–Widom, on a scale of about $N^{-2/3}$.",
        "A robust null: standardise each stock by its own EWMA or GARCH volatility, then destroy the cross-sectional dependence while keeping each series' time structure (an independent circular block shift per stock). Recompute the top eigenvalues many times and use their upper quantile as the edge."
      ],
      "keyPoints": [
        "(1) Common volatility clustering widens the spectrum beyond MP and creates spurious large eigenvalues, so K is biased up. Standardising each stock by its own volatility helps, but does not fully remove a common variance factor.",
        "(2) Heavy-tailed idiosyncratic returns spread the bulk and inflate the extremes, so K is biased up. Pearson correlation is sensitive to outliers; robust or rank correlations, or Student-ensemble benchmarks, help.",
        "(3) A regime change: the average of two regimes has extra structure that is real but not stationary, so K is biased up and the eigenvectors are unstable. Split-sample or rolling estimates reveal it.",
        "(4) The KDE bandwidth and contamination by signal eigenvalues bias the fitted sigma squared, and hence the edge, in a direction that depends on the bandwidth; fix by fitting the bulk after removing outliers, or by iterating sigma squared = 1 minus the sum of signal eigenvalues over N. (5) Tracy–Widom fluctuations make eigenvalues just above the edge ambiguous, a small upward bias in K.",
        "A concrete null procedure (per-stock volatility standardisation plus independent circular block shifts, or rotation of the time index), with a quantile of the top eigenvalue as the empirical edge. Report K across nulls and bandwidths."
      ],
      "followUps": [
        "Implement the circular-shift null on the Ken French 49 industries and compare its edge with the fitted MP edge.",
        "Does a larger K change the HRP or NCO allocation materially? Measure that sensitivity before worrying about K."
      ],
      "source": {
        "label": "López de Prado (2020) — Machine Learning for Asset Managers, ch. 2 (fitting the Marchenko–Pastur distribution); see also Biroli, Bouchaud & Potters (2007), arXiv:0710.0802, and El Karoui (2009), doi:10.1214/08-AAP548",
        "url": "https://doi.org/10.1017/9781108883658",
        "relation": "motivated by"
      }
    }
  ],
  "projects": [
    {
      "id": "fml-portfolio-ml-r1",
      "title": "Replicating the HRP Out-of-Sample Monte Carlo (López de Prado 2016)",
      "level": "replication",
      "hours": "10–16",
      "paper": {
        "label": "López de Prado (2016) — Building Diversified Portfolios that Outperform Out-of-Sample, Journal of Portfolio Management 42(4)",
        "url": "https://doi.org/10.3905/jpm.2016.42.4.059"
      },
      "goal": "Reproduce the paper's out-of-sample Monte Carlo and its reported OOS variances: CLA 0.1157, IVP 0.0928, HRP 0.0671, i.e. CLA 72.47% and IVP 38.24% above HRP. The setup is 10 series (5 independent plus 5 noisy copies), 520 observations, a 260-day window, 22-day rebalancing, common and specific jumps, and 10,000 runs, with long-only CLA minimum variance, IVP and HRP compared on the variance of the terminal OOS return. Then run ablations to find which design elements drive the ranking, add fair benchmarks, and write up every discrepancy.",
      "data": "Synthetic only (the paper's generator, re-implemented with documented seeds). For an extension, use public data only (for example, Ken French 49 industry daily returns). Never use employer data, code or infrastructure.",
      "steps": [
        "Port the paper's appendix generator from Python 2 to Python 3 faithfully. Note that parents are drawn with replacement, and that the -0.5/+2 shocks are placed after the first window. Implement HRP (single linkage, quasi-diagonalisation, recursive bisection), IVP and long-only minimum variance (CLA, or a QP with 0 <= w <= 1 and weights summing to 1), and check that the CLA and QP weights agree on 100 random covariance matrices.",
        "Run 10,000 iterations with fixed seeds. Compute the variance of the terminal compounded OOS return for each method and its ratio to HRP, with bootstrap confidence intervals.",
        "Ablations, each with 10,000 runs on the same seeds: (a) no shocks; (b) metric = variance of daily OOS returns; (c) add Ledoit–Wolf (sklearn) minimum variance and MP-denoised minimum variance; (d) N in {10, 20, 50} and lookback in {60, 130, 260, 520}; (e) single vs average vs Ward linkage.",
        "Report weight concentration (for example, the share held in the top 5 names) and turnover for each method."
      ],
      "deliverables": [
        "A tested library (generator, HRP, IVP, minimum variance) and a notebook",
        "A 'paper vs. replication' table with intervals",
        "An ablation table showing whether the ranking HRP < IVP < CLA survives each change",
        "A 1–2 page discrepancy write-up"
      ],
      "acceptance": [
        "Unit tests: HRP weights are non-negative, sum to 1 within 1e-10 and do not change when the assets are permuted; the minimum-variance solver matches an independent QP solution within 1e-6 on 100 random covariance matrices.",
        "Baseline replication: the OOS-variance ratios CLA/HRP and IVP/HRP are each within ±15% of the paper's 1.7247 and 1.3824; otherwise the discrepancy write-up identifies the cause with a supporting ablation.",
        "Every reported ratio comes with a 95% bootstrap interval over the 10,000 runs.",
        "The ablation table reports, for each change, whether the HRP < IVP < CLA ranking survives, with intervals.",
        "The discrepancy write-up covers random-number-generator differences between Python 2 and 3, the CLA implementation, the jump specification and the choice of metric."
      ],
      "extensions": [
        "Replace the generator with a block-factor model calibrated to Ken French 49 industry daily returns (public data).",
        "Add NCO and HERC/HCAA to the comparison.",
        "Compare your ablation results with the analytical noise predictions of Antonov, Lipton & López de Prado (2024)."
      ]
    }
  ]
});
