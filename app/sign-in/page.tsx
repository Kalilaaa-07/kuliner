"use client";

import React, { useState } from "react";
import Link from "next/link";
import { StoreCookies } from "@/lib/client-cookie";
import { Eye, EyeOff } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email.trim()) {
      alert("Email wajib diisi");
      return;
    }

    if (!password.trim()) {
      alert("Password wajib diisi");
      return;
    }

    try {
      setLoading(true);

      const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

      if (!baseUrl) {
        alert("NEXT_PUBLIC_BASE_API_URL belum diisi di .env.local");
        return;
      }

      const response = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        alert(responseData.message || "Email atau password salah");
        return;
      }

      console.log("LOGIN RESPONSE:", responseData);

      const token =
        responseData.token ||
        responseData.accessToken ||
        responseData.access_token ||
        responseData.data?.token ||
        responseData.data?.accessToken ||
        responseData.data?.access_token;

      const role =
        responseData.role ||
        responseData.user?.role ||
        responseData.data?.role ||
        responseData.data?.user?.role;

      if (!token) {
        alert("Token tidak ditemukan dari backend");
        return;
      }

      if (!role) {
        alert("Role tidak ditemukan dari backend");
        return;
      }

      StoreCookies("accesstoken", token);
      StoreCookies("role", role);

      alert(responseData.message || "Berhasil login");

      if (role === "ADMIN") {
        window.location.href = "/admin/home";
      } else if (role === "USER" || role === "CUSTOMER") {
        window.location.href = "/customer/home";
      } else {
        alert(`Role ${role} belum dikenali`);
      }
    } catch (error) {
      console.error("Terjadi kesalahan pada server:", error);
      alert("Terjadi kesalahan pada server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F6F7EF] px-4 py-8 text-[#283618] sm:px-8">
      <Link
        href="/"
        className="mb-4 inline-block text-sm font-bold text-[#6B8E23] hover:underline"
      >
        ← Kembali ke beranda
      </Link>

      <div className="mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-md items-center justify-center">
        <section className="w-full rounded-[28px] border border-[#DDE5C2] bg-white px-5 py-6 shadow-xl shadow-[#6B8E23]/10 sm:px-8 sm:py-7">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-extrabold text-[#283618] sm:text-3xl">
              Masuk Akun
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#6B705C]">
              Login untuk mulai menggunakan NutriCater.
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-bold text-[#283618]"
              >
                Email
              </label>

              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email"
                className="w-full rounded-2xl border border-[#DADDCB] bg-[#F9FAF4] px-4 py-3 text-sm outline-none transition focus:border-[#6B8E23] focus:ring-2 focus:ring-[#DDE5C2]"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-bold text-[#283618]"
              >
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full rounded-2xl border border-[#DADDCB] bg-[#F9FAF4] px-4 py-3 pr-14 text-sm outline-none transition focus:border-[#6B8E23] focus:ring-2 focus:ring-[#DDE5C2]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B8E23]"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#6B8E23] px-5 py-3 font-bold text-white shadow-lg shadow-[#6B8E23]/20 transition hover:bg-[#5B7C1E] disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading ? "Loading..." : "Masuk Sekarang"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[#6B705C]">
            Belum punya akun?{" "}
            <Link
              href="/sign-up"
              className="font-bold text-[#6B8E23] hover:underline"
            >
              Daftar sekarang
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}