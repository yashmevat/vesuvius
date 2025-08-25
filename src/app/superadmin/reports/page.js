"use client";
import SuperAdminNavbar from "@/components/SuperadminNavbar";
import { useEffect, useState } from "react";
 
export default function SuperAdminReports() {
  const [reports, setReports] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);
 
  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/superadmin/reports`);
        const data = await res.json();
        setReports(data);
      } catch (err) {
        console.error("Error fetching reports:", err);
      }
    }
    fetchReports();
  }, []);
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
      <SuperAdminNavbar />
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-100 tracking-wide">
          📑 Weekly Reports
        </h1>
 
        <div className="overflow-hidden rounded-2xl shadow-xl bg-gray-800/60 backdrop-blur-md border border-gray-700">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900/60 text-gray-300 text-sm uppercase tracking-wider">
                <th className="px-6 py-3">Manager</th>
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3">PDF</th>
                <th className="px-6 py-3">Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {reports.length > 0 ? (
                reports.map((report, idx) => (
                  <tr
                    key={idx}
                    className={`${
                      idx % 2 === 0 ? "bg-gray-800/40" : "bg-gray-700/40"
                    } hover:bg-gray-700/70 transition`}
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-100">
                        {report.manager_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-200">
                      {report.client_name}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedPdf(report.pdf_url)}
                        className="px-3 py-1 text-sm rounded-lg bg-blue-600 hover:bg-blue-500 transition text-white shadow-md"
                      >
                        View PDF
                      </button>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {new Date(report.submitted_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center py-6 text-gray-400 text-sm"
                  >
                    No reports found 📭
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
 
        {/* PDF Modal */}
        {selectedPdf && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
            <div className="bg-gray-900 rounded-lg shadow-lg w-11/12 h-5/6 relative">
              {/* Close button */}
              <button
                onClick={() => setSelectedPdf(null)}
                className="absolute top-3 right-3 px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-md"
              >
                ✕
              </button>
 
              {/* PDF viewer */}
              <iframe
                src={selectedPdf}
                className="w-full h-full rounded-b-lg"
                frameBorder="0"
              ></iframe>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
 