const { pool } = require('../config/db');

const getAllDangers = async (req, res) => {
  try {
    const { filter, search, page = 1, limit = 10 } = req.query;
    let query = 'SELECT * FROM dangers';
    let params = [];
    let whereClauses = [];

    if (filter && filter !== 'all') {
      whereClauses.push('(priority = ? OR status = ?)');
      params.push(filter, filter);
    }

    if (search) {
      whereClauses.push('(title LIKE ? OR location LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += ' ORDER BY report_time DESC';
    
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [dangers] = await pool.query(query, params);
    
    const countQuery = 'SELECT COUNT(*) as total FROM dangers' + (whereClauses.length > 0 ? ' WHERE ' + whereClauses.join(' AND ') : '');
    const [countResult] = await pool.query(countQuery, params.slice(0, -2));

    res.json({
      success: true,
      data: dangers,
      total: countResult[0].total
    });
  } catch (error) {
    res.status(500).json({ error: '获取隐患列表失败: ' + error.message });
  }
};

const getDangerById = async (req, res) => {
  try {
    const { id } = req.params;
    const [dangers] = await pool.query('SELECT * FROM dangers WHERE id = ?', [id]);
    
    if (dangers.length === 0) {
      return res.status(404).json({ error: '隐患不存在' });
    }

    res.json({
      success: true,
      data: dangers[0]
    });
  } catch (error) {
    res.status(500).json({ error: '获取隐患详情失败: ' + error.message });
  }
};

const createDanger = async (req, res) => {
  try {
    const { title, location, type, priority, description, reporter } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: '隐患标题不能为空' });
    }

    const [result] = await pool.query(
      'INSERT INTO dangers (title, location, type, priority, description, reporter) VALUES (?, ?, ?, ?, ?, ?)',
      [title, location || '', type || '', priority || 'medium', description || '', reporter || '']
    );

    res.json({
      success: true,
      message: '隐患添加成功',
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: '添加隐患失败: ' + error.message });
  }
};

const updateDanger = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, location, type, priority, description, status, handler, handle_result } = req.body;

    const [dangers] = await pool.query('SELECT * FROM dangers WHERE id = ?', [id]);
    
    if (dangers.length === 0) {
      return res.status(404).json({ error: '隐患不存在' });
    }

    const updateData = {
      title: title || dangers[0].title,
      location: location || dangers[0].location,
      type: type || dangers[0].type,
      priority: priority || dangers[0].priority,
      description: description || dangers[0].description,
      status: status || dangers[0].status,
      handler: handler || dangers[0].handler
    };

    if (status === 'resolved' && handle_result) {
      updateData.handle_result = handle_result;
      updateData.handle_time = new Date();
    }

    await pool.query(
      'UPDATE dangers SET title = ?, location = ?, type = ?, priority = ?, description = ?, status = ?, handler = ?, handle_result = ?, handle_time = ? WHERE id = ?',
      [updateData.title, updateData.location, updateData.type, updateData.priority, 
       updateData.description, updateData.status, updateData.handler, 
       updateData.handle_result, updateData.handle_time, id]
    );

    res.json({
      success: true,
      message: '隐患更新成功'
    });
  } catch (error) {
    res.status(500).json({ error: '更新隐患失败: ' + error.message });
  }
};

const deleteDanger = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [dangers] = await pool.query('SELECT * FROM dangers WHERE id = ?', [id]);
    
    if (dangers.length === 0) {
      return res.status(404).json({ error: '隐患不存在' });
    }

    await pool.query('DELETE FROM dangers WHERE id = ?', [id]);

    res.json({
      success: true,
      message: '隐患删除成功'
    });
  } catch (error) {
    res.status(500).json({ error: '删除隐患失败: ' + error.message });
  }
};

const getDangerStats = async (req, res) => {
  try {
    const [highCount] = await pool.query('SELECT COUNT(*) as count FROM dangers WHERE priority = ?', ['high']);
    const [mediumCount] = await pool.query('SELECT COUNT(*) as count FROM dangers WHERE priority = ?', ['medium']);
    const [lowCount] = await pool.query('SELECT COUNT(*) as count FROM dangers WHERE priority = ?', ['low']);
    const [pendingCount] = await pool.query('SELECT COUNT(*) as count FROM dangers WHERE status = ?', ['pending']);
    const [processingCount] = await pool.query('SELECT COUNT(*) as count FROM dangers WHERE status = ?', ['processing']);
    const [resolvedCount] = await pool.query('SELECT COUNT(*) as count FROM dangers WHERE status = ?', ['resolved']);

    res.json({
      success: true,
      data: {
        high: highCount[0].count,
        medium: mediumCount[0].count,
        low: lowCount[0].count,
        pending: pendingCount[0].count,
        processing: processingCount[0].count,
        resolved: resolvedCount[0].count
      }
    });
  } catch (error) {
    res.status(500).json({ error: '获取统计数据失败: ' + error.message });
  }
};

const getHeatmapData = async (req, res) => {
  try {
    const [locations] = await pool.query(`
      SELECT location, COUNT(*) as count, priority 
      FROM dangers 
      WHERE status != 'resolved' 
      GROUP BY location, priority 
      ORDER BY count DESC
    `);

    const heatmapData = {};
    const locationPositions = {
      '教学楼': { x: -2, z: 0, color: '#3b82f6' },
      '实验楼': { x: 2, z: 0, color: '#8b5cf6' },
      '食堂': { x: 0, z: -2, color: '#f59e0b' },
      '体育馆': { x: 3, z: 2, color: '#10b981' },
      '图书馆': { x: -3, z: 2, color: '#ef4444' },
      '行政楼': { x: 0, z: 2, color: '#ec4899' },
      '操场': { x: 0, z: -4, color: '#22c55e' },
      '教学楼3楼走廊': { x: -2, z: 0, color: '#3b82f6' },
      '操场西北角': { x: 0, z: -4, color: '#22c55e' },
      '实验楼2楼楼梯': { x: 2, z: 0, color: '#8b5cf6' },
      '食堂后厨': { x: 0, z: -2, color: '#f59e0b' },
      '西教学楼走廊': { x: -2, z: 0, color: '#3b82f6' }
    };

    locations.forEach(item => {
      const pos = locationPositions[item.location] || { x: 0, z: 0, color: '#6b7280' };
      if (!heatmapData[item.location]) {
        heatmapData[item.location] = { ...pos, count: 0, high: 0, medium: 0, low: 0 };
      }
      heatmapData[item.location].count += item.count;
      heatmapData[item.location][item.priority] += item.count;
    });

    res.json({
      success: true,
      data: Object.entries(heatmapData).map(([name, data]) => ({ name, ...data }))
    });
  } catch (error) {
    res.status(500).json({ error: '获取热力图数据失败: ' + error.message });
  }
};

module.exports = { getAllDangers, getDangerById, createDanger, updateDanger, deleteDanger, getDangerStats, getHeatmapData };
