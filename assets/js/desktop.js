// ═══════════════════════════════════════════════════════════
//  KidShield Pro — Desktop Renderer (full 12-tab)
// ═══════════════════════════════════════════════════════════

const SEV = SEV_DESKTOP;
const RM = RISK_DESKTOP;

// ─── MAIN ROUTER ────────────────────────────────────────────
function go(tab) {
  document.querySelectorAll("[id^='pg-']").forEach(e => e.style.display = "none");
  document.querySelectorAll(".nav").forEach(e => e.classList.remove("on"));
  const pg = document.getElementById("pg-" + tab);
  if (pg) {
    pg.style.display = "block";
    pg.style.animation = "none";
    requestAnimationFrame(() => pg.style.animation = "fadeUp .32s cubic-bezier(.4,0,.2,1)");
  }
  const nv = document.getElementById("nav-" + tab);
  if (nv) nv.classList.add("on");
  state.currentTab = tab;
  render();
}

function render() {
  const m = {
    dashboard: rdDash, devices: rdDevices, apps: rdApps, alerts: rdAlerts,
    schedule: rdSched, ai: rdAi, rewards: rdRewards, geo: rdGeo,
    reports: rdReports, notify: rdNotify, link: rdLink, settings: rdSettings
  };
  if (m[state.currentTab]) m[state.currentTab]();
  updateBadges();
  saveState();
}

function updateBadges() {
  const ca = criticalAlerts().length;
  const bd = id => document.getElementById(id);
  if (bd("bdg-al")) { bd("bdg-al").textContent = ca || ""; bd("bdg-al").style.display = ca ? "" : "none"; }
  if (bd("bdg-d")) bd("bdg-d").textContent = onlineDevices() + "/" + allDevices().length;
  if (bd("bdg-a")) bd("bdg-a").textContent = state.lockedApps.size ? " 🔒 " + state.lockedApps.size : "";
  const un = state.phoneNotifs.filter(n => !n.read).length;
  if (bd("bdg-n")) { bd("bdg-n").textContent = un || ""; bd("bdg-n").style.display = un ? "" : "none"; }
}

function toggleSB() {
  const s = document.getElementById("sb");
  s.classList.toggle("open");
  document.getElementById("sb-tog").textContent = s.classList.contains("open") ? "◀" : "▶";
}

function toast(msg, type = "info") {
  const el = document.getElementById("toast");
  const bgs = { info: "rgba(7,11,22,0.97)", success: "rgba(2,35,18,0.97)", warning: "rgba(45,22,0,0.97)", danger: "rgba(45,5,14,0.97)" };
  const bds = { info: "#334155", success: "#10d98a", warning: "#f59e0b", danger: "#f43f5e" };
  el.textContent = msg;
  Object.assign(el.style, { display: "block", background: bgs[type], border: `1px solid ${bds[type]}`, color: "#f0f4ff" });
  clearTimeout(el._t);
  el._t = setTimeout(() => el.style.display = "none", 3500);
}

function showAlertBanner(a) {
  const s = SEV[a.severity];
  const el = document.createElement("div");
  el.style.cssText = `position:fixed;top:18px;left:50%;transform:translateX(-50%);z-index:9997;background:${s.c}ef;color:#fff;border-radius:12px;padding:11px 20px;display:flex;align-items:center;gap:10px;font-size:13px;font-weight:700;box-shadow:0 8px 40px ${s.c}55;animation:drop .3s ease;max-width:90vw;font-family:var(--fh);backdrop-filter:blur(20px);border:1px solid ${s.c}55`;
  el.innerHTML = `<span style="font-size:20px">${a.icon}</span><span style="flex:1">${a.msg}</span><button onclick="this.parentElement.remove()" style="background:rgba(255,255,255,0.2);border:none;border-radius:6px;color:#fff;padding:3px 9px;cursor:pointer;font-weight:700">✕</button>`;
  document.body.appendChild(el);
  setTimeout(() => { try { el.remove(); } catch (e) { } }, 6000);
}

function showPhoneNotif(n) {
  const ov = document.getElementById("phov");
  if (!ov) return;
  ov.style.display = "flex";
  const s = SEV[n.sev];
  const c = document.getElementById("phn");
  c.insertAdjacentHTML("afterbegin", `<div class="nc">
    <div class="nc-h"><div class="nc-icon">🛡️</div><div class="nc-nm">KIDSHIELD</div><div class="nc-tm">${n.t}</div></div>
    <div class="nc-body">${n.msg.length > 62 ? n.msg.slice(0, 62) + "..." : n.msg}</div>
  </div>`);
  const old = c.querySelectorAll(".nc");
  if (old.length > 3) old[old.length - 1].remove();
}

