import db from "@/lib/db";
 
export async function GET() {
  try {
    const [rows] = await db.query(`
    SELECT id, name, contact_details, location, created_at, roboticsscan, reporttiming
FROM clients
ORDER BY created_at DESC;
    `);
 
    return Response.json(rows);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return Response.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}