CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id                  SERIAL       PRIMARY KEY,
  uuid                UUID         DEFAULT uuid_generate_v4() UNIQUE,
  username            VARCHAR(100) UNIQUE NOT NULL,
  email               VARCHAR(255) UNIQUE NOT NULL,
  password_hash       VARCHAR(255) NOT NULL,
  first_name          VARCHAR(100),
  last_name           VARCHAR(100),
  role                VARCHAR(50)  DEFAULT 'operator'
                                   CHECK (role IN ('operator', 'supervisor', 'admin')),
  security_clearance  VARCHAR(50),
  active              BOOLEAN      DEFAULT true,
  last_login          TIMESTAMP,
  created_at          TIMESTAMP    DEFAULT NOW(),
  updated_at          TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email    ON users(email);
CREATE INDEX idx_users_role     ON users(role);
