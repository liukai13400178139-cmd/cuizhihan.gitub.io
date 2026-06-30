const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../config/jwt');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const user = users[0];
    
    if (user.status !== 1) {
      return res.status(401).json({ error: '账号已被禁用' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const token = generateToken(user);
    
    const [role] = await pool.query('SELECT name FROM roles WHERE id = ?', [user.role_id]);
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        real_name: user.real_name,
        role: role[0]?.name || 'user',
        role_id: user.role_id
      }
    });
  } catch (error) {
    res.status(500).json({ error: '登录失败: ' + error.message });
  }
};

const register = async (req, res) => {
  try {
    const { username, password, real_name, phone, email, role_id } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    const [existing] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    
    if (existing.length > 0) {
      return res.status(400).json({ error: '用户名已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.query(
      'INSERT INTO users (username, password, real_name, phone, email, role_id) VALUES (?, ?, ?, ?, ?, ?)',
      [username, hashedPassword, real_name || '', phone || '', email || '', role_id || 2]
    );

    res.json({
      success: true,
      message: '注册成功',
      userId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: '注册失败: ' + error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const { id } = req.user;
    
    const [users] = await pool.query('SELECT id, username, real_name, phone, email, role_id FROM users WHERE id = ?', [id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const [role] = await pool.query('SELECT name FROM roles WHERE id = ?', [users[0].role_id]);

    res.json({
      success: true,
      user: {
        ...users[0],
        role: role[0]?.name || 'user'
      }
    });
  } catch (error) {
    res.status(500).json({ error: '获取用户信息失败: ' + error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { id } = req.user;
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: '旧密码和新密码不能为空' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: '新密码长度不能少于6位' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: '旧密码不正确' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);

    res.json({
      success: true,
      message: '密码修改成功'
    });
  } catch (error) {
    res.status(500).json({ error: '修改密码失败: ' + error.message });
  }
};

module.exports = { login, register, getProfile, changePassword };
