// ═══════════════════════════════════════════════════════════
//  KidShield Pro — State Management
// ═══════════════════════════════════════════════════════════

const state = {
  children: JSON.parse(JSON.stringify(CHILDREN)),
  alerts: JSON.parse(JSON.stringify(ALERTS_DATA)),
  admins: JSON.parse(JSON.stringify(ADMINS_DATA)),
  rewards: REWARDS_DATA,
  achievements: JSON.parse(JSON.stringify(ACHIEVEMENTS_DATA)),
  schedules: JSON.parse(JSON.stringify(SCHEDULES_DATA)),
  geofences: JSON.parse(JSON.stringify(GEOFENCES_DATA)),
  locations: JSON.parse(JSON.stringify(CHILD_LOCATIONS)),
  weekData: WEEK_SCREEN_TIME,
  heatmaps: {
    0: generateHeatmap(0.5),
    1: generateHeatmap(0.4),
    2: generateHeatmap(0.2),
    3: generateHeatmap(0.8),
  },

  lockedApps: new Set([1, 3, 4]),
  lockedDevices: new Set(),
  rewardPoints: { 1: 120, 2: 150, 3: 50 },
  blockedKeywords: [...DEFAULT_KEYWORDS],
  moodLog: [],

  autoDetect: true,
  detectInterval: 30,
  scriptUrl: "",
  scriptStatus: "unconfigured",
  notifConfig: { critical: true, high: true, medium: true, low: false, qStart: "22:00", qEnd: "07:00", qOn: true },
  phoneNotifs: [{ id: "n1", t: "14:32", sev: "critical", msg: "🔞 Bé Minh xem nội dung người lớn trên TikTok", sent: ["Ba", "Mẹ"], ch: ["email"], read: false, status: "sent" }],

  pinEnabled: false,
  userPIN: "1234",
  sosActive: false,

  aiChat: [{ r: "ai", m: "Xin chào! Tôi là AI trợ lý KidShield. Hãy hỏi tôi về hành vi sử dụng thiết bị của con bạn!" }],

  // UI state
  currentTab: "dashboard",
  aiTab: "analysis",
  appFilter: "all",
  alertFilter: "all",
  scheduleChildId: 1,
  scheduleDay: "Mon",
};

// Cooldown for auto-detect to avoid spam
const COOLDOWN = {};
const COOLDOWN_MS = 5 * 60 * 1000;

function saveState() {
  try {
    localStorage.setItem("kidshield_v3", JSON.stringify({
      lockedApps: [...state.lockedApps],
      lockedDevices: [...state.lockedDevices],
      rewardPoints: state.rewardPoints,
      blockedKeywords: state.blockedKeywords,
      moodLog: state.moodLog,
      autoDetect: state.autoDetect,
      detectInterval: state.detectInterval,
      scriptUrl: state.scriptUrl,
      notifConfig: state.notifConfig,
      pinEnabled: state.pinEnabled,
      userPIN: state.userPIN,
      admins: state.admins,
    }));
  } catch (e) { console.warn("Save failed:", e); }
}

function loadState() {
  try {
    const d = JSON.parse(localStorage.getItem("kidshield_v3") || "{}");
    if (d.lockedApps) state.lockedApps = new Set(d.lockedApps);
    if (d.lockedDevices) state.lockedDevices = new Set(d.lockedDevices);
    if (d.rewardPoints) state.rewardPoints = d.rewardPoints;
    if (d.blockedKeywords) state.blockedKeywords = d.blockedKeywords;
    if (d.moodLog) state.moodLog = d.moodLog;
    if (d.autoDetect !== undefined) state.autoDetect = d.autoDetect;
    if (d.detectInterval) state.detectInterval = d.detectInterval;
    if (d.scriptUrl) state.scriptUrl = d.scriptUrl;
    if (d.notifConfig) state.notifConfig = d.notifConfig;
    if (d.pinEnabled !== undefined) state.pinEnabled = d.pinEnabled;
    if (d.userPIN) state.userPIN = d.userPIN;
    if (d.admins) state.admins = d.admins;
  } catch (e) { console.warn("Load failed:", e); }
}
