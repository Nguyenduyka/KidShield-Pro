// ═══════════════════════════════════════════════════════════
//  KidShield Pro — iOS Renderer (full features)
// ═══════════════════════════════════════════════════════════

const SEV = SEV_IOS;
const RM = RISK_IOS;

// More menu state
let moreTabOpen = false;
const TABS = [
  { id: "home", lbl: "Tổng quan", ic: "⬡" },
  { id: "devices", lbl: "Thiết bị", ic: "📡" },
  { id: "alerts", lbl: "Cảnh báo", ic: "⚡" },
  { id: "more", lbl: "Thêm", ic: "•••" },
];
const MORE_PAGES = [
  { id: "apps", lbl: "Ứng dụng", ic: "◈", color: "#0a84ff" },
  { id: "schedule", lbl: "Lịch sử dụng", ic: "🗓️", color: "#ff9f0a" },
  { id: "ai", lbl: "AI Phân tích", ic: "✦", color: "#bf5af2" },
  { id: "rewards", lbl: "Phần thưởng", ic: "⭐", color: "#ffd60a" },
  { id: "geo", lbl: "Vị trí & Vùng", ic: "📍", color: "#64d2ff" },
  { id: "reports", lbl: "Báo cáo tuần", ic: "▣", color: "#30d158" },
  { id: "notify", lbl: "Thông báo", ic: "🔔", color: "#ff453a" },
  { id: "link", lbl: "Liên kết", ic: "🔗", color: "#5e5ce6" },
  { id: "settings", lbl: "Cài đặt", ic: "⚙", color: "#ebebf5" },
];

// ─── ROUTER ──────────────────────────────────────────────
function go(tab) {
  state.currentTab = tab;
  document.querySelectorAll(".page").forEach(p => p.classList.remove("on"));
  const pg = document.getElementById("p-" + tab);
  if (pg) pg.classList.add("on");
  document.querySelectorAll(".tab").forEach(b => b.classList.remove("on"));
  // sync tab bar — for "more" page tabs we still light the more icon
  const mainTabs = ["home", "devices", "alerts", "more"];
  if (mainTabs.includes(tab)) {
    document.querySelector(`.tab[data-tab="${tab}"]`)?.classList.add("on");
  } else {
    document.querySelector(`.tab[data-tab="more"]`)?.classList.add("on");
  }
  render();
}

function render() {
  const m = {
    home: rdHome, devices: rdDevices, alerts: rdAlerts, more: rdMore,
    apps: rdApps, schedule: rdSched, ai: rdAi, rewards: rdRewards,
    geo: rdGeo, reports: rdReports, notify: rdNotify, link: rdLink, settings: rdSettings
  };
  if (m[state.currentTab]) m[state.currentTab]();
  updateBadges();
  saveState();
}

function updateBadges() {
  const ca = criticalAlerts().length;
  const b = document.getElementById("tb-alerts");
  if (b) { b.textContent = ca || ""; b.style.display = ca ? "" : "none"; }
}

function toast(msg, type = "info") {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.style.display = "block";
  clearTimeout(el._t);
  el._t = setTimeout(() => el.style.display = "none", 2500);
}

function showAlertBanner(a) {
  toast(a.icon + " " + a.msg, "warning");
}

function showPhoneNotif(n) { /* iOS already shows toast for alerts */ }

function showSheet(html) {
  document.getElementById("sheet-content").innerHTML = html;
  document.getElementById("sheet-ov").classList.add("show");
}
function hideSheet() {
  document.getElementById("sheet-ov").classList.remove("show");
}

// ─── HOME ────────────────────────────────────────────────
function rdHome() {
  const el = document.getElementById("p-home");
  const tot = allDevices().reduce((s, d) => s + d.screenTime, 0);
  const ca = criticalAlerts().length;
  el.innerHTML = `
  <div class="appbar"><div class="appbar-title">KidShield</div><div class="appbar-right"><span onclick="go('notify')" style="cursor:pointer">🔔</span></div></div>
  <div class="headline"><h1>Tổng quan</h1><p><span class="live-dot"></span>${now()} · ${nowDate()}</p></div>
  <div class="content fade-in">
    ${ca > 0 ? `<div class="hero danger"><h2>⚠️ Chú ý</h2><p>${ca} cảnh báo cần xử lý</p><div class="small">Nhấn để xem chi tiết</div></div>` : `<div class="hero ok"><h2>✅ Mọi việc ổn</h2><p>Không có cảnh báo</p><div class="small">Hệ thống đang theo dõi</div></div>`}
    <div class="stat-grid">
      ${iosStat("📡", "rgba(10,132,255,0.18)", "#0a84ff", "Online", `${onlineDevices()}<small>/${allDevices().length}</small>`, "Thiết bị")}
      ${iosStat("⏱️", "rgba(255,159,10,0.18)", "#ff9f0a", "Màn hình", fmtTime(tot), "Hôm nay")}
      ${iosStat("🔒", "rgba(255,69,58,0.18)", "#ff453a", "App khoá", state.lockedApps.size, `+ ${state.lockedDevices.size} thiết bị`)}
      ${iosStat("🤖", "rgba(48,209,88,0.18)", "#30d158", "Theo dõi", state.autoDetect ? "BẬT" : "TẮT", state.autoDetect ? `${state.detectInterval}s/lần` : "Đã tắt", true)}
    </div>
    <div class="section-hd"><div class="section-title">Trạng thái trẻ</div><a class="section-link" onclick="go('devices')">Xem tất cả</a></div>
    <div style="padding:0 16px">${state.children.map(c => iosChildCard(c)).join("")}</div>
    <div class="section-hd"><div class="section-title">Cảnh báo gần đây</div><a class="section-link" onclick="go('alerts')">Xem tất cả</a></div>
    <div style="padding:0 16px">${state.alerts.slice(0, 3).map(a => iosAlertCard(a)).join("")}</div>
    <div class="section-hd"><div class="section-title">Hành động nhanh</div></div>
    <div style="padding:0 16px 16px;display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <button class="ios-btn b-tint" style="height:60px;flex-direction:column;gap:2px;border-radius:14px" onclick="lockAll()"><div style="font-size:20px">🔒</div><span style="font-size:12px">Khoá tất cả</span></button>
      <button class="ios-btn b-tint-green" style="height:60px;flex-direction:column;gap:2px;border-radius:14px" onclick="unlockAll()"><div style="font-size:20px">🔓</div><span style="font-size:12px">Mở tất cả</span></button>
      <button class="ios-btn b-tint-orange" style="height:60px;flex-direction:column;gap:2px;border-radius:14px" onclick="go('apps')"><div style="font-size:20px">◈</div><span style="font-size:12px">Quản app</span></button>
      <button class="ios-btn b-tint-red" style="height:60px;flex-direction:column;gap:2px;border-radius:14px" onclick="doSOS()"><div style="font-size:20px">🆘</div><span style="font-size:12px">SOS</span></button>
    </div>
  </div>`;
}

