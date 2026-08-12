import { UserRole } from "@prisma/client";

declare module "fastify" {
  interface FastifyRequest {
    auth?: { userId: string; businessId: string; role: UserRole };
  }
}
