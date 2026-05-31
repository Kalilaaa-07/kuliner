"use client";

import { getCookie } from "@/lib/client-cookie";
import { FormEvent, useEffect, useState } from "react";
import {
  ChevronDown,
  ImagePlus,
  Pencil,
  Save,
  Upload,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

import type { Meal } from "./page";

type EditMealProps = {
  selectedData: Meal;
  onSuccess: () => void;
};

type CateringPlan = {
  id: number;
  name: string;
};

function getToken() {
  return getCookie("accessToken") || getCookie("accesstoken") || "";
}

function getArrayData<T>(result: any): T[] {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.data?.data)) return result.data.data;
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

export default function EditMeal({ selectedData, onSuccess }: EditMealProps) {
  const [open, setOpen] = useState<boolean>(false);

  const [plans, setPlans] = useState<CateringPlan[]>([]);

  const [name, setName] = useState<string>("");
  const [calories, setCalories] = useState<string>("");
  const [protein, setProtein] = useState<string>("");
  const [carbs, setCarbs] = useState<string>("");
  const [fat, setFat] = useState<string>("");
  const [ingredients, setIngredients] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [cateringPlanId, setCateringPlanId] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [plansLoading, setPlansLoading] = useState<boolean>(false);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);

  function openModal() {
    setName(selectedData.name || "");
    setCalories(String(selectedData.calories || ""));
    setProtein(String(selectedData.protein || ""));
    setCarbs(String(selectedData.carbs || ""));
    setFat(String(selectedData.fat || ""));
    setIngredients(selectedData.ingredients || "");
    setImageUrl(selectedData.imageUrl || "");
    setCateringPlanId(
      String(selectedData.cateringPlanId || selectedData.cateringPlan?.id || "")
    );
    setOpen(true);
  }

  async function getCateringPlans() {
    try {
      setPlansLoading(true);

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

      const response = await fetch(
        `${baseUrl}/catering-plans?page=1&limit=100`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(getErrorMessage(result, "Gagal mengambil data catering plans"));
        setPlans([]);
        return;
      }

      setPlans(getArrayData<CateringPlan>(result));
    } catch (error) {
      console.error("GET CATERING PLANS ERROR:", error);
      alert("Terjadi kesalahan saat mengambil catering plans");
      setPlans([]);
    } finally {
      setPlansLoading(false);
    }
  }

  async function handleUploadImage(file: File) {
    try {
      setUploadLoading(true);

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

      const formData = new FormData();

      // Sesuai backend upload. Kalau backend-mu pakai "image", ganti jadi formData.append("image", file)
      formData.append("file", file);

      const response = await fetch(`${baseUrl}/upload/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await readJsonSafe(response);

      console.log("UPLOAD IMAGE STATUS:", response.status);
      console.log("UPLOAD IMAGE RESULT:", result);

      if (!response.ok) {
        alert(getErrorMessage(result, "Gagal upload gambar"));
        return;
      }

      const uploadedImageUrl =
        result?.imageUrl ||
        result?.data?.imageUrl ||
        result?.url ||
        result?.data?.url ||
        result?.secure_url ||
        result?.data?.secure_url;

      if (!uploadedImageUrl) {
        alert("Upload berhasil, tapi imageUrl tidak ditemukan dari backend");
        console.log("UPLOAD RESULT TANPA IMAGE URL:", result);
        return;
      }

      setImageUrl(uploadedImageUrl);
      alert("Gambar berhasil diupload");
    } catch (error) {
      console.error("UPLOAD IMAGE ERROR:", error);
      alert("Terjadi kesalahan saat upload gambar");
    } finally {
      setUploadLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!cateringPlanId.trim()) {
      alert("Catering plan wajib dipilih");
      return;
    }

    if (!name.trim()) {
      alert("Nama meal wajib diisi");
      return;
    }

    if (!imageUrl.trim()) {
      alert("Gambar wajib diupload dulu");
      return;
    }

    if (!ingredients.trim()) {
      alert("Ingredients wajib diisi");
      return;
    }

    if (!calories.trim()) {
      alert("Calories wajib diisi");
      return;
    }

    if (!protein.trim()) {
      alert("Protein wajib diisi");
      return;
    }

    if (!carbs.trim()) {
      alert("Carbs wajib diisi");
      return;
    }

    if (!fat.trim()) {
      alert("Fat wajib diisi");
      return;
    }

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

      const body = {
        name: name.trim(),
        calories: Number(calories),
        protein: Number(protein),
        carbs: Number(carbs),
        fat: Number(fat),
        ingredients: ingredients.trim(),
        cateringPlanId: Number(cateringPlanId),
        imageUrl: imageUrl.trim(),
      };

      console.log("UPDATE MEAL BODY:", body);

      const response = await fetch(`${baseUrl}/meals/${selectedData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const result = await readJsonSafe(response);

      console.log("UPDATE MEAL RESULT:", result);

      if (!response.ok) {
        alert(getErrorMessage(result, "Gagal mengedit meal"));
        return;
      }

      alert(result?.message || "Meal berhasil diedit");
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("UPDATE MEAL ERROR:", error);
      alert("Terjadi kesalahan saat mengedit meal");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) {
      getCateringPlans();
    }
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
        className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition hover:-translate-y-0.5 active:translate-y-0"
        style={{
          background: "#e8f0c8",
          border: "1px solid #c2da85",
          color: "#4e6b12",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <Pencil size={14} strokeWidth={2.5} />
        Edit
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-2xl"
          style={{
            borderRadius: 24,
            border: "0.5px solid #d3e2a0",
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: "0 24px 60px #1e2a0420",
          }}
        >
          <form onSubmit={handleSubmit}>
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
                    ✏️
                  </div>

                  <span
                    className="rounded-full px-3 py-0.5 text-xs font-semibold"
                    style={{ background: "#e8f0c8", color: "#4e6b12" }}
                  >
                    Edit Meal
                  </span>
                </div>

                <DialogTitle
                  className="text-xl font-bold"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "#1e2a04",
                  }}
                >
                  Edit Meal
                </DialogTitle>

                <DialogDescription
                  className="mt-0.5 text-xs"
                  style={{ color: "#8a9a62" }}
                >
                  Ubah data meal. Untuk ganti gambar, upload gambar baru dari
                  galeri.
                </DialogDescription>
              </div>
            </div>

            {/* CONTENT */}
            <div className="space-y-5 px-7 py-6">
              {/* CATERING PLAN */}
              <div>
                <label
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "#6a7a4a" }}
                >
                  Catering Plan
                </label>

                <div className="relative">
                  <select
                    value={cateringPlanId}
                    onChange={(e) => setCateringPlanId(e.target.value)}
                    className="w-full appearance-none rounded-xl px-4 py-3 pr-10 text-sm outline-none transition-all"
                    style={{
                      ...inputStyle,
                      color: cateringPlanId ? "#1e2a04" : "#a8b890",
                    }}
                    onFocus={inputFocusHandler}
                    onBlur={inputBlurHandler}
                  >
                    <option value="">
                      {plansLoading
                        ? "Loading plans..."
                        : "Pilih catering plan"}
                    </option>

                    {plans.map((plan) => (
                      <option key={plan.id} value={String(plan.id)}>
                        {plan.name}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: "#8a9a62" }}
                  />
                </div>
              </div>

              {/* NAME */}
              <div>
                <label
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "#6a7a4a" }}
                >
                  Nama Meal
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Grilled Chicken Salad"
                  className={inputClass}
                  style={inputStyle}
                  onFocus={inputFocusHandler}
                  onBlur={inputBlurHandler}
                />
              </div>

              {/* IMAGE UPLOAD */}
              <div>
                <label
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "#6a7a4a" }}
                >
                  Gambar Meal
                </label>

                <div
                  className="rounded-2xl p-4"
                  style={{
                    background: "#f6f9ee",
                    border: "1px solid #d3e2a0",
                  }}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <label
                      className="flex w-fit cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                      style={{
                        background: uploadLoading
                          ? "#a8c255"
                          : "linear-gradient(135deg, #6b8e23, #8aad3a)",
                        border: "0.5px solid #4e6b12",
                      }}
                    >
                      <Upload size={16} />
                      {uploadLoading ? "Uploading..." : "Ganti Gambar"}

                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadLoading}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];

                          if (file) {
                            handleUploadImage(file);
                          }

                          e.target.value = "";
                        }}
                      />
                    </label>

                    <p className="text-xs leading-5 text-[#6B705C]">
                      Kalau tidak ganti gambar, gambar lama tetap dipakai.
                    </p>
                  </div>

                  {imageUrl ? (
                    <div className="mt-4 grid gap-4 sm:grid-cols-[120px_1fr]">
                      <div className="h-28 w-full overflow-hidden rounded-2xl bg-white">
                        <img
                          src={imageUrl}
                          alt="Preview meal"
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#8a9a62]">
                          Image URL
                        </p>

                        <p className="break-all rounded-xl bg-white px-3 py-2 text-xs leading-5 text-[#4e6b12]">
                          {imageUrl}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm text-[#8a9a62]">
                      <ImagePlus size={18} />
                      Belum ada gambar.
                    </div>
                  )}
                </div>
              </div>

              {/* INGREDIENTS */}
              <div>
                <label
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "#6a7a4a" }}
                >
                  Ingredients
                </label>

                <textarea
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  rows={3}
                  placeholder="Contoh: Chicken breast, lettuce, tomato, olive oil"
                  className="w-full resize-none rounded-xl px-4 py-3 text-sm text-[#1e2a04] outline-none transition-all placeholder:text-[#a8b890]"
                  style={inputStyle}
                  onFocus={inputFocusHandler}
                  onBlur={inputBlurHandler}
                />
              </div>

              {/* NUTRITION */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "#6a7a4a" }}
                  >
                    Calories
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={calories}
                      onChange={(e) =>
                        setCalories(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="350"
                      className={inputClass + " pr-12"}
                      style={inputStyle}
                      onFocus={inputFocusHandler}
                      onBlur={inputBlurHandler}
                    />

                    <span
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold"
                      style={{ color: "#8a9a62" }}
                    >
                      kal
                    </span>
                  </div>
                </div>

                <div>
                  <label
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "#6a7a4a" }}
                  >
                    Protein
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={protein}
                      onChange={(e) =>
                        setProtein(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="30"
                      className={inputClass + " pr-10"}
                      style={inputStyle}
                      onFocus={inputFocusHandler}
                      onBlur={inputBlurHandler}
                    />

                    <span
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold"
                      style={{ color: "#8a9a62" }}
                    >
                      g
                    </span>
                  </div>
                </div>

                <div>
                  <label
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "#6a7a4a" }}
                  >
                    Carbs
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={carbs}
                      onChange={(e) =>
                        setCarbs(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="10"
                      className={inputClass + " pr-10"}
                      style={inputStyle}
                      onFocus={inputFocusHandler}
                      onBlur={inputBlurHandler}
                    />

                    <span
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold"
                      style={{ color: "#8a9a62" }}
                    >
                      g
                    </span>
                  </div>
                </div>

                <div>
                  <label
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "#6a7a4a" }}
                  >
                    Fat
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={fat}
                      onChange={(e) =>
                        setFat(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="15"
                      className={inputClass + " pr-10"}
                      style={inputStyle}
                      onFocus={inputFocusHandler}
                      onBlur={inputBlurHandler}
                    />

                    <span
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold"
                      style={{ color: "#8a9a62" }}
                    >
                      g
                    </span>
                  </div>
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
                disabled={loading || uploadLoading}
                className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50"
                style={{
                  background:
                    loading || uploadLoading
                      ? "#a8c255"
                      : "linear-gradient(135deg, #6b8e23, #8aad3a)",
                  border: "0.5px solid #4e6b12",
                  boxShadow:
                    loading || uploadLoading ? "none" : "0 2px 8px #6b8e2330",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {loading ? (
                  "Updating..."
                ) : (
                  <>
                    <Save size={15} strokeWidth={2.5} />
                    Update Meal
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