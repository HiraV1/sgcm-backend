import { UserType } from 'src/modules/users/enums/user-type.enum';

export interface JwtPayload {
  sub: number;
  email: string;
  type: UserType;
  jti: string;
  iat: number;
  exp: number;
}

export interface JwtPayloadWithoutTimestamp {
  sub: number;
  email: string;
  type: UserType;
  jti: string;
}
