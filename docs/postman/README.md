# BukuKasir API - Postman Collection

Postman collection and environment for testing all 14 BukuKasir microservice APIs.

## Files

| File | Description |
|------|-------------|
| `bukukasir-api.postman_collection.json` | Main API collection with all endpoints (Postman v2.1) |
| `bukukasir-dev.postman_environment.json` | Development environment variables |

## Quick Start

### 1. Import into Postman

1. Open Postman
2. Click **Import** (top-left)
3. Drag and drop both JSON files, or click **Upload Files** and select them
4. The collection "BukuKasir API" and environment "BukuKasir - Development" will appear

### 2. Select the Environment

1. In the top-right corner of Postman, click the environment dropdown
2. Select **BukuKasir - Development**

### 3. Start the Backend Services

From the project root:

```bash
cd backend

# Start infrastructure (Eureka + API Gateway)
cd infrastructure/eureka-server && mvn spring-boot:run &
cd infrastructure/api-gateway && mvn spring-boot:run &

# Start all microservices
cd services/auth-service && mvn spring-boot:run &
cd services/user-business-service && mvn spring-boot:run &
cd services/staff-service && mvn spring-boot:run &
cd services/menu-service && mvn spring-boot:run &
cd services/table-service && mvn spring-boot:run &
cd services/order-service && mvn spring-boot:run &
cd services/payment-service && mvn spring-boot:run &
cd services/kitchen-service && mvn spring-boot:run &
cd services/notification-service && mvn spring-boot:run &
cd services/ai-image-service && mvn spring-boot:run &
cd services/report-service && mvn spring-boot:run &
cd services/receipt-service && mvn spring-boot:run &
cd services/file-storage-service && mvn spring-boot:run &
cd services/realtime-gateway && mvn spring-boot:run &
```

Or if a Docker Compose setup is available:

```bash
docker-compose up -d
```

### 4. Run Requests

**Individual requests:** Open any request in the collection and click **Send**.

**Run entire collection:**
1. Right-click the "BukuKasir API" collection
2. Click **Run collection**
3. Select the folders/requests to run
4. Click **Run BukuKasir API**

## Service Ports

| Service | Port | Base Path |
|---------|------|-----------|
| API Gateway | 8080 | All routes |
| Auth Service | 8081 | `/api/auth` |
| User & Business Service | 8082 | `/api/businesses` |
| Staff Service | 8083 | `/api/staff` |
| Menu Service | 8084 | `/api/menu` |
| Table Service | 8085 | `/api/tables` |
| Order Service | 8086 | `/api/orders` |
| Payment Service | 8087 | `/api/payments` |
| Kitchen Service | 8088 | `/api/kitchen` |
| Notification Service | 8089 | `/api/notifications` |
| AI Image Service | 8090 | `/api/images` |
| Report Service | 8091 | `/api/reports` |
| Receipt Service | 8092 | `/api/receipts` |
| File Storage Service | 8093 | `/api/files` |
| Realtime Gateway | 8094 | `/api/realtime` |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `gateway_url` | `http://localhost:8080` | API Gateway URL (routes to all services) |
| `auth_url` | `http://localhost:8081` | Direct auth service URL |
| `business_url` | `http://localhost:8082` | Direct business service URL |
| `staff_url` | `http://localhost:8083` | Direct staff service URL |
| `menu_url` | `http://localhost:8084` | Direct menu service URL |
| `table_url` | `http://localhost:8085` | Direct table service URL |
| `order_url` | `http://localhost:8086` | Direct order service URL |
| `payment_url` | `http://localhost:8087` | Direct payment service URL |
| `kitchen_url` | `http://localhost:8088` | Direct kitchen service URL |
| `notification_url` | `http://localhost:8089` | Direct notification service URL |
| `ai_image_url` | `http://localhost:8090` | Direct AI image service URL |
| `report_url` | `http://localhost:8091` | Direct report service URL |
| `receipt_url` | `http://localhost:8092` | Direct receipt service URL |
| `file_url` | `http://localhost:8093` | Direct file storage service URL |
| `realtime_url` | `http://localhost:8094` | Direct realtime gateway URL |
| `business_id` | `bus-001` | Default business ID for testing |
| `staff_id` | `staff-001` | Default staff ID for testing |
| `auth_token` | `mock-jwt-token` | Bearer token for Authorization header |

All requests default to `{{gateway_url}}` so they route through the API Gateway. To test a service directly, replace `{{gateway_url}}` with the service-specific variable (e.g., `{{auth_url}}`).

