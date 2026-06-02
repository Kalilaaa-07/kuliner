"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Home,
  Package,
  ClipboardList,
  User,
  LogOut,
  Mail,
  ArrowLeft,
  MapPin,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { getCookie, removeCookies } from "@/lib/client-cookie";
import EditProfile from "./edit";

type City = {
  id: number;
  name: string;
  provinceId?: number;
  province?: {
    id: number;
    name: string;
  };
};

export type CustomerProfile = {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
  cityId?: number;
  fullAddress?: string;
  addressDetail?: string;
  city?: City;
};

function getProfileData(result: any): CustomerProfile {
  return (
    result?.data?.user ||
    result?.data?.profile ||
    result?.data ||
    result?.user ||
    result?.profile ||
    result
  );
}

function getToken() {
  return getCookie("accesstoken") || getCookie("accessToken");
}

export default function CustomerProfilePage() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  async function getProfile() {
    try {
      setLoading(true);

      const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

      if (!baseUrl) {
        alert("NEXT_PUBLIC_BASE_API_URL belum diisi");
        return;
      }

      const token = getToken();

      if (!token) {
        window.location.href = "/sign-in";
        return;
      }

      const response = await fetch(`${baseUrl}/users/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result?.message || "Gagal mengambil data profile customer");

        if (response.status === 401 || response.status === 403) {
          removeCookies("accesstoken");
          removeCookies("accessToken");
          removeCookies("role");
          window.location.href = "/sign-in";
        }

        return;
      }

      const profileData = getProfileData(result);
      console.log("CUSTOMER PROFILE RESPONSE:", result);
      console.log("CUSTOMER PROFILE DATA:", profileData);
      setProfile(profileData);
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat mengambil profile");
    } finally {
      setLoading(false);
    }
  }


  function handleLogout() {
    removeCookies("accesstoken");
    removeCookies("accessToken");
    removeCookies("role");

    localStorage.removeItem("accessToken");
    localStorage.removeItem("accesstoken");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("profile");

    window.location.href = "/sign-in";
  }

  useEffect(() => {
    getProfile();
  }, []);

  if (loading) {
    return (
      <main
        className="flex min-h-screen items-center justify-center px-5 text-center"
        style={{
          background:
            "linear-gradient(160deg, #f0f5e0 0%, #fafaf5 55%, #f4f8e8 100%)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div
          className="rounded-3xl px-8 py-7"
          style={{
            background: "#ffffffcc",
            border: "0.5px solid #d3e2a0",
          }}
        >
          <div className="mx-auto mb-3 h-12 w-12 animate-pulse rounded-2xl bg-[#e8f0c8]" />

          <p className="text-sm font-semibold text-[#6B705C]">
            Memuat profile...
          </p>
        </div>
      </main>
    );
  }

  const provinceName = profile?.city?.province?.name || "";
  const cityName = profile?.city?.name || "";

  const locationText =
    profile?.fullAddress ||
    (provinceName && cityName
      ? `${provinceName}, ${cityName}`
      : cityName || (profile?.cityId ? `City ID: ${profile.cityId}` : "-"));

  const avatarLetter = profile?.name?.charAt(0)?.toUpperCase() || "C";

  return (
    <main
      className="min-h-screen pb-28"
      style={{
        background:
          "linear-gradient(160deg, #f0f5e0 0%, #fafaf5 55%, #f4f8e8 100%)",
        fontFamily: "'DM Sans', sans-serif",
        color: "#1e2a04",
      }}
    >
      <section className="px-5 pt-8">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <Link
            href="/customer/home"
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 text-[#6B8E23] shadow-sm transition hover:scale-105"
            style={{ border: "0.5px solid #d3e2a0" }}
          >
            <ArrowLeft size={22} />
          </Link>

          <div className="text-center">
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#8a9a62" }}
            >
              NutriCare
            </p>

            <h1
              className="text-xl font-bold leading-tight"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#1e2a04",
              }}
            >
              Profile
            </h1>
          </div>

          {profile ? (
            <EditProfile selectedData={profile} onSuccess={setProfile} />
          ) : (
            <div className="h-11 w-11" />
          )}
        </div>

        {/* PROFILE HERO */}
        <div
          className="relative mt-6 overflow-hidden rounded-3xl p-6 text-white"
          style={{
            background:
              "linear-gradient(130deg, #4e6b12 0%, #6b8e23 55%, #8aad3a 100%)",
            boxShadow: "0 8px 24px #6b8e2325",
          }}
        >
          <div
            className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-10"
            style={{ background: "#fff" }}
          />
          <div
            className="absolute bottom-0 right-10 h-24 w-24 rounded-full opacity-10"
            style={{ background: "#fff" }}
          />

          <div className="relative z-10 flex flex-col items-center text-center">
            <div
              className="flex h-24 w-24 items-center justify-center rounded-[2rem] text-4xl font-extrabold uppercase shadow-md"
              style={{
                background: "#ffffffee",
                color: "#6b8e23",
                border: "2px solid #d3e2a0",
              }}
            >
              {avatarLetter}
            </div>

            <div className="mt-4 flex items-center gap-1.5">
              <Sparkles size={14} style={{ color: "#d4eaa0" }} />

              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "#d4eaa0" }}
              >
                Customer Account
              </p>
            </div>

            <h2
              className="mt-1 text-2xl font-bold leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {profile?.name || "Customer"}
            </h2>

            <p className="mt-1 break-all text-sm text-[#EAF0D5]">
              {profile?.email || "-"}
            </p>

            <div
              className="mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold backdrop-blur"
              style={{
                background: "#ffffff25",
                color: "#ffffff",
                border: "0.5px solid #ffffff40",
              }}
            >
              <ShieldCheck size={14} />
              {profile?.role || "USER"}
            </div>
          </div>
        </div>

        {/* QUICK INFO */}
        <div
          className="mt-4 grid grid-cols-3 divide-x rounded-2xl py-4"
          style={{
            background: "#ffffffcc",
            border: "0.5px solid #d3e2a0",
            backdropFilter: "blur(6px)",
          }}
        >
          {[
            {
              icon: "👤",
              label: "Akun",
              value: profile?.role || "USER",
            },
            {
              icon: "📍",
              label: "Lokasi",
              value:
                profile?.fullAddress ||
                profile?.city?.name ||
                (profile?.cityId ? `City ID: ${profile.cityId}` : "—"),
            },
            {
              icon: "✨",
              label: "Status",
              value: "Aktif",
            },
          ].map(({ icon, label, value }, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-0.5 px-2 text-center"
            >
              <span className="text-lg">{icon}</span>

              <span
                className="max-w-[90px] truncate text-xs font-bold"
                style={{ color: "#1e2a04" }}
              >
                {value}
              </span>

              <span
                className="text-[10px] font-medium uppercase tracking-wide"
                style={{ color: "#8a9a62" }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* ACCOUNT INFO */}
        <div
          className="mt-6 rounded-3xl p-5"
          style={{
            background: "#ffffffee",
            border: "0.5px solid #d3e2a0",
            boxShadow: "0 2px 12px #1e2a0408",
          }}
        >
          <div className="mb-4 flex items-center gap-2">
            <Sparkles size={14} style={{ color: "#6b8e23" }} />

            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#6b8e23" }}
            >
              Informasi Akun
            </p>
          </div>

          <div className="space-y-3">
            <div
              className="flex items-center gap-4 rounded-2xl p-4"
              style={{
                background: "#F6F7EF",
                border: "0.5px solid #E8EED0",
              }}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8EED0] text-[#6B8E23]">
                <User size={21} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium text-[#8A9275]">
                  Nama Lengkap
                </p>

                <p className="truncate font-bold text-[#283618]">
                  {profile?.name || "-"}
                </p>
              </div>
            </div>

            <div
              className="flex items-center gap-4 rounded-2xl p-4"
              style={{
                background: "#F6F7EF",
                border: "0.5px solid #E8EED0",
              }}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8EED0] text-[#6B8E23]">
                <Mail size={21} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium text-[#8A9275]">Email</p>

                <p className="break-all font-bold text-[#283618]">
                  {profile?.email || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ADDRESS INFO */}
        <div
          className="mt-6 rounded-3xl p-5"
          style={{
            background: "#ffffffee",
            border: "0.5px solid #d3e2a0",
            boxShadow: "0 2px 12px #1e2a0408",
          }}
        >
          <div className="mb-4 flex items-center gap-2">
            <MapPin size={14} style={{ color: "#6b8e23" }} />

            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#6b8e23" }}
            >
              Alamat Pengiriman
            </p>
          </div>

          <div
            className="flex items-start gap-4 rounded-2xl p-4"
            style={{
              background: "#F6F7EF",
              border: "0.5px solid #E8EED0",
            }}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8EED0] text-[#6B8E23]">
              <MapPin size={21} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium text-[#8A9275]">Lokasi</p>

              <p className="font-bold leading-6 text-[#283618]">
                {locationText}
              </p>

              <p className="mt-1 text-sm leading-6 text-[#6B705C]">
                {profile?.addressDetail || "Detail alamat belum diisi"}
              </p>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div
          className="mt-6 rounded-3xl p-5"
          style={{
            background: "#ffffffee",
            border: "0.5px solid #d3e2a0",
            boxShadow: "0 2px 12px #1e2a0408",
          }}
        >
          <div className="mb-4 flex items-center gap-2">
            <Sparkles size={14} style={{ color: "#6b8e23" }} />

            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#6b8e23" }}
            >
              Pengaturan
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/customer/subscriptions"
              className="flex items-center justify-between rounded-2xl px-4 py-4 font-semibold transition hover:-translate-y-0.5"
              style={{
                background: "#F6F7EF",
                border: "0.5px solid #E8EED0",
                color: "#283618",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8EED0] text-[#6B8E23]">
                  <ClipboardList size={20} />
                </div>

                <span>Langganan Saya</span>
              </div>

              <ChevronRight size={20} className="text-[#6B8E23]" />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-between rounded-2xl px-4 py-4 font-semibold transition hover:-translate-y-0.5"
              style={{
                background: "#fff1f1",
                border: "0.5px solid #ffc9c9",
                color: "#b42318",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <LogOut size={20} />
                </div>

                <span>Logout</span>
              </div>

              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}