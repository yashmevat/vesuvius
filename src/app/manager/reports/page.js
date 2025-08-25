"use client";
import ManagerNavbar from "@/components/ManagerNavbar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

function ReportCard({ report, handleUpdateStatus }) {
  const [expanded, setExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);  
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState({ ...report });
  const maxLength = 100;
  const isLong = report.elaborated_text.length > maxLength;

  const handleSave = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/reports/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    });

    if (res.ok) {
      alert("Report updated successfully ✅");
      setShowEdit(false);
      // Refresh reports list
      window.location.reload();
    } else {
      alert("Failed to update report ❌");
    }
  } catch (error) {
    console.error("Error updating report:", error);
  }
};

const handleChange = (e) => {
  const { name, value } = e.target;
  setEditData((prev) => ({ ...prev, [name]: value }));
};

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
              className={`capitalize px-2 py-1 rounded text-white text-xs ${report.status === "approved"
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

        {/* 🔹 Open Modal Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded shadow transition-colors duration-200 mt-2"
        >
          Click to view image
        </button>

        {/* 🔹 Modal */}
        {isOpen && (
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="shadow-lg p-4 max-w-lg relative"
            >
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute -top-10 -right-7 bg-black/70 rounded-full p-2 hover:bg-red-600 transition"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* Image Preview */}
              <img
                src={report.image_url}
                alt="Report Preview"
                className="max-h-[80vh] object-contain"
              />
            </div>
          </div>
        )}
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
      {/* Edit Button */}
      <button
        onClick={() => setShowEdit(true)}
        className=" bg-blue-500 hover:bg-blue-400 text-white px-3 py-1 rounded"
      >
        Edit
      </button>

      {/* Modal Popup */}
      {showEdit && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white text-black p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit Report</h2>

            <div className="mb-3">
              <label className="block mb-1 font-bold">Short Text</label>
            <input
              type="text"
              name="short_text"
              value={editData.short_text}
              onChange={handleChange}
              className="border px-3 py-2 w-full mb-3 rounded"
              placeholder="Short Text"
            />
            </div>

            <div className="mb-3">
              <label className="block mb-1 font-bold">Elaborated Text</label>
              <textarea
                name="elaborated_text"
                value={editData.elaborated_text}
                onChange={handleChange}
                className="border px-3 py-2 w-full mb-3 rounded"
              rows="3"
              placeholder="Elaborated Text"
            />
            </div>

            <div className="mb-3">
              <label className="block mb-1 font-bold">Workforce Name</label>
              <input
                type="text"
                name="workforce_name"
                value={editData.workforce_name}
                onChange={handleChange}
                className="border px-3 py-2 w-full mb-3 rounded"
              />
            </div>

            <div className="mb-3">
              <label className="block mb-1 font-bold">Client Name</label>
              <input
                type="text"
                name="client_name"
                value={editData.client_name}
                onChange={handleChange}
              className="border px-3 py-2 w-full mb-3 rounded"
              placeholder="Client"
            />
            </div>

            <div className="mb-3">
              <label className="block mb-1 font-bold">Status</label>
            <select
              name="status"
              value={editData.status}
              onChange={handleChange}
              className="border px-3 py-2 w-full mb-3 rounded"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="edit_requested">Edit Requested</option>
            </select>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowEdit(false)}
                className="px-3 py-1 rounded bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 rounded bg-blue-600 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
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
    const idRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/getuserid`);
    const idData = await idRes.json();
    setManagerId(idData);
  };

  // Fetch Reports
  const fetchReports = async (statusFilter = "") => {
    if (!managerId?.id) return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_PATH}/api/manager/reports?managerId=${managerId.id}&status=${statusFilter}`
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

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/manager/update-report-status`, {
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
            ${status === ""
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


