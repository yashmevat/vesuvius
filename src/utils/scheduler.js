import cron from "node-cron";
import db from "@/lib/db";

export function startWeeklyReportCheck() {
  // Runs every Monday at 9:00 AM
  cron.schedule("0 9 * * 1", async () => {
    console.log("✅ Running weekly report check...");

    try {
      // Fetch all managers
      const [managers] = await db.query(`
        SELECT id FROM users WHERE role = 'manager'
      `);

      for (const manager of managers) {
        const managerId = manager.id;

        // Check if report exists in last 7 days
        const [reports] = await db.query(
          `SELECT id FROM weekly_reports 
           WHERE manager_id = ? AND submitted_at >= NOW() - INTERVAL 7 DAY`,
          [managerId]
        );

        // If no recent report, check if notification exists
        if (reports.length === 0) {
          const [existingNotif] = await db.query(
            `SELECT id FROM notifications 
             WHERE receiver_id = ? AND message LIKE '%weekly report%' AND created_at >= NOW() - INTERVAL 7 DAY`,
            [managerId]
          );

          if (existingNotif.length === 0) {
            await db.query(
              `INSERT INTO notifications (receiver_id, message, sent_via) 
               VALUES (?, ?, ?)`,
              [managerId, "You haven't submitted your weekly report.", "system"]
            );
            console.log(`📢 Notification sent to manager ID: ${managerId}`);
          }
        }
      }

      console.log("✅ Weekly check completed");
    } catch (error) {
      console.error("❌ Error in weekly scheduler:", error);
    }
  });
}
