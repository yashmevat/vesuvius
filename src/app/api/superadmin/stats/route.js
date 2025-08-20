import db from "@/lib/db";

export async function GET() {
  try {
    const [managers] = await db.query(`SELECT COUNT(*) AS total FROM users WHERE role='manager'`);
    const [workforce] = await db.query(`SELECT COUNT(*) AS total FROM users WHERE role='workforce'`);
    const [clients] = await db.query(`SELECT COUNT(*) AS total FROM clients`);
    const [pendingReports] = await db.query(`SELECT COUNT(*) AS total FROM reports WHERE status='pending'`);

    return Response.json({
      managers: managers[0].total,
      workforce: workforce[0].total,
      clients: clients[0].total,
      pendingReports: pendingReports[0].total
    });
  } catch (error) {
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
