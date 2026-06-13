import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
 
export interface PaginatedData {
  data: unknown[];
  meta: Record<string, unknown>;
}
 
function isPaginatedResponse(value: unknown): value is PaginatedData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    'meta' in value &&
    Array.isArray((value as PaginatedData).data)
  );
}
 
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const path = request.url;
    const timestamp = new Date().toISOString();
 
    return next.handle().pipe(
      map((data) => {
        if (data === null || data === undefined) {
          return data;
        }
         if (isPaginatedResponse(data)) {
          return {
            data: data.data,
            meta: {
              ...data.meta,
              timestamp,
              path,
            },
          };
        }
         return {
          data,
          meta: {
            timestamp,
            path,
          },
        };
      }),
    );
  }
}