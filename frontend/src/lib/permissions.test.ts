import { canUpdateTask, isProjectAdmin } from "@/lib/permissions";
import { Project, Task, User } from "@/types";

const user: User = { id: "user_1", name: "Ada", email: "ada@example.com" };

const project = {
  id: "project_1",
  name: "Demo",
  admin: user,
  createdAt: new Date().toISOString(),
  members: []
} satisfies Project;

const task = {
  id: "task_1",
  title: "Task",
  status: "TODO",
  priority: "MEDIUM",
  projectId: project.id,
  assignedTo: user
} satisfies Task;

describe("frontend permissions", () => {
  it("detects project admins", () => {
    expect(isProjectAdmin(project, user)).toBe(true);
  });

  it("allows assignees to update their tasks", () => {
    expect(canUpdateTask({ ...project, admin: { id: "other", name: "Other", email: "other@example.com" } }, task, user)).toBe(true);
  });
});
