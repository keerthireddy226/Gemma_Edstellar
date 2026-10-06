-- Up Migration
-- Baseline: schema as it actually exists in the live practice_tool database
-- (captured via pg_dump --schema-only on 2026-08-31). This does NOT match
-- db/schema.sql, which describes a newer, not-yet-applied design (missing
-- here: role/permissions model, tenant_invitations, batches rename).
-- See migration 1756000100000 for the fix-up bringing this up to date.

CREATE TABLE public.access_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    attempt_id uuid,
    accessed_by text NOT NULL,
    access_type text NOT NULL,
    accessed_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone,
    CONSTRAINT access_logs_access_type_check CHECK ((access_type = ANY (ARRAY['view'::text, 'download'::text, 'delete'::text])))
);

CREATE TABLE public.achievements (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    icon text NOT NULL,
    CONSTRAINT achievements_icon_check CHECK ((icon = ANY (ARRAY['flag'::text, 'target'::text, 'flame'::text, 'layers'::text, 'award'::text, 'list-checks'::text, 'trophy'::text, 'star'::text])))
);

CREATE TABLE public.activity_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    skill text NOT NULL,
    activity text NOT NULL,
    status text DEFAULT 'Completed'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT activity_log_skill_check CHECK ((skill = ANY (ARRAY['speaking'::text, 'listening'::text, 'reading'::text, 'writing'::text])))
);

CREATE TABLE public.attempts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    item_id uuid NOT NULL,
    window_start_at timestamp with time zone NOT NULL,
    submitted_at timestamp with time zone,
    response_uri text,
    response_text text,
    invalid_reason text,
    audio_expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.auth_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    session_token_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    revoked_at timestamp with time zone
);

CREATE TABLE public.coach_turns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    turn_index integer NOT NULL,
    speaker text NOT NULL,
    audio_uri text,
    transcript text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT coach_turns_speaker_check CHECK ((speaker = ANY (ARRAY['learner'::text, 'agent'::text])))
);

CREATE TABLE public.cohorts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    name text NOT NULL,
    target_cut_score numeric,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.consent_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    consent_version text NOT NULL,
    consent_type text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    ip_address inet,
    revoked_at timestamp with time zone,
    CONSTRAINT consent_records_consent_type_check CHECK ((consent_type = ANY (ARRAY['recording'::text, 'training_use'::text])))
);

CREATE TABLE public.email_verification_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone
);

CREATE TABLE public.exam_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    exam_id uuid NOT NULL,
    part_label text NOT NULL,
    item_type_id text NOT NULL,
    sort_order integer NOT NULL
);

CREATE TABLE public.exams (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.external_results (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    reported_overall numeric,
    reported_skills jsonb,
    source text,
    verified_flag boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.features (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    attempt_id uuid NOT NULL,
    name text NOT NULL,
    value numeric NOT NULL
);

CREATE TABLE public.item_audio (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    item_id uuid NOT NULL,
    voice_id text NOT NULL,
    accent text,
    uri text NOT NULL,
    duration_ms integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.item_types (
    id text NOT NULL,
    name text NOT NULL,
    skills text[] NOT NULL,
    input_method text NOT NULL,
    instruction_text text NOT NULL,
    question_instruction text NOT NULL,
    auto_advance boolean DEFAULT true NOT NULL,
    timer_seconds integer,
    two_phase_read_seconds integer,
    two_phase_write_seconds integer,
    min_words integer,
    max_words integer,
    estimated_seconds integer NOT NULL,
    CONSTRAINT item_types_input_method_check CHECK ((input_method = ANY (ARRAY['mic'::text, 'text'::text, 'textarea'::text, 'radio'::text, 'two-phase'::text])))
);

CREATE TABLE public.items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    item_type_id text NOT NULL,
    content jsonb NOT NULL,
    answer_set jsonb,
    word_count integer,
    difficulty numeric,
    topic text,
    vocab_band_checked boolean DEFAULT false NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    pipeline_version text,
    prompt_version text,
    filters_passed jsonb,
    reviewer_id uuid,
    review_decision text,
    review_rationale text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT items_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'approved'::text, 'retired'::text])))
);

