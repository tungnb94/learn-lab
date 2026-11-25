LAB.extend("fml-backtest-overfitting", {
  "questions": [
    {
      "id": "fml-bo-q1",
      "type": "predict",
      "difficulty": 3,
      "prompt": "<p>You run $N=1000$ strategy variants on $T=1250$ daily observations. Unknown to you, every variant has true Sharpe ratio zero, returns are Gaussian, and any two variants have return correlation $\\rho$ (equicorrelated: one common component plus idiosyncratic noise). Before simulating, write down numerical predictions for $\\rho\\in\\{0,\\,0.5,\\,0.9\\}$:</p>\n<ol>\n<li>the expected maximum sample Sharpe ratio across the 1000 variants (per day and annualised);</li>\n<li>the expected cross-sectional variance of the 1000 sample Sharpe ratios, in units of $1/T$;</li>\n<li>the expected-maximum hurdle $\\widehat{SR}_0$ computed three ways: (a) raw $N$ with the <em>empirical</em> variance of the trial Sharpe ratios; (b) the heuristic $K=\\bar\\rho+(1-\\bar\\rho)N$ with the empirical variance; (c) raw $N$ with the theoretical null variance $1/T$;</li>\n<li>the false-positive rate of the rule \"DSR $\\ge 0.95$\" under (a), (b) and (c).</li>\n</ol>\n<p>Then check with a simulation of about 300 repetitions and explain every prediction you got wrong.</p>",
      "whyItMatters": "Many DSR implementations combine a clustered or heuristic effective number of trials with the empirical dispersion of trial Sharpe ratios. This question checks whether that corrects for correlation twice, and how far each choice is off.",
      "hints": [
        "Write each return as $\\sqrt\\rho\\,z_t+\\sqrt{1-\\rho}\\,\\varepsilon_{n,t}$. Which part of every sample Sharpe ratio is shared by all variants, and which part does the maximum act on?",
        "The maximum is a common shift plus $\\sqrt{1-\\rho}$ times the maximum of $N$ independent Sharpe ratios. The cross-sectional variance only sees the idiosyncratic part. Which of (a)–(c) already picks up $\\rho$ through the data?",
        "Expect a mean maximum of roughly 1.46, 1.04 and 0.48 (annualised), and an empirical variance of about $(1-\\rho)/T$. Using $K$ <em>and</em> the empirical variance corrects for correlation twice. For the false-positive rate, ask what the common shift $\\sqrt\\rho\\,z$ does to the selected strategy, given that the hurdle cannot see it."
      ],
      "keyPoints": [
        "Mean maximum $\\approx\\sqrt{1-\\rho}\\;\\mathbb{E}[\\max_N Z]/\\sqrt T$: about 0.092, 0.065 and 0.030 per day (about 1.46, 1.04 and 0.48 annualised) for $\\rho=0,\\,0.5,\\,0.9$.",
        "The cross-sectional variance of the trial Sharpe ratios is about $(1-\\rho)/T$: the common component shifts every trial equally and drops out of the dispersion.",
        "(a) Raw $N$ with the empirical variance reproduces the mean maximum closely. (b) Adding $K$ on top corrects for correlation twice and understates the hurdle (about 0.061 instead of 0.065 at $\\rho=0.5$, and 0.023 instead of 0.030 at $\\rho=0.9$). (c) Ignores correlation and overstates the hurdle (0.092 whatever $\\rho$ is).",
        "The false-positive rate of DSR is far below 5% at $\\rho=0$ but rises with $\\rho$ (a few percent at 0.5, near or above 5% at 0.9 for (a) and (b)). The reason is that common luck is not a selection effect: it lands entirely in the selected strategy's Sharpe ratio. Rule (c) is extremely conservative.",
        "Lesson: let effective trials enter either through N or through the dispersion term, never both, and say which one you used."
      ],
      "followUps": [
        "Repeat with a block structure: two families of 500 variants, correlation 0.9 within a family and 0 across. Which of (a)–(c) is right now, and what $K$ does ONC clustering return?",
        "Replace Gaussian returns with Student-t returns ($\\nu=3$) and $T=250$. Where does the Gumbel approximation itself start to fail?"
      ],
      "source": {
        "label": "López de Prado & Lewis (2019) — Detection of False Investment Strategies Using Unsupervised Learning Methods, Quantitative Finance 19(9) (effective number of trials)",
        "url": "https://doi.org/10.1080/14697688.2019.1622311",
        "relation": "motivated by"
      }
    },
    {
      "id": "fml-bo-q2",
      "type": "derive",
      "difficulty": 3,
      "prompt": "<p>A trial matrix contains $N-1$ pure-noise strategies and one strategy with true per-period Sharpe ratio $s>0$. All strategies are independent with IID Gaussian returns. In every CSCV split, the in-sample (IS) and out-of-sample (OOS) halves each hold $T/2$ observations. Treat the half-sample Sharpe estimates as Gaussian with variance $2/T$, and define $\\tau=s\\sqrt{T/2}$.</p>\n<ol>\n<li>Derive the probability $p_{\\text{win}}(\\tau,N)$ that the skilled strategy is the IS winner.</li>\n<li>Derive PBO$(\\tau,N)$ in terms of $p_{\\text{win}}$ and $\\tau$. A large-$N$ approximation for the OOS median is fine.</li>\n<li>Evaluate it for an annualised Sharpe ratio of 1.0 on $T=1000$ daily observations, with $N\\in\\{10,100,1000\\}$. What does this say about reading PBO as \"the probability that my selected strategy is a fluke\"?</li>\n<li>Give the condition on $\\tau$ for PBO to fall below about 0.1, and compare it with the MinBTL bound.</li>\n</ol>",
      "whyItMatters": "PBO is often read as a statement about one strategy. Deriving it in the simplest case where a skilled strategy exists shows that it measures something else, and how strongly it depends on how many noise trials sit next to the real one.",
      "hints": [
        "Split the outcome into two events: the skilled strategy wins in-sample, or a noise strategy wins. What is the OOS rank of a noise winner?",
        "$p_{\\text{win}}=\\int\\varphi(z)\\,\\Phi(z+\\tau)^{N-1}\\,dz$. If the skilled strategy wins, its OOS logit is positive roughly when its OOS Sharpe ratio beats the OOS median of the noise strategies, which is about 0.",
        "PBO $\\approx p_{\\text{win}}\\,(1-\\Phi(\\tau))+(1-p_{\\text{win}})/2$. With $\\tau\\approx1.41$ this gives about 0.30 for $N=10$, 0.43 for $N=100$ and 0.48 for $N=1000$."
      ],
      "keyPoints": [
        "Correct decomposition: PBO $\\approx p_{\\text{win}}(1-\\Phi(\\tau))+\\tfrac12(1-p_{\\text{win}})$ with $p_{\\text{win}}=\\int\\varphi(z)\\Phi(z+\\tau)^{N-1}dz$. The answer states that it uses independence of the two halves under IID returns.",
        "Values for $\\tau\\approx1.41$: about 0.30 ($N=10$), 0.43 ($N=100$) and 0.48 ($N=1000$). A genuine Sharpe-1 strategy is almost invisible to CSCV once it sits among 100 or more noise variants.",
        "PBO measures how reliable the selection procedure is on this trial set, not the probability that a given strategy is false. Adding noise trials raises PBO even though the skilled strategy has not changed.",
        "A small PBO needs $p_{\\text{win}}\\to1$, i.e. $\\tau$ well above $\\mathbb{E}[\\max_{N-1}Z]\\approx\\sqrt{2\\ln N}$. That is the same scaling as MinBTL, but applied to half the sample, so CSCV needs roughly twice the data that a full-sample argument suggests.",
        "Caveats: the CSCV combinations reuse the same blocks, so they are not independent draws; with small $N$ the ranks are discrete, and ties at $\\lambda=0$ are counted as overfit."
      ],
      "followUps": [
        "Generalise to M skilled strategies whose Sharpe ratios are drawn from a distribution. How does PBO depend on the share of skilled trials?",
        "Check your formula with the lesson's <code>pbo_cscv</code> on a simulated matrix. Where does the approximation fail (small $N$, small $S$)?"
      ],
      "source": {
        "label": "Bailey, Borwein, López de Prado & Zhu (2017) — The Probability of Backtest Overfitting, Journal of Computational Finance 20(4), Sec. 2–4",
        "url": "https://papers.ssrn.com/abstract=2326253",
        "relation": "motivated by"
      }
    },
    {
      "id": "fml-bo-q3",
      "type": "counterexample",
      "difficulty": 2,
      "prompt": "<p>For each case, build an explicit trial set: describe the return-generating process and give rough numbers. For each case, also say what DSR concludes.</p>\n<ol>\n<li><strong>PBO near 0 with zero skill.</strong> Every economically sensible strategy in the set has true Sharpe ratio zero, yet CSCV reports PBO $\\approx0$.</li>\n<li><strong>PBO near 0.5 with uniform skill.</strong> Every strategy has a true annualised Sharpe ratio of 1.5, yet PBO $\\approx0.5$.</li>\n<li><strong>DSR passes while the selection is uninformative.</strong> The selected strategy clears DSR $\\ge0.95$, but an honest PBO on the full search would be about 0.5.</li>\n</ol>\n<p>Then propose one reporting rule that would let a reviewer who sees only summary statistics detect cases 1 and 3.</p>",
      "whyItMatters": "PBO and DSR are only as honest as the trial set they are given, and they react to manipulation in opposite directions. Knowing how to game them is the fastest way to learn what to ask for when you review someone else's backtest.",
      "hints": [
        "PBO is a statement about ranks. What happens to the OOS rank of a noise winner if half of the columns are strategies that reliably lose money?",
        "In case 2, ask what separates strategies that share the same true Sharpe ratio. In case 3, ask which DSR inputs can be under-reported: N and the dispersion of the trial Sharpe ratios.",
        "Padding with at least N doomed strategies (for example, deliberately cost-heavy variants, or sign-flipped copies of something with a real positive drift) pushes the noise winner above the OOS median almost every time. DSR moves the other way, because the junk inflates the dispersion of trial Sharpe ratios. For case 3, hide trials, or report only a family of near-duplicates whose dispersion is tiny."
      ],
      "keyPoints": [
        "Case 1: padding with doomed trials (large negative true Sharpe ratio) lets the IS winner beat them OOS, so its relative rank exceeds 1/2 and PBO goes to 0. The authors list this misuse in their own limitations section.",
        "Case 2: when the true Sharpe ratios are identical, the IS ranking is pure noise among skilled strategies, so PBO is about 0.5 even though every choice is profitable. PBO says nothing about the absolute OOS level; look at the probability of loss and the distribution of OOS Sharpe ratios instead.",
        "DSR reacts to padding the other way: junk inflates $\\mathbb{V}[\\{\\widehat{SR}_n\\}]$ and so raises $\\widehat{SR}_0$. The two diagnostics therefore disagree in a predictable direction.",
        "Case 3: under-reporting $N$, or reporting only a low-dispersion family, shrinks $\\widehat{SR}_0$. DSR is only as honest as the trial log, and the same holds for PBO.",
        "A workable reporting rule: disclose the size of the full trial log, the distribution (not just the variance) of trial Sharpe ratios, PBO on the subset of trials that were admissible ex ante, and the probability of an OOS loss next to PBO."
      ],
      "followUps": [
        "Is there a statistic that rises with honest search effort and does not move when dominated strategies are added? Sketch one, or argue that none exists.",
        "How would you define the admissible trial set before the search, so that padding is ruled out without throwing away genuinely failed ideas?"
      ],
      "source": {
        "label": "Bailey, Borwein, López de Prado & Zhu (2017) — The Probability of Backtest Overfitting, Sec. 5 (Limitations and misuse)",
        "url": "https://papers.ssrn.com/abstract=2326253",
        "relation": "motivated by"
      }
    },
    {
      "id": "fml-bo-q4",
      "type": "critique",
      "difficulty": 2,
      "prompt": "<p>A colleague reports a daily US equity long/short strategy: 15 years of data, annualised Sharpe ratio 1.4, selected from 300 logged variants, DSR $=0.97$, \"so it is significant after multiple testing\". The variants differ in holding period (1–20 days, built from overlapping portfolios). The selected strategy's daily returns have first-order autocorrelation 0.15, skewness $-0.6$ and kurtosis 7.</p>\n<p>Identify at least five assumptions built into this DSR computation, in the expected-maximum formula and in the PSR step. For each one, state the <em>direction</em> in which its violation biases DSR here, give a rough magnitude where you can, and propose a concrete fix. End by naming the two violations most likely to overturn the conclusion.</p>",
      "whyItMatters": "DSR is becoming a standard reporting statistic. A researcher has to know which of its inputs are fragile for a typical equity strategy, and which correction changes the verdict.",
      "hints": [
        "Keep the hurdle $\\widehat{SR}_0$ (which depends on $N$ and the dispersion of the trials) separate from the PSR step (which depends on $T$, skewness, kurtosis and the IID assumption).",
        "Under positive autocorrelation, how does the variance of the sample mean scale (Lo 2002)? If the true Sharpe ratios differ across variants, what does the empirical variance of trial Sharpe ratios estimate? Which Sharpe ratio goes into the PSR denominator, the estimate or the null value?",
        "With $\\rho_1=0.15$, an AR(1) inflates the variance of the sample mean by roughly $(1+\\rho_1)/(1-\\rho_1)\\approx1.35$, so the z-score shrinks by about 14%. The empirical trial variance is estimation noise plus true dispersion, and only the noise belongs in a null hurdle."
      ],
      "keyPoints": [
        "Serial correlation: the IID standard error is too small under positive autocorrelation (the AR(1) factor is about $(1+\\rho)/(1-\\rho)$), so DSR is biased up. Fix it with a HAC or Lo-adjusted variance, or a block bootstrap. Overlapping holding periods make this unavoidable.",
        "Trial dispersion mixes noise with real differences between variants. If some variants truly differ, $\\mathbb{V}[\\{\\widehat{SR}_n\\}]$ overstates the null dispersion and the hurdle is too high. Fix it by subtracting the average squared standard error, or by measuring dispersion on a family generated under the null (for example, sign-randomised).",
        "Independence and the Gaussian maximum: correlated variants and short samples make the Gumbel approximation inaccurate. The 300 logged variants may also understate the real search (ideas from the literature and from colleagues), which biases DSR up.",
        "PSR plug-in: the denominator uses $\\widehat{SR}$ and the sample moments of the <em>selected</em> strategy, and those moments were selected too (a lucky low volatility or benign tails). A test under the null would evaluate the variance at $SR_0$. The answer should say which direction this goes with negative skew and check the size.",
        "Non-stationarity and costs: 15 years of daily equity data cover several regimes, while DSR assumes one stationary distribution. Costs and capacity are entirely outside DSR.",
        "Sensible ranking: serial correlation and an incomplete N are the most likely to overturn 0.97. Report DSR over a grid of N values and with a HAC variance."
      ],
      "followUps": [
        "Derive the PSR denominator for AR(1) returns and recompute MinTRL for this strategy.",
        "Design a permutation or sign-randomisation null that produces the trial dispersion under H0 directly from your own pipeline."
      ],
      "source": {
        "label": "Bailey & López de Prado (2014) — The Deflated Sharpe Ratio: Correcting for Selection Bias, Backtest Overfitting and Non-Normality, Journal of Portfolio Management 40(5)",
        "url": "https://papers.ssrn.com/abstract=2460551",
        "relation": "motivated by"
      }
    },
    {
      "id": "fml-bo-q5",
      "type": "debate",
      "difficulty": 3,
      "prompt": "<p>Two large replication efforts arrive at opposite headlines. Hou, Xue &amp; Zhang (2020) report that, once microcaps are controlled with NYSE breakpoints and value weighting, about 65% of 452 anomalies fail a single-test hurdle of $|t|\\ge1.96$, and 82% fail at 2.78. Jensen, Kelly &amp; Pedersen (2023) fit a Bayesian hierarchical model to 153 factors in 93 countries and conclude that most factors replicate, group into 13 themes and work out of sample. Harvey, Liu &amp; Zhu (2016) and Harvey (2017) argue for higher hurdles or Bayesianised evidence. Chen &amp; Zimmermann (2020) find publication bias to be modest, and Chen (2025) argues that the case for raising hurdles is weakly identified.</p>\n<ol>\n<li>Name the estimand each side actually measures (for example, \"share of anomalies significant under one specific implementation\" versus \"posterior probability that the true premium has the published sign\").</li>\n<li>Identify at least three methodological choices that drive most of the gap, and predict which way each moves the replication rate.</li>\n<li>For a practitioner allocating across about 150 public signals, which framework leads to better portfolio decisions, and why?</li>\n<li>Propose one test on the Open Source Asset Pricing data that would move you towards one side.</li>\n</ol>",
      "whyItMatters": "This module's tools (hurdles, FDR, deflation) are exactly what this debate is fought over. Taking a position forces you to say what a replication rate measures and how you would use it in a multi-signal book.",
      "hints": [
        "A replication rate is not a property of the data alone. It belongs to a combination of data, implementation, test statistic and threshold. Write down that combination for each side.",
        "Choices to look at: microcap weighting and breakpoints; raw long-short return versus factor-model alpha; one test at a time versus hierarchical shrinkage across related factors; in-sample versus post-publication versus international samples; and what counts as replicated (same sign and significant, or posterior sign).",
        "Value weighting with NYSE breakpoints mechanically reduces power for anomalies driven by small caps. Shrinkage borrows strength across a theme, so a factor with t = 1.5 can still have a high posterior probability of a positive premium. One test: compare the post-publication returns of anomalies that fail HXZ-style tests with those that pass, conditioning on a JKP-style posterior."
      ],
      "keyPoints": [
        "The two sides answer different questions. HXZ test whether one specific value-weighted implementation has a significant raw premium. JKP estimate whether the true alpha has the published sign, using prior information across factors and markets.",
        "Choices with predicted directions: value weighting and NYSE breakpoints lower the rate; CAPM alpha instead of raw return often raises it for low-beta anomalies; hierarchical shrinkage raises it for weak factors that their theme supports; higher t-hurdles lower it; out-of-sample and international evidence add independent information and can move it either way.",
        "The HLZ and Harvey case rests on tests nobody observes (the file drawer). Chen (2025) shows that the right hurdle depends on extrapolating unpublished t-statistics and is weakly identified, whereas FDR and shrinkage on published results are well identified.",
        "A practitioner verdict with reasons: for a diversified book, shrinkage- or FDR-style weighting beats a binary accept/reject decision. FWER hurdles matter for a single high-stakes launch.",
        "A concrete, falsifiable OSAP test, for example post-publication decay regressed on the in-sample t-statistic and on the shrinkage posterior, in the style of McLean and Pontiff."
      ],
      "followUps": [
        "Re-run the HXZ test on OSAP portfolios with equal versus value weighting and report how the replication rate moves.",
        "Write down the prior you would need in order to believe that most anomalies are false, given the JKP data. Can you defend it?"
      ],
      "source": {
        "label": "Published debate: Hou, Xue & Zhang (2020) and Harvey, Liu & Zhu (2016) vs. Jensen, Kelly & Pedersen (2023) and Chen (2025)",
        "url": "https://doi.org/10.1111/jofi.13249",
        "relation": "motivated by"
      },
      "sides": [
        {
          "position": "There is a real replication and multiple-testing problem: many anomalies do not survive realistic implementations, and the bar for evidence should be raised (higher t-hurdles, Bayesianised p-values).",
          "refs": [
            {
              "label": "Hou, Xue & Zhang (2020) — Replicating Anomalies, Review of Financial Studies 33(5)",
              "url": "https://doi.org/10.1093/rfs/hhy131"
            },
            {
              "label": "Harvey, Liu & Zhu (2016) — ...and the Cross-Section of Expected Returns, Review of Financial Studies 29(1)",
              "url": "https://doi.org/10.1093/rfs/hhv059"
            },
            {
              "label": "Harvey (2017) — Presidential Address: The Scientific Outlook in Financial Economics, Journal of Finance 72(4)",
              "url": "https://doi.org/10.1111/jofi.12530"
            }
          ]
        },
        {
          "position": "Most factors replicate once implementation and shrinkage are handled properly. Publication bias is modest, and raising hurdles is weakly identified, so shrinkage and FDR on published evidence are the better tools.",
          "refs": [
            {
              "label": "Jensen, Kelly & Pedersen (2023) — Is There a Replication Crisis in Finance?, Journal of Finance 78(5)",
              "url": "https://doi.org/10.1111/jofi.13249"
            },
            {
              "label": "Chen & Zimmermann (2020) — Publication Bias and the Cross-Section of Stock Returns, Review of Asset Pricing Studies 10(2)",
              "url": "https://doi.org/10.1093/rapstu/raz011"
            },
            {
              "label": "Chen (2025) — Do t-Statistic Hurdles Need to Be Raised?, Management Science 71(7)",
              "url": "https://doi.org/10.1287/mnsc.2023.03083"
            }
          ]
        }
      ]
    },
    {
      "id": "fml-bo-q6",
      "type": "debate",
      "difficulty": 3,
      "prompt": "<p>Kelly, Malamud &amp; Zhou (2024) expand 15 predictors into thousands of random Fourier features and fit ridge (and ridgeless) regressions on rolling windows as short as 12 months. Out-of-sample market-timing Sharpe ratios <em>rise</em> as the ratio of parameters to observations grows. Their theory says that in a misspecified world, extra shrunk parameters can improve out-of-sample performance even when $R^2$ is negative. Nagel (2025) argues that with $P\\gg T$ the forecast collapses to a similarity-weighted average of the training returns, essentially volatility-timed momentum, and that the same machinery produces momentum forecasts even on simulated data with reversals. Kelly &amp; Malamud (2025) reply that the critique confuses nominal with effective complexity.</p>\n<ol>\n<li>State each side's claim precisely, in terms of what the model learns from the predictors.</li>\n<li>From this module's point of view: what is the \"number of trials\" in the KMZ exercise? Is a rising complexity curve evidence against overfitting, evidence of it, or neither?</li>\n<li>Design two diagnostics that would tell \"learns from the predictors\" apart from \"recency-weighted momentum in disguise\", and predict what each side expects to see.</li>\n</ol>",
      "whyItMatters": "Over-parameterised models are now common in equity research. Counting parameters is no longer a usable notion of overfitting, so you need a sharper one.",
      "hints": [
        "With $T=12$ and $P$ in the thousands, ridgeless regression behaves like a kernel method. Write the forecast as $\\sum_t k(x_{\\text{now}},x_t)\\,r_{t+1}$ and ask what sets the kernel weights.",
        "Overfitting in the backtest sense is about selection: which choices (window length, ridge-penalty grid, feature bandwidth, predictor set, sample period) were made after seeing results? The complexity curve is itself one curve out of many that could have been drawn.",
        "Diagnostics: (i) replace the predictors with independent noise that has matched volatility dynamics; if performance survives, the predictors are not the source. (ii) Simulate one market with reversal and one with momentum. (iii) Regress the RFF position on a volatility-scaled trailing return and test whether the residual has timing value."
      ],
      "keyPoints": [
        "KMZ: over-parameterised ridge can raise OOS Sharpe ratios in misspecified settings, and the empirical complexity curve is the evidence. The claim is about a class of estimators, not about a particular signal.",
        "Nagel: when $P\\gg T$, the kernel weights mostly reflect closeness in time and predictor volatility, so the strategy is volatility-timed momentum. It worked because momentum worked in the sample, and it fails when the data-generating process has reversals.",
        "Overfitting angle: the trials that matter are the design choices (window, kernel bandwidth, penalty, predictor set), not the number of parameters. A smooth complexity curve does not deflate those choices.",
        "Diagnostics that separate the two views, with each side's predicted outcome: placebo predictors, a reversal simulation, and a spanning regression on a volatility-managed momentum benchmark (scaling as in Moreira and Muir).",
        "A balanced verdict: both can be true. The estimator theory can hold while most of this particular empirical gain is explained by a simple benchmark. What decides it is the performance added over that benchmark, deflated for the design search."
      ],
      "followUps": [
        "Replicate Nagel's reversal simulation with a 12-month window and P = 6000 random Fourier features. Report the correlation between the RFF position and a volatility-scaled 12-month return.",
        "Does the benign-overfitting (double descent) literature in ML support the KMZ mechanism, and does it still apply when T = 12?"
      ],
      "source": {
        "label": "Nagel (2025) — Seemingly Virtuous Complexity in Return Prediction, NBER WP 34104",
        "url": "https://www.nber.org/papers/w34104",
        "relation": "motivated by"
      },
      "sides": [
        {
          "position": "Complexity is a virtue: in misspecified settings, heavily shrunk over-parameterised models genuinely improve out-of-sample return prediction and timing performance.",
          "refs": [
            {
              "label": "Kelly, Malamud & Zhou (2024) — The Virtue of Complexity in Return Prediction, Journal of Finance 79(1)",
              "url": "https://doi.org/10.1111/jofi.13298"
            },
            {
              "label": "Kelly & Malamud (2025) — Understanding The Virtue of Complexity (SSRN / SFI RP 25-96)",
              "url": "https://papers.ssrn.com/abstract=5346842"
            }
          ]
        },
        {
          "position": "The virtue is only apparent: with very short training windows the random-feature forecast reduces to volatility-timed momentum, so its success reflects momentum in the sample, not learning from the predictors.",
          "refs": [
            {
              "label": "Nagel (2025) — Seemingly Virtuous Complexity in Return Prediction, NBER WP 34104",
              "url": "https://www.nber.org/papers/w34104"
            }
          ]
        }
      ]
    },
    {
      "id": "fml-bo-q7",
      "type": "connect",
      "difficulty": 3,
      "prompt": "<p>Three research communities ran into the same wall. In machine learning, Dwork et al. (2015) showed that a holdout reused adaptively loses its validity, and proposed a \"reusable holdout\" (Thresholdout) built on differential privacy. Blum &amp; Hardt (2015) designed a leaderboard mechanism (the Ladder) that resists overfitting to a public test set. Recht et al. (2019) rebuilt ImageNet's test set and found accuracy drops of 11–14% with model rankings largely preserved; they attribute the drop to a shift in difficulty rather than to adaptive overfitting. In finance, every look at the holdout is a trial.</p>\n<ol>\n<li>Map the concepts: what are the finance analogues of a holdout query, a leaderboard submission, a new test set and a distribution shift?</li>\n<li>Thresholdout only reports the holdout result when it differs from the training result by more than a noisy threshold. Sketch a \"Thresholdout for backtests\" for a research team that shares one 2019–2024 holdout. What does it buy, and what does it cost in power, when about 1250 holdout days must support around 200 adaptive queries?</li>\n<li>The Recht et al. pattern (levels drop, rankings survive) looks like the post-publication decay of equity anomalies. What would adaptive overfitting predict for the cross-sectional slope of post-publication returns on in-sample returns, and what would shift or arbitrage predict? Which pattern do you expect for equity anomalies?</li>\n</ol>",
      "whyItMatters": "Holdout reuse is the most common way honest teams overfit. The ML literature has formal tools and a clean empirical test, both of which carry over to backtesting.",
      "hints": [
        "In adaptive data analysis the danger grows with the number and the adaptivity of queries to the holdout, not with the number of models fitted on the training data.",
        "Thresholdout adds Laplace noise to the threshold and to the answers. Its guarantees allow a number of queries that grows roughly with the square of the holdout size, subject to a budget on how often the threshold is crossed. For a daily Sharpe ratio, the noise needed per query is comparable to the standard error of the Sharpe estimate.",
        "Adaptive overfitting predicts the largest decay for the signals that were selected hardest (the highest in-sample t-statistics), so the slope flattens. A uniform shift or arbitrage predicts roughly proportional decay with the ordering preserved: a slope well below 1 but still positive."
      ],
      "keyPoints": [
        "Correct mapping: a holdout query is any look at the reserved period that affects a decision; a leaderboard is a shared backtest platform or internal signal ranking; a new test set is genuinely new data (after the sample, or new markets); a shift is a regime change, crowding or post-publication arbitrage.",
        "Mechanism sketch: answer holdout queries only through a noisy comparison with the in-sample result, with a budget on threshold breaches. The cost is coarser answers (noise on the order of one Sharpe standard error); the gain is valid inference across many adaptive queries.",
        "Quantitative sense: with about 1250 daily observations, the standard error of an annualised Sharpe ratio is about 0.45, so 200 unprotected adaptive queries can produce an apparent holdout Sharpe ratio of about 1.2 by expected-maximum logic. That is what the mechanism has to prevent.",
        "Recht-style reading of anomalies: proportional decay with rankings preserved points to shift or arbitrage (consistent with McLean–Pontiff-type evidence); decay concentrated in the highest in-sample t-statistics points to selection-driven overfitting.",
        "Limits of the analogy, stated explicitly: financial data are non-stationary and serially dependent, while the privacy-based guarantees assume IID samples."
      ],
      "followUps": [
        "Implement Thresholdout on a simulated research loop of 200 adaptive momentum tweaks, and compare the holdout Sharpe ratio of the final choice with and without the mechanism.",
        "LLM benchmarks face the same problem (contamination, leaderboard chasing). What would an 'ImageNet v2' for an equity signal library look like?"
      ],
      "source": {
        "label": "Original cross-domain question, drawing on Dwork et al. (2015, Science, doi:10.1126/science.aaa9375), Blum & Hardt (2015, arXiv:1502.04585) and Recht et al. (2019, arXiv:1902.10811)",
        "url": "",
        "relation": "original"
      }
    },
    {
      "id": "fml-bo-q8",
      "type": "design",
      "difficulty": 3,
      "prompt": "<p>You picked one equity signal out of 200 logged variants; ONC finds $K\\approx40$ clusters. The backtest covers 10 years of daily returns with an annualised Sharpe ratio of 1.6. The 40 cluster Sharpe ratios have mean 0.5 and standard deviation 0.45 (annualised). The strategy is about to go live with a risk budget.</p>\n<ol>\n<li>Design an estimator of the strategy's <em>expected live</em> Sharpe ratio that accounts for the selection. This is an estimate, not a test. Compare at least two approaches, for example empirical-Bayes shrinkage using the cross-section of trials and a conditional (\"inference on winners\") correction, and give rough numbers.</li>\n<li>Design a live monitoring rule that decides when to cut the strategy. Specify the statistic, the null and alternative hypotheses, the false-kill rate you accept, and the expected detection delay if the true Sharpe ratio is zero.</li>\n<li>List what must be logged now so that both parts can be audited two years from now.</li>\n</ol>",
      "whyItMatters": "DSR tells you whether to believe a backtest. Sizing and monitoring need a number: the Sharpe ratio you actually expect live. Deriving it, and seeing how slowly live data can contradict it, changes how kill switches are designed.",
      "hints": [
        "A backtest Sharpe ratio that is the maximum of a search estimates that maximum, not the winner's true Sharpe ratio. You have a cross-section of trials; use it as a prior.",
        "Normal-normal empirical Bayes: true Sharpe ratios $\\sim N(m,\\tau^2)$, with squared standard error about $1/10$ in annual units. Then $\\tau^2$ is the observed dispersion squared minus the squared SE, and the posterior mean is $m+\\frac{\\tau^2}{\\tau^2+SE^2}(\\widehat{SR}-m)$. For monitoring, run a CUSUM or SPRT on daily returns between H0: SR = 0 and H1: SR = the posterior mean.",
        "With dispersion 0.45 and SE about 0.32: $\\tau^2\\approx0.20-0.10=0.10$, the shrinkage factor is about 0.5 and the posterior mean is about $0.5+0.5\\times1.1\\approx1.05$. Telling a Sharpe ratio of about 1 apart from 0 at a one-sided 5% level with 80% power takes roughly $(1.645+0.84)^2\\approx6$ years of data. No monitoring rule can be both fast and accurate."
      ],
      "keyPoints": [
        "Separates estimation (the expected live Sharpe ratio) from testing (DSR); the raw 1.6 is biased upward because it is the maximum of a search.",
        "Empirical Bayes: the deconvolved prior variance is $\\tau^2=0.45^2-0.1\\approx0.10$, the shrinkage factor is about 0.5 and the posterior mean is about 1.05. A correctly specified Bayesian posterior is not affected by selection; conditional (inference-on-winners) methods correct for selection without a prior but give wider intervals.",
        "Monitoring: an SPRT or CUSUM with explicit H0 and H1, a stated false-kill rate, and an honest detection-delay calculation (years, not months, for Sharpe differences of about 1). This motivates extra diagnostics with higher signal-to-noise: IC decay, slippage against the cost model, crowding and factor exposures.",
        "Logging: the full trial log with return series, code hash and parameter grid; the clustering output; the prior estimate; and the kill rule with its parameters, all fixed before going live.",
        "Treats drift in costs and capacity as a separate kill criterion, independent of noise in the Sharpe ratio."
      ],
      "followUps": [
        "How does the shrinkage change if the trial dispersion is computed across all 200 variants instead of the 40 clusters?",
        "Simulate your CUSUM rule on 1,000 paths with SR = 0 and with SR = 1, and report the false-kill rate and the median detection time."
      ],
      "source": {
        "label": "Original design question (related reading: Andrews, Kitagawa & McCloskey (2024) — Inference on Winners, Quarterly Journal of Economics 139(1), doi:10.1093/qje/qjad043)",
        "url": "",
        "relation": "original"
      }
    }
  ],
  "projects": [
    {
      "id": "fml-backtest-overfitting-r1",
      "title": "Replicating the CSCV Seasonal-Strategy Experiment (Bailey, Borwein, López de Prado & Zhu)",
      "level": "replication",
      "hours": "10–15",
      "paper": {
        "label": "Bailey, Borwein, López de Prado & Zhu (2017) — The Probability of Backtest Overfitting, Journal of Computational Finance 20(4)",
        "url": "https://papers.ssrn.com/abstract=2326253"
      },
      "goal": "Reproduce the practical application in Section 6 of the PBO paper. A four-parameter monthly trading rule (entry day, holding period, stop-loss, side) is optimised on (1) a pure random walk and (2) a random walk with an injected seasonal effect, and CSCV must flag the first as overfit and pass the second. Then measure how much of the paper's single-seed numbers is luck, and how sensitive PBO is to S, grid size, effect size and sample length. The deliverable includes a discrepancy write-up comparing every reported number with your replication.",
      "data": "Synthetic only: random-walk prices generated from a documented list of seeds. No market data is needed. If you add a real-data extension, use public data only (for example Ken French portfolios or FRED index series). Never use employer data, code or infrastructure.",
      "steps": [
        "Read Sec. 2.2 (CSCV), Sec. 5 (limitations) and Sec. 6. Record every reported number. Example 1 (random walk, 1,000 daily observations): IS-optimal annualised Sharpe 1.27, PSR statistic 2.83, about 53% of OOS Sharpe ratios negative, PBO about 55%. Example 2 (first 5 observations of each month shifted to +0.25 sigma): Sharpe 1.54, about 13% negative OOS Sharpe ratios, PBO about 13%.",
        "Implement the monthly rule and the T x N trial matrix: entry day 1–22, holding period 1–20, stop-loss as a multiple of volatility, side +/-1. The paper reports 8,800 grid nodes but lists stop-loss values 0–10 (11 values give 9,680); choose a convention and document it.",
        "Implement CSCV with S = 16 (12,870 combinations), vectorised. Compute logits, PBO, the IS-vs-OOS degradation regression, the probability of loss and the stochastic-dominance plot.",
        "Run each example on 100 independent seeds. Record the distributions of IS-optimal Sharpe, PBO and probability of OOS loss, and locate the paper's single-seed numbers in those distributions.",
        "Sensitivity: S in {8, 12, 16, 20}; a coarse grid of about 500 nodes; seasonal effect in {0.1, 0.25, 0.5} sigma; T in {1000, 2000}. The paper itself advises choosing T as double the sample used for selection.",
        "Cross-check with DSR, using the full grid as the trial set, with raw N and with an effective K from clustering the trial matrix."
      ],
      "deliverables": [
        "A tested Python module (rule simulator, trial-matrix builder, CSCV) and a notebook",
        "A 'paper vs. replication' table covering every number reported in Sec. 6, with your seed-distribution interval",
        "Figures analogous to the paper's: performance degradation, logit histogram, stochastic dominance",
        "A 1–2 page discrepancy write-up explaining each gap (seed luck, grid definition, stop-loss convention, annualisation, how ties in ranks are handled)"
      ],
      "acceptance": [
        "A brute-force (non-vectorised) CSCV on a small case (S = 6, N = 20) gives exactly the same logits as the vectorised version.",
        "CSCV on a pure-noise matrix of the same shape gives a mean PBO in [0.45, 0.55] over 100 seeds.",
        "Example 1: the median PBO across seeds lies in [0.35, 0.65], and the paper's IS Sharpe of 1.27 falls within your 5th–95th percentile range; otherwise the discrepancy write-up explains why.",
        "Example 2 (0.25 sigma effect): the median PBO is below 0.30 and lower than Example 1's on at least 80% of paired seeds; otherwise the write-up diagnoses the cause with a supporting experiment.",
        "The discrepancy table covers every number reported in Sec. 6, with your replication value, interval and explanation."
      ],
      "extensions": [
        "Add purging and an embargo at block boundaries and measure the change in PBO on Example 2.",
        "Replace the seasonal grid with a momentum grid on Ken French industry portfolios (public data) and compare the PBO and DSR verdicts.",
        "Replicate one of the Monte Carlo or extreme-value accuracy checks in the authors' companion test-case study (SSRN 2568435, referenced in Sec. 1 of the paper)."
      ]
    }
  ]
});
