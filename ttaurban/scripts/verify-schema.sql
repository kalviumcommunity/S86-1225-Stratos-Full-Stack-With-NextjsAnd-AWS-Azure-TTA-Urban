-- Verify Schema Deployment
-- This SQL script verifies that all expected tables exist

DO $$
DECLARE
    table_count INTEGER;
BEGIN
    -- Count tables in public schema
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name NOT LIKE '_prisma%';
    
    RAISE NOTICE 'Found % tables in public schema', table_count;
    
    -- List all tables
    RAISE NOTICE 'Tables:';
    FOR rec IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
    LOOP
        RAISE NOTICE '  - %', rec.table_name;
    END LOOP;
END $$;

-- Verify key tables exist
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'User') 
        THEN '✓ User table exists'
        ELSE '✗ User table missing'
    END as user_check,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Complaint') 
        THEN '✓ Complaint table exists'
        ELSE '✗ Complaint table missing'
    END as complaint_check,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Department') 
        THEN '✓ Department table exists'
        ELSE '✗ Department table missing'
    END as department_check;
