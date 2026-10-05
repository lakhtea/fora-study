import type { RoomBlock, Traveler } from "../types";

interface RoomTableProps {
  block: RoomBlock;
  travelers: Traveler[];
}

export function RoomTable({ block, travelers }: RoomTableProps) {
  const nameOf = (id: number | null) => (id === null ? "Unassigned" : travelers.find((t) => t.id === id)?.name ?? `Traveler #${id}`);
  return (
    <table aria-label={`Rooms at ${block.property}`}>
      <thead>
        <tr>
          <th>Room</th>
          <th>Sleeps</th>
          <th>Assigned to</th>
        </tr>
      </thead>
      <tbody>
        {block.rooms.map((room) => (
          <tr key={room.id}>
            <td>{room.name}</td>
            <td>{room.sleeps}</td>
            <td aria-label={`Occupant ${room.name}`}>{nameOf(room.assignedTravelerId)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
