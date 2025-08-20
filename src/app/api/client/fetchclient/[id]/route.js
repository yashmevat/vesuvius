import { NextResponse } from "next/server";
import db from "@/lib/db";

export const GET = async (req, { params }) => {
  try {
    const { id } = await params; // Get the id from the params object

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Client id is required" },
        { status: 400 }
      );
    }

    const [rows] = await db.query("SELECT * FROM clients WHERE id=?", [id]);

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "No client found" },
        { status: 400 }
      );
    } else {
      // Return a successful response with status 200
      return NextResponse.json(
        { success: true, message: "Client fetched successfully", client: rows[0] },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
};
