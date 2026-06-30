CREATE TABLE IF NOT EXISTS supplies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category ENUM('fire', 'medical', 'rescue', 'food') DEFAULT 'fire',
  quantity INT NOT NULL DEFAULT 0,
  location VARCHAR(100),
  expiry_date DATE,
  status ENUM('available', 'low', 'expired') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO supplies (name, category, quantity, location, expiry_date, status) VALUES
('灭火器', 'fire', 50, '教学楼每层走廊', '2026-12-31', 'available'),
('消防栓', 'fire', 20, '教学楼每层楼梯口', '2027-06-30', 'available'),
('急救箱', 'medical', 30, '各教室', '2025-12-31', 'available'),
('绷带', 'medical', 200, '各急救箱内', '2025-06-30', 'available'),
('安全帽', 'rescue', 50, '体育馆仓库', '2028-01-01', 'available'),
('手电筒', 'rescue', 30, '各楼层值班室', '2026-03-31', 'available'),
('矿泉水', 'food', 500, '食堂仓库', '2024-12-31', 'low'),
('方便面', 'food', 200, '食堂仓库', '2025-06-30', 'available'),
('烟雾报警器', 'fire', 100, '各建筑天花板', '2027-09-30', 'available'),
('防毒面具', 'fire', 20, '行政楼值班室', '2026-06-30', 'available');