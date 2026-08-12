import { PrismaClient, Plan, SubscriptionStatus, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("ChangeMe123!", 12);
  const business = await prisma.business.create({ data: {
    name: "TANK Demo Store", ownerName: "Demo Owner", email: "owner@example.com",
    users: { create: { name: "Demo Owner", email: "owner@example.com", passwordHash, role: UserRole.OWNER } },
    settings: { create: {} },
    subscriptions: { create: { plan: Plan.FREE, amount: 0, currency: "NGN", status: SubscriptionStatus.ACTIVE } }
  }});
  await prisma.product.createMany({ data: [
    { businessId: business.id, name: "Bottled Water", sku: "WATER-001", costPrice: 150, sellingPrice: 250, stockQty: 100, lowStockThreshold: 10 },
    { businessId: business.id, name: "Bread", sku: "BREAD-001", costPrice: 700, sellingPrice: 1000, stockQty: 50, lowStockThreshold: 5 }
  ]});
  console.log(`Seeded ${business.id}; owner@example.com / ChangeMe123!`);
}

main().finally(() => prisma.$disconnect());
