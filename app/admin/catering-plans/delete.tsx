"use client";

import { getCookie } from "@/lib/client-cookie";
import { Trash2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import type { CateringPlan } from "./page";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

type DeletePlanProps = {
  selectedData: CateringPlan;
  onSuccess: () => void;
};

export default function DeletePlan({
  selectedData,
  onSuccess,
}: DeletePlanProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  async function handleDelete() {
    try {
      setLoading(true);

      const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;
      const token = getCookie("accesstoken");

      if (!baseUrl) {
        alert("NEXT_PUBLIC_BASE_API_URL belum diisi");
        return;
      }

      const response = await fetch(
        `${baseUrl}/catering-plans/${selectedData.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Gagal menghapus catering plan");
        return;
      }

      alert(result.message || "Catering plan berhasil dihapus");
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menghapus catering plan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition hover:-translate-y-0.5 active:translate-y-0"
        style={{
          background: "#fff1f1",
          border: "1px solid #ffc9c9",
          color: "#b42318",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <Trash2 size={14} strokeWidth={2.5} />
        Delete
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="p-0 sm:max-w-md"
          style={{
            borderRadius: 24,
            border: "0.5px solid #ffd0d0",
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: "0 24px 60px #1e2a0420",
          }}
        >
          <div
            className="relative overflow-hidden px-7 pb-5 pt-7"
            style={{ borderBottom: "0.5px solid #ffe1e1" }}
          >
            <div
              className="absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-20"
              style={{ background: "#dc2626" }}
            />

            <div className="relative z-10">
              <div className="mb-3 flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-base sm:h-10 sm:w-10 sm:text-lg"
                  style={{
                    background: "#fff1f1",
                    border: "1px solid #ffc9c9",
                    color: "#b42318",
                  }}
                >
                  <AlertTriangle size={22} />
                </div>

                <span
                  className="rounded-full px-3 py-1 text-xs font-bold"
                  style={{
                    background: "#fff1f1",
                    color: "#b42318",
                  }}
                >
                  Delete Plan
                </span>
              </div>

              <DialogTitle
                className="text-xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "#1e2a04",
                }}
              >
                Hapus Catering Plan?
              </DialogTitle>

              <DialogDescription
                className="mt-1 text-sm leading-6"
                style={{ color: "#6a7a4a" }}
              >
                Data plan ini akan dihapus dari sistem. Pastikan kamu benar-benar
                ingin menghapus plan ini.
              </DialogDescription>
            </div>
          </div>

          <div className="px-7 py-6">
            <div
              className="rounded-2xl p-4"
              style={{
                background: "#f6f9ee",
                border: "1px solid #d3e2a0",
              }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-[#8a9a62]">
                Plan yang dipilih
              </p>

              <h3 className="mt-1 text-base font-extrabold text-[#1e2a04]">
                {selectedData.name}
              </h3>

              <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#6a7a4a]">
                {selectedData.description || "Tidak ada deskripsi"}
              </p>
            </div>
          </div>

          <div
            className="flex items-center justify-end gap-3 px-7 py-5"
            style={{ borderTop: "0.5px solid #ffe1e1" }}
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
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50"
              style={{
                background: loading
                  ? "#fca5a5"
                  : "linear-gradient(135deg, #dc2626, #ef4444)",
                border: "0.5px solid #b91c1c",
                boxShadow: loading ? "none" : "0 2px 8px #dc262630",
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
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={15} strokeWidth={2.5} />
                  Delete Plan
                </>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}