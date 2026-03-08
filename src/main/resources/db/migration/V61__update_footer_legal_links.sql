-- Update footer legal links: rename "Terms of Service" to "Terms & Conditions" and remove "Accessibility"
UPDATE site_config
SET config_value = '[{"label":"Terms & Conditions","path":"/terms"},{"label":"Privacy Policy","path":"/privacy"},{"label":"Cookie Policy","path":"/cookies"},{"label":"Refund Policy","path":"/refund"}]'
WHERE config_key = 'FOOTER_LEGAL_LINKS';
