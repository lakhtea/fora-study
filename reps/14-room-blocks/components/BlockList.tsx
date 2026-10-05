import type { RoomBlock } from "../types";
import { formatDate } from "../../../shared/format";

interface BlockListProps {
  blocks: RoomBlock[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function BlockList({ blocks, selectedId, onSelect }: BlockListProps) {
  return (
    <div className="panel">
      <h2>Room blocks</h2>
      <ul className="list" aria-label="Blocks">
        {blocks.map((block) => {
          const assigned = block.rooms.filter((r) => r.assignedTravelerId !== null).length;
          return (
            <li key={block.id} className={block.id === selectedId ? "selected" : undefined}>
              <button type="button" className="link" onClick={() => onSelect(block.id)} aria-label={`Open ${block.property}`}>
                {block.property}
              </button>
              <span className="muted">
                {formatDate(block.checkIn)}, {assigned}/{block.rooms.length} assigned
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
