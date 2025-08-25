"use client";
import SuperAdminNavbar from "@/components/SuperadminNavbar";
import { useState } from "react";
import toast from "react-hot-toast";

export default function AddClient() {
  const [form, setForm] = useState({
    name: "",
    contactDetails: "",
    location: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/superadmin/clients/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        createdBy: 1, // superadmin ID
        contactDetails: form.contactDetails,
        location: form.location,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      toast.success(data.message || "Client added successfully");
      setForm({ name: "", contactDetails: "", location: "" }); // reset form
    } else {
      toast.error("Error Adding Client");
    }
  };

  return (
    <div>
      <SuperAdminNavbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-6">
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">
            Add Client
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="border border-gray-600 bg-gray-700 text-white placeholder-gray-400 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Client Name"
            />
            <input
              name="contactDetails"
              value={form.contactDetails}
              onChange={handleChange}
              className="border border-gray-600 bg-gray-700 text-white placeholder-gray-400 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contact Details"
            />
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className="border border-gray-600 bg-gray-700 text-white placeholder-gray-400 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Location"
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