// ═══════════════════════════════════════════════════════════
//  KidShield Pro — Android Renderer (Material 3)
// ═══════════════════════════════════════════════════════════

const SEV = SEV_ANDROID;
const RM = RISK_ANDROID;

const MORE_PAGES = [
  { id: "apps", lbl: "Ứng dụng", ic: "◈", color: "#a8c7fa" },
  { id: "schedule", lbl: "Lịch sử dụng", ic: "🗓️", color: "#ffd166" },
  { id: "ai", lbl: "AI Phân tích", ic: "✦", color: "#d9bce0" },
  { id: "rewards", lbl: "Phần thưởng", ic: "⭐", color: "#ffd166" },
  { id: "geo", lbl: "Vị trí & Vùng", ic: "📍", color: "#7dd687" },
  { id: "reports", lbl: "Báo cáo", ic: "▣", color: "#a8c7fa" },
  { id: "notify", lbl: "Thông báo", ic: "🔔", color: "#ff7a85" },
  { id: "link", lbl: "Liên kết", ic: "🔗", color: "#bcc7dc" },
  { id: "settings", lbl: "Cài đặt", ic: "⚙", color: "#c8c5d0" },
];

// ─── ROUTER ──────────────────────────────────────────────
function go(tab) {
  state.currentTab = tab;
  document.querySelectorAll(".page").forEach(p => p.classList.remove("on"));
  const pg = document.getElementById("p-" + tab);
  if (pg) pg.classList.add("on");
  document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("on"));
  const mainTabs = ["home", "devices", "alerts", "more"];
  if (mainTabs.includes(tab)) {
    document.querySelector(`.nav-item[data-tab="${tab}"]`)?.classList.add("on");
  } else {
    document.querySelector(`.nav-item[data-tab="more"]`)?.classList.add("on");
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

function toast(msg) {
  const sk = document.getElementById("snack");
  if (!sk) return;
  document.getElementById("snack-msg").textContent = msg;
  sk.style.display = "flex";
  clearTimeout(sk._t);
  sk._t = setTimeout(() => sk.style.display = "none", 3500);
}

function showAlertBanner(a) { toast(a.icon + " " + a.msg); }
function showPhoneNotif(n) { }

function showDlg(html) {
  document.getElementById("dlg").innerHTML = html;
  document.getElementById("dlg-ov").classList.add("show");
}
function hideDlg() { document.getElementById("dlg-ov").classList.remove("show"); }

// ─── HOME ────────────────────────────────────────────────
function rdHome() {
  const el = document.getElementById("p-home");
  const tot = allDevices().reduce((s, d) => s + d.screenTime, 0);
  const ca = criticalAlerts().length;
  el.innerHTML = `
  <div class="appbar"><div class="appbar-icon">🛡️</div><div class="appbar-title">KidShield</div><button class="appbar-icon" onclick="go('notify')">🔔</button><button class="appbar-icon" onclick="go('settings')">⋮</button></div>
  <div class="headline"><h1>Tổng quan</h1><p><span class="live-dot"></span>${now()} · ${nowDate()}</p></div>
  <div class="content fade-in">
    ${ca > 0 ? `<div class="hero danger"><h2>⚠️ Chú ý</h2><p>${ca} cảnh báo cần xử lý</p><div class="sub">Nhấn để xem chi tiết</div></div>` : `<div class="hero"><h2>✅ Mọi việc ổn</h2><p>Không có cảnh báo</p><div class="sub">Hệ thống đang theo dõi</div></div>`}
    <div class="stat-grid">
      <div class="stat-card sc-primary"><div class="stat-hd"><div class="stat-icon">📡</div><div class="stat-trend">Hôm nay</div></div><div class="stat-num">${onlineDevices()}<small>/${allDevices().length}</small></div><div class="stat-lbl">Online</div></div>
      <div class="stat-card sc-tertiary"><div class="stat-hd"><div class="stat-icon">⏱️</div><div class="stat-trend">Tổng</div></div><div class="stat-num">${fmtTime(tot)}</div><div class="stat-lbl">Màn hình</div></div>
      <div class="stat-card sc-error"><div class="stat-hd"><div class="stat-icon">🔒</div><div class="stat-trend">Chặn</div></div><div class="stat-num">${state.lockedApps.size}</div><div class="stat-lbl">App + ${state.lockedDevices.size} thiết bị</div></div>
      <div class="stat-card sc-secondary"><div class="stat-hd"><div class="stat-icon">🤖</div><div class="stat-trend">${state.autoDetect ? state.detectInterval + "s" : "OFF"}</div></div><div class="stat-num" style="font-size:24px">${state.autoDetect ? "AUTO" : "OFF"}</div><div class="stat-lbl">AI theo dõi</div></div>
    </div>
    <div class="section-header">Trạng thái trẻ</div>
    ${state.children.map(c => andChildCard(c)).join("")}
    <div class="section-header">Cảnh báo gần đây</div>
    ${state.alerts.slice(0, 3).map(a => andAlertCard(a)).join("")}
    <div class="section-header">Hành động nhanh</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 16px 24px">
      <button class="m3-btn b-tonal" style="height:60px" onclick="lockAll()">🔒 Khoá tất cả</button>
      <button class="m3-btn b-tonal" style="height:60px" onclick="unlockAll()">🔓 Mở tất cả</button>
      <button class="m3-btn b-tonal" style="height:60px" onclick="go('apps')">◈ Quản app</button>
      <button class="m3-btn b-error" style="height:60px" onclick="doSOS()">🆘 SOS</button>
    </div>
  </div>`;
}

function andChildCard(c) {
  const tot = c.devices.reduce((s, d) => s + d.screenTime, 0);
  const lim = c.devices.reduce((s, d) => s + d.limitMins, 0);
  const pct = Math.min(Math.round(tot / Math.max(lim, 1) * 100), 100);
  const cur = c.devices.find(d => d.online && d.currentApp);
  return `<div class="card" onclick="go('devices')" style="cursor:pointer">
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px">
      <div style="width:48px;height:48px;border-radius:50%;background:${c.colorAndroid}33;color:${c.colorAndroid};display:flex;align-items:center;justify-content:center;font-size:24px">${c.avatar}</div>
      <div style="flex:1"><div style="font-size:16px;font-weight:500">${c.name}</div><div style="font-size:13px;color:var(--on-surface-var)">${c.age} tuổi · ${c.devices.length} thiết bị · ${c.moodNote}</div></div>
      <div style="font-size:24px">${c.mood}</div>
    </div>
    <div style="display:flex;justify-content:space-between;font-size:13px;color:var(--on-surface-var);margin-bottom:6px"><span>${fmtTime(tot)} / ${fmtTime(lim)}</span><span style="color:${c.colorAndroid};font-weight:500">${pct}%</span></div>
    <div class="pb"><div class="pbf" style="width:${pct}%;background:${c.colorAndroid}"></div></div>
    ${cur ? `<div style="font-size:13px;margin-top:8px;color:${RM[cur.appRisk].c}"><strong>${cur.currentApp}</strong> trên ${cur.name}</div>` : ""}
  </div>`;
}

function andAlertCard(a) {
  const c = getChild(a.childId);
  const s = SEV[a.severity];
  return `<div class="card" onclick="go('alerts')" style="cursor:pointer;border-left:4px solid ${s.c}">
    <div style="display:flex;gap:12px;align-items:flex-start">
      <div style="width:40px;height:40px;border-radius:50%;background:${s.c}22;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">${a.icon}</div>
      <div style="flex:1"><div style="font-size:15px;font-weight:500">${a.msg}</div><div style="font-size:12px;color:var(--on-surface-var);margin-top:4px">${a.time} · ${c?.avatar} ${c?.name}</div></div>
    </div>
  </div>`;
}

// ─── DEVICES ────────────────────────────────────────────
function rdDevices() {
  const el = document.getElementById("p-devices");
  el.innerHTML = `<div class="appbar"><button class="appbar-icon" onclick="go('home')">←</button><div class="appbar-title">Thiết bị</div></div>
  <div class="headline"><h1>Thiết bị</h1><p>${onlineDevices()} / ${allDevices().length} đang online</p></div>
  <div class="content fade-in">
    ${state.children.map(c => `<div style="margin-bottom:16px">
      <div style="display:flex;align-items:center;gap:10px;padding:16px 20px 4px">
        <div style="width:32px;height:32px;border-radius:50%;background:${c.colorAndroid}33;color:${c.colorAndroid};display:flex;align-items:center;justify-content:center;font-size:18px">${c.avatar}</div>
        <div style="font-size:16px;font-weight:500">${c.name}</div>
        <div style="margin-left:auto;font-size:13px;color:var(--on-surface-var)">${fmtTime(c.devices.reduce((s, d) => s + d.screenTime, 0))}</div>
      </div>
      ${c.devices.map(d => andDevRow(d, c)).join("")}
    </div>`).join("")}
  </div>`;
}

function andDevRow(d, c) {
  const lk = state.lockedDevices.has(d.id);
  const pct = Math.min(Math.round(d.screenTime / Math.max(d.limitMins, 1) * 100), 100);
  const bc = pct >= 90 ? "var(--danger)" : pct >= 70 ? "var(--warning)" : c.colorAndroid;
  return `<div class="dev ${lk ? "lk" : ""}" onclick="showAndDlg('${d.id}')">
    <div class="dev-ic" style="background:${lk ? "rgba(255,122,133,0.18)" : c.colorAndroid + "22"};color:${lk ? "var(--danger)" : c.colorAndroid}">${d.icon}</div>
    <div style="flex:1">
      <div class="dev-name">${d.name}${lk ? ` <span class="chip-assist chip-high">Khoá</span>` : ""}${d.online ? ` <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--success)"></span>` : ""}</div>
      <div class="dev-os">${d.os} · ${d.currentApp || "Không dùng"} · ${d.battery === null ? "🔌" : d.battery + "%"}</div>
      <div class="pb" style="margin-top:6px"><div class="pbf" style="width:${pct}%;background:${bc}"></div></div>
    </div>
  </div>`;
}

function showAndDlg(id) {
  const d = getDevice(id);
  const lk = state.lockedDevices.has(d.id);
  showDlg(`<div class="dialog-icon" style="font-size:48px">${d.icon}</div>
  <div class="dialog-title">${d.name}</div>
  <div class="dialog-content">${d.os}<br>${fmtTime(d.screenTime)} / ${fmtTime(d.limitMins)} · ${d.currentApp || "Không hoạt động"}<br>Pin: ${d.battery === null ? "🔌" : d.battery + "%"}</div>
  <div class="dialog-actions"><button class="m3-btn b-text" onclick="hideDlg()">Huỷ</button><button class="m3-btn ${lk ? "b-filled" : "b-error"}" onclick="tglD('${id}');hideDlg()">${lk ? "Mở khoá" : "Khoá"}</button></div>`);
}
function tglD(id) { state.lockedDevices.has(id) ? state.lockedDevices.delete(id) : state.lockedDevices.add(id); const d = getDevice(id); toast(state.lockedDevices.has(id) ? `Đã khoá ${d.name}` : `Đã mở ${d.name}`); render(); }
function lockAll() { allDevices().forEach(d => state.lockedDevices.add(d.id)); toast("Đã khoá tất cả"); render(); }
function unlockAll() { state.lockedDevices.clear(); toast("Đã mở tất cả"); render(); }

// ─── ALERTS ─────────────────────────────────────────────
function rdAlerts() {
  const el = document.getElementById("p-alerts");
  const ca = criticalAlerts().length;
  const sevs = ["all", "critical", "high", "medium", "low"];
  const list = state.alertFilter === "all" ? state.alerts : state.alerts.filter(a => a.severity === state.alertFilter);
  el.innerHTML = `<div class="appbar"><button class="appbar-icon" onclick="go('home')">←</button><div class="appbar-title">Cảnh báo</div><button class="appbar-icon" onclick="if(confirm('Xoá tất cả?')){state.alerts=[];render()}">🗑️</button></div>
  <div class="headline"><h1>Cảnh báo</h1><p>${state.alerts.length} tổng · ${ca} khẩn cấp</p></div>
  <div class="content fade-in">
    <div class="chip-row">${sevs.map(s => `<button class="chip ${state.alertFilter === s ? "on" : ""}" onclick="state.alertFilter='${s}';rdAlerts()">${s === "all" ? "Tất cả" : SEV[s].l}</button>`).join("")}</div>
    ${!list.length ? `<div style="text-align:center;padding:60px 0;color:var(--on-surface-var)"><div style="font-size:64px;margin-bottom:12px">✅</div><div style="font-size:18px;font-weight:500">Không có cảnh báo</div></div>` :
    list.map(a => { const c = getChild(a.childId); const s = SEV[a.severity]; return `<div class="alrt" style="border-left:4px solid ${s.c}">
      <div class="alrt-hd"><div class="alrt-ic" style="background:${s.c}22">${a.icon}</div>
      <div style="flex:1"><div class="alrt-msg">${a.msg}</div><div class="alrt-meta">${a.time} · ${c?.avatar} ${c?.name} · 📱 ${a.app}</div></div>
      <span class="chip-assist" style="background:${s.c}22;color:${s.c}">${s.l}</span></div>
      <div class="alrt-actions">
        <button class="m3-btn b-tonal b-sm" onclick="lkFromAlert('${a.deviceId}',${a.id})">🔒 Khoá</button>
        <button class="m3-btn b-text b-sm" onclick="rmAlert(${a.id})">Bỏ qua</button>
      </div>
    </div>`; }).join("")}
  </div>`;
}
function rmAlert(id) { state.alerts = state.alerts.filter(a => a.id !== id); render(); }
function lkFromAlert(did, aid) { tglD(did); rmAlert(aid); }

// ─── MORE ───────────────────────────────────────────────
function rdMore() {
  const el = document.getElementById("p-more");
  el.innerHTML = `<div class="appbar"><div class="appbar-title">Thêm</div></div>
  <div class="headline"><h1>Tất cả tính năng</h1><p>9 tính năng nâng cao</p></div>
  <div class="content fade-in">
    <div class="card" style="padding:0">${MORE_PAGES.map(p => `<div class="list-item" onclick="go('${p.id}')">
      <div class="list-icon" style="background:${p.color}22;color:${p.color}">${p.ic}</div>
      <div style="flex:1"><div class="list-title">${p.lbl}</div></div>
      <span class="list-trailing">›</span>
    </div>`).join("")}</div>
  </div>`;
}

// ─── APPS ───────────────────────────────────────────────
function rdApps() {
  const el = document.getElementById("p-apps");
  const cats = ["all", ...new Set(APPS.map(a => a.category))];
  const list = state.appFilter === "all" ? APPS : APPS.filter(a => a.category === state.appFilter);
  el.innerHTML = `<div class="appbar"><button class="appbar-icon" onclick="go('more')">←</button><div class="appbar-title">Ứng dụng</div></div>
  <div class="headline"><h1>Ứng dụng</h1><p>${state.lockedApps.size} app đang bị khoá</p></div>
  <div class="content fade-in">
    <div class="chip-row">${cats.map(c => `<button class="chip ${state.appFilter === c ? "on" : ""}" onclick="state.appFilter='${c}';rdApps()">${c === "all" ? "Tất cả" : c}</button>`).join("")}</div>
    ${list.map(a => { const lk = state.lockedApps.has(a.id); const r = RM[a.risk]; return `<div class="card" style="display:flex;align-items:center;gap:14px;padding:14px 16px;cursor:pointer">
      <div style="width:42px;height:42px;border-radius:50%;background:${a.color}22;color:${a.color};display:flex;align-items:center;justify-content:center;font-size:22px">${a.icon}</div>
      <div style="flex:1"><div style="font-size:16px;font-weight:500">${a.name}</div><div style="font-size:13px;color:var(--on-surface-var);margin-top:2px"><span class="chip-assist chip-${a.risk === "safe" ? "safe" : a.risk === "low" ? "low" : a.risk === "medium" ? "med" : "high"}">${r.l}</span> · ${a.category}</div></div>
      <div class="switch ${lk ? "on" : ""}" onclick="tglA(${a.id})"><div class="thumb"></div></div>
    </div>`; }).join("")}
  </div>`;
}
function tglA(id) { state.lockedApps.has(id) ? state.lockedApps.delete(id) : state.lockedApps.add(id); const a = APPS.find(x => x.id === id); toast((state.lockedApps.has(id) ? "Khoá " : "Mở ") + a.name); render(); }

// ─── SCHEDULE ───────────────────────────────────────────
function rdSched() {
  const el = document.getElementById("p-schedule");
  const slots = (state.schedules[state.scheduleChildId]?.[state.scheduleDay]) || [];
  el.innerHTML = `<div class="appbar"><button class="appbar-icon" onclick="go('more')">←</button><div class="appbar-title">Lịch sử dụng</div></div>
  <div class="headline"><h1>Lịch</h1><p>Khung giờ cho phép / chặn</p></div>
  <div class="content fade-in">
    <div class="section-header">Chọn trẻ</div>
    <div class="chip-row">${state.children.map(c => `<button class="chip ${state.scheduleChildId === c.id ? "on" : ""}" onclick="state.scheduleChildId=${c.id};rdSched()">${c.avatar} ${c.name}</button>`).join("")}</div>
    <div class="section-header">Ngày trong tuần</div>
    <div class="chip-row">${DAYS.map(d => `<button class="chip ${state.scheduleDay === d ? "on" : ""}" onclick="state.scheduleDay='${d}';rdSched()">${DAY_VN[d]}</button>`).join("")}</div>
    <div class="section-header">Khung giờ ${DAY_VN[state.scheduleDay]}</div>
    ${slots.length ? slots.map((s, i) => `<div class="card" style="border-left:4px solid ${s.a ? "var(--success)" : "var(--danger)"}">
      <div style="display:flex;align-items:center;gap:12px">
        <span style="font-size:24px">${s.a ? "✅" : "🚫"}</span>
        <div style="flex:1"><div style="font-size:16px;font-weight:500">${s.s} – ${s.e}</div><div style="font-size:13px;color:var(--on-surface-var)">${s.a ? "Cho phép sử dụng" : "Chặn không cho dùng"}</div></div>
        <button class="m3-btn b-text b-sm" onclick="rmSlot(${i})" style="color:var(--danger)">Xoá</button>
      </div>
    </div>`).join("") : `<div style="text-align:center;padding:30px;color:var(--on-surface-var)">Chưa có lịch cho ngày này</div>`}
    <div style="padding:14px 16px"><button class="m3-btn b-filled b-block" onclick="addSlot()">➕ Thêm khung giờ</button></div>
  </div>`;
}
function addSlot() { if (!state.schedules[state.scheduleChildId]) state.schedules[state.scheduleChildId] = {}; if (!state.schedules[state.scheduleChildId][state.scheduleDay]) state.schedules[state.scheduleChildId][state.scheduleDay] = []; state.schedules[state.scheduleChildId][state.scheduleDay].push({ s: "15:00", e: "17:00", a: true }); toast("Đã thêm khung giờ"); rdSched(); }
function rmSlot(i) { state.schedules[state.scheduleChildId][state.scheduleDay].splice(i, 1); rdSched(); }

// ─── AI ─────────────────────────────────────────────────
function rdAi() {
  const el = document.getElementById("p-ai");
  el.innerHTML = `<div class="appbar"><button class="appbar-icon" onclick="go('more')">←</button><div class="appbar-title">AI Phân tích</div></div>
  <div class="headline"><h1>AI Phân tích</h1><p>Hỏi AI về hành vi của con</p></div>
  <div class="content fade-in" style="padding-bottom:160px">
    <div class="chip-row">
      <button class="chip ${state.aiTab === "analysis" ? "on" : ""}" onclick="state.aiTab='analysis';rdAi()">📊 Phân tích</button>
      <button class="chip ${state.aiTab === "chat" ? "on" : ""}" onclick="state.aiTab='chat';rdAi()">💬 Hỏi AI</button>
      <button class="chip ${state.aiTab === "predict" ? "on" : ""}" onclick="state.aiTab='predict';rdAi()">🔮 Dự đoán</button>
    </div>
    ${state.aiTab === "analysis" ? andAiAnal() : state.aiTab === "chat" ? andAiChat() : andAiPred()}
  </div>`;
  if (state.aiTab === "chat") setTimeout(() => { const cw = document.getElementById("and-cwrap"); if (cw) cw.scrollTop = cw.scrollHeight; }, 50);
}
function andAiAnal() {
  return state.children.map(c => { const mx = Math.max(...state.weekData[c.id], 1); return `<div class="card">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
      <div style="width:40px;height:40px;border-radius:50%;background:${c.colorAndroid}33;color:${c.colorAndroid};display:flex;align-items:center;justify-content:center;font-size:20px">${c.avatar}</div>
      <div style="flex:1"><div style="font-size:16px;font-weight:500">${c.name}</div><div style="font-size:12px;color:var(--on-surface-var)">${fmtTime(state.weekData[c.id].reduce((a, b) => a + b, 0))} tuần này</div></div>
    </div>
    <div style="display:flex;align-items:flex-end;gap:5px;height:80px;margin-bottom:6px">${state.weekData[c.id].map(v => `<div style="flex:1;background:${c.colorAndroid};border-radius:4px 4px 0 0;height:${Math.round(v / mx * 100)}%;min-height:3px"></div>`).join("")}</div>
    <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--on-surface-var)">${DAYS.map(d => `<span>${DAY_VN[d]}</span>`).join("")}</div>
  </div>`; }).join("");
}
function andAiChat() {
  return `<div style="display:flex;flex-direction:column;padding:0 16px" id="and-cwrap">
    ${state.aiChat.map(m => `<div class="aib ${m.r === "ai" ? "bot" : "user"}">${m.m}</div>`).join("")}
  </div>
  <div style="position:fixed;bottom:90px;left:0;right:0;padding:8px 16px;background:var(--surface);border-top:1px solid var(--outline-var);display:flex;gap:8px;max-width:430px;margin:0 auto">
    <input class="inp" id="and-ai-inp" placeholder="Hỏi AI..." style="flex:1" onkeydown="if(event.key==='Enter'){const v=this.value.trim();if(v){sendAI(v);this.value=''}}">
    <button class="m3-btn b-filled" onclick="const v=document.getElementById('and-ai-inp').value.trim();if(v){sendAI(v);document.getElementById('and-ai-inp').value=''}">↑</button>
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
    state.aiChat.push({ r: "ai", m: data.content?.[0]?.text || "Không thể phân tích." });
  } catch (e) {
    state.aiChat.pop();
    state.aiChat.push({ r: "ai", m: "⚠️ Lỗi kết nối AI." });
  }
  rdAi();
}
function andAiPred() {
  return [
    { c: state.children[0], col: "var(--warning)", items: ["85% khả năng vượt giới hạn TikTok", "Màn hình tăng 20% cuối tuần", "Rủi ro nội dung cao"] },
    { c: state.children[1], col: "var(--success)", items: ["90% đạt mục tiêu học tuần", "Xu hướng tốt", "Nên thưởng +15 điểm"] },
    { c: state.children[2], col: "var(--danger)", items: ["Gaming đêm thành thói quen", "Ảnh hưởng học 2 tuần", "Đề xuất họp gia đình"] },
  ].map(p => `<div class="card" style="border-left:4px solid ${p.col}">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span style="font-size:28px">${p.c.avatar}</span><div style="font-size:16px;font-weight:500">${p.c.name}</div></div>
    ${p.items.map(i => `<div style="display:flex;gap:10px;padding:6px 0;font-size:14px;color:var(--on-surface-var)"><span style="color:${p.col};font-weight:700">→</span>${i}</div>`).join("")}
  </div>`).join("");
}

