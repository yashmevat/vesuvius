"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
   <div className="flex items-center justify-center min-h-screen bg-gray-900 p-6">
  <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md p-8 rounded-xl shadow-lg w-80 text-center border border-gray-700 text-white">
    <h1 className="text-3xl font-bold mb-8 text-green-400">Welcome</h1>

    <button
      onClick={() => router.push("/superadmin/login")}
      className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-4 py-3 rounded w-full mb-5 font-semibold shadow"
    >
      Admin Login
    </button>

    <button
      onClick={() => router.push("/login")}
      className="bg-green-600 hover:bg-green-700 transition-colors text-white px-4 py-3 rounded w-full font-semibold shadow"
    >
      User Login
    </button>
  </div>
</div>

  );
}
