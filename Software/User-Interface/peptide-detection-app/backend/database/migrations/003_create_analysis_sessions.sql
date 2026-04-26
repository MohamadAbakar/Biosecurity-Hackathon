CREATE TABLE analysis_sessions (
  id           SERIAL       PRIMARY KEY,
  uuid         UUID         DEFAULT uuid_generate_v4() UNIQUE,
  session_name VARCHAR(255),
  operator_id  INTEGER      REFERENCES users(id),
  device_id    VARCHAR(100),
  status       VARCHAR(50)  DEFAULT 'running'
                            CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  started_at   TIMESTAMP    DEFAULT NOW(),
  ended_at     TIMESTAMP,
  notes        TEXT,
  created_at   TIMESTAMP    DEFAULT NOW(),
  updated_at   TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX idx_sessions_operator   ON analysis_sessions(operator_id);
CREATE INDEX idx_sessions_status     ON analysis_sessions(status);
CREATE INDEX idx_sessions_started_at ON analysis_sessions(started_at);
