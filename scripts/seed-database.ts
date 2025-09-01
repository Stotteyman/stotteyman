import sql from '../lib/db'
import { sampleReferrals } from '../lib/seed-data'

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...')

    // Insert sample referrals
    console.log('📝 Inserting sample referrals...')
    for (const referral of sampleReferrals) {
      await sql`
        INSERT INTO referrals (title, description, url, category, commission_rate, requirements, status)
        VALUES (${referral.title}, ${referral.description}, ${referral.url}, ${referral.category}, ${referral.commission_rate}, ${referral.requirements}, ${referral.status})
        ON CONFLICT DO NOTHING
      `
    }

    // Create a default admin user if it doesn't exist
    console.log('👤 Creating default admin user...')
    await sql`
      INSERT INTO users (email, name, role)
      VALUES ('admin@stotteyman.com', 'Admin User', 'owner')
      ON CONFLICT (email) DO NOTHING
    `

    // Insert sample blog posts
    console.log('📰 Inserting sample blog posts...')
    const samplePosts = [
      {
        title: 'Welcome to Stotteyman Enterprises',
        slug: 'welcome-to-stotteyman-enterprises',
        content: 'Welcome to our new platform! We\'re excited to share our vision and opportunities with you.',
        excerpt: 'An introduction to Stotteyman Enterprises and our mission.',
        status: 'published'
      },
      {
        title: 'How to Maximize Your Referral Earnings',
        slug: 'maximize-referral-earnings',
        content: 'Learn the best strategies to maximize your earnings through our referral program.',
        excerpt: 'Tips and strategies for earning more through referrals.',
        status: 'published'
      }
    ]

    for (const post of samplePosts) {
      await sql`
        INSERT INTO blog_posts (title, slug, content, excerpt, status, author_id)
        SELECT ${post.title}, ${post.slug}, ${post.content}, ${post.excerpt}, ${post.status}, id
        FROM users WHERE email = 'admin@stotteyman.com'
        ON CONFLICT (slug) DO NOTHING
      `
    }

    console.log('✅ Database seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedDatabase()
}

export default seedDatabase