"use client";
import SuperAdminNavbar from "@/components/SuperadminNavbar";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ClientsList() {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/superadmin/clients/list`)
      .then(res => res.json())
      .then(data => setClients(data));
  }, []);

  return (
    <div>
      <SuperAdminNavbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-6xl">
          <h1 className="text-3xl font-bold mb-6 text-center text-white">Clients</h1>

          <div className="flex justify-end mb-4">
            <Link
              href="/superadmin/clients/add"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition"
            >
              + Add Client
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border border-gray-700 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-700 text-white">
                  <th className="p-3 border border-gray-700">Name</th>
                  <th className="p-3 border border-gray-700">Contact Details</th>
                  <th className="p-3 border border-gray-700">Location</th>
                  <th className="p-3 border border-gray-700">Created At</th>
                </tr>
              </thead>
              <tbody>
                {clients.length > 0 ? (
                  clients.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-600 transition">
                      <td className="p-3 border border-gray-700 text-gray-200">{c.name}</td>
                      <td className="p-3 border border-gray-700 text-gray-200">{c.contact_details || "-"}</td>
                      <td className="p-3 border border-gray-700 text-gray-200">{c.location || "-"}</td>
                      <td className="p-3 border border-gray-700 text-gray-400">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center p-4 text-gray-400 border border-gray-700"
                    >
                      No clients found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}