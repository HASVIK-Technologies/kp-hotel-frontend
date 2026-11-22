"use client";

import Link from "next/link";
import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { useSession } from "@/components/admin/AdminShell";
import { btn, Card, Empty, ErrorNote, inputCls, Loading, PageTitle, Table, Td, Th, Toggle } from "@/components/admin/primitives";
import { Notice } from "@/components/admin/ui";
import { Photo } from "@/components/ui/Photo";
import { roomImageUrl } from "@/config/images";
import { routes } from "@/config/routes";
import { invalidateResource } from "@/hooks/useCachedResource";
import { useLoad } from "@/hooks/useLoad";
import { adminApi } from "@/services/api";

export default function RoomsAdminPage() {
  const user = useSession();
  const canEdit = ["owner", "manager"].includes(user.role);
  const { data, error, loading, reload } = useLoad(() => adminApi.rooms());
  const [edits, setEdits] = useState<Record<string, { price?: number; inventory?: number }>>({});
  const [note, setNote] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const save = async (slug: string, patch: Record<string, unknown>) => {
    setErr(null);
    try {
      await adminApi.updateRoom(slug, patch);
      invalidateResource("rooms");
      setNote("Saved, live on the website within 30 seconds.");
      setEdits((e) => ({ ...e, [slug]: {} }));
      await reload();
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  return (
    <>
      <PageTitle
        title="Rooms & rates"
        sub="Add room types, change rates and inventory. Rates exclude GST; changes reach the public site within 30 seconds."
        action={canEdit && <Link href={routes.admin.newRoom} className={btn.primary}><Plus className="size-4" aria-hidden /> Add room</Link>}
      />
      <ErrorNote message={err ?? error} />
      {note && <div className="mb-4"><Notice tone="success">{note}</Notice></div>}
      <Card>
        {loading && !data ? (
          <Loading />
        ) : data?.rooms.length === 0 ? (
          <Empty>No rooms yet. Click “Add room” to create your first room type.</Empty>
        ) : (
          <Table label="Room inventory and rates">
            <thead>
              <tr><Th>Room</Th><Th>Type</Th><Th>Rate / night (₹)</Th><Th>Rooms in inventory</Th><Th>Bookable</Th><Th><span className="sr-only">Actions</span></Th></tr>
            </thead>
            <tbody>
              {data?.rooms.map((r) => {
                const e = edits[r.slug] ?? {};
                const dirty = e.price !== undefined || e.inventory !== undefined;
                return (
                  <tr key={r.slug}>
                    <Td className="font-medium">
                      <span className="flex items-center gap-3">
                        <Photo src={roomImageUrl(r.images[0])} alt="" sizes="56px" className="h-10 w-14 shrink-0 rounded-md" />
                        <span>{r.name}<span className="block font-mono text-[0.7rem] font-normal text-slate-400">{r.slug}</span></span>
                      </span>
                    </Td>
                    <Td>{r.type}</Td>
                    <Td>
                      <label className="sr-only" htmlFor={`p-${r.slug}`}>Rate for {r.name}</label>
                      <input id={`p-${r.slug}`} type="number" min={500} step={50} disabled={!canEdit} className={`${inputCls} w-32`} value={e.price ?? r.price} onChange={(ev) => setEdits({ ...edits, [r.slug]: { ...e, price: Number(ev.target.value) } })} />
                    </Td>
                    <Td>
                      <label className="sr-only" htmlFor={`i-${r.slug}`}>Inventory for {r.name}</label>
                      <input id={`i-${r.slug}`} type="number" min={0} max={100} disabled={!canEdit} className={`${inputCls} w-24`} value={e.inventory ?? r.inventory} onChange={(ev) => setEdits({ ...edits, [r.slug]: { ...e, inventory: Number(ev.target.value) } })} />
                    </Td>
                    <Td><Toggle on={r.active} disabled={!canEdit} onChange={() => save(r.slug, { active: !r.active })} label={`${r.name} bookable`} /></Td>
                    <Td>
                      <span className="flex items-center gap-2">
                        {dirty && <button className={btn.primary} onClick={() => save(r.slug, e)}>Save</button>}
                        {canEdit && <Link href={routes.admin.editRoom(r.slug)} className={btn.ghost}><Pencil className="size-4" aria-hidden /> Edit</Link>}
                      </span>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}
