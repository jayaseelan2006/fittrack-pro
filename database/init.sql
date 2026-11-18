-- FitTrack Pro schema (MySQL 8, InnoDB, utf8mb4). Generated from SQLAlchemy models.
-- Alembic is the source of truth for upgrades; this file bootstraps a fresh DB.
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE IF NOT EXISTS users (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	email VARCHAR(255) NOT NULL, 
	password_hash VARCHAR(255) NOT NULL, 
	is_active BOOL NOT NULL, 
	created_at DATETIME NOT NULL DEFAULT (now()), 
	updated_at DATETIME NOT NULL DEFAULT (now()), 
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE UNIQUE INDEX ix_users_email ON users (email);

CREATE TABLE IF NOT EXISTS body_measurements (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	user_id INTEGER NOT NULL, 
	measured_date DATE NOT NULL, 
	chest_cm NUMERIC(5, 1), 
	waist_cm NUMERIC(5, 1), 
	arms_cm NUMERIC(5, 1), 
	shoulders_cm NUMERIC(5, 1), 
	thighs_cm NUMERIC(5, 1), 
	hips_cm NUMERIC(5, 1), 
	notes TEXT, 
	created_at DATETIME NOT NULL DEFAULT (now()), 
	updated_at DATETIME NOT NULL DEFAULT (now()), 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX ix_measure_user_date ON body_measurements (user_id, measured_date);

CREATE TABLE IF NOT EXISTS exercises (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	user_id INTEGER, 
	name VARCHAR(150) NOT NULL, 
	muscle_group ENUM('chest','back','shoulders','biceps','triceps','legs','abs','cardio') NOT NULL, 
	equipment VARCHAR(80) NOT NULL, 
	is_custom BOOL NOT NULL, 
	created_at DATETIME NOT NULL DEFAULT (now()), 
	updated_at DATETIME NOT NULL DEFAULT (now()), 
	PRIMARY KEY (id), 
	CONSTRAINT uq_exercise_user_name UNIQUE (user_id, name), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX ix_exercises_muscle ON exercises (muscle_group);

CREATE TABLE IF NOT EXISTS foods (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	user_id INTEGER, 
	name VARCHAR(150) NOT NULL, 
	category VARCHAR(50) NOT NULL, 
	calories_per_100g NUMERIC(7, 2) NOT NULL, 
	protein_per_100g NUMERIC(6, 2) NOT NULL, 
	carbs_per_100g NUMERIC(6, 2) NOT NULL, 
	fat_per_100g NUMERIC(6, 2) NOT NULL, 
	is_custom BOOL NOT NULL, 
	created_at DATETIME NOT NULL DEFAULT (now()), 
	updated_at DATETIME NOT NULL DEFAULT (now()), 
	PRIMARY KEY (id), 
	CONSTRAINT uq_food_user_name UNIQUE (user_id, name), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX ix_foods_category ON foods (category);
CREATE INDEX ix_foods_name ON foods (name);

CREATE TABLE IF NOT EXISTS goals (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	user_id INTEGER NOT NULL, 
	goal_type ENUM('weight','protein','calories','workout') NOT NULL, 
	title VARCHAR(150) NOT NULL, 
	start_value NUMERIC(10, 2) NOT NULL, 
	current_value NUMERIC(10, 2) NOT NULL, 
	target_value NUMERIC(10, 2) NOT NULL, 
	unit VARCHAR(20) NOT NULL, 
	start_date DATE NOT NULL, 
	end_date DATE, 
	is_weekly_challenge BOOL NOT NULL, 
	status ENUM('active','completed','cancelled') NOT NULL, 
	notes TEXT, 
	created_at DATETIME NOT NULL DEFAULT (now()), 
	updated_at DATETIME NOT NULL DEFAULT (now()), 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX ix_goals_user_status ON goals (user_id, status);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	user_id INTEGER NOT NULL, 
	token_hash VARCHAR(64) NOT NULL, 
	expires_at DATETIME NOT NULL, 
	used BOOL NOT NULL, 
	created_at DATETIME NOT NULL DEFAULT (now()), 
	updated_at DATETIME NOT NULL DEFAULT (now()), 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
	UNIQUE (token_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX ix_password_reset_tokens_user_id ON password_reset_tokens (user_id);

CREATE TABLE IF NOT EXISTS progress_photos (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	user_id INTEGER NOT NULL, 
	photo_date DATE NOT NULL, 
	stored_filename VARCHAR(255) NOT NULL, 
	original_filename VARCHAR(255) NOT NULL, 
	content_type VARCHAR(50) NOT NULL, 
	size_bytes INTEGER NOT NULL, 
	notes TEXT, 
	created_at DATETIME NOT NULL DEFAULT (now()), 
	updated_at DATETIME NOT NULL DEFAULT (now()), 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
	UNIQUE (stored_filename)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX ix_photos_user_date ON progress_photos (user_id, photo_date);

CREATE TABLE IF NOT EXISTS user_profiles (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	user_id INTEGER NOT NULL, 
	full_name VARCHAR(120) NOT NULL, 
	gender ENUM('male','female','other'), 
	date_of_birth DATE, 
	height_cm NUMERIC(5, 1), 
	fitness_goal ENUM('muscle_gain','weight_gain','fat_loss','maintenance') NOT NULL, 
	target_weight_kg NUMERIC(5, 1), 
	daily_calorie_target INTEGER NOT NULL, 
	daily_protein_target INTEGER NOT NULL, 
	timezone VARCHAR(64) NOT NULL, 
	theme VARCHAR(10) NOT NULL, 
	created_at DATETIME NOT NULL DEFAULT (now()), 
	updated_at DATETIME NOT NULL DEFAULT (now()), 
	PRIMARY KEY (id), 
	UNIQUE (user_id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS weight_logs (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	user_id INTEGER NOT NULL, 
	log_date DATE NOT NULL, 
	weight_kg NUMERIC(5, 1) NOT NULL, 
	notes TEXT, 
	created_at DATETIME NOT NULL DEFAULT (now()), 
	updated_at DATETIME NOT NULL DEFAULT (now()), 
	PRIMARY KEY (id), 
	CONSTRAINT uq_weight_user_date UNIQUE (user_id, log_date), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX ix_weight_user_date ON weight_logs (user_id, log_date);

CREATE TABLE IF NOT EXISTS workouts (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	user_id INTEGER NOT NULL, 
	name VARCHAR(120) NOT NULL, 
	category ENUM('chest','back','shoulders','biceps','triceps','legs','abs','cardio') NOT NULL, 
	workout_date DATE NOT NULL, 
	status ENUM('planned','in_progress','completed') NOT NULL, 
	started_at DATETIME, 
	finished_at DATETIME, 
	duration_seconds INTEGER, 
	notes TEXT, 
	created_at DATETIME NOT NULL DEFAULT (now()), 
	updated_at DATETIME NOT NULL DEFAULT (now()), 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX ix_workouts_user_date ON workouts (user_id, workout_date);

CREATE TABLE IF NOT EXISTS food_logs (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	user_id INTEGER NOT NULL, 
	food_id INTEGER NOT NULL, 
	log_date DATE NOT NULL, 
	meal_type ENUM('breakfast','lunch','dinner','snacks') NOT NULL, 
	quantity_grams NUMERIC(7, 1) NOT NULL, 
	calories NUMERIC(8, 2) NOT NULL, 
	protein NUMERIC(7, 2) NOT NULL, 
	carbs NUMERIC(7, 2) NOT NULL, 
	fat NUMERIC(7, 2) NOT NULL, 
	notes TEXT, 
	created_at DATETIME NOT NULL DEFAULT (now()), 
	updated_at DATETIME NOT NULL DEFAULT (now()), 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
	FOREIGN KEY(food_id) REFERENCES foods (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX ix_food_logs_user_date ON food_logs (user_id, log_date);

CREATE TABLE IF NOT EXISTS workout_exercises (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	workout_id INTEGER NOT NULL, 
	exercise_id INTEGER NOT NULL, 
	order_index INTEGER NOT NULL, 
	notes TEXT, 
	created_at DATETIME NOT NULL DEFAULT (now()), 
	updated_at DATETIME NOT NULL DEFAULT (now()), 
	PRIMARY KEY (id), 
	CONSTRAINT uq_wex_order UNIQUE (workout_id, order_index), 
	FOREIGN KEY(workout_id) REFERENCES workouts (id) ON DELETE CASCADE, 
	FOREIGN KEY(exercise_id) REFERENCES exercises (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX ix_wex_exercise ON workout_exercises (exercise_id);

CREATE TABLE IF NOT EXISTS workout_logs (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	user_id INTEGER NOT NULL, 
	exercise_id INTEGER NOT NULL, 
	workout_id INTEGER, 
	log_date DATE NOT NULL, 
	total_sets INTEGER NOT NULL, 
	total_reps INTEGER NOT NULL, 
	max_weight_kg NUMERIC(6, 2) NOT NULL, 
	total_volume NUMERIC(10, 2) NOT NULL, 
	notes TEXT, 
	created_at DATETIME NOT NULL DEFAULT (now()), 
	updated_at DATETIME NOT NULL DEFAULT (now()), 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
	FOREIGN KEY(exercise_id) REFERENCES exercises (id) ON DELETE RESTRICT, 
	FOREIGN KEY(workout_id) REFERENCES workouts (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX ix_wlog_user_ex_date ON workout_logs (user_id, exercise_id, log_date);

CREATE TABLE IF NOT EXISTS personal_records (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	user_id INTEGER NOT NULL, 
	exercise_id INTEGER NOT NULL, 
	record_type ENUM('max_weight','max_reps','max_volume') NOT NULL, 
	value NUMERIC(10, 2) NOT NULL, 
	achieved_date DATE NOT NULL, 
	workout_log_id INTEGER, 
	created_at DATETIME NOT NULL DEFAULT (now()), 
	updated_at DATETIME NOT NULL DEFAULT (now()), 
	PRIMARY KEY (id), 
	CONSTRAINT uq_pr_user_ex_type UNIQUE (user_id, exercise_id, record_type), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
	FOREIGN KEY(exercise_id) REFERENCES exercises (id) ON DELETE CASCADE, 
	FOREIGN KEY(workout_log_id) REFERENCES workout_logs (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS workout_sets (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	workout_exercise_id INTEGER NOT NULL, 
	set_number INTEGER NOT NULL, 
	reps INTEGER NOT NULL, 
	weight_kg NUMERIC(6, 2) NOT NULL, 
	rest_seconds INTEGER, 
	is_completed BOOL NOT NULL, 
	created_at DATETIME NOT NULL DEFAULT (now()), 
	updated_at DATETIME NOT NULL DEFAULT (now()), 
	PRIMARY KEY (id), 
	CONSTRAINT uq_set_number UNIQUE (workout_exercise_id, set_number), 
	FOREIGN KEY(workout_exercise_id) REFERENCES workout_exercises (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


SET FOREIGN_KEY_CHECKS=1;
