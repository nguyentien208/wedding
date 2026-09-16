# WEBSITE THIỆP CƯỚI ONLINE (SUPABASE + GITHUB PAGES)

Website thiệp cưới online hiện đại, lãng mạn, ưu tiên trải nghiệm mobile-first, tích hợp trang Admin Quản Trị và backend Supabase (Database, Storage, Auth), hỗ trợ deploy hoàn toàn miễn phí trên GitHub Pages.

---

## 🚀 HƯỚNG DẪN CẤU HÌNH SUPABASE TỪ A - Z

### Bước 1: Tạo Dự Án Supabase
1. Truy cập [https://supabase.com](https://supabase.com) và đăng nhập (hoặc đăng ký tài khoản miễn phí).
2. Bấm **"New project"**, chọn Organization và đặt tên dự án (VD: `wedding-invitation`).
3. Đặt mật khẩu cho Database và chọn khu vực (Region) gần Việt Nam nhất (ví dụ: `Singapore`).
4. Bấm **"Create new project"** và chờ vài phút để dự án được khởi tạo.

---

### Bước 2: Chạy Mã SQL Khởi Tạo Database & Admin Security
1. Mở menu thanh bên trái của Supabase Dashboard, chọn **SQL Editor**.
2. Mở file [`supabase/schema.sql`](file:///d:/wedding/supabase/schema.sql), sao chép toàn bộ nội dung, dán vào cửa sổ SQL Editor và bấm **RUN**.
3. Mở file [`supabase/policies.sql`](file:///d:/wedding/supabase/policies.sql), dán vào SQL Editor và bấm **RUN** để kích hoạt Row Level Security (RLS) cho trang Khách.
4. Mở file [`supabase/seed.sql`](file:///d:/wedding/supabase/seed.sql), dán vào SQL Editor và bấm **RUN** để nạp dữ liệu mẫu cho đám cưới `nguyen-a-nguyen-b`.
5. Mở file [`supabase/migrations/phase3_admin.sql`](file:///d:/wedding/supabase/migrations/phase3_admin.sql), dán vào SQL Editor và bấm **RUN** để khởi tạo bảng `wedding_admins` và các RLS Policy dành cho Admin.

---

### Bước 3: Tạo Tài Khoản Admin Đăng Nhập
1. Trên Supabase Dashboard, chuyển tới menu **Authentication > Users**.
2. Bấm **"Add user" > "Create user"**.
3. Nhập Email Admin (VD: `admin@wedding.com`) và Mật khẩu đăng nhập.
4. Tích chọn **"Auto Confirm User?"** để không phải xác minh email. Bấm **Create user**.
5. Copy chuỗi **User UID** vừa tạo (VD: `b71e869f-3950-4822-b91c-123456789abc`).
6. Vào **SQL Editor**, chạy đoạn SQL sau để gán tài khoản Admin với đám cưới mẫu:

```sql
INSERT INTO wedding_admins (user_id, wedding_id, role)
VALUES ('DÁN_USER_UID_CỦA_BẠN_VÀO_ĐÂY', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'owner');
```

---

### Bước 4: Cấu Hình API Keys `assets/js/config.js`
1. Vào **Project Settings > API** trong Supabase Dashboard.
2. Lấy 2 giá trị **Project URL** và **`anon` `public` Key**.
3. Điền vào file [`assets/js/config.js`](file:///d:/wedding/assets/js/config.js):

```javascript
const CONFIG = {
  SUPABASE_URL: 'https://xyzcompany.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJKV1QiLCJhbGci...',
  DEFAULT_SLUG: 'nguyen-a-nguyen-b',
};
```

---

## 🔑 ĐĂNG NHẬP QUẢN TRỊ ADMIN

1. Mở đường dẫn `/admin/login.html` (hoặc `https://username.github.io/wedding-invitation/admin/login.html`).
2. Nhập Email & Mật khẩu Admin đã tạo ở **Bước 3**.
3. Sau khi đăng nhập thành công, bạn sẽ được tự động chuyển hướng tới Dashboard Quản trị [`/admin/index.html`](file:///d:/wedding/admin/index.html).
4. Tại đây bạn có thể:
   - Sửa thông tin Chú Rể, Cô Dâu, Ngày Cưới, Lời ngỏ.
   - Thêm / Xóa mốc thời gian Love Story.
   - Thêm / Xóa sự kiện Lễ Cưới.
   - Upload hàng loạt ảnh cưới vào Supabase Storage.
   - Xem & lọc danh sách xác nhận tham dự (RSVP).
   - Duyệt / Ẩn / Xóa lời chúc của quan khách.
   - Bấm nút **"XEM THIỆP"** để mở thiệp khách kiểm tra thay đổi tức thì.

---

## 🌐 HƯỚNG DẪN DEPLOY LÊN GITHUB PAGES

1. Push toàn bộ dự án lên GitHub Repository.
2. Chọn **Settings > Pages > Branch main / root (/)**.
3. Truy cập thiệp cưới tại: `https://username.github.io/repository-name/`
4. Truy cập trang quản trị tại: `https://username.github.io/repository-name/admin/login.html`
