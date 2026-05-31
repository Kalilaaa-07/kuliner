"use client";

import { getCookie } from "@/lib/client-cookie";
import { FormEvent, useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import type { Meal } from "./page";

type DeleteMealProps = {
  selectedData: Meal;
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

export default function DeleteMeal({
  selectedData,
  onSuccess,
}: DeleteMealProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  async function handleDelete(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

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

      const response = await fetch(`${baseUrl}/meals/${selectedData.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await readJsonSafe(response);

      console.log("DELETE MEAL STATUS:", response.status);
      console.log("DELETE MEAL RESULT:", result);

      if (!response.ok) {
        alert(getErrorMessage(result, "Gagal menghapus meal"));
        return;
      }

      alert(result?.message || "Meal berhasil dihapus");
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("DELETE MEAL ERROR:", error);
      alert("Terjadi kesalahan saat menghapus meal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition hover:-translate-y-0.5 active:translate-y-0"
          style={{
            background: "#fff4e8",
            border: "1px solid #f3c98b",
            color: "#b45309",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <Trash2 size={14} strokeWidth={2.5} />
          Delete
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent
        className="overflow-hidden p-0 sm:max-w-md"
        style={{
          borderRadius: 24,
          border: "0.5px solid #d3e2a0",
          fontFamily: "'DM Sans', sans-serif",
          boxShadow: "0 24px 60px #1e2a0420",
        }}
      >
        <form onSubmit={handleDelete}>
          {/* HEADER */}
          <div
            className="relative overflow-hidden px-7 pb-5 pt-7"
            style={{ borderBottom: "0.5px solid #e8f0c8" }}
          >
            <div
              className="absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-20"
              style={{ background: "#b45309" }}
            />

            <AlertDialogHeader className="relative z-10 space-y-0 text-left">
              <div className="mb-3 flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl"
                  style={{
                    background: "#fff4e8",
                    border: "0.5px solid #f3c98b",
                    color: "#b45309",
                  }}
                >
                  <AlertTriangle size={22} />
                </div>

                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    background: "#fff4e8",
                    color: "#b45309",
                  }}
                >
                  Delete Meal
                </span>
              </div>

              <AlertDialogTitle
                className="text-xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "#1e2a04",
                }}
              >
                Hapus meal?
              </AlertDialogTitle>

              <AlertDialogDescription
                className="mt-2 text-sm leading-6"
                style={{ color: "#6B705C" }}
              >
                Meal{" "}
                <span className="font-bold text-[#283618]">
                  {selectedData.name}
                </span>{" "}
                akan dihapus dari data meals. Pastikan meal ini tidak sedang
                dipakai di catering plan.
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>

          {/* CONTENT */}
          <div className="px-7 py-5">
            <div
              className="rounded-2xl px-4 py-3"
              style={{
                background: "#f6f9ee",
                border: "1px solid #d3e2a0",
              }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-[#8a9a62]">
                Meal yang dipilih
              </p>

              <p className="mt-1 text-sm font-bold text-[#1e2a04]">
                #{selectedData.id} - {selectedData.name}
              </p>

              <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#6B705C]">
                {selectedData.ingredients || "Tidak ada ingredients"}
              </p>
            </div>
          </div>

          {/* FOOTER */}
          <AlertDialogFooter
            className="flex-row justify-end gap-3 px-7 py-5"
            style={{ borderTop: "0.5px solid #e8f0c8" }}
          >
            <AlertDialogCancel
              type="button"
              disabled={loading}
              className="mt-0 rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:bg-[#f0f5e0]"
              style={{
                border: "1px solid #d3e2a0",
                color: "#6a7a4a",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Cancel
            </AlertDialogCancel>

            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50"
              style={{
                background: loading
                  ? "#d8a35d"
                  : "linear-gradient(135deg, #b45309, #d97706)",
                border: "0.5px solid #92400e",
                boxShadow: loading ? "none" : "0 2px 8px #b4530930",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {loading ? "Deleting..." : "Delete Meal"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}