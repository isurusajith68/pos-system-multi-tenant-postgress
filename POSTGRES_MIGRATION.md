# SQLite to PostgreSQL Migration Guide

This document outlines the steps to complete the migration from SQLite to PostgreSQL for this POS system.

## Changes Made

The following files have been updated to support PostgreSQL:

### 1. **src/main/lib/prisma.ts**
- Removed SQLite file path logic
- Now uses `DATABASE_URL` environment variable for PostgreSQL connection
- Prisma client no longer requires datasource configuration (uses schema.prisma settings)

### 2. **src/main/lib/migration.ts**
- Updated table queries from SQLite's `sqlite_master` to PostgreSQL's `information_schema.tables`
- Changed migration table structure to use PostgreSQL data types (VARCHAR, TIMESTAMP instead of TEXT, DATETIME)
- Simplified migration approach to use Prisma's built-in migration system

### 3. **src/main/lib/database-init.ts**
- Removed file-based database logic (no more file path checks)
- Updated table existence checks to use PostgreSQL queries
- Simplified initialization for PostgreSQL

### 4. **prisma/schema.prisma**
- Already configured for PostgreSQL (`provider = "postgresql"`)
- Uses `@default(cuid())` for IDs which is PostgreSQL compatible

## Migration Steps

### Step 1: Set up PostgreSQL Database

1. **Install PostgreSQL** if not already installed:
   - Download from https://www.postgresql.org/download/
   - Or use Docker: `docker run --name pos-postgres -e POSTGRES_PASSWORD=yourpassword -p 5432:5432 -d postgres`

2. **Create a database** for your POS system:
   ```sql
   CREATE DATABASE pos_system;
   ```

3. **Create a database user** (optional but recommended):
   ```sql
   CREATE USER pos_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE pos_system TO pos_user;
   ```

### Step 2: Configure Environment Variables

Create or update your `.env` file in the project root:

```env
# PostgreSQL Connection String
DATABASE_URL="postgresql://pos_user:your_secure_password@localhost:5432/pos_system?schema=public"

# Alternative format if using default postgres user:
# DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/pos_system?schema=public"
```

**Connection String Format:**
```
postgresql://[user]:[password]@[host]:[port]/[database]?schema=public
```

### Step 3: Run Prisma Migrations

1. **Generate Prisma Client** for PostgreSQL:
   ```bash
   npx prisma generate
   ```

2. **Create initial migration** (if starting fresh):
   ```bash
   npx prisma migrate dev --name init
   ```

   OR **Deploy existing migrations** (if you have migration files):
   ```bash
   npx prisma migrate deploy
   ```

3. **Verify the migration**:
   ```bash
   npx prisma studio
   ```
   This opens a GUI to browse your PostgreSQL database.

### Step 4: Migrate Data (if you have existing SQLite data)

If you need to migrate data from your existing SQLite database:

1. **Export data from SQLite**:
   ```bash
   npx prisma db pull --schema=prisma/schema.sqlite.prisma
   ```

2. **Use a migration tool** like:
   - [pgloader](https://pgloader.io/) - Automated migration tool
   - Custom migration script
   - Manual export/import via CSV

3. **Example using a custom script**:
   ```typescript
   // migrate-data.ts
   import { PrismaClient as SQLiteClient } from './prisma/client-sqlite'
   import { PrismaClient as PostgresClient } from './prisma/client-postgres'

   async function migrateData() {
     const sqlite = new SQLiteClient()
     const postgres = new PostgresClient()

     // Migrate products
     const products = await sqlite.product.findMany()
     await postgres.product.createMany({ data: products })

     // Repeat for other tables...
   }
   ```

### Step 5: Update Production Configuration

For production deployments:

1. **Set environment variables** on your server/hosting platform
2. **Run migrations** as part of deployment:
   ```bash
   npx prisma migrate deploy
   ```

3. **For Electron app distribution**:
   - Update build scripts to exclude SQLite files
   - Ensure PostgreSQL connection string is configurable
   - Consider using a cloud PostgreSQL service (AWS RDS, Heroku Postgres, etc.)

## Testing

1. **Test database connection**:
   ```bash
   npx prisma db push
   ```

2. **Run the application**:
   ```bash
   npm run dev
   ```

3. **Verify all features work**:
   - Product management
   - Sales transactions
   - Reports
   - User authentication

## Troubleshooting

### Connection Issues

**Error: "Can't reach database server"**
- Check PostgreSQL is running: `pg_isready` or `docker ps`
- Verify connection string in `.env`
- Check firewall settings

**Error: "Authentication failed"**
- Verify username and password in connection string
- Check PostgreSQL user permissions

### Migration Issues

**Error: "Migration failed"**
- Check PostgreSQL version compatibility (Prisma supports PostgreSQL 9.6+)
- Review migration SQL files in `prisma/migrations/`
- Try resetting: `npx prisma migrate reset` (WARNING: deletes all data)

### Data Type Issues

If you encounter data type mismatches:
- Review the schema.prisma file
- PostgreSQL is stricter about data types than SQLite
- May need to adjust field types (e.g., `Float` vs `Decimal`)

## Rollback Plan

If you need to rollback to SQLite:

1. Keep a backup of your SQLite database file
2. Revert the code changes in git:
   ```bash
   git checkout HEAD~3 src/main/lib/prisma.ts
   git checkout HEAD~3 src/main/lib/migration.ts
   git checkout HEAD~3 src/main/lib/database-init.ts
   ```
3. Update schema.prisma provider back to `sqlite`
4. Run `npx prisma generate`

## Benefits of PostgreSQL

- **Better concurrency**: Multiple users can access simultaneously
- **ACID compliance**: Better data integrity
- **Advanced features**: Full-text search, JSON support, etc.
- **Scalability**: Handles larger datasets better
- **Production-ready**: Industry standard for production applications

## Next Steps

1. Set up automated backups for PostgreSQL
2. Configure connection pooling for better performance
3. Set up monitoring and logging
4. Consider read replicas for scaling

## Support

For issues or questions:
- Prisma Documentation: https://www.prisma.io/docs
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Project repository issues
