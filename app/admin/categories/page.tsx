"use client";

import { useEffect, useState } from "react";
import { Search, Tag } from "lucide-react";
import { getCookie } from "@/lib/client-cookie";
import AddCategory from "./add";
import EditCategory from "./edit";
import DeleteCategory from "./delete";

export type Category = {
  id: number;
  name: string;
  description?: string;
};

type Meta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type CategoryResponse = {
  data: Category[];
  meta: Meta;
};

function getToken() {
  return getCookie("accessToken") || getCookie("accesstoken") || "";
}

function getArrayData<T>(result: any): T[] {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.data?.data)) return result.data.data;
  if (Array.isArray(result?.categories)) return result.categories;
  return [];
}

function getErrorMessage(result: any, fallback: string) {
  if (Array.isArray(result?.message)) return result.message.join(", ");
  return result?.message || fallback;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<Meta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  async function getCategories(currentPage = page) {
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
      params.set("limit", "100");

      const response = await fetch(`${baseUrl}/categories?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const result: CategoryResponse | any = await response.json();

      if (!response.ok) {
        alert(getErrorMessage(result, "Gagal mengambil data kategori"));
        return;
      }

      const categoryData = getArrayData<Category>(result);

      setCategories(categoryData);

      setMeta(
        result?.meta ||
          result?.data?.meta || {
            total: categoryData.length,
            page: currentPage,
            limit: 100,
            totalPages: 1,
          }
      );
    } catch (error) {
      console.error("GET CATEGORIES ERROR:", error);
      alert("Terjadi kesalahan saat mengambil kategori");
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
    getCategories(newPage);
  }

  function handleNextPage() {
    if (page >= meta.totalPages) return;

    const newPage = page + 1;
    setPage(newPage);
    getCategories(newPage);
  }

  useEffect(() => {
    getCategories(1);
  }, []);

  const filteredCategories = categories.filter((category) => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return true;

    return (
      category.name?.toLowerCase().includes(keyword) ||
      category.description?.toLowerCase().includes(keyword) ||
      String(category.id).includes(keyword)
    );
  });

  const stats = [
    {
      title: "Total",
      value: meta.total,
      icon: "🏷️",
      accent: "#6B8E23",
      bg: "#EEF5D6",
    },
    {
      title: "Hasil Filter",
      value: filteredCategories.length,
      icon: "🔎",
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
              Categories
            </h1>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-[#6B705C]">
              Kelola kategori untuk catering plans seperti Diet, Family,
              Healthy, Protein, dan lainnya.
            </p>
          </div>

          <div className="w-fit">
            <AddCategory onSuccess={() => getCategories(page)} />
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
                Manage Categories
              </p>

              <h2
                className="text-2xl font-bold text-white sm:text-4xl"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Atur kategori catering dengan rapi 🏷️
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-[#e7f5c9]">
                Kategori dipakai untuk mengelompokkan catering plan agar customer
                lebih mudah memilih paket sesuai kebutuhan.
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
                Search Categories
              </h2>

              <p className="text-xs font-medium text-[#8a9a62]">
                Cari kategori berdasarkan nama, deskripsi, atau ID
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
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Cari kategori..."
                className="w-full rounded-2xl border border-[#DDE5C2] bg-[#F9FAF4] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#6B8E23] focus:ring-2 focus:ring-[#DDE5C2]"
              />
            </div>
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
                  Data Kategori
                </h2>

                <p className="text-xs font-medium text-[#8a9a62]">
                  Total data: {filteredCategories.length}
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
          ) : filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <span className="mb-3 text-5xl">📭</span>

              <p className="text-sm font-semibold text-[#8a9a62]">
                Data kategori tidak ditemukan
              </p>
            </div>
          ) : (
            <>
              {/* MOBILE + TABLET CARD */}
              <div className="grid gap-4 p-5 xl:hidden">
                {filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className="rounded-3xl bg-[#F9FAF4] p-5"
                    style={{ border: "0.5px solid #E8EED0" }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#8a9a62]">
                          #{category.id}
                        </p>

                        <h3 className="mt-1 break-words text-lg font-bold text-[#1e2a04]">
                          {category.name}
                        </h3>

                        {category.description && (
                          <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#6B705C]">
                            {category.description}
                          </p>
                        )}
                      </div>

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#E8EED0] text-[#4e6b12]">
                        <Tag size={18} />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 border-t border-[#E8EED0] pt-4">
                      <EditCategory
                        selectedData={category}
                        onSuccess={() => getCategories(page)}
                      />

                      <DeleteCategory
                        selectedData={category}
                        onSuccess={() => getCategories(page)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden w-full overflow-x-auto xl:block">
                <table className="w-full min-w-[620px] table-fixed">
                  <colgroup>
                    <col className="w-[12%]" />
                    <col className="w-[58%]" />
                    <col className="w-[30%]" />
                  </colgroup>

                  <thead className="bg-[#E8EED0]">
                    <tr>
                      <th className="border-b border-[#DDE5C2] p-4 text-left text-xs font-bold uppercase tracking-widest text-[#283618]">
                        ID
                      </th>

                      <th className="border-b border-[#DDE5C2] p-4 text-left text-xs font-bold uppercase tracking-widest text-[#283618]">
                        Nama Kategori
                      </th>

                      <th className="border-b border-[#DDE5C2] p-4 text-left text-xs font-bold uppercase tracking-widest text-[#283618]">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCategories.map((category) => (
                      <tr
                        key={category.id}
                        className="transition hover:bg-[#F6F7EF]"
                      >
                        <td className="border-b border-[#E8EED0] p-4 text-sm font-semibold text-[#6B705C]">
                          #{category.id}
                        </td>

                        <td className="border-b border-[#E8EED0] p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E8EED0] text-[#4e6b12]">
                              <Tag size={18} />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-bold text-[#283618]">
                                {category.name}
                              </p>

                              {category.description && (
                                <p className="mt-1 truncate text-xs text-[#6B705C]">
                                  {category.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="border-b border-[#E8EED0] p-4">
                          <div className="flex flex-wrap gap-2">
                            <EditCategory
                              selectedData={category}
                              onSuccess={() => getCategories(page)}
                            />

                            <DeleteCategory
                              selectedData={category}
                              onSuccess={() => getCategories(page)}
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