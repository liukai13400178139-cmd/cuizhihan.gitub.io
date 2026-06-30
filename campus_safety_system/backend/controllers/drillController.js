const { pool } = require('../config/db');

const getAllDrills = async (req, res) => {
  try {
    const { filter, search, page = 1, limit = 10 } = req.query;
    let query = 'SELECT * FROM drills';
    let params = [];
    let whereClauses = [];

    if (filter && filter !== 'all') {
      whereClauses.push('(type = ? OR status = ?)');
      params.push(filter, filter);
    }

    if (search) {
      whereClauses.push('(title LIKE ? OR location LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += ' ORDER BY date DESC';
    
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [drills] = await pool.query(query, params);
    
    const countQuery = 'SELECT COUNT(*) as total FROM drills' + (whereClauses.length > 0 ? ' WHERE ' + whereClauses.join(' AND ') : '');
    const [countResult] = await pool.query(countQuery, params.slice(0, -2));

    res.json({
      success: true,
      data: drills,
      total: countResult[0].total
    });
  } catch (error) {
    res.status(500).json({ error: '获取演练列表失败: ' + error.message });
  }
};

const getDrillById = async (req, res) => {
  try {
    const { id } = req.params;
    const [drills] = await pool.query('SELECT * FROM drills WHERE id = ?', [id]);
    
    if (drills.length === 0) {
      return res.status(404).json({ error: '演练不存在' });
    }

    res.json({
      success: true,
      data: drills[0]
    });
  } catch (error) {
    res.status(500).json({ error: '获取演练详情失败: ' + error.message });
  }
};

const createDrill = async (req, res) => {
  try {
    const { title, type, date, time, location, participants, manager, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: '演练标题不能为空' });
    }

    const [result] = await pool.query(
      'INSERT INTO drills (title, type, date, time, location, participants, manager, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, type || '', date || '', time || '', location || '', participants || 0, manager || '', description || '']
    );

    res.json({
      success: true,
      message: '演练添加成功',
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: '添加演练失败: ' + error.message });
  }
};

const updateDrill = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, date, time, location, participants, status, description } = req.body;

    const [drills] = await pool.query('SELECT * FROM drills WHERE id = ?', [id]);
    
    if (drills.length === 0) {
      return res.status(404).json({ error: '演练不存在' });
    }

    await pool.query(
      'UPDATE drills SET title = ?, type = ?, date = ?, time = ?, location = ?, participants = ?, status = ?, description = ? WHERE id = ?',
      [title || drills[0].title, type || drills[0].type, date || drills[0].date,
       time || drills[0].time, location || drills[0].location, 
       participants || drills[0].participants, status || drills[0].status,
       description || drills[0].description, id]
    );

    res.json({
      success: true,
      message: '演练更新成功'
    });
  } catch (error) {
    res.status(500).json({ error: '更新演练失败: ' + error.message });
  }
};

const deleteDrill = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [drills] = await pool.query('SELECT * FROM drills WHERE id = ?', [id]);
    
    if (drills.length === 0) {
      return res.status(404).json({ error: '演练不存在' });
    }

    await pool.query('DELETE FROM drills WHERE id = ?', [id]);

    res.json({
      success: true,
      message: '演练删除成功'
    });
  } catch (error) {
    res.status(500).json({ error: '删除演练失败: ' + error.message });
  }
};

const getDrillStats = async (req, res) => {
  try {
    const [fireCount] = await pool.query('SELECT COUNT(*) as count FROM drills WHERE type = ?', ['fire']);
    const [earthquakeCount] = await pool.query('SELECT COUNT(*) as count FROM drills WHERE type = ?', ['earthquake']);
    const [crushCount] = await pool.query('SELECT COUNT(*) as count FROM drills WHERE type = ?', ['crush']);
    const [upcomingCount] = await pool.query('SELECT COUNT(*) as count FROM drills WHERE status = ?', ['upcoming']);
    const [inProgressCount] = await pool.query('SELECT COUNT(*) as count FROM drills WHERE status = ?', ['in-progress']);
    const [completedCount] = await pool.query('SELECT COUNT(*) as count FROM drills WHERE status = ?', ['completed']);

    res.json({
      success: true,
      data: {
        fire: fireCount[0].count,
        earthquake: earthquakeCount[0].count,
        crush: crushCount[0].count,
        upcoming: upcomingCount[0].count,
        inProgress: inProgressCount[0].count,
        completed: completedCount[0].count
      }
    });
  } catch (error) {
    res.status(500).json({ error: '获取统计数据失败: ' + error.message });
  }
};

module.exports = { getAllDrills, getDrillById, createDrill, updateDrill, deleteDrill, getDrillStats };
