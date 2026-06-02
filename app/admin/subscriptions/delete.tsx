"use client";

import { getCookie } from "@/lib/client-cookie";
import { Trash2, AlertTriangle } from "lucide-react";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

type Subscription = {
  id: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  cateringPlan?: {
    id?: number;
    name?: string;
  };
  user?: {
    id?: number;
    name?: string;
    email?: string;
  };
};

type DeleteSubscriptionProps = {
  selectedData: Subscription;
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

export default function DeleteSubscription({
  selectedData,
  onSuccess,
}: DeleteSubscriptionProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
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

      const response = await fetch(`${baseUrl}/subscriptions/${selectedData.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const result = await readJsonSafe(response);

      if (!response.ok) {
        alert(getErrorMessage(result, "Gagal menghapus subscription"));
        return;
      }

      alert(result?.message || "Subscription berhasil dihapus");
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("DELETE SUBSCRIPTION ERROR:", error);
      alert("Terjadi kesalahan saat menghapus subscription");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          background: "#fff1f1",
          border: "1px solid #ffc9c9",
          color: "#b42318",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <Trash2 size={14} strokeWidth={2.5} />
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
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
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
                  Delete Subscription
                </span>
              </div>

              <DialogTitle
                className="text-xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "#1e2a04",
                }}
              >
                Hapus Subscription?
              </DialogTitle>

              <DialogDescription
                className="mt-1 text-sm leading-6"
                style={{ color: "#6a7a4a" }}
              >
                Data subscription ini akan dihapus dari sistem. Pastikan kamu
                benar-benar ingin menghapus data ini.
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
                Subscription yang dipilih
              </p>

              <h3 className="mt-1 text-base font-extrabold text-[#1e2a04]">
                {selectedData.cateringPlan?.name || "Subscription"}
              </h3>

              <p className="mt-1 text-xs leading-5 text-[#6a7a4a]">
                Customer: {selectedData.user?.name || selectedData.user?.email || "-"}
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
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50"
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
                "Deleting..."
              ) : (
                <>
                  <Trash2 size={15} strokeWidth={2.5} />
                  Delete
                </>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}