import { compare, hash } from 'bcryptjs';

export const HelperService = {
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return compare(password, hashedPassword);
  },

  async hashPassword(password: string, rounds = 10): Promise<string> {
    return hash(password, rounds);
  },
};
