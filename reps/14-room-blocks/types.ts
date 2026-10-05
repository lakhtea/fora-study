export interface Room {
  id: number;
  name: string;
  sleeps: number;
  assignedTravelerId: number | null;
}

export interface RoomBlock {
  id: number;
  property: string;
  checkIn: string;
  rooms: Room[];
}

export interface Traveler {
  id: number;
  name: string;
}
