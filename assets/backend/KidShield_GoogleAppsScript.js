// ═══════════════════════════════════════════════════════════════════
//  KidShield — Google Apps Script Backend
//  Hướng dẫn deploy:
//  1. Vào https://script.google.com → New project
//  2. Dán toàn bộ code này vào, lưu lại
//  3. Click "Deploy" → "New deployment" → Web app
//  4. Execute as: Me | Who has access: Anyone
//  5. Copy URL được cấp → dán vào ô SCRIPT_URL trong KidShield app
// ═══════════════════════════════════════════════════════════════════

// ─── CẤU HÌNH ────────────────────────────────────────────────────
const CONFIG = {
  // Danh sách admin nhận thông báo (thêm/bớt tuỳ ý)
  admins: [
    {
      name: "Ba",
      email: "ba@gmail.com",         // ← Thay bằng email ba
      phone: "0912345678",           // ← Thay bằng số điện thoại
      carrier: "viettel",            // viettel | vinaphone | mobifone
      push: true,
      sms: true,
    },
    {
      name: "Mẹ",
      email: "me@gmail.com",         // ← Thay bằng email mẹ
      phone: "0987654321",
      carrier: "vinaphone",
      push: true,
      sms: false,
    },
  ],

  // Email gửi đi (chính là tài khoản Google của bạn)
  senderName: "KidShield 🛡️",

  // Gửi thông báo theo mức độ (true = gửi, false = bỏ qua)
  notifyLevels: {
    critical: true,
    high: true,
    medium: true,
    low: false,
  },

  // Giờ im lặng (24h format) — không gửi SMS trong khoảng này
  quietHours: {
    enabled: true,
    start: 22, // 22:00
    end: 7,    // 07:00
  },
};

// ─── EMAIL-TO-SMS GATEWAY (Miễn phí qua nhà mạng) ────────────────
// Một số nhà mạng VN hỗ trợ nhận SMS qua email
// Nếu không có gateway, chỉ dùng email thôi (vẫn nhận push qua Gmail app)
const SMS_GATEWAYS = {
  viettel:   null, // Viettel chưa có public gateway — dùng email
  vinaphone: null, // VinaPhone chưa có public gateway — dùng email
  mobifone:  null, // MobiFone chưa có public gateway — dùng email
  // Nếu dùng SIM quốc tế (AT&T, T-Mobile, Verizon...):
  // att:    (phone) => `${phone}@txt.att.net`,
  // tmobile:(phone) => `${phone}@tmomail.net`,
  // verizon:(phone) => `${phone}@vtext.com`,
};

