import { NextResponse } from "next/server";
import db from "@/lib/db";

export const POST = async (req) => {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "manager id is required" },
        { status: 400 }
      );
    }

    const [rows] = await db.query(
      "SELECT client_id FROM manager_clients WHERE manager_id=?",
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "No clients have been assigned to manager" },
        { status: 400 }
      );
    }

    let clients = [];

    async function fetchClient(clientId) {
      if (clientId) {
        try {
          // Use the full URL to avoid the ERR_INVALID_URL error
          const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/client/fetchclient/${clientId}`);
          const data = await res.json();
          if (data && data.client) {
            clients.push(data.client);
          }
        } catch (error) {
          console.error(`Error fetching client with ID ${clientId}:`, error);
        }
      }
    }

    // Fetch all clients asynchronously
    await Promise.all(
      rows.map(async (r) => {
        await fetchClient(r.client_id);
      })
    );

    if (clients.length > 0) {
      return NextResponse.json(
        { success: true, message: "Clients fetched successfully", clients },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: "No clients assigned" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Internal server error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
};
