"use client";

import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { authService } from "@/services/authService";
import { apiErrorMessage } from "@/services/apiClient";
import { sessionLoaded } from "@/redux/slices/authSlice";

export function ProfileForm() {
  const dispatch = useDispatch();
  const { user, permissions } = useSelector((state) => state.auth);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ values: { firstName: user?.firstName || "", lastName: user?.lastName || "", phone: user?.phone || "", timezone: user?.timezone || "UTC", locale: user?.locale || "en" } });
  const submit = handleSubmit(async (values) => { try { const result = await authService.updateProfile(values); dispatch(sessionLoaded({ user: result.user, permissions })); toast.success("Profile updated"); } catch (error) { toast.error(apiErrorMessage(error)); } });
  return <Card className="max-w-3xl"><CardHeader><div><h2 className="font-bold">Personal details</h2><p className="mt-1 text-sm text-muted">Used for assignments, communication, and regional formatting.</p></div></CardHeader><CardBody><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2"><Input label="First name" error={errors.firstName?.message} {...register("firstName", { required: "Required", minLength: { value: 2, message: "Use at least 2 characters" } })} /><Input label="Last name" error={errors.lastName?.message} {...register("lastName", { required: "Required" })} /><Input label="Phone" {...register("phone")} /><Input label="Locale" {...register("locale")} /><Input containerClassName="sm:col-span-2" label="Timezone" {...register("timezone")} /><Button type="submit" disabled={isSubmitting} className="sm:col-span-2 sm:w-fit">{isSubmitting ? "Saving…" : "Save changes"}</Button></form></CardBody></Card>;
}
