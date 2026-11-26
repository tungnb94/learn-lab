LAB.extend("cvx-first-order", {
  "questions": [
    {
      "id": "cvx-first-order-q1",
      "type": "derive",
      "difficulty": 2,
      "prompt": "<p>You track an index with a long-only basket by minimising the mean absolute tracking error over $T$ historical days, $f(w)=\\frac1T\\|Rw-r\\|_1$, over the simplex $\\Delta$. The objective is nonsmooth and piecewise linear.</p><ol><li>Give a subgradient of $f$ that costs one matrix-vector product, and a bound $G$ on its norm in terms of the rows of $R$.</li><li>Starting from $\\|x^{k+1}-x^\\star\\|_2^2\\le\\|x^k-\\alpha_kg^k-x^\\star\\|_2^2$ (non-expansiveness of the projection), derive the bound $f^{(k)}_{\\text{best}}-f^\\star\\le\\big(R_0^2+G^2\\sum\\alpha_i^2\\big)/\\big(2\\sum\\alpha_i\\big)$, where $R_0$ is the initial distance to $x^\\star$. Bound $R_0$ on the simplex.</li><li>For a fixed budget of $k$ iterations, find the constant step minimising the bound, and the resulting accuracy. How many iterations for $\\epsilon=10^{-4}$ when $n=500$ and daily returns are around 1–2%?</li><li>Now assume a perfect tracker exists, so $f^\\star=0$. Derive the Polyak step and show that the resulting bound no longer requires knowing $k$ in advance.</li></ol>",
      "whyItMatters": "The subgradient bound is the template for every later first-order proof (stochastic, mirror, proximal). Computing actual iteration counts for a realistic tracking problem shows when the method is usable and when you need an LP or a smoothing.",
      "hints": [
        "$\\partial|u|=\\operatorname{sign}(u)$ off zero; chain through the affine map. Bound $\\|R^\\top s\\|_2$ for $s\\in[-1,1]^T$ by the sum (or root-sum-square times $\\sqrt T$) of row norms.",
        "Expand the square, use $g^{k\\top}(x^k-x^\\star)\\ge f(x^k)-f^\\star\\ge f_{\\text{best}}-f^\\star$, sum over $k$ and drop the final nonnegative distance. On the simplex, any two points are at most $\\sqrt2$ apart.",
        "Minimising $(R_0^2+G^2k\\alpha^2)/(2k\\alpha)$ over $\\alpha$ gives $\\alpha=R_0/(G\\sqrt k)$ and accuracy $R_0G/\\sqrt k$. For Polyak, plug $\\alpha_k=f(x^k)/\\|g^k\\|^2$ into the expanded square to get a sum of $f(x^k)^2/G^2$ bounded by $R_0^2$."
      ],
      "keyPoints": [
        "Subgradient $g=\\frac1TR^\\top\\operatorname{sign}(Rw-r)$ (any value in $[-1,1]$ at zeros); $\\|g\\|_2\\le\\frac1T\\sum_t\\|R_{t,:}\\|_2$, which is roughly the cross-sectional root-sum-square of returns, around $0.015\\sqrt n$.",
        "Correct telescoping derivation, explicitly using the projection step and the convexity inequality, with $R_0\\le\\sqrt2$ on the simplex.",
        "Optimal constant step $R_0/(G\\sqrt k)$ gives $R_0G/\\sqrt k$. With $G\\approx0.3$ and $R_0\\approx1.4$, $\\epsilon=10^{-4}$ needs $k$ around $10^7$–$10^8$, which is impractical, so an LP or a smoothed/prox method is the right tool at this accuracy.",
        "The Polyak step gives $\\sum_k f(x^k)^2\\le G^2R_0^2$, so $f_{\\text{best}}\\le GR_0/\\sqrt k$ for every $k$ simultaneously (anytime), and it adapts to sharper local geometry.",
        "Recognises that piecewise-linear objectives can show much faster convergence than the worst case with Polyak steps (sharpness), and why that does not contradict the lower bound."
      ],
      "followUps": [
        "Show that with a sharp minimum ($f(w)-f^\\star\\ge\\mu\\,\\mathrm{dist}(w,W^\\star)$) the Polyak step converges linearly, and estimate $\\mu$ for the tracking problem.",
        "Replace the projection by entropic mirror descent and recompute the iteration count with $\\|\\cdot\\|_\\infty$ subgradient bounds."
      ],
      "source": {
        "label": "EE364b lecture notes: Subgradient methods (convergence proof and Polyak step), motivated by",
        "url": "https://web.stanford.edu/class/ee364b/lectures/subgrad_method_notes.pdf",
        "relation": "motivated by"
      }
    },
    {
      "id": "cvx-first-order-q2",
      "type": "derive",
      "difficulty": 3,
      "prompt": "<p>The workhorse prox in long-only portfolio problems with turnover control is</p>$$\\operatorname{prox}(v)=\\arg\\min_{w}\\ \\tfrac12\\|w-v\\|_2^2+\\lambda\\|w-w_0\\|_1\\quad\\text{s.t.}\\quad \\mathbf 1^\\top w=1,\\ \\ l\\le w\\le u.$$<ol><li>Write the KKT conditions with a single multiplier $\\tau$ for the budget, and show that for fixed $\\tau$ the solution separates by coordinate. Give $w_i(\\tau)$ in closed form: a soft-threshold around $w_{0,i}$ followed by clipping to $[l_i,u_i]$.</li><li>Show that $\\phi(\\tau)=\\mathbf 1^\\top w(\\tau)$ is continuous, piecewise linear and nonincreasing. Give an exact $O(n\\log n)$ algorithm based on its breakpoints, and explain how the Duchi et al. (2008) / Condat (2016) pivot ideas reduce it to expected linear time.</li><li>Characterise which coordinates end exactly at $w_{0,i}$ (\"no trade\") in terms of $|v_i-\\tau-w_{0,i}|$, and interpret $\\tau$ economically.</li><li>Use the Moreau decomposition to obtain the prox of the convex conjugate of $g(w)=\\lambda\\|w-w_0\\|_1+I_{\\{\\mathbf 1^\\top w=1,\\,l\\le w\\le u\\}}$ at no extra cost. Where would a primal-dual method (e.g. PDHG) need it?</li></ol>",
      "whyItMatters": "If this prox is cheap, proximal gradient, FISTA and ADMM handle the usual long-only turnover-constrained portfolio at near gradient-descent cost. Writing it correctly, including degenerate breakpoints, is where most hand-rolled implementations break.",
      "hints": [
        "Stationarity: $0\\in w_i-v_i+\\tau+\\lambda\\,\\partial|w_i-w_{0,i}|+N_{[l_i,u_i]}(w_i)$. For fixed $\\tau$, this is a 1-D prox of an L1 term plus an interval indicator, which is soft-threshold then clip (prove the composition is valid in 1-D).",
        "Each $w_i(\\tau)$ is a nonincreasing piecewise-linear function with at most four breakpoints (two from clipping, two from the threshold). Sort all breakpoints, evaluate $\\phi$ at them, then interpolate linearly inside the bracketing segment.",
        "No trade happens when $|v_i-\\tau-w_{0,i}|\\le\\lambda$ (and $w_{0,i}\\in[l_i,u_i]$). Moreau: $\\operatorname{prox}_{g^*}(v)=v-\\operatorname{prox}_g(v)$."
      ],
      "keyPoints": [
        "Coordinate solution $w_i(\\tau)=\\operatorname{clip}_{[l_i,u_i]}\\big(w_{0,i}+S_\\lambda(v_i-\\tau-w_{0,i})\\big)$, with a short argument that clipping after soft-thresholding is exact in 1-D (convex 1-D function with interval constraint).",
        "$\\phi(\\tau)$ is monotone, continuous and piecewise linear with at most $4n$ breakpoints. A sort plus a scan gives an exact root in $O(n\\log n)$; randomized pivot or Condat-style methods give expected $O(n)$. Feasibility requires $\\mathbf 1^\\top l\\le1\\le\\mathbf 1^\\top u$.",
        "The set of untraded names is an interval condition $|v_i-\\tau-w_{0,i}|\\le\\lambda$; $\\tau$ is the marginal value of budget (cash), the shadow price shared by all names.",
        "Moreau gives $\\operatorname{prox}_{g^*}$ by subtraction (with scaling for general $\\lambda$-prox), needed by PDHG and Chambolle–Pock-type splittings when $g$ is composed with a linear map.",
        "Notes on degeneracy: flat segments of $\\phi$ (non-unique $\\tau$ but unique $w$) and floating-point handling of ties."
      ],
      "followUps": [
        "Extend to a gross-leverage constraint $\\|w\\|_1\\le L$ instead of long-only, and say whether one multiplier still suffices.",
        "Replace the L1 turnover term with the 3/2-power cost $\\sum_i b_i|w_i-w_{0,i}|^{3/2}$: is the 1-D prox still closed-form?"
      ],
      "source": {
        "label": "Parikh & Boyd (2014), Proximal Algorithms §6 (evaluating proximal operators), with Duchi et al. (2008) and Condat (2016) on simplex projection, motivated by",
        "url": "https://web.stanford.edu/~boyd/papers/pdf/prox_algs.pdf",
        "relation": "motivated by"
      }
    },
    {
      "id": "cvx-first-order-q3",
      "type": "predict",
      "difficulty": 2,
      "prompt": "<p>You fit a lasso combining $p=200$ candidate signals into a return forecast, $\\min_\\beta \\frac1{2T}\\|X\\beta-y\\|_2^2+\\lambda\\|\\beta\\|_1$, with $T=2{,}500$. The signals share a strong common component, so $X^\\top X/T$ has condition number around $10^4$; the solution has about 15 nonzeros. You run ISTA, FISTA and FISTA with O'Donoghue–Candès adaptive restart from $\\beta=0$ with step $1/L$.</p><p><strong>Before running anything</strong>, predict and justify:</p><ol><li>The shape of $\\log(F(\\beta^k)-F^\\star)$ versus $k$ for each method: monotone or not, sublinear or linear, and roughly when each changes regime.</li><li>How the iteration count to $10^{-8}$ suboptimality scales if you orthogonalise the signals against the common component first.</li><li>Whether the identified support stabilises before the objective converges, and which method identifies it first.</li></ol><p>Then run the experiment (synthetic data are fine) and explain every discrepancy with your prediction.</p>",
      "whyItMatters": "Acceleration is often described only by its $O(1/k^2)$ worst-case rate. Correlated financial signals are a textbook case where local strong convexity on the support, oscillation and restart dominate the behaviour you actually see.",
      "hints": [
        "Globally the problem is not strongly convex if $p>$ rank, but here $T>p$, so $\\mu=\\lambda_{\\min}(X^\\top X/T)>0$. What linear rate does ISTA get with $\\kappa=10^4$, and what does accelerated get?",
        "Once the support is identified, the iteration is a gradient method on a smaller quadratic: what is the condition number of the restricted Gram matrix compared with the full one?",
        "FISTA with fixed momentum overshoots on strongly convex problems and produces a rippling objective with period related to $\\sqrt{\\kappa}$. Restart resets momentum whenever the objective increases."
      ],
      "keyPoints": [
        "ISTA is monotone with a linear rate of about $1-1/\\kappa$ (here very slow) after an initial sublinear phase. FISTA is non-monotone with ripples, and its envelope decays like $1-1/\\sqrt\\kappa$ only if the momentum is tuned to $\\mu$, otherwise it behaves sublinearly with oscillation. Restart achieves roughly the $\\sqrt\\kappa$ linear rate without knowing $\\mu$.",
        "Orthogonalising against the common factor reduces $\\kappa$ substantially, reducing ISTA iterations roughly proportionally to $\\kappa$ and FISTA-restart roughly with $\\sqrt\\kappa$; but it changes the problem (L1 penalty on transformed coefficients) unless the transform is applied only as a preconditioner.",
        "Finite support identification under nondegeneracy (strict complementarity); after identification the rate is governed by the restricted condition number, often far smaller than $10^4$.",
        "Accelerated methods often identify the support earlier but can temporarily add and drop variables due to momentum. The answer should compare against the experiment honestly.",
        "Concrete check: plotted curves with the ripple period and a fitted linear rate, compared with $1-1/\\kappa$ and $1-1/\\sqrt\\kappa$."
      ],
      "followUps": [
        "Show that a diagonal rescaling of the columns changes the lasso solution unless $\\lambda$ is rescaled per coordinate, and discuss what that means for \"preconditioning\" a lasso.",
        "Use the duality gap from a dual-feasible point (scaled residual) as a stopping rule and compare it with the true suboptimality."
      ],
      "source": {
        "label": "Beck & Teboulle (2009) — FISTA; O’Donoghue & Candès (2015) — Adaptive Restart for Accelerated Gradient Schemes, motivated by",
        "url": "https://doi.org/10.1007/s10208-013-9150-3",
        "relation": "motivated by"
      }
    },
    {
      "id": "cvx-first-order-q4",
      "type": "counterexample",
      "difficulty": 3,
      "prompt": "<p>Reddi, Kale &amp; Kumar (2018) show that Adam can fail on a one-dimensional online convex problem. Rebuild their construction and then reconcile it with the later positive results.</p><ol><li>On $\\mathcal X=[-1,1]$, consider linear losses $f_t(x)=Cx$ when $t\\bmod 3=1$ and $f_t(x)=-x$ otherwise, with $C>2$. What is the best fixed decision in hindsight, and what is its average loss?</li><li>Take $\\beta_1=0$ (RMSProp-like) and $\\beta_2$ such that the large gradient $C$ dominates $v_t$ only briefly. Explain, with an explicit computation over one period of three steps, why the net movement can push $x$ toward $+1$ (the worst point) and why the average regret does not vanish.</li><li>Pin down the step in the Adagrad regret proof that fails: identify the quantity $\\Gamma_{t}=\\sqrt{v_{t}}/\\alpha_t-\\sqrt{v_{t-1}}/\\alpha_{t-1}$ and show where its sign matters. Show how AMSGrad restores it.</li><li>Zhang et al. (2022) argue that Adam converges without modification when $\\beta_2$ is large enough, with hyperparameters chosen <em>after</em> the problem. State precisely the order of quantifiers in each result and explain why both can be true.</li></ol>",
      "whyItMatters": "It shows exactly which piece of a convergence proof an exponential moving average breaks, and why \"Adam does not converge\" and \"Adam converges\" are both theorems. That is the right mental model when an alpha model trains erratically.",
      "hints": [
        "Linear losses on an interval: the comparator is an endpoint. Average the gradient over a period: $(C-2)/3>0$, so the best fixed point is $x=-1$.",
        "With $\\beta_1=0$ the update is $x_{t+1}=\\Pi(x_t-\\alpha_t g_t/\\sqrt{v_t})$. After the big gradient $C$, $v$ is large and the step is small; during the two $-1$ gradients $v$ has decayed so the steps toward $+1$ are relatively large. Compare effective step-weighted gradients over a period.",
        "Adagrad's proof telescopes $\\sum_t\\|x_t-x^\\star\\|^2(\\sqrt{v_t}/\\alpha_t-\\sqrt{v_{t-1}}/\\alpha_{t-1})$ using nonnegativity of each term. With an exponential average, $v_t$ can drop, making $\\Gamma_t$ negative."
      ],
      "keyPoints": [
        "Best fixed decision $x^\\star=-1$ with average loss $-(C-2)/3$ per step; the sequence is periodic so regret is linear if iterates sit near $+1$.",
        "Clear mechanism: effective step $\\alpha_t/\\sqrt{v_t}$ is small exactly when the informative large gradient arrives and larger when the misleading small gradients arrive, so the step-weighted average gradient has the wrong sign. The paper shows convergence to $x=+1$ for suitable $\\beta_2$ and $C$.",
        "Identifies $\\Gamma_t\\succeq0$ (non-increasing effective step sizes) as the assumption used in the Adagrad/online gradient regret proof; AMSGrad's $\\hat v_t=\\max(\\hat v_{t-1},v_t)$ enforces it.",
        "Quantifiers: Reddi et al. — for any fixed $(\\beta_1,\\beta_2)$ with $\\beta_1<\\sqrt{\\beta_2}$ there exists a problem on which Adam fails; Zhang et al. — for each problem there exist $\\beta_2$ close enough to 1 (problem-dependent) for which Adam converges to a neighbourhood of stationary points. These do not contradict each other.",
        "Practical translation: default $\\beta_2=0.999$ is \"large\" for many problems but not uniformly; heavy-tailed, intermittent gradients (rare events, earnings days) are the regime the counterexample models."
      ],
      "followUps": [
        "Construct a stochastic (not adversarial) version of the counterexample in which the large gradient appears with probability $1/3$; does the failure persist?",
        "Map the counterexample to a return-prediction setting where one feature fires rarely with large gradient and often with small opposite gradient."
      ],
      "source": {
        "label": "Reddi, Kale & Kumar (2018) — On the Convergence of Adam and Beyond (ICLR), Theorem 1 and §3; Zhang et al. (2022) — Adam Can Converge Without Any Modification On Update Rules, adapted from",
        "url": "https://arxiv.org/abs/1904.09237",
        "relation": "adapted from"
      }
    },
    {
      "id": "cvx-first-order-q5",
      "type": "debate",
      "difficulty": 2,
      "prompt": "<p>Do adaptive gradient methods generalise worse than well-tuned SGD with momentum? Wilson et al. (2017) build a linearly separable problem where adaptive methods converge to a solution with poor test error while SGD finds the minimum-norm one, and report worse test performance for adaptive methods on deep-learning benchmarks. Choi et al. (2019) argue that optimiser comparisons are dominated by the tuning protocol: because Adam can emulate momentum SGD in limiting hyperparameter settings (including $\\epsilon$), a properly tuned more general optimiser should never lose.</p><ol><li>State the strongest version of each position and the evidence each offers.</li><li>Explain the implicit-bias argument: which solution does gradient descent select on underdetermined least squares from zero initialisation, and why does diagonal preconditioning change it?</li><li>Your team trains a cross-sectional return model on noisy daily targets. Design an optimiser comparison that would convince both camps, with a fixed tuning budget, the search space, and the out-of-sample metric (IC, decile spread, turnover-adjusted).</li></ol>",
      "whyItMatters": "Choosing an optimiser silently selects among many near-equivalent fits in overparameterised alpha models. Whether that selection is benign or harmful is exactly what this debate is about.",
      "hints": [
        "Gradient descent iterates on least squares from 0 stay in the row space of $X$; what does that imply about the limit?",
        "Adagrad-type scaling makes the effective geometry $\\|\\cdot\\|_{H}$ with a data-dependent diagonal $H$; the selected interpolant changes accordingly.",
        "Choi et al.'s inclusion hierarchy: if optimiser A can approximate B by setting hyperparameters, a fair comparison must search a space that includes those settings."
      ],
      "keyPoints": [
        "Wilson et al.: constructed counterexample plus empirical evidence; claim that adaptive methods find qualitatively different (worse-generalising) solutions.",
        "Choi et al.: empirical comparisons are sensitive to the search space; with tuning of all hyperparameters (incl. $\\epsilon$, momentum), more general optimisers match or beat their special cases; claims of inferiority were artefacts of tuning.",
        "GD on underdetermined least squares from zero converges to the minimum $\\ell_2$-norm interpolant; preconditioning changes the implicit bias to a different, data-dependent norm (sign-like updates behave closer to $\\ell_\\infty$ geometry).",
        "A credible design fixes compute budget, uses nested time-series CV (purged), reports out-of-sample metrics across many seeds, and separates optimisation speed from generalisation.",
        "Low signal-to-noise financial data make the implicit bias (effective regularisation) more important than in vision benchmarks."
      ],
      "followUps": [
        "Relate the minimum-norm implicit bias to ridge regression in the \"benign overfitting / virtue of complexity\" literature on return prediction.",
        "Does weight decay (decoupled, as in AdamW) restore an explicit bias that makes the comparison moot?"
      ],
      "source": {
        "label": "Wilson et al. (2017) vs Choi et al. (2019): published disagreement on adaptive methods and generalisation",
        "url": "https://arxiv.org/abs/1705.08292",
        "relation": "motivated by"
      },
      "sides": [
        {
          "position": "Adaptive methods find different, often worse-generalising solutions than SGD; prefer SGD with momentum when generalisation matters.",
          "refs": [
            {
              "label": "Wilson, Roelofs, Stern, Srebro & Recht (2017) — The Marginal Value of Adaptive Gradient Methods in Machine Learning",
              "url": "https://arxiv.org/abs/1705.08292"
            }
          ]
        },
        {
          "position": "Differences reflect the tuning protocol; with a search space that includes all hyperparameters, more general adaptive optimisers do not underperform.",
          "refs": [
            {
              "label": "Choi, Shallue, Nado, Lee, Maddison & Dahl (2019) — On Empirical Comparisons of Optimizers for Deep Learning",
              "url": "https://arxiv.org/abs/1910.05446"
            }
          ]
        }
      ]
    },
    {
      "id": "cvx-first-order-q6",
      "type": "design",
      "difficulty": 3,
      "prompt": "<p>Design an ADMM solver for the daily long-short problem</p>$$\\max_w\\ \\alpha^\\top w-\\gamma\\big(w^\\top F\\Omega F^\\top w+w^\\top Dw\\big)-\\kappa^\\top|w-w_0|\\quad\\text{s.t.}\\quad \\mathbf 1^\\top w=0,\\ \\ B^\\top w=0,\\ \\ |w|\\le u,\\ \\ \\|w\\|_1\\le L,$$<p>with $n=5{,}000$ names, $k=60$ factors, $B$ a set of $20$ neutrality exposures, and about 750 consecutive daily solves in a backtest.</p><ol><li>Propose a splitting and say which matrix is factored, its size and sparsity, and why introducing $y=F^\\top w$ matters. Compare with OSQP's generic splitting of $l\\le Ax\\le u$.</li><li>Which steps are closed-form projections or proxes (absolute-value cost, box, gross limit), and which need a linear solve?</li><li>Specify $\\rho$ selection and adaptation, the stopping tolerances you would use (justify them against forecast error), and what you cache from one day to the next.</li><li>A day's constraints are infeasible (neutrality to 20 exposures under tight position limits). What does your solver return, and how do you degrade gracefully (soft constraints, priority layers)?</li></ol>",
      "whyItMatters": "This is the solver design behind fast, large backtests. The choices (factor reformulation, caching, tolerance, infeasibility handling) determine whether a parameter sweep takes minutes or days.",
      "hints": [
        "With $y=F^\\top w$ the quadratic becomes $w^\\top Dw+y^\\top \\Omega y$, block diagonal; the coupling moves into a sparse equality constraint. The KKT matrix then has dimension about $n+k+$ constraints, with only $O(nk)$ nonzeros.",
        "The gross limit with absolute costs: split $z=w$ and project/prox $z$ onto $\\{|z|\\le u,\\|z\\|_1\\le L\\}$ plus the L1 cost around $w_0$. That prox is a 1-D root-find like the budget prox.",
        "OSQP detects infeasibility from $\\delta y^k=y^k-y^{k-1}$ converging to a certificate. Warm starts help most when only $\\alpha$ (the linear term) changes; refactor only when the risk model updates."
      ],
      "keyPoints": [
        "Factor reformulation with block-diagonal Hessian and a sparse quasi-definite KKT matrix factored by sparse $LDL^\\top$ ($O(nk^2)$ or better), versus a dense $n\\times n$ covariance which would cost $O(n^3)$.",
        "Correct allocation of work: linear solve for the equality-constrained quadratic step; closed-form or 1-D root-find prox for box + gross + L1 cost; cheap dual updates.",
        "Sensible $\\rho$ policy (residual balancing with limited refactorisation), tolerances around $10^{-4}$ relative justified by alpha/risk error being orders larger, and caching of factorisations (refactor monthly with the risk model) and warm starts of $(w,z,u)$.",
        "Infeasibility: return a certificate, then fall back to soft constraints (penalised neutrality violation) or lexicographic priorities; log the event for research review.",
        "Mentions validation against an interior-point solver on a sample of days and monitoring of residuals in production."
      ],
      "followUps": [
        "How would you exploit the fact that the backtest sweep solves the same day for 50 risk-aversion values? (Hint: parametric warm starts, or a homotopy in $\\gamma$.)",
        "Would a GPU PDHG-type QP solver beat this design at $n=5{,}000$? At $n=50{,}000$ with scenario-based risk?"
      ],
      "source": {
        "label": "Stellato et al. (2020) — OSQP (§3–6, warm starting and factorisation caching; Appendix A.4 portfolio reformulation), motivated by",
        "url": "https://doi.org/10.1007/s12532-020-00179-2",
        "relation": "motivated by"
      }
    },
    {
      "id": "cvx-first-order-q7",
      "type": "connect",
      "difficulty": 2,
      "prompt": "<p>A platform runs $M$ sub-portfolios (pods). Pod $i$ chooses holdings $w_i$ to maximise its own utility $U_i(w_i)$ (concave: alpha minus risk minus costs). The firm imposes a shared constraint on aggregate factor exposure, $\\sum_i E^\\top w_i\\le e_{\\max}$ elementwise, and a shared gross limit.</p><ol><li>Write the dual-decomposition algorithm. Show that each pod solves its own problem with a factor-exposure charge $\\lambda^\\top E^\\top w_i$, and that the master updates $\\lambda$ by a projected subgradient step on the aggregate residual.</li><li>Interpret $\\lambda$ as an internal \"risk price\". What happens to it when two pods take opposite exposures, and how does netting show up?</li><li>Rewrite the scheme as ADMM for the <em>sharing problem</em> (Boyd et al. 2011 §7.3). Which pod-level problem changes, and why does ADMM converge in cases where dual decomposition oscillates (e.g. pods with linear utilities in some names)?</li><li>Name two practical reasons a real platform would not run this to convergence every day, and what you would do instead.</li></ol>",
      "whyItMatters": "Shadow prices on shared risk give a principled answer to \"how much should pod X pay for using factor capacity?\". The decomposition view also explains when decentralised allocation reaches the centralised optimum.",
      "hints": [
        "Form the Lagrangian with multiplier $\\lambda\\ge0$ for the coupling constraint; it separates across $i$.",
        "The dual subgradient is $\\sum_i E^\\top w_i^\\star(\\lambda)-e_{\\max}$; $\\lambda$ rises only when the aggregate exposure binds, so offsetting exposures across pods reduce the charge for everyone.",
        "Sharing ADMM adds a quadratic penalty pulling each pod toward its share of the average residual; this makes subproblems strictly convex and stabilises the iteration."
      ],
      "keyPoints": [
        "Correct separable Lagrangian and price-update master step, with projection onto $\\lambda\\ge0$.",
        "Economic reading: $\\lambda$ is the marginal value of aggregate exposure capacity; offsetting pods net out, lowering the price; zero price when the constraint is slack.",
        "Sharing-form ADMM with quadratic proximal terms; convergence without strict convexity of $U_i$, unlike dual decomposition whose subproblem solutions can jump.",
        "Practical limits: information leakage/agency (pods gaming the price), stale alphas, latency, non-convex pod constraints; use a few iterations with warm-started prices, or a central optimiser with pod-level constraints.",
        "Links to risk-budgeting practice and to the duality module (interpretation of multipliers as sensitivities)."
      ],
      "followUps": [
        "Show that at the optimum, $\\lambda$ equals the sensitivity of total firm utility to $e_{\\max}$, and discuss using it to set risk limits.",
        "How would you handle a pod whose problem is a mixed-integer (lot-constrained) program inside this scheme?"
      ],
      "source": {
        "label": "Boyd et al. (2011), Distributed Optimization and Statistical Learning via ADMM, §7.3 (sharing); EE364b decomposition notes (dual decomposition), motivated by",
        "url": "https://web.stanford.edu/~boyd/papers/pdf/admm_distr_stats.pdf",
        "relation": "motivated by"
      }
    },
    {
      "id": "cvx-first-order-q8",
      "type": "critique",
      "difficulty": 2,
      "prompt": "<p>A research note claims: \"Exponentiated-gradient (EG) online portfolio selection has regret $O(\\sqrt{T\\log n})$ against the best constant-rebalanced portfolio (CRP) in hindsight, for any sequence of returns. So, on our 500-stock universe, EG is guaranteed to approach the best CRP's growth rate, and it beats any static optimiser in the long run.\"</p><p>Critique the claim. Address at least: (i) what the comparator class is and how good the best CRP in hindsight is likely to be; (ii) the role of the bound on price relatives (the gradient bound) and what happens in a crash; (iii) transaction costs, which are absent from the regret bound; (iv) the time scale on which $\\sqrt{T\\log n}/T$ becomes economically small; (v) what the mirror-descent view says about why $\\log n$ and not $n$ appears.</p>",
      "whyItMatters": "Online-learning guarantees are elegant and genuinely worst-case, but the comparator and the cost model decide whether they mean anything for a real book. Reading regret bounds critically is a transferable skill.",
      "hints": [
        "Helmbold et al. (1998) derive EG as a multiplicative update on log-wealth; the bound depends on a lower bound $r$ on price relatives through the gradient norm of $-\\log(w^\\top x_t)$.",
        "Convert regret on log-wealth into growth rate per period: divide by $T$. Plug in $n=500$, daily $T$, and see how many years until the gap is below, say, 1% per year.",
        "Entropic mirror descent on the simplex: Bregman radius $\\log n$, gradient measured in $\\|\\cdot\\|_\\infty$. Projected gradient would pay a factor involving $\\sqrt n$."
      ],
      "keyPoints": [
        "Comparator is the best CRP chosen in hindsight: a strong benchmark in-sample, but it is fixed weights; regret says nothing about beating time-varying strategies or about absolute performance.",
        "Gradient bound depends on the smallest price relative; in a crash (price relative near 0) the bound and constants blow up; bounds are worst-case in returns but not in this parameter.",
        "Costs: EG rebalances every period; net-of-cost performance can be far below the bound; cost-aware variants or lazy updates are needed.",
        "Time scale: with realistic constants, average regret per day around $\\sqrt{\\log n/T}$ times a gradient constant needs decades of daily data to be economically small.",
        "Mirror descent: entropy geometry matches the simplex, so dimension enters as $\\log n$; this is a real advantage over Euclidean projection but doesn't fix the comparator or cost issues."
      ],
      "followUps": [
        "Derive the EG update as entropic mirror descent on $f_t(w)=-\\log(w^\\top x_t)$ and recover its regret bound from the mirror-descent template.",
        "Propose a cost-aware online update (e.g. a mirror step with an L1 trade penalty) and state what regret notion it could satisfy."
      ],
      "source": {
        "label": "Helmbold, Schapire, Singer & Warmuth (1998) — On-Line Portfolio Selection Using Multiplicative Updates; EE364b mirror descent slides, motivated by",
        "url": "https://doi.org/10.1111/1467-9965.00058",
        "relation": "motivated by"
      }
    }
  ],
  "projects": [
    {
      "id": "cvx-first-order-r1",
      "title": "Replicate OSQP Table 7 (portfolio rows): warm starting and factorisation caching in a back test",
      "level": "replication",
      "hours": "8–12",
      "paper": {
        "label": "Stellato, Banjac, Goulart, Bemporad & Boyd (2020) — OSQP: an operator splitting solver for quadratic programs, §8 (parametric programs) and Appendix A.4",
        "url": "https://doi.org/10.1007/s12532-020-00179-2"
      },
      "goal": "Reproduce the Portfolio rows of Table 7 in the OSQP paper: time and iteration counts with and without warm starting over a simulated 4-year back test of factor-model portfolio QPs with k = 100, 200, 300, 400 factors. Then extend the experiment to a long-short problem with turnover costs and see whether the warm-start benefit survives.",
      "data": "Fully synthetic, following Appendix A.4 and the back-test description in §8: F with N(0,1) entries and 50% density, D_ii ~ U[0, k], mu_i ~ N(0,1), gamma = 1; 20 QPs per month for 48 months (960 QPs); daily update mu_i <- 0.9 mu_i + N(0, 0.1); monthly updates of the nonzeros of F and D as described in the paper. Note: Appendix A.4 states n = 100k assets, while the back-test paragraph reads \"n = 10k\"; record which you use. The arXiv preprint (1711.08013) is free.",
      "steps": [
        "Read Appendix A.4 and the parametric back-test paragraph of §8; list every generation detail and every ambiguity (e.g. the exact noise in the monthly update) with the assumption you make.",
        "Implement reformulation (37): variables (x, y) with y = F^T x, diagonal Hessian, constraints y = F^T x, 1^T x = 1, x >= 0. Build it directly with the osqp Python interface (not via a modelling layer) so that you control updates.",
        "Run the 960-QP back test twice per k: cold start (new setup each QP) and warm start with update_q / update of the matrix values, reusing the symbolic factorisation.",
        "Record per-QP solve time and iteration counts with the paper’s default settings, and average them as in the table.",
        "Extension: switch to a long-short version (1^T x = 0, |x| <= u, linear turnover cost via an auxiliary variable) and repeat."
      ],
      "deliverables": [
        "Script that regenerates the table with fixed seeds.",
        "Your Table 7 portfolio rows next to the paper’s numbers (time no-ws, ws, improvement; iterations no-ws, ws, improvement).",
        "Plot of per-QP iterations over the back test, showing the monthly risk-model updates.",
        "Short note on hardware, OSQP version, and the deviations from the paper."
      ],
      "acceptance": [
        "For each k, warm-start iteration counts are within 30% of the paper’s values (about 25–26) and cold-start counts within 30% of the paper’s values (about 76–93).",
        "The time improvement factor from warm starting is at least 4x for every k (the paper reports roughly 5.8x to 7x); absolute times are reported but not required to match.",
        "The iteration improvement factor decreases with k, as in the paper (about 3.7x to 2.9x), or you explain why it does not.",
        "All solutions satisfy 1^T x = 1 within 1e-3 and x >= -1e-3 at the default tolerances, and a random sample of 20 QPs matches Clarabel’s objective to 1e-3 relative.",
        "The long-short extension reports the same metrics and states whether the warm-start benefit persists."
      ],
      "extensions": [
        "Compare with a modelling-layer workflow (CVXPY parameters) to measure the overhead of canonicalisation in back tests.",
        "Replace OSQP by a GPU QP solver and compare scaling in k."
      ]
    }
  ]
}
);
