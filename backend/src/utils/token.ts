import jwt from "jsonwebtoken";
import { env } from "../config/env";

type TokenPayload = {
  id: string;
  email: string;
};

export function generateAccessToken(payload: TokenPayload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]
  });
}

export function generateRefreshToken(payload: TokenPayload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"]
  });
}

export function generateAuthTokens(payload: TokenPayload) {
  return {
    token: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload)
  };
}
