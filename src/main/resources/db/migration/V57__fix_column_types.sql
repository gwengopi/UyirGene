-- Fix type mismatches between Java entities (ddl-auto=update adds these silently)
-- and PostgreSQL schema (ddl-auto=validate is strict about types).

-- 1. flagship_program.price: NUMERIC(10,2) -> DOUBLE PRECISION
--    (Java field is Double, Hibernate expects float8 / DOUBLE PRECISION)
ALTER TABLE flagship_program
    ALTER COLUMN price TYPE DOUBLE PRECISION USING price::DOUBLE PRECISION;

-- 2. flagship_program_price.amount: NUMERIC(10,2) -> DOUBLE PRECISION
ALTER TABLE flagship_program_price
    ALTER COLUMN amount TYPE DOUBLE PRECISION USING amount::DOUBLE PRECISION;

-- 3. video_progress.last_position_seconds: INTEGER -> BIGINT
--    (Java field is Long, Hibernate expects int8 / BIGINT)
ALTER TABLE video_progress
    ALTER COLUMN last_position_seconds TYPE BIGINT USING last_position_seconds::BIGINT;
