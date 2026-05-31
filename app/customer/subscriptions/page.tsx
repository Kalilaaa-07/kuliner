"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Home,
  Package,
  ClipboardList,
  User,
  CalendarDays,
  Clock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { getCookie } from "@/lib/client-cookie";

type CateringPlan = {
  id?: number;
  name?: string;
  description?: string;
  price?: number;
  duration?: number;
  imageUrl?: string;
  category?: {
    id?: number;
    name?: string;
  };
};

type Subscription = {
  id: number;
  status?: string;
  cateringPlanId?: number;
  durationDays?: number;
  totalPrice?: number;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
  cateringPlan?: CateringPlan;
  plan?: CateringPlan;
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
  if (Array.isArray(result?.subscriptions)) return result.subscriptions;
  if (Array.isArray(result?.data?.subscriptions)) return result.data.subscriptions;
  return [];
}

function normalizeDate(dateString?: string) {
  if (!dateString) return null;

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;

  date.setHours(0, 0, 0, 0);
  return date;
}

function addInclusiveDays(date: Date, duration: number) {
  const newDate = new Date(date);

  // Durasi 7 hari:
  // hari 1 = tanggal mulai
  // jadi tanggal selesai = start + 6 hari
  newDate.setDate(newDate.getDate() + duration - 1);
  newDate.setHours(0, 0, 0, 0);

  return newDate;
}

function differenceInDays(start: Date, end: Date) {
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor((end.getTime() - start.getTime()) / oneDay);
}

