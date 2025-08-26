"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import EditReportModal from "@/components/EditReportModal";
import Navbar from "@/components/Navbar";

function ReportsContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("approved"); // Default tab
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for pending parameter in URL
  useEffect(() => {
    const pendingParam = searchParams.get('pending');
    if (pendingParam === 'true') {
      setStatus('pending');
    }
  }, [searchParams]);

  // ✅ Fetch user ID first
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const idRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/getuserid`);
        const idData = await idRes.json();
        setUserId(idData.id);
      } catch (err) {
        console.error("Error loading workforce:", err);
      }
    };
    fetchUserId();
  }, []);

  // ✅ Fetch reports only when userId is available
  const fetchReports = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/workforce/reports?status=${status}&workforceId=${userId}`);
      const data = await res.json();
      setReports(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [status, userId]);

  return (
<div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white ">
  <Navbar />

  {/* Heading */}
  <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-green-400 text-center">
    My Reports
  </h1>

  {/* Tabs */}
  <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-6 md:mb-8">
    {["approved", "rejected", "edit_requested", "pending"].map((s) => (
      <button
        key={s}
        onClick={() => setStatus(s)}
        className={`px-4 md:px-6 py-2 rounded-lg font-semibold text-sm md:text-base transition-all border 
          ${status === s
            ? "bg-green-500 text-white border-green-400"
            : "bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700"
          }`}
      >
        {s.replace("_", " ").toUpperCase()}
      </button>
    ))}
  </div>

  {/* Loading */}
  {loading && <p className="text-gray-400 text-center">Loading reports...</p>}

  {/* Reports List */}
  <div className="space-y-6 max-w-5xl mx-auto w-full">
    {reports.length === 0 && !loading && (
      <p className="text-gray-400 text-center">No reports found for this status.</p>
    )}

    {reports.map((report) => (
      <div
        key={report.id}
        className="bg-gray-900/60 backdrop-blur-md p-4 md:p-6 rounded-xl border border-gray-700 shadow-lg"
      >
        {/* Title */}
        <h2 className="text-lg md:text-xl font-semibold text-green-400 mb-2">
          {report.short_text}
        </h2>

        {/* Elaborated Text */}
        <p className="text-gray-300 mb-4 text-sm md:text-base">{report.elaborated_text}</p>

        {/* Image */}
        {report.image_url && (
          <img
            src={report.image_url}
            alt="Report"
            className="w-32 md:w-40 rounded-lg border border-gray-700 mb-4"
          />
        )}
        {report.image_text && (
          <p className="text-gray-300 mb-4 text-sm md:text-base">{report.image_text}</p>
        )}
        {report.image_url2 && (
          <img
            src={report.image_url2}
            alt="Report"
            className="w-32 md:w-40 rounded-lg border border-gray-700 mb-4"
          />
        )}
        {report.image_text2 && (
          <p className="text-gray-300 mb-4 text-sm md:text-base">{report.image_text2}</p>
        )}
        {/* Remarks */}
        {(report.status === "edit_requested" || report.status === "rejected") && (
          <p className="text-sm mb-2">
            <span className="font-semibold text-red-500">Remarks:</span>{" "}
            <span className="text-gray-300">{report.remarks}</span>
          </p>
        )}

        {/* Status */}
        <p className="text-sm mb-4">
          Status:{" "}
          <span
            className={`font-semibold ${report.status === "approved"
                ? "text-green-400"
                : report.status === "pending"
                  ? "text-yellow-400"
                  : "text-red-400"
              }`}
          >
            {report.status.replace("_", " ")}
          </span>
        </p>
        {report.pdf_url && (
          <p className="text-sm mb-4">
            <span className="font-semibold text-blue-500">Weekly Report:</span>{" "}
            <a href={report.pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
              View Weekly Report
            </a>
          </p>
        )}

        {/* Edit Button */}
        {report.status === "edit_requested" && (
          <button
            onClick={() => setSelectedReport(report)}
            className="bg-yellow-500 text-black px-3 md:px-4 py-2 rounded-lg hover:bg-yellow-600 font-semibold transition-all text-sm md:text-base"
          >
            Edit & Resubmit
          </button>
        )}
      </div>
    ))}
  </div>

  {/* Edit Modal */}
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

export default function ReportsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    }>
      <ReportsContent />
    </Suspense>
  );
}
