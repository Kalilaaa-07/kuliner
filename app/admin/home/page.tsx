"use client";

import { useEffect, useState } from "react";
import { getCookie } from "@/lib/client-cookie";

type Category = {
  id?: number;
  name?: string;
};

type Meal = {
  id?: number;
  name?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  imageUrl?: string;
};

type CateringPlan = {
  id?: number;
  name?: string;
  description?: string;
  price?: number;
  duration?: number;
  isActive?: boolean;
  categoryId?: number;
  category?: Category;
};

type UserData = {
  id?: number;
  name?: string;
  email?: string;
};

type Subscription = {
  id?: number;
  userId?: number;
  customerId?: number;
  cateringPlanId?: number;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  totalPrice?: number;
  price?: number;
  user?: UserData;
  customer?: UserData;
  cateringPlan?: CateringPlan;
  plan?: CateringPlan;
};

function getToken() {
  return getCookie("accessToken") || getCookie("accesstoken") || "";
}

function getArrayData<T>(result: any): T[] {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.data?.data)) return result.data.data;
  if (Array.isArray(result?.categories)) return result.categories;
  if (Array.isArray(result?.meals)) return result.meals;
  if (Array.isArray(result?.plans)) return result.plans;
  if (Array.isArray(result?.cateringPlans)) return result.cateringPlans;
  if (Array.isArray(result?.subscriptions)) return result.subscriptions;
  if (Array.isArray(result?.items)) return result.items;
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
    month: "short",
    year: "numeric",
  }).format(date);
}

function getCustomerName(subscription: Subscription) {
  return (
    subscription.user?.name ||
    subscription.customer?.name ||
    `Customer #${subscription.userId || subscription.customerId || "-"}`
  );
}

function getPlanName(subscription: Subscription) {
  return (
    subscription.cateringPlan?.name ||
    subscription.plan?.name ||
    `Plan #${subscription.cateringPlanId || "-"}`
  );
}

function getSubscriptionPrice(subscription: Subscription) {
  return (
    subscription.totalPrice ||
    subscription.price ||
    subscription.cateringPlan?.price ||
    subscription.plan?.price ||
    0
  );
}

