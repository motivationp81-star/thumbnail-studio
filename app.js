// Thumbnail Studio
// The stage works in an 800x450 coordinate space and the PNG export
// renders the same state at 1280x720 (a scale of 1.6).

const STAGE_W = 800;
const STAGE_H = 450;
const SCALE = 1280 / STAGE_W;

const stage = document.getElementById("stage");
const layersEl = document.getElementById("layers");
const selectedPanel = document.getElementById("selectedPanel");
const statusEl = document.getElementById("status");

let nextId = 1;
function makeId() { return "el" + nextId++; }

const state = {
  bg: { mode: "gradient", dir: "diag", c1: "#191970", c2: "#ff5a26", image: null },
  elements: [],
  selectedId: null,
};

function textEl(text, x, y, fontSize, extra) {
  return Object.assign({
    id: makeId(), type: "text", text, x, y,
    w: 520, h: Math.round(fontSize * 1.3),
    fontSize, color: "#ffffff", strokeColor: "#000000", stroke: 3,
    bold: true, opacity: 1, rotate: 0,
  }, extra || {});
}
function shapeEl(type, x, y, w, h, fill) {
  return { id: makeId(), type, x, y, w, h, fill, opacity: 1, rotate: 0 };
}

function loadTemplate(name) {
  state.elements = [];
  state.selectedId = null;
  if (name === "gaming") {
    state.bg = { mode: "gradient", dir: "diag", c1: "#050914", c2: "#123f9e", image: null };
    state.elements = [
      shapeEl("rect", 52, 286, 330, 74, "#ffcf00"),
      textEl("EPIC WIN!", 58, 66, 82, { w: 650 }),
      textEl("You won't believe this comeback", 58, 168, 34, { bold: false, stroke: 2 }),
      textEl("WATCH NOW", 76, 292, 38, { color: "#111111", stroke: 0 }),
    ];
  } else if (name === "vlog") {
    state.bg = { mode: "gradient", dir: "side", c1: "#fceabb", c2: "#f8b500", image: null };
    state.elements = [
      textEl("A DAY IN MY LIFE", 46, 54, 58, { color: "#1d1d24", strokeColor: "#ffffff", w: 620 }),
      textEl("jaipur trip | part 2", 50, 142, 30, { color: "#33333d", stroke: 0, bold: false }),
      shapeEl("circle", 612, 252, 128, 128, "#ff5a7a"),
    ];
  } else {
    state.bg = { mode: "gradient", dir: "diag", c1: "#191970", c2: "#ff5a26", image: null };
    state.elements = [
      shapeEl("rect", 56, 300, 292, 66, "#e50914"),
      textEl("NEW SONG", 54, 58, 84, { w: 640 }),
      textEl("Official Music Video 2026", 58, 164, 34, { bold: false, stroke: 2 }),
      textEl("OUT NOW", 82, 306, 36, { stroke: 0 }),
    ];
  }
  syncBgInputs();
  render();
}

// ---------- background ----------

function bgCss() {
  const b = state.bg;
  if (b.mode === "solid") return b.c1;
  const dirs = { diag: "135deg", side: "90deg", down: "180deg" };
  return "linear-gradient(" + dirs[b.dir] + ", " + b.c1 + ", " + b.c2 + ")";
}

function syncBgInputs() {
  document.getElementById("bgMode").value = state.bg.mode;
  document.getElementById("bgDir").value = state.bg.dir;
  document.getElementById("bgColor1").value = state.bg.c1;
  document.getElementById("bgColor2").value = state.bg.c2;
}

for (const id of ["bgMode", "bgDir", "bgColor1", "bgColor2"]) {
  document.getElementById(id).addEventListener("input", (e) => {
    const key = { bgMode: "mode", bgDir: "dir", bgColor1: "c1", bgColor2: "c2" }[id];
    state.bg[key] = e.target.value;
    paintStage();
  });
}

