# HSK 7–9 古语100句 · Netlify static site

Trang web tĩnh, không cần build tool. Chỉ cần kéo toàn bộ thư mục lên Netlify Drop hoặc push lên GitHub rồi kết nối Netlify.

## Files
- `index.html` — giao diện chính
- `styles.css` — theme màu `#2060B6`
- `data.js` — dữ liệu 100 câu cổ ngữ
- `app.js` — logic học, flashcard, bài tập, localStorage
- `netlify.toml` — cấu hình deploy Netlify

## Cách deploy nhanh
1. Giải nén thư mục.
2. Vào Netlify → Add new site → Deploy manually.
3. Kéo cả thư mục `kathy-hsk-netlify` vào vùng upload.
4. Netlify sẽ cấp URL ngay.

## Chỉnh nội dung
Dữ liệu nằm trong `data.js`. Mỗi mục gồm `text`, `pinyin`, `source`, `core`, `category`.

## Lưu ý
Nguồn/出处 hiện dùng theo danh sách nội dung đã cung cấp; nên rà soát học thuật lần cuối trước khi xuất bản chính thức.

Phát triển bởi Kathy Dương.
