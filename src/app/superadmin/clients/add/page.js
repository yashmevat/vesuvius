"use client";
import SuperAdminNavbar from "@/components/SuperadminNavbar";
import { useState } from "react";
import toast from "react-hot-toast";

export default function AddClient() {
  const [name, setName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/superadmin/clients/add", {
      method: "POST",
      body: JSON.stringify({ name, createdBy: 1 }) // 1 = superadmin ID
    });
    if (res.ok) {
      const data = await res.json();
      toast.success(data.message || "client success added")
    } else {
      toast.error("Error Adding Client")
    }
  };

  return (
    <div>
      <SuperAdminNavbar/>
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-6">
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">Add Client</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="border border-gray-600 bg-gray-700 text-white placeholder-gray-400 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Client Name"
              onChange={e => setName(e.target.value)}
            />
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg w-full font-medium transition duration-200"
            >
              Add Client
            </button>
          </form>
        </div>
      </div>
    </div>

  );
}
