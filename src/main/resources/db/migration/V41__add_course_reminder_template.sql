INSERT INTO mail_template (template_key, display_name, subject, content, available_variables) VALUES
('course-reminder', 'Course Completion Reminder',
 'Don''t forget to complete: {{courseTitle}}',
 'You''re enrolled in this course but haven''t completed it yet. Pick up where you left off — your progress is waiting!',
 '{{name}}, {{courseTitle}}, {{courseCode}}, {{courseUrl}}, {{dashboardUrl}}, {{appName}}');
