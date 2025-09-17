const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

// Database connection
const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

async function initializeAdmin() {
  if (!sql) {
    console.error('Database not configured. Please set DATABASE_URL environment variable.');
    process.exit(1);
  }

  try {
    console.log('Initializing admin user...');
    
    // Check if admin already exists
    const existingAdmin = await sql`
      SELECT id FROM admin_users WHERE username = 'admin'
    `;
    
    if (existingAdmin.length > 0) {
      console.log('Admin user already exists');
      return;
    }
    
    // Hash the password
    const passwordHash = await bcrypt.hash('admin1234', 12);
    
    // Create admin user
    const [admin] = await sql`
      INSERT INTO admin_users (username, password_hash, email, role)
      VALUES ('admin', ${passwordHash}, 'admin@stotteyman.com', 'admin')
      RETURNING id, username, email, role, created_at
    `;
    
    console.log('✅ Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin1234');
    console.log('Email: admin@stotteyman.com');
    console.log('Admin ID:', admin.id);
    
  } catch (error) {
    console.error('❌ Failed to initialize admin user:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeAdmin();


