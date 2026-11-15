CREATE TABLE IF NOT EXISTS game_scores (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_slug TEXT NOT NULL CHECK (game_slug IN ('neon-stickman-ninja', 'neon-stickman-parkour')),
  score BIGINT NOT NULL CHECK (score >= 0 AND score <= 1000000000),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE game_scores DROP CONSTRAINT IF EXISTS game_scores_user_game_unique;
CREATE UNIQUE INDEX IF NOT EXISTS game_scores_user_game_idx
  ON game_scores (user_id, game_slug);
CREATE INDEX IF NOT EXISTS game_scores_leaderboard_idx
  ON game_scores (game_slug, score DESC, updated_at ASC);