// ─── DASHBOARD ──────────────────────────────────────────────
function rdDash() {
  const el = document.getElementById("pg-dashboard");
  const tot = allDevices().reduce((s, d) => s + d.screenTime, 0);
  const onD = onlineDevices();
  const ca = criticalAlerts().length;
  const tpts = Object.values(state.rewardPoints).reduce((a, b) => a + b, 0);
  el.innerHTML = `
  <div class="ph">
    <div><div class="ph-t">Tổng quan</div><div class="ph-s"><span class="live-dot"></span>&nbsp; ${now()} · ${nowDate()}</div></div>
    ${ca > 0 ? `<div class="crit-b">🔴 ${ca} cảnh báo khẩn <button class="btn bg bxs" onclick="go('alerts')" style="margin-left:6px">Xem →</button></div>` : ""}
  </div>
  <div class="g4" style="margin-bottom:16px">
    ${sc("📡", "Online", `${onD}/${allDevices().length}`, "Thiết bị", "var(--a)", onD / Math.max(allDevices().length, 1) * 100)}
    ${sc("⚡", "Cảnh báo", `${state.alerts.length}`, `${ca} khẩn`, "var(--r)", Math.min(state.alerts.length * 20, 100))}
    ${sc("⏱️", "Màn hình", fmtTime(tot), "Hôm nay tổng", "var(--w)", Math.min(tot / 720 * 100, 100))}
    ${sc("⭐", "Điểm thưởng", `${tpts}`, "Tổng tích luỹ", "var(--ok)", Math.min(tpts / 500 * 100, 100))}
  </div>
  <div class="g2" style="margin-bottom:16px">
    <div class="card">
      <div class="ct">Trạng thái trẻ</div>
      ${state.children.map(c => {
        const tot2 = c.devices.reduce((s, d) => s + d.screenTime, 0);
        const lim = c.devices.reduce((s, d) => s + d.limitMins, 0);
        const pct = Math.min(Math.round(tot2 / Math.max(lim, 1) * 100), 100);
        const bc = pct >= 90 ? "var(--r)" : pct >= 70 ? "var(--w)" : c.colorDesktop;
        const loc = state.locations[c.id];
        const cur = c.devices.find(d => d.online && d.currentApp);
        return `<div style="display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid var(--b0)">
          <div style="width:42px;height:42px;border-radius:13px;background:${c.colorDesktop}18;border:1px solid ${c.colorDesktop}30;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">${c.avatar}</div>
          <div style="flex:1">
            <div style="font-family:var(--fh);font-weight:700;font-size:14px;margin-bottom:2px">${c.name} <span style="font-size:10px;color:var(--t1);font-weight:400">${c.age}t · ${c.mood}</span></div>
            ${cur ? `<div style="font-size:11px;margin-bottom:5px;color:${RM[cur.appRisk].c}">${cur.currentApp} <span style="color:var(--t1)">trên ${cur.name}</span></div>` : `<div style="font-size:11px;color:var(--t1);margin-bottom:5px">Không hoạt động</div>`}
            <div class="pb"><div class="pbf" style="width:${pct}%;background:${bc}"></div></div>
            <div style="font-size:10px;color:var(--t1);font-family:var(--fm);margin-top:3px">${fmtTime(tot2)} / ${fmtTime(lim)} · ${pct}%</div>
          </div>
          ${loc ? `<div style="font-size:10px;color:${loc.ok ? "var(--ok)" : "var(--r)"};text-align:right;font-family:var(--fm)">${loc.ok ? "📍" : "⚠️"}<br>${loc.zone}</div>` : ""}
        </div>`;
      }).join("")}
    </div>
    <div class="card c-glow-a">
      <div class="ct" style="color:var(--a)">✦ AI Nhận xét</div>
      <div style="display:flex;flex-direction:column;gap:9px">
        ${[
          { c: "var(--r)", n: "Bé Minh", b: "Dùng TikTok 2h30m — tăng 40% vs tuần trước. Đề xuất giảm giới hạn 45p/ngày." },
          { c: "var(--ok)", n: "Bé Lan", b: "Khan Academy đều 45p/ngày trong 5 ngày. Nên thưởng thêm điểm động lực!" },
          { c: "var(--w)", n: "Bé Tuấn", b: "Chơi game sau 22:00 trong 3/7 ngày. Bật khoá tự động giờ ngủ." },
        ].map(x => `<div style="background:${x.c}0c;border:1px solid ${x.c}22;border-left:3px solid ${x.c};border-radius:9px;padding:10px 12px">
          <div style="font-size:11px;font-weight:700;color:${x.c};font-family:var(--fh);margin-bottom:3px">${x.n}</div>
          <div style="font-size:12px;color:var(--t1);line-height:1.55">${x.b}</div>
        </div>`).join("")}
      </div>
      <button class="btn ba bsm" style="margin-top:12px;width:100%" onclick="go('ai')">Xem phân tích đầy đủ →</button>
    </div>
  </div>
  <div class="card">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <div class="ct" style="margin-bottom:0">Bản đồ hoạt động hôm nay (24h)</div>
      <div style="display:flex;gap:8px;font-size:9px;color:var(--t1);font-family:var(--fm)"><span>░ thấp</span><span>▓ TB</span><span>█ cao</span></div>
    </div>
    ${hRow("Tổng hợp", state.heatmaps[0], "#5b6ef5")}
    <div style="height:8px"></div>
    ${state.children.map(c => hRow(c.avatar + " " + c.name, state.heatmaps[c.id] || state.heatmaps[1], c.colorDesktop)).join("<div style='height:5px'></div>")}
    <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--t2);font-family:var(--fm);margin-top:6px;padding:0 2px"><span>00h</span><span>06h</span><span>12h</span><span>18h</span><span>23h</span></div>
  </div>`;
}

function sc(icon, label, val, sub, color, pct) {
  return `<div class="stat"><div class="stat-i">${icon}</div><div class="stat-v" style="color:${color}">${val}</div><div class="stat-l">${label}</div><div class="stat-s">${sub}</div><div class="stat-bar"><div class="stat-bf" style="width:${Math.min(pct, 100)}%;background:${color}"></div></div><div class="stat-glow" style="background:${color}"></div></div>`;
}
function hRow(lbl, data, col) {
  const hex = ["0a", "16", "26", "3a", "55", "75"];
  return `<div style="margin-bottom:5px"><div style="font-size:10px;color:var(--t1);font-family:var(--fm);margin-bottom:4px">${lbl}</div>
  <div class="hmap">${data.map((v, h) => `<div class="hmc" style="background:${col}${hex[Math.min(5, Math.floor(v * 6))]}" data-tip="${h}:00 — ${Math.round(v * 100)}%"></div>`).join("")}</div></div>`;
}

// ─── DEVICES ─────────────────────────────────────────────
function rdDevices() {
  const el = document.getElementById("pg-devices");
  el.innerHTML = `<div class="ph"><div><div class="ph-t">Thiết bị</div><div class="ph-s">${onlineDevices()}/${allDevices().length} online hôm nay</div></div><div class="ph-a"><button class="btn br bsm" onclick="lockAll()">🔒 Khoá tất cả</button><button class="btn bg bsm" onclick="unlockAll()">🔓 Mở tất cả</button></div></div>
  <div class="gc">${state.children.map(c => {
    const tot = c.devices.reduce((s, d) => s + d.screenTime, 0);
    return `<div class="card" style="border-color:${c.colorDesktop}22">
      <div style="display:flex;align-items:center;gap:12px;padding-bottom:14px;margin-bottom:14px;border-bottom:1px solid var(--b0)">
        <div style="width:42px;height:42px;border-radius:13px;background:${c.colorDesktop}18;border:1px solid ${c.colorDesktop}30;display:flex;align-items:center;justify-content:center;font-size:22px">${c.avatar}</div>
        <div style="flex:1"><div style="font-family:var(--fh);font-weight:700;font-size:14px">${c.name}</div><div style="font-size:11px;color:var(--t1);font-family:var(--fm)">${c.devices.length} thiết bị · ${fmtTime(tot)} hôm nay</div></div>
        <span style="font-size:20px">${c.mood}</span>
      </div>
      <div class="gc" style="gap:9px">${c.devices.map(d => devRow(d, c)).join("")}</div>
    </div>`;
  }).join("")}</div>`;
}

function devRow(d, c) {
  const lk = state.lockedDevices.has(d.id);
  const pct = Math.min(Math.round(d.screenTime / Math.max(d.limitMins, 1) * 100), 100);
  const bc = pct >= 90 ? "var(--r)" : pct >= 70 ? "var(--w)" : c.colorDesktop;
  const risk = d.appRisk ? RM[d.appRisk] : null;
  return `<div class="dc ${lk ? "lk" : ""}">
    <div style="display:flex;align-items:center;gap:11px">
      <div class="dci" style="background:${lk ? "rgba(244,63,94,0.1)" : c.colorDesktop + "15"};border:1px solid ${lk ? "rgba(244,63,94,0.25)" : c.colorDesktop + "30"}">${d.icon}</div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:5px">
          <span style="font-family:var(--fh);font-weight:700;font-size:13px">${d.name}</span>
          <span style="font-size:9px;color:var(--t1);font-family:var(--fm)">${d.os}</span>
          ${lk ? `<span class="chip chip-high" style="font-size:9px">🔒 Khoá</span>` : ""}
          <div style="margin-left:auto">${battH(d.battery)}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:7px">
          <div style="display:flex;align-items:center;gap:4px">
            <div style="width:5px;height:5px;border-radius:50%;background:${d.online ? "var(--ok)" : "var(--t2)"};${d.online ? "box-shadow:0 0 5px var(--ok)" : ""}"></div>
            <span style="font-size:11px;color:${d.online ? "var(--ok)" : "var(--t1)"}">${d.online ? "Online" : "Offline"}</span>
          </div>
          ${d.currentApp && risk ? `<span class="chip chip-${d.appRisk}">${d.currentApp}</span>` : ""}
        </div>
        <div style="display:flex;justify-content:space-between;font-size:10px;font-family:var(--fm);color:var(--t1);margin-bottom:4px"><span>${fmtTime(d.screenTime)} / ${fmtTime(d.limitMins)}</span><span style="color:${pct >= 90 ? "var(--r)" : pct >= 70 ? "var(--w)" : "var(--t1)"}">${pct}%</span></div>
        <div class="pb"><div class="pbf" style="width:${pct}%;background:${bc}"></div></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:5px;flex-shrink:0">
        <button class="btn ${lk ? "bok" : "br"} bsm" onclick="tglD('${d.id}')">${lk ? "🔓 Mở" : "🔒 Khoá"}</button>
      </div>
    </div>
  </div>`;
}

