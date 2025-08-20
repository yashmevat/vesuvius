"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import SuperAdminNavbar from "@/components/SuperadminNavbar";

export default function WorkforceList() {
  const [workers, setWorkers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [selectedManager, setSelectedManager] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [showModal, setShowModal] = useState(false);

  const fetchWorkforce = async () => {
    const res = await fetch("/api/superadmin/workforce/list");
    const data = await res.json();
    setWorkers(data);
  };

  const fetchManagers = async () => {
    const res = await fetch("/api/superadmin/managers/list");
    const data = await res.json();
    setManagers(data);
  };

  const fetchClients = async () => {
    const res = await fetch("/api/manager/getclients",{
      method:"POST",
      body:JSON.stringify({id:selectedManager})
    });
    const data = await res.json();
    if(data.success){
      setClients(data.clients);
    }
  };

  useEffect(() => {
    fetchWorkforce();
    fetchManagers();
  }, []);

  useEffect(()=>{
    if(selectedManager){
      fetchClients()
    }
  },[selectedManager])

  const handleUpdate = (worker) => {
    setSelectedWorker(worker);
    setSelectedManager(worker.manager_id || "");
    setSelectedClient(worker.client_id || "");
    setShowModal(true);
  };

  const handleSave = async () => {
    const res = await fetch(`/api/superadmin/workforce/update/${selectedWorker.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        manager_id: selectedManager,
        client_id: selectedClient,
      }),
    });

    if (res.ok) {
      alert("Updated successfully!");
      setShowModal(false);
      fetchWorkforce();
    } else {
      alert("Update failed!");
    }
  };

  return (
    <div>
      <SuperAdminNavbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-6">
        <div className="bg-gray-800 w-full max-w-6xl p-8 rounded-2xl shadow-lg border border-gray-700 text-white">
          <h1 className="text-3xl font-bold mb-6 text-center text-green-400">Workforce</h1>

          <div className="flex justify-end mb-4">
            <Link
              href="/superadmin/workforce/add"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow transition"
            >
              + Add Workforce
            </Link>
          </div>

          <div className="overflow-x-auto rounded-lg">
            <table className="w-full border-collapse border border-gray-700">
              <thead>
                <tr className="bg-gray-700 text-white">
                  <th className="p-3 border border-gray-600 text-left">Name</th>
                  <th className="p-3 border border-gray-600 text-left">Email</th>
                  <th className="p-3 border border-gray-600 text-left">Manager</th>
                  <th className="p-3 border border-gray-600 text-left">Client</th>
                  <th className="p-3 border border-gray-600 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {workers.length > 0 ? (
                  workers.map((w) => (
                    <tr
                      key={w.id}
                      className="hover:bg-gray-700 transition-colors cursor-default"
                    >
                      <td className="p-3 border border-gray-600">{w.name}</td>
                      <td className="p-3 border border-gray-600">{w.email}</td>
                      <td className="p-3 border border-gray-600">{w.manager_name || "Not Assigned"}</td>
                      <td className="p-3 border border-gray-600">{w.client_name || "Not Assigned"}</td>
                      <td className="p-3 border border-gray-600">
                        <button
                          onClick={() => handleUpdate(w)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded-lg"
                        >
                          Change Manager
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center p-6 text-gray-400 border border-gray-600"
                    >
                      No workforce found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for updating Manager & Client */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-xl w-full max-w-lg text-white">
            <h2 className="text-xl font-bold mb-4">Update Workforce</h2>
            <p className="mb-2">Name: {selectedWorker.name}</p>

            <div className="mb-4">
              <label className="block mb-2">Manager:</label>
              <select
                className="w-full p-2 bg-gray-700 rounded"
                value={selectedManager}
                onChange={(e) => setSelectedManager(e.target.value)}
              >
                <option value="">Select Manager</option>
                {managers.length>0 && managers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-2">Client:</label>
              <select
                className="w-full p-2 bg-gray-700 rounded"
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
              >
                <option value="">Select Client</option>
                {clients.length>0 && clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
