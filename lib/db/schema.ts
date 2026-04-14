import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

export const voteSessions = pgTable('vote_sessions', {
  id:            uuid('id').primaryKey().defaultRandom(),
  viarezоSub:   text('viarezo_sub').unique().notNull(),
  prenom:        text('prenom').notNull().default(''),
  nom:           text('nom').notNull().default(''),
  email:         text('email').notNull().default(''),
  promoType:     text('promo_type').notNull().default('Other'),
  voterCategory: text('voter_category').notNull().default('other'),
  votedAt:       timestamp('voted_at', { withTimezone: true }).defaultNow().notNull(),
  ipHash:        text('ip_hash'),
})

export const projectVotes = pgTable(
  'project_votes',
  {
    id:        uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => voteSessions.id, { onDelete: 'cascade' }),
    projectId: text('project_id').notNull(),
    rank:      integer('rank').notNull(),
    weight:    integer('weight').notNull(),
  },
  (t) => [
    uniqueIndex('project_votes_session_project_idx').on(t.sessionId, t.projectId),
    uniqueIndex('project_votes_session_rank_idx').on(t.sessionId, t.rank),
  ],
)

export const ongVotes = pgTable(
  'ong_votes',
  {
    id:        uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => voteSessions.id, { onDelete: 'cascade' }),
    ongId:     text('ong_id').notNull(),
    rank:      integer('rank').notNull(),
    weight:    integer('weight').notNull(),
  },
  (t) => [
    uniqueIndex('ong_votes_session_ong_idx').on(t.sessionId, t.ongId),
    uniqueIndex('ong_votes_session_rank_idx').on(t.sessionId, t.rank),
  ],
)

export const auditLog = pgTable('audit_log', {
  id:        uuid('id').primaryKey().defaultRandom(),
  event:     text('event').notNull(),
  subHash:   text('sub_hash'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  metadata:  text('metadata'),
})