export default function AdminDashboardPage() {
  const [formattedDate, setFormattedDate] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [plans, setPlans] = useState<CateringPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const [totalCategories, setTotalCategories] = useState(0);
  const [totalMeals, setTotalMeals] = useState(0);
  const [totalPlans, setTotalPlans] = useState(0);
  const [totalSubscriptions, setTotalSubscriptions] = useState(0);

  const [loading, setLoading] = useState(true);

  const activePlans = plans.filter((plan) => plan.isActive).length;

  const totalIncome = subscriptions.reduce((total, subscription) => {
    return total + Number(getSubscriptionPrice(subscription));
  }, 0);

  const uniqueCustomers = new Set(
    subscriptions
      .map((item) => item.user?.id || item.customer?.id || item.userId || item.customerId)
      .filter(Boolean)
  ).size;

  useEffect(() => {
    const today = new Date();
    const formatted = today.toLocaleDateString("en-US", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    setFormattedDate(formatted);
  }, []);

  useEffect(() => {
    async function fetchData() {
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

        const headers: HeadersInit = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        const [categoryRes, mealRes, planRes, subscriptionRes] =
          await Promise.all([
            fetch(`${baseUrl}/categories?page=1&limit=100`, {
              headers,
              cache: "no-store",
            }),
            fetch(`${baseUrl}/meals?page=1&limit=100`, {
              headers,
              cache: "no-store",
            }),
            fetch(`${baseUrl}/catering-plans?page=1&limit=100`, {
              headers,
              cache: "no-store",
            }),
            fetch(`${baseUrl}/subscriptions?page=1&limit=100`, {
              headers,
              cache: "no-store",
            }),
          ]);

        const categoryData = await categoryRes.json();
        const mealData = await mealRes.json();
        const planData = await planRes.json();
        const subscriptionData = await subscriptionRes.json();

        if (!categoryRes.ok) {
          console.log("CATEGORY ERROR:", categoryData);
        }

        if (!mealRes.ok) {
          console.log("MEAL ERROR:", mealData);
        }

        if (!planRes.ok) {
          console.log("PLAN ERROR:", planData);
        }

        if (!subscriptionRes.ok) {
          console.log("SUBSCRIPTION ERROR:", subscriptionData);
        }

        const categoriesArray = categoryRes.ok
          ? getArrayData<Category>(categoryData)
          : [];

        const mealsArray = mealRes.ok ? getArrayData<Meal>(mealData) : [];

        const plansArray = planRes.ok
          ? getArrayData<CateringPlan>(planData)
          : [];

        const subscriptionsArray = subscriptionRes.ok
          ? getArrayData<Subscription>(subscriptionData)
          : [];

        setCategories(categoriesArray);
        setMeals(mealsArray);
        setPlans(plansArray);
        setSubscriptions(subscriptionsArray);

        setTotalCategories(
          categoryRes.ok
            ? getTotalFromResponse(categoryData, categoriesArray.length)
            : 0
        );

        setTotalMeals(
          mealRes.ok ? getTotalFromResponse(mealData, mealsArray.length) : 0
        );

        setTotalPlans(
          planRes.ok ? getTotalFromResponse(planData, plansArray.length) : 0
        );

        setTotalSubscriptions(
          subscriptionRes.ok
            ? getTotalFromResponse(subscriptionData, subscriptionsArray.length)
            : 0
        );
      } catch (error) {
        console.log("FETCH DASHBOARD ERROR:", error);
        setCategories([]);
        setMeals([]);
        setPlans([]);
        setSubscriptions([]);
        setTotalCategories(0);
        setTotalMeals(0);
        setTotalPlans(0);
        setTotalSubscriptions(0);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const recentSubscriptions = [...subscriptions]
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || a.startDate || "").getTime();
      const dateB = new Date(b.createdAt || b.startDate || "").getTime();

      return dateB - dateA;
    })
    .slice(0, 3);

  const popularPlans = [...plans]
    .sort((a, b) => Number(b.price || 0) - Number(a.price || 0))
    .slice(0, 3);

  const stats = [
    {
      title: "Total Plans",
      value: totalPlans,
      icon: "📋",
      accent: "#6B8E23",
      bg: "#EEF5D6",
    },
    {
      title: "Meals",
      value: totalMeals,
      icon: "🍱",
      accent: "#8AAD3A",
      bg: "#F0F5E0",
    },
    {
      title: "Subscriptions",
      value: totalSubscriptions,
      icon: "📦",
      accent: "#324409",
      bg: "#EEF5D6",
    },
    {
      title: "Income",
      value: formatRupiah(totalIncome),
      icon: "💰",
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
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.25em] text-[#6B8E23]">
              Admin Panel
            </p>

            <h1
              className="text-3xl font-bold tracking-tight text-[#1e2a04] sm:text-4xl"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Dashboard
            </h1>

            <p className="mt-1 text-sm font-medium text-[#6a7a4a]">
              {formattedDate || "Loading date..."}
            </p>
          </div>

          <div
            className="hidden items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold sm:flex"
            style={{
              background: "#e8f0c8",
              border: "0.5px solid #b8d47a",
              color: "#4e6b12",
            }}
          >
            <span
              className="h-2 w-2 animate-pulse rounded-full"
              style={{ background: "#6b8e23" }}
            />
            Live Data
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

          <div className="relative z-10">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#d7efaa]">
              Welcome back
            </p>

            <h2
              className="text-2xl font-bold text-white sm:text-4xl"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Hi, Admin 👋
            </h2>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
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
                className={`mt-1 font-bold text-[#1e2a04] ${
                  item.title === "Income"
                    ? "text-lg sm:text-xl xl:text-2xl"
                    : "text-2xl sm:text-3xl"
                }`}
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {loading ? (
                  <span
                    className="inline-block h-7 w-16 animate-pulse rounded-lg"
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

        {/* SUMMARY */}
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          {/* RECENT SUBSCRIPTIONS */}
          <div
            className="rounded-[28px] bg-white p-5 shadow-sm sm:p-6"
            style={{ border: "0.5px solid #d3e2a0" }}
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="h-8 w-1 rounded-full"
                  style={{ background: "#6b8e23" }}
                />

                <div>
                  <h2
                    className="text-xl font-bold text-[#1e2a04]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Recent Subscriptions
                  </h2>

                  <p className="text-xs font-medium text-[#8a9a62]">
                    Subscription customer terbaru
                  </p>
                </div>
              </div>

              <span
                className="hidden rounded-full px-3 py-1 text-xs font-semibold sm:inline-flex"
                style={{ background: "#e8f0c8", color: "#4e6b12" }}
              >
                Last 3
              </span>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 animate-pulse rounded-xl"
                      style={{ background: "#e8f0c8", flexShrink: 0 }}
                    />

                    <div className="flex-1 space-y-2">
                      <div
                        className="h-3 w-32 animate-pulse rounded"
                        style={{ background: "#e8f0c8" }}
                      />

                      <div
                        className="h-3 w-48 animate-pulse rounded"
                        style={{ background: "#f0f5e0" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentSubscriptions.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <span className="mb-2 text-4xl">📭</span>

                <p className="text-sm font-medium text-[#8a9a62]">
                  Belum ada subscription.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentSubscriptions.map((subscription) => {
                  return (
                    <div
                      key={subscription.id}
                      className="flex flex-col gap-3 rounded-2xl px-4 py-3 transition hover:bg-[#f6f8ee] sm:flex-row sm:items-center sm:justify-between"
                      style={{ border: "0.5px solid #e8f0c8" }}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base"
                          style={{ background: "#e8f0c8" }}
                        >
                          📦
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-[#1e2a04]">
                            {getCustomerName(subscription)}
                          </h3>

                          <p className="truncate text-xs text-[#6a7a4a]">
                            {getPlanName(subscription)} •{" "}
                            {formatRupiah(getSubscriptionPrice(subscription))}
                          </p>
                        </div>
                      </div>

                      <span
                        className="w-fit rounded-full px-3 py-1 text-xs font-medium"
                        style={{ background: "#f0f5e0", color: "#6a7a4a" }}
                      >
                        {formatDate(subscription.startDate || subscription.createdAt)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* OVERVIEW */}
          <div
            className="rounded-[28px] bg-white p-5 shadow-sm sm:p-6"
            style={{ border: "0.5px solid #d3e2a0" }}
          >
            <div className="mb-5 flex items-center gap-3">
              <div
                className="h-8 w-1 rounded-full"
                style={{ background: "#6b8e23" }}
              />

              <div>
                <h2
                  className="text-xl font-bold text-[#1e2a04]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Data Overview
                </h2>
              </div>
            </div>

            <div className="space-y-3">
              {[
                {
                  label: "Categories",
                  value: totalCategories,
                  icon: "🏷️",
                },
                {
                  label: "Active Plans",
                  value: activePlans,
                  icon: "✅",
                },
                {
                  label: "Unique Customers",
                  value: uniqueCustomers,
                  icon: "👥",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-2xl px-4 py-3"
                  style={{
                    background: "#f6f9ee",
                    border: "0.5px solid #d3e2a0",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{ background: "#e8f0c8" }}
                    >
                      {item.icon}
                    </div>

                    <p className="text-sm font-bold text-[#283618]">
                      {item.label}
                    </p>
                  </div>

                  <p
                    className="text-lg font-bold text-[#1e2a04]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {loading ? "..." : item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* POPULAR PLANS */}
        <div
          className="rounded-[28px] bg-white p-5 shadow-sm sm:p-6"
          style={{ border: "0.5px solid #d3e2a0" }}
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="h-8 w-1 rounded-full"
                style={{ background: "#6b8e23" }}
              />

              <div>
                <h2
                  className="text-xl font-bold text-[#1e2a04]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Catering Plans
                </h2>

                <p className="text-xs font-medium text-[#8a9a62]">
                  Top 3 plan berdasarkan harga tertinggi
                </p>
              </div>
            </div>

            <span
              className="hidden rounded-full px-3 py-1 text-xs font-semibold sm:inline-flex"
              style={{ background: "#e8f0c8", color: "#4e6b12" }}
            >
              Top 3
            </span>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-2xl"
                  style={{ background: "#f0f5e0" }}
                />
              ))}
            </div>
          ) : popularPlans.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <span className="mb-2 text-4xl">🥗</span>

              <p className="text-sm font-medium text-[#8a9a62]">
                Belum ada catering plan.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {popularPlans.map((plan, index) => (
                <div
                  key={plan.id}
                  className="group relative overflow-hidden rounded-2xl p-5 transition hover:-translate-y-0.5"
                  style={{
                    background: "linear-gradient(135deg, #f6f9ee, #eef5d6)",
                    border: "0.5px solid #d3e2a0",
                  }}
                >
                  <div
                    className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                    style={{
                      background: index === 0 ? "#6b8e23" : "#d3e2a0",
                      color: index === 0 ? "#fff" : "#4e6b12",
                    }}
                  >
                    {index + 1}
                  </div>

                  <div className="mb-3 text-4xl">🥗</div>

                  <h3
                    className="line-clamp-1 font-bold leading-tight"
                    style={{ color: "#1e2a04", fontSize: 15 }}
                  >
                    {plan.name || "Plan tanpa nama"}
                  </h3>

                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#6a7a4a]">
                    {plan.description || "Tidak ada deskripsi"}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={{ background: "#e8f0c8", color: "#4e6b12" }}
                    >
                      {plan.duration || 0} hari
                    </span>

                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={{ background: "#fdf3e7", color: "#a06020" }}
                    >
                      {formatRupiah(plan.price)}
                    </span>
                  </div>

                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                    style={{
                      background: "linear-gradient(90deg, #6b8e23, #a8c255)",
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}