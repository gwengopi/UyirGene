INSERT INTO mail_template (template_key, display_name, subject, content, available_variables)
VALUES (
    'payment-failed',
    'Payment Failed',
    'Payment Failed: {{courseTitle}}',
    'We''re sorry, your payment could not be processed. Please try again using the button below.',
    '{{name}}, {{courseTitle}}, {{reason}}, {{retryUrl}}, {{appName}}'
)
ON CONFLICT (template_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    subject = EXCLUDED.subject,
    content = EXCLUDED.content,
    available_variables = EXCLUDED.available_variables;
