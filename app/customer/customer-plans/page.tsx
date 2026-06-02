"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Home,
  Package,
  ClipboardList,
  User,
  Search,
  CalendarDays,
  Wallet,
  Filter,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import { getCookie } from "@/lib/client-cookie";

type Category = {
  id: number;
  name: string;
  description?: string;
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
  }).format(value || 0);
}

function getToken() {
  return getCookie("accessToken") || getCookie("accesstoken") || "";
}

function getArrayData<T>(result: any): T[] {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.data?.data)) return result.data.data;
  if (Array.isArray(result?.categories)) return result.categories;
  if (Array.isArray(result?.plans)) return result.plans;
  if (Array.isArray(result?.cateringPlans)) return result.cateringPlans;
  return [];
}

function getErrorMessage(result: any, fallback: string) {
  if (Array.isArray(result?.message)) return result.message.join("\n");
  return result?.message || fallback;
}

async function readJsonSafe(response: Response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text };
  }
}

export default function CustomerPlansPage() {
  const [plans, setPlans] = useState<CateringPlan[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [search, setSearch] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");

  const [loadingPlans, setLoadingPlans] = useState<boolean>(true);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);

  async function getCategories() {
    try {
      setLoadingCategories(true);

      const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

      if (!baseUrl) {
        alert("NEXT_PUBLIC_BASE_API_URL belum diisi");
        return;
      }

      const token = getToken();

      const response = await fetch(`${baseUrl}/categories?page=1&limit=100`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      });

      const result = await readJsonSafe(response);

      if (!response.ok) {
        alert(getErrorMessage(result, "Gagal mengambil categories"));
        setCategories([]);
        return;
      }

      setCategories(getArrayData<Category>(result));
    } catch (error) {
      console.error("GET CATEGORIES ERROR:", error);
      alert("Terjadi kesalahan saat mengambil categories");
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }

  async function getPlans() {
    try {
      setLoadingPlans(true);

      const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

      if (!baseUrl) {
        alert("NEXT_PUBLIC_BASE_API_URL belum diisi");
        return;
      }

      const token = getToken();

      const response = await fetch(`${baseUrl}/catering-plans?page=1&limit=4`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      });

      const result = await readJsonSafe(response);

      if (!response.ok) {
        alert(getErrorMessage(result, "Gagal mengambil catering plans"));
        setPlans([]);
        return;
      }

      const planData = getArrayData<CateringPlan>(result);

      const activePlans = planData.filter((plan) => plan.isActive === true);

      console.log("ALL ACTIVE PLANS:", activePlans);

      setPlans(activePlans);
    } catch (error) {
      console.error("GET PLANS ERROR:", error);
      alert("Terjadi kesalahan saat mengambil catering plans");
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  }

  function handleFilter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  function handleResetFilter() {
    setSearch("");
    setCategoryId("");
  }

  useEffect(() => {
    getCategories();
    getPlans();
  }, []);

  const filteredPlans = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return plans.filter((plan) => {
      const planCategoryId = plan.categoryId || plan.category?.id;

      const categoryName =
        plan.category?.name ||
        categories.find((category) => category.id === planCategoryId)?.name ||
        "";

      const matchSearch =
        !keyword ||
        plan.name?.toLowerCase().includes(keyword) ||
        plan.description?.toLowerCase().includes(keyword) ||
        categoryName.toLowerCase().includes(keyword) ||
        String(plan.price).includes(keyword) ||
        String(plan.duration).includes(keyword);

      const matchCategory =
        !categoryId || String(planCategoryId) === String(categoryId);

      return matchSearch && matchCategory;
    });
  }, [plans, categories, search, categoryId]);

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
        <div className="flex items-start justify-between gap-4">
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
              Catering Plans
            </h1>

            <p className="mt-1 max-w-md text-sm leading-6 text-[#6a7a4a]">
              Pilih paket catering sehat sesuai kebutuhanmu.
            </p>
          </div>

          <Link
            href="/customer/profile"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white transition hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #6b8e23, #8aad3a)",
              border: "2px solid #d3e2a0",
              boxShadow: "0 4px 12px #6b8e2325",
            }}
          >
            <User size={22} />
          </Link>
        </div>

        {/* HERO BANNER */}
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
                className="inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-semibold"
                style={{
                  background: "#ffffff25",
                  color: "#d4eaa0",
                  border: "0.5px solid #ffffff40",
                }}
              >
                <Sparkles size={12} />
                Rekomendasi sehat
              </span>

              <h2
                className="mt-2.5 text-xl font-bold leading-snug text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Temukan paket catering
                <br />
                yang cocok untukmu.
              </h2>

              <p className="mt-2 max-w-sm text-xs leading-5 text-[#d4eaa0]">
                Filter berdasarkan kategori, durasi, dan kebutuhan makan sehat.
              </p>
            </div>

            <div className="hidden select-none text-6xl sm:block">🥗</div>
          </div>
        </div>

        {/* QUICK STATS */}
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
              icon: "🥗",
              label: "Plan aktif",
              value: loadingPlans ? "..." : plans.length || "—",
            },
            {
              icon: "🏷️",
              label: "Kategori",
              value: loadingCategories ? "..." : categories.length || "—",
            },
            {
              icon: "✨",
              label: "Tampil",
              value: loadingPlans ? "..." : filteredPlans.length || "—",
            },
          ].map(({ icon, label, value }, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-0.5 px-2 text-center"
            >
              <span className="text-lg">{icon}</span>

              <span className="text-xs font-bold" style={{ color: "#1e2a04" }}>
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

      {/* FILTER */}
      <section className="mt-6 px-5">
        <form
          onSubmit={handleFilter}
          className="rounded-3xl p-4"
          style={{
            background: "#ffffffee",
            border: "0.5px solid #d3e2a0",
            boxShadow: "0 2px 12px #1e2a0408",
          }}
        >
          <div className="mb-3 flex items-center gap-2">
            <SlidersHorizontal size={15} style={{ color: "#6b8e23" }} />

            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#6b8e23" }}
            >
              Filter Plans
            </p>
          </div>

          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B8E23]"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama plan, kategori, harga, atau durasi..."
              className="w-full rounded-2xl border border-[#DDE5C2] bg-[#F9FAF4] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#6B8E23] focus:ring-2 focus:ring-[#DDE5C2]"
            />
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={loadingCategories}
              className="w-full rounded-2xl border border-[#DDE5C2] bg-[#F9FAF4] px-4 py-3 text-sm outline-none transition focus:border-[#6B8E23] focus:ring-2 focus:ring-[#DDE5C2] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {loadingCategories ? "Loading category..." : "Semua Category"}
              </option>

              {categories.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <p className="mt-3 text-xs font-semibold text-[#8a9a62]">
            Menampilkan {filteredPlans.length} dari {plans.length} plan aktif.
          </p>

          {!loadingCategories && categories.length === 0 && (
            <p className="mt-3 text-xs font-semibold text-red-500">
              Category belum kebaca dari backend. Cek endpoint GET /categories.
            </p>
          )}
        </form>
      </section>

      {/* PLANS LIST */}
      <section className="mt-7 px-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} style={{ color: "#6b8e23" }} />

              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "#6b8e23" }}
              >
                Pilihan Plan
              </p>
            </div>

            <h2
              className="text-xl font-bold"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Semua Catering Plans
            </h2>
          </div>
        </div>

        {loadingPlans ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
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
        ) : filteredPlans.length === 0 ? (
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
              Plan tidak ditemukan
            </p>

            <p className="mt-1.5 text-sm leading-6" style={{ color: "#8a9a62" }}>
              Coba ubah keyword search atau kategori.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPlans.map((plan, index) => {
              const categoryName =
                plan.category?.name ||
                categories.find((category) => category.id === plan.categoryId)
                  ?.name ||
                "Catering Plan";

              return (
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
                      background:
                        "linear-gradient(135deg, #e8f0c8, #d3e2a0)",
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

                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3
                            className="line-clamp-1 font-bold leading-tight"
                            style={{ color: "#1e2a04", fontSize: 15 }}
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
                            {categoryName}
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
                        {plan.description}
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
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}