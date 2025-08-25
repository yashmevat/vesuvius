import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const workforceId = searchParams.get("workforceId");

    if (!workforceId) {
      return NextResponse.json({ error: "Workforce ID required" }, { status: 400 });
    }

    try {
      // Fetch workforce weekly reports
      const [reports] = await db.query(
        `SELECT id, pdf_url, submitted_at 
         FROM workforce_weekly_reports 
         WHERE workforce_id = ? 
         ORDER BY submitted_at DESC 
         LIMIT 10`,
        [workforceId]
      );

      return NextResponse.json({ 
        success: true, 
        reports: reports 
      });
    } catch (dbError) {
      // If table doesn't exist, return empty array
      if (dbError.code === 'ER_NO_SUCH_TABLE') {
        console.log("workforce_weekly_reports table doesn't exist yet");
        return NextResponse.json({ 
          success: true, 
          reports: [] 
        });
      }
      throw dbError;
    }
  } catch (error) {
    console.error("Error fetching workforce weekly reports:", error);
    return NextResponse.json({ 
      error: "Failed to fetch reports",
      details: error.message 
    }, { status: 500 });
  }
}
