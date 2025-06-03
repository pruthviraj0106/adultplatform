-- Drop existing admin table
DROP TABLE IF EXISTS admin CASCADE;

-- Create admin table
CREATE TABLE IF NOT EXISTS admin (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL
);

-- Insert new admin user with fresh password hash (password: admin123)
INSERT INTO admin (username, password) 
VALUES ('superadmin', '$2b$12$442XBgfbkerdHmewr4WYGu2nOoyxrIWKR4gu4ES0JFy1Yfq/33iTi')
ON CONFLICT (username) DO NOTHING;

-- Verify the admin user was created
SELECT * FROM admin;

CREATE TABLE "sessions" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "sessions" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid");

CREATE INDEX "IDX_sessions_expire" ON "sessions" ("expire"); 