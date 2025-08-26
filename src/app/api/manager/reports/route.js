import db from "@/lib/db";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const managerId = searchParams.get("managerId");

        if (!managerId) {
            return new Response(JSON.stringify({ message: "Manager ID is required" }), { status: 400 });
        }

        let query = `
                    SELECT 
                        r.id, r.short_text, r.elaborated_text, r.image_url, r.image_text, 
                        r.image_url2, r.image_text2, r.status, r.submitted_at, r.remarks,
                        u.name AS workforce_name,
                        c.name AS client_name,
                        w.pdf_url
                        FROM reports r
                        JOIN users u ON r.workforce_id = u.id
                        JOIN clients c ON r.client_id = c.id
                        LEFT JOIN workforce_weekly_reports w ON r.id = w.report_id
                        WHERE r.manager_id = ?

                    `;

        const params = [managerId];

        if (status) {
            query += " AND r.status = ?";
            params.push(status);
        }

        query += " ORDER BY r.submitted_at DESC";

        const [rows] = await db.execute(query, params);

        return new Response(JSON.stringify({ reports: rows }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error("Error fetching reports:", error);
        return new Response(JSON.stringify({ message: "Error fetching reports" }), { status: 500 });
    }
}
