"use client";
import SuperAdminNavbar from "@/components/SuperadminNavbar";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
 
export default function AddWorkforce() {
  const [managers, setManagers] = useState([]);
  const [managerClients, setManagerClients] = useState([]); // 👈 filtered clients
  const [form, setForm] = useState({
    name: "",
    email: "",
    managerId: "",
    clientId: "",
  });
 
  // Fetch managers list initially
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/superadmin/managers/list`)
      .then((res) => res.json())
      .then((data) => setManagers(data))
      .catch((err) => console.error("Error fetching managers:", err));
  }, []);
 
  // Fetch clients of selected manager
  useEffect(() => {
    const fetchManagerClients = async () => {
      if (!form.managerId) {
        setManagerClients([]);
        return;
      }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/manager/getclients`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: form.managerId }),
        });
 
        const data = await res.json();
        if (data.success) {
          setManagerClients(data.clients);
        } else {
          console.error(data.message);
          setManagerClients([]);
        }
      } catch (err) {
        console.error("Error fetching manager clients:", err);
        setManagerClients([]);
      }
    };
 
    fetchManagerClients();
  }, [form.managerId]);
 
  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
 
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/superadmin/workforce/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
 
    const data = await res.json();
 
    if (res.ok) {
      toast.success(data.message || "Workforce added successfully!");
      setForm({ name: "", email: "", managerId: "", clientId: "" }); // reset
      setManagerClients([]);
    } else {
      toast.error(data.error || "Unable to add workforce");
    }
  };
 
  return (
    <div>
      <SuperAdminNavbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-6">
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-700 text-white">
          <h1 className="text-3xl font-bold mb-6 text-center text-green-400">
            Add Workforce
          </h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <input
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
 
            {/* Email */}
            <input
              type="email"
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
 
            {/* Manager Dropdown */}
            <select
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              value={form.managerId}
              onChange={(e) =>
                setForm({ ...form, managerId: e.target.value, clientId: "" })
              }
              required
            >
              <option value="">Select Manager</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
 
            {/* Client Dropdown */}
            <select
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
              required
              disabled={!form.managerId} // disable until manager selected
            >
              <option value="">Select Client</option>
              {managerClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
 
            {/* Submit Button */}
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