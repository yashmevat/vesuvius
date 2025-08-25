import db from "@/lib/db"
export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const workforceId = searchParams.get("workforceId");
 
    if (!workforceId) {
        return new Response(JSON.stringify({ message: "Workforce ID is required" }), { status: 400 });
    }
 
    try {
        // Get daily report stats
        const [rows] = await db.query(
            "SELECT status, COUNT(*) as count FROM reports WHERE workforce_id = ? GROUP BY status",[workforceId]
        );
 
        const result = rows.map(r=>({title:r.status, value: r.count}))
        
        // Get weekly report count
        let weeklyReportCount = 0;
        try {
            const [weeklyRows] = await db.query(
                "SELECT COUNT(*) as count FROM workforce_weekly_reports WHERE workforce_id = ?",
                [workforceId]
            );
            weeklyReportCount = weeklyRows[0].count || 0;
        } catch (error) {
            // Table might not exist yet
            console.log("Weekly reports table not found");
        }
        
        // Add weekly report stat
        result.push({ title: "Weekly Reports", value: weeklyReportCount });
 
        return new Response(JSON.stringify({stats: result}), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error(error);
        return new Response(
            JSON.stringify({ error: "Failed to fetch report status counts" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}