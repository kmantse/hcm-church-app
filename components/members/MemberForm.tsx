"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField, inputClass, selectClass, textareaClass } from "@/components/ui/FormField";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  occupation: z.string().optional(),
  maritalStatus: z.string().optional(),
  membershipDate: z.string().optional(),
  membershipStatus: z.string().default("ACTIVE"),
  notes: z.string().optional(),
});

export type MemberFormData = z.infer<typeof schema>;

export function MemberForm({
  defaultValues,
  onSubmit,
  loading,
}: {
  defaultValues?: Partial<MemberFormData>;
  onSubmit: (data: MemberFormData) => void;
  loading?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MemberFormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? { membershipStatus: "ACTIVE" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="First Name" required error={errors.firstName?.message}>
          <input {...register("firstName")} className={inputClass} placeholder="John" />
        </FormField>
        <FormField label="Last Name" required error={errors.lastName?.message}>
          <input {...register("lastName")} className={inputClass} placeholder="Doe" />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Email" error={errors.email?.message}>
          <input {...register("email")} type="email" className={inputClass} placeholder="john@example.com" />
        </FormField>
        <FormField label="Phone">
          <input {...register("phone")} className={inputClass} placeholder="+233 20 000 0000" />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Gender">
          <select {...register("gender")} className={selectClass}>
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </FormField>
        <FormField label="Date of Birth">
          <input {...register("dateOfBirth")} type="date" className={inputClass} />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Marital Status">
          <select {...register("maritalStatus")} className={selectClass}>
            <option value="">Select status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
          </select>
        </FormField>
        <FormField label="Occupation">
          <input {...register("occupation")} className={inputClass} placeholder="Engineer" />
        </FormField>
      </div>

      <FormField label="Address">
        <input {...register("address")} className={inputClass} placeholder="Street address" />
      </FormField>

      <FormField label="City / Town">
        <input {...register("city")} className={inputClass} placeholder="Accra" />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Membership Date">
          <input {...register("membershipDate")} type="date" className={inputClass} />
        </FormField>
        <FormField label="Membership Status">
          <select {...register("membershipStatus")} className={selectClass}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="PENDING">Pending</option>
          </select>
        </FormField>
      </div>

      <FormField label="Notes">
        <textarea {...register("notes")} className={textareaClass} rows={3} placeholder="Additional notes..." />
      </FormField>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving..." : "Save Member"}
        </button>
      </div>
    </form>
  );
}
