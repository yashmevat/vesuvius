"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SuperAdminNavbar from "@/components/SuperadminNavbar";
import toast from "react-hot-toast";

export default function UpdateManagerClients({ params }) {
  const { managerId } = params;
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);

  // Fetch all clients
  const fetchClients = async () => {
    const res = await fetch("/api/superadmin/clients/list");
    const data = await res.json();
    setClients(data);
  };

  // Fetch manager's current clients
  const fetchManagerClients = async () => {
    const res = await fetch(`/api/superadmin/managers/${managerId}/clients`);
    const data = await res.json();
    if (res.ok) setSelectedClients(data.map((c) => c.client_id)); // array of client IDs
  };

  useEffect(() => {
    fetchClients();
    fetchManagerClients();
  }, []);

  const handleChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (option) =>
      Number(option.value)
    );
    setSelectedClients(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/superadmin/managers/update-clients", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ managerId: Number(managerId), clientIds: selectedClients }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message || "Clients updated successfully");
      router.push("/superadmin/managers");
    } else {
      toast.error(data.error || "Failed to update clients");
    }
  };

  return (
    <div>
      <SuperAdminNavbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-6">
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-700 text-white">
          <h1 className="text-3xl font-bold mb-6 text-center text-green-400">
            Update Clients
          </h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block font-semibold">Select Clients</label>
            <select
              multiple
              value={selectedClients}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold mt-4"
            >
              Save Clients
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
