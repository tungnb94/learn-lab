LAB.extend("cvx-functions", {
  "questions": [
    {
      "id": "cvx-functions-q1",
      "type": "derive",
      "difficulty": 3,
      "prompt": "<p>Let $r_1,\\dots,r_N$ be equally likely return scenarios and $L_i(w)=-r_i^Tw$ the portfolio loss in scenario $i$. Define $F_\\alpha(w,\\zeta)=\\zeta+\\frac{1}{(1-\\alpha)N}\\sum_{i=1}^N(L_i(w)-\\zeta)_+$.</p><ol><li>For fixed $w$, show that $\\min_\\zeta F_\\alpha(w,\\zeta)$ is attained on the set of $\\alpha$-quantiles of the loss (the VaR interval), and that the minimum equals the mean of the worst $(1-\\alpha)N$ losses when $k=(1-\\alpha)N$ is an integer.</li><li>Prove that $\\operatorname{CVaR}_\\alpha(w)=\\min_\\zeta F_\\alpha(w,\\zeta)$ is convex in $w$ using only rules from B&V §3.2 (no appeal to coherence). Write the LP.</li><li>For integer $k$, show that $\\operatorname{CVaR}_\\alpha$ equals $\\tfrac1k\\times$ (sum of the $k$ largest entries of the loss vector). Then use B&V exercise 3.36(b) to write it as a support function $\\sup\\{q^TL: q\\in\\mathcal Q\\}$ for an explicit polytope $\\mathcal Q$ of reweighted probabilities. Interpret $\\mathcal Q$ as a set of stress scenarios.</li><li>Predict, then check: how does the minimum-CVaR portfolio compare with the minimum-variance portfolio when scenarios are drawn from a multivariate Gaussian with a large $N$? What changes with fat-tailed or skewed scenarios?</li></ol>",
      "whyItMatters": "CVaR is the tail-risk measure that fits convex optimization. Knowing exactly why it is convex (partial minimization, sum of largest entries, support function) lets you modify it (weighted scenarios, robust versions) without losing tractability.",
      "hints": [
        "For fixed $w$, $F_\\alpha(w,\\cdot)$ is a convex piecewise-linear function of $\\zeta$. Its right derivative is $1-\\frac{\\#\\{i:L_i>\\zeta\\}}{(1-\\alpha)N}$, so find where it changes sign.",
        "$(L_i(w)-\\zeta)_+$ is the max of two affine functions of $(w,\\zeta)$. Sum, then minimize over $\\zeta$ (§3.2.5). For the LP, add $u_i\\ge L_i(w)-\\zeta$ and $u_i\\ge0$.",
        "The conjugate of $f(x)=\\sum_{i\\le r}x_{[i]}$ is the indicator of $\\{y: 0\\preceq y\\preceq\\mathbf 1,\\ \\mathbf 1^Ty=r\\}$. Biconjugation gives $f(x)=\\sup\\{y^Tx: 0\\preceq y\\preceq \\mathbf 1, \\mathbf 1^Ty=r\\}$."
      ],
      "keyPoints": [
        "Subgradient in $\\zeta$: $1-\\frac{\\#\\{L_i>\\zeta\\}}{(1-\\alpha)N}$ goes from negative to nonnegative exactly on the $\\alpha$-quantile interval, so the minimizer is a VaR. Substituting a $\\zeta$ with $k$ losses above it gives the mean of the $k$ worst losses.",
        "Joint convexity of $F_\\alpha$: affine plus nonnegative sum of maxima of affine functions. CVaR is a partial minimum over $\\zeta\\in\\mathbb R$, hence convex. LP: minimize $\\zeta+\\frac{1}{(1-\\alpha)N}\\mathbf 1^Tu$ subject to $u\\succeq0$ and $u_i\\ge -r_i^Tw-\\zeta$.",
        "With $y=kq$: $\\operatorname{CVaR}=\\sup\\{q^TL:\\ 0\\preceq q\\preceq\\tfrac1k\\mathbf 1,\\ \\mathbf 1^Tq=1\\}$. These are probability vectors that inflate any scenario by at most a factor $N/k=1/(1-\\alpha)$, which is the dual (coherent) representation.",
        "Gaussian scenarios: for elliptical returns, CVaR is $-\\mu^Tw+c_\\alpha\\|\\Sigma^{1/2}w\\|$. Minimizing it subject to a return constraint or to budget with mean zero matches minimum variance, so the scenario solution converges to it as $N$ grows. Skew and fat tails make them diverge, and with few tail scenarios the CVaR solution is noisier.",
        "A strong answer notes non-differentiability and that the LP size grows with $N$. Also that CVaR estimation error at high $\\alpha$ is driven by about $(1-\\alpha)N$ observations."
      ],
      "followUps": [
        "Generalize to non-uniform scenario probabilities $\\pi_i$ and to fractional $(1-\\alpha)N$. What does the polytope $\\mathcal Q$ become?",
        "Replace the empirical distribution by a Wasserstein ball around it. Is the worst-case CVaR still convex in $w$, and which chapter-3 rule shows it?"
      ],
      "source": {
        "label": "B&V exercise 3.36(b) and Example 3.6 (adapted), combined with Rockafellar & Uryasev (2000) — Optimization of conditional value-at-risk",
        "url": "https://doi.org/10.21314/JOR.2000.038",
        "relation": "adapted from"
      }
    },
    {
      "id": "cvx-functions-q2",
      "type": "counterexample",
      "difficulty": 2,
      "prompt": "<p>Each claim below has appeared in a portfolio-construction design review. Give a concrete counterexample with small numbers, then state the correct curvature property and the tractable reformulation if one exists.</p><ol><li>\"The Sharpe ratio $S(w)=\\mu^Tw/\\sqrt{w^T\\Sigma w}$ is concave on $\\{\\mu^Tw>0\\}$, so maximizing it is a convex problem.\" Use $\\mu=(1,1)$, $\\Sigma=I$ and the line $w=(1,t)$.</li><li>\"Value-at-risk is convex in the weights, because for Gaussian returns it is $-\\mu^Tw+z_\\alpha\\|\\Sigma^{1/2}w\\|$.\" Say when the formula gives convexity and construct a scenario-based example where VaR is not convex.</li><li>\"A product of two nonnegative convex penalties is a convex penalty, so we can multiply the turnover penalty by the risk penalty to make the trade-off scale-free.\" Find two convex nonnegative functions on $\\mathbb R$ whose product is not convex, and state the conditions from B&V exercise 3.32 under which a product is convex.</li></ol>",
      "whyItMatters": "Each of these errors makes an optimizer return a local or arbitrary solution while appearing to work. Ratios and products are the most common sources of hidden nonconvexity in portfolio objectives.",
      "hints": [
        "For (1), compute $g(t)=(1+t)/\\sqrt{1+t^2}$ at $t=10$, $55$ and $100$. Then show that superlevel sets of $S$ are second-order cones.",
        "For (2), Gaussian VaR is convex only when $z_\\alpha\\ge0$. For scenarios, take two assets that each lose 100 with probability 4%, independently, and compare VaR at 95%.",
        "For (3), try $f(x)=x^2$ and $g(x)=(x-1)^2$. B&V 3.32: both convex, positive and monotone in the same direction gives a convex product."
      ],
      "keyPoints": [
        "$g(10)\\approx1.0945$, $g(100)\\approx1.0100$, $g(55)\\approx1.0180<\\tfrac12(g(10)+g(100))\\approx1.0522$, so $S$ is not concave. It is quasiconcave: $\\{S\\ge s\\}=\\{\\mu^Tw\\ge s\\|\\Sigma^{1/2}w\\|\\}$ is a convex cone for $s\\ge0$. Solve by homogenization (minimize $y^T\\Sigma y$ s.t. $\\mu^Ty=1$) or by bisection.",
        "Gaussian (or elliptical) VaR at level $\\alpha\\ge1/2$ is convex (a norm with a nonnegative coefficient plus a linear term). Scenario VaR is a quantile, which is not convex: in the two-bond example each asset has VaR 0, but the 50/50 mix has VaR 50.",
        "$x^2(x-1)^2$ vanishes at 0 and 1 but equals $1/16$ at $1/2$, so it is not convex. Products are convex when both factors are convex, positive and monotone in the same direction on an interval; otherwise use a sum or a constraint.",
        "General lesson: ratios and products of convex functions should be handled by homogenization, perspectives or quasiconvex bisection, not passed to a solver as is (DCP will reject them, which is the point)."
      ],
      "followUps": [
        "Show that maximizing the information ratio $\\alpha^T(w-w_b)/\\|\\Sigma^{1/2}(w-w_b)\\|$ subject to linear constraints can be homogenized, and say which constraints survive the homogenization unchanged.",
        "Is the Sortino ratio (mean over downside deviation) quasiconcave in $w$ for scenario returns? Prove or give a counterexample."
      ],
      "source": {
        "label": "B&V exercises 3.16 and 3.32 (adapted) — curvature of ratios and products",
        "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf",
        "relation": "adapted from"
      }
    },
    {
      "id": "cvx-functions-q3",
      "type": "derive",
      "difficulty": 2,
      "prompt": "<p>A single-name trade $x$ (in dollars) costs $c(x)=a|x|+b|x|^{3/2}$, where $a$ is half-spread plus fees and $b=\\eta\\,\\sigma/\\sqrt{V}$ comes from the square-root impact law ($\\sigma$ daily volatility, $V$ daily dollar volume).</p><ol><li>Show that $c$ is convex, and explain why \"impact per share is concave in size\" is consistent with \"total cost is convex in size\".</li><li>Compute the conjugate $c^*(y)=\\sup_x(yx-c(x))$ and the optimal trade $x^\\star(y)$ for an alpha $y$ (expected dollar gain per dollar traded). Sketch $x^\\star(y)$ and compare with the purely linear and purely quadratic cost cases.</li><li>Show how $x^\\star$ scales with $\\sigma$ and $V$ at fixed edge. Interpret this for a cross-sectional signal applied to large caps versus small caps.</li><li>Under this static model, splitting a parent order $X$ into $n$ equal child orders executed in separate periods costs $n\\,b(X/n)^{3/2}$. Use convexity to explain why splitting helps, and say what the static model leaves out that stops you from splitting forever.</li></ol>",
      "whyItMatters": "The cost curve, through its conjugate, fixes the mapping from signal to trade size. Choosing linear, quadratic or 3/2-power costs changes how aggressively the book trades its strongest and weakest ideas.",
      "hints": [
        "Power functions $|x|^p$ with $p\\ge1$ are convex. For the conjugate, first handle $y>a$ and reduce to maximizing $(y-a)t-bt^{3/2}$ over $t\\ge0$.",
        "Stationarity gives $\\sqrt t=\\frac{2(y-a)}{3b}$. Substitute back.",
        "For (3), with $b\\propto\\sigma/\\sqrt V$, $x^\\star\\propto(|y|-a)_+^2\\,V/\\sigma^2$."
      ],
      "keyPoints": [
        "Convexity: a sum of a norm and a convex power. Impact per dollar, $b|x|^{1/2}$, is concave, while total cost, $|x|$ times impact per dollar, is $|x|^{3/2}$ and convex.",
        "$c^*(y)=\\frac{4}{27b^2}(|y|-a)_+^3$ and $x^\\star(y)=\\operatorname{sign}(y)\\frac{4}{9b^2}(|y|-a)_+^2=\\nabla c^*(y)$. There is a no-trade band $|y|\\le a$ (from the linear part), and trade size grows quadratically in excess edge, versus linearly for quadratic costs and bang-bang for purely linear costs with a position limit.",
        "Scaling $x^\\star\\propto V/\\sigma^2$ at fixed edge: liquid, low-vol names receive much larger dollar trades, so a signal is expressed mostly in large caps unless edge is larger in small caps.",
        "Splitting: $n\\,b(X/n)^{3/2}=bX^{3/2}/\\sqrt n$ decreases in $n$ (a convexity/Jensen effect). What stops it is alpha decay and price risk while waiting, plus transient impact that does not fully decay between child orders: the Almgren-Chriss trade-off.",
        "Fitting caution: estimated exponents vary across studies and samples (roughly 0.4–0.7 for impact), so the 3/2 cost exponent should be validated on your own data."
      ],
      "followUps": [
        "Add a quadratic risk penalty $\\tfrac{\\gamma}{2}\\sigma^2x^2$ and a current position. Derive the single-name optimality condition and describe the no-trade region around the current position.",
        "For $n$ names with independent costs and a shared budget constraint, show that the multiplier on the budget acts as a common shift in every name's alpha. What does that do to the set of names traded?"
      ],
      "source": {
        "label": "B&V exercise 3.36(d) (adapted) — conjugate of a power function; cost form motivated by Tóth et al. (2011) square-root impact",
        "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf",
        "relation": "adapted from"
      }
    },
    {
      "id": "cvx-functions-q4",
      "type": "debate",
      "difficulty": 3,
      "prompt": "<p>B&V exercise 3.15 introduces the family $u_\\alpha(x)=(x^\\alpha-1)/\\alpha$ for $0<\\alpha\\le1$, with $u_0(x)=\\log x$ as the limit.</p><ol><li>Prove the limit, concavity and monotonicity. Then extend the family to $\\alpha<0$ and show that it stays concave.</li><li>Under geometric Brownian motion with drift $\\mu$, volatility $\\sigma$ and rate $r$, derive the optimal constant risky fraction for $u_\\alpha$. Show that full Kelly (log utility) corresponds to $\\alpha=0$ and that half-Kelly corresponds to $\\alpha=-1$, so B&V's family $0<\\alpha\\le1$ contains only strategies <em>more aggressive</em> than Kelly.</li><li>Now the debate. Kelly (1956) and Latané (1959) argue that maximizing expected log wealth is the right long-run criterion: it maximizes the asymptotic growth rate and, with probability tending to one, ends with more wealth than any essentially different strategy. Samuelson (1971, 1979) argues that this is a fallacy: an investor with any other utility should not maximize the geometric mean, however long the horizon. Lay out both arguments precisely.</li><li>Take a position for allocating capital across a book of equity strategies with estimated Sharpe ratios. Address estimation error and drawdown constraints, and say what MacLean, Thorp &amp; Ziemba (2010) and the risk-constrained Kelly formulation of Busseti, Ryu &amp; Boyd (2016) add.</li></ol>",
      "whyItMatters": "Sizing a book or a strategy allocation by growth optimality is common in practice. Knowing exactly what log utility does and does not guarantee, and how concavity of the objective interacts with estimation error, decides whether to use full, fractional or constrained Kelly.",
      "hints": [
        "For the limit, write $x^\\alpha=e^{\\alpha\\log x}$ and expand to first order in $\\alpha$. For concavity, $u_\\alpha''(x)=(\\alpha-1)x^{\\alpha-2}$.",
        "With constant fraction $\\pi$, terminal wealth is lognormal with log drift $r+\\pi(\\mu-r)-\\tfrac12\\pi^2\\sigma^2$. Maximize $\\mathbb E\\,u_\\alpha(W_T)$; the relative risk aversion is $1-\\alpha$.",
        "Samuelson's point is about expected utility, not about almost-sure growth: the strategy that wins with high probability can still have lower expected utility for an investor who is more (or less) risk-averse than log."
      ],
      "keyPoints": [
        "$\\lim_{\\alpha\\to0}(e^{\\alpha\\log x}-1)/\\alpha=\\log x$; $u_\\alpha'(x)=x^{\\alpha-1}>0$; $u_\\alpha''(x)=(\\alpha-1)x^{\\alpha-2}<0$ for $\\alpha<1$, so concave for all $\\alpha<1$, including $\\alpha<0$.",
        "Merton fraction $\\pi^\\star=(\\mu-r)/((1-\\alpha)\\sigma^2)$. Kelly is $\\alpha=0$; fraction $f$ of Kelly corresponds to relative risk aversion $1/f$, i.e. $\\alpha=1-1/f$ (half-Kelly at $\\alpha=-1$). B&V's range corresponds to leverage above Kelly.",
        "Pro-log: the growth rate is maximized, and the probability of outperforming any other fixed strategy tends to 1. This is a statement about the median and almost-sure behavior of compounded wealth.",
        "Contra (Samuelson): maximizing $\\mathbb E\\,u(W_T)$ for CRRA $u\\ne\\log$ gives a horizon-independent fraction different from Kelly. \"Winning with high probability\" does not imply higher expected utility, because the rare losing paths can be very costly for a more risk-averse investor.",
        "Practical synthesis: with estimation error in Sharpe ratios, full Kelly is badly overlevered (growth is a concave quadratic near its peak, and overbetting is penalized more than underbetting in the long run). Fractional Kelly or explicit drawdown-probability constraints (Busseti, Ryu & Boyd) keep the problem convex and address the risk objection."
      ],
      "followUps": [
        "Show that with Sharpe ratio $s$ estimated with standard error $\\delta$, the expected growth loss from using the estimated Kelly fraction is proportional to $\\delta^2$. What fraction of Kelly maximizes expected growth under this uncertainty?",
        "Write the log-optimal portfolio problem over historical scenarios in CVXPY and show which cone (exponential) it uses."
      ],
      "source": {
        "label": "B&V exercise 3.15 (adapted) — a family of concave utility functions",
        "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf",
        "relation": "adapted from"
      },
      "sides": [
        {
          "position": "Maximize expected log wealth: it maximizes the long-run growth rate and asymptotically dominates other strategies almost surely.",
          "refs": [
            {
              "label": "Kelly (1956) — A new interpretation of information rate",
              "url": "https://doi.org/10.1002/j.1538-7305.1956.tb03809.x"
            },
            {
              "label": "Latané (1959) — Criteria for choice among risky ventures",
              "url": "https://doi.org/10.1086/258157"
            }
          ]
        },
        {
          "position": "Maximizing the geometric mean is not justified by a long horizon: investors with other utilities should not do it, and almost-sure dominance does not imply higher expected utility.",
          "refs": [
            {
              "label": "Samuelson (1971) — The \"fallacy\" of maximizing the geometric mean in long sequences of investing or gambling",
              "url": "https://doi.org/10.1073/pnas.68.10.2493"
            },
            {
              "label": "Samuelson (1979) — Why we should not make mean log of wealth big though years to act are long",
              "url": "https://doi.org/10.1016/0378-4266(79)90023-2"
            }
          ]
        },
        {
          "position": "Synthesis: use growth as the objective but control risk explicitly (fractional Kelly, or convex drawdown-probability constraints), acknowledging both the good and bad properties of full Kelly.",
          "refs": [
            {
              "label": "MacLean, Thorp & Ziemba (2010) — Long-term capital growth: the good and bad properties of the Kelly and fractional Kelly capital growth criteria",
              "url": "https://doi.org/10.1080/14697688.2010.506108"
            },
            {
              "label": "Busseti, Ryu & Boyd (2016) — Risk-constrained Kelly gambling",
              "url": "https://doi.org/10.3905/joi.2016.25.3.118"
            }
          ]
        }
      ]
    },
    {
      "id": "cvx-functions-q5",
      "type": "predict",
      "difficulty": 2,
      "prompt": "<p>For each chance constraint below, <strong>predict first</strong> whether the feasible set in $w$ is convex, then justify using §3.5 (log-concavity) or a direct argument.</p><ol><li>Execution noise: the realized portfolio is $w+\\varepsilon$ with $\\varepsilon$ Gaussian. Constraint: $\\Pr(w+\\varepsilon\\in S)\\ge0.95$, where $S$ is the (convex) polytope of risk limits.</li><li>Gaussian returns $r\\sim\\mathcal N(\\mu,\\Sigma)$: $\\Pr(r^Tw\\ge t)\\ge p$, for $p=0.95$ and for $p=0.3$.</li><li>Multivariate Student-t returns with 4 degrees of freedom, same constraint with $p=0.95$.</li><li>Historical scenarios with equal weights, same constraint with $p=0.95$.</li></ol><p>Then answer: which of the densities Gaussian, Laplace, Student-t, log-normal and uniform-on-a-box are log-concave? Where in your predictions was log-concavity the reason, and where was it irrelevant?</p>",
      "whyItMatters": "Probabilistic constraints are attractive in risk management, but they are convex only under specific structure. Knowing which structure (log-concavity, ellipticity, or neither) delivers convexity keeps you from posing problems a solver cannot actually solve.",
      "hints": [
        "Item 1 is B&V Example 3.43 (yield function): the integrand $\\mathbf 1_S(w+\\varepsilon)\\,p(\\varepsilon)$ is log-concave in $(w,\\varepsilon)$. Integrate out $\\varepsilon$.",
        "For elliptical returns, $\\Pr(r^Tw\\ge t)\\ge p$ is equivalent to $\\mu^Tw-t\\ge q_p\\|\\Sigma^{1/2}w\\|$ with $q_p$ a quantile of the standardized distribution. What is the sign of $q_p$ for $p=0.95$ and $p=0.3$?",
        "For log-concavity of the densities, check whether $\\log f$ is concave in the tails: polynomial tails give $\\log f\\sim-c\\log|x|$."
      ],
      "keyPoints": [
        "(1) Convex: the yield $Y(w)=\\Pr(w+\\varepsilon\\in S)$ is log-concave by the integration result, so $\\{Y\\ge0.95\\}=\\{\\log Y\\ge\\log0.95\\}$ is convex.",
        "(2) Equivalent to $\\mu^Tw-t\\ge\\Phi^{-1}(p)\\|\\Sigma^{1/2}w\\|$: a second-order cone constraint (convex) for $p\\ge1/2$. For $p=0.3$ the coefficient is negative and the set is generally nonconvex.",
        "(3) Convex for $p\\ge1/2$ by the same elliptical argument with the Student-t quantile, even though the Student-t density is not log-concave. Log-concavity is sufficient, not necessary.",
        "(4) Nonconvex in general: the constraint is a quantile (VaR) condition on the empirical distribution. A conservative convex substitute is a CVaR constraint.",
        "Gaussian, Laplace and uniform on a box are log-concave; Student-t and log-normal are not. Log-concavity was the reason only in (1). Ellipticity drove (2) and (3), and (4) has neither."
      ],
      "followUps": [
        "B&V exercise 3.53: the sum of independent log-concave random vectors has a log-concave density. Use it to say when a portfolio's idiosyncratic P&L has a log-concave density, and why that fails once you add a fat-tailed common factor.",
        "Consider a random right-hand side: $\\Pr(Aw\\succeq\\xi)\\ge p$ with $\\xi$ log-concave. Show convexity via the CDF result (Example 3.42) and give a portfolio interpretation."
      ],
      "source": {
        "label": "B&V Examples 3.42–3.43 and exercise 3.55 (adapted) — log-concave CDFs and yield functions",
        "url": "https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf",
        "relation": "adapted from"
      }
    },
    {
      "id": "cvx-functions-q6",
      "type": "connect",
      "difficulty": 2,
      "prompt": "<p>B&V Example 3.25 shows that the conjugate of log-sum-exp $f(x)=\\log\\sum_ie^{x_i}$ is the negative entropy $\\sum_iy_i\\log y_i$ restricted to the probability simplex. Use this single fact to connect three places it shows up.</p><ol><li><strong>Risk.</strong> The entropic risk measure of a P&amp;L $X$ over scenarios with probabilities $q$ is $\\rho_\\gamma(X)=\\frac1\\gamma\\log\\sum_iq_ie^{-\\gamma X_i}$. Derive its dual representation as a supremum over reweighted probabilities $p$, penalized by $\\frac1\\gamma\\mathrm{KL}(p\\|q)$. Compare with the CVaR dual from the CVaR question in this module.</li><li><strong>Scenario views.</strong> Minimizing $\\mathrm{KL}(p\\|q)$ subject to linear views $Ap=b$ (as in entropy pooling) has a dual of the form $\\max_\\lambda\\ b^T\\lambda-\\log\\sum_iq_ie^{a_i^T\\lambda}$. Derive it and give the optimal $p$ (exponential tilting).</li><li><strong>Reinforcement learning.</strong> In entropy-regularized RL, the soft value is $V(s)=\\tau\\log\\sum_ae^{Q(s,a)/\\tau}$ and the policy is a softmax. Show that this is the same conjugate pair, and say what the temperature $\\tau$ corresponds to in items 1 and 2.</li></ol>",
      "whyItMatters": "One conjugate pair underlies exponential-utility risk, scenario reweighting for views and stress tests, and soft-max policies in RL. Recognizing it lets you move derivations and algorithms between finance and ML.",
      "hints": [
        "Write $\\log\\sum_iq_ie^{z_i}=\\sup_{p\\in\\Delta}\\{p^Tz-\\mathrm{KL}(p\\|q)\\}$. This is Example 3.25 with a shift by $\\log q$.",
        "For item 2, form the Lagrangian $\\sum_ip_i\\log(p_i/q_i)-\\lambda^T(Ap-b)$ with $p$ on the simplex, and minimize over $p$ using item 1.",
        "In RL, $\\max_\\pi\\{\\pi^TQ+\\tau H(\\pi)\\}=\\tau\\log\\sum_ae^{Q_a/\\tau}$, with maximizer $\\pi\\propto e^{Q/\\tau}$."
      ],
      "keyPoints": [
        "Variational formula: $\\log\\sum_iq_ie^{z_i}=\\max_{p\\in\\Delta}\\{p^Tz-\\mathrm{KL}(p\\|q)\\}$, maximized at $p_i\\propto q_ie^{z_i}$.",
        "Entropic risk: $\\rho_\\gamma(X)=\\sup_p\\{\\mathbb E_p[-X]-\\tfrac1\\gamma\\mathrm{KL}(p\\|q)\\}$, a convex (not coherent) risk measure. CVaR uses a hard box constraint on likelihood ratios; entropic risk uses a soft KL penalty.",
        "Entropy pooling dual: $g(\\lambda)=b^T\\lambda-\\log\\sum_iq_ie^{a_i^T\\lambda}$ (concave), with optimal $p_i^\\star\\propto q_ie^{a_i^T\\lambda^\\star}$. This is an exponential tilt of the prior scenarios.",
        "RL: soft value is $\\tau\\times$log-sum-exp of $Q/\\tau$; the policy is its gradient (softmax). The temperature $\\tau$ plays the role of $1/\\gamma$ in entropic risk: it is the price of deviating from the reference distribution.",
        "Common structure: a linear payoff plus an entropy or KL regularizer always gives log-sum-exp values and Gibbs/softmax optimizers."
      ],
      "followUps": [
        "Replace KL by a $\\chi^2$ divergence in item 1. What risk measure do you obtain, and how does it relate to a mean-variance penalty?",
        "In the Finance-ML module on portfolio construction (fml-portfolio-ml), where would an entropy-regularized allocation (softmax over strategy scores) be preferable to a hard optimizer, and why?"
      ],
      "source": {
        "label": "B&V Example 3.25 (conjugate of log-sum-exp), motivated by; RL link: Haarnoja, Tang, Abbeel & Levine (2017) — Reinforcement learning with deep energy-based policies",
        "url": "https://arxiv.org/abs/1702.08165",
        "relation": "motivated by"
      }
    },
    {
      "id": "cvx-functions-q7",
      "type": "critique",
      "difficulty": 3,
      "prompt": "<p>A trading-cost model includes a fixed ticket charge: $f(x)=c\\,\\mathbf 1\\{x\\ne0\\}+a|x|+b|x|^{3/2}$ on $|x|\\le U$, per name. A colleague writes: <em>\"$f$ is not convex, so we replace it by its convex envelope, which is $\\frac cU|x|+a|x|+b|x|^{3/2}$. The relaxed problem is now exactly equivalent to the original, and we solve it with CVXPY.\"</em></p><ol><li>Is the colleague's function the convex envelope of $f$ on $[-U,U]$? Compute the true envelope (B&V exercise 3.30). Hint: find the tangent from the point $(0,0)$ to the graph of the continuous part.</li><li>Is the relaxed problem \"exactly equivalent\"? What does solving the relaxation give you (bound, feasible point, both, neither)? Explain using the relationship between a function, its envelope and their minima over a convex set.</li><li>For a 1,000-name rebalance, predict the qualitative difference between the relaxed solution and the true optimum (number of names traded, sizes). Propose a procedure that recovers good feasible solutions and a certificate of how far from optimal they are.</li><li>Does the convex envelope of a separable sum over a box equal the sum of the envelopes? Why does this matter here?</li></ol>",
      "whyItMatters": "Fixed costs, minimum tickets and per-order fees are common and nonconvex. Relaxing them is fine if you know what the relaxation guarantees; \"exactly equivalent\" claims lead to optimizers that trade hundreds of tiny positions.",
      "hints": [
        "On $[0,U]$ the envelope is $x\\cdot\\min_{y\\in[x,U]}\\frac{c+ay+by^{3/2}}{y}$ up to the tangent point, and equals $f$ beyond it. Minimize $c/y+a+b\\sqrt y$.",
        "The envelope is the largest convex minorant, so $\\min\\operatorname{env}f\\le\\min f$ over a convex set. When does equality hold, and when is the relaxed minimizer feasible for the original cost?",
        "For separable functions on a product set, the envelope separates. Think about which names end up with $0<|x_i|<y^\\star$ in the relaxed solution."
      ],
      "keyPoints": [
        "Tangent point $y^\\star=(2c/b)^{2/3}$ (if $\\le U$). Envelope slope $s^\\star=a+c/y^\\star+b\\sqrt{y^\\star}=a+\\tfrac32b\\sqrt{y^\\star}$. The envelope is $s^\\star|x|$ for $|x|\\le y^\\star$ and $f(x)$ beyond. If $y^\\star>U$, it is the chord to $(U,f(U))$.",
        "The colleague's function is convex and below $f$ but below the envelope too (looser). Both are relaxations: their minimum is a lower bound on the true optimal cost, not an equivalent problem.",
        "The relaxed solution is feasible (the constraints are unchanged), but its true cost includes $c$ for every nonzero trade. It typically trades many names in sizes below $y^\\star$, where the relaxation underestimates cost most.",
        "Procedure: solve the relaxation (bound), then round, e.g. drop trades below a threshold and re-solve with those names fixed, or use reweighted $\\ell_1$ iterations (as in Lobo, Fazel & Boyd 2007) or a MIO for exact. Report the true cost of the feasible point minus the relaxed bound as the certified gap.",
        "For separable functions on a box, the envelope of the sum is the sum of per-name envelopes, so the per-name tangent construction gives the exact envelope of the whole cost. With coupling (shared ticket budgets) this fails."
      ],
      "followUps": [
        "Use a Shapley-Folkman argument to bound the relaxation gap in terms of the number of coupling constraints rather than the number of names.",
        "Formulate the exact problem with binaries and the perspective reformulation of $b|x|^{3/2}$, and explain why it is tighter than a big-M formulation."
      ],
      "source": {
        "label": "B&V exercise 3.30 (adapted) — convex hull or envelope of a function; motivated by Lobo, Fazel & Boyd (2007) on fixed transaction costs",
        "url": "https://doi.org/10.1007/s10479-006-0145-1",
        "relation": "adapted from"
      }
    },
    {
      "id": "cvx-functions-q8",
      "type": "design",
      "difficulty": 3,
      "prompt": "<p>A PM asks for a portfolio that \"maximizes Sharpe, never had more than a 15% drawdown in the backtest window, keeps 95% CVaR under 3% daily, and pays realistic impact.\" Design a formulation that a convex solver (or a sequence of convex solves) can handle exactly, and make every curvature claim explicit. Use historical daily return scenarios $r_1,\\dots,r_T$ in order.</p><ol><li>Show that the <em>additive</em> drawdown $\\max_{s\\le t}\\big(P_s(w)-P_t(w)\\big)$, with $P_t(w)=\\sum_{u\\le t}r_u^Tw$, is convex in $w$. Write the drawdown cap with $O(T)$ auxiliary variables instead of $O(T^2)$ constraints.</li><li>For the <em>compounded</em> drawdown $1-\\min_{s\\le t}W_t/W_s$ with $W_t=\\prod_{u\\le t}(1+r_u^Tw)$, show that the drawdown function is not obviously convex. Then show that the constraint \"drawdown at most $d$\" is nonetheless convex, via logs. Classify the drawdown function (convex, quasiconvex, ...).</li><li>Combine the objective and constraints. Maximizing Sharpe is quasiconcave. Give two exact approaches: homogenization (with perspectives for the non-homogeneous cost and drawdown terms) and bisection (DQCP). State which constraints break the simple homogenization trick and why.</li><li>Critique the specification itself. What does an in-sample drawdown constraint do to out-of-sample behavior, and how would you validate it?</li></ol>",
      "whyItMatters": "PM requests mix ratios, path-dependent risk and costs. Turning them into a correct convex (or quasiconvex) program, and being honest about what in-sample path constraints mean, is the daily job of a portfolio-construction QR.",
      "hints": [
        "Each $P_s-P_t$ is linear in $w$, so the drawdown is a pointwise max of linear functions. For $O(T)$ variables, introduce a running maximum $M_t\\ge M_{t-1}$, $M_t\\ge P_t$, and impose $M_t-P_t\\le D$.",
        "$\\log W_s-\\log W_t=-\\sum_{u=s+1}^t\\log(1+r_u^Tw)$: a sum of convex functions of $w$. The drawdown fraction is a monotone transform of this.",
        "Homogenization sets $y=\\kappa w$, $\\kappa>0$. Linear constraints scale by $\\kappa$; a convex constraint $g(w)\\le0$ becomes $\\kappa g(y/\\kappa)\\le0$, a perspective."
      ],
      "keyPoints": [
        "Additive drawdown is a max of linear functions, hence convex and polyhedral. The running-max lift ($M_t\\ge M_{t-1}$, $M_t\\ge P_t$, $M_t-P_t\\le D$, $M_0\\ge 0$) is exact.",
        "Log-drawdown $\\max_{s\\le t}\\sum_{u=s+1}^t-\\log(1+r_u^Tw)$ is convex (a max of sums of convex functions) on the domain where all $1+r_u^Tw>0$. The fraction is $1-e^{-\\text{log-DD}}$, a monotone increasing transform, so the drawdown function is quasiconvex and the constraint $\\le d$ is the convex set $\\{\\text{log-DD}\\le-\\log(1-d)\\}$.",
        "CVaR cap: an LP by Rockafellar-Uryasev. Impact: $b|x|^{3/2}$ terms are convex (power cone).",
        "Max Sharpe by homogenization: minimize $y^T\\Sigma y$ subject to $\\mu^Ty=1$ and perspective versions of the convex constraints. This works because perspectives of convex functions are convex, but the log-drawdown and power-cost perspectives need exponential- or power-cone forms. Alternatively, bisect on the target Sharpe $s$ with feasibility problems $\\{\\mu^Tw\\ge s\\|\\Sigma^{1/2}w\\|,\\ \\text{constraints}\\}$ (DQCP).",
        "Critique: an in-sample drawdown cap is a constraint on one historical path. It overfits to that path's ordering of returns and gives no guarantee out of sample. Validate with block-bootstrap or CPCV paths and report the out-of-sample drawdown distribution, not the in-sample maximum."
      ],
      "followUps": [
        "Replace the historical drawdown cap by a constraint on CVaR of drawdown across bootstrap paths. Is it still convex in $w$?",
        "Use the purged/combinatorial cross-validation ideas from fml-cross-validation to choose the drawdown cap level. What exactly is the \"label\" and what leaks?"
      ],
      "source": {
        "label": "Original design question, informed by Agrawal & Boyd (2020) — Disciplined quasiconvex programming, and B&V §3.2.6 (perspective) and §3.4",
        "url": "https://doi.org/10.1007/s11590-020-01561-8",
        "relation": "original"
      }
    }
  ],
  "projects": [
    {
      "id": "cvx-functions-r1",
      "title": "Replicate Rockafellar & Uryasev (2000): minimum-CVaR versus minimum-variance portfolios",
      "level": "replication",
      "hours": "6–10",
      "paper": {
        "label": "Rockafellar & Uryasev (2000) — Optimization of conditional value-at-risk",
        "url": "https://doi.org/10.21314/JOR.2000.038"
      },
      "goal": "Reproduce the portfolio example of Rockafellar & Uryasev (2000). With normally distributed returns on three instruments (parameters given in the paper), the CVaR-minimizing portfolio computed by the scenario LP should approach the minimum-variance portfolio at the same expected-return constraint as the number of scenarios grows. Reproduce the tables of optimal weights, VaR and CVaR for the confidence levels and sample sizes the paper reports. Then break the equivalence with fat-tailed and skewed scenarios.",
      "data": "Simulation only: mean vector and covariance matrix of the three instruments as tabulated in the paper (a free preprint is on the University of Florida ISE site and the published version is in the Journal of Risk). Extension uses Ken French daily industry portfolios as real scenarios. Public data only.",
      "steps": [
        "Read the example section: record the instrument parameters, the expected-return constraint, the confidence levels and the sample sizes used, and the reported outputs (weights, VaR, CVaR, run statistics). Note any detail you must assume.",
        "Compute the analytic minimum-variance portfolio under the return constraint and its Gaussian VaR and CVaR (closed form) as the benchmark.",
        "Implement the Rockafellar-Uryasev LP in CVXPY; for each confidence level and sample size, draw scenarios (pseudo-random and, if the paper uses them, quasi-random sequences), solve, and record weights, zeta (VaR) and CVaR. Repeat over seeds for Monte Carlo error.",
        "Build the paper-versus-replication table and a convergence plot of weights toward the minimum-variance solution as N grows.",
        "Extension: replace the Gaussian by a multivariate Student-t with matched covariance and by a skewed mixture, and show the minimum-CVaR and minimum-variance portfolios separate; then repeat on historical industry scenarios."
      ],
      "deliverables": [
        "Script with fixed seeds and a config listing all parameters and assumptions.",
        "Side-by-side table: paper versus replication for weights, VaR and CVaR at each confidence level and sample size, with Monte Carlo standard errors.",
        "Convergence plot of LP weights toward minimum-variance weights versus N.",
        "One-page note on discrepancies and on the extension results."
      ],
      "acceptance": [
        "At the largest sample size, LP weights are within 0.01 (absolute, each instrument) of the analytic minimum-variance weights for every confidence level, averaged over at least 20 seeds.",
        "LP CVaR at the largest sample size matches the Gaussian closed-form CVaR of the minimum-variance portfolio within 2 Monte Carlo standard errors.",
        "Replicated weights and CVaR values match the paper within Monte Carlo error for at least two sample sizes, or the note explains the discrepancy (e.g. scenario-generation method).",
        "In the Student-t or skewed extension, the minimum-CVaR and minimum-variance weights differ by more than their Monte Carlo error for at least one instrument, and the note explains the direction of the difference."
      ],
      "extensions": [
        "Add the CVaR constraint version (maximize return subject to CVaR <= c) and verify the efficient frontiers coincide in the Gaussian case.",
        "Compare scenario counts needed for stable weights at alpha = 0.90, 0.95, 0.99, and relate them to the number of tail scenarios (1 - alpha) N."
      ]
    }
  ]
}
);
