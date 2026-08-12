import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import { PrismaClient, Prisma, Plan, UserRole, UserStatus, SubscriptionStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z, ZodError } from "zod";

const prisma = new PrismaClient();
const app = Fastify({ logger: true });
const PORT = Number(process.env.PORT ?? 4000);
const JWT_SECRET = process.env.JWT_SECRET ?? "development-only-change-me";

app.register(cors, { origin: process.env.FRONTEND_ORIGIN?.split(",") ?? true });
app.register(helmet);
app.register(rateLimit, { max: 100, timeWindow: "1 minute" });
app.register(jwt, { secret: JWT_SECRET, sign: { expiresIn: "7d" } });

const registerSchema = z.object({
  businessName: z.string().trim().min(2).max(120), ownerName: z.string().trim().min(2).max(120),
  email: z.string().email(), phone: z.string().trim().max(40).optional(), address: z.string().trim().max(300).optional(),
  currency: z.string().trim().length(3).default("NGN"), timezone: z.string().default("Africa/Lagos"), password: z.string().min(8).max(128)
});
const productSchema = z.object({
  name: z.string().trim().min(1).max(180), sku: z.string().trim().min(1).max(80), category: z.string().trim().max(80).optional(), barcode: z.string().trim().max(80).optional(),
  costPrice: z.coerce.number().nonnegative(), sellingPrice: z.coerce.number().nonnegative(), stockQty: z.coerce.number().nonnegative().default(0), lowStockThreshold: z.coerce.number().nonnegative().default(0), imageUrl: z.string().url().optional()
});
const saleSchema = z.object({
  items: z.array(z.object({ productId: z.string().min(1), quantity: z.coerce.number().positive() })).min(1),
  discount: z.coerce.number().nonnegative().default(0), paymentMethod: z.string().trim().min(1).max(40)
});

function money(value: Prisma.Decimal | number) { return Number(value.toString()); }
function serialize<T>(value: T): T {
  const normalize = (item: any): any => {
    if (item instanceof Prisma.Decimal) return Number(item);
    if (item instanceof Date) return item.toISOString();
    if (Array.isArray(item)) return item.map(normalize);
    if (item && typeof item === "object") return Object.fromEntries(Object.entries(item).map(([key, child]) => [key, normalize(child)]));
    return item;
  };
  return normalize(value);
}
function body<T>(request: FastifyRequest) { return request.body as T; }
function auth(request: FastifyRequest, reply: FastifyReply) {
  if (!request.auth) { reply.code(401).send({ error: "Authentication required" }); return false; }
  return true;
}
function requireRole(request: FastifyRequest, reply: FastifyReply, roles: UserRole[]) {
  return auth(request, reply) && roles.includes(request.auth!.role);
}
async function audit(businessId: string, actorId: string | undefined, action: string, entity: string, entityId?: string, metadata?: unknown) {
  await prisma.auditLog.create({ data: { businessId, actorId, action, entity, entityId, metadata: metadata as Prisma.InputJsonValue | undefined } });
}
async function activePlan(businessId: string) {
  const subscription = await prisma.subscription.findFirst({ where: { businessId, status: SubscriptionStatus.ACTIVE }, orderBy: { createdAt: "desc" } });
  if (subscription?.plan === Plan.PREMIUM && subscription.expiryAt && subscription.expiryAt > new Date()) return subscription;
  if (subscription?.plan === Plan.PREMIUM && subscription.expiryAt && subscription.expiryAt <= new Date()) await prisma.subscription.update({ where: { id: subscription.id }, data: { status: SubscriptionStatus.EXPIRED } });
  return subscription?.plan === Plan.FREE ? subscription : null;
}
function toUserToken(user: { id: string; businessId: string; role: UserRole }) { return { userId: user.id, businessId: user.businessId, role: user.role }; }

app.addHook("preHandler", async (request) => {
  if (["/health", "/auth/register", "/auth/login"].includes(request.routeOptions.url)) return;
  try { request.auth = await request.jwtVerify<{ userId: string; businessId: string; role: UserRole }>(); } catch { /* route-level auth returns 401 */ }
});

