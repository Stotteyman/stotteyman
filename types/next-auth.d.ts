import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: 'user' | 'moderator' | 'admin' | 'owner'
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role: 'user' | 'moderator' | 'admin' | 'owner'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'user' | 'moderator' | 'admin' | 'owner'
  }
}