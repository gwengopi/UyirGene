-- Update bundle enrollment mail template to use "value pack" terminology consistently
UPDATE mail_template SET
    display_name = 'Value Pack Enrollment Success',
    subject      = 'Welcome! You''re enrolled in the value pack: {{bundleTitle}}',
    content      = 'Congratulations! You have successfully enrolled in the value pack. You now have access to all included courses and can start learning right away.'
WHERE template_key = 'bundle-enrollment-success';
