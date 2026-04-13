import { config } from 'dotenv'
import { neon } from '@neondatabase/serverless'

config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

async function migrate() {
  console.log('Running migrations...')

  await sql`
    CREATE TABLE IF NOT EXISTS vote_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      viarezo_sub TEXT UNIQUE NOT NULL,
      prenom TEXT NOT NULL DEFAULT '',
      promo_type TEXT NOT NULL DEFAULT 'Other',
      voter_category TEXT NOT NULL DEFAULT 'other',
      voted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      ip_hash TEXT
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS project_votes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id UUID NOT NULL REFERENCES vote_sessions(id) ON DELETE CASCADE,
      project_id TEXT NOT NULL,
      rank INTEGER NOT NULL,
      weight INTEGER NOT NULL,
      UNIQUE(session_id, project_id),
      UNIQUE(session_id, rank)
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS ong_votes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id UUID NOT NULL REFERENCES vote_sessions(id) ON DELETE CASCADE,
      ong_id TEXT NOT NULL,
      rank INTEGER NOT NULL,
      weight INTEGER NOT NULL,
      UNIQUE(session_id, ong_id),
      UNIQUE(session_id, rank)
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS audit_log (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event TEXT NOT NULL,
      sub_hash TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      metadata TEXT
    )
  `

  console.log('✅ Migrations complete')
}

migrate().catch(console.error)
