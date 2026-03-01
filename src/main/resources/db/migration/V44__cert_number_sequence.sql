-- V44: Replace site_config certNumberSeq counter with a proper PostgreSQL sequence.
-- PostgreSQL sequences are atomic and completely independent of application-level
-- transactions, JPA sessions, and Spring OSIV — making them the only reliable
-- solution for auto-incrementing certificate numbers across concurrent requests.

CREATE SEQUENCE IF NOT EXISTS cert_number_seq;

-- Seed the sequence from whatever value is currently stored in site_config.
-- SETVAL(seq, N, true) means "last used value was N", so the next NEXTVAL returns N+1.
-- This preserves the existing counter for installations that already generated certificates.
DO $$
DECLARE
    v_current BIGINT;
BEGIN
    SELECT CAST(config_value AS BIGINT)
      INTO v_current
      FROM site_config
     WHERE config_key = 'certNumberSeq';

    IF v_current IS NOT NULL AND v_current > 0 THEN
        PERFORM SETVAL('cert_number_seq', v_current, true);
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- config_value was not numeric or row missing — leave sequence at default start (1)
    NULL;
END $$;
