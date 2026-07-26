import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export interface ValidatedRequest extends Request {
  validated?: any;
}

export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: ValidatedRequest, res: Response, next: NextFunction) => {
    const dataToValidate = source === 'body' ? req.body : source === 'query' ? req.query : req.params;
    
    const result = schema.safeParse(dataToValidate);

    if (!result.success) {
      const errorMap = result.error.flatten().fieldErrors;
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Validation failed',
        details: errorMap
      });
    }

    req.validated = result.data;
    next();
  };
};