function battH(p) {
  if (p === null) return `<span style="font-size:10px;color:var(--t1)">🔌</span>`;
  const c = p < 20 ? "var(--r)" : p < 50 ? "var(--w)" : "var(--ok)";
  return `<div class="batt" style="color:${c}"><div class="batt-b"><div class="batt-tip"></div><div class="batt-f" style="width:${p}%;background:currentColor"></div></div><span style="font-size:10px;font-weight:700;font-family:var(--fm)">${p}%</span></div>`;
}

function tglD(id) {
  state.lockedDevices.has(id) ? state.lockedDevices.delete(id) : state.lockedDevices.add(id);
  const d = getDevice(id);
  toast((state.lockedDevices.has(id) ? "🔒 Khoá " : "🔓 Mở ") + d.name, state.lockedDevices.has(id) ? "warning" : "success");
  render();
}
function lockAll() { allDevices().forEach(d => state.lockedDevices.add(d.id)); toast("🔒 Đã khoá tất cả", "danger"); render(); }
function unlockAll() { state.lockedDevices.clear(); toast("🔓 Đã mở tất cả", "success"); render(); }

// ─── APPS ─────────────────────────────────────────────────
function rdApps() {
  const el = document.getElementById("pg-apps");
  const cats = ["all", ...new Set(APPS.map(a => a.category))];
  const list = state.appFilter === "all" ? APPS : APPS.filter(a => a.category === state.appFilter);
  el.innerHTML = `<div class="ph"><div><div class="ph-t">Ứng dụng</div><div class="ph-s">Khoá áp dụng tất cả thiết bị · ${state.lockedApps.size} đang khoá</div></div><button class="btn br bsm" onclick="lockHighRisk()">🔒 Khoá app nguy hiểm</button></div>
  <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px">${cats.map(c => `<button class="btn ${state.appFilter === c ? "ba" : "bg"} bsm" onclick="state.appFilter='${c}';rdApps()">${c === "all" ? "Tất cả" : c}</button>`).join("")}</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px">
    ${list.map(a => {
      const lk = state.lockedApps.has(a.id);
      const r = RM[a.risk];
      return `<div style="background:${lk ? "rgba(244,63,94,0.04)" : "var(--glass)"};border:1px solid ${lk ? "rgba(244,63,94,0.15)" : "var(--b0)"};border-radius:14px;padding:13px 15px;display:flex;align-items:center;gap:11px;opacity:${lk ? .68 : 1}">
      <div style="width:42px;height:42px;border-radius:12px;background:${a.color}18;border:1px solid ${a.color}28;display:flex;align-items:center;justify-content:center;font-size:22px;filter:${lk ? "grayscale(.5)" : ""}">${a.icon}</div>
      <div style="flex:1"><div style="font-family:var(--fh);font-weight:700;font-size:13px;margin-bottom:4px">${a.name}</div>
      <div style="display:flex;gap:5px"><span class="chip chip-${a.risk}">${r.l}</span><span style="font-size:10px;color:var(--t1)">${a.category}</span></div></div>
      <button class="btn ${lk ? "bok" : "br"} bsm" onclick="tglA(${a.id})">${lk ? "🔓" : "🔒"}</button></div>`;
    }).join("")}</div>`;
}
function tglA(id) {
  state.lockedApps.has(id) ? state.lockedApps.delete(id) : state.lockedApps.add(id);
  const a = APPS.find(x => x.id === id);
  toast((state.lockedApps.has(id) ? "🔒 Khoá " : "🔓 Mở ") + a.name, state.lockedApps.has(id) ? "warning" : "success");
  render();
}
function lockHighRisk() { APPS.filter(a => a.risk === "high").forEach(a => state.lockedApps.add(a.id)); toast("🔒 Khoá app nguy hiểm", "danger"); rdApps(); }

// ─── ALERTS ───────────────────────────────────────────────
function rdAlerts() {
  const el = document.getElementById("pg-alerts");
  const sevs = ["all", "critical", "high", "medium", "low"];
  const list = state.alertFilter === "all" ? state.alerts : state.alerts.filter(a => a.severity === state.alertFilter);
  el.innerHTML = `<div class="ph"><div><div class="ph-t">Cảnh báo</div><div class="ph-s">${state.alerts.length} tổng · ${criticalAlerts().length} khẩn cấp</div></div><button class="btn bg bsm" onclick="state.alerts=[];render()">🗑️ Xoá tất cả</button></div>
  <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px">${sevs.map(s => `<button class="btn ${state.alertFilter === s ? "ba" : "bg"} bsm" onclick="state.alertFilter='${s}';rdAlerts()">${s === "all" ? "Tất cả" : SEV[s]?.l || s}</button>`).join("")}</div>
  ${!list.length ? `<div style="text-align:center;padding:60px 0;color:var(--t2)"><div style="font-size:48px;margin-bottom:12px">✅</div><div style="font-family:var(--fh);font-size:18px">Không có cảnh báo</div></div>` :
    list.map(a => {
      const c = getChild(a.childId);
      const s = SEV[a.severity];
      return `<div style="background:${s.c}07;border:1px solid ${s.c}22;border-left:4px solid ${s.c};border-radius:14px;padding:14px 16px;margin-bottom:9px;display:flex;gap:12px;align-items:flex-start" onmouseover="this.style.transform='translateX(3px)'" onmouseout="this.style.transform=''">
        <span style="font-size:22px;flex-shrink:0">${a.icon}</span>
        <div style="flex:1">
          <div style="font-weight:600;font-size:14px;margin-bottom:4px">${a.msg}</div>
          <div style="font-size:11px;color:var(--t1);display:flex;gap:10px;flex-wrap:wrap;font-family:var(--fm)"><span>🕐 ${a.time}</span><span>${c?.avatar} ${c?.name}</span><span>📱 ${a.app}</span></div>
          <div style="display:flex;gap:7px;margin-top:10px;flex-wrap:wrap">
            <button class="btn br bsm" onclick="lkFromAlert('${a.deviceId}',${a.id})">🔒 Khoá</button>
            <button class="btn ba bsm" onclick="notifAlert(${a.id})">📳 Báo</button>
            <button class="btn bg bsm" onclick="rmAlert(${a.id})">✓ Bỏ qua</button>
          </div>
        </div>
        <span class="chip" style="background:${s.c}18;color:${s.c};border:1px solid ${s.c}28;flex-shrink:0">${s.l}</span>
      </div>`;
    }).join("")}`;
}
function rmAlert(id) { state.alerts = state.alerts.filter(a => a.id !== id); render(); }
function lkFromAlert(did, aid) { tglD(did); rmAlert(aid); }
function notifAlert(id) { const a = state.alerts.find(x => x.id === id); if (a) sendNotification(a, true); }