// ─── XỬ LÝ REQUEST TỪ KIDSHIELD APP ─────────────────────────────
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const result = handleNotification(data);
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, result }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Cho phép test từ GET request (gọi thẳng URL trên browser)
function doGet(e) {
  const params = e.parameter;
  if (params.test === "1") {
    const testPayload = {
      severity: "critical",
      childName: "Bé Minh",
      childAvatar: "👦",
      deviceName: "iPad Pro",
      appName: "TikTok",
      message: "Phát hiện nội dung người lớn trên TikTok",
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      action: "notify",
    };
    const result = handleNotification(testPayload);
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, test: true, result }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService
    .createTextOutput(JSON.stringify({ status: "KidShield API running ✅", version: "1.0" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── XỬ LÝ THÔNG BÁO CHÍNH ───────────────────────────────────────
function handleNotification(data) {
  const { severity, childName, childAvatar, deviceName, appName, message, time, action } = data;

  // Kiểm tra mức độ có được gửi không
  if (!CONFIG.notifyLevels[severity]) {
    return { skipped: true, reason: `Level "${severity}" bị tắt trong cấu hình` };
  }

  const results = [];
  const isQuiet = isQuietHour();

  CONFIG.admins.forEach(admin => {
    // Gửi email (luôn gửi, trừ khi admin tắt push)
    if (admin.push) {
      const emailResult = sendEmailNotification(admin, {
        severity, childName, childAvatar, deviceName, appName, message, time, action
      });
      results.push({ admin: admin.name, channel: "email", ...emailResult });
    }

    // Gửi SMS gateway (nếu có và không trong giờ im lặng)
    if (admin.sms && !isQuiet) {
      const gateway = SMS_GATEWAYS[admin.carrier];
      if (gateway) {
        const smsEmail = gateway(admin.phone.replace(/\s/g, ""));
        const smsResult = sendSmsViaEmail(smsEmail, childName, message, severity);
        results.push({ admin: admin.name, channel: "sms", ...smsResult });
      } else {
        // Fallback: gửi email ngắn dạng SMS style
        const smsResult = sendSmsStyleEmail(admin, childName, message, severity);
        results.push({ admin: admin.name, channel: "sms_email", ...smsResult });
      }
    }
  });

  // Lưu log vào Google Sheet (tuỳ chọn)
  logToSheet(data, results);

  return { sent: results.length, details: results };
}

// ─── GỬI EMAIL ĐẦY ĐỦ (Rich HTML) ───────────────────────────────
function sendEmailNotification(admin, data) {
  try {
    const { severity, childName, childAvatar, deviceName, appName, message, time, action } = data;

    const severityConfig = {
      critical: { color: "#dc2626", bg: "#fef2f2", border: "#fca5a5", label: "🚨 KHẨN CẤP", emoji: "🚨" },
      high:     { color: "#ea580c", bg: "#fff7ed", border: "#fed7aa", label: "🔴 CAO",      emoji: "🔴" },
      medium:   { color: "#d97706", bg: "#fffbeb", border: "#fde68a", label: "🟡 TRUNG BÌNH", emoji: "🟡" },
      low:      { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", label: "✅ THẤP",     emoji: "✅" },
    };
    const sev = severityConfig[severity] || severityConfig.medium;

    const subject = `${sev.emoji} KidShield: ${message.slice(0, 60)}`;

    const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif">
  <div style="max-width:520px;margin:0 auto;padding:20px">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:16px 16px 0 0;padding:24px;text-align:center">
      <div style="font-size:32px;margin-bottom:8px">🛡️</div>
      <div style="color:white;font-size:22px;font-weight:800;letter-spacing:-0.5px">KidShield</div>
      <div style="color:rgba(255,255,255,0.7);font-size:13px;margin-top:4px">Hệ thống bảo vệ trẻ em</div>
    </div>

    <!-- Alert banner -->
    <div style="background:${sev.bg};border:2px solid ${sev.border};border-top:none;padding:16px 20px;text-align:center">
      <div style="font-size:13px;font-weight:800;color:${sev.color};letter-spacing:1px">${sev.label}</div>
    </div>

    <!-- Main content -->
    <div style="background:white;border-radius:0 0 16px 16px;padding:24px;box-shadow:0 4px 20px rgba(0,0,0,0.08)">

      <!-- Child info -->
      <div style="display:flex;align-items:center;gap:14px;background:#f8fafc;border-radius:12px;padding:14px;margin-bottom:20px">
        <div style="font-size:36px">${childAvatar || "👶"}</div>
        <div>
          <div style="font-size:16px;font-weight:700;color:#1e293b">${childName}</div>
          <div style="font-size:12px;color:#64748b;margin-top:2px">📱 ${deviceName} · ⏱️ ${time}</div>
        </div>
      </div>

      <!-- Alert message -->
      <div style="background:${sev.bg};border-left:4px solid ${sev.color};border-radius:8px;padding:14px 16px;margin-bottom:20px">
        <div style="font-size:15px;font-weight:700;color:${sev.color};margin-bottom:6px">${message}</div>
        <div style="font-size:12px;color:#64748b">Ứng dụng: <strong>${appName}</strong></div>
      </div>

      <!-- Action buttons -->
      <div style="text-align:center;margin-bottom:20px">
        <div style="display:inline-block;background:linear-gradient(135deg,#dc2626,#991b1b);color:white;padding:12px 28px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;margin:4px">
          🔒 Mở KidShield để khoá ngay
        </div>
      </div>

      <!-- Info row -->
      <div style="background:#f1f5f9;border-radius:10px;padding:12px 14px;font-size:12px;color:#64748b">
        <div style="margin-bottom:4px">📅 Thời gian: <strong>${time} — ${new Date().toLocaleDateString("vi-VN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</strong></div>
        <div>👤 Gửi đến: <strong>${admin.name}</strong></div>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:16px;color:#94a3b8;font-size:11px">
      KidShield · Hệ thống bảo vệ trẻ em tự động<br>
      Email này được gửi tự động, vui lòng không reply.
    </div>
  </div>
</body>
</html>`;

    GmailApp.sendEmail(admin.email, subject, message, {
      htmlBody,
      name: CONFIG.senderName,
    });

    return { success: true, to: admin.email };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ─── GỬI SMS QUA EMAIL GATEWAY ────────────────────────────────────
function sendSmsViaEmail(smsAddress, childName, message, severity) {
  try {
    const shortMsg = `[KidShield] ${severity.toUpperCase()} - ${childName}: ${message.slice(0, 100)}`;
    GmailApp.sendEmail(smsAddress, shortMsg, shortMsg, { name: CONFIG.senderName });
    return { success: true, to: smsAddress };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ─── GỬI EMAIL DẠNG SMS (NGẮN, HIỆN PUSH NOTIFICATION) ───────────
function sendSmsStyleEmail(admin, childName, message, severity) {
  try {
    const sevEmoji = { critical: "🚨", high: "🔴", medium: "🟡", low: "✅" };
    const emoji = sevEmoji[severity] || "🔔";
    const subject = `${emoji} ${childName}: ${message.slice(0, 50)}`;
    const body = `${emoji} KIDSHIELD ALERT\n\n${message}\n\nThời gian: ${new Date().toLocaleString("vi-VN")}`;
    GmailApp.sendEmail(admin.email, subject, body, { name: CONFIG.senderName });
    return { success: true, to: admin.email, note: "SMS-style email" };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ─── KIỂM TRA GIỜ IM LẶNG ────────────────────────────────────────
function isQuietHour() {
  if (!CONFIG.quietHours.enabled) return false;
  const hour = new Date().getHours();
  const { start, end } = CONFIG.quietHours;
  if (start > end) return hour >= start || hour < end; // qua nửa đêm
  return hour >= start && hour < end;
}

// ─── LƯU LOG VÀO GOOGLE SHEET (TUỲ CHỌN) ────────────────────────
function logToSheet(data, results) {
  try {
    // Tạo hoặc mở sheet tên "KidShield Log"
    let ss;
    const files = DriveApp.getFilesByName("KidShield Log");
    if (files.hasNext()) {
      ss = SpreadsheetApp.open(files.next());
    } else {
      ss = SpreadsheetApp.create("KidShield Log");
      const sheet = ss.getActiveSheet();
      sheet.appendRow(["Thời gian", "Trẻ", "Thiết bị", "App", "Mức độ", "Thông báo", "Kết quả"]);
    }
    const sheet = ss.getActiveSheet();
    sheet.appendRow([
      new Date().toLocaleString("vi-VN"),
      data.childName,
      data.deviceName,
      data.appName,
      data.severity,
      data.message,
      results.map(r => `${r.admin}(${r.channel}):${r.success ? "✅" : "❌"}`).join(", "),
    ]);
  } catch (err) {
    // Bỏ qua lỗi log, không ảnh hưởng việc gửi
    console.log("Log error:", err.message);
  }
}

// ─── HÀM TEST THỦ CÔNG ───────────────────────────────────────────
// Chạy hàm này trực tiếp trong Apps Script để kiểm tra
function testSendNow() {
  const payload = {
    severity: "critical",
    childName: "Bé Minh",
    childAvatar: "👦",
    deviceName: "iPad Pro",
    appName: "TikTok",
    message: "Phát hiện nội dung người lớn trên TikTok",
    time: "14:32",
    action: "notify",
  };
  const result = handleNotification(payload);
  Logger.log(JSON.stringify(result, null, 2));
}
