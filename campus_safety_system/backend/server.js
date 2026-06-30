const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { connectDB } = require('./config/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/danger', require('./routes/danger'));
app.use('/api/drill', require('./routes/drill'));
app.use('/api/notice', require('./routes/notice'));
app.use('/api/course', require('./routes/course'));
app.use('/api/user', require('./routes/user'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/supplies', require('./routes/supplies'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '服务器运行正常' });
});

app.use(express.static(path.join(__dirname, '..')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'login.html'));
});

app.get('*', (req, res) => {
  const filePath = path.join(__dirname, '..', req.path);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
  }
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
  });
});
