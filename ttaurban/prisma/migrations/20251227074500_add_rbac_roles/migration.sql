-- Step 1: Add new enum values (must be in separate transactions in PostgreSQL)
DO $$
BEGIN
    -- Add EDITOR if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type t 
                   JOIN pg_enum e ON t.oid = e.enumtypid  
                   JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
                   WHERE n.nspname = 'public' 
                   AND t.typname = 'UserRole' 
                   AND e.enumlabel = 'EDITOR') THEN
        ALTER TYPE "UserRole" ADD VALUE 'EDITOR';
    END IF;
END$$;

COMMIT;

-- Step 2: Add VIEWER
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t 
                   JOIN pg_enum e ON t.oid = e.enumtypid  
                   JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
                   WHERE n.nspname = 'public' 
                   AND t.typname = 'UserRole' 
                   AND e.enumlabel = 'VIEWER') THEN
        ALTER TYPE "UserRole" ADD VALUE 'VIEWER';
    END IF;
END$$;

COMMIT;

-- Step 3: Add USER
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t 
                   JOIN pg_enum e ON t.oid = e.enumtypid  
                   JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
                   WHERE n.nspname = 'public' 
                   AND t.typname = 'UserRole' 
                   AND e.enumlabel = 'USER') THEN
        ALTER TYPE "UserRole" ADD VALUE 'USER';
    END IF;
END$$;

COMMIT;

-- Step 4: Update default value
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';

-- Step 5: Create mapping for legacy roles (optional, for data migration)
-- If you have existing CITIZEN users, you can map them to USER
-- UPDATE "users" SET "role" = 'USER' WHERE "role" = 'CITIZEN';
-- UPDATE "users" SET "role" = 'EDITOR' WHERE "role" = 'OFFICER';