// ─── REWARDS ────────────────────────────────────────────
function rdRewards() {
  const el = document.getElementById("p-rewards");
  el.innerHTML = `<div class="appbar"><button class="appbar-icon" onclick="go('more')">←</button><div class="appbar-title">Phần thưởng</div></div>
  <div class="headline"><h1>Phần thưởng</h1><p>Khuyến khích hành vi tốt</p></div>
  <div class="content fade-in">
    <div class="section-header">Điểm tích luỹ</div>
    ${state.children.map(c => { const pts = state.rewardPoints[c.id] || 0; return `<div class="card">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:10px">
        <div style="width:48px;height:48px;border-radius:50%;background:${c.colorAndroid}33;color:${c.colorAndroid};display:flex;align-items:center;justify-content:center;font-size:24px">${c.avatar}</div>
        <div style="flex:1"><div style="font-size:16px;font-weight:500">${c.name}</div><div style="font-size:22px;font-weight:700;color:var(--warning)">⭐ ${pts}</div></div>
        <button class="m3-btn b-tonal b-sm" onclick="addPts(${c.id},10)">+10</button>
      </div>
      <div style="display:flex;gap:2px">${Array.from({ length: 10 }, (_, i) => `<span style="font-size:18px;opacity:${i < Math.floor(pts / 30) ? 1 : .18}">⭐</span>`).join("")}</div>
    </div>`; }).join("")}
    <div class="section-header">Đổi thưởng</div>
    ${state.rewards.map(r => `<div class="card" style="display:flex;align-items:center;gap:14px">
      <div style="width:48px;height:48px;border-radius:50%;background:rgba(255,209,102,0.18);color:var(--warning);display:flex;align-items:center;justify-content:center;font-size:24px">${r.icon}</div>
      <div style="flex:1"><div style="font-size:16px;font-weight:500">${r.name}</div><div style="font-size:13px;color:var(--warning)">⭐ ${r.cost} điểm</div></div>
      <button class="m3-btn b-tonal b-sm" onclick="showRedeemDlg('${r.id}')">Đổi</button>
    </div>`).join("")}
    <div class="section-header">Huy hiệu</div>
    ${state.children.map(c => `<div class="card">
      <div style="font-size:14px;font-weight:500;margin-bottom:10px;color:${c.colorAndroid}">${c.avatar} ${c.name}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">${(state.achievements[c.id] || []).map(a => `<div style="text-align:center;opacity:${a.e ? 1 : .25}"><div style="width:50px;height:50px;border-radius:14px;background:${a.e ? "rgba(255,209,102,0.18)" : "var(--surface2)"};display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:3px">${a.i}</div><div style="font-size:9px;width:60px;color:var(--on-surface-var)">${a.n}</div></div>`).join("")}</div>
    </div>`).join("")}
  </div>`;
}
function addPts(id, n) { state.rewardPoints[id] = Math.max(0, (state.rewardPoints[id] || 0) + n); toast(`${n > 0 ? "+" : ""}${n} điểm cho ${getChild(id)?.name}`); rdRewards(); }
function showRedeemDlg(rid) {
  const r = state.rewards.find(x => x.id === rid);
  showDlg(`<div class="dialog-icon" style="font-size:42px">${r.icon}</div>
  <div class="dialog-title">${r.name}</div>
  <div class="dialog-content">${r.cost} ⭐ — Chọn trẻ:</div>
  <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">${state.children.map(c => `<button class="m3-btn ${(state.rewardPoints[c.id] || 0) < r.cost ? "b-text" : "b-tonal"}" onclick="redeem('${rid}',${c.id});hideDlg()" ${(state.rewardPoints[c.id] || 0) < r.cost ? "disabled" : ""}>${c.avatar} ${c.name} (${state.rewardPoints[c.id] || 0}⭐)</button>`).join("")}</div>
  <div class="dialog-actions"><button class="m3-btn b-text" onclick="hideDlg()">Huỷ</button></div>`);
}
function redeem(rid, cid) { const r = state.rewards.find(x => x.id === rid); if ((state.rewardPoints[cid] || 0) < r.cost) { toast("Không đủ điểm"); return; } state.rewardPoints[cid] -= r.cost; toast(`🎁 Đổi ${r.name} thành công!`); rdRewards(); }