function iosStat(icon, bg, color, lbl, val, sub, smallVal) {
  return `<div class="stat-card"><div class="stat-hd"><div class="stat-icon" style="background:${bg};color:${color}">${icon}</div><div class="stat-trend">Hôm nay</div></div><div class="stat-lbl">${lbl}</div><div class="stat-val" ${smallVal ? `style="font-size:22px"` : ""}>${val}</div><div class="stat-sub">${sub}</div></div>`;
}

function iosChildCard(c) {
  const tot = c.devices.reduce((s, d) => s + d.screenTime, 0);
  const lim = c.devices.reduce((s, d) => s + d.limitMins, 0);
  const pct = Math.min(Math.round(tot / Math.max(lim, 1) * 100), 100);
  const circ = 2 * Math.PI * 22;
  const off = circ - (circ * pct / 100);
  const cur = c.devices.find(d => d.online && d.currentApp);
  return `<div class="child-card" onclick="go('devices')">
    <div class="child-card-hd">
      <div class="avatar" style="background:${c.colorIOS}22;color:${c.colorIOS}">${c.avatar}</div>
      <div style="flex:1"><div class="child-name">${c.name}</div><div class="child-sub">${c.age} tuổi · ${c.devices.length} thiết bị · ${c.moodNote}</div></div>
      <div style="font-size:24px">${c.mood}</div>
    </div>
    <div style="display:flex;align-items:center;gap:14px">
      <div class="ring"><svg width="54" height="54"><circle class="ring-bg" cx="27" cy="27" r="22"></circle><circle class="ring-fg" cx="27" cy="27" r="22" stroke="${c.colorIOS}" stroke-dasharray="${circ}" stroke-dashoffset="${off}"></circle></svg><div class="ring-val" style="color:${c.colorIOS}">${pct}%</div></div>
      <div style="flex:1">
        <div style="font-size:13px;color:var(--label3);margin-bottom:3px">${fmtTime(tot)} / ${fmtTime(lim)} hôm nay</div>
        ${cur ? `<div style="font-size:14px;color:${RM[cur.appRisk].c};font-weight:500">${cur.currentApp} • ${cur.name}</div>` : `<div style="font-size:14px;color:var(--label3)">Không hoạt động</div>`}
      </div>
    </div>
  </div>`;
}

function iosAlertCard(a) {
  const c = getChild(a.childId);
  const s = SEV[a.severity];
  return `<div class="alrt" onclick="go('alerts')" style="border-left:3px solid ${s.c}"><span class="alrt-ic">${a.icon}</span><div style="flex:1"><div class="alrt-msg">${a.msg}</div><div class="alrt-meta"><span>${a.time}</span><span>${c?.avatar} ${c?.name}</span></div></div></div>`;
}

// ─── DEVICES ────────────────────────────────────────────
function rdDevices() {
  const el = document.getElementById("p-devices");
  el.innerHTML = `<div class="appbar"><div class="appbar-title">Thiết bị</div></div>
  <div class="headline"><h1>Thiết bị</h1><p>${onlineDevices()}/${allDevices().length} đang online</p></div>
  <div class="content fade-in">
    ${state.children.map(c => `<div style="margin-bottom:18px">
      <div style="display:flex;align-items:center;gap:10px;padding:0 20px 8px">
        <div class="avatar" style="width:32px;height:32px;font-size:16px;background:${c.colorIOS}22;color:${c.colorIOS}">${c.avatar}</div>
        <div style="font-size:17px;font-weight:600">${c.name}</div>
        <div style="margin-left:auto;font-size:13px;color:var(--label3)">${fmtTime(c.devices.reduce((s, d) => s + d.screenTime, 0))}</div>
      </div>
      ${c.devices.map(d => iosDevRow(d, c)).join("")}
    </div>`).join("")}
  </div>`;
}

