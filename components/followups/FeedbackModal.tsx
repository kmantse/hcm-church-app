"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { FormField, inputClass, selectClass, textareaClass } from "@/components/ui/FormField";
import { CheckCircle } from "lucide-react";

interface FollowUpRecord {
  id: string;
  subject: string;
  type: string;
  status: string;
  notes: string | null;
  feedback: string | null;
  outcome: string | null;
  scheduledDate: string | null;
  completedDate: string | null;
  assignedTo: string | null;
}

export function FeedbackModal({
  open,
  onClose,
  followUp,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  followUp: FollowUpRecord | null;
  onSaved: () => void;
}) {
  const [feedback, setFeedback] = useState("");
  const [outcome, setOutcome] = useState("POSITIVE");
  const [status, setStatus] = useState("COMPLETED");
  const [completedDate, setCompletedDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  if (!followUp) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      await fetch(`/api/followups/${followUp.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: followUp.type,
          subject: followUp.subject,
          notes: followUp.notes,
          assignedTo: followUp.assignedTo,
          scheduledDate: followUp.scheduledDate,
          feedback,
          outcome,
          status,
          completedDate,
        }),
      });
      onSaved();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Log Outcome & Feedback" size="md">
      <div className="space-y-4">
        <div className="bg-slate-50 rounded-lg p-3 text-sm">
          <p className="font-semibold text-slate-900">{followUp.subject}</p>
          <p className="text-slate-500 text-xs mt-0.5">{followUp.type.replace("_", " ")} · {followUp.assignedTo || "Unassigned"}</p>
        </div>

        <FormField label="What was the outcome?" required>
          <select value={outcome} onChange={(e) => setOutcome(e.target.value)} className={selectClass}>
            <option value="POSITIVE">✅ Positive — person responded well</option>
            <option value="NEUTRAL">➡️ Neutral — noted, no strong response</option>
            <option value="NEGATIVE">⚠️ Negative — person had concerns</option>
            <option value="NO_RESPONSE">📵 No Response — could not reach</option>
          </select>
        </FormField>

        <FormField label="Feedback / Notes from the interaction" required>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className={textareaClass}
            rows={4}
            placeholder="What did the member say? Any prayer requests, concerns or commitments made?"
            autoFocus
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Date Completed">
            <input
              type="date"
              value={completedDate}
              onChange={(e) => setCompletedDate(e.target.value)}
              className={inputClass}
            />
          </FormField>
          <FormField label="Follow-up Status">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
              <option value="COMPLETED">Completed</option>
              <option value="NEEDS_FOLLOWUP">Needs Another Follow-up</option>
              <option value="NO_RESPONSE">No Response</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </FormField>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !feedback.trim()}
            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            {loading ? "Saving…" : "Save Feedback"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
