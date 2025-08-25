"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Eye, EyeClosed, EyeSlash } from "phosphor-react";

export default function UserLogin() {
  const [form, setForm] = useState({ email: "", password: "", role: "" });
  
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/user-login`, {
      method: "POST",
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.id)
      if (data.role === "manager") {
        router.push("/manager/dashboard");
      } else {
        router.push("/workforce/dashboard");
      }
    } else {
      alert(data.error);
    }
  };

  return (
<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
  <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700 p-8">
    
    {/* Title */}
    <h1 className="text-3xl font-extrabold text-center text-green-400 tracking-wide mb-6">
      Manager / Workforce Login
    </h1>

    <form onSubmit={handleLogin} className="space-y-5">
      
      {/* Email Input */}
      <input
        type="email"
        className="border border-gray-700 bg-gray-800/90 text-white p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 transition-all duration-300"
        placeholder="Enter your email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      {/* Password Input */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="border border-gray-700 bg-gray-800/90 text-white p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 transition-all duration-300"
              placeholder="Enter your password"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
            >
              {showPassword ? (
                <Eye size={22} />
              ) : (
                <EyeClosed size={22} />
              )}
            </button>
          </div>

      {/* Role Dropdown */}
      <select
        className="border border-gray-700 bg-gray-800/90 text-white p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
        onChange={(e) => setForm({ ...form, role: e.target.value })}
      >
        <option value="">Select Role</option>
        <option value="manager">Manager</option>
        <option value="workforce">Workforce</option>
      </select>

      {/* Login Buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 transition-colors duration-300 text-white px-4 py-3 rounded-lg w-full font-semibold shadow-md hover:shadow-green-500/30 focus:ring-2 focus:ring-green-400"
        >
          Login
        </button>
      </div>
    </form>

    {/* Forgot Password & Super Admin Login */}
    <div className="flex flex-col items-center mt-6 space-y-3">
      <Link
        href="/auth/forgotpassword"
        className="relative text-green-400 hover:text-green-300 text-sm font-medium transition-all duration-300 after:content-[''] after:absolute after:w-0 after:h-[2px] after:bg-green-400 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full"
      >
        Forgot Password?
      </Link>
      <Link
        href="/superadmin/login"
        className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-all duration-300"
      >
        Super Admin Login
      </Link>
    </div>
  </div>
</div>





  );
}
