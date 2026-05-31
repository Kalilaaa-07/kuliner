"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Phone, Shield, User, Sparkles, LogOut } from "lucide-react";
import EditAdminProfile from "./edit";

export type AdminProfile = {
  name: string;
  email: string;
  phone: string;
  role: string;
};

export default function AdminProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<AdminProfile>({
    name: "",
    email: "",
    phone: "",
    role: "Admin",
  });

  useEffect(() => {
    const savedProfile = localStorage.getItem("adminProfile");

    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else {
      const defaultProfile = {
        name: "Admin NutriCare",
        email: "admin@nutricare.com",
        phone: "081234567890",
        role: "Admin",
      };

      setProfile(defaultProfile);
      localStorage.setItem("adminProfile", JSON.stringify(defaultProfile));
    }
  }, []);

  function handleLogout() {
    const confirmLogout = confirm("Yakin ingin log out?");

    if (!confirmLogout) return;

    document.cookie =
      "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie =
      "accesstoken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie =
      "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    localStorage.removeItem("adminProfile");
    localStorage.removeItem("user");
    localStorage.removeItem("profile");
    localStorage.removeItem("role");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("accesstoken");

    router.push("/sign-in");
  }

  const detailCards = [
    {
      label: "Nama Admin",
      value: profile.name || "-",
      icon: User,
    },
    {
      label: "Email",
      value: profile.email || "-",
      icon: Mail,
    },
    {
      label: "No. Telepon",
      value: profile.phone || "-",
      icon: Phone,
    },
    {
      label: "Role",
      value: profile.role || "Admin",
      icon: Shield,
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
              Profile Admin
            </h1>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-[#6B705C]">
              Kelola informasi akun administrator NutriCare dengan tampilan yang
              rapi dan mudah dibaca.
            </p>
          </div>

          <div className="flex w-fit flex-wrap items-center gap-3">
            <EditAdminProfile selectedData={profile} onSuccess={setProfile} />

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 active:translate-y-0"
              style={{
                background: "linear-gradient(135deg, #9b2226, #c1121f)",
                border: "0.5px solid #7f1d1d",
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: "0 2px 8px #9b222630",
              }}
            >
              <LogOut size={16} strokeWidth={2.5} />
              Log Out
            </button>
          </div>
        </div>

        {/* PROFILE HERO */}
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

          <div className="relative z-10 grid gap-6 xl:grid-cols-[1fr_1.2fr] xl:items-center">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[28px] bg-white/90 text-[#6B8E23] shadow-sm sm:h-28 sm:w-28">
                <User size={52} />
              </div>

              <div className="min-w-0">
                <p className="mb-2 flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#d7efaa] backdrop-blur">
                  <Sparkles size={13} />
                  Administrator
                </p>

                <h2
                  className="break-words text-3xl font-bold text-white sm:text-4xl"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {profile.name || "Admin"}
                </h2>

                <p className="mt-2 break-all text-sm leading-6 text-[#e7f5c9]">
                  {profile.email || "Email belum diisi"}
                </p>
              </div>
            </div>

            <div className="flex justify-start xl:justify-end">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-fit items-center gap-2 rounded-2xl bg-white/15 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:scale-105 hover:bg-white/20"
                style={{
                  border: "0.5px solid #ffffff40",
                }}
              >
                <LogOut size={17} />
                Log Out
              </button>
            </div>
          </div>
        </div>

        {/* DETAIL CARD */}
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
                  Informasi Admin
                </h2>

                <p className="text-xs font-medium text-[#8a9a62]">
                  Data profile admin yang sedang digunakan.
                </p>
              </div>
            </div>

            <span className="w-fit rounded-full bg-[#e8f0c8] px-3 py-1 text-xs font-bold text-[#4e6b12]">
              Local Profile
            </span>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
            {detailCards.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="group relative overflow-hidden rounded-3xl bg-[#F9FAF4] p-5 transition hover:-translate-y-1 hover:shadow-md"
                  style={{ border: "0.5px solid #E8EED0" }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-[#4e6b12]"
                      style={{
                        background: "#E8EED0",
                        border: "0.5px solid #c2da85",
                      }}
                    >
                      <Icon size={20} />
                    </div>

                    <div className="h-8 w-8 rounded-full bg-[#6B8E23]/10 transition group-hover:scale-125" />
                  </div>

                  <p className="mt-4 text-xs font-bold uppercase tracking-widest text-[#8a9a62]">
                    {item.label}
                  </p>

                  <h3 className="mt-2 break-words text-base font-extrabold leading-6 text-[#1e2a04]">
                    {item.value}
                  </h3>

                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#6B8E23]" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}