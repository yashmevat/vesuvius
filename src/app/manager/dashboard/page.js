"use client";
import React, { useEffect, useState } from "react";
import ManagerNavbar from "@/components/ManagerNavbar";
import { EyeIcon, Check, Trash2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const StatCard = ({ title, value }) => {
  return (
    <div className="bg-gray-800 hover:bg-gray-700 transition duration-300 shadow-md rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-center">
      <h2 className="text-4xl font-extrabold text-green-400">{value}</h2>
      <h1 className="text-lg font-medium text-gray-300">{title}</h1>
    </div>
  );
};

const initStats = [
  { title: "Pending", value: 0 },
  { title: "Approved", value: 0 },
  { title: "Rejected", value: 0 },
  { title: "Workforce", value: 0 },
  { title: "Total Workforce", value: 0 },
];

const COLORS = ["#facc15", "#22c55e", "#ef4444", "#3b82f6"];

const ManagerDashboard = () => {
  const [reports, setReports] = useState([]);
  const [workforce, setWorkforce] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(initStats);
  const [totalWorkforce, setTotalWorkforce] = useState(0);

  const columns = [
    {
      title: "Workforce Name",
      dataIndex: "workforce_name",
      sort: (a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }),
    },
    { title: "Project Name", dataIndex: "project_name" },
    { title: "Work Title", dataIndex: "work_title" },
    { title: "Start Time", dataIndex: "start_time" },
    { title: "End Time", dataIndex: "end_time" },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <span
          className={`p-1.5 text-sm text-semibold rounded ${
            status == "approved" ? "bg-green-500" : "bg-yellow-600"
          }`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      ),
    },
    {
      title: "Actions",
      dataIndex: "id",
      render: (id, record) => {
        return (
          <div className="flex flex-row gap-2 w-full items-center">
            <span className="p-1 bg-amber-400 rounded">
              <EyeIcon size={19} />
            </span>
            <span className="p-1 bg-green-400 rounded">
              <Check size={19} />
            </span>
            <span className="p-1 bg-red-400 rounded">
              <Trash2 size={19} />
            </span>
          </div>
        );
      },
    },
  ];

  async function fetchStats(managerId) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/manager/reports/stats?managerId=` +
          managerId,
        { credentials: "include" }
      );
      const json = await res.json();
      setStats(() =>
        initStats.map((init) => {
          const found = json.stats.find(
            (s) => s.title?.toLowerCase() == init.title?.toLowerCase()
          );
          return found ? { ...init, value: found.value } : init;
        })
      );
    } catch (error) {
      console.log("error getting stats", error.message);
    }
  }

  async function fetchReports(status, managerId) {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/manager/reports?` +
          `managerId=${managerId}`,
        { credentials: "include" }
      );
      const json = await res.json();
      setReports(json.reports);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  async function fetchWorkforce(managerId) {
       try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/manager/getworkforce`,
        { credentials: "include",
          method:"POST",
          body:JSON.stringify({id:managerId})
         }
      );
      const json = await res.json();
      setWorkforce(json.workforceData);
      setTotalWorkforce(json.total);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  async function getUserID() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/getuserid`,
        { crendentials: "include" }
      );
      const json = await res.json();
      return json.id;
    } catch (error) {
      console.log("error getting userId", error.message);
    }
  }

  useEffect(() => {
    async function init() {
      const userId = await getUserID();
      await fetchReports("pending", userId);
      await fetchStats(userId);
      await fetchWorkforce(userId)
    }
    init();
  }, []);

  return (
   <div className="bg-gray-900 min-h-screen flex flex-col text-white">
  <ManagerNavbar />

  {/* Page Heading */}
  <header className="px-4 sm:px-6 lg:px-8 py-6 border-b border-gray-700">
    <h1 className="text-3xl font-extrabold text-green-400 text-center">
      Manager Dashboard
    </h1>
    <p className="text-gray-400 text-sm mt-1 text-center">
      Overview of reports, workforce, and performance metrics
    </p>
  </header>

  {/* Main Content */}
  <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
    <div className="w-full max-w-7xl flex flex-col gap-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((s, index) => {
          const value = s.title === "Workforce" ? workforce?.length : s.title === "Total Workforce" ? totalWorkforce : s.value;
          return (
            <StatCard title={s.title} value={value} key={`stat-card-${index}`} />
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4 text-green-400 text-center">
            Reports Overview
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats}>
              <XAxis dataKey="title" stroke="#ccc" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4 text-green-400 text-center">
            Reports Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats}
                dataKey="value"
                nameKey="title"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
              >
                {stats.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </main>
</div>



  );
};

export default ManagerDashboard;
