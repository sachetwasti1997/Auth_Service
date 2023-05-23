import express, { NextFunction, Request, Response } from 'express';

import { currentUser } from '@ticketingplatform/common';
import { authorisedCheck } from '@ticketingplatform/common';

const router = express.Router();

router.get(
  '/api/users/currentuser',
  currentUser,
  authorisedCheck,
  (req: Request, res: Response, next: NextFunction) => {
    res.send({ currentUser: req.currentUser || null });
  }
);

export { router as currentUserRouter };
