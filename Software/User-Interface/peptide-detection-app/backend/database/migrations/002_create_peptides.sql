CREATE TABLE peptides (
  id                  SERIAL       PRIMARY KEY,
  uuid                UUID         DEFAULT uuid_generate_v4() UNIQUE,
  name                VARCHAR(255) NOT NULL,
  sequence            TEXT         NOT NULL,
  molecular_weight    DECIMAL(10,4),
  chemical_formula    TEXT,
  classification      VARCHAR(100),
  danger_level        VARCHAR(50)  DEFAULT 'safe'
                                   CHECK (danger_level IN ('safe', 'low', 'medium', 'high', 'critical', 'unknown')),
  description         TEXT,
  reference_spectrum  JSONB,
  active              BOOLEAN      DEFAULT true,
  created_at          TIMESTAMP    DEFAULT NOW(),
  updated_at          TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX idx_peptides_name           ON peptides(name);
CREATE INDEX idx_peptides_sequence       ON peptides(sequence);
CREATE INDEX idx_peptides_danger_level   ON peptides(danger_level);
CREATE INDEX idx_peptides_classification ON peptides(classification);
CREATE INDEX idx_peptides_active         ON peptides(active);
