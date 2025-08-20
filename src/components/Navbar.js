"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react"; // ✅ Import these icons

const Navbar = () => {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const tabs = [
        { name: "Dashboard", href: "/workforce/dashboard" },
        { name: "Reports", href: "/workforce/reports" },
        { name: "Status", href: "/workforce/status" },
        { name: "Reports Summary", href: "/workforce/reports-summary" },
    ];

    const router = useRouter();

    const handleLogout = async () => {
        await fetch("/api/auth/logout", {
            method: "POST",
        });
        // Clear localStorage token if you use it
        localStorage.removeItem("token");
        router.push("/login");
    };

    return (
        <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-700 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-14">

                    {/* Logo */}
                    <div className="flex items-center text-xl font-bold text-green-400">
                        Workforce Dashboard
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden sm:flex sm:space-x-8 ">
                        {tabs.map((tab) => {
                            const isActive = pathname === tab.href;
                            return (
                                <Link
                                    key={tab.name}
                                    href={tab.href}
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isActive
                                        ? "border-green-500 text-green-400"
                                        : "border-transparent text-gray-300 hover:text-white hover:border-gray-500"
                                        }`}
                                >
                                    {tab.name}
                                </Link>
                            );
                        })}
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition text-white"
                        >
                            Logout
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center sm:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-300 hover:text-white focus:outline-none"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="sm:hidden px-2 pt-2 pb-3 space-y-1 bg-gray-900/95 backdrop-blur-md border-t border-gray-700">
                    {tabs.map((tab) => {
                        const isActive = pathname === tab.href;
                        return (
                            <Link
                                key={tab.name}
                                href={tab.href}
                                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive
                                    ? "bg-green-500 text-white"
                                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                    }`}
                                onClick={() => setIsOpen(false)}
                            >
                                {tab.name}
                            </Link>
                        );
                    })}
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition"
                    >
                        Logout
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
