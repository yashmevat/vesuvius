"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function UpdateManagerModal({ isOpen, onClose, manager }) {
  const [name, setName] = useState(manager?.name || "");
  const [email, setEmail] = useState(manager?.email || "");
  const [workforceLimit, setWorkforceLimit] = useState(manager?.workforce_limit || 0);

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/superadmin/managers/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: manager.id, name, email, workforceLimit: Number(workforceLimit) }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Manager updated");
        onClose();
      } else {
        toast.error(data.error || "Failed to update manager");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md text-white">
        <h2 className="text-xl font-bold mb-4">Update Manager</h2>

        <input
          type="text"
          className="w-full p-2 rounded bg-gray-700 mb-3"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          className="w-full p-2 rounded bg-gray-700 mb-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="number"
          className="w-full p-2 rounded bg-gray-700 mb-4"
          placeholder="Workforce Limit"
          value={workforceLimit}
          onChange={(e) => setWorkforceLimit(e.target.value)}
        />

        <div className="flex justify-end space-x-2">
          <button className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded" onClick={onClose}>
            Cancel
          </button>
          <button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded" onClick={handleSubmit}>
            Update
          </button>
        </div>
      </div>
    </div>
  );
}
