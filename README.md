# 🛡️ KidShield Pro

Ứng dụng giám sát thiết bị trẻ em. Frontend tĩnh (1 file `index.html`) + **lưu dữ liệu trên Firebase (Firestore)** với **đăng nhập thật bằng Firebase Auth**. Mỗi người dùng một dữ liệu riêng. Deploy lên **GitHub Pages**.

> ⚠️ App **chỉ chạy trên Firebase**. Bắt buộc cấu hình `config.js` thì mới đăng nhập được — không có chế độ localStorage dự phòng.

---

## 🔥 Bước 1 — Tạo project Firebase (miễn phí)

1. Vào https://console.firebase.google.com → **Add project** → đặt tên → Create.
2. **Bật đăng nhập Email/Password:**
   Authentication → **Get started** → tab **Sign-in method** → **Email/Password** → **Enable** → Save.
3. **Tạo Firestore Database:**
   Build → **Firestore Database** → **Create database** → chọn **Production mode** → chọn location (vd `asia-southeast1` Singapore) → Enable.
4. **Dán Security Rules:**
   Firestore Database → tab **Rules** → xoá hết, dán toàn bộ nội dung file **`firestore.rules`** vào → **Publish**.
5. **Lấy config Web app:**
   Project Settings (⚙️) → **General** → kéo xuống **Your apps** → bấm icon **Web (`</>`)** → đặt nickname → Register app → copy đối tượng **firebaseConfig**.

---

## 🔑 Bước 2 — Điền cấu hình

Mở file **`config.js`**, dán config vừa copy:

```js
window.KIDSHIELD_CONFIG = {
  firebase: {
    apiKey: "AIza....",
    authDomain: "your-proj.firebaseapp.com",
    projectId: "your-proj",
    storageBucket: "your-proj.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcd1234",
  },
  DEMO_EMAIL: "demo@kidshield.app",
  DEMO_PASSWORD: "demo1234",
};
```

> 🔒 Các giá trị Firebase này là **PUBLIC** — an toàn để commit lên GitHub. Dữ liệu được bảo vệ
> bởi **Firestore Security Rules** (`firestore.rules`) + Auth: mỗi user chỉ đọc/ghi được dữ liệu của chính mình.

---

## 🚀 Bước 3 — Deploy lên GitHub Pages

1. Tạo repo mới trên GitHub và push thư mục này lên nhánh `main`:

```bash
cd kidshield-pro
git init
git add .
git commit -m "KidShield Pro + Firebase"
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

2. Trên GitHub: **Settings → Pages → Build and deployment → Source = GitHub Actions**.
   Workflow `.github/workflows/deploy.yml` sẽ tự deploy mỗi lần push.

3. Sau ~1 phút, app chạy tại: `https://<username>.github.io/<repo>/`

4. **QUAN TRỌNG — cho phép domain đăng nhập:**
   Firebase Console → Authentication → **Settings** → **Authorized domains** → **Add domain**
   → thêm `<username>.github.io` (nếu chưa có). Nếu thiếu bước này, đăng nhập sẽ báo lỗi domain.

---

## 🧪 Chạy thử cục bộ

Sau khi đã cấu hình Firebase, **không mở bằng cách nhấp đôi** (file:// chặn module + API). Dùng server:

```bash
cd kidshield-pro
python3 -m http.server 8080      # roi mo http://localhost:8080
```
Thêm `localhost` vào **Authorized domains** trong Firebase nếu cần test đăng nhập cục bộ.

---

## 📁 Các file

| File | Vai trò |
|------|---------|
| `index.html` | Toàn bộ ứng dụng |
| `config.js` | **Dán Firebase config tại đây** |
| `firestore.rules` | Dán vào Firestore → Rules → Publish |
| `icon.svg` | Logo / favicon / icon PWA |
| `manifest.webmanifest` | Cài như app trên điện thoại |
| `.github/workflows/deploy.yml` | Tự động deploy GitHub Pages |
| `robots.txt` · `.gitignore` | Phụ trợ |

> Các file `netlify.toml` / `vercel.json` vẫn còn nếu sau này bạn muốn đổi sang Netlify/Vercel — không ảnh hưởng GitHub Pages.

---

## 🔐 Cách dữ liệu được lưu

- **Đăng ký / đăng nhập**: **Firebase Authentication** (email + mật khẩu thật, quản lý phiên + token tự động, mật khẩu lưu an toàn phía Google).
- **Dữ liệu** (trẻ, thiết bị, cảnh báo, điểm thưởng, lịch, vị trí...): lưu thành 1 document JSON trong collection **`kidshield_data`**, id = `uid` của người dùng.
- **Bảo mật**: Firestore Rules đảm bảo user A không bao giờ đọc/ghi được dữ liệu user B.
- **Tự đồng bộ**: thay đổi được lưu lên Firestore (debounce ~0.6s). Đăng nhập máy/trình duyệt khác vẫn thấy dữ liệu của mình.

### Nếu chưa cấu hình Firebase
App hiện màn hình đăng nhập kèm thông báo lỗi và **không cho đăng nhập**. Phải điền `config.js` (Bước 2) thì mới dùng được.

---

## ✨ Tính năng

Tổng quan · Thiết bị · Ứng dụng · Cảnh báo · Lịch dùng · AI Phân tích · Phần thưởng · Vị trí · Báo cáo · Thông báo · Liên kết (QR) · Cài đặt — kèm thêm/sửa/xoá bé, liên kết thiết bị qua QR, SOS khẩn cấp, tự nhận diện iOS/Android/Desktop.

---

🛡️ **KidShield Pro v3.0** · © 2026
