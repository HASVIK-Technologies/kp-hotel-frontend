"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "@/components/admin/AdminShell";
import { ErrorNote, Loading, PageTitle } from "@/components/admin/primitives";
import { Notice } from "@/components/admin/ui";
import { RoomForm } from "@/features/admin/rooms/RoomForm";
import { useLoad } from "@/hooks/useLoad";
import { adminApi } from "@/services/api";

function EditRoom() {
  const slug = useSearchParams().get("slug") ?? "";
  const user = useSession();
  const canEdit = ["owner", "manager"].includes(user.role);
  const { data, error, loading } = useLoad(() => adminApi.room(slug), [slug]);

  return (
    <>
      <PageTitle title={data ? `Edit ${data.room.name}` : "Edit room"} sub="The web address (slug) of a room never changes, so existing links keep working." />
      <ErrorNote message={error} />
      {!canEdit ? <Notice tone="warn">Only the owner or a manager can edit rooms.</Notice> : loading || !data ? !error && <Loading rows={5} /> : <RoomForm room={data.room} />}
    </>
  );
}

export default function EditRoomPage() {
  return (
    <Suspense fallback={<Loading rows={5} />}>
      <EditRoom />
    </Suspense>
  );
}
