"use client";

import { getCookie } from "@/lib/client-cookie";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Save, User, MapPin, Home, ChevronDown } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

type Province = {
  id: number;
  name: string;
  cities?: City[];
};

type City = {
  id: number;
  name: string;
  provinceId?: number;
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

type EditProfileProps = {
  selectedData: CustomerProfile;
  onSuccess: (data: CustomerProfile) => void;
};

function getToken() {
  return getCookie("accessToken") || getCookie("accesstoken") || "";
}

function getArrayData<T>(result: any): T[] {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.data?.data)) return result.data.data;
  if (Array.isArray(result?.provinces)) return result.provinces;
  if (Array.isArray(result?.cities)) return result.cities;
  if (Array.isArray(result?.data?.provinces)) return result.data.provinces;
  if (Array.isArray(result?.data?.cities)) return result.data.cities;
  return [];
}

function getUpdatedProfile(result: any): CustomerProfile | null {
  return (
    result?.data?.user ||
    result?.data?.profile ||
    result?.data ||
    result?.user ||
    result?.profile ||
    null
  );
}

function getErrorMessage(result: any, fallback: string) {
  if (Array.isArray(result?.message)) return result.message.join("\n");
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

export default function EditProfile({
  selectedData,
  onSuccess,
}: EditProfileProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingLocation, setLoadingLocation] = useState<boolean>(false);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  const [name, setName] = useState<string>("");
  const [provinceId, setProvinceId] = useState<string>("");
  const [cityId, setCityId] = useState<string>("");
  const [addressDetail, setAddressDetail] = useState<string>("");

  async function getProvinces() {
    try {
      setLoadingLocation(true);

      const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

      if (!baseUrl) {
        toast.warning("NEXT_PUBLIC_BASE_API_URL belum diisi");
        return;
      }

      const response = await fetch(`${baseUrl}/locations/provinces`, {
        method: "GET",
        cache: "no-store",
      });

      const result = await readJsonSafe(response);

      if (!response.ok) {
        toast.warning(getErrorMessage(result, "Gagal mengambil provinsi"));
        return;
      }

      const provinceData = getArrayData<Province>(result);
      setProvinces(provinceData);

      const currentProvinceId =
        selectedData.city?.province?.id ||
        selectedData.city?.provinceId ||
        undefined;

      if (currentProvinceId) {
        setProvinceId(String(currentProvinceId));

        const selectedProvince = provinceData.find(
          (province) => Number(province.id) === Number(currentProvinceId)
        );

        if (selectedProvince?.cities && selectedProvince.cities.length > 0) {
          setCities(selectedProvince.cities);
        } else {
          await getCities(String(currentProvinceId));
        }
      }
    } catch (error) {
      console.error("GET PROVINCES ERROR:", error);
      toast.error("Terjadi kesalahan saat mengambil provinsi");
    } finally {
      setLoadingLocation(false);
    }
  }

  async function getCities(selectedProvinceId: string) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

      if (!baseUrl) {
        toast.warning("NEXT_PUBLIC_BASE_API_URL belum diisi");
        return;
      }

      const selectedProvince = provinces.find(
        (province) => String(province.id) === String(selectedProvinceId)
      );

      if (selectedProvince?.cities && selectedProvince.cities.length > 0) {
        setCities(selectedProvince.cities);
        return;
      }

      const endpoints = [
        `${baseUrl}/locations/cities?provinceId=${selectedProvinceId}`,
        `${baseUrl}/locations/provinces/${selectedProvinceId}/cities`,
      ];

      let cityData: City[] = [];
      let lastMessage = "Gagal mengambil kota";

      for (const endpoint of endpoints) {
        const response = await fetch(endpoint, {
          method: "GET",
          cache: "no-store",
        });

        const result = await readJsonSafe(response);

        if (response.ok) {
          cityData = getArrayData<City>(result);
          break;
        }

        lastMessage = getErrorMessage(result, lastMessage);
      }

      if (cityData.length === 0) {
        toast.warning(lastMessage);
      }

      setCities(cityData);
    } catch (error) {
      console.error("GET CITIES ERROR:", error);
      toast.error("Terjadi kesalahan saat mengambil kota");
    }
  }

  function openModal() {
    setName(selectedData.name || "");
    setAddressDetail(selectedData.addressDetail || "");

    const currentProvinceId =
      selectedData.city?.province?.id || selectedData.city?.provinceId || "";

    const currentCityId = selectedData.cityId || selectedData.city?.id || "";

    setProvinceId(currentProvinceId ? String(currentProvinceId) : "");
    setCityId(currentCityId ? String(currentCityId) : "");
    setCities([]);

    setOpen(true);
  }

  function handleProvinceChange(value: string) {
    setProvinceId(value);
    setCityId("");
    setCities([]);

    if (value) {
      getCities(value);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      toast.warning("Nama lengkap wajib diisi");
      return;
    }

    if (!provinceId) {
      toast.warning("Provinsi wajib dipilih");
      return;
    }

    if (!cityId) {
      toast.warning("Kota wajib dipilih");
      return;
    }

    if (!addressDetail.trim()) {
      toast.warning("Detail alamat wajib diisi");
      return;
    }

    try {
      setLoading(true);

      const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

      if (!baseUrl) {
        toast.warning("NEXT_PUBLIC_BASE_API_URL belum diisi");
        return;
      }

      const token = getToken();

      if (!token) {
        toast.warning("Token tidak ditemukan. Silakan login ulang.");
        window.location.href = "/sign-in";
        return;
      }

      const selectedProvince = provinces.find(
        (province) => String(province.id) === String(provinceId)
      );

      const selectedCity = cities.find(
        (city) => String(city.id) === String(cityId)
      );

      const fullAddress = `${selectedProvince?.name || ""}, ${
        selectedCity?.name || ""
      }`;

      const payload = {
        name: name.trim(),
        cityId: Number(cityId),
        fullAddress,
        addressDetail: addressDetail.trim(),
      };

      console.log("UPDATE PROFILE PAYLOAD:", payload);

      const endpoints = [
        `${baseUrl}/users/me`,
        selectedData.id ? `${baseUrl}/customers/${selectedData.id}` : "",
      ].filter(Boolean);

      let result: any = null;
      let success = false;
      let lastMessage = "Gagal mengedit profile";

      for (const endpoint of endpoints) {
        const response = await fetch(endpoint, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        result = await readJsonSafe(response);

        console.log("UPDATE PROFILE ENDPOINT:", endpoint);
        console.log("UPDATE PROFILE STATUS:", response.status);
        console.log("UPDATE PROFILE RESULT:", result);

        if (response.ok) {
          success = true;
          break;
        }

        lastMessage = getErrorMessage(result, lastMessage);
      }

      if (!success) {
        toast.warning(lastMessage);
        return;
      }

      const updatedFromBackend = getUpdatedProfile(result);

      const updatedProfile: CustomerProfile = {
        ...selectedData,
        ...updatedFromBackend,
        name: name.trim(),
        cityId: Number(cityId),
        fullAddress,
        addressDetail: addressDetail.trim(),
        city: selectedCity
          ? {
              ...selectedCity,
              province: selectedProvince
                ? {
                    id: selectedProvince.id,
                    name: selectedProvince.name,
                  }
                : selectedCity.province,
            }
          : selectedData.city,
      };

      toast.success(result?.message || "Profile berhasil diedit");
      onSuccess(updatedProfile);
      setOpen(false);
    } catch (error) {
      console.error("UPDATE PROFILE ERROR:", error);
      toast.error("Terjadi kesalahan saat mengedit profile");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) {
      getProvinces();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const inputClass =
    "w-full rounded-xl px-4 py-3 text-sm text-[#1e2a04] outline-none transition-all placeholder:text-[#a8b890]";

  const inputStyle = {
    background: "#f6f9ee",
    border: "1px solid #d3e2a0",
    fontFamily: "'DM Sans', sans-serif",
  } as React.CSSProperties;

  const inputFocusHandler = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    e.target.style.border = "1.5px solid #6b8e23";
    e.target.style.background = "#fff";
    e.target.style.boxShadow = "0 0 0 3px #6b8e2318";
  };

  const inputBlurHandler = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    e.target.style.border = "1px solid #d3e2a0";
    e.target.style.background = "#f6f9ee";
    e.target.style.boxShadow = "none";
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 text-[#6B8E23] shadow-sm transition hover:scale-105"
        style={{
          border: "0.5px solid #d3e2a0",
          boxShadow: "0 4px 12px #6b8e2320",
        }}
      >
        <Pencil size={20} />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-md"
          style={{
            borderRadius: 24,
            border: "0.5px solid #d3e2a0",
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: "0 24px 60px #1e2a0420",
          }}
        >
          <form onSubmit={handleSubmit}>
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
                    👤
                  </div>

                  <span
                    className="rounded-full px-3 py-0.5 text-xs font-semibold"
                    style={{ background: "#e8f0c8", color: "#4e6b12" }}
                  >
                    Customer Profile
                  </span>
                </div>

                <DialogTitle
                  className="text-xl font-bold"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "#1e2a04",
                  }}
                >
                  Edit Profile
                </DialogTitle>

                <DialogDescription
                  className="mt-1 text-xs leading-5"
                  style={{ color: "#8a9a62" }}
                >
                  Ubah nama dan alamat pengiriman customer.
                </DialogDescription>
              </div>
            </div>

            <div className="space-y-5 px-7 py-6">
              <div>
                <label
                  className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "#6a7a4a" }}
                >
                  <User size={15} className="text-[#6B8E23]" />
                  Nama Lengkap
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className={inputClass}
                  style={inputStyle}
                  onFocus={inputFocusHandler}
                  onBlur={inputBlurHandler}
                />
              </div>

              <div>
                <label
                  className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "#6a7a4a" }}
                >
                  <MapPin size={15} className="text-[#6B8E23]" />
                  Provinsi
                </label>

                <div className="relative">
                  <select
                    value={provinceId}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    disabled={loadingLocation}
                    className="w-full appearance-none rounded-xl px-4 py-3 pr-10 text-sm text-[#1e2a04] outline-none transition-all disabled:cursor-not-allowed disabled:opacity-60"
                    style={inputStyle}
                    onFocus={inputFocusHandler}
                    onBlur={inputBlurHandler}
                  >
                    <option value="">
                      {loadingLocation ? "Memuat provinsi..." : "Pilih provinsi"}
                    </option>

                    {provinces.map((province) => (
                      <option key={province.id} value={String(province.id)}>
                        {province.name}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8a9a62]"
                  />
                </div>
              </div>

              <div>
                <label
                  className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "#6a7a4a" }}
                >
                  <MapPin size={15} className="text-[#6B8E23]" />
                  Kota
                </label>

                <div className="relative">
                  <select
                    value={cityId}
                    onChange={(e) => setCityId(e.target.value)}
                    disabled={!provinceId || loadingLocation}
                    className="w-full appearance-none rounded-xl px-4 py-3 pr-10 text-sm text-[#1e2a04] outline-none transition-all disabled:cursor-not-allowed disabled:opacity-60"
                    style={inputStyle}
                    onFocus={inputFocusHandler}
                    onBlur={inputBlurHandler}
                  >
                    <option value="">
                      {!provinceId ? "Pilih provinsi dulu" : "Pilih kota"}
                    </option>

                    {cities.map((city) => (
                      <option key={city.id} value={String(city.id)}>
                        {city.name}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8a9a62]"
                  />
                </div>
              </div>

              <div>
                <label
                  className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "#6a7a4a" }}
                >
                  <Home size={15} className="text-[#6B8E23]" />
                  Detail Alamat
                </label>

                <textarea
                  value={addressDetail}
                  onChange={(e) => setAddressDetail(e.target.value)}
                  placeholder="Contoh: Jl. Sudirman No. 12, dekat minimarket"
                  rows={3}
                  className="w-full resize-none rounded-xl px-4 py-3 text-sm text-[#1e2a04] outline-none transition-all placeholder:text-[#a8b890]"
                  style={inputStyle}
                  onFocus={inputFocusHandler}
                  onBlur={inputBlurHandler}
                />
              </div>
            </div>

            <div
              className="flex items-center justify-end gap-3 px-7 py-5"
              style={{ borderTop: "0.5px solid #e8f0c8" }}
            >
              <DialogClose asChild>
                <button
                  type="button"
                  disabled={loading}
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:bg-[#f0f5e0] disabled:cursor-not-allowed disabled:opacity-60"
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
                disabled={loading}
                className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50"
                style={{
                  background: loading
                    ? "#a8c255"
                    : "linear-gradient(135deg, #6b8e23, #8aad3a)",
                  border: "0.5px solid #4e6b12",
                  boxShadow: loading ? "none" : "0 2px 8px #6b8e2330",
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
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={15} strokeWidth={2.5} />
                    Save Changes
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