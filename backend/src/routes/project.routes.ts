import { ProjectRole } from "@prisma/client";
import { Router } from "express";
import {
  addProjectMember,
  createProject,
  deleteProject,
  getProject,
  listProjects,
  removeProjectMember,
  updateProject
} from "../controllers/project.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireProjectRole } from "../middleware/projectAccess.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  addProjectMemberSchema,
  createProjectSchema,
  updateProjectSchema
} from "../validators/project.validator";

export const projectRouter = Router();

projectRouter.use(authenticate);

projectRouter.get("/", listProjects);
projectRouter.post("/", validate(createProjectSchema), createProject);
projectRouter.get("/:id", requireProjectRole(ProjectRole.MEMBER), getProject);
projectRouter.patch("/:id", requireProjectRole(ProjectRole.ADMIN), validate(updateProjectSchema), updateProject);
projectRouter.delete("/:id", requireProjectRole(ProjectRole.ADMIN), deleteProject);
projectRouter.post(
  "/:id/members",
  requireProjectRole(ProjectRole.ADMIN),
  validate(addProjectMemberSchema),
  addProjectMember
);
projectRouter.delete("/:id/members/:memberId", requireProjectRole(ProjectRole.ADMIN), removeProjectMember);