function iosDevRow(d, c) {
  const lk = state.lockedDevices.has(d.id);
  const pct = Math.min(Math.round(d.screenTime / Math.max(d.limitMins, 1) * 100), 100);
  const bc = pct >= 90 ? "var(--red)" : pct >= 70 ? "var(--orange)" : c.colorIOS;
  return `<div class="dev ${lk ? "lk" : ""}" onclick="showDevSheet('${d.id}')">
    <div class="dev-ic" style="background:${lk ? "rgba(255,69,58,0.12)" : c.colorIOS + "22"};color:${lk ? "var(--red)" : c.colorIOS}">${d.icon}</div>
    <div style="flex:1;min-width:0">
      <div class="dev-name">${d.name}${lk ? ` <span class="chip chip-high">🔒</span>` : ""}${d.online ? ` <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--green);box-shadow:0 0 4px var(--green)"></span>` : ""}</div>
      <div class="dev-os">${d.os} · ${d.currentApp || "Không dùng"} · ${d.battery === null ? "🔌" : d.battery + "%"}</div>
      <div class="pb" style="margin-top:6px"><div class="pbf" style="width:${pct}%;background:${bc}"></div></div>
    </div>
    <div class="ios-chev">›</div>
  </div>`;
}

function showDevSheet(id) {
  const d = getDevice(id);
  const lk = state.lockedDevices.has(d.id);
  showSheet(`
    <div class="sheet-title">${d.icon} ${d.name}</div>
    <div class="sheet-sub">${d.os} · ${d.online ? "Đang online" : "Offline"}</div>
    <div class="ios-list" style="margin:0 0 14px">
      <div class="ios-row"><div style="flex:1"><div class="ios-title">Thời gian dùng</div></div><div class="ios-value">${fmtTime(d.screenTime)} / ${fmtTime(d.limitMins)}</div></div>
      <div class="ios-row"><div style="flex:1"><div class="ios-title">App hiện tại</div></div><div class="ios-value">${d.currentApp || "Không"}</div></div>
      <div class="ios-row"><div style="flex:1"><div class="ios-title">Pin</div></div><div class="ios-value">${d.battery === null ? "🔌 Cắm điện" : d.battery + "%"}</div></div>
    </div>
    <button class="ios-btn ${lk ? "b-green" : "b-red"} b-block" onclick="tglD('${id}');hideSheet()">${lk ? "🔓 Mở khoá" : "🔒 Khoá ngay"}</button>
    <button class="ios-btn b-plain b-block" style="margin-top:6px" onclick="hideSheet()">Huỷ</button>
  `);
}
function tglD(id) { state.lockedDevices.has(id) ? state.lockedDevices.delete(id) : state.lockedDevices.add(id); const d = getDevice(id); toast(state.lockedDevices.has(id) ? `🔒 Khoá ${d.name}` : `🔓 Mở ${d.name}`); render(); }
function lockAll() { allDevices().forEach(d => state.lockedDevices.add(d.id)); toast("🔒 Đã khoá tất cả"); render(); }
function unlockAll() { state.lockedDevices.clear(); toast("🔓 Đã mở tất cả"); render(); }

// ─── ALERTS ─────────────────────────────────────────────
function rdAlerts() {
  const el = document.getElementById("p-alerts");
  const ca = criticalAlerts().length;
  const sevs = ["all", "critical", "high", "medium", "low"];
  const list = state.alertFilter === "all" ? state.alerts : state.alerts.filter(a => a.severity === state.alertFilter);
  el.innerHTML = `<div class="appbar"><div class="appbar-title">Cảnh báo</div></div>
  <div class="headline"><h1>Cảnh báo</h1><p>${state.alerts.length} tổng · ${ca} khẩn cấp</p></div>
  <div class="content fade-in">
    <div class="pill-row">${sevs.map(s => `<button class="pill ${state.alertFilter === s ? "on" : ""}" onclick="state.alertFilter='${s}';rdAlerts()">${s === "all" ? "Tất cả" : SEV[s].l}</button>`).join("")}</div>
    ${!list.length ? `<div style="text-align:center;padding:60px 0;color:var(--label3)"><div style="font-size:48px;margin-bottom:8px">✅</div><div style="font-size:17px;font-weight:600">Không có cảnh báo</div></div>` :
    list.map(a => { const c = getChild(a.childId); const s = SEV[a.severity]; return `<div class="alrt" style="border-left:3px solid ${s.c}">
      <span class="alrt-ic">${a.icon}</span>
      <div style="flex:1">
        <div class="alrt-msg">${a.msg}</div>
        <div class="alrt-meta"><span>${a.time}</span><span>${c?.avatar} ${c?.name}</span><span>📱 ${a.app}</span></div>
        <div class="alrt-actions">
          <button class="ios-btn b-red b-sm" onclick="event.stopPropagation();lkFromAlert('${a.deviceId}',${a.id})">🔒 Khoá</button>
          <button class="ios-btn b-fill b-sm" onclick="event.stopPropagation();rmAlert(${a.id})">Bỏ qua</button>
        </div>
      </div>
      <span class="chip" style="background:${s.c}22;color:${s.c};align-self:flex-start;flex-shrink:0">${s.l}</span>
    </div>`; }).join("")}
  </div>`;
}
function rmAlert(id) { state.alerts = state.alerts.filter(a => a.id !== id); render(); }
function lkFromAlert(did, aid) { tglD(did); rmAlert(aid); }

// ─── MORE MENU ──────────────────────────────────────────
function rdMore() {
  const el = document.getElementById("p-more");
  el.innerHTML = `<div class="appbar"><div class="appbar-title">Thêm</div></div>
  <div class="headline"><h1>Tất cả tính năng</h1><p>9 tính năng nâng cao</p></div>
  <div class="content fade-in">
    <div class="ios-list">
      ${MORE_PAGES.map(p => `<div class="ios-row" onclick="go('${p.id}')">
        <div class="ios-icon" style="background:${p.color}22;color:${p.color}">${p.ic}</div>
        <div style="flex:1"><div class="ios-title">${p.lbl}</div></div>
        <div class="ios-chev">›</div>
      </div>`).join("")}
    </div>
  </div>`;
}

// ─── APPS ───────────────────────────────────────────────
function rdApps() {
  const el = document.getElementById("p-apps");
  const cats = ["all", ...new Set(APPS.map(a => a.category))];
  const list = state.appFilter === "all" ? APPS : APPS.filter(a => a.category === state.appFilter);
  el.innerHTML = `<div class="appbar"><span class="appbar-back" onclick="go('more')">‹ Thêm</span><div class="appbar-title">Ứng dụng</div></div>
  <div class="headline"><h1>Ứng dụng</h1><p>${state.lockedApps.size} app đang bị khoá</p></div>
  <div class="content fade-in">
    <div class="pill-row">${cats.map(c => `<button class="pill ${state.appFilter === c ? "on" : ""}" onclick="state.appFilter='${c}';rdApps()">${c === "all" ? "Tất cả" : c}</button>`).join("")}</div>
    <div class="ios-list">${list.map(a => { const lk = state.lockedApps.has(a.id); const r = RM[a.risk]; return `<div class="ios-row" onclick="tglA(${a.id})">
      <div class="ios-icon" style="background:${a.color}22;color:${a.color};font-size:18px">${a.icon}</div>
      <div style="flex:1"><div class="ios-title">${a.name}</div><div class="ios-sub"><span class="chip chip-${a.risk}">${r.l}</span> · ${a.category}</div></div>
      <div class="sw ${lk ? "on" : ""}" style="background:${lk ? "var(--red)" : "var(--surface3)"}"><div class="knob"></div></div>
    </div>`; }).join("")}</div>
  </div>`;
}
function tglA(id) { state.lockedApps.has(id) ? state.lockedApps.delete(id) : state.lockedApps.add(id); const a = APPS.find(x => x.id === id); toast((state.lockedApps.has(id) ? "🔒 " : "🔓 ") + a.name); render(); }

// ─── SCHEDULE ───────────────────────────────────────────
function rdSched() {
  const el = document.getElementById("p-schedule");
  const c = getChild(state.scheduleChildId);
  const slots = (state.schedules[state.scheduleChildId]?.[state.scheduleDay]) || [];
  el.innerHTML = `<div class="appbar"><span class="appbar-back" onclick="go('more')">‹ Thêm</span><div class="appbar-title">Lịch sử dụng</div></div>
  <div class="headline"><h1>Lịch</h1><p>Khung giờ cho phép / chặn</p></div>
  <div class="content fade-in">
    <div class="section-hd"><div class="section-title">Chọn trẻ</div></div>
    <div class="pill-row">${state.children.map(ch => `<button class="pill ${state.scheduleChildId === ch.id ? "on" : ""}" onclick="state.scheduleChildId=${ch.id};rdSched()">${ch.avatar} ${ch.name}</button>`).join("")}</div>
    <div class="section-hd"><div class="section-title">Ngày trong tuần</div></div>
    <div class="pill-row">${DAYS.map(d => `<button class="pill ${state.scheduleDay === d ? "on" : ""}" onclick="state.scheduleDay='${d}';rdSched()">${DAY_VN[d]}</button>`).join("")}</div>
    <div class="section-hd"><div class="section-title">Khung giờ ${DAY_VN[state.scheduleDay]}</div><a class="section-link" onclick="addSlot()">+ Thêm</a></div>
    <div style="padding:0 16px">
      ${slots.length ? slots.map((s, i) => `<div class="dev" style="border-left:3px solid ${s.a ? "var(--green)" : "var(--red)"}">
        <span style="font-size:22px">${s.a ? "✅" : "🚫"}</span>
        <div style="flex:1"><div class="dev-name">${s.s} – ${s.e}</div><div class="dev-os">${s.a ? "Cho phép sử dụng" : "Chặn không cho dùng"}</div></div>
        <button class="ios-btn b-tint-red b-sm" onclick="rmSlot(${i})">Xoá</button>
      </div>`).join("") : `<div style="text-align:center;padding:30px;color:var(--label3)">Chưa có lịch</div>`}
    </div>
  </div>`;
}
function addSlot() {
  if (!state.schedules[state.scheduleChildId]) state.schedules[state.scheduleChildId] = {};
  if (!state.schedules[state.scheduleChildId][state.scheduleDay]) state.schedules[state.scheduleChildId][state.scheduleDay] = [];
  state.schedules[state.scheduleChildId][state.scheduleDay].push({ s: "15:00", e: "17:00", a: true });
  toast("✅ Đã thêm khung giờ");
  rdSched();
}
function rmSlot(i) { state.schedules[state.scheduleChildId][state.scheduleDay].splice(i, 1); rdSched(); }

// ─── AI ─────────────────────────────────────────────────
function rdAi() {
  const el = document.getElementById("p-ai");
  el.innerHTML = `<div class="appbar"><span class="appbar-back" onclick="go('more')">‹ Thêm</span><div class="appbar-title">AI Phân tích</div></div>
  <div class="headline"><h1>AI Phân tích</h1><p>Hỏi AI về hành vi của con</p></div>
  <div class="content fade-in" style="display:flex;flex-direction:column;padding-bottom:160px">
    <div class="pill-row">
      <button class="pill ${state.aiTab === "analysis" ? "on" : ""}" onclick="state.aiTab='analysis';rdAi()">📊 Phân tích</button>
      <button class="pill ${state.aiTab === "chat" ? "on" : ""}" onclick="state.aiTab='chat';rdAi()">💬 Hỏi AI</button>
      <button class="pill ${state.aiTab === "predict" ? "on" : ""}" onclick="state.aiTab='predict';rdAi()">🔮 Dự đoán</button>
    </div>
    ${state.aiTab === "analysis" ? iosAiAnal() : state.aiTab === "chat" ? iosAiChat() : iosAiPred()}
  </div>`;
  if (state.aiTab === "chat") setTimeout(() => { const cw = document.getElementById("ai-cwrap"); if (cw) cw.scrollTop = cw.scrollHeight; }, 50);
}
function iosAiAnal() {
  return `<div style="padding:0 16px">
    ${state.children.map(c => { const mx = Math.max(...state.weekData[c.id], 1); return `<div class="child-card" style="margin-bottom:10px">
      <div class="child-card-hd"><div class="avatar" style="background:${c.colorIOS}22;color:${c.colorIOS}">${c.avatar}</div><div style="flex:1"><div class="child-name">${c.name}</div><div class="child-sub">${fmtTime(state.weekData[c.id].reduce((a, b) => a + b, 0))} tuần này</div></div></div>
      <div style="display:flex;align-items:flex-end;gap:4px;height:60px;margin-bottom:6px">${state.weekData[c.id].map(v => `<div style="flex:1;background:${c.colorIOS};border-radius:3px 3px 0 0;height:${Math.round(v / mx * 100)}%;min-height:2px"></div>`).join("")}</div>
      <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--label3)">${DAYS.map(d => `<span>${DAY_VN[d]}</span>`).join("")}</div>
    </div>`; }).join("")}
  </div>`;
}
function iosAiChat() {
  return `<div style="display:flex;flex-direction:column;flex:1;padding:0 12px" id="ai-cwrap">
    ${state.aiChat.map(m => `<div class="aib ${m.r === "ai" ? "bot" : "user"}">${m.m}</div>`).join("")}
  </div>
  <div style="position:fixed;bottom:90px;left:0;right:0;padding:8px 16px;background:rgba(0,0,0,0.92);backdrop-filter:blur(20px);border-top:0.33px solid var(--sep);display:flex;gap:8px;max-width:430px;margin:0 auto">
    <input class="inp" id="ai-inp" placeholder="Hỏi AI..." style="flex:1" onkeydown="if(event.key==='Enter'){const v=this.value.trim();if(v){sendAI(v);this.value=''}}">
    <button class="ios-btn b-blue" onclick="const v=document.getElementById('ai-inp').value.trim();if(v){sendAI(v);document.getElementById('ai-inp').value=''}">↑</button>
  </div>`;
}
async function sendAI(msg) {
  state.aiChat.push({ r: "user", m: msg });
  state.aiChat.push({ r: "ai", m: "⏳ Đang phân tích..." });
  rdAi();
  const ctx = state.children.map(c => `${c.name}(${c.age}t):${c.devices.map(d => `${d.name}->${fmtTime(d.screenTime)}/${fmtTime(d.limitMins)}`).join(";")}`).join("|");
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 600, system: `Bạn là AI KidShield. Dữ liệu: ${ctx}. Trả lời ngắn gọn tiếng Việt.`, messages: [{ role: "user", content: msg }] })
    });
    const data = await res.json();
    state.aiChat.pop();
    state.aiChat.push({ r: "ai", m: data.content?.[0]?.text || "Không thể phân tích lúc này." });
  } catch (e) {
    state.aiChat.pop();
    state.aiChat.push({ r: "ai", m: "⚠️ Lỗi kết nối AI." });
  }
  rdAi();
}
function iosAiPred() {
  return `<div style="padding:0 16px">
  ${[
    { c: state.children[0], col: "#ff9f0a", items: ["85% khả năng vượt giới hạn TikTok", "Màn hình tăng 20% cuối tuần", "Rủi ro nội dung cao"] },
    { c: state.children[1], col: "#30d158", items: ["90% đạt mục tiêu học tuần", "Xu hướng tốt", "Nên thưởng +15 điểm"] },
    { c: state.children[2], col: "#ff453a", items: ["Gaming đêm thành thói quen", "Ảnh hưởng học 2 tuần", "Đề xuất họp gia đình"] },
  ].map(p => `<div class="child-card" style="border-left:3px solid ${p.col}">
    <div class="child-card-hd"><div class="avatar" style="background:${p.col}22">${p.c.avatar}</div><div style="flex:1"><div class="child-name">${p.c.name}</div></div></div>
    ${p.items.map(i => `<div style="display:flex;gap:8px;padding:6px 0;font-size:14px;color:var(--label2)"><span style="color:${p.col};font-weight:700">→</span>${i}</div>`).join("")}
  </div>`).join("")}</div>`;
}

// ─── REWARDS ────────────────────────────────────────────
function rdRewards() {
  const el = document.getElementById("p-rewards");
  el.innerHTML = `<div class="appbar"><span class="appbar-back" onclick="go('more')">‹ Thêm</span><div class="appbar-title">Phần thưởng</div></div>
  <div class="headline"><h1>Phần thưởng</h1><p>Khuyến khích hành vi tốt</p></div>
  <div class="content fade-in">
    <div class="section-hd"><div class="section-title">Điểm tích luỹ</div></div>
    <div style="padding:0 16px">${state.children.map(c => { const pts = state.rewardPoints[c.id] || 0; return `<div class="child-card">
      <div class="child-card-hd">
        <div class="avatar" style="background:${c.colorIOS}22;color:${c.colorIOS}">${c.avatar}</div>
        <div style="flex:1"><div class="child-name">${c.name}</div><div class="child-sub">⭐ ${pts} điểm</div></div>
        <button class="ios-btn b-tint-green b-sm" onclick="addPts(${c.id},10)">+10</button>
      </div>
      <div style="display:flex;gap:2px">${Array.from({ length: 10 }, (_, i) => `<span style="font-size:18px;opacity:${i < Math.floor(pts / 30) ? 1 : .18}">⭐</span>`).join("")}</div>
    </div>`; }).join("")}</div>
    <div class="section-hd"><div class="section-title">Đổi thưởng</div></div>
    <div class="ios-list">${state.rewards.map(r => `<div class="ios-row">
      <div class="ios-icon" style="background:rgba(255,214,10,0.18);color:#ffd60a;font-size:18px">${r.icon}</div>
      <div style="flex:1"><div class="ios-title">${r.name}</div><div class="ios-sub">⭐ ${r.cost} điểm</div></div>
      <button class="ios-btn b-tint b-sm" onclick="redeemSheet('${r.id}')">Đổi</button>
    </div>`).join("")}</div>
    <div class="section-hd"><div class="section-title">Huy hiệu</div></div>
    <div style="padding:0 16px">${state.children.map(c => `<div class="child-card">
      <div style="font-size:14px;font-weight:600;margin-bottom:10px;color:${c.colorIOS}">${c.avatar} ${c.name}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">${(state.achievements[c.id] || []).map(a => `<div style="text-align:center;opacity:${a.e ? 1 : .25}"><div style="width:48px;height:48px;border-radius:14px;background:${a.e ? "rgba(255,214,10,0.18)" : "var(--surface2)"};display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:3px">${a.i}</div><div style="font-size:9px;width:56px;color:var(--label3)">${a.n}</div></div>`).join("")}</div>
    </div>`).join("")}</div>
  </div>`;
}
function addPts(id, n) { state.rewardPoints[id] = Math.max(0, (state.rewardPoints[id] || 0) + n); toast(`${n > 0 ? "✅ +" : "❌ -"}${Math.abs(n)} điểm`); rdRewards(); }
function redeemSheet(rid) {
  const r = state.rewards.find(x => x.id === rid);
  showSheet(`<div class="sheet-title">Đổi ${r.icon} ${r.name}</div><div class="sheet-sub">${r.cost} ⭐ — Chọn trẻ:</div>
  <div class="ios-list">${state.children.map(c => `<div class="ios-row" onclick="redeem('${rid}',${c.id});hideSheet()">
    <div class="ios-icon" style="background:${c.colorIOS}22;color:${c.colorIOS}">${c.avatar}</div>
    <div style="flex:1"><div class="ios-title">${c.name}</div><div class="ios-sub">${state.rewardPoints[c.id] || 0} ⭐</div></div>
    <div class="ios-chev" style="color:${(state.rewardPoints[c.id] || 0) < r.cost ? "var(--red)" : "var(--green)"}">${(state.rewardPoints[c.id] || 0) < r.cost ? "Thiếu" : "Đổi"}</div>
  </div>`).join("")}</div>`);
}
function redeem(rid, cid) { const r = state.rewards.find(x => x.id === rid); if ((state.rewardPoints[cid] || 0) < r.cost) { toast("❌ Không đủ điểm"); return; } state.rewardPoints[cid] -= r.cost; toast(`🎁 Đổi ${r.name} thành công!`); rdRewards(); }

// ─── GEO ────────────────────────────────────────────────
function rdGeo() {
  const el = document.getElementById("p-geo");
  el.innerHTML = `<div class="appbar"><span class="appbar-back" onclick="go('more')">‹ Thêm</span><div class="appbar-title">Vị trí & Vùng</div></div>
  <div class="headline"><h1>Vị trí</h1><p>Theo dõi GPS · Geofencing</p></div>
  <div class="content fade-in">
    <div style="margin:0 16px 14px;background:var(--surface);border-radius:18px;padding:18px">
      <div style="position:relative;height:200px;background:rgba(100,210,255,0.04);border-radius:14px;overflow:hidden">
        <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(100,210,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(100,210,255,0.05) 1px,transparent 1px);background-size:20px 20px"></div>
        ${state.geofences.filter(g => g.enabled).map(g => `<div style="position:absolute;width:${g.r * 2}px;height:${g.r * 2}px;left:${g.x}%;top:${g.y}%;transform:translate(-50%,-50%);border-radius:50%;background:${g.color}15;border:1.5px solid ${g.color}50"></div>`).join("")}
        ${state.geofences.filter(g => g.enabled).map(g => `<div style="position:absolute;left:${g.x}%;top:${g.y}%;transform:translate(-50%,-50%);font-size:20px">${g.icon}</div>`).join("")}
        ${state.children.map(c => { const l = state.locations[c.id]; return `<div style="position:absolute;left:${l.x}%;top:${l.y}%;transform:translate(-50%,-50%);font-size:20px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.6))" title="${c.name}">${c.avatar}</div>`; }).join("")}
      </div>
    </div>
    <div class="section-hd"><div class="section-title">Vị trí trẻ</div></div>
    <div class="ios-list">${state.children.map(c => { const l = state.locations[c.id]; return `<div class="ios-row"><div class="ios-icon" style="background:${c.colorIOS}22;color:${c.colorIOS}">${c.avatar}</div>
      <div style="flex:1"><div class="ios-title">${c.name}</div><div class="ios-sub" style="color:${l.ok ? "var(--green)" : "var(--red)"}">${l.ok ? "📍" : "⚠️"} ${l.zone}</div></div>
      <div class="ios-value" style="font-size:14px">${l.time}</div>
    </div>`; }).join("")}</div>
    <div class="section-hd"><div class="section-title">Vùng an toàn</div></div>
    <div class="ios-list">${state.geofences.map(g => `<div class="ios-row"><div class="ios-icon" style="background:${g.color}22;color:${g.color}">${g.icon}</div>
      <div style="flex:1"><div class="ios-title">${g.name}</div><div class="ios-sub">Bán kính ~${g.r * 10}m</div></div>
      <div class="sw ${g.enabled ? "on" : ""}" onclick="g.enabled=!g.enabled;rdGeo()"><div class="knob"></div></div>
    </div>`).join("")}</div>
  </div>`;
}

// ─── REPORTS ────────────────────────────────────────────
function rdReports() {
  const el = document.getElementById("p-reports");
  const tot = allDevices().reduce((s, d) => s + d.screenTime, 0);
  el.innerHTML = `<div class="appbar"><span class="appbar-back" onclick="go('more')">‹ Thêm</span><div class="appbar-title">Báo cáo</div></div>
  <div class="headline"><h1>Báo cáo tuần</h1><p>Tổng kết & xu hướng</p></div>
  <div class="content fade-in">
    <div class="stat-grid">
      ${iosStat("⏱️", "rgba(255,159,10,0.18)", "#ff9f0a", "Tuần này", fmtTime(tot * 7), "Tổng")}
      ${iosStat("🔔", "rgba(255,69,58,0.18)", "#ff453a", "Cảnh báo", "23", "5 khẩn")}
      ${iosStat("⭐", "rgba(48,209,88,0.18)", "#30d158", "Điểm", "320", "+85")}
      ${iosStat("📈", "rgba(10,132,255,0.18)", "#0a84ff", "Trung bình", fmtTime(Math.round(tot / 3)), "Mỗi trẻ")}
    </div>
    <div class="section-hd"><div class="section-title">App dùng nhiều nhất</div></div>
    <div class="ios-list">${[{ a: "TikTok", i: "🎵", c: "#ff0050", t: "15h 20p", p: 90 }, { a: "PUBG", i: "🎮", c: "#f7b731", t: "12h 45p", p: 76 }, { a: "YouTube", i: "▶️", c: "#ff0000", t: "8h 10p", p: 49 }].map(a => `<div class="ios-row">
      <div class="ios-icon" style="background:${a.c}22;color:${a.c};font-size:18px">${a.i}</div>
      <div style="flex:1"><div class="ios-title">${a.a}</div><div class="pb" style="margin-top:6px"><div class="pbf" style="width:${a.p}%;background:${a.c}"></div></div></div>
      <div class="ios-value" style="font-size:14px">${a.t}</div>
    </div>`).join("")}</div>
    <div class="section-hd"><div class="section-title">So sánh tuần trước</div></div>
    <div class="ios-list">${state.children.map((c, i) => { const ch = [-20, +15, +45][i]; return `<div class="ios-row">
      <div class="ios-icon" style="background:${c.colorIOS}22;color:${c.colorIOS}">${c.avatar}</div>
      <div style="flex:1"><div class="ios-title">${c.name}</div><div class="ios-sub">${fmtTime(state.weekData[c.id].reduce((a, b) => a + b, 0))}</div></div>
      <div class="ios-value" style="font-weight:700;color:${ch > 0 ? "var(--red)" : "var(--green)"}">${ch > 0 ? "+" : ""}${ch}p</div>
    </div>`; }).join("")}</div>
  </div>`;
}

// ─── NOTIFY ─────────────────────────────────────────────
function rdNotify() {
  const el = document.getElementById("p-notify");
  el.innerHTML = `<div class="appbar"><span class="appbar-back" onclick="go('more')">‹ Thêm</span><div class="appbar-title">Thông báo</div></div>
  <div class="headline"><h1>Thông báo</h1><p>Gửi thật qua Google Apps Script</p></div>
  <div class="content fade-in">
    <div class="section-hd"><div class="section-title">Cấu hình</div></div>
    <div class="ios-list">
      <div class="ios-row" style="flex-direction:column;align-items:stretch;gap:8px;padding:14px 16px">
        <div style="display:flex;align-items:center;gap:10px"><span style="font-size:20px">${state.scriptStatus === "ok" ? "✅" : state.scriptStatus === "error" ? "❌" : "🔧"}</span>
          <div style="flex:1"><div class="ios-title">Apps Script URL</div><div class="ios-sub">${state.scriptStatus === "ok" ? "Đã kết nối" : "Chưa cài"}</div></div>
        </div>
        <input class="inp" value="${state.scriptUrl}" placeholder="https://script.google.com/.../exec" oninput="state.scriptUrl=this.value;state.scriptStatus='unconfigured'" style="font-size:13px">
        <button class="ios-btn b-blue b-sm" onclick="testScriptConnection()">🔍 Test kết nối</button>
      </div>
    </div>
    <div class="section-hd"><div class="section-title">Admin nhận thông báo</div><a class="section-link" onclick="addAdmin()">+ Thêm</a></div>
    <div class="ios-list">${state.admins.map(p => `<div class="ios-row">
      <div class="ios-icon" style="background:${p.enabled ? "rgba(10,132,255,0.18)" : "var(--surface2)"};color:${p.enabled ? "#0a84ff" : "var(--label3)"}">${p.avatar}</div>
      <div style="flex:1"><div class="ios-title">${p.name}</div><div class="ios-sub">${p.email || p.phone}</div></div>
      <div class="sw ${p.enabled ? "on" : ""}" onclick="p.enabled=!p.enabled;rdNotify()"><div class="knob"></div></div>
    </div>`).join("")}</div>
    <div class="section-hd"><div class="section-title">Lịch sử gửi</div></div>
    <div style="padding:0 16px">${state.phoneNotifs.length ? state.phoneNotifs.map(n => { const s = SEV[n.sev]; return `<div class="alrt" style="border-left:3px solid ${s.c}">
      <div style="flex:1"><div class="alrt-msg">${n.msg}</div><div class="alrt-meta"><span>${n.t}</span>${n.status === "sent" ? `<span style="color:var(--green)">✅ Đã gửi</span>` : n.status === "failed" ? `<span style="color:var(--red)">❌ Lỗi</span>` : ""}</div></div>
    </div>`; }).join("") : `<div style="text-align:center;padding:30px;color:var(--label3)">Chưa có</div>`}</div>
    <div style="padding:14px 16px"><button class="ios-btn b-red b-block" onclick="sendTestNotification()">📳 Gửi thử thông báo</button></div>
  </div>`;
}
function addAdmin() { const n = prompt("Tên:"); if (!n) return; const em = prompt("Email:"); state.admins.push({ id: "p" + Date.now(), name: n, phone: "", email: em || "", avatar: "👤", enabled: true, channels: { push: true, sms: false, call: false } }); toast("✅ Đã thêm"); rdNotify(); }

// ─── LINK ───────────────────────────────────────────────
function rdLink() {
  const el = document.getElementById("p-link");
  el.innerHTML = `<div class="appbar"><span class="appbar-back" onclick="go('more')">‹ Thêm</span><div class="appbar-title">Liên kết</div></div>
  <div class="headline"><h1>Liên kết</h1><p>Thêm thiết bị mới</p></div>
  <div class="content fade-in">
    <div style="padding:0 16px"><div class="child-card" style="text-align:center;padding:24px">
      <div style="font-size:64px;margin-bottom:12px">🔗</div>
      <div style="font-size:17px;font-weight:600;margin-bottom:6px">Tạo mã liên kết</div>
      <div style="font-size:13px;color:var(--label3);margin-bottom:18px">Quét mã trên thiết bị mới để kết nối</div>
      <button class="ios-btn b-blue b-block" onclick="genCode()">🔑 Tạo mã ngay</button>
    </div></div>
    <div class="section-hd"><div class="section-title">Đã liên kết (${allDevices().length})</div></div>
    ${state.children.map(c => `<div style="margin-bottom:18px">
      <div style="display:flex;align-items:center;gap:10px;padding:0 20px 8px">
        <div class="avatar" style="width:32px;height:32px;font-size:16px;background:${c.colorIOS}22;color:${c.colorIOS}">${c.avatar}</div>
        <div style="font-size:15px;font-weight:600">${c.name}</div>
      </div>
      <div class="ios-list">${c.devices.map(d => `<div class="ios-row">
        <div class="ios-icon" style="background:${c.colorIOS}22;color:${c.colorIOS}">${d.icon}</div>
        <div style="flex:1"><div class="ios-title">${d.name}</div><div class="ios-sub">${d.os}</div></div>
        <div style="display:flex;align-items:center;gap:4px"><div style="width:6px;height:6px;border-radius:50%;background:${d.online ? "var(--green)" : "var(--label4)"}"></div></div>
      </div>`).join("")}</div>
    </div>`).join("")}
  </div>`;
}
function genCode() { const c = "KS-" + Math.floor(1000 + Math.random() * 9000); toast(`🔑 Mã: ${c} (2 phút)`); }

// ─── SETTINGS ───────────────────────────────────────────
function rdSettings() {
  const el = document.getElementById("p-settings");
  el.innerHTML = `<div class="appbar"><span class="appbar-back" onclick="go('more')">‹ Thêm</span><div class="appbar-title">Cài đặt</div></div>
  <div class="headline"><h1>Cài đặt</h1><p>Tuỳ chỉnh ứng dụng</p></div>
  <div class="content fade-in">
    <div class="section-hd"><div class="section-title">CHUNG</div></div>
    <div class="ios-list">
      <div class="ios-row"><div class="ios-icon" style="background:rgba(48,209,88,0.2);color:#30d158">🤖</div><div style="flex:1"><div class="ios-title">Tự động theo dõi</div><div class="ios-sub">Quét mỗi 30 giây</div></div><div class="sw ${state.autoDetect ? "on" : ""}" onclick="toggleAutoDetect()"><div class="knob"></div></div></div>
      <div class="ios-row" onclick="toast('🔔 Cài đặt thông báo')"><div class="ios-icon" style="background:rgba(10,132,255,0.2);color:#0a84ff">🔔</div><div style="flex:1"><div class="ios-title">Thông báo</div></div><div class="ios-chev">›</div></div>
    </div>
    <div class="section-hd"><div class="section-title">QUẢN LÝ TRẺ</div></div>
    <div class="ios-list">${state.children.map(c => `<div class="ios-row">
      <div class="ios-icon" style="background:${c.colorIOS}22;color:${c.colorIOS}">${c.avatar}</div>
      <div style="flex:1"><div class="ios-title">${c.name}</div><div class="ios-sub">${c.age} tuổi · ${c.devices.length} thiết bị</div></div>
      <button class="ios-btn b-tint b-sm" onclick="editLim(${c.id})">⏱️</button>
    </div>`).join("")}</div>
    <div class="section-hd"><div class="section-title">TỪ KHOÁ CẤM</div></div>
    <div style="padding:0 16px 8px">${state.blockedKeywords.map(k => `<span class="kw">${k}<button onclick="state.blockedKeywords=state.blockedKeywords.filter(x=>x!=='${k}');saveState();rdSettings()">×</button></span>`).join("")}</div>
    <div style="padding:0 16px 14px;display:flex;gap:8px"><input class="inp" id="kw-inp" placeholder="Thêm..."  onkeydown="if(event.key==='Enter')addKW()"><button class="ios-btn b-red" onclick="addKW()">+</button></div>
    <div class="section-hd"><div class="section-title">BẢO MẬT</div></div>
    <div class="ios-list">
      <div class="ios-row"><div class="ios-icon" style="background:rgba(10,132,255,0.2);color:#0a84ff">🔐</div><div style="flex:1"><div class="ios-title">PIN bảo vệ</div><div class="ios-sub">Yêu cầu PIN khi mở</div></div><div class="sw ${state.pinEnabled ? "on" : ""}" onclick="state.pinEnabled=!state.pinEnabled;saveState();rdSettings()"><div class="knob"></div></div></div>
      <div class="ios-row" onclick="exportCfg()"><div class="ios-icon" style="background:rgba(94,92,230,0.2);color:#5e5ce6">💾</div><div style="flex:1"><div class="ios-title">Xuất cấu hình</div></div><div class="ios-chev">›</div></div>
      <div class="ios-row" onclick="if(confirm('Xoá tất cả?')){localStorage.clear();location.reload()}"><div class="ios-icon" style="background:rgba(255,69,58,0.2);color:#ff453a">🗑️</div><div style="flex:1;color:var(--red)"><div class="ios-title" style="color:var(--red)">Reset dữ liệu</div></div></div>
    </div>
    <div class="section-hd"><div class="section-title">VỀ ỨNG DỤNG</div></div>
    <div class="ios-list">
      <div class="ios-row"><div class="ios-icon" style="background:linear-gradient(135deg,#0a84ff,#bf5af2);color:#fff">🛡️</div><div style="flex:1"><div class="ios-title">KidShield Pro</div><div class="ios-sub">v3.0 · iOS Edition</div></div></div>
    </div>
    <div style="height:30px"></div>
  </div>`;
}
function addKW() { const i = document.getElementById("kw-inp"); const k = i?.value?.trim(); if (!k) return; if (!state.blockedKeywords.includes(k)) { state.blockedKeywords.push(k); saveState(); rdSettings(); toast(`🚫 ${k}`); } i.value = ""; }
function editLim(id) { const c = getChild(id); const l = prompt(`Giới hạn (phút) cho ${c.name}:`, c.devices[0]?.limitMins || 120); if (l) { c.devices.forEach(d => d.limitMins = parseInt(l) || 120); toast("✅ Cập nhật"); saveState(); } }
function exportCfg() { const d = { lockedApps: [...state.lockedApps], scriptUrl: state.scriptUrl, admins: state.admins, blockedKeywords: state.blockedKeywords, rewardPoints: state.rewardPoints }; const b = new Blob([JSON.stringify(d, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "kidshield-config.json"; a.click(); toast("📥 Đã xuất"); }

// ─── SOS ────────────────────────────────────────────────
function doSOS() {
  showSheet(`<div style="text-align:center;padding:14px 0 4px"><div style="font-size:54px;margin-bottom:8px">🆘</div></div>
    <div class="sheet-title" style="color:var(--red)">SOS Khẩn cấp</div>
    <div class="sheet-sub">Khoá tất cả thiết bị + gửi thông báo</div>
    <button class="ios-btn b-red b-block" onclick="confirmSOS()">Xác nhận SOS</button>
    <button class="ios-btn b-plain b-block" style="margin-top:6px" onclick="hideSheet()">Huỷ</button>`);
}
function confirmSOS() {
  lockAll();
  sendNotification({ id: 0, childId: 1, deviceId: "d1", app: "SOS", severity: "critical", icon: "🆘", msg: "SOS — Đã khoá tất cả!" }, true);
  hideSheet();
  toast("🆘 SOS kích hoạt!");
}

// ─── INIT ───────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadState();
  setInterval(() => {
    const e = document.getElementById("sb-time");
    if (e) e.textContent = now();
  }, 30000);
  const e0 = document.getElementById("sb-time");
  if (e0) e0.textContent = now();
  go("home");
  if (state.autoDetect) startDetection();
  setInterval(() => {
    state.children.forEach(c => c.devices.forEach(d => {
      if (d.online && d.screenTime < d.limitMins + 90) d.screenTime += 1;
      if (d.battery !== null && d.battery > 1 && Math.random() > .93) d.battery = Math.max(1, d.battery - 1);
    }));
    if (state.currentTab === "home") rdHome();
    if (state.currentTab === "devices") rdDevices();
    saveState();
  }, 15000);
});
