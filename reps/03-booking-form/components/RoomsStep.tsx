import { useState } from "react";
import type { Room, RoomType } from "../types";
import { money } from "../../../shared/format";

interface RoomsStepProps {
  roomTypes: RoomType[];
  rooms: Room[];
  checkIn: string;
  checkOut: string;
  onDatesChange: (checkIn: string, checkOut: string) => void;
  onRoomChange: (index: number, room: Room) => void;
  onAddRoom: () => void;
  onBack: () => void;
  onNext: () => void;
}

function RoomRow({ index, room, roomTypes, onChange }: { index: number; room: Room; roomTypes: RoomType[]; onChange: (room: Room) => void }) {
  const selected = roomTypes.find((t) => t.code === room.type);
  return (
    <div className="row" data-testid="room-row">
      <label>
        Room {index + 1}
        <select value={room.type} onChange={(e) => onChange({ ...room, type: e.target.value })} aria-label={`Room ${index + 1} type`}>
          {roomTypes.map((t) => (
            <option key={t.code} value={t.code}>
              {t.name} ({money(t.price)}/night)
            </option>
          ))}
        </select>
      </label>
      <label>
        Guests
        <input type="number" min={1} max={selected?.maxGuests ?? 6} value={room.guests} onChange={(e) => onChange({ ...room, guests: Number(e.target.value) })} aria-label={`Room ${index + 1} guests`} />
      </label>
    </div>
  );
}

export function CompareTable({ roomTypes }: { roomTypes: RoomType[] }) {
  const [cheapestFirst, setCheapestFirst] = useState(false);
  const rows = cheapestFirst ? roomTypes.sort((a, b) => a.price - b.price) : roomTypes;
  return (
    <table aria-label="Room type comparison">
      <thead>
        <tr>
          <th>Room type (by size)</th>
          <th>Sleeps</th>
          <th>
            Per night{" "}
            <label style={{ fontWeight: 400 }}>
              <input type="checkbox" checked={cheapestFirst} onChange={(e) => setCheapestFirst(e.target.checked)} aria-label="Cheapest first" /> cheapest first
            </label>
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((t) => (
          <tr key={t.code}>
            <td>{t.name}</td>
            <td>{t.maxGuests}</td>
            <td>{money(t.price)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function RoomsStep({ roomTypes, rooms, checkIn, checkOut, onDatesChange, onRoomChange, onAddRoom, onBack, onNext }: RoomsStepProps) {
  return (
    <div className="form">
      <div className="row">
        <label>
          Check-in
          <input type="date" value={checkIn} onChange={(e) => onDatesChange(e.target.value, checkOut)} aria-label="Check-in" />
        </label>
        <label>
          Check-out
          <input type="date" value={checkOut} onChange={(e) => onDatesChange(checkIn, e.target.value)} aria-label="Check-out" />
        </label>
      </div>
      {rooms.map((room, index) => (
        <RoomRow key={index} index={index} room={room} roomTypes={roomTypes} onChange={(next) => onRoomChange(index, next)} />
      ))}
      <div>
        <button type="button" className="secondary" onClick={onAddRoom}>
          Add room
        </button>
      </div>
      <CompareTable roomTypes={roomTypes} />
      <div className="row">
        <button type="button" className="secondary" onClick={onBack}>
          Back
        </button>
        <button type="button" className="primary" onClick={onNext}>
          Next: review
        </button>
      </div>
    </div>
  );
}
