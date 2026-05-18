// ═══════════════════════════════════════════════════════════
//  KidShield Pro — Helpers
// ═══════════════════════════════════════════════════════════

function fmtTime(mins) {
  return mins < 60 ? `${mins}p` : `${Math.floor(mins / 60)}h ${mins % 60}p`;
}

function now() {
  return new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function nowDate() {
  return new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" });
}

function getChild(id) {
  return state.children.find(c => c.id === id);
}

function getDevice(id) {
  return state.children.flatMap(c => c.devices).find(d => d.id === id);
}

function allDevices() {
  return state.children.flatMap(c => c.devices);
}

function onlineDevices() {
  return allDevices().filter(d => d.online).length;
}

function criticalAlerts() {
  return state.alerts.filter(a => a.severity === "critical" || a.severity === "high");
}

function detectPlatform() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return "ios";
  if (/Android/i.test(ua)) return "android";
  if (window.innerWidth <= 768 && ("ontouchstart" in window || navigator.maxTouchPoints > 0)) return "android";
  return "desktop";
}

function generateHeatmap(seedFactor) {
  return Array.from({ length: 24 }, (_, h) => {
    const base = seedFactor * 0.3;
    if (h < 7) return Math.random() * 0.1;
    if (h < 9) return Math.random() * 0.4 + base;
    if (h < 12) return Math.random() * 0.7 + base;
    if (h < 14) return Math.random() * 0.5 + base;
    if (h < 17) return Math.random() * 0.3 + base;
    if (h < 21) return Math.random() * 0.9 + base;
    return Math.random() * 0.3;
  });
}

// Detect platform-specific severity map
function severityMap() {
  const p = document.body.getAttribute("data-platform");
  if (p === "ios") return SEV_IOS;
  if (p === "android") return SEV_ANDROID;
  return SEV_DESKTOP;
}

function riskMap() {
  const p = document.body.getAttribute("data-platform");
  if (p === "ios") return RISK_IOS;
  if (p === "android") return RISK_ANDROID;
  return RISK_DESKTOP;
}

function childColor(child) {
  const p = document.body.getAttribute("data-platform");
  if (p === "ios") return child.colorIOS;
  if (p === "android") return child.colorAndroid;
  return child.colorDesktop;
}
