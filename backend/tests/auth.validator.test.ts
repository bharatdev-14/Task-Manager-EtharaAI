import { signupSchema } from "../src/validators/auth.validator";

describe("auth validation", () => {
  it("accepts a strong signup payload and normalizes email/name", () => {
    const parsed = signupSchema.parse({
      body: {
        name: "  Ada Lovelace  ",
        email: "ADA@EXAMPLE.COM",
        password: "StrongPass1!"
      }
    });

    expect(parsed.body.name).toBe("Ada Lovelace");
    expect(parsed.body.email).toBe("ada@example.com");
  });

  it("rejects weak passwords", () => {
    expect(() =>
      signupSchema.parse({
        body: {
          name: "Ada",
          email: "ada@example.com",
          password: "password"
        }
      })
    ).toThrow();
  });
});
