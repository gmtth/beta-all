CREATE TABLE IF NOT EXISTS `oauth_settings` (
  `setting_key` text PRIMARY KEY NOT NULL,
  `setting_value` integer NOT NULL CHECK (`setting_value` BETWEEN 60000 AND 2592000000)
);
--> statement-breakpoint
INSERT OR IGNORE INTO `oauth_settings` (`setting_key`, `setting_value`)
VALUES ('access_token_lifetime_ms', 2592000000);
