import { useEffect, useState } from "react";
import { fetchHotelDetail } from "../api/client";
import type { HotelDetail } from "../types";
import { money } from "../../../shared/format";

export function HotelPanel({ hotelId }: { hotelId: number | null }) {
  const [detail, setDetail] = useState<HotelDetail | null>(null);

  useEffect(() => {
    if (hotelId === null) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    fetchHotelDetail(hotelId).then((record) => {
      if (!cancelled) setDetail(record);
    });
    return () => {
      cancelled = true;
    };
  }, [hotelId]);

  if (hotelId === null) return <div className="panel empty">Select a hotel to see details.</div>;
  if (!detail) return <div className="panel empty">Loading hotel</div>;

  return (
    <div className="panel">
      <h2>{detail.name}</h2>
      <div className="muted">
        {detail.neighborhood}, {detail.city}
      </div>
      <p>{detail.description}</p>
      <dl>
        <dt>From</dt>
        <dd>{money(detail.rate)} per night</dd>
        <dt>Check-in</dt>
        <dd>{detail.checkIn}</dd>
        <dt>Amenities</dt>
        <dd aria-label="Amenities">{detail.amenities.join(", ")}</dd>
      </dl>
    </div>
  );
}
