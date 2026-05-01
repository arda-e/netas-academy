const path = require('node:path');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');

const NEW_PASSWORD = process.argv[2];
if (!NEW_PASSWORD) {
  console.error('Usage: node scripts/reset-admin-password.js <new-password>');
  process.exit(1);
}

const dbPath = path.resolve(__dirname, '..', '.tmp', 'data.db');
const db = new Database(dbPath);

const admin = db.prepare('SELECT id, email FROM admin_users LIMIT 1').get();
if (!admin) {
  console.error('No admin user found in database.');
  db.close();
  process.exit(1);
}

const hashedPassword = bcrypt.hashSync(NEW_PASSWORD, 10);
db.prepare('UPDATE admin_users SET password = ? WHERE id = ?').run(hashedPassword, admin.id);

console.log(`Password reset for admin: ${admin.email}`);
db.close();