document.getElementById("bgImageInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { state.bg.image = reader.result; paintStage(); };
  reader.readAsDataURL(file);
});
document.getElementById("removeBgImage").addEventListener("click", () => {
  state.bg.image = null;
  paintStage();
});

// ---------- rendering ----------

function paintStage() {
  if (state.bg.image) {
    stage.style.background = "";
    stage.style.backgroundImage = "url(" + state.bg.image + ")";
    stage.style.backgroundSize = "cover";
    stage.style.backgroundPosition = "center";
  } else {
    stage.style.backgroundImage = "";
    stage.style.background = bgCss();
  }
}

function render() {
  paintStage();
  stage.querySelectorAll(".el").forEach((n) => n.remove());
  const scale = stage.clientWidth / STAGE_W || 1;

  for (const el of state.elements) {
    const node = document.createElement("div");
    node.className = "el" + (el.id === state.selectedId ? " selected" : "");
    node.dataset.id = el.id;
    node.style.left = (el.x / STAGE_W * 100) + "%";
    node.style.top = (el.y / STAGE_H * 100) + "%";
    node.style.width = (el.w / STAGE_W * 100) + "%";
    node.style.height = (el.h / STAGE_H * 100) + "%";
    node.style.opacity = el.opacity;
    node.style.transform = "rotate(" + el.rotate + "deg)";
    node.style.zIndex = state.elements.indexOf(el) + 1;

    if (el.type === "text") {
      node.textContent = el.text;
      node.style.fontSize = (el.fontSize * scale) + "px";
      node.style.fontWeight = el.bold ? "800" : "400";
      node.style.color = el.color;
      node.style.lineHeight = "1.15";
      if (el.stroke > 0) node.style.webkitTextStroke = (el.stroke * scale) + "px " + el.strokeColor;
    } else if (el.type === "rect") {
      node.style.background = el.fill;
      node.style.borderRadius = "14px";
    } else if (el.type === "circle") {
      node.style.background = el.fill;
      node.style.borderRadius = "50%";
    } else if (el.type === "image") {
      node.style.backgroundImage = "url(" + el.src + ")";
      node.style.backgroundSize = "cover";
      node.style.backgroundPosition = "center";
      node.style.borderRadius = "8px";
    }
    stage.appendChild(node);
  }
  renderLayers();
  renderSelected();
}

function itemName(el) {
  if (el.type === "text") return "Text: " + (el.text.length > 22 ? el.text.slice(0, 22) + "…" : el.text);
  return el.type[0].toUpperCase() + el.type.slice(1);
}

function renderLayers() {
  layersEl.innerHTML = "";
  [...state.elements].reverse().forEach((el) => {
    const b = document.createElement("button");
    b.className = "layer" + (el.id === state.selectedId ? " active" : "");
    b.textContent = itemName(el);
    b.addEventListener("click", () => { state.selectedId = el.id; render(); });
    layersEl.appendChild(b);
  });
}

function selected() {
  return state.elements.find((e) => e.id === state.selectedId) || null;
}

// ---------- selection panel ----------

const fields = {};
for (const id of ["elText", "elFontSize", "elColor", "elStrokeColor", "elStroke", "elBold",
                  "elW", "elH", "elFill", "elOpacity", "elRotate"]) {
  fields[id] = document.getElementById(id);
}

function renderSelected() {
  const el = selected();
  selectedPanel.hidden = !el;
  if (!el) return;
  document.getElementById("textControls").style.display = el.type === "text" ? "" : "none";
  document.getElementById("fillRow").style.display = (el.type === "rect" || el.type === "circle") ? "" : "none";
  document.getElementById("elH").parentElement.style.display = el.type === "text" ? "none" : "";
  if (el.type === "text") {
    fields.elText.value = el.text;
    fields.elFontSize.value = el.fontSize;
    fields.elColor.value = el.color;
    fields.elStrokeColor.value = el.strokeColor;
    fields.elStroke.value = el.stroke;
    fields.elBold.checked = el.bold;
  }
  fields.elW.value = el.w;
  fields.elH.value = el.h;
  if (el.fill) fields.elFill.value = el.fill;
  fields.elOpacity.value = el.opacity;
  fields.elRotate.value = el.rotate;
}

