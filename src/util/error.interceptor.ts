import {
  NestInterceptor,
  Injectable,
  CallHandler,
  ExecutionContext,
  NotFoundException,
  BadGatewayException,
  InternalServerErrorException,
  UnauthorizedException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      catchError((err) => {
        if (err instanceof NotFoundException) {
          return throwError(() => new NotFoundException(err.message));
        }
        if (err instanceof BadGatewayException) {
          return throwError(() => new BadGatewayException(err.message));
        }
        if (err instanceof UnauthorizedException) {
          return throwError(() => new UnauthorizedException(err.message));
        }

        if (err instanceof BadRequestException) {
          return throwError(() => new BadRequestException(err.message));
        }
        // return a generic internal server error
        this.logger.log(err);
        return throwError(() => new InternalServerErrorException(err.message));
      }),
    );
  }
}
