import db from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT id, name, created_at FROM clients
    `);
    return Response.json(rows);
  } catch (error) {
    return Response.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}
