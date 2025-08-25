// import db from "@/lib/db";

// export async function GET() {
//   try {
//     const [rows] = await db.query(`
//       SELECT 
//         u.id,
//         u.name,
//         u.email,
//         u.workforce_limit,
//         IFNULL(GROUP_CONCAT(c.id), '') AS client_ids,
//         IFNULL(GROUP_CONCAT(c.name), '') AS client_names
//       FROM users u
//       LEFT JOIN manager_clients mc ON mc.manager_id = u.id
//       LEFT JOIN clients c ON mc.client_id = c.id
//       WHERE u.role = 'manager'
//       GROUP BY u.id, u.name, u.email, u.workforce_limit
//       ORDER BY u.updated_at DESC
//     `);

//     // Convert comma-separated strings to arrays
//     const result = rows.map((row) => ({
//       ...row,
//       client_ids: row.client_ids ? row.client_ids.split(',').map(Number) : [],
//       client_names: row.client_names ? row.client_names.split(',') : [],
//     }));

//     return Response.json(result);
//   } catch (error) {
//     console.error("❌ Error fetching managers:", error);
//     return Response.json({ error: "Failed to fetch managers" }, { status: 500 });
//   }
// }


import db from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT 
        u.id AS manager_id,
        u.name,
        u.email,
        u.workforce_limit AS manager_limit,
        c.id AS client_id,
        c.name AS client_name,
        mc.workforce_limit AS client_limit
      FROM users u
      LEFT JOIN manager_clients mc ON mc.manager_id = u.id
      LEFT JOIN clients c ON mc.client_id = c.id
      WHERE u.role = 'manager'
      ORDER BY u.created_at DESC
    `);

    const managersMap = {};

    rows.forEach(row => {
      if (!managersMap[row.manager_id]) {
        managersMap[row.manager_id] = {
          id: row.manager_id,
          name: row.name,
          email: row.email,
          workforce_limit: row.manager_limit,
          client_names: [],
          client_ids: [] // will store objects { clientId, workforce_limit }
        };
      }

      if (row.client_id) {
        managersMap[row.manager_id].client_names.push(row.client_name);
        managersMap[row.manager_id].client_ids.push({
          clientId: row.client_id,
          workforce_limit: row.client_limit || 0
        });
      }
    });

    const result = Object.values(managersMap);

    return Response.json(result);
  } catch (error) {
    console.error("❌ Error fetching managers:", error);
    return Response.json({ error: "Failed to fetch managers" }, { status: 500 });
  }
}
