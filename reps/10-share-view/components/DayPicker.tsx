import type { ShareView } from "../types";
import { formatDate } from "../../../shared/format";

interface DayPickerProps {
  days: ShareView["days"];
  selected: number;
  onSelect: (index: number) => void;
}

export function DayPicker({ days, selected, onSelect }: DayPickerProps) {
  return (
    <div className="steps" aria-label="Day picker">
      {days.map((day) => (
        <button
          key={day.index}
          type="button"
          className={day.index === selected ? "active" : undefined}
          style={{ border: 0, cursor: "pointer", font: "inherit" }}
          onClick={() => onSelect(day.index)}
          aria-label={`Day ${day.index + 1}`}
          aria-pressed={day.index === selected}
        >
          Day {day.index + 1}: {day.label}, {formatDate(day.date)}
        </button>
      ))}
    </div>
  );
}
