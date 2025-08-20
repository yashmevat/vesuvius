"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SuperAdminNavbar from "@/components/SuperadminNavbar";

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const router = useRouter();

  useEffect(() => {
    fetch("/api/superadmin/stats")
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
    });
    // Clear localStorage token if you use it
    localStorage.removeItem("token");
    router.push("/superadmin/login");
  };

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
</div>

  );
}
