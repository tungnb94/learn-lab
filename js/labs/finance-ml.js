/* Prediction labs for Finance-ML. Each lab: predict first, then simulate. Pure JS, SVG charts. */
(function () {
  const LABS = window.LABS = window.LABS || [];

  /* ---------- numerics ---------- */
  function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
  function gauss(r) { let u = 0, v = 0; while (u === 0) u = r(); v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  // inverse standard normal CDF (Acklam)
  function ndtri(p) {
    const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.3577518672690, -30.66479806614716, 2.506628277459239];
    const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
    const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
    const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
    const pl = 0.02425;
    if (p < pl) { const q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    if (p > 1 - pl) { const q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    const q = p - 0.5, r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  // Jacobi eigenvalues of a symmetric matrix (array of Float64Array rows)
  function eigSym(A) {
    const n = A.length, a = A.map(r => Float64Array.from(r));
    for (let sweep = 0; sweep < 60; sweep++) {
      let off = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += a[i][j] * a[i][j];
      if (off < 1e-18) break;
      for (let p = 0; p < n - 1; p++) for (let q = p + 1; q < n; q++) {
        const apq = a[p][q]; if (Math.abs(apq) < 1e-15) continue;
        const theta = (a[q][q] - a[p][p]) / (2 * apq);
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
        const c = 1 / Math.sqrt(t * t + 1), s = t * c;
        for (let k = 0; k < n; k++) { const akp = a[k][p], akq = a[k][q]; a[k][p] = c * akp - s * akq; a[k][q] = s * akp + c * akq; }
        for (let k = 0; k < n; k++) { const apk = a[p][k], aqk = a[q][k]; a[p][k] = c * apk - s * aqk; a[q][k] = s * apk + c * aqk; }
      }
    }
    return Array.from({ length: n }, (_, i) => a[i][i]).sort((x, y) => x - y);
  }

  /* ---------- tiny SVG chart helpers ---------- */
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
  function hist(values, bins, lo, hi) {
    const h = new Array(bins).fill(0), w = (hi - lo) / bins;
    values.forEach(v => { const i = Math.floor((v - lo) / w); if (i >= 0 && i < bins) h[i]++; });
    return { h, w };
  }

  /* ---------- Lab A: leakage of shuffled K-fold vs purged CV ---------- */
  LABS.push({
    id: "fml-lab-leakage", module: "fml-cross-validation",
    title: "How much does shuffled K-fold flatter a useless feature?",
    question: "The feature has <b>zero</b> true predictive power: returns are i.i.d. noise. Labels are the sign of the next-<i>h</i>-bar return (overlapping), and the <i>d</i> features are persistent AR(1) series unrelated to returns. A 1-nearest-neighbour classifier is scored with shuffled 5-fold CV. <b>Predict its accuracy (%).</b>",
    unit: "%", guessLabel: "Your predicted shuffled-K-fold accuracy (%)",
    params: [
      { k: "h", label: "Label horizon h (bars)", min: 1, max: 40, step: 1, value: 10 },
      { k: "phi", label: "Feature persistence φ", min: 0.5, max: 0.999, step: 0.001, value: 0.98 },
      { k: "d", label: "Number of features d", min: 1, max: 8, step: 1, value: 4 },
      { k: "n", label: "Observations", min: 400, max: 2000, step: 100, value: 1200 }
    ],
    run(p) {
      const r = rng(12345 + p.h * 7 + Math.round(p.phi * 1000) + (p.d || 1) * 31), n = p.n, h = p.h;
      const ret = Array.from({ length: n + h }, () => gauss(r));
      const D = p.d || 1, x = Array.from({ length: D }, () => { const z = new Float64Array(n); z[0] = gauss(r) / Math.sqrt(1 - p.phi * p.phi); for (let t = 1; t < n; t++) z[t] = p.phi * z[t - 1] + gauss(r); return z; });
      const dist = (i, j) => { let s = 0; for (let k = 0; k < D; k++) { const v = x[k][i] - x[k][j]; s += v * v; } return s; };
      const y = new Int8Array(n); for (let t = 0; t < n; t++) { let s = 0; for (let j = 1; j <= h; j++) s += ret[t + j]; y[t] = s > 0 ? 1 : 0; }
      const K = 5;
      function score(testSets, trainOf) {
        let ok = 0, tot = 0;
        for (const test of testSets) {
          const train = trainOf(test);
          for (const i of test) { let best = -1, bd = Infinity; for (const j of train) { const d = dist(i, j); if (d < bd) { bd = d; best = j; } } if (best >= 0) { ok += y[best] === y[i] ? 1 : 0; tot++; } }
        }
        return 100 * ok / tot;
      }
      // shuffled K-fold
      const idx = Array.from({ length: n }, (_, i) => i); for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
      const folds = Array.from({ length: K }, (_, k) => idx.filter((_, i) => i % K === k));
      const shuffled = score(folds, test => { const s = new Set(test); return idx.filter(i => !s.has(i)); });
      // contiguous folds, purged (label overlap h) + embargo (1% of n)
      const emb = Math.ceil(0.01 * n), size = Math.floor(n / K);
      const cfolds = Array.from({ length: K }, (_, k) => Array.from({ length: k === K - 1 ? n - k * size : size }, (_, i) => k * size + i));
      const purged = score(cfolds, test => { const a = test[0], b = test[test.length - 1]; const out = []; for (let i = 0; i < n; i++) if (i < a - h || i > b + h + emb) out.push(i); return out; });
      const plain = score(cfolds, test => { const s = new Set(test); return idx.filter(i => !s.has(i)); });
      const vals = [["Shuffled K-fold", shuffled], ["Contiguous K-fold", plain], ["Purged + embargo", purged], ["Truth", 50]];
      const ax = axes(0, vals.length, 40, 100, "", "Accuracy (%)");
      const bw = (W - P.l - P.r) / vals.length * 0.6;
      const bars = vals.map(([lab, v], i) => { const x0 = ax.X(i + 0.5) - bw / 2; return `<rect x="${x0}" y="${ax.Y(v)}" width="${bw}" height="${ax.Y(40) - ax.Y(v)}" class="${i === 0 ? "b1" : i === 3 ? "b0" : "b2"}"/><text x="${x0 + bw / 2}" y="${ax.Y(v) - 6}" class="vl" text-anchor="middle">${v.toFixed(1)}%</text><text x="${x0 + bw / 2}" y="${H - P.b + 16}" class="tk" text-anchor="middle">${lab}</text>`; }).join("");
      const g = `<line x1="${P.l}" y1="${H - P.b}" x2="${W - P.r}" y2="${H - P.b}" class="ax"/><line x1="${P.l}" y1="${P.t}" x2="${P.l}" y2="${H - P.b}" class="ax"/>` + [40, 55, 70, 85, 100].map(v => `<text x="${P.l - 6}" y="${ax.Y(v) + 4}" class="tk" text-anchor="end">${v}</text>`).join("");
      return {
        actual: shuffled,
        chart: svg(g + `<line x1="${P.l}" x2="${W - P.r}" y1="${ax.Y(50)}" y2="${ax.Y(50)}" class="ref"/>` + bars, "Accuracy by validation scheme"),
        detail: `Shuffled K-fold ${shuffled.toFixed(1)}% · contiguous K-fold ${plain.toFixed(1)}% · purged + embargo ${purged.toFixed(1)}% (truth: 50%). With overlapping labels and persistent features, the nearest neighbour of a test point is usually its temporal neighbour in the training set, which shares most of the same future returns.`
      };
    }
  });

  /* ---------- Lab B: expected maximum Sharpe of N noise strategies ---------- */
  LABS.push({
    id: "fml-lab-maxsharpe", module: "fml-backtest-overfitting",
    title: "The best of N worthless strategies",
    question: "You backtest <i>N</i> strategies whose true Sharpe ratio is exactly zero (daily returns i.i.d. normal, 252 days a year) over <i>T</i> years and keep the best one. <b>Predict the average annualised Sharpe of the winner.</b>",
    unit: "SR", guessLabel: "Your predicted best annualised Sharpe",
    params: [
      { k: "N", label: "Number of trials N", min: 2, max: 1000, step: 1, value: 100 },
      { k: "years", label: "Backtest length T (years)", min: 1, max: 20, step: 1, value: 5 },
      { k: "reps", label: "Monte Carlo repetitions", min: 20, max: 200, step: 10, value: 60 }
    ],
    run(p) {
      const r = rng(777 + p.N * 13 + p.years), T = 252 * p.years, maxes = [];
      // Each strategy's Sharpe estimate is ~ N(0, 1/T) per day; simulate via the sample mean/sd of T returns would be O(N*T*reps).
      // For speed use the exact sampling distribution of the daily Sharpe estimate: SR_hat ≈ z / sqrt(T) (normal returns, SR = 0).
      for (let k = 0; k < p.reps; k++) { let m = -Infinity; for (let i = 0; i < p.N; i++) { const s = gauss(r) / Math.sqrt(T) * Math.sqrt(252); if (s > m) m = s; } maxes.push(m); }
      const mean = maxes.reduce((a, b) => a + b, 0) / maxes.length;
      const g = 0.5772156649, sd = Math.sqrt(252 / T);
      const expected = sd * ((1 - g) * ndtri(1 - 1 / p.N) + g * ndtri(1 - 1 / (p.N * Math.E)));
      const lo = Math.min(...maxes, expected) * 0.9, hi = Math.max(...maxes, expected) * 1.1;
      const { h, w } = hist(maxes, 24, lo, hi), ymax = Math.max(...h) * 1.15;
      const ax = axes(lo, hi, 0, ymax, "Best annualised Sharpe in each repetition", "Count");
      const bars = h.map((c, i) => `<rect x="${ax.X(lo + i * w) + 1}" y="${ax.Y(c)}" width="${Math.max(1, ax.X(lo + (i + 1) * w) - ax.X(lo + i * w) - 2)}" height="${ax.Y(0) - ax.Y(c)}" class="b2"/>`).join("");
      return {
        actual: mean,
        chart: svg(ax.g + bars + `<line x1="${ax.X(expected)}" x2="${ax.X(expected)}" y1="${P.t}" y2="${H - P.b}" class="ref"/><text x="${ax.X(expected) + 4}" y="${P.t + 12}" class="vl">E[max] formula ${expected.toFixed(2)}</text><line x1="${ax.X(mean)}" x2="${ax.X(mean)}" y1="${P.t}" y2="${H - P.b}" class="ref2"/>`, "Distribution of the maximum Sharpe"),
        detail: `Simulated mean of the best Sharpe: ${mean.toFixed(2)}. Expected-maximum formula (Bailey & López de Prado): ${expected.toFixed(2)} (difference ${(100 * (mean - expected) / expected).toFixed(1)}%). The bar to beat grows like √(2 ln N) and shrinks like 1/√T — this is the "selection" term the Deflated Sharpe Ratio subtracts.`
      };
    }
  });

  /* ---------- Lab C: Marchenko–Pastur ---------- */
  LABS.push({
    id: "fml-lab-mp", module: "fml-portfolio-ml",
    title: "How big is the largest eigenvalue of pure noise?",
    question: "Returns of <i>N</i> assets over <i>T</i> periods, standardised, with <i>k</i> true factors (k = 0 means pure noise). <b>Predict the largest eigenvalue of the sample correlation matrix.</b>",
    unit: "λ", guessLabel: "Your predicted largest eigenvalue",
    params: [
      { k: "N", label: "Assets N", min: 20, max: 150, step: 10, value: 100 },
      { k: "T", label: "Periods T", min: 50, max: 1500, step: 50, value: 400 },
      { k: "k", label: "True factors k", min: 0, max: 4, step: 1, value: 0 },
      { k: "beta", label: "Factor strength (loading sd)", min: 0.1, max: 1, step: 0.05, value: 0.4 }
    ],
    run(p) {
      const r = rng(4242 + p.N * 3 + p.T + p.k * 101), N = p.N, T = p.T;
      const L = Array.from({ length: N }, () => Array.from({ length: p.k }, () => gauss(r) * p.beta));
      const X = Array.from({ length: N }, () => new Float64Array(T));
      for (let t = 0; t < T; t++) { const f = Array.from({ length: p.k }, () => gauss(r)); for (let i = 0; i < N; i++) { let v = gauss(r); for (let j = 0; j < p.k; j++) v += L[i][j] * f[j]; X[i][t] = v; } }
      X.forEach(row => { let m = 0; for (const v of row) m += v; m /= T; let s = 0; for (let t = 0; t < T; t++) { row[t] -= m; s += row[t] * row[t]; } s = Math.sqrt(s / T); for (let t = 0; t < T; t++) row[t] /= s; });
      const C = Array.from({ length: N }, () => new Float64Array(N));
      for (let i = 0; i < N; i++) for (let j = i; j < N; j++) { let s = 0; const a = X[i], b = X[j]; for (let t = 0; t < T; t++) s += a[t] * b[t]; C[i][j] = C[j][i] = s / T; }
      const ev = eigSym(C), q = N / T, lp = (1 + Math.sqrt(q)) ** 2, lm = (1 - Math.sqrt(q)) ** 2;
      const top = ev[ev.length - 1], hiX = Math.max(lp * 1.4, Math.min(top * 1.05, lp * 4));
      const { h, w } = hist(ev, 40, 0, hiX);
      const dens = x => (x <= lm || x >= lp) ? 0 : Math.sqrt((lp - x) * (x - lm)) / (2 * Math.PI * q * x);
      const scale = N * w, curve = Array.from({ length: 200 }, (_, i) => { const x = lm + (lp - lm) * i / 199; return [x, dens(x) * scale]; });
      const ymax = Math.max(...h, ...curve.map(c => c[1])) * 1.1;
      const ax = axes(0, hiX, 0, ymax, "Eigenvalue", "Count");
      const bars = h.map((c, i) => `<rect x="${ax.X(i * w) + 0.5}" y="${ax.Y(c)}" width="${Math.max(1, ax.X((i + 1) * w) - ax.X(i * w) - 1)}" height="${ax.Y(0) - ax.Y(c)}" class="b2"/>`).join("");
      const path = curve.map((c, i) => (i ? "L" : "M") + ax.X(c[0]).toFixed(1) + " " + ax.Y(c[1]).toFixed(1)).join(" ");
      const outside = ev.filter(v => v > lp).length;
      return {
        actual: top,
        chart: svg(ax.g + bars + `<path d="${path}" class="curve"/><line x1="${ax.X(lp)}" x2="${ax.X(lp)}" y1="${P.t}" y2="${H - P.b}" class="ref"/><text x="${ax.X(lp) + 4}" y="${P.t + 12}" class="vl">λ₊ = ${lp.toFixed(2)}</text>` + (top > hiX ? `<text x="${W - P.r}" y="${P.t + 28}" class="vl" text-anchor="end">largest = ${top.toFixed(2)} (off chart)</text>` : ""), "Eigenvalue histogram versus Marchenko–Pastur density"),
        detail: `Largest eigenvalue ${top.toFixed(3)}; Marchenko–Pastur upper edge λ₊ = (1+√(N/T))² = ${lp.toFixed(3)} with q = N/T = ${q.toFixed(2)}. Eigenvalues above λ₊: ${outside} (true factors: ${p.k}). Everything inside the curve is indistinguishable from noise — the basis of eigenvalue clipping / denoising.`
      };
    }
  });
})();
