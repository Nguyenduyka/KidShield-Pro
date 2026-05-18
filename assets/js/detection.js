// ═══════════════════════════════════════════════════════════
//  KidShield Pro — Auto Detection Engine + Notifications
// ═══════════════════════════════════════════════════════════

let detectTimer = null;

function canSend(key) {
  const last = COOLDOWN[key];
  return !last || Date.now() - last > COOLDOWN_MS;
}

function markSent(key) {
  COOLDOWN[key] = Date.now();
}

function runDetection() {
  state.children.forEach(child => {
    child.devices.forEach(d => {
      if (d.currentApp && d.online) {
        const app = APPS.find(x => x.name === d.currentApp);
        if (app && app.risk === "high" && canSend(`${d.id}-hi`)) {
          markSent(`${d.id}-hi`);
          fireAlert({ childId: child.id, deviceId: d.id, app: d.currentApp, severity: "critical", icon: "🔞", msg: `${child.name} đang dùng ${d.currentApp} (rủi ro cao) trên ${d.name}` });
        }
        if (app && state.lockedApps.has(app.id) && canSend(`${d.id}-bp`)) {
          markSent(`${d.id}-bp`);
          fireAlert({ childId: child.id, deviceId: d.id, app: d.currentApp, severity: "critical", icon: "🚨", msg: `${child.name} dùng ${d.currentApp} dù đã bị khoá!` });
        }
      }
      if (d.screenTime > d.limitMins && canSend(`${d.id}-ov`)) {
        markSent(`${d.id}-ov`);
        fireAlert({ childId: child.id, deviceId: d.id, app: "Màn hình", severity: "high", icon: "⏱️", msg: `${child.name} vượt giới hạn: ${fmtTime(d.screenTime)}/${fmtTime(d.limitMins)}` });
      }
      if (d.battery !== null && d.battery < 20 && canSend(`${d.id}-bat`)) {
        markSent(`${d.id}-bat`);
        fireAlert({ childId: child.id, deviceId: d.id, app: "Hệ thống", severity: "medium", icon: "🪫", msg: `Pin ${d.name} của ${child.name} chỉ còn ${d.battery}%` });
      }
      const loc = state.locations[child.id];
      if (loc && !loc.ok && canSend(`${child.id}-geo`)) {
        markSent(`${child.id}-geo`);
        fireAlert({ childId: child.id, deviceId: d.id, app: "GPS", severity: "critical", icon: "📍", msg: `${child.name} NGOÀI vùng an toàn: ${loc.zone}` });
      }
    });
  });
}

function fireAlert(a) {
  const full = { ...a, id: Date.now(), time: now() };
  state.alerts.unshift(full);
  if (state.alerts.length > 50) state.alerts.pop();
  sendNotification(full, true);
  if (typeof updateBadges === "function") updateBadges();
  if (typeof showAlertBanner === "function") showAlertBanner(full);
}

function startDetection() {
  if (detectTimer) clearInterval(detectTimer);
  detectTimer = setInterval(runDetection, state.detectInterval * 1000);
  runDetection();
}

function stopDetection() {
  if (detectTimer) clearInterval(detectTimer);
  detectTimer = null;
}

function toggleAutoDetect() {
  state.autoDetect = !state.autoDetect;
  if (state.autoDetect) startDetection(); else stopDetection();
  saveState();
  if (typeof toast === "function") toast(state.autoDetect ? "🤖 Bật tự động theo dõi" : "⏹️ Đã tắt theo dõi", state.autoDetect ? "success" : "info");
  if (typeof render === "function") render();
}

// ═══ NOTIFICATION SENDER ═══
async function sendNotification(alert, manual = false) {
  const activeAdmins = state.admins.filter(p => p.enabled);
  if (!activeAdmins.length) return;
  if (!state.notifConfig[alert.severity] && !manual) return;

  const child = getChild(alert.childId);
  const device = getDevice(alert.deviceId);

  const notif = {
    id: "n" + Date.now(),
    t: now(),
    sev: alert.severity,
    msg: (alert.icon || "🔔") + " " + alert.msg,
    sent: activeAdmins.map(p => p.name),
    ch: ["email"],
    read: false,
    status: "local"
  };
  state.phoneNotifs.unshift(notif);
  if (state.phoneNotifs.length > 30) state.phoneNotifs.pop();

  if (typeof showPhoneNotif === "function") showPhoneNotif(notif);
  if (typeof updateBadges === "function") updateBadges();

  // Send via Google Apps Script if configured
  if (!state.scriptUrl || !state.scriptUrl.includes("script.google.com")) return;

  const payload = {
    severity: alert.severity,
    childName: child?.name || "Con",
    childAvatar: child?.avatar || "👶",
    deviceName: device?.name || "Thiết bị",
    appName: alert.app,
    message: alert.msg,
    time: now(),
    admins: activeAdmins.map(p => ({ name: p.name, email: p.email, push: p.channels.push, sms: p.channels.sms, call: p.channels.call })),
  };

  notif.status = "sending";
  try {
    const r = await fetch(state.scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload)
    });
    const j = await r.json();
    notif.status = j.success ? "sent" : "failed";
    if (j.success && typeof toast === "function") toast(`✅ Gửi email đến ${activeAdmins.length} admin!`, "success");
    else if (!j.success) throw new Error(j.error || "unknown");
  } catch (e) {
    notif.status = "failed";
    if (typeof toast === "function") toast("❌ Lỗi gửi: " + e.message, "danger");
  }
}

async function testScriptConnection() {
  state.scriptStatus = "testing";
  if (typeof render === "function") render();
  try {
    const r = await fetch(state.scriptUrl + "?ping=1");
    const j = await r.json();
    state.scriptStatus = (j.status || j.success !== undefined) ? "ok" : "error";
    if (typeof toast === "function") toast(state.scriptStatus === "ok" ? "✅ Kết nối thành công!" : "❌ URL không hợp lệ", state.scriptStatus === "ok" ? "success" : "danger");
  } catch (e) {
    state.scriptStatus = "error";
    if (typeof toast === "function") toast("❌ " + e.message, "danger");
  }
  if (typeof render === "function") render();
}

function sendTestNotification() {
  const samples = [
    { childId: 1, deviceId: "d1", app: "TikTok", severity: "critical", icon: "🚨", msg: "Phát hiện nội dung bạo lực trên TikTok" },
    { childId: 3, deviceId: "d5", app: "PUBG", severity: "high", icon: "⚠️", msg: "Bé Tuấn chơi game quá 3 tiếng" },
  ];
  sendNotification(samples[Math.floor(Math.random() * samples.length)], true);
}
