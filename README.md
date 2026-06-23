# CIA Learning Platform

Trang web học và luyện thi CIA (Certified Internal Auditor) — Part 1, 2 & 3.
Cập nhật theo syllabus 2026–2027.

## Nội dung
- **Part 1** — Essentials of Internal Auditing
- **Part 2** — Practice of Internal Auditing (14 Study Units · 1,981 câu hỏi)
- **Part 3** — Business Knowledge for Internal Auditing (6 Study Units · 752 câu hỏi)

Bao gồm: bài học lý thuyết, ngân hàng câu hỏi có giải thích, chế độ thi mô phỏng, và theo dõi tiến độ cá nhân.

## Đây là trang web tĩnh (static site)
Không cần build, không cần server. Chỉ là HTML/CSS/JavaScript thuần.

## Cách deploy lên Netlify

### Cách 1 — Qua GitHub (khuyên dùng)
1. Tạo một repository mới trên GitHub.
2. Upload **toàn bộ nội dung trong thư mục này** (file `index.html` phải nằm ở thư mục gốc của repo).
3. Đăng nhập [netlify.com](https://www.netlify.com) → **Add new site** → **Import an existing project** → chọn GitHub → chọn repo vừa tạo.
4. Để **Build command** trống, **Publish directory** để `.` (dấu chấm, tức thư mục gốc).
5. Nhấn **Deploy**. Sau vài giây bạn sẽ có một địa chỉ web `*.netlify.app`.

### Cách 2 — Kéo-thả (nhanh nhất, không cần GitHub)
1. Vào [app.netlify.com/drop](https://app.netlify.com/drop).
2. Kéo nguyên thư mục này thả vào trang. Xong.

## Cấu trúc
```
index.html          ← trang chính (entry point)
netlify.toml        ← cấu hình Netlify
src/
  data/             ← dữ liệu câu hỏi & bài học (Part 1, 2, 3)
  pages/            ← các trang
  components/       ← thành phần giao diện
  utils/            ← tiện ích (auth, storage, ...)
  styles/           ← CSS
```

## Lưu ý
- Dữ liệu người dùng (đăng ký, tiến độ học) được lưu trong `localStorage` của trình duyệt — chạy hoàn toàn phía client, không cần backend.
- Phông chữ tải từ Google Fonts (cần internet). Nếu muốn bản chạy hoàn toàn offline, dùng file standalone đã xuất riêng.
