import {
    ExceptionFilter,
    Catch,
    HttpException,
    ArgumentsHost,
    Logger,
  } from '@nestjs/common';
  import * as Sentry from '@sentry/node';
  
  @Catch()
  export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);
  
    catch(exception: HttpException, host: ArgumentsHost) {
      // Log error to Sentry
      Sentry.captureException(exception);
  
      return exception;
    }
  }
  