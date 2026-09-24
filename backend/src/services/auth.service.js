import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { httpError } from '../utils/httpError.js';

function publicUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

export async function register(data) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw httpError(409, 'Email già registrata');

  const user = await prisma.user.create({
    data: {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      profileType: data.profileType,
      passwordHash: await bcrypt.hash(data.password, 10),
    },
  });

  return { user: publicUser(user), token: signToken(user) };
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw httpError(401, 'Credenziali non valide');
  }

  return { user: publicUser(user), token: signToken(user) };
}

export async function getById(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw httpError(404, 'Utente non trovato');
  return publicUser(user);
}
