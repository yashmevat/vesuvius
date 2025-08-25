"use client";
import ManagerNavbar from "@/components/ManagerNavbar";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ManagerAddWorkforce() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    clientId: "",
  });
  const router = useRouter();

  // Fetch manager's clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        // First try to get userId from the API
        const userIdRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/getuserid`, {
          credentials: "include",
        });
        const userIdData = await userIdRes.json();
        const managerId = userIdData.id || localStorage.getItem("userId");

        if (!managerId || managerId === "undefined") {
          toast.error("Session expired. Please login again.");
          router.push("/login");
          return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/manager/getclients`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: managerId }),
          credentials: "include",
        });

        const data = await res.json();
        if (data.success) {
          setClients(data.clients);
        } else {
          toast.error("Failed to fetch clients");
        }
      } catch (err) {
        console.error("Error fetching clients:", err);
        toast.error("Error fetching clients");
      }
    };

    fetchClients();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/manager/workforce/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Workforce member added successfully!");
        setForm({ name: "", email: "", clientId: "" });
        // Optionally redirect after success
        setTimeout(() => {
          router.push("/manager/dashboard");
        }, 2000);
      } else {
        toast.error(data.error || "Failed to add workforce member");
      }
    } catch (error) {
      console.error("Error adding workforce:", error);
      toast.error("An error occurred while adding workforce member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <ManagerNavbar />
      
      <div className="flex items-center justify-center px-4 py-12">
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-700">
          <h1 className="text-3xl font-bold mb-6 text-center text-green-400">
            Add Workforce Member
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                placeholder="Enter workforce member name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                placeholder="workforce@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            {/* Client Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Assign to Client
              </label>
              <select
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                required
              >
                <option value="">Select Client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold shadow-md transition-all ${
                loading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 hover:shadow-lg"
              } text-white`}
            >
              {loading ? "Adding..." : "Add Workforce Member"}
            </button>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={() => router.push("/manager/dashboard")}
              className="w-full py-3 rounded-lg font-semibold bg-gray-700 hover:bg-gray-600 text-white transition-all"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
