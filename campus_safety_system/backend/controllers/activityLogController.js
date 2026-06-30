const { pool } = require('../config/db');

const getAllLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const [logs] = await pool.query(
      'SELECT al.*, u.real_name as user_name FROM activity_logs al LEFT JOIN users u ON al.user_id = u.id ORDER BY al.created_at DESC LIMIT ? OFFSET ?',
      [parseInt(limit), offset]
    );
    
    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM activity_logs');

    res.json({
      success: true,
      data: logs,
      total: countResult[0].total
    });
  } catch (error) {
    res.status(500).json({ error: '获取活动日志失败: ' + error.message });
  }
};

const createLog = async (userId, action, targetType, targetId, description, ipAddress = '') => {
  try {
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, target_type, target_id, description, ip_address) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, action, targetType, targetId, description, ipAddress]
    );
  } catch (error) {
    console.error('记录活动日志失败:', error);
  }
};

const getRecentLogs = async (req, res) => {
  try {
    const [logs] = await pool.query(
      'SELECT al.*, u.real_name as user_name FROM activity_logs al LEFT JOIN users u ON al.user_id = u.id ORDER BY al.created_at DESC LIMIT 10'
    );
    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    res.status(500).json({ error: '获取最近日志失败: ' + error.message });
  }
};

module.exports = { getAllLogs, createLog, getRecentLogs };