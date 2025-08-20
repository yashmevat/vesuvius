import db from "@/lib/db";

export async function POST(req) {
  try {
    const { name, createdBy } = await req.json();
    const [result] = await db.query(
      `INSERT INTO clients (name, created_by) VALUES (?, ?)`,
      [name, createdBy]
    );
    return Response.json({ message: "Client added successfully", id: result.insertId });
  } catch (error) {
    return Response.json({ error: "Error adding client" }, { status: 500 });
  }
}