CREATE TABLE public.participant_profiles (
    user_id uuid NOT NULL,
    onboarding_step text DEFAULT 'basics'::text NOT NULL,
    onboarding_complete boolean DEFAULT false NOT NULL,
    exam_preference text,
    goal_level text,
    score_target text,
    exam_reason text,
    has_applied_for_exam boolean,
    exam_date date,
    target_prep_days integer,
    past_attempts_status text,
    prev_score text,
    prev_date text,
    daily_minutes_preference integer,
    access_duration text,
    access_window_start_date date,
    access_window_duration_days integer,
    assessment_scheduled_for date,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT participant_profiles_access_duration_check CHECK ((access_duration = ANY (ARRAY['1month'::text, '3months'::text, '6months'::text, 'untilexam'::text]))),
    CONSTRAINT participant_profiles_exam_preference_check CHECK ((exam_preference = ANY (ARRAY['versant'::text, 'ielts'::text, 'toefl'::text, 'pte'::text, 'cambridge'::text, 'other'::text]))),
    CONSTRAINT participant_profiles_exam_reason_check CHECK ((exam_reason = ANY (ARRAY['university'::text, 'job'::text, 'immigration'::text, 'promotion'::text, 'personal'::text]))),
    CONSTRAINT participant_profiles_past_attempts_status_check CHECK ((past_attempts_status = ANY (ARRAY['first'::text, 'once'::text, 'multiple'::text])))
);

CREATE TABLE public.password_reset_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone
);

CREATE TABLE public.placements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    taken_at timestamp with time zone DEFAULT now() NOT NULL,
    overall_percent numeric NOT NULL,
    cefr_level text NOT NULL,
    skill_percents jsonb NOT NULL,
    CONSTRAINT placements_cefr_level_check CHECK ((cefr_level = ANY (ARRAY['A1'::text, 'A2'::text, 'B1'::text, 'B2'::text, 'C1'::text, 'C2'::text])))
);

CREATE TABLE public.progress_stats (
    user_id uuid NOT NULL,
    sessions_count integer DEFAULT 0 NOT NULL,
    questions_completed integer DEFAULT 0 NOT NULL,
    practice_minutes numeric DEFAULT 0 NOT NULL,
    streak_days integer DEFAULT 0 NOT NULL,
    last_practice_date date,
    total_xp integer DEFAULT 0 NOT NULL,
    item_accuracy_correct integer DEFAULT 0 NOT NULL,
    item_accuracy_graded integer DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.readiness (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    session_id uuid NOT NULL,
    band text NOT NULL,
    per_skill_estimates jsonb NOT NULL,
    provisional_flag boolean DEFAULT false NOT NULL,
    threshold_version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.review_queue (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    attempt_id uuid NOT NULL,
    reason text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    resolution text,
    reviewed_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    resolved_at timestamp with time zone,
    CONSTRAINT review_queue_reason_check CHECK ((reason = ANY (ARRAY['learner_flagged'::text, 'low_confidence'::text]))),
    CONSTRAINT review_queue_status_check CHECK ((status = ANY (ARRAY['open'::text, 'resolved'::text])))
);

CREATE TABLE public.roadmap_milestones (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    roadmap_id uuid NOT NULL,
    level text NOT NULL,
    label text NOT NULL,
    target_day_offset integer NOT NULL,
    focus_skill text NOT NULL,
    CONSTRAINT roadmap_milestones_focus_skill_check CHECK ((focus_skill = ANY (ARRAY['speaking'::text, 'listening'::text, 'reading'::text, 'writing'::text])))
);

CREATE TABLE public.roadmaps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    generated_at timestamp with time zone DEFAULT now() NOT NULL,
    pace text NOT NULL,
    minutes_per_day integer NOT NULL,
    total_hours_estimate numeric NOT NULL,
    CONSTRAINT roadmaps_pace_check CHECK ((pace = ANY (ARRAY['maintenance'::text, 'light'::text, 'steady'::text, 'intensive'::text])))
);

CREATE TABLE public.scores (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    attempt_id uuid NOT NULL,
    content_score numeric,
    manner_scores jsonb,
    mechanical_scores jsonb,
    confidence numeric,
    model_version text NOT NULL,
    low_confidence_flag boolean DEFAULT false NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT scores_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'scored'::text, 'failed'::text])))
);

CREATE TABLE public.session_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    date date NOT NULL,
    minutes numeric NOT NULL
);

CREATE TABLE public.sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    session_type text NOT NULL,
    mode text NOT NULL,
    composition jsonb,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    CONSTRAINT sessions_mode_check CHECK ((mode = ANY (ARRAY['exam'::text, 'coach'::text]))),
    CONSTRAINT sessions_session_type_check CHECK ((session_type = ANY (ARRAY['diagnostic'::text, 'practice'::text, 'placement'::text, 'drill'::text])))
);

