# PisteWise Database Schema

> Supabase (PostgreSQL) — 16 tables, all resort data keyed by `resort.id` (uuid).

---

## `resort` — Core resort record (130 rows)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, NOT NULL | |
| name | text | NOT NULL | |
| country | text | NOT NULL | |
| region | text | | |
| lat | numeric | | |
| lng | numeric | | |
| continent | text | | |
| location | geography | | PostGIS point |
| altitude_base_m | int4 | | |
| altitude_top_m | int4 | | |
| min_altitude_m | int2 | | |
| max_altitude_m | int2 | | |
| style | text | | e.g. "modern", "traditional" |
| car_free_town | bool | | |
| **Slopes & terrain** | | | |
| total_km_piste | int4 | | |
| blue_runs | int4 | | |
| red_runs | int4 | | |
| black_runs | int4 | | |
| beginner_area | bool | | |
| snow_park | bool | | |
| off_piste | bool | | |
| off_piste_score | int2 | | |
| backcountry_access | bool | | |
| guide_required | bool | | |
| freeride_world_tour | bool | | |
| off_piste_areas | text | | |
| **Snow & weather** | | | |
| snow_sure_score | int2 | | |
| snow_sure_rating | int2 | | |
| glacier_skiing | bool | | |
| snowmaking_cannon_count | int2 | | |
| snowmaking_coverage_pct | int2 | | |
| snowmaking_km_covered | numeric | | |
| snowmaking_reliability | int2 | | |
| snowmaking_notes | text | | |
| **Heli-skiing** | | | |
| heli_skiing_available | bool | | |
| heli_skiing_legal | text | | |
| heli_skiing_notes | text | | |
| heli_skiing_operator | text | | |
| heli_skiing_cost_gbp | int4 | | |
| **Night skiing** | | | |
| night_skiing_available | bool | | |
| night_skiing_pistes | int2 | | |
| night_skiing_km | numeric | | |
| night_skiing_days | text | | |
| night_skiing_until | text | | |
| night_skiing_cost_gbp | int2 | | |
| night_skiing_notes | text | | |
| **Transport & access** | | | |
| train_accessible | bool | | |
| eurostar_direct | bool | | |
| train_journey_hours | numeric | | |
| train_route_summary | text | | |
| drive_hours_from_london | numeric | | |
| **Accessibility** | | | |
| disability_access | bool | | |
| wheelchair_accessible | bool | | |
| adaptive_ski_school | bool | | |
| accessibility_notes | text | | |
| **Après-ski** | | | |
| apres_ski_rating | int2 | | |
| apres_ski_notes | text | | |
| **Sustainability** | | | |
| sustainability_score | int2 | | |
| sustainability_notes | text | | |
| **Olympics** | | | |
| olympic_history | bool | | |
| olympic_detail | text | | |
| **Media & links** | | | |
| hero_image | text | | Supabase Storage URL |
| webcam_url | text | | |
| snow_report_url | text | | |
| **Meta** | | | |
| embedding | vector | | pgvector |
| last_updated | timestamptz | | |
| created_at | timestamptz | | |

---

## `slope_data` — Detailed lift/terrain stats (1:1 with resort)

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, NOT NULL |
| resort_id | uuid | FK → resort, UNIQUE, NOT NULL |
| total_km | int4 | |
| blue_km | int4 | |
| red_km | int4 | |
| black_km | int4 | |
| lifts_total | int4 | |
| gondolas | int4 | |
| chairlifts | int4 | |
| snow_park | bool | |
| half_pipe | bool | |
| mogul_field | bool | |
| off_piste_guided | bool | |
| snow_park_features | int4 | |
| created_at | timestamptz | |

---

## `cost_data` — Pricing by year (N:1 with resort)

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, NOT NULL |
| resort_id | uuid | FK → resort, NOT NULL |
| lift_pass_daily_gbp | numeric | |
| lift_pass_weekly_gbp | numeric | |
| mountain_lunch_gbp | numeric | |
| beer_on_mountain_gbp | numeric | |
| ski_rental_daily_gbp | numeric | |
| ski_school_half_day_gbp | numeric | |
| overall_cost_index | int2 | |
| year | int2 | NOT NULL |
| resort_name | text | |
| created_at | timestamptz | |

---

## `weather_month` — Monthly averages (12 rows per resort)

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, NOT NULL |
| resort_id | uuid | FK → resort, NOT NULL |
| month | int2 | NOT NULL (1–12) |
| avg_temp_c | numeric | |
| avg_wind_kph | numeric | |
| wind_chill_c | numeric | |
| avg_bluebird_days | int2 | |
| avg_snowfall_cm | numeric | |
| snow_depth_cm | numeric | |
| visibility_score | int2 | |
| created_at | timestamptz | |

