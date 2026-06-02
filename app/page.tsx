"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, MapPin, Tag, Wallet } from "lucide-react";

type Category = {
  id: number;
  name: string;
  description?: string;
};

type City = {
  id: number;
  name: string;
  provinceId: number;
};

type Province = {
  id: number;
  name: string;
  cities: City[];
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

type Meta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type PlansResponse = {
  data: CateringPlan[];
  meta?: Meta;
};

function getArrayData<T>(result: any): T[] {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.data?.data)) return result.data.data;
  if (Array.isArray(result?.categories)) return result.categories;
  if (Array.isArray(result?.provinces)) return result.provinces;
  if (Array.isArray(result?.data?.categories)) return result.data.categories;
  if (Array.isArray(result?.data?.provinces)) return result.data.provinces;
  return [];
}

function getTotalFromResponse(result: any, fallbackLength: number) {
  return (
    result?.meta?.total ||
    result?.data?.meta?.total ||
    result?.total ||
    fallbackLength
  );
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function Home() {
  const [plans, setPlans] = useState<CateringPlan[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [totalPlans, setTotalPlans] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  async function getLandingData() {
    try {
      setLoading(true);

      const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

      if (!baseUrl) {
        alert("NEXT_PUBLIC_BASE_API_URL belum diisi");
        return;
      }

      const [plansResponse, categoriesResponse, provincesResponse] =
        await Promise.all([
          fetch(`${baseUrl}/catering-plans?page=1&limit=3`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }),

          fetch(`${baseUrl}/categories?page=1&limit=100`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }),

          fetch(`${baseUrl}/locations/provinces`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }),
        ]);

      const plansResult: PlansResponse | CateringPlan[] =
        await plansResponse.json();
      const categoriesResult = await categoriesResponse.json();
      const provincesResult = await provincesResponse.json();

      if (!plansResponse.ok) {
        console.error("PLANS ERROR:", plansResult);
        setPlans([]);
        setTotalPlans(0);
      } else {
        const planData = getArrayData<CateringPlan>(plansResult);

        const activePlans = planData
          .filter((plan) => plan.isActive)
          .slice(0, 3);

        setPlans(activePlans);
        setTotalPlans(getTotalFromResponse(plansResult, activePlans.length));
      }

      if (!categoriesResponse.ok) {
        console.error("CATEGORIES ERROR:", categoriesResult);
        setCategories([]);
      } else {
        setCategories(getArrayData<Category>(categoriesResult));
      }

      if (!provincesResponse.ok) {
        console.error("PROVINCES ERROR:", provincesResult);
        setProvinces([]);
      } else {
        setProvinces(getArrayData<Province>(provincesResult));
      }
    } catch (error) {
      console.error("LANDING ERROR:", error);
      alert("Terjadi kesalahan saat mengambil data landing page");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getLandingData();
  }, []);

  const totalCities = useMemo(() => {
    return provinces.reduce((total, province) => {
      return total + (province.cities?.length || 0);
    }, 0);
  }, [provinces]);

  const stats = [
    {
      value: totalPlans,
      label: "Catering Plans",
    },
    {
      value: categories.length,
      label: "Kategori",
    },
    {
      value: totalCities,
      label: "Kota Tersedia",
    },
  ];

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #f0f5e0 0%, #fafaf5 55%, #f4f8e8 100%)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>
        {`
          @keyframes morph {
            0% {
              border-radius: 60% 40% 70% 30% / 50% 60% 40% 70%;
            }
            50% {
              border-radius: 40% 60% 30% 70% / 60% 40% 70% 30%;
            }
            100% {
              border-radius: 60% 40% 70% 30% / 50% 60% 40% 70%;
            }
          }
        `}
      </style>

      {/* Decorative background */}
      <div
        className="pointer-events-none absolute -left-24 -top-20 h-64 w-64 opacity-40 sm:h-80 sm:w-80"
        style={{
          background: "radial-gradient(circle, #c9d8a5, transparent 70%)",
          borderRadius: "60% 40% 70% 30% / 50% 60% 40% 70%",
          animation: "morph 8s ease-in-out infinite",
          filter: "blur(2px)",
        }}
      />

      <div
        className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 opacity-25 sm:h-96 sm:w-96"
        style={{
          background: "radial-gradient(circle, #7aaa1e44, transparent 70%)",
          borderRadius: "40% 60% 30% 70% / 60% 40% 70% 30%",
          animation: "morph 10s ease-in-out infinite reverse",
        }}
      />

      {/* Navbar */}
      <nav
        className="relative z-10 flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12"
        style={{
          backdropFilter: "blur(8px)",
          borderBottom: "0.5px solid #c9d8a530",
        }}
      >
        <Link href="/" className="text-center sm:text-left">
          <h1
            className="text-2xl font-bold"
            style={{
              fontFamily: "'Playfair Display', serif",
              letterSpacing: "-0.5px",
            }}
          >
            <span style={{ color: "#6b8e23" }}>Nutri</span>
            <span style={{ color: "#1e2a04" }}>Care</span>
          </h1>
        </Link>

        <div
          className="mx-auto flex w-full max-w-xs items-center justify-between gap-2 rounded-full px-2 py-1.5 pl-5 sm:mx-0 sm:w-auto"
          style={{
            background: "#ffffff88",
            border: "0.5px solid #c9d8a5",
            backdropFilter: "blur(4px)",
          }}
        >
          <Link
            href="/sign-in"
            className="text-sm font-semibold"
            style={{ color: "#4e6b12" }}
          >
            Masuk
          </Link>

          <Link
            href="/sign-up"
            className="rounded-full px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            style={{ background: "#6b8e23" }}
          >
            Daftar →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 mx-auto mt-12 flex max-w-6xl flex-col items-center px-5 text-center sm:mt-16 lg:mt-20">
        <div
          className="mb-5 flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-widest sm:text-xs"
          style={{
            background: "linear-gradient(90deg, #e8f0c8, #d4e6a0)",
            border: "0.5px solid #b8d47a",
            color: "#4e6b12",
          }}
        >
          <span
            className="h-2 w-2 animate-pulse rounded-full"
            style={{ background: "#6b8e23" }}
          />
          Catering Sehat
        </div>

        <h1
          className="max-w-4xl text-4xl font-bold leading-tight text-[#1e2a04] sm:text-5xl md:text-6xl lg:text-7xl"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Pilih Catering Sehat dengan{" "}
          <span className="text-[#6b8e23]">Info Nutrisi</span> Lengkap
        </h1>

        <p className="mt-5 max-w-2xl text-sm leading-7 text-[#5a6a3a] sm:text-base sm:leading-8">
          NutriCare membantu kamu melihat paket catering, kategori makanan,
          durasi plan, harga, dan pilihan kota yang tersedia.
        </p>

        <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          <Link
            href="/sign-up"
            className="flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 sm:text-base"
            style={{ background: "#6b8e23" }}
          >
            Mulai Sekarang
          </Link>

          <a
            href="#plans"
            className="flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-bold transition hover:bg-[#e8f0c8] sm:text-base"
            style={{
              border: "1.5px solid #a8c255",
              color: "#4e6b12",
            }}
          >
            Lihat Plans
          </a>
        </div>
      </main>

      {/* Stats */}
      <section
        className="relative z-10 mx-5 mt-12 grid max-w-3xl grid-cols-1 overflow-hidden rounded-3xl sm:mx-auto sm:grid-cols-3"
        style={{
          background: "#ffffffcc",
          border: "0.5px solid #d3e2a0",
          backdropFilter: "blur(6px)",
        }}
      >
        {stats.map((item, index) => (
          <div
            key={item.label}
            className={`px-4 py-5 text-center ${index === 0 ? "" : "border-t sm:border-l sm:border-t-0"
              } border-[#d3e2a0]`}
          >
            <div
              className="text-3xl font-bold"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#324409",
              }}
            >
              {loading ? "..." : item.value}
            </div>

            <div className="mt-1 text-[11px] font-bold uppercase tracking-widest text-[#6a7a4a] sm:text-xs">
              {item.label}
            </div>
          </div>
        ))}
      </section>

      {/* Plans from Backend */}
      <section
        id="plans"
        className="relative z-10 mx-auto mt-14 max-w-6xl px-5 sm:mt-16 lg:px-6"
      >
        <div className="mb-7 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-[#6b8e23]">
            Our Plans
          </p>

          <h2
            className="text-3xl font-bold text-[#1e2a04] sm:text-4xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Top 3 Catering Plans.
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#6a7a4a]">
            Pilih plan yang cocok dengan kebutuhan makan sehat kamu.
          </p>
        </div>

        {loading ? (
          <div
            className="rounded-3xl p-8 text-center text-sm font-semibold sm:p-10"
            style={{
              background: "#ffffffdd",
              border: "0.5px solid #d8e8b0",
              color: "#6a7a4a",
            }}
          >
            Memuat catering plans...
          </div>
        ) : plans.length === 0 ? (
          <div
            className="rounded-3xl p-8 text-center sm:p-10"
            style={{
              background: "#ffffffdd",
              border: "0.5px solid #d8e8b0",
            }}
          >
            <p className="font-bold text-[#1e2a04]">
              Belum ada catering plan aktif
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <Link
                key={plan.id}
                href="/sign-in"
                className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                style={{
                  border: "0.5px solid #d8e8b0",
                }}
              >
                <div className="flex h-48 items-center justify-center overflow-hidden bg-[#E8EED0] text-6xl sm:h-52">
                  {plan.imageUrl ? (
                    <img
                      src={plan.imageUrl}
                      alt={plan.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span>🥗</span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="inline-flex w-fit items-center gap-1 rounded-full bg-[#F0F5E0] px-3 py-1 text-xs font-bold text-[#6b8e23]">
                      <Tag size={13} />
                      {plan.category?.name ||
                        categories.find(
                          (category) => category.id === plan.categoryId
                        )?.name ||
                        "Plan"}
                    </span>

                    <span className="text-sm font-extrabold text-[#6b8e23]">
                      {formatRupiah(plan.price)}
                    </span>
                  </div>

                  <h3
                    className="text-xl font-bold text-[#1e2a04]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {plan.name}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#6a7a4a]">
                    {plan.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#F6F7EF] px-3 py-1 font-semibold text-[#6a7a4a]">
                      <CalendarDays size={14} />
                      {plan.duration} hari
                    </span>

                    <span className="inline-flex items-center gap-1 rounded-full bg-[#F6F7EF] px-3 py-1 font-semibold text-[#6a7a4a]">
                      <Wallet size={14} />
                      Subscribe
                    </span>
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-[#E8EED0] pt-4">
                    <span className="text-sm font-bold text-[#6b8e23]">
                      Masuk untuk subscribe
                    </span>

                    <span className="text-[#6b8e23] transition group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Lokasi from Backend */}
      <section className="relative z-10 mx-auto mt-14 max-w-6xl px-5 sm:mt-16 lg:px-6">
        <div
          className="rounded-3xl p-5 sm:p-7 lg:p-8"
          style={{
            background: "#ffffffee",
            border: "0.5px solid #d8e8b0",
          }}
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="max-w-xl">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8EED0] text-[#6b8e23]">
                <MapPin size={24} />
              </div>

              <h3
                className="text-2xl font-bold text-[#1e2a04] sm:text-3xl"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Lokasi yang tersedia
              </h3>

              <p className="mt-2 text-sm leading-7 text-[#6a7a4a]">
                NutriCare tersedia di beberapa kota berikut. Pilih lokasi saat
                daftar akun agar alamat pengiriman sesuai dengan area kamu.
              </p>
            </div>

            <Link
              href="/sign-up"
              className="w-full rounded-full px-6 py-3 text-center text-sm font-bold text-white transition hover:-translate-y-0.5 md:w-auto"
              style={{ background: "#6b8e23" }}
            >
              Daftar Sekarang
            </Link>
          </div>

          <div className="mt-7 space-y-6">
            {provinces.length === 0 ? (
              <div className="rounded-2xl bg-[#F6F7EF] p-5 text-sm font-semibold text-[#6a7a4a]">
                Belum ada lokasi.
              </div>
            ) : (
              provinces.map((province) => (
                <div
                  key={province.id}
                  className="rounded-2xl bg-[#F9FAF4] p-4 sm:p-5"
                >
                  <h4 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-[#6b8e23] sm:text-sm">
                    {province.name}
                  </h4>

                  <div className="flex flex-wrap gap-2">
                    {province.cities?.length > 0 ? (
                      province.cities.map((city) => (
                        <span
                          key={city.id}
                          className="rounded-full bg-[#F0F5E0] px-4 py-2 text-xs font-bold text-[#6b8e23] sm:text-sm"
                        >
                          {city.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm font-semibold text-[#6a7a4a]">
                        Belum ada kota.
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mt-16 px-5 pb-7 text-center text-xs text-[#8A9275] sm:mt-20 sm:text-sm">
        © 2026 NutriCare. Healthy food, clear nutrition.
      </footer>
    </div>
  );
}