CREATE TABLE mail_template (
    id BIGSERIAL PRIMARY KEY,
    template_key VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(200) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    available_variables VARCHAR(1000),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO mail_template (template_key, display_name, subject, content, available_variables) VALUES
('enrollment-success', 'Enrollment Success',
 'Welcome! You''re enrolled in: {{courseTitle}}',
 'Congratulations! You have successfully enrolled in your new course. You can start learning right away by clicking the button below.',
 '{{name}}, {{courseTitle}}, {{courseCode}}, {{trainerName}}, {{appName}}'),
('course-completion', 'Course Completion',
 'Congratulations! You''ve completed: {{courseTitle}}',
 'Excellent work! You have successfully completed your course. Your dedication and hard work have paid off!',
 '{{name}}, {{courseTitle}}, {{marks}}, {{certificateType}}, {{appName}}'),
('certificate-ready', 'Certificate Ready',
 'Your Certificate is Ready: {{courseTitle}}',
 'Great news! Your certificate is now ready for download. You can also verify it using the certificate ID below.',
 '{{name}}, {{courseTitle}}, {{certificateId}}, {{issuedDate}}, {{certificateType}}, {{appName}}'),
('result-published', 'Result Published',
 'Your Results are Published: {{courseTitle}}',
 'Your assessment results have been published. Click below to view your score and download your certificate.',
 '{{name}}, {{courseTitle}}, {{marks}}, {{certificateType}}, {{appName}}');
