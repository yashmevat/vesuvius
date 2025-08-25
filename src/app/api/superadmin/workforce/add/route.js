import db from "@/lib/db";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
            host: 'mail.diamondraja.com',
            port: 465,
            secure: true, // true for 465
            auth: {
                user: process.env.EMAIL_USER, // your email
                pass: process.env.EMAIL_PASS,         // your cPanel password
            },
        });

function generateRandomPassword(length = 8) {
  return Math.random().toString(36).slice(-length);
}

export async function POST(req) {
  try {
    const { name, email, clientId, managerId } = await req.json();

    if (!name || !email || !clientId || !managerId) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
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

    // Send email with credentials
    await transporter.sendMail({
      from: `"Your Company" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Workforce Account Created - Your Credentials",
      text:`Hello ${name},

              Your workforce account has been created.

              Email: ${email}
              Password: ${plainPassword}

              Please login and change your password ASAP.
              on https://diamondraja.com/vis/login/

              Thanks,
           Admin Team`,
    });

    const workforceId = result.insertId;

    // 2️⃣ Insert into workforce_client table
    await db.query(
      `INSERT INTO workforce_clients (workforce_id, client_id) VALUES (?, ?)`,
      [workforceId, clientId]
    );

    return Response.json({
      message: "Workforce member added and email sent",
      id: result.insertId,
    });
  } catch (error) {
    console.error("❌ DB Insert or Email Error:", error);
    return Response.json(
      { error: error.message || "Error adding workforce member" },
      { status: 500 }
    );
  }
}
