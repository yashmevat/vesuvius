"use client";
import { useEffect, useState } from "react";

export default function ManagerDashboard() {
  const [workforces, setWorkforces] = useState([]);
  const [clients, setClients] = useState([]);
  const [reports, setReports] = useState([]);
  const [wfName, setWfName] = useState("");
  const [wfEmail, setWfEmail] = useState("");
  const [wfPassword, setWfPassword] = useState("");
  const [clientName, setClientName] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/manager/workforce`).then(res => res.json()).then(setWorkforces);
    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/manager/daily-reports`).then(res => res.json()).then(setReports);
    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/superadmin/clients`).then(res => res.json()).then(setClients);
  }, []);

  const addWorkforce = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/manager/workforce`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: wfName, email: wfEmail, password: wfPassword })
    });
    location.reload();
  };

  const addClient = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/superadmin/clients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: clientName })
    });
    location.reload();
  };

  const updateReportStatus = async (id, status) => {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/manager/daily-reports`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status })
    });
    location.reload();
  };

  return (
       <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8">
      <h1 className="text-3xl font-bold text-green-400 mb-8 text-center">
        Manager Dashboard
      </h1>

      {/* Add Workforce */}
      <section className="bg-gray-900/60 backdrop-blur-lg p-6 rounded-lg shadow-md border border-gray-700 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add Workforce</h2>
        <div className="space-y-4">
          <input
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Name"
            value={wfName}
            onChange={(e) => setWfName(e.target.value)}
          />
          <input
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Email"
            value={wfEmail}
            onChange={(e) => setWfEmail(e.target.value)}
          />
          <input
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Password"
            value={wfPassword}
            onChange={(e) => setWfPassword(e.target.value)}
          />
          <button
            onClick={addWorkforce}
            className="w-full bg-green-500 hover:bg-green-600 transition-colors py-3 rounded-lg font-semibold shadow-md"
          >
            Add Workforce
          </button>
        </div>
      </section>

      {/* Add Client */}
      <section className="bg-gray-900/60 backdrop-blur-lg p-6 rounded-lg shadow-md border border-gray-700 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add Client</h2>
        <div className="space-y-4">
          <input
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Client Name"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
          <button
            onClick={addClient}
            className="w-full bg-green-500 hover:bg-green-600 transition-colors py-3 rounded-lg font-semibold shadow-md"
          >
            Add Client
          </button>
        </div>
      </section>

      {/* Daily Reports */}
      <section className="bg-gray-900/60 backdrop-blur-lg p-6 rounded-lg shadow-md border border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Daily Reports</h2>
        <div className="space-y-4">
          {reports.map((r) => (
            <div
              key={r.id}
              className="p-4 bg-gray-800 rounded-lg border border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
            >
              <span>
                <span className="font-medium text-green-400">{r.short_text}</span> -{" "}
                <span className="text-gray-300">{r.status}</span>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => updateReportStatus(r.id, "approved")}
                  className="px-3 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-sm"
                >
                  Approve
                </button>
                <button
                  onClick={() => updateReportStatus(r.id, "rejected")}
                  className="px-3 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm"
                >
                  Reject
                </button>
                <button
                  onClick={() => updateReportStatus(r.id, "edit_requested")}
                  className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 rounded-lg text-sm text-black"
                >
                  Request Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
