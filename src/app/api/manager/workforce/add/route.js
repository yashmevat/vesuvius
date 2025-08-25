import db from "@/lib/db";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const transporter = nodemailer.createTransport({
  host: 'mail.diamondraja.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function generateRandomPassword(length = 8) {
  return Math.random().toString(36).slice(-length);
}

export async function POST(req) {
  try {
    // Get manager ID from JWT token
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const managerId = decoded.id;

    // Verify user is a manager
    const [managerCheck] = await db.query(
      "SELECT role, workforce_limit FROM users WHERE id = ?",
      [managerId]
    );

    if (!managerCheck.length || managerCheck[0].role !== "manager") {
      return Response.json({ error: "Unauthorized - managers only" }, { status: 403 });
    }

    // Check workforce limit
    const [workforceCount] = await db.query(
      "SELECT COUNT(*) as count FROM users WHERE manager_id = ? AND role = 'workforce'",
      [managerId]
    );

    if (workforceCount[0].count >= managerCheck[0].workforce_limit) {
      return Response.json({ 
        error: `Workforce limit reached (${managerCheck[0].workforce_limit} members maximum)` 
      }, { status: 400 });
    }

    const { name, email, clientId } = await req.json();

    if (!name || !email || !clientId) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify the client belongs to this manager
    const [clientCheck] = await db.query(
      "SELECT id FROM manager_clients WHERE manager_id = ? AND client_id = ?",
      [managerId, clientId]
    );

    if (!clientCheck.length) {
      return Response.json({ error: "Invalid client selection" }, { status: 403 });
    }

    // Check if email already exists
    const [existingUser] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length) {
      return Response.json({ error: "Email already exists" }, { status: 400 });
    }

    // Generate random password & hash it
    const plainPassword = generateRandomPassword(8);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Insert workforce user
    const [result] = await db.query(
      `INSERT INTO users (name, email, password_hash, role, client_id, manager_id)
       VALUES (?, ?, ?, 'workforce', ?, ?)`,
      [name, email, hashedPassword, clientId, managerId]
    );

    const workforceId = result.insertId;

    // Insert into workforce_client table
    await db.query(
      `INSERT INTO workforce_clients (workforce_id, client_id) VALUES (?, ?)`,
      [workforceId, clientId]
    );

    // Send email with credentials
    await transporter.sendMail({
      from: `"Your Company" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Workforce Account Created - Your Credentials",
      text: `Hello ${name},

Your workforce account has been created by your manager.

Email: ${email}
Password: ${plainPassword}

Please login and change your password ASAP.
Login at: https://diamondraja.com/vis/login/

Thanks,
Admin Team`,
    });

    return Response.json({
      message: "Workforce member added successfully and email sent",
      id: workforceId,
    });

  } catch (error) {
    console.error("❌ Manager Add Workforce Error:", error);
    return Response.json(
      { error: error.message || "Error adding workforce member" },
      { status: 500 }
    );
  }
}
