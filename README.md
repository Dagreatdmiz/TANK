# TANK backend

REST API for the TANK MVP. It is designed for the existing Antigravity frontend to call directly.

## Run locally

1. Copy `.env.example` to `.env`.
2. Start PostgreSQL: `docker compose up -d postgres`.
3. Install packages: `pnpm install`.
4. Create the database: `pnpm prisma:migrate --name init`.
5. Optional demo data: `pnpm prisma:seed`.
6. Start the API: `pnpm dev`.

The API runs at `http://localhost:4000`. All JSON amounts are returned as numbers.

## Frontend contract

Use `Authorization: Bearer <token>` after `POST /auth/register` or `POST /auth/login`.

- `GET /dashboard`
- `GET|POST|PATCH /products`, `/products/:id`
- `GET|POST|PATCH /cashiers`, `/cashiers/:id`
- `POST /sales`, `GET /sales`, `GET /sales/:id/receipt`
- `GET /reports/summary?from=&to=&cashierId=`
- `GET /subscription`, `POST /subscription/activate`

Sales snapshot cost and selling prices are stored on `SaleItem`, so later product price changes never alter historical profit. Every query is scoped by the authenticated business ID. Free plans are limited server-side to 30 products; premium activations last exactly 360 days.

## Production checklist

Replace `JWT_SECRET`, use HTTPS, configure a real payment-provider webhook before exposing subscription activation, put PostgreSQL behind private networking, enable automated backups, and configure object storage for logos/product images.
