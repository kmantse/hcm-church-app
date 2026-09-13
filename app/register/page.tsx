"use client";

import { useState } from "react";
import { Church, CheckCircle } from "lucide-react";
import { FormField, inputClass, selectClass, textareaClass } from "@/components/ui/FormField";

interface RegForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  city: string;
  occupation: string;
  maritalStatus: string;
  howDidYouHear: string;
  prayerRequest: string;
}

const empty: RegForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  gender: "",
  dateOfBirth: "",
  address: "",
  city: "",
  occupation: "",
  maritalStatus: "",
  howDidYouHear: "",
  prayerRequest: "",
};

export default function RegisterPage() {
  const [form, setForm] = useState<RegForm>(empty);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<RegForm>>({});

  const validate = () => {
    const e: Partial<RegForm> = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    if (!form.phone.trim() && !form.email.trim())
      e.phone = "At least phone or email is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const set = (key: keyof RegForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Registration Submitted!</h1>
          <p className="text-slate-500 mb-6">
            Thank you for registering. Our team will review your details and get in touch with you shortly.
          </p>
          <p className="text-sm text-slate-400">
            God bless you as you join our church family.
          </p>
          <button
            onClick={() => { setForm(empty); setSubmitted(false); }}
            className="mt-6 text-blue-600 text-sm hover:underline"
          >
            Submit another registration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Church className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Church Registration</h1>
          <p className="text-slate-500 mt-2">Fill in your details to join our church family</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <h2 className="font-semibold text-slate-900 text-sm uppercase tracking-wide text-slate-400">Personal Information</h2>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="First Name" required error={errors.firstName}>
                <input value={form.firstName} onChange={set("firstName")} className={inputClass} placeholder="John" />
              </FormField>
              <FormField label="Last Name" required error={errors.lastName}>
                <input value={form.lastName} onChange={set("lastName")} className={inputClass} placeholder="Doe" />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Email" error={errors.email}>
                <input type="email" value={form.email} onChange={set("email")} className={inputClass} placeholder="john@example.com" />
              </FormField>
              <FormField label="Phone" error={errors.phone}>
                <input value={form.phone} onChange={set("phone")} className={inputClass} placeholder="+233 20 000 0000" />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Gender">
                <select value={form.gender} onChange={set("gender")} className={selectClass}>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </FormField>
              <FormField label="Date of Birth">
                <input type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} className={inputClass} />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Marital Status">
                <select value={form.maritalStatus} onChange={set("maritalStatus")} className={selectClass}>
                  <option value="">Select status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </FormField>
              <FormField label="Occupation">
                <input value={form.occupation} onChange={set("occupation")} className={inputClass} placeholder="Engineer" />
              </FormField>
            </div>

            <FormField label="Address">
              <input value={form.address} onChange={set("address")} className={inputClass} placeholder="Street address" />
            </FormField>

            <FormField label="City / Town">
              <input value={form.city} onChange={set("city")} className={inputClass} placeholder="Accra" />
            </FormField>

            <div className="border-t border-slate-100 pt-5">
              <h2 className="font-semibold text-sm uppercase tracking-wide text-slate-400 mb-4">Additional Information</h2>

              <FormField label="How did you hear about us?">
                <select value={form.howDidYouHear} onChange={set("howDidYouHear")} className={selectClass}>
                  <option value="">Select an option</option>
                  <option value="Friend / Family">Friend / Family</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Website">Website</option>
                  <option value="Walked In">Walked In</option>
                  <option value="Flyer / Banner">Flyer / Banner</option>
                  <option value="Other">Other</option>
                </select>
              </FormField>

              <div className="mt-4">
                <FormField label="Prayer Request">
                  <textarea
                    value={form.prayerRequest}
                    onChange={set("prayerRequest")}
                    className={textareaClass}
                    rows={4}
                    placeholder="Share any prayer requests or how we can pray for you..."
                  />
                </FormField>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm mt-2"
            >
              {loading ? "Submitting..." : "Submit Registration"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Your information is kept confidential and used only for church purposes.
        </p>
      </div>
    </div>
  );
}