// ─── SCHEDULE ─────────────────────────────────────────────
function rdSched() {
  const el = document.getElementById("pg-schedule");
  const c = getChild(state.scheduleChildId);
  const slots = (state.schedules[state.scheduleChildId]?.[state.scheduleDay]) || [];
  el.innerHTML = `<div class="ph"><div><div class="ph-t">Lịch sử dụng</div><div class="ph-s">Khung giờ cho phép / chặn theo ngày</div></div></div>
  <div class="g2">
    <div class="gc">
      <div class="card"><div class="ct">Chọn trẻ</div><div style="display:flex;gap:7px;flex-wrap:wrap">${state.children.map(c => `<button class="btn ${state.scheduleChildId === c.id ? "ba" : "bg"} bsm" onclick="state.scheduleChildId=${c.id};rdSched()">${c.avatar} ${c.name}</button>`).join("")}</div></div>
      <div class="card"><div class="ct">Ngày trong tuần</div><div style="display:flex;gap:6px;flex-wrap:wrap">${DAYS.map(d => `<button class="btn ${state.scheduleDay === d ? "ba" : "bg"} bsm" onclick="state.scheduleDay='${d}';rdSched()">${DAY_VN[d]}</button>`).join("")}</div></div>
      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px"><div class="ct" style="margin-bottom:0">Khung giờ ${DAY_VN[state.scheduleDay]}</div><button class="btn ba bsm" onclick="addSlot()">➕ Thêm</button></div>
        ${slots.length ? slots.map((s, i) => `<div class="slot ${s.a ? "allow" : "block"}">
          <span style="font-size:15px">${s.a ? "✅" : "🚫"}</span>
          <span style="font-family:var(--fm);font-size:12px;font-weight:600;flex:1">${s.s} – ${s.e}</span>
          <span style="font-size:11px;color:var(--t1)">${s.a ? "Cho phép" : "Chặn"}</span>
          <button class="btn bg bxs" onclick="rmSlot(${i})" style="color:var(--r)">✕</button>
        </div>`).join("") : `<div style="text-align:center;padding:20px;color:var(--t2);font-size:12px">Chưa có lịch cho ${DAY_VN[state.scheduleDay]}</div>`}
      </div>
    </div>
    <div class="gc">
      <div class="card">
        <div class="ct">Lịch tuần — ${c?.avatar} ${c?.name}</div>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">
          ${DAYS.map(d => `<div style="text-align:center;font-size:9px;color:var(--t1);font-family:var(--fh);padding-bottom:4px">${DAY_VN[d]}</div>`).join("")}
          ${DAYS.map(d => { const ss = (state.schedules[state.scheduleChildId]?.[d]) || []; return `<div style="background:${ss.length ? "rgba(91,110,245,0.07)" : "rgba(255,255,255,0.02)"};border:1px solid ${ss.length ? "rgba(91,110,245,0.18)" : "var(--b0)"};border-radius:7px;min-height:55px;padding:3px;display:flex;flex-direction:column;gap:2px">${ss.map(sl => `<div style="background:${sl.a ? "rgba(16,217,138,0.2)" : "rgba(244,63,94,0.14)"};border-radius:3px;padding:1px 3px;font-size:7px;font-family:var(--fm);color:${sl.a ? "var(--ok)" : "var(--r)"}">${sl.s}</div>`).join("")}</div>`; }).join("")}
        </div>
      </div>
      <div class="card c-glow-a">
        <div class="ct">⚡ Áp dụng nhanh</div>
        <div class="gc" style="gap:7px">
          ${[
            { i: "🎒", n: "Học sinh tiểu học", d: "T2-6: 15:00-18:00, khoá sau 21:00" },
            { i: "🌞", n: "Cuối tuần lành mạnh", d: "T7,CN: 9:00-12:00 + 14:00-18:00" },
            { i: "📵", n: "Khoá đêm tự động", d: "Tất cả: khoá sau 21:00" }
          ].map(t => `<div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--glass);border:1px solid var(--b0);border-radius:9px">
            <span style="font-size:19px">${t.i}</span>
            <div style="flex:1"><div style="font-size:12px;font-weight:600">${t.n}</div><div style="font-size:10px;color:var(--t1)">${t.d}</div></div>
            <button class="btn ba bxs" onclick="toast('✅ Đã áp dụng: ${t.n}','success')">Áp dụng</button>
          </div>`).join("")}
        </div>
      </div>
    </div>
  </div>`;
}
function addSlot() {
  if (!state.schedules[state.scheduleChildId]) state.schedules[state.scheduleChildId] = {};
  if (!state.schedules[state.scheduleChildId][state.scheduleDay]) state.schedules[state.scheduleChildId][state.scheduleDay] = [];
  state.schedules[state.scheduleChildId][state.scheduleDay].push({ s: "15:00", e: "17:00", a: true });
  toast("✅ Đã thêm khung giờ", "success");
  rdSched();
}
function rmSlot(i) { state.schedules[state.scheduleChildId][state.scheduleDay].splice(i, 1); rdSched(); }

