"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

export default function SuperadminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/superadmin-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("Login response:", res.status, data);

      if (res.ok) {
        localStorage.setItem("token", data.token);
        toast.success(toast.message||"superadmin logged in success")
        router.push("/superadmin/dashboard");
      } else {
        toast.error(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong");
    }
  };

  return (
  <form
  onSubmit={handleLogin}
  className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6"
>
  <div className="bg-gray-900/60 backdrop-blur-lg p-8 rounded-xl shadow-lg w-full max-w-sm border border-gray-700 text-white">
    
    {/* Title */}
    <h1 className="text-2xl font-bold mb-6 text-green-400 text-center">Superadmin Login</h1>
    
    {/* Email Input */}
    <input
      className="w-full p-3 mb-4 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
      placeholder="Email"
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />
    
    {/* Password Input */}
    <input
      className="w-full p-3 mb-6 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
      placeholder="Password"
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />
    
    {/* Login Button */}
    <button
      type="submit"
      className="w-full bg-green-500 hover:bg-green-600 transition-colors text-white py-3 rounded-lg font-semibold shadow-md"
    >
      Login
    </button>

    {/* User Login Link */}
    <div className="text-center mt-6">
      <Link
        href="/login"
        className="relative text-green-400 hover:text-green-300 text-sm font-medium transition-all duration-300 after:content-[''] after:absolute after:w-0 after:h-[2px] after:bg-green-400 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full"
      >
        Go to User Login →
      </Link>
    </div>
  </div>
</form>


  );
}
