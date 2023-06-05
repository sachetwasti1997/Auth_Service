import express, { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

import { BadRequestError } from '@ticketingplatform/common';
import { RequestValidationError } from '@ticketingplatform/common';
import { validateRequest } from '@ticketingplatform/common';
import { User } from '../models/users';
import { Password } from '../services/password';

const router = express.Router();

router.post('/api/users/signin', [
  body('email')
    .notEmpty()
    .isEmail()
    .withMessage('Please provide a valid email!'),
  body('password')
    .notEmpty()
    .withMessage('Password should not be empty!')
],
validateRequest, 
async(req: Request, res: Response, next: NextFunction) => {

  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    return next(new BadRequestError('Invalid Credentials'));
  }
  console.log(existingUser);
  
  const passwordMatch = await Password.compare(existingUser.password, password)

  if (!passwordMatch) {
    return next(new BadRequestError('Invalid Credentials'));
  }

  if (!process.env.JWT_KEY) {
    return next(new Error('Jwt Key is not defined!'));
  }
  const userJwt = jwt.sign(
    {
      id: existingUser.id,
      email: existingUser.email,
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
    },
    process.env.JWT_KEY
  );

  //Store it on the session object
  req.session = {
    jwt: userJwt,
  };

  res.status(200).send(existingUser);
});

export { router as signinRouter };