app.get("/health", async () => ({ ok: true, service: "tank-backend", timestamp: new Date().toISOString() }));

app.post("/auth/register", async (request, reply) => {
  const input = registerSchema.parse(body<unknown>(request));
  const passwordHash = await bcrypt.hash(input.password, 12);
  const existing = await prisma.user.findFirst({ where: { email: input.email.toLowerCase() } });
  if (existing) return reply.code(409).send({ error: "Email already registered" });
  const business = await prisma.business.create({ data: {
    name: input.businessName, ownerName: input.ownerName, email: input.email.toLowerCase(), phone: input.phone, address: input.address, currency: input.currency.toUpperCase(), timezone: input.timezone,
    users: { create: { name: input.ownerName, email: input.email.toLowerCase(), passwordHash, role: UserRole.OWNER } },
    settings: { create: {} }, subscriptions: { create: { plan: Plan.FREE, amount: 0, currency: input.currency.toUpperCase(), status: SubscriptionStatus.ACTIVE } }
  }, include: { users: true }});
  const user = business.users[0];
  const token = app.jwt.sign(toUserToken(user));
  await audit(business.id, user.id, "REGISTER", "Business", business.id);
  return reply.code(201).send({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role }, business: serialize(business) });
});

app.post("/auth/login", { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } }, async (request, reply) => {
  const input = z.object({ identifier: z.string().trim().min(1), password: z.string().min(1) }).parse(body<unknown>(request));
  const user = await prisma.user.findFirst({ where: { OR: [{ email: input.identifier.toLowerCase() }, { cashierCode: input.identifier }] } });
  if (!user || user.status !== UserStatus.ACTIVE || !(await bcrypt.compare(input.password, user.passwordHash))) return reply.code(401).send({ error: "Invalid credentials" });
  const token = app.jwt.sign(toUserToken(user));
  await audit(user.businessId, user.id, "LOGIN", "User", user.id);
  return { token, user: { id: user.id, name: user.name, email: user.email, cashierCode: user.cashierCode, role: user.role } };
});

app.get("/me", async (request, reply) => {
  if (!auth(request, reply)) return;
  const user = await prisma.user.findFirst({ where: { id: request.auth!.userId, businessId: request.auth!.businessId }, include: { business: true } });
  return user ? serialize({ id: user.id, name: user.name, email: user.email, cashierCode: user.cashierCode, role: user.role, business: user.business }) : reply.code(404).send({ error: "User not found" });
});

app.get("/products", async (request, reply) => {
  if (!auth(request, reply)) return;
  const q = z.object({ search: z.string().optional(), includeInactive: z.coerce.boolean().default(false) }).parse(request.query);
  const products = await prisma.product.findMany({ where: { businessId: request.auth!.businessId, ...(q.includeInactive ? {} : { status: UserStatus.ACTIVE }), ...(q.search ? { OR: [{ name: { contains: q.search, mode: "insensitive" } }, { sku: { contains: q.search, mode: "insensitive" } }, { barcode: q.search }] } : {}) }, orderBy: { name: "asc" } });
  return serialize(products);
});

app.post("/products", async (request, reply) => {
  if (!requireRole(request, reply, [UserRole.OWNER, UserRole.MANAGER])) return;
  const input = productSchema.parse(body<unknown>(request));
  const plan = await activePlan(request.auth!.businessId);
  const count = await prisma.product.count({ where: { businessId: request.auth!.businessId } });
  if (!plan || (plan.plan === Plan.FREE && count >= 30)) return reply.code(402).send({ error: "Free plan allows up to 30 products", code: "PRODUCT_LIMIT_REACHED" });
  try {
    const product = await prisma.product.create({ data: { ...input, businessId: request.auth!.businessId, costPrice: input.costPrice, sellingPrice: input.sellingPrice } });
    await audit(request.auth!.businessId, request.auth!.userId, "CREATE", "Product", product.id);
    return reply.code(201).send(serialize(product));
  } catch (e) { if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return reply.code(409).send({ error: "SKU or barcode already exists" }); throw e; }
});