// ─── GEO ────────────────────────────────────────────────
function rdGeo() {
  const el = document.getElementById("p-geo");
  el.innerHTML = `<div class="appbar"><button class="appbar-icon" onclick="go('more')">←</button><div class="appbar-title">Vị trí & Vùng</div></div>
  <div class="headline"><h1>Vị trí</h1><p>Theo dõi GPS · Geofencing</p></div>
  <div class="content fade-in">
    <div class="card">
      <div style="position:relative;height:220px;background:rgba(168,199,250,0.05);border-radius:14px;overflow:hidden">
        <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(168,199,250,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(168,199,250,0.05) 1px,transparent 1px);background-size:20px 20px"></div>
        ${state.geofences.filter(g => g.enabled).map(g => `<div style="position:absolute;width:${g.r * 2}px;height:${g.r * 2}px;left:${g.x}%;top:${g.y}%;transform:translate(-50%,-50%);border-radius:50%;background:${g.color}15;border:1.5px solid ${g.color}50"></div>`).join("")}
        ${state.geofences.filter(g => g.enabled).map(g => `<div style="position:absolute;left:${g.x}%;top:${g.y}%;transform:translate(-50%,-50%);font-size:22px">${g.icon}</div>`).join("")}
        ${state.children.map(c => { const l = state.locations[c.id]; return `<div style="position:absolute;left:${l.x}%;top:${l.y}%;transform:translate(-50%,-50%);font-size:22px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.6))" title="${c.name}">${c.avatar}</div>`; }).join("")}
      </div>
    </div>
    <div class="section-header">Vị trí trẻ</div>
    ${state.children.map(c => { const l = state.locations[c.id]; return `<div class="card" style="display:flex;align-items:center;gap:12px">
      <div style="width:42px;height:42px;border-radius:50%;background:${c.colorAndroid}33;color:${c.colorAndroid};display:flex;align-items:center;justify-content:center;font-size:22px">${c.avatar}</div>
      <div style="flex:1"><div style="font-size:16px;font-weight:500">${c.name}</div><div style="font-size:13px;color:${l.ok ? "var(--success)" : "var(--danger)"}">${l.ok ? "📍" : "⚠️"} ${l.zone}</div></div>
      <div style="font-size:12px;color:var(--on-surface-var)">${l.time}</div>
    </div>`; }).join("")}
    <div class="section-header">Vùng an toàn</div>
    ${state.geofences.map(g => `<div class="card" style="display:flex;align-items:center;gap:12px">
      <div style="width:42px;height:42px;border-radius:50%;background:${g.color}22;color:${g.color};display:flex;align-items:center;justify-content:center;font-size:22px">${g.icon}</div>
      <div style="flex:1"><div style="font-size:16px;font-weight:500">${g.name}</div><div style="font-size:13px;color:var(--on-surface-var)">Bán kính ~${g.r * 10}m</div></div>
      <div class="switch ${g.enabled ? "on" : ""}" onclick="g.enabled=!g.enabled;rdGeo()"><div class="thumb"></div></div>
    </div>`).join("")}
  </div>`;
}

