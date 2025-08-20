import db from "@/lib/db";

export async function PATCH(req) {
  try {
    const { id, name, email, workforceLimit } = await req.json();
    await db.query(
      "UPDATE users SET name = ?, email = ?, workforce_limit = ? WHERE id = ?",
      [name, email, workforceLimit, id]
    );
     const date = new Date(Date.now())
    await db.query("update users set updated_at=? where id=?",[date,id])

    return Response.json({ message: "Manager updated successfully" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to update manager" }, { status: 500 });
  }
}
