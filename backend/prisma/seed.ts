import { PrismaClient, ProjectRole, TaskPriority, TaskStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("Password123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@teamflow.dev" },
    update: {
      name: "Admin User",
      password
    },
    create: {
      name: "Admin User",
      email: "admin@teamflow.dev",
      password
    }
  });

  const memberOne = await prisma.user.upsert({
    where: { email: "member.one@teamflow.dev" },
    update: {
      name: "Member One",
      password
    },
    create: {
      name: "Member One",
      email: "member.one@teamflow.dev",
      password
    }
  });

  const memberTwo = await prisma.user.upsert({
    where: { email: "member.two@teamflow.dev" },
    update: {
      name: "Member Two",
      password
    },
    create: {
      name: "Member Two",
      email: "member.two@teamflow.dev",
      password
    }
  });

  const existingProject = await prisma.project.findFirst({
    where: {
      name: "Demo Project",
      adminId: admin.id
    }
  });

  const project = existingProject
    ? await prisma.project.update({
        where: { id: existingProject.id },
        data: {
          description: "A seeded project for exploring team task management."
        }
      })
    : await prisma.project.create({
        data: {
          name: "Demo Project",
          description: "A seeded project for exploring team task management.",
          adminId: admin.id
        }
      });

  await prisma.projectMember.upsert({
    where: {
      userId_projectId: {
        userId: admin.id,
        projectId: project.id
      }
    },
    update: { role: ProjectRole.ADMIN },
    create: {
      userId: admin.id,
      projectId: project.id,
      role: ProjectRole.ADMIN
    }
  });

  for (const user of [memberOne, memberTwo]) {
    await prisma.projectMember.upsert({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: project.id
        }
      },
      update: { role: ProjectRole.MEMBER },
      create: {
        userId: user.id,
        projectId: project.id,
        role: ProjectRole.MEMBER
      }
    });
  }

  await prisma.task.deleteMany({
    where: {
      projectId: project.id
    }
  });

  await prisma.task.createMany({
    data: [
      {
        title: "Set up project workspace",
        description: "Create the initial project structure and invite the team.",
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        priority: TaskPriority.HIGH,
        status: TaskStatus.DONE,
        projectId: project.id,
        assignedToId: admin.id,
        createdById: admin.id
      },
      {
        title: "Define sprint backlog",
        description: "Prioritize the first batch of project tasks.",
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        priority: TaskPriority.HIGH,
        status: TaskStatus.IN_PROGRESS,
        projectId: project.id,
        assignedToId: memberOne.id,
        createdById: admin.id
      },
      {
        title: "Design task board states",
        description: "Validate TODO, IN_PROGRESS, and DONE states with the team.",
        dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        projectId: project.id,
        assignedToId: memberTwo.id,
        createdById: admin.id
      },
      {
        title: "Prepare dashboard metrics",
        description: "Draft analytics for open, completed, and overdue tasks.",
        dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        projectId: project.id,
        assignedToId: memberOne.id,
        createdById: admin.id
      },
      {
        title: "Review role permissions",
        description: "Confirm ADMIN and MEMBER behavior for project access.",
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        priority: TaskPriority.LOW,
        status: TaskStatus.IN_PROGRESS,
        projectId: project.id,
        assignedToId: memberTwo.id,
        createdById: admin.id
      }
    ]
  });

  console.log("Database seeded successfully");
  console.log("Admin login: admin@teamflow.dev / Password123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
