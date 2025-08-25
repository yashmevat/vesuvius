import { NextResponse } from "next/server";
import db from "@/lib/db";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    // Get workforce ID from JWT token
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const workforceId = decoded.id;

    // Get workforce's client information
    const [rows] = await db.query(
      `SELECT u.id, u.name as workforce_name, u.client_id, c.name as client_name
       FROM users u
       LEFT JOIN clients c ON u.client_id = c.id
       WHERE u.id = ? AND u.role = 'workforce'`,
      [workforceId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Workforce member not found" }, { status: 404 });
    }

    const workforceInfo = rows[0];

    // If client_id is null, check workforce_clients table
    if (!workforceInfo.client_id) {
      const [clientRows] = await db.query(
        `SELECT wc.client_id, c.name as client_name
         FROM workforce_clients wc
         JOIN clients c ON wc.client_id = c.id
         WHERE wc.workforce_id = ?
         LIMIT 1`,
        [workforceId]
      );

      if (clientRows.length > 0) {
        workforceInfo.client_id = clientRows[0].client_id;
        workforceInfo.client_name = clientRows[0].client_name;
      }
    }

    return NextResponse.json({
      success: true,
      workforce: {
        id: workforceInfo.id,
        name: workforceInfo.workforce_name,
        client_id: workforceInfo.client_id,
        client_name: workforceInfo.client_name || "No client assigned"
      }
    });

  } catch (error) {
    console.error("Error fetching workforce client info:", error);
    return NextResponse.json({ 
      error: "Failed to fetch client information",
      details: error.message 
    }, { status: 500 });
  }
}
