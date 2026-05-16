import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export async function checkDatabaseConnection() {
  await prisma.$queryRaw`SELECT 1`;
  return true;
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}

export async function withTransaction<T>(callback: (tx: Prisma.TransactionClient) => Promise<T>) {
  return prisma.$transaction(callback);
}

export async function clearProjectData(projectId: string) {
  return withTransaction(async (tx) => {
    await tx.task.deleteMany({ where: { projectId } });
    await tx.projectMember.deleteMany({ where: { projectId } });
    return tx.project.delete({ where: { id: projectId } });
  });
}