CREATE TABLE public.skill_stats (
    user_id uuid NOT NULL,
    skill text NOT NULL,
    minutes numeric DEFAULT 0 NOT NULL,
    accuracy_correct integer DEFAULT 0 NOT NULL,
    accuracy_graded integer DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT skill_stats_skill_check CHECK ((skill = ANY (ARRAY['speaking'::text, 'listening'::text, 'reading'::text, 'writing'::text])))
);

CREATE TABLE public.tenants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    type text DEFAULT 'default'::text NOT NULL,
    storage_region text DEFAULT 'in'::text NOT NULL,
    audio_retention_days integer DEFAULT 90 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT tenants_type_check CHECK ((type = ANY (ARRAY['default'::text, 'company'::text])))
);

CREATE TABLE public.user_achievements (
    user_id uuid NOT NULL,
    achievement_id text NOT NULL,
    unlocked_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    email_verified boolean DEFAULT false NOT NULL,
    first_name text,
    last_name text,
    l1_language text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);

ALTER TABLE ONLY public.access_logs
    ADD CONSTRAINT access_logs_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.activity_log
    ADD CONSTRAINT activity_log_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.attempts
    ADD CONSTRAINT attempts_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.auth_sessions
    ADD CONSTRAINT auth_sessions_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.auth_sessions
    ADD CONSTRAINT auth_sessions_session_token_hash_key UNIQUE (session_token_hash);

ALTER TABLE ONLY public.coach_turns
    ADD CONSTRAINT coach_turns_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.cohorts
    ADD CONSTRAINT cohorts_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.consent_records
    ADD CONSTRAINT consent_records_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.email_verification_tokens
    ADD CONSTRAINT email_verification_tokens_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.email_verification_tokens
    ADD CONSTRAINT email_verification_tokens_token_hash_key UNIQUE (token_hash);

ALTER TABLE ONLY public.exam_parts
    ADD CONSTRAINT exam_parts_exam_id_part_label_key UNIQUE (exam_id, part_label);

ALTER TABLE ONLY public.exam_parts
    ADD CONSTRAINT exam_parts_exam_id_sort_order_key UNIQUE (exam_id, sort_order);

ALTER TABLE ONLY public.exam_parts
    ADD CONSTRAINT exam_parts_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT exams_code_key UNIQUE (code);

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT exams_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.external_results
    ADD CONSTRAINT external_results_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.features
    ADD CONSTRAINT features_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.item_audio
    ADD CONSTRAINT item_audio_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.item_types
    ADD CONSTRAINT item_types_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.participant_profiles
    ADD CONSTRAINT participant_profiles_pkey PRIMARY KEY (user_id);

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_token_hash_key UNIQUE (token_hash);

ALTER TABLE ONLY public.placements
    ADD CONSTRAINT placements_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.progress_stats
    ADD CONSTRAINT progress_stats_pkey PRIMARY KEY (user_id);

ALTER TABLE ONLY public.readiness
    ADD CONSTRAINT readiness_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.review_queue
    ADD CONSTRAINT review_queue_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.roadmap_milestones
    ADD CONSTRAINT roadmap_milestones_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.roadmaps
    ADD CONSTRAINT roadmaps_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.scores
    ADD CONSTRAINT scores_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.session_log
    ADD CONSTRAINT session_log_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.skill_stats
    ADD CONSTRAINT skill_stats_pkey PRIMARY KEY (user_id, skill);

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_pkey PRIMARY KEY (user_id, achievement_id);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);

CREATE INDEX idx_access_logs_attempt_id ON public.access_logs USING btree (attempt_id);

CREATE INDEX idx_access_logs_expires_at ON public.access_logs USING btree (expires_at);

CREATE INDEX idx_activity_log_user_id ON public.activity_log USING btree (user_id);

CREATE INDEX idx_attempts_audio_expires_at ON public.attempts USING btree (audio_expires_at);

CREATE INDEX idx_attempts_item_id ON public.attempts USING btree (item_id);

CREATE INDEX idx_attempts_session_id ON public.attempts USING btree (session_id);

CREATE INDEX idx_auth_sessions_user_id ON public.auth_sessions USING btree (user_id);

CREATE INDEX idx_coach_turns_session_id ON public.coach_turns USING btree (session_id);

