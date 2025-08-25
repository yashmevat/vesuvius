import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
        workforce_id,
      manager_id,
      client_id,
      short_text,
      elaborated_text,
      image_url,
      image_text,
      image_url2,
      image_text2
    } = body;

    if (!workforce_id || !manager_id || !client_id || !short_text || !image_url) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const [insert] = await db.query(
      `INSERT INTO reports 
        (workforce_id, manager_id, client_id, short_text, elaborated_text, image_url, image_text, image_url2, image_text2, status, submitted_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        workforce_id,
        manager_id,
        client_id,
        short_text,
        elaborated_text || null,
        image_url,
        image_text || null,
        image_url2 || null,
        image_text2 || null,
        "Pending",
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Report submitted",
      report_id: insert.insertId,
    });
  } catch (err) {
    console.error("Error submitting report:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
