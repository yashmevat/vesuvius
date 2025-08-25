"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import { useSearchParams } from "next/navigation";
export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password,token }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message||"Password Reset Success")
      } else {
        toast.error(`❌ ${data.message || "password reset unsuccess"}`);
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Error resetting password. Try again later.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="bg-gray-900/60 backdrop-blur-lg p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-700 text-white">
        <h2 className="text-2xl font-bold mb-6 text-green-400 text-center">
          Reset Password
        </h2>

        <form onSubmit={handleForgotPassword} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block mb-2 font-medium">Enter New Password</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your new password"
              className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-3 rounded-lg shadow-md transition-colors disabled:opacity-50"
          >
            {loading ? "Sending..." : "Change Password"}
          </button>
        </form>

        {/* Message */}
        {/* {message && (
          <p className="mt-4 text-center text-sm text-gray-300">{message}</p>
        )} */}
      </div>
    </div>
  );
}
