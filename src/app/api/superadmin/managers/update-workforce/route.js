import db from "@/lib/db";

export async function PATCH(req) {
    try {
        const { managerId, workforceLimit } = await req.json();

        await db.query(
            "UPDATE users SET workforce_limit = ? WHERE id = ?",
            [workforceLimit, managerId]
        );
        const date = new Date(Date.now())
        await db.query("update users set updated_at=? where id=?", [date, managerId])


        return Response.json({ message: "Workforce limit updated successfully" });
    } catch (error) {
        console.error("Error updating workforce limit:", error);
        return Response.json(
            { error: "Error updating workforce limit" },
            { status: 500 }
        );
    }
}
