CREATE TABLE IF NOT EXISTS "wallet_pass_devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"device_library_identifier" varchar(50) NOT NULL,
	"push_token" varchar(100) NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now(),
	"updated_at" timestamp (6) with time zone DEFAULT now(),
	"platform" varchar(10) NOT NULL
);

CREATE TABLE IF NOT EXISTS "wallet_pass_passes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pass_type_identifier" varchar(100) NOT NULL,
	"serial_number" varchar(300) NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now(),
	"updated_at" timestamp (6) with time zone DEFAULT now(),
	"json" jsonb,
	"last_scanned_at" timestamp (6) with time zone,
	"platform" varchar(10) NOT NULL,
	"template_id" varchar(50) NOT NULL,
	"expired_at" timestamp (6) with time zone,
	"expire_action" varchar(50),
	"external_id" varchar(100) NOT NULL,
	"barcode_url" varchar(500),
	"api_key" varchar(200) NOT NULL
);

CREATE TABLE IF NOT EXISTS "api_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"api_key" varchar(200) NOT NULL,
	"project" varchar(50) NOT NULL,
	"config" jsonb,
	"created_at" bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS "wallet_pass_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"device_id" uuid,
	"pass_id" uuid NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now(),
	"updated_at" timestamp (6) with time zone DEFAULT now(),
	"deleted_at" timestamp (6) with time zone
);

CREATE TABLE IF NOT EXISTS "api_wallet_passes" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"api_key" varchar(200) NOT NULL,
	"details" jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS "api_wallet_pass_queue" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"api_key" varchar(200) NOT NULL,
	"job_type" varchar(10) NOT NULL,
	"params" jsonb NOT NULL,
	"callback_url" varchar(200),
	"done" smallint DEFAULT -1 NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "unique_platform_device_library_identifier" ON "wallet_pass_devices" ("platform","device_library_identifier");
CREATE INDEX IF NOT EXISTS "index_created_at" ON "wallet_pass_devices" ("created_at");
CREATE UNIQUE INDEX IF NOT EXISTS "unique_platform_pass_type_identifier_serial_number" ON "wallet_pass_passes" ("platform","pass_type_identifier","serial_number");
CREATE UNIQUE INDEX IF NOT EXISTS "unique_template_id_external_id" ON "wallet_pass_passes" ("template_id","external_id");
CREATE INDEX IF NOT EXISTS "index_created_at" ON "wallet_pass_passes" ("created_at");
CREATE INDEX IF NOT EXISTS "index_pass_type_identifier_updated_at" ON "wallet_pass_passes" ("pass_type_identifier","updated_at");
CREATE UNIQUE INDEX IF NOT EXISTS "unique_api_key_config" ON "api_projects" ("api_key");
CREATE UNIQUE INDEX IF NOT EXISTS "unique_project_config" ON "api_projects" ("project");
CREATE INDEX IF NOT EXISTS "index_pass_id_device_id_deleted_at" ON "wallet_pass_registrations" ("pass_id","device_id","deleted_at");
CREATE INDEX IF NOT EXISTS "idx_api_key_wallet_pass" ON "api_wallet_passes" ("api_key");