app.patch("/products/:id", async (request, reply) => {
  if (!requireRole(request, reply, [UserRole.OWNER, UserRole.MANAGER])) return;
  const input = productSchema.partial().extend({ status: z.nativeEnum(UserStatus).optional() }).parse(body<unknown>(request));
  const updated = await prisma.product.updateMany({ where: { id: (request.params as { id: string }).id, businessId: request.auth!.businessId }, data: input });
  if (!updated.count) return reply.code(404).send({ error: "Product not found" });
  const product = await prisma.product.findUnique({ where: { id: (request.params as { id: string }).id } });
  await audit(request.auth!.businessId, request.auth!.userId, "UPDATE", "Product", product!.id);
  return serialize(product);
});

app.get("/cashiers", async (request, reply) => {
  if (!requireRole(request, reply, [UserRole.OWNER, UserRole.MANAGER])) return;
  const cashiers = await prisma.user.findMany({ where: { businessId: request.auth!.businessId, role: UserRole.CASHIER }, select: { id: true, name: true, cashierCode: true, status: true, createdAt: true } });
  return cashiers;
});

app.post("/cashiers", async (request, reply) => {
  if (!requireRole(request, reply, [UserRole.OWNER])) return;
  const input = z.object({ name: z.string().trim().min(2).max(120), cashierCode: z.string().trim().min(2).max(30), password: z.string().min(8).max(128) }).parse(body<unknown>(request));
  const count = await prisma.user.count({ where: { businessId: request.auth!.businessId, role: UserRole.CASHIER } });
  const plan = await activePlan(request.auth!.businessId);
  if (!plan || (plan.plan === Plan.FREE && count >= 1)) return reply.code(402).send({ error: "Upgrade to Premium to add cashiers", code: "CASHIER_LIMIT_REACHED" });
  try {
    const cashier = await prisma.user.create({ data: { businessId: request.auth!.businessId, name: input.name, cashierCode: input.cashierCode, passwordHash: await bcrypt.hash(input.password, 12), role: UserRole.CASHIER }, select: { id: true, name: true, cashierCode: true, role: true, status: true } });
    await audit(request.auth!.businessId, request.auth!.userId, "CREATE", "Cashier", cashier.id);
    return reply.code(201).send(cashier);
  } catch (e) { if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return reply.code(409).send({ error: "Cashier ID already exists" }); throw e; }
});

app.patch("/cashiers/:id", async (request, reply) => {
  if (!requireRole(request, reply, [UserRole.OWNER])) return;
  const input = z.object({ status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE]), name: z.string().trim().min(2).optional() }).parse(body<unknown>(request));
  const id = (request.params as { id: string }).id;
  const result = await prisma.user.updateMany({ where: { id, businessId: request.auth!.businessId, role: UserRole.CASHIER }, data: input });
  if (!result.count) return reply.code(404).send({ error: "Cashier not found" });
  await audit(request.auth!.businessId, request.auth!.userId, "UPDATE", "Cashier", id, input);
  return prisma.user.findUnique({ where: { id }, select: { id: true, name: true, cashierCode: true, status: true } });
});

