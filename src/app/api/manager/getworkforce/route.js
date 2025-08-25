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

    const [rows] = await db.query(
      "SELECT name,email FROM users WHERE manager_id=?",
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "No workforce have been assigned to manager" },
        { status: 400 }
      );
    }
    const len = rows.length;
    return NextResponse.json({success:true , workforceData:rows ,worforce:len},{status:200})
   
  } catch (error) {
    console.error("Internal server error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
};
