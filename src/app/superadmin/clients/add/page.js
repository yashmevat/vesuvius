"use client";
import SuperAdminNavbar from "@/components/SuperadminNavbar";
import { useState } from "react";
import toast from "react-hot-toast";

export default function AddClient() {
  const [form, setForm] = useState({
    name: "",
    contactDetails: "",
    location: "",
    roboticsscan: "",
    reporttiming: "",
  });
  const [showCustomDays, setShowCustomDays] = useState(false);
  const [customDays, setCustomDays] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "roboticsscan") {
      // Reset report timing when robotics scan changes
      setForm({ 
        ...form, 
        [name]: value, 
        reporttiming: value ? "" : "0" 
      });
      setShowCustomDays(false);
      setCustomDays("");
    } else if (name === "reporttiming") {
      if (value === "custom") {
        setShowCustomDays(true);
        setForm({ ...form, [name]: "" });
      } else {
        setShowCustomDays(false);
        setCustomDays("");
        setForm({ ...form, [name]: value });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleCustomDaysChange = (e) => {
    const value = e.target.value;
    setCustomDays(value);
    setForm({ ...form, reporttiming: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Ensure reporttiming is 0 if no robotics scan is selected
    const reportTimingValue = form.roboticsscan ? form.reporttiming : "0";
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/superadmin/clients/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        createdBy: 1, // superadmin ID
        contactDetails: form.contactDetails,
        location: form.location,
        roboticsscan: form.roboticsscan,
        reporttiming: reportTimingValue,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      toast.success(data.message || "Client added successfully");
      setForm({ 
        name: "", 
        contactDetails: "", 
        location: "", 
        roboticsscan: "", 
        reporttiming: "" 
      }); // reset form
      setShowCustomDays(false);
      setCustomDays("");
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
            <select
              name="roboticsscan"
              value={form.roboticsscan}
              onChange={handleChange}
              className="border border-gray-600 bg-gray-700 text-white placeholder-gray-400 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>Select Robotics Scan</option>
              <option value="ANTERIS 360">ANTERIS 360</option>
              <option value="ANTERIS 300r">ANTERIS 300r</option>
              <option value="ANTERIS 300c">ANTERIS 300c</option>
              <option value="ANTERIS 300s">ANTERIS 300s</option>
              <option value="ANTERIS 300dm">ANTERIS 300dm</option>
              <option value="ANTERIS 300i">ANTERIS 300i</option>
              <option value="ANTERIS 300it">ANTERIS 300it</option>
              <option value="other">Other</option>
            </select>
            {/* Report Timing - Only show if robotics scan is selected */}
            {form.roboticsscan && form.roboticsscan !== "other" && (
              <>
                <select
                  name="reporttiming"
                  value={showCustomDays ? "custom" : form.reporttiming}
                  onChange={handleChange}
                  className="border border-gray-600 bg-gray-700 text-white placeholder-gray-400 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="" disabled>Select Report Timing</option>
                  <option value="1">Daily</option>
                  <option value="7">Weekly</option>
                  <option value="custom">Custom</option>
                </select>
                
                {/* Custom Days Dropdown */}
                {showCustomDays && (
                  <select
                    name="customDays"
                    value={customDays}
                    onChange={handleCustomDaysChange}
                    className="border border-gray-600 bg-gray-700 text-white placeholder-gray-400 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                    required
                  >
                    <option value="" disabled>Select number of days</option>
                    {[...Array(30)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        After {i + 1} day{i + 1 > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                )}
              </>
            )}
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