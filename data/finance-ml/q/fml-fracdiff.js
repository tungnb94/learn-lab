LAB.extend("fml-fracdiff", {
  "questions": [
    {
      "id": "fml-fd-q1",
      "type": "derive",
      "difficulty": 3,
      "prompt": "<p>AFML asks what you get from <code>fracDiff_FFD(fracDiff_FFD(series, d), -d)</code> and why. Answer it properly.</p>\n<ol>\n<li>Derive the weights of $(1-B)^{-d}$ from the recursion and their asymptotic decay. Show that for $0 &lt; d &lt; 1$ the $\\tau$-truncated width scales as $L_- \\propto \\tau^{-1/(1-d)}$, while for $d \\ge 1$ the weights never fall below $\\tau$. What does the snippet then do?</li>\n<li>Let $a$ be the truncated $(1-B)^{d}$ filter with width $L_+$ and $b$ the truncated $(1-B)^{-d}$ filter with width $L_-$. Show that the composite $g = a * b$ satisfies $g_0 = 1$ and $g_k = 0$ for $1 \\le k \\le \\min(L_+,L_-)$, and characterise the rest of $g$.</li>\n<li>Compute the composite's DC gain $G(1)=\\sum_k g_k$ asymptotically in terms of $L_\\pm$ and $d$. Evaluate it for $d=0.4$, $\\tau=10^{-3}$, and say what the round trip does to a price level.</li>\n<li>What does this imply for the claim that \"fractional differencing is invertible, so no information is lost\"?</li>\n</ol>",
      "whyItMatters": "Many practitioners assume FFD is an invertible change of coordinates. Showing exactly where invertibility fails explains what truncation throws away: the level information that FFD is supposed to keep.",
      "hints": [
        "For $-d$ the recursion is $b_k = b_{k-1}(d+k-1)/k$, which is positive. Use $\\Gamma$-function asymptotics: $b_k \\sim k^{d-1}/\\Gamma(d)$.",
        "The untruncated product $(1-z)^{d}(1-z)^{-d}=1$ fixes every coefficient of $g$ up to the first lag where either truncation bites.",
        "$G(1) = S_+ S_-$ with $S_+ \\sim L_+^{-d}/\\Gamma(1-d)$ and $S_- \\sim L_-^{d}/\\Gamma(1+d)$. Use $\\Gamma(1-d)\\Gamma(1+d) = \\pi d/\\sin(\\pi d)$."
      ],
      "keyPoints": [
        "$b_k \\sim k^{d-1}/\\Gamma(d)$ decays much more slowly than $a_k \\sim k^{-d-1}/\\Gamma(-d)$, which gives $L_- \\propto \\tau^{-1/(1-d)}$ against $L_+ \\propto \\tau^{-1/(1+d)}$. For $d=0.4$, $\\tau=10^{-3}$: $L_+=54$ but $L_-\\approx 26{,}500$. For $d\\ge1$ the weights are non-decreasing ($d=1$ gives all ones, a cumulative sum), so a threshold loop never ends or runs to its cap.",
        "$g_k$ equals the corresponding coefficient of the untruncated product for every $k \\le \\min(L_+,L_-)$, so $g_0=1$ and $g_k=0$ on those lags. Beyond that, $g$ is a long tail of tiny weights (max $|g_k|\\approx 0.003$ in the example), but the tail is not negligible in total.",
        "$G(1) \\approx (L_-/L_+)^{d}\\,\\dfrac{\\sin(\\pi d)}{\\pi d}$, which is about 9.0 for $d=0.4$, $\\tau=10^{-3}$ (numerically $S_+\\approx0.136$, $S_-\\approx66$). The round trip returns $x_t$ plus a long moving average of past levels with total weight about 8. It also needs $L_++L_-$ bars of warm-up, which exceeds any daily history.",
        "Invertibility holds only for the infinite, untruncated operator with infinite history. With truncation, the low-frequency (level) content is distorted: the DC gain of FFD is $S_+ \\ll 1$, and no finite inverse filter restores it without the discarded history. \"Memory preserved\" must be measured, not assumed.",
        "In frequency terms, $|1-e^{-i\\lambda}|^{2d} = (2\\sin(\\lambda/2))^{2d}$ vanishes at $\\lambda=0$ for the ideal filter. Truncation replaces that zero with $S_+^2 &gt; 0$, which is exactly the residual unit-root loading from lesson 1."
      ],
      "followUps": [
        "Plot $|A(e^{-i\\lambda})B(e^{-i\\lambda})|$ for the truncated pair. In which frequency band does the round trip fail, and how does that band move with $\\tau$?",
        "Replace hard truncation with a tapered window (for example, a cosine taper on the last 20% of weights). Does it reduce the tail of $g$, and does it change the ADF-based $d^*$?"
      ],
      "source": {
        "label": "López de Prado (2018) — Advances in Financial Machine Learning, ch. 5 exercise 4, extended",
        "url": "",
        "relation": "adapted from"
      }
    },
    {
      "id": "fml-fd-q2",
      "type": "predict",
      "difficulty": 2,
      "prompt": "<p>Lesson 1 shows that FFD of a random walk is still I(1), with loading $S_L$, and that ADF can reject \"in finite samples\". Test how finite those samples really are. <strong>Predict before simulating.</strong></p>\n<p>Simulate Gaussian random walks and apply AFML's procedure: FFD with $\\tau \\in \\{10^{-3},10^{-4},10^{-5}\\}$, a $d$ grid with step 0.05, and ADF with a constant and one lag at the 5% asymptotic critical value $-2.86$. The output is $d^*$, the first grid value that rejects.</p>\n<ol>\n<li>Predict the median $d^*$ for $T \\in \\{10^3,\\,5\\cdot10^3,\\,2\\cdot10^4,\\,10^5\\}$. Does $d^*$ climb toward 1 as $T$ grows, as a consistent test should eventually force?</li>\n<li>How does $d^*$ depend on $\\tau$?</li>\n<li>Repeat with AIC-selected lags (maximum lag $12(T/100)^{1/4}$). Does lag selection rescue the test?</li>\n<li>Explain the result with the limit theory of the Dickey–Fuller $t$-statistic under serially correlated errors.</li>\n</ol>",
      "whyItMatters": "If $d^*$ for a pure random walk is set by $\\tau$ and the test specification rather than by the data, then cross-asset comparisons of $d^*$ (and any story built on them) are measuring your preprocessing choices, not the assets.",
      "hints": [
        "What is $\\Delta$ of an FFD series? Linear filters commute with $\\Delta$.",
        "Compute the long-run variance $\\lambda^2$ and the short-run variance $\\sigma_u^2$ of $\\Delta\\tilde X_t$ in terms of the weights.",
        "Phillips (1987): with serially correlated errors and no correction, $t \\Rightarrow \\frac{\\lambda}{\\sigma_u}\\,\\frac{\\int W\\,dW}{(\\int W^2)^{1/2}} + \\frac{\\lambda^2-\\sigma_u^2}{2\\lambda\\sigma_u(\\int W^2)^{1/2}}$."
      ],
      "keyPoints": [
        "Reference run (20 seeds per cell): the median $d^*$ was about 0.25, 0.23, 0.20, 0.15 for $\\tau=10^{-3}$; about 0.20, 0.15, 0.15, 0.15 for $10^{-4}$; and about 0.25, 0.10, 0.10, 0.10 for $10^{-5}$. It stays low and does <em>not</em> rise with $T$; if anything it drifts down.",
        "A smaller $\\tau$ means a longer $L$ and a smaller $S_L(d)$, hence a lower $d^*$. At the selected $d^*$ the unit-root loading is far from negligible. For example, $d=0.15$, $\\tau=10^{-4}$ gives $L=526$ and $S_L\\approx0.35$.",
        "Mechanism: $\\Delta\\tilde X = \\text{FFD}(\\varepsilon)$, so $\\lambda = S_L\\sigma$ and $\\sigma_u = \\sigma(\\sum_k\\omega_k^2)^{1/2}\\approx\\sigma$. With $\\lambda/\\sigma_u \\approx S_L \\ll 1$, the second term of the Phillips limit is a large negative $O_p(1)$ shift that does not vanish as $T\\to\\infty$. The rejection probability converges to a constant set by $S_L(d,\\tau)$, not to 5%.",
        "AIC lag selection does not fix it at these sample sizes (median about 0.2 at $T=2\\cdot10^4$ in the reference run). The serial correlation has the structure of an MA($L$) with $L$ in the hundreds, far beyond $p_{\\max}$. Said–Dickey consistency needs the lag order to grow fast enough to absorb it.",
        "So for I(1) prices, $d^*$ is a property of $(\\tau,\\text{test spec})$. Compare $d^*$ across assets only under identical settings, and never read it as a memory parameter."
      ],
      "followUps": [
        "Add KPSS as a confirmatory test (do not reject stationarity) and require agreement. Does $d^*$ for random walks move? Why does the KPSS bandwidth choice matter here?",
        "What $d^*$ does a stationary AR(1) with $\\varphi=0.98$ get at $T=2{,}500$? Which answer, $d^*=0$ or $d^*>0$, would you call \"right\", and for what purpose?"
      ],
      "source": {
        "label": "López de Prado (2018) — Advances in Financial Machine Learning, ch. 5 exercise 1, extended; Phillips (1987) — Time Series Regression with a Unit Root (Econometrica)",
        "url": "https://doi.org/10.2307/1913237",
        "relation": "adapted from"
      }
    },
    {
      "id": "fml-fd-q3",
      "type": "debate",
      "difficulty": 3,
      "prompt": "<p>Lesson 2 suggests estimating $d$ on realised volatility, volume and spreads, where long memory is \"plausible\". Whether volatility long memory is <em>genuine</em> is a long-running published debate. Three positions:</p>\n<ul>\n<li>it is true fractional integration;</li>\n<li>it is a spurious artefact of breaks, regime switching or a time-varying unconditional variance;</li>\n<li>volatility is \"rough\" at short scales ($H\\approx0.1$) with separate long-range persistence.</li>\n</ul>\n<p>(1) Set out the strongest evidence for each position. (2) Design a test that could tell them apart on 30 years of daily data, and say honestly where its power runs out. (3) Decide what this means for building an ARFIMA or FFD volatility feature for an equity model.</p>",
      "whyItMatters": "If apparent memory comes from regime shifts, a fractional filter tuned to the estimated $d$ mis-filters exactly when regimes change, which is when you most need the feature to behave.",
      "hints": [
        "Which part of the spectrum does a GPH or local-Whittle estimator use, and what else puts power at the lowest Fourier frequencies?",
        "For each mechanism, think through what happens under temporal aggregation, sub-sampling, and changes of estimator bandwidth.",
        "Keep the structural question (what is the DGP?) separate from the forecasting question (which model forecasts realised variance best out of sample?)."
      ],
      "keyPoints": [
        "Observational near-equivalence: hyperbolic ACF decay and a spectral pole at zero arise from I($d$) and also from a few level shifts or rare regime switches (Diebold–Inoue). So $\\hat d$ alone cannot discriminate.",
        "For genuine long memory: DGE find long-lag autocorrelation of $|r|^\\theta$, strongest near $\\theta\\approx1$. Lobato–Savin find no long memory in returns but strong long memory in squared returns, even in subperiods and individual stocks. ABDL show that long-memory realised-volatility models forecast well.",
        "For spurious memory: Granger–Hyung and Mikosch–Stărică show that breaks or a time-varying unconditional variance reproduce long-memory statistics and IGARCH effects. Rough volatility (GJR) says that short-scale log-vol increments scale with $H\\approx0.1$, and Bennedsen et al. separate this roughness from long-run persistence, so a single $d$ conflates two scales.",
        "Discriminating tools: stability of $\\hat d$ across subsamples and bandwidths (breaks inflate the lowest ordinates most); behaviour under aggregation; re-estimation after break detection; out-of-sample forecast horse races. Power is limited because a few breaks in 30 years are hard to tell from $d\\approx0.3$–0.4.",
        "Practical: memory-type volatility features can forecast well whatever the mechanism. But estimated $d$ is unstable across windows, so choose it inside training folds, treat it as a hyperparameter rather than a structural fact, and monitor it around known regime changes."
      ],
      "followUps": [
        "Simulate a two-state Markov-switching mean with switching probability $c/T$ and show that the GPH $\\hat d$ does not shrink as $T$ grows, reproducing Diebold–Inoue.",
        "If log-volatility is rough with $H\\approx0.1$ at daily scales, what would an AFML minimum-$d$ scan on log realised variance select, and why might it disagree with a low-bandwidth GPH estimate?"
      ],
      "source": {
        "label": "Ding, Granger & Engle (1993) and Lobato & Savin (1998) vs. Diebold & Inoue (2001), Granger & Hyung (2004) and Mikosch & Stărică (2004)",
        "url": "https://doi.org/10.1016/S0304-4076(01)00073-2",
        "relation": "motivated by"
      },
      "sides": [
        {
          "position": "Volatility (absolute or squared returns, realised variance) is genuinely long-memory and well described by fractional integration.",
          "refs": [
            {
              "label": "Ding, Granger & Engle (1993) — A long memory property of stock market returns and a new model (J. Empirical Finance 1(1))",
              "url": "https://doi.org/10.1016/0927-5398(93)90006-D"
            },
            {
              "label": "Lobato & Savin (1998) — Real and spurious long-memory properties of stock-market data (JBES 16(3))",
              "url": "https://doi.org/10.1080/07350015.1998.10524760"
            },
            {
              "label": "Andersen, Bollerslev, Diebold & Labys (2003) — Modeling and forecasting realized volatility (Econometrica 71(2))",
              "url": "https://doi.org/10.1111/1468-0262.00418"
            }
          ]
        },
        {
          "position": "Apparent long memory in volatility is largely spurious, produced by structural breaks, regime switching or a time-varying unconditional variance.",
          "refs": [
            {
              "label": "Diebold & Inoue (2001) — Long memory and regime switching (J. Econometrics 105(1))",
              "url": "https://doi.org/10.1016/S0304-4076(01)00073-2"
            },
            {
              "label": "Granger & Hyung (2004) — Occasional structural breaks and long memory with an application to the S&P 500 absolute stock returns (J. Empirical Finance 11(3))",
              "url": "https://doi.org/10.1016/j.jempfin.2003.03.001"
            },
            {
              "label": "Mikosch & Stărică (2004) — Nonstationarities in financial time series, the long-range dependence, and the IGARCH effects (Rev. Econ. Stat. 86(1))",
              "url": "https://doi.org/10.1162/003465304323023886"
            }
          ]
        },
        {
          "position": "Volatility is rough at short scales (Hurst exponent about 0.1) with separate long-range persistence; a single d mixes two phenomena.",
          "refs": [
            {
              "label": "Gatheral, Jaisson & Rosenbaum (2018) — Volatility is rough (Quantitative Finance 18(6))",
              "url": "https://doi.org/10.1080/14697688.2017.1393551"
            },
            {
              "label": "Bennedsen, Lunde & Pakkanen (2022) — Decoupling the short- and long-term behavior of stochastic volatility (J. Financial Econometrics); arXiv:1610.00332",
              "url": "https://arxiv.org/abs/1610.00332"
            }
          ]
        }
      ]
    },
    {
      "id": "fml-fd-q4",
      "type": "predict",
      "difficulty": 2,
      "prompt": "<p>Predict the size of spurious long memory produced by level shifts, then check it by simulation.</p>\n<p>Let $x_t = \\mu_t + e_t$ with $e_t$ IID $N(0,1)$. The level $\\mu_t$ is piecewise constant: breaks arrive independently with probability $k/T$ per bar (so $k$ breaks are expected), and each new level is drawn from $N(0,1)$. Estimate $d$ by the GPH log-periodogram regression with bandwidth $m=\\lfloor T^{0.5}\\rfloor$.</p>\n<ol>\n<li>Predict $\\mathbb E[\\hat d]$ for $k\\in\\{0,3,10\\}$ and $T\\in\\{1000,5000,20000\\}$. For fixed $k$, does $\\hat d$ shrink toward 0 as $T$ grows?</li>\n<li>Predict what happens at $T=5000$ when the bandwidth is raised to $m=\\lfloor T^{0.7}\\rfloor$.</li>\n<li>Explain both results from the spectrum of a random step function.</li>\n</ol>",
      "whyItMatters": "Index reconstitutions, rate regimes and listing-venue changes all create level shifts in the volume, spread and volatility series you might fractionally difference. You need a feel for how much \"memory\" a handful of breaks can fake.",
      "hints": [
        "A piecewise-constant process whose regimes last about $T/k$ bars has a spectrum $\\propto\\lambda^{-2}$ at frequencies above the regime frequency, up to where the white noise takes over.",
        "GPH regresses $\\log I(\\lambda_j)$ on $-2\\log(2\\sin(\\lambda_j/2))$ for $j\\le m$. Which ordinates carry break power, and how many are noise-dominated?",
        "As $T$ grows with $k$ fixed, the step variance at low ordinates grows relative to the noise, which stays at level 1."
      ],
      "keyPoints": [
        "$k=0$ gives $\\hat d\\approx0$ (reference run: standard deviation about 0.13, 0.08, 0.06 for the three sample sizes, consistent with the asymptotic GPH s.e. of order $1/\\sqrt m$).",
        "Reference run (200 replications): $k=3$ gives $\\hat d\\approx0.58$, 0.59, 0.64, and $k=10$ gives $\\approx0.69$, 0.77, 0.82. That is large spurious memory, and it <em>increases</em> with $T$ for fixed $k$ rather than washing out.",
        "Raising the bandwidth to $T^{0.7}$ roughly halves the bias ($k=3$: about 0.24; $k=10$: about 0.40 at $T=5000$), because the extra ordinates are noise-dominated. Strong bandwidth sensitivity of $\\hat d$ is itself a red flag for breaks.",
        "The step process adds $\\propto\\lambda^{-2}$ power (a local slope like $d=1$) at the lowest ordinates. GPH's regression mixes these with flat noise ordinates, which gives intermediate $\\hat d$ values that look like stationary long memory (Diebold–Inoue, Granger–Hyung).",
        "Consequence: an FFD or ARFIMA filter built from such a $\\hat d$ encodes the break history, not persistence. Estimate $d$ within training folds, check bandwidth stability, and test for breaks first."
      ],
      "followUps": [
        "Repeat with the exact local Whittle estimator. Is it more robust to level shifts than GPH, and why or why not?",
        "Make the break sizes shrink with $T$ (for example, standard deviation $T^{-1/4}$). Find the rate at which spurious $\\hat d$ stops growing."
      ],
      "source": {
        "label": "Diebold & Inoue (2001) — Long memory and regime switching (J. Econometrics); Granger & Hyung (2004)",
        "url": "https://doi.org/10.1016/S0304-4076(01)00073-2",
        "relation": "motivated by"
      }
    },
    {
      "id": "fml-fd-q5",
      "type": "counterexample",
      "difficulty": 2,
      "prompt": "<p>The implicit promise of the minimum-$d$ procedure is that the least differencing that passes ADF keeps the most useful memory, measured by correlation with the original series. Break this promise with explicit counterexamples.</p>\n<ol>\n<li>Use AFML's sinusoid set-up, $s_t = \\sin(\\omega t) + c$ with $c &gt; 0$ and $x_t = \\sum_{k\\le t} s_k$. Show analytically that the $R^2$ of a sine fit on $\\text{FFD}_d(x)$ is maximised at $d=1$, not at the minimum passing $d$. Explain why any $d &lt; 1$ leaves a residual trend.</li>\n<li>Construct a series for which the FFD feature at $d^*$ has correlation near 1 with $x$, yet zero incremental predictive value for $\\Delta x_{t+1}$.</li>\n<li>Construct a series for which the feature at a <em>larger</em> $d$ (lower correlation with $x$) is much more predictive than the one at $d^*$.</li>\n<li>State the objective that should actually choose $d$, and the role (if any) left for ADF.</li>\n</ol>",
      "whyItMatters": "Correlation with the price level is the headline diagnostic in most FFD write-ups. These counterexamples show that it can be maximal when the feature is useless and low when the feature is ideal.",
      "hints": [
        "Apply $(1-B)$ to $x_t$ exactly. Then apply the truncated $(1-B)^d$ to the deterministic part $c\\,t$: what is the slope of the output?",
        "For (2), recall what drives the correlation between FFD and the level for a random walk.",
        "For (3), write $x_t = P_t + z_t$ with $P$ a random walk and $z$ a stationary AR(1) mispricing, and ask which component predicts $\\Delta x_{t+1}$."
      ],
      "keyPoints": [
        "$(1-B)x_t = s_t$ exactly, so the sine fit gives $R^2 = 1$ at $d=1$. For $d &lt; 1$, the truncated filter maps $c\\,t$ to $c\\,(S_L\\,t - \\sum_k k\\,\\omega_k)$, a trend with slope $c\\,S_L &gt; 0$ that swamps the sine. The best $d$ for this signal is 1, whatever ADF says.",
        "A random walk: $\\text{corr}(\\text{FFD}_{d^*}(x), x) \\to 1$ as $T$ grows because of the residual $S_L X_{t-L}$ term, yet nothing predicts $\\Delta x_{t+1}$. Maximal \"memory\", zero information.",
        "$x = P + z$ with $z_t = \\varphi z_{t-1}+\\eta_t$: here $\\mathbb E[\\Delta x_{t+1}\\mid\\cdot] = (\\varphi-1)z_t$, so the useful feature isolates $z$. Low-$d$ FFD is dominated by the random-walk part ($S_L P_{t-L}$ plus a long MA of shocks), while larger $d$, or a cointegration or OU-type filter, removes more of $P$. Correlation with $x$ moves opposite to predictive value.",
        "Choose $d$ by out-of-sample predictive loss under purged CV, or learn it end-to-end. Keep ADF/KPSS only as a guardrail on feature stability (drift), not as the selection criterion."
      ],
      "followUps": [
        "For $x = P + z$ with signal-to-noise ratio $q = \\operatorname{Var}(\\eta)/\\operatorname{Var}(\\Delta P)$ and $\\varphi = 0.95$, derive or simulate the $d$ that maximises the $R^2$ of regressing $\\Delta x_{t+1}$ on $\\text{FFD}_d(x)_t$. Is the optimum interior, and how does it move with $q$ and $\\tau$?",
        "AFML's sine exercise calls the sine \"stationary with memory\". Is a deterministic sine stationary in the sense ADF tests? What does an ADF result on it actually tell you?"
      ],
      "source": {
        "label": "López de Prado (2018) — Advances in Financial Machine Learning, ch. 5 exercises 2 and 3, extended",
        "url": "",
        "relation": "adapted from"
      }
    },
    {
      "id": "fml-fd-q6",
      "type": "critique",
      "difficulty": 3,
      "prompt": "<p>AFML's E-mini exercise forms the cumulative sum of log-prices (an I(2) series), finds the minimum $d\\in[0,2]$ that makes its FFD stationary ($\\tau=10^{-5}$), and then asks you to compute the correlation with the original series and run an Engle–Granger test between the original and fractionally differenced series (\"are they cointegrated? why?\"). Critique using correlation and cointegration as evidence that memory is preserved.</p>\n<ol>\n<li>For an I(1) series $X$ and FFD with $d &lt; 1$, show that $\\tilde X_t - S_L X_t$ is stationary. What follows for an Engle–Granger test between $X$ and $\\tilde X$?</li>\n<li>For the I(2) series $Y$ and $d\\in(1,2)$, identify which moments of the truncated weights control the leftover I(2) and I(1) components of $\\text{FFD}_d(Y)$.</li>\n<li>Explain how a near-zero cointegrating coefficient and the choice of dependent variable affect the Engle–Granger result in finite samples.</li>\n<li>Propose a test of \"memory preserved\" that is not tautological.</li>\n</ol>",
      "whyItMatters": "A test result that holds by construction looks like evidence. Spotting tautological diagnostics matters for reviewing any feature-engineering claim, not just FFD.",
      "hints": [
        "Start from lesson 1's decomposition $\\tilde X_t = S_L X_{t-L} + \\text{MA}(L-1)$ and substitute $X_{t-L} = X_t - \\sum_{j&lt;L}\\varepsilon_{t-j}$.",
        "For $Y$ I(2), expand $Y_{t-k} \\approx Y_t - k\\,\\Delta Y_t + \\text{(stationary terms)}$ inside $\\sum_k \\omega_k Y_{t-k}$.",
        "The untruncated filter has $\\sum_k\\omega_k = 0$ for $d &gt; 0$ and $\\sum_k k\\,\\omega_k = 0$ for $d &gt; 1$. Truncation breaks both."
      ],
      "keyPoints": [
        "$\\tilde X_t - S_L X_t = \\text{MA}(L-1) - S_L\\sum_{j=0}^{L-1}\\varepsilon_{t-j}$, which is stationary. So $X$ and $\\tilde X$ are cointegrated <em>by construction</em> with vector $(1,-S_L)$, e.g. $S_L\\approx0.09$ at $d=0.35$, $\\tau=10^{-4}$. Rejecting \"no cointegration\" is a tautology, not a finding.",
        "For $Y$ I(2): $\\text{FFD}_d(Y)_t \\approx S_L Y_t - \\big(\\sum_k k\\,\\omega_k\\big)\\Delta Y_t + \\text{stationary}$. Both moments are non-zero after truncation, so the output still carries I(2) and I(1) components with small loadings. Standard Engle–Granger critical values assume I(1) inputs, so the test is mis-specified as posed.",
        "With a tiny cointegrating coefficient the residual is dominated by the stationary MA part, so Engle–Granger rejects easily in finite samples. Regressing $X$ on $\\tilde X$ versus $\\tilde X$ on $X$ can give different answers. Neither direction measures predictive memory.",
        "Correlation and cointegration both measure linear association with the level, inflated by the residual unit-root term. A non-tautological test asks whether the feature improves out-of-sample prediction of a target that depends on the level (such as future reversion), against level-free baselines, under purged CV.",
        "The Jarque–Bera part tests normality, which trees do not need. The FFD output inherits fat tails, and the long MA only partly averages them away. Report it as a description, not as a criterion."
      ],
      "followUps": [
        "Simulate a random walk, compute $\\tilde X$ at $d=0.35$, $\\tau=10^{-4}$, and run Engle–Granger in both directions for $T\\in\\{500,2000,10000\\}$. How often does it reject, and does the estimated slope approach $S_L$?",
        "Design a benchmark target where level information provably matters (for example a mean-reverting spread) and use it to test whether FFD preserves that information better than a 60-day moving-average gap."
      ],
      "source": {
        "label": "López de Prado (2018) — Advances in Financial Machine Learning, ch. 5 exercise 5, extended",
        "url": "",
        "relation": "adapted from"
      }
    },
    {
      "id": "fml-fd-q7",
      "type": "connect",
      "difficulty": 3,
      "prompt": "<p>Long-sequence architectures implement long convolutions. In structured state-space models (S4 and its successors), the kernel is a sum of (complex) exponentials, one per state dimension. The FFD kernel is a power law, $\\omega_k \\sim k^{-d-1}/\\Gamma(-d)$.</p>\n<ol>\n<li>Using the Laplace representation $k^{-\\alpha} = \\frac{1}{\\Gamma(\\alpha)}\\int_0^\\infty s^{\\alpha-1}e^{-sk}\\,ds$, show that the FFD kernel can be approximated by $\\sum_{j=1}^n c_j e^{-s_j k}$ with geometrically spaced $s_j$. Estimate how $n$ must scale with the window length $L$ and the relative accuracy $\\varepsilon$.</li>\n<li>Translate this into a feature: a bank of $n$ EWMAs of log-price with fixed half-lives and fitted weights. About how many are needed for $L\\approx2000$ daily bars, and what does this computation cost per update compared with direct convolution?</li>\n<li>The same mathematics underlies multi-factor Markovian approximations of rough-volatility kernels. What does it suggest about learning a single $d$ end-to-end versus learning a free mixture of exponentials, for a low signal-to-noise equity panel?</li>\n<li>What does the EWMA-bank view reveal about how FFD relates to standard moving-average-gap and momentum features?</li>\n</ol>",
      "whyItMatters": "It turns FFD from a special preprocessing ritual into one point in a family of multi-scale linear filters that includes classic MA-gap features and the kernels inside modern sequence models. That is how you decide whether one parameter $d$ is a useful inductive bias or an unnecessary constraint.",
      "hints": [
        "Substitute $s=e^u$ in the Laplace integral and apply the trapezoid rule in $u$. The integrand is smooth and decays doubly exponentially in both tails.",
        "Count the decades of time scale you must cover, from 1 bar to $L$ bars, and multiply by the nodes needed per decade for accuracy $\\varepsilon$.",
        "Since all $\\omega_k &lt; 0$ for $k\\ge1$, write $\\tilde X_t = X_t - (1-S_L)\\cdot(\\text{a weighted average of past prices})$ and interpret that weighted average."
      ],
      "keyPoints": [
        "Trapezoidal quadrature in $\\log s$ converges exponentially in the number of nodes per decade, so $n = O\\big(\\log L\\cdot\\log(1/\\varepsilon)\\big)$ (Beylkin–Monzón-type results). For $L\\approx2000$ (3–4 decades) and accuracy around $10^{-3}$, about 10–20 exponentials suffice. The first few weights can be fitted exactly.",
        "An EWMA bank is a Markovian state: $O(n)$ per update and online, against $O(L)$ for direct convolution. This is the multi-factor approximation idea of Abi Jaber &amp; El Euch for rough kernels, and the diagonal-state view of SSMs.",
        "$\\tilde X_t$ equals the current price minus $(1-S_L)$ times a power-law-weighted average of past prices. FFD is therefore a one-parameter combination of multi-horizon moving-average gaps, closely related to MA-crossover and momentum features. Expect substitution effects in feature importance.",
        "Inductive bias: a single $d$ is strong regularisation, attractive at low SNR. A free mixture can represent non-power-law, multi-scale memory (for example roughness plus persistence) but costs $n$ parameters and more overfitting risk. Compare both under purged CV and count the trials.",
        "SSM initialisations designed for long memory (such as S4's HiPPO matrices) spread their decay rates across many time scales, which is the same reason power laws need log-spaced exponentials."
      ],
      "followUps": [
        "Fit $n=8$ exponentials to the FFD($d=0.4$, $\\tau=10^{-5}$) kernel by least squares on log-spaced rates. Report the maximum relative error, and the correlation between the exact FFD series and the EWMA-bank series on a real price history.",
        "Make $d$ a learnable parameter that generates the $c_j$ through the Laplace quadrature, inside a small model. Does the learned $d$ agree with ADF-based $d^*$, or with the $d$ chosen by purged-CV loss?"
      ],
      "source": {
        "label": "Gu, Goel & Ré (2022) — Efficiently Modeling Long Sequences with Structured State Spaces (ICLR); arXiv:2111.00396. See also Abi Jaber & El Euch (2019), SIAM J. Financial Math., doi:10.1137/18M1170236",
        "url": "https://arxiv.org/abs/2111.00396",
        "relation": "motivated by"
      }
    },
    {
      "id": "fml-fd-q8",
      "type": "design",
      "difficulty": 3,
      "prompt": "<p>Design how FFD features enter a daily cross-sectional US equity model: about 3,000 names, 2000–2025, with purged combinatorial CV by date. Real constraints:</p>\n<ul>\n<li>IPOs and short histories, given that the warm-up of $L$ bars per name can exceed the median listing age at small $\\tau$;</li>\n<li>delistings;</li>\n<li>corporate actions and point-in-time adjustment factors;</li>\n<li>FFD values that are not comparable across names;</li>\n<li>a limited compute budget;</li>\n<li>selection bias from scanning $(d,\\tau)$.</li>\n</ul>\n<p>Decide on: per-name, per-sector or global $d$; selection by ADF or by predictive loss; $\\tau$ and the resulting $L$; treatment of names with history shorter than $L$; cross-sectional normalisation; an evaluation plan that isolates incremental value over standard characteristics (52-week-high distance, MA gaps, long-term reversal, momentum); and explicit kill criteria.</p>",
      "whyItMatters": "Most published FFD evidence is single-asset. Making it work in a survivorship-prone, point-in-time cross-section is where the real engineering and statistical choices lie, and where most of the apparent edge can disappear.",
      "hints": [
        "Use the minimum-$d$ simulation result: what actually determines $d^*$ for I(1) prices? Is per-name $d^*$ worth its selection noise?",
        "Think in terms of a history budget. Plot $L(d,\\tau)$ against the distribution of listing ages, and decide what happens to a name before its warm-up completes.",
        "From the EWMA-bank view, which existing characteristics will FFD overlap with, and how will you detect substitution?"
      ],
      "keyPoints": [
        "Use a global or per-sector $d$, chosen on training folds by a predictive objective (rank IC or weighted log-loss) and counted as a hyperparameter trial for the deflated Sharpe ratio. Keep ADF as a sanity check only, since $d^*$ for I(1) prices is driven by $\\tau$ and the test specification.",
        "Choose $\\tau$ jointly with the history budget. For example $\\tau\\in[10^{-4},10^{-3}]$ gives $L\\approx50$–500 at $d\\approx0.3$–0.4. A shorter $L$ means a larger $S_L$ (more residual level, more drift), while a longer $L$ drops young names, which creates IPO and survivorship bias. Handle short histories explicitly: exclude names until warm-up completes, or use a flagged expanding-window version with a missing-indicator.",
        "Compute FFD on point-in-time log total-return indices. Scale by each name's rolling volatility times $(\\sum_k\\omega_k^2)^{1/2}$, then rank or z-score cross-sectionally per date. Cross-sectional demeaning also removes part of the common $S_L\\cdot$level component.",
        "Evaluate with purged CPCV by date and identical folds across feature sets. Report the incremental IC of FFD over a baseline containing MA gaps, 52-week-high distance, long-term reversal and momentum, with paired fold-level confidence intervals. Use clustered MDA to expose substitution.",
        "Kill criteria (fixed in advance): the incremental-IC confidence interval contains 0; the gain disappears after neutralising to existing characteristics; the chosen $d$ is unstable across folds; or the deflated Sharpe ratio is insignificant after counting all $(d,\\tau)$ trials."
      ],
      "followUps": [
        "How do you compute FFD point-in-time when split and dividend adjustment factors are revised after the fact, without introducing look-ahead into historical feature values?",
        "Would FFD of volume, short interest or analyst-revision indices be more promising here than FFD of price? Argue from where genuine fractional integration is plausible."
      ],
      "source": {
        "label": "López de Prado (2018) — Advances in Financial Machine Learning, ch. 5 (minimum-d procedure) and lesson 2's 'correlation is not the objective' pitfall",
        "url": "",
        "relation": "motivated by"
      }
    }
  ],
  "projects": [
    {
      "id": "fml-fracdiff-r1",
      "title": "Replicate Ding–Granger–Engle (1993): long memory in absolute returns and the 'power near 1' result",
      "level": "replication",
      "hours": "8–12",
      "paper": {
        "label": "Ding, Granger & Engle (1993) — A long memory property of stock market returns and a new model (J. Empirical Finance 1(1), 83–106)",
        "url": "https://doi.org/10.1016/0927-5398(93)90006-D"
      },
      "goal": "Reproduce DGE's two headline empirical findings on daily US stock index returns from 1928 to the early 1990s. First, returns are nearly uncorrelated while absolute returns stay significantly positively autocorrelated for thousands of lags (DGE report about 2,700). Second, the autocorrelation of $|r_t|^\\theta$ is largest for a power $\\theta$ around 1. Then put the result into the spurious-long-memory debate: estimate $d$ semiparametrically, test its stability across subsamples and bandwidths, and re-estimate after removing level shifts.",
      "data": "Public data only; never use employer data, code or infrastructure. Use the daily Mkt-RF and RF series from the Ken French Data Library (mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html), which start in July 1926. Their sum is the CRSP value-weighted total market return. DGE used the S&amp;P 500, so index composition, dividends and exact sample dates are documented sources of discrepancy. (FRED's SP500 series covers only about the last ten years and is not sufficient.)",
      "steps": [
        "Build daily market returns matching DGE's sample window as closely as possible (start of 1928 to around August 1991). Record the exact first and last dates and the number of observations.",
        "Compute the sample ACF of $r_t$, $|r_t|$ and $r_t^2$ up to lag 3,000, with $\\pm1.96/\\sqrt T$ bands. Record the first lag at which the ACF of $|r_t|$ enters the band.",
        "For $\\theta\\in\\{0.125, 0.25, \\dots, 3\\}$, compute the ACF of $|r_t|^\\theta$ at lags 1, 2, 5, 10, 20, 50 and 100. Find $\\theta^*$ (the argmax) at each lag and plot the ACF against $\\theta$, as in DGE's figures.",
        "Robustness checks: drop October 1987, split the sample in two, and repeat on 1992–present.",
        "Estimate $d$ for $|r_t|$ and $\\log r_t^2$ (with an offset for zero returns) by GPH and local Whittle with $m=T^{0.5}, T^{0.6}, T^{0.7}$, and report standard errors.",
        "Debate extension: detect mean shifts in $|r_t|$ (for example by binary segmentation on the mean), remove the fitted piecewise-constant level, and re-estimate $d$. Compare with the Granger–Hyung argument."
      ],
      "deliverables": [
        "Reproducible notebook with the data download script, exact sample dates and fixed choices (ACF estimator, demeaning, bands)",
        "Figures: ACF of $r$, $|r|$, $r^2$ to lag 3,000; ACF of $|r|^\\theta$ against $\\theta$ at the selected lags",
        "Table: $\\theta^*$ by lag; $\\hat d$ by estimator, bandwidth and subsample; break-adjusted $\\hat d$",
        "Discrepancy write-up (1–2 pages) comparing each headline number with DGE, attributing differences to data (CRSP VW total return vs S&P price index, dates), method (ACF estimator, bands) or genuine instability, and quantifying each attribution where possible"
      ],
      "acceptance": [
        "The fraction of return autocorrelations at lags 1–100 outside ±1.96/√T is reported, together with lag-1 autocorrelations for the full sample and both halves.",
        "The ACF of |r| is positive and outside the 95% band for at least the first 1,000 lags in the 1928–1991 sample. The first lag at which it enters the band is reported and compared with DGE's figure of about 2,700.",
        "θ* is reported at lags 1, 10 and 100. Any θ* outside [0.75, 1.25] is explained in the discrepancy write-up.",
        "GPH and local Whittle estimates of d are reported with standard errors for at least three bandwidths and two subsamples, plus at least one break-adjusted estimate.",
        "All data are public, and download dates and versions are recorded."
      ],
      "extensions": [
        "Fit an asymmetric power ARCH with the power parameter estimated, as DGE propose, and compare the estimated power with θ*.",
        "Repeat the analysis on Binance BTCUSDT daily or hourly returns (data.binance.vision) and contrast the crypto memory profile with US equities."
      ]
    }
  ]
});
