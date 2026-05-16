import request from "supertest";

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn()
  }
};

jest.mock("../src/config/prisma", () => ({
  prisma: mockPrisma
}));

const { app } = require("../src/app");

describe("auth routes", () => {
  beforeEach(() => {
    mockPrisma.user.findUnique.mockReset();
    mockPrisma.user.create.mockReset();
  });

  it("signs up a new user", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      id: "user_1",
      name: "Ada Lovelace",
      email: "ada@example.com",
      createdAt: new Date()
    });

    const response = await request(app).post("/api/auth/signup").send({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "StrongPass1!"
    });

    expect(response.status).toBe(201);
    expect(response.body.data.user.email).toBe("ada@example.com");
    expect(response.body.data.token).toEqual(expect.any(String));
    expect(response.body.data.refreshToken).toEqual(expect.any(String));
  });

  it("protects duplicate emails", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "user_1", email: "ada@example.com" });

    const response = await request(app).post("/api/auth/signup").send({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "StrongPass1!"
    });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
  });
});