function bindField(id, fn) {
  fields[id].addEventListener("input", (e) => {
    const el = selected();
    if (el) { fn(el, e.target); render(); }
  });
}
bindField("elText", (el, t) => { el.text = t.value; });
bindField("elFontSize", (el, t) => { el.fontSize = +t.value; el.h = Math.round(el.fontSize * 1.3); });
bindField("elColor", (el, t) => { el.color = t.value; });
bindField("elStrokeColor", (el, t) => { el.strokeColor = t.value; });
bindField("elStroke", (el, t) => { el.stroke = +t.value; });
bindField("elBold", (el, t) => { el.bold = t.checked; });
bindField("elW", (el, t) => { el.w = +t.value; });
bindField("elH", (el, t) => { el.h = +t.value; });
bindField("elFill", (el, t) => { el.fill = t.value; });
bindField("elOpacity", (el, t) => { el.opacity = +t.value; });
bindField("elRotate", (el, t) => { el.rotate = +t.value; });

document.getElementById("delBtn").addEventListener("click", () => {
  state.elements = state.elements.filter((e) => e.id !== state.selectedId);
  state.selectedId = null;
  render();
});
document.getElementById("dupBtn").addEventListener("click", () => {
  const el = selected();
  if (!el) return;
  const copy = Object.assign({}, el, { id: makeId(), x: el.x + 18, y: el.y + 18 });
  state.elements.push(copy);
  state.selectedId = copy.id;
  render();
});
document.getElementById("frontBtn").addEventListener("click", () => moveLayer(1));
document.getElementById("backBtn").addEventListener("click", () => moveLayer(-1));
function moveLayer(dir) {
  const i = state.elements.findIndex((e) => e.id === state.selectedId);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= state.elements.length) return;
  const tmp = state.elements[i];
  state.elements[i] = state.elements[j];
  state.elements[j] = tmp;
  render();
}

// ---------- adding items ----------

document.getElementById("addText").addEventListener("click", () => {
  const el = textEl("New text", 140, 180, 52);
  state.elements.push(el);
  state.selectedId = el.id;
  render();
});
document.getElementById("addRect").addEventListener("click", () => {
  const el = shapeEl("rect", 120, 160, 260, 110, "#e50914");
  state.elements.push(el);
  state.selectedId = el.id;
  render();
});
document.getElementById("addCircle").addEventListener("click", () => {
  const el = shapeEl("circle", 300, 140, 140, 140, "#ffcf00");
  state.elements.push(el);
  state.selectedId = el.id;
  render();
});
document.getElementById("addImageInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const el = { id: makeId(), type: "image", src: reader.result, x: 240, y: 110, w: 320, h: 200, opacity: 1, rotate: 0 };
    state.elements.push(el);
    state.selectedId = el.id;
    render();
  };
  reader.readAsDataURL(file);
});

for (const btn of document.querySelectorAll("[data-template]")) {
  btn.addEventListener("click", () => loadTemplate(btn.dataset.template));
}

// ---------- dragging ----------