// ─── REPORTS ────────────────────────────────────────────
function rdReports() {
  const el = document.getElementById("p-reports");
  const tot = allDevices().reduce((s, d) => s + d.screenTime, 0);
  el.innerHTML = `<div class="appbar"><button class="appbar-icon" onclick="go('more')">←</button><div class="appbar-title">Báo cáo</div></div>
  <div class="headline"><h1>Báo cáo tuần</h1><p>Tổng kết & xu hướng</p></div>
  <div class="content fade-in">
    <div class="stat-grid">
      <div class="stat-card sc-tertiary"><div class="stat-hd"><div class="stat-icon">⏱️</div><div class="stat-trend">Tuần</div></div><div class="stat-num">${fmtTime(tot * 7)}</div><div class="stat-lbl">Tổng</div></div>
      <div class="stat-card sc-error"><div class="stat-hd"><div class="stat-icon">🔔</div><div class="stat-trend">5 khẩn</div></div><div class="stat-num">23</div><div class="stat-lbl">Cảnh báo</div></div>
      <div class="stat-card sc-primary"><div class="stat-hd"><div class="stat-icon">⭐</div><div class="stat-trend">+85</div></div><div class="stat-num">320</div><div class="stat-lbl">Điểm</div></div>
      <div class="stat-card sc-secondary"><div class="stat-hd"><div class="stat-icon">📈</div><div class="stat-trend">/trẻ</div></div><div class="stat-num" style="font-size:24px">${fmtTime(Math.round(tot / 3))}</div><div class="stat-lbl">TB ngày</div></div>
    </div>
    <div class="section-header">App dùng nhiều nhất</div>
    ${[{ a: "TikTok", i: "🎵", c: "#ff0050", t: "15h 20p", p: 90 }, { a: "PUBG", i: "🎮", c: "#f7b731", t: "12h 45p", p: 76 }, { a: "YouTube", i: "▶️", c: "#ff0000", t: "8h 10p", p: 49 }].map(a => `<div class="card" style="display:flex;align-items:center;gap:14px">
      <div style="width:42px;height:42px;border-radius:50%;background:${a.c}22;color:${a.c};display:flex;align-items:center;justify-content:center;font-size:22px">${a.i}</div>
      <div style="flex:1"><div style="font-size:16px;font-weight:500;margin-bottom:6px">${a.a}</div><div class="pb"><div class="pbf" style="width:${a.p}%;background:${a.c}"></div></div></div>
      <div style="font-size:13px;color:var(--on-surface-var)">${a.t}</div>
    </div>`).join("")}
    <div class="section-header">So sánh tuần trước</div>
    ${state.children.map((c, i) => { const ch = [-20, +15, +45][i]; return `<div class="card" style="display:flex;align-items:center;gap:14px">
      <div style="width:42px;height:42px;border-radius:50%;background:${c.colorAndroid}33;color:${c.colorAndroid};display:flex;align-items:center;justify-content:center;font-size:22px">${c.avatar}</div>
      <div style="flex:1"><div style="font-size:16px;font-weight:500">${c.name}</div><div style="font-size:13px;color:var(--on-surface-var)">${fmtTime(state.weekData[c.id].reduce((a, b) => a + b, 0))}</div></div>
      <div style="font-size:18px;font-weight:700;color:${ch > 0 ? "var(--danger)" : "var(--success)"}">${ch > 0 ? "+" : ""}${ch}p</div>
    </div>`; }).join("")}
  </div>`;
}

