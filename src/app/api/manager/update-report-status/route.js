import db from "@/lib/db";

export async function POST(req) {
  try {
    const { reportId, status, remarks } = await req.json();

    if (!reportId || !status) {
      return new Response(JSON.stringify({ message: "Report ID and status are required" }), { status: 400 });
    }

    const allowedStatuses = ["approved", "rejected", "edit_requested","pending"];
    if (!allowedStatuses.includes(status)) {
      return new Response(JSON.stringify({ message: "Invalid status" }), { status: 400 });
    }

    // Validate remarks for rejected or edit_requested
    if ((status === "rejected" || status === "edit_requested") && (!remarks || remarks.trim() === "")) {
      return new Response(JSON.stringify({ message: "Remarks are required for rejected or edit requested status" }), { status: 400 });
    }

    await db.execute(
      "UPDATE reports SET status = ?, remarks = ? WHERE id = ?",
      [status, remarks || null, reportId]
    );

    return new Response(JSON.stringify({ message: "Status updated successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error updating report status:", error);
    return new Response(JSON.stringify({ message: "Error updating report status" }), { status: 500 });
  }
}
