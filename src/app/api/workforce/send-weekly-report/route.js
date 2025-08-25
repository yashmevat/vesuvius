import { NextResponse } from "next/server";
import db from "@/lib/db";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    // Get workforce ID from JWT token
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const workforceId = decoded.id;

    // Verify user is workforce
    const [userCheck] = await db.query(
      "SELECT role, client_id FROM users WHERE id = ?",
      [workforceId]
    );

    if (!userCheck.length || userCheck[0].role !== "workforce") {
      return NextResponse.json({ error: "Unauthorized - workforce only" }, { status: 403 });
    }

    const { pdfUrl } = await req.json();

    if (!pdfUrl) {
      return NextResponse.json({ success: false, message: "Missing PDF URL" }, { status: 400 });
    }

    const clientId = userCheck[0].client_id;

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Insert workforce weekly report
      await connection.execute(
        `INSERT INTO workforce_weekly_reports (workforce_id, client_id, pdf_url, submitted_at)
         VALUES (?, ?, ?, NOW())`,
        [workforceId, clientId, pdfUrl]
      );

      // Clear any weekly report notifications for this workforce member
      await connection.execute(
        `DELETE FROM notifications 
         WHERE receiver_id = ? 
         AND message LIKE '%weekly report%' 
         AND sent_via = 'system'`,
        [workforceId]
      );

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: "✅ Weekly report uploaded successfully!"
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("❌ Error saving workforce weekly report:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to save weekly report" 
    }, { status: 500 });
  }
}
