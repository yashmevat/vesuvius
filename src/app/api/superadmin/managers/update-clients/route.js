import db from "@/lib/db";

export async function PATCH(req) {
  const connection = await db.getConnection();
  try {
    const { managerId, clients } = await req.json();
    // clients: [{ clientId: 101, workforce_limit: 5 }, { clientId: 102, workforce_limit: 8 }]

    if (!managerId || !Array.isArray(clients)) {
      return Response.json({ error: "managerId and clients array are required" }, { status: 400 });
    }

    const validClients = clients.filter(
      (c) => c.clientId && typeof c.workforce_limit === "number"
    );

    if (validClients.length === 0) {
      return Response.json({ error: "No valid clients provided" }, { status: 400 });
    }

    // ✅ Step 1: Get manager's global workforce_limit
    const [managerRows] = await connection.query(
      "SELECT workforce_limit FROM users WHERE id = ? AND role = 'manager'",
      [managerId]
    );

    if (managerRows.length === 0) {
      return Response.json({ error: "Manager not found" }, { status: 404 });
    }

    const managerLimit = managerRows[0].workforce_limit;

    // ✅ Step 2: Calculate total new workforce limit
    const totalNewLimit = validClients.reduce((sum, c) => sum + c.workforce_limit, 0);

    if (totalNewLimit > managerLimit) {
      return Response.json(
        { error: `Cannot assign. Total workforce limit (${totalNewLimit}) exceeds manager limit (${managerLimit}).` },
        { status: 400 }
      );
    }

    await connection.beginTransaction();

    // ✅ Step 3: Delete existing assignments
    await connection.query("DELETE FROM manager_clients WHERE manager_id = ?", [managerId]);

    // ✅ Step 4: Insert new assignments with workforce_limit
    const values = validClients.map((c) => [managerId, c.clientId, c.workforce_limit]);
    await connection.query(
      "INSERT INTO manager_clients (manager_id, client_id, workforce_limit) VALUES ?",
      [values]
    );

    // ✅ Step 5: Update updated_at for manager
    const date = new Date();
    await connection.query("UPDATE users SET updated_at = ? WHERE id = ?", [date, managerId]);

    await connection.commit();

    return Response.json({ message: "Manager clients and workforce limits updated successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("❌ Error updating manager_clients:", error);
    return Response.json({ error: error.message || "Failed to update manager_clients" }, { status: 500 });
  } finally {
    connection.release();
  }
}
