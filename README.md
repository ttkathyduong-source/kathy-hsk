# Kathy Dương · HSK 7–9 冲刺班 — v3

Web tĩnh có thể deploy trực tiếp lên Netlify.

## Điểm mới của v3
- Bỏ hoàn toàn mục “Câu nghị luận mẫu”.
- Font giao diện tiếng Việt dùng Times New Roman.
- 3 chế độ chính: Danh sách, Flashcard, Bài tập.
- Có 4 trạng thái học rõ ràng: Chưa thuộc, Cần ôn, Đã thuộc, Câu sai.
- Người học có thể chủ động đánh dấu “Cần ôn”.
- Bài làm sai tự động vào cả “Cần ôn” và “Câu sai”.
- Mục “Làm lại câu sai”: câu sai chỉ được gỡ sau 2 lần trả lời đúng liên tiếp.
- Flashcard tách nút thao tác khỏi thẻ để tránh chồng giao diện.
- Mobile có thanh điều hướng 3 mục cố định phía dưới.
- Màu chính: #2060B6.
- 120 câu cổ ngữ giữ nguyên dữ liệu v2.

## Deploy Netlify
Giải nén thư mục và kéo toàn bộ thư mục vào Netlify > Add new site > Deploy manually.
Không cần npm hoặc build.


## v3.1
- Sửa bộ đếm Câu sai/Cần ôn cập nhật ngay trong màn Bài tập.
- Chuẩn hóa ID lưu trong localStorage để tránh lỗi khi nâng cấp từ bản cũ.
- Câu sai đếm theo số câu khác nhau; số lần sai của từng câu vẫn được lưu riêng.


## v3.2
- Ép font Times New Roman cho các tiêu đề trạng thái ở đầu trang, gồm “ÔN TẬP / Cần ôn” và “LÀM LẠI / Câu sai”.