CREATE INDEX idx_cohorts_tenant_id ON public.cohorts USING btree (tenant_id);

CREATE INDEX idx_consent_records_user_id ON public.consent_records USING btree (user_id);

CREATE INDEX idx_email_verification_tokens_user_id ON public.email_verification_tokens USING btree (user_id);

CREATE INDEX idx_exam_parts_exam_id ON public.exam_parts USING btree (exam_id);

CREATE INDEX idx_exam_parts_item_type_id ON public.exam_parts USING btree (item_type_id);

CREATE INDEX idx_external_results_user_id ON public.external_results USING btree (user_id);

CREATE INDEX idx_features_attempt_id ON public.features USING btree (attempt_id);

CREATE INDEX idx_item_audio_item_id ON public.item_audio USING btree (item_id);

CREATE INDEX idx_items_item_type_id ON public.items USING btree (item_type_id);

CREATE INDEX idx_items_reviewer_id ON public.items USING btree (reviewer_id);

CREATE INDEX idx_items_status ON public.items USING btree (status);

CREATE INDEX idx_password_reset_tokens_user_id ON public.password_reset_tokens USING btree (user_id);

CREATE INDEX idx_placements_user_id ON public.placements USING btree (user_id);

CREATE INDEX idx_readiness_session_id ON public.readiness USING btree (session_id);

CREATE INDEX idx_readiness_user_id ON public.readiness USING btree (user_id);

CREATE INDEX idx_review_queue_attempt_id ON public.review_queue USING btree (attempt_id);

CREATE INDEX idx_review_queue_status ON public.review_queue USING btree (status);

CREATE INDEX idx_roadmap_milestones_roadmap_id ON public.roadmap_milestones USING btree (roadmap_id);

CREATE INDEX idx_roadmaps_user_id ON public.roadmaps USING btree (user_id);

CREATE INDEX idx_scores_attempt_id ON public.scores USING btree (attempt_id);

CREATE INDEX idx_scores_status ON public.scores USING btree (status);

CREATE INDEX idx_session_log_user_id ON public.session_log USING btree (user_id);

CREATE INDEX idx_sessions_user_id ON public.sessions USING btree (user_id);

CREATE INDEX idx_users_tenant_id ON public.users USING btree (tenant_id);

ALTER TABLE ONLY public.access_logs
    ADD CONSTRAINT access_logs_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.attempts(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.activity_log
    ADD CONSTRAINT activity_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.attempts
    ADD CONSTRAINT attempts_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id);

ALTER TABLE ONLY public.attempts
    ADD CONSTRAINT attempts_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.auth_sessions
    ADD CONSTRAINT auth_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.coach_turns
    ADD CONSTRAINT coach_turns_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.cohorts
    ADD CONSTRAINT cohorts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.consent_records
    ADD CONSTRAINT consent_records_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.email_verification_tokens
    ADD CONSTRAINT email_verification_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.exam_parts
    ADD CONSTRAINT exam_parts_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.exam_parts
    ADD CONSTRAINT exam_parts_item_type_id_fkey FOREIGN KEY (item_type_id) REFERENCES public.item_types(id);

ALTER TABLE ONLY public.external_results
    ADD CONSTRAINT external_results_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.features
    ADD CONSTRAINT features_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.attempts(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.item_audio
    ADD CONSTRAINT item_audio_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_item_type_id_fkey FOREIGN KEY (item_type_id) REFERENCES public.item_types(id);

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.participant_profiles
    ADD CONSTRAINT participant_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.placements
    ADD CONSTRAINT placements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.progress_stats
    ADD CONSTRAINT progress_stats_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.readiness
    ADD CONSTRAINT readiness_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.readiness
    ADD CONSTRAINT readiness_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.review_queue
    ADD CONSTRAINT review_queue_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.attempts(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.review_queue
    ADD CONSTRAINT review_queue_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.roadmap_milestones
    ADD CONSTRAINT roadmap_milestones_roadmap_id_fkey FOREIGN KEY (roadmap_id) REFERENCES public.roadmaps(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.roadmaps
    ADD CONSTRAINT roadmaps_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.scores
    ADD CONSTRAINT scores_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.attempts(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.session_log
    ADD CONSTRAINT session_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.skill_stats
    ADD CONSTRAINT skill_stats_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES public.achievements(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);

-- Down Migration
-- Not intended to be rolled back — this is a recorded baseline, not a real step.
