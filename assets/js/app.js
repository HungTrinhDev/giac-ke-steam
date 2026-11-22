/* Giác kế STEM – mô phỏng, thử thách, trắc nghiệm. Không dùng thư viện. */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const NS = "http://www.w3.org/2000/svg";
  const rad = (x) => (x * Math.PI) / 180;
  const vn = (x, k = 2) => x.toFixed(k).replace(".", ",");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const el = (tag, attrs = {}, parent, text) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  };
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* bỏ qua */ } },
  };

  /* ---------- Giao diện sáng/tối ---------- */
  const root = document.documentElement;
  const isDark = () => root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  const syncThemeColor = () => {
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", isDark() ? "#0d1522" : "#f4f7fb"));
  };
  $("themeBtn").addEventListener("click", () => {
    const next = isDark() ? "light" : "dark";
    root.dataset.theme = next;
    store.set("theme", next);
    syncThemeColor();
  });
  if (root.dataset.theme) syncThemeColor();

  /* ---------- Thanh trên, xuất hiện khi cuộn, mục đang xem ---------- */
  const topbar = document.querySelector(".topbar");
  addEventListener("scroll", () => topbar.classList.toggle("is-scrolled", scrollY > 8), { passive: true });

  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((ents) => ents.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach((r) => io.observe(r));
  } else reveals.forEach((r) => r.classList.add("in"));

  const navLinks = document.querySelectorAll(".topnav a, .tabbar a");
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver((ents) => ents.forEach((e) => {
      if (!e.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
    }), { rootMargin: "-45% 0px -50% 0px" });
    ["mo-phong", "thu-thach", "trac-nghiem", "video", "hoc-lieu"].forEach((id) => $(id) && spy.observe($(id)));
  }

  /* ---------- Cảnh mô phỏng (dựng một lần, chỉ cập nhật thuộc tính) ---------- */
  const scene = $("scene");
  const S = {};
  (function buildScene() {
    S.groundFill = el("rect", { x: 0, y: 280, width: 640, height: 60, fill: "var(--ground)", opacity: .18 }, scene);
    el("line", { x1: 0, y1: 280, x2: 640, y2: 280, stroke: "var(--ground)", "stroke-width": 3 }, scene);
    S.horiz = el("line", { stroke: "var(--muted)", "stroke-dasharray": "3 5", "stroke-width": 1.5 }, scene);
    S.sight = el("line", { stroke: "var(--accent)", "stroke-dasharray": "9 6", "stroke-width": 2.5 }, scene);
    S.arc = el("path", { fill: "none", stroke: "var(--accent)", "stroke-width": 2.5 }, scene);
    S.alpha = el("text", { fill: "var(--accent)", "font-size": 24, "font-weight": 700, "font-style": "italic", "font-family": "Times New Roman, serif" }, scene, "α");
    S.right = el("path", { fill: "none", stroke: "var(--muted)", "stroke-width": 1.5 }, scene);
    S.pole = el("line", { stroke: "var(--ink)", "stroke-width": 5, "stroke-linecap": "round" }, scene);
    S.flag = el("rect", { width: 34, height: 22, rx: 2, fill: "var(--flag)" }, scene);
    S.body = el("line", { stroke: "var(--ink)", "stroke-linecap": "round" }, scene);
    S.head = el("circle", { fill: "none", stroke: "var(--ink)", "stroke-width": 2 }, scene);
    S.dLine = el("line", { stroke: "var(--ink)", "stroke-width": 1.5 }, scene);
    S.dT1 = el("line", { stroke: "var(--ink)", "stroke-width": 1.5 }, scene);
    S.dT2 = el("line", { stroke: "var(--ink)", "stroke-width": 1.5 }, scene);
    S.dTxt = el("text", { "text-anchor": "middle", fill: "var(--ink)", "font-size": 24, "font-weight": 600 }, scene);
    S.h0Txt = el("text", { "text-anchor": "end", fill: "var(--ink)", "font-size": 22, "font-weight": 600 }, scene);
    S.hLine = el("line", { stroke: "var(--accent)", "stroke-width": 1.5 }, scene);
    S.hT1 = el("line", { stroke: "var(--accent)", "stroke-width": 1.5 }, scene);
    S.hT2 = el("line", { stroke: "var(--accent)", "stroke-width": 1.5 }, scene);
    S.hTxt = el("text", { fill: "var(--accent)", "font-size": 24, "font-weight": 700 }, scene);
  })();
  const set = (node, attrs) => { for (const k in attrs) node.setAttribute(k, attrs[k]); };

  function drawScene(d, a, h0) {
    const H = h0 + d * Math.tan(rad(a));
    const left = 130, base = 280, k = Math.min(330 / d, 228 / H);
    const px = left, poleX = left + d * k, eyeY = base - h0 * k, topY = base - H * k, hk = h0 * k;
    set(S.pole, { x1: poleX, y1: base, x2: poleX, y2: topY });
    set(S.flag, { x: poleX + 3, y: topY + 3 });
    set(S.body, { x1: px, y1: base, x2: px, y2: eyeY + Math.max(4, hk * 0.12), "stroke-width": Math.max(2, hk * 0.08) });
    set(S.head, { cx: px, cy: eyeY, r: Math.max(4, hk * 0.11) });
    set(S.horiz, { x1: px, y1: eyeY, x2: poleX, y2: eyeY });
    set(S.sight, { x1: px, y1: eyeY, x2: poleX, y2: topY });
    const r = 46;
    set(S.arc, { d: `M ${px + r} ${eyeY} A ${r} ${r} 0 0 0 ${px + r * Math.cos(rad(a))} ${eyeY - r * Math.sin(rad(a))}` });
    set(S.alpha, { x: px + r + 8, y: eyeY - 8 });
    set(S.right, { d: `M ${poleX - 11} ${eyeY} V ${eyeY - 11} H ${poleX}` });
    const dy = base + 22;
    set(S.dLine, { x1: px, y1: dy, x2: poleX, y2: dy });
    set(S.dT1, { x1: px, y1: dy - 6, x2: px, y2: dy + 6 });
    set(S.dT2, { x1: poleX, y1: dy - 6, x2: poleX, y2: dy + 6 });
    set(S.dTxt, { x: (px + poleX) / 2, y: dy + 30 }); S.dTxt.textContent = `d = ${vn(d, 1)} m`;
    set(S.h0Txt, { x: px - 12, y: (base + eyeY) / 2 + 6 }); S.h0Txt.textContent = `h₀ = ${vn(h0)} m`;
    const hx = poleX + 46;
    set(S.hLine, { x1: hx, y1: base, x2: hx, y2: topY });
    set(S.hT1, { x1: hx - 6, y1: base, x2: hx + 6, y2: base });
    set(S.hT2, { x1: hx - 6, y1: topY, x2: hx + 6, y2: topY });
    set(S.hTxt, { x: hx + 9, y: (base + topY) / 2 + 6 }); S.hTxt.textContent = `h ≈ ${vn(H)} m`;
    return H;
  }

  /* ---------- Giác kế (thước 0° bên phải, 180° bên trái; nghiêng α ⇒ θ = 90° + α) ---------- */
  function buildGK(svg) {
    const R = 100;
    const g = el("g", {}, svg);
    el("path", { d: `M ${-R} 0 A ${R} ${R} 0 0 0 ${R} 0 Z`, fill: "var(--surface)", stroke: "var(--ink)", "stroke-width": 2 }, g);
    for (let t = 0; t <= 180; t += 5) {
      const ang = rad(360 - t), c = Math.cos(ang), s = -Math.sin(ang);
      const r0 = t % 30 === 0 ? R - 14 : t % 10 === 0 ? R - 9 : R - 5;
      el("line", { x1: r0 * c, y1: r0 * s, x2: R * c, y2: R * s, stroke: "var(--ink)", "stroke-width": t % 30 === 0 ? 1.6 : 1 }, g);
      if (t % 30 === 0) el("text", { x: (R - 27) * c, y: (R - 27) * s + 4, "text-anchor": "middle", "font-size": 11, fill: "var(--ink)" }, g, t + "°");
    }
    el("rect", { x: -R - 12, y: -8, width: 2 * R + 24, height: 8, rx: 3, fill: "var(--accent)" }, g);
    el("line", { x1: 0, y1: 0, x2: 0, y2: R + 18, stroke: "var(--flag)", "stroke-width": 2 }, svg);
    el("circle", { cx: 0, cy: R + 24, r: 7, fill: "var(--flag)" }, svg);
    el("circle", { cx: 0, cy: 0, r: 3, fill: "var(--ink)" }, svg);
    el("text", { x: -40, y: -72, "text-anchor": "middle", "font-size": 13, fill: "var(--muted)" }, svg, "ống ngắm ↗");
    return (a) => g.setAttribute("transform", `rotate(${-a})`);
  }
  const rotGK = buildGK($("gk"));
  const rotGK2 = buildGK($("gk2"));

  /* ---------- Điều khiển mô phỏng ---------- */
  const inputs = { d: $("d"), a: $("a"), h0: $("h0") };
  const DEF = { d: 12, a: 35, h0: 1.5 };
  const fill = (inp) => inp.style.setProperty("--p", ((inp.value - inp.min) / (inp.max - inp.min)) * 100 + "%");
  let raf = 0;
  function update() {
    raf = 0;
    const d = +inputs.d.value, a = +inputs.a.value, h0 = +inputs.h0.value;
    Object.values(inputs).forEach(fill);
    $("dv").textContent = vn(d, 1) + " m"; $("av").textContent = a + "°"; $("h0v").textContent = vn(h0) + " m";
    const H = drawScene(d, a, h0);
    $("hv").textContent = "≈ " + vn(H) + " m";
    $("calc").textContent = `${vn(d, 1)} · tan ${a}° + ${vn(h0)} ≈ ${vn(d * Math.tan(rad(a)))} + ${vn(h0)}`;
    rotGK(a);
    $("thv").textContent = `θ = ${90 + a}°`; $("alv").textContent = `α = ${a}°`;
  }
  const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
  Object.values(inputs).forEach((i) => i.addEventListener("input", schedule));
  $("resetSim").addEventListener("click", () => { for (const k in DEF) inputs[k].value = DEF[k]; schedule(); });
  update();

  /* ---------- Thử thách ---------- */
  let C = {}, streak = +(store.get("streak") || 0);
  const streakEl = $("streak"); streakEl.textContent = streak;
  function newChallenge() {
    const d = 8 + Math.round(Math.random() * 24) / 2;
    const h0 = [1.4, 1.45, 1.5, 1.55, 1.6][Math.floor(Math.random() * 5)];
    const a = 25 + Math.floor(Math.random() * 26);
    C = { d, h0, a, H: +(h0 + d * Math.tan(rad(a))).toFixed(2) };
    $("given").innerHTML = `<span class="chip">d = ${vn(d, 1)} m</span><span class="chip">h₀ = ${vn(h0)} m</span><span class="chip">θ = ?</span>`;
    rotGK2(a);
    $("ans").value = ""; $("fb2").hidden = true; $("hint").hidden = true; $("hintBtn").setAttribute("aria-expanded", "false");
  }
  $("ansForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const inp = $("ans"), fb = $("fb2");
    const v = parseFloat((inp.value || "").replace(",", "."));
    fb.hidden = false;
    if (isNaN(v)) {
      fb.className = "fb bad"; fb.textContent = "Hãy nhập chiều cao bằng số, ví dụ 12,35.";
      inp.classList.remove("shake"); void inp.offsetWidth; inp.classList.add("shake"); return;
    }
    const ok = Math.abs(v - C.H) <= Math.max(0.05, C.H * 0.005);
    if (ok) { streak++; } else { streak = 0; inp.classList.remove("shake"); void inp.offsetWidth; inp.classList.add("shake"); }
    store.set("streak", streak); streakEl.textContent = streak;
    streakEl.classList.remove("bump"); void streakEl.offsetWidth; if (ok) streakEl.classList.add("bump");
    fb.className = "fb " + (ok ? "ok" : "bad");
    fb.textContent = ok
      ? `Chính xác! θ = ${90 + C.a}° nên α = ${C.a}°; h = ${vn(C.d, 1)} · tan ${C.a}° + ${vn(C.h0)} ≈ ${vn(C.H)} m.`
      : "Chưa đúng. Đọc lại θ, tính α = |90° − θ| rồi h = d · tan α + h₀. Nhớ cộng h₀ và để máy tính ở chế độ độ (D).";
  });
  $("hintBtn").addEventListener("click", (e) => {
    const h = $("hint"), open = h.hidden;
    h.hidden = !open; e.currentTarget.setAttribute("aria-expanded", String(open));
    h.textContent = `Dây dọi chỉ vào vạch giữa ${Math.floor((90 + C.a) / 10) * 10}° và ${Math.floor((90 + C.a) / 10) * 10 + 10}°. Mỗi vạch nhỏ là 5°.`;
  });
  $("nextBtn").addEventListener("click", newChallenge);
  newChallenge();

  /* ---------- Trắc nghiệm: từng câu một ---------- */
  const Q = [
    { t: "Cho tam giác ABC vuông tại A. Tỉ số AC/AB bằng:", o: ["sin B", "cos B", "tan B", "cot B"], c: 2, w: "Với góc B: AC là cạnh đối, AB là cạnh kề, nên AC/AB = tan B." },
    { t: "Giá trị tan 45° bằng:", o: ["0", "1", "1/2", "√3"], c: 1, w: "Tam giác vuông cân có hai cạnh góc vuông bằng nhau nên tan 45° = 1." },
    { t: "Dùng máy tính cầm tay, tan 35° ≈ (làm tròn đến hàng phần nghìn):", o: ["0,574", "0,700", "0,819", "1,428"], c: 1, w: "tan 35° ≈ 0,7002 ≈ 0,700. (0,574 là sin 35°, 0,819 là cos 35°.)" },
    { t: "Dây dọi dùng để xác định phương nào?", o: ["Nằm ngang", "Thẳng đứng", "Xiên 45°", "Bất kì"], c: 1, w: "Trọng lực có phương thẳng đứng nên dây treo vật nặng luôn thẳng đứng." },
    { t: "Trong tam giác vuông, mỗi cạnh góc vuông bằng cạnh góc vuông kia nhân với:", o: ["sin góc đối", "cos góc kề", "tan góc đối", "tan góc kề"], c: 2, w: "Đây là hệ thức dùng để tính chiều cao: BC = AB · tan α (α là góc đối diện với BC)." },
  ];
  let qi = 0, score = 0, answered = false;
  const qBody = $("qBody"), qNext = $("qNext");
  function enter() { if (reduceMotion) return; qBody.classList.remove("enter"); void qBody.offsetWidth; qBody.classList.add("enter"); }
  function head() {
    $("qCount").textContent = qi < Q.length ? `Câu ${qi + 1}/${Q.length}` : "Hoàn thành";
    $("qBar").style.width = (Math.min(qi + (answered ? 1 : 0), Q.length) / Q.length) * 100 + "%";
    $("qScore").textContent = `${score} điểm`;
  }
  function renderQ() {
    answered = false; head();
    const q = Q[qi];
    qBody.innerHTML = `<p class="q-text" id="qt">${q.t}</p><div class="opts" role="group" aria-labelledby="qt">${
      q.o.map((t, j) => `<button class="opt" type="button" data-j="${j}"><span class="key">${"ABCD"[j]}</span><span>${t}</span></button>`).join("")
    }</div>`;
    qNext.disabled = true; qNext.textContent = qi === Q.length - 1 ? "Xem kết quả" : "Câu tiếp theo"; qNext.hidden = false;
    enter();
  }
  qBody.addEventListener("click", (e) => {
    const b = e.target.closest(".opt");
    if (!b || answered) return;
    answered = true;
    const j = +b.dataset.j, q = Q[qi], ok = j === q.c;
    if (ok) score++;
    qBody.querySelectorAll(".opt").forEach((o) => {
      o.disabled = true;
      if (+o.dataset.j === q.c) o.classList.add("right");
      else if (o === b) o.classList.add("wrong");
    });
    const why = document.createElement("p");
    why.className = "why"; why.setAttribute("role", "status");
    why.textContent = (ok ? "Đúng rồi! " : "Chưa đúng. ") + q.w;
    qBody.appendChild(why);
    head(); qNext.disabled = false; qNext.focus({ preventScroll: true });
  });
  qNext.addEventListener("click", () => {
    qi++;
    if (qi < Q.length) return renderQ();
    answered = false; head(); qNext.hidden = true;
    const pct = Math.round((score / Q.length) * 100);
    const msg = score === 5 ? "Tuyệt vời! Em đã sẵn sàng cho tiết học." : score >= 3 ? "Khá tốt. Xem lại những câu sai trước tiết học nhé." : "Em nên xem lại Bài 11 và video hướng dẫn trước tiết học.";
    qBody.innerHTML = `<div class="done"><div class="ring" id="ring"><span>${score}/5</span></div><h3>${msg}</h3>
      <input class="name" id="nm" placeholder="Họ tên, lớp – VD: Nguyễn Văn A, 9A1" aria-label="Họ tên và lớp" value="${(store.get("name") || "").replace(/"/g, "&quot;")}">
      <p>Chụp màn hình kết quả có họ tên và gửi lên Padlet lớp để thầy ghi nhận.</p>
      <button class="btn btn--ghost" id="qAgain" type="button">Làm lại</button></div>`;
    enter();
    const ring = $("ring");
    requestAnimationFrame(() => requestAnimationFrame(() => ring.style.setProperty("--v", pct)));
    $("nm").addEventListener("input", (e) => store.set("name", e.target.value));
    $("qAgain").addEventListener("click", () => { qi = 0; score = 0; renderQ(); });
  });
  renderQ();

  /* ---------- Chỉ phát một video tại một thời điểm ---------- */
  const vids = document.querySelectorAll("video");
  vids.forEach((v) => v.addEventListener("play", () => vids.forEach((o) => o !== v && o.pause())));
})();
