# Toán Vui Lớp 3

Ứng dụng web học Toán lớp 2, bám theo cấu trúc SGK **Toán 3 – bộ sách Kết nối tri thức với cuộc sống**.

## Tính năng
- 69 bài (Tập một và Tập hai), gồm cả Luyện tập chung và Ôn tập: bảng nhân chia 2–9, số đến 100 000, hình phẳng, chu vi, diện tích, mm, g, ml, °C, đồng hồ, tiền Việt Nam, thống kê.
- Mỗi bài có 3 bước: **Học bài** (thẻ kiến thức có hình minh hoạ, nút nghe đọc) → **Trò chơi** → **Kiểm tra**.
- 5 trò chơi: Bắn bóng bay, Câu cá, Đua xe, Lật thẻ tìm cặp, Xếp số.
- Bài kiểm tra 10 câu, chấm thang điểm 10, xếp loại Hoàn thành tốt / Hoàn thành / Chưa hoàn thành, kèm lời giải và phần xem lại câu sai.
- Câu hỏi sinh ngẫu nhiên nên mỗi lần làm là một đề mới.
- Tiến độ (ngôi sao, điểm) lưu trong trình duyệt của máy đang dùng.

## Chạy thử
Mở `index.html` bằng trình duyệt, hoặc truy cập bản đã đăng trên GitHub Pages.

## Cấu trúc
| Tệp | Nội dung |
|---|---|
| `index.html` | Giao diện và CSS |
| `core.js` | Tiện ích, đọc số tiếng Việt, hình minh hoạ (SVG/HTML) |
| `lessons.js` | Nội dung bài học và bộ sinh câu hỏi cho từng bài |
| `app.js` | Điều hướng, trò chơi, bài kiểm tra, lưu tiến độ |

Không cần cài đặt hay build; chỉ dùng HTML, CSS, JavaScript thuần.
