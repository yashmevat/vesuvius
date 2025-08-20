"use client";
import SuperAdminNavbar from "@/components/SuperadminNavbar";
import { useEffect, useState } from "react";
 
export default function SuperAdminReports() {
  const [reports, setReports] = useState([]);
 
  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch("/api/superadmin/reports");
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
                      <br />
                      {/* <span className="text-sm text-gray-400">
                        {report.manager_email}
                      </span> */}
                    </td>
                    <td className="px-6 py-4 text-gray-200">
                      {report.client_name}
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={report.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 text-sm rounded-lg bg-blue-600 hover:bg-blue-500 transition text-white shadow-md"
                      >
                        View PDF
                      </a>
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
      </div>
    </div>
  );
 
}