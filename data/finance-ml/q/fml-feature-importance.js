LAB.extend("fml-feature-importance", {
  "questions": [
    {
      "id": "fml-fi-q1",
      "type": "derive",
      "difficulty": 3,
      "prompt": "<p>Fit OLS of $y$ on standardised features $x_1,\\dots,x_p$, with all variables centred. Let $\\mathrm{RSS}$ be the training mean squared residual, and let $\\mathrm{RSS}^*_j$ be the same quantity after randomly permuting the $N$ values of $x_j$ while keeping $\\hat\\beta$ fixed.</p>\n<ol>\n<li>Show that $\\mathbb{E}_P[\\mathrm{RSS}^*_j-\\mathrm{RSS}]=2\\hat\\beta_j^2$, and point out exactly where centring and the normal equations are used. Explain why the identity still holds approximately on an independent test set.</li>\n<li>Now take $y=x_1+\\varepsilon$ and add a near-duplicate $x_2=x_1+\\delta u$ with small $\\delta$. Compute the permutation importance of $x_1$, of $x_2$, and of the pair permuted jointly, for (i) a ridge fit whose penalty splits the coefficient evenly, and (ii) OLS, where $\\hat\\beta$ is unstable. Compare each with drop-and-refit (LOCO) importance.</li>\n<li>The module's cheatsheet says \"$X_2=X_1\\Rightarrow\\operatorname{MDA}_1\\approx\\operatorname{MDA}_2\\approx0$\". Under which definition of importance is that exactly right, under which is it wrong, and in which direction does OLS err?</li>\n</ol>",
      "whyItMatters": "\"MDA erases substitutes\" is usually learned as a slogan. The algebra shows it is true for refit-based importance, and false, sometimes in the opposite direction, for permuting a fitted model. That changes how you should read every MDA bar chart.",
      "hints": [
        "Write the permuted residual as $r_i-\\hat\\beta_j(x_{\\pi(i)j}-x_{ij})$ and expand the square.",
        "Use $\\sum_i r_i x_{ij}=0$ (normal equations) and $\\mathbb{E}_P[x_{\\pi(i)j}]=\\bar x_j=0$, so the cross term vanishes and the square term has expectation $2\\hat\\beta_j^2$.",
        "For the duplicate case, permutation importance only sees the fitted coefficients. Plug in $(\\tfrac12,\\tfrac12)$ for ridge and $(1-c,\\,c)$ for OLS, where $\\operatorname{Var}(c)$ grows like $1/(N\\delta^2)$."
      ],
      "keyPoints": [
        "$\\mathrm{RSS}^*_j-\\mathrm{RSS}=-\\tfrac{2\\hat\\beta_j}{N}\\sum_i r_i(x_{\\pi(i)j}-x_{ij})+\\tfrac{\\hat\\beta_j^2}{N}\\sum_i(x_{\\pi(i)j}-x_{ij})^2$. The cross term vanishes by the normal equations and centring; the square term has permutation expectation 2.",
        "On a test set the cross term is $O_p(N^{-1/2})$ rather than zero, so the identity holds approximately, scaled by the test variance of $x_j$.",
        "Even split (ridge, or population OLS with correlation $c\\lt1$; compare Gregorutti et al., Prop. 3, $I=2(\\tau_0/(1-c+pc))^2$): each duplicate gets $1/2$ and the joint permutation gets 2. The individual importances sum to half the joint one. This is non-additivity, not erasure.",
        "OLS with near-duplicates: with $\\hat\\beta=(1-c,\\,c)$ and large $\\operatorname{Var}(c)$, the individual importances $2(1-c)^2$ and $2c^2$ can be far above 2. Permutation overstates both, while the joint importance stays near 2.",
        "\"MDA $\\approx0$ for duplicates\" is exactly right for drop-and-refit (LOCO) importance and wrong for permuting a fixed model. The gap between joint and summed individual importance is a usable substitution diagnostic."
      ],
      "followUps": [
        "Extend to a random forest with <code>max_features=1</code> on exact duplicates and an additive response. Argue that each copy's permutation importance is roughly a quarter of the joint importance, and check it by simulation.",
        "Use the joint-minus-sum gap to build substitution clusters directly from importance, instead of from feature correlations. When would the two clusterings differ?"
      ],
      "source": {
        "label": "Hastie, Tibshirani & Friedman (2009), ESL 2nd ed., exercise 15.7, adapted and extended; Gregorutti, Michel & Saint-Pierre (2017), Props. 2–3",
        "url": "https://doi.org/10.1007/978-0-387-84858-7",
        "relation": "adapted from"
      }
    },
    {
      "id": "fml-fi-q2",
      "type": "debate",
      "difficulty": 3,
      "prompt": "<p>Two literatures make apparently opposite claims about the permutation importance of correlated features.</p>\n<ul>\n<li>López de Prado (AFML ch. 8; MLAM ch. 6) warns that substitution makes MDA <em>understate</em> informative features that have correlated partners. Gregorutti et al. (2017) derive that, in a Gaussian linear model, the permutation importance of equicorrelated informative variables shrinks as the correlation and the group size grow.</li>\n<li>Strobl et al. (2008), Nicodemus et al. (2010) and Hooker et al. (2021) report that unconditional permutation importance <em>overstates</em> correlated predictors, including ones with a zero coefficient. Strobl et al. find the effect is strongest for small <code>mtry</code>, which is exactly the <code>max_features=1</code> setting AFML recommends to avoid masking.</li>\n</ul>\n<p>Reconcile the two:</p>\n<ol>\n<li>What estimand does each side have in mind (marginal or conditional null)?</li>\n<li>What is the role of how the fitted model allocates reliance across features, versus extrapolation off the data manifold?</li>\n<li>Predict, with reasons, the unconditional permutation importance of $X_4$ in Strobl's design ($\\beta_4=0$, but correlated 0.9 with $X_1$–$X_3$, which have $\\beta=5,5,2$) under a forest with <code>max_features=1</code>. How would it change under clustered (joint) permutation of $X_1$–$X_4$, and under conditional permutation?</li>\n</ol>",
      "whyItMatters": "An equity characteristic set is a web of correlated features. Whether MDA inflates or deflates a correlated characteristic decides which signals survive a research review.",
      "hints": [
        "Write down the null hypothesis that \"permute $X_j$ independently of everything else\" implicitly tests.",
        "Ask two separate questions: how much does the fitted model rely on $X_j$, and what happens to predictions at permuted points that never occur in the data?",
        "With <code>max_features=1</code>, a split on $X_4$ is often the best one available when $X_1$ is not drawn, because $X_4$ is a 0.9-correlated proxy."
      ],
      "keyPoints": [
        "Unconditional permutation tests the marginal null $X_j\\perp(Y,X_{-j})$. A correlated zero-coefficient feature violates it through $X_{-j}$, so it is \"important\" by that definition. Conditional permutation tests $X_j\\perp Y\\mid X_{-j}$.",
        "Overstatement comes from two things: the fitted model genuinely uses the correlated feature (small mtry forces splits on proxies), and permuted rows fall off the manifold, where the model's response can be extreme.",
        "Understatement comes from reliance being split across substitutes (Gregorutti: $I=2(\\tau_0/(1-c+pc))^2$ in the equicorrelated linear case) and, for refit-based importance, from the model rerouting through the partner.",
        "Both claims hold in different regimes. Small mtry plus a correlated zero-coefficient feature inflates that feature; many near-equal informative substitutes dilute one another.",
        "For $X_4$: clearly positive unconditional importance, largest at small mtry (Strobl et al., Fig. 3). Joint permutation of $X_1$–$X_4$ gives the block a large score and sidesteps who gets the credit. Conditional permutation pushes $X_4$ towards zero."
      ],
      "followUps": [
        "Design one synthetic experiment with three dials (correlation, number of substitutes, mtry) that maps out where each side's claim holds.",
        "In equity data, which characteristic pairs behave like Strobl's $X_4$ (correlated but causally inert), and which like Gregorutti's equicorrelated informative group?"
      ],
      "source": {
        "label": "Published debate: Strobl et al. (2008), Nicodemus et al. (2010) and Hooker et al. (2021) versus López de Prado (AFML ch. 8; MLAM ch. 6) and Gregorutti et al. (2017)",
        "url": "https://doi.org/10.1186/1471-2105-9-307",
        "relation": "motivated by"
      },
      "sides": [
        {
          "position": "Permutation importance understates correlated informative features: substitutes share or absorb the credit, so a real signal can vanish from the ranking.",
          "refs": [
            {
              "label": "López de Prado (2020) — Machine Learning for Asset Managers, ch. 6 (Feature Importance Analysis)",
              "url": "https://doi.org/10.1017/9781108883658"
            },
            {
              "label": "Gregorutti, Michel & Saint-Pierre (2017) — Correlation and variable importance in random forests",
              "url": "https://doi.org/10.1007/s11222-016-9646-1"
            }
          ]
        },
        {
          "position": "Unconditional permutation importance overstates correlated features, including inert ones, because it tests a marginal null and forces extrapolation off the data manifold.",
          "refs": [
            {
              "label": "Strobl, Boulesteix, Kneib, Augustin & Zeileis (2008) — Conditional variable importance for random forests",
              "url": "https://doi.org/10.1186/1471-2105-9-307"
            },
            {
              "label": "Nicodemus, Malley, Strobl & Ziegler (2010) — The behaviour of random forest permutation-based variable importance measures under predictor correlation",
              "url": "https://doi.org/10.1186/1471-2105-11-110"
            },
            {
              "label": "Hooker, Mentch & Zhou (2021) — Unrestricted permutation forces extrapolation: variable importance requires at least one more model, or there is no free variable importance",
              "url": "https://doi.org/10.1007/s11222-021-10057-z"
            }
          ]
        }
      ]
    },
    {
      "id": "fml-fi-q3",
      "type": "debate",
      "difficulty": 3,
      "prompt": "<p>Take $f(x)=\\beta_1x_1+\\beta_2x_2$, where $(x_1,x_2)$ is standard bivariate normal with correlation $\\rho$.</p>\n<ol>\n<li>Derive the interventional SHAP values and the observational (conditional-expectation) SHAP values. Show that with $\\beta_2=0$, the observational version gives $x_2$ a nonzero attribution of $\\tfrac{\\rho}{2}\\beta_1x_2$.</li>\n<li>Chen, Janizek, Lundberg &amp; Lee (2020) frame the choice as \"true to the model\" versus \"true to the data\". Janzing et al. (2020) argue the interventional version is the causally correct way to explain a model. Aas et al. (2021) and Frye et al. (2021) argue for conditional, on-manifold value functions. For each of three equity-quant uses, choose a side and defend it: (a) explaining to a PM a deployed model's position in one stock; (b) auditing whether a model relies on a characteristic that is banned or about to become unavailable; (c) discovering which characteristics carry information about returns.</li>\n<li>Explain why neither choice tells you whether a feature improves out-of-sample loss.</li>\n</ol>",
      "whyItMatters": "SHAP plots are the default explanation format in model reviews. Choosing the value function without knowing the question being asked produces confident attributions to the wrong feature.",
      "hints": [
        "Compute $v(S)$ for $S=\\varnothing,\\{1\\},\\{2\\},\\{1,2\\}$ under each value function, then average the marginal contributions over the two orderings.",
        "For the observational case you need $\\mathbb{E}[x_2\\mid x_1]=\\rho x_1$, so $v(\\{1\\})=(\\beta_1+\\rho\\beta_2)x_1$.",
        "Classify each use case by asking: is the question about $f$, or about the joint distribution of $(X,Y)$?"
      ],
      "keyPoints": [
        "Interventional: $\\phi_j=\\beta_j(x_j-\\mathbb{E}x_j)$ for a linear model, independent of $\\rho$. Features the model does not use get zero.",
        "Observational: $\\phi_1=\\beta_1x_1+\\tfrac{\\rho}{2}(\\beta_2x_1-\\beta_1x_2)$. With $\\beta_2=0$, $\\phi_2=\\tfrac{\\rho}{2}\\beta_1x_2\\ne0$.",
        "Uses (a) and (b) ask about the function, so use interventional SHAP (true to the model). Use (c) asks about the data, so observational SHAP fits better, but a correlated proxy then gets credit, so pair it with conditional or knockoff-style tests.",
        "Interventional SHAP evaluates $f$ at off-manifold points, as naive permutation does. Observational SHAP needs a conditional model of the features, which is hard to estimate in high dimensions and in non-stationary data.",
        "Efficiency decomposes $f(x)-\\mathbb{E}f$, not the loss. A feature can have large $|\\phi|$ and zero or negative purged MDA, so predictive value needs a loss-based measure (purged MDA, LOCO)."
      ],
      "followUps": [
        "For a gradient-boosted model on 100 correlated characteristics, which estimator of observational SHAP would you trust (for example the Gaussian or copula approaches in Aas et al.)? How would you validate it on a synthetic panel where the truth is known?",
        "Construct a model in which the interventional and observational global importance rankings are exactly reversed."
      ],
      "source": {
        "label": "Chen, Janizek, Lundberg & Lee (2020) — True to the Model or True to the Data?",
        "url": "https://arxiv.org/abs/2006.16234",
        "relation": "motivated by"
      },
      "sides": [
        {
          "position": "Interventional SHAP ('true to the model'): attribute only through the features the function actually uses; this is the causally correct way to explain a model.",
          "refs": [
            {
              "label": "Janzing, Minorics & Blöbaum (2020) — Feature relevance quantification in explainable AI: A causal problem",
              "url": "https://proceedings.mlr.press/v108/janzing20a.html"
            },
            {
              "label": "Chen, Janizek, Lundberg & Lee (2020) — True to the Model or True to the Data?",
              "url": "https://arxiv.org/abs/2006.16234"
            }
          ]
        },
        {
          "position": "Observational / on-manifold SHAP ('true to the data'): respect the feature distribution and avoid evaluating the model at impossible points.",
          "refs": [
            {
              "label": "Aas, Jullum & Løland (2021) — Explaining individual predictions when features are dependent: More accurate approximations to Shapley values",
              "url": "https://doi.org/10.1016/j.artint.2021.103502"
            },
            {
              "label": "Frye, de Mijolla, Begley, Cowton, Stanley & Feige (2021) — Shapley explainability on the data manifold (ICLR 2021)",
              "url": "https://arxiv.org/abs/2006.01272"
            }
          ]
        },
        {
          "position": "Neither: Shapley-based attributions do not match what users need from feature importance, whichever value function is chosen.",
          "refs": [
            {
              "label": "Kumar, Venkatasubramanian, Scheidegger & Friedler (2020) — Problems with Shapley-value-based explanations as feature importance measures",
              "url": "https://arxiv.org/abs/2002.11097"
            }
          ]
        }
      ]
    },
    {
      "id": "fml-fi-q4",
      "type": "predict",
      "difficulty": 2,
      "prompt": "<p>Generate $n=5{,}000$ rows. One binary feature $D$ (think of a sector or index-membership flag) genuinely shifts the label: $y=\\mathbb{1}[0.3(D-\\tfrac12)+\\varepsilon\\gt0]$ with $\\varepsilon\\sim N(0,1)$. Add five continuous pure-noise features. Fit a 300-tree random forest with <code>max_features=1</code> on the first 4,000 rows and evaluate on the last 1,000.</p>\n<p>Before running anything, predict:</p>\n<ol>\n<li>the normalised MDI share of $D$ versus the average noise feature;</li>\n<li>the hold-out permutation importance (log-loss) of $D$ versus noise;</li>\n</ol>\n<p>both for <code>min_samples_leaf=1</code> and for <code>min_samples_leaf=100</code>. Also predict what happens with no signal (coefficient 0). Then explain the mechanism, and what it implies for a finance feature set that mixes regime flags with continuous characteristics.</p>",
      "whyItMatters": "Finance feature sets mix binary regime flags and categorical codes with continuous characteristics. MDI can rank a real flag below pure noise, so a bar chart can quietly remove the only genuine signal.",
      "hints": [
        "How many distinct split points can each feature offer a node? How many times can a binary feature be used along one root-to-leaf path?",
        "In fully grown trees, most of the total impurity reduction happens deep in the tree, fitting noise. Which features get the credit for that?",
        "Permutation importance on hold-out data rewards only splits that generalise."
      ],
      "keyPoints": [
        "Fully grown trees: MDI of the informative flag is about 0.02, against about 0.20 for each noise feature, so the only real signal ranks last (reference simulation, 10 seeds).",
        "With <code>min_samples_leaf=100</code>: flag MDI is about 0.25 against about 0.15 per noise feature. The ranking flips because leaves can no longer be purified by chopping up continuous noise.",
        "Hold-out log-loss permutation importance ranks the flag first in both settings (about 0.01–0.016 against about 0), and is about 0 for every feature when there is no signal.",
        "Mechanism: a binary feature offers one cut point and can be split at most once per path, while continuous noise offers thousands of cut points. In-sample impurity reduction from fitting noise goes to the continuous features (Strobl et al. 2007), and the effect grows with tree depth.",
        "Implication: never compare MDI across features of different cardinality, such as flags against characteristics. Use out-of-sample, loss-based importance, or constrain depth and report a null for each feature type."
      ],
      "followUps": [
        "Does the debiased MDI of Li et al. (2019), or an out-of-bag MDI, fix the ranking here? Predict first, then test.",
        "Replace the binary flag with a 10-level sector code encoded as an integer. Predict how the bias changes."
      ],
      "source": {
        "label": "Strobl, Boulesteix, Zeileis & Hothorn (2007) — Bias in random forest variable importance measures: Illustrations, sources and a solution",
        "url": "https://doi.org/10.1186/1471-2105-8-25",
        "relation": "motivated by"
      }
    },
    {
      "id": "fml-fi-q5",
      "type": "counterexample",
      "difficulty": 3,
      "prompt": "<p>Clustered MDA (MLAM ch. 6) clusters features by correlation distance and permutes each cluster jointly, so within-cluster substitutes cannot rescue the model. Construct three explicit counterexamples where it still misleads. For each, give the data-generating process, what clustered MDA reports, what the truth is, and a repair:</p>\n<ol>\n<li>redundancy that correlation cannot see (hint: signed versus absolute returns);</li>\n<li>dependence <em>between</em> clusters, so that jointly permuting one block creates off-manifold rows;</li>\n<li>a feature whose cluster membership flips between folds or seeds.</li>\n</ol>\n<p>Then say which of the three is most likely in a real equity characteristic set, and why.</p>",
      "whyItMatters": "Clustered MDA is the standard fix for substitution in this literature. Knowing where it breaks keeps it from becoming a new source of false confidence.",
      "hints": [
        "Correlation measures linear dependence only. Which common financial transformations destroy correlation but keep all the information?",
        "Joint permutation preserves dependence inside the block but not between blocks. What does that do to a row where value and profitability end up jointly implausible?",
        "Run the clustering on bootstrap resamples of the time axis and track which cluster each feature lands in."
      ],
      "keyPoints": [
        "(1) $r$ and $|r|$ (or $r^2$) are uncorrelated when $r$ is symmetric, so correlation-distance clustering separates them. If the label depends on volatility, and both $|r|$ and realised vol proxy it, permuting either cluster leaves a substitute in the other, so both look unimportant. Repair: use dependence measures such as mutual information or variation of information, or check clusters with joint-versus-sum importance gaps.",
        "(2) If the value and profitability clusters are correlated, permuting one block breaks the cross-cluster relation and creates implausible combinations. A nonlinear model can react wildly, inflating importance: the extrapolation critique of Hooker et al., at block level. Repair: residualise across clusters as MLAM suggests, or use conditional block permutation.",
        "(3) A feature correlated about equally with two clusters (a composite or bridging characteristic) is assigned arbitrarily, so its credit moves between clusters across folds and the cluster rankings become unstable. Repair: consensus clustering over resamples, or report the bridging feature on its own.",
        "Report stability next to clustered MDA: for example, the adjusted Rand index of clusterings across folds and Kendall's tau of cluster rankings.",
        "In equity sets, (2) and (3) are the most common: characteristic families are correlated with each other (value, profitability, investment), and composite signals bridge families."
      ],
      "followUps": [
        "Propose a clustering criterion based on importance itself (group features whose joint permutation importance exceeds the sum of their individual importances). Compare it with correlation clustering on the Chen–Zimmermann predictors."
      ],
      "source": {
        "label": "López de Prado (2020), Machine Learning for Asset Managers, ch. 6 (clustered feature importance), motivated by; Hooker, Mentch & Zhou (2021)",
        "url": "https://doi.org/10.1017/9781108883658",
        "relation": "motivated by"
      }
    },
    {
      "id": "fml-fi-q6",
      "type": "connect",
      "difficulty": 3,
      "prompt": "<p>Model-X knockoffs (Candès et al. 2018) build synthetic copies $\\tilde X$ such that swapping any subset of pairs $X_j\\leftrightarrow\\tilde X_j$ leaves the joint distribution unchanged, and $\\tilde X\\perp Y\\mid X$. Feature statistics $W_j$ then give finite-sample false discovery rate (FDR) control. Group knockoffs (Dai &amp; Barber 2016) do the same for groups of features.</p>\n<ol>\n<li>Map clustered MDA onto group knockoffs. What plays the role of the group, of $\\tilde X$, of $W_j$, and of the selection threshold? What does clustered MDA lack that knockoffs supply?</li>\n<li>The model-X guarantee assumes i.i.d. rows $(X_i,Y_i)$ and a known feature distribution. List exactly where an overlapping-label, serially dependent, non-stationary financial panel violates each assumption.</li>\n<li>HMM knockoffs (Sesia, Sabatti &amp; Candès 2019) handle Markov-structured dependence <em>across features</em>. Explain why that is not the same as dependence <em>across rows</em>. Propose a practical compromise for financial data (for example, subsampling to non-overlapping labels, or building knockoffs within date blocks), and say what it costs in power.</li>\n</ol>",
      "whyItMatters": "Clustered MDA gives rankings without error control. Knockoffs are the main statistical route to a list of feature clusters with a guaranteed false discovery rate, provided their assumptions can be made to fit financial data.",
      "hints": [
        "List the three ingredients of the knockoff filter (knockoff variables, feature statistic, data-dependent threshold), and find the closest analogue of each in clustered MDA.",
        "Exchangeability is a statement about the distribution of a single row. What extra assumption makes the rows of the dataset behave collectively?",
        "If you keep only every $h$-th date, the label windows are roughly independent. What is the effective sample size then?"
      ],
      "keyPoints": [
        "Mapping: a cluster is a group. Joint permutation is a crude knockoff that keeps within-group dependence but not cross-group dependence, and it is not exchangeable with the original. The clustered MDA score plays the role of $W$, and \"2 standard errors above zero\" plays the role of the knockoff+ threshold, but with no FDR control.",
        "Knockoffs supply a null that is valid conditional on the other features (exchangeability). That addresses both substitution and the extrapolation critique, and it comes with a finite-sample FDR guarantee across clusters.",
        "Violations: rows are serially dependent (overlapping labels, persistent features); the feature distribution is unknown and drifts; and rows from the same date are dependent across the cross-section. The guarantee does not hold as stated.",
        "HMM knockoffs model dependence among the coordinates of $X$ within a row (for example along a genome), not dependence between rows. Row dependence needs blocking or subsampling.",
        "Compromise: build knockoffs on non-overlapping label dates (every $h$-th date) or within date blocks, refitting per fold. This cuts the effective sample size by roughly the average-uniqueness factor, which lowers power."
      ],
      "followUps": [
        "Gaussian or deep knockoffs need a model for $P(X)$. On a characteristic panel, would you fit it per date (cross-section) or pooled over time, and what does each choice assume?"
      ],
      "source": {
        "label": "Candès, Fan, Janson & Lv (2018) — Panning for gold: model-X knockoffs; Dai & Barber (2016) — The knockoff filter for FDR control in group-sparse and multitask regression; Sesia, Sabatti & Candès (2019) — Gene hunting with hidden Markov model knockoffs",
        "url": "https://doi.org/10.1111/rssb.12265",
        "relation": "motivated by"
      }
    },
    {
      "id": "fml-fi-q7",
      "type": "design",
      "difficulty": 3,
      "prompt": "<p>AFML exercise 8.4 compares importance computed separately on 10 sub-datasets and then averaged (\"parallelized\") with importance computed once on the stacked data, and asks what causes the discrepancy and which is more reliable. In synthetic data the sub-datasets are identically distributed. In a real cross-section they are not.</p>\n<p>Design a study on the Chen–Zimmermann open-source predictor data (or any public characteristic panel) that answers this question: is the importance of a feature cluster <em>homogeneous</em> across size buckets and across decades, or does pooling hide offsetting effects?</p>\n<p>Constraints: purged, date-blocked folds; at most 200 model fits in total; and the output must separate genuine heterogeneity from estimation noise. Specify the groups, the importance estimator, the null distribution for \"no heterogeneity\", the test statistic, and how you would report the results.</p>",
      "whyItMatters": "A characteristic that matters only in small caps, or only before 2005, looks unimportant in a pooled analysis. A characteristic whose importance differs across groups only by noise looks heterogeneous in a split analysis. You need a test that tells the two apart.",
      "hints": [
        "Smaller sub-datasets give noisier importances. Before calling a difference heterogeneity, ask what dispersion noise alone would produce.",
        "Meta-analysis has a standard tool for asking whether $k$ estimates are consistent with one common value.",
        "Permuting group labels across stocks within each date keeps the cross-sectional structure but destroys any real group-specific effect."
      ],
      "keyPoints": [
        "There are three sources of parallelized-versus-stacked discrepancy: estimation noise (smaller samples per group), genuine heterogeneity of the feature–label relation, and the stacked model's ability to learn interactions with group identity.",
        "Estimator: purged clustered MDA with log-loss on date-blocked folds, computed per group with a model fitted on that group, and on the stack both with and without group indicators.",
        "Null of homogeneity: permute group labels across stocks within dates (or bootstrap dates), then recompute the per-group importances. Compare the observed between-group dispersion with the null dispersion, using a Cochran's Q or random-effects style statistic built on fold-based standard errors.",
        "Budget, for example: 3 size buckets × 3 decades × 5 folds = 45 fits, plus 10 stacked fits, plus the permutation nulls. Permutation importance reuses fitted models, but each group relabelling needs refits, so cap the number of null draws to stay under 200 fits.",
        "Report: per-group importances with standard errors, the heterogeneity statistic and p-value for each cluster, and the stacked model with group interactions. Flag clusters whose pooled importance is near zero while their per-group importances have opposite signs."
      ],
      "followUps": [
        "If a cluster matters only in small caps, how would you check that this is not just a liquidity or transaction-cost artefact before building on it?"
      ],
      "source": {
        "label": "López de Prado (2018), Advances in Financial Machine Learning, ch. 8, exercise 8.4 (parallelized vs stacked feature importance), adapted and extended",
        "url": "",
        "relation": "adapted from"
      }
    },
    {
      "id": "fml-fi-q8",
      "type": "connect",
      "difficulty": 2,
      "prompt": "<p>Consider this causal graph for one stock-month:</p>\n<ul>\n<li>profitability $P$ causes the next-month return $R$, and so does firm size $S$;</li>\n<li>analyst coverage $A$ is caused by both $P$ and $S$, but has no effect on $R$;</li>\n<li>a \"news sentiment\" feature $N$, stamped at month end, is actually measured over a window that overlaps the first days of the label window, so it is partly caused by $R$.</li>\n</ul>\n<p>You fit a forest on $(P,A,S,N)$ to predict $R$.</p>\n<ol>\n<li>Rank, with reasons, how purged MDA, SFI and interventional SHAP would order the four features. Which ordering, if any, matches the causal effects?</li>\n<li>Classify each feature as a cause, a descendant of causes (proxy), or a leakage variable. Which would still matter under an intervention $do(P)$?</li>\n<li>Connect this to López de Prado (2023): what extra assumptions turn \"important\" into \"causal\", and what natural experiment could supply evidence for coverage or size?</li>\n</ol>",
      "whyItMatters": "Importance maps are routinely read as economic stories. This example shows the three ways that reading fails at once: leakage, proxies and substitution.",
      "hints": [
        "Start with $N$: when is it measured, relative to the label window?",
        "Is $A$ a cause of $R$, an effect of the causes of $R$, or both? What does SFI measure for such a variable?",
        "Importance answers \"what does the model need in order to predict $R$ from observational data?\". Causation asks \"what happens to $R$ under $do(P)$?\". Which assumptions bridge the two?"
      ],
      "keyPoints": [
        "$N$ dominates every importance measure because it is partly a function of the label (timestamp leakage), even though intervening on $N$ has no effect on $R$. Purging cannot fix a feature measured after the label starts; only point-in-time timestamps can.",
        "$A$ has no causal effect but positive SFI, because it proxies $P$ and $S$. Its MDA and SHAP depend on how the model splits reliance between $A$ and its parents (substitution).",
        "$P$ and $S$ are the causal parents, and they confound the $A$–$R$ association. None of the importance measures estimates the size of the effect of $do(P)$ on $\\mathbb{E}[R]$.",
        "Turning importance into causation needs a graph plus an identification strategy: an adjustment set, an instrument, or a natural experiment such as index reconstitutions that shift coverage and ownership.",
        "Practical lesson: audit feature timestamps against label start times, and treat importance as hypothesis generation for causal factor research."
      ],
      "followUps": [
        "Index reconstitutions change analyst coverage and ownership for some firms for reasons unrelated to fundamentals. Sketch how you would use one to test whether coverage has a causal effect on returns, and what importance analysis could add."
      ],
      "source": {
        "label": "López de Prado (2023) — Causal Factor Investing: Can Factor Investing Become Scientific?",
        "url": "https://doi.org/10.1017/9781009397315",
        "relation": "motivated by"
      }
    }
  ],
  "projects": [
    {
      "id": "fml-feature-importance-r1",
      "title": "Replicate Strobl et al. (2008) Figure 3: unconditional vs conditional permutation importance under correlation",
      "level": "replication",
      "hours": "8–14",
      "paper": {
        "label": "Strobl, Boulesteix, Kneib, Augustin & Zeileis (2008) — Conditional variable importance for random forests",
        "url": "https://doi.org/10.1186/1471-2105-9-307"
      },
      "goal": "Reproduce the simulation behind Figure 3: 12 Gaussian predictors, X1–X4 block-correlated at 0.9, coefficients (5, 5, 2, 0, −5, −5, −2, 0, 0, 0, 0, 0), comparing marginal (unconditional) and conditional permutation importance across mtry values. Then add the López de Prado view, clustered (joint) permutation of the correlated block, plus drop-and-refit (LOCO) importance, and pin down where 'overstate' and 'understate' each apply.",
      "data": "Fully synthetic, using the design in the open-access paper. Python (scikit-learn) or R (party::cforest, which the paper used). Public or personal resources only, never employer data or code.",
      "steps": [
        "Read Section 2 of the paper and record the design: 12 predictors; block correlation 0.9 among X1–X4; coefficients from Table 1; noise N(0, 0.5); 500 replications; cforest with default settings except mtry; conditioning set = variables with |r| ≥ 0.2 to the permuted one. The text leaves the sample size, the number of trees and whether 0.5 is a variance or a standard deviation unclear. Decide, document your choices, and run a sensitivity check.",
        "Implement marginal permutation importance (out-of-bag or hold-out, MSE-based) and conditional permutation importance (permute X_j within cells of a grid defined by split points or quantiles of the conditioning variables).",
        "Run mtry ∈ {1, 3, 8} (1 is shown in the paper) for 500 replications, or at least 100 with stated Monte Carlo error. Plot the median and interquartile range per variable, as in Figure 3.",
        "Add joint permutation of the block X1–X4 (clustered MDA) and LOCO (refit without X_j) for every variable.",
        "If you use scikit-learn rather than cforest, run the experiment with both bootstrap and subsampling-without-replacement forests, to separate algorithmic differences from replication error."
      ],
      "deliverables": [
        "Reproducible script with fixed seeds and a config file listing every assumed parameter.",
        "Your Figure 3 next to the paper's, plus an extended version that includes clustered and LOCO importance.",
        "Discrepancy write-up (1–2 pages): where your medians or orderings differ from the paper's, and which choice (forest implementation, sample size, noise scale, conditioning grid) explains each difference, backed by a sensitivity run.",
        "One-paragraph verdict connecting the results to the understate-versus-overstate debate."
      ],
      "acceptance": [
        "At mtry = 1, the marginal importance of X4 (zero coefficient, inside the correlated block) is clearly above that of the independent zero-coefficient variables X8–X12: the interquartile ranges do not overlap.",
        "The conditional importance of X4 is below its marginal importance at every mtry tested, and the gap is largest at mtry = 1, matching the paper's qualitative finding.",
        "Among X1, X2, X5 and X6 (all |β| = 5), marginal importance at mtry = 1 is higher for the correlated X1 and X2 than for the independent X5 and X6, in line with the paper's finding of a preference for correlated predictors. If this is not reproduced, the write-up explains why.",
        "LOCO importance of each of X1–X3 is below its marginal permutation importance, and joint block permutation importance exceeds the sum of the individual LOCO importances, which quantifies substitution.",
        "Monte Carlo uncertainty is reported for every plotted median."
      ],
      "extensions": [
        "Repeat with time-indexed overlapping labels and purged folds, to see whether serial dependence changes the conclusions.",
        "Add the debiased MDI of Li et al. (2019) and TreeSHAP to the same figure."
      ]
    }
  ]
});
