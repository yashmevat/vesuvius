import db from "@/lib/db";

export async function PATCH(req, { params }) {
  try {
    const id = params.id;
    const { short_text, elaborated_text, image_url } = await req.json();

    await db.query(
      `UPDATE reports 
       SET short_text = ?, elaborated_text = ?, image_url = ?, status = 'pending'
       WHERE id = ?`,
      [short_text, elaborated_text, image_url, id]
    );

    return Response.json({ message: "Report updated successfully" });
  } catch (error) {
    console.error("❌ Update report error:", error);
    return Response.json({ error: "Failed to update report" }, { status: 500 });
  }
}
