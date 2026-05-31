"use client";

import { FormEvent, useState } from "react";
import { Pencil, Save } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

type AdminProfile = {
  name: string;
  email: string;
  phone: string;
  role: string;
};

type EditAdminProfileProps = {
  selectedData: AdminProfile;
  onSuccess: (data: AdminProfile) => void;
};

export default function EditAdminProfile({
  selectedData,
  onSuccess,
}: EditAdminProfileProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [role, setRole] = useState<string>("Admin");

  function openModal() {
    setName(selectedData.name || "");
    setEmail(selectedData.email || "");
    setPhone(selectedData.phone || "");
    setRole(selectedData.role || "Admin");
    setOpen(true);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      alert("Nama admin wajib diisi");
      return;
    }

    if (!email.trim()) {
      alert("Email admin wajib diisi");
      return;
    }

    setLoading(true);

    const updatedProfile: AdminProfile = {
      name,
      email,
      phone,
      role,
    };

    setTimeout(() => {
      localStorage.setItem("adminProfile", JSON.stringify(updatedProfile));
      onSuccess(updatedProfile);
      setLoading(false);
      setOpen(false);
      alert("Profile admin berhasil diperbarui");
    }, 500);
  }

  const inputClass =
    "w-full rounded-xl px-4 py-3 text-sm text-[#1e2a04] outline-none transition-all placeholder:text-[#a8b890]";

  const inputStyle = {
    background: "#f6f9ee",
    border: "1px solid #d3e2a0",
    fontFamily: "'DM Sans', sans-serif",
  } as React.CSSProperties;

  const disabledInputStyle = {
    background: "#eef5d6",
    border: "1px solid #d3e2a0",
    color: "#6a7a4a",
    fontFamily: "'DM Sans', sans-serif",
  } as React.CSSProperties;

  const inputFocusHandler = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.border = "1.5px solid #6b8e23";
    e.target.style.background = "#fff";
    e.target.style.boxShadow = "0 0 0 3px #6b8e2318";
  };

  const inputBlurHandler = (e: React.FocusEvent<HTMLInputElement>) => {
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
        <Pencil size={16} strokeWidth={2.5} />
        Edit Profile
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
                    👤
                  </div>

                  <span
                    className="rounded-full px-3 py-0.5 text-xs font-semibold"
                    style={{ background: "#e8f0c8", color: "#4e6b12" }}
                  >
                    Admin Profile
                  </span>
                </div>

                <DialogTitle
                  className="text-xl font-bold"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "#1e2a04",
                  }}
                >
                  Edit Profile Admin
                </DialogTitle>

                <DialogDescription
                  className="mt-0.5 text-xs"
                  style={{ color: "#8a9a62" }}
                >
                  Ubah informasi akun administrator NutriCare.
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
                  Nama Admin
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama admin"
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
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email admin"
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
                  No. Telepon
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="Contoh: 081234567890"
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
                  Role
                </label>

                <input
                  type="text"
                  value={role}
                  disabled
                  className={inputClass + " cursor-not-allowed"}
                  style={disabledInputStyle}
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