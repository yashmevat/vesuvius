"use client";
import SuperAdminNavbar from "@/components/SuperadminNavbar";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AddManager() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    clientIds: [],  // ✅ Array instead of single clientId
    workforceLimit: 0
  });

  useEffect(() => {
    fetch("/api/superadmin/clients/list")
      .then((res) => res.json())
      .then((data) => setClients(data));
  }, []);

  // ✅ Handle multiple select
  const handleClientChange = (e) => {
    const selectedValues = Array.from(e.target.selectedOptions, (option) => option.value);
    setForm({ ...form, clientIds: selectedValues });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/superadmin/managers/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...form,
        clientIds: form.clientIds.map(Number), // ✅ Convert to numbers
        workforceLimit: Number(form.workforceLimit)
      })
    });

    const data = await res.json();

    if (res.ok) {
      toast.success(data.message || "Manager added successfully");
    } else {
      toast.error(data.error || "Unable to add due to error");
    }
  };

  return (
    <div>
      <SuperAdminNavbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-6">
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-700 text-white">
          <h1 className="text-3xl font-bold mb-6 text-center text-green-400">
            Add Manager
          </h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Name"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              type="email"
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <label className="block mb-2 font-semibold">Select Clients</label>
            <select
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={handleClientChange}
              multiple
              required
            >
              {clients.length > 0 &&
                clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
            <p className="text-gray-400 text-sm mt-1">
              Hold <strong>CTRL</strong> (Windows) or <strong>CMD</strong> (Mac) to select multiple
            </p>

            <input
              type="number"
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Workforce Limit"
              onChange={(e) => setForm({ ...form, workforceLimit: e.target.value })}
              min={1}
              required
            />
            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 transition-colors text-white py-3 rounded-lg font-semibold shadow-md"
            >
              Add
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
