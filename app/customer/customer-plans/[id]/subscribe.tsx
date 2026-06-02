"use client";

import { getCookie } from "@/lib/client-cookie";
import { FormEvent, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  MapPin,
  UserRound,
  Wallet,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

type City = {
  id: number;
  name: string;
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

type SubscriptionItem = {
  id?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  durationDays?: number | string;
  cateringPlanId?: number | string;
  planId?: number | string;
  cateringPlan?: {
    id?: number | string;
    name?: string;
  };
  plan?: {
    id?: number | string;
    name?: string;
  };
  [key: string]: any;
};

type SubscribePlanProps = {
  planId: number;
  planName: string;
  duration: number;
  profile?: CustomerProfile | null;
};

function getToken() {
  return (
    getCookie("accesstoken") ||
    getCookie("accessToken") ||
    getCookie("token") ||
    ""
  );
}

async function getJsonSafe(response: Response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function getProfileData(result: any): CustomerProfile {
  return (
    result?.data?.user ||
    result?.data?.profile ||
    result?.data ||
    result?.user ||
    result?.profile ||
    result ||
    {}
  );
}

function getArrayData(result: any): SubscriptionItem[] {
  const data =
    result?.data?.subscriptions ||
    result?.data?.data ||
    result?.data?.items ||
    result?.data ||
    result?.subscriptions ||
    result?.items ||
    result;

  if (Array.isArray(data)) return data;
  return [];
}

function getErrorMessage(result: any, fallback: string) {
  if (Array.isArray(result?.message)) {
    return result.message.join(", ");
  }

  if (typeof result?.message === "string") {
    return result.message;
  }

  if (typeof result?.error === "string") {
    return result.error;
  }

  return fallback;
}

function normalizeDateOnly(date: Date) {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
}

function formatDate(date?: string | Date | null) {
  if (!date) return "-";

  const dateValue = new Date(date);

  if (Number.isNaN(dateValue.getTime())) {
    return "-";
  }

  return dateValue.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getPlanIdFromSubscription(subscription: SubscriptionItem) {
  return (
    subscription?.cateringPlanId ||
    subscription?.cateringPlan?.id ||
    subscription?.planId ||
    subscription?.plan?.id
  );
}

function getEndDateFromSubscription(subscription: SubscriptionItem) {
  if (subscription?.endDate) {
    const endDate = new Date(subscription.endDate);

    if (!Number.isNaN(endDate.getTime())) {
      return endDate;
    }
  }

  if (subscription?.startDate && subscription?.durationDays) {
    const startDate = new Date(subscription.startDate);

    if (Number.isNaN(startDate.getTime())) {
      return null;
    }

    const calculatedEndDate = new Date(startDate);
    calculatedEndDate.setDate(
      calculatedEndDate.getDate() + Number(subscription.durationDays)
    );

    return calculatedEndDate;
  }

  return null;
}

function isInactiveStatus(status?: string) {
  const value = String(status || "").toLowerCase();

  return [
    "cancelled",
    "canceled",
    "cancel",
    "completed",
    "complete",
    "done",
    "finished",
    "expired",
    "rejected",
    "failed",
  ].includes(value);
}

function isSubscriptionStillActive(subscription: SubscriptionItem) {
  if (isInactiveStatus(subscription?.status)) {
    return false;
  }

  const endDate = getEndDateFromSubscription(subscription);

  if (!endDate || Number.isNaN(endDate.getTime())) {
    return false;
  }

  const today = normalizeDateOnly(new Date());
  const subscriptionEndDate = normalizeDateOnly(endDate);

  return subscriptionEndDate >= today;
}

export default function SubscribePlan({
  planId,
  planName,
  duration,
  profile: initialProfile,
}: SubscribePlanProps) {
  const [open, setOpen] = useState(false);

  const [profile, setProfile] = useState<CustomerProfile | null>(
    initialProfile || null
  );

  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [notice, setNotice] = useState("");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

  const locationText =
    profile?.fullAddress ||
    (profile?.city?.name
      ? `${profile?.city?.province?.name || ""}${
          profile?.city?.province?.name ? ", " : ""
        }${profile.city.name}`
      : profile?.cityId
      ? `City ID: ${profile.cityId}`
      : "-");

  async function fetchWithFallback(urls: string[], options: RequestInit) {
    for (const url of urls) {
      try {
        const response = await fetch(url, options);
        const result = await getJsonSafe(response);

        if (response.ok) {
          return { response, result };
        }

        if (response.status !== 404) {
          return { response, result };
        }
      } catch (error) {
        console.error("Fetch gagal:", url, error);
      }
    }

    return null;
  }

  async function getProfile() {
    try {
      setLoadingProfile(true);
      setNotice("");

      if (!baseUrl) {
        setNotice("NEXT_PUBLIC_BASE_API_URL belum diisi.");
        return;
      }

      const token = getToken();

      if (!token) {
        alert("Token tidak ditemukan. Silakan login ulang.");
        window.location.href = "/sign-in";
        return;
      }

      const request = await fetchWithFallback(
        [`${baseUrl}/auth/me`, `${baseUrl}/users/me`],
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (!request) {
        setNotice("Gagal mengambil profile. Endpoint profile tidak ditemukan.");
        return;
      }

      const { response, result } = request;

      if (!response.ok) {
        setNotice(getErrorMessage(result, "Gagal mengambil data profile."));
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
      setNotice("Terjadi kesalahan saat mengambil profile.");
    } finally {
      setLoadingProfile(false);
    }
  }

  async function getMySubscriptions() {
    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_BASE_API_URL belum diisi.");
    }

    const token = getToken();

    if (!token) {
      throw new Error("Token tidak ditemukan. Silakan login ulang.");
    }

    const request = await fetchWithFallback(
      [
        `${baseUrl}/subscriptions/my-subscriptions`,
        `${baseUrl}/subscriptions/my`,
        `${baseUrl}/subscriptions`,
      ],
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!request) {
      throw new Error("Endpoint subscription tidak ditemukan.");
    }

    const { response, result } = request;

    if (!response.ok) {
      throw new Error(
        getErrorMessage(result, "Gagal mengambil data subscription.")
      );
    }

    return getArrayData(result);
  }

  async function checkActiveSamePlan() {
    const subscriptions = await getMySubscriptions();

    const activeSamePlan = subscriptions.find((subscription) => {
      const subscriptionPlanId = getPlanIdFromSubscription(subscription);

      return (
        Number(subscriptionPlanId) === Number(planId) &&
        isSubscriptionStillActive(subscription)
      );
    });

    return activeSamePlan || null;
  }

  async function openModal() {
    setNotice("");
    setOpen(true);

    if (initialProfile) {
      setProfile(initialProfile);
      return;
    }

    await getProfile();
  }

  async function handleSubscribe(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNotice("");

    if (!profile) {
      setNotice("Data profile belum terbaca. Coba tutup modal lalu buka lagi.");
      return;
    }

    if (![7, 14, 30].includes(Number(duration))) {
      setNotice("Durasi plan harus 7, 14, atau 30 hari.");
      return;
    }

    try {
      setLoading(true);

      if (!baseUrl) {
        setNotice("NEXT_PUBLIC_BASE_API_URL belum diisi.");
        return;
      }

      const token = getToken();

      if (!token) {
        alert("Token tidak ditemukan. Silakan login ulang.");
        window.location.href = "/sign-in";
        return;
      }

      const activeSamePlan = await checkActiveSamePlan();

      if (activeSamePlan) {
        const endDate = getEndDateFromSubscription(activeSamePlan);

        setNotice(
          `Kamu sudah subscribe plan ini dan masih aktif sampai ${formatDate(
            endDate
          )}. Kamu baru bisa subscribe plan yang sama setelah subscription berakhir.`
        );

        return;
      }

      const response = await fetch(`${baseUrl}/subscriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        // penting:
        // backend kamu minta numeric string, jadi durationDays dikirim String
        body: JSON.stringify({
          cateringPlanId: String(planId),
          durationDays: String(duration),
        }),
      });

      const result = await getJsonSafe(response);

      if (!response.ok) {
        setNotice(getErrorMessage(result, "Gagal melakukan subscription."));
        return;
      }

      alert(result?.message || "Subscription berhasil.");
      setOpen(false);
      window.location.href = "/customer/subscriptions";
    } catch (error: any) {
      console.error(error);
      setNotice(
        error?.message || "Terjadi kesalahan saat melakukan subscription."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          background: "linear-gradient(135deg, #6b8e23, #8aad3a)",
          border: "0.5px solid #4e6b12",
          boxShadow: "0 2px 8px #6b8e2330",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <CheckCircle2 size={18} />
        Subscribe Plan
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-h-[92vh] w-[calc(100vw-24px)] overflow-y-auto p-0 sm:max-w-lg"
          style={{
            borderRadius: 24,
            border: "0.5px solid #d3e2a0",
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: "0 24px 60px #1e2a0420",
          }}
        >
          <form onSubmit={handleSubscribe}>
            {/* HEADER */}
            <div
              className="relative overflow-hidden px-5 pb-5 pt-6 sm:px-7 sm:pt-7"
              style={{ borderBottom: "0.5px solid #e8f0c8" }}
            >
              <div
                className="absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-20"
                style={{ background: "#6b8e23" }}
              />

              <div className="relative z-10">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-base"
                    style={{
                      background: "#e8f0c8",
                      border: "0.5px solid #c2da85",
                    }}
                  >
                    🥗
                  </div>

                  <span
                    className="rounded-full px-3 py-0.5 text-xs font-semibold"
                    style={{ background: "#e8f0c8", color: "#4e6b12" }}
                  >
                    New Subscription
                  </span>
                </div>

                <DialogTitle
                  className="break-words text-lg font-bold sm:text-xl"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "#1e2a04",
                  }}
                >
                  Subscribe {planName}
                </DialogTitle>

                <DialogDescription
                  className="mt-1 text-xs leading-5"
                  style={{ color: "#8a9a62" }}
                >
                  Customer hanya bisa subscribe plan yang sama lagi setelah
                  subscription sebelumnya berakhir.
                </DialogDescription>
              </div>
            </div>

            {/* CONTENT */}
            <div className="space-y-5 px-5 py-5 sm:px-7 sm:py-6">
              {notice ? (
                <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <p className="leading-5">{notice}</p>
                </div>
              ) : null}

              {/* CUSTOMER DATA */}
              <div
                className="rounded-2xl p-4"
                style={{
                  background: "#f6f9ee",
                  border: "1px solid #d3e2a0",
                }}
              >
                <div className="mb-3 flex items-start gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e8f0c8] text-[#4e6b12]">
                    <UserRound size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#8a9a62]">
                      Data Customer
                    </p>

                    <p className="text-xs leading-5 text-[#6B705C]">
                      Data otomatis dari profile akun kamu.
                    </p>
                  </div>
                </div>

                {loadingProfile ? (
                  <div className="space-y-2">
                    <div className="h-4 w-40 max-w-full animate-pulse rounded-full bg-[#e8f0c8]" />
                    <div className="h-3 w-56 max-w-full animate-pulse rounded-full bg-[#e8f0c8]" />
                    <div className="h-3 w-48 max-w-full animate-pulse rounded-full bg-[#e8f0c8]" />
                  </div>
                ) : (
                  <>
                    <p className="break-words font-bold text-[#1e2a04]">
                      {profile?.name || "Nama belum terbaca"}
                    </p>

                    <p className="mt-0.5 break-words text-sm text-[#6B705C]">
                      {profile?.email || "Email belum terbaca"}
                    </p>

                    <div className="mt-4 border-t border-[#DDE5C2] pt-4">
                      <div className="mb-2 flex items-center gap-2">
                        <MapPin size={15} className="shrink-0 text-[#6B8E23]" />

                        <p className="text-xs font-bold uppercase tracking-widest text-[#8a9a62]">
                          Alamat Pengiriman
                        </p>
                      </div>

                      <p className="break-words text-sm font-bold text-[#1e2a04]">
                        {locationText}
                      </p>

                      <p className="mt-1 break-words text-xs leading-5 text-[#6B705C]">
                        {profile?.addressDetail || "Detail alamat belum diisi"}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* PLAN SUMMARY */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div
                  className="rounded-2xl p-4"
                  style={{
                    background: "#f6f9ee",
                    border: "1px solid #d3e2a0",
                  }}
                >
                  <div className="flex items-center gap-2 text-[#6B8E23]">
                    <CalendarDays size={18} />

                    <p className="text-xs font-bold uppercase tracking-widest text-[#8a9a62]">
                      Durasi
                    </p>
                  </div>

                  <p
                    className="mt-2 text-xl font-bold text-[#1e2a04]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {duration} hari
                  </p>
                </div>

                <div
                  className="rounded-2xl p-4"
                  style={{
                    background: "#f6f9ee",
                    border: "1px solid #d3e2a0",
                  }}
                >
                  <div className="flex items-center gap-2 text-[#6B8E23]">
                    <Wallet size={18} />

                    <p className="text-xs font-bold uppercase tracking-widest text-[#8a9a62]">
                      Status
                    </p>
                  </div>

                  <p
                    className="mt-2 text-xl font-bold text-[#1e2a04]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Ready
                  </p>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div
              className="flex flex-col-reverse gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-end sm:px-7"
              style={{ borderTop: "0.5px solid #e8f0c8" }}
            >
              <DialogClose asChild>
                <button
                  type="button"
                  className="w-full rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:bg-[#f0f5e0] sm:w-auto"
                  style={{
                    border: "1px solid #d3e2a0",
                    color: "#6a7a4a",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Cancel
                </button>
              </DialogClose>

              <button
                type="submit"
                disabled={loading || loadingProfile}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50 sm:w-auto"
                style={{
                  background:
                    loading || loadingProfile
                      ? "#a8c255"
                      : "linear-gradient(135deg, #6b8e23, #8aad3a)",
                  border: "0.5px solid #4e6b12",
                  boxShadow:
                    loading || loadingProfile
                      ? "none"
                      : "0 2px 8px #6b8e2330",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {loading ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="white"
                        strokeWidth="3"
                      />

                      <path
                        className="opacity-75"
                        fill="white"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                      />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Confirm Subscribe
                  </>
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}