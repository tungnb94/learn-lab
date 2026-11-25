LAB.extend("fml-cross-validation", {
  "questions": [
    {
      "id": "fml-cv-q1",
      "type": "derive",
      "difficulty": 3,
      "prompt": "<p>CPCV with $N=10$, $k=2$ gives $\\binom{10}{2}=45$ splits and $\\varphi=9$ paths. People often report the spread of path Sharpe ratios as \"the uncertainty of the strategy\". Build a model that shows what that spread actually measures.</p>\n<p>Assume one-period labels (so no purging is needed), per-period P&amp;L $\\pi_{p,t}=w_{p,t}\\,r_t$, and positions $w_{s,t}=m_t+\\eta_{s,t}$. Here $m_t$ is the position an infinitely-trained model would take, and $\\eta_{s,t}$ is the estimation noise of the model fitted in split $s$. Take $\\operatorname{Corr}(\\eta_{s,t},\\eta_{s',t})=\\rho_{ss'}$ to be roughly the fraction of training groups the two splits share.</p>\n<ol>\n<li>Two splits both test group $g$, with test sets $\\{g\\}\\cup A$ and $\\{g\\}\\cup B$, $|A|=|B|=k-1$, $|A\\cap B|=j$. Show that they share a training fraction $\\rho=\\frac{N-2k+1+j}{N-k}$. Evaluate the average $\\bar\\rho$ for $N=10,k=2$ and for $N=10,k=4$.</li>\n<li>Split the variance of one path's mean P&amp;L (and so, to first order, its Sharpe ratio) into a return-sampling term $V_r$ and a model-noise term $V_\\eta$. Derive (i) the expected cross-path sample variance and (ii) the correlation between two path Sharpe ratios, in terms of $V_r$, $V_\\eta$ and $\\bar\\rho$.</li>\n<li>Does the cross-path spread understate or overstate the true uncertainty of the strategy's Sharpe ratio? By roughly how much, for a weak signal traded daily for 10 years?</li>\n<li>Say exactly which inputs of the Deflated Sharpe Ratio the CPCV output may feed, and which it must not.</li>\n</ol>",
      "whyItMatters": "CPCV histograms are now shown as evidence of robustness. If their spread only measures model instability, a narrow histogram can sit on top of a Sharpe ratio that is statistically indistinguishable from zero.",
      "hints": [
        "At a fixed timestamp $t$, what differs between two paths: the return, the position, or both?",
        "Write the mean P&amp;L of path $p$ as a common part $\\frac1T\\sum_t m_t r_t$ plus a split-specific part $\\frac1T\\sum_t \\eta_{p,t} r_t$. Compute the variance and covariance, treating $r$ as random and the $\\eta$'s as correlated through training overlap.",
        "You should get $\\operatorname{Var}\\approx V_r+V_\\eta$ and $\\operatorname{Cov}(p,q)\\approx V_r+\\bar\\rho V_\\eta$, so the cross-path sample variance only estimates $(1-\\bar\\rho)V_\\eta$. For $N=10,k=2$, $j=0$ always and $\\bar\\rho=7/8$."
      ],
      "keyPoints": [
        "Every path re-uses the same realised returns. Paths differ only through model-estimation noise, so cross-path dispersion leaves out the dominant return-sampling term.",
        "Shared training fraction is $(N-2k+1+j)/(N-k)$: $7/8$ for $N=10,k=2$. For $N=10,k=4$ it is $(3+j)/6$ with $\\mathbb{E}[j]\\approx1$, so $\\bar\\rho\\approx2/3$.",
        "$\\operatorname{Corr}(SR_p,SR_q)\\approx (V_r+\\bar\\rho V_\\eta)/(V_r+V_\\eta)$ and $\\mathbb{E}[\\text{cross-path var}]=(1-\\bar\\rho)V_\\eta\\le(1-\\bar\\rho)\\,\\operatorname{Var}(SR_p)$. With $V_r\\approx(1+SR^2/2)/T$ per period (Lo 2002), this is a lower bound. A reference simulation (weak signal, 10y daily, $N=10,k=2$) gave a cross-path sd of about 0.12–0.14 against a true sd of the path-mean SR of about 0.36–0.44, annualised.",
        "Raising $k$ adds paths and lowers $\\bar\\rho$ only by shrinking the training sets. No number of paths adds information about return sampling, which is capped by $T$.",
        "DSR: use the mean (or pooled) path SR as $\\widehat{SR}$, and take the moments and $T$ from one path, not $\\varphi T$. The number of trials and $V[\\{SR_n\\}]$ must come from the configuration log, never from $\\varphi$ or the cross-path spread."
      ],
      "followUps": [
        "Tibshirani &amp; Tibshirani (2009) correct the optimism of the minimum CV error using fold-wise error curves. Build the analogous correction for the maximum, over configurations, of the mean CPCV path Sharpe, and relate it to the expected-maximum term in the DSR.",
        "Propose an estimator of $V_\\eta$ from CPCV output alone (e.g. refit the same split with different seeds versus fitting different splits), and use it to flag strategies whose edge is model-unstable."
      ],
      "source": {
        "label": "Motivated by López de Prado (2018), Advances in Financial Machine Learning, ch. 12 (CPCV) and Bailey & López de Prado (2014) — The Deflated Sharpe Ratio",
        "url": "https://papers.ssrn.com/abstract=2460551",
        "relation": "motivated by"
      }
    },
    {
      "id": "fml-cv-q2",
      "type": "derive",
      "difficulty": 2,
      "prompt": "<p>A strategy produces $T=100{,}000$ event-based forecasts. Labels last $h=50$ events on average, and the longest feature lookback is $L=200$ events, which you use as the embargo. You want about 1,000 CPCV paths, and you can afford about 5,000 model fits.</p>\n<ol>\n<li>Using $\\varphi=\\binom{N-1}{k-1}$ and $\\#\\text{fits}=\\binom{N}{k}=\\varphi N/k$, list every $(N,k)$ with $\\varphi$ within 5% of 1,000. Include the $k=2$ family and the \"mirror\" solutions that come from $\\binom{n}{m}=\\binom{n}{n-m}$.</li>\n<li>For each candidate, compute the group length $T/N$, the nominal training fraction $1-k/N$, and the expected share of data lost to purging and embargo per split. Treat each isolated test block as costing about $2h+L$ observations, and derive the expected number of adjacent test-group pairs.</li>\n<li>Pick one configuration and defend it. Then argue whether 1,000 paths are worth having at all, given what the previous question showed about path correlation.</li>\n</ol>",
      "whyItMatters": "Choosing $(N,k)$ is usually done by habit. Doing it by computation shows that purging is rarely the binding constraint, while compute, training fraction and the diminishing value of correlated paths are.",
      "hints": [
        "$\\varphi$ is symmetric in $k-1$ and $N-k$. Scan $m=k-1=1,2,3,\\dots$ for $n=N-1$ with $\\binom{n}{m}$ near 1,000.",
        "Count adjacent pairs among $k$ test groups chosen from $N$ in a line. Use linearity of expectation over the $N-1$ neighbouring pairs of groups.",
        "A given neighbouring pair is entirely in the test set with probability $\\frac{k(k-1)}{N(N-1)}$, so the expected number of adjacent pairs is $k(k-1)/N$."
      ],
      "keyPoints": [
        "Candidates: $k=2$ with $N\\in[951,1051]$ (and its mirror $k=N-1$); $(46,3)$ and $(47,3)$; $(20,4)$ with 969 paths; $(15,5)$ with 1,001; plus the mirrors $(46,44)$, $(20,17)$, $(15,11)$, which have tiny training fractions.",
        "Fits $=\\varphi N/k$. Only $(15,5)$ with 3,003 fits, $(20,4)$ with 4,845, and the low-training mirrors fit the budget. $k=2$ needs about 500k fits, and $(46,3)$ about 15k.",
        "Expected isolated blocks $\\approx k-k(k-1)/N$ (3.4 for $(20,4)$). Loss is about blocks $\\times(2h+L)\\approx1\\%$ of $T$, so purging is not the binding constraint here.",
        "$(20,4)$ is the best choice: training fraction 0.8, group length $5{,}000=100h$, within budget.",
        "At $(20,4)$, two splits that test the same group share $(13+j)/16\\approx84\\%$ of their training groups. So 969 paths add little over roughly 10–50 for estimating the mean; the extra paths mainly sharpen quantiles of the model-noise distribution."
      ],
      "followUps": [
        "Suppose labels were triple-barrier labels with a heavy right tail of durations, some lasting 2,000 events. Redo the loss calculation using the distribution of $t_1-t_0$ rather than its mean.",
        "Design a sequential rule: keep adding CPCV splits until the standard error of the mean path Sharpe, accounting for path correlation, falls below a threshold."
      ],
      "source": {
        "label": "López de Prado (2018), Advances in Financial Machine Learning, ch. 12 (CPCV path and split counting), motivated by",
        "url": "",
        "relation": "motivated by"
      }
    },
    {
      "id": "fml-cv-q3",
      "type": "debate",
      "difficulty": 3,
      "prompt": "<p>To backtest a learned strategy, one camp prefers purged (combinatorial) cross-validation. It uses all the data for testing, every forecast comes from a model with a similar training size, and after purging and embargo, training on the future carries no label information. The other camp says only causal, rolling-origin evaluation simulates the real decision problem, and that under non-stationarity CV mixes regimes and gives systematically misleading estimates.</p>\n<p>Take a concrete case: a daily US equity cross-sectional reversal strategy, 1995–2024, which lived through decimalization (2001), Reg NMS (2005–07) and the rise of electronic market-making.</p>\n<ol>\n<li>State precisely the estimand of each camp: what does \"performance\" mean for each?</li>\n<li>Identify the empirical evidence each side relies on, and its scope conditions.</li>\n<li>Design a synthetic experiment whose outcome would change your mind. Specify which features of the data-generating process should favour each side.</li>\n<li>Give your recommendation for this strategy.</li>\n</ol>",
      "whyItMatters": "The choice of backtest scheme decides which number reaches the investment committee. The literature supports both sides only under conditions that are rarely checked for the strategy at hand.",
      "hints": [
        "Before arguing, write down the quantity each method estimates. Are they even the same quantity?",
        "Read the scope conditions. Bergmeir, Hyndman &amp; Koo assume a stationary autoregressive setting with uncorrelated errors. Cerqueira et al. separate their real series by stationarity.",
        "A decisive experiment measures each estimator's error against the true performance on data generated after the end of the sample. Run it under a coefficient path that is constant, breaks once, or drifts."
      ],
      "keyPoints": [
        "The estimands differ. CV/CPCV estimates the average performance of the learning procedure across scenarios drawn from the whole sample. Walk-forward estimates the performance of the procedure as it would have run in real time, which depends on the order of regimes.",
        "The evidence for CV (Bergmeir &amp; Benítez 2012; Bergmeir, Hyndman &amp; Koo 2018) comes from stationary series or models with uncorrelated errors. Arian et al. (2024) use synthetic Heston and jump-diffusion markets, which are stationary by construction.",
        "The evidence for out-of-sample evaluation (Cerqueira et al. 2020; Tashman 2000 on rolling origins) comes from real, often non-stationary series, where holding out later periods estimates future error better.",
        "A good synthetic test turns one dial (stationary, single break, slow drift in the signal coefficient) and scores every estimator against the realised performance after the sample end.",
        "For a microstructure-dependent edge: use purged CV/CPCV for model selection, treat break dates as group boundaries, and report walk-forward (or CV restricted to post-break data) as the deployable estimate."
      ],
      "followUps": [
        "Arian et al. (2024) propose bagged and adaptive CPCV variants. Which of the non-stationarity objections do these address, and which do they leave open?",
        "Does post-publication decay of anomalies favour one camp? Model it as a drifting coefficient and predict the sign of each estimator's bias."
      ],
      "source": {
        "label": "Published debate: Bergmeir & Benítez (2012) and Bergmeir, Hyndman & Koo (2018) versus Cerqueira, Torgo & Mozetič (2020)",
        "url": "https://doi.org/10.1007/s10994-020-05910-7",
        "relation": "motivated by"
      },
      "sides": [
        {
          "position": "Purged K-fold / CPCV is the better estimator once leakage is removed: it uses the data more efficiently and gives a distribution instead of a single path.",
          "refs": [
            {
              "label": "López de Prado (2018), Advances in Financial Machine Learning, ch. 12 (Backtesting through Cross-Validation)",
              "url": ""
            },
            {
              "label": "Arian, Norouzi Mobarekeh & Seco (2024) — Backtest overfitting in the machine learning era: A comparison of out-of-sample testing methods in a synthetic controlled environment",
              "url": "https://doi.org/10.1016/j.knosys.2024.112477"
            },
            {
              "label": "Bergmeir & Benítez (2012) — On the use of cross-validation for time series predictor evaluation (Information Sciences 191)",
              "url": "https://research.monash.edu/en/publications/on-the-use-of-cross-validation-for-time-series-predictor-evaluati/"
            },
            {
              "label": "Bergmeir, Hyndman & Koo (2018) — A note on the validity of cross-validation for evaluating autoregressive time series prediction",
              "url": "https://doi.org/10.1016/j.csda.2017.11.003"
            }
          ]
        },
        {
          "position": "Causal out-of-sample (rolling-origin / walk-forward) evaluation is needed: non-stationarity breaks CV's exchangeability, and the single causal path matches the deployment problem.",
          "refs": [
            {
              "label": "Cerqueira, Torgo & Mozetič (2020) — Evaluating time series forecasting models: an empirical study on performance estimation methods",
              "url": "https://doi.org/10.1007/s10994-020-05910-7"
            },
            {
              "label": "Tashman (2000) — Out-of-sample tests of forecasting accuracy: an analysis and review (IJF 16(4))",
              "url": "https://ideas.repec.org/a/eee/intfor/v16y2000i4p437-450.html"
            }
          ]
        }
      ]
    },
    {
      "id": "fml-cv-q4",
      "type": "predict",
      "difficulty": 2,
      "prompt": "<p>Simulate $T=5{,}000$ days of IID Gaussian returns. Label $y_t=\\operatorname{sign}(r_{t+1}+\\dots+r_{t+h})$, and use five AR(1) features with $\\phi=0.95$ that are independent of returns, so there is no signal at all. Before running anything, predict the mean accuracy minus 0.5, averaged over seeds, under shuffled, contiguous and purged 5-fold CV for each of these models:</p>\n<ol><li>a majority-class dummy classifier,</li><li>logistic regression,</li><li>a random forest with <code>min_samples_leaf=200</code>,</li><li>a random forest with <code>min_samples_leaf=1</code>.</li></ol>\n<p>Use $h=20$. Say how each number scales with $h$ and with $\\phi$ (try $\\phi=0$). In particular: can a model that ignores the features entirely be \"leaky\"? Derive an approximate formula for the dummy's inflation under shuffled CV.</p>",
      "whyItMatters": "Leakage is usually blamed on flexible models memorising neighbours. Separating the channels shows that label overlap alone already biases shuffled CV, and that feature persistence and model capacity add further, separate terms.",
      "hints": [
        "Start with the dummy. When train and test are interleaved samples of the same 5,000 days, what does the training-fold majority class tell you about the test-fold majority class?",
        "Compute $\\operatorname{Var}(\\bar y)$ for overlapping sign labels using the arcsine law, $\\operatorname{Corr}(\\operatorname{sign}X,\\operatorname{sign}Y)=\\tfrac{2}{\\pi}\\arcsin\\rho$, with $\\rho_\\ell=1-\\ell/h$.",
        "For logistic regression, recall Granger and Newbold: two independent persistent series have sample correlations spread much wider than $1/\\sqrt{T}$."
      ],
      "keyPoints": [
        "Contiguous and purged CV: all four models show about zero inflation, but the seed-to-seed dispersion is roughly twice that of shuffled CV, because blocked folds have fewer effective test observations.",
        "Shuffled CV inflates even the dummy, by about +2 to +2.5 pp at $h=20$ and about +4.5 pp at $h=60$. The sample mean of overlapping labels is far from 0.5, and train and test share it: $\\operatorname{Var}(\\bar y)\\approx(2-4/\\pi)h/T$, so the inflation is about $\\mathbb{E}|\\bar y|/2\\approx0.34\\sqrt{h/T}$.",
        "Logistic regression adds a spurious-regression term only when features are persistent: about +2 pp extra at $\\phi=0.95$ (about +4.3 pp in total), and close to zero extra at $\\phi=0$.",
        "Forests: inflation grows with capacity, to about +7 pp at leaf 200 and about +17 pp at leaf 1, because near-duplicate neighbours get memorised. (Reference values come from a 12–40-seed simulation.)",
        "Leakage is an interaction of label overlap, feature persistence and model capacity. Setting any one of them to zero removes most of it, except the intercept channel, which needs only overlap."
      ],
      "followUps": [
        "Repeat with sample weights equal to average uniqueness. Which of the three leakage channels do the weights reduce, and which remain?",
        "Score with log-loss instead of accuracy. Does the dummy still look leaky, and is log-loss more or less sensitive to the intercept channel?"
      ],
      "source": {
        "label": "López de Prado (2018), Advances in Financial Machine Learning, ch. 7, exercise 7.2 (10-fold CV of an RF with and without shuffling), adapted and extended; Granger & Newbold (1974) — Spurious regressions in econometrics",
        "url": "https://doi.org/10.1016/0304-4076(74)90034-7",
        "relation": "adapted from"
      }
    },
    {
      "id": "fml-cv-q5",
      "type": "counterexample",
      "difficulty": 3,
      "prompt": "<p>You have $n=60$ monthly observations of the sign of the market's excess return, and a library of $p$ binary timing rules generated independently of the label (pure noise). A colleague argues:</p>\n<blockquote>\"If $p$ is large enough, some rule matches all 60 months. Select it. Now do 5-fold CV <em>correctly</em>, re-running the selection inside each fold. The same rule is still perfect on each 48-month training set, so it gets selected again, and it is perfect on the 12 test months. CV error is zero on pure noise even with in-fold selection, so CV is broken.\"</blockquote>\n<p>Is this a counterexample to the validity of CV? Find the precise flaw, or show there is none. Compute the expected CV error of the in-fold procedure. Then explain which realistic research practices in quant finance <em>do</em> turn this into a genuine failure.</p>",
      "whyItMatters": "The puzzle isolates the one condition CV really needs: the selection step must be blind to the held-out data. It also shows how routine research habits quietly break that condition.",
      "hints": [
        "Count: how many noise rules are perfect on 48 given months, compared with on all 60?",
        "Among the rules tied at zero training error, which one does the in-fold procedure select? What information would it need to pick the globally perfect one?",
        "The expected number of training-perfect rules is about $p\\,2^{-48}$. If the tie-break ignores the test months, the chance of landing on a globally perfect rule is about $2^{-12}$."
      ],
      "keyPoints": [
        "A globally perfect rule needs $p$ of order $2^{60}$. Then about $p\\,2^{-48}$ rules are perfect on each 48-month training set, so the globally perfect rule is one of about $2^{12}$ tied candidates.",
        "An in-fold selection that never looks at the test months breaks the tie without reference to them. The selected rule then matches each test month with probability 1/2, so the expected CV error is about 50%, which is the correct answer.",
        "The colleague's argument silently uses a tie-breaker that prefers the globally perfect rule. That uses the validation data: it is the \"wrong way\" to cross-validate (ESL §7.10).",
        "Genuine failures appear when the tie-breaker is informed by the full history: a rule library curated after seeing the whole sample, economic \"priors\" formed after the fact, or features selected on all the data before CV.",
        "The realistic version is the expected-maximum problem behind the DSR: the best of $p$ noise rules has in-sample hit rate around $\\tfrac12+\\sqrt{\\ln p/(2n)}$ and no out-of-sample value."
      ],
      "followUps": [
        "Now let the rules be correlated (moving-average crossovers with neighbouring parameters). How does the effective number of trials change, and how would you estimate it, for example by clustering trial returns as in López de Prado &amp; Lewis (2019)?",
        "If you stack several in-fold choices (feature set, label horizon, model class), when does nested CV stop being affordable, and what is the cheapest honest alternative?"
      ],
      "source": {
        "label": "Hastie, Tibshirani & Friedman (2009), The Elements of Statistical Learning, 2nd ed., §7.10 (the wrong and right way to do cross-validation), motivated by",
        "url": "https://doi.org/10.1007/978-0-387-84858-7",
        "relation": "motivated by"
      }
    },
    {
      "id": "fml-cv-q6",
      "type": "critique",
      "difficulty": 3,
      "prompt": "<p>AFML exercise 7.4 asks for a \"second reason\" why K-fold CV fails in finance, beyond leakage. Go further. A colleague claims: \"Once labels are purged and a post-test embargo covers the longest feature lookback, purged CV is an unbiased estimator of out-of-sample performance.\"</p>\n<p>Critique this claim. For each case below, construct a minimal data-generating process or pipeline in which purged and embargoed CV is biased. Give the sign of the bias, a diagnostic that would reveal it from the CV output alone, and a fix:</p>\n<ol>\n<li>selection over many configurations (the book's second reason);</li>\n<li>a pipeline step that sees the whole sample but never sees the labels;</li>\n<li>a cross-sectional panel split by asset rather than by date;</li>\n<li>a structural break in the relation between features and labels.</li>\n</ol>\n<p>Finally, give one setting where purged CV is <em>pessimistic</em>.</p>",
      "whyItMatters": "Purging and embargo have become a box people tick. Knowing the biases they leave in place is what separates a defensible research process from a ritual.",
      "hints": [
        "Purging and embargo block information flowing from test labels into training rows. List every other route by which the test period can affect the number you report.",
        "For the panel, write the label of stock $i$ at date $t$ as $\\beta_i f_t+\\varepsilon_{i,t}$. What happens when the same $f_t$ appears in both training and test rows?",
        "For the pessimistic case, think about learning curves. What if the model sees far fewer effective observations in CV than it will have when deployed?"
      ],
      "keyPoints": [
        "Selection: the reported score is a maximum over trials, optimistic by roughly $\\sigma_{CV}\\sqrt{2\\ln M_{\\text{eff}}}$. Diagnose it from the dispersion of trial scores, using CSCV/PBO or a Tibshirani–Tibshirani style correction. Fix it with nested evaluation or deflation.",
        "Label-free leakage: full-sample standardisation, PCA, CUSUM thresholds, or barrier widths from full-sample volatility all carry future distributional information. The bias is optimistic when the future regime differs. Diagnose by refitting the step in-fold and comparing; fix with in-fold pipelines.",
        "Panels split by asset: training and test stocks share the same dates, and so the same market and industry shocks in their labels. Purging in time does nothing about this. The bias is optimistic for any feature correlated with common-shock exposure. Fix with date-blocked folds.",
        "Structural break: models trained after the break and tested before it (and the reverse) mix regimes. The sign depends on whether the deployable regime is the stronger or the weaker one. Diagnose by plotting fold scores and fold-specific coefficients against time.",
        "Pessimistic case: long label horizons or large $k$, where purging removes a big share of training data from a data-hungry learner whose learning curve is still rising. CV then underestimates the full-sample model."
      ],
      "followUps": [
        "Write a unit test that would catch case 2 automatically. For example, perturb only the test-fold feature distribution and assert that the fitted training transforms do not change."
      ],
      "source": {
        "label": "López de Prado (2018), Advances in Financial Machine Learning, ch. 7, exercise 7.4 (a second reason for CV's failure) and exercise 7.5 (selection bias), adapted and extended",
        "url": "",
        "relation": "adapted from"
      }
    },
    {
      "id": "fml-cv-q7",
      "type": "design",
      "difficulty": 3,
      "prompt": "<p>Design a purged cross-validation protocol for a monthly US equity panel. About 3,000 stocks, 1990–2024. Labels are next-1-month and next-12-month residual returns, each used separately. Features include 12-1 momentum (months $t-12$ to $t-2$), 60-month market beta, 1-month reversal and industry-adjusted value.</p>\n<p>Constraints: at most 50 model fits for the outer evaluation; every fold must also be usable for feature importance; and you must report how much data purging and embargo cost.</p>\n<p>Specify:</p>\n<ol>\n<li>the unit of splitting, and why;</li>\n<li>purge rules for both label horizons;</li>\n<li>an embargo rule derived from how the features are built. Decide whether a 60-month embargo for beta is really needed, and propose an empirical test of how long the embargo must be;</li>\n<li>how industry-level cross-sectional dependence enters;</li>\n<li>the assertions your splitter must pass.</li>\n</ol>",
      "whyItMatters": "Most purged-CV material assumes a single time series. Cross-sectional equity research needs the panel version, and the embargo there is a real trade-off rather than a 1% rule of thumb.",
      "hints": [
        "First decide what an \"observation\" is in time. In a panel, every stock at date $t$ shares the same label window.",
        "Momentum at month $t$ uses returns from $t-12$ to $t-2$. Which training months after a test block have momentum computed partly from test-block returns? Is that a leak of test labels, or only of test features?",
        "Make the embargo length an experiment rather than a guess: the curve of CV score against embargo length flattens once the leakage is gone."
      ],
      "keyPoints": [
        "Split by calendar-date blocks shared by all stocks, never by stock, because labels on the same date share market and industry shocks.",
        "Purge by label interval in calendar time. 12-month labels require dropping 12 months of training dates before each test block (and any labels that envelop it); 1-month labels need one month.",
        "Embargo targets feature windows that contain test-period returns. It matters only insofar as those features, paired with later labels, encode test outcomes. Test it empirically: plot the CV score against embargo lengths of 0, 1, 3, 12 and 60 months, and pick the length after which the score stops falling.",
        "Industry dependence: date-blocking already removes contemporaneous common shocks. Standard errors should be clustered by date block, not computed as if stocks were independent.",
        "Budget, for example: 10 date blocks for one purged K-fold per horizon (20 fits), or CPCV(10,2) with 45 fits for one horizon. Report the rows lost per split, about $(2h+\\text{embargo})$ divided by the block length.",
        "Assertions: no training date inside any test label interval; no training start inside the embargo after each block; every stock-date tested exactly once per path."
      ],
      "followUps": [
        "How would this change for a 1-day label with intraday features, a cross-section of 500 stocks, and weekly folds?",
        "With 12-month labels there are only about 35 non-overlapping label windows in 1990–2024. What does that imply for the standard error of any CV score, however many stocks there are?"
      ],
      "source": {
        "label": "Roberts et al. (2017) — Cross-validation strategies for data with temporal, spatial, hierarchical, or phylogenetic structure (motivated by; the panel application is original)",
        "url": "https://doi.org/10.1111/ecog.02881",
        "relation": "motivated by"
      }
    },
    {
      "id": "fml-cv-q8",
      "type": "connect",
      "difficulty": 3,
      "prompt": "<p>You want to backtest a signal built by asking a large language model to score earnings-call transcripts from 2012–2023 for \"management confidence\". The model's pretraining corpus ends in 2024.</p>\n<ol>\n<li>Map the problem onto purged CV. What is the LLM's \"training set\", what are the label intervals, and why can no amount of purging on your side remove the overlap?</li>\n<li>Glasserman &amp; Lin (2023) anonymise company identifiers. Sarkar &amp; Vafa (2024) test for look-ahead using events that should be unpredictable from a prespecified information set. Explain what each test can and cannot detect, using the distinction between look-ahead (knowing the outcomes) and distraction (general knowledge about the firm).</li>\n<li>Design an evaluation protocol that is the LLM analogue of walk-forward with an embargo. What should the \"embargo\" length be in this setting?</li>\n<li>Draw one lesson that runs the other way: what can quants learn from how the LLM community audits benchmark contamination?</li>\n</ol>",
      "whyItMatters": "LLM-derived signals are spreading through equity research. Their main validation risk is the same train/test overlap that purging addresses, but at a scale no splitter can fix.",
      "hints": [
        "Treat the LLM's weights as a model fitted on a training set. What time span does that training set cover, relative to your test labels?",
        "Separate two effects: the model knows what happened (look-ahead), or its general knowledge biases how it reads the text (distraction). Which test isolates which?",
        "Walk-forward needs a model trained only on data from before each test window. What would that mean for a foundation model?"
      ],
      "keyPoints": [
        "The pretraining corpus is a training set covering every test label interval. It is equivalent to shuffled CV in which the model has already seen the outcomes of the test observations (post-call price moves, later news).",
        "Anonymisation removes identifiers and so weakens both look-ahead and distraction. Glasserman &amp; Lin find anonymised headlines do better in-sample, which implies distraction dominates in their setting. But anonymisation cannot remove look-ahead carried by non-identifying context such as dates, numbers and events.",
        "Sarkar &amp; Vafa test predictive power on outcomes that should be unpredictable from the information available at the time. Passing is evidence against look-ahead for that class of outcome, not a general guarantee.",
        "Clean protocol: point-in-time models whose pretraining cutoff precedes each test window (a walk-forward over foundation models), or evaluation only after the cutoff. The \"embargo\" is the time it takes for retrospective text about pre-cutoff events to stop entering the corpus.",
        "Reverse lesson: contamination audits (overlap checks, canary strings, post-cutoff held-out sets) are a template for checking whether a quant pipeline's inputs were revised or curated after the fact."
      ],
      "followUps": [
        "Fine-tuning a small model on pre-2015 text gives a clean cutoff but a weaker reader. How would you quantify the trade-off between leakage and capability, in the spirit of bias versus variance?"
      ],
      "source": {
        "label": "Glasserman & Lin (2023) — Assessing Look-Ahead Bias in Stock Return Predictions Generated By GPT Sentiment Analysis; Sarkar & Vafa (2024) — Lookahead Bias in Pretrained Language Models (SSRN 4754678)",
        "url": "https://arxiv.org/abs/2309.17322",
        "relation": "motivated by"
      }
    }
  ],
  "projects": [
    {
      "id": "fml-cross-validation-r1",
      "title": "Replicate Bergmeir, Hyndman & Koo (2018) Table 1 (AR(3) experiment), then break it with overlapping labels",
      "level": "replication",
      "hours": "8–14",
      "paper": {
        "label": "Bergmeir, Hyndman & Koo (2018) — A note on the validity of cross-validation for evaluating autoregressive time series prediction",
        "url": "https://doi.org/10.1016/j.csda.2017.11.003"
      },
      "goal": "Reproduce the top panel of Table 1 (Experiment 1, stationary AR(3) processes), which compares 5-fold CV, LOOCV, non-dependent CV and out-of-sample (OOS) evaluation by how well each estimates the true out-set error. Then extend the setup to direct multi-step aggregated targets (overlapping labels with MA(h−1) errors), where the paper's uncorrelated-error assumption fails, and show that purging restores CV's advantage for a high-capacity learner.",
      "data": "Fully synthetic, following the paper: 1,000 Monte Carlo series of length 200 (in-set 140, out-set 60), new random stationary AR(3) coefficients per trial, and AR(1)–AR(5) fitted models. A free preprint is on Rob Hyndman's website. No market data needed. Public or personal resources only, never employer data or code.",
      "steps": [
        "Read Sections 4–5 and record every design choice: the coefficient-sampling scheme (taken from Bergmeir et al. 2014), the shift that makes series positive (subtract the minimum, add 1), the RMSE and MAE error measures, and the MAPAE and MPAE aggregates. Where a detail is unspecified, record your assumption.",
        "Build the embedded design matrix with lags 1–5 and the four estimators: 5-fold CV with random row assignment; LOOCV; non-dependent CV, which drops training rows within lag distance 5 of any test row; and OOS on the last block of the in-set.",
        "For each trial and each AR(p), compute the estimated in-set RMSE and the true RMSE of the model refit on the full in-set and scored on the out-set. Aggregate MAPAE and MPAE as the paper defines them.",
        "Produce your version of the Table 1 top panel (RMSE and MAE columns) and compare it with the paper cell by cell.",
        "Extension: replace the one-step target with the sum of the next h = 5 values (overlapping labels). Add purged K-fold, which drops training rows whose target window overlaps any test target window. Run it for AR models and for a random forest with min_samples_leaf=1 on the same lags."
      ],
      "deliverables": [
        "Script or notebook that reproduces the table with fixed seeds and a config file of assumptions.",
        "Side-by-side table: paper versus replication for every cell of the top panel, with Monte Carlo standard errors.",
        "Discrepancy write-up (1–2 pages): which cells differ, by how much, and which undocumented choices (coefficient sampling, positivity shift, fold assignment) plausibly explain each difference, backed by at least one sensitivity run.",
        "Extension table for h = 5 comparing 5-fold CV, purged CV, non-dependent CV and OOS, for both the AR models and the random forest."
      ],
      "acceptance": [
        "The qualitative ranking is reproduced: for RMSE, 5-fold CV and LOOCV have lower MAPAE than OOS for every AR(1)–AR(5) (the paper reports about 0.09 against 0.16), and non-dependent CV is worst.",
        "Replicated MAPAE for 5-fold CV and OOS is within ±25% of the paper's values for AR(2)–AR(5), or the discrepancy write-up names a specific cause and demonstrates it with a sensitivity run.",
        "Monte Carlo standard errors are reported for every replicated cell (1,000 trials).",
        "In the h = 5 extension with the random forest, unpurged 5-fold CV is significantly optimistic (MPAE below zero, beyond two standard errors), and purged CV at least halves the absolute MPAE. The AR-model result is reported whatever its sign."
      ],
      "extensions": [
        "Reproduce Experiment 3 (the seasonal AR counterexample) to see CV break down under misspecification.",
        "Test the paper's remark that results would not change much with other learners, by swapping the MLP for gradient-boosted trees."
      ]
    }
  ]
});
