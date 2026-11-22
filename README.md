# Giác kế STEM – Học liệu số Toán 9

Trang web tĩnh, viết bằng HTML, CSS và JavaScript thuần, không cần bước build. Trang gồm:

- mô phỏng góc nâng và chiều cao
- thử thách đọc giác kế
- 5 câu hỏi khởi động
- 2 video hướng dẫn
- phần tải học liệu (bảng tính Excel, bài trình chiếu)

## Cấu trúc

```
index.html              Trang chính
favicon.svg
vercel.json             Cấu hình Vercel (cache, bảo mật)
assets/css/styles.css   Giao diện (mobile-first, sáng/tối)
assets/js/app.js        Mô phỏng, thử thách, trắc nghiệm
assets/media/           Video + ảnh bìa video
assets/files/           Bảng tính .xlsx, bài trình chiếu .pptx
```

## Chạy thử trên máy

Mở terminal trong thư mục này rồi chạy:

```
npx serve .
```

hoặc dùng `python3 -m http.server 8000`, sau đó mở http://localhost:8000.

Trang dùng đường dẫn tuyệt đối (`/assets/...`), nên bấm đúp vào index.html sẽ không chạy. Phải mở qua một máy chủ như trên.

## Deploy lên Vercel

**Cách 1 – Dùng Vercel CLI, không cần GitHub**

1. Cài Vercel CLI: `npm i -g vercel`
2. Trong thư mục này chạy `vercel`, đăng nhập và trả lời các câu hỏi. Ở mục Framework chọn **Other**, các lệnh build để trống.
3. Chạy `vercel --prod` để có đường link chính thức.

**Cách 2 – Qua GitHub**

1. Đẩy thư mục này lên một repo GitHub.
2. Vào vercel.com → **Add New… → Project** → chọn repo.
3. Ở mục Framework Preset chọn **Other**. Để trống Build Command và Output Directory, rồi bấm **Deploy**.

Mỗi lần sửa file và đẩy lên GitHub, Vercel sẽ tự cập nhật trang.

## Tuỳ chỉnh nhanh

- **Màu sắc:** sửa các biến `--accent`, `--bg`… ở đầu `assets/css/styles.css`. Có hai bộ màu, cho giao diện sáng và tối.
- **Câu hỏi trắc nghiệm:** sửa mảng `Q` trong `assets/js/app.js`. Mỗi câu gồm:
  - `t`: nội dung câu hỏi
  - `o`: các đáp án
  - `c`: số thứ tự đáp án đúng, đếm từ 0
  - `w`: lời giải thích
- **Giới hạn thanh trượt:** sửa thuộc tính `min`, `max`, `step` của các thẻ `<input type="range">` trong `index.html`.
