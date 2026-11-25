LAB.module("finance-ml", {
  "id": "fml-backtest-overfitting",
  "order": 7,
  "title": "Backtest Overfitting and Multiple Testing",
  "summary": "Quantify how much of a backtest is selection bias: expected maximum Sharpe under N trials, PSR and DSR, effective number of trials via clustering, PBO with CSCV, minimum backtest length, and the Harvey–Liu–Zhu multiple-testing hurdles.",
  "sources": [
    {
      "label": "López de Prado (2018), Advances in Financial Machine Learning, ch. 11–14 (Wiley)",
      "url": ""
    },
    {
      "label": "Bailey & López de Prado (2012) — The Sharpe Ratio Efficient Frontier, Journal of Risk 15(2)",
      "url": "https://doi.org/10.21314/JOR.2012.255"
    },
    {
      "label": "Bailey & López de Prado (2014) — The Deflated Sharpe Ratio, Journal of Portfolio Management 40(5)",
      "url": "https://papers.ssrn.com/abstract=2460551"
    },
    {
      "label": "Bailey, Borwein, López de Prado & Zhu (2014) — Pseudo-Mathematics and Financial Charlatanism, Notices of the AMS 61(5)",
      "url": "https://doi.org/10.1090/noti1105"
    },
    {
      "label": "Bailey, Borwein, López de Prado & Zhu (2017) — The Probability of Backtest Overfitting, Journal of Computational Finance 20(4)",
      "url": "https://papers.ssrn.com/abstract=2326253"
    },
    {
      "label": "Harvey, Liu & Zhu (2016) — ...and the Cross-Section of Expected Returns, Review of Financial Studies 29(1)",
      "url": "https://doi.org/10.1093/rfs/hhv059"
    }
  ],
  "lessons": [
    {
      "id": "fml-backtest-overfitting-1",
      "title": "Selection Bias, the Expected Maximum Sharpe, PSR and DSR",
      "minutes": 30,
      "html": "<h3>1. Why the best backtest is a biased estimator</h3>\n<p>Every research pipeline is a search. You vary lookbacks, universes, neutralisations, rebalancing rules, signal transforms and model hyper-parameters, and at the end you report (or, worse, allocate to) the configuration that looked best. The Sharpe ratio of that configuration is no longer an estimate of the strategy's true Sharpe ratio: it is an estimate of the <em>maximum</em> of a collection of noisy estimates. Even if every configuration has true Sharpe ratio exactly zero, the maximum of $N$ sample Sharpe ratios is positive in expectation and grows without bound in $N$. This is selection bias under multiple testing, and in finance it is aggravated by three features: low signal-to-noise, a single non-repeatable history, and heavy tails and serial dependence that make the naive standard error too optimistic.</p>\n<p>The useful mental model is that your research process is a <strong>random variable generator</strong> whose output (the reported Sharpe ratio) has a distribution under the null of no skill. Deflation means comparing your observed result against that null distribution, not against zero.</p>\n\n<h3>2. Sampling distribution of the Sharpe ratio</h3>\n<p>Let $r_1,\\dots,r_T$ be per-period excess returns with mean $\\mu$, volatility $\\sigma$, skewness $\\gamma_3$ and (non-excess) kurtosis $\\gamma_4$, and let $\\widehat{SR}=\\hat\\mu/\\hat\\sigma$ be the non-annualised sample Sharpe ratio. Under IID returns (Lo 2002; Mertens 2002), the asymptotic variance is</p>\n$$\\mathbb{V}\\left[\\widehat{SR}\\right] \\approx \\frac{1}{T}\\left(1 - \\gamma_3\\, SR + \\frac{\\gamma_4 - 1}{4}\\, SR^2\\right).$$\n<p>For Gaussian returns ($\\gamma_3=0$, $\\gamma_4=3$) this collapses to $(1+SR^2/2)/T$. Negative skew and fat tails, both endemic to short-volatility, carry and many equity long/short books, <em>inflate</em> the standard error. Two practical notes for an equity researcher: (i) compute the statistic at the frequency you actually observe (daily or monthly) and only annualise at the end; (ii) serial correlation (e.g. from overlapping holding periods or stale prices) requires an additional correction, typically a HAC-style or Lo-style adjustment; the IID formula is a floor on uncertainty, not a ceiling.</p>\n\n<h3>3. The Probabilistic Sharpe Ratio</h3>\n<p>Bailey and López de Prado (2012) turn the sampling distribution into a probability statement. Given a benchmark $SR^*$ (in the same per-period units), the <strong>Probabilistic Sharpe Ratio</strong> is the estimated probability that the true Sharpe ratio exceeds $SR^*$:</p>\n$$\\widehat{\\mathrm{PSR}}(SR^*) = \\Phi\\left(\\frac{(\\widehat{SR} - SR^*)\\sqrt{T-1}}{\\sqrt{1 - \\hat\\gamma_3 \\widehat{SR} + \\frac{\\hat\\gamma_4 - 1}{4}\\widehat{SR}^2}}\\right).$$\n<p>PSR is monotone in track-record length, penalises negative skew and excess kurtosis, and is invariant to annualisation as long as you are consistent. Inverting it gives the <strong>Minimum Track Record Length</strong>, the number of observations needed for $\\mathrm{PSR}\\ge 1-\\alpha$:</p>\n$$\\mathrm{MinTRL} = 1 + \\left(1 - \\hat\\gamma_3\\widehat{SR} + \\frac{\\hat\\gamma_4-1}{4}\\widehat{SR}^2\\right)\\left(\\frac{z_{1-\\alpha}}{\\widehat{SR} - SR^*}\\right)^2.$$\n<p>A worked intuition: an annualised Sharpe of 1.0 on monthly data is $\\widehat{SR}\\approx 0.289$ per month. With Gaussian returns and $SR^*=0$, $\\alpha=5\\%$ needs roughly $1 + 1.04\\cdot(1.645/0.289)^2 \\approx 35$ months. Introduce $\\gamma_3=-1$ and $\\gamma_4=6$ and the requirement rises by about a third. These are single-test numbers; the next section shows why they are far too lenient once you have searched.</p>\n\n<h3>4. The expected maximum Sharpe ratio (False Strategy Theorem)</h3>\n<p>Suppose you ran $N$ independent trials whose estimated Sharpe ratios $\\{\\widehat{SR}_n\\}$ have cross-sectional variance $\\mathbb{V}[\\{\\widehat{SR}_n\\}]$ and true value zero. Using extreme value theory for the maximum of Gaussians, Bailey, Borwein, López de Prado and Zhu (2014) and López de Prado and Bailey (2021) show</p>\n$$\\mathbb{E}\\left[\\max_n \\widehat{SR}_n\\right] \\approx \\sqrt{\\mathbb{V}[\\{\\widehat{SR}_n\\}]}\\left((1-\\gamma)\\,\\Phi^{-1}\\left[1-\\frac{1}{N}\\right] + \\gamma\\,\\Phi^{-1}\\left[1-\\frac{1}{Ne}\\right]\\right),$$\n<p>where $\\gamma\\approx 0.5772$ is the Euler–Mascheroni constant. The bracket grows roughly like $\\sqrt{2\\ln N}$: about 1.57 for $N=10$, 2.53 for $N=100$, 3.26 for $N=1000$. Two conclusions follow. First, the hurdle depends on <em>how many</em> trials you ran and on <em>how dispersed</em> their results were; a search over near-identical variants (low dispersion, high correlation) is less dangerous than a search over wildly different ideas. Second, because the maximum is right-unbounded in $N$, there is no Sharpe ratio high enough to be convincing if the number of trials is unknown. This is why trial logging is not bureaucracy but a statistical necessity.</p>\n\n<h3>5. The Deflated Sharpe Ratio</h3>\n<p>The <strong>Deflated Sharpe Ratio</strong> (Bailey and López de Prado 2014) is simply PSR with the benchmark set to the expected maximum under the null:</p>\n$$\\mathrm{DSR} = \\widehat{\\mathrm{PSR}}\\left(\\widehat{SR}_0\\right), \\qquad \\widehat{SR}_0 = \\sqrt{\\mathbb{V}[\\{\\widehat{SR}_n\\}]}\\left((1-\\gamma)\\Phi^{-1}\\left[1-\\tfrac{1}{N}\\right] + \\gamma\\Phi^{-1}\\left[1-\\tfrac{1}{Ne}\\right]\\right).$$\n<p>DSR corrects simultaneously for selection bias (via $N$ and the dispersion of trial results), for non-normality (via $\\hat\\gamma_3,\\hat\\gamma_4$ of the selected strategy) and for sample length (via $T$). It is read as the probability that the selected strategy's true Sharpe ratio is positive <em>after</em> accounting for the search. A common decision rule is to require $\\mathrm{DSR}\\ge 0.95$.</p>\n\n<pre><code class=\"language-python\">import numpy as np\nfrom scipy.stats import norm, skew, kurtosis\n\nEULER = 0.5772156649\n\ndef expected_max_sr(n_trials, var_sr):\n    \"\"\"Expected max of n_trials Sharpe estimates with true SR = 0 (per-period units).\"\"\"\n    z1 = norm.ppf(1 - 1.0 / n_trials)\n    z2 = norm.ppf(1 - 1.0 / (n_trials * np.e))\n    return np.sqrt(var_sr) * ((1 - EULER) * z1 + EULER * z2)\n\ndef psr(returns, sr_star=0.0):\n    r = np.asarray(returns)\n    T = r.size\n    sr = r.mean() / r.std(ddof=1)\n    g3 = skew(r)\n    g4 = kurtosis(r, fisher=False)          # non-excess kurtosis\n    denom = np.sqrt(1 - g3 * sr + (g4 - 1) / 4 * sr**2)\n    return norm.cdf((sr - sr_star) * np.sqrt(T - 1) / denom)\n\ndef dsr(selected_returns, trial_srs):\n    \"\"\"trial_srs: per-period Sharpe ratios of ALL trials (same frequency).\"\"\"\n    sr0 = expected_max_sr(len(trial_srs), np.var(trial_srs, ddof=1))\n    return psr(selected_returns, sr_star=sr0)\n\n# Sanity check on pure noise: max in-sample SR vs formula\nrng = np.random.default_rng(0)\nT, N = 1250, 500\nR = rng.standard_normal((T, N)) * 0.01\nsrs = R.mean(0) / R.std(0, ddof=1)\nprint(srs.max(), expected_max_sr(N, srs.var(ddof=1)))\n</code></pre>\n\n<p>Note the subtle point in the last lines: the formula uses the <em>empirical</em> variance of the trial Sharpe ratios. Under the null and IID Gaussian returns that variance is close to $1/T$, but in real searches it is inflated by genuine heterogeneity and deflated by correlation between trials, which is why estimating the effective number of independent trials (next lesson) matters.</p>\n\n<div class=\"callout warn\"><strong>Pitfall — mixing units and forgetting trials.</strong> The two most frequent DSR bugs are (1) plugging an <em>annualised</em> Sharpe into a formula that expects per-period units with $T$ in periods, which silently multiplies the z-score by $\\sqrt{252}$ or $\\sqrt{12}$; and (2) setting $N$ to the number of variants in the final notebook rather than the number of things you, your colleagues and the literature you borrowed from actually tried. If you cannot reconstruct $N$, report DSR for a range of $N$ (e.g. 10, 100, 1000) and state which value would make the result insignificant.</div>\n\n<h3>6. How to read these numbers as a researcher</h3>\n<p>PSR answers \"is this single track record distinguishable from a benchmark?\". DSR answers \"is the best of my search distinguishable from what luck would have produced?\". Neither tells you whether the economic mechanism is real; a strategy can have a DSR of 0.99 and still be a data artefact (look-ahead in fundamentals, survivorship, microstructure bounce). Conversely, a low DSR does not prove the idea is false: it says the evidence from this backtest is insufficient given the search. The right response to a low DSR is usually more independent evidence (new markets, new periods, new asset classes, a structural argument), not a better-tuned backtest.</p>"
    },
    {
      "id": "fml-backtest-overfitting-2",
      "title": "Effective Trials, PBO via CSCV, MinBTL and Multiple-Testing Hurdles",
      "minutes": 32,
      "html": "<h3>1. How many trials did you really run?</h3>\n<p>DSR needs $N$, but research trials are rarely independent. Ten lookback windows for a momentum signal are highly correlated; ten unrelated anomalies are not. Plugging the raw count into the expected-maximum formula overstates the hurdle for correlated families and understates it when the log is incomplete. López de Prado and Lewis (2019) propose an unsupervised approach to estimate the <strong>effective number of independent trials</strong> $K$:</p>\n<ol>\n<li>Store the return series of every trial (this is the trial log). Compute the correlation matrix $\\rho$ and convert it to a distance, e.g. $d_{ij}=\\sqrt{\\tfrac12(1-\\rho_{ij})}$.</li>\n<li>Cluster the trials. The <em>Optimal Number of Clusters</em> (ONC) algorithm of MLAM ch. 4 runs k-means over many $k$ and seeds, scores each partition by the mean-over-std of silhouette coefficients, and recursively re-clusters clusters whose quality is below average.</li>\n<li>Collapse each cluster into one representative return series (e.g. inverse-variance or minimum-variance weighting of its members) and compute its Sharpe ratio, converted to a common frequency.</li>\n<li>Use $K$ = number of clusters and $\\mathbb{V}[\\{\\widehat{SR}_k\\}]$ = variance of the cluster Sharpe ratios in the expected-max formula, then evaluate DSR on the selected strategy.</li>\n</ol>\n<p>A cruder heuristic interpolates between 1 and $N$ using the average pairwise correlation $\\bar\\rho$, e.g. $K\\approx \\bar\\rho + (1-\\bar\\rho)N$. It is useful for back-of-the-envelope checks but ignores block structure: a log containing two big families of near-duplicates has $K\\approx 2$ regardless of what $\\bar\\rho$ says.</p>\n\n<h3>2. Probability of Backtest Overfitting via CSCV</h3>\n<p>DSR evaluates one selected strategy. The <strong>Probability of Backtest Overfitting</strong> (Bailey, Borwein, López de Prado and Zhu 2017) evaluates the <em>selection procedure</em>: how often does the in-sample winner end up below the median out of sample? Its estimator, Combinatorially Symmetric Cross-Validation (CSCV), is model-free and uses only the matrix of trial returns:</p>\n<ol>\n<li>Form $M\\in\\mathbb{R}^{T\\times N}$, columns are the $N$ trials' returns on common dates.</li>\n<li>Split the rows into $S$ contiguous blocks of equal size ($S$ even, e.g. 16).</li>\n<li>For each of the $\\binom{S}{S/2}$ ways to choose half the blocks as in-sample (IS), the complement is out-of-sample (OOS). This is symmetric: every block is IS in exactly half the combinations.</li>\n<li>In each combination $c$, select $n^*=\\arg\\max_n \\text{SR}^{IS}_n$, compute its OOS relative rank $\\bar\\omega_c = \\text{rank}^{OOS}(n^*)/(N+1)\\in(0,1)$ and the logit $\\lambda_c=\\ln\\frac{\\bar\\omega_c}{1-\\bar\\omega_c}$.</li>\n<li>Estimate $\\mathrm{PBO} = \\frac{1}{|C|}\\sum_c \\mathbf{1}\\{\\lambda_c\\le 0\\}$.</li>\n</ol>\n<p>Under pure noise and a large $N$, the IS winner's OOS rank is uniform, so PBO is near 0.5. A procedure with genuine skill pushes $\\lambda$ positive and PBO toward 0. Alongside PBO, plot the IS Sharpe of the winner against its OOS Sharpe across combinations: a negative slope (performance degradation) is the classic signature of overfitting, often amplified by mean reversion in noise (the IS winner was lucky on exactly the blocks that the OOS half does not contain).</p>\n\n<pre><code class=\"language-python\">import numpy as np\nfrom itertools import combinations\n\ndef sharpe(x):\n    return x.mean(0) / x.std(0, ddof=1)\n\ndef pbo_cscv(M, S=16):\n    T, N = M.shape\n    blocks = np.array_split(np.arange(T - T % S), S)\n    logits, is_sr, oos_sr = [], [], []\n    for c in combinations(range(S), S // 2):\n        is_idx = np.concatenate([blocks[i] for i in c])\n        oos_idx = np.concatenate([blocks[i] for i in range(S) if i not in c])\n        sr_is, sr_oos = sharpe(M[is_idx]), sharpe(M[oos_idx])\n        n_star = np.argmax(sr_is)\n        rank = (sr_oos &lt;= sr_oos[n_star]).sum()          # 1..N\n        w = rank / (N + 1)\n        logits.append(np.log(w / (1 - w)))\n        is_sr.append(sr_is[n_star]); oos_sr.append(sr_oos[n_star])\n    logits = np.array(logits)\n    return (logits &lt;= 0).mean(), logits, np.array(is_sr), np.array(oos_sr)\n\nrng = np.random.default_rng(1)\npbo, lam, a, b = pbo_cscv(rng.standard_normal((2000, 100)), S=12)\nprint(f\"PBO on noise = {pbo:.2f}, degradation slope = {np.polyfit(a, b, 1)[0]:.2f}\")\n</code></pre>\n\n<p>CSCV caveats worth internalising: blocks are contiguous so serial dependence is respected within blocks but leakage at block edges is not purged; with strongly trending regimes, IS and OOS halves are not exchangeable; and PBO says nothing about the absolute level of OOS performance (a family where all members are excellent can have PBO of 0.5 and still be profitable). Use it as a diagnostic of the selection process, together with DSR.</p>\n\n<h3>3. Minimum Backtest Length</h3>\n<p>Turning the expected-max formula around gives a budget. If all $N$ independent configurations have true SR zero and annualised SR estimates over $y$ years have variance about $1/y$, then $\\mathbb{E}[\\max_N \\widehat{SR}]\\approx \\mathbb{E}[\\max_N Z]/\\sqrt{y}$. Requiring that this expected maximum stays below a target annualised Sharpe $\\overline{SR}$ gives the <strong>Minimum Backtest Length</strong> (Bailey et al. 2014):</p>\n$$\\mathrm{MinBTL} \\approx \\left(\\frac{(1-\\gamma)\\Phi^{-1}\\left[1-\\frac1N\\right] + \\gamma\\,\\Phi^{-1}\\left[1-\\frac{1}{Ne}\\right]}{\\overline{SR}}\\right)^2 < \\frac{2\\ln N}{\\overline{SR}^{\\,2}}.$$\n<p>With five years of data, trying more than about 45 independent configurations is enough for the best of them to show an annualised in-sample Sharpe near 1 by chance alone. For the typical equity researcher with 20 years of daily data, the bound is less binding for single signals, but it bites quickly once you search over combinations of signals, universes and neutralisations.</p>\n\n<h3>4. The finance-literature view: t-stat hurdles and FDR</h3>\n<p>Harvey, Liu and Zhu (2016) frame the same problem at the level of the profession: hundreds of published factors are hundreds of tests. Three corrections matter, controlling different error rates:</p>\n<table><thead><tr><th>Method</th><th>Controls</th><th>Rule (sorted p-values $p_{(1)}\\le\\dots\\le p_{(M)}$)</th></tr></thead>\n<tbody>\n<tr><td>Bonferroni</td><td>FWER</td><td>reject if $p_{(k)}\\le \\alpha/M$</td></tr>\n<tr><td>Holm</td><td>FWER (step-down)</td><td>reject while $p_{(k)}\\le \\alpha/(M-k+1)$</td></tr>\n<tr><td>BHY</td><td>FDR under arbitrary dependence</td><td>reject $k\\le k^*$, $k^*=\\max\\{k: p_{(k)}\\le \\frac{k\\,\\alpha}{M\\,c(M)}\\}$, $c(M)=\\sum_{j=1}^M \\frac1j$</td></tr>\n</tbody></table>\n<p>Their headline: a newly proposed factor should clear a t-statistic of roughly 3.0 rather than 2.0, and the hurdle rises as more factors are mined. Harvey and Liu (2020) add the other side of the ledger, calibrating Type II errors so that the hurdle reflects the cost of missed discoveries. The counter-literature (Chen and Zimmermann 2022; Jensen, Kelly and Pedersen 2023; Chen 2025) argues that published anomalies replicate far better than a \"most findings are false\" reading implies, and that the case for higher hurdles is weakly identified because unpublished results are unobserved. For a practitioner the lesson is symmetric: FWER methods are appropriate when a single false positive is costly (a standalone product), FDR when you are building a diversified book of many weak signals.</p>\n\n<h3>5. The protocol mindset (AFML ch. 11–14)</h3>\n<ul>\n<li><strong>A backtest is not a research tool.</strong> Use feature importance, economic reasoning and controlled experiments to decide what to test; use the backtest once, at the end, as a sanity check.</li>\n<li><strong>Log every trial</strong> (code hash, parameters, return series) so that $N$, $K$ and PBO can be computed honestly.</li>\n<li><strong>Prefer distributions to points.</strong> Combinatorial purged CV (AFML ch. 12) produces $\\varphi[N,k]=\\frac{k}{N}\\binom{N}{N-k}$ backtest paths and hence a distribution of Sharpe ratios, rather than the single path of a walk-forward.</li>\n<li><strong>Test on synthetic data</strong> when the history is too short (ch. 13): calibrate a process, then check whether your rule's optimum is stable across simulated paths.</li>\n<li><strong>Report the right statistics</strong> (ch. 14): PSR, DSR, drawdown and time-under-water, turnover and capacity, alongside the trial count.</li>\n</ul>\n\n<div class=\"callout\"><strong>Practical pitfall — \"holdout\" contamination.</strong> A holdout period stops being out-of-sample the first time you look at it and change anything. Iterating \"tweak, check holdout, tweak\" turns the holdout into another in-sample block, and your effective $N$ silently includes every peek. Budget holdout looks in advance (ideally one) and count each look as a trial.</div>"
    }
  ],
  "cheatsheet": [
    {
      "term": "Sharpe estimator variance (IID, non-normal)",
      "formula": "\\mathbb{V}[\\widehat{SR}] \\approx \\frac{1}{T}\\left(1-\\gamma_3 SR + \\frac{\\gamma_4-1}{4}SR^2\\right)",
      "note": "Per-period units; gamma_4 is non-excess kurtosis. Serial correlation needs an extra correction."
    },
    {
      "term": "Probabilistic Sharpe Ratio",
      "formula": "\\widehat{\\mathrm{PSR}}(SR^*)=\\Phi\\left(\\frac{(\\widehat{SR}-SR^*)\\sqrt{T-1}}{\\sqrt{1-\\hat\\gamma_3\\widehat{SR}+\\frac{\\hat\\gamma_4-1}{4}\\widehat{SR}^2}}\\right)",
      "note": "Probability true SR exceeds the benchmark SR*."
    },
    {
      "term": "Minimum Track Record Length",
      "formula": "\\mathrm{MinTRL}=1+\\left(1-\\hat\\gamma_3\\widehat{SR}+\\frac{\\hat\\gamma_4-1}{4}\\widehat{SR}^2\\right)\\left(\\frac{z_{1-\\alpha}}{\\widehat{SR}-SR^*}\\right)^2",
      "note": "Observations needed for PSR >= 1 - alpha."
    },
    {
      "term": "Expected max Sharpe of N null trials",
      "formula": "\\mathbb{E}[\\max_n\\widehat{SR}_n]\\approx\\sqrt{\\mathbb{V}[\\{\\widehat{SR}_n\\}]}\\left((1-\\gamma)\\Phi^{-1}\\left[1-\\tfrac1N\\right]+\\gamma\\Phi^{-1}\\left[1-\\tfrac{1}{Ne}\\right]\\right)",
      "note": "gamma = 0.5772 (Euler–Mascheroni). Grows like sqrt(2 ln N)."
    },
    {
      "term": "Deflated Sharpe Ratio",
      "formula": "\\mathrm{DSR}=\\widehat{\\mathrm{PSR}}\\left(\\widehat{SR}_0\\right),\\ \\widehat{SR}_0=\\mathbb{E}[\\max_n\\widehat{SR}_n]",
      "note": "Corrects for number of trials, dispersion of trials, non-normality and length."
    },
    {
      "term": "Effective number of trials (heuristic)",
      "formula": "K \\approx \\bar\\rho + (1-\\bar\\rho)N",
      "note": "Crude; prefer clustering (ONC) of trial return correlations."
    },
    {
      "term": "Correlation distance",
      "formula": "d_{ij}=\\sqrt{\\tfrac12(1-\\rho_{ij})}",
      "note": "Proper metric used to cluster trials or assets."
    },
    {
      "term": "CSCV relative rank and logit",
      "formula": "\\bar\\omega_c=\\frac{\\mathrm{rank}^{OOS}(n^*)}{N+1},\\quad \\lambda_c=\\ln\\frac{\\bar\\omega_c}{1-\\bar\\omega_c}",
      "note": "n* = IS winner in combination c."
    },
    {
      "term": "Probability of Backtest Overfitting",
      "formula": "\\mathrm{PBO}=\\frac{1}{|C|}\\sum_{c\\in C}\\mathbf{1}\\{\\lambda_c\\le 0\\},\\ |C|=\\binom{S}{S/2}",
      "note": "About 0.5 on noise; near 0 for a skilful selection process."
    },
    {
      "term": "Minimum Backtest Length",
      "formula": "\\mathrm{MinBTL}<\\frac{2\\ln N}{\\overline{SR}^{\\,2}}\\ \\text{years}",
      "note": "Annualised target SR; N independent configurations with true SR 0."
    },
    {
      "term": "Bonferroni / Holm",
      "formula": "p_{(k)}\\le\\frac{\\alpha}{M}\\quad\\text{vs}\\quad p_{(k)}\\le\\frac{\\alpha}{M-k+1}",
      "note": "Both control FWER; Holm is uniformly more powerful."
    },
    {
      "term": "BHY (FDR under dependence)",
      "formula": "k^*=\\max\\left\\{k:p_{(k)}\\le\\frac{k\\alpha}{M\\,c(M)}\\right\\},\\ c(M)=\\sum_{j=1}^{M}\\frac1j",
      "note": "Benjamini–Hochberg–Yekutieli; used by Harvey–Liu–Zhu."
    },
    {
      "term": "HLZ t-stat hurdle",
      "formula": "|t| > 3.0",
      "note": "Rough hurdle for a new factor given the volume of prior mining (HLZ 2016); contested by later work."
    },
    {
      "term": "CPCV number of paths",
      "formula": "\\varphi[N,k]=\\frac{k}{N}\\binom{N}{N-k}",
      "note": "N groups, k test groups per split (AFML ch. 12)."
    }
  ],
  "flashcards": [
    {
      "q": "Why is the reported Sharpe ratio of the best of N backtests biased upward even when all strategies are worthless?",
      "a": "Because it estimates the expected <em>maximum</em> of N noisy estimates, which is positive and grows roughly like $\\sqrt{2\\ln N}$ times the standard deviation of the trial Sharpe ratios."
    },
    {
      "q": "What two inputs about the search does the expected-maximum Sharpe formula need?",
      "a": "The number of (effectively independent) trials $N$ and the cross-sectional variance of the trial Sharpe ratios $\\mathbb{V}[\\{\\widehat{SR}_n\\}]$."
    },
    {
      "q": "How do negative skew and fat tails affect PSR?",
      "a": "They enlarge the denominator $\\sqrt{1-\\gamma_3 SR + (\\gamma_4-1)SR^2/4}$ when $SR&gt;0$, lowering PSR and lengthening MinTRL."
    },
    {
      "q": "What is the DSR, in one sentence?",
      "a": "PSR evaluated at the benchmark $SR_0$ equal to the expected maximum Sharpe of $N$ null trials, i.e. the probability the selected strategy is truly positive after accounting for the search."
    },
    {
      "q": "Which kurtosis enters the PSR formula, excess or non-excess?",
      "a": "Non-excess (Gaussian = 3); with scipy use <code>kurtosis(r, fisher=False)</code>."
    },
    {
      "q": "Why estimate an effective number of trials instead of counting them?",
      "a": "Trials are correlated; near-duplicate variants inflate the raw count while contributing little independent search. Clustering the trial correlation matrix gives $K$ and the dispersion of cluster Sharpe ratios."
    },
    {
      "q": "What does CSCV hold fixed that walk-forward does not?",
      "a": "Symmetry: every block appears in-sample in exactly half of the $\\binom{S}{S/2}$ combinations, so IS and OOS are treated exchangeably and many OOS evaluations are obtained."
    },
    {
      "q": "What PBO do you expect on pure noise, and why?",
      "a": "About 0.5: the IS winner has no information about OOS, so its OOS rank is roughly uniform and the logit is negative half the time."
    },
    {
      "q": "What does a negative slope of OOS on IS Sharpe (of the IS winner) indicate?",
      "a": "Performance degradation: the strongest IS results are the luckiest, and luck does not persist; a hallmark of overfitting."
    },
    {
      "q": "State the MinBTL upper bound.",
      "a": "$\\mathrm{MinBTL} &lt; 2\\ln N/\\overline{SR}^{2}$ years, for $N$ independent configurations and target annualised Sharpe $\\overline{SR}$."
    },
    {
      "q": "FWER vs FDR: which suits a diversified book of many weak signals?",
      "a": "FDR (e.g. BHY): you tolerate a controlled share of false positives among many discoveries. FWER (Bonferroni/Holm) suits single high-stakes decisions."
    },
    {
      "q": "Why does BHY include the factor $c(M)=\\sum_{j\\le M}1/j$?",
      "a": "It makes the Benjamini–Hochberg procedure valid under arbitrary dependence among tests, at the cost of power."
    },
    {
      "q": "Main argument of Chen (2025) against raising t-stat hurdles?",
      "a": "Unpublished results are unobserved, so the hurdle must be extrapolated; this makes revised hurdles weakly identified, and the data are consistent with keeping or even lowering them."
    },
    {
      "q": "Why is a holdout set fragile?",
      "a": "Each look followed by a change makes it in-sample; peeks are trials and must be counted in $N$."
    }
  ],
  "projects": [
    {
      "id": "fml-backtest-overfitting-p1",
      "title": "Deflating a Momentum Search on Industry Portfolios",
      "level": "core",
      "hours": "8–12",
      "goal": "Verify the False Strategy Theorem by simulation, then apply PSR, DSR and PBO to a realistic search: a grid of time-series and cross-sectional momentum variants on the Ken French 49 industry portfolios. The outcome is a short report stating whether the best variant survives deflation and how the verdict depends on the assumed number of trials.",
      "data": "Ken French Data Library (49 Industry Portfolios, daily and monthly, value-weighted): https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html. Free and survivorship-bias-free at the portfolio level, but industry definitions are static SIC mappings and returns are gross of costs. Use only public or personal data; do not use any employer data, code or infrastructure.",
      "steps": [
        "Simulation: for N in {10, 50, 100, 500, 1000} and T = 1250, draw N IID Gaussian return series with zero mean, compute the max sample Sharpe; repeat 2,000 times and compare the average max to the expected-max formula using the empirical variance of trial Sharpe ratios.",
        "Repeat the simulation with Student-t (nu = 4) returns and with AR(1) returns (phi = 0.2) to see where the formula breaks.",
        "Build a grid of at least 120 momentum variants on the 49 industries (lookback 1–24 months, skip 0/1 month, top/bottom quantile 3/5/10, equal vs. vol-scaled weights). Store every variant's monthly return series in a trial log.",
        "Compute PSR(0) and MinTRL for the best variant; compute DSR using (a) raw N, (b) the effective K from clustering the trial correlation matrix (k-means with silhouette or ONC).",
        "Run CSCV with S = 10, 12 and 16; report PBO, the logit histogram, and the IS-vs-OOS Sharpe regression slope."
      ],
      "deliverables": [
        "Notebook with simulation and empirical sections",
        "Table: N vs. simulated mean max SR vs. formula",
        "Table: PSR, DSR(raw N), DSR(K), PBO for the momentum search",
        "One-page memo with the verdict and the sensitivity of DSR to N"
      ],
      "acceptance": [
        "Gaussian simulation: average max Sharpe within 5% of the formula for every N >= 50 (and within 10% for N = 10).",
        "Student-t and AR(1) cases: the relative error is reported and the direction of the bias is explained.",
        "CSCV on a pure-noise matrix of the same shape returns PBO in [0.40, 0.60].",
        "DSR is computed in per-period units with non-excess kurtosis; a unit test reproduces PSR for a hand-calculated example to 3 decimals.",
        "Effective K is reported with the clustering quality score and is strictly less than raw N."
      ],
      "extensions": [
        "Add transaction costs at 10–30 bp per unit turnover and redo the DSR.",
        "Replace CSCV with combinatorial purged CV and compare the distribution of OOS Sharpe ratios.",
        "Report the N at which DSR drops below 0.95 (the \"breakeven number of trials\")."
      ]
    },
    {
      "id": "fml-backtest-overfitting-p2",
      "title": "Multiple Testing on the Anomaly Zoo",
      "level": "stretch",
      "hours": "15–25",
      "goal": "Re-run the Harvey–Liu–Zhu style analysis on the Open Source Asset Pricing predictor portfolios: compute t-statistics for roughly 200 long-short anomaly returns, apply Bonferroni, Holm and BHY, estimate the effective number of independent anomalies by clustering, and contrast the conclusions with the replication-friendly view of Chen & Zimmermann (2022) and Jensen, Kelly & Pedersen (2023), including in the post-publication sample.",
      "data": "Open Source Asset Pricing (Chen & Zimmermann) predictor long-short portfolio returns, free download: https://www.openassetpricing.com/ (portfolio files are derived from CRSP/Compustat but published openly; original-paper sample periods are included). Optional cross-check: JKP global factor returns at https://jkpfactors.com. Use only public or personal data; do not use employer data or vendor licenses obtained through work.",
      "steps": [
        "Download the original-paper long-short returns and the publication dates; restrict to predictors with at least 10 years of in-sample data.",
        "Compute in-sample Newey–West t-statistics and p-values; apply Bonferroni, Holm and BHY at alpha = 5%; record the implied t-hurdles.",
        "Cluster the anomaly return correlation matrix (distance sqrt((1 - rho)/2), ONC or hierarchical + silhouette) to estimate the effective number of independent tests K; recompute Bonferroni with K.",
        "For each surviving and non-surviving group, compute post-publication mean returns (McLean–Pontiff style decay) and test whether multiple-testing survivors decay less.",
        "Compute DSR for the single best anomaly treating the whole zoo as the trial set."
      ],
      "deliverables": [
        "Notebook and a reproducible data-download script",
        "Table of hurdles (Bonferroni/Holm/BHY, raw M vs. effective K)",
        "Plot of in-sample vs. post-publication t-statistics, coloured by survival",
        "A 2–3 page discussion relating results to HLZ, JKP and Chen (2025)"
      ],
      "acceptance": [
        "The BHY implementation matches statsmodels multipletests(method=\"fdr_by\") on the same p-values exactly.",
        "Reported hurdles are monotone: Bonferroni >= Holm-implied >= BHY-implied t-threshold.",
        "Effective K is reported with a stability check (K varies by less than 20% across 10 clustering seeds).",
        "Post-publication analysis includes at least 100 predictors and reports a regression of post-publication mean on in-sample mean with standard errors."
      ],
      "extensions": [
        "Estimate the false discovery proportion with a Storey-type pi_0 estimator and compare with Harvey–Liu (2020) style Type I / Type II calibration.",
        "Implement a simple empirical-Bayes shrinkage of anomaly alphas toward cluster means, in the spirit of JKP, and compare OOS performance with hard multiple-testing selection."
      ]
    }
  ],
  "frontier": {
    "asOf": "2026-11",
    "summary": "The field has moved from \"how much do backtests overfit?\" to \"how should evidence be weighed?\". One camp formalises deflation (DSR, PBO, effective trials) and multiple-testing hurdles; another argues, with large replication datasets and Bayesian shrinkage, that the published factor zoo is more reliable than hurdle-based reasoning implies. Meanwhile the success of heavily over-parameterised return-prediction models has reopened the question of what \"overfitting\" even means when the number of parameters exceeds the number of observations, and standard-setting work on Sharpe-ratio inference is trying to make deflation routine in reporting.",
    "threads": [
      {
        "title": "Is there a replication crisis? Bayesian vs. frequentist readings of the factor zoo",
        "why": "Large open replication efforts disagree in emphasis: some report that a majority of anomalies fail single-test hurdles, others that most replicate once implementation details and shrinkage are handled properly. The disagreement is mostly about methodology (micro-cap treatment, hurdles vs. shrinkage, in-sample vs. global out-of-sample evidence), which makes it a good laboratory for the tools in this module.",
        "refs": [
          {
            "label": "Jensen, Kelly & Pedersen (2023) — Is There a Replication Crisis in Finance?",
            "url": "https://doi.org/10.1111/jofi.13249"
          },
          {
            "label": "Hou, Xue & Zhang (2020) — Replicating Anomalies",
            "url": "https://doi.org/10.1093/rfs/hhy131"
          },
          {
            "label": "Chen & Zimmermann (2022) — Open Source Cross-Sectional Asset Pricing",
            "url": "https://doi.org/10.1561/104.00000112"
          }
        ]
      },
      {
        "title": "Calibrating multiple-testing hurdles: Type I, Type II and identification",
        "why": "HLZ popularised the t > 3 hurdle; Harvey and Liu later framed the hurdle as a trade-off between false and missed discoveries. Chen shows the case for raising hurdles is weakly identified because the distribution of unpublished results must be extrapolated. Practitioners are left choosing between FWER, FDR and Bayesian shrinkage depending on the cost structure of errors.",
        "refs": [
          {
            "label": "Harvey, Liu & Zhu (2016) — ...and the Cross-Section of Expected Returns",
            "url": "https://doi.org/10.1093/rfs/hhv059"
          },
          {
            "label": "Harvey & Liu (2020) — False (and Missed) Discoveries in Financial Economics",
            "url": "https://doi.org/10.1111/jofi.12951"
          },
          {
            "label": "Chen (2025) — Do t-Statistic Hurdles Need to Be Raised? (Management Science)",
            "url": "https://doi.org/10.1287/mnsc.2023.03083"
          }
        ]
      },
      {
        "title": "Making Sharpe-ratio deflation a reporting standard",
        "why": "The False Strategy Theorem gives the theoretical justification for deflation; the effective-trials clustering of López de Prado and Lewis makes it operational; and recent work proposes a full inference and reporting standard (PSR, MinTRL, DSR, with corrections for non-normality and small samples). Open issues are serial dependence, volatility clustering and how to audit trial counts across teams.",
        "refs": [
          {
            "label": "López de Prado & Bailey (2021) — The False Strategy Theorem: A Financial Application of Experimental Mathematics",
            "url": "https://doi.org/10.1080/00029890.2021.1965068"
          },
          {
            "label": "López de Prado & Lewis (2019) — Detection of False Investment Strategies Using Unsupervised Learning Methods",
            "url": "https://doi.org/10.1080/14697688.2019.1622311"
          },
          {
            "label": "López de Prado, Lipton & Zoonekynd (2025) — How to Use the Sharpe Ratio (SSRN)",
            "url": "https://papers.ssrn.com/abstract=5520741"
          }
        ]
      },
      {
        "title": "The virtue-of-complexity debate: is over-parameterisation overfitting?",
        "why": "Kelly, Malamud and Zhou argue that, with appropriate ridge shrinkage, out-of-sample timing performance can improve as the number of random features grows beyond the sample size. Nagel argues the apparent gains come from the estimator collapsing to a volatility-timed momentum rule rather than from learning the data's dynamics. The debate matters for overfitting diagnostics because classical parameter-counting intuitions, and the meaning of \"number of trials\", change in the high-dimensional regime.",
        "refs": [
          {
            "label": "Kelly, Malamud & Zhou (2024) — The Virtue of Complexity in Return Prediction",
            "url": "https://doi.org/10.1111/jofi.13298"
          },
          {
            "label": "Nagel (2025) — Seemingly Virtuous Complexity in Return Prediction (NBER WP 34104)",
            "url": "https://www.nber.org/papers/w34104"
          }
        ]
      }
    ],
    "openQuestions": [
      "How should the expected-maximum Sharpe formula be adapted to heavy-tailed, serially dependent and heteroskedastic returns, where the Gaussian extreme-value approximation is poor?",
      "Can the effective number of trials be estimated robustly when the trial log is incomplete (e.g. ideas borrowed from the literature or from colleagues)?",
      "When should a researcher prefer FDR control or Bayesian shrinkage over FWER hurdles, given realistic costs of false and missed discoveries in a multi-signal book?",
      "What is the right notion of \"degrees of freedom\" or \"number of trials\" for heavily over-parameterised ML models tuned by cross-validation?",
      "How much does publication and implementation decay (post-publication alpha decay, crowding) explain the gap between in-sample and live performance relative to pure statistical overfitting?"
    ],
    "brainstorm": [
      "Take one of your own past research ideas (public data only) and reconstruct an honest trial log: how large is N, and does the idea survive DSR at that N?",
      "Pick a disagreement (e.g. HXZ vs. JKP on replication) and identify the single methodological choice that drives most of the difference; can you reproduce it with OSAP data?",
      "Design a simulation where PBO and DSR disagree (one flags overfitting, the other does not) and explain why.",
      "Explore whether random-feature ridge models on a momentum-reversal simulated market behave as Nagel describes, and what that implies for counting trials.",
      "Draft a one-page \"backtest reporting standard\" for your personal research: which statistics, which trial-count disclosure, which holdout rules?"
    ]
  }
}
);
