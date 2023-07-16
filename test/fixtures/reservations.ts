export const mockReservationPeriods = {
  admin: {
    rentedFrom: '2023-01-01',
    rentedTo: '2023-01-30',
  },
  user: {
    rentedFrom: '2023-03-01',
    rentedTo: '2023-03-30',
  },
};

export const expectedReservationPeriods = {
  admin: {
    rentedFrom: '2023-01-01T00:00:00.000Z',
    rentedTo: '2023-01-30T23:59:59.999Z',
  },
  user: {
    rentedFrom: '2023-03-01T00:00:00.000Z',
    rentedTo: '2023-03-30T23:59:59.999Z',
  },
};

export const createReservationDto = {
  rentedFrom: '2023-06-01',
  rentedTo: '2023-08-30',
};

export const reservationExpectedPeriod = {
  rentedFrom: `${createReservationDto.rentedFrom}T00:00:00.000Z`,
  rentedTo: `${createReservationDto.rentedTo}T23:59:59.999Z`,
};
