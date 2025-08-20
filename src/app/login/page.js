"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UserLogin() {
  const [form, setForm] = useState({ email: "", password: "", role: "" });
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/auth/user-login", {
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
  <form
    onSubmit={handleLogin}
    className="bg-gray-900/70 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-6 border border-gray-700"
  >
    {/* Title */}
    <h1 className="text-3xl font-bold text-center text-green-400 tracking-wide">
      Manager / Workforce Login
    </h1>

    {/* Email Input */}
    <input
      type="email"
      className="border border-gray-700 bg-gray-800 text-white p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 transition-all duration-300"
      placeholder="Email"
      onChange={(e) => setForm({ ...form, email: e.target.value })}
    />

    {/* Password Input */}
    <input
      type="password"
      className="border border-gray-700 bg-gray-800 text-white p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 transition-all duration-300"
      placeholder="Password"
      onChange={(e) => setForm({ ...form, password: e.target.value })}
    />

    {/* Role Dropdown */}
    <select
      className="border border-gray-700 bg-gray-800 text-white p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
      onChange={(e) => setForm({ ...form, role: e.target.value })}
    >
      <option value="">Select Role</option>
      <option value="manager">Manager</option>
      <option value="workforce">Workforce</option>
    </select>

    {/* Forgot Password */}
    <div className="text-right">
      <Link
        href="/auth/forgotpassword"
        className="text-sm text-green-500 hover:text-green-400 font-medium transition-colors duration-300 underline hover:underline-offset-2"
      >
        Forgot Password?
      </Link>
    </div>

    {/* Login Button */}
    <button
      type="submit"
      className="bg-green-500 hover:bg-green-600 transition-colors text-white px-4 py-3 rounded-lg w-full font-semibold shadow-md hover:shadow-lg focus:ring-2 focus:ring-green-400"
    >
      Login
    </button>
  </form>
</div>


  );
}
