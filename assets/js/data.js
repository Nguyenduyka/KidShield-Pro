// ═══════════════════════════════════════════════════════════
//  KidShield Pro — Shared Data
// ═══════════════════════════════════════════════════════════

const CHILDREN = [
  {
    id: 1, name: "Bé Minh", age: 10, avatar: "👦",
    colorDesktop: "#5b6ef5", colorIOS: "#0a84ff", colorAndroid: "#a8c7fa",
    mood: "😊", moodNote: "Vui vẻ",
    devices: [
      { id: "d1", name: "iPad Pro", type: "tablet", icon: "📱", os: "iPadOS 17", online: true, battery: 72, currentApp: "TikTok", appRisk: "high", screenTime: 154, limitMins: 180 },
      { id: "d2", name: "MacBook Air", type: "laptop", icon: "💻", os: "macOS 14", online: true, battery: 45, currentApp: "Chrome", appRisk: "medium", screenTime: 87, limitMins: 180 },
    ]
  },
  {
    id: 2, name: "Bé Lan", age: 8, avatar: "👧",
    colorDesktop: "#ec4899", colorIOS: "#ff375f", colorAndroid: "#d9bce0",
    mood: "📚", moodNote: "Học tốt",
    devices: [
      { id: "d3", name: "Samsung Tab", type: "tablet", icon: "📱", os: "Android 14", online: true, battery: 91, currentApp: "Khan Academy", appRisk: "safe", screenTime: 45, limitMins: 120 },
    ]
  },
  {
    id: 3, name: "Bé Tuấn", age: 13, avatar: "🧒",
    colorDesktop: "#f59e0b", colorIOS: "#ff9f0a", colorAndroid: "#ffd166",
    mood: "😤", moodNote: "Hơi cáu",
    devices: [
      { id: "d4", name: "iPhone 15", type: "phone", icon: "📱", os: "iOS 17", online: false, battery: 23, currentApp: null, appRisk: null, screenTime: 72, limitMins: 120 },
      { id: "d5", name: "PC Gaming", type: "desktop", icon: "🖥️", os: "Windows 11", online: true, battery: null, currentApp: "PUBG Mobile", appRisk: "medium", screenTime: 210, limitMins: 180 },
      { id: "d6", name: "Apple Watch", type: "watch", icon: "⌚", os: "watchOS 10", online: true, battery: 58, currentApp: null, appRisk: null, screenTime: 30, limitMins: 60 },
    ]
  },
];

const APPS = [
  { id: 1, name: "TikTok", icon: "🎵", risk: "high", color: "#ff0050", category: "Mạng xã hội" },
  { id: 2, name: "YouTube", icon: "▶️", risk: "medium", color: "#ff0000", category: "Video" },
  { id: 3, name: "Instagram", icon: "📸", risk: "high", color: "#e1306c", category: "Mạng xã hội" },
  { id: 4, name: "Facebook", icon: "📘", risk: "high", color: "#1877f2", category: "Mạng xã hội" },
  { id: 5, name: "Chrome", icon: "🌐", risk: "medium", color: "#4285f4", category: "Trình duyệt" },
  { id: 6, name: "Zalo", icon: "💬", risk: "low", color: "#0068ff", category: "Nhắn tin" },
  { id: 7, name: "PUBG Mobile", icon: "🎮", risk: "medium", color: "#f7b731", category: "Game" },
  { id: 8, name: "Roblox", icon: "🟥", risk: "medium", color: "#e53e3e", category: "Game" },
  { id: 9, name: "Khan Academy", icon: "📚", risk: "safe", color: "#10b981", category: "Giáo dục" },
  { id: 10, name: "Minecraft", icon: "⛏️", risk: "low", color: "#7cb518", category: "Game" },
  { id: 11, name: "Snapchat", icon: "👻", risk: "high", color: "#d4c200", category: "Mạng xã hội" },
  { id: 12, name: "Discord", icon: "🎙️", risk: "medium", color: "#5865f2", category: "Chat" },
];

const ALERTS_DATA = [
  { id: 1, childId: 1, deviceId: "d1", time: "14:32", app: "TikTok", severity: "critical", icon: "🔞", msg: "Phát hiện nội dung người lớn trên TikTok" },
  { id: 2, childId: 3, deviceId: "d5", time: "13:15", app: "PUBG Mobile", severity: "high", icon: "⏱️", msg: "Bé Tuấn chơi game liên tục 3h 30m" },
  { id: 3, childId: 1, deviceId: "d2", time: "12:40", app: "Chrome", severity: "high", icon: "🔴", msg: "Từ khoá nguy hiểm phát hiện trên Chrome" },
  { id: 4, childId: 2, deviceId: "d3", time: "11:00", app: "Khan Academy", severity: "low", icon: "✅", msg: "Bé Lan học được 45 phút" },
];

const ADMINS_DATA = [
  { id: "p1", name: "Ba", phone: "0912 345 678", email: "ba@gmail.com", avatar: "👨", enabled: true, channels: { push: true, sms: true, call: false } },
  { id: "p2", name: "Mẹ", phone: "0987 654 321", email: "me@gmail.com", avatar: "👩", enabled: true, channels: { push: true, sms: false, call: true } },
];

