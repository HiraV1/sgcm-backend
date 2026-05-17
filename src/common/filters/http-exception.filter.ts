import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const contextHttp = host.switchToHttp();

    const response = contextHttp.getResponse<Response>();
    const request = contextHttp.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal Server Error';

    let detail = 'Unexpected error';

    let errors: string[] = [];

    if (typeof exceptionResponse === 'string') {
      detail = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      const responseObject = exceptionResponse as Record<string, unknown>;

      if (typeof responseObject.message === 'string') {
        detail = responseObject.message;
      }

      if (
        Array.isArray(responseObject.message) &&
        responseObject.message.every((msg) => typeof msg === 'string')
      ) {
        errors = responseObject.message;
        detail = 'Validation failed';
      }
    }

    const title = this.getTitle(status);

    const type = this.getType(status);

    response.status(status).json({
      type,
      title,
      detail,
      ...(errors.length > 0 && { errors }),
      instance: request.url,
      method: request.method,
      status,
      timestamp: new Date().toISOString(),
    });
  }

  private getTitle(status: number): string {
    /* ADICIONAR 401 E 403 QUANDO FOR FEITA A IMPLEMENTAÇÃO DE AUTENTICAÇÃO E AUTORIZAÇÃO */
    switch (status) {
      case 400:
        return 'Bad Request';
      case 404:
        return 'Not Found';
      case 409:
        return 'Conflict';
      default:
        return 'Internal Server Error';
    }
  }

  private getType(status: number): string {
    /* ADICIONAR 401 E 403 QUANDO FOR FEITA A IMPLEMENTAÇÃO DE AUTENTICAÇÃO E AUTORIZAÇÃO */
    switch (status) {
      case 400:
        return 'https://sgcm.example.com/problems/bad-request';
      case 404:
        return 'https://sgcm.example.com/problems/not-found';
      case 409:
        return 'https://sgcm.example.com/problems/conflict';
      default:
        return 'https://sgcm.example.com/problems/internal-server-error';
    }
  }
}
