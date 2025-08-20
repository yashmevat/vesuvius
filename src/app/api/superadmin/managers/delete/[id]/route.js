import db from "@/lib/db";

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    // delete manager from related tables first if needed
    await db.query("DELETE FROM users WHERE id = ?", [id]);
    // await db.query("DELETE FROM managers WHERE id = ?", [id]);
    return Response.json({ message: "Manager deleted successfully" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to delete manager" }, { status: 500 });
  }
}
