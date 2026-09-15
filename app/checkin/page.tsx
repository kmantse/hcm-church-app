"use client";

import { useEffect, useState, useCallback } from "react";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";
import { Church, QrCode, Search, CheckCircle, Users, UserPlus, CalendarDays } from "lucide-react";

interface Programme {
  id: string;
  title: string;
  type: string;
  date: string;
}

interface SearchResult {
  id: string;
  firstName: string;
  lastName: string;
  type: "MEMBER" | "VISITOR";
  email?: string | null;
  phone?: string | null;
}

interface CheckInRecord {
  id: string;
  checkInTime: string;
  attendeeType: string;
  member: { firstName: string; lastName: string } | null;
  visitor: { firstName: string; lastName: string } | null;
}

export default function PublicCheckInPage() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [selectedProgramme, setSelectedProgramme] = useState<string>("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetch("/api/programmes")
      .then((r) => r.json())
      .then(setProgrammes);
  }, []);

  const fetchCheckIns = useCallback(async () => {
    if (!selectedProgramme) return;
    const res = await fetch(`/api/checkin?programmeId=${selectedProgramme}`);
    setCheckIns(await res.json());
  }, [selectedProgramme]);

  useEffect(() => { fetchCheckIns(); }, [fetchCheckIns]);

  useEffect(() => {
    if (!search || search.length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      const [mr, vr] = await Promise.all([
        fetch(`/api/members?search=${encodeURIComponent(search)}`),
        fetch(`/api/visitors?search=${encodeURIComponent(search)}`),
      ]);
      const [members, visitors] = await Promise.all([mr.json(), vr.json()]);
      setSearchResults([
        ...members.map((m: { id: string; firstName: string; lastName: string; email: string | null; phone: string | null }) => ({ ...m, type: "MEMBER" as const })),
        ...visitors.map((v: { id: string; firstName: string; lastName: string; email: string | null; phone: string | null }) => ({ ...v, type: "VISITOR" as const })),
      ]);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCheckIn = async (person: SearchResult) => {
    if (!selectedProgramme) {
      setMessage({ type: "error", text: "Please select a programme first" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    const res = await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ programmeId: selectedProgramme, attendeeId: person.id, attendeeType: person.type }),
    });
    if (res.status === 409) {
      setMessage({ type: "error", text: `${person.firstName} is already checked in` });
    } else if (res.ok) {
      setMessage({ type: "success", text: `${person.firstName} ${person.lastName} checked in!` });
      setSearch("");
      setSearchResults([]);
      fetchCheckIns();
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const selectedProg = programmes.find((p) => p.id === selectedProgramme);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
            <Church className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm leading-tight">Church HCM</p>
            <p className="text-xs text-slate-500">Attendance Check-in</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Programme Selector */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="w-4 h-4 text-slate-500" />
            <h2 className="font-semibold text-slate-900">Select Programme</h2>
          </div>
          <select
            value={selectedProgramme}
            onChange={(e) => setSelectedProgramme(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">-- Choose a programme --</option>
            {programmes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} — {new Date(p.date).toLocaleDateString("en-GB")} ({p.type})
              </option>
            ))}
          </select>
          {selectedProg && (
            <p className="text-xs text-slate-500 mt-2">
              Checking in for: <strong>{selectedProg.title}</strong> · {checkIns.length} checked in so far
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Search & Check-in */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <QrCode className="w-4 h-4 text-slate-500" />
              <h2 className="font-semibold text-slate-900">Find Person</h2>
            </div>

            {message && (
              <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {message.type === "success" && <CheckCircle className="w-4 h-4" />}
                {message.text}
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {searching && <p className="text-xs text-slate-400 mt-2 animate-pulse">Searching...</p>}

            {searchResults.length > 0 && (
              <div className="mt-3 border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
                {searchResults.map((person) => (
                  <button
                    key={`${person.type}-${person.id}`}
                    onClick={() => handleCheckIn(person)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        person.type === "MEMBER" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                      }`}>
                        {person.firstName[0]}{person.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{person.firstName} {person.lastName}</p>
                        <p className="text-xs text-slate-500">{person.email || person.phone || ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusBadge(person.type)}>{person.type}</Badge>
                      <span className="text-xs text-blue-600 font-medium">Check in →</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {search.length >= 2 && !searching && searchResults.length === 0 && (
              <div className="mt-3 text-center py-6 text-slate-400">
                <p className="text-sm">No results for &quot;{search}&quot;</p>
              </div>
            )}
          </div>

          {/* Checked-in list */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500" />
                <h2 className="font-semibold text-slate-900">Checked In ({checkIns.length})</h2>
              </div>
              <div className="flex gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  {checkIns.filter((c) => c.attendeeType === "MEMBER").length} Members
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  {checkIns.filter((c) => c.attendeeType === "VISITOR").length} Visitors
                </span>
              </div>
            </div>

            {!selectedProgramme ? (
              <div className="text-center py-10 text-slate-400">
                <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Select a programme to see check-ins</p>
              </div>
            ) : checkIns.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <UserPlus className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No one checked in yet</p>
              </div>
            ) : (
              <div className="space-y-2 overflow-y-auto max-h-96">
                {checkIns.map((c) => {
                  const person = c.member || c.visitor;
                  const name = person ? `${person.firstName} ${person.lastName}` : "Unknown";
                  return (
                    <div key={c.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          c.attendeeType === "MEMBER" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                        }`}>
                          {name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{name}</p>
                          <p className="text-xs text-slate-400">{formatDateTime(c.checkInTime)}</p>
                        </div>
                      </div>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
