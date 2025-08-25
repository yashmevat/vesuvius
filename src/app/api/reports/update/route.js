import db from "@/lib/db";

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, short_text, elaborated_text, status } = body;

    await db.query(
      `UPDATE reports 
       SET short_text = ?, elaborated_text = ?, status = ? 
       WHERE id = ?`,
      [short_text, elaborated_text, status, id]
    );

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Update error:", err);
    return new Response(JSON.stringify({ error: "Failed to update" }), { status: 500 });
  }
}
