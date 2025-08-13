-- Initialize the uptail_guidelines database
-- This script runs automatically when the PostgreSQL container starts

-- Create the database if it doesn't exist
-- Note: The database is already created by POSTGRES_DB environment variable
-- This script can be used for additional setup if needed

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE uptail_guidelines TO uptail_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO uptail_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO uptail_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO uptail_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO uptail_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO uptail_user;
