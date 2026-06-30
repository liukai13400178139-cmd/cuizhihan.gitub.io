const { pool } = require('../config/db');

const getAllCourses = async (req, res) => {
  try {
    const { filter, search, page = 1, limit = 10 } = req.query;
    let query = 'SELECT * FROM courses';
    let params = [];
    let whereClauses = [];

    if (filter && filter !== 'all') {
      whereClauses.push('type = ?');
      params.push(filter);
    }

    if (search) {
      whereClauses.push('(title LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';
    
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [courses] = await pool.query(query, params);
    
    const countQuery = 'SELECT COUNT(*) as total FROM courses' + (whereClauses.length > 0 ? ' WHERE ' + whereClauses.join(' AND ') : '');
    const [countResult] = await pool.query(countQuery, params.slice(0, -2));

    res.json({
      success: true,
      data: courses,
      total: countResult[0].total
    });
  } catch (error) {
    res.status(500).json({ error: '获取课程列表失败: ' + error.message });
  }
};

const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const [courses] = await pool.query('SELECT * FROM courses WHERE id = ?', [id]);
    
    if (courses.length === 0) {
      return res.status(404).json({ error: '课程不存在' });
    }

    res.json({
      success: true,
      data: courses[0]
    });
  } catch (error) {
    res.status(500).json({ error: '获取课程详情失败: ' + error.message });
  }
};

const createCourse = async (req, res) => {
  try {
    const { title, type, duration, description, content, image } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: '课程标题不能为空' });
    }

    const [result] = await pool.query(
      'INSERT INTO courses (title, type, duration, description, content, image) VALUES (?, ?, ?, ?, ?, ?)',
      [title, type || '', duration || '', description || '', content || '', image || '']
    );

    res.json({
      success: true,
      message: '课程添加成功',
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: '添加课程失败: ' + error.message });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, duration, description, content, image } = req.body;

    const [courses] = await pool.query('SELECT * FROM courses WHERE id = ?', [id]);
    
    if (courses.length === 0) {
      return res.status(404).json({ error: '课程不存在' });
    }

    await pool.query(
      'UPDATE courses SET title = ?, type = ?, duration = ?, description = ?, content = ?, image = ? WHERE id = ?',
      [title || courses[0].title, type || courses[0].type, duration || courses[0].duration,
       description || courses[0].description, content || courses[0].content,
       image || courses[0].image, id]
    );

    res.json({
      success: true,
      message: '课程更新成功'
    });
  } catch (error) {
    res.status(500).json({ error: '更新课程失败: ' + error.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [courses] = await pool.query('SELECT * FROM courses WHERE id = ?', [id]);
    
    if (courses.length === 0) {
      return res.status(404).json({ error: '课程不存在' });
    }

    await pool.query('DELETE FROM courses WHERE id = ?', [id]);

    res.json({
      success: true,
      message: '课程删除成功'
    });
  } catch (error) {
    res.status(500).json({ error: '删除课程失败: ' + error.message });
  }
};

const getLearningProgress = async (req, res) => {
  try {
    const { user_id, course_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: '用户ID不能为空' });
    }

    let query = 'SELECT * FROM learning_progress WHERE user_id = ?';
    let params = [user_id];

    if (course_id) {
      query += ' AND course_id = ?';
      params.push(course_id);
    }

    const [progress] = await pool.query(query, params);

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    res.status(500).json({ error: '获取学习进度失败: ' + error.message });
  }
};

const updateLearningProgress = async (req, res) => {
  try {
    const { user_id, course_id, progress, completed } = req.body;
    
    if (!user_id || !course_id) {
      return res.status(400).json({ error: '用户ID和课程ID不能为空' });
    }

    const [existing] = await pool.query(
      'SELECT * FROM learning_progress WHERE user_id = ? AND course_id = ?',
      [user_id, course_id]
    );

    if (existing.length > 0) {
      await pool.query(
        'UPDATE learning_progress SET progress = ?, completed = ?, last_learned = NOW() WHERE user_id = ? AND course_id = ?',
        [progress || 0, completed || 0, user_id, course_id]
      );
    } else {
      await pool.query(
        'INSERT INTO learning_progress (user_id, course_id, progress, completed, last_learned) VALUES (?, ?, ?, ?, NOW())',
        [user_id, course_id, progress || 0, completed || 0]
      );
    }

    res.json({
      success: true,
      message: '学习进度更新成功'
    });
  } catch (error) {
    res.status(500).json({ error: '更新学习进度失败: ' + error.message });
  }
};

const getCourseStats = async (req, res) => {
  try {
    const [fireCount] = await pool.query('SELECT COUNT(*) as count FROM courses WHERE type = ?', ['fire']);
    const [earthquakeCount] = await pool.query('SELECT COUNT(*) as count FROM courses WHERE type = ?', ['earthquake']);
    const [crushCount] = await pool.query('SELECT COUNT(*) as count FROM courses WHERE type = ?', ['crush']);
    const [firstAidCount] = await pool.query('SELECT COUNT(*) as count FROM courses WHERE type = ?', ['first-aid']);

    res.json({
      success: true,
      data: {
        fire: fireCount[0].count,
        earthquake: earthquakeCount[0].count,
        crush: crushCount[0].count,
        'first-aid': firstAidCount[0].count
      }
    });
  } catch (error) {
    res.status(500).json({ error: '获取统计数据失败: ' + error.message });
  }
};

module.exports = { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse, getLearningProgress, updateLearningProgress, getCourseStats };
