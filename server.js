const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Cấu hình phục vụ các tệp tĩnh từ thư mục 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Trả về trang chủ index.html cho mọi route không xác định
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Pocket Calculator Server is running successfully!`);
  console.log(`🌍 URL: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
```

---