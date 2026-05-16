import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";
import { apiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { generateAuthTokens } from "../utils/token";

const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  createdAt: true
};

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { email, name, password } = req.body;
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new ApiError(409, "Email is already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword
    },
    select: publicUserSelect
  });

  const tokens = generateAuthTokens({ id: user.id, email: user.email });
  return apiResponse.success(res, { user, ...tokens }, "Account created", 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw new ApiError(401, "Invalid email or password");
  }

  const tokens = generateAuthTokens({ id: user.id, email: user.email });
  const { password: _password, ...safeUser } = user;

  return apiResponse.success(res, { user: safeUser, ...tokens }, "Logged in successfully");
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication is required");
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: publicUserSelect
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return apiResponse.success(res, user, "Authenticated user");
});

export const register = signup;
