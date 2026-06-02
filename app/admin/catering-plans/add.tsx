"use client";

import { getCookie } from "@/lib/client-cookie";
import { FormEvent, useState } from "react";
import { Plus, ChevronDown } from "lucide-react";
import type { Category } from "./page";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

type AddPlanProps = {
  categories: Category[];
  onSuccess: () => void;
};

function getToken() {
  return getCookie("accessToken") || getCookie("accesstoken") || "";
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

export default function AddPlan({ categories, onSuccess }: AddPlanProps) {
  const [open, setOpen] = useState<boolean>(false);

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);

  function openModal() {
    setName("");
    setDescription("");
    setPrice("");
    setDuration("");
    setCategoryId("");
    setIsActive(true);
    setOpen(true);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      alert("Nama plan wajib diisi");
      return;
    }

    if (!description.trim()) {
      alert("Deskripsi wajib diisi");
      return;
    }

    if (!price.trim()) {
      alert("Harga wajib diisi");
      return;
    }

    if (!duration.trim()) {
      alert("Duration wajib diisi");
      return;
    }

    if (!categoryId.trim()) {
      alert("Category wajib dipilih");
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
        description: description.trim(),
        price: Number(price),
        duration: Number(duration),
        isActive,
        categoryId: Number(categoryId),
      };

      const response = await fetch(`${baseUrl}/catering-plans`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const result = await readJsonSafe(response);

      if (!response.ok) {
        alert(getErrorMessage(result, "Gagal menambah catering plan"));
        return;
      }

      alert(result?.message || "Catering plan berhasil ditambahkan");
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("CREATE PLAN ERROR:", error);
      alert("Terjadi kesalahan saat menambah catering plan");
    } finally {
      setLoading(false);
    }
  }

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
        className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 active:translate-y-0"
        style={{
          background: "linear-gradient(135deg, #6b8e23, #8aad3a)",
          border: "0.5px solid #4e6b12",
          fontFamily: "'DM Sans', sans-serif",
          boxShadow: "0 2px 8px #6b8e2330",
        }}
      >
        <Plus size={16} strokeWidth={2.5} />
        Add Plan
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
                    🥗
                  </div>

                  <span
                    className="rounded-full px-3 py-0.5 text-xs font-semibold"
                    style={{ background: "#e8f0c8", color: "#4e6b12" }}
                  >
                    New Plan
                  </span>
                </div>

                <DialogTitle
                  className="text-xl font-bold"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "#1e2a04",
                  }}
                >
                  Add Catering Plan
                </DialogTitle>

                <DialogDescription
                  className="mt-0.5 text-xs"
                  style={{ color: "#8a9a62" }}
                >
                  Tambahkan paket catering baru.
                </DialogDescription>
              </div>
            </div>

            <div className="space-y-5 px-7 py-6">
              <div>
                <label
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "#6a7a4a" }}
                >
                  Nama Plan
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Healthy Week Plan"
                  className={inputClass}
                  style={inputStyle}
                  onFocus={inputFocusHandler}
                  onBlur={inputBlurHandler}
                />
              </div>

              <div>
                <label
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "#6a7a4a" }}
                >
                  Deskripsi
                </label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Contoh: A balanced diet plan for 7 days"
                  className="w-full resize-none rounded-xl px-4 py-3 text-sm text-[#1e2a04] outline-none transition-all placeholder:text-[#a8b890]"
                  style={inputStyle}
                  onFocus={inputFocusHandler}
                  onBlur={inputBlurHandler}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "#6a7a4a" }}
                  >
                    Harga (Rp)
                  </label>

                  <div className="relative">
                    <span
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold"
                      style={{ color: "#8a9a62" }}
                    >
                      Rp
                    </span>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={price}
                      onChange={(e) =>
                        setPrice(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="150000"
                      className={inputClass + " pl-9"}
                      style={inputStyle}
                      onFocus={inputFocusHandler}
                      onBlur={inputBlurHandler}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "#6a7a4a" }}
                  >
                    Durasi (hari)
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={duration}
                      onChange={(e) =>
                        setDuration(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="7"
                      className={inputClass + " pr-12"}
                      style={inputStyle}
                      onFocus={inputFocusHandler}
                      onBlur={inputBlurHandler}
                    />

                    <span
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold"
                      style={{ color: "#8a9a62" }}
                    >
                      hari
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "#6a7a4a" }}
                >
                  Kategori
                </label>

                <div className="relative">
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full appearance-none rounded-xl px-4 py-3 pr-10 text-sm outline-none transition-all"
                    style={{
                      ...inputStyle,
                      color: categoryId ? "#1e2a04" : "#a8b890",
                    }}
                    onFocus={inputFocusHandler}
                    onBlur={inputBlurHandler}
                  >
                    <option value="">Pilih kategori</option>

                    {categories.map((category) => (
                      <option key={category.id} value={String(category.id)}>
                        {category.name}
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

              <div>
                <label
                  className="mb-2 block text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "#6a7a4a" }}
                >
                  Status
                </label>

                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Active", value: true, icon: "✅" },
                    { label: "Inactive", value: false, icon: "⏸️" },
                  ].map(({ label, value, icon }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setIsActive(value)}
                      className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition"
                      style={{
                        background:
                          isActive === value
                            ? value
                              ? "#e8f0c8"
                              : "#fdf3e7"
                            : "#f6f9ee",
                        border:
                          isActive === value
                            ? `1.5px solid ${value ? "#6b8e23" : "#dda15e"}`
                            : "1px solid #d3e2a0",
                        color:
                          isActive === value
                            ? value
                              ? "#4e6b12"
                              : "#a06020"
                            : "#8a9a62",
                      }}
                    >
                      <span className="text-sm">{icon}</span>
                      {label}
                    </button>
                  ))}
                </div>
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
                  "Saving..."
                ) : (
                  <>
                    <Plus size={15} strokeWidth={2.5} />
                    Save Plan
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