// ─── NOTIFY ─────────────────────────────────────────────
function rdNotify() {
  const el = document.getElementById("p-notify");
  el.innerHTML = `<div class="appbar"><button class="appbar-icon" onclick="go('more')">←</button><div class="appbar-title">Thông báo</div></div>
  <div class="headline"><h1>Thông báo</h1><p>Gửi thật qua Google Apps Script</p></div>
  <div class="content fade-in">
    <div class="section-header">Cấu hình</div>
    <div class="card">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
        <span style="font-size:24px">${state.scriptStatus === "ok" ? "✅" : state.scriptStatus === "error" ? "❌" : "🔧"}</span>
        <div style="flex:1"><div style="font-size:16px;font-weight:500">Apps Script URL</div><div style="font-size:13px;color:var(--on-surface-var)">${state.scriptStatus === "ok" ? "Đã kết nối" : "Chưa cài"}</div></div>
      </div>
      <input class="inp" value="${state.scriptUrl}" placeholder="https://script.google.com/.../exec" oninput="state.scriptUrl=this.value;state.scriptStatus='unconfigured'" style="font-size:13px;margin-bottom:10px">
      <button class="m3-btn b-tonal b-block" onclick="testScriptConnection()">🔍 Test kết nối</button>
    </div>
    <div class="section-header">Admin nhận thông báo</div>
    ${state.admins.map(p => `<div class="card" style="display:flex;align-items:center;gap:14px">
      <div style="width:42px;height:42px;border-radius:50%;background:${p.enabled ? "rgba(168,199,250,0.18)" : "var(--surface2)"};color:${p.enabled ? "var(--primary)" : "var(--on-surface-var)"};display:flex;align-items:center;justify-content:center;font-size:22px">${p.avatar}</div>
      <div style="flex:1"><div style="font-size:16px;font-weight:500">${p.name}</div><div style="font-size:13px;color:var(--on-surface-var)">${p.email || p.phone}</div></div>
      <div class="switch ${p.enabled ? "on" : ""}" onclick="p.enabled=!p.enabled;rdNotify()"><div class="thumb"></div></div>
    </div>`).join("")}
    <div style="padding:14px 16px"><button class="m3-btn b-tonal b-block" onclick="addAdmin()">➕ Thêm admin</button></div>
    <div class="section-header">Lịch sử gửi</div>
    ${state.phoneNotifs.length ? state.phoneNotifs.map(n => { const s = SEV[n.sev]; return `<div class="card" style="border-left:4px solid ${s.c}">
      <div style="font-size:14px;font-weight:500;margin-bottom:6px">${n.msg}</div>
      <div style="font-size:12px;color:var(--on-surface-var)">${n.t} ${n.status === "sent" ? `· <span style="color:var(--success)">✅ Đã gửi</span>` : n.status === "failed" ? `· <span style="color:var(--danger)">❌ Lỗi</span>` : ""}</div>
    </div>`; }).join("") : `<div style="text-align:center;padding:30px;color:var(--on-surface-var)">Chưa có thông báo</div>`}
    <div style="padding:14px 16px"><button class="m3-btn b-error b-block" onclick="sendTestNotification()">📳 Gửi thử thông báo</button></div>
  </div>`;
}
function addAdmin() { const n = prompt("Tên:"); if (!n) return; const em = prompt("Email:"); state.admins.push({ id: "p" + Date.now(), name: n, phone: "", email: em || "", avatar: "👤", enabled: true, channels: { push: true, sms: false, call: false } }); toast("Đã thêm " + n); rdNotify(); }

