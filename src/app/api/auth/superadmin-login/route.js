import db from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { serialize } from "cookie";
export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ error: "Missing credentials" }, { status: 400 });
    }

    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const user = rows[0];
    if (user.role !== "superadmin") {
      return Response.json({ error: "Not authorized" }, { status: 403 });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

 return new Response(
  JSON.stringify({ message: "Login successful" }),
  {
    status: 200,
    headers: {
      "Set-Cookie": serialize("token", token, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24,
        sameSite: "strict",
        path: "/",
      }),
      "Content-Type": "application/json",
    },
  }
);
  } catch (err) {
    console.error("❌ Superadmin Login Error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
