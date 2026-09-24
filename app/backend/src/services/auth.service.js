import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';

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

const RESET_TOKEN_TTL_MINUTES = 60;

export async function requestPasswordReset(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Risposta generica per non rivelare se l'email esiste
  if (!user) return { message: 'Se l\'email è registrata riceverai le istruzioni.' };

  // Invalida i token precedenti non ancora usati
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  });

  // In produzione qui si invierebbe l'email con il link.
  // In sviluppo il token è restituito nella risposta per facilitare il test.
  return {
    message: 'Se l\'email è registrata riceverai le istruzioni.',
    ...(env.nodeEnv !== 'production' ? { debug_token: token } : {}),
  };
}

export async function resetPassword({ token, password }) {
  const record = await prisma.passwordResetToken.findUnique({ where: { token } });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw httpError(400, 'Token non valido o scaduto');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);

  return { message: 'Password aggiornata con successo' };
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw httpError(404, 'Utente non trovato');

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw httpError(401, 'Password attuale non corretta');

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  return { message: 'Password aggiornata con successo' };
}
