"use client";

import { QRCodeSVG } from "qrcode.react";
import { Modal } from "@/components/ui/Modal";
import { Copy, ExternalLink, CheckCircle } from "lucide-react";
import { useState } from "react";

export function ShareModal({
  open,
  onClose,
  programme,
}: {
  open: boolean;
  onClose: () => void;
  programme: { id: string; title: string } | null;
}) {
  const [copied, setCopied] = useState(false);

  if (!programme) return null;

  const checkinUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/checkin/${programme.id}`
      : `/checkin/${programme.id}`;

  const registerUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/register`
      : "/register";

  const copy = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Share Links" size="md">
      <div className="space-y-6">
        {/* Check-in QR */}
        <div>
          <h3 className="font-semibold text-slate-900 mb-1">
            Self Check-in — {programme.title}
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Display this QR code on a screen or print it. Members and visitors
            scan it to check themselves in.
          </p>

          <div className="flex flex-col items-center bg-slate-50 rounded-xl p-6 border border-slate-200 mb-3">
            <QRCodeSVG
              value={checkinUrl}
              size={180}
              bgColor="#f8fafc"
              fgColor="#1e293b"
              level="M"
            />
            <p className="text-xs text-slate-400 mt-3 text-center break-all">{checkinUrl}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => copy(checkinUrl)}
              className="flex-1 flex items-center justify-center gap-2 border border-slate-300 rounded-lg py-2 text-sm hover:bg-slate-50 transition-colors"
            >
              {copied ? (
                <><CheckCircle className="w-4 h-4 text-green-500" /> Copied!</>
              ) : (
                <><Copy className="w-4 h-4" /> Copy Link</>
              )}
            </button>
            <a
              href={checkinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 border border-slate-300 rounded-lg py-2 px-4 text-sm hover:bg-slate-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100" />

        {/* Registration QR */}
        <div>
          <h3 className="font-semibold text-slate-900 mb-1">New Member Registration</h3>
          <p className="text-sm text-slate-500 mb-4">
            For first-time visitors who want to register with the church.
          </p>

          <div className="flex flex-col items-center bg-slate-50 rounded-xl p-6 border border-slate-200 mb-3">
            <QRCodeSVG
              value={registerUrl}
              size={140}
              bgColor="#f8fafc"
              fgColor="#1e293b"
              level="M"
            />
            <p className="text-xs text-slate-400 mt-3 text-center break-all">{registerUrl}</p>
          </div>

          <button
            onClick={() => copy(registerUrl)}
            className="w-full flex items-center justify-center gap-2 border border-slate-300 rounded-lg py-2 text-sm hover:bg-slate-50 transition-colors"
          >
            <Copy className="w-4 h-4" /> Copy Registration Link
          </button>
        </div>
      </div>
    </Modal>
  );
}
