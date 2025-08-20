import { NextResponse } from "next/server";
import db from "@/lib/db"; // your DB connection

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const { manager_id, client_id } = await req.json();

    await db.query(
      "UPDATE users SET manager_id = ?, client_id = ? WHERE id = ?",
      [manager_id || null, client_id || null, id]
    );

    await db.query("update workforce_clients set client_id=? where workforce_id=?",[client_id,id])

    return NextResponse.json({ message: "Workforce updated successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
