"use client";

import { useEffect, useState } from "react";
import {
  Search,
  User,
  Wallet,
  MapPin,
  PackageCheck,
  Clock,
} from "lucide-react";
import { getCookie } from "@/lib/client-cookie";
import DeleteSubscription from "./delete";
import ExportSubscriptions from "./export";

type UserData = {
  id?: number;
  name?: string;
  email?: string;
  fullAddress?: string;
  addressDetail?: string;
};

type CateringPlan = {
  id?: number;
  name?: string;
  price?: number;
  duration?: number;
};

export type Subscription = {
  id: number;
  userId?: number;
  customerId?: number;
  cateringPlanId?: number;

  startDate?: string;
  endDate?: string;
  createdAt?: string;

  totalPrice?: number;
  price?: number;

  status?: string;

  user?: UserData;
  customer?: UserData;
  cateringPlan?: CateringPlan;
  plan?: CateringPlan;
};

type Meta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type SubscriptionResponse = {
  data: Subscription[];
  meta?: Meta;
};

const LIMIT = 5;

function getToken() {
  return getCookie("accessToken") || getCookie("accesstoken") || "";
}

function getArrayData<T>(result: any): T[] {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.data?.data)) return result.data.data;
  if (Array.isArray(result?.subscriptions)) return result.subscriptions;
  if (Array.isArray(result?.items)) return result.items;
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

function formatRupiah(value?: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(date)
    .replaceAll("/", "-");
}

function addDaysInclusive(startDate?: string, duration?: number) {
  if (!startDate) return "-";

  const start = new Date(startDate);

  if (Number.isNaN(start.getTime())) return "-";

  const totalDays = Number(duration || 1);
  const end = new Date(start);

  end.setDate(start.getDate() + totalDays - 1);

  return formatDate(end.toISOString());
}

function getCustomerName(subscription: Subscription) {
  return (
    subscription.user?.name ||
    subscription.customer?.name ||
    `Customer #${subscription.userId || subscription.customerId || "-"}`
  );
}

function getCustomerEmail(subscription: Subscription) {
  return subscription.user?.email || subscription.customer?.email || "-";
}

function getCustomerAddress(subscription: Subscription) {
  const fullAddress =
    subscription.user?.fullAddress || subscription.customer?.fullAddress || "";

  const detail =
    subscription.user?.addressDetail ||
    subscription.customer?.addressDetail ||
    "";

  if (!fullAddress && !detail) return "-";

  return [fullAddress, detail].filter(Boolean).join(", ");
}

function getPlanName(subscription: Subscription) {
  return (
    subscription.cateringPlan?.name ||
    subscription.plan?.name ||
    `Plan #${subscription.cateringPlanId || "-"}`
  );
}

function getPlanPrice(subscription: Subscription) {
  return (
    subscription.totalPrice ||
    subscription.price ||
    subscription.cateringPlan?.price ||
    subscription.plan?.price ||
    0
  );
}

function getPlanDuration(subscription: Subscription) {
  return subscription.cateringPlan?.duration || subscription.plan?.duration || 1;
}

function getStartDate(subscription: Subscription) {
  return subscription.startDate || subscription.createdAt;
}

