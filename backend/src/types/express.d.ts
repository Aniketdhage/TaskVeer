// types/express.d.ts
// Augment express-serve-static-core so req.user is recognised everywhere

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
    };
    projectRole?: string;
  }
}

export {};