app.post("/sales", async (request, reply) => {
  if (!requireRole(request, reply, [UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER])) return;
  const input = saleSchema.parse(body<unknown>(request));
  const businessId = request.auth!.businessId;
  const result = await prisma.$transaction(async (tx) => {
    const products = await tx.product.findMany({ where: { businessId, id: { in: input.items.map(i => i.productId) }, status: UserStatus.ACTIVE } });
    if (products.length !== new Set(input.items.map(i => i.productId)).size) throw new Error("One or more products are unavailable");
    const lines = input.items.map(item => {
      const product = products.find(p => p.id === item.productId)!;
      if (money(product.stockQty) < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);
      return { product, quantity: item.quantity, lineTotal: money(product.sellingPrice) * item.quantity, lineCost: money(product.costPrice) * item.quantity };
    });
    const subtotal = lines.reduce((sum, x) => sum + x.lineTotal, 0);
    if (input.discount > subtotal) throw new Error("Discount cannot exceed subtotal");
    const total = subtotal - input.discount;
    const costTotal = lines.reduce((sum, x) => sum + x.lineCost, 0);
    const sale = await tx.sale.create({ data: { businessId, cashierId: request.auth!.userId, receiptNo: `T-${Date.now()}-${Math.floor(Math.random() * 1000)}`, subtotal, discount: input.discount, total, costTotal, grossProfit: total - costTotal, paymentMethod: input.paymentMethod, items: { create: lines.map(x => ({ productId: x.product.id, productNameSnapshot: x.product.name, quantity: x.quantity, costPriceSnapshot: x.product.costPrice, sellingPriceSnapshot: x.product.sellingPrice, lineTotal: x.lineTotal })) } }, include: { items: true, cashier: { select: { id: true, name: true, cashierCode: true } } } });
    for (const line of lines) await tx.product.update({ where: { id: line.product.id }, data: { stockQty: { decrement: line.quantity } } });
    return sale;
  }).catch((e: Error) => { throw e; });
  await audit(businessId, request.auth!.userId, "CREATE", "Sale", result.id, { receiptNo: result.receiptNo });
  return reply.code(201).send(serialize(result));
});

app.get("/sales", async (request, reply) => {
  if (!auth(request, reply)) return;
  const q = z.object({ from: z.coerce.date().optional(), to: z.coerce.date().optional(), cashierId: z.string().optional(), limit: z.coerce.number().int().min(1).max(200).default(50), offset: z.coerce.number().int().min(0).default(0) }).parse(request.query);
  const sales = await prisma.sale.findMany({ where: { businessId: request.auth!.businessId, ...(q.cashierId ? { cashierId: q.cashierId } : {}), ...(q.from || q.to ? { createdAt: { ...(q.from ? { gte: q.from } : {}), ...(q.to ? { lte: q.to } : {}) } } : {}) }, include: { cashier: { select: { id: true, name: true, cashierCode: true } }, items: true }, orderBy: { createdAt: "desc" }, take: q.limit, skip: q.offset });
  return serialize(sales);
});

app.get("/sales/:id/receipt", async (request, reply) => {
  if (!auth(request, reply)) return;
  const sale = await prisma.sale.findFirst({ where: { id: (request.params as { id: string }).id, businessId: request.auth!.businessId }, include: { items: true, cashier: true, business: { include: { settings: true } } } });
  if (!sale) return reply.code(404).send({ error: "Sale not found" });
  return serialize({ business: sale.business, sale, receiptMessage: sale.business.settings?.receiptMessage ?? sale.business.receiptMessage, printerWidth: sale.business.settings?.printerWidth ?? sale.business.printerWidth });
});

app.get("/reports/summary", async (request, reply) => {
  if (!requireRole(request, reply, [UserRole.OWNER, UserRole.MANAGER])) return;
  const q = z.object({ from: z.coerce.date().optional(), to: z.coerce.date().optional(), cashierId: z.string().optional() }).parse(request.query);
  const from = q.from ?? new Date(new Date().setHours(0, 0, 0, 0));
  const to = q.to ?? new Date();
  const where = { businessId: request.auth!.businessId, createdAt: { gte: from, lte: to }, ...(q.cashierId ? { cashierId: q.cashierId } : {}) };
  const sales = await prisma.sale.findMany({ where, include: { cashier: { select: { id: true, name: true, cashierCode: true } }, items: true } });
  const sum = (key: "total" | "costTotal" | "grossProfit" | "discount") => sales.reduce((n, sale) => n + money(sale[key]), 0);
  const byCashier = Object.values(sales.reduce<Record<string, { cashier: unknown; transactions: number; total: number; grossProfit: number }>>((acc, sale) => { const key = sale.cashierId; acc[key] ??= { cashier: sale.cashier, transactions: 0, total: 0, grossProfit: 0 }; acc[key].transactions++; acc[key].total += money(sale.total); acc[key].grossProfit += money(sale.grossProfit); return acc; }, {}));
  const byPayment = Object.values(sales.reduce<Record<string, { paymentMethod: string; transactions: number; total: number }>>((acc, sale) => { const key = sale.paymentMethod; acc[key] ??= { paymentMethod: key, transactions: 0, total: 0 }; acc[key].transactions++; acc[key].total += money(sale.total); return acc; }, {}));
  const topProducts = Object.values(sales.flatMap(s => s.items).reduce<Record<string, { productId: string; name: string; units: number; revenue: number }>>((acc, item) => { acc[item.productId] ??= { productId: item.productId, name: item.productNameSnapshot, units: 0, revenue: 0 }; acc[item.productId].units += money(item.quantity); acc[item.productId].revenue += money(item.lineTotal); return acc; }, {})).sort((a, b) => b.units - a.units).slice(0, 10);
  return { from, to, transactions: sales.length, unitsSold: sales.flatMap(s => s.items).reduce((n, i) => n + money(i.quantity), 0), revenue: sum("total"), subtotal: sum("total") + sum("discount"), costOfGoodsSold: sum("costTotal"), grossProfit: sum("grossProfit"), discounts: sum("discount"), byCashier, byPayment, topProducts };
});

