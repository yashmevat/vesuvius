import db from "@/lib/db";

export async function POST() {
  const connection = await db.getConnection();
  try {
    // 1. Get managers who haven't submitted a report in the last 7 days
    const [rows] = await connection.query(`
      SELECT u.id AS manager_id, u.name
      FROM users u
      LEFT JOIN weekly_reports wr
        ON wr.manager_id = u.id
        AND wr.submitted_at >= NOW() - INTERVAL 7 DAY
      WHERE u.role = 'manager'
        AND wr.manager_id IS NULL
    `);

    if (rows.length === 0) {
      return Response.json({
        message: "✅ All managers have submitted reports this week."
      });
    }

    // ✅ 2. Delete previous notifications for these managers (to avoid duplicates)
    const managerIds = rows.map(mgr => mgr.manager_id);
    await connection.query(
      `DELETE FROM notifications WHERE receiver_id IN (?) AND sent_via = 'dashboard'`,
      [managerIds]
    );

    // 3. Prepare new notifications data
    const notifications = rows.map(mgr => [
      mgr.manager_id,
      `Dear ${mgr.name}, you haven't submitted your weekly report yet.`,
      "dashboard",
      new Date() // created_at
    ]);

    // 4. Insert notifications in bulk
    await connection.query(
      `INSERT INTO notifications (receiver_id, message, sent_via, created_at)
       VALUES ?`,
      [notifications]
    );

    return Response.json({
      message: "✅ Notifications sent",
      count: notifications.length,
      managers: rows
    });
  } catch (error) {
    console.error("❌ Error in weekly report check:", error);
    return Response.json(
      { error: "Failed to check weekly reports" },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
