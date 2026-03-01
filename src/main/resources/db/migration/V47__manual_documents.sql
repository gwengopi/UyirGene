CREATE TABLE IF NOT EXISTS manual_document (
    id                  BIGSERIAL PRIMARY KEY,
    course_id           BIGINT REFERENCES course(id) ON DELETE CASCADE,
    flagship_program_id BIGINT REFERENCES flagship_program(id) ON DELETE CASCADE,
    label               VARCHAR(200) NOT NULL DEFAULT 'Document',
    file_name           VARCHAR(255) NOT NULL,
    file_size           BIGINT,
    content_type        VARCHAR(100),
    file_data           BYTEA NOT NULL,
    display_order       INT NOT NULL DEFAULT 0,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_manual_entity CHECK (
        (course_id IS NOT NULL AND flagship_program_id IS NULL) OR
        (course_id IS NULL  AND flagship_program_id IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_manual_course     ON manual_document(course_id);
CREATE INDEX IF NOT EXISTS idx_manual_flagship   ON manual_document(flagship_program_id);
