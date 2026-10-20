CREATE TABLE IF NOT EXISTS `oauth_codes` (
  `code_hash` text PRIMARY KEY NOT NULL,
  `client_id` text NOT NULL,
  `redirect_uri` text NOT NULL,
  `user_id` text NOT NULL,
  `scope` text NOT NULL,
  `expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `oauth_tokens` (
  `token_hash` text PRIMARY KEY NOT NULL,
  `client_id` text NOT NULL,
  `user_id` text NOT NULL,
  `scope` text NOT NULL,
  `expires_at` integer NOT NULL
);
