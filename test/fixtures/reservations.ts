import { fakeRoomList } from './room';

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

// For period 2023-04-01 - 2023-04-30:
// Room 0: 3 days
// Room 1: 2 days
// Room 2: 0 days
export const fakeReservationList = [
  // Room 0 was booked:
  // 1 day in March 2023
  // 3 days in April 2023
  // 1 day in May 2023
  {
    userId: fakeRoomList[0].userId,
    roomId: fakeRoomList[0]._id,
    rentedFrom: new Date('2023-03-30 00:00:00.000Z'),
    rentedTo: new Date('2023-04-01 23:59:59.999Z'),
  },
  {
    userId: fakeRoomList[0].userId,
    roomId: fakeRoomList[0]._id,
    rentedFrom: new Date('2023-04-03 00:00:00.000Z'),
    rentedTo: new Date('2023-04-03 23:59:59.999Z'),
  },
  {
    userId: fakeRoomList[0].userId,
    roomId: fakeRoomList[0]._id,
    rentedFrom: new Date('2023-04-30 00:00:00.000Z'),
    rentedTo: new Date('2023-05-01 23:59:59.999Z'),
  },

  // Room 1 was booked:
  // 2 days in March 2023
  // 2 days in April 2023
  // 1 day in May 2023
  {
    userId: fakeRoomList[1].userId,
    roomId: fakeRoomList[1]._id,
    rentedFrom: new Date('2023-03-29 00:00:00.000Z'),
    rentedTo: new Date('2023-04-01 23:59:59.999Z'),
  },
  {
    userId: fakeRoomList[1].userId,
    roomId: fakeRoomList[1]._id,
    rentedFrom: new Date('2023-04-30 00:00:00.000Z'),
    rentedTo: new Date('2023-05-01 23:59:59.999Z'),
  },

  // Room 2 was booked:
  // 3 day in March 2023
  // 0 days in April 2023
  // 3 days in May 2023
  {
    userId: fakeRoomList[2].userId,
    roomId: fakeRoomList[2]._id,
    rentedFrom: new Date('2023-03-27 00:00:00.000Z'),
    rentedTo: new Date('2023-03-29 23:59:59.999Z'),
  },
  {
    userId: fakeRoomList[2].userId,
    roomId: fakeRoomList[2]._id,
    rentedFrom: new Date('2023-05-01 00:00:00.000Z'),
    rentedTo: new Date('2023-05-03 23:59:59.999Z'),
  },
];
