CREATE TABLE flagship_program_course (
    flagship_program_id BIGINT NOT NULL REFERENCES flagship_program(id) ON DELETE CASCADE,
    course_id           BIGINT NOT NULL REFERENCES course(id) ON DELETE CASCADE,
    display_order       INT    NOT NULL DEFAULT 0,
    PRIMARY KEY (flagship_program_id, course_id)
);
