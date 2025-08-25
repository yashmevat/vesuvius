import db from "@/lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const workforceId = searchParams.get("workforceId"); // from session or query

    let query = `
      SELECT id, short_text, elaborated_text, image_url, image_url2, image_text, image_text2, status, remarks,submitted_at
      FROM reports
      WHERE workforce_id = ?
    `;

    const params = [workforceId];

    if (status) {
      query += " AND status = ?";
      params.push(status);
    }

    query += " ORDER BY submitted_at DESC";

    const [rows] = await db.query(query, params);

    return Response.json(rows);
  } catch (error) {
    console.error("❌ Fetch reports error:", error);
    return Response.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
