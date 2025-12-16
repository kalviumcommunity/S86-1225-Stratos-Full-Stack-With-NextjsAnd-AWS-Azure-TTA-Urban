# PostgreSQL Database Connection Guide

## ✅ Database is Working!

Your database **TTA-URBAN** is running successfully with all tables and data.

## 📊 Database Statistics

- **Users**: 4 (2 citizens, 1 officer, 1 admin)
- **Complaints**: 3
- **Departments**: 3
- **Other Tables**: AuditLog, Feedback, Escalation, Notification

## 🔌 Connection Details

### For PostgreSQL GUI Clients (pgAdmin, DBeaver, TablePlus, etc.)

| Setting | Value |
|---------|-------|
| **Host** | `localhost` or `127.0.0.1` |
| **Port** | `5432` |
| **Database** | `TTA-URBAN` ⚠️ (CASE-SENSITIVE - must be uppercase with hyphen) |
| **Username** | `postgres` |
| **Password** | `sravani08` |
| **SSL Mode** | `disable` or `prefer` |

### ⚠️ Important Notes

1. **Database name is case-sensitive**: It MUST be `TTA-URBAN` (all caps with hyphen), not `tta-urban` or `ttaurban`
2. **If your client shows "no tables"**: You might be connected to the wrong database (like `postgres` default database)
3. **Make sure to select the `TTA-URBAN` database** after connecting

## 🗂️ Available Tables

```
1. User
2. Department
3. Complaint
4. AuditLog
5. Feedback
6. Escalation
7. Notification
8. _prisma_migrations (system table)
```

## 🛠️ Quick Access Methods

### Method 1: Prisma Studio (Easiest - Web UI)
```powershell
cd D:\TTA-Urban\S86-1225-Stratos-Full-Stack-With-NextjsAnd-AWS-Azure-TTA-Urban\ttaurban
npx prisma studio --url "postgres://postgres:sravani08@localhost:5432/TTA-URBAN"
```
Then open: http://localhost:51212

### Method 2: Command Line (PostgreSQL CLI)
```powershell
# Interactive terminal
docker exec -it postgres_db psql -U postgres -d TTA-URBAN

# Once inside, you can run:
\dt                           # List all tables
SELECT * FROM "User";         # View users
SELECT * FROM "Complaint";    # View complaints
SELECT * FROM "Department";   # View departments
```

### Method 3: VS Code Extension

1. Install **PostgreSQL** extension by Chris Kolkman
2. Add new connection with these details:
   - Host: `localhost`
   - User: `postgres`
   - Password: `sravani08`
   - Port: `5432`
   - Database: `TTA-URBAN`
   - SSL: disabled

## 🔍 Verify Connection

Run this command to verify everything is working:
```powershell
cd D:\TTA-Urban\S86-1225-Stratos-Full-Stack-With-NextjsAnd-AWS-Azure-TTA-Urban\ttaurban
npx tsx test-db-connection.ts
```

Expected output:
```
✅ Database connection successful!
📊 Database Statistics:
   Users: 4
   Complaints: 3
   Departments: 3
```

## 🐛 Troubleshooting

### Problem: "Authentication failed"
- Double-check password is `sravani08` (not `password`)
- Ensure PostgreSQL container is running: `docker ps`

### Problem: "Database does not exist"
- Make sure you typed `TTA-URBAN` exactly (uppercase with hyphen)
- Not `tta-urban`, `ttaurban`, or `TTA_URBAN`

### Problem: "Cannot connect to server"
- Ensure PostgreSQL container is running: `docker-compose up -d db`
- Check port 5432 is not blocked by firewall

### Problem: "Tables not visible"
- **You might be connected to the `postgres` database instead of `TTA-URBAN`**
- In your client, switch to the `TTA-URBAN` database
- In pgAdmin: Right-click connection → Refresh, then expand Databases → TTA-URBAN → Schemas → public → Tables

## 📝 Sample Queries

```sql
-- Count all users
SELECT COUNT(*) FROM "User";

-- Get all complaints
SELECT * FROM "Complaint";

-- Get users with their departments
SELECT u.email, u.role, d.name as department 
FROM "User" u 
LEFT JOIN "Department" d ON u."departmentId" = d.id;

-- Get complaints by status
SELECT status, COUNT(*) 
FROM "Complaint" 
GROUP BY status;
```

---

**Last Updated**: December 16, 2025
**Status**: ✅ All systems operational
