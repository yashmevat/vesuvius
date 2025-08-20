"use client";

import toast from "react-hot-toast";

export default function DeleteManagerModal({ isOpen, onClose, manager }) {
  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/superadmin/managers/delete/${manager.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Manager deleted");
        onClose();
      } else {
        toast.error(data.error || "Failed to delete manager");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md text-white">
        <h2 className="text-xl font-bold mb-4">Delete Manager</h2>
        <p>Are you sure you want to delete <strong>{manager.name}</strong>?</p>

        <div className="flex justify-end space-x-2 mt-4">
          <button className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded" onClick={onClose}>
            Cancel
          </button>
          <button className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
