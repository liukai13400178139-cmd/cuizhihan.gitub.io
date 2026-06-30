const { pool } = require('../config/db');

const getAllNotices = async (req, res) => {
  try {
    const { filter, search, page = 1, limit = 10 } = req.query;
    let query = 'SELECT * FROM notices';
    let params = [];
    let whereClauses = [];

    if (filter && filter !== 'all') {
      whereClauses.push('type = ?');
      params.push(filter);
    }

    if (search) {
      whereClauses.push('(title LIKE ? OR content LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';
    
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [notices] = await pool.query(query, params);
    
    const countQuery = 'SELECT COUNT(*) as total FROM notices' + (whereClauses.length > 0 ? ' WHERE ' + whereClauses.join(' AND ') : '');
    const [countResult] = await pool.query(countQuery, params.slice(0, -2));

    res.json({
      success: true,
      data: notices,
      total: countResult[0].total
    });
  } catch (error) {
    res.status(500).json({ error: '获取通知列表失败: ' + error.message });
  }
};

const getNoticeById = async (req, res) => {
  try {
    const { id } = req.params;
    const [notices] = await pool.query('SELECT * FROM notices WHERE id = ?', [id]);
    
    if (notices.length === 0) {
      return res.status(404).json({ error: '通知不存在' });
    }

    await pool.query('UPDATE notices SET is_read = 1 WHERE id = ?', [id]);

    res.json({
      success: true,
      data: notices[0]
    });
  } catch (error) {
    res.status(500).json({ error: '获取通知详情失败: ' + error.message });
  }
};

const createNotice = async (req, res) => {
  try {
    const { title, content, type, priority, author, recipient_group } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: '通知标题和内容不能为空' });
    }

    const [result] = await pool.query(
      'INSERT INTO notices (title, content, type, priority, author, recipient_group) VALUES (?, ?, ?, ?, ?, ?)',
      [title, content, type || 'info', priority || 'normal', author || '', recipient_group || 'all']
    );

    res.json({
      success: true,
      message: '通知发布成功',
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: '发布通知失败: ' + error.message });
  }
};

const updateNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, type, priority, author, recipient_group } = req.body;

    const [notices] = await pool.query('SELECT * FROM notices WHERE id = ?', [id]);
    
    if (notices.length === 0) {
      return res.status(404).json({ error: '通知不存在' });
    }

    await pool.query(
      'UPDATE notices SET title = ?, content = ?, type = ?, priority = ?, author = ?, recipient_group = ? WHERE id = ?',
      [title || notices[0].title, content || notices[0].content, 
       type || notices[0].type, priority || notices[0].priority,
       author || notices[0].author, recipient_group || notices[0].recipient_group, id]
    );

    res.json({
      success: true,
      message: '通知更新成功'
    });
  } catch (error) {
    res.status(500).json({ error: '更新通知失败: ' + error.message });
  }
};

const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [notices] = await pool.query('SELECT * FROM notices WHERE id = ?', [id]);
    
    if (notices.length === 0) {
      return res.status(404).json({ error: '通知不存在' });
    }

    await pool.query('DELETE FROM notices WHERE id = ?', [id]);

    res.json({
      success: true,
      message: '通知删除成功'
    });
  } catch (error) {
    res.status(500).json({ error: '删除通知失败: ' + error.message });
  }
};

const getNoticeStats = async (req, res) => {
  try {
    const [dangerCount] = await pool.query('SELECT COUNT(*) as count FROM notices WHERE type = ?', ['danger']);
    const [warningCount] = await pool.query('SELECT COUNT(*) as count FROM notices WHERE type = ?', ['warning']);
    const [infoCount] = await pool.query('SELECT COUNT(*) as count FROM notices WHERE type = ?', ['info']);
    const [unreadCount] = await pool.query('SELECT COUNT(*) as count FROM notices WHERE is_read = 0');

    res.json({
      success: true,
      data: {
        danger: dangerCount[0].count,
        warning: warningCount[0].count,
        info: infoCount[0].count,
        unread: unreadCount[0].count
      }
    });
  } catch (error) {
    res.status(500).json({ error: '获取统计数据失败: ' + error.message });
  }
};

module.exports = { getAllNotices, getNoticeById, createNotice, updateNotice, deleteNotice, getNoticeStats };