---

## `airport_link` — Nearest airports per resort

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, NOT NULL |
| resort_id | uuid | FK → resort, NOT NULL |
| iata_code | text | NOT NULL |
| airport_name | text | |
| transfer_mins | int4 | |
| road_winding_score | int2 | |
| direct_flights_available | bool | |
| top_airlines | text | |
| shuttle_available | bool | |
| uk_departure_airports | text | |
| airlines | text | |
| flight_time_mins | int2 | |
| seasonal_only | bool | |
| ski_charter_available | bool | |
| frequency | text | |
| created_at | timestamptz | |

---

## `flight_route` — UK → resort airport flight routes

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, NOT NULL |
| resort_id | uuid | FK → resort, NOT NULL |
| destination_airport | text | NOT NULL |
| destination_iata | text | NOT NULL |
| uk_airport | text | NOT NULL |
| uk_iata | text | NOT NULL |
| airline | text | NOT NULL |
| flight_time_mins | int2 | |
| seasonal | bool | |
| ski_season_only | bool | |
| frequency | text | |
| notes | text | |
| created_at | timestamptz | |

---

## `transport_option` — Ground transport options

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, NOT NULL |
| resort_id | uuid | FK → resort, NOT NULL |
| type | text | |
| description | text | |
| nearest_station | text | |
| station_distance_km | int4 | |
| eurostar_viable | bool | |
| parking_available | bool | |
| parking_spaces | int4 | |
| created_at | timestamptz | |

---

## `accommodation` — Hotels, chalets, apartments

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, NOT NULL |
| resort_id | uuid | FK → resort, NOT NULL |
| type | text | |
| name | text | |
| stars | int2 | |
| ski_in_out | bool | |
| kids_club | bool | |
| price_per_night_gbp | numeric | |
| min_nights | int2 | |
| catered | bool | |
| booking_url | text | |
| source | text | |
| created_at | timestamptz | |

---

## `facility` — Restaurants, ski schools, bars, activities

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, NOT NULL |
| resort_id | uuid | FK → resort, NOT NULL |
| type | text | |
| name | text | |
| veggie_options | bool | |
| vegan_options | bool | |
| avg_price_gbp | numeric | |
| rating | numeric | |
| ski_to_door | bool | |
| source | text | |
| review_count | int4 | |
| english_speaking | bool | |
| kids_lessons | bool | |
| private_available | bool | |
| instructor_notes | text | |
| whiteout_activity | bool | |
| apres_ski | bool | |
| nightlife_level | text | |
| created_at | timestamptz | |

---

## `famous_run` — Notable runs & race pistes

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, NOT NULL |
| resort_id | uuid | FK → resort, NOT NULL |
| name | text | NOT NULL |
| local_name | text | |
| difficulty | text | |
| length_km | numeric | |
| vertical_drop_m | int4 | |
| top_altitude_m | int4 | |
| bottom_altitude_m | int4 | |
| world_famous | bool | |
| race_piste | bool | |
| race_event | text | |
| night_skiing | bool | |
| why_famous | text | |
| best_for | text | |
| created_at | timestamptz | |

---

## `resort_content` — AI-generated descriptions

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, NOT NULL |
| resort_id | uuid | FK → resort, NOT NULL |
| field_key | text | NOT NULL |
| plain_english_value | text | |
| raw_value | text | |
| generated_at | timestamptz | |
| claude_model_version | text | |

---

## `profiles` — Authenticated users

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, FK → auth.users, NOT NULL |
| email | text | |
| display_name | text | |
| avatar_url | text | |
| home_airport | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

## `user_preferences` — Onboarding quiz answers (1:1 with user)

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, NOT NULL |
| user_id | uuid | FK → profiles, UNIQUE, NOT NULL |
| has_completed_onboarding | bool | |
| trip_type | text | |
| group_abilities | text[] | |
| budget_level | text | |
| regions | text[] | |
| crowd_preference | int4 | |
| family_vs_nightlife | int4 | |
| snow_importance | int4 | |
| language | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

## `user_favorites` — Saved resorts

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, NOT NULL |
| user_id | uuid | FK → profiles, NOT NULL |
| resort_id | text | NOT NULL |
| created_at | timestamptz | |

---

## `visited_resorts` — User trip log

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, NOT NULL |
| user_id | uuid | FK → profiles, NOT NULL |
| resort_id | text | NOT NULL |
| visited_at | timestamptz | |
| notes | text | |
| rating | int2 | |
| created_at | timestamptz | |

---

## System tables (PostGIS)

- **`spatial_ref_sys`** — coordinate reference systems (read-only)
- **`geometry_columns`** / **`geography_columns`** — PostGIS catalogue views