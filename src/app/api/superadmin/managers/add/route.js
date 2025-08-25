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
    const { name, email, clientIds, workforceLimit } = await req.json();
    console.log("📥 Received:", { name, email, clientIds, workforceLimit });

    if (!name || !email || !clientIds || clientIds.length === 0) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate random password
    const plainPassword = generateRandomPassword(8);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // 1️⃣ Insert manager into users table
    const [result] = await db.query(
      `INSERT INTO users (name, email, password_hash, role, workforce_limit) 
       VALUES (?, ?, ?, 'manager', ?)`,
      [name, email, hashedPassword, workforceLimit]
    );

    const managerId = result.insertId;

    // 2️⃣ Insert multiple client mappings
    const clientInsertPromises = clientIds.map((cid) =>
      db.query(
        `INSERT INTO manager_clients (manager_id, client_id) VALUES (?, ?)`,
        [managerId, cid]
      )
    );

    await Promise.all(clientInsertPromises);

    // 3️⃣ Send email with credentials
    await transporter.sendMail({
      from: `"Your Company" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Manager Account Created - Your Credentials",
      text: `Hello ${name},

Your manager account has been created.

Email: ${email}
Password: ${plainPassword}

Please login and change your password ASAP.
on https://diamondraja.com/vis/login/


Thanks,
Admin Team`,
    });

    return Response.json({ message: "Manager added and email sent", id: managerId });

  } catch (error) {
    console.error("❌ DB Insert or Email Error:", error);
    return Response.json(
      { error: error.message || "Error adding manager" },
      { status: 500 }
    );
  }
}
