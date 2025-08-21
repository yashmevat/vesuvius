import db from "@/lib/db";

export async function POST() {
  const connection = await db.getConnection();
  try {
    
  console.log("✅ check-weekly-reports API HIT");
    // ✅ 1. Get all (manager, client) pairs where no report exists in last 7 days
    const [rows] = await connection.query(`
      SELECT 
        u.id AS manager_id, 
        u.name AS manager_name, 
        c.id AS client_id, 
        c.name AS client_name
      FROM users u
      JOIN manager_clients mc ON mc.manager_id = u.id
      JOIN clients c ON c.id = mc.client_id
      WHERE u.role = 'manager'
      AND NOT EXISTS (
        SELECT 1
        FROM weekly_reports wr
        WHERE wr.client_id = c.id
        AND wr.submitted_at >= NOW() - INTERVAL 7 DAY
      )
    `);

    if (rows.length === 0) {
      return Response.json({
        message: "✅ All managers have submitted reports for their clients."
      });
    }

    // ✅ 2. Delete old notifications for these clients (not just manager)
    const clientIds = [...new Set(rows.map(row => row.client_id))];
    await connection.query(
      `DELETE FROM notifications 
       WHERE client_id IN (?) 
         AND sent_via = 'dashboard'`,
      [clientIds]
    );

    // ✅ 3. Prepare new notifications (include client_id)
    const notifications = rows.map(row => [
      row.manager_id,
      row.client_id,
      `Dear ${row.manager_name}, the weekly report for client "${row.client_name}" has not been submitted.`,
      "dashboard",
      new Date()
    ]);

    // ✅ 4. Insert notifications in bulk with client_id
    await connection.query(
      `INSERT INTO notifications (receiver_id, client_id, message, sent_via, created_at)
       VALUES ?`,
      [notifications]
    );

    return Response.json({
      message: "✅ Notifications sent for missing client reports",
      count: notifications.length,
      details: rows
    });
  } catch (error) {
    console.error("❌ Error in missing client report check:", error);
    return Response.json(
      { error: "Failed to check missing client reports" },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
