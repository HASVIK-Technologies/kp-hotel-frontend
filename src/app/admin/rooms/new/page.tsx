"use client";

import { useSession } from "@/components/admin/AdminShell";
import { PageTitle } from "@/components/admin/primitives";
import { Notice } from "@/components/admin/ui";
import { RoomForm } from "@/features/admin/rooms/RoomForm";

export default function NewRoomPage() {
  const user = useSession();
  const canEdit = ["owner", "manager"].includes(user.role);
  return (
    <>
      <PageTitle title="Add a room" sub="Create a new room type. It appears on the website (rooms page, search, booking) within about 30 seconds." />
      {canEdit ? <RoomForm /> : <Notice tone="warn">Only the owner or a manager can add rooms.</Notice>}
    </>
  );
}
