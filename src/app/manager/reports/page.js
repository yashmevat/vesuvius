"use client";
import ManagerNavbar from "@/components/ManagerNavbar";
import Link from "next/link";
import { useEffect, useState } from "react";

function ReportCard({ report, handleUpdateStatus }) {
  const [expanded, setExpanded] = useState(false);
  const maxLength = 100;
  const isLong = report.elaborated_text.length > maxLength;

  return (
    <li className="bg-gray-800 p-4 rounded-lg shadow-lg hover:shadow-xl transition flex flex-col justify-between h-[30vh] overflow-auto custom-scrollbar">
      <div>
        <p className="text-lg font-semibold">{report.short_text}</p>

        {/* Read More / Less */}
        <p className="text-gray-300 mt-2 text-sm">
          {expanded
            ? report.elaborated_text
            : report.elaborated_text.slice(0, maxLength) + (isLong ? "..." : "")}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-blue-400 hover:text-blue-300 mt-1 text-xs"
          >
            {expanded ? "Read Less" : "Read More"}
          </button>
        )}

        <div className="mt-3 text-sm">
          <p><b>Workforce:</b> {report.workforce_name}</p>
          <p><b>Client:</b> {report.client_name}</p>
          <p>
            <b>Status:</b>{" "}
            <span
              className={`capitalize px-2 py-1 rounded text-white text-xs ${
                report.status === "approved"
                  ? "bg-green-600"
                  : report.status === "rejected"
                  ? "bg-red-600"
                  : report.status === "edit_requested"
                  ? "bg-blue-600"
                  : "bg-yellow-600"
              }`}
            >
              {report.status}
            </span>
          </p>

          {/* Show Remarks if any */}
          {(report.status === "rejected" || report.status === "edit_requested") &&
            report.remarks && (
              <p className="text-red-400 mt-2">
                <b>Remarks:</b> {report.remarks}
              </p>
            )}
        </div>

        <Link
          href={report.image_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded shadow transition-colors duration-200 mt-2"
        >
          Click to view image
        </Link>
      </div>

      {/* Action Buttons */}
      {report.status === "pending" && (
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => handleUpdateStatus(report.id, "approved")}
            className="bg-green-500 hover:bg-green-400 text-white px-3 py-1 rounded"
          >
            Approve
          </button>
          <button
            onClick={() => handleUpdateStatus(report.id, "rejected")}
            className="bg-red-500 hover:bg-red-400 text-white px-3 py-1 rounded"
          >
            Reject
          </button>
          <button
            onClick={() => handleUpdateStatus(report.id, "edit_requested")}
            className="bg-yellow-500 hover:bg-yellow-400 text-black px-3 py-1 rounded"
          >
            Request Edit
          </button>
        </div>
      )}
    </li>
  );
}

export default function ManagerReports() {
  const [reports, setReports] = useState([]);
  const [managerId, setManagerId] = useState();

  // Fetch Manager ID
  const getManagerId = async () => {
    const idRes = await fetch("/api/auth/getuserid");
    const idData = await idRes.json();
    setManagerId(idData);
  };

  // Fetch Reports
  const fetchReports = async (statusFilter = "") => {
    if (!managerId?.id) return;

    const res = await fetch(
      `/api/manager/reports?managerId=${managerId.id}&status=${statusFilter}`
    );
    if (!res.ok) {
      console.error("Error fetching reports:", res.status);
      return;
    }
    const data = await res.json();
    setReports(data.reports);
  };

  // Update Status (with Remarks for reject/edit)
  const handleUpdateStatus = async (reportId, status) => {
    let remarks = null;

    if (status === "rejected" || status === "edit_requested") {
      remarks = prompt(`Enter remarks for ${status.replace("_", " ")}`);
      if (!remarks) {
        alert("Remarks are required for this action!");
        return;
      }
    }

    const res = await fetch("/api/manager/update-report-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, status, remarks }),
    });

    if (res.ok) {
      fetchReports(); // Refresh list after update
    } else {
      console.error("Failed to update status");
    }
  };

  useEffect(() => {
    getManagerId();
  }, []);

  useEffect(() => {
    if (managerId?.id) {
      fetchReports();
    }
  }, [managerId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
  <ManagerNavbar />

  {/* Header */}
  <div className="text-center py-6">
    <h2 className="text-3xl font-bold text-green-400 drop-shadow-lg">
      Manager Reports
    </h2>
    <p className="text-gray-400 mt-2 text-sm">
      Review, approve or request edits on submitted reports
    </p>
  </div>

  {/* Filter Buttons */}
  <div className="flex flex-wrap justify-center gap-3 mb-8 px-4">
    {["", "pending", "approved", "rejected", "edit_requested"].map(
      (status) => (
        <button
          key={status || "all"}
          onClick={() => fetchReports(status)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold shadow-md transition-all duration-300 
            ${
              status === ""
                ? "bg-gray-700 hover:bg-gray-600"
                : status === "pending"
                ? "bg-yellow-500 hover:bg-yellow-400 text-black"
                : status === "approved"
                ? "bg-green-500 hover:bg-green-400"
                : status === "rejected"
                ? "bg-red-500 hover:bg-red-400"
                : "bg-blue-500 hover:bg-blue-400"
            }`}
        >
          {status === "" ? "All" : status.replace("_", " ").toUpperCase()}
        </button>
      )
    )}
  </div>

  {/* Reports List */}
<div className="max-w-7xl mx-auto px-4 overflow-y-auto max-h-[70vh] custom-scrollbar">
  <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {reports.length > 0 ? (
      reports.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          handleUpdateStatus={handleUpdateStatus}
        />
      ))
    ) : (
      <p className="text-gray-400 text-center col-span-full">
        No reports available.
      </p>
    )}
  </ul>
</div>

</div>

  );
}
