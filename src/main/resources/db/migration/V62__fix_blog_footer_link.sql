-- Fix blog path in footer: /blogs → /blog
UPDATE site_config
SET config_value = '[{"label":"Courses","path":"/courses"},{"label":"About Us","path":"/about"},{"label":"Blog","path":"/blog"},{"label":"Careers","path":"/careers"}]'
WHERE config_key = 'FOOTER_PLATFORM_LINKS';
