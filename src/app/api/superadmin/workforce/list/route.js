// src/app/api/superadmin/workforce/list/route.js
import db from "@/lib/db";

export async function GET() {
  try {
    // Fetch only workforce users
    const [rows] = await db.query(
      `SELECT u.id, u.name, u.email, u.client_id, u.manager_id, c.name AS client_name, m.name AS manager_name
       FROM users u
       LEFT JOIN clients c ON u.client_id = c.id
       LEFT JOIN users m ON u.manager_id = m.id
       WHERE u.role = 'workforce'`
    );

    return Response.json(rows);
  } catch (error) {
    console.error("❌ DB Fetch Error:", error);
    return Response.json({ error: "Error fetching workforce list" }, { status: 500 });
  }
}
