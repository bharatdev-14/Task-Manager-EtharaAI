import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

export const handlers = [
  http.get("http://localhost:5000/api/auth/me", () =>
    HttpResponse.json({
      success: true,
      message: "Authenticated user",
      data: { id: "user_1", name: "Ada", email: "ada@example.com" }
    })
  )
];

export const server = setupServer(...handlers);
