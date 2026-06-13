import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }
 
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
 
    if (isPublic) {
      return true;
    }
 
    return super.canActivate(context);
  }
 
  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
  ): TUser {
  if (info?.name === 'TokenExpiredError') {
      throw new UnauthorizedException(
        'O token de acesso expirou. Utilize POST /auth/refresh para renová-lo.',
      );
    }
 
    if (info?.name === 'JsonWebTokenError') {
      throw new UnauthorizedException(
        'O token fornecido é inválido ou foi adulterado.',
      );
    }
 
    if (err || !user) {
      throw new UnauthorizedException(
        'Nenhum token de autenticação foi fornecido.',
      );
    }
 
    return user;
  }
}