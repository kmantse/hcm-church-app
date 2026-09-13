"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Church, Search, CheckCircle, Users, Clock, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Programme {
  id: string;
  title: string;
  type: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  venue: string | null;
}

interface SearchResult {
  id: string;
  firstName: string;
  lastName: string;
  type: "MEMBER" | "VISITOR";
  email?: string | null;
  phone?: string | null;
}

type CheckinStatus = "idle" | "success" | "already" | "error";

export default function PublicCheckInPage() {
  const { programmeId } = useParams();
  const [programme, setProgramme] = useState<Programme | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [status, setStatus] = useState<CheckinStatus>("idle");
  const [checkedInName, setCheckedInName] = useState("");
  const [totalCheckins, setTotalCheckins] = useState(0);

  useEffect(() => {
    fetch(`/api/programmes/${programmeId}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => {
        if (data) setProgramme(data);
      });

    fetch(`/api/checkin?programmeId=${programmeId}`)
      .then((r) => r.json())
      .then((data) => setTotalCheckins(Array.isArray(data) ? data.length : 0));
  }, [programmeId]);

  const fetchResults = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setSearching(true);
    const [membersRes, visitorsRes] = await Promise.all([
      fetch(`/api/members?search=${encodeURIComponent(q)}`),
      fetch(`/api/visitors?search=${encodeURIComponent(q)}`),
    ]);
    const [members, visitors] = await Promise.all([
      membersRes.json(),
      visitorsRes.json(),
    ]);
    setResults([
      ...members.map((m: SearchResult) => ({ ...m, type: "MEMBER" as const })),
      ...visitors.map((v: SearchResult) => ({ ...v, type: "VISITOR" as const })),
    ]);
    setSearching(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchResults(search), 350);
    return () => clearTimeout(t);
  }, [search, fetchResults]);

  const handleCheckIn = async (person: SearchResult) => {
    setStatus("idle");
    const res = await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        programmeId,
        attendeeId: person.id,
        attendeeType: person.type,
      }),
    });

    const name = `${person.firstName} ${person.lastName}`;
    if (res.status === 409) {
      setStatus("already");
      setCheckedInName(name);
    } else if (res.ok) {
      setStatus("success");
      setCheckedInName(name);
      setTotalCheckins((n) => n + 1);
    } else {
      setStatus("error");
    }
    setSearch("");
    setResults([]);

    setTimeout(() => setStatus("idle"), 5000);
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-sm w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900">Programme not found</h1>
          <p className="text-slate-500 text-sm mt-2">This check-in link is no longer valid.</p>
        </div>
      </div>
    );
  }

  if (!programme) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 flex items-center justify-center">
        <div className="text-slate-400 animate-pulse text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-start py-10 px-4">
      {/* Church Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
          <Church className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-slate-800 text-lg">Church HCM</span>
      </div>

      <div className="w-full max-w-md">
        {/* Programme Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6 text-center">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">
            {programme.type}
          </span>
          <h1 className="text-2xl font-bold text-slate-900">{programme.title}</h1>
          <div className="flex items-center justify-center gap-3 mt-2 text-sm text-slate-500">
            <span>{formatDate(programme.date)}</span>
            {programme.startTime && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {programme.startTime}{programme.endTime ? ` – ${programme.endTime}` : ""}
                </span>
              </>
            )}
          </div>
          {programme.venue && (
            <p className="text-sm text-slate-400 mt-1">📍 {programme.venue}</p>
          )}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-sm text-slate-500">
            <Users className="w-4 h-4" />
            <span>{totalCheckins} checked in</span>
          </div>
        </div>

        {/* Status Messages */}
        {status === "success" && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl p-4 mb-5 text-green-700">
            <CheckCircle className="w-6 h-6 shrink-0" />
            <div>
              <p className="font-semibold">Welcome, {checkedInName}!</p>
              <p className="text-sm text-green-600">You have been checked in successfully.</p>
            </div>
          </div>
        )}

        {status === "already" && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 text-amber-700">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <div>
              <p className="font-semibold">Already checked in</p>
              <p className="text-sm text-amber-600">{checkedInName} was already checked in for this programme.</p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 mb-5 text-red-700">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <p className="text-sm">Something went wrong. Please ask a staff member for help.</p>
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-md p-5">
          <h2 className="font-semibold text-slate-900 mb-1">Check yourself in</h2>
          <p className="text-sm text-slate-500 mb-4">
            Type your name to find yourself in the list, then tap to check in.
          </p>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or phone…"
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
              autoFocus
            />
          </div>

          {searching && (
            <p className="text-xs text-slate-400 mt-2 text-center animate-pulse">Searching…</p>
          )}

          {results.length > 0 && (
            <div className="mt-3 border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100 shadow-sm">
              {results.map((p) => (
                <button
                  key={`${p.type}-${p.id}`}
                  onClick={() => handleCheckIn(p)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-blue-50 active:bg-blue-100 transition-colors text-left"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    p.type === "MEMBER" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                  }`}>
                    {p.firstName[0]}{p.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900">{p.firstName} {p.lastName}</p>
                    <p className="text-xs text-slate-500 truncate">{p.email || p.phone || p.type}</p>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full shrink-0">
                    Check in →
                  </span>
                </button>
              ))}
            </div>
          )}

          {search.length >= 2 && !searching && results.length === 0 && (
            <div className="mt-4 text-center py-6 text-slate-400">
              <p className="text-sm font-medium">Not in the list?</p>
              <p className="text-xs mt-1">Ask a staff member to add you first.</p>
            </div>
          )}
        </div>

        <p className="text-xs text-center text-slate-400 mt-6">
          First time? <a href="/register" className="text-blue-500 hover:underline font-medium">Register here →</a>
        </p>
      </div>
    </div>
  );
}
