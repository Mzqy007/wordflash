/* algo.js —— 纯函数层：不碰 DOM、不碰存储，只做计算。
   供 app.js 调用；也被单文件构建内联。 */
(function (g) {
  "use strict";
  function num(v, d) { var n = Number(v); return isFinite(n) ? n : (d || 0); }
  function clamp(v, a, b) { v = num(v, a); return v < a ? a : v > b ? b : v; }

  /* 间隔天数 = 艾宾浩斯基础间隔 × 等级倍率，且不超过上限 */
  function intervalDays(ebb, mult, stage, level, maxInterval) {
    ebb = ebb || [1, 2, 4, 7, 15, 30];
    mult = mult || [1, 2, 3, 4, 5, 10];
    var s = clamp(stage, 0, ebb.length - 1);
    var l = clamp(level, 0, mult.length - 1);
    var d = Math.round(num(ebb[s], 1) * num(mult[l], 1));
    if (!isFinite(d) || d < 1) d = 1;
    var cap = num(maxInterval, 365);
    return cap > 0 ? Math.min(d, cap) : d;
  }

  /* 由今天 + 天数 得到 YYYY-MM-DD（纯日期字符串运算，不用本地时区技巧） */
  function addDays(dateStr, days) {
    var p = String(dateStr || "").split("-");
    var y = +p[0], m = +p[1], d = +p[2];
    if (!y || !m || !d) return dateStr;
    var t = Date.UTC(y, m - 1, d) + Math.round(num(days, 0)) * 86400000;
    var dt = new Date(t);
    var mm = dt.getUTCMonth() + 1, dd = dt.getUTCDate();
    return dt.getUTCFullYear() + "-" + (mm < 10 ? "0" : "") + mm + "-" + (dd < 10 ? "0" : "") + dd;
  }

  function dayDiff(fromStr, toStr) {
    var a = String(fromStr || "").split("-"), b = String(toStr || "").split("-");
    if (a.length < 3 || b.length < 3) return 0;
    var t1 = Date.UTC(+a[0], +a[1] - 1, +a[2]);
    var t2 = Date.UTC(+b[0], +b[1] - 1, +b[2]);
    return Math.round((t2 - t1) / 86400000);
  }

  /* 倒计时：elapsed/limit → 剩余百分比（0..100，越大越安全） */
  function countdownPct(elapsed, limit) {
    var lim = num(limit, 0);
    if (lim <= 0) return 100;
    var used = clamp(elapsed, 0, lim);
    return Math.max(0, Math.min(100, Math.round((1 - used / lim) * 100)));
  }

  g.ALGO = {
    intervalDays: intervalDays,
    addDays: addDays,
    dayDiff: dayDiff,
    countdownPct: countdownPct
  };
})(typeof window !== "undefined" ? window : globalThis);