let drag = null;
stage.addEventListener("pointerdown", (e) => {
  const node = e.target.closest(".el");
  if (!node) { state.selectedId = null; render(); return; }
  const el = state.elements.find((x) => x.id === node.dataset.id);
  if (!el) return;
  state.selectedId = el.id;
  const rect = stage.getBoundingClientRect();
  const px = (e.clientX - rect.left) * (STAGE_W / rect.width);
  const py = (e.clientY - rect.top) * (STAGE_H / rect.height);
  drag = { id: el.id, dx: px - el.x, dy: py - el.y };
  stage.setPointerCapture(e.pointerId);
  render();
});
stage.addEventListener("pointermove", (e) => {
  if (!drag) return;
  const el = state.elements.find((x) => x.id === drag.id);
  if (!el) return;
  const rect = stage.getBoundingClientRect();
  const px = (e.clientX - rect.left) * (STAGE_W / rect.width);
  const py = (e.clientY - rect.top) * (STAGE_H / rect.height);
  el.x = Math.round(Math.min(Math.max(px - drag.dx, -el.w + 40), STAGE_W - 40));
  el.y = Math.round(Math.min(Math.max(py - drag.dy, -el.h + 30), STAGE_H - 30));
  render();
});
stage.addEventListener("pointerup", () => { drag = null; });
stage.addEventListener("pointercancel", () => { drag = null; });

// re-render on resize so text scales with the stage
new ResizeObserver(() => render()).observe(stage);

// ---------- export ----------

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawCover(ctx, img, x, y, w, h) {
  const ir = img.naturalWidth / img.naturalHeight;
  const r = w / h;
  let sw, sh, sx, sy;
  if (ir > r) { sh = img.naturalHeight; sw = sh * r; sx = (img.naturalWidth - sw) / 2; sy = 0; }
  else { sw = img.naturalWidth; sh = sw / r; sx = 0; sy = (img.naturalHeight - sh) / 2; }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

document.getElementById("exportBtn").addEventListener("click", async () => {
  statusEl.textContent = "Making your PNG...";
  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext("2d");
  const b = state.bg;

  if (b.image) {
    const img = await loadImage(b.image);
    drawCover(ctx, img, 0, 0, 1280, 720);
  } else if (b.mode === "solid") {
    ctx.fillStyle = b.c1;
    ctx.fillRect(0, 0, 1280, 720);
  } else {
    const pts = { diag: [0, 0, 1280, 720], side: [0, 0, 1280, 0], down: [0, 0, 0, 720] }[b.dir];
    const g = ctx.createLinearGradient(pts[0], pts[1], pts[2], pts[3]);
    g.addColorStop(0, b.c1);
    g.addColorStop(1, b.c2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1280, 720);
  }

  for (const el of state.elements) {
    ctx.save();
    ctx.globalAlpha = el.opacity;
    const cx = (el.x + el.w / 2) * SCALE;
    const cy = (el.y + el.h / 2) * SCALE;
    ctx.translate(cx, cy);
    ctx.rotate((el.rotate * Math.PI) / 180);
    const w = el.w * SCALE, h = el.h * SCALE;

    if (el.type === "text") {
      ctx.font = (el.bold ? "800 " : "400 ") + el.fontSize * SCALE + "px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineJoin = "round";
      if (el.stroke > 0) {
        ctx.strokeStyle = el.strokeColor;
        ctx.lineWidth = el.stroke * SCALE * 2;
        ctx.strokeText(el.text, 0, 0);
      }
      ctx.fillStyle = el.color;
      ctx.fillText(el.text, 0, 0);
    } else if (el.type === "rect") {
      ctx.fillStyle = el.fill;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 14 * SCALE);
      ctx.fill();
    } else if (el.type === "circle") {
      ctx.fillStyle = el.fill;
      ctx.beginPath();
      ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (el.type === "image") {
      const img = await loadImage(el.src);
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 8 * SCALE);
      ctx.clip();
      // draw the image cover-fit into the box, in local coords
      const ir = img.naturalWidth / img.naturalHeight;
      const r = w / h;
      let dw, dh;
      if (ir > r) { dh = h; dw = h * ir; } else { dw = w; dh = w / ir; }
      ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
      ctx.restore();
    }
    ctx.restore();
  }

  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "thumbnail-1280x720.png";
    a.click();
    statusEl.textContent = "Done — thumbnail-1280x720.png saved.";
  }, "image/png");
});

// ---------- start ----------

loadTemplate("music");
