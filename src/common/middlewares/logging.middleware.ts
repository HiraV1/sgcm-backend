import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;
    const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    const startTime = Date.now();

    // Captura o tempo total e status quando a resposta for finalizada
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;
      this.logger.log(
        `[${new Date().toISOString()}] ${method} ${originalUrl} - ${statusCode} - ${duration}ms - IP: ${ip}`,
      );
    });

    next();
  }
}