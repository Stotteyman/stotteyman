import { neon } from '@neondatabase/serverless'

let sql: any = null

export default function getDB() {
  if (!sql) {
    const databaseUrl = process.env['DATABASE_URL']
    if (!databaseUrl) {
      // Return a mock function for build time
      return {
        query: () => Promise.resolve([]),
        execute: () => Promise.resolve([]),
        transaction: () => Promise.resolve([])
      }
    }
    sql = neon(databaseUrl)
  }
  return sql
}

// Export the function for direct usage
export { getDB }