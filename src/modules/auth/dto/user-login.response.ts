class UserInfoDto {
  id: string;
  role: string;
}
export class UserLoginResponseDTO {
  accessToken: string;
  user: UserInfoDto;
}
