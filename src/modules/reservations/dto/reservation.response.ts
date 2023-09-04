export class ReservationResponseDto {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  rentedFrom: Date;
  rentedTo: Date;
  roomId: string;
  userId: string;
  isCanceled: boolean;
}
