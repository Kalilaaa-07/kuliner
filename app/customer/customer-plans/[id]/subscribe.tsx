"use client";

import { getCookie } from "@/lib/client-cookie";
import { FormEvent, useState } from "react";
import {
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

type SubscribePlanProps = {
  planId: number;
  planName: string;
  duration: number;
  profile?: CustomerProfile | null;
};

function getProfileData(result: any): CustomerProfile {
  return (
    result?.data?.user ||
    result?.data?.profile ||
    result?.data ||
    result?.user ||
    result?.profile ||
    result
  );
}

export default function SubscribePlan({
  planId,
  planName,
  duration,
  profile: initialProfile,
}: SubscribePlanProps) {
  const [open, setOpen] = useState<boolean>(false);

  const [profile, setProfile] = useState<CustomerProfile | null>(
    initialProfile || null
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);

  const locationText =
    profile?.fullAddress ||
    (profile?.city?.name
      ? `${profile?.city?.province?.name || ""}, ${profile.city.name}`
      : "-");

  async function getProfile() {
    try {
      setLoadingProfile(true);

      const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

      if (!baseUrl) {
        alert("NEXT_PUBLIC_BASE_API_URL belum diisi");
        return;
      }

      const token = getCookie("accesstoken");

      if (!token) {
        alert("Token tidak ditemukan. Silakan login ulang.");
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
        alert(result.message || "Gagal mengambil data profile");
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
      alert("Terjadi kesalahan saat mengambil profile");
    } finally {
      setLoadingProfile(false);
    }
  }

  async function openModal() {
    setOpen(true);

    if (initialProfile) {
      setProfile(initialProfile);
      return;
    }

    await getProfile();
  }

  async function handleSubscribe(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!profile) {
      alert("Data profile belum terbaca. Coba tutup modal lalu buka lagi.");
      return;
    }

    if (![7, 14, 30].includes(Number(duration))) {
      alert("Durasi plan harus 7, 14, atau 30 hari.");
      return;
    }

    try {
      setLoading(true);

      const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

      if (!baseUrl) {
        alert("NEXT_PUBLIC_BASE_API_URL belum diisi");
        return;
      }

      const token = getCookie("accesstoken");

      if (!token) {
        alert("Token tidak ditemukan. Silakan login ulang.");
        window.location.href = "/sign-in";
        return;
      }

      const response = await fetch(`${baseUrl}/subscriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cateringPlanId: Number(planId),
          durationDays: Number(duration),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(
          Array.isArray(result.message)
            ? result.message.join(", ")
            : result.message || "Gagal melakukan subscription"
        );
        return;
      }

      alert(result.message || "Subscription berhasil");
      setOpen(false);
      window.location.href = "/customer/subscriptions";
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat subscription");
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
          className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-lg"
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
              className="relative overflow-hidden px-7 pb-5 pt-7"
              style={{ borderBottom: "0.5px solid #e8f0c8" }}
            >
              <div
                className="absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-20"
                style={{ background: "#6b8e23" }}
              />

              <div className="relative z-10">
                <div className="mb-2 flex items-center gap-2">
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
                  className="text-xl font-bold"
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
                  Konfirmasi subscription. Tanggal selesai dan total harga akan
                  dihitung otomatis.
                </DialogDescription>
              </div>
            </div>

            {/* CONTENT */}
            <div className="space-y-5 px-7 py-6">
              {/* CUSTOMER DATA */}
              <div
                className="rounded-2xl p-4"
                style={{
                  background: "#f6f9ee",
                  border: "1px solid #d3e2a0",
                }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8f0c8] text-[#4e6b12]">
                    <UserRound size={18} />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#8a9a62]">
                      Data Customer
                    </p>

                    <p className="text-xs text-[#6B705C]">
                      Data otomatis dari profile akun kamu.
                    </p>
                  </div>
                </div>

                {loadingProfile ? (
                  <div className="space-y-2">
                    <div className="h-4 w-40 animate-pulse rounded-full bg-[#e8f0c8]" />
                    <div className="h-3 w-56 animate-pulse rounded-full bg-[#e8f0c8]" />
                    <div className="h-3 w-48 animate-pulse rounded-full bg-[#e8f0c8]" />
                  </div>
                ) : (
                  <>
                    <p className="font-bold text-[#1e2a04]">
                      {profile?.name || "Nama belum terbaca"}
                    </p>

                    <p className="mt-0.5 text-sm text-[#6B705C]">
                      {profile?.email || "Email belum terbaca"}
                    </p>

                    <div className="mt-4 border-t border-[#DDE5C2] pt-4">
                      <div className="mb-2 flex items-center gap-2">
                        <MapPin size={15} className="text-[#6B8E23]" />

                        <p className="text-xs font-bold uppercase tracking-widest text-[#8a9a62]">
                          Alamat Pengiriman
                        </p>
                      </div>

                      <p className="text-sm font-bold text-[#1e2a04]">
                        {locationText}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#6B705C]">
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
              className="flex items-center justify-end gap-3 px-7 py-5"
              style={{ borderTop: "0.5px solid #e8f0c8" }}
            >
              <DialogClose asChild>
                <button
                  type="button"
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:bg-[#f0f5e0]"
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
                className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50"
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