function formatDateFromDate(date?: Date | null) {
  if (!date) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getPlan(subscription: Subscription) {
  return subscription.cateringPlan || subscription.plan || {};
}

function getSubscriptionProgress(subscription: Subscription) {
  const plan = getPlan(subscription);

  const duration =
    Number(subscription.durationDays) || Number(plan.duration) || 0;

  const startDate =
    normalizeDate(subscription.startDate) ||
    normalizeDate(subscription.createdAt);

  if (!startDate || duration <= 0) {
    return {
      duration,
      currentDay: 0,
      remainingDays: duration,
      progressPercent: 0,
      startText: "-",
      endText: "-",
      statusText: "Belum bisa dihitung",
    };
  }

  // INI YANG DIBENERIN:
  // Jangan pakai subscription.endDate dari backend untuk tampilan,
  // karena backend bisa ngirim 1 hari lebih.
  const endDate = addInclusiveDays(startDate, duration);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentDay = differenceInDays(startDate, today) + 1;

  if (today < startDate) {
    currentDay = 0;
  }

  if (currentDay > duration) {
    currentDay = duration;
  }

  let remainingDays = differenceInDays(today, endDate) + 1;

  if (today < startDate) {
    remainingDays = duration;
  }

  if (remainingDays < 0) {
    remainingDays = 0;
  }

  const progressPercent =
    duration > 0
      ? Math.min(100, Math.max(0, (currentDay / duration) * 100))
      : 0;

  let statusText = "Berjalan";

  if (today < startDate) {
    statusText = "Belum mulai";
  } else if (today > endDate) {
    statusText = "Selesai";
  }

  return {
    duration,
    currentDay,
    remainingDays,
    progressPercent,
    startText: formatDateFromDate(startDate),
    endText: formatDateFromDate(endDate),
    statusText,
  };
}

function statusStyle(status?: string, calculatedStatus?: string) {
  const value = (status || calculatedStatus || "").toLowerCase();

  if (value.includes("active") || value.includes("berjalan")) {
    return {
      background: "#e8f0c8",
      color: "#4e6b12",
      border: "0.5px solid #c2da85",
      label: "Aktif",
    };
  }

  if (value.includes("pending")) {
    return {
      background: "#fff8eb",
      color: "#a06020",
      border: "0.5px solid #f0c97a",
      label: "Pending",
    };
  }

  if (
    value.includes("done") ||
    value.includes("complete") ||
    value.includes("selesai")
  ) {
    return {
      background: "#eef5d6",
      color: "#4e6b12",
      border: "0.5px solid #c2da85",
      label: "Selesai",
    };
  }

  if (value.includes("cancel") || value.includes("reject")) {
    return {
      background: "#fff1f1",
      color: "#b42318",
      border: "0.5px solid #ffc9c9",
      label: "Dibatalkan",
    };
  }

  return {
    background: "#f0f5e0",
    color: "#6a7a4a",
    border: "0.5px solid #d3e2a0",
    label: status || calculatedStatus || "Subscription",
  };
}

export default function CustomerSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  async function getSubscriptions() {
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

      const endpoints = [
        `${baseUrl}/subscriptions/my`,
        `${baseUrl}/subscriptions/me`,
        `${baseUrl}/subscriptions`,
      ];

      let success = false;
      let lastMessage = "Gagal mengambil subscriptions";

      for (const endpoint of endpoints) {
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const result = await response.json();

        if (response.ok) {
          const data = getArrayData<Subscription>(result);
          setSubscriptions(data);
          success = true;
          break;
        }

        lastMessage = Array.isArray(result?.message)
          ? result.message.join(", ")
          : result?.message || lastMessage;
      }

      if (!success) {
        alert(lastMessage);
        setSubscriptions([]);
      }
    } catch (error) {
      console.error("SUBSCRIPTIONS ERROR:", error);
      alert("Terjadi kesalahan saat mengambil subscriptions");
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getSubscriptions();
  }, []);

  const activeSubscriptions = subscriptions.filter((item) => {
    const progress = getSubscriptionProgress(item);
    const status = (item.status || "").toLowerCase();

    return (
      progress.remainingDays > 0 &&
      !status.includes("cancel") &&
      !status.includes("reject")
    );
  });

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
      {/* HEADER */}
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
                NutriCater
              </p>
            </div>

            <h1
              className="mt-0.5 text-2xl font-bold leading-tight"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#1e2a04",
              }}
            >
              Subscriptions
            </h1>

            <p className="mt-1 max-w-md text-sm leading-6 text-[#6a7a4a]">
              Lihat paket catering yang sudah kamu subscribe dan progres
              harinya.
            </p>
          </div>

          <Link
            href="/customer/customer-plans"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white transition hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #6b8e23, #8aad3a)",
              border: "2px solid #d3e2a0",
              boxShadow: "0 4px 12px #6b8e2325",
            }}
          >
            <Package size={22} />
          </Link>
        </div>

        {/* HERO */}
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
                Catering berjalan
              </span>

              <h2
                className="mt-2.5 text-xl font-bold leading-snug text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Pantau hari keberapa
                <br />
                catering kamu sekarang.
              </h2>

              <p className="mt-2 max-w-sm text-xs leading-5 text-[#d4eaa0]">
                Sistem menghitung progress dari tanggal mulai dan durasi paket.
              </p>
            </div>

            <div className="hidden select-none text-6xl sm:block">📅</div>
          </div>
        </div>

        {/* QUICK STATS */}
        <div
          className="mt-4 grid grid-cols-2 divide-x divide-[#d3e2a0] rounded-2xl py-4"
          style={{
            background: "#ffffffcc",
            border: "0.5px solid #d3e2a0",
            backdropFilter: "blur(6px)",
          }}
        >
          {[
            {
              icon: "🥗",
              label: "Total",
              value: loading ? "..." : subscriptions.length || "—",
            },
            {
              icon: "✅",
              label: "Aktif",
              value: loading ? "..." : activeSubscriptions.length || "—",
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

      {/* LIST */}
      <section className="mt-7 px-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} style={{ color: "#6b8e23" }} />

              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "#6b8e23" }}
              >
                Riwayat Subscribe
              </p>
            </div>

            <h2
              className="text-xl font-bold"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Paket Catering Kamu
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="rounded-3xl p-5"
                style={{
                  background: "#ffffffcc",
                  border: "0.5px solid #d3e2a0",
                }}
              >
                <div className="mb-4 flex gap-4">
                  <div className="h-20 w-20 shrink-0 animate-pulse rounded-2xl bg-[#e8f0c8]" />
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="h-4 w-3/4 animate-pulse rounded-full bg-[#e8f0c8]" />
                    <div className="h-3 w-1/3 animate-pulse rounded-full bg-[#f0f5e0]" />
                    <div className="h-3 w-full animate-pulse rounded-full bg-[#f0f5e0]" />
                  </div>
                </div>

                <div className="h-3 w-full animate-pulse rounded-full bg-[#e8f0c8]" />
              </div>
            ))}
          </div>
        ) : subscriptions.length === 0 ? (
          <div
            className="flex flex-col items-center rounded-3xl p-8 text-center"
            style={{
              background: "#ffffffcc",
              border: "0.5px solid #d3e2a0",
            }}
          >
            <span className="mb-3 text-5xl">📭</span>

            <p
              className="font-bold"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#1e2a04",
              }}
            >
              Belum ada subscription
            </p>

            <p className="mt-1.5 text-sm leading-6 text-[#8a9a62]">
              Kamu belum subscribe paket catering apapun.
            </p>

            <Link
              href="/customer/customer-plans"
              className="mt-5 rounded-2xl px-5 py-3 text-sm font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #6b8e23, #8aad3a)",
              }}
            >
              Cari Catering Plan
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((subscription) => {
              const plan = getPlan(subscription);
              const progress = getSubscriptionProgress(subscription);
              const style = statusStyle(subscription.status, progress.statusText);

              return (
                <div
                  key={subscription.id}
                  className="rounded-3xl p-4 transition hover:-translate-y-0.5"
                  style={{
                    background: "#ffffffee",
                    border: "0.5px solid #d3e2a0",
                    boxShadow: "0 2px 12px #1e2a0408",
                  }}
                >
                  <div className="flex gap-4">
                    <div
                      className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-4xl"
                      style={{
                        background:
                          "linear-gradient(135deg, #e8f0c8, #d3e2a0)",
                      }}
                    >
                      {plan.imageUrl ? (
                        <img
                          src={plan.imageUrl}
                          alt={plan.name || "Catering Plan"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        "🥗"
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3
                            className="line-clamp-1 font-bold leading-tight"
                            style={{ color: "#1e2a04", fontSize: 15 }}
                          >
                            {plan.name ||
                              `Plan #${subscription.cateringPlanId || "-"}`}
                          </h3>

                          <span
                            className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                            style={{
                              background: style.background,
                              color: style.color,
                              border: style.border,
                            }}
                          >
                            {style.label}
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
                            {formatRupiah(
                              Number(subscription.totalPrice || plan.price || 0)
                            )}
                          </p>
                        </div>
                      </div>

                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#6a7a4a]">
                        {plan.description ||
                          "Paket catering sehat pilihan kamu."}
                      </p>

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
                          {progress.duration || "-"} hari
                        </span>

                        <span
                          className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                          style={{
                            background: "#f0f5e0",
                            color: "#4e6b12",
                            border: "0.5px solid #c2da85",
                          }}
                        >
                          <Clock size={11} />
                          Hari ke-{progress.currentDay}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* PROGRESS */}
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[#6a7a4a]">
                      <span>
                        {progress.startText} - {progress.endText}
                      </span>

                      <span>{Math.round(progress.progressPercent)}%</span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-[#e8f0c8]">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${progress.progressPercent}%`,
                          background:
                            "linear-gradient(135deg, #6b8e23, #8aad3a)",
                        }}
                      />
                    </div>

                    <div
                      className="mt-3 rounded-2xl px-4 py-3"
                      style={{
                        background: "#f6f9ee",
                        border: "0.5px solid #E8EED0",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-[#6B8E23]" />

                        <p className="text-sm font-bold text-[#1e2a04]">
                          {progress.remainingDays > 0
                            ? `Sekarang hari ke-${progress.currentDay} dari ${progress.duration} hari.`
                            : "Subscription ini sudah selesai."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* BOTTOM NAV */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t px-6 py-3"
        style={{
          background: "#ffffffee",
          borderColor: "#d3e2a0",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="mx-auto flex max-w-md items-center justify-between">
          {[
            {
              label: "Home",
              href: "/customer/home",
              icon: Home,
              active: false,
            },
            {
              label: "Plans",
              href: "/customer/customer-plans",
              icon: Package,
              active: false,
            },
            {
              label: "Subs",
              href: "/customer/subscriptions",
              icon: ClipboardList,
              active: true,
            },
            {
              label: "Profile",
              href: "/customer/profile",
              icon: User,
              active: false,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 text-[11px] font-semibold"
                style={{
                  color: item.active ? "#6b8e23" : "#8a9a62",
                }}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </main>
  );
}