const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

const getAllUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    let query = 'SELECT u.*, r.name as role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id';
    let params = [];
    let whereClauses = [];

    if (search) {
      whereClauses.push('(u.username LIKE ? OR u.real_name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += ' ORDER BY u.created_at DESC';
    
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [users] = await pool.query(query, params);
    
    const countQuery = 'SELECT COUNT(*) as total FROM users u LEFT JOIN roles r ON u.role_id = r.id' + (whereClauses.length > 0 ? ' WHERE ' + whereClauses.join(' AND ') : '');
    const [countResult] = await pool.query(countQuery, params.slice(0, -2));

    res.json({
      success: true,
      data: users,
      total: countResult[0].total
    });
  } catch (error) {
    res.status(500).json({ error: '获取用户列表失败: ' + error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [users] = await pool.query(
      'SELECT u.*, r.name as role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.id = ?',
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const user = users[0];
    delete user.password;

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ error: '获取用户详情失败: ' + error.message });
  }
};

const createUser = async (req, res) => {
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
      message: '用户添加成功',
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: '添加用户失败: ' + error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, real_name, phone, email, role_id, status } = req.body;

    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    await pool.query(
      'UPDATE users SET username = ?, real_name = ?, phone = ?, email = ?, role_id = ?, status = ? WHERE id = ?',
      [username || users[0].username, real_name || users[0].real_name,
       phone || users[0].phone, email || users[0].email,
       role_id || users[0].role_id, status !== undefined ? status : users[0].status, id]
    );

    res.json({
      success: true,
      message: '用户更新成功'
    });
  } catch (error) {
    res.status(500).json({ error: '更新用户失败: ' + error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (id === '1') {
      return res.status(400).json({ error: '不能删除管理员账户' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);

    res.json({
      success: true,
      message: '用户删除成功'
    });
  } catch (error) {
    res.status(500).json({ error: '删除用户失败: ' + error.message });
  }
};

const getAllRoles = async (req, res) => {
  try {
    const [roles] = await pool.query('SELECT * FROM roles ORDER BY id ASC');
    
    res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    res.status(500).json({ error: '获取角色列表失败: ' + error.message });
  }
};

const getUserStats = async (req, res) => {
  try {
    const [adminCount] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role_id = 1');
    const [teacherCount] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role_id = 2');
    const [studentCount] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role_id = 3');
    const [totalCount] = await pool.query('SELECT COUNT(*) as count FROM users');

    res.json({
      success: true,
      data: {
        admin: adminCount[0].count,
        teacher: teacherCount[0].count,
        student: studentCount[0].count,
        total: totalCount[0].count
      }
    });
  } catch (error) {
    res.status(500).json({ error: '获取统计数据失败: ' + error.message });
  }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser, getAllRoles, getUserStats };
