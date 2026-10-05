import { useEffect, useState } from "react";
import { assignRoom, fetchBlocks, fetchTravelers } from "./api/client";
import { AssignmentForm } from "./components/AssignmentForm";
import { BlockList } from "./components/BlockList";
import { RoomTable } from "./components/RoomTable";
import type { RoomBlock, Traveler } from "./types";

export default function App() {
  const [blocks, setBlocks] = useState<RoomBlock[]>([]);
  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [assigningRoomId, setAssigningRoomId] = useState<number | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchBlocks(), fetchTravelers()]).then(([loadedBlocks, loadedTravelers]) => {
      if (cancelled) return;
      setBlocks(loadedBlocks);
      setTravelers(loadedTravelers);
      setSelectedId(loadedBlocks[0]?.id ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const block = blocks.find((b) => b.id === selectedId) ?? null;
  const allRooms = blocks.flatMap((b) => b.rooms);
  const assignedIds = new Set(allRooms.map((r) => r.assignedTravelerId).filter((id): id is number => id !== null));
  const unassigned = travelers.filter((t) => !assignedIds.has(t.id));

  const handleAssign = async ({ roomId, travelerId }: { roomId: number; travelerId: number }) => {
    setAssigningRoomId(roomId);
    setAssignError(null);
    try {
      const room = await assignRoom(roomId, travelerId);
      setBlocks((current) => current.map((b) => ({ ...b, rooms: b.rooms.map((r) => (r.id === room.id ? room : r)) })));
    } catch (err) {
      setAssignError(err instanceof Error ? err.message : "Assignment failed");
    } finally {
      setAssigningRoomId(null);
    }
  };

  if (!block) return <div className="page muted">Loading room blocks</div>;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Group rooms: Okafor party</h1>
          <div className="muted">
            {unassigned.length} of {travelers.length} travelers still need a room
          </div>
        </div>
      </header>
      <div className="layout" style={{ gridTemplateColumns: "1fr 2fr" }}>
        <div className="stack">
          <BlockList blocks={blocks} selectedId={selectedId} onSelect={setSelectedId} />
          <div className="panel">
            <h2>Unassigned</h2>
            <ul className="list" aria-label="Unassigned travelers">
              {unassigned.map((t) => (
                <li key={t.id}>{t.name}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="stack">
          <RoomTable block={block} travelers={travelers} />
          <AssignmentForm key={block.id} block={block} allRooms={allRooms} unassigned={unassigned} assigningRoomId={assigningRoomId} error={assignError} onAssign={handleAssign} />
        </div>
      </div>
    </div>
  );
}
