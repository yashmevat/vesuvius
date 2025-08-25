
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  const url = new URL(req.url);
  const managerId = url.searchParams.get("managerId");

  if (!managerId) {
    return NextResponse.json({ error: "Manager ID required" }, { status: 400 });
  }

  try {
     const [clients] = await db.execute(
      `SELECT c.id, c.name
       FROM manager_clients mc
       JOIN clients c ON mc.client_id = c.id
       WHERE mc.manager_id = ?`,
      [managerId]
    );
    return NextResponse.json(clients);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
