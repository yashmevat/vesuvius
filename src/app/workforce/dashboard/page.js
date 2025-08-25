"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import WorkforceReportForm from "../reports/page";

let userId = null;

// Reusable Stat Card
const StatCard = ({ title, value }) => {
  return (
    <div className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 rounded-xl shadow-lg p-4 sm:p-6 flex flex-col items-center justify-center text-center
                    transform transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer w-full sm:w-64 min-h-[140px]">
      {/* Title */}
      <h1 className="text-xs sm:text-sm md:text-lg font-medium text-gray-300 tracking-wide mb-2">
        {title}
      </h1>

      {/* Value */}
      <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-blue-400">
        {value}
      </h2>

      {/* Decorative line */}
      <div className="mt-3 w-12 sm:w-16 h-1 bg-blue-400 rounded-full"></div>
    </div>
  );
};

const initStats = [
  { title: "Pending", value: 0 },
  { title: "Approved", value: 0 },
  { title: "Rejected", value: 0 },
];

const WorkForceDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(initStats);

  async function fetchStats(workforceId) {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/workforce/reports/stats?workforceId=` +
          workforceId,
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
    } finally {
      setLoading(false);
    }
  }

  async function getUserID() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/getuserid`,
        {
          credentials: "include",
        }
      );
      const json = await res.json();
      userId = json.id;
    } catch (error) {
      console.log("error getting userId", error.message);
    }
  }

  useEffect(() => {
    async function init() {
      await getUserID();
      await fetchStats(userId);
    }
    init();
  }, []);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <Navbar />
      <main className="px-3 sm:px-6 lg:px-8 flex flex-col gap-8">
        {/* Stats Section */}
        <div className="mt-8 flex justify-center">
          {loading ? (
            <div className="text-gray-300 text-lg animate-pulse">
              Loading stats...
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 w-full max-w-6xl">
              {/* Total Reports */}
              <StatCard
                title="Total Reports Submitted"
                value={stats.reduce((acc, s) => acc + (s.value || 0), 0)}
              />

              {/* Individual Stats */}
              {stats.map((s, index) => (
                <StatCard {...s} key={`stat-card-${index}`} />
              ))}
            </div>
          )}
        </div>

        {/* Charts Section */}
        {!loading && stats.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 w-full max-w-6xl mx-auto">
            {/* Bar Chart */}
            <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg">
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                Reports Distribution
              </h2>
              <div className="w-full h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats}>
                    <XAxis dataKey="title" stroke="#ccc" />
                    <YAxis stroke="#ccc" />
                    <Tooltip />
                    <Bar
                      dataKey="value"
                      fill="#3b82f6"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg">
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                Reports Breakdown
              </h2>
              <div className="w-full h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats}
                      dataKey="value"
                      nameKey="title"
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      fill="#8884d8"
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
        )}
      </main>
    </div>
  );
};

export default WorkForceDashboard;
