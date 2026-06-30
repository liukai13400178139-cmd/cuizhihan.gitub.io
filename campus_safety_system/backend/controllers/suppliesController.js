const pool = require('../config/db');

const getAllSupplies = async (req, res) => {
  try {
    const { filter = 'all', search = '' } = req.query;
    let query = 'SELECT * FROM supplies WHERE 1=1';
    const params = [];
    
    if (filter !== 'all') {
      query += ' AND category = ?';
      params.push(filter);
    }
    
    if (search) {
      query += ' AND (name LIKE ? OR location LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [supplies] = await pool.query(query, params);
    res.json({ success: true, data: supplies });
  } catch (error) {
    res.status(500).json({ error: '获取物资列表失败: ' + error.message });
  }
};

const getSuppliesById = async (req, res) => {
  try {
    const { id } = req.params;
    const [supplies] = await pool.query('SELECT * FROM supplies WHERE id = ?', [id]);
    
    if (supplies.length === 0) {
      return res.status(404).json({ error: '物资不存在' });
    }
    
    res.json({ success: true, data: supplies[0] });
  } catch (error) {
    res.status(500).json({ error: '获取物资详情失败: ' + error.message });
  }
};

const createSupplies = async (req, res) => {
  try {
    const { name, category, quantity, location, expiry_date, status } = req.body;
    
    if (!name || !category || !quantity) {
      return res.status(400).json({ error: '请填写必要信息' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO supplies (name, category, quantity, location, expiry_date, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, category, quantity, location, expiry_date, status || 'available']
    );
    
    res.json({
      success: true,
      message: '物资添加成功',
      data: { id: result.insertId, name, category, quantity, location, expiry_date, status }
    });
  } catch (error) {
    res.status(500).json({ error: '添加物资失败: ' + error.message });
  }
};

const updateSupplies = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, quantity, location, expiry_date, status } = req.body;
    
    const [supplies] = await pool.query('SELECT * FROM supplies WHERE id = ?', [id]);
    
    if (supplies.length === 0) {
      return res.status(404).json({ error: '物资不存在' });
    }
    
    await pool.query(
      'UPDATE supplies SET name = ?, category = ?, quantity = ?, location = ?, expiry_date = ?, status = ? WHERE id = ?',
      [name || supplies[0].name, category || supplies[0].category, 
       quantity || supplies[0].quantity, location || supplies[0].location,
       expiry_date || supplies[0].expiry_date, status || supplies[0].status, id]
    );
    
    res.json({ success: true, message: '物资更新成功' });
  } catch (error) {
    res.status(500).json({ error: '更新物资失败: ' + error.message });
  }
};

const deleteSupplies = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [supplies] = await pool.query('SELECT * FROM supplies WHERE id = ?', [id]);
    
    if (supplies.length === 0) {
      return res.status(404).json({ error: '物资不存在' });
    }
    
    await pool.query('DELETE FROM supplies WHERE id = ?', [id]);
    
    res.json({ success: true, message: '物资删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除物资失败: ' + error.message });
  }
};

const getSuppliesStats = async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN status = 'low' THEN 1 ELSE 0 END) as low,
        SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expired,
        SUM(CASE WHEN category = 'fire' THEN 1 ELSE 0 END) as fire,
        SUM(CASE WHEN category = 'medical' THEN 1 ELSE 0 END) as medical,
        SUM(CASE WHEN category = 'rescue' THEN 1 ELSE 0 END) as rescue,
        SUM(CASE WHEN category = 'food' THEN 1 ELSE 0 END) as food
      FROM supplies
    `);
    
    res.json({ success: true, data: stats[0] });
  } catch (error) {
    res.status(500).json({ error: '获取物资统计失败: ' + error.message });
  }
};

module.exports = { getAllSupplies, getSuppliesById, createSupplies, updateSupplies, deleteSupplies, getSuppliesStats };