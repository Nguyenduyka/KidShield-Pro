# KidShield Pro v3.0

Ứng dụng giám sát thiết bị trẻ em đa nền tảng với 12 tính năng đầy đủ.

## 📁 Cấu trúc dự án

```
kidshield/
├── index.html                          ← Trang khởi động (auto-detect & redirect)
├── desktop.html                        ← Phiên bản máy tính
├── ios.html                            ← Phiên bản iPhone/iPad
├── android.html                        ← Phiên bản Android
├── README.md                           ← File này
└── assets/
    ├── css/
    │   ├── common.css                  ← Base + animations
    │   ├── desktop.css                 ← Theme tối luxury (Syne, Outfit)
    │   ├── ios.css                     ← Native iOS (SF Pro, Dynamic Island)
    │   └── android.css                 ← Material 3 (Roboto Flex)
    ├── js/
    │   ├── data.js                     ← Dữ liệu (trẻ, app, cảnh báo...)
    │   ├── helpers.js                  ← Tiện ích chung
    │   ├── state.js                    ← Quản lý state + localStorage
    │   ├── detection.js                ← Auto-detect + gửi thông báo
    │   ├── desktop.js                  ← Renderer desktop (12 tab)
    │   ├── ios.js                      ← Renderer iOS (13 trang)
    │   └── android.js                  ← Renderer Android (13 trang)
    └── backend/
        └── KidShield_GoogleAppsScript.js  ← Backend gửi email/SMS thật
```

## 🚀 Cách deploy

### Local
1. Mở `index.html` trong trình duyệt → tự động chuyển hướng đến phiên bản phù hợp.

### Web hosting (Netlify / Vercel / GitHub Pages)
1. Upload toàn bộ thư mục `kidshield/` lên hosting.
2. Set entry point là `index.html`.
3. Truy cập URL → tự động redirect:
   - iPhone → `ios.html`
   - Android → `android.html`
   - Desktop → `desktop.html`

### Truy cập trực tiếp
- `yoursite.com/desktop.html` — phiên bản desktop
- `yoursite.com/ios.html` — phiên bản iPhone
- `yoursite.com/android.html` — phiên bản Android

## 🤖 Cài đặt gửi thông báo thật (Google Apps Script)

1. Truy cập https://script.google.com
2. Tạo project mới, paste nội dung file `assets/backend/KidShield_GoogleAppsScript.js`
3. Sửa `ADMIN_EMAIL` ở dòng đầu thành email cha mẹ
4. Deploy → New deployment → Web app
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy URL deployment
6. Mở app KidShield → vào tab **Thông báo** → dán URL → bấm **Test kết nối**

## ✨ Tính năng (đầy đủ trên cả 3 phiên bản)

1. **Tổng quan** — stats real-time, trạng thái trẻ, cảnh báo gần đây
2. **Thiết bị** — quản lý nhiều thiết bị/trẻ, khoá/mở
3. **Ứng dụng** — khoá 12 app phổ biến theo category
4. **Cảnh báo** — filter theo mức độ, khoá nhanh từ alert
5. **Lịch sử dụng** — khung giờ cho phép/chặn theo ngày
6. **AI Phân tích** — phân tích, chat AI thật (Claude API), dự đoán
7. **Phần thưởng** — điểm thưởng, huy hiệu, đổi thưởng
8. **Vị trí & Vùng** — bản đồ GPS, geofencing
9. **Báo cáo tuần** — top apps, so sánh tuần trước
10. **Thông báo** — gửi email/SMS thật qua Google Apps Script
11. **Liên kết** — kết nối thiết bị mới qua mã
12. **Cài đặt** — quản lý trẻ, từ khoá cấm, PIN, backup

## 🔄 Auto-detection logic

```js
function detectPlatform() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return "ios"; // iPad mac-mode
  if (/Android/i.test(ua)) return "android";
  if (window.innerWidth <= 768 && "ontouchstart" in window) return "android";
  return "desktop";
}
```

## 🎨 Design Systems

| Platform | Font | Style | Navigation |
|----------|------|-------|------------|
| **Desktop** | Syne + Outfit + JetBrains Mono | Glassmorphism, dark luxury | Sidebar collapsible |
| **iOS** | SF Pro (native) | Native iOS, frosted glass, Dynamic Island | Bottom tabs |
| **Android** | Roboto Flex | Material 3 expressive | Bottom nav + FAB |

## 💾 Persistence

- Tất cả state lưu vào `localStorage` (`kidshield_v3`)
- Bao gồm: app khoá, thiết bị khoá, điểm thưởng, admin, từ khoá, PIN, script URL

## 🛡️ Bản quyền

KidShield Pro v3.0 — © 2026
