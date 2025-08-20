"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SuperAdminNavbar() {
  const router = useRouter();
  
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
    });
    // Clear localStorage token if you use it
    localStorage.removeItem("token");
    router.push("/superadmin/login");
  };

  return (
<div className="min-h-[5vh] bg-gray-900 text-white">
      {/* Navbar */}
      <nav className="bg-gray-800 px-6 py-3 flex justify-between items-center shadow-md relative">
        <h1 className="text-xl font-bold">SuperAdmin Dashboard</h1>

        {/* Hamburger button (visible on mobile) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6 fill-current text-white"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M18.364 5.636a1 1 0 00-1.414-1.414L12 9.172 7.05 4.222a1 1 0 00-1.414 1.414L10.828 12l-5.192 5.192a1 1 0 001.414 1.414L12 14.828l4.95 4.95a1 1 0 001.414-1.414L13.172 12l5.192-5.192z"
              />
            ) : (
              <path
                fillRule="evenodd"
                d="M4 5h16v2H4V5zm0 6h16v2H4v-2zm0 6h16v2H4v-2z"
              />
            )}
          </svg>
        </button>

        {/* Links container */}
        <div
          className={`flex-col md:flex-row md:flex gap-4 items-center absolute md:static top-full left-0 w-full md:w-auto bg-gray-800 md:bg-transparent px-6 md:px-0 py-4 md:py-0 shadow-md md:shadow-none transition-transform transform ${
            isOpen ? "translate-y-0" : "-translate-y-[500px]"
          } md:translate-y-0 z-50`}
        >
          <Link
            href="/superadmin/dashboard"
            className="block hover:text-blue-400 transition"
            onClick={() => setIsOpen(false)}
          >
            dashboard
          </Link>
          <Link
            href="/superadmin/managers"
            className="block hover:text-blue-400 transition"
            onClick={() => setIsOpen(false)}
          >
            Managers
          </Link>
          <Link
            href="/superadmin/workforce"
            className="block hover:text-blue-400 transition"
            onClick={() => setIsOpen(false)}
          >
            Workforce
          </Link>
          <Link
            href="/superadmin/clients"
            className="block hover:text-blue-400 transition"
            onClick={() => setIsOpen(false)}
          >
            Clients
          </Link>
          <Link
            href="/superadmin/reports"
            className="block hover:text-blue-400 transition"
            onClick={() => setIsOpen(false)}
          >
            Reports
          </Link>
          <button
            onClick={() => {
              setIsOpen(false);
              handleLogout();
            }}
            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition w-full md:w-auto text-left md:text-center"
          >
            Logout
          </button>
        </div>
      </nav>
    </div>

  );
}
