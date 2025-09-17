#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_eV6EhsW7OHDT@ep-flat-shadow-aeydq17l-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require';
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }

  console.log('🔌 Connecting to Neon database...');
  
  try {
    const sql = neon(databaseUrl);
    
    // Test connection
    await sql`SELECT 1`;
    console.log('✅ Database connection successful');
    
    // Read schema file
    const schemaPath = path.join(__dirname, '..', 'lib', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📄 Applying database schema...');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    // Execute each statement using raw SQL
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          // Use raw SQL execution with proper escaping
          await sql([statement]);
          console.log(`✅ Executed: ${statement.substring(0, 50)}...`);
        } catch (error) {
          // Ignore errors for statements that might already exist
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate key') ||
              error.message.includes('already exists')) {
            console.log(`⚠️  Skipped (already exists): ${statement.substring(0, 50)}...`);
          } else {
            console.error(`❌ Error executing statement: ${error.message}`);
            console.error(`Statement: ${statement}`);
            throw error;
          }
        }
      }
    }
    
    console.log('🎉 Database setup completed successfully!');
    
    // Verify tables were created
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('📊 Created tables:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
