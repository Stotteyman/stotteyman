#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;
  
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
    
    // Create migrations table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    // Get list of migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      console.log('📁 No migrations directory found, creating...');
      fs.mkdirSync(migrationsDir, { recursive: true });
      console.log('✅ Migrations directory created');
      return;
    }
    
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    if (migrationFiles.length === 0) {
      console.log('📄 No migration files found');
      return;
    }
    
    console.log(`📄 Found ${migrationFiles.length} migration files`);
    
    // Get already executed migrations
    const executedMigrations = await sql`
      SELECT name FROM migrations ORDER BY executed_at
    `;
    const executedNames = new Set(executedMigrations.map(m => m.name));
    
    // Execute pending migrations
    let executedCount = 0;
    
    for (const file of migrationFiles) {
      if (executedNames.has(file)) {
        console.log(`⏭️  Skipping already executed: ${file}`);
        continue;
      }
      
      console.log(`🔄 Executing migration: ${file}`);
      
      const migrationPath = path.join(migrationsDir, file);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      try {
        // Split into statements and execute
        const statements = migrationSQL
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        for (const statement of statements) {
          if (statement.trim()) {
            await sql.unsafe(statement);
          }
        }
        
        // Record migration as executed
        await sql`
          INSERT INTO migrations (name) VALUES (${file})
        `;
        
        console.log(`✅ Migration executed: ${file}`);
        executedCount++;
        
      } catch (error) {
        console.error(`❌ Migration failed: ${file}`, error.message);
        throw error;
      }
    }
    
    if (executedCount === 0) {
      console.log('🎉 All migrations are up to date!');
    } else {
      console.log(`🎉 Executed ${executedCount} migrations successfully!`);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migrations if called directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
