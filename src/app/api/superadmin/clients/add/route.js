import db from "@/lib/db";
 
export async function POST(req) {
  try {
    const { name, createdBy, roboticsscan, contactDetails, location, reportTiming } = await req.json();
 
    if (!name || !createdBy ||!contactDetails || !location) {
      return Response.json(
        { error: "Missing required fields (name, createdBy)" },
        { status: 400 }
      );
    }
 
    const [result] = await db.query(
      `INSERT INTO clients (name, created_by, roboticsscan, contact_details, location, reporttiming) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, createdBy, roboticsscan || null, contactDetails || null, location || null, reportTiming || null]
    );
 
    return Response.json({
      message: "Client added successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error inserting client:", error);
    return Response.json({ error: "Error adding client" }, { status: 500 });
  }
}