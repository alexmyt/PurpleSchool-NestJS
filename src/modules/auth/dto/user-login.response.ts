class UserInfoDto {
  id: string;
  role: string;
}
export class UserLoginResponseDTO {
  accessToken: string;
  refreshToken: string;
  user: UserInfoDto;
}
