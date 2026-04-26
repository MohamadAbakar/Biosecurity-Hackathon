CREATE TABLE sensor_readings (
  id               SERIAL       PRIMARY KEY,
  uuid             UUID         DEFAULT uuid_generate_v4() UNIQUE,
  session_id       INTEGER      REFERENCES analysis_sessions(id),
  timestamp        TIMESTAMP    DEFAULT NOW(),
  raw_data         JSONB,
  processed_data   JSONB,
  confidence_score DECIMAL(5,4) DEFAULT 0,
  created_at       TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE analysis_results (
  id                  SERIAL       PRIMARY KEY,
  uuid                UUID         DEFAULT uuid_generate_v4() UNIQUE,
  session_id          INTEGER      REFERENCES analysis_sessions(id),
  peptide_id          INTEGER      REFERENCES peptides(id),
  match_percentage    DECIMAL(5,2),
  confidence_level    DECIMAL(5,4),
  detected_at         TIMESTAMP    DEFAULT NOW(),
  alert_triggered     BOOLEAN      DEFAULT FALSE,
  verification_status VARCHAR(50)  DEFAULT 'pending'
                                   CHECK (verification_status IN ('pending', 'confirmed', 'rejected')),
  created_at          TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE alerts (
  id               SERIAL      PRIMARY KEY,
  uuid             UUID        DEFAULT uuid_generate_v4() UNIQUE,
  session_id       INTEGER     REFERENCES analysis_sessions(id),
  alert_type       VARCHAR(50) CHECK (alert_type IN ('detection', 'system_error', 'maintenance', 'security')),
  severity         VARCHAR(50) CHECK (severity IN ('info', 'warning', 'critical')),
  message          TEXT        NOT NULL,
  acknowledged     BOOLEAN     DEFAULT FALSE,
  acknowledged_by  INTEGER     REFERENCES users(id),
  acknowledged_at  TIMESTAMP,
  created_at       TIMESTAMP   DEFAULT NOW()
);

CREATE INDEX idx_readings_session    ON sensor_readings(session_id);
CREATE INDEX idx_readings_timestamp  ON sensor_readings(timestamp);
CREATE INDEX idx_results_session     ON analysis_results(session_id);
CREATE INDEX idx_results_peptide     ON analysis_results(peptide_id);
CREATE INDEX idx_alerts_session      ON alerts(session_id);
CREATE INDEX idx_alerts_severity     ON alerts(severity);
