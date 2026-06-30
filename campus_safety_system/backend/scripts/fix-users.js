const mysql = require('mysql2/promise');
require('dotenv').config();

const fixUsers = async () => {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    const [users] = await pool.query('SELECT id, username, status FROM users');
    console.log('当前用户列表:', users);

    const [result] = await pool.query('UPDATE users SET status = 1 WHERE status != 1');
    console.log('已启用', result.changedRows, '个用户');

    const [updatedUsers] = await pool.query('SELECT id, username, status FROM users');
    console.log('更新后用户列表:', updatedUsers);

    await pool.end();
  } catch (error) {
    console.error('操作失败:', error);
    process.exit(1);
  }
};

fixUsers();