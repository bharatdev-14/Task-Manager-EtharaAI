import { ProjectRole } from "@prisma/client";
import { hasMinimumProjectRole } from "../src/rbac/permissions";

describe("RBAC permissions", () => {
  it("allows admins to satisfy member permissions", () => {
    expect(hasMinimumProjectRole(ProjectRole.ADMIN, ProjectRole.MEMBER)).toBe(true);
  });

  it("does not allow members to satisfy admin permissions", () => {
    expect(hasMinimumProjectRole(ProjectRole.MEMBER, ProjectRole.ADMIN)).toBe(false);
  });
});