// ─── LINK ───────────────────────────────────────────────
function rdLink() {
  const el = document.getElementById("p-link");
  el.innerHTML = `<div class="appbar"><button class="appbar-icon" onclick="go('more')">←</button><div class="appbar-title">Liên kết</div></div>
  <div class="headline"><h1>Liên kết</h1><p>Thêm thiết bị mới</p></div>
  <div class="content fade-in">
    <div class="card" style="text-align:center;padding:28px 24px">
      <div style="font-size:72px;margin-bottom:14px">🔗</div>
      <div style="font-size:20px;font-weight:500;margin-bottom:8px">Tạo mã liên kết</div>
      <div style="font-size:14px;color:var(--on-surface-var);margin-bottom:20px">Quét mã trên thiết bị mới để kết nối</div>
      <button class="m3-btn b-filled b-block" onclick="genCode()">🔑 Tạo mã ngay</button>
    </div>
    <div class="section-header">Đã liên kết (${allDevices().length})</div>
    ${state.children.map(c => `<div style="margin-bottom:16px">
      <div style="display:flex;align-items:center;gap:10px;padding:0 20px 6px">
        <div style="width:32px;height:32px;border-radius:50%;background:${c.colorAndroid}33;color:${c.colorAndroid};display:flex;align-items:center;justify-content:center;font-size:16px">${c.avatar}</div>
        <div style="font-size:14px;font-weight:500">${c.name}</div>
      </div>
      ${c.devices.map(d => `<div class="card" style="display:flex;align-items:center;gap:14px">
        <div style="width:42px;height:42px;border-radius:50%;background:${c.colorAndroid}22;color:${c.colorAndroid};display:flex;align-items:center;justify-content:center;font-size:22px">${d.icon}</div>
        <div style="flex:1"><div style="font-size:16px;font-weight:500">${d.name}</div><div style="font-size:12px;color:var(--on-surface-var)">${d.os}</div></div>
        <div style="display:flex;align-items:center;gap:4px"><div style="width:8px;height:8px;border-radius:50%;background:${d.online ? "var(--success)" : "var(--outline)"}"></div></div>
      </div>`).join("")}
    </div>`).join("")}
  </div>`;
}
function genCode() { const c = "KS-" + Math.floor(1000 + Math.random() * 9000); toast(`🔑 Mã: ${c} (hết hạn 2 phút)`); }

