import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req) {
  try {
    const { managerId, selectedClient, pdfUrl } = await req.json();

    if (!managerId || !selectedClient || !pdfUrl) {
      return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });
    }

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // ✅ Insert weekly report
      await connection.execute(
        `INSERT INTO weekly_reports (manager_id, client_id, pdf_url, submitted_at)
         VALUES (?, ?, ?, NOW())`,
        [managerId, selectedClient, pdfUrl]
      );

      // ✅ Remove only the notification for this specific client
      await connection.execute(
        `DELETE FROM notifications WHERE receiver_id = ? AND client_id = ? AND sent_via = 'dashboard'`,
        [managerId, selectedClient]
      );

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: "✅ Weekly report saved and related notification cleared"
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("❌ Error saving weekly report:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
