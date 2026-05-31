"use client";

import { useEffect, useState } from "react";
import {
  Flame,
  Search,
  Beef,
  Wheat,
  Droplet,
  Utensils,
  ImageIcon,
} from "lucide-react";
import { getCookie } from "@/lib/client-cookie";
import AddMeal from "./add";
import EditMeal from "./edit";
import DeleteMeal from "./delete";

export type Meal = {
  id: number;
  name: string;
  description?: string;
  ingredients: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  cateringPlanId?: number;
  imageUrl?: string;
  cateringPlan?: {
    id: number;
    name: string;
  };
};

type Meta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type MealResponse = {
  data: Meal[];
  meta: Meta;
};

function getToken() {
  return getCookie("accessToken") || getCookie("accesstoken") || "";
}

function getArrayData<T>(result: any): T[] {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.data?.data)) return result.data.data;
  if (Array.isArray(result?.meals)) return result.meals;
  return [];
}

function getErrorMessage(result: any, fallback: string) {
  if (Array.isArray(result?.message)) return result.message.join(", ");
  return result?.message || fallback;
}

export default function AdminMealsPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [meta, setMeta] = useState<Meta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  async function getMeals(currentPage = page, keyword = search) {
    try {
      setLoading(true);

      const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

      if (!baseUrl) {
        alert("NEXT_PUBLIC_BASE_API_URL belum diisi");
        return;
      }

      const token = getToken();

      if (!token) {
        alert("Token tidak ditemukan. Silakan login ulang.");
        window.location.href = "/sign-in";
        return;
      }

      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("limit", "10");

      if (keyword.trim()) {
        params.set("search", keyword.trim());
      }

      const response = await fetch(`${baseUrl}/meals?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const result: MealResponse | any = await response.json();

      if (!response.ok) {
        alert(getErrorMessage(result, "Gagal mengambil data meals"));
        return;
      }

      const mealData = getArrayData<Meal>(result);

      setMeals(mealData);

      setMeta(
        result?.meta || result?.data?.meta || {
          total: mealData.length,
          page: currentPage,
          limit: 10,
          totalPages: 1,
        }
      );
    } catch (error) {
      console.error("GET MEALS ERROR:", error);
      alert("Terjadi kesalahan saat mengambil meals");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPage(1);
  }

  function handlePrevPage() {
    if (page <= 1) return;

    const newPage = page - 1;
    setPage(newPage);
    getMeals(newPage, search);
  }

  function handleNextPage() {
    if (page >= meta.totalPages) return;

    const newPage = page + 1;
    setPage(newPage);
    getMeals(newPage, search);
  }

  useEffect(() => {
    getMeals(1, "");
  }, []);

  const filteredMeals = meals.filter((meal) => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return true;

    return (
      meal.name?.toLowerCase().includes(keyword) ||
      meal.ingredients?.toLowerCase().includes(keyword) ||
      meal.cateringPlan?.name?.toLowerCase().includes(keyword) ||
      String(meal.id).includes(keyword)
    );
  });

  const stats = [
    {
      title: "Total",
      value: meta.total,
      icon: "🍱",
      accent: "#6B8E23",
      bg: "#EEF5D6",
    },
    {
      title: "Current",
      value: filteredMeals.length,
      icon: "📋",
      accent: "#8AAD3A",
      bg: "#F0F5E0",
    },
    {
      title: "Page",
      value: meta.page || page,
      icon: "📄",
      accent: "#DDA15E",
      bg: "#FDF3E7",
    },
  ];

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8"
      style={{
        background:
          "linear-gradient(160deg, #f0f5e0 0%, #fafaf5 60%, #f4f8e8 100%)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div className="mx-auto w-full max-w-7xl space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.25em] text-[#6B8E23]">
              Admin Panel
            </p>

            <h1
              className="text-3xl font-bold tracking-tight text-[#1e2a04] sm:text-4xl"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Meals
            </h1>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-[#6B705C]">
              Kelola makanan satuan yang nantinya akan dimasukkan ke dalam
              catering plans.
            </p>
          </div>

          <div className="w-fit">
            <AddMeal onSuccess={() => getMeals(page, search)} />
          </div>
        </div>

        {/* WELCOME CARD */}
        <div
          className="relative overflow-hidden rounded-[28px] p-5 shadow-sm sm:p-7"
          style={{
            background:
              "linear-gradient(135deg, #4e6b12 0%, #6b8e23 60%, #9bbd4f 100%)",
            border: "0.5px solid #3b5c0a",
          }}
        >
          <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute bottom-0 right-16 h-28 w-28 rounded-full bg-white/10" />

          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#d7efaa]">
                Manage Meals
              </p>

              <h2
                className="text-2xl font-bold text-white sm:text-4xl"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Atur menu sehat dengan nutrisi lengkap 🍱
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-[#e7f5c9]">
                Tambahkan meal dengan gambar, kalori, protein, karbo, lemak,
                dan ingredients agar data catering plan lebih lengkap.
              </p>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {stats.map((item) => (
            <div
              key={item.title}
              className="group relative overflow-hidden rounded-2xl bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-4 xl:p-5"
              style={{ border: "0.5px solid #d3e2a0" }}
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-base sm:h-10 sm:w-10 sm:text-lg"
                  style={{
                    background: item.bg,
                    border: "0.5px solid #d3e2a0",
                  }}
                >
                  {item.icon}
                </div>

                <div
                  className="hidden h-8 w-8 rounded-full opacity-20 transition group-hover:scale-125 sm:block"
                  style={{ background: item.accent }}
                />
              </div>

              <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-[#8a9a62] sm:text-xs">
                {item.title}
              </p>

              <h2
                className="mt-1 text-2xl font-bold text-[#1e2a04] sm:text-3xl"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {loading ? (
                  <span
                    className="inline-block h-7 w-12 animate-pulse rounded-lg sm:w-16"
                    style={{ background: item.bg }}
                  />
                ) : (
                  item.value
                )}
              </h2>

              <div
                className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl"
                style={{ background: item.accent }}
              />
            </div>
          ))}
        </div>

        {/* SEARCH */}
        <div
          className="rounded-[28px] bg-white p-5 shadow-sm sm:p-6"
          style={{ border: "0.5px solid #d3e2a0" }}
        >
          <div className="mb-5 flex items-center gap-3">
            <div
              className="h-8 w-1 rounded-full"
              style={{ background: "#6B8E23" }}
            />

            <div>
              <h2
                className="text-xl font-bold text-[#1e2a04]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Search Meals
              </h2>

              <p className="text-xs font-medium text-[#8a9a62]">
                Cari meal berdasarkan nama, ingredients, atau catering plan
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSearch}
            className="grid gap-3 xl:grid-cols-[1fr_auto]"
          >
            <div className="relative w-full">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B8E23]"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari meals..."
                className="w-full rounded-2xl border border-[#DDE5C2] bg-[#F9FAF4] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#6B8E23] focus:ring-2 focus:ring-[#DDE5C2]"
              />
            </div>

            <button
              type="submit"
              className="rounded-2xl bg-[#283618] px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#1f2b13]"
            >
              Search
            </button>
          </form>
        </div>

        {/* DATA */}
        <div
          className="overflow-hidden rounded-[28px] bg-white shadow-sm"
          style={{ border: "0.5px solid #d3e2a0" }}
        >
          <div className="flex flex-col gap-3 border-b border-[#E8EED0] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div
                className="h-8 w-1 rounded-full"
                style={{ background: "#6B8E23" }}
              />

              <div>
                <h2
                  className="text-xl font-bold text-[#1e2a04]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Data Meals
                </h2>

                <p className="text-xs font-medium text-[#8a9a62]">
                  Total data: {filteredMeals.length}
                </p>
              </div>
            </div>

            <span className="w-fit rounded-full bg-[#e8f0c8] px-3 py-1 text-xs font-bold text-[#4e6b12]">
              Page {meta.page || page} of {meta.totalPages || 1}
            </span>
          </div>

          {loading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-20 animate-pulse rounded-3xl bg-[#F0F5E0]"
                  />
                ))}
              </div>
            </div>
          ) : filteredMeals.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <span className="mb-3 text-5xl">📭</span>

              <p className="text-sm font-semibold text-[#8a9a62]">
                Data meals kosong
              </p>
            </div>
          ) : (
            <>
              {/* MOBILE + TABLET CARD */}
              <div className="grid gap-4 p-5 xl:hidden">
                {filteredMeals.map((meal) => (
                  <div
                    key={meal.id}
                    className="rounded-3xl bg-[#F9FAF4] p-5"
                    style={{ border: "0.5px solid #E8EED0" }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#E8EED0]">
                        {meal.imageUrl ? (
                          <img
                            src={meal.imageUrl}
                            alt={meal.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[#4e6b12]">
                            <ImageIcon size={20} />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#8a9a62]">
                          #{meal.id}
                        </p>

                        <h3 className="mt-1 break-words text-lg font-bold text-[#1e2a04]">
                          {meal.name}
                        </h3>

                        <p className="mt-1 truncate text-xs font-semibold text-[#6B8E23]">
                          {meal.cateringPlan?.name
                            ? meal.cateringPlan.name
                            : meal.cateringPlanId
                            ? `Plan ID: ${meal.cateringPlanId}`
                            : "No plan"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#FDF3E7] px-3 py-1 text-xs font-bold text-[#a06020]">
                        <Flame size={13} />
                        {meal.calories || 0} kal
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-full bg-[#E8EED0] px-3 py-1 text-xs font-bold text-[#4e6b12]">
                        <Beef size={13} />
                        {meal.protein || 0}g
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#6B705C]">
                        <Wheat size={13} />
                        {meal.carbs || 0}g
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#6B705C]">
                        <Droplet size={13} />
                        {meal.fat || 0}g
                      </span>
                    </div>

                    <div
                      className="mt-4 rounded-2xl px-4 py-3"
                      style={{
                        background: "#ffffff",
                        border: "0.5px solid #E8EED0",
                      }}
                    >
                      <p className="text-xs font-bold uppercase tracking-widest text-[#8a9a62]">
                        Ingredients
                      </p>

                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#6B705C]">
                        {meal.ingredients || "-"}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 border-t border-[#E8EED0] pt-4">
                      <EditMeal
                        selectedData={meal}
                        onSuccess={() => getMeals(page, search)}
                      />

                      <DeleteMeal
                        selectedData={meal}
                        onSuccess={() => getMeals(page, search)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden w-full xl:block">
                <table className="w-full table-fixed">
                  <colgroup>
                    <col className="w-[8%]" />
                    <col className="w-[28%]" />
                    <col className="w-[24%]" />
                    <col className="w-[25%]" />
                    <col className="w-[15%]" />
                  </colgroup>

                  <thead className="bg-[#E8EED0]">
                    <tr>
                      <th className="border-b border-[#DDE5C2] p-4 text-left text-xs font-bold uppercase tracking-widest text-[#283618]">
                        ID
                      </th>

                      <th className="border-b border-[#DDE5C2] p-4 text-left text-xs font-bold uppercase tracking-widest text-[#283618]">
                        Meal
                      </th>

                      <th className="border-b border-[#DDE5C2] p-4 text-left text-xs font-bold uppercase tracking-widest text-[#283618]">
                        Nutrition
                      </th>

                      <th className="border-b border-[#DDE5C2] p-4 text-left text-xs font-bold uppercase tracking-widest text-[#283618]">
                        Ingredients
                      </th>

                      <th className="border-b border-[#DDE5C2] p-4 text-left text-xs font-bold uppercase tracking-widest text-[#283618]">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredMeals.map((meal) => (
                      <tr
                        key={meal.id}
                        className="transition hover:bg-[#F6F7EF]"
                      >
                        <td className="border-b border-[#E8EED0] p-4 text-sm font-semibold text-[#6B705C]">
                          #{meal.id}
                        </td>

                        <td className="border-b border-[#E8EED0] p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-[#E8EED0]">
                              {meal.imageUrl ? (
                                <img
                                  src={meal.imageUrl}
                                  alt={meal.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[#4e6b12]">
                                  <ImageIcon size={18} />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-bold text-[#283618]">
                                {meal.name}
                              </p>

                              <p className="mt-1 truncate text-xs font-semibold text-[#6B8E23]">
                                {meal.cateringPlan?.name
                                  ? meal.cateringPlan.name
                                  : meal.cateringPlanId
                                  ? `Plan ID: ${meal.cateringPlanId}`
                                  : "No plan"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="border-b border-[#E8EED0] p-4">
                          <div className="flex flex-wrap gap-1.5">
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#FDF3E7] px-2.5 py-1 text-[11px] font-bold text-[#a06020]">
                              <Flame size={12} />
                              {meal.calories || 0}
                            </span>

                            <span className="inline-flex items-center gap-1 rounded-full bg-[#E8EED0] px-2.5 py-1 text-[11px] font-bold text-[#4e6b12]">
                              <Beef size={12} />
                              {meal.protein || 0}g
                            </span>

                            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#6B705C]">
                              <Wheat size={12} />
                              {meal.carbs || 0}g
                            </span>

                            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#6B705C]">
                              <Droplet size={12} />
                              {meal.fat || 0}g
                            </span>
                          </div>
                        </td>

                        <td className="border-b border-[#E8EED0] p-4">
                          <p className="line-clamp-2 text-sm leading-6 text-[#6B705C]">
                            {meal.ingredients || "-"}
                          </p>
                        </td>

                        <td className="border-b border-[#E8EED0] p-4">
                          <div className="flex flex-wrap gap-2">
                            <EditMeal
                              selectedData={meal}
                              onSuccess={() => getMeals(page, search)}
                            />

                            <DeleteMeal
                              selectedData={meal}
                              onSuccess={() => getMeals(page, search)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* PAGINATION */}
          <div className="flex flex-col gap-3 border-t border-[#E8EED0] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-[#6B705C]">
              Page {meta.page || page} of {meta.totalPages || 1}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={page <= 1}
                className="rounded-xl border border-[#DDE5C2] bg-white px-4 py-2 text-sm font-bold text-[#283618] transition hover:bg-[#F6F7EF] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Prev
              </button>

              <button
                type="button"
                onClick={handleNextPage}
                disabled={page >= meta.totalPages}
                className="rounded-xl bg-[#6B8E23] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#5B7C1E] disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}