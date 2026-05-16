import { Prisma, ProjectRole } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";
import { apiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

const projectInclude = {
  admin: {
    select: {
      id: true,
      name: true,
      email: true
    }
  },
  members: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  },
  _count: {
    select: {
      tasks: true
    }
  }
};

export const listProjects = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication is required");
  }

  const where: Prisma.ProjectWhereInput = {
    OR: [
      { adminId: req.user.id },
      {
        members: {
          some: {
            userId: req.user.id
          }
        }
      }
    ]
  };

  const projects = await prisma.project.findMany({
    where,
    include: projectInclude,
    orderBy: { createdAt: "desc" }
  });

  return apiResponse.success(res, projects, "Projects retrieved");
});

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication is required");
  }

  const { name, description } = req.body;
  const project = await prisma.project.create({
    data: {
      name,
      description,
      adminId: req.user.id,
      members: {
        create: {
          userId: req.user.id,
          role: ProjectRole.ADMIN
        }
      }
    },
    include: projectInclude
  });

  return apiResponse.success(res, project, "Project created", 201);
});

export const getProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: {
      ...projectInclude,
      tasks: {
        orderBy: { createdAt: "desc" },
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }
    }
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return apiResponse.success(res, project, "Project retrieved");
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await prisma.project.update({
    where: { id: req.params.id },
    data: {
      name: req.body.name,
      description: req.body.description
    },
    include: projectInclude
  });

  return apiResponse.success(res, project, "Project updated");
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  await prisma.project.delete({ where: { id: req.params.id } });
  return apiResponse.success(res, null, "Project deleted");
});

export const addProjectMember = asyncHandler(async (req: Request, res: Response) => {
  const { userId, email, role } = req.body;
  const user = userId
    ? await prisma.user.findUnique({ where: { id: userId } })
    : await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const existingMember = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: user.id,
        projectId: req.params.id
      }
    }
  });

  if (existingMember) {
    throw new ApiError(409, "User is already a project member");
  }

  const member = await prisma.projectMember.create({
    data: {
      userId: user.id,
      projectId: req.params.id,
      role
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return apiResponse.success(res, member, "Project member saved", 201);
});

export const removeProjectMember = asyncHandler(async (req: Request, res: Response) => {
  const member = await prisma.projectMember.findFirst({
    where: {
      id: req.params.memberId,
      projectId: req.params.id
    },
    include: {
      project: {
        select: {
          adminId: true
        }
      }
    }
  });

  if (!member) {
    throw new ApiError(404, "Project member not found");
  }

  if (member.userId === member.project.adminId) {
    throw new ApiError(400, "Project admin cannot be removed from the project");
  }

  await prisma.projectMember.delete({
    where: {
      id: member.id
    }
  });

  return apiResponse.success(res, null, "Project member removed");
});
