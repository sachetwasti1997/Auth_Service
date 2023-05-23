import express, { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

import { User } from '../models/users';
import { RequestValidationError } from '@ticketingplatform/common';
import { BadRequestError } from '@ticketingplatform/common';
import { validateRequest } from '@ticketingplatform/common';

const router = express.Router();

router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('Email must be valid!'),
    body('password')
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters'),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {

    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Email Already in Use');
      return next(new BadRequestError('Email Already in Use: ' + email));
    }

    const user = User.build({ email, password });
    await user.save();

    //Generate JWT
    if (!process.env.JWT_KEY) {
      return next(new Error('Jwt Key is not defined!'))
    }
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY
    );

    //Store it on the session object
    req.session = {
      jwt: userJwt,
    };

    res.status(201).send(user);
  }
);

export { router as signUpRouter };
