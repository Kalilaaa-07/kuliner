"use client";

import * as XLSX from "xlsx";
import { Download } from "lucide-react";

type ExportSubscriptionsProps = {
  subscriptions: any[];
};

function formatDate(date: any) {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "-";

  return parsedDate.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatCurrency(value: any) {
  const numberValue = Number(value || 0);

  return numberValue.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });
}

function getCustomerName(sub: any) {
  return (
    sub?.customer?.name ||
    sub?.user?.name ||
    sub?.Customer?.name ||
    sub?.User?.name ||
    sub?.customerName ||
    sub?.userName ||
    sub?.name ||
    "-"
  );
}

function getCustomerEmail(sub: any) {
  return (
    sub?.customer?.email ||
    sub?.user?.email ||
    sub?.Customer?.email ||
    sub?.User?.email ||
    sub?.customerEmail ||
    sub?.userEmail ||
    sub?.email ||
    "-"
  );
}

function getPlanName(sub: any) {
  return (
    sub?.cateringPlan?.name ||
    sub?.plan?.name ||
    sub?.CateringPlan?.name ||
    sub?.Plan?.name ||
    sub?.planName ||
    sub?.cateringPlanName ||
    "-"
  );
}

function getPlanDuration(sub: any) {
  return (
    sub?.duration ||
    sub?.cateringPlan?.duration ||
    sub?.plan?.duration ||
    sub?.CateringPlan?.duration ||
    sub?.Plan?.duration ||
    "-"
  );
}

function getPrice(sub: any) {
  return (
    sub?.totalPrice ||
    sub?.total ||
    sub?.price ||
    sub?.cateringPlan?.price ||
    sub?.plan?.price ||
    sub?.CateringPlan?.price ||
    sub?.Plan?.price ||
    0
  );
}

function getAddress(sub: any) {
  const city =
    sub?.customer?.city?.name ||
    sub?.user?.city?.name ||
    sub?.city?.name ||
    "";

  const province =
    sub?.customer?.city?.province?.name ||
    sub?.user?.city?.province?.name ||
    sub?.city?.province?.name ||
    "";

  const fullAddress =
    sub?.customer?.fullAddress ||
    sub?.user?.fullAddress ||
    sub?.fullAddress ||
    sub?.address ||
    "";

  const addressDetail =
    sub?.customer?.addressDetail ||
    sub?.user?.addressDetail ||
    sub?.addressDetail ||
    "";

  const location = [province, city].filter(Boolean).join(", ");

  const finalAddress = [location, fullAddress, addressDetail]
    .filter(Boolean)
    .join(", ");

  return finalAddress || "-";
}

export default function ExportSubscriptions({
  subscriptions,
}: ExportSubscriptionsProps) {
  function handleExport() {
    try {
      if (!subscriptions || subscriptions.length === 0) {
        alert("Data subscription masih kosong.");
        return;
      }

      const spreadsheetData = subscriptions.map((sub: any, index: number) => {
        const duration = getPlanDuration(sub);

        return {
          No: index + 1,
          "Nama Customer": getCustomerName(sub),
          Email: getCustomerEmail(sub),
          "Nama Plan": getPlanName(sub),
          Harga: formatCurrency(getPrice(sub)),
          Durasi: duration === "-" ? "-" : `${duration} hari`,
          "Tanggal Mulai": formatDate(sub?.startDate),
          "Tanggal Selesai": formatDate(sub?.endDate),
          Status: sub?.status || "-",
          Address: getAddress(sub),
          "Dibuat Pada": formatDate(sub?.createdAt),
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(spreadsheetData);

      worksheet["!cols"] = [
        { wch: 5 },
        { wch: 25 },
        { wch: 32 },
        { wch: 25 },
        { wch: 18 },
        { wch: 12 },
        { wch: 18 },
        { wch: 18 },
        { wch: 15 },
        { wch: 45 },
        { wch: 18 },
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Subscriptions");

      XLSX.writeFile(workbook, "data-subscriptions.xlsx");
    } catch (error) {
      console.error("EXPORT SUBSCRIPTIONS ERROR:", error);
      alert("Terjadi kesalahan saat export data subscription.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="flex items-center justify-center gap-2 rounded-2xl bg-[#6B8E23] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#5B7C1E] active:translate-y-0"
    >
      <Download size={18} />
      Export Data
    </button>
  );
}