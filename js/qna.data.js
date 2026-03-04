// File: js/qna.data.js
// Cấu trúc Data dạng JSON Object để dễ quản lý

const QNA_DATABASE = {
  1: {
    topic: "HTTP & Web",
    points: 100,
    text: "Mã trạng thái HTTP nào biểu thị lỗi 'Not Found' (Không tìm thấy tài nguyên)?",
    snippet: null,
    options: [
      "200 OK",
      "301 Moved Permanently",
      "403 Forbidden",
      "404 Not Found",
    ],
    correctIdx: 3, // Vị trí đáp án đúng (tính từ 0)
  },
  2: {
    topic: "XSS Vulnerability",
    points: 200,
    text: "Đoạn mã PHP dưới đây mắc lỗi bảo mật gì?",
    snippet:
      "<?php\n  $name = $_GET['name'];\n  echo '<h1>Hello ' . $name . '</h1>';\n?>",
    options: ["SQL Injection", "Reflected XSS", "Stored XSS", "CSRF"],
    correctIdx: 1,
  },
  3: {
    topic: "Authentication",
    points: 150,
    text: "Giao thức nào dưới đây thường được sử dụng để cấp quyền (Authorization) thay vì xác thực (Authentication)?",
    snippet: null,
    options: ["SAML", "OpenID Connect", "OAuth 2.0", "Kerberos"],
    correctIdx: 2,
  },
  // Cậu có thể copy paste cấu trúc này để điền tiếp từ câu 4 đến 10 nhé!
};
