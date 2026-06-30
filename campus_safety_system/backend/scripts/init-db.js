const mysql = require('mysql2/promise');
require('dotenv').config();

const createDatabaseAndTables = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    await connection.end();

    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    await pool.query('DROP TABLE IF EXISTS learning_progress');
    await pool.query('DROP TABLE IF EXISTS drill_participants');
    await pool.query('DROP TABLE IF EXISTS activity_logs');
    await pool.query('DROP TABLE IF EXISTS courses');
    await pool.query('DROP TABLE IF EXISTS notices');
    await pool.query('DROP TABLE IF EXISTS drills');
    await pool.query('DROP TABLE IF EXISTS dangers');
    await pool.query('DROP TABLE IF EXISTS users');
    await pool.query('DROP TABLE IF EXISTS roles');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL UNIQUE,
        description VARCHAR(255),
        permissions TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        real_name VARCHAR(100),
        phone VARCHAR(20),
        email VARCHAR(100),
        class_name VARCHAR(100),
        role_id INT DEFAULT 2,
        status INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS dangers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(200) NOT NULL,
        location VARCHAR(200),
        type VARCHAR(50),
        priority VARCHAR(20) DEFAULT 'medium',
        description TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        reporter VARCHAR(100),
        report_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        handler VARCHAR(100),
        handle_time TIMESTAMP NULL,
        handle_result TEXT
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS drills (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(200) NOT NULL,
        type VARCHAR(50),
        date DATE,
        time VARCHAR(50),
        location VARCHAR(200),
        participants INT DEFAULT 0,
        manager VARCHAR(100),
        status VARCHAR(20) DEFAULT 'upcoming',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS drill_participants (
        id INT PRIMARY KEY AUTO_INCREMENT,
        drill_id INT,
        user_id INT,
        user_type VARCHAR(20),
        status VARCHAR(20) DEFAULT 'assigned',
        score INT DEFAULT 0,
        completed_at TIMESTAMP NULL,
        FOREIGN KEY (drill_id) REFERENCES drills(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS notices (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(200) NOT NULL,
        content TEXT,
        type VARCHAR(20) DEFAULT 'info',
        priority VARCHAR(20) DEFAULT 'normal',
        author VARCHAR(100),
        recipient_group VARCHAR(50) DEFAULT 'all',
        is_read INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(200) NOT NULL,
        type VARCHAR(50),
        duration VARCHAR(50),
        lessons INT DEFAULT 5,
        description TEXT,
        content TEXT,
        image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS learning_progress (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        course_id INT,
        progress INT DEFAULT 0,
        completed INT DEFAULT 0,
        last_learned TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (course_id) REFERENCES courses(id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        action VARCHAR(100),
        target_type VARCHAR(50),
        target_id INT,
        description TEXT,
        ip_address VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    const checkRoles = await pool.query('SELECT COUNT(*) as count FROM roles');
    if (checkRoles[0][0].count === 0) {
      await pool.query('INSERT INTO roles (name, description, permissions) VALUES (?, ?, ?)', 
        ['admin', '校园保卫处', JSON.stringify(['all'])]);
      await pool.query('INSERT INTO roles (name, description, permissions) VALUES (?, ?, ?)', 
        ['teacher', '教师', JSON.stringify(['view', 'report', 'learn', 'drill'])]);
      await pool.query('INSERT INTO roles (name, description, permissions) VALUES (?, ?, ?)', 
        ['student', '学生', JSON.stringify(['view', 'learn', 'drill'])]);
      console.log('角色表初始化完成');
    }

    const checkUsers = await pool.query('SELECT COUNT(*) as count FROM users');
    if (checkUsers[0][0].count === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('123456', 10);
      await pool.query('INSERT INTO users (username, password, real_name, phone, email, role_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)', 
        ['admin', hashedPassword, '校园保卫处', '13800138000', 'security@school.com', 1, 1]);
      await pool.query('INSERT INTO users (username, password, real_name, phone, email, class_name, role_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
        ['teacher1', hashedPassword, '张老师', '13900139001', 'zhang@school.com', '一年级', 2, 1]);
      await pool.query('INSERT INTO users (username, password, real_name, phone, email, class_name, role_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
        ['teacher2', hashedPassword, '李老师', '13900139002', 'li@school.com', '二年级', 2, 1]);
      await pool.query('INSERT INTO users (username, password, real_name, phone, email, class_name, role_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
        ['teacher3', hashedPassword, '王老师', '13900139003', 'wang@school.com', '三年级', 2, 1]);
      await pool.query('INSERT INTO users (username, password, real_name, phone, email, class_name, role_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
        ['student1', hashedPassword, '李明', '13700137001', 'liming@school.com', '一年级(1)班', 3, 1]);
      await pool.query('INSERT INTO users (username, password, real_name, phone, email, class_name, role_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
        ['student2', hashedPassword, '小红', '13700137002', 'xiaohong@school.com', '一年级(1)班', 3, 1]);
      await pool.query('INSERT INTO users (username, password, real_name, phone, email, class_name, role_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
        ['student3', hashedPassword, '小刚', '13700137003', 'xiaogang@school.com', '二年级(2)班', 3, 1]);
      await pool.query('INSERT INTO users (username, password, real_name, phone, email, class_name, role_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
        ['student4', hashedPassword, '小芳', '13700137004', 'xiaofang@school.com', '三年级(1)班', 3, 1]);
      console.log('用户表初始化完成');
    } else {
      await pool.query('UPDATE users SET status = 1 WHERE status != 1');
      console.log('用户状态已更新');
    }

    const checkDangers = await pool.query('SELECT COUNT(*) as count FROM dangers');
    if (checkDangers[0][0].count === 0) {
      await pool.query('INSERT INTO dangers (title, location, type, priority, description, status, reporter) VALUES (?, ?, ?, ?, ?, ?, ?)', ['教学楼3楼消防栓损坏', '教学楼3楼走廊', 'fire', 'high', '消防栓玻璃破裂，无法正常使用', 'pending', '张老师']);
      await pool.query('INSERT INTO dangers (title, location, type, priority, description, status, reporter) VALUES (?, ?, ?, ?, ?, ?, ?)', ['操场电线裸露', '操场西北角', 'electric', 'high', '电线外皮破损，存在触电风险', 'pending', '王主任']);
      await pool.query('INSERT INTO dangers (title, location, type, priority, description, status, reporter) VALUES (?, ?, ?, ?, ?, ?, ?)', ['楼梯扶手松动', '实验楼2楼楼梯', 'structure', 'medium', '扶手螺丝松动，需要加固', 'processing', '李老师']);
      await pool.query('INSERT INTO dangers (title, location, type, priority, description, status, reporter) VALUES (?, ?, ?, ?, ?, ?, ?)', ['食堂灭火器过期', '食堂后厨', 'fire', 'medium', '部分灭火器已过有效期', 'resolved', '刘经理']);
      await pool.query('INSERT INTO dangers (title, location, type, priority, description, status, reporter) VALUES (?, ?, ?, ?, ?, ?, ?)', ['走廊照明不足', '西教学楼走廊', 'other', 'low', '部分灯泡损坏，影响夜间通行', 'pending', '赵老师']);
      console.log('隐患表示例数据添加完成');
    }

    const checkDrills = await pool.query('SELECT COUNT(*) as count FROM drills');
    if (checkDrills[0][0].count === 0) {
      await pool.query('INSERT INTO drills (title, type, date, time, location, participants, manager, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', ['春季消防逃生演练', 'fire', '2024-04-15', '09:00', '学校操场', 800, '王主任', '全校师生参与的消防逃生演练']);
      await pool.query('INSERT INTO drills (title, type, date, time, location, participants, manager, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', ['地震应急避险演练', 'earthquake', '2024-05-12', '14:00', '教学楼', 650, '李主任', '纪念512地震的防震减灾演练']);
      await pool.query('INSERT INTO drills (title, type, date, time, location, participants, manager, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', ['防踩踏安全演练', 'crush', '2024-06-20', '10:00', '教学楼楼梯', 400, '张老师', '针对上下楼梯安全的防踩踏演练']);
      await pool.query('INSERT INTO drills (title, type, date, time, location, participants, manager, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', ['消防安全知识培训', 'fire', '2024-03-10', '15:00', '学校礼堂', 200, '刘老师', '消防器材使用培训']);
      console.log('演练表示例数据添加完成');
    }

    const checkNotices = await pool.query('SELECT COUNT(*) as count FROM notices');
    if (checkNotices[0][0].count === 0) {
      await pool.query('INSERT INTO notices (title, content, type, priority, author, recipient_group) VALUES (?, ?, ?, ?, ?, ?)', ['暴雨预警通知', '预计今晚有强降雨，请各班级做好安全防范工作，放学时注意交通安全。', 'danger', 'high', '王主任', 'all']);
      await pool.query('INSERT INTO notices (title, content, type, priority, author, recipient_group) VALUES (?, ?, ?, ?, ?, ?)', ['消防安全提示', '春季天干物燥，请注意用电用火安全，不要在校园内使用明火。', 'warning', 'normal', '安全办', 'teachers']);
      await pool.query('INSERT INTO notices (title, content, type, priority, author, recipient_group) VALUES (?, ?, ?, ?, ?, ?)', ['下周演练安排', '下周一上午9点将进行消防逃生演练，请各班级提前做好准备。', 'info', 'normal', '教务处', 'all']);
      await pool.query('INSERT INTO notices (title, content, type, priority, author, recipient_group) VALUES (?, ?, ?, ?, ?, ?)', ['防震减灾知识', '5月12日是全国防灾减灾日，请同学们学习防震减灾知识，提高自救能力。', 'info', 'low', '德育处', 'students']);
      console.log('通知表示例数据添加完成');
    }

    const checkCourses = await pool.query('SELECT COUNT(*) as count FROM courses');
    if (checkCourses[0][0].count === 0) {
      await pool.query('INSERT INTO courses (title, type, duration, lessons, description, content) VALUES (?, ?, ?, ?, ?, ?)', ['消防安全入门', 'fire', '45分钟', 3, '学习基本的消防安全知识和逃生技能', '1. 火灾的分类和特点\n2. 常见消防器材的使用方法\n3. 火场逃生技巧\n4. 灭火器的正确使用\n5. 消防栓的使用方法']);
      await pool.query('INSERT INTO courses (title, type, duration, lessons, description, content) VALUES (?, ?, ?, ?, ?, ?)', ['地震避险指南', 'earthquake', '40分钟', 3, '了解地震发生时的正确避险方法', '1. 地震的基本知识\n2. 室内避险要点\n3. 室外避险要点\n4. 疏散逃生注意事项\n5. 应急物品准备']);
      await pool.query('INSERT INTO courses (title, type, duration, lessons, description, content) VALUES (?, ?, ?, ?, ?, ?)', ['防踩踏安全教育', 'crush', '30分钟', 2, '学习如何预防和应对踩踏事件', '1. 踩踏事件的原因\n2. 如何预防踩踏\n3. 发生拥挤时的应对方法\n4. 摔倒后的自救措施']);
      await pool.query('INSERT INTO courses (title, type, duration, lessons, description, content) VALUES (?, ?, ?, ?, ?, ?)', ['急救知识培训', 'first-aid', '60分钟', 4, '掌握基本的急救技能', '1. 心肺复苏术(CPR)\n2. 止血包扎方法\n3. 烧伤烫伤处理\n4. 骨折固定方法\n5. 拨打120的正确方式']);
      console.log('课程表示例数据添加完成');
    }

    const checkActivityLogs = await pool.query('SELECT COUNT(*) as count FROM activity_logs');
    if (checkActivityLogs[0][0].count === 0) {
      await pool.query('INSERT INTO activity_logs (user_id, action, target_type, target_id, description) VALUES (?, ?, ?, ?, ?)', [1, 'login', 'system', 0, '校园保卫处登录系统']);
      await pool.query('INSERT INTO activity_logs (user_id, action, target_type, target_id, description) VALUES (?, ?, ?, ?, ?)', [1, 'create', 'drill', 1, '创建春季消防逃生演练']);
      await pool.query('INSERT INTO activity_logs (user_id, action, target_type, target_id, description) VALUES (?, ?, ?, ?, ?)', [1, 'create', 'notice', 1, '发布暴雨预警通知']);
      await pool.query('INSERT INTO activity_logs (user_id, action, target_type, target_id, description) VALUES (?, ?, ?, ?, ?)', [1, 'update', 'danger', 1, '更新隐患状态为处理中']);
      console.log('活动日志示例数据添加完成');
    }

    console.log('数据库初始化完成');
    await pool.end();
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
};

createDatabaseAndTables();