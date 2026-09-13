import { formatDate } from "@/lib/utils";

// ─── CSV ─────────────────────────────────────────────────────────────────────

function escapeCsv(val: unknown): string {
  if (val == null) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsv(headers: string[], rows: unknown[][]): string {
  const lines = [
    headers.map(escapeCsv).join(","),
    ...rows.map((r) => r.map(escapeCsv).join(",")),
  ];
  return lines.join("\r\n");
}

export function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, filename);
}

// ─── XLSX ────────────────────────────────────────────────────────────────────

export async function downloadXlsx(
  headers: string[],
  rows: unknown[][],
  sheetName: string,
  filename: string
) {
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Auto column widths
  const colWidths = headers.map((h, i) => ({
    wch: Math.max(
      h.length,
      ...rows.map((r) => String(r[i] ?? "").length)
    ) + 2,
  }));
  ws["!cols"] = colWidths;

  XLSX.writeFile(wb, filename);
}

// ─── PDF ─────────────────────────────────────────────────────────────────────

export async function downloadPdf(
  title: string,
  subtitle: string,
  headers: string[],
  rows: unknown[][],
  filename: string
) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header band
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 10);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(subtitle, 14, 17);

  // Generated date (top-right)
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString("en-GB")}`, pageWidth - 14, 17, { align: "right" });

  // Table
  autoTable(doc, {
    head: [headers],
    body: rows as (string | number)[][],
    startY: 28,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, doc.internal.pageSize.getHeight() - 5, { align: "right" });
    doc.text("Church HCM", 14, doc.internal.pageSize.getHeight() - 5);
  }

  doc.save(filename);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Report data shapers ──────────────────────────────────────────────────────

export const REPORTS = {
  members: {
    label: "Members Report",
    headers: ["#", "First Name", "Last Name", "Email", "Phone", "Gender", "Marital Status", "Occupation", "City", "Membership Date", "Status"],
    row: (m: Record<string, unknown>, i: number) => [
      i + 1,
      m.firstName,
      m.lastName,
      m.email ?? "—",
      m.phone ?? "—",
      m.gender ?? "—",
      m.maritalStatus ?? "—",
      m.occupation ?? "—",
      m.city ?? "—",
      formatDate(m.membershipDate as string),
      m.membershipStatus,
    ],
    filename: "members-report",
    apiPath: "/api/members",
  },
  visitors: {
    label: "Visitors Report",
    headers: ["#", "First Name", "Last Name", "Email", "Phone", "Gender", "Invited By", "Purpose", "No. of Visits", "First Registered"],
    row: (v: Record<string, unknown>, i: number) => [
      i + 1,
      v.firstName,
      v.lastName,
      v.email ?? "—",
      v.phone ?? "—",
      v.gender ?? "—",
      v.invitedBy ?? "—",
      v.purpose ?? "—",
      Array.isArray(v.visits) ? v.visits.length : 0,
      formatDate(v.createdAt as string),
    ],
    filename: "visitors-report",
    apiPath: "/api/visitors",
  },
  registrations: {
    label: "Registrations Report",
    headers: ["#", "First Name", "Last Name", "Email", "Phone", "Gender", "City", "Occupation", "How They Heard", "Status", "Date Submitted"],
    row: (r: Record<string, unknown>, i: number) => [
      i + 1,
      r.firstName,
      r.lastName,
      r.email ?? "—",
      r.phone ?? "—",
      r.gender ?? "—",
      r.city ?? "—",
      r.occupation ?? "—",
      r.howDidYouHear ?? "—",
      r.status,
      formatDate(r.createdAt as string),
    ],
    filename: "registrations-report",
    apiPath: "/api/registrations",
  },
} as const;
