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
  Leaf,
  X,
  Eye,
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

function getToken() {
  return getCookie("accessToken") || getCookie("accesstoken") || "";
}

export default function CustomerPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [plan, setPlan] = useState<CateringPlan | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

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

      const token = getToken();

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
            "linear-gradient(160deg, #F7F5D9 0%, #EEF5C4 45%, #DDEBB0 100%)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div
          className="rounded-[28px] px-8 py-7 shadow-sm"
          style={{
            background: "#FFFDF3",
            border: "1px solid #C9D989",
          }}
        >
          <div className="mx-auto mb-3 flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-[#DDEBB0]">
            <Leaf size={22} className="text-[#4E6B12]" />
          </div>

          <p className="text-sm font-bold text-[#4E6B12]">
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
            "linear-gradient(160deg, #F7F5D9 0%, #EEF5C4 45%, #DDEBB0 100%)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div
          className="rounded-[28px] p-8 shadow-sm"
          style={{
            background: "#FFFDF3",
            border: "1px solid #C9D989",
          }}
        >
          <span className="mb-3 block text-5xl">🍽️</span>

          <p
            className="font-bold text-[#243707]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Plan tidak ditemukan
          </p>

          <Link
            href="/customer/customer-plans"
            className="mt-4 inline-flex rounded-full px-5 py-2 text-sm font-bold text-white"
            style={{ background: "#6B8E23" }}
          >
            Kembali ke plans
          </Link>
        </div>
      </main>
    );
  }

  const meals = plan.meals || [];

  return (
    <main
      className="min-h-screen pb-10"
      style={{
        background:
          "linear-gradient(160deg, #F7F5D9 0%, #EEF5C4 42%, #DDEBB0 100%)",
        fontFamily: "'DM Sans', sans-serif",
        color: "#243707",
      }}
    >
      {/* HERO IMAGE */}
      <section className="relative">
        <div className="relative h-[340px] w-full overflow-hidden bg-[#DDEBB0] sm:h-[430px]">
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

          <div className="absolute inset-0 bg-gradient-to-b from-[#243707]/35 via-[#4E6B12]/10 to-[#F7F5D9]" />
        </div>

        <Link
          href="/customer/customer-plans"
          className="absolute left-5 top-6 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFFDF3] text-[#4E6B12] shadow-lg transition hover:scale-105"
        >
          <ArrowLeft size={22} />
        </Link>

        <div className="absolute bottom-8 left-5 right-5">
          <div className="mx-auto max-w-3xl">
            <span
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold shadow-sm"
              style={{
                background: "#FFFDF3",
                color: "#4E6B12",
                border: "1px solid #C9D989",
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
            className="relative overflow-hidden rounded-[30px] p-5 shadow-sm sm:p-6"
            style={{
              background: "#FFFDF3",
              border: "1px solid #C9D989",
              boxShadow: "0 18px 35px #4E6B1218",
            }}
          >
            <div
              className="absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-30"
              style={{ background: "#DDEBB0" }}
            />

            <div
              className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full opacity-40"
              style={{ background: "#EEF5C4" }}
            />

            <div className="relative z-10">
              <p className="text-sm font-medium leading-7 text-[#4E6B12]">
                {plan.description}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div
                  className="rounded-2xl p-4"
                  style={{
                    background:
                      "linear-gradient(135deg, #EEF5C4 0%, #FFFDF3 100%)",
                    border: "1px solid #C9D989",
                  }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6B8E23] text-white">
                    <Wallet size={20} />
                  </div>

                  <p className="mt-3 text-xs font-bold uppercase tracking-widest text-[#6B8E23]">
                    Harga
                  </p>

                  <p
                    className="mt-1 text-lg font-bold text-[#243707]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {formatRupiah(plan.price)}
                  </p>
                </div>

                <div
                  className="rounded-2xl p-4"
                  style={{
                    background:
                      "linear-gradient(135deg, #EEF5C4 0%, #FFFDF3 100%)",
                    border: "1px solid #C9D989",
                  }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6B8E23] text-white">
                    <CalendarDays size={20} />
                  </div>

                  <p className="mt-3 text-xs font-bold uppercase tracking-widest text-[#6B8E23]">
                    Durasi
                  </p>

                  <p
                    className="mt-1 text-lg font-bold text-[#243707]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {plan.duration} hari
                  </p>
                </div>
              </div>

              <div className="mt-5">
                {loadingProfile ? (
                  <div
                    className="rounded-2xl p-4 text-center text-sm font-bold"
                    style={{
                      background: "#EEF5C4",
                      border: "1px solid #C9D989",
                      color: "#4E6B12",
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
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} style={{ color: "#6B8E23" }} />

                <p
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: "#6B8E23" }}
                >
                  Isi Paket
                </p>
              </div>

              <h2
                className="text-xl font-bold text-[#243707]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Meals dalam plan ini
              </h2>
            </div>

            <span
              className="shrink-0 rounded-full px-3 py-1 text-xs font-bold"
              style={{
                background: "#FFFDF3",
                color: "#4E6B12",
                border: "1px solid #C9D989",
              }}
            >
              {meals.length} meals
            </span>
          </div>

          {meals.length === 0 ? (
            <div
              className="flex flex-col items-center rounded-[28px] p-8 text-center shadow-sm"
              style={{
                background: "#FFFDF3",
                border: "1px solid #C9D989",
              }}
            >
              <span className="mb-3 text-5xl">🍱</span>

              <p
                className="font-bold text-[#243707]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Belum ada meals di plan ini
              </p>

              <p className="mt-1.5 text-sm font-medium leading-6 text-[#6B8E23]">
                Admin belum menambahkan daftar makanan untuk plan ini.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {meals.map((meal) => (
                <button
                  key={meal.id}
                  type="button"
                  onClick={() => setSelectedMeal(meal)}
                  className="group flex w-full gap-4 rounded-[28px] p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
                  style={{
                    background: "#FFFDF3",
                    border: "1px solid #C9D989",
                    boxShadow: "0 12px 28px #4E6B1212",
                  }}
                >
                  <div
                    className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-4xl sm:h-28 sm:w-28"
                    style={{
                      background:
                        "linear-gradient(135deg, #DDEBB0 0%, #EEF5C4 100%)",
                      border: "1px solid #C9D989",
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
                    <h3 className="line-clamp-1 font-bold text-[#243707]">
                      {meal.name}
                    </h3>

                    <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-[#6B8E23]">
                      <Eye size={12} />
                      Klik untuk lihat detail
                    </p>

                    <p className="mt-1.5 line-clamp-2 text-xs font-medium leading-5 text-[#4E6B12]">
                      {meal.ingredients}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span
                        className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold"
                        style={{
                          background: "#FFF1C7",
                          color: "#9A5A13",
                          border: "1px solid #E8C56A",
                        }}
                      >
                        <Flame size={12} />
                        {meal.calories} Kal
                      </span>

                      <span
                        className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold"
                        style={{
                          background: "#EEF5C4",
                          color: "#4E6B12",
                          border: "1px solid #C9D989",
                        }}
                      >
                        <Beef size={12} />
                        {meal.protein || 0}g
                      </span>

                      <span
                        className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold"
                        style={{
                          background: "#EEF5C4",
                          color: "#4E6B12",
                          border: "1px solid #C9D989",
                        }}
                      >
                        <Wheat size={12} />
                        {meal.carbs}g
                      </span>

                      <span
                        className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold"
                        style={{
                          background: "#EEF5C4",
                          color: "#4E6B12",
                          border: "1px solid #C9D989",
                        }}
                      >
                        <Droplets size={12} />
                        {meal.fat}g
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* MODAL DETAIL MEAL */}
      {selectedMeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[28px] p-5 shadow-xl"
            style={{
              background: "#FFFDF3",
              border: "1px solid #C9D989",
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedMeal(null)}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#EEF5C4] text-[#4E6B12] transition hover:scale-105"
            >
              <X size={18} />
            </button>

            <div
              className="mb-4 flex h-52 w-full items-center justify-center overflow-hidden rounded-3xl text-6xl"
              style={{
                background:
                  "linear-gradient(135deg, #DDEBB0 0%, #EEF5C4 100%)",
                border: "1px solid #C9D989",
              }}
            >
              {selectedMeal.imageUrl ? (
                <img
                  src={selectedMeal.imageUrl}
                  alt={selectedMeal.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                "🍱"
              )}
            </div>

            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#6B8E23]">
              Meal Detail
            </p>

            <h2
              className="pr-10 text-2xl font-bold text-[#243707]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {selectedMeal.name}
            </h2>

            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-widest text-[#6B8E23]">
                Ingredients
              </p>

              <p className="mt-1 text-sm font-medium leading-6 text-[#4E6B12]">
                {selectedMeal.ingredients || "-"}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div
                className="rounded-2xl p-4"
                style={{
                  background: "#FFF1C7",
                  border: "1px solid #E8C56A",
                }}
              >
                <div className="flex items-center gap-2 text-[#9A5A13]">
                  <Flame size={18} />
                  <p className="text-xs font-bold uppercase tracking-widest">
                    Calories
                  </p>
                </div>

                <p className="mt-2 text-lg font-bold text-[#9A5A13]">
                  {selectedMeal.calories || 0} Kal
                </p>
              </div>

              <div
                className="rounded-2xl p-4"
                style={{
                  background: "#EEF5C4",
                  border: "1px solid #C9D989",
                }}
              >
                <div className="flex items-center gap-2 text-[#4E6B12]">
                  <Beef size={18} />
                  <p className="text-xs font-bold uppercase tracking-widest">
                    Protein
                  </p>
                </div>

                <p className="mt-2 text-lg font-bold text-[#4E6B12]">
                  {selectedMeal.protein || 0}g
                </p>
              </div>

              <div
                className="rounded-2xl p-4"
                style={{
                  background: "#EEF5C4",
                  border: "1px solid #C9D989",
                }}
              >
                <div className="flex items-center gap-2 text-[#4E6B12]">
                  <Wheat size={18} />
                  <p className="text-xs font-bold uppercase tracking-widest">
                    Carbs
                  </p>
                </div>

                <p className="mt-2 text-lg font-bold text-[#4E6B12]">
                  {selectedMeal.carbs || 0}g
                </p>
              </div>

              <div
                className="rounded-2xl p-4"
                style={{
                  background: "#EEF5C4",
                  border: "1px solid #C9D989",
                }}
              >
                <div className="flex items-center gap-2 text-[#4E6B12]">
                  <Droplets size={18} />
                  <p className="text-xs font-bold uppercase tracking-widest">
                    Fat
                  </p>
                </div>

                <p className="mt-2 text-lg font-bold text-[#4E6B12]">
                  {selectedMeal.fat || 0}g
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}