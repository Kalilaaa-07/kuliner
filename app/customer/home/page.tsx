"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Home,
  Package,
  ClipboardList,
  User,
  MapPin,
  Wallet,
  Sparkles,
} from "lucide-react";
import { getCookie } from "@/lib/client-cookie";

type City = {
  id: number;
  name: string;
  provinceId?: number;
  province?: {
    id: number;
    name: string;
  };
};

type CustomerProfile = {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
  cityId?: number;
  fullAddress?: string;
  addressDetail?: string;
  city?: City;
};

type Category = {
  id: number;
  name: string;
};

type CateringPlan = {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  imageUrl?: string;
  isActive: boolean;
  categoryId?: number;
  category?: Category;
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function getToken() {
  return getCookie("accessToken") || getCookie("accesstoken") || "";
}

function getProfileData(result: any): CustomerProfile {
  return (
    result?.data?.user ||
    result?.data?.profile ||
    result?.data ||
    result?.user ||
    result?.profile ||
    result ||
    {}
  );
}

function getArrayData<T>(result: any): T[] {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.data?.data)) return result.data.data;
  if (Array.isArray(result?.plans)) return result.plans;
  if (Array.isArray(result?.cateringPlans)) return result.cateringPlans;
  return [];
}

export default function CustomerHomePage() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [plans, setPlans] = useState<CateringPlan[]>([]);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const [loadingPlans, setLoadingPlans] = useState<boolean>(true);

  async function getProfile() {
    try {
      setLoadingProfile(true);

      const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;
      const token = getToken();

      if (!baseUrl) {
        alert("NEXT_PUBLIC_BASE_API_URL belum diisi");
        return;
      }

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
        console.error("PROFILE ERROR:", result);
        alert(result?.message || "Gagal mengambil profile customer");
        return;
      }

      setProfile(getProfileData(result));
    } catch (error) {
      console.error("PROFILE ERROR:", error);
      alert("Terjadi kesalahan saat mengambil profile");
    } finally {
      setLoadingProfile(false);
    }
  }

  async function getPlans() {
    try {
      setLoadingPlans(true);

      const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;
      const token = getToken();

      if (!baseUrl) {
        alert("NEXT_PUBLIC_BASE_API_URL belum diisi");
        return;
      }

      const response = await fetch(`${baseUrl}/catering-plans?page=1&limit=3`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("PLANS ERROR:", result);
        alert(result?.message || "Gagal mengambil catering plans");
        setPlans([]);
        return;
      }

      const planData = getArrayData<CateringPlan>(result);
      const activePlans = planData.filter((plan) => plan.isActive);

      setPlans(activePlans);
    } catch (error) {
      console.error("PLANS ERROR:", error);
      alert("Terjadi kesalahan saat mengambil catering plans");
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  }

  useEffect(() => {
    getProfile();
    getPlans();
  }, []);

const locationText = useMemo(() => {
  const cityName = profile?.city?.name;

  if (cityName) {
    return cityName;
  }

  const fullAddress = profile?.fullAddress;

  if (fullAddress) {
    const parts = fullAddress.split(",");
    const lastPart = parts[parts.length - 1]?.trim();

    return lastPart || fullAddress;
  }

  return "—";
}, [profile]);

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
      {/* TOP SECTION */}
      <section className="px-5 pt-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 animate-pulse rounded-full"
                style={{ background: "#6b8e23" }}
              />
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "#8a9a62" }}
              >
                NutriCare
              </p>
            </div>

            <h1
              className="mt-0.5 text-2xl font-bold leading-tight"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#1e2a04",
              }}
            >
              {loadingProfile
                ? "Selamat datang 👋"
                : `Halo, ${profile?.name?.split(" ")[0] || "Customer"} 👋`}
            </h1>
          </div>

          <Link
            href="/customer/profile"
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold text-white transition hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #6b8e23, #8aad3a)",
              border: "2px solid #d3e2a0",
              boxShadow: "0 4px 12px #6b8e2325",
            }}
          >
            {avatarLetter}
          </Link>
        </div>

        {!loadingProfile && locationText !== "-" && (
          <div
            className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
            style={{
              background: "#e8f0c8",
              border: "0.5px solid #c2da85",
              color: "#4e6b12",
            }}
          >
            <MapPin size={11} />
            {locationText}
          </div>
        )}

        {profile?.addressDetail && (
          <p className="mt-2 text-xs leading-5 text-[#8a9a62]">
            {profile.addressDetail}
          </p>
        )}

        <div
          className="relative mt-5 overflow-hidden rounded-3xl p-6"
          style={{
            background:
              "linear-gradient(130deg, #4e6b12 0%, #6b8e23 55%, #8aad3a 100%)",
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

          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex-1">
              <span
                className="inline-block rounded-full px-3 py-0.5 text-xs font-semibold"
                style={{
                  background: "#ffffff25",
                  color: "#d4eaa0",
                  border: "0.5px solid #ffffff40",
                }}
              >
                Catering sehat
              </span>

              <h2
                className="mt-2.5 text-xl font-bold leading-snug text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Pilih paket catering
                <br />
                sesuai kebutuhanmu.
              </h2>
            </div>

            <div className="hidden select-none text-6xl sm:block">🥗</div>
          </div>
        </div>

        {/* QUICK STATS */}
        <div
          className="mt-4 grid grid-cols-3 divide-x divide-[#d3e2a0] rounded-2xl py-4"
          style={{
            background: "#ffffffcc",
            border: "0.5px solid #d3e2a0",
            backdropFilter: "blur(6px)",
          }}
        >
          {[
            {
              icon: "🥗",
              label: "Plan aktif",
              value: loadingPlans ? "..." : plans.length || "—",
            },
            {
              icon: "📍",
              label: "Lokasi",
              value: loadingProfile ? "..." : locationText,
            },
            {
              icon: "👤",
              label: "Role",
              value: loadingProfile ? "..." : profile?.role || "USER",
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
      </section>

      {/* RECOMMENDED PLANS */}
      <section className="mt-7 px-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} style={{ color: "#6b8e23" }} />
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "#6b8e23" }}
              >
                Rekomendasi
              </p>
            </div>

            <h2
              className="text-xl font-bold"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Catering Plans
            </h2>
          </div>

          <Link
            href="/customer/customer-plans"
            className="rounded-full px-4 py-1.5 text-xs font-semibold transition hover:bg-[#e8f0c8]"
            style={{
              color: "#4e6b12",
              border: "1px solid #c2da85",
            }}
          >
            Lihat semua →
          </Link>
        </div>

        {loadingPlans ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex gap-4 rounded-3xl p-4"
                style={{
                  background: "#ffffffcc",
                  border: "0.5px solid #d3e2a0",
                }}
              >
                <div
                  className="h-28 w-28 shrink-0 animate-pulse rounded-2xl"
                  style={{ background: "#e8f0c8" }}
                />

                <div className="flex flex-1 flex-col gap-2 pt-1">
                  <div
                    className="h-4 w-3/4 animate-pulse rounded-full"
                    style={{ background: "#e8f0c8" }}
                  />
                  <div
                    className="h-3 w-1/3 animate-pulse rounded-full"
                    style={{ background: "#f0f5e0" }}
                  />
                  <div
                    className="h-3 w-full animate-pulse rounded-full"
                    style={{ background: "#f0f5e0" }}
                  />
                  <div
                    className="h-3 w-4/5 animate-pulse rounded-full"
                    style={{ background: "#f0f5e0" }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div
            className="flex flex-col items-center rounded-3xl p-8 text-center"
            style={{
              background: "#ffffffcc",
              border: "0.5px solid #d3e2a0",
            }}
          >
            <span className="mb-3 text-5xl">🍽️</span>

            <p
              className="font-bold"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#1e2a04",
              }}
            >
              Belum ada catering plan aktif
            </p>

            <p className="mt-1.5 text-sm leading-6" style={{ color: "#8a9a62" }}>
              Data catering plan akan muncul sesuai data.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map((plan, index) => (
              <Link
                href={`/customer/customer-plans/${plan.id}`}
                key={plan.id}
                className="group flex gap-4 rounded-3xl p-4 transition hover:-translate-y-0.5"
                style={{
                  background: "#ffffffee",
                  border: "0.5px solid #d3e2a0",
                  boxShadow: "0 2px 12px #1e2a0408",
                }}
              >
                <div
                  className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-5xl"
                  style={{
                    background: "linear-gradient(135deg, #e8f0c8, #d3e2a0)",
                  }}
                >
                  {plan.imageUrl ? (
                    <img
                      src={plan.imageUrl}
                      alt={plan.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    "🍱"
                  )}

                  {index === 0 && (
                    <div
                      className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                      style={{ background: "#6b8e23" }}
                    >
                      #1
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3
                          className="font-bold leading-tight"
                          style={{
                            color: "#1e2a04",
                            fontSize: 15,
                          }}
                        >
                          {plan.name}
                        </h3>

                        <span
                          className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                          style={{
                            background: "#e8f0c8",
                            color: "#4e6b12",
                          }}
                        >
                          {plan.category?.name || "Catering Plan"}
                        </span>
                      </div>

                      <div className="shrink-0 text-right">
                        <p
                          className="text-sm font-bold"
                          style={{
                            color: "#4e6b12",
                            fontFamily: "'Playfair Display', serif",
                          }}
                        >
                          {formatRupiah(plan.price)}
                        </p>
                      </div>
                    </div>

                    <p
                      className="mt-2 line-clamp-2 text-xs leading-5"
                      style={{ color: "#6a7a4a" }}
                    >
                      {plan.description || "Tidak ada deskripsi."}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span
                      className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                      style={{
                        background: "#f0f5e0",
                        color: "#4e6b12",
                        border: "0.5px solid #c2da85",
                      }}
                    >
                      <CalendarDays size={11} />
                      {plan.duration} hari
                    </span>

                    <span
                      className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                      style={{
                        background: "#f0f5e0",
                        color: "#4e6b12",
                        border: "0.5px solid #c2da85",
                      }}
                    >
                      <Wallet size={11} />
                      Subscribe
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}