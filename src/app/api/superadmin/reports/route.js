import db from "@/lib/db";
 
export async function GET() {
  try {
    const [rows] = await db.query(
      `SELECT
         wr.id,
         wr.pdf_url,
         wr.submitted_at,
         u.name AS manager_name,
         u.email AS manager_email,
         c.name AS client_name
       FROM weekly_reports wr
       JOIN users u ON wr.manager_id = u.id
       JOIN clients c ON wr.client_id = c.id
       ORDER BY wr.submitted_at DESC`
    );
 
    return Response.json(rows);
  } catch (error) {
    console.error("❌ Fetch reports error:", error);
    return Response.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}