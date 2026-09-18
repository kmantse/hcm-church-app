"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatDate, formatDateTime } from "@/lib/utils";
import {
  downloadCsv,
  downloadPdf,
  downloadXlsx,
  toCsv,
  REPORTS,
} from "@/lib/reports";
import {
  FileText,
  FileSpreadsheet,
  Download,
  Users,
  UserPlus,
  CalendarDays,
  ClipboardList,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { inputClass, selectClass } from "@/components/ui/FormField";

type ReportType = "members" | "visitors" | "registrations" | "attendance";
type ExportFormat = "pdf" | "csv" | "xlsx";

const reportMeta: Record<
  ReportType,
  { label: string; description: string; icon: React.ElementType; color: string }
> = {
  members: {
    label: "Members Report",
    description: "Full member list with contact details and membership status",
    icon: Users,
    color: "bg-blue-50 border-blue-200 text-blue-700",
  },
  visitors: {
    label: "Visitors Report",
    description: "All visitors with visit count and contact information",
    icon: UserPlus,
    color: "bg-green-50 border-green-200 text-green-700",
  },
  attendance: {
    label: "Attendance Report",
    description: "Programme attendance filtered by date range or specific programme",
    icon: CalendarDays,
    color: "bg-purple-50 border-purple-200 text-purple-700",
  },
  registrations: {
    label: "Registrations Report",
    description: "New member registration submissions and their approval status",
    icon: ClipboardList,
    color: "bg-orange-50 border-orange-200 text-orange-700",
  },
};

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("members");
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Attendance-specific filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [programmeFilter, setProgrammeFilter] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setDone(false);
    try {
      if (reportType === "attendance") {
        await generateAttendanceReport();
      } else {
        await generateStandardReport(reportType);
      }
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const generateStandardReport = async (type: "members" | "visitors" | "registrations") => {
    const config = REPORTS[type];
    let url = config.apiPath;

    if (type === "members" && statusFilter) url += `?status=${statusFilter}`;

    const res = await fetch(url);
    const data: Record<string, unknown>[] = await res.json();
    const rows = data.map((item, i) => config.row(item, i) as unknown[]);
    const { headers, filename } = config;
    const ts = new Date().toISOString().split("T")[0];
    const title = reportMeta[type].label;
    const subtitle = `${data.length} record${data.length !== 1 ? "s" : ""} · ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`;

    if (format === "csv") {
      downloadCsv(toCsv(headers as unknown as string[], rows), `${filename}-${ts}.csv`);
    } else if (format === "xlsx") {
      await downloadXlsx(headers as unknown as string[], rows, title, `${filename}-${ts}.xlsx`);
    } else {
      await downloadPdf(title, subtitle, headers as unknown as string[], rows, `${filename}-${ts}.pdf`);
    }
  };

  const generateAttendanceReport = async () => {
    const params = new URLSearchParams();
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);
    if (programmeFilter) params.set("programmeId", programmeFilter);

    const res = await fetch(`/api/reports/attendance?${params}`);
    const data: Record<string, unknown>[] = await res.json();

    const headers = [
      "#", "Programme", "Type", "Date", "Venue",
      "Attendee Name", "Attendee Type", "Email", "Phone", "Check-in Time",
    ];

    const rows = data.map((a, i) => {
      const person = (a.member || a.visitor) as Record<string, unknown> | null;
      const prog = a.programme as Record<string, unknown>;
      return [
        i + 1,
        prog?.title ?? "—",
        prog?.type ?? "—",
        formatDate(prog?.date as string),
        prog?.venue ?? "—",
        person ? `${person.firstName} ${person.lastName}` : "—",
        a.attendeeType,
        person?.email ?? "—",
        person?.phone ?? "—",
        formatDateTime(a.checkInTime as string),
      ];
    });

    const ts = new Date().toISOString().split("T")[0];
    const rangeLabel = dateFrom || dateTo
      ? `${dateFrom ? formatDate(dateFrom) : "All"} – ${dateTo ? formatDate(dateTo) : "All"}`
      : "All dates";
    const subtitle = `${data.length} record${data.length !== 1 ? "s" : ""} · ${rangeLabel}`;

    if (format === "csv") {
      downloadCsv(toCsv(headers, rows), `attendance-report-${ts}.csv`);
    } else if (format === "xlsx") {
      await downloadXlsx(headers, rows, "Attendance", `attendance-report-${ts}.xlsx`);
    } else {
      await downloadPdf("Attendance Report", subtitle, headers, rows, `attendance-report-${ts}.pdf`);
    }
  };

  const meta = reportMeta[reportType];
  const Icon = meta.icon;

  return (
    <div className="p-4 sm:p-6 max-w-3xl">
      <PageHeader
        title="Reports"
        description="Generate and download reports in PDF, CSV or Excel format"
      />

      {/* Report Type Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {(Object.entries(reportMeta) as [ReportType, typeof reportMeta[ReportType]][]).map(
          ([key, { label, icon: CardIcon, color }]) => (
            <button
              key={key}
              onClick={() => setReportType(key)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all ${
                reportType === key
                  ? color + " border-current"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
            >
              <CardIcon className="w-6 h-6" />
              <span className="text-xs font-semibold leading-tight">{label}</span>
            </button>
          )
        )}
      </div>

      {/* Configuration Panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-5">
        <div className={`flex items-center gap-3 p-4 rounded-xl border mb-5 ${meta.color}`}>
          <Icon className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-semibold text-sm">{meta.label}</p>
            <p className="text-xs opacity-80 mt-0.5">{meta.description}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          {/* Members: status filter */}
          {reportType === "members" && (
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={selectClass}
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active only</option>
                <option value="INACTIVE">Inactive only</option>
                <option value="PENDING">Pending only</option>
              </select>
            </div>
          )}

          {/* Registrations: status filter */}
          {reportType === "registrations" && (
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={selectClass}
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="DECLINED">Declined</option>
              </select>
            </div>
          )}

          {/* Attendance filters */}
          {reportType === "attendance" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">
                    Date From
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">
                    Date To
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <AttendanceProgrammeFilter
                value={programmeFilter}
                onChange={setProgrammeFilter}
              />
            </>
          )}
        </div>
      </div>

      {/* Format + Download */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Export Format</h3>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {([
            { key: "pdf", label: "PDF", icon: FileText, desc: "Print-ready, branded" },
            { key: "csv", label: "CSV", icon: FileText, desc: "Plain text, universal" },
            { key: "xlsx", label: "Excel (XLSX)", icon: FileSpreadsheet, desc: "Spreadsheet, editable" },
          ] as { key: ExportFormat; label: string; icon: React.ElementType; desc: string }[]).map(
            ({ key, label, icon: FmtIcon, desc }) => (
              <button
                key={key}
                onClick={() => setFormat(key)}
                className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all ${
                  format === key
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 text-slate-500 hover:border-slate-300 bg-white"
                }`}
              >
                <FmtIcon className="w-6 h-6" />
                <span className="text-sm font-bold">{label}</span>
                <span className="text-xs opacity-70">{desc}</span>
              </button>
            )
          )}
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 text-sm"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
          ) : done ? (
            <><CheckCircle className="w-4 h-4" /> Downloaded!</>
          ) : (
            <><Download className="w-4 h-4" /> Generate &amp; Download {format.toUpperCase()}</>
          )}
        </button>

        {done && (
          <p className="text-xs text-center text-green-600 mt-2">
            Your file has been downloaded.
          </p>
        )}
      </div>
    </div>
  );
}

// Loads programme list for the attendance filter dropdown
function AttendanceProgrammeFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [programmes, setProgrammes] = useState<
    { id: string; title: string; date: string }[]
  >([]);
  const [loaded, setLoaded] = useState(false);

  const load = () => {
    if (loaded) return;
    fetch("/api/programmes")
      .then((r) => r.json())
      .then((data) => { setProgrammes(data); setLoaded(true); });
  };

  return (
    <div>
      <label className="text-sm font-medium text-slate-700 block mb-1.5">
        Filter by Programme (optional)
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={load}
        className={selectClass}
      >
        <option value="">All Programmes</option>
        {programmes.map((p) => (
          <option key={p.id} value={p.id}>
            {p.title} — {formatDate(p.date)}
          </option>
        ))}
      </select>
    </div>
  );
}
