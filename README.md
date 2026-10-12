# 🧮 Pocket Calculator (Máy tính cầm tay bỏ túi cao cấp)

Ứng dụng máy tính cầm tay bỏ túi giả lập cơ học trực quan, hiện đại được tối ưu hóa cho cả thiết bị di động và máy tính để bàn. 

## 🎯 Kịch Bản Nghiệp Vụ Được Hỗ Trợ
- **[SC-01] Phép tính cơ bản:** Thực hiện cộng, trừ, nhân, chia với độ chính xác cao (loại bỏ lỗi dấu phẩy động của JavaScript, ví dụ: `0.1 + 0.2 = 0.3` thay vì `0.30000000000000004`).
- **[SC-02] Xử lý ngoại lệ và Edge Cases:**
  - Chặn lỗi chia cho 0 trực quan ("Error: Division by zero").
  - Ngăn chặn nhập nhiều dấu thập phân liên tục trong cùng một toán hạng (ví dụ: `4.5.6` là không hợp lệ).
  - Tự động làm tròn thông minh tối đa 8 chữ số thập phân để chống tràn màn hình hiển thị.
- **[SC-03] Quản lý Lịch sử phép tính:** Lưu lịch sử các phép tính đã thực hiện vào bộ nhớ trình duyệt (`localStorage`). Người dùng có thể click vào lịch sử để nạp lại phép tính hoặc xóa toàn bộ lịch sử.
- **[SC-04] Trải nghiệm tương tác & Phím tắt:**
  - Hỗ trợ đầy đủ phím tắt bàn phím vật lý (`0-9`, `+`, `-`, `*`, `/`, `Enter` hoặc `=` để tính, `Esc` hoặc `Backspace` để xóa, `.` cho dấu thập phân).
  - Hiệu ứng phản hồi xúc giác giả lập (Visual feedback animation) khi click hoặc nhấn phím.

## 🛠️ Hướng Dẫn Cài Đặt và Khởi Chạy

### 1. Yêu cầu hệ thống
- Cần cài đặt sẵn [Node.js](https://nodejs.org/) (Phiên bản v16 trở lên khuyến nghị).

### 2. Cài đặt các thư viện phụ thuộc
Di chuyển vào thư mục dự án và cài đặt:
```bash
npm install
```

### 3. Khởi chạy ứng dụng (Môi trường Development)
Khởi chạy máy chủ Node.js cục bộ:
```bash
npm start
```
Truy cập ứng dụng tại địa chỉ: `http://localhost:3000`

### 4. Chạy kiểm thử tự động (Automation Tests)
Dự án tích hợp sẵn bộ kiểm thử Playwright để tự động hóa toàn bộ kịch bản nghiệp vụ:
```bash
npm test
```

## 📂 Cấu Trúc Thư Mục Dự Án
```text
pocket-calculator/
├── package.json
├── server.js
├── README.md
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
└── tests/
    └── calculator.spec.js
```
```

---