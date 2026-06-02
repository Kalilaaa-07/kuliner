"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Search, Tag, Wallet } from "lucide-react";
import { getCookie } from "@/lib/client-cookie";
import AddPlan from "./add";
import EditPlan from "./edit";
import DeletePlan from "./delete";

export type Category = {
  id: number;
  name: string;
  description?: string;
};

export type CateringPlan = {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  isActive: boolean;
  categoryId: number;
  category?: Category;
};

type Meta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const LIMIT = 5;

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
  if (Array.isArray(result?.message)) return result.message.join(", ");
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

function getMeta(result: any, dataLength: number, currentPage: number): Meta {
  const metaData = result?.meta || result?.data?.meta || {};

  const total =
    Number(
      metaData?.total ||
        metaData?.totalData ||
        metaData?.totalItems ||
        result?.total ||
        result?.data?.total ||
        dataLength
    ) || dataLength;

  const totalPages =
    Number(
      metaData?.totalPages ||
        metaData?.lastPage ||
        result?.totalPages ||
        result?.data?.totalPages ||
        Math.ceil(total / LIMIT)
    ) || 1;

  return {
    total,
    page: Number(metaData?.page || currentPage),
    limit: Number(metaData?.limit || LIMIT),
    totalPages: Math.max(totalPages, 1),
  };
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<CateringPlan[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [meta, setMeta] = useState<Meta>({
    total: 0,
    page: 1,
    limit: LIMIT,
    totalPages: 1,
  });

  const [search, setSearch] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  async function getCategories() {
    try {
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

      const response = await fetch(`${baseUrl}/categories?page=1&limit=100`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const result = await readJsonSafe(response);

      if (!response.ok) {
        alert(getErrorMessage(result, "Gagal mengambil categories"));
        return;
      }

      setCategories(getArrayData<Category>(result));
    } catch (error) {
      console.error("GET CATEGORIES ERROR:", error);
      alert("Terjadi kesalahan saat mengambil categories");
    }
  }

  async function getPlans(
    currentPage = page,
    keyword = search,
    selectedCategoryId = categoryId
  ) {
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
      params.set("limit", String(LIMIT));

      if (keyword.trim()) {
        params.set("search", keyword.trim());
      }

      if (selectedCategoryId) {
        params.set("categoryId", selectedCategoryId);
      }

      const response = await fetch(
        `${baseUrl}/catering-plans?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const result = await readJsonSafe(response);

      if (!response.ok) {
        alert(getErrorMessage(result, "Gagal mengambil catering plans"));
        return;
      }

      const planData = getArrayData<CateringPlan>(result);

      setPlans(planData);
      setMeta(getMeta(result, planData.length, currentPage));
    } catch (error) {
      console.error("GET PLANS ERROR:", error);
      alert("Terjadi kesalahan saat mengambil catering plans");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPage(1);
    getPlans(1, search, categoryId);
  }

  function handleCategoryChange(value: string) {
    setCategoryId(value);
    setPage(1);
    getPlans(1, search, value);
  }

  useEffect(() => {
    getCategories();
    getPlans(1, "", "");
  }, []);

  const filteredPlans = plans.filter((plan) => {
    const keyword = search.trim().toLowerCase();
    const planCategoryId = plan.categoryId || plan.category?.id;

    const matchSearch =
      !keyword ||
      plan.name?.toLowerCase().includes(keyword) ||
      plan.description?.toLowerCase().includes(keyword) ||
      plan.category?.name?.toLowerCase().includes(keyword) ||
      String(plan.id).includes(keyword);

    const matchCategory =
      !categoryId || String(planCategoryId) === String(categoryId);

    return matchSearch && matchCategory;
  });

  const activePlans = filteredPlans.filter((plan) => plan.isActive).length;
  const inactivePlans = filteredPlans.filter((plan) => !plan.isActive).length;

  const stats = [
    {
      title: "Total",
      value: meta.total,
      icon: "📋",
      accent: "#6B8E23",
      bg: "#EEF5D6",
    },
    {
      title: "Active",
      value: activePlans,
      icon: "✅",
      accent: "#8AAD3A",
      bg: "#F0F5E0",
    },
    {
      title: "Inactive",
      value: inactivePlans,
      icon: "⏸️",
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
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.25em] text-[#6B8E23]">
              Admin Panel
            </p>

            <h1
              className="text-3xl font-bold tracking-tight text-[#1e2a04] sm:text-4xl"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Catering Plans
            </h1>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-[#6B705C]">
              Kelola paket catering berdasarkan kategori seperti Diet, Family,
              Healthy, dan lainnya.
            </p>
          </div>

          <div className="w-fit">
            <AddPlan
              categories={categories}
              onSuccess={() => getPlans(page, search, categoryId)}
            />
          </div>
        </div>

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
                Manage Plans
              </p>

              <h2
                className="text-2xl font-bold text-white sm:text-4xl"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Paket catering sehat untuk customer 🥗
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-[#e7f5c9]">
                Atur nama plan, kategori, harga, durasi, dan status aktif agar
                customer bisa memilih paket yang sesuai.
              </p>
            </div>

            <div className="w-fit rounded-2xl bg-white/15 px-4 py-3 text-sm font-semibold text-white backdrop-blur">
              {meta.total} plans tersedia
            </div>
          </div>
        </div>

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
                Filter Plans
              </h2>

              <p className="text-xs font-medium text-[#8a9a62]">
                Cari plan berdasarkan nama, deskripsi, atau kategori.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSearch}
            className="grid gap-3 xl:grid-cols-[1fr_240px_auto]"
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
                placeholder="Cari catering plan..."
                className="w-full rounded-2xl border border-[#DDE5C2] bg-[#F9FAF4] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#6B8E23] focus:ring-2 focus:ring-[#DDE5C2]"
              />
            </div>

            <select
              value={categoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full rounded-2xl border border-[#DDE5C2] bg-[#F9FAF4] px-4 py-3 text-sm outline-none transition focus:border-[#6B8E23] focus:ring-2 focus:ring-[#DDE5C2]"
            >
              <option value="">Semua Category</option>

              {categories.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.name}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="rounded-2xl bg-[#283618] px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#1f2b13]"
            >
              Filter
            </button>
          </form>
        </div>

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
                  Data Catering Plans
                </h2>

                <p className="text-xs font-medium text-[#8a9a62]">
                  Total data: {filteredPlans.length}
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
          ) : filteredPlans.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <span className="mb-3 text-5xl">📭</span>

              <p className="text-sm font-semibold text-[#8a9a62]">
                Data catering plans kosong
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 p-5 xl:hidden">
                {filteredPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="rounded-3xl bg-[#F9FAF4] p-5"
                    style={{ border: "0.5px solid #E8EED0" }}
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#8a9a62]">
                          #{plan.id}
                        </p>

                        <h3 className="mt-1 break-words text-lg font-bold text-[#1e2a04]">
                          {plan.name}
                        </h3>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                          plan.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {plan.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <p className="line-clamp-2 text-sm leading-6 text-[#6B705C]">
                      {plan.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#E8EED0] px-3 py-1 text-xs font-bold text-[#4e6b12]">
                        <Tag size={13} />
                        {plan.category?.name ||
                          (plan.categoryId
                            ? `Category ID: ${plan.categoryId}`
                            : "-")}
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-full bg-[#FDF3E7] px-3 py-1 text-xs font-bold text-[#a06020]">
                        <Wallet size={13} />
                        {formatRupiah(plan.price)}
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#6B705C]">
                        <CalendarDays size={13} />
                        {plan.duration} hari
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 border-t border-[#E8EED0] pt-4">
                      <EditPlan
                        selectedData={plan}
                        categories={categories}
                        onSuccess={() => getPlans(page, search, categoryId)}
                      />

                      <DeletePlan
                        selectedData={plan}
                        onSuccess={() => getPlans(page, search, categoryId)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden w-full xl:block">
                <table className="w-full table-fixed">
                  <colgroup>
                    <col className="w-[8%]" />
                    <col className="w-[34%]" />
                    <col className="w-[25%]" />
                    <col className="w-[15%]" />
                    <col className="w-[18%]" />
                  </colgroup>

                  <thead className="bg-[#E8EED0]">
                    <tr>
                      <th className="border-b border-[#DDE5C2] p-4 text-left text-xs font-bold uppercase tracking-widest text-[#283618]">
                        ID
                      </th>

                      <th className="border-b border-[#DDE5C2] p-4 text-left text-xs font-bold uppercase tracking-widest text-[#283618]">
                        Plan
                      </th>

                      <th className="border-b border-[#DDE5C2] p-4 text-left text-xs font-bold uppercase tracking-widest text-[#283618]">
                        Detail
                      </th>

                      <th className="border-b border-[#DDE5C2] p-4 text-left text-xs font-bold uppercase tracking-widest text-[#283618]">
                        Status
                      </th>

                      <th className="border-b border-[#DDE5C2] p-4 text-left text-xs font-bold uppercase tracking-widest text-[#283618]">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredPlans.map((plan) => (
                      <tr
                        key={plan.id}
                        className="transition hover:bg-[#F6F7EF]"
                      >
                        <td className="border-b border-[#E8EED0] p-4 text-sm font-semibold text-[#6B705C]">
                          #{plan.id}
                        </td>

                        <td className="border-b border-[#E8EED0] p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#E8EED0] text-[#4e6b12]">
                              <Tag size={18} />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-bold text-[#283618]">
                                {plan.name}
                              </p>

                              <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#6B705C]">
                                {plan.description || "-"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="border-b border-[#E8EED0] p-4">
                          <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#E8EED0] px-3 py-1 text-xs font-bold text-[#4e6b12]">
                              <Tag size={13} />
                              {plan.category?.name ||
                                (plan.categoryId
                                  ? `Category ID: ${plan.categoryId}`
                                  : "-")}
                            </span>

                            <span className="inline-flex items-center gap-1 rounded-full bg-[#FDF3E7] px-3 py-1 text-xs font-bold text-[#a06020]">
                              <Wallet size={13} />
                              {formatRupiah(plan.price)}
                            </span>

                            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#6B705C]">
                              <CalendarDays size={13} />
                              {plan.duration} hari
                            </span>
                          </div>
                        </td>

                        <td className="border-b border-[#E8EED0] p-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              plan.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {plan.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="border-b border-[#E8EED0] p-4">
                          <div className="flex flex-wrap gap-2">
                            <EditPlan
                              selectedData={plan}
                              categories={categories}
                              onSuccess={() =>
                                getPlans(page, search, categoryId)
                              }
                            />

                            <DeletePlan
                              selectedData={plan}
                              onSuccess={() =>
                                getPlans(page, search, categoryId)
                              }
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
        </div>
      </div>
    </div>
  );
}