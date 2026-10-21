ALTER TABLE `oauth_tokens` ADD COLUMN `family_id` text;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `oauth_refresh_tokens` (
  `token_hash` text PRIMARY KEY NOT NULL,
  `family_id` text NOT NULL,
  `client_id` text NOT NULL,
  `user_id` text NOT NULL,
  `user_email` text NOT NULL,
  `scope` text NOT NULL,
  `resource` text NOT NULL,
  `expires_at` integer NOT NULL,
  `created_at` integer NOT NULL,
  `consumed_at` integer,
  `replaced_by_hash` text,
  `revoked_at` integer
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `oauth_refresh_tokens_family_idx` ON `oauth_refresh_tokens` (`family_id`);