const REWARDS_DATA = [
  { id: "r1", name: "Thêm 30p YouTube", cost: 50, icon: "▶️" },
  { id: "r2", name: "Chơi game +1 tiếng", cost: 100, icon: "🎮" },
  { id: "r3", name: "Xem phim cuối tuần", cost: 200, icon: "🎬" },
  { id: "r4", name: "Tự chọn bữa tối", cost: 150, icon: "🍕" },
];

const ACHIEVEMENTS_DATA = {
  1: [{ i: "📚", n: "Học 5 ngày liên tiếp", e: true }, { i: "⏰", n: "Dùng đúng giờ 3 ngày", e: true }, { i: "🌟", n: "Không vi phạm 1 tuần", e: false }],
  2: [{ i: "🏆", n: "Top học sinh tuần", e: true }, { i: "📖", n: "Khan Academy 10h", e: true }, { i: "🌈", n: "Màn hình lành mạnh", e: true }],
  3: [{ i: "🎮", n: "Hạn chế game 3 ngày", e: false }, { i: "📵", n: "No phone trước ngủ", e: false }, { i: "✨", n: "Cải thiện dần", e: false }],
};

const SCHEDULES_DATA = {
  1: { Mon: [{ s: "07:00", e: "09:00", a: true }, { s: "15:00", e: "18:00", a: true }, { s: "21:00", e: "22:00", a: false }], Tue: [{ s: "15:00", e: "18:00", a: true }], Wed: [], Thu: [], Fri: [], Sat: [{ s: "09:00", e: "12:00", a: true }, { s: "14:00", e: "18:00", a: true }], Sun: [] },
  2: { Mon: [{ s: "15:00", e: "17:00", a: true }], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] },
  3: { Mon: [{ s: "15:00", e: "17:30", a: true }], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [{ s: "10:00", e: "14:00", a: true }], Sun: [] },
};

const GEOFENCES_DATA = [
  { id: "g1", name: "Nhà", icon: "🏠", x: 50, y: 50, r: 70, color: "#10d98a", enabled: true },
  { id: "g2", name: "Trường học", icon: "🏫", x: 72, y: 28, r: 50, color: "#5b6ef5", enabled: true },
  { id: "g3", name: "Nhà ông bà", icon: "🏡", x: 25, y: 70, r: 55, color: "#f59e0b", enabled: false },
];

const CHILD_LOCATIONS = {
  1: { x: 52, y: 52, zone: "Nhà", time: "14:35", ok: true },
  2: { x: 73, y: 29, zone: "Trường học", time: "14:20", ok: true },
  3: { x: 62, y: 62, zone: "Ngoài vùng", time: "14:10", ok: false }
};

const WEEK_SCREEN_TIME = {
  1: [45, 120, 90, 154, 200, 180, 60],
  2: [30, 45, 60, 45, 80, 120, 90],
  3: [180, 210, 150, 210, 240, 300, 180]
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_VN = { Mon: "T.2", Tue: "T.3", Wed: "T.4", Thu: "T.5", Fri: "T.6", Sat: "T.7", Sun: "CN" };

// Severity maps per platform
const SEV_IOS = { critical: { c: "#ff453a", l: "Khẩn cấp" }, high: { c: "#ff9f0a", l: "Cao" }, medium: { c: "#ffd60a", l: "Vừa" }, low: { c: "#30d158", l: "Thấp" } };
const SEV_ANDROID = { critical: { c: "#ff7a85", l: "Khẩn cấp" }, high: { c: "#ffb380", l: "Cao" }, medium: { c: "#ffd166", l: "Vừa" }, low: { c: "#7dd687", l: "Thấp" } };
const SEV_DESKTOP = { critical: { c: "#f43f5e", l: "🔴 Khẩn" }, high: { c: "#fb923c", l: "🟠 Cao" }, medium: { c: "#f59e0b", l: "🟡 Vừa" }, low: { c: "#10d98a", l: "🟢 Thấp" } };

const RISK_IOS = { safe: { l: "An toàn", c: "#30d158" }, low: { l: "Thấp", c: "#64d2ff" }, medium: { l: "TB", c: "#ff9f0a" }, high: { l: "Cao", c: "#ff453a" } };
const RISK_ANDROID = { safe: { l: "An toàn", c: "#7dd687" }, low: { l: "Thấp", c: "#a8c7fa" }, medium: { l: "TB", c: "#ffd166" }, high: { l: "Cao", c: "#ff7a85" } };
const RISK_DESKTOP = { safe: { l: "An toàn", c: "#10d98a" }, low: { l: "Thấp", c: "#06b6d4" }, medium: { l: "TB", c: "#f59e0b" }, high: { l: "Cao", c: "#f43f5e" } };

const DEFAULT_KEYWORDS = ["bạo lực", "khiêu dâm", "cờ bạc", "ma túy", "hack", "cheat"];
