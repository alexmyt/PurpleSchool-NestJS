export const reservationDto = {
  rentedFrom: '2023-06-01',
  rentedTo: '2023-08-30',
};

export const reservationExpectedPeriod = {
  rentedFrom: `${reservationDto.rentedFrom}T00:00:00.000Z`,
  rentedTo: `${reservationDto.rentedTo}T23:59:59.999Z`,
};
