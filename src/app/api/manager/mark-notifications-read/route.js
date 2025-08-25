// /app/api/manager/mark-notifications-read/route.js
import db from "@/lib/db"; // your DB connection

export async function POST(req) {
  try {
    const { managerId } = await req.json();
    await db.query("UPDATE notifications SET is_read = 1 WHERE manager_id = ?", [managerId]);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error marking notifications:", error);
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
}
