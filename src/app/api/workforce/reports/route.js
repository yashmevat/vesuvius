import db from "@/lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const workforceId = searchParams.get("workforceId"); // from session or query

    let query = `
      SELECT r.id, r.short_text, r.elaborated_text, r.image_url, r.image_url2, r.image_text, r.image_text2, r.status, r.remarks, r.submitted_at, w.pdf_url
      FROM reports r
      LEFT JOIN workforce_weekly_reports w ON r.id = w.report_id
      WHERE r.workforce_id = ?
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
