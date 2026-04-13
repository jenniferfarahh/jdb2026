import { Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import * as schema from './schema'

// Uses @neondatabase/serverless WebSocket driver — supports db.transaction()
// Node.js 21+ has native WebSocket, no polyfill needed.
const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
export const db = drizzle(pool, { schema })
