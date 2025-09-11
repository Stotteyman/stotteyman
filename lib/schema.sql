-- Stotteyman Database Schema
-- Neon Postgres serverless database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  nickname TEXT,
  intro_seen BOOLEAN NOT NULL DEFAULT FALSE,
  personality_preset JSONB,
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  device_type TEXT CHECK (device_type IN ('desktop', 'mobile')),
  user_agent TEXT
);

-- Turns table (conversation history)
CREATE TABLE IF NOT EXISTS turns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content JSONB NOT NULL,
  options_shown JSONB,
  chosen_option INTEGER,
  emotion JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Memory table (AI learning/memory)
CREATE TABLE IF NOT EXISTS memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(player_id, key)
);

-- Analytics/Flags table
CREATE TABLE IF NOT EXISTS flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  flag_name TEXT NOT NULL,
  flag_value JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_player_id ON sessions(player_id);
CREATE INDEX IF NOT EXISTS idx_turns_session_id ON turns(session_id);
CREATE INDEX IF NOT EXISTS idx_turns_created_at ON turns(created_at);
CREATE INDEX IF NOT EXISTS idx_memory_player_id ON memory(player_id);
CREATE INDEX IF NOT EXISTS idx_memory_key ON memory(key);
CREATE INDEX IF NOT EXISTS idx_flags_player_id ON flags(player_id);
CREATE INDEX IF NOT EXISTS idx_flags_name ON flags(flag_name);

-- Insert default personality presets
INSERT INTO players (id, nickname, intro_seen, personality_preset) 
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Stotteyman',
  true,
  '{
    "name": "Stotteyman",
    "description": "A sci-fi hacker/computer entity with a mentor/tech-hustle vibe",
    "traits": ["playful", "actionable", "tech-savvy", "encouraging"],
    "speech_patterns": {
      "greeting": "Hey there, digital wanderer. Ready to level up?",
      "encouragement": "That\'s the spirit! Let\'s hack the system together.",
      "farewell": "Keep coding, keep growing. The matrix awaits."
    },
    "emotion_range": {
      "arousal": [0.3, 0.9],
      "valence": [0.4, 0.8]
    }
  }'
) ON CONFLICT (id) DO NOTHING;
