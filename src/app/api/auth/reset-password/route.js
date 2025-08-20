import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";

export const POST = async (req) => {
  try {
    const { password, token } = await req.json();

    if (!password || !token) {
      return NextResponse.json(
        { success: false, message: "Password and token are required" },
        { status: 400 }
      );
    }

    // Find token in DB
    const [tokenRows] = await db.query(
      "SELECT * FROM password_resets WHERE token=?",
      [token]
    );

    if (tokenRows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 400 }
      );
    }

    const resetData = tokenRows[0];

    // Check if token expired
    if (new Date(resetData.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, message: "Token expired" },
        { status: 400 }
      );
    }

    const userId = resetData.user_id;

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password in users table
    await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [
      hashedPassword,
      userId,
    ]);

    // Delete the used token
    await db.query("DELETE FROM password_resets WHERE token = ?", [token]);

    return NextResponse.json(
      { success: true, message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
};