// ─── SETTINGS ───────────────────────────────────────────
function rdSettings() {
  const el = document.getElementById("p-settings");
  el.innerHTML = `<div class="appbar"><button class="appbar-icon" onclick="go('more')">←</button><div class="appbar-title">Cài đặt</div></div>
  <div class="headline"><h1>Cài đặt</h1><p>Tuỳ chỉnh ứng dụng</p></div>
  <div class="content fade-in">
    <div class="section-header">CHUNG</div>
    <div class="card" style="padding:0">
      <div class="list-item"><div class="list-icon" style="background:rgba(125,214,135,0.18);color:var(--success)">🤖</div><div style="flex:1"><div class="list-title">Tự động theo dõi</div><div class="list-supporting">Quét mỗi 30 giây</div></div><div class="switch ${state.autoDetect ? "on" : ""}" onclick="toggleAutoDetect()"><div class="thumb"></div></div></div>
      <div class="list-item" onclick="toast('Cài đặt thông báo')"><div class="list-icon" style="background:rgba(168,199,250,0.18);color:var(--primary)">🔔</div><div style="flex:1"><div class="list-title">Thông báo</div></div><span class="list-trailing">›</span></div>
    </div>
    <div class="section-header">QUẢN LÝ TRẺ</div>
    <div class="card" style="padding:0">${state.children.map(c => `<div class="list-item">
      <div class="list-icon" style="background:${c.colorAndroid}33;color:${c.colorAndroid}">${c.avatar}</div>
      <div style="flex:1"><div class="list-title">${c.name}</div><div class="list-supporting">${c.age} tuổi · ${c.devices.length} thiết bị</div></div>
      <button class="m3-btn b-text b-sm" onclick="editLim(${c.id})">⏱️</button>
    </div>`).join("")}</div>
    <div class="section-header">TỪ KHOÁ CẤM</div>
    <div style="padding:0 16px 8px">${state.blockedKeywords.map(k => `<span class="kw">${k}<button onclick="state.blockedKeywords=state.blockedKeywords.filter(x=>x!=='${k}');saveState();rdSettings()">×</button></span>`).join("")}</div>
    <div style="padding:0 16px 16px;display:flex;gap:8px"><input class="inp" id="and-kw-inp" placeholder="Thêm..." onkeydown="if(event.key==='Enter')addKW()"><button class="m3-btn b-error" onclick="addKW()">+</button></div>
    <div class="section-header">BẢO MẬT</div>
    <div class="card" style="padding:0">
      <div class="list-item"><div class="list-icon" style="background:rgba(168,199,250,0.18);color:var(--primary)">🔐</div><div style="flex:1"><div class="list-title">PIN bảo vệ</div><div class="list-supporting">Yêu cầu PIN khi mở</div></div><div class="switch ${state.pinEnabled ? "on" : ""}" onclick="state.pinEnabled=!state.pinEnabled;saveState();rdSettings()"><div class="thumb"></div></div></div>
      <div class="list-item" onclick="exportCfg()"><div class="list-icon" style="background:rgba(217,188,224,0.18);color:var(--tertiary)">💾</div><div style="flex:1"><div class="list-title">Xuất cấu hình</div></div><span class="list-trailing">›</span></div>
      <div class="list-item" onclick="if(confirm('Xoá tất cả?')){localStorage.clear();location.reload()}"><div class="list-icon" style="background:rgba(255,122,133,0.18);color:var(--danger)">🗑️</div><div style="flex:1"><div class="list-title" style="color:var(--danger)">Reset dữ liệu</div></div></div>
    </div>
    <div class="section-header">VỀ ỨNG DỤNG</div>
    <div class="card" style="padding:0">
      <div class="list-item"><div class="list-icon" style="background:linear-gradient(135deg,var(--primary),var(--tertiary));color:var(--on-primary)">🛡️</div><div style="flex:1"><div class="list-title">KidShield Pro</div><div class="list-supporting">v3.0 · Android Edition</div></div></div>
    </div>
    <div style="height:24px"></div>
  </div>`;
}
function addKW() { const i = document.getElementById("and-kw-inp"); const k = i?.value?.trim(); if (!k) return; if (!state.blockedKeywords.includes(k)) { state.blockedKeywords.push(k); saveState(); rdSettings(); toast(`🚫 ${k}`); } i.value = ""; }
function editLim(id) { const c = getChild(id); const l = prompt(`Giới hạn (phút) cho ${c.name}:`, c.devices[0]?.limitMins || 120); if (l) { c.devices.forEach(d => d.limitMins = parseInt(l) || 120); toast("Đã cập nhật"); saveState(); } }
function exportCfg() { const d = { lockedApps: [...state.lockedApps], scriptUrl: state.scriptUrl, admins: state.admins, blockedKeywords: state.blockedKeywords, rewardPoints: state.rewardPoints }; const b = new Blob([JSON.stringify(d, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "kidshield-config.json"; a.click(); toast("Đã xuất"); }

// ─── SOS ────────────────────────────────────────────────
function doSOS() {
  showDlg(`<div class="dialog-icon" style="font-size:48px">🆘</div>
  <div class="dialog-title" style="color:var(--danger)">SOS Khẩn cấp</div>
  <div class="dialog-content">Khoá tất cả thiết bị và gửi thông báo đến tất cả admin?</div>
  <div class="dialog-actions"><button class="m3-btn b-text" onclick="hideDlg()">Huỷ</button><button class="m3-btn b-error" onclick="confirmSOS()">Xác nhận</button></div>`);
}
function confirmSOS() {
  lockAll();
  sendNotification({ id: 0, childId: 1, deviceId: "d1", app: "SOS", severity: "critical", icon: "🆘", msg: "SOS — Đã khoá tất cả!" }, true);
  hideDlg();
  toast("🆘 SOS kích hoạt!");
}

// ─── INIT ───────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadState();
  const updTime = () => { const e = document.getElementById("sb-time"); if (e) e.textContent = now(); };
  updTime();
  setInterval(updTime, 30000);
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