## Pre-loaded Mock Data

Each service starts with in-memory mock data. No database setup is required.

### Businesses
- **biz-001** - Warung Nusantara (restaurant, Jakarta Selatan)
- **biz-002** - Kopi Kenangan Senja (cafe, Jakarta Pusat)

### Staff (biz-001)
- **staff-001** - Budi Santoso (OWNER, PIN: 1234)
- **staff-002** - Siti Rahayu (MANAGER, PIN: 5678)
- **staff-003** - Ahmad Wijaya (CASHIER, PIN: 1111)

### Menu Categories (biz-001)
- **cat-001** - Makanan (food)
- **cat-002** - Minuman (beverages)
- **cat-003** - Snack (snacks)

### Menu Items (biz-001)
- **item-001** - Nasi Goreng Spesial (Rp 35.000)
- **item-002** - Ayam Bakar Madu (Rp 45.000)
- **item-003** - Soto Ayam (Rp 30.000)
- **item-004** - Es Teh Manis (Rp 8.000)
- **item-005** - Es Jeruk (Rp 12.000)

### Tables (biz-001)
- **table-001** - T1 (4-seat, available)
- **table-002** - T2 (4-seat, occupied with order-001)
- **table-003** - T3 (6-seat, available)
- **table-004** - VIP-1 (8-seat, reserved)
- **table-005** - T5 (2-seat, available)

### Orders (biz-001)
- **order-001** - ORD-20260328-001 at T2, 2x Nasi Goreng + 2x Es Teh Manis (total Rp 94.600)

### Payment Methods (biz-001)
- **pm-001** - Cash
- **pm-002** - QRIS
- **pm-003** - Debit BCA

## Collection Structure

```
BukuKasir API
  +-- Auth Service (5 requests)
  |     Verify PIN, Change PIN, Reset PIN, Get Session, Get Roles
  +-- User & Business Service (5 requests)
  |     List, Get, Create, Update, Transfer Ownership
  +-- Staff Service (6 requests)
  |     List, Get, Create, Update, Delete, Reset PIN
  +-- Menu Service
  |     +-- Categories (4 requests)
  |     |     List, Create, Update, Delete
  |     +-- Items (6 requests)
  |           List, Get, Create, Update, Delete, Toggle Availability
  +-- Table Service (7 requests)
  |     List, Get, Create, Update, Update Status, Transfer, Merge
  +-- Order Service (6 requests)
  |     List, Get, Create, Add Items, Void, Get by Table
  +-- Payment Service
  |     +-- Payments (3 requests)
  |     |     Record, Get, Get by Order
  |     +-- Payment Methods (4 requests)
  |           List, Create, Update, Delete
  +-- Kitchen Service (4 requests)
  |     List Tickets, Get Ticket, Update Status, Reprint
  +-- Notification Service (3 requests)
  |     List, Send, Mark as Read
  +-- AI Image Service (3 requests)
  |     Generate, Get Job, List Jobs
  +-- Report Service (5 requests)
  |     Daily Summary, Sales Report, Payment Breakdown, Top Items, Staff Performance
  +-- Receipt Service (4 requests)
  |     Get Template, Update Template, Print Receipt, Print Queue
  +-- File Storage Service (4 requests)
  |     Upload, Get, Delete, List by Business
  +-- Realtime Gateway (1 request)
        Get Status
```

**Total: 65 API requests across 14 services**

## Authentication

All requests include a Bearer token via collection-level auth:

```
Authorization: Bearer {{auth_token}}
```

The mock services accept any token value. In production, first call **Verify PIN** to obtain a real JWT session token, then set `auth_token` to that value.

## Suggested Test Flow

For a realistic end-to-end test, run these requests in order:

1. **Auth** > Verify PIN (get session)
2. **Business** > Get All Businesses
3. **Staff** > Get All Staff
4. **Menu** > Categories > Get All Categories
5. **Menu** > Items > Get All Menu Items
6. **Tables** > Get All Tables
7. **Orders** > Create Order (on table T1)
8. **Kitchen** > Get All Tickets (see the new ticket)
9. **Kitchen** > Update Ticket Status (to IN_PROGRESS, then READY)
10. **Notifications** > Send Notification (order ready for waiter)
11. **Payments** > Record Payment (cash payment)
12. **Receipts** > Print Receipt
13. **Reports** > Get Daily Summary
14. **Reports** > Get Top Items
