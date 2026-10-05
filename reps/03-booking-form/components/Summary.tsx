import { useMemo } from "react";
import type { Room, RoomType } from "../types";
import { money } from "../../../shared/format";

interface SummaryProps {
  rooms: Room[];
  roomTypes: RoomType[];
  nights: number;
}

export function Summary({ rooms, roomTypes, nights }: SummaryProps) {
  const roomsSummary = useMemo(() => {
    const guests = rooms.reduce((sum, room) => sum + room.guests, 0);
    const nightly = rooms.reduce((sum, room) => sum + (roomTypes.find((t) => t.code === room.type)?.price ?? 0), 0);
    return { count: rooms.length, guests, nightly };
  }, [rooms, roomTypes]);

  return (
    <div className="panel" aria-label="Booking summary">
      <h2>Summary</h2>
      <dl>
        <dt>Rooms</dt>
        <dd>
          {roomsSummary.count} {roomsSummary.count === 1 ? "room" : "rooms"}, {roomsSummary.guests} guests
        </dd>
        <dt>Nights</dt>
        <dd>{nights > 0 ? nights : "Pick dates"}</dd>
        <dt>Estimate</dt>
        <dd>{nights > 0 ? money(roomsSummary.nightly * nights) : "Pick dates"}</dd>
      </dl>
      <p className="muted">Taxes are added on the review step.</p>
    </div>
  );
}
