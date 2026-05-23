// ═══════════════════════════════════════════════════════════════
//  KidShield Pro — Cấu hình Firebase (BẮT BUỘC)
// ═══════════════════════════════════════════════════════════════
//
//  ADMIN chỉ cấu hình file này MỘT LẦN khi deploy.
//  Sau đó MỌI người dùng chỉ cần mở web → bấm "Đăng ký" → dùng.
//  Người dùng KHÔNG cần và KHÔNG thấy file này.
//
//  Lấy config ở: Firebase Console → Project Settings (⚙️) → General
//   → "Your apps" → chọn Web app → "Firebase SDK snippet" → Config
//
//  Các giá trị này là PUBLIC (an toàn để commit lên GitHub) VÌ dữ liệu
//  được bảo vệ bằng Firestore Security Rules + Auth. Xem firestore.rules.
// ═══════════════════════════════════════════════════════════════

window.KIDSHIELD_CONFIG = {
  firebase: {
    apiKey: "AIzaSyASUdrjlJmFLgSrDO6PkclhThtEhitg5uQ",
  authDomain: "kidshield-pro-c8671.firebaseapp.com",
  databaseURL: "https://kidshield-pro-c8671-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "kidshield-pro-c8671",
  storageBucket: "kidshield-pro-c8671.firebasestorage.app",
  messagingSenderId: "53414244683",
  appId: "1:53414244683:web:c02e0db2bce07982a5f8ce",
   },
};
