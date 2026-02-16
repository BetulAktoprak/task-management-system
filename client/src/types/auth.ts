export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface TokenDto {
  accessToken: string;
  expiration: string;
  email: string;
  name: string;
  userId: number;
}
