export interface RoomType {
  code: string;
  name: string;
  maxGuests: number;
  price: number;
}

export interface BookingRequest {
  traveler: { name: string; email: string; phone: string };
  checkIn: string;
  checkOut: string;
  rooms: { type: string; guests: number }[];
  specialRequests: string;
}

export interface FieldError {
  field: string;
  message: string;
}
