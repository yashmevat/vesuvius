import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req) {
  try {
    const { clientId } = await req.json();

    if (!clientId) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
    }

    // Get client's report timing
    const [clientRows] = await db.query(
      "SELECT reporttiming FROM clients WHERE id = ?",
      [clientId]
    );

    if (clientRows.length === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const reportTiming = parseInt(clientRows[0].reporttiming) || 0;

    // If reporttiming is 0, user cannot submit reports
    if (reportTiming === 0) {
      return NextResponse.json({
        canSubmit: false,
        message: "Report submission is disabled for this client",
        reportTiming: reportTiming
      });
    }

    // Calculate if current day is eligible for report submission
    const currentDate = new Date();
    const dayOfMonth = currentDate.getDate(); // Gets day 1-31

    // Check if current day is divisible by reportTiming
    const canSubmitToday = dayOfMonth % reportTiming === 0;

    // Find next eligible day
    let nextEligibleDay = null;
    if (!canSubmitToday) {
      for (let day = dayOfMonth + 1; day <= 31; day++) {
        if (day % reportTiming === 0) {
          nextEligibleDay = day;
          break;
        }
      }
      
      // If no eligible day found in current month, check next month
      if (!nextEligibleDay) {
        for (let day = 1; day <= 31; day++) {
          if (day % reportTiming === 0) {
            nextEligibleDay = day;
            break;
          }
        }
      }
    }

    return NextResponse.json({
      canSubmit: canSubmitToday,
      message: canSubmitToday 
        ? "You can submit a report today" 
        : `You can't submit Today. Next eligible day: ${nextEligibleDay}`,
      reportTiming: reportTiming,
      currentDay: dayOfMonth,
      nextEligibleDay: nextEligibleDay
    });

  } catch (error) {
    console.error("Error checking report timing:", error);
    return NextResponse.json({ 
      error: "Failed to check report timing",
      details: error.message 
    }, { status: 500 });
  }
}