app.get("/dashboard", async (request, reply) => {
  if (!requireRole(request, reply, [UserRole.OWNER, UserRole.MANAGER])) return;
  const [summary, products, cashiers, subscription] = await Promise.all([app.inject({ method: "GET", url: "/reports/summary", headers: { authorization: request.headers.authorization! } }).then(r => r.json()), prisma.product.count({ where: { businessId: request.auth!.businessId } }), prisma.user.count({ where: { businessId: request.auth!.businessId, role: UserRole.CASHIER, status: UserStatus.ACTIVE } }), activePlan(request.auth!.businessId)]);
  const inventory = await prisma.product.findMany({ where: { businessId: request.auth!.businessId, status: UserStatus.ACTIVE } });
  const lowStock = inventory.filter(product => money(product.stockQty) <= money(product.lowStockThreshold));
  return { ...summary, products, activeCashiers: cashiers, lowStockAlerts: serialize(lowStock), subscription: serialize(subscription) };
});

app.get("/subscription", async (request, reply) => { if (!auth(request, reply)) return; return serialize(await activePlan(request.auth!.businessId)); });
app.post("/subscription/activate", async (request, reply) => {
  if (!requireRole(request, reply, [UserRole.OWNER])) return;
  const input = z.object({ paymentReference: z.string().trim().min(3), amount: z.coerce.number().positive().default(80000), currency: z.string().length(3).default("NGN") }).parse(body<unknown>(request));
  const startAt = new Date(); const expiryAt = new Date(startAt.getTime() + 360 * 24 * 60 * 60 * 1000);
  const subscription = await prisma.subscription.create({ data: { businessId: request.auth!.businessId, plan: Plan.PREMIUM, amount: input.amount, currency: input.currency, startAt, expiryAt, status: SubscriptionStatus.ACTIVE, paymentReference: input.paymentReference }, });
  await prisma.payment.create({ data: { businessId: request.auth!.businessId, provider: "manual", amount: input.amount, currency: input.currency, status: "SUCCESSFUL", reference: input.paymentReference } });
  await audit(request.auth!.businessId, request.auth!.userId, "ACTIVATE", "Subscription", subscription.id);
  return reply.code(201).send(serialize(subscription));
});

app.setErrorHandler((error, request, reply) => {
  if (error instanceof ZodError) return reply.code(400).send({ error: "Validation failed", details: error.flatten() });
  if (error.message?.includes("Insufficient stock") || error.message?.includes("unavailable") || error.message?.includes("Discount")) return reply.code(400).send({ error: error.message });
  request.log.error(error); return reply.code(500).send({ error: "Internal server error" });
});

const start = async () => { try { await app.listen({ port: PORT, host: process.env.HOST ?? "0.0.0.0" }); } catch (error) { app.log.error(error); process.exit(1); } };
if (require.main === module) start();
export { app, prisma };
