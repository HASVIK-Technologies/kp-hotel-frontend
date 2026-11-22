"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useFieldArray, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Trash2 } from "lucide-react";
import { AdminCheckGroup, AdminSelect, AdminText, AdminTextarea } from "@/components/admin/fields";
import { btn, Card, ErrorNote, inputCls } from "@/components/admin/primitives";
import { Notice } from "@/components/admin/ui";
import { Photo } from "@/components/ui/Photo";
import { roomImageUrl } from "@/config/images";
import { routes } from "@/config/routes";
import { ApiError, adminApi } from "@/services/api";
import { AMENITY_FLAGS, ROOM_TYPES, ROOM_VIEWS, type Room } from "@/types/api";
import { emptyRoomForm, roomFormSchema, roomToForm, toRoomInput, type RoomFormValues } from "./room-form.schema";

/**
 * Create or edit a room category. One component, two modes:
 *   <RoomForm />            → adds a new room  (POST /admin/rooms)
 *   <RoomForm room={room} /> → edits an existing room (PATCH /admin/rooms/:slug)
 */
export function RoomForm({ room }: { room?: Room }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema) as unknown as Resolver<RoomFormValues>,
    mode: "onTouched",
    defaultValues: room ? roomToForm(room) : emptyRoomForm,
  });
  const { control, register, handleSubmit, watch, setError, formState: { errors, isSubmitting } } = form;
  const images = useFieldArray({ control, name: "images" });
  const watched = watch("images");

  const onSubmit = async (v: RoomFormValues) => {
    setServerError(null);
    try {
      if (room) await adminApi.updateRoom(room.slug, toRoomInput(v));
      else await adminApi.createRoom(toRoomInput(v));
      router.push(routes.admin.rooms);
    } catch (e) {
      if (e instanceof ApiError && e.fields) {
        // map API field errors back onto the form (server names → form names)
        for (const [path, message] of Object.entries(e.fields)) {
          const name = path.startsWith("amenities") ? "amenitiesText" : path.replace(/^images\.(\d+)$/, "images.$1.name");
          setError(name as keyof RoomFormValues, { message });
        }
      }
      setServerError((e as Error).message);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid max-w-4xl gap-6">
        <ErrorNote message={serverError} />

        <Card title="Basics">
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminText name="name" label="Room name" placeholder="e.g. Heritage Suite" className="sm:col-span-2" />
            <AdminSelect name="type" label="Type">{ROOM_TYPES.map((t) => <option key={t}>{t}</option>)}</AdminSelect>
            <AdminSelect name="view" label="View">{ROOM_VIEWS.map((t) => <option key={t}>{t}</option>)}</AdminSelect>
            <AdminText name="headline" label="Headline" hint="One line shown at the top of the room page" className="sm:col-span-2" />
            <AdminText name="blurb" label="Short description" hint="Shown on room cards and search results" className="sm:col-span-2" />
            <AdminTextarea name="description" label="Full description" rows={4} className="sm:col-span-2" />
          </div>
        </Card>

        <Card title="Rate & capacity">
          <div className="grid gap-4 sm:grid-cols-3">
            <AdminText name="price" label="Rate per night (₹)" type="number" min={500} step={50} hint="Excludes GST" />
            <AdminText name="mrp" label="Striked-out rate (₹)" type="number" min={500} step={50} hint="Optional, must be ≥ rate" />
            <AdminText name="inventory" label="Rooms of this type" type="number" min={0} max={100} hint="How many you physically have" />
            <AdminText name="maxGuests" label="Sleeps (guests)" type="number" min={1} max={10} />
            <AdminText name="beds" label="Beds" placeholder="King bed" />
            <AdminText name="size" label="Size (sqm)" type="number" min={8} />
          </div>
          <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm font-semibold text-slate-700">
            <input type="checkbox" className="size-4 accent-[#4f6bff]" {...register("active")} />
            Bookable on the website <span className="font-normal text-slate-400">(untick to show as “Sold out”)</span>
          </label>
        </Card>

        <Card title="Amenities">
          <AdminCheckGroup name="amenityFlags" legend="Filter tags" options={AMENITY_FLAGS.map((a) => ({ value: a, label: a === "WiFi" ? "Wi-Fi" : a }))} hint="Used by the website's amenity filters" />
          <div className="mt-5">
            <AdminTextarea name="amenitiesText" label="Amenity list" rows={6} hint="One per line, shown with a tick on the room page" />
          </div>
        </Card>

        <Card title="Photos">
          <Notice tone="info">
            Copy your photos into <b>frontend/public/images/rooms/</b>, then type each file name below (e.g. <code>heritage-suite-1.jpg</code>). The first image is the main photo.
          </Notice>
          <ul className="mt-4 space-y-3">
            {images.fields.map((f, i) => (
              <li key={f.id} className="flex items-start gap-3">
                {watched?.[i]?.name ? (
                  <Photo src={roomImageUrl(watched[i].name)} alt="" sizes="96px" className="h-16 w-24 shrink-0 rounded-lg ring-1 ring-slate-200" />
                ) : (
                  <span className="grid h-16 w-24 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-300 ring-1 ring-slate-200" aria-hidden><ImagePlus className="size-5" /></span>
                )}
                <div className="flex-1">
                  <label className="sr-only" htmlFor={`img-${i}`}>Image {i + 1} file name</label>
                  <input id={`img-${i}`} className={inputCls} placeholder="file-name.jpg" aria-invalid={!!errors.images?.[i]?.name} {...register(`images.${i}.name` as const)} />
                  {errors.images?.[i]?.name?.message && <p role="alert" className="mt-1 text-xs font-medium text-rose-600">{errors.images[i]?.name?.message}</p>}
                </div>
                <button type="button" onClick={() => images.remove(i)} disabled={images.fields.length === 1} aria-label={`Remove image ${i + 1}`} className="grid size-11 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40">
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
          {typeof errors.images?.message === "string" && <p role="alert" className="mt-2 text-xs font-medium text-rose-600">{errors.images.message}</p>}
          <button type="button" onClick={() => images.append({ name: "" })} disabled={images.fields.length >= 8} className={`${btn.ghost} mt-4`}>
            <ImagePlus className="size-4" aria-hidden /> Add another image
          </button>
        </Card>

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={isSubmitting} className={btn.primary}>{isSubmitting ? "Saving…" : room ? "Save changes" : "Add room"}</button>
          <button type="button" onClick={() => router.push(routes.admin.rooms)} className={btn.ghost}>Cancel</button>
        </div>
      </form>
    </FormProvider>
  );
}
