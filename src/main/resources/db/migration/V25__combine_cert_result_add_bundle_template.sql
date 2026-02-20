-- Remove the separate certificate-ready template (combined into result-published)
DELETE FROM mail_template WHERE template_key = 'certificate-ready';

-- Reset html_body so the initializer re-seeds from the updated classpath template
UPDATE mail_template SET html_body = NULL WHERE template_key = 'result-published';

-- Update result-published to be the combined Results & Certificate email
UPDATE mail_template SET
    display_name       = 'Results & Certificate Ready',
    subject            = 'Your Results are Published & Certificate is Ready: {{courseTitle}}',
    content            = 'Great news! Your results have been published and your certificate is ready for download. Click the button below to view your score and download your certificate.',
    available_variables = '{{name}}, {{courseTitle}}, {{courseCode}}, {{marks}}, {{certificateType}}, {{certificateId}}, {{issuedDate}}, {{verifyUrl}}, {{dashboardUrl}}, {{appName}}'
WHERE template_key = 'result-published';

-- Add bundle enrollment template
INSERT INTO mail_template (template_key, display_name, subject, content, available_variables) VALUES
('bundle-enrollment-success', 'Bundle Enrollment Success',
 'Welcome! You''re enrolled in the bundle: {{bundleTitle}}',
 'Congratulations! You have successfully enrolled in the course bundle. You now have access to all included courses and can start learning right away.',
 '{{name}}, {{bundleTitle}}, {{courseList}}, {{dashboardUrl}}, {{appName}}');
