"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SuperAdminNavbar from "@/components/SuperadminNavbar";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";
import { MoreVertical } from "lucide-react";
 
// shadcn/ui dropdown (run: npx shadcn-ui@latest add dropdown-menu)
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
 
// your existing modals (unchanged)
import UpdateClientsModal from "@/components/UpdateClientsModal";
import UpdateWorkforceModal from "@/components/UpdateWorkforceModal";
import UpdateManagerModal from "@/components/UpdateManagerModal";
import DeleteManagerModal from "@/components/DeleteManagerModal";
 
export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [managers, setManagers] = useState([]);
  const [modalType, setModalType] = useState(null); // "clients" | "workforce" | "update" | "delete" | null
  const [selectedManager, setSelectedManager] = useState(null);
  const router = useRouter();
 
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/superadmin/stats`)
      .then(res => res.json())
      .then(data => setStats(data));
 
    fetchManagers();
  }, []);
 
  const fetchManagers = () => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/superadmin/managers/list`)
      .then((res) => res.json())
      .then((data) => setManagers(Array.isArray(data) ? data : []));
  };
 
  const openModal = (type, manager) => {
    setSelectedManager(manager);
    setModalType(type);
  };
 
  const closeModal = () => {
    fetchManagers();
    setModalType(null);
    setSelectedManager(null);
  };
 
  const donutData = [
    { name: "Managers", value: stats.managers || 0 },
    { name: "Workforce", value: stats.workforce || 0 },
    { name: "Clients", value: stats.clients || 0 },
    { name: "Pending Reports", value: stats.pendingReports || 0 },
  ];
 
  // If you have per-month data, replace this; for now just mirrors the stat totals as categories.
  const lineData = [
    { name: "Managers", value: stats.managers || 0 },
    { name: "Workforce", value: stats.workforce || 0 },
    { name: "Clients", value: stats.clients || 0 },
    { name: "Pending", value: stats.pendingReports || 0 },
  ];
 
  const COLORS = ["#6366F1", "#22C55E", "#FACC15", "#EF4444"];
 
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navbar */}
      <SuperAdminNavbar />
 
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-gray-400 mb-2">Total Managers</h2>
          <p className="text-3xl font-bold">{stats.managers || 0}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-gray-400 mb-2">Total Workforce</h2>
          <p className="text-3xl font-bold">{stats.workforce || 0}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-gray-400 mb-2">Total Clients</h2>
          <p className="text-3xl font-bold">{stats.clients || 0}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-gray-400 mb-2">Pending Reports</h2>
          <p className="text-3xl font-bold">{stats.pendingReports || 0}</p>
        </div>
      </div>
 
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* Donut Chart */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-gray-400 mb-4">Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                label
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
 
        {/* Line Chart */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-gray-400 mb-4">Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
 
      {/* Managers Table (Add Manager button removed) */}
      <div className="p-6">
        <div className="bg-gray-800 w-full p-8 rounded-2xl shadow-lg border border-gray-700 text-white">
          <h1 className="text-2xl font-bold mb-6 text-center">Managers</h1>
 
          {/* No "Add Manager" button here */}
 
          <div className="overflow-x-auto">
            <div className="max-h-[500px] overflow-y-auto rounded-lg border border-gray-700">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-gray-700 z-10">
                  <tr>
                    <th className="p-3 border-b border-gray-600 text-left">Name</th>
                    <th className="p-3 border-b border-gray-600 text-left">Email</th>
                    <th className="p-3 border-b border-gray-600 text-left">Clients</th>
                    <th className="p-3 border-b border-gray-600 text-left">Workforce Limit</th>
                    <th className="p-3 border-b border-gray-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {managers.length > 0 ? (
                    managers.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-700 transition-colors border-b border-gray-700">
                        <td className="p-3">{m.name}</td>
                        <td className="p-3">{m.email}</td>
                        <td className="p-3">
                          {m.client_names?.length ? m.client_names.join(", ") : "No Clients"}
                        </td>
                        <td className="p-3">{m.workforce_limit}</td>
                        <td className="p-3">
                          <div className="flex justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-2 rounded-md hover:bg-gray-700">
                                  <MoreVertical className="w-5 h-5 text-gray-300" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-gray-800 text-white border border-gray-700">
                                <DropdownMenuItem onClick={() => openModal("clients", m)}>
                                  Manage Clients
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openModal("workforce", m)}>
                                  Update Workforce Limit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openModal("update", m)}>
                                  Update Manager
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openModal("delete", m)} className="text-red-400 focus:text-red-400">
                                  Delete Manager
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
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
 
      {/* Modals */}
      {modalType === "clients" && selectedManager && (
        <UpdateClientsModal
          isOpen={true}
          onClose={closeModal}
          managerId={selectedManager.id}
          currentClients={selectedManager.client_ids}
          managerLimit={selectedManager.workforce_limit}
        />
      )}
      {modalType === "workforce" && selectedManager && (
        <UpdateWorkforceModal
          isOpen={true}
          onClose={closeModal}
          managerId={selectedManager.id}
          currentLimit={selectedManager.workforce_limit}
        />
      )}
      {modalType === "update" && selectedManager && (
        <UpdateManagerModal isOpen={true} onClose={closeModal} manager={selectedManager} />
      )}
      {modalType === "delete" && selectedManager && (
        <DeleteManagerModal isOpen={true} onClose={closeModal} manager={selectedManager} />
      )}
    </div>
  );
}