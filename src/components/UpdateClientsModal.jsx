"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function UpdateClientsModal({ managerId, currentClients, managerLimit, isOpen, onClose }) {
    const [clients, setClients] = useState([]);
    const [selectedClients, setSelectedClients] = useState([]);
    const [totalAssigned, setTotalAssigned] = useState(0);

    useEffect(() => {
        // Load all clients
        fetch("/api/superadmin/clients/list")
            .then((res) => res.json())
            .then((data) => setClients(data));

        // Initialize selectedClients with currentClients (including existing workforce limits)
        const selected = Array.isArray(currentClients)
            ? currentClients.map(c => ({
                clientId: Number(c.clientId),
                workforce_limit: Number(c.workforce_limit) || 0
            }))
            : [];

        setSelectedClients(selected);
    }, [currentClients]);

    // Recalculate total workforce assigned whenever selectedClients changes
    useEffect(() => {
        const total = selectedClients.reduce((sum, c) => sum + c.workforce_limit, 0);
        setTotalAssigned(total);
    }, [selectedClients]);

    // Handle checkbox toggle
    const handleCheckboxChange = (clientId) => {
        const exists = selectedClients.find(c => c.clientId === clientId);
        if (exists) {
            setSelectedClients(selectedClients.filter(c => c.clientId !== clientId));
        } else {
            setSelectedClients([...selectedClients, { clientId, workforce_limit: 0 }]);
        }
    };

    // Handle workforce limit input
    const handleWorkforceChange = (clientId, value) => {
        setSelectedClients(selectedClients.map(c =>
            c.clientId === clientId ? { ...c, workforce_limit: Number(value) || 0 } : c
        ));
    };

    // Submit updated data
    const handleSubmit = async () => {
        // Validate workforce limit
        if (totalAssigned > managerLimit) {
            toast.error(`Total assigned workforce (${totalAssigned}) exceeds manager limit (${managerLimit})`);
            return;
        }

        try {
            const res = await fetch("/api/superadmin/managers/update-clients", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ managerId, clients: selectedClients }),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success(data.message || "Clients updated successfully");
                onClose();
            } else {
                toast.error(data.error || "Failed to update clients");
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
                <h2 className="text-xl font-bold mb-4">Update Clients & Workforce Limits</h2>

                <p className="text-sm mb-2">
                    Manager Limit: <span className="font-bold">{managerLimit}</span> | Assigned:{" "}
                    <span className={totalAssigned > managerLimit ? "text-red-400" : "text-green-400"}>
                        {totalAssigned}
                    </span>
                </p>

                <div className="max-h-64 overflow-y-auto mb-4 space-y-2">
                    {clients.map((client) => {
                        const selected = selectedClients.find(c => c.clientId === client.id);
                        return (
                            <div key={client.id} className="flex items-center justify-between">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="mr-2"
                                        checked={!!selected}
                                        onChange={() => handleCheckboxChange(client.id)}
                                    />
                                    {client.name}
                                </label>

                                {selected && (
                                    <input
                                        type="number"
                                        className="ml-4 w-20 p-1 rounded border-white"
                                        value={selected.workforce_limit}
                                        onChange={(e) => handleWorkforceChange(client.id, e.target.value)}
                                        placeholder="Limit"
                                        min="0"
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-end space-x-2">
                    <button
                        className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
                        onClick={handleSubmit}
                    >
                        Update
                    </button>
                </div>
            </div>
        </div>
    );
}