// ─── AI ───────────────────────────────────────────────────
function rdAi() {
  const el = document.getElementById("pg-ai");
  el.innerHTML = `<div class="ph"><div><div class="ph-t">AI Phân tích</div><div class="ph-s">Phân tích hành vi · Tư vấn · Dự đoán</div></div></div>
  <div class="itabs">
    <button class="itab ${state.aiTab === "analysis" ? "on" : ""}" onclick="state.aiTab='analysis';rdAi()">📊 Phân tích</button>
    <button class="itab ${state.aiTab === "chat" ? "on" : ""}" onclick="state.aiTab='chat';rdAi()">💬 Hỏi AI</button>
    <button class="itab ${state.aiTab === "predict" ? "on" : ""}" onclick="state.aiTab='predict';rdAi()">🔮 Dự đoán</button>
  </div>
  <div id="ai-inner"></div>`;
  if (state.aiTab === "analysis") aiAnal();
  if (state.aiTab === "chat") aiChatUI();
  if (state.aiTab === "predict") aiPred();
}
function aiAnal() {
  document.getElementById("ai-inner").innerHTML = `
  <div class="g2" style="margin-bottom:16px">
    <div class="card">
      <div class="ct">Xu hướng 7 ngày</div>
      ${state.children.map(c => { const mx = Math.max(...state.weekData[c.id], 1); return `<div style="margin-bottom:14px">
        <div style="font-size:11px;font-weight:700;color:${c.colorDesktop};font-family:var(--fh);margin-bottom:5px">${c.avatar} ${c.name}</div>
        <div class="bars">${state.weekData[c.id].map((v, i) => `<div class="bar" style="height:${Math.round(v / mx * 100)}%;background:linear-gradient(to top,${c.colorDesktop}88,${c.colorDesktop})"></div>`).join("")}</div>
        <div style="display:flex;justify-content:space-between;font-size:8px;color:var(--t2);font-family:var(--fm);margin-top:3px">${DAYS.map(d => `<span>${DAY_VN[d]}</span>`).join("")}</div>
      </div>`; }).join("")}
    </div>
    <div class="card">
      <div class="ct">Sức khoẻ kỹ thuật số</div>
      ${state.children.map(c => { const sc = { 1: 68, 2: 92, 3: 45 }[c.id]; const col = sc >= 80 ? "var(--ok)" : sc >= 60 ? "var(--w)" : "var(--r)"; const g = sc >= 80 ? "A" : sc >= 60 ? "B" : "C"; return `<div style="display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid var(--b0)">
        <span style="font-size:26px">${c.avatar}</span>
        <div style="flex:1"><div style="font-family:var(--fh);font-weight:700;font-size:13px;margin-bottom:6px">${c.name}</div>
          <div class="pb" style="height:6px"><div class="pbf" style="width:${sc}%;background:linear-gradient(90deg,${col}55,${col})"></div></div></div>
        <div style="text-align:center"><div style="font-size:28px;font-weight:800;color:${col};font-family:var(--fh);line-height:1">${g}</div><div style="font-size:9px;color:var(--t1);font-family:var(--fm)">${sc}/100</div></div>
      </div>`; }).join("")}
    </div>
  </div>`;
}
function aiChatUI() {
  document.getElementById("ai-inner").innerHTML = `<div class="card" style="display:flex;flex-direction:column;min-height:480px">
    <div style="flex:1;overflow-y:auto;display:flex;flex-direction:column;max-height:380px;padding-bottom:12px" id="cwrap">
      ${state.aiChat.map(m => `<div class="aib ${m.r === "ai" ? "bot" : "user"}">${m.m}</div>`).join("")}
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;border-top:1px solid var(--b0);padding-top:11px;margin-bottom:9px">
      ${["Phân tích Bé Minh", "Lời khuyên TikTok", "Bé Tuấn cần gì?", "Giới hạn phù hợp"].map(q => `<button class="btn bg bxs" onclick="sendAI('${q}')">${q}</button>`).join("")}
    </div>
    <div style="display:flex;gap:8px">
      <input class="inp" id="ai-inp" placeholder="Hỏi AI về con bạn..." style="flex:1" onkeydown="if(event.key==='Enter'){const v=this.value.trim();if(v){sendAI(v);this.value=''}}">
      <button class="btn ba" onclick="const v=document.getElementById('ai-inp').value.trim();if(v){sendAI(v);document.getElementById('ai-inp').value=''}">Gửi →</button>
    </div>
  </div>`;
  const cw = document.getElementById("cwrap"); if (cw) cw.scrollTop = cw.scrollHeight;
}
async function sendAI(msg) {
  state.aiChat.push({ r: "user", m: msg });
  state.aiChat.push({ r: "ai", m: "⏳ Đang phân tích..." });
  aiChatUI();
  const ctx = state.children.map(c => `${c.name}(${c.age}t):${c.devices.map(d => `${d.name}->${fmtTime(d.screenTime)}/${fmtTime(d.limitMins)},app:${d.currentApp || "rảnh"}`).join(";")}`).join("|");
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 800,
        system: `Bạn là AI trợ lý KidShield. Dữ liệu hôm nay: ${ctx}. Trả lời ngắn gọn bằng tiếng Việt.`,
        messages: [{ role: "user", content: msg }]
      })
    });
    const data = await res.json();
    state.aiChat.pop();
    state.aiChat.push({ r: "ai", m: data.content?.[0]?.text || "Không thể phân tích lúc này." });
  } catch (e) {
    state.aiChat.pop();
    state.aiChat.push({ r: "ai", m: "⚠️ Lỗi kết nối AI." });
  }
  aiChatUI();
}
function aiPred() {
  document.getElementById("ai-inner").innerHTML = `<div class="gc">${[
    { av: "👦", n: "Bé Minh", col: "var(--w)", items: ["85% khả năng vượt giới hạn TikTok", "Màn hình tăng 20% cuối tuần", "Rủi ro nội dung cao"] },
    { av: "👧", n: "Bé Lan", col: "var(--ok)", items: ["90% đạt mục tiêu học tuần", "Xu hướng tốt", "Thưởng +15 điểm"] },
    { av: "🧒", n: "Bé Tuấn", col: "var(--r)", items: ["Gaming đêm thành thói quen", "Ảnh hưởng học 2 tuần", "Đề xuất họp gia đình"] },
  ].map(p => `<div class="card" style="border-color:${p.col}22">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
      <span style="font-size:26px">${p.av}</span>
      <div style="font-family:var(--fh);font-weight:700;font-size:15px">${p.n}</div>
    </div>
    <div class="gc" style="gap:7px">${p.items.map(i => `<div style="display:flex;gap:8px;font-size:12px;color:var(--t1);line-height:1.55"><span style="color:${p.col};flex-shrink:0;font-weight:700">→</span>${i}</div>`).join("")}</div>
  </div>`).join("")}</div>`;
}

