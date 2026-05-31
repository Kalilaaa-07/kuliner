"use client";

import { getCookie } from "@/lib/client-cookie";
import { FormEvent, useState } from "react";
import { Plus, Save } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

type AddCategoryProps = {
  onSuccess: () => void;
};

export default function AddCategory({ onSuccess }: AddCategoryProps) {
  const [open, setOpen] = useState<boolean>(false);

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);

  function openModal() {
    setName("");
    setDescription("");
    setOpen(true);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      alert("Nama kategori wajib diisi");
      return;
    }

    if (!description.trim()) {
      alert("Deskripsi kategori wajib diisi");
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

      const response = await fetch(`${baseUrl}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Gagal menambah kategori");
        return;
      }

      alert(result.message || "Kategori berhasil ditambahkan");

      setName("");
      setDescription("");
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menambah kategori");
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
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    e.target.style.border = "1.5px solid #6b8e23";
    e.target.style.background = "#fff";
    e.target.style.boxShadow = "0 0 0 3px #6b8e2318";
  };

  const inputBlurHandler = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    e.target.style.border = "1px solid #d3e2a0";
    e.target.style.background = "#f6f9ee";
    e.target.style.boxShadow = "none";
  };

  return (
    <>
      {/* Trigger Button */}
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
        Add Category
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
            {/* Header */}
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
                    🏷️
                  </div>

                  <span
                    className="rounded-full px-3 py-0.5 text-xs font-semibold"
                    style={{ background: "#e8f0c8", color: "#4e6b12" }}
                  >
                    New Category
                  </span>
                </div>

                <DialogTitle
                  className="text-xl font-bold"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "#1e2a04",
                  }}
                >
                  Add Category
                </DialogTitle>

                <DialogDescription
                  className="mt-0.5 text-xs"
                  style={{ color: "#8a9a62" }}
                >
                  Tambahkan kategori baru sesuai format.
                </DialogDescription>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-5 px-7 py-6">
              <div>
                <label
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "#6a7a4a" }}
                >
                  Nama Category
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Diet"
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
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Contoh: Healthy diet plans for weight loss"
                  className="w-full resize-none rounded-xl px-4 py-3 text-sm text-[#1e2a04] outline-none transition-all placeholder:text-[#a8b890]"
                  style={inputStyle}
                  onFocus={inputFocusHandler}
                  onBlur={inputBlurHandler}
                />
              </div>
            </div>

            {/* Footer */}
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
                    Save Category
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