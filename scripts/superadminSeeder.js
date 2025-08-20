import bcrypt from "bcrypt";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

// .env file load
dotenv.config();

async function seedSuperAdmin() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const name = "Super Admin";
  const email = "superadmin@example.com";
  const password = "superadmin123";
  const hashedPassword = await bcrypt.hash(password, 10);
  const role = "superadmin";

  // Check if already exists
  const [existing] = await connection.execute(
    `SELECT * FROM users WHERE email = ?`,
    [email]
  );
  if (existing.length > 0) {
    console.log("⚠️ SuperAdmin already exists");
    process.exit();
  }

  await connection.execute(
    `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
    [name, email, hashedPassword, role]
  );

  console.log("✅ SuperAdmin inserted successfully");
  process.exit();
}

seedSuperAdmin().catch((err) => {
  console.error("❌ Error inserting SuperAdmin:", err);
  process.exit(1);
});
