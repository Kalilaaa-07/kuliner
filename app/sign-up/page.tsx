"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

type City = {
  id: number;
  name: string;
  provinceId: number;
};

type Province = {
  id: number;
  name: string;
  cities: City[];
};

function getArrayData<T>(result: any): T[] {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.provinces)) return result.provinces;
  return [];
}

export default function SignUpPage() {
  const [provinces, setProvinces] = useState<Province[]>([]);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");

  const [provinceId, setProvinceId] = useState<string>("");
  const [cityId, setCityId] = useState<string>("");
  const [addressDetail, setAddressDetail] = useState<string>("");

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [locationLoading, setLocationLoading] = useState<boolean>(true);

  const selectedProvince = useMemo(() => {
    return provinces.find((province) => String(province.id) === provinceId);
  }, [provinces, provinceId]);

  const cities = selectedProvince?.cities || [];

  const selectedCity = useMemo(() => {
    return cities.find((city) => String(city.id) === cityId);
  }, [cities, cityId]);

  async function getProvinces() {
    try {
      setLocationLoading(true);

      const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

      if (!baseUrl) {
        alert("NEXT_PUBLIC_BASE_API_URL belum diisi di .env.local");
        return;
      }

      const response = await fetch(`${baseUrl}/locations/provinces`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Gagal mengambil data lokasi");
        return;
      }

      setProvinces(getArrayData<Province>(result));
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat mengambil data lokasi");
    } finally {
      setLocationLoading(false);
    }
  }

  function handleProvinceChange(value: string) {
    setProvinceId(value);
    setCityId("");
  }

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      alert("Nama wajib diisi");
      return;
    }

    if (!email.trim()) {
      alert("Email wajib diisi");
      return;
    }

    if (!password.trim()) {
      alert("Password wajib diisi");
      return;
    }

    if (!provinceId.trim()) {
      alert("Provinsi wajib dipilih");
      return;
    }

    if (!cityId.trim()) {
      alert("Kota wajib dipilih");
      return;
    }

    if (!addressDetail.trim()) {
      alert("Detail alamat wajib diisi");
      return;
    }

    try {
      setLoading(true);

      const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

      if (!baseUrl) {
        alert("NEXT_PUBLIC_BASE_API_URL belum diisi di .env.local");
        return;
      }

      const provinceName = selectedProvince?.name || "";
      const cityName = selectedCity?.name || "";

      const response = await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name,
          cityId: Number(cityId),
          fullAddress: `${provinceName}, ${cityName}`,
          addressDetail,
          role: "USER",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Gagal melakukan registrasi");
        return;
      }

      alert(result.message || "Registrasi berhasil");
      window.location.href = "/sign-in";
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan pada server");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getProvinces();
  }, []);

  return (
    <main className="min-h-screen bg-[#F6F7EF] px-4 py-8 text-[#283618] sm:px-8">
      <Link
        href="/"
        className="mb-4 inline-block text-sm font-bold text-[#6B8E23] hover:underline"
      >
        ← Kembali ke beranda
      </Link>

      <div className="mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-xl items-center justify-center">
        <section className="w-full rounded-[28px] border border-[#DDE5C2] bg-white px-5 py-6 shadow-xl shadow-[#6B8E23]/10 sm:px-8 sm:py-7">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-extrabold text-[#283618] sm:text-3xl">
              Daftar Akun
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#6B705C]">
              Buat akun baru untuk mulai menggunakan NutriCare.
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-bold">
                Nama Lengkap
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="w-full rounded-2xl border border-[#DADDCB] bg-[#F9FAF4] px-4 py-3 text-sm outline-none transition focus:border-[#6B8E23] focus:ring-2 focus:ring-[#DDE5C2]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold">Email</label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email"
                className="w-full rounded-2xl border border-[#DADDCB] bg-[#F9FAF4] px-4 py-3 text-sm outline-none transition focus:border-[#6B8E23] focus:ring-2 focus:ring-[#DDE5C2]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full rounded-2xl border border-[#DADDCB] bg-[#F9FAF4] px-4 py-3 pr-14 text-sm outline-none transition focus:border-[#6B8E23] focus:ring-2 focus:ring-[#DDE5C2]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B8E23]"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-bold">
                  Provinsi
                </label>

                <select
                  value={provinceId}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  disabled={locationLoading}
                  className="w-full rounded-2xl border border-[#DADDCB] bg-[#F9FAF4] px-4 py-3 text-sm outline-none transition focus:border-[#6B8E23] focus:ring-2 focus:ring-[#DDE5C2] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    {locationLoading ? "Loading provinsi..." : "Pilih provinsi"}
                  </option>

                  {provinces.map((province) => (
                    <option key={province.id} value={province.id}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold">Kota</label>

                <select
                  value={cityId}
                  onChange={(e) => setCityId(e.target.value)}
                  disabled={!provinceId}
                  className="w-full rounded-2xl border border-[#DADDCB] bg-[#F9FAF4] px-4 py-3 text-sm outline-none transition focus:border-[#6B8E23] focus:ring-2 focus:ring-[#DDE5C2] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">Pilih kota</option>

                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold">
                Detail Alamat
              </label>

              <textarea
                value={addressDetail}
                onChange={(e) => setAddressDetail(e.target.value)}
                placeholder="Contoh: Jl. Sudirman No. 123"
                rows={3}
                className="w-full resize-none rounded-2xl border border-[#DADDCB] bg-[#F9FAF4] px-4 py-3 text-sm outline-none transition focus:border-[#6B8E23] focus:ring-2 focus:ring-[#DDE5C2]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#6B8E23] px-5 py-3 font-bold text-white shadow-lg shadow-[#6B8E23]/20 transition hover:bg-[#5B7C1E] disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading ? "Loading..." : "Daftar Sekarang"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[#6B705C]">
            Sudah punya akun?{" "}
            <Link
              href="/sign-in"
              className="font-bold text-[#6B8E23] hover:underline"
            >
              Masuk sekarang
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}