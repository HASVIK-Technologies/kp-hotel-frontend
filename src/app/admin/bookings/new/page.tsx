"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdminCheckGroup, AdminSelect, AdminText } from "@/components/admin/fields";
import { btn, Card, ErrorNote, PageTitle } from "@/components/admin/primitives";
import { routes } from "@/config/routes";
import { useCatalog } from "@/hooks/useCatalog";
import { useRooms } from "@/hooks/useRooms";
import { staffBookingSchema } from "@/lib/admin-schemas";
import { istToday } from "@/lib/format";
import { adminApi } from "@/services/api";

interface F {
  roomSlug: string; checkIn: string; checkOut: string; rooms: number; adults: number; children: number; ratePlan: string; addonIds: string[];
  source: "Phone" | "Walk-in" | "OTA";
  guest: { name: string; email: string; mobile: string; company?: string; gstin?: string; requests?: string };
}

export default function NewBookingPage() {
  const router = useRouter();
  const { rooms } = useRooms();
  const { ratePlans, addons } = useCatalog();
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<F>({
    resolver: zodResolver(staffBookingSchema) as unknown as Resolver<F>,
    defaultValues: { roomSlug: "", checkIn: istToday(), checkOut: istToday(1), rooms: 1, adults: 2, children: 0, ratePlan: "room-only", addonIds: [], source: "Phone", guest: { name: "", email: "", mobile: "", company: "", gstin: "", requests: "" } },
  });
  const bookable = rooms.filter((r) => r.active);

  const onSubmit = async (v: F) => {
    setServerError(null);
    try {
      const r = await adminApi.createBooking({ ...v, roomSlug: v.roomSlug || bookable[0]?.slug });
      router.push(r.invoice ? routes.admin.invoice(r.invoice.id) : routes.admin.bookings);
    } catch (e) {
      setServerError((e as Error).message);
    }
  };

  return (
    <>
      <PageTitle title="New booking" sub="Phone, walk-in or OTA reservation. A GST invoice is generated immediately." />
      <ErrorNote message={serverError} />
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid max-w-4xl gap-6">
          <Card title="Stay">
            <div className="grid gap-4 sm:grid-cols-3">
              <AdminSelect name="roomSlug" label="Room type" className="sm:col-span-2">
                {bookable.map((r) => <option key={r.slug} value={r.slug}>{r.name}</option>)}
              </AdminSelect>
              <AdminSelect name="source" label="Source"><option>Phone</option><option>Walk-in</option><option>OTA</option></AdminSelect>
              <AdminText name="checkIn" label="Check-in" type="date" />
              <AdminText name="checkOut" label="Check-out" type="date" />
              <AdminSelect name="ratePlan" label="Rate plan">{ratePlans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</AdminSelect>
              <AdminText name="rooms" label="Rooms" type="number" min={1} max={5} />
              <AdminText name="adults" label="Adults" type="number" min={1} max={8} />
              <AdminText name="children" label="Children" type="number" min={0} max={6} />
            </div>
            <div className="mt-4"><AdminCheckGroup name="addonIds" legend="Add-ons" options={addons.map((a) => ({ value: a.id, label: a.name }))} /></div>
          </Card>

          <Card title="Guest">
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminText name="guest.name" label="Full name" />
              <AdminText name="guest.mobile" label="Mobile" type="tel" />
              <AdminText name="guest.email" label="Email" type="email" />
              <AdminText name="guest.requests" label="Special requests" />
              <AdminText name="guest.company" label="Company (for GST invoice)" />
              <AdminText name="guest.gstin" label="GSTIN" maxLength={15} inputClassName="font-mono uppercase" />
            </div>
          </Card>

          <div><button type="submit" disabled={form.formState.isSubmitting} className={btn.primary}>{form.formState.isSubmitting ? "Creating…" : "Create booking & invoice"}</button></div>
        </form>
      </FormProvider>
    </>
  );
}
