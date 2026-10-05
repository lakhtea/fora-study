import { useEffect, useState } from "react";
import { fetchRoomTypes } from "./api/client";
import { ReviewStep } from "./components/ReviewStep";
import { RoomsStep } from "./components/RoomsStep";
import { Summary } from "./components/Summary";
import { TravelerStep } from "./components/TravelerStep";
import type { Room, RoomType, Traveler } from "./types";

const STEPS = ["Traveler", "Rooms and dates", "Review"] as const;

function nightsBetween(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const [y1, m1, d1] = checkIn.split("-").map(Number);
  const [y2, m2, d2] = checkOut.split("-").map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
}

export default function App() {
  const [step, setStep] = useState(0);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [traveler, setTraveler] = useState<Traveler>({ name: "", email: "" });
  const [checkIn, setCheckIn] = useState("2026-11-12");
  const [checkOut, setCheckOut] = useState("2026-11-16");
  const [rooms, setRooms] = useState<Room[]>([{ type: "standard", guests: 2 }]);

  useEffect(() => {
    let cancelled = false;
    fetchRoomTypes().then((types) => {
      if (!cancelled) setRoomTypes(types);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const nights = nightsBetween(checkIn, checkOut);

  const handleAddRoom = () => {
    setRooms((current) => [...current, { type: "standard", guests: 2 }]);
  };

  const handleRoomChange = (index: number, room: Room) => {
    setRooms((current) => current.map((r, i) => (i === index ? room : r)));
  };

  const handleDatesChange = (nextIn: string, nextOut: string) => {
    setCheckIn(nextIn);
    setCheckOut(nextOut);
  };

  if (roomTypes.length === 0) {
    return <div className="page muted">Loading room types</div>;
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>New booking: Bairro Alto Hotel</h1>
          <div className="muted">Lisbon, Portugal</div>
        </div>
      </header>
      <div className="steps" aria-label="Steps">
        {STEPS.map((label, i) => (
          <span key={label} className={i === step ? "active" : undefined}>
            {i + 1}. {label}
          </span>
        ))}
      </div>
      <div className="layout">
        <div>
          {step === 0 && <TravelerStep traveler={traveler} onChange={setTraveler} onNext={() => setStep(1)} />}
          {step === 1 && (
            <RoomsStep
              roomTypes={roomTypes}
              rooms={rooms}
              checkIn={checkIn}
              checkOut={checkOut}
              onDatesChange={handleDatesChange}
              onRoomChange={handleRoomChange}
              onAddRoom={handleAddRoom}
              onBack={() => setStep(0)}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && <ReviewStep traveler={traveler} checkIn={checkIn} checkOut={checkOut} rooms={rooms} onBack={() => setStep(1)} />}
        </div>
        <Summary rooms={rooms} roomTypes={roomTypes} nights={nights} />
      </div>
    </div>
  );
}
