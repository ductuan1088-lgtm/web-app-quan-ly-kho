const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Khởi tạo file SQLite database.sqlite cùng thư mục
const db = new Database(path.join(__dirname, 'database.sqlite'));

// Kích hoạt hỗ trợ khóa ngoại (Foreign Keys) cho SQLite
db.pragma('foreign_keys = ON');

// Tạo các bảng dữ liệu
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    sku TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    unit TEXT,
    stock_quantity INTEGER DEFAULT 0,
    min_limit INTEGER DEFAULT 2,
    cost_price REAL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    department TEXT NOT NULL,
    phone TEXT
  );

  CREATE TABLE IF NOT EXISTS vouchers (
    voucher_code TEXT PRIMARY KEY,
    voucher_type TEXT NOT NULL,
    created_date TEXT NOT NULL,
    warehouse_name TEXT DEFAULT 'Kho IT',
    staff_name TEXT,
    department TEXT,
    reason TEXT,
    created_by TEXT,
    total_amount REAL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS voucher_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    voucher_code TEXT,
    sku TEXT,
    quantity INTEGER,
    unit_price REAL,
    total_price REAL,
    FOREIGN KEY(voucher_code) REFERENCES vouchers(voucher_code) ON DELETE CASCADE
  );
`);

// Tự động thêm sản phẩm mẫu ban đầu nếu bảng đang trống
const checkProduct = db.prepare('SELECT COUNT(*) as count FROM products').get();
if (checkProduct.count === 0) {
  const insertProd = db.prepare(`
    INSERT INTO products (sku, name, category, unit, stock_quantity, min_limit, cost_price)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertProd.run('LK-BAC-2900', 'Bạc lô ép 2900', 'Linh kiện máy in máy tính', 'Chiếc', 10, 2, 50000);
  insertProd.run('MD-LASER', 'Mực đổ máy in', 'Hộp mực đổ', 'Lọ', 20, 5, 45000);
  insertProd.run('HM-2900', 'Hộp mực máy in 2900 (Hộp mực 12)', 'Mực in', 'Hộp', 15, 3, 280000);
  console.log('-> Đã nạp sản phẩm mẫu ban đầu vào Database.');
}

// Tự động thêm nhân viên / khoa phòng mẫu ban đầu nếu bảng đang trống
const checkStaff = db.prepare('SELECT COUNT(*) as count FROM staff').get();
if (checkStaff.count === 0) {
  const insertStaff = db.prepare(`
    INSERT INTO staff (full_name, department, phone)
    VALUES (?, ?, ?)
  `);
  insertStaff.run('Trương Trọng Phương', 'Ban Giám đốc', '0912450553');
  insertStaff.run('Lê Xuân Hiếu2', 'Khoa Cấp cứu, Hồi sức tích cực', '0978732733');
  insertStaff.run('Phùng Thị Giữa', 'Khoa Dược', '0989236558');
  console.log('-> Đã nạp nhân viên mẫu ban đầu vào Database.');
}

// 1. API lấy danh sách mặt hàng
app.get('/api/products', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM products').all();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. API thêm hoặc cập nhật mặt hàng (Upsert)
app.post('/api/products', (req, res) => {
  const { sku, name, category, unit, stock_quantity, cost_price, min_limit } = req.body;
  try {
    const upsertStmt = db.prepare(`
      INSERT INTO products (sku, name, category, unit, stock_quantity, cost_price, min_limit)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(sku) DO UPDATE SET
        name = excluded.name,
        category = excluded.category,
        unit = excluded.unit,
        stock_quantity = excluded.stock_quantity,
        cost_price = excluded.cost_price,
        min_limit = excluded.min_limit
    `);
    upsertStmt.run(
      sku,
      name,
      category || 'Linh kiện máy in máy tính',
      unit || 'Chiếc',
      Number(stock_quantity) || 0,
      Number(cost_price) || 0,
      Number(min_limit) || 2
    );
    res.json({ success: true, message: 'Đã lưu mặt hàng vào SQLite!' });
  } catch (error) {
    console.error('Lỗi khi lưu mặt hàng:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. API xóa mặt hàng vĩnh viễn khỏi Database SQLite
app.delete('/api/products/:sku', (req, res) => {
  const { sku } = req.params;
  try {
    const stmt = db.prepare('DELETE FROM products WHERE sku = ?');
    const result = stmt.run(sku);
    if (result.changes > 0) {
      console.log(`-> Đã xóa mặt hàng ${sku} khỏi SQLite`);
      res.json({ success: true, message: 'Đã xóa sản phẩm thành công!' });
    } else {
      res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm trong Database' });
    }
  } catch (error) {
    console.error('Lỗi khi xóa sản phẩm:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. API lấy danh sách nhân viên
app.get('/api/staff', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM staff').all();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. API lấy danh sách chứng từ
app.get('/api/vouchers', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM vouchers ORDER BY created_date DESC').all();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. API tạo phiếu xuất kho & trừ tồn kho
app.post('/api/issue-voucher', (req, res) => {
  const { voucher_code, voucher_type, created_date, staff_name, department, reason, created_by, total_amount, items } = req.body;

  const createVoucherTx = db.transaction(() => {
    db.prepare(`
      INSERT INTO vouchers (voucher_code, voucher_type, created_date, staff_name, department, reason, created_by, total_amount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(voucher_code, voucher_type, created_date, staff_name, department, reason, created_by, total_amount);

    const insertItem = db.prepare(`
      INSERT INTO voucher_items (voucher_code, sku, quantity, unit_price, total_price)
      VALUES (?, ?, ?, ?, ?)
    `);
    const updateStock = db.prepare(`
      UPDATE products SET stock_quantity = stock_quantity - ? WHERE sku = ?
    `);

    for (const item of items) {
      insertItem.run(voucher_code, item.sku, item.quantity, item.unit_price, item.total_price);
      updateStock.run(item.quantity, item.sku);
    }
  });

  try {
    createVoucherTx();
    res.json({ success: true, message: 'Đã lưu phiếu vào Database thành công!' });
  } catch (error) {
    console.error('Lỗi khi lập phiếu xuất:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Lắng nghe trên toàn bộ mạng LAN
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server đang chạy tại cổng ${PORT} (sẵn sàng cho mạng LAN): http://0.0.0.0:${PORT}`);
});