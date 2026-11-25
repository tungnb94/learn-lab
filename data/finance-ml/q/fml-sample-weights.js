LAB.extend("fml-sample-weights", {
  "questions": [
    {
      "id": "fml-sw-q1",
      "type": "derive",
      "difficulty": 3,
      "prompt": "<p>The lesson motivates $\\sum_i \\bar u_i$ as an effective sample size by showing that, for fixed-horizon labels sampled every bar, interior labels have $\\bar u_i = 1/h$. But uniqueness depends only on the <em>geometry of the intervals</em>, not on what function of the path the label is.</p>\n<p>Let bar returns be IID $N(0,\\sigma^2)$ and build $N \\gg h$ labels, one per bar, from $h$-bar forward returns $R_t = r_{t+1}+\\dots+r_{t+h}$.</p>\n<ol>\n<li>For <strong>regression labels</strong> $y_t = R_t$, derive the variance inflation factor $\\text{VIF} = N\\,\\operatorname{Var}(\\bar y)/\\operatorname{Var}(y_t)$ and the implied ESS $= N/\\text{VIF}$. Check it against $\\sum_i \\bar u_i$.</li>\n<li>For <strong>classification labels</strong> $y_t = \\operatorname{sign}(R_t)$, derive the VIF exactly as a finite sum, then in closed form as $h\\to\\infty$.</li>\n<li>Is $\\sum_i \\bar u_i$ conservative or anti-conservative for sign labels, and by how much? What do you expect for triple-barrier labels whose horizontal barriers usually resolve before the vertical one?</li>\n<li>Which notion of ESS should drive <code>max_samples</code>, which should drive a $t$-statistic on mean label accuracy, and why might they differ?</li>\n</ol>",
      "whyItMatters": "Every capacity rule-of-thumb in AFML ch. 4 (bag size, leaf weight, decay units) is pegged to the sum of average uniqueness; knowing when it is the right ESS, and when it is off by a constant factor, tells you how much to trust those rules.",
      "hints": [
        "Write $\\operatorname{Var}(\\bar y) = \\frac{\\operatorname{Var}(y)}{N}\\big(1 + 2\\sum_{k\\ge1}\\rho_k\\big)$ (ignoring edge terms) and get $\\rho_k$ for both label types.",
        "For jointly Gaussian $(X,Y)$ with correlation $\\rho$, Sheppard's arcsine formula gives $\\operatorname{corr}(\\operatorname{sign}X,\\operatorname{sign}Y) = \\tfrac{2}{\\pi}\\arcsin\\rho$.",
        "Treat $\\sum_{k=1}^{h-1} f(1-k/h)$ as a Riemann sum, $\\approx h\\int_0^1 f(u)\\,du$, and use $\\int_0^1 \\arcsin u\\,du = \\tfrac{\\pi}{2}-1$."
      ],
      "keyPoints": [
        "Regression labels: $\\rho_k = 1-k/h$, so $\\text{VIF} = 1 + 2\\sum_{k=1}^{h-1}(1-k/h) = h$ and ESS $= N/h = \\sum_i \\bar u_i$ for interior labels: the two notions agree exactly here.",
        "Sign labels: $\\text{VIF} = 1 + 2\\sum_{k=1}^{h-1}\\tfrac{2}{\\pi}\\arcsin(1-k/h) \\to h\\,(2 - 4/\\pi) \\approx 0.727\\,h$. For $h=20$ the exact sum is about 14.6, not 20. A short Monte Carlo confirms it.",
        "So for binary labels $\\sum_i\\bar u_i$ <em>understates</em> the ESS by roughly 27% (ESS $\\approx 1.38\\,N/h$). Taking the sign of partly overlapping outcomes removes some of their shared information. Triple-barrier labels are an even more nonlinear function of the path and their spans are shorter, so expect less correlation than the interval geometry implies. Note that $\\bar u_i$ already uses the realised $t_{i,1}$.",
        "ESS depends on the statistic. The ESS for the mean label, for a split's impurity estimate and for out-of-sample loss can all differ. Use $\\sum_i\\bar u_i$ as a conservative, model-free capacity budget. For inference, estimate the long-run variance of the statistic you actually report (HAC or block bootstrap)."
      ],
      "followUps": [
        "Repeat for ternary labels $y_t = \\operatorname{sign}(R_t)\\,\\mathbb{1}\\{|R_t| > c\\,\\sigma\\sqrt h\\}$. Does widening the dead zone $c$ raise or lower the VIF relative to $h$? Derive it or simulate it.",
        "Derive the VIF of the mean of return-attribution-weighted labels. Does heavy-tailed weighting push the ESS above or below the sum of uniqueness?"
      ],
      "source": {
        "label": "López de Prado (2018) — Advances in Financial Machine Learning, ch. 4 (concurrency, average uniqueness as effective sample size)",
        "url": "",
        "relation": "motivated by"
      }
    },
    {
      "id": "fml-sw-q2",
      "type": "derive",
      "difficulty": 3,
      "prompt": "<p>Let $a_i = \\sum_{t=t_{i,0}}^{t_{i,1}} r_t / c_t$ be label $i$'s concurrency-attributed return, so AFML's return-attribution weight is $\\tilde w_i = |a_i|$. Consider a hard classifier $f_i = f(x_i) \\in \\{-1,+1\\}$.</p>\n<ol>\n<li>Show that minimising the weighted 0–1 loss $\\sum_i |a_i|\\,\\mathbb{1}\\{f_i \\ne \\operatorname{sign}(a_i)\\}$ is <em>exactly</em> equivalent to maximising the P&amp;L of a specific trading strategy. Identify the strategy: what position does it hold on bar $t$?</li>\n<li>In practice the training label is the triple-barrier label $y_i$, not $\\operatorname{sign}(a_i)$. Construct a two-bar example in which $\\operatorname{sign}(a_i) \\ne \\operatorname{sign}\\big(\\sum_{t\\in i} r_t\\big)$, and explain what the weighted objective then rewards.</li>\n<li>The identity is for hard decisions. What happens to the correspondence if the model is trained with weighted log-loss and the position is sized from $\\hat p$?</li>\n<li>Is weighting by a function of the realised outcome a form of target leakage? If not, what does it change?</li>\n</ol>",
      "whyItMatters": "It turns return attribution from a heuristic into a precise statement about which P&L the classifier is optimising. That shows when the heuristic matches your book's real objective and when it quietly optimises something else.",
      "hints": [
        "Write $\\mathbb{1}\\{f \\ne \\operatorname{sign}(a)\\} = \\tfrac12\\big(1 - f\\,\\operatorname{sign}(a)\\big)$ and multiply by $|a|$.",
        "In $\\sum_i f_i a_i$, swap the sums over labels and bars. What multiplies $r_t$?",
        "Compare with AFML ch. 10's \"averaging of active bets\". For (2), put a large positive return on a bar shared with many labels and a smaller negative return on a bar the label has to itself."
      ],
      "keyPoints": [
        "$\\sum_i |a_i|\\,\\mathbb{1}\\{f_i \\ne \\operatorname{sign} a_i\\} = \\tfrac12\\big(\\sum_i|a_i| - \\sum_i f_i a_i\\big)$. The first sum does not depend on $f$, so the problem is equivalent to maximising $\\sum_i f_i a_i$.",
        "$\\sum_i f_i a_i = \\sum_t r_t \\cdot \\frac{1}{c_t}\\sum_{i:\\,t\\in i} f_i = \\sum_t r_t\\,\\bar f_t$: the P&amp;L of a unit-capital strategy that holds, on each bar, the average signal of all active labels. That is exactly AFML ch. 10's averaging of active bets.",
        "Example: the label spans bars 1–2, with $r_1=+2$, $c_1=4$, $r_2=-1$, $c_2=1$. The label's own return is $+1$ but $a_i=-0.5$. When $y_i$ comes from the label's own path, the weight measures a P&amp;L that has the opposite sign to the label, so the equivalence breaks and the objective can reward the wrong direction on those observations.",
        "With weighted log-loss and sizes $2\\hat p-1$, the realised P&amp;L is <em>linear</em> in $\\hat p$, while log-loss is a proper scoring rule for the $|a|$-tilted conditional distribution. So the two objectives are aligned only through calibration. If P&amp;L is the target, optimise a P&amp;L surrogate directly or recalibrate before sizing.",
        "It is not leakage, because weights apply to training samples only and are never needed at prediction time. But it changes the estimand: the model learns $P(y\\mid x)$ under an $|a|$-tilted measure. That moves probabilities away from base rates, gives the fit a volatility tilt, and lowers the Kish ESS."
      ],
      "followUps": [
        "Derive the analogous identity for soft positions $s_i = 2\\hat p_i - 1$: which loss on $\\hat p$ makes weighted risk minimisation equal to P&amp;L maximisation? (It is not log-loss.)",
        "Redefine attribution with volatility-scaled bar returns $r_t/\\hat\\sigma_{t-1}$. Which strategy's P&amp;L does the identity now describe, and is it closer to how you actually size positions?"
      ],
      "source": {
        "label": "López de Prado (2018) — Advances in Financial Machine Learning, ch. 4 (return attribution) and ch. 10 (averaging active bets); cf. Elkan (2001) — The Foundations of Cost-Sensitive Learning (IJCAI)",
        "url": "https://ijcai.org/proceedings/2001/133",
        "relation": "motivated by"
      }
    },
    {
      "id": "fml-sw-q3",
      "type": "counterexample",
      "difficulty": 2,
      "prompt": "<p>Treat the claim \"$\\sum_i \\bar u_i$ is the number of independent labels\" as a conjecture and break it.</p>\n<ol>\n<li>Construct an interval configuration and a return process for which $\\sum_i\\bar u_i$ <strong>materially understates</strong> the information in the labels.</li>\n<li>Construct a case in which it <strong>overstates</strong> the information even though every $\\bar u_i = 1$.</li>\n<li>Construct two label sets with the <strong>same</strong> $\\sum_i\\bar u_i$ but very different information content.</li>\n</ol>\n<p>For each case, propose a diagnostic or a modified uniqueness that would have caught it, and say what it costs.</p>",
      "whyItMatters": "Uniqueness is blind to some kinds of dependence. Knowing exactly which kinds stops you from reporting a confident effective sample size for a panel or a nested-horizon design where it does not apply.",
      "hints": [
        "Uniqueness sees only which bars each interval covers. List the kinds of dependence that do not show up as interval overlap.",
        "Try containment (a long label containing many short ones), common factors across instruments, serial dependence in returns, and overlapping feature windows.",
        "For an equicorrelated block of $n$ labels with correlation $\\rho$, the ESS of the mean is $n/(1+(n-1)\\rho)$. For (3), ask whether every bar carries the same variance."
      ],
      "keyPoints": [
        "Understates: one 100-bar label that contains 100 one-bar labels, with IID returns. Every bar has $c_t=2$, so every $\\bar u_i=0.5$ and $\\sum\\bar u_i = 50.5$. Yet the 100 short outcomes are mutually independent, so the ESS is about 100, and the long label is just their sum. The binary-label effect from the ESS derivation question also points in this direction.",
        "Overstates: concurrency computed per asset across 500 stocks gives same-date labels $\\bar u_i = 1$, while a common factor makes them equicorrelated, so the effective count per date is $\\approx 1/\\rho$ for large $n$. Other examples: non-overlapping labels with volatility clustering or momentum, and labels that do not overlap but whose features use overlapping 12-month windows.",
        "Same sum, different information: overlap that falls on quiet bars versus on a crash bar. Uniqueness weights all bars equally, but how much information a shared bar carries scales with $\\sigma_t^2$. A variance-weighted uniqueness $u_{t,i} \\propto \\sigma_t^2\\,\\mathbb{1}_{t,i}/\\sum_j \\mathbb{1}_{t,j}$, or attribution by $r_t^2$, addresses this.",
        "Diagnostics: ESS from the label correlation matrix, $N^2/\\mathbf 1^\\top R\\,\\mathbf 1$ (equal to $\\sum\\bar u_i$ in the fixed-horizon regression case); factor-residualised concurrency; HAC or block-bootstrap variance of the statistic you report. The costs are estimating $R$ (noisy and $O(N^2)$) and model dependence."
      ],
      "followUps": [
        "Show that $N^2/\\mathbf 1^\\top R\\,\\mathbf 1$ equals $\\sum_i \\bar u_i$ for interior fixed-horizon return labels. Find the simplest interval configuration where they differ, even for return labels.",
        "In the nested-horizon example, how should the sequential bootstrap treat the long label? Does it over- or under-sample it, and is that what you want?"
      ],
      "source": {
        "label": "López de Prado (2018) — Advances in Financial Machine Learning, ch. 4 (average uniqueness as effective sample size)",
        "url": "",
        "relation": "motivated by"
      }
    },
    {
      "id": "fml-sw-q4",
      "type": "predict",
      "difficulty": 2,
      "prompt": "<p>AFML asks why out-of-bag accuracy is so much higher than unshuffled $k$-fold accuracy when average uniqueness is low. Make that quantitative by <strong>predicting first, then simulating</strong>.</p>\n<p>Setup: $T=4000$ bars of IID $N(0,1)$ returns. The label is $y_t = \\operatorname{sign}(r_{t+1}+\\dots+r_{t+20})$, so $h=20$ and $\\bar u \\approx 0.05$. There are three features, each an independent AR(1) with coefficient $\\varphi$ and <em>no relation to returns</em>. The model is a random forest with 300 trees. Compare OOB accuracy with purged 5-fold CV accuracy (contiguous folds, dropping training labels within 20 bars of each test fold).</p>\n<p>Predict both numbers for $\\varphi \\in \\{0, 0.9, 0.99\\}$ under three configurations: (i) defaults; (ii) <code>max_samples</code> $=0.05$; (iii) <code>max_samples</code> $=0.05$ and <code>min_samples_leaf</code> $=50$. Which knob removes the most OOB inflation, and why? Write your numbers down before running anything.</p>",
      "whyItMatters": "OOB scores are free, so people use them for model selection. Knowing the conditions under which they lie, and that shrinking bags does not fix it, protects every hyperparameter search you run on overlapping labels.",
      "hints": [
        "For an OOB point, what does a tree have in its bag that is close to it in both feature space and label?",
        "Leakage needs two things at once: label overlap (near-identical $y$) and feature persistence (near-identical $x$). What happens when $\\varphi=0$?",
        "With <code>max_samples</code> $=s$, how many of the $2h$ temporal neighbours of an OOB point does a typical tree still contain? Compare with what a fully grown leaf does versus a 50-sample leaf."
      ],
      "keyPoints": [
        "With $\\varphi=0$ there is essentially no inflation (reference run: OOB $\\approx 0.51$, purged CV $\\approx 0.50$). Label overlap alone is not enough, because the OOB point needs twins in feature space as well.",
        "With $\\varphi=0.99$, OOB is grossly inflated: a reference run averaged over 3 seeds gave OOB $\\approx 0.71$ against purged CV $\\approx 0.51$. At $\\varphi=0.9$ it was about 0.56 against 0.51. The forest acts as a nearest-neighbour lookup of the twin's label.",
        "Shrinking bags to $\\bar u$ barely helps (OOB $\\approx 0.68$). Each OOB point is still scored by many trees whose bags contain some of its temporal neighbours, and fully grown trees isolate them. Larger leaves (50 samples) cut the inflation to about 0.57 by averaging over neighbourhoods wider than the twin cluster, but they do not remove it.",
        "The sequential bootstrap does not fix it either, because the OOB set is still adjacent in time to the bag. Purged, embargoed CV is the unbiased estimate here, and OOB should be treated only as a sanity check."
      ],
      "followUps": [
        "For fully grown trees and $\\varphi\\to1$, derive an approximate OOB accuracy as a function of $h$ by treating the forest as 1-nearest-neighbour in time.",
        "Swap the forest for gradient boosting with early stopping on a random 10% validation split. Predict the bias in the chosen number of rounds, then test it."
      ],
      "source": {
        "label": "López de Prado (2018) — Advances in Financial Machine Learning, ch. 4 exercise 3 and ch. 6 exercise 2(b), extended",
        "url": "",
        "relation": "adapted from"
      }
    },
    {
      "id": "fml-sw-q5",
      "type": "critique",
      "difficulty": 2,
      "prompt": "<p>AFML's meta-labeling exercise has two thirds of the labels equal to 0 (false positives of the primary model) and one third equal to 1 (true positives). It argues that balanced class weights make sense because they force the classifier to \"pay more attention to the true positives\". Critique this justification.</p>\n<ol>\n<li>For a consistent probabilistic classifier trained with class weights $w_0,w_1$, derive the population minimiser $p_w(x)$ in terms of the true $p(x) = P(y=1\\mid x)$. Invert it.</li>\n<li>What threshold on the <em>true</em> $p$ is implied by predicting 1 when $p_w > 0.5$ under balanced weights? Compare it with the Bayes threshold for misclassification costs $C_{FP}, C_{FN}$.</li>\n<li>In meta-labeling, what are $C_{FP}$ and $C_{FN}$ economically? When is balancing exactly right, and when is it wrong?</li>\n<li>Does the analytic correction survive trees with finite leaves and simultaneous uniqueness or return weights?</li>\n</ol>",
      "whyItMatters": "Meta-label probabilities feed bet sizing directly (AFML ch. 10). A class-weighting choice made for \"attention\" silently sets both a decision threshold and a probability distortion that carry straight into position sizes.",
      "hints": [
        "Minimise the weighted expected log-loss pointwise in $x$: $\\min_q\\, -w_1 p\\log q - w_0 (1-p)\\log(1-q)$.",
        "Write the result in odds form: the weights multiply the odds by $w_1/w_0$.",
        "Cost-sensitive Bayes rule: predict 1 iff $p > C_{FP}/(C_{FP}+C_{FN})$. Set this equal to what balancing implies."
      ],
      "keyPoints": [
        "$p_w = \\dfrac{w_1 p}{w_1 p + w_0(1-p)}$, so the odds are multiplied by $w_1/w_0$. With balanced weights, $w_1/w_0 = N_0/N_1 = 2$, which gives $p_w = 2p/(1+p)$ and the inverse $p = p_w/(2-p_w)$. This is the prior correction of King &amp; Zeng (2001) and Saerens et al. (2002).",
        "Predicting 1 iff $p_w > 1/2$ is the same as predicting 1 iff $p > w_0/(w_0+w_1) = \\pi_1 = 1/3$. Balancing amounts to thresholding at the base rate, which is Bayes-optimal only if $C_{FP}/C_{FN} = \\pi_1/\\pi_0 = 1/2$. That ratio comes from label frequencies, not economics.",
        "Economically, $C_{FP}$ is the expected loss of taking a bad trade (including costs) and $C_{FN}$ is the forgone profit of skipping a good one. These should come from the P&amp;L distribution of the primary model's trades (for example via return attribution), not from class counts. \"Attention to the minority class\" is an accuracy argument, not a value argument.",
        "Sizing bets from $p_w$ overstates confidence on the minority side. Invert or recalibrate before mapping to bet size.",
        "With trees (non-consistent, leaf-wise estimates), <code>balanced_subsample</code> and extra uniqueness or return weights, the closed-form inverse is only approximate. Balance on total weight per class and recalibrate (isotonic or Platt) on a purged validation fold."
      ],
      "followUps": [
        "Under return-attribution weights, what misclassification cost ratio does the fit implicitly use? Is it closer to the economic one than balanced class weights?",
        "Byrd &amp; Lipton (2019, arXiv:1812.03372) find that importance weights lose their effect in over-parameterised networks trained to separation. Predict whether balanced class weights change the decisions of a fully grown random forest, then test it."
      ],
      "source": {
        "label": "López de Prado (2018) — Advances in Financial Machine Learning, ch. 4 exercise 5, extended",
        "url": "",
        "relation": "adapted from"
      }
    },
    {
      "id": "fml-sw-q6",
      "type": "debate",
      "difficulty": 3,
      "prompt": "<p>Your team is split. One side wants to train on 12-month labels sampled monthly (overlapping, then uniqueness-weighted). The other wants to keep only non-overlapping annual labels. Econometrics fought the same battle over long-horizon return predictability.</p>\n<ol>\n<li>State precisely what Boudoukh–Richardson–Whitelaw show about the joint distribution of horizon-1 and horizon-$J$ slope estimates under the null when the predictor has persistence $\\rho$. For example, derive or verify that the correlation of the 1- and 2-period estimators is $\\sqrt{(1+\\rho)/2}$, which is 0.988 at $\\rho = 0.953$.</li>\n<li>State what the other side (Hansen–Hodrick, Britten-Jones–Neuberger–Nolte, Cochrane) claims overlap or long horizons <em>do</em> buy, and where that extra power comes from.</li>\n<li>Adjudicate for ML: when does sampling every bar with overlap add genuine information over one-in-$h$ sampling, and when is it an illusion? Make the dependence on feature persistence explicit.</li>\n</ol>",
      "whyItMatters": "It is the same question as \"how much should overlapping labels count?\", but argued with formal results and real data. The answer decides whether denser event sampling is worth its weighting and purging overhead.",
      "hints": [
        "Start with the simplest estimator, the sample mean of $h$-period returns, computed on all overlapping observations and on one-in-$h$.",
        "For an AR(1) predictor, the $J$-period slope regression's regressor-weighted errors are sums of $\\rho^k$-weighted one-period terms, so the estimators share almost all their sampling error when $\\rho\\approx1$.",
        "Ask what extra structure Cochrane exploits (a present-value identity tying return predictability to dividend-growth predictability). Is that power coming from overlap, or from economic restrictions?"
      ],
      "keyPoints": [
        "BRW: with a persistent predictor, slope estimates at different horizons are almost perfectly correlated under the null. Their simulated 1-year/5-year correlation is still about 0.84 with 75 annual observations. A slope or $R^2$ rising with horizon is therefore expected under no predictability and is not independent confirmation.",
        "Overlap is not useless: with correct MA($h-1$) inference (Hansen–Hodrick, Hodrick 1B, Britten-Jones et al.) overlapping observations are valid and can be somewhat more efficient than discarding data. For the mean of returns, though, the overlapping and non-overlapping estimators carry nearly the same information, since the overlapping mean telescopes to roughly the one-period mean.",
        "Cochrane's extra power comes from cross-equation restrictions (the present-value identity, and dividend growth not being predictable). The gain is model-based, not a free lunch from overlap.",
        "ML verdict: overlap adds information when features vary within the horizon (phase diversity gives many distinct $x$ values with partly new outcomes). It adds little when features are persistent, which is the BRW regime, because then $(x,y)$ pairs are near-duplicates and the effective count is close to $N/h$. That is the case for uniqueness weighting, shrinking <code>max_samples</code> and purged CV.",
        "Valkanov: with overlapping long-horizon sums, standard t-statistics do not converge to normal laws and need rescaling. The ML analogue is that feature-importance p-values computed on overlapping labels need a similar correction."
      ],
      "followUps": [
        "For an AR(1) feature with persistence $\\varphi$ and $h$-bar labels, compute (simulate) the variance of the OLS slope using all overlapping observations against one-in-$h$, and plot the efficiency ratio as $\\varphi$ goes from 0 to 1.",
        "Is there an analogue of Valkanov's rescaled $t/\\sqrt{T}$ statistic for MDA feature importance on overlapping labels?"
      ],
      "source": {
        "label": "Boudoukh, Richardson & Whitelaw (2008) vs. Cochrane (2008), RFS 21(4): the long-horizon predictability exchange",
        "url": "https://doi.org/10.1093/rfs/hhl042",
        "relation": "motivated by"
      },
      "sides": [
        {
          "position": "Overlapping or long-horizon observations carry usable extra information. Keep them and fix the inference, or exploit cross-horizon restrictions.",
          "refs": [
            {
              "label": "Hansen & Hodrick (1980) — Forward exchange rates as optimal predictors of future spot rates: An econometric analysis (JPE 88(5))",
              "url": "https://doi.org/10.1086/260910"
            },
            {
              "label": "Britten-Jones, Neuberger & Nolte (2011) — Improved inference in regression with overlapping observations (J. Business Finance & Accounting)",
              "url": "https://doi.org/10.1111/j.1468-5957.2011.02244.x"
            },
            {
              "label": "Cochrane (2008) — The Dog That Did Not Bark: A Defense of Return Predictability (RFS 21(4))",
              "url": "https://doi.org/10.1093/rfs/hhm046"
            },
            {
              "label": "Hodrick (1992) — Dividend yields and expected stock returns: Alternative procedures for inference and measurement (RFS 5(3))",
              "url": "https://doi.org/10.1093/rfs/5.3.351"
            }
          ]
        },
        {
          "position": "Long-horizon overlapping regressions add little beyond the one-period regression and invite spurious inference. Rising coefficients across horizons are what the null predicts for persistent predictors.",
          "refs": [
            {
              "label": "Boudoukh, Richardson & Whitelaw (2008) — The Myth of Long-Horizon Predictability (RFS 21(4))",
              "url": "https://doi.org/10.1093/rfs/hhl042"
            },
            {
              "label": "Valkanov (2003) — Long-horizon regressions: theoretical results and applications (JFE 68(2))",
              "url": "https://doi.org/10.1016/S0304-405X(03)00065-5"
            },
            {
              "label": "Richardson & Stock (1989) — Drawing inferences from statistics based on multiyear asset returns (JFE 25(1))",
              "url": "https://doi.org/10.1016/0304-405X(89)90086-X"
            }
          ]
        }
      ]
    },
    {
      "id": "fml-sw-q7",
      "type": "connect",
      "difficulty": 3,
      "prompt": "<p>DQN-style agents use a replay buffer to break temporal correlation. Prioritized experience replay (PER) samples transition $i$ with $P(i) \\propto p_i^{\\alpha}$ and corrects the induced bias with importance-sampling weights $w_i = (N\\,P(i))^{-\\beta}$, annealing $\\beta \\to 1$. The sequential bootstrap also replaces uniform resampling with a state-dependent sampling law.</p>\n<ol>\n<li>Map the two methods onto each other: what plays the role of priority, and which <em>target</em> distribution is each trying to estimate expectations under?</li>\n<li>For large bags, approximate the marginal draw probability of label $j$ under the sequential bootstrap as a function of its overlap structure. Which labels end up over- or under-represented, and what regime tilt does this induce, given that AFML's own exercise links concurrency to volatility?</li>\n<li>Should you apply a PER-style importance-sampling correction to sequentially bootstrapped bags? Argue both ways, and identify a double-counting problem when uniqueness <em>sample weights</em> are used as well.</li>\n<li>Reverse the direction: $n$-step returns in a replay buffer are overlapping labels. Propose a uniqueness-aware replay or validation scheme for offline RL evaluation.</li>\n</ol>",
      "whyItMatters": "Both fields are solving one problem: estimating expectations from correlated, non-uniformly sampled experience. RL is explicit about the bias it introduces and corrects it; AFML's tilt is intended. Seeing the difference makes your ensemble design choices deliberate.",
      "hints": [
        "Write both as importance sampling: a sampling law $q$ against a target law $p$. PER wants $p$ uniform over the buffer. What does the sequential bootstrap want?",
        "Mean-field approximation: replace the bag's concurrency $c^{\\text{bag}}_t$ by its expectation under the current sampling law, then solve for a fixed point.",
        "Decide whether AFML's ensemble estimand is the uniform empirical risk or a uniqueness-weighted risk. The answer settles whether a correction is wanted."
      ],
      "keyPoints": [
        "The priority corresponds to the candidate's conditional average uniqueness. PER keeps the uniform target and removes its tilt with IS weights. The sequential bootstrap's tilt toward unique labels is the point, so its implicit target is a uniqueness-weighted empirical risk.",
        "To leading order, the draw probability is $\\propto$ the mean over the label's bars of $1/(1+\\mathbb E[c^{\\text{bag}}_t])$. Labels in high-concurrency stretches are under-sampled. Those stretches are where events cluster, often high-volatility periods, so bags tilt toward calm regimes.",
        "An IS correction $w \\propto 1/(N\\,P)$ would restore the uniform empirical risk, which is appropriate only if that is the estimand. Using the sequential bootstrap together with uniqueness weights discounts overlap twice. Combining it with return-attribution weights partly cancels the volatility tilt.",
        "In PER the bias matters because the Q-learning fixed point depends on the sampling distribution. Likewise, leaf values in a bagged tree change with the sampling law, not just the variance.",
        "RL direction: $n$-step targets share rewards, and consecutive transitions share states. Use priorities that discount overlap, and purged or embargoed splits by episode time when evaluating offline policies."
      ],
      "followUps": [
        "Implement three schemes: the sequential bootstrap; a uniform bootstrap with IS weights $1/(N P_i)$ using the sequential-bootstrap probabilities; and a uniform bootstrap with uniqueness sample weights. Do they give the same leaf values on a toy dataset?",
        "PER priorities adapt to TD error as learning proceeds. Sketch an \"error-adaptive sequential bootstrap\" and decide whether it is just boosting in disguise."
      ],
      "source": {
        "label": "Schaul, Quan, Antonoglou & Silver (2016) — Prioritized Experience Replay (ICLR); arXiv:1511.05952",
        "url": "https://arxiv.org/abs/1511.05952",
        "relation": "motivated by"
      }
    },
    {
      "id": "fml-sw-q8",
      "type": "design",
      "difficulty": 3,
      "prompt": "<p>You are training a cross-sectional model on US equities: around 3,000 to 7,000 names over 30 years, monthly rebalancing. The label is the sign or rank of the 3-month forward <em>sector-neutral residual</em> return, and the features include 12-1 momentum, value, quality and short-horizon reversal. With per-asset concurrency every label has $\\bar u \\approx 1/3$, and AFML's recipe would stop there.</p>\n<p>Design the sample-weighting and resampling scheme properly. It must:</p>\n<ul>\n<li>account for time overlap <em>and</em> cross-sectional dependence;</li>\n<li>handle a universe whose size roughly halves over the sample;</li>\n<li>work with purged, embargoed CV by date;</li>\n<li>run in minutes on a laptop for about 1.5 million stock-months;</li>\n<li>come with diagnostics a sceptical PM would accept.</li>\n</ul>\n<p>Specify the independence unit, the concurrency definition, the weight formula, the bootstrap unit, the setting of <code>max_samples</code> or leaf weights, and the experiment that would show the scheme helps.</p>",
      "whyItMatters": "AFML's sample-weight machinery was built for a single instrument's event stream. Cross-sectional equity models are where most quant researchers apply it, and naive per-asset uniqueness badly overstates the effective sample there.",
      "hints": [
        "In a cross-sectional model, what is the independent draw: a stock-month or a month?",
        "Petersen (2009) separates firm effects from time effects. Which dominates for monthly residual-return labels, and what does that imply for the bootstrap unit?",
        "Make total weight per date an explicit design choice first. Then layer temporal uniqueness on dates, and only then consider within-date down-weighting."
      ],
      "keyPoints": [
        "The independence unit is the date (a cluster of stock-months) after factor or sector residualisation. Residualising shrinks the time effect but does not remove it, so per-asset uniqueness overstates the information by roughly the effective cross-sectional correlation.",
        "Weights: normalise each date to equal total weight, so that eras with 7,000 names do not dominate. Multiply by date-level temporal uniqueness (1/3 for 3-month labels sampled monthly). Optionally scale each date by its effective breadth $n_t/(1+(n_t-1)\\bar\\rho_t)$ estimated from residual correlations.",
        "Resampling: bootstrap blocks of dates at least as long as the horizon, or run the sequential bootstrap over date intervals, never over individual stock-months. Size <code>max_samples</code> and <code>min_weight_fraction_leaf</code> from the effective number of dates (hundreds), not from 1.5 million rows.",
        "CV: use group folds by date with a purge equal to the label horizon, plus an embargo long enough to cover overlapping feature windows (adjacent months' 12-1 momentum values are nearly identical).",
        "Diagnostics and test: report the effective number of dates, Kish ESS, and weight share by era. Compare weighted and unweighted rank IC and long-short Sharpe under identical purged folds, with a paired fold-level confidence interval. Count every scheme tried for a deflated Sharpe ratio."
      ],
      "followUps": [
        "With a cross-sectional rank label, labels within a date are mechanically negatively dependent because ranks sum to a constant. How does that change the effective breadth formula and the choice of loss?",
        "Gu, Kelly & Xiu (2020) pool stock-months without uniqueness weights and still report robust out-of-sample results. What in their design (one-month horizon, large cross-section, recursive validation) makes that defensible?"
      ],
      "source": {
        "label": "Petersen (2009) — Estimating Standard Errors in Finance Panel Data Sets: Comparing Approaches (RFS 22(1)); AFML ch. 4",
        "url": "https://doi.org/10.1093/rfs/hhn053",
        "relation": "motivated by"
      }
    }
  ],
  "projects": [
    {
      "id": "fml-sample-weights-r1",
      "title": "Replicate Boudoukh–Richardson–Whitelaw: how much do overlapping horizons really add?",
      "level": "replication",
      "hours": "10–14",
      "paper": {
        "label": "Boudoukh, Richardson & Whitelaw (2008) — The Myth of Long-Horizon Predictability (RFS 21(4); NBER WP 11841)",
        "url": "https://doi.org/10.1093/rfs/hhl042"
      },
      "goal": "Reproduce BRW's core result that, with a persistent predictor, slope estimates from overlapping long-horizon regressions are nearly perfectly correlated with the one-period estimate under the null. Use their simulation (Table 1, Panel A and Figure 1 in the NBER working-paper numbering) and the dividend-yield block of their empirical Tables 4–5 (1–5-year CRSP value-weighted excess returns, 1926–2004). Then translate the finding into this module's language: average uniqueness, effective sample size of overlapping labels, and what that means for weighting overlapping ML labels.",
      "data": "Public data only; never use employer data, code or infrastructure. Simulation part: synthetic, with parameters from the paper ($\\rho=0.953$, $\\sigma_\\varepsilon=0.212$, $\\sigma_u=0.154$, $\\operatorname{corr}(\\varepsilon,u)=-0.712$, 75 annual observations). Empirical part: monthly Mkt-RF and RF from the Ken French Data Library (mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html), compounded to annual excess returns; dividend yield from Amit Goyal's public predictor file (sites.google.com/view/agoyal145) or Robert Shiller's S&amp;P composite data. Caveat: BRW use the CRSP value-weighted dividend yield, so an S&amp;P-based yield is a documented source of discrepancy.",
      "steps": [
        "Simulate the null model $r_{t+1}=\\varepsilon_{t+1}$, $X_{t+1}=\\rho X_t+u_{t+1}$ with the paper's parameters, 75 observations, and at least 20,000 replications. For each replication, regress $J$-year overlapping sums of returns on $X_t$ for $J=1,\\dots,5$ using the same 75 predictor observations for every horizon, as BRW do.",
        "Report the means, the correlation matrix of $\\hat\\beta_1,\\dots,\\hat\\beta_5$ and the percentage of replications with monotone $\\hat\\beta_J$. Repeat with $\\operatorname{corr}(\\varepsilon,u)=0$ (their Panel B).",
        "Verify the analytic correlation $\\sqrt{(1+\\rho)/2}$ between the 1- and 2-period estimators, and reproduce Figure 1 (correlation of $\\hat\\beta_1$ with $\\hat\\beta_J$ for $\\rho \\in \\{0.953, 0.75, 0.5, 0.25, 0\\}$).",
        "Build annual excess log returns for 1926–2004 and log dividend yield for 1925–1999. Run the 1–5-year regressions and compute $\\hat\\beta_J$, $R^2_J$ and the ratios $\\hat\\beta_J/\\hat\\beta_1$ and $R^2_J/R^2_1$.",
        "Bridge to sample weights: compute the average uniqueness of the $J$-year labels on the annual grid and the implied $\\sum_i\\bar u_i$. Compare the number of \"independent\" estimates suggested by uniqueness with what the BRW cross-horizon correlations imply."
      ],
      "deliverables": [
        "Reproducible script or notebook (simulation and empirical parts) with a fixed seed",
        "Side-by-side table: paper versus replication for Table 1 Panel A/B statistics and the dividend-yield rows of Tables 4–5",
        "Replica of Figure 1",
        "Discrepancy write-up (1–2 pages): every deviation larger than the tolerances below, its suspected cause (data vintage, CRSP vs S&P dividend yield, annual compounding convention, log vs simple returns), and a test of that cause",
        "Half-page note linking the result to uniqueness weighting and bag sizing for overlapping ML labels"
      ],
      "acceptance": [
        "Simulated corr(β̂1, β̂J) for J = 2..5 within ±0.01 of 0.966, 0.926, 0.885 and 0.843 (Panel A), with Monte Carlo standard errors reported.",
        "Mean simulated β̂1..β̂5 within ±0.01 of 0.055, 0.106, 0.153, 0.196, 0.235; percentage monotone within ±2 percentage points of 66% (Panel A) and 57% (Panel B).",
        "The analytic J=1 vs J=2 correlation equals 0.988 to three decimals at ρ = 0.953, and the simulated value agrees within Monte Carlo error.",
        "Empirical β̂J increases with horizon. Either each β̂J is within ±0.05 of the paper's 0.131, 0.257, 0.390, 0.461, 0.521, or the gap is attributed quantitatively in the discrepancy write-up (for example by showing the estimated AR(1) of your yield series against 0.953).",
        "All data are public, and download dates and file versions are recorded."
      ],
      "extensions": [
        "Extend the sample through the latest year available and check whether the near-perfect cross-horizon pattern persists.",
        "Replace annual horizons with daily-sampled 20-day labels on an ETF and a persistent feature, and measure the cross-horizon and cross-phase correlation of ML feature importances."
      ]
    }
  ]
});
