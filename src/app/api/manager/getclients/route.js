import { NextResponse } from "next/server";
import db from "@/lib/db";

export const POST = async (req) => {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "manager id is required" },
        { status: 400 }
      );
    }

    // Join manager_clients with clients table to get client details directly
    const [rows] = await db.query(
      `SELECT c.id, c.name, c.created_at 
       FROM manager_clients mc
       JOIN clients c ON mc.client_id = c.id
       WHERE mc.manager_id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "No clients have been assigned to manager" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Clients fetched successfully", clients: rows },
      { status: 200 }
    );
  } catch (error) {
    console.error("Internal server error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
};
