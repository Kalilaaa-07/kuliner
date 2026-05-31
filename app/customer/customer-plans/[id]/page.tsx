"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Wallet,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Sparkles,
  MapPin,
} from "lucide-react";
import { getCookie } from "@/lib/client-cookie";
import SubscribePlan from "./subscribe";

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

type Meal = {
  id: number;
  name: string;
  calories: number;
  protein?: number;
  carbs: number;
  fat: number;
  ingredients: string;
  imageUrl?: string;
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
  meals?: Meal[];
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function getData(result: any) {
  return result?.data || result;
}

function getProfileData(result: any): CustomerProfile {
  return (
    result?.data?.user ||
    result?.data ||
    result?.user ||
    result?.profile ||
    result
  );
}

export default function CustomerPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [plan, setPlan] = useState<CateringPlan | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);

  const [loadingPlan, setLoadingPlan] = useState<boolean>(true);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);

  async function getDetail() {
    try {
      setLoadingPlan(true);

      const { id } = await params;
      const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

      if (!baseUrl) {
        alert("NEXT_PUBLIC_BASE_API_URL belum diisi");
        return;
      }

      const token = getCookie("accesstoken");

      const response = await fetch(`${baseUrl}/catering-plans/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Gagal mengambil detail plan");
        return;
      }

      setPlan(getData(result));
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat mengambil detail plan");
    } finally {
      setLoadingPlan(false);
    }
  }

  async function getProfile() {
    try {
      setLoadingProfile(true);

      const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

      if (!baseUrl) {
        alert("NEXT_PUBLIC_BASE_API_URL belum diisi");
        return;
      }

      const token = getCookie("accesstoken");

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
        return;
      }

      const profileData = getProfileData(result);

      setProfile({
        id: profileData?.id,
        name: profileData?.name,
        email: profileData?.email,
        role: profileData?.role,
        cityId: profileData?.cityId,
        fullAddress: profileData?.fullAddress,
        addressDetail: profileData?.addressDetail,
        city: profileData?.city,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingProfile(false);
    }
  }

  useEffect(() => {
    getDetail();
    getProfile();
  }, []);

  if (loadingPlan) {
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
            Memuat detail plan...
          </p>
        </div>
      </main>
    );
  }

  if (!plan) {
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
          className="rounded-3xl p-8"
          style={{
            background: "#ffffffcc",
            border: "0.5px solid #d3e2a0",
          }}
        >
          <span className="mb-3 block text-5xl">🍽️</span>

          <p
            className="font-bold text-[#1e2a04]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Plan tidak ditemukan
          </p>

          <Link
            href="/customer/customer-plans"
            className="mt-4 inline-flex rounded-full px-5 py-2 text-sm font-bold text-white"
            style={{ background: "#6b8e23" }}
          >
            Kembali ke plans
          </Link>
        </div>
      </main>
    );
  }

  const meals = plan.meals || [];

  const locationText =
    profile?.fullAddress ||
    (profile?.city?.name
      ? `${profile?.city?.province?.name || ""}, ${profile.city.name}`
      : "");

  return (
    <main
      className="min-h-screen pb-10"
      style={{
        background:
          "linear-gradient(160deg, #f0f5e0 0%, #fafaf5 55%, #f4f8e8 100%)",
        fontFamily: "'DM Sans', sans-serif",
        color: "#1e2a04",
      }}
    >
      {/* HERO IMAGE */}
      <section className="relative">
        <div className="relative h-[340px] w-full overflow-hidden bg-[#E8EED0] sm:h-[420px]">
          {plan.imageUrl ? (
            <img
              src={plan.imageUrl}
              alt={plan.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-8xl">
              🥗
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/5 to-[#f0f5e0]" />
        </div>

        <Link
          href="/customer/customer-plans"
          className="absolute left-5 top-6 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 text-[#6B8E23] shadow-lg backdrop-blur transition hover:scale-105"
        >
          <ArrowLeft size={22} />
        </Link>

        <div className="absolute bottom-8 left-5 right-5">
          <div className="mx-auto max-w-3xl">
            <span
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                background: "#ffffff30",
                color: "#ffffff",
                border: "0.5px solid #ffffff50",
                backdropFilter: "blur(8px)",
              }}
            >
              <Sparkles size={12} />
              {plan.category?.name || "Catering Plan"}
            </span>

            <h1
              className="mt-3 text-3xl font-bold leading-tight text-white drop-shadow sm:text-5xl"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {plan.name}
            </h1>
          </div>
        </div>
      </section>

      {/* MAIN DETAIL */}
      <section className="-mt-6 px-5">
        <div className="mx-auto max-w-3xl">
          <div
            className="relative overflow-hidden rounded-3xl p-5 shadow-sm sm:p-6"
            style={{
              background: "#ffffffee",
              border: "0.5px solid #d3e2a0",
              boxShadow: "0 2px 14px #1e2a0410",
            }}
          >
            <div
              className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20"
              style={{ background: "#6b8e23" }}
            />

            <div className="relative z-10">
              <p className="text-sm leading-7 text-[#6B705C]">
                {plan.description}
              </p>

              {locationText && (
                <div
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    background: "#e8f0c8",
                    border: "0.5px solid #c2da85",
                    color: "#4e6b12",
                  }}
                >
                  <MapPin size={12} />
                  {locationText}
                </div>
              )}

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div
                  className="rounded-2xl p-4"
                  style={{
                    background: "#F6F7EF",
                    border: "0.5px solid #E8EED0",
                  }}
                >
                  <Wallet size={20} className="text-[#6B8E23]" />

                  <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-[#8a9a62]">
                    Harga
                  </p>

                  <p
                    className="mt-1 text-lg font-bold text-[#1e2a04]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {formatRupiah(plan.price)}
                  </p>
                </div>

                <div
                  className="rounded-2xl p-4"
                  style={{
                    background: "#F6F7EF",
                    border: "0.5px solid #E8EED0",
                  }}
                >
                  <CalendarDays size={20} className="text-[#6B8E23]" />

                  <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-[#8a9a62]">
                    Durasi
                  </p>

                  <p
                    className="mt-1 text-lg font-bold text-[#1e2a04]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {plan.duration} hari
                  </p>
                </div>
              </div>

              <div className="mt-5">
                {loadingProfile ? (
                  <div
                    className="rounded-2xl p-4 text-center text-sm font-semibold"
                    style={{
                      background: "#F6F7EF",
                      border: "0.5px solid #E8EED0",
                      color: "#6B705C",
                    }}
                  >
                    Memuat data customer...
                  </div>
                ) : (
                  <SubscribePlan
                    planId={plan.id}
                    planName={plan.name}
                    duration={plan.duration}
                    profile={profile}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MEALS */}
      <section className="mt-8 px-5">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} style={{ color: "#6b8e23" }} />

                <p
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "#6b8e23" }}
                >
                  Isi Paket
                </p>
              </div>

              <h2
                className="text-xl font-bold"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Meals dalam plan ini
              </h2>
            </div>

            <span
              className="rounded-full px-3 py-1 text-xs font-bold"
              style={{
                background: "#e8f0c8",
                color: "#4e6b12",
                border: "0.5px solid #c2da85",
              }}
            >
              {meals.length} meals
            </span>
          </div>

          {meals.length === 0 ? (
            <div
              className="flex flex-col items-center rounded-3xl p-8 text-center"
              style={{
                background: "#ffffffcc",
                border: "0.5px solid #d3e2a0",
              }}
            >
              <span className="mb-3 text-5xl">🍱</span>

              <p
                className="font-bold text-[#1e2a04]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Belum ada meals di plan ini
              </p>

              <p className="mt-1.5 text-sm leading-6 text-[#8a9a62]">
                Admin belum menambahkan daftar makanan untuk plan ini.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {meals.map((meal) => (
                <div
                  key={meal.id}
                  className="group flex gap-4 rounded-3xl p-4 transition hover:-translate-y-0.5"
                  style={{
                    background: "#ffffffee",
                    border: "0.5px solid #d3e2a0",
                    boxShadow: "0 2px 12px #1e2a0408",
                  }}
                >
                  <div
                    className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-4xl sm:h-28 sm:w-28"
                    style={{
                      background:
                        "linear-gradient(135deg, #e8f0c8, #d3e2a0)",
                    }}
                  >
                    {meal.imageUrl ? (
                      <img
                        src={meal.imageUrl}
                        alt={meal.name}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    ) : (
                      "🍱"
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-1 font-bold text-[#1e2a04]">
                      {meal.name}
                    </h3>

                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#6B705C]">
                      {meal.ingredients}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span
                        className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                        style={{
                          background: "#fdf3e7",
                          color: "#a06020",
                          border: "0.5px solid #f0c97a",
                        }}
                      >
                        <Flame size={12} />
                        {meal.calories} Kal
                      </span>

                      <span
                        className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                        style={{
                          background: "#f0f5e0",
                          color: "#4e6b12",
                          border: "0.5px solid #c2da85",
                        }}
                      >
                        <Beef size={12} />
                        {meal.protein || meal.protein || 0}g
                      </span>

                      <span
                        className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                        style={{
                          background: "#f0f5e0",
                          color: "#4e6b12",
                          border: "0.5px solid #c2da85",
                        }}
                      >
                        <Wheat size={12} />
                        {meal.carbs}g
                      </span>

                      <span
                        className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                        style={{
                          background: "#f0f5e0",
                          color: "#4e6b12",
                          border: "0.5px solid #c2da85",
                        }}
                      >
                        <Droplets size={12} />
                        {meal.fat}g
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}