// ─── REWARDS ──────────────────────────────────────────────
function rdRewards() {
  const el = document.getElementById("pg-rewards");
  el.innerHTML = `<div class="ph"><div><div class="ph-t">Phần thưởng</div><div class="ph-s">Khuyến khích hành vi lành mạnh</div></div></div>
  <div class="g2">
    <div class="gc">
      <div class="card">
        <div class="ct">Điểm tích luỹ</div>
        ${state.children.map(c => { const pts = state.rewardPoints[c.id] || 0; const ah = state.achievements[c.id] || []; const earned = ah.filter(a => a.e).length; return `<div class="rwcard" style="margin-bottom:10px">
          <div style="display:flex;align-items:center;gap:11px;margin-bottom:10px">
            <span style="font-size:27px">${c.avatar}</span>
            <div style="flex:1"><div style="font-family:var(--fh);font-weight:700;font-size:14px">${c.name}</div><div style="font-size:22px;font-weight:800;color:var(--w);font-family:var(--fh);line-height:1.2">${pts}<span style="font-size:15px"> ⭐</span></div></div>
            <div style="display:flex;flex-direction:column;gap:4px">
              <button class="btn bok bxs" onclick="addPts(${c.id},10)">+10</button>
              <button class="btn bxs" style="background:rgba(244,63,94,0.08);color:var(--r);border:1px solid rgba(244,63,94,0.2)" onclick="addPts(${c.id},-10)">-10</button>
            </div>
          </div>
          <div style="display:flex;gap:3px;margin-bottom:6px">${Array.from({ length: 10 }, (_, i) => `<span class="star" style="opacity:${i < Math.floor(pts / 30) ? 1 : .18}">⭐</span>`).join("")}</div>
          <div style="font-size:10px;color:var(--t1);font-family:var(--fm)">${earned}/${ah.length} huy hiệu</div>
        </div>`; }).join("")}
      </div>
      <div class="card">
        <div class="ct">Huy hiệu thành tích</div>
        ${state.children.map(c => `<div style="margin-bottom:14px">
          <div style="font-size:11px;font-weight:700;color:${c.colorDesktop};font-family:var(--fh);margin-bottom:8px">${c.avatar} ${c.name}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">${(state.achievements[c.id] || []).map(a => `<div style="text-align:center;opacity:${a.e ? 1 : .25}" title="${a.n}">
            <div style="width:44px;height:44px;border-radius:12px;background:${a.e ? "rgba(245,158,11,0.14)" : "var(--glass)"};border:1px solid ${a.e ? "rgba(245,158,11,0.32)" : "var(--b0)"};display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:3px">${a.i}</div>
            <div style="font-size:8px;color:var(--t1);width:44px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${a.n}</div>
          </div>`).join("")}</div>
        </div>`).join("")}
      </div>
    </div>
    <div class="gc">
      <div class="card">
        <div class="ct">🎁 Đổi phần thưởng</div>
        <div class="gc" style="gap:8px">${state.rewards.map(r => `<div style="display:flex;align-items:center;gap:11px;padding:11px;background:var(--glass);border:1px solid var(--b0);border-radius:12px">
          <span style="font-size:24px">${r.icon}</span>
          <div style="flex:1"><div style="font-weight:600;font-size:13px">${r.name}</div><div style="font-size:12px;color:var(--w);font-weight:700;font-family:var(--fh)">${r.cost} ⭐</div></div>
          <select onchange="redeem('${r.id}',this.value);this.value=''" style="padding:5px 8px;background:var(--s1);border:1px solid var(--b0);border-radius:7px;color:var(--t0);font-size:11px;cursor:pointer">
            <option value="">Đổi cho...</option>
            ${state.children.map(c => `<option value="${c.id}" ${(state.rewardPoints[c.id] || 0) < r.cost ? "disabled" : ""}>${c.avatar} ${c.name} (${state.rewardPoints[c.id] || 0}⭐)</option>`).join("")}
          </select>
        </div>`).join("")}
        </div>
      </div>
      <div class="card c-glow-a">
        <div class="ct">Quy tắc tích điểm tự động</div>
        ${[{ i: "📚", r: "Dùng app học 30+ phút", p: "+10 ⭐", c: "var(--ok)" }, { i: "✅", r: "Tuân thủ giới hạn giờ", p: "+5 ⭐", c: "var(--a3)" }, { i: "🌙", r: "Không dùng trước ngủ", p: "+15 ⭐", c: "var(--a)" }, { i: "🚫", r: "Mở app cấm", p: "-20 ⭐", c: "var(--r)" }, { i: "⏰", r: "Vượt giới hạn", p: "-10 ⭐", c: "var(--w)" }].map(r => `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--b0)">
          <span style="font-size:17px">${r.i}</span><div style="flex:1;font-size:12px">${r.r}</div>
          <div style="font-weight:700;font-size:13px;color:${r.c};font-family:var(--fh)">${r.p}</div>
        </div>`).join("")}
      </div>
    </div>
  </div>`;
}
function addPts(id, n) { state.rewardPoints[id] = Math.max(0, (state.rewardPoints[id] || 0) + n); toast(`${n > 0 ? "✅ +" : "❌ -"}${Math.abs(n)} điểm cho ${getChild(id)?.name}`, n > 0 ? "success" : "warning"); rdRewards(); }
function redeem(rid, cid) { if (!cid) return; const r = state.rewards.find(x => x.id === rid); const id = parseInt(cid); if (!r || !id) return; if ((state.rewardPoints[id] || 0) < r.cost) { toast("❌ Không đủ điểm", "danger"); return; } state.rewardPoints[id] -= r.cost; toast(`🎁 ${getChild(id)?.name} đổi: ${r.name}!`, "success"); rdRewards(); }

// ─── GEO ──────────────────────────────────────────────────
function rdGeo() {
  const el = document.getElementById("pg-geo");
  el.innerHTML = `<div class="ph"><div><div class="ph-t">Vị trí & Vùng</div><div class="ph-s">Theo dõi GPS · Geofencing</div></div></div>
  <div class="g2">
    <div class="gc">
      <div class="card">
        <div class="ct">Bản đồ vị trí</div>
        <div class="geo-map">
          <div class="geo-grid"></div>
          ${state.geofences.filter(g => g.enabled).map(g => `<div class="gz" style="width:${g.r * 2.3}px;height:${g.r * 2.3}px;left:${g.x * 2.3}px;top:${g.y * 1.56}px;background:${g.color}12;border:1.5px solid ${g.color}42"></div>`).join("")}
          ${state.geofences.filter(g => g.enabled).map(g => `<div class="gpin" style="left:${g.x * 2.3}px;top:${g.y * 1.56}px" title="${g.name}">${g.icon}</div>`).join("")}
          ${state.children.map(c => { const l = state.locations[c.id]; return `<div class="gpin" style="left:${l.x * 2.3}px;top:${l.y * 1.56}px;font-size:16px" title="${c.name}: ${l.zone}">${c.avatar}</div>`; }).join("")}
          <div style="position:absolute;bottom:7px;right:8px;font-size:9px;color:var(--t2);font-family:var(--fm);background:rgba(0,0,0,.5);padding:2px 6px;border-radius:4px">Mô phỏng GPS</div>
        </div>
        <div class="gc" style="gap:7px;margin-top:10px">
          ${state.children.map(c => { const l = state.locations[c.id]; return `<div class="csm" style="border-color:${l.ok ? "rgba(16,217,138,0.2)" : "rgba(244,63,94,0.2)"}">
            <div style="display:flex;align-items:center;gap:10px">
              <span style="font-size:20px">${c.avatar}</span>
              <div style="flex:1"><div style="font-weight:600;font-size:13px">${c.name}</div><div style="font-size:11px;color:${l.ok ? "var(--ok)" : "var(--r)"}">${l.ok ? "📍" : "⚠️"} ${l.zone}</div></div>
              <div style="font-size:10px;color:var(--t1);font-family:var(--fm)">${l.time}</div>
            </div>
          </div>`; }).join("")}
        </div>
      </div>
    </div>
    <div class="gc">
      <div class="card">
        <div class="ct">Vùng an toàn</div>
        <div class="gc" style="gap:8px">
          ${state.geofences.map(g => `<div style="background:var(--glass);border:1px solid ${g.color}22;border-radius:12px;padding:12px 14px">
            <div style="display:flex;align-items:center;gap:10px">
              <span style="font-size:21px">${g.icon}</span>
              <div style="flex:1"><div style="font-weight:700;font-size:13px;font-family:var(--fh)">${g.name}</div><div style="font-size:10px;color:var(--t1);font-family:var(--fm)">Bán kính ~${g.r * 10}m</div></div>
              <label style="display:flex;align-items:center;gap:5px;cursor:pointer"><input type="checkbox" ${g.enabled ? "checked" : ""} onchange="(function(){const g=state.geofences.find(x=>x.id==='${g.id}');g.enabled=!g.enabled;rdGeo();})()"><span style="font-size:11px;color:${g.enabled ? "var(--ok)" : "var(--t1)"}">${g.enabled ? "Bật" : "Tắt"}</span></label>
            </div>
          </div>`).join("")}
        </div>
      </div>
    </div>
  </div>`;
}

// ─── REPORTS ──────────────────────────────────────────────
function rdReports() {
  const el = document.getElementById("pg-reports");
  const tot = allDevices().reduce((s, d) => s + d.screenTime, 0);
  el.innerHTML = `<div class="ph"><div><div class="ph-t">Báo cáo tuần</div><div class="ph-s">Tổng kết & xu hướng</div></div><button class="btn ba bsm" onclick="toast('📥 Xuất PDF...','info')">📥 Xuất PDF</button></div>
  <div class="g3" style="margin-bottom:16px">${sc("⏱️", "Màn hình", fmtTime(tot * 7), "Tuần này", "var(--w)", 70)}${sc("🔔", "Cảnh báo", "23", "5 khẩn", "var(--r)", 46)}${sc("⭐", "Điểm thưởng", "320", "+85", "var(--ok)", 64)}</div>
  <div class="g2">
    <div class="card">
      <div class="ct">App dùng nhiều nhất</div>
      ${[{ a: "TikTok", i: "🎵", c: "#ff0050", t: "15h 20p", p: 90 }, { a: "PUBG", i: "🎮", c: "#f7b731", t: "12h 45p", p: 76 }, { a: "YouTube", i: "▶️", c: "#ff0000", t: "8h 10p", p: 49 }, { a: "Khan Academy", i: "📚", c: "#10b981", t: "5h 15p", p: 31 }].map(a => `<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <span style="font-size:18px">${a.i}</span>
        <div style="flex:1">
          <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:600;margin-bottom:4px"><span>${a.a}</span><span style="color:var(--t1);font-family:var(--fm)">${a.t}</span></div>
          <div class="pb"><div class="pbf" style="width:${a.p}%;background:${a.c}"></div></div>
        </div>
      </div>`).join("")}
    </div>
    <div class="card">
      <div class="ct">So sánh tuần trước</div>
      ${state.children.map((c, i) => { const ch = [-20, +15, +45][i]; return `<div style="display:flex;align-items:center;gap:12px;padding:10px;background:var(--glass);border:1px solid var(--b0);border-radius:11px;margin-bottom:8px">
        <span style="font-size:22px">${c.avatar}</span>
        <div style="flex:1"><div style="font-weight:600;font-size:13px;font-family:var(--fh)">${c.name}</div><div style="font-size:10px;color:var(--t1);font-family:var(--fm)">${fmtTime(state.weekData[c.id].reduce((a, b) => a + b, 0))} tuần này</div></div>
        <div style="font-weight:800;font-size:16px;font-family:var(--fh);color:${ch > 0 ? "var(--r)" : "var(--ok)"}">${ch > 0 ? "+" : ""}${ch}p</div>
      </div>`; }).join("")}
    </div>
  </div>`;
}

// ─── NOTIFY ───────────────────────────────────────────────
function rdNotify() {
  const el = document.getElementById("pg-notify");
  const stC = { unconfigured: "var(--t1)", testing: "var(--w)", ok: "var(--ok)", error: "var(--r)" };
  const stL = { unconfigured: "CHƯA CÀI", testing: "TESTING...", ok: "✅ LIVE", error: "❌ LỖI" };
  el.innerHTML = `<div class="ph"><div><div class="ph-t">Thông báo</div><div class="ph-s">Gửi thật qua Google Apps Script</div></div><div class="ph-a"><button class="btn br bsm" onclick="sendTestNotification()">📳 Gửi thử</button></div></div>
  <div class="gc">
    <div class="card ${state.scriptStatus === "ok" ? "c-glow-ok" : state.scriptStatus === "error" ? "c-glow-r" : "c-glow-a"}">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:13px">
        <span style="font-size:22px">${state.scriptStatus === "ok" ? "✅" : state.scriptStatus === "error" ? "❌" : "🔧"}</span>
        <div style="flex:1"><div style="font-family:var(--fh);font-weight:700;font-size:14px">Google Apps Script URL</div><div style="font-size:11px;color:var(--t1);margin-top:2px">Dán URL để bật gửi email/SMS thật</div></div>
        <span class="chip" style="background:${stC[state.scriptStatus]}18;color:${stC[state.scriptStatus]};border:1px solid ${stC[state.scriptStatus]}28;font-family:var(--fm)">${stL[state.scriptStatus]}</span>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:13px">
        <input class="inp" id="su-inp" value="${state.scriptUrl}" placeholder="https://script.google.com/macros/s/.../exec" style="flex:1;font-family:var(--fm);font-size:11px" oninput="state.scriptUrl=this.value;state.scriptStatus='unconfigured'">
        <button class="btn ba bsm" onclick="testScriptConnection()">🔍 Test</button>
      </div>
    </div>
    <div class="g2">
      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:13px"><div class="ct" style="margin-bottom:0">Admin nhận thông báo</div><button class="btn ba bxs" onclick="addAdmin()">➕ Thêm</button></div>
        <div class="gc" style="gap:7px">${state.admins.map(p => `<div class="csm">
          <div style="display:flex;align-items:center;gap:9px;margin-bottom:8px">
            <div style="width:33px;height:33px;border-radius:10px;background:${p.enabled ? "rgba(91,110,245,0.12)" : "var(--glass)"};display:flex;align-items:center;justify-content:center;font-size:18px">${p.avatar}</div>
            <div style="flex:1"><div style="font-weight:700;font-size:13px">${p.name}</div><div style="font-size:10px;color:var(--t1);font-family:var(--fm)">${p.phone}${p.email ? " · " + p.email : ""}</div></div>
            <button class="tog" style="background:${p.enabled ? "var(--a)" : "var(--t2)"}" onclick="p.enabled=!p.enabled;rdNotify()"><div class="k" style="left:${p.enabled ? 22 : 3}px"></div></button>
          </div>
        </div>`).join("")}</div>
      </div>
      <div class="card">
        <div class="ct">Lịch sử gửi ${state.phoneNotifs.filter(n => !n.read).length > 0 ? `<span style="background:var(--r);color:white;border-radius:5px;padding:0px 6px;font-size:9px;font-family:var(--fm)">${state.phoneNotifs.filter(n => !n.read).length}</span>` : ""}</div>
        <div style="display:flex;flex-direction:column;gap:5px;max-height:280px;overflow-y:auto">
          ${state.phoneNotifs.length ? state.phoneNotifs.map(n => { const s = SEV[n.sev]; return `<div style="background:${n.read ? "rgba(255,255,255,.02)" : "rgba(91,110,245,0.07)"};border:1px solid ${n.read ? "var(--b0)" : "rgba(91,110,245,0.18)"};border-left:3px solid ${s.c};border-radius:8px;padding:8px 11px;cursor:pointer" onclick="n.read=true;rdNotify()">
            <div style="font-size:12px;font-weight:${n.read ? 400 : 600};color:${n.read ? "var(--t1)" : "var(--t0)"};margin-bottom:4px">${n.msg}</div>
            <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap"><span style="font-size:9px;color:var(--t2);font-family:var(--fm)">🕐 ${n.t}</span>
              ${n.status === "sent" ? `<span style="font-size:9px;color:var(--ok);font-family:var(--fm)">✅ Gửi thật</span>` : n.status === "failed" ? `<span style="font-size:9px;color:var(--r)">❌ Lỗi</span>` : ""}</div>
          </div>`; }).join("") : `<div style="text-align:center;padding:28px;color:var(--t2);font-size:12px">Chưa có thông báo</div>`}
        </div>
      </div>
    </div>
  </div>`;
}
function addAdmin() { const n = prompt("Tên admin:"); if (!n) return; const em = prompt("Email:"); state.admins.push({ id: "p" + Date.now(), name: n, phone: "", email: em || "", avatar: "👤", enabled: true, channels: { push: true, sms: false, call: false } }); toast("✅ Đã thêm " + n, "success"); rdNotify(); }

// ─── LINK ─────────────────────────────────────────────────
function rdLink() {
  const el = document.getElementById("pg-link");
  el.innerHTML = `<div class="ph"><div><div class="ph-t">Liên kết thiết bị</div><div class="ph-s">Kết nối thiết bị mới</div></div></div>
  <div class="g2">
    <div class="card">
      <div class="ct">Thêm thiết bị mới</div>
      <div style="margin-bottom:13px"><div style="font-size:10px;font-weight:700;font-family:var(--fh);color:var(--t1);margin-bottom:7px">CHO TRẺ NÀO?</div>
      <div style="display:flex;gap:7px;flex-wrap:wrap">${state.children.map(c => `<button class="btn bg bsm" onclick="toast('🔗 Tạo mã cho ${c.name}','info')">${c.avatar} ${c.name}</button>`).join("")}</div></div>
      <input class="inp" placeholder="Tên thiết bị" style="margin-bottom:12px">
      <button class="btn ba" style="width:100%" onclick="genCode()">🔗 Tạo mã liên kết</button>
    </div>
    <div class="card">
      <div class="ct">Đã liên kết (${allDevices().length} thiết bị)</div>
      ${state.children.map(c => `<div style="margin-bottom:12px"><div style="font-size:10px;font-weight:700;color:${c.colorDesktop};font-family:var(--fh);margin-bottom:6px">${c.avatar} ${c.name.toUpperCase()}</div>
        ${c.devices.map(d => `<div style="display:flex;align-items:center;gap:9px;padding:8px 11px;background:var(--glass);border:1px solid var(--b0);border-radius:9px;margin-bottom:4px">
          <span style="font-size:17px">${d.icon}</span>
          <div style="flex:1"><div style="font-size:12px;font-weight:600">${d.name}</div><div style="font-size:9px;color:var(--t1);font-family:var(--fm)">${d.os}</div></div>
          <div style="display:flex;align-items:center;gap:4px"><div style="width:5px;height:5px;border-radius:50%;background:${d.online ? "var(--ok)" : "var(--t2)"}"></div><span style="font-size:10px;color:${d.online ? "var(--ok)" : "var(--t1)"};font-family:var(--fm)">${d.online ? "Online" : "Offline"}</span></div>
        </div>`).join("")}
      </div>`).join("")}
    </div>
  </div>`;
}
function genCode() { const c = "KS-" + Math.floor(1000 + Math.random() * 9000); toast(`🔑 Mã: ${c} · 2 phút`, "success"); }

// ─── SETTINGS ─────────────────────────────────────────────
function rdSettings() {
  const el = document.getElementById("pg-settings");
  el.innerHTML = `<div class="ph"><div><div class="ph-t">Cài đặt</div><div class="ph-s">Tuỳ chỉnh KidShield Pro</div></div></div>
  <div class="g2">
    <div class="gc">
      <div class="card">
        <div class="ct">Quản lý trẻ</div>
        ${state.children.map(c => `<div style="display:flex;align-items:center;gap:10px;padding:9px;background:var(--glass);border:1px solid ${c.colorDesktop}22;border-radius:11px;margin-bottom:6px">
          <span style="font-size:22px">${c.avatar}</span>
          <div style="flex:1"><div style="font-weight:700;font-size:13px">${c.name}</div><div style="font-size:10px;color:var(--t1)">${c.age} tuổi · ${c.devices.length} thiết bị</div></div>
          <button class="btn bg bxs" onclick="editLim(${c.id})">⏱️</button>
        </div>`).join("")}
      </div>
      <div class="card">
        <div class="ct">Từ khoá cấm</div>
        <div style="margin-bottom:10px;min-height:34px">${state.blockedKeywords.map(k => `<span class="kw">${k}<button onclick="state.blockedKeywords=state.blockedKeywords.filter(x=>x!=='${k}');rdSettings()">×</button></span>`).join("")}</div>
        <div style="display:flex;gap:7px"><input class="inp" id="kw-inp" placeholder="Thêm từ khoá..." style="flex:1" onkeydown="if(event.key==='Enter')addKW()"><button class="btn br bsm" onclick="addKW()">➕</button></div>
      </div>
    </div>
    <div class="gc">
      <div class="card">
        <div class="ct">Bảo mật & Sao lưu</div>
        ${sRow("🔐", "rgba(91,110,245,0.12)", "PIN bảo vệ", "Yêu cầu PIN khi mở", `<button class="tog" style="background:${state.pinEnabled ? "var(--a)" : "var(--t2)"}" onclick="state.pinEnabled=!state.pinEnabled;saveState();rdSettings()"><div class="k" style="left:${state.pinEnabled ? 22 : 3}px"></div></button>`)}
        ${sRow("💾", "rgba(91,110,245,0.1)", "Xuất cấu hình", "Backup JSON", `<button class="btn bg bxs" onclick="exportCfg()">📥 Xuất</button>`)}
        ${sRow("📧", "rgba(16,217,138,0.1)", "Báo cáo ngày", "Email tổng hợp", `<button class="btn bok bxs" onclick="toast('📧 Đã gửi','success')">Gửi</button>`)}
        ${sRow("🗑️", "rgba(244,63,94,0.1)", "Reset dữ liệu", "Đặt lại mặc định", `<button class="btn bxs" style="background:rgba(244,63,94,0.08);color:var(--r);border:1px solid rgba(244,63,94,0.2)" onclick="if(confirm('Xoá tất cả?')){localStorage.clear();location.reload()}">Reset</button>`)}
      </div>
      <div class="card c-glow-a" style="text-align:center">
        <div style="font-size:46px;margin-bottom:10px">🛡️</div>
        <div style="font-family:var(--fh);font-weight:800;font-size:18px;margin-bottom:2px">KidShield Pro</div>
        <div style="font-size:10px;color:var(--a);font-family:var(--fm);margin-bottom:16px">v3.0 · DESKTOP</div>
        <div style="font-size:11px;color:var(--t1);line-height:2">✅ Đa thiết bị · AI thật<br>✅ Google Script · GPS<br>✅ Phần thưởng · Báo cáo</div>
      </div>
    </div>
  </div>`;
}
function sRow(icon, bg, lbl, desc, action) { return `<div class="srow"><div class="sicon" style="background:${bg}">${icon}</div><div style="flex:1"><div style="font-size:13px;font-weight:600">${lbl}</div><div style="font-size:11px;color:var(--t1)">${desc}</div></div>${action}</div>`; }
function addKW() { const i = document.getElementById("kw-inp"); const k = i?.value?.trim(); if (!k) return; if (!state.blockedKeywords.includes(k)) { state.blockedKeywords.push(k); saveState(); rdSettings(); toast(`🚫 Thêm: ${k}`, "warning"); } i.value = ""; }
function editLim(id) { const c = getChild(id); const l = prompt(`Giới hạn (phút) cho ${c.name}:`, c.devices[0]?.limitMins || 120); if (l) { c.devices.forEach(d => d.limitMins = parseInt(l) || 120); toast("✅ Cập nhật", "success"); saveState(); } }
function exportCfg() { const d = { lockedApps: [...state.lockedApps], scriptUrl: state.scriptUrl, admins: state.admins, blockedKeywords: state.blockedKeywords, rewardPoints: state.rewardPoints }; const b = new Blob([JSON.stringify(d, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "kidshield-config.json"; a.click(); toast("📥 Đã xuất", "success"); }

// ─── SOS ──────────────────────────────────────────────────
function doSOS() {
  if (confirm("🆘 SOS — Khoá tất cả thiết bị và gửi thông báo?")) {
    lockAll();
    sendNotification({ id: 0, childId: 1, deviceId: "d1", app: "SOS", severity: "critical", icon: "🆘", msg: "SOS — Đã khoá tất cả thiết bị!" }, true);
    toast("🆘 SOS kích hoạt!", "danger");
  }
}

// ─── INIT ─────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadState();
  go("dashboard");
  if (state.autoDetect) startDetection();
  setInterval(() => {
    state.children.forEach(c => c.devices.forEach(d => {
      if (d.online && d.screenTime < d.limitMins + 90) d.screenTime += 1;
      if (d.battery !== null && d.battery > 1 && Math.random() > .93) d.battery = Math.max(1, d.battery - 1);
    }));
    if (state.currentTab === "dashboard") rdDash();
    if (state.currentTab === "devices") rdDevices();
    saveState();
  }, 15000);
});
