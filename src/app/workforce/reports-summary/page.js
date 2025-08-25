"use client";
import { useState, useEffect } from "react";
import EditReportModal from "@/components/EditReportModal";

export default function ReportsPage() {
  const [status, setStatus] = useState("approved"); // default tab
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchReports = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/workforce/reports?status=${status}&workforceId=123`); // Replace with session ID
    const data = await res.json();
    setReports(data);
  };

  useEffect(() => {
    fetchReports();
  }, [status]);

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">My Reports</h1>
      
      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        {["approved", "rejected", "edit_requested"].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-2 rounded ${status === s ? "bg-blue-600" : "bg-gray-600"}`}
          >
            {s.replace("_", " ").toUpperCase()}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report.id} className="bg-gray-800 p-4 rounded shadow">
            <h2 className="text-lg font-semibold">{report.short_text}</h2>
            <p className="text-gray-400">{report.elaborated_text}</p>
            {report.image_url && (
              <img src={report.image_url} alt="Report" className="w-32 mt-2 rounded" />
            )}
            <p className="text-sm mt-1">Status: {report.status}</p>

            {report.status === "edit_requested" && (
              <button
                onClick={() => setSelectedReport(report)}
                className="bg-yellow-500 text-black px-4 py-2 mt-2 rounded"
              >
                Edit & Resubmit
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Modal for Edit */}
      {selectedReport && (
        <EditReportModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onUpdated={fetchReports}
        />
      )}
    </div>
  );
}
