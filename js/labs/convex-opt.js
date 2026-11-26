/* Prediction labs for Convex Optimization. Each lab: predict first, then simulate. Pure JS, SVG charts. */
(function () {
  const LABS = window.LABS = window.LABS || [];

  function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
  function gauss(r) { let u = 0, v = 0; while (u === 0) u = r(); v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  // Solve S x = y for symmetric positive definite S (array of Float64Array) by Cholesky; returns null if not PD.
  function cholSolve(S, y) {
    const n = S.length, L = Array.from({ length: n }, () => new Float64Array(n));
    for (let i = 0; i < n; i++) for (let j = 0; j <= i; j++) {
      let s = S[i][j]; for (let k = 0; k < j; k++) s -= L[i][k] * L[j][k];
      if (i === j) { if (s <= 0) return null; L[i][i] = Math.sqrt(s); } else L[i][j] = s / L[j][j];
    }
    const z = new Float64Array(n), x = new Float64Array(n);
    for (let i = 0; i < n; i++) { let s = y[i]; for (let k = 0; k < i; k++) s -= L[i][k] * z[k]; z[i] = s / L[i][i]; }
    for (let i = n - 1; i >= 0; i--) { let s = z[i]; for (let k = i + 1; k < n; k++) s -= L[k][i] * x[k]; x[i] = s / L[i][i]; }
    return x;
  }

  const W = 640, H = 260, P = { l: 48, r: 14, t: 14, b: 34 };
  const fmt = (v, d) => Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(d == null ? 2 : d);
  function axes(xmin, xmax, ymin, ymax, xl, yl) {
    const X = v => P.l + (v - xmin) / (xmax - xmin || 1) * (W - P.l - P.r);
    const Y = v => H - P.b - (v - ymin) / (ymax - ymin || 1) * (H - P.t - P.b);
    let g = `<line x1="${P.l}" y1="${H - P.b}" x2="${W - P.r}" y2="${H - P.b}" class="ax"/><line x1="${P.l}" y1="${P.t}" x2="${P.l}" y2="${H - P.b}" class="ax"/>`;
    for (let i = 0; i <= 4; i++) {
      const xv = xmin + (xmax - xmin) * i / 4, yv = ymin + (ymax - ymin) * i / 4;
      g += `<text x="${X(xv)}" y="${H - P.b + 16}" class="tk" text-anchor="middle">${fmt(xv)}</text><text x="${P.l - 6}" y="${Y(yv) + 4}" class="tk" text-anchor="end">${fmt(yv)}</text>`;
    }
    g += `<text x="${(W + P.l) / 2}" y="${H - 4}" class="al" text-anchor="middle">${xl}</text><text x="12" y="${(H - P.b + P.t) / 2}" class="al" text-anchor="middle" transform="rotate(-90 12 ${(H - P.b + P.t) / 2})">${yl}</text>`;
    return { X, Y, g };
  }
  const svg = (inner, label) => `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="${label}">${inner}</svg>`;

  /* ---------- Lab A: Newton steps of a barrier interior-point method ---------- */
  // LP: minimise c'x s.t. Gx <= h (random rows) and -1 <= x <= 1. x = 0 is strictly feasible.
  function barrierLP(n, mu, seed) {
    const r = rng(seed), mg = 2 * n, rows = [], h = [];
    for (let i = 0; i < mg; i++) { rows.push(Float64Array.from({ length: n }, () => gauss(r))); h.push(0.5 + r()); }
    for (let j = 0; j < n; j++) { const e = new Float64Array(n); e[j] = 1; rows.push(e); h.push(1); const f = new Float64Array(n); f[j] = -1; rows.push(f); h.push(1); }
    const m = rows.length, c = Float64Array.from({ length: n }, () => gauss(r));
    let x = new Float64Array(n), t = 1, newton = 0, outer = 0;
    const slack = x => rows.map((a, i) => { let s = h[i]; for (let j = 0; j < n; j++) s -= a[j] * x[j]; return s; });
    const f = (x, t) => { const s = slack(x); if (s.some(v => v <= 0)) return Infinity; let v = 0; for (let j = 0; j < n; j++) v += t * c[j] * x[j]; for (const si of s) v -= Math.log(si); return v; };
    while (true) {
      for (let it = 0; it < 100; it++) {
        const s = slack(x), g = Float64Array.from(c, v => t * v), Hm = Array.from({ length: n }, () => new Float64Array(n));
        for (let i = 0; i < m; i++) { const a = rows[i], d = 1 / s[i]; for (let j = 0; j < n; j++) { if (!a[j]) continue; g[j] += a[j] * d; for (let k = 0; k < n; k++) if (a[k]) Hm[j][k] += a[j] * a[k] * d * d; } }
        const dx = cholSolve(Hm, Float64Array.from(g, v => -v)); if (!dx) break;
        let lam2 = 0; for (let j = 0; j < n; j++) lam2 -= g[j] * dx[j];
        if (lam2 / 2 <= 1e-8) break;
        newton++;
        let step = 1, moved = false; const f0 = f(x, t);
        while (step > 1e-10) { const xn = x.map((v, j) => v + step * dx[j]); const f1 = f(xn, t); if (f1 <= f0 - 0.25 * step * lam2) { x = xn; moved = f0 - f1 > 1e-12 * Math.abs(f0); break; } step *= 0.5; }
        if (!moved) break; // floating-point floor: the decrement is below what f can resolve
      }
      outer++;
      if (m / t < 1e-6) break;
      t *= mu;
    }
    return { newton, outer, m };
  }
  LABS.push({
    id: "cvx-lab-ipm", module: "cvx-algorithms",
    title: "How many Newton steps does an interior-point method need?",
    question: "A barrier method solves a random LP with <i>n</i> variables and 4<i>n</i> inequality constraints to a duality gap of 10<sup>−6</sup>·<i>m</i>, multiplying <i>t</i> by μ after each centering step. With <i>n</i> = 5 it takes a few dozen Newton steps. <b>Predict the total number of Newton steps at the largest n you choose.</b>",
    unit: "steps", guessLabel: "Your predicted total Newton steps",
    params: [
      { k: "n", label: "Largest n (variables)", min: 20, max: 120, step: 10, value: 80 },
      { k: "mu", label: "Barrier update factor μ", min: 2, max: 200, step: 1, value: 20 }
    ],
    run(p) {
      const sizes = [5, 10, 20, 40, 80, 120].filter(v => v < p.n).concat([p.n]);
      const res = sizes.map(n => ({ n, ...barrierLP(n, p.mu, 900 + n) }));
      const last = res[res.length - 1], ymax = Math.max(...res.map(r => r.newton)) * 1.4 + 5;
      const ax = axes(0, p.n * 1.05, 0, ymax, "Variables n (constraints m = 4n)", "Total Newton steps");
      const pts = res.map(r => `<circle cx="${ax.X(r.n)}" cy="${ax.Y(r.newton)}" r="4" class="dot"/><text x="${ax.X(r.n)}" y="${ax.Y(r.newton) - 8}" class="vl" text-anchor="middle">${r.newton}</text>`).join("");
      const path = res.map((r, i) => (i ? "L" : "M") + ax.X(r.n).toFixed(1) + " " + ax.Y(r.newton).toFixed(1)).join(" ");
      const bound = Math.ceil(Math.log(last.m / 1e-6 / 1) / Math.log(p.mu));
      return {
        actual: last.newton,
        chart: svg(ax.g + `<path d="${path}" class="curve"/>` + pts, "Newton steps versus problem size"),
        detail: `n = ${last.n}: ${last.newton} Newton steps over ${last.outer} centering steps (m = ${last.m}). Across sizes ${res.map(r => r.n + "→" + r.newton).join(", ")}. The worst-case theory gives O(√m log(1/ε)) steps, but in practice the count grows very slowly with size; the number of outer steps is ⌈log(m/(t₀ε))/log μ⌉ ≈ ${bound}. Try μ = 2 vs μ = 150: few large updates need more Newton steps each, many small updates need more centering steps — the total is flat over a wide range (B&V §11.3, Fig. 11.4–11.8). Each Newton step costs O(n³) here, so cost per step, not step count, is what grows.`
      };
    }
  });

  /* ---------- Lab B: Markowitz as an error maximiser ---------- */
  LABS.push({
    id: "cvx-lab-errmax", module: "cvx-portfolio",
    title: "Markowitz with estimated means: how much Sharpe survives?",
    question: "<i>N</i> stocks follow a one-factor model (market premium 6%/yr, betas 0.5–1.5, small true alphas). You estimate means and covariance from <i>T</i> years of monthly returns and hold the unconstrained mean–variance portfolio Σ̂⁻¹μ̂. The true optimal portfolio has a known Sharpe. <b>Predict the true (out-of-sample) annualised Sharpe of your estimated portfolio.</b>",
    unit: "SR", guessLabel: "Your predicted true Sharpe of the estimated portfolio",
    params: [
      { k: "N", label: "Stocks N", min: 5, max: 50, step: 5, value: 25 },
      { k: "years", label: "Estimation window T (years)", min: 5, max: 40, step: 1, value: 10 },
      { k: "reps", label: "Monte Carlo repetitions", min: 20, max: 200, step: 10, value: 80 }
    ],
    run(p) {
      const N = p.N, T = Math.max(12 * p.years, N + 6), r = rng(31337 + N * 7 + T);
      const beta = Array.from({ length: N }, () => 0.5 + r()), fs = 0.045, is = 0.06, prem = 0.005;
      const mu = beta.map(b => b * prem + 0.0008 * gauss(r));
      const Sig = Array.from({ length: N }, (_, i) => Float64Array.from({ length: N }, (_, j) => beta[i] * beta[j] * fs * fs + (i === j ? is * is : 0)));
      const sharpe = w => { let m = 0, v = 0; for (let i = 0; i < N; i++) { m += w[i] * mu[i]; for (let j = 0; j < N; j++) v += w[i] * Sig[i][j] * w[j]; } return m / Math.sqrt(v) * Math.sqrt(12); };
      const wOpt = cholSolve(Sig, Float64Array.from(mu)), srOpt = sharpe(wOpt), srEq = sharpe(new Float64Array(N).fill(1 / N));
      const oos = [], ins = [];
      for (let k = 0; k < p.reps; k++) {
        const X = Array.from({ length: T }, () => { const f = gauss(r) * fs; return Float64Array.from({ length: N }, (_, i) => mu[i] + beta[i] * f + is * gauss(r)); });
        const m = new Float64Array(N); X.forEach(x => x.forEach((v, i) => m[i] += v / T));
        const S = Array.from({ length: N }, () => new Float64Array(N));
        X.forEach(x => { for (let i = 0; i < N; i++) { const di = x[i] - m[i]; for (let j = 0; j <= i; j++) S[i][j] += di * (x[j] - m[j]) / (T - 1); } });
        for (let i = 0; i < N; i++) for (let j = 0; j < i; j++) S[j][i] = S[i][j];
        const w = cholSolve(S, m); if (!w) continue;
        let q = 0; for (let i = 0; i < N; i++) q += w[i] * m[i];
        ins.push(Math.sqrt(Math.max(q, 0) * 12)); oos.push(sharpe(w) * Math.sign(q || 1));
      }
      const mean = a => a.reduce((x, y) => x + y, 0) / a.length, mo = mean(oos), mi = mean(ins);
      const lo = Math.min(...oos, srEq, 0) - 0.1, hi = Math.max(...oos, srOpt, mi) + 0.1, bins = 24, w = (hi - lo) / bins, hh = new Array(bins).fill(0);
      oos.forEach(v => { const i = Math.min(bins - 1, Math.floor((v - lo) / w)); if (i >= 0) hh[i]++; });
      const ax = axes(lo, hi, 0, Math.max(...hh) * 1.3, "True annualised Sharpe of the estimated portfolio", "Count");
      const bars = hh.map((c, i) => `<rect x="${ax.X(lo + i * w) + 1}" y="${ax.Y(c)}" width="${Math.max(1, ax.X(lo + (i + 1) * w) - ax.X(lo + i * w) - 2)}" height="${ax.Y(0) - ax.Y(c)}" class="b2"/>`).join("");
      const vline = (x, cls, label, dy) => `<line x1="${ax.X(x)}" x2="${ax.X(x)}" y1="${P.t}" y2="${H - P.b}" class="${cls}"/><text x="${ax.X(x) + 4}" y="${P.t + dy}" class="vl">${label}</text>`;
      return {
        actual: mo,
        chart: svg(ax.g + bars + vline(srOpt, "ref", `true optimum ${srOpt.toFixed(2)}`, 12) + vline(srEq, "ref2", `1/N ${srEq.toFixed(2)}`, 28) + (mi < hi ? vline(mi, "ref2", `in-sample ${mi.toFixed(2)}`, 44) : ""), "Distribution of out-of-sample Sharpe"),
        detail: `True optimum Sharpe ${srOpt.toFixed(2)}; equal weight (1/N) ${srEq.toFixed(2)}; estimated mean–variance: in-sample ${mi.toFixed(2)} on average, true ${mo.toFixed(2)} (T = ${T} months, N = ${N}). Means are estimated with error of order σ/√T per asset, and Σ̂⁻¹ amplifies exactly the directions where the noise is largest (Michaud's "error maximisation"; DeMiguel, Garlappi & Uppal 2009 estimate that the sample-based rule needs very long windows to beat 1/N). Shrink the means, constrain the weights, or use a factor-model Σ and compare.`
      };
    }
  });
})();
