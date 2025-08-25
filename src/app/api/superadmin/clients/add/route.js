import db from "@/lib/db";
 
export async function POST(req) {
  try {
    const { name, createdBy, contactDetails, location } = await req.json();
 
    if (!name || !createdBy ||!contactDetails || !location) {
      return Response.json(
        { error: "Missing required fields (name, createdBy)" },
        { status: 400 }
      );
    }
 
    const [result] = await db.query(
      `INSERT INTO clients (name, created_by, contact_details, location) 
       VALUES (?, ?, ?, ?)`,
      [name, createdBy, contactDetails || null, location || null]
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