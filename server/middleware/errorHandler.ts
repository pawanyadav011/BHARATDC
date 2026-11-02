import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  details?: any;
  code?: string;
}

/**
 * Strips any sensitive credentials, URLs, or connection strings from error messages
 */
const sanitizeErrorMessage = (message: string): string => {
  if (!message) return 'An internal server error occurred';
  return message
    .replace(/postgresql:\/\/[^@\s]+@[^\s/]+/gi, 'postgresql://[REDACTED]')
    .replace(/key=[^&\s]+/gi, 'key=[REDACTED]')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [REDACTED]')
    .replace(/password=[^&\s]+/gi, 'password=[REDACTED]');
};

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  const statusCode = err.statusCode && err.statusCode >= 400 && err.statusCode < 600 ? err.statusCode : 500;
  const isProduction = process.env.NODE_ENV === 'production';
  const rawMessage = err.message || 'Internal Server Error';
  const cleanMessage = sanitizeErrorMessage(rawMessage);

  // In production, mask unhandled 500 errors to prevent leaking internal stack/query details
  const publicMessage =
    statusCode === 500 && isProduction
      ? 'An unexpected error occurred while processing your request.'
      : cleanMessage;

  console.error(`[API Error] [${req.method}] ${req.originalUrl} - ${statusCode}: ${cleanMessage}`);

  res.status(statusCode).json({
    success: false,
    error: publicMessage,
    code: err.code || undefined,
    details: !isProduction && err.details ? err.details : undefined,
  });
};
