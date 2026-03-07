-- Google OAuth users have no password — make the column nullable
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
