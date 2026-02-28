declare global {
  namespace Express {
    interface Request {
      /** Data validated by the validateRequest middleware */
      validated?: {
        query?: any;
        body?: any;
        params?: any;
      };
    }
  }
}

export {};
