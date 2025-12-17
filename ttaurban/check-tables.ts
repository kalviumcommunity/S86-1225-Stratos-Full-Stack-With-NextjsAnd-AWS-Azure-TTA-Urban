import pg from "pg";

const pool = new pg.Pool({
  connectionString: "postgresql://postgres:sravani08@localhost:5432/urban",
});

async function checkTables() {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log("\n📋 Tables in 'urban' database:");
    if (result.rows.length === 0) {
      console.log("   ❌ NO TABLES FOUND!");
    } else {
      result.rows.forEach((row) => {
        console.log(`   ✓ ${row.table_name}`);
      });
    }

    // Also check if there are any schemas
    const schemas = await pool.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema')
      ORDER BY schema_name;
    `);

    console.log("\n📂 Schemas in database:");
    schemas.rows.forEach((row) => {
      console.log(`   - ${row.schema_name}`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await pool.end();
  }
}

checkTables();
