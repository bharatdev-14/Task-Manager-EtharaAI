import { authService } from "@/services/auth.service";
import { api } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  api: {
    post: vi.fn(),
    get: vi.fn()
  }
}));

describe("authService", () => {
  it("uses signup endpoint", async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: {
        data: {
          user: { id: "user_1", name: "Ada", email: "ada@example.com" },
          token: "token"
        }
      }
    });

    const result = await authService.signup({
      name: "Ada",
      email: "ada@example.com",
      password: "StrongPass1!"
    });

    expect(api.post).toHaveBeenCalledWith("/auth/signup", {
      name: "Ada",
      email: "ada@example.com",
      password: "StrongPass1!"
    });
    expect(result.token).toBe("token");
  });
});
