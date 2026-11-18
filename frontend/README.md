# FitTrack Pro – Frontend

React 18 + Vite + Tailwind CSS + React Router + Axios + Recharts + Lucide.

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173  (proxies /api -> http://localhost:8000)
npm test           # 16 smoke tests (every page + login + start-workout payload)
npm run build      # production bundle in dist/
```
Env: `VITE_API_URL` (default `/api`), `VITE_PROXY_TARGET` (dev proxy target).

## Structure
```
src/
  main.jsx, App.jsx, index.css
  services/   api.js (axios + JWT + error formatting), index.js (one object per API group)
  context/    AuthContext (session, profile, theme), ToastContext
  hooks/      useFetch (loading/error/reload), useDebounce
  layouts/    AppLayout (responsive sidebar/drawer), AuthShell
  components/ Card, Modal, Async, Field, Tabs, StatCard, ProgressBar, useConfirm, AuthImage, ProtectedRoute
  charts/     TrendChart, BarsChart, StrengthChart (+ theme)
  pages/      Login, Register, ForgotPassword, ResetPassword, Dashboard, Food, Weight, Workouts,
              workouts/WorkoutSessionPage, Progression, Photos, Goals, Analytics, Settings
  utils/      format.js (dates, numbers, macro preview)
```

## API contract the frontend expects
All paths are under `/api`. Requests send `Authorization: Bearer <jwt>`. Dates are `YYYY-MM-DD`; datetimes are UTC ISO.
Decimals may be numbers or strings (the UI coerces). Errors use FastAPI's `{"detail": ...}`. 401 = session cleared.
List endpoints return plain arrays, sorted ascending by date unless noted.

**Auth** – `POST /auth/register {email,password,full_name}` · `POST /auth/login {email,password} -> {access_token,token_type}` ·
`GET /auth/me -> profile` · `POST /auth/logout` · `POST /auth/forgot-password {email} -> {message, reset_token?}`
(`reset_token` only when no email provider is configured) · `POST /auth/reset-password {token,new_password}`.

**Profile** (`/auth/me`, `GET|PUT /users/profile`) – flat object: `id,email,full_name,gender,date_of_birth,height_cm,fitness_goal,
target_weight_kg,daily_calorie_target,daily_protein_target,timezone,theme`. `PUT` is a **partial update** and returns the profile.
`PUT /users/change-password {current_password,new_password}` · `DELETE /users/account {password}`.

**Dashboard** – `summary`: `current_weight,target_weight,weight_change(vs previous),weight_gained(vs first),calories,protein,carbs,fat,
calorie_target,protein_target,today_workout{id,name,status}|null,weekly_workout_count,total_exercises,
strength_records[{exercise_id,exercise_name,max_weight_kg}],goals[{id,title,progress_pct}]` ·
`weight-progress [{date,weight_kg}]` · `nutrition-summary [{date,calories,protein,carbs,fat}]` (last 7 days) ·
`workout-summary [{label,workouts,volume}]` (weekly) · `strength-progress [{exercise_id,exercise_name,points[{date,max_weight_kg}]}]`.

**Foods** – `GET /foods?category=` · `GET /foods/search?q=` -> `[{id,name,category,calories_per_100g,protein_per_100g,carbs_per_100g,fat_per_100g,is_custom}]`;
`POST|PUT|DELETE /foods[/id]` (custom foods only).

**Food logs** – `GET /food-logs?date=` -> `[{id,food_id,food_name,log_date,meal_type,quantity_grams,calories,protein,carbs,fat}]` ·
`POST {food_id,log_date,meal_type,quantity_grams}` · `PUT {meal_type,quantity_grams,log_date}` · `DELETE` ·
`GET /food-logs/daily-summary?date= -> {date,calories,protein,carbs,fat,calorie_target,protein_target,remaining_calories,remaining_protein}` ·
`GET /food-logs/weekly-summary?end_date= -> {days[{date,calories,protein,carbs,fat}],avg_calories,avg_protein,avg_carbs,avg_fat,calorie_target,protein_target}`.

**Weight** – `GET /weight -> [{id,log_date,weight_kg,notes}]` · `POST|PUT {log_date,weight_kg,notes}` (one entry per day, duplicate -> 409) ·
`GET /weight/progress -> {current_weight,target_weight,weight_change,bmi,bmi_category,weekly_average,monthly_average,points[{date,weight_kg}]}`.
**Measurements** – `[{id,measured_date,chest_cm,waist_cm,arms_cm,shoulders_cm,thighs_cm,hips_cm}]`.

**Workouts** – `GET /workouts?category=&status= -> [{id,name,category,workout_date,status,duration_seconds,exercise_count,total_volume}]` ·
`GET /workouts/{id}` adds `started_at,notes,exercises[{id,exercise_id,exercise_name,muscle_group,equipment,notes,sets[{id,set_number,reps,weight_kg,rest_seconds,is_completed}]}]` ·
`POST {name,category,workout_date,notes}` ·
`PUT /workouts/{id} {name,category,workout_date,notes,status,exercises:[{exercise_id,notes,sets:[{set_number,reps,weight_kg,rest_seconds,is_completed}]}]}`
**replaces the nested exercises/sets**; `status:"in_progress"` starts the workout (backend sets `started_at`) ·
`POST /workouts/{id}/finish -> workout + new_personal_records?[{exercise_name,record_type,value}]` (creates workout_logs and PRs).
**Exercises** – `GET /exercises?muscle_group= -> [{id,name,muscle_group,equipment,is_custom}]`, CRUD for custom ones.
**Workout logs** – `[{id,exercise_id,exercise_name,log_date,total_sets,total_reps,max_weight_kg,total_volume}]`.

**Progression** – `GET /progression/{exerciseId} -> {status: improved|no_change|decreased|first_session, weight_change,rep_change,volume_change,strength_progress_pct,suggestion}` ·
`/history -> [{date,max_weight_kg,total_sets,total_reps,total_volume}]` (ascending) ·
`/compare -> {previous:{...}|null,current:{...},weight_change,rep_change,volume_change,status}` ·
`/personal-records -> [{exercise_id,exercise_name,record_type: max_weight|max_reps|max_volume,value,achieved_date}]` ·
`/volume-history -> [{date,total_volume}]`. (Register `personal-records` and `volume-history` routes before `/{exercise_id}`.)

**Goals** – `[{id,goal_type: weight|protein|calories|workout,title,start_value,current_value,target_value,unit,start_date,end_date,is_weekly_challenge,status: active|completed|cancelled,progress_pct}]`.

**Photos** – `GET /progress-photos -> [{id,photo_date,notes}]` · `POST` multipart `file,photo_date,notes` ·
`GET /progress-photos/{id}/file` (authenticated image bytes – **extra endpoint** needed so photos stay private) · `DELETE`.

**Analytics** – `weekly|monthly -> {period_start,period_end,avg_calories,avg_protein,avg_carbs,avg_fat,workouts_completed,total_volume,weight_change,days_logged}` ·
`weight?days= -> {points[{date,weight_kg}],change}` · `nutrition?days=` (same shape as weekly-summary) ·
`workouts?days= -> {consistency_pct,weekly[{label,workouts}],muscle_frequency[{muscle_group,count}]}` · `strength?days=` (same shape as dashboard strength-progress).

## Notes
- Dates use the browser's local calendar date, never `toISOString()`, to avoid timezone off-by-one bugs.
- Progression suggestions are shown as guidance only; the UI never changes training weights on its own (new sets copy the previous set).
- Photos are fetched with the JWT and shown from object URLs, so image URLs are never public.
- Forms validate on the client for fast feedback; the backend remains the source of truth for all calculations.
