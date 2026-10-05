import { useState } from "react";
import type { Room, RoomBlock, Traveler } from "../types";

interface AssignmentFormProps {
  block: RoomBlock;
  allRooms: Room[];
  unassigned: Traveler[];
  assigningRoomId: number | null;
  error: string | null;
  onAssign: (assignment: { roomId: number; travelerId: number }) => void;
}

export function AssignmentForm({ block, allRooms, unassigned, assigningRoomId, error, onAssign }: AssignmentFormProps) {
  const [roomId, setRoomId] = useState<number>(block.rooms[0]?.id ?? 0);
  const [travelerId, setTravelerId] = useState<number>(unassigned[0]?.id ?? 0);
  const target = allRooms.find((room) => room.id === roomId);
  const owner = target ? block.rooms.some((r) => r.id === target.id) : false;

  return (
    <div className="panel">
      <h2>Assign a room at {block.property}</h2>
      <div className="form">
        <label>
          Room
          <select value={roomId} onChange={(e) => setRoomId(Number(e.target.value))} aria-label="Room">
            {block.rooms.map((room) => (
              <option key={room.id} value={room.id} disabled={room.assignedTravelerId !== null}>
                {room.name} (sleeps {room.sleeps})
              </option>
            ))}
          </select>
        </label>
        <label>
          Traveler
          <select value={travelerId} onChange={(e) => setTravelerId(Number(e.target.value))} aria-label="Traveler">
            {unassigned.map((traveler) => (
              <option key={traveler.id} value={traveler.id}>
                {traveler.name}
              </option>
            ))}
          </select>
        </label>
        <div className="muted" aria-label="Assignment preview">
          {target ? `Assigning to: ${target.name}${owner ? "" : " (not in this block)"}` : "Pick a room"}
        </div>
        {error && (
          <div className="danger" role="alert">
            {error}
          </div>
        )}
        <div>
          <button type="button" className="primary" onClick={() => onAssign({ roomId, travelerId })} disabled={assigningRoomId !== null || !target} aria-label="Assign">
            {assigningRoomId !== null ? "Assigning" : "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
}
