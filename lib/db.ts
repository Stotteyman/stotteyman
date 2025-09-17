import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Database connection is optional - app will work in fallback mode without it
export const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

// Database connection wrapper with error handling
export async function connectDB() {
  if (!sql) {
    console.warn('Database not configured - running in fallback mode');
    return false;
  }
  try {
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Player management
export interface Player {
  id: string;
  created_at: Date;
  nickname?: string;
  intro_seen: boolean;
  personality_preset?: any;
  last_seen?: Date;
}

export async function createPlayer(nickname?: string): Promise<Player> {
  if (!sql) {
    // Fallback: return a mock player
    return {
      id: 'fallback-player-' + Date.now(),
      created_at: new Date(),
      nickname: nickname || 'Anonymous',
      intro_seen: false,
    };
  }
  const [player] = await sql`
    INSERT INTO players (nickname, intro_seen)
    VALUES (${nickname || null}, false)
    RETURNING *
  `;
  return player as Player;
}

export async function getPlayer(id: string): Promise<Player | null> {
  if (!sql) {
    // Fallback: return a mock player
    return {
      id: id,
      created_at: new Date(),
      nickname: 'Anonymous',
      intro_seen: false,
    };
  }
  const [player] = await sql`
    SELECT * FROM players WHERE id = ${id}
  `;
  return (player as Player) || null;
}

export async function updatePlayerIntroSeen(playerId: string): Promise<void> {
  if (!sql) {
    console.log('Database not available - skipping intro seen update');
    return;
  }
  await sql`
    UPDATE players 
    SET intro_seen = true, last_seen = NOW()
    WHERE id = ${playerId}
  `;
}

// Session management
export interface Session {
  id: string;
  player_id: string;
  started_at: Date;
  ended_at?: Date;
  device_type?: 'desktop' | 'mobile';
  user_agent?: string;
}

export async function createSession(
  playerId: string,
  deviceType?: 'desktop' | 'mobile',
  userAgent?: string
): Promise<Session> {
  if (!sql) {
    // Fallback: return a mock session
    return {
      id: 'fallback-session-' + Date.now(),
      player_id: playerId,
      started_at: new Date(),
      device_type: deviceType,
      user_agent: userAgent,
    };
  }
  const [session] = await sql`
    INSERT INTO sessions (player_id, device_type, user_agent)
    VALUES (${playerId}, ${deviceType || null}, ${userAgent || null})
    RETURNING *
  `;
  return session as Session;
}

export async function endSession(sessionId: string): Promise<void> {
  if (!sql) {
    console.log('Database not available - skipping session end');
    return;
  }
  await sql`
    UPDATE sessions 
    SET ended_at = NOW()
    WHERE id = ${sessionId}
  `;
}

// Turn management
export interface Turn {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: any;
  options_shown?: any;
  chosen_option?: number;
  emotion?: any;
  created_at: Date;
}

export async function createTurn(turn: Omit<Turn, 'id' | 'created_at'>): Promise<Turn> {
  if (!sql) {
    // Fallback: return a mock turn
    return {
      id: 'fallback-turn-' + Date.now(),
      ...turn,
      created_at: new Date(),
    };
  }
  const [newTurn] = await sql`
    INSERT INTO turns (session_id, role, content, options_shown, chosen_option, emotion)
    VALUES (${turn.session_id}, ${turn.role}, ${JSON.stringify(turn.content)}, 
            ${turn.options_shown ? JSON.stringify(turn.options_shown) : null},
            ${turn.chosen_option || null},
            ${turn.emotion ? JSON.stringify(turn.emotion) : null})
    RETURNING *
  `;
  return newTurn as Turn;
}

export async function getRecentTurns(sessionId: string, limit = 10): Promise<Turn[]> {
  if (!sql) {
    return []; // Fallback: return empty array
  }
  const turns = await sql`
    SELECT * FROM turns 
    WHERE session_id = ${sessionId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return (turns as Turn[]).reverse(); // Return in chronological order
}

// Memory management
export interface Memory {
  id: string;
  player_id: string;
  key: string;
  value: any;
  updated_at: Date;
}

export async function setMemory(playerId: string, key: string, value: any): Promise<void> {
  if (!sql) {
    console.log('Database not available - skipping memory storage');
    return;
  }
  await sql`
    INSERT INTO memory (player_id, key, value)
    VALUES (${playerId}, ${key}, ${JSON.stringify(value)})
    ON CONFLICT (player_id, key) 
    DO UPDATE SET value = ${JSON.stringify(value)}, updated_at = NOW()
  `;
}

export async function getMemory(playerId: string, key: string): Promise<any> {
  if (!sql) {
    return null; // Fallback: return null
  }
  const [memory] = await sql`
    SELECT value FROM memory 
    WHERE player_id = ${playerId} AND key = ${key}
  `;
  return memory?.value || null;
}

export async function getAllMemories(playerId: string): Promise<Memory[]> {
  if (!sql) {
    return []; // Fallback: return empty array
  }
  const memories = await sql`
    SELECT * FROM memory 
    WHERE player_id = ${playerId}
    ORDER BY updated_at DESC
  `;
  return memories as Memory[];
}

// Flag management
export interface Flag {
  id: string;
  player_id?: string;
  flag_name: string;
  flag_value: any;
  created_at: Date;
  updated_at: Date;
}

export async function setFlag(playerId: string | null, flagName: string, flagValue: any): Promise<void> {
  if (!sql) {
    console.log('Database not available - skipping flag storage');
    return;
  }
  await sql`
    INSERT INTO flags (player_id, flag_name, flag_value)
    VALUES (${playerId}, ${flagName}, ${JSON.stringify(flagValue)})
    ON CONFLICT (player_id, flag_name) 
    DO UPDATE SET flag_value = ${JSON.stringify(flagValue)}, updated_at = NOW()
  `;
}

export async function getFlag(playerId: string | null, flagName: string): Promise<any> {
  if (!sql) {
    return null; // Fallback: return null
  }
  const [flag] = await sql`
    SELECT flag_value FROM flags 
    WHERE player_id = ${playerId} AND flag_name = ${flagName}
  `;
  return flag?.flag_value || null;
}

// Admin authentication
export interface AdminUser {
  id: string;
  username: string;
  email?: string;
  role: string;
  is_active: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface AdminSession {
  id: string;
  admin_id: string;
  token_hash: string;
  expires_at: Date;
  created_at: Date;
  is_revoked: boolean;
}

// JWT secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'stotteyman-admin-secret-key-2024';
const JWT_EXPIRES_IN = '24h';

export async function createAdminUser(username: string, password: string, email?: string): Promise<AdminUser> {
  if (!sql) {
    throw new Error('Database not configured');
  }
  
  const passwordHash = await bcrypt.hash(password, 12);
  
  const [admin] = await sql`
    INSERT INTO admin_users (username, password_hash, email)
    VALUES (${username}, ${passwordHash}, ${email || null})
    RETURNING id, username, email, role, is_active, last_login, created_at, updated_at
  `;
  
  return admin as AdminUser;
}

export async function getAdminByUsername(username: string): Promise<(AdminUser & { password_hash: string }) | null> {
  if (!sql) {
    return null;
  }
  
  const [admin] = await sql`
    SELECT * FROM admin_users 
    WHERE username = ${username} AND is_active = true
  `;
  
  return (admin as (AdminUser & { password_hash: string })) || null;
}

export async function verifyAdminPassword(admin: AdminUser & { password_hash: string }, password: string): Promise<boolean> {
  return await bcrypt.compare(password, admin.password_hash);
}

export async function updateAdminLastLogin(adminId: string): Promise<void> {
  if (!sql) {
    return;
  }
  
  await sql`
    UPDATE admin_users 
    SET last_login = NOW(), updated_at = NOW()
    WHERE id = ${adminId}
  `;
}

export function generateAdminToken(adminId: string, username: string): string {
  return jwt.sign(
    { 
      adminId, 
      username, 
      type: 'admin' 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyAdminToken(token: string): { adminId: string; username: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.type === 'admin') {
      return { adminId: decoded.adminId, username: decoded.username };
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function createAdminSession(adminId: string, token: string): Promise<AdminSession> {
  if (!sql) {
    throw new Error('Database not configured');
  }
  
  const tokenHash = await bcrypt.hash(token, 10);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  const [session] = await sql`
    INSERT INTO admin_sessions (admin_id, token_hash, expires_at)
    VALUES (${adminId}, ${tokenHash}, ${expiresAt.toISOString()})
    RETURNING *
  `;
  
  return session as AdminSession;
}

export async function revokeAdminSession(tokenHash: string): Promise<void> {
  if (!sql) {
    return;
  }
  
  await sql`
    UPDATE admin_sessions 
    SET is_revoked = true
    WHERE token_hash = ${tokenHash}
  `;
}

export async function cleanupExpiredSessions(): Promise<void> {
  if (!sql) {
    return;
  }
  
  await sql`
    DELETE FROM admin_sessions 
    WHERE expires_at < NOW() OR is_revoked = true
  `;
}

// Initialize default admin user
export async function initializeDefaultAdmin(): Promise<void> {
  if (!sql) {
    console.warn('Database not configured - cannot initialize default admin');
    return;
  }
  
  try {
    // Check if admin already exists
    const existingAdmin = await getAdminByUsername('admin');
    if (existingAdmin) {
      console.log('Default admin user already exists');
      return;
    }
    
    // Create default admin user
    await createAdminUser('admin', 'admin1234', 'admin@stotteyman.com');
    console.log('Default admin user created: username=admin, password=admin1234');
  } catch (error) {
    console.error('Failed to initialize default admin:', error);
  }
}
