"use client";
import SuperAdminNavbar from "@/components/SuperadminNavbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Users, Edit, Trash2 } from "lucide-react";
import UpdateClientsModal from "@/components/UpdateClientsModal";
import UpdateWorkforceModal from "@/components/UpdateWorkforceModal";
import UpdateManagerModal from "@/components/UpdateManagerModal";
import DeleteManagerModal from "@/components/DeleteManagerModal";
import Link from "next/link";

export default function ManagersList() {
  const [managers, setManagers] = useState([]);
  const [modalType, setModalType] = useState(null); // clients, workforce, update, delete
  const [selectedManager, setSelectedManager] = useState(null);
  const router = useRouter();

  const fetchManagers = () => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/superadmin/managers/list`)
      .then((res) => res.json())
      .then((data) => setManagers(data));
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const openModal = (type, manager) => {
    setSelectedManager(manager);
    setModalType(type);
  };

  const closeModal = () => {
    fetchManagers();
    setModalType(null);
    setSelectedManager(null);
  };

  return (
    <div>
  <SuperAdminNavbar />
  <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 sm:p-6">
    <div className="bg-gray-800 w-full max-w-6xl p-4 sm:p-8 rounded-2xl shadow-lg border border-gray-700 text-white">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Managers</h1>

      {/* Add Manager Button */}
      <div className="flex justify-end mb-4">
        <Link
          href="/superadmin/managers/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-2 rounded-lg shadow transition text-sm sm:text-base"
        >
          + Add Manager
        </Link>
      </div>

      {/* ✅ Scrollable & Responsive Table */}
      <div className="overflow-x-auto">
        <div className="max-h-[70vh] custom-scrollbar overflow-y-auto rounded-lg border border-gray-700">
          <table className="w-full border-collapse text-sm sm:text-base">
            <thead className="sticky top-0 bg-gray-700 z-10">
              <tr>
                <th className="p-3 border-b border-gray-600 text-left">Name</th>
                <th className="p-3 border-b border-gray-600 text-left">Email</th>
                <th className="p-3 border-b border-gray-600 text-left">Clients</th>
                <th className="p-3 border-b border-gray-600 text-left">Workforce Limit</th>
                <th className="p-3 border-b border-gray-600 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {managers.length > 0 ? (
                managers.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-gray-700 transition-colors border-b border-gray-700"
                  >
                    <td className="p-3">{m.name}</td>
                    <td className="p-3">{m.email}</td>
                    <td className="p-3">
                      {m.client_names?.length ? m.client_names.join(", ") : "No Clients"}
                    </td>
                    <td className="p-3">{m.workforce_limit}</td>
                    <td className="p-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => openModal("clients", m)}
                        className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded-lg text-xs sm:text-sm"
                      >
                        Clients
                      </button>
                      <button
                        onClick={() => openModal("workforce", m)}
                        className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded-lg text-black text-xs sm:text-sm flex items-center gap-1"
                      >
                        <PlusCircle size={14} /> Workforce
                      </button>
                      <button
                        onClick={() => openModal("update", m)}
                        className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-lg text-xs sm:text-sm flex items-center gap-1"
                      >
                        <Edit size={14} /> Update
                      </button>
                      <button
                        onClick={() => openModal("delete", m)}
                        className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg text-xs sm:text-sm flex items-center gap-1"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center p-4 text-gray-400">
                    No managers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  {/* ✅ Modals */}
  {modalType === "clients" && (
    <UpdateClientsModal
      isOpen={true}
      onClose={closeModal}
      managerId={selectedManager.id}
      currentClients={selectedManager.client_ids}
      managerLimit={selectedManager.workforce_limit}
    />
  )}
  {modalType === "workforce" && (
    <UpdateWorkforceModal
      isOpen={true}
      onClose={closeModal}
      managerId={selectedManager.id}
      currentLimit={selectedManager.workforce_limit}
    />
  )}
  {modalType === "update" && (
    <UpdateManagerModal isOpen={true} onClose={closeModal} manager={selectedManager} />
  )}
  {modalType === "delete" && (
    <DeleteManagerModal isOpen={true} onClose={closeModal} manager={selectedManager} />
  )}
</div>


  );
}
