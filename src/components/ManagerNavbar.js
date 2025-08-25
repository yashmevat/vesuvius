"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, Menu } from "lucide-react";

export default function ManagerNavbar() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [managerId, setManagerId] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ✅ Fetch notifications from API
  async function fetchNotifications() {
    if (!managerId) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/manager/notification`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ managerId }),
        }
      );

      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }

  // ✅ Get manager ID from API
  useEffect(() => {
    const getManagerId = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/getuserid`
      );
      const idData = await res.json();
      setManagerId(idData?.id || null);
    };
    getManagerId();
  }, []);

  // ✅ Fetch notifications when managerId is ready
  useEffect(() => {
    if (managerId) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [managerId]);

  const handleLogout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/logout`, {
      method: "POST",
    });
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="min-h-[5vh] bg-gray-900 text-white">
      <nav className="bg-gray-800 px-6 py-3 flex justify-between items-center shadow-md relative">
        {/* Logo */}
        <h1 className="text-xl font-bold">Manager Dashboard 🚀</h1>

        {/* Right Section (Notification + Links + Menu) */}
        <div className="flex items-center gap-4">
          {/* Notification Bell (Visible on all screens) */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative focus:outline-none"
            >
              <Bell className="w-6 h-6 text-white hover:text-blue-400 transition" />
              {notifications.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-xs px-1.5 py-0.5 rounded-full">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white text-gray-800 rounded-xl shadow-2xl z-50">
                <div className="flex justify-between items-center px-4 py-2 border-b">
                  <h2 className="text-lg font-semibold">Notifications</h2>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✖
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n, i) => (
                      <div
                        key={i}
                        className="px-4 py-3 border-b last:border-none hover:bg-gray-100 transition"
                      >
                        <p className="text-sm">{n.message}</p>
                        <span className="text-xs text-gray-500">
                          {new Date(n.created_at).toLocaleString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="p-4 text-center text-gray-500">
                      No notifications
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/manager/dashboard"
              className="hover:text-blue-400 transition"
            >
              Dashboard
            </Link>
            <Link
              href="/manager/reports"
              className="hover:text-blue-400 transition"
            >
              Reports
            </Link>
            <Link
              href="/manager/reportsstatus"
              className="hover:text-blue-400 transition"
            >
              ReportsStatus
            </Link>
            <Link
              href="/manager/weeklyreport"
              className="hover:text-blue-400 transition"
            >
              WeeklyReport
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-800 px-6 py-4 space-y-3">
          <Link
            href="/manager/dashboard"
            className="block hover:text-blue-400 transition"
          >
            Dashboard
          </Link>
          <Link
            href="/manager/reports"
            className="block hover:text-blue-400 transition"
          >
            Reports
          </Link>
          <Link
            href="/manager/reportsstatus"
            className="block hover:text-blue-400 transition"
          >
            ReportsStatus
          </Link>
          <Link
            href="/manager/weeklyreport"
            className="block hover:text-blue-400 transition"
          >
            WeeklyReport
          </Link>
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