function getEndDate(subscription: Subscription) {
  const startDate = getStartDate(subscription);
  const duration = getPlanDuration(subscription);

  return addDaysInclusive(startDate, duration);
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

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [meta, setMeta] = useState<Meta>({
    total: 0,
    page: 1,
    limit: LIMIT,
    totalPages: 1,
  });

  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  async function getSubscriptions(currentPage = page) {
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

      const response = await fetch(`${baseUrl}/subscriptions?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const result: SubscriptionResponse | any = await readJsonSafe(response);

      console.log("GET SUBSCRIPTIONS RESULT:", result);

      if (!response.ok) {
        alert(getErrorMessage(result, "Gagal mengambil data subscriptions"));
        return;
      }

      const subscriptionData = getArrayData<Subscription>(result);

      setSubscriptions(subscriptionData);
      setMeta(getMeta(result, subscriptionData.length, currentPage));
    } catch (error) {
      console.error("GET SUBSCRIPTIONS ERROR:", error);
      alert("Terjadi kesalahan saat mengambil subscriptions");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPage(1);
    getSubscriptions(1);
  }

  function handlePrevPage() {
    if (page <= 1) return;

    const newPage = page - 1;
    setPage(newPage);
    getSubscriptions(newPage);
  }

  function handleNextPage() {
    if (page >= meta.totalPages) return;

    const newPage = page + 1;
    setPage(newPage);
    getSubscriptions(newPage);
  }

  useEffect(() => {
    getSubscriptions(1);
  }, []);

  const filteredSubscriptions = subscriptions.filter((subscription) => {
    const keyword = search.trim().toLowerCase();

    const customerName = getCustomerName(subscription).toLowerCase();
    const customerEmail = getCustomerEmail(subscription).toLowerCase();
    const planName = getPlanName(subscription).toLowerCase();
    const startDate = formatDate(getStartDate(subscription)).toLowerCase();
    const endDate = getEndDate(subscription).toLowerCase();
    const id = String(subscription.id);

    return (
      !keyword ||
      customerName.includes(keyword) ||
      customerEmail.includes(keyword) ||
      planName.includes(keyword) ||
      startDate.includes(keyword) ||
      endDate.includes(keyword) ||
      id.includes(keyword)
    );
  });

  const stats = [
    {
      title: "Total",
      value: meta.total,
      icon: "📦",
      accent: "#6B8E23",
      bg: "#EEF5D6",
    },
    {
      title: "Current",
      value: filteredSubscriptions.length,
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
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.25em] text-[#6B8E23]">
              Admin Panel
            </p>

            <h1
              className="text-3xl font-bold tracking-tight text-[#1e2a04] sm:text-4xl"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Subscriptions
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#6B705C]">
              Kelola subscription customer yang memesan catering plans.
            </p>
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
                Customer Subscriptions
              </p>

              <h2
                className="text-2xl font-bold text-white sm:text-4xl"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Pantau pesanan subscription customer 📦
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-[#e7f5c9]">
                Lihat customer, paket catering, tanggal mulai sampai tanggal
                akhir, dan alamat pengiriman.
              </p>
            </div>

            <div className="w-fit rounded-2xl bg-white/15 px-4 py-3 text-sm font-semibold text-white backdrop-blur">
              {meta.total} subscriptions
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((item) => (
            <div
              key={item.title}
              className="group relative flex min-h-[150px] flex-col justify-between overflow-hidden rounded-3xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              style={{ border: "0.5px solid #d3e2a0" }}
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg"
                  style={{
                    background: item.bg,
                    border: "0.5px solid #d3e2a0",
                  }}
                >
                  {item.icon}
                </div>

                <div
                  className="h-9 w-9 rounded-full opacity-20 transition group-hover:scale-125"
                  style={{ background: item.accent }}
                />
              </div>

              <div>
                <p className="mt-4 text-xs font-bold uppercase tracking-widest text-[#8a9a62]">
                  {item.title}
                </p>

                <h2
                  className="mt-1 text-3xl font-bold text-[#1e2a04]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {loading ? (
                    <span
                      className="inline-block h-8 w-16 animate-pulse rounded-lg"
                      style={{ background: item.bg }}
                    />
                  ) : (
                    item.value
                  )}
                </h2>
              </div>

              <div
                className="absolute bottom-0 left-0 right-0 h-1 rounded-b-3xl"
                style={{ background: item.accent }}
              />
            </div>
          ))}
        </div>

        {/* FILTER */}
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
                Search Subscriptions
              </h2>

              <p className="text-xs font-medium text-[#8a9a62]">
                Cari berdasarkan customer, email, nama plan, tanggal, atau ID.
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
                placeholder="Cari subscriptions..."
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
          <div className="flex flex-col gap-4 border-b border-[#E8EED0] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div
                className="mt-1 h-10 w-1 rounded-full"
                style={{ background: "#6B8E23" }}
              />

              <div>
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                  <h1 className="text-2xl font-bold text-[#283618]">
                    Data Subscriptions
                  </h1>

                  <p className="text-sm text-[#6B705C]">
                    Kelola data subscription customer.
                  </p>
                </div>

                <div className="mt-4">
                  <ExportSubscriptions subscriptions={filteredSubscriptions} />
                </div>

                <p className="mt-2 text-xs font-medium text-[#8a9a62]">
                  Total data: {filteredSubscriptions.length}
                </p>
              </div>
            </div>

            <span className="w-fit rounded-full bg-[#e8f0c8] px-3 py-1 text-xs font-bold text-[#4e6b12]">
              Page {meta.page || page} of {meta.totalPages || 1}
            </span>
          </div>

          {loading ? (
            <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-[360px] animate-pulse rounded-3xl bg-[#F0F5E0]"
                />
              ))}
            </div>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <span className="mb-3 text-5xl">📭</span>

              <p className="text-sm font-semibold text-[#8a9a62]">
                Data subscriptions kosong
              </p>
            </div>
          ) : (
            <>
              {/* MOBILE + TABLET CARD */}
              <div className="grid items-stretch gap-4 p-5 md:grid-cols-2 xl:hidden">
                {filteredSubscriptions.map((subscription) => (
                  <div
                    key={subscription.id}
                    className="flex h-full min-h-[390px] flex-col justify-between rounded-3xl bg-[#F9FAF4] p-5"
                    style={{ border: "0.5px solid #E8EED0" }}
                  >
                    <div>
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold uppercase tracking-widest text-[#8a9a62]">
                            #{subscription.id}
                          </p>

                          <h3 className="mt-1 line-clamp-2 text-lg font-bold leading-6 text-[#1e2a04]">
                            {getCustomerName(subscription)}
                          </h3>

                          <p className="mt-1 truncate text-xs font-semibold text-[#6B8E23]">
                            {getCustomerEmail(subscription)}
                          </p>
                        </div>

                        <div className="shrink-0">
                          <DeleteSubscription
                            selectedData={subscription}
                            onSuccess={() => getSubscriptions(page)}
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <div
                          className="rounded-2xl bg-white px-4 py-3"
                          style={{ border: "0.5px solid #E8EED0" }}
                        >
                          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#8a9a62]">
                            Plan
                          </p>

                          <div className="flex flex-wrap gap-2">
                            <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-[#E8EED0] px-3 py-1 text-xs font-bold text-[#4e6b12]">
                              <PackageCheck size={13} />
                              <span className="truncate">
                                {getPlanName(subscription)}
                              </span>
                            </span>

                            <span className="inline-flex items-center gap-1 rounded-full bg-[#FDF3E7] px-3 py-1 text-xs font-bold text-[#a06020]">
                              <Wallet size={13} />
                              {formatRupiah(getPlanPrice(subscription))}
                            </span>

                            <span className="inline-flex items-center gap-1 rounded-full bg-[#F9FAF4] px-3 py-1 text-xs font-bold text-[#6B705C]">
                              <Clock size={13} />
                              {getPlanDuration(subscription)} hari
                            </span>
                          </div>
                        </div>

                        <div
                          className="rounded-2xl bg-white px-4 py-3"
                          style={{ border: "0.5px solid #E8EED0" }}
                        >
                          <p className="text-xs font-bold uppercase tracking-widest text-[#8a9a62]">
                            Tanggal Subscription
                          </p>

                          <p className="mt-1 text-sm font-bold leading-6 text-[#283618]">
                            {formatDate(getStartDate(subscription))} sampai{" "}
                            {getEndDate(subscription)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      className="mt-4 min-h-[92px] rounded-2xl bg-white px-4 py-3"
                      style={{ border: "0.5px solid #E8EED0" }}
                    >
                      <p className="text-xs font-bold uppercase tracking-widest text-[#8a9a62]">
                        Address
                      </p>

                      <p className="mt-1 line-clamp-3 text-sm leading-6 text-[#6B705C]">
                        {getCustomerAddress(subscription)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden w-full xl:block">
                <table className="w-full table-fixed">
                  <colgroup>
                    <col className="w-[24%]" />
                    <col className="w-[25%]" />
                    <col className="w-[18%]" />
                    <col className="w-[23%]" />
                    <col className="w-[10%]" />
                  </colgroup>

                  <thead className="bg-[#E8EED0]">
                    <tr>
                      <th className="border-b border-[#DDE5C2] px-3 py-4 text-left text-xs font-bold uppercase tracking-widest text-[#283618]">
                        Customer
                      </th>

                      <th className="border-b border-[#DDE5C2] px-4 py-4 text-left text-xs font-bold uppercase tracking-widest text-[#283618]">
                        Plan
                      </th>

                      <th className="border-b border-[#DDE5C2] px-4 py-4 text-left text-xs font-bold uppercase tracking-widest text-[#283618]">
                        Tanggal
                      </th>

                      <th className="border-b border-[#DDE5C2] px-4 py-4 text-left text-xs font-bold uppercase tracking-widest text-[#283618]">
                        Address
                      </th>

                      <th className="border-b border-[#DDE5C2] px-4 py-4 text-left text-xs font-bold uppercase tracking-widest text-[#283618]">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredSubscriptions.map((subscription) => (
                      <tr
                        key={subscription.id}
                        className="h-[112px] transition hover:bg-[#F6F7EF]"
                      >
                        <td className="border-b border-[#E8EED0] px-4 py-4 align-middle">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#E8EED0] text-[#4e6b12]">
                              <User size={18} />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-bold text-[#283618]">
                                {getCustomerName(subscription)}
                              </p>

                              <p className="mt-1 truncate text-xs font-semibold text-[#6B8E23]">
                                {getCustomerEmail(subscription)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="border-b border-[#E8EED0] px-4 py-4 align-middle">
                          <p className="truncate font-bold text-[#283618]">
                            {getPlanName(subscription)}
                          </p>

                          <div className="mt-2 flex w-fit flex-col gap-2">
                            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-[#FDF3E7] px-3 py-1 text-xs font-bold text-[#a06020]">
                              <Wallet size={13} />
                              {formatRupiah(getPlanPrice(subscription))}
                            </span>

                            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#6B705C]">
                              <Clock size={13} />
                              {getPlanDuration(subscription)} hari
                            </span>
                          </div>
                        </td>

                        <td className="border-b border-[#E8EED0] px-4 py-4 align-middle">
                          <div className="space-y-1 text-sm font-semibold text-[#6B705C]">
                            <p className="truncate">
                              Mulai: {formatDate(getStartDate(subscription))}
                            </p>

                            <p className="truncate">
                              Selesai: {getEndDate(subscription)}
                            </p>
                          </div>
                        </td>

                        <td className="border-b border-[#E8EED0] px-4 py-4 align-middle">
                          <p className="line-clamp-2 text-xs leading-5 text-[#6B705C]">
                            <MapPin size={11} className="mr-1 inline" />
                            {getCustomerAddress(subscription)}
                          </p>
                        </td>

                        <td className="border-b border-[#E8EED0] px-4 py-4 align-middle">
                          <div className="flex justify-start">
                            <DeleteSubscription
                              selectedData={subscription}
                              onSuccess={() => getSubscriptions(page)}
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