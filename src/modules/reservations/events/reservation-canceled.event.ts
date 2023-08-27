export class ReservationCanceledEvent {
  reservationId: string;
  rentedFrom: Date;
  rentedTo: Date;
  roomId: string;
  roomName: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  renterId: string;
  renterName: string;
  renterEmail: string;
}
