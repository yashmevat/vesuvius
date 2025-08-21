import db from "@/lib/db";

export async function POST(req) {
  try {
    const body = await req.json();
    const { managerId } = body;

    if (!managerId) {
      return Response.json({ error: "Manager ID required" }, { status: 400 });
    }

    const [rows] = await db.query(
      `
      SELECT id, client_id, message, created_at
      FROM notifications
      WHERE receiver_id = ?
        AND YEARWEEK(created_at, 1) = YEARWEEK(NOW(), 1)  -- current week
      ORDER BY created_at DESC
      `,
      [managerId]
    );

    return Response.json({ notifications: rows });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return Response.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
