--
-- PostgreSQL database dump
--

\restrict nX3CZFDUyUTgy0WGgjhaRe3aEAezKa7Ax8T2rhauCAwinooW1UtvFaFlQBvOXbU

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

-- Started on 2025-11-23 21:02:53

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 5301 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- TOC entry 244 (class 1259 OID 17880)
-- Name: adoptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.adoptions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.adoptions_id_seq OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 224 (class 1259 OID 17505)
-- Name: adoptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.adoptions (
    id integer DEFAULT nextval('public.adoptions_id_seq'::regclass) NOT NULL,
    cat_id integer NOT NULL,
    applicant_id integer NOT NULL,
    statement_letter_path character varying(255),
    status character varying(50) NOT NULL,
    applied_at timestamp without time zone NOT NULL,
    verified_at timestamp without time zone,
    updated_at timestamp without time zone NOT NULL,
    CONSTRAINT check_adoption_status CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'completed'::character varying])::text[])))
);


ALTER TABLE public.adoptions OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 17736)
-- Name: cat_facts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cat_facts (
    id integer NOT NULL,
    fact_text text NOT NULL,
    source character varying(255),
    image_path character varying(255),
    is_verified boolean DEFAULT false,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.cat_facts OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 17878)
-- Name: cats_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cats_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cats_id_seq OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 17488)
-- Name: cats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cats (
    id integer DEFAULT nextval('public.cats_id_seq'::regclass) NOT NULL,
    shelter_id integer NOT NULL,
    name character varying(255) NOT NULL,
    age integer,
    gender character varying(50) NOT NULL,
    breed character varying(255),
    description text,
    health_status text,
    adoption_status character varying(50) NOT NULL,
    photo character varying(255),
    CONSTRAINT check_cat_adoption_status CHECK (((adoption_status)::text = ANY ((ARRAY['available'::character varying, 'pending'::character varying, 'adopted'::character varying])::text[]))),
    CONSTRAINT check_cat_gender CHECK (((gender)::text = ANY ((ARRAY['male'::character varying, 'female'::character varying])::text[])))
);


ALTER TABLE public.cats OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 17600)
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_messages (
    id integer NOT NULL,
    assignment_id integer NOT NULL,
    sender_id integer NOT NULL,
    message text NOT NULL,
    created_at timestamp without time zone DEFAULT now() CONSTRAINT chat_messages_sent_at_not_null NOT NULL
);


ALTER TABLE public.chat_messages OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 19943)
-- Name: chat_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.chat_messages ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.chat_messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 246 (class 1259 OID 19264)
-- Name: comment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.comment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comment_id_seq OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 17640)
-- Name: comment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comment (
    id integer DEFAULT nextval('public.comment_id_seq'::regclass) NOT NULL,
    user_id integer NOT NULL,
    post_id integer NOT NULL,
    content text NOT NULL,
    likes_count integer DEFAULT 0,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.comment OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 19289)
-- Name: community_post; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.community_post (
    id integer CONSTRAINT community_post_id_not_null1 NOT NULL,
    author_id integer CONSTRAINT community_post_author_id_not_null1 NOT NULL,
    title character varying(255),
    content text CONSTRAINT community_post_content_not_null1 NOT NULL,
    media_path character varying(255),
    likes_count integer DEFAULT 0,
    created_at timestamp without time zone CONSTRAINT community_post_created_at_not_null1 NOT NULL,
    updated_at timestamp without time zone CONSTRAINT community_post_updated_at_not_null1 NOT NULL
);


ALTER TABLE public.community_post OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 19268)
-- Name: community_post_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.community_post_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.community_post_id_seq OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 19288)
-- Name: community_post_id_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.community_post_id_seq1
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.community_post_id_seq1 OWNER TO postgres;

--
-- TOC entry 5302 (class 0 OID 0)
-- Dependencies: 250
-- Name: community_post_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.community_post_id_seq1 OWNED BY public.community_post.id;


--
-- TOC entry 220 (class 1259 OID 17409)
-- Name: detail_user_individu; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detail_user_individu (
    id integer NOT NULL,
    full_name character varying(255) NOT NULL,
    birth_date date,
    gender character varying(50),
    profile_picture character varying(255),
    bio text,
    contact_phone character varying(255),
    address text,
    job character varying(255),
    nik character varying(255),
    ktp_file_path character varying(255),
    is_verified boolean DEFAULT false,
    is_adopter_ready boolean DEFAULT false,
    donasi_history_count integer DEFAULT 0,
    CONSTRAINT check_individu_gender CHECK (((gender)::text = ANY ((ARRAY['male'::character varying, 'female'::character varying])::text[])))
);


ALTER TABLE public.detail_user_individu OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 17428)
-- Name: detail_user_shelter; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detail_user_shelter (
    id integer NOT NULL,
    shelter_name character varying(255) NOT NULL,
    established_date date,
    organization_type character varying(50) NOT NULL,
    shelter_picture character varying(255),
    bio text,
    contact_phone character varying(255),
    legal_certificate character varying(255),
    donation_account_number character varying(255),
    pj_name character varying(255) NOT NULL,
    pj_nik character varying(255),
    is_verified_shelter boolean DEFAULT false,
    cat_capacity integer DEFAULT 0,
    latitude numeric(10,8),
    longitude numeric(11,8),
    qr_img character varying(255),
    CONSTRAINT check_org_type CHECK (((organization_type)::text = ANY ((ARRAY['Yayasan'::character varying, 'Komunitas'::character varying, 'Pribadi'::character varying])::text[])))
);


ALTER TABLE public.detail_user_shelter OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 17693)
-- Name: donations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.donations (
    id integer NOT NULL,
    donatur_id integer NOT NULL,
    shelter_id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    donation_date timestamp without time zone NOT NULL,
    is_anonymus boolean DEFAULT false,
    payment_method character varying(50),
    proof_file character varying(255)
);


ALTER TABLE public.donations OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 18341)
-- Name: donations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.donations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.donations_id_seq OWNER TO postgres;

--
-- TOC entry 5303 (class 0 OID 0)
-- Dependencies: 245
-- Name: donations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.donations_id_seq OWNED BY public.donations.id;


--
-- TOC entry 242 (class 1259 OID 17858)
-- Name: driver_locations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.driver_locations (
    id integer NOT NULL,
    driver_id character varying(50) NOT NULL,
    assignment_id integer NOT NULL,
    latitude numeric(10,8),
    longitude numeric(11,8),
    "timestamp" timestamp with time zone NOT NULL
);


ALTER TABLE public.driver_locations OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 17857)
-- Name: driver_locations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.driver_locations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.driver_locations_id_seq OWNER TO postgres;

--
-- TOC entry 5304 (class 0 OID 0)
-- Dependencies: 241
-- Name: driver_locations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.driver_locations_id_seq OWNED BY public.driver_locations.id;


--
-- TOC entry 222 (class 1259 OID 17450)
-- Name: drivers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.drivers (
    id character varying(50) NOT NULL,
    user_id integer NOT NULL,
    shelter_id integer NOT NULL,
    is_available boolean DEFAULT true,
    license_info character varying(255),
    full_name character varying(255) NOT NULL,
    contact_phone character varying(20),
    profile_picture character varying(255)
);


ALTER TABLE public.drivers OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 17747)
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events (
    id integer NOT NULL,
    organizer_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    event_date date NOT NULL,
    start_time time without time zone NOT NULL,
    location_name character varying(255) NOT NULL,
    location_address text NOT NULL,
    registration_link character varying(255),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.events OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 17769)
-- Name: faq; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.faq (
    id integer NOT NULL,
    question text NOT NULL,
    answer text NOT NULL
);


ALTER TABLE public.faq OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 17526)
-- Name: favorite_cats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.favorite_cats (
    user_id integer NOT NULL,
    cat_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.favorite_cats OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 17812)
-- Name: global_achievements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.global_achievements (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    target_condition character varying(50) NOT NULL,
    points integer NOT NULL
);


ALTER TABLE public.global_achievements OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 17811)
-- Name: global_achievements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.global_achievements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.global_achievements_id_seq OWNER TO postgres;

--
-- TOC entry 5305 (class 0 OID 0)
-- Dependencies: 235
-- Name: global_achievements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.global_achievements_id_seq OWNED BY public.global_achievements.id;


--
-- TOC entry 238 (class 1259 OID 17827)
-- Name: global_quests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.global_quests (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    target_value numeric(10,2) NOT NULL,
    points integer NOT NULL,
    type character varying(50) NOT NULL
);


ALTER TABLE public.global_quests OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 17826)
-- Name: global_quests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.global_quests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.global_quests_id_seq OWNER TO postgres;

--
-- TOC entry 5306 (class 0 OID 0)
-- Dependencies: 237
-- Name: global_quests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.global_quests_id_seq OWNED BY public.global_quests.id;


--
-- TOC entry 253 (class 1259 OID 19319)
-- Name: lost_cats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lost_cats (
    id integer NOT NULL,
    owner_id integer NOT NULL,
    name character varying(100) NOT NULL,
    age integer,
    breed character varying(100),
    color character varying(100),
    description text,
    last_seen_address text,
    last_seen_lat numeric(10,8),
    last_seen_long numeric(11,8),
    photo character varying(255),
    reward_amount numeric(12,2) DEFAULT 0,
    status character varying(20) DEFAULT 'searching'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.lost_cats OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 19318)
-- Name: lost_cats_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lost_cats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lost_cats_id_seq OWNER TO postgres;

--
-- TOC entry 5307 (class 0 OID 0)
-- Dependencies: 252
-- Name: lost_cats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lost_cats_id_seq OWNED BY public.lost_cats.id;


--
-- TOC entry 249 (class 1259 OID 19270)
-- Name: post_likes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post_likes (
    user_id integer NOT NULL,
    post_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.post_likes OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 19266)
-- Name: reply_comment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reply_comment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reply_comment_id_seq OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 17664)
-- Name: reply_comment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reply_comment (
    id integer DEFAULT nextval('public.reply_comment_id_seq'::regclass) NOT NULL,
    user_id integer NOT NULL,
    comment_id integer NOT NULL,
    parent_reply_id integer,
    content text NOT NULL,
    likes_count integer DEFAULT 0,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.reply_comment OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 19344)
-- Name: reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reports (
    id integer CONSTRAINT reports_id_not_null1 NOT NULL,
    reporter_id integer CONSTRAINT reports_reporter_id_not_null1 NOT NULL,
    report_type character varying(50) CONSTRAINT reports_report_type_not_null1 NOT NULL,
    lost_cat_id integer,
    shelter_assigned_id integer,
    location character varying(255) CONSTRAINT reports_location_not_null1 NOT NULL,
    latitude numeric(10,8) CONSTRAINT reports_latitude_not_null1 NOT NULL,
    longitude numeric(11,8) CONSTRAINT reports_longitude_not_null1 NOT NULL,
    description text CONSTRAINT reports_description_not_null1 NOT NULL,
    photo character varying(255) CONSTRAINT reports_photo_not_null1 NOT NULL,
    report_date date CONSTRAINT reports_report_date_not_null1 NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT check_report_type CHECK (((report_type)::text = ANY ((ARRAY['stray'::character varying, 'missing'::character varying])::text[])))
);


ALTER TABLE public.reports OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 19343)
-- Name: reports_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reports_id_seq OWNER TO postgres;

--
-- TOC entry 5308 (class 0 OID 0)
-- Dependencies: 254
-- Name: reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reports_id_seq OWNED BY public.reports.id;


--
-- TOC entry 258 (class 1259 OID 19902)
-- Name: rescue_assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rescue_assignments (
    id integer NOT NULL,
    tracking_id character varying(50) NOT NULL,
    report_id integer NOT NULL,
    driver_id character varying(50) NOT NULL,
    shelter_id integer NOT NULL,
    assignment_status character varying(50) NOT NULL,
    assigned_at timestamp without time zone DEFAULT now(),
    pickup_time timestamp without time zone,
    completion_time timestamp without time zone,
    pickup_photo character varying(255),
    dropoff_photo character varying(255),
    notes text
);


ALTER TABLE public.rescue_assignments OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 19901)
-- Name: rescue_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rescue_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rescue_assignments_id_seq OWNER TO postgres;

--
-- TOC entry 5309 (class 0 OID 0)
-- Dependencies: 257
-- Name: rescue_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rescue_assignments_id_seq OWNED BY public.rescue_assignments.id;


--
-- TOC entry 240 (class 1259 OID 17839)
-- Name: user_progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_progress (
    id integer NOT NULL,
    user_id integer NOT NULL,
    global_item_id integer NOT NULL,
    item_type character varying(50) NOT NULL,
    current_progress numeric(10,2) DEFAULT 0.0,
    is_completed boolean DEFAULT false,
    completed_at timestamp with time zone,
    CONSTRAINT check_item_type CHECK (((item_type)::text = ANY ((ARRAY['QUEST'::character varying, 'ACHIEVEMENT'::character varying])::text[])))
);


ALTER TABLE public.user_progress OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 17838)
-- Name: user_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_progress_id_seq OWNER TO postgres;

--
-- TOC entry 5310 (class 0 OID 0)
-- Dependencies: 239
-- Name: user_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_progress_id_seq OWNED BY public.user_progress.id;


--
-- TOC entry 219 (class 1259 OID 17393)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(50) NOT NULL,
    CONSTRAINT check_user_role CHECK (((role)::text = ANY ((ARRAY['shelter'::character varying, 'individu'::character varying, 'admin'::character varying, 'driver'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 17802)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.users ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 230 (class 1259 OID 17714)
-- Name: verification_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.verification_log (
    id integer NOT NULL,
    user_id integer NOT NULL,
    verifier_id integer,
    verification_type character varying(50) NOT NULL,
    status character varying(50) NOT NULL,
    notes text,
    created_at timestamp without time zone NOT NULL,
    CONSTRAINT check_verification_status CHECK (((status)::text = ANY ((ARRAY['approved'::character varying, 'rejected'::character varying])::text[]))),
    CONSTRAINT check_verification_type CHECK (((verification_type)::text = ANY ((ARRAY['Adoption_Application'::character varying, 'Initial_Data_Check'::character varying, 'Follow_Up'::character varying])::text[])))
);


ALTER TABLE public.verification_log OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 19385)
-- Name: verification_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.verification_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.verification_log_id_seq OWNER TO postgres;

--
-- TOC entry 5311 (class 0 OID 0)
-- Dependencies: 256
-- Name: verification_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.verification_log_id_seq OWNED BY public.verification_log.id;


--
-- TOC entry 4989 (class 2604 OID 19292)
-- Name: community_post id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.community_post ALTER COLUMN id SET DEFAULT nextval('public.community_post_id_seq1'::regclass);


--
-- TOC entry 4977 (class 2604 OID 18342)
-- Name: donations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.donations ALTER COLUMN id SET DEFAULT nextval('public.donations_id_seq'::regclass);


--
-- TOC entry 4987 (class 2604 OID 17861)
-- Name: driver_locations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_locations ALTER COLUMN id SET DEFAULT nextval('public.driver_locations_id_seq'::regclass);


--
-- TOC entry 4982 (class 2604 OID 17815)
-- Name: global_achievements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.global_achievements ALTER COLUMN id SET DEFAULT nextval('public.global_achievements_id_seq'::regclass);


--
-- TOC entry 4983 (class 2604 OID 17830)
-- Name: global_quests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.global_quests ALTER COLUMN id SET DEFAULT nextval('public.global_quests_id_seq'::regclass);


--
-- TOC entry 4991 (class 2604 OID 19322)
-- Name: lost_cats id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lost_cats ALTER COLUMN id SET DEFAULT nextval('public.lost_cats_id_seq'::regclass);


--
-- TOC entry 4995 (class 2604 OID 19347)
-- Name: reports id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports ALTER COLUMN id SET DEFAULT nextval('public.reports_id_seq'::regclass);


--
-- TOC entry 4997 (class 2604 OID 19905)
-- Name: rescue_assignments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_assignments ALTER COLUMN id SET DEFAULT nextval('public.rescue_assignments_id_seq'::regclass);


--
-- TOC entry 4984 (class 2604 OID 17842)
-- Name: user_progress id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_progress ALTER COLUMN id SET DEFAULT nextval('public.user_progress_id_seq'::regclass);


--
-- TOC entry 4979 (class 2604 OID 19386)
-- Name: verification_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification_log ALTER COLUMN id SET DEFAULT nextval('public.verification_log_id_seq'::regclass);


--
-- TOC entry 5260 (class 0 OID 17505)
-- Dependencies: 224
-- Data for Name: adoptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.adoptions (id, cat_id, applicant_id, statement_letter_path, status, applied_at, verified_at, updated_at) FROM stdin;
1	3	20	/docs/stmt_andi_1.pdf	pending	2025-11-15 15:00:00	\N	2025-11-15 15:00:00
3	7	3	/docs/stmt_mimi.pdf	completed	2025-10-01 10:00:00	2025-10-03 14:00:00	2025-10-05 09:00:00
4	8	3	/docs/stmt_popo.pdf	completed	2025-10-05 11:00:00	2025-10-06 16:00:00	2025-10-08 10:30:00
5	9	3	/docs/stmt_lili.pdf	completed	2025-10-10 09:00:00	2025-10-12 13:00:00	2025-10-14 11:00:00
6	10	3	/docs/stmt_gembul.pdf	completed	2025-10-15 14:00:00	2025-10-17 10:00:00	2025-10-20 15:00:00
7	11	3	/docs/stmt_chiko.pdf	completed	2025-10-20 08:00:00	2025-10-21 11:00:00	2025-10-23 16:00:00
8	3	3	identity-3-1763694145368	pending	2025-11-21 10:02:28.366243	\N	2025-11-21 10:02:28.366243
9	1	3	identity-3-1763694328683.jpg	pending	2025-11-21 10:05:28.846627	\N	2025-11-21 10:05:28.846627
13	3	3	stmt-3-1763696749954.jpg	pending	2025-11-21 10:45:50.067367	\N	2025-11-21 10:45:50.067367
15	1	3	stmt-3-1763715415886.jpg	approved	2025-11-21 15:56:56.107382	2025-11-22 11:26:00.67123	2025-11-21 15:56:56.107382
14	2	8	stmt-8-1763697336774.jpg	rejected	2025-11-21 10:55:36.921567	2025-11-22 11:27:22.732092	2025-11-21 10:55:36.921567
12	1	3	stmt-3-1763696674748.jpg	approved	2025-11-21 10:44:34.873486	2025-11-22 11:36:24.295958	2025-11-21 10:44:34.873486
11	1	3	stmt-3-1763695418652.jpg	rejected	2025-11-21 10:23:38.775822	2025-11-22 11:36:41.785481	2025-11-21 10:23:38.775822
2	6	20	/docs/surat_pernyataan_andi_luna.pdf	rejected	2025-11-20 10:00:00	2025-11-22 12:04:03.386386	2025-11-20 10:00:00
10	1	3	stmt-3-1763695099635.jpg	approved	2025-11-21 10:18:19.808177	2025-11-22 12:32:03.885964	2025-11-21 10:18:19.808177
\.


--
-- TOC entry 5267 (class 0 OID 17736)
-- Dependencies: 231
-- Data for Name: cat_facts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cat_facts (id, fact_text, source, image_path, is_verified, created_at) FROM stdin;
1	Kucing menghabiskan 70% hidupnya untuk tidur.	\N	\N	t	2025-01-01 00:00:00
2	Grup kucing disebut clowder.	\N	\N	t	2025-01-01 00:00:00
\.


--
-- TOC entry 5259 (class 0 OID 17488)
-- Dependencies: 223
-- Data for Name: cats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cats (id, shelter_id, name, age, gender, breed, description, health_status, adoption_status, photo) FROM stdin;
6	4	Luna	12	female	Domestik	Sangat aktif dan suka bermain.	healthy	available	luna.jpg
7	4	Mimi	12	female	Domestik	Kucing calico yang tenang.	vaccinated	adopted	mimi.jpg
8	4	Popo	24	male	Persia	Sangat manja dan suka disisir.	healthy	adopted	popo.jpg
9	4	Lili	5	female	Anggora	Aktif bermain bola.	vaccinated	adopted	lili.jpg
10	4	Gembul	36	male	British Shorthair	Suka tidur seharian.	healthy	adopted	gembul.jpg
11	4	Chiko	18	male	Domestik	Pandai berburu mainan tikus.	vaccinated	adopted	chiko.jpg
4	10	Mueza	8	female	Persia	Manis, lembut, dan suka tidur di pangkuan.	healthy	available	cat-1763899862115.png
2	10	Abul	5	male	Domestik	Kucing pemalu tapi sangat manja jika sudah kenal.	healthy	available	cat-1763899939370.png
1	10	Oyen	6	male	American Shorthair	Suka mencari keributan di komplek. Sering terlihat mencuri ikan asin tetangga.	vaccinated	adopted	cat-1763900718450.png
3	11	Simba	23	male	Maine Coon	Gagah dan berani, cocok untuk menjaga rumah dari tikus.	vaccinated	available	cat-1763901553570.png
5	11	Kitty	36	female	Anggora	Tenang dan penyayang, sudah diadopsi.	vaccinated	adopted	cat-1763901780059.png
14	11	Milo	12	male	Sphynx	Kucingnya baik, suka bikin nyaman, gak berisik	healthy	available	cat-1763901999237.png
\.


--
-- TOC entry 5262 (class 0 OID 17600)
-- Dependencies: 226
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chat_messages (id, assignment_id, sender_id, message, created_at) FROM stdin;
1	2	30	Halo, saya driver Budi, sudah di jalan menuju lokasi Anda.	2025-11-18 10:35:00
2	2	20	Baik, Pak Budi. Hati-hati ya!	2025-11-18 10:36:00
5	4	30	hai	2025-11-22 21:57:20.236762
6	4	30	te	2025-11-22 22:12:31.006092
7	4	30	aku	2025-11-22 22:13:09.03392
8	4	3	pak	2025-11-22 22:17:57.352386
9	4	3	d	2025-11-22 22:21:49.168762
10	4	3	d	2025-11-22 22:21:50.243244
11	4	3	s	2025-11-22 22:24:53.58449
12	7	3	halo pak	2025-11-23 15:48:29.340879
13	7	3	hai	2025-11-23 15:48:50.149796
14	7	3	pak	2025-11-23 16:04:19.40557
15	7	19	iyaa kenapa	2025-11-23 16:05:02.52588
17	7	19	sudah beres kak	2025-11-23 16:13:29.682756
18	4	3	Pak	2025-11-23 16:16:23.227417
19	4	3	udah dimana	2025-11-23 16:16:26.632024
20	4	3	kok lama	2025-11-23 16:16:28.192969
21	5	10	tes	2025-11-23 17:10:19.650416
22	5	31	hai	2025-11-23 17:11:47.729474
\.


--
-- TOC entry 5263 (class 0 OID 17640)
-- Dependencies: 227
-- Data for Name: comment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comment (id, user_id, post_id, content, likes_count, created_at, updated_at) FROM stdin;
1	21	1	Mungkin dia kekurangan serat, coba berikan rumput gandum khusus.	0	2025-11-17 10:00:00	2025-11-17 10:00:00
2	10	1	Pastikan daunnya bukan tanaman beracun ya!	0	2025-11-17 10:15:00	2025-11-17 10:15:00
6	8	3	Setuju banget, sterilisasi penting!	5	2025-11-21 11:46:30.487798	2025-11-21 12:46:30.487798
7	3	3	Kucingku juga baru disteril minggu lalu.	2	2025-11-21 12:16:30.487798	2025-11-21 12:46:30.487798
8	7	4	Lucu banget! Semoga cepet dapet rumah ya ??	10	2025-11-21 02:46:30.509331	2025-11-21 12:46:30.509331
9	8	4	Lokasi Jaksel mananya kak?	1	2025-11-21 03:46:30.509331	2025-11-21 12:46:30.509331
10	3	5	Ya ampun kasian banget ?? Makasih udah nolongin.	15	2025-11-21 11:46:31.892335	2025-11-21 12:46:31.892335
11	3	4	Waww lucu banget kucingnya	0	2025-11-21 12:48:16.854381	2025-11-21 12:48:16.854381
12	3	3	Repa kucingnya nemu dimana	0	2025-11-21 12:49:02.43406	2025-11-21 12:49:02.43406
3	3	2	Wahh mantap tuh	0	2025-11-21 12:26:26.108816	2025-11-21 12:26:26.108816
4	3	2	Aku suka yang gratis gratisan	0	2025-11-21 12:26:28.495234	2025-11-21 12:26:28.495234
5	3	2	Info lengkapnya dimana minn	0	2025-11-21 12:26:30.229729	2025-11-21 12:26:30.229729
13	3	3	haloo	0	2025-11-21 13:19:56.856494	2025-11-21 13:19:56.856494
14	5	3	Kalau ada yang mau share pengalaman boleh komen juga yaa	0	2025-11-21 13:21:23.075208	2025-11-21 13:21:23.075208
15	4	2	siapa nihh yang suka gratis gratisan	0	2025-11-21 16:28:42.508147	2025-11-21 16:28:42.508147
16	14	2	halo aku login dari google ternyata bisa lohh	0	2025-11-22 14:00:32.417209	2025-11-22 14:00:32.417209
17	14	5	nooo	0	2025-11-22 15:20:32.971813	2025-11-22 15:20:32.971813
\.


--
-- TOC entry 5287 (class 0 OID 19289)
-- Dependencies: 251
-- Data for Name: community_post; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.community_post (id, author_id, title, content, media_path, likes_count, created_at, updated_at) FROM stdin;
4	6	3 Anak Kucing Butuh Rumah Baru	Halo Cat Lovers! Aku lagi foster 3 anak kucing manis yang ditemukan di depan rumah. Usianya sekitar 2 bulan, sudah bisa makan wet food dan pup di pasir. Semuanya sehat dan manja. Butuh rumah baru yang sayang sama mereka. Lokasi di Jakarta Selatan.	postingan2.png	1113	2025-11-20 18:46:30.358292	2025-11-21 12:46:30.358292
5	7	Kucing Terlantar di Depan Minimarket	Teman-teman, tadi pagi aku lihat seekor kucing betina kurus banget di depan minimarket deket rumah. Kayaknya habis melahirkan dan kelaparan. Aku udah kasih makan, tapi kasian banget. Ada yang bisa bantu foster atau adopsi? Please bantu share ya.	postingan3.jpg	878	2025-11-21 09:46:30.38444	2025-11-21 12:46:30.38444
2	10	Info Steril Gratis	Kami membuka kuota sterilisasi gratis bulan ini!	\N	2	2025-11-18 10:00:00	2025-11-18 10:00:00
1	20	Tanya Dokter Hewan	Kucing saya Si Putih suka makan daun, apakah normal?	\N	2	2025-11-17 09:00:00	2025-11-17 09:00:00
3	5	Kenapa Sterilisasi itu Penting?	Halo semua, aku mau share pengalaman tentang sterilisasi kucing. Ternyata banyak banget manfaatnya, bukan cuma untuk mengontrol populasi, tapi juga bagus untuk kesehatan si kucing dalam jangka panjang. Kucingku jadi lebih tenang dan gak gampang stres.	postingan1.png	2159	2025-11-21 10:46:30.278576	2025-11-21 12:46:30.278576
\.


--
-- TOC entry 5256 (class 0 OID 17409)
-- Dependencies: 220
-- Data for Name: detail_user_individu; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detail_user_individu (id, full_name, birth_date, gender, profile_picture, bio, contact_phone, address, job, nik, ktp_file_path, is_verified, is_adopter_ready, donasi_history_count) FROM stdin;
5	Repa Pitriani	2005-11-05	female	profile-5-1763874685690.jpg	Aku adalah pencinta kucing asal cianjur		alamat belum diverifikasi	Unknown	32731763530891182975	\N	f	f	3
6	Salman	\N	\N	profile-6-1763896611740.png	\N		\N	\N	\N	\N	f	f	0
9	Renata	2017-01-05	female	profile-9-1763896789387.png	Aku adalah pencinta kucing yang slayy		\N	\N	\N	\N	f	f	0
13	Harri Supriadi	2006-07-31	male	profile-13-1763897083541.jpg	Jangan main main sama aku nanti aku kamu hack!		\N	\N	\N	\N	f	f	0
8	Anas Miftahul Falah	2006-01-29	male	profile-8-1763733550208.JPG	saya adalah manusia bekasi	085850603147	Bekasi	Mahasiswa	3232290120060008	ktp-8-1763697336713.jpg	f	f	0
2	Michael 36	2006-06-30	male	profile-2-1763897297728.png			alamat belum diverifikasi	Pelajar	3273100101900005	\N	f	f	0
7	Ajipati Alaga	2025-11-28	male	profile-7-1763736794424.JPG			\N	\N	\N	\N	f	f	0
12	Najmi Alifah Hilmiya	2006-02-22	female	profile-12-1763737054294.JPG			\N	\N	\N	\N	f	f	0
3	Muhammad 'Azmi Salam	2006-06-30	male	profile-3-1763789466019.jpg	saya adalah pencinta kucing dari umur 3 tahun, nama kucing tercinta saya sejak kecil adalah son goku.	085850603196	RA Ulul 'Azmi Kulalet, RT. 01/RW. 09, Kec. Baleendah, Kab. Bandung, Prov. Jawa Barat	Mahasiswa	3204323006060008	ktp-3-1763715415771.jpg	t	t	6
14	MUHAMMAD 'AZMI SALAM	\N	\N	https://lh3.googleusercontent.com/a/ACg8ocI4jlNMYTBjIfhPbtnoE2jVuCq4bTJx6saVHC59qzipgGeK-w=s96-c	\N	\N	\N	\N	\N	\N	t	f	0
15	CACICU	\N	\N	https://lh3.googleusercontent.com/a/ACg8ocLCis_yrjICEgKAUmE0oASbrAYVjrGzTsaZIyTr6ZfTWcHfMw=s96-c	\N	\N	\N	\N	\N	\N	t	f	0
\.


--
-- TOC entry 5257 (class 0 OID 17428)
-- Dependencies: 221
-- Data for Name: detail_user_shelter; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detail_user_shelter (id, shelter_name, established_date, organization_type, shelter_picture, bio, contact_phone, legal_certificate, donation_account_number, pj_name, pj_nik, is_verified_shelter, cat_capacity, latitude, longitude, qr_img) FROM stdin;
16	Muhammad 'Azmi	\N	Komunitas	https://lh3.googleusercontent.com/a/ACg8ocJoWXti03NhQHj4U8_eAkJBg5zPgdMVwH6wXCXISxkVlkU4fg=s96-c	\N	\N	\N	\N	Muhammad 'Azmi	\N	f	0	\N	\N	\N
4	Shelter Gerlong	2024-12-21	Komunitas	\N	\N		\N	\N	Ahkam Ibadurrahman	3273PJ87252	f	0	\N	\N	qr1.jpg
10	Rumah Kucing Bandung	2015-08-17	Komunitas	\N	\N	0227654321	\N	1234567890	Rina Anggraini	3273zzzzzzzzzzzz	t	50	-6.91750000	107.61910000	qr2.jpg
11	Panti Cat Sejahtera	2010-02-28	Yayasan	\N	\N	0219876543	\N	0987654321	Joko Susilo	3174yyyyyyyyyyyy	t	100	-6.20880000	106.84560000	qr3.jpg
\.


--
-- TOC entry 5265 (class 0 OID 17693)
-- Dependencies: 229
-- Data for Name: donations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.donations (id, donatur_id, shelter_id, amount, donation_date, is_anonymus, payment_method, proof_file) FROM stdin;
1	21	10	50000.00	2025-11-16 22:54:52.863077	f	\N	\N
2	20	10	100000.00	2025-11-16 05:44:54.237741	f	\N	\N
3	21	11	20000.00	2025-11-17 14:43:32.562628	t	\N	\N
4	3	4	500000.00	2025-11-21 03:34:41.42546	f	qris	proof-1763660026008.jpg
5	3	4	500000.00	2025-11-21 09:33:26.242767	f	qris	proof-1763660145108.jpg
6	3	4	50000.00	2025-11-21 15:23:44.300268	f	qris	proof-1763660753440.jpg
7	3	4	50000.00	2025-11-21 17:52:14.760903	f	qris	proof-1763660857736.jpg
8	3	11	150000.00	2025-11-21 06:51:43.382181	f	qris	proof-1763661284666.jpg
9	5	4	150000.00	2025-11-21 01:41:00.813271	f	qris	proof-1763664060782.jpg
10	3	10	150000.00	2025-11-22 10:56:26.245511	f	qris	proof-1763783786008.png
11	5	11	20000.00	2025-11-22 19:37:06.087246	f	qris	proof-1763815025889.JPG
12	5	10	50000.00	2025-11-23 09:09:23.909739	f	qris	proof-1763863763794.png
\.


--
-- TOC entry 5278 (class 0 OID 17858)
-- Dependencies: 242
-- Data for Name: driver_locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.driver_locations (id, driver_id, assignment_id, latitude, longitude, "timestamp") FROM stdin;
141	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:20:38.367298+07
142	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:20:43.089871+07
143	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:20:48.073516+07
144	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:20:53.143816+07
145	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:20:58.068876+07
146	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:21:03.066521+07
147	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:21:08.229957+07
148	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:21:13.07033+07
149	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:21:18.682151+07
150	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:21:23.567851+07
151	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:21:28.570346+07
152	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:21:33.666922+07
153	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:21:38.600276+07
154	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:21:43.575379+07
155	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:21:48.652988+07
156	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:21:53.565228+07
157	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:21:58.569885+07
158	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:22:03.761343+07
159	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:22:08.573452+07
160	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:22:13.091339+07
161	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:22:18.124716+07
162	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:22:23.081546+07
163	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:22:28.136482+07
164	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:22:33.567895+07
165	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:22:38.636821+07
166	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:22:43.081943+07
167	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:22:48.092147+07
168	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:22:53.141826+07
169	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:22:58.11064+07
170	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:23:03.670607+07
171	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:23:08.607596+07
172	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:23:13.714653+07
173	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:23:18.630401+07
174	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:23:23.741071+07
175	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:23:28.599658+07
176	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:23:33.568768+07
177	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:23:38.671182+07
178	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:23:43.598326+07
181	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:25:19.561219+07
217	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:07:46.00181+07
218	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:07:51.647879+07
219	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:07:56.575913+07
220	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:08:01.004285+07
221	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:08:06.415007+07
222	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:08:10.992429+07
223	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:08:16.001259+07
224	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:08:21.628981+07
225	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:08:26.607371+07
226	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:08:31.649269+07
227	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:08:36.575641+07
228	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:08:41.584689+07
229	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:08:46.585318+07
230	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:08:51.589958+07
231	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:08:56.748003+07
232	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:09:01.577601+07
233	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:09:06.574989+07
234	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:09:11.737332+07
235	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:09:16.567594+07
236	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:09:21.02264+07
237	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:09:26.117402+07
238	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:09:31.006972+07
239	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:09:36.633005+07
240	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:09:41.585526+07
241	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:09:46.674709+07
242	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:09:51.50773+07
243	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:09:56.017589+07
244	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:10:01.799975+07
245	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:10:06.614827+07
246	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:10:16.341677+07
247	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:10:21.562547+07
248	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:10:26.247785+07
249	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:10:31.336384+07
250	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:10:36.243688+07
251	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:10:41.35646+07
252	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:10:46.257282+07
253	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:10:51.250884+07
254	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:10:56.379759+07
255	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:11:01.248977+07
256	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:11:06.24666+07
257	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:11:11.35668+07
258	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:11:16.252301+07
259	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:11:21.243927+07
260	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:11:26.343607+07
261	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:11:31.245899+07
262	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:11:36.244724+07
263	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:11:41.350764+07
264	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:11:46.569824+07
265	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:11:51.921011+07
266	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:11:56.581998+07
267	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:12:01.565799+07
268	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:12:06.645759+07
269	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:12:11.574096+07
270	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:12:16.252382+07
271	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:12:21.32081+07
272	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:12:26.2482+07
273	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:12:31.337726+07
274	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:12:36.239033+07
275	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:12:41.37682+07
276	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:12:46.256087+07
277	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:12:51.249014+07
278	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:12:56.69216+07
279	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:13:01.573712+07
280	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:13:06.697314+07
281	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:13:11.24515+07
282	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:13:16.239256+07
283	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:13:21.308255+07
284	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:13:26.237125+07
179	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:23:55.271965+07
182	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:26:19.457621+07
183	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:26:23.084686+07
285	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:13:31.306957+07
286	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:13:36.243944+07
287	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:13:41.241327+07
293	DRV-10-002	5	-6.88455680	107.60028160	2025-11-23 17:11:46.630985+07
294	DRV-10-002	5	-6.88455680	107.60028160	2025-11-23 17:11:51.688674+07
295	DRV-10-002	5	-6.88455680	107.60028160	2025-11-23 17:11:56.634444+07
296	DRV-10-002	5	-6.88455680	107.60028160	2025-11-23 17:12:01.795421+07
297	DRV-10-002	5	-6.88455680	107.60028160	2025-11-23 17:12:06.645226+07
298	DRV-10-002	5	-6.88455680	107.60028160	2025-11-23 17:12:11.817985+07
299	DRV-10-002	5	-6.88455680	107.60028160	2025-11-23 17:12:16.631777+07
300	DRV-10-002	5	-6.88455680	107.60028160	2025-11-23 17:12:21.633578+07
301	DRV-10-002	5	-6.88455680	107.60028160	2025-11-23 17:12:26.789153+07
302	DRV-10-002	5	-6.88455680	107.60028160	2025-11-23 17:12:31.627652+07
303	DRV-10-002	5	-6.88455680	107.60028160	2025-11-23 17:12:36.630008+07
304	DRV-10-002	5	-6.88455680	107.60028160	2025-11-23 17:12:41.784064+07
305	DRV-10-002	5	-6.88455680	107.60028160	2025-11-23 17:12:46.631851+07
306	DRV-10-002	5	-6.88455680	107.60028160	2025-11-23 17:12:51.802725+07
307	DRV-10-002	5	-6.88455680	107.60028160	2025-11-23 17:12:56.634073+07
308	DRV-10-002	5	-6.88455680	107.60028160	2025-11-23 17:13:01.810228+07
309	DRV-10-002	5	-6.88455680	107.60028160	2025-11-23 17:13:06.629708+07
310	DRV-10-002	5	-6.88455680	107.60028160	2025-11-23 17:13:11.642245+07
311	DRV-10-002	5	-6.88455680	107.60028160	2025-11-23 17:13:16.797513+07
312	DRV-10-002	5	-6.88455680	107.60028160	2025-11-23 17:13:21.625842+07
1	DRV-10-001	1	-6.91400000	107.60800000	2025-11-19 16:17:54.863664+07
2	DRV-10-001	1	-6.91450000	107.60900000	2025-11-19 16:22:54.863664+07
3	DRV-10-001	1	-6.91470000	107.60980000	2025-11-22 17:29:50.257566+07
4	DRV-10-001	1	-6.91470000	107.60980000	2025-11-22 17:29:54.244456+07
5	DRV-10-001	2	38.77495600	-122.41948600	2025-11-22 18:22:41.878702+07
6	DRV-10-001	2	38.77495600	-122.41948600	2025-11-22 18:22:46.798069+07
7	DRV-10-001	2	38.77495600	-122.41948600	2025-11-22 18:22:51.793425+07
8	DRV-10-001	2	38.77495600	-122.41948600	2025-11-22 18:22:56.796168+07
9	DRV-10-001	2	38.77495600	-122.41948600	2025-11-22 18:23:01.798045+07
10	DRV-10-001	2	38.77495600	-122.41948600	2025-11-22 18:23:06.790606+07
11	DRV-10-001	2	38.77495600	-122.41948600	2025-11-22 18:23:19.908496+07
12	DRV-10-001	2	38.77495600	-122.41948600	2025-11-22 18:24:19.929203+07
13	DRV-10-001	2	38.77495600	-122.41948600	2025-11-22 18:24:34.803504+07
14	DRV-10-001	2	38.77495600	-122.41948600	2025-11-22 18:24:39.789662+07
15	DRV-10-001	2	38.77495600	-122.41948600	2025-11-22 18:24:43.949436+07
16	DRV-10-001	2	38.77495600	-122.41948600	2025-11-22 18:24:48.920607+07
17	DRV-10-001	2	38.77495600	-122.41948600	2025-11-22 18:24:53.949204+07
18	DRV-10-001	2	38.77495600	-122.41948600	2025-11-22 18:25:02.569078+07
19	DRV-10-001	2	38.77495600	-122.41948600	2025-11-22 18:25:08.000868+07
20	DRV-10-001	2	38.77495600	-122.41948600	2025-11-22 18:25:12.558918+07
21	DRV-10-001	2	38.77495600	-122.41948600	2025-11-22 18:25:17.550695+07
22	DRV-10-001	2	38.77495600	-122.41948600	2025-11-22 18:25:22.55939+07
23	DRV-10-001	2	38.77495600	-122.41948600	2025-11-22 18:25:27.552529+07
24	DRV-10-001	2	38.77495600	-122.41948600	2025-11-22 18:25:32.568327+07
25	DRV-10-001	2	38.77495600	-122.41948600	2025-11-22 18:25:37.573742+07
26	DRV-10-001	2	38.77495600	-122.41948600	2025-11-22 18:25:42.56639+07
27	DRV-10-001	2	38.77495600	-122.41948600	2025-11-22 18:25:47.57799+07
28	DRV-10-001	2	38.77495600	-122.41948600	2025-11-22 18:25:52.568048+07
29	DRV-10-001	2	38.77495600	-122.41948600	2025-11-22 18:25:57.573954+07
30	DRV-10-001	2	38.77495600	-122.41948600	2025-11-22 18:26:02.568378+07
31	DRV-10-001	2	39.77495600	-122.41948600	2025-11-22 18:26:07.55964+07
32	DRV-10-001	2	39.77495600	-122.41948600	2025-11-22 18:26:12.57107+07
33	DRV-10-001	2	39.77495600	-62.41948600	2025-11-22 18:26:17.591453+07
34	DRV-10-001	2	39.77495600	-62.41948600	2025-11-22 18:26:22.586974+07
35	DRV-10-001	2	39.77495600	-62.41948600	2025-11-22 18:26:27.60362+07
36	DRV-10-001	2	52.52000700	13.40495400	2025-11-22 18:26:32.549374+07
37	DRV-10-001	2	52.52000700	13.40495400	2025-11-22 18:26:37.599382+07
38	DRV-10-001	2	52.52000700	13.40495400	2025-11-22 18:26:42.549881+07
39	DRV-10-001	2	52.52000700	13.40495400	2025-11-22 18:26:47.567056+07
40	DRV-10-001	2	52.52000700	13.40495400	2025-11-22 18:26:52.583347+07
41	DRV-10-001	2	52.52000700	13.40495400	2025-11-22 18:26:57.550531+07
42	DRV-10-001	2	52.52000700	13.40495400	2025-11-22 18:27:02.552856+07
43	DRV-10-001	2	52.52000700	13.40495400	2025-11-22 18:27:07.555625+07
44	DRV-10-001	2	52.52000700	13.40495400	2025-11-22 18:27:12.551123+07
45	DRV-10-001	2	52.52000700	13.40495400	2025-11-22 18:27:19.504483+07
46	DRV-10-001	2	52.52000700	13.40495400	2025-11-22 18:27:24.516757+07
47	DRV-10-001	2	52.52000700	13.40495400	2025-11-22 18:27:29.460905+07
48	DRV-10-001	2	52.52000700	13.40495400	2025-11-22 18:27:34.46709+07
49	DRV-10-001	2	52.52000700	13.40495400	2025-11-22 18:27:39.464033+07
50	DRV-10-001	2	52.52000700	13.40495400	2025-11-22 18:27:44.477484+07
51	DRV-10-001	2	52.52000700	13.40495400	2025-11-22 18:27:49.467004+07
52	DRV-10-001	2	52.52000700	13.40495400	2025-11-22 18:27:54.468461+07
53	DRV-10-001	2	52.52000700	13.40495400	2025-11-22 18:27:59.462907+07
54	DRV-10-001	2	52.52000700	13.40495400	2025-11-22 18:28:04.460811+07
55	DRV-10-001	2	52.52000700	13.40495400	2025-11-22 18:28:09.459258+07
56	DRV-10-001	2	52.52000700	13.40495400	2025-11-22 18:28:14.462829+07
57	DRV-10-001	2	52.52000700	13.40495400	2025-11-22 18:28:19.460366+07
58	DRV-10-001	2	52.52000700	13.40495400	2025-11-22 18:28:24.491104+07
59	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:28:29.681489+07
60	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:28:34.471418+07
61	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:28:39.470615+07
62	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:28:44.548806+07
63	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:28:49.469967+07
64	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:28:54.468911+07
65	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:28:59.56401+07
66	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:29:04.49162+07
67	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:29:09.477908+07
68	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:29:14.618133+07
69	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:29:19.456101+07
70	DRV-10-001	2	37.77492900	-122.41941600	2025-11-22 18:30:03.963455+07
71	DRV-10-001	2	37.77492900	-122.41941600	2025-11-22 18:30:08.942862+07
72	DRV-10-001	2	37.77492900	-122.41941600	2025-11-22 18:30:13.957349+07
73	DRV-10-001	2	37.77492900	-122.41941600	2025-11-22 18:30:19.047416+07
74	DRV-10-001	2	37.77492900	-122.41941600	2025-11-22 18:30:23.958384+07
140	DRV-10-002	3	-6.88455680	107.60028160	2025-11-22 20:46:10.582263+07
75	DRV-10-001	2	35.68948700	139.69170600	2025-11-22 18:30:28.955761+07
76	DRV-10-001	2	35.68948700	139.69170600	2025-11-22 18:30:33.961924+07
77	DRV-10-001	2	35.68948700	139.69170600	2025-11-22 18:30:48.900773+07
78	DRV-10-001	2	35.68948700	139.69170600	2025-11-22 18:30:53.925809+07
79	DRV-10-001	2	35.68948700	139.69170600	2025-11-22 18:30:58.895814+07
80	DRV-10-001	2	35.68948700	139.69170600	2025-11-22 18:31:03.896026+07
81	DRV-10-001	2	35.68948700	139.69170600	2025-11-22 18:31:08.921932+07
82	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:31:14.011796+07
83	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:31:18.921487+07
84	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:31:23.891777+07
85	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:31:29.001364+07
86	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:31:33.885482+07
87	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:31:38.985336+07
88	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:31:43.929449+07
89	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:31:48.891515+07
90	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:31:53.96733+07
91	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:31:58.889216+07
92	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:32:03.969867+07
93	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:32:08.88457+07
94	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:32:13.899105+07
95	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:32:18.967203+07
96	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:32:23.896797+07
97	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:32:28.981204+07
98	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:32:33.884048+07
99	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:32:38.89215+07
100	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:32:43.969286+07
101	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:32:48.88464+07
102	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:32:53.900786+07
103	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:32:58.980359+07
104	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:33:03.884258+07
105	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:33:08.994109+07
106	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:33:13.899696+07
107	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:33:18.90373+07
108	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:33:23.982212+07
109	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:33:29.79715+07
110	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:33:34.932839+07
111	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:33:39.792246+07
112	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:33:44.796604+07
113	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:33:49.886736+07
114	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:33:54.801954+07
115	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:33:59.914297+07
116	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:34:04.797305+07
117	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:34:09.805956+07
118	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:34:14.946961+07
119	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:34:19.807841+07
120	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:34:24.895358+07
121	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:35:20.129041+07
122	DRV-10-001	2	51.50735100	-0.12775800	2025-11-22 18:40:01.719102+07
123	DRV-10-001	2	55.75582600	37.61730000	2025-11-22 18:41:01.906027+07
124	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 18:41:11.904218+07
125	DRV-10-001	2	-6.88455680	79.60028170	2025-11-22 18:48:36.853954+07
126	DRV-10-001	2	-0.88455680	79.60028170	2025-11-22 18:48:41.684693+07
127	DRV-10-001	2	-6.88455680	79.60028170	2025-11-22 18:49:16.859316+07
128	DRV-10-001	2	-6.88455680	109.60028170	2025-11-22 18:49:31.839411+07
129	DRV-10-001	2	-6.88455680	108.60028170	2025-11-22 18:49:46.862897+07
130	DRV-10-001	2	-6.88455680	107.60028170	2025-11-22 18:49:56.699104+07
131	DRV-10-001	2	-10.88455680	107.60028170	2025-11-22 18:50:51.975171+07
132	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 19:41:05.949553+07
133	DRV-10-001	2	-6.88455680	106.60028160	2025-11-22 19:41:41.000718+07
134	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 19:42:05.911642+07
135	DRV-10-001	2	-7.88455680	107.60028160	2025-11-22 19:42:20.922085+07
136	DRV-10-001	2	-6.58455680	107.60028160	2025-11-22 19:42:35.958821+07
137	DRV-10-001	2	-7.58455680	107.60028160	2025-11-22 19:42:50.935835+07
138	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 19:43:15.983483+07
139	DRV-10-001	2	-6.88455680	107.60028160	2025-11-22 19:45:13.347477+07
180	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 15:24:19.502304+07
184	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:05:01.130753+07
185	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:05:05.993868+07
186	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:05:10.991869+07
187	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:05:16.078811+07
188	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:05:21.002662+07
189	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:05:26.247074+07
190	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:05:30.991769+07
191	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:05:36.07122+07
192	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:05:41.090443+07
193	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:05:46.584525+07
194	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:05:51.686361+07
195	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:05:56.576848+07
196	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:06:01.617565+07
197	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:06:06.581641+07
198	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:06:11.583518+07
199	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:06:16.66648+07
200	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:06:21.574993+07
201	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:06:26.574346+07
202	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:06:31.694871+07
203	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:06:35.990029+07
204	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:06:41.005438+07
205	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:06:46.090491+07
206	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:06:50.998375+07
207	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:06:56.002086+07
208	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:07:01.153734+07
209	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:07:06.573119+07
210	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:07:11.645605+07
211	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:07:16.846559+07
212	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:07:20.990591+07
213	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:07:26.062354+07
214	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:07:31.008845+07
215	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:07:35.999974+07
216	DRV-04-002	7	-6.88455680	107.60028160	2025-11-23 16:07:41.104669+07
288	DRV-10-002	5	-6.88455680	107.60028160	2025-11-23 17:11:21.86438+07
289	DRV-10-002	5	-6.88455680	107.60028160	2025-11-23 17:11:26.625954+07
290	DRV-10-002	5	-6.88455680	107.60028160	2025-11-23 17:11:31.629389+07
291	DRV-10-002	5	-6.88455680	107.60028160	2025-11-23 17:11:36.757388+07
292	DRV-10-002	5	-6.88455680	107.60028160	2025-11-23 17:11:41.627008+07
313	DRV-10-001	4	-6.88455680	107.60028160	2025-11-23 18:36:34.703785+07
\.


--
-- TOC entry 5258 (class 0 OID 17450)
-- Dependencies: 222
-- Data for Name: drivers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.drivers (id, user_id, shelter_id, is_available, license_info, full_name, contact_phone, profile_picture) FROM stdin;
DRV-04-001	18	4	t	sim-1763873723959.JPG	Andi Santoso	085850603196	driver-1763897487222.png
DRV-04-002	19	4	t	sim-1763874278197.png	Rahman Putra	085850603196	driver-1763897501968.png
DRV-11-001	22	11	t	sim-1763882101861.png	Suherman	085850603196	driver-1763897556636.png
DRV-10-002	31	10	t	SIM C-2026	Mawar Putri	081234567890	driver-1763897629648.png
DRV-10-001	30	10	t	SIM C-2027	Budi Kurniawan	+62 812-9502-0503	driver-1763897665572.png
\.


--
-- TOC entry 5268 (class 0 OID 17747)
-- Dependencies: 232
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (id, organizer_id, title, description, event_date, start_time, location_name, location_address, registration_link, is_active, created_at) FROM stdin;
1	10	Bazar Adopsi Massal	Datang dan adopsi kucing lucu!	2025-12-05	10:00:00	Parkir Timur	Jl. Sukarno Hatta No. 100	\N	t	2025-11-10 10:00:00
\.


--
-- TOC entry 5269 (class 0 OID 17769)
-- Dependencies: 233
-- Data for Name: faq; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.faq (id, question, answer) FROM stdin;
2	Bagaimana cara membuat laporan kucing?	Pergi ke laman "Rescue".\nIsi semua data yang dibutuhkan untuk formulir.\nKlik "Submit" untuk mengirimkan data kucing.
3	Apakah saya perlu membayar biaya adopsi?	Kami membebankan biaya adopsi yang bersifat donasi untuk menutupi biaya vaksinasi, steril, dan perawatan pra-adopsi.
4	Bagaimana cara memberikan donasi untuk mendukung shelter?	Kunjungi halaman Donasi, pilih shelter tujuan, metode transfer, dan unggah bukti transfer Anda.
5	Bagaimana cara mengadopsi kucing?	Telusuri katalog kucing, klik "Rincian" pada kucing pilihan Anda, dan isi formulir Adopsi yang tersedia di halaman detail tersebut.
1	Cara merawat kucing yang benar?	Pastikan untuk memberikan nutrisi yang seimbang, vaksinasi rutin, dan lingkungan yang aman serta penuh kasih sayang. Ajak bermain minimal 10 menit sehari.
\.


--
-- TOC entry 5261 (class 0 OID 17526)
-- Dependencies: 225
-- Data for Name: favorite_cats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.favorite_cats (user_id, cat_id, created_at) FROM stdin;
20	2	2025-11-10 10:00:00
21	1	2025-11-11 11:00:00
20	3	2025-11-12 12:00:00
3	1	2025-11-20 21:38:18.3317
3	3	2025-11-21 16:43:29.913018
5	4	2025-11-23 12:20:53.974637
\.


--
-- TOC entry 5272 (class 0 OID 17812)
-- Dependencies: 236
-- Data for Name: global_achievements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.global_achievements (id, name, description, target_condition, points) FROM stdin;
1	Donasi Pertama	Berhasil melakukan donasi pertama.	FIRST_DONATION	5
2	Donasi 100 Ribu	Total akumulasi donasi mencapai Rp 100.000.	TOTAL_DONATION_100K	15
3	Warga Teladan	Berhasil menyelesaikan 5 Quest.	COMPLETE_5_QUESTS	25
\.


--
-- TOC entry 5274 (class 0 OID 17827)
-- Dependencies: 238
-- Data for Name: global_quests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.global_quests (id, name, target_value, points, type) FROM stdin;
1	Warga Forum	5.00	2	FORUM_POST_COUNT
2	1 Tahun Bersama	365.00	15	DAYS_SINCE_JOIN
3	Donasi 1 Juta	1000000.00	15	TOTAL_DONATION_AMOUNT
4	Donatur Sejati	1.00	25	HAS_DONATED
\.


--
-- TOC entry 5289 (class 0 OID 19319)
-- Dependencies: 253
-- Data for Name: lost_cats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lost_cats (id, owner_id, name, age, breed, color, description, last_seen_address, last_seen_lat, last_seen_long, photo, reward_amount, status, created_at) FROM stdin;
1	3	Mochi	12	Domestik	Oren	Hilang pake kalung merah	Jl. Gegerkalong Girang	-6.87300000	107.59200000	lost-1763715576408.jpg	100000.00	searching	2025-11-21 15:59:36.591132
2	3	Nami	13	Persia	Putih	Pakai kalung emas	Koordinat: -6.85854, 107.58954	-6.85854391	107.58954048	lost-1763715638495.jpg	0.00	searching	2025-11-21 16:00:38.633227
3	5	Luna	12	Anggora	Putih	Mata warna biru dan hijau (odd eye), bulu sangat lebat, terakhir pakai kalung pink.	Jl. Setiabudi No. 45, Bandung	-6.87320000	107.58990000	lost-luna.jpg	500000.00	searching	2025-11-20 16:36:51.416413
4	8	Oreo	6	Domestik	Hitam Putih	Kucing kecil lincah, ada motif seperti masker di wajahnya. Ekornya pendek bengkok.	Komp. Margahayu Raya, Bandung	-6.94510000	107.65430000	lost-oreo.jpg	150000.00	searching	2025-11-21 11:36:51.416413
5	3	Garfield	24	Persia	Oren	Badan sangat gemuk, muka ceper, suara mengeong pelan. Suka takut sama orang asing.	Jl. Adopsi No. 5, Bandung	-6.91470000	107.60980000	lost-garfield.jpg	1000000.00	searching	2025-11-19 16:36:51.416413
6	7	Blacky	36	Bombay	Hitam	Hitam legam seluruh badan, mata kuning terang. Ada bekas luka kecil di telinga kiri.	Jl. Donasi No. 10, Jakarta	-6.17540000	106.82720000	lost-blacky.jpg	250000.00	searching	2025-11-14 16:36:51.416413
\.


--
-- TOC entry 5285 (class 0 OID 19270)
-- Dependencies: 249
-- Data for Name: post_likes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.post_likes (user_id, post_id, created_at) FROM stdin;
3	1	2025-11-21 12:28:12.272893
3	2	2025-11-21 12:28:55.313075
3	4	2025-11-21 12:48:27.321307
3	5	2025-11-21 12:48:29.925136
3	3	2025-11-21 12:48:32.821195
4	5	2025-11-21 16:28:05.601604
4	2	2025-11-21 16:28:09.478152
4	1	2025-11-21 16:28:11.646097
\.


--
-- TOC entry 5264 (class 0 OID 17664)
-- Dependencies: 228
-- Data for Name: reply_comment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reply_comment (id, user_id, comment_id, parent_reply_id, content, likes_count, created_at, updated_at) FROM stdin;
1	20	1	\N	Terima kasih sarannya Budi!	0	2025-11-17 10:30:00	2025-11-17 10:30:00
2	3	6	\N	iyaa betul	0	2025-11-22 23:18:23.944596	2025-11-22 23:18:23.944596
\.


--
-- TOC entry 5291 (class 0 OID 19344)
-- Dependencies: 255
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reports (id, reporter_id, report_type, lost_cat_id, shelter_assigned_id, location, latitude, longitude, description, photo, report_date, created_at) FROM stdin;
1	20	stray	\N	10	Jl. Kebon Jati, Bandung	-6.91470000	107.60980000	Kucing tertabrak, kaki belakang luka parah.	photo_report_1.jpg	2025-11-18	2025-11-21 16:12:08.271329
2	21	stray	\N	11	Jl. Thamrin, Jakarta	-6.17540000	106.82720000	Ditinggalkan di depan ruko, sangat kurus.	photo_report_2.jpg	2025-11-17	2025-11-21 16:12:08.271329
5	3	missing	1	10	Koordinat: -6.85834, 107.59045	-6.85834240	107.59045120	Saya menemukan kucing milik azmi	report-1763717038437.jpg	2025-11-21	2025-11-21 16:23:58.575199
4	3	stray	\N	10	Koordinat: -6.85834, 107.59045	-6.85834240	107.59045120	Saya menemukan kucing liar yang kayaknya lagi sakit	report-1763716897731.jpg	2025-11-21	2025-11-21 16:21:37.881511
3	3	stray	\N	10	Jl. Gegerkalong Girang	-6.87300000	107.59200000	Kucing oren pincang di pinggir jalan	report-1763716333850.jpg	2025-11-21	2025-11-21 16:12:14.755683
8	3	missing	5	10	Koordinat: -6.88468, 107.59754	-6.88468337	107.59753561	saya menemukan kucing milik azmi	report-1763881767103.png	2025-11-23	2025-11-23 14:09:27.26002
9	3	stray	\N	11	Koordinat: -6.88456, 107.60028	-6.88455680	107.60028160	saya liat kucing liar	report-1763881918827.png	2025-11-23	2025-11-23 14:11:58.96954
11	3	stray	\N	4	Koordinat: -6.88456, 107.60028	-6.88455680	107.60028160	saya nemu kucing liar lagi di gerlong	report-1763882675590.png	2025-11-23	2025-11-23 14:24:35.735636
\.


--
-- TOC entry 5294 (class 0 OID 19902)
-- Dependencies: 258
-- Data for Name: rescue_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rescue_assignments (id, tracking_id, report_id, driver_id, shelter_id, assignment_status, assigned_at, pickup_time, completion_time, pickup_photo, dropoff_photo, notes) FROM stdin;
2	RES-BDG-0002	5	DRV-10-001	10	completed	2025-11-22 16:40:24.102994	2025-11-22 19:45:17.06581	2025-11-22 19:45:42.963664	rescue-1763815517033.JPG	rescue-1763815542824.JPG	\N
4	RES-BDG-0004	3	DRV-10-001	10	assigned	2025-11-22 21:15:36.467418	\N	\N	\N	\N	\N
3	RES-BDG-0003	4	DRV-10-002	10	completed	2025-11-22 20:44:25.032454	2025-11-22 20:46:11.543035	2025-11-22 20:46:53.965437	rescue-1763819171499.JPG	rescue-1763819213838.JPG	\N
5	RES-BDG-0005	8	DRV-10-002	10	assigned	2025-11-23 14:11:08.332897	\N	\N	\N	\N	\N
6	RES-BDG-0006	9	DRV-11-001	11	assigned	2025-11-23 14:15:13.576105	\N	\N	\N	\N	\N
7	RES-BDG-0007	11	DRV-04-002	4	completed	2025-11-23 14:50:34.763009	2025-11-23 16:12:48.451475	2025-11-23 16:13:15.11699	rescue-1763889168403.png	rescue-1763889195074.png	\N
\.


--
-- TOC entry 5276 (class 0 OID 17839)
-- Dependencies: 240
-- Data for Name: user_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_progress (id, user_id, global_item_id, item_type, current_progress, is_completed, completed_at) FROM stdin;
1	20	1	QUEST	2.00	f	\N
2	20	2	QUEST	365.00	t	2025-11-19 16:16:54.176482+07
3	20	3	QUEST	500000.00	f	\N
4	20	4	QUEST	1.00	t	2025-11-19 16:16:54.176482+07
5	20	1	ACHIEVEMENT	1.00	t	2025-11-19 16:16:54.176482+07
6	20	2	ACHIEVEMENT	1.00	t	2025-11-19 16:16:54.176482+07
7	3	1	QUEST	4.00	f	\N
8	3	2	QUEST	10.00	f	\N
9	3	3	QUEST	0.00	f	\N
10	3	4	QUEST	1.00	t	2025-11-19 16:18:15.201832+07
11	3	1	ACHIEVEMENT	1.00	t	2025-11-19 16:18:15.201832+07
12	3	2	ACHIEVEMENT	0.00	f	\N
\.


--
-- TOC entry 5255 (class 0 OID 17393)
-- Dependencies: 219
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password_hash, role) FROM stdin;
3	zicofarry	mhmmdzmslm36@gmail.com	$2b$10$S/.SrKBrNC0Lt7QTIauaDe4KiQZJ4w3QxTa5Y4OnT.c07yIEMzd6S	individu
5	repa	repapit@gmail.com	$2b$10$Nh4VBkWfDYoC9k9AAjwOUuPJ6Lq6ytPzSi2Eek2FCFri214Knkb6.	individu
6	salman	salman@gmail.com	$2b$10$AeaVKPcAQVhjtauAtlPGY.qAeU.HdcnnxvMOfFh.7ks2VHXH5KRjy	individu
7	ajipati	ajipatialaga@gmail.com	$2b$10$lb.HCCUv0FzxgDf6qZ5cmOqYbqbU0kYoVnl9oYU7uwFHj9o88VxWu	individu
8	anas	anasmifta@gmail.com	$2b$10$JDKS8/kOsH3voDP3fwHFdeJfC5tgyJr7GwbsBtSNLfJ7w3gxyWpFW	individu
11	shelter-jakarta	shelter_jkt@mail.com	$2a$12$EyaNgDWLl4uXeK5luSp6NeNg3rnl3v3wJ8MZhnQIMCmYCK2/MYxBy	shelter
4	shelter-gerlong	sheltergerlong@gmail.com	$2a$12$0c7TwUaK9VKllvejqx9kbOzwggL9YfrA43s3VYY/.h.RDY6.PiRve	shelter
10	shelter-bandung	shelter_bdg@mail.com	$2a$12$QYCFZ1l2CA56uhoWCg9HKugM5c9kPn8Hib1/G06mfTAukH/wk3QyG	shelter
9	ahkam	ahkam@gmail.com	$2b$10$8M1t/X/qTGKo0z0BW/1ErORz/APS2A9AB6kXEk.NY/0smvg6PoVYy	individu
12	najmi	najmi@gmail.com	$2b$10$pwLd7JgiL5VisgFiLvIc2e4JI8.HCT5e3VfuqeUNJXgw.gpsoa9Qu	individu
13	harri	harri@gmail.com	$2b$10$SGHoHSetwMJnFjDrMdwK0eFrpilgPcZPmLGXkMPVbFLFrOUoCRdZy	individu
14	muhammad'azmisalam4233	muhammadazmi36@upi.edu	$2a$12$KnzjrkMrv0Va/83HJIp7p.XjFP8HSJy2lzp9URK1pDx7lMJHxnMTK	individu
15	cacicu7498	c2cacicu@gmail.com	$2b$10$BsZ/2ht./rAb/dXRhZ0wVOJnwEfArE.X4KlA0w4ZpUKF1fsDinxXW	individu
16	muhammad'azmi2945	muhammadazmi.smaitfibe@gmail.com	$2b$10$2PswEEftRNsF0/fY3WKalu8xKEHqs4KzlirQ9THGua64IkRA1MKFu	shelter
20	adopter-andi	andi@mail.com	$2a$12$V7sBJmn.UZFfo2Hn9kda4OkXC6PoN/H3I7zczoH0vCFjRZbcve5NG	individu
21	donatur-bambang	bambang@mail.com	$2a$12$IIc7LrjwQSWZVXTqwBUsF.Xn2nCgZ4dbhufObIFDb.UxqYSUIlQUe	individu
1	admin36	admin@cattake.id	$2a$12$mf/UN16PC8UXHoVgcpwraOY7IDx9ewbmfJVbkyiAuw9QO6ZKtejae	admin
2	michael	azmi.test.001@mail.com	$2a$12$gR9X5xmgnx1Ofaf0WJYqm.YFgwrCE3zIWESzg3esC2IvgdDWfjIgG	individu
18	driver-andi	andi_drv@gmail.com	$2b$10$ttwEUQeteiAeUm0tjgUiee1ql2/s17pwYr6BkZSmdcffjapLSDPOO	driver
19	driver-rahman	rahman_drv@gmail.com	$2b$10$inqXtItfpppc4ck6z5DGhOLZG3HSx2juvLcijQJA99IcKo5qMdYvC	driver
22	driver-suher	suher_drv@gmail.com	$2b$10$tBo7qYz/bvqzfurHxEkCUuFTC1SLHRxf4NRLQam1LW1GjoeqGqQ/i	driver
30	driver-budi	budi_drv@mail.com	$2a$12$5mH1ze4JchRj3UqwckKh5uyRS95.mGQwz1by74lIvMtQjsEvhkdZa	driver
31	driver-mawar	mawar_drv@mail.com	$2a$12$4aY1NCJGJbpI743W94xPzOe1bIq9V8G5ktIErqaddHRcsbifNQp/u	driver
\.


--
-- TOC entry 5266 (class 0 OID 17714)
-- Dependencies: 230
-- Data for Name: verification_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.verification_log (id, user_id, verifier_id, verification_type, status, notes, created_at) FROM stdin;
3	8	10	Adoption_Application	rejected	Data migrasi otomatis dari riwayat adopsi	2025-11-22 11:27:22.732092
4	3	4	Adoption_Application	approved	Data migrasi otomatis dari riwayat adopsi	2025-10-03 14:00:00
5	3	4	Adoption_Application	approved	Data migrasi otomatis dari riwayat adopsi	2025-10-06 16:00:00
6	3	4	Adoption_Application	approved	Data migrasi otomatis dari riwayat adopsi	2025-10-12 13:00:00
7	3	4	Adoption_Application	approved	Data migrasi otomatis dari riwayat adopsi	2025-10-17 10:00:00
8	3	4	Adoption_Application	approved	Data migrasi otomatis dari riwayat adopsi	2025-10-21 11:00:00
9	3	10	Adoption_Application	approved	Data migrasi otomatis dari riwayat adopsi	2025-11-22 11:26:00.67123
10	3	10	Adoption_Application	approved	Permintaan adopsi telah di-approved oleh shelter.	2025-11-22 11:36:24.295958
11	3	10	Adoption_Application	rejected	Permintaan adopsi telah di-rejected oleh shelter.	2025-11-22 11:36:41.785481
12	20	4	Adoption_Application	rejected	Permintaan adopsi telah di-rejected oleh shelter.	2025-11-22 12:04:03.386386
13	3	10	Adoption_Application	approved	Permintaan adopsi telah di-approved oleh shelter.	2025-11-22 12:32:03.885964
\.


--
-- TOC entry 5312 (class 0 OID 0)
-- Dependencies: 244
-- Name: adoptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.adoptions_id_seq', 15, true);


--
-- TOC entry 5313 (class 0 OID 0)
-- Dependencies: 243
-- Name: cats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cats_id_seq', 14, true);


--
-- TOC entry 5314 (class 0 OID 0)
-- Dependencies: 259
-- Name: chat_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.chat_messages_id_seq', 22, true);


--
-- TOC entry 5315 (class 0 OID 0)
-- Dependencies: 246
-- Name: comment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comment_id_seq', 17, true);


--
-- TOC entry 5316 (class 0 OID 0)
-- Dependencies: 248
-- Name: community_post_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.community_post_id_seq', 5, true);


--
-- TOC entry 5317 (class 0 OID 0)
-- Dependencies: 250
-- Name: community_post_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.community_post_id_seq1', 1, false);


--
-- TOC entry 5318 (class 0 OID 0)
-- Dependencies: 245
-- Name: donations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.donations_id_seq', 12, true);


--
-- TOC entry 5319 (class 0 OID 0)
-- Dependencies: 241
-- Name: driver_locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.driver_locations_id_seq', 313, true);


--
-- TOC entry 5320 (class 0 OID 0)
-- Dependencies: 235
-- Name: global_achievements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.global_achievements_id_seq', 1, false);


--
-- TOC entry 5321 (class 0 OID 0)
-- Dependencies: 237
-- Name: global_quests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.global_quests_id_seq', 1, false);


--
-- TOC entry 5322 (class 0 OID 0)
-- Dependencies: 252
-- Name: lost_cats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lost_cats_id_seq', 6, true);


--
-- TOC entry 5323 (class 0 OID 0)
-- Dependencies: 247
-- Name: reply_comment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reply_comment_id_seq', 6, true);


--
-- TOC entry 5324 (class 0 OID 0)
-- Dependencies: 254
-- Name: reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reports_id_seq', 11, true);


--
-- TOC entry 5325 (class 0 OID 0)
-- Dependencies: 257
-- Name: rescue_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rescue_assignments_id_seq', 7, true);


--
-- TOC entry 5326 (class 0 OID 0)
-- Dependencies: 239
-- Name: user_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_progress_id_seq', 12, true);


--
-- TOC entry 5327 (class 0 OID 0)
-- Dependencies: 234
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 22, true);


--
-- TOC entry 5328 (class 0 OID 0)
-- Dependencies: 256
-- Name: verification_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.verification_log_id_seq', 13, true);


--
-- TOC entry 5032 (class 2606 OID 17515)
-- Name: adoptions adoptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adoptions
    ADD CONSTRAINT adoptions_pkey PRIMARY KEY (id);


--
-- TOC entry 5046 (class 2606 OID 17746)
-- Name: cat_facts cat_facts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_facts
    ADD CONSTRAINT cat_facts_pkey PRIMARY KEY (id);


--
-- TOC entry 5030 (class 2606 OID 17499)
-- Name: cats cats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cats
    ADD CONSTRAINT cats_pkey PRIMARY KEY (id);


--
-- TOC entry 5036 (class 2606 OID 17611)
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- TOC entry 5038 (class 2606 OID 17653)
-- Name: comment comment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_pkey PRIMARY KEY (id);


--
-- TOC entry 5064 (class 2606 OID 19302)
-- Name: community_post community_post_pkey1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.community_post
    ADD CONSTRAINT community_post_pkey1 PRIMARY KEY (id);


--
-- TOC entry 5016 (class 2606 OID 17422)
-- Name: detail_user_individu detail_user_individu_nik_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detail_user_individu
    ADD CONSTRAINT detail_user_individu_nik_key UNIQUE (nik);


--
-- TOC entry 5018 (class 2606 OID 17420)
-- Name: detail_user_individu detail_user_individu_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detail_user_individu
    ADD CONSTRAINT detail_user_individu_pkey PRIMARY KEY (id);


--
-- TOC entry 5020 (class 2606 OID 17442)
-- Name: detail_user_shelter detail_user_shelter_donation_account_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detail_user_shelter
    ADD CONSTRAINT detail_user_shelter_donation_account_number_key UNIQUE (donation_account_number);


--
-- TOC entry 5022 (class 2606 OID 17444)
-- Name: detail_user_shelter detail_user_shelter_pj_nik_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detail_user_shelter
    ADD CONSTRAINT detail_user_shelter_pj_nik_key UNIQUE (pj_nik);


--
-- TOC entry 5024 (class 2606 OID 17440)
-- Name: detail_user_shelter detail_user_shelter_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detail_user_shelter
    ADD CONSTRAINT detail_user_shelter_pkey PRIMARY KEY (id);


--
-- TOC entry 5042 (class 2606 OID 17703)
-- Name: donations donations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_pkey PRIMARY KEY (id);


--
-- TOC entry 5060 (class 2606 OID 17867)
-- Name: driver_locations driver_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_locations
    ADD CONSTRAINT driver_locations_pkey PRIMARY KEY (id);


--
-- TOC entry 5026 (class 2606 OID 17461)
-- Name: drivers drivers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_pkey PRIMARY KEY (id);


--
-- TOC entry 5028 (class 2606 OID 17463)
-- Name: drivers drivers_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_user_id_key UNIQUE (user_id);


--
-- TOC entry 5048 (class 2606 OID 17763)
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- TOC entry 5050 (class 2606 OID 17778)
-- Name: faq faq_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faq
    ADD CONSTRAINT faq_pkey PRIMARY KEY (id);


--
-- TOC entry 5034 (class 2606 OID 17533)
-- Name: favorite_cats favorite_cats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorite_cats
    ADD CONSTRAINT favorite_cats_pkey PRIMARY KEY (user_id, cat_id);


--
-- TOC entry 5052 (class 2606 OID 17823)
-- Name: global_achievements global_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.global_achievements
    ADD CONSTRAINT global_achievements_pkey PRIMARY KEY (id);


--
-- TOC entry 5054 (class 2606 OID 17825)
-- Name: global_achievements global_achievements_target_condition_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.global_achievements
    ADD CONSTRAINT global_achievements_target_condition_key UNIQUE (target_condition);


--
-- TOC entry 5056 (class 2606 OID 17837)
-- Name: global_quests global_quests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.global_quests
    ADD CONSTRAINT global_quests_pkey PRIMARY KEY (id);


--
-- TOC entry 5066 (class 2606 OID 19332)
-- Name: lost_cats lost_cats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lost_cats
    ADD CONSTRAINT lost_cats_pkey PRIMARY KEY (id);


--
-- TOC entry 5062 (class 2606 OID 19277)
-- Name: post_likes post_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_pkey PRIMARY KEY (user_id, post_id);


--
-- TOC entry 5040 (class 2606 OID 17677)
-- Name: reply_comment reply_comment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reply_comment
    ADD CONSTRAINT reply_comment_pkey PRIMARY KEY (id);


--
-- TOC entry 5068 (class 2606 OID 19361)
-- Name: reports reports_pkey1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey1 PRIMARY KEY (id);


--
-- TOC entry 5070 (class 2606 OID 19916)
-- Name: rescue_assignments rescue_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_assignments
    ADD CONSTRAINT rescue_assignments_pkey PRIMARY KEY (id);


--
-- TOC entry 5072 (class 2606 OID 19920)
-- Name: rescue_assignments rescue_assignments_report_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_assignments
    ADD CONSTRAINT rescue_assignments_report_id_key UNIQUE (report_id);


--
-- TOC entry 5074 (class 2606 OID 19918)
-- Name: rescue_assignments rescue_assignments_tracking_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_assignments
    ADD CONSTRAINT rescue_assignments_tracking_id_key UNIQUE (tracking_id);


--
-- TOC entry 5058 (class 2606 OID 17851)
-- Name: user_progress user_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_pkey PRIMARY KEY (id);


--
-- TOC entry 5010 (class 2606 OID 17408)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 5012 (class 2606 OID 17404)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5014 (class 2606 OID 17406)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 5044 (class 2606 OID 17725)
-- Name: verification_log verification_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification_log
    ADD CONSTRAINT verification_log_pkey PRIMARY KEY (id);


--
-- TOC entry 5080 (class 2606 OID 17521)
-- Name: adoptions adoptions_applicant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adoptions
    ADD CONSTRAINT adoptions_applicant_id_fkey FOREIGN KEY (applicant_id) REFERENCES public.users(id);


--
-- TOC entry 5081 (class 2606 OID 17516)
-- Name: adoptions adoptions_cat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adoptions
    ADD CONSTRAINT adoptions_cat_id_fkey FOREIGN KEY (cat_id) REFERENCES public.cats(id);


--
-- TOC entry 5079 (class 2606 OID 17500)
-- Name: cats cats_shelter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cats
    ADD CONSTRAINT cats_shelter_id_fkey FOREIGN KEY (shelter_id) REFERENCES public.users(id);


--
-- TOC entry 5084 (class 2606 OID 19949)
-- Name: chat_messages chat_messages_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.rescue_assignments(id);


--
-- TOC entry 5085 (class 2606 OID 17617)
-- Name: chat_messages chat_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- TOC entry 5086 (class 2606 OID 19308)
-- Name: comment comment_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.community_post(id);


--
-- TOC entry 5087 (class 2606 OID 17654)
-- Name: comment comment_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5100 (class 2606 OID 19303)
-- Name: community_post community_post_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.community_post
    ADD CONSTRAINT community_post_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- TOC entry 5075 (class 2606 OID 17806)
-- Name: detail_user_individu detail_user_individu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detail_user_individu
    ADD CONSTRAINT detail_user_individu_id_fkey FOREIGN KEY (id) REFERENCES public.users(id);


--
-- TOC entry 5076 (class 2606 OID 17445)
-- Name: detail_user_shelter detail_user_shelter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detail_user_shelter
    ADD CONSTRAINT detail_user_shelter_id_fkey FOREIGN KEY (id) REFERENCES public.users(id);


--
-- TOC entry 5091 (class 2606 OID 17704)
-- Name: donations donations_donatur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_donatur_id_fkey FOREIGN KEY (donatur_id) REFERENCES public.users(id);


--
-- TOC entry 5092 (class 2606 OID 17709)
-- Name: donations donations_shelter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_shelter_id_fkey FOREIGN KEY (shelter_id) REFERENCES public.users(id);


--
-- TOC entry 5097 (class 2606 OID 19969)
-- Name: driver_locations driver_locations_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_locations
    ADD CONSTRAINT driver_locations_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.drivers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5077 (class 2606 OID 17469)
-- Name: drivers drivers_shelter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_shelter_id_fkey FOREIGN KEY (shelter_id) REFERENCES public.users(id);


--
-- TOC entry 5078 (class 2606 OID 17464)
-- Name: drivers drivers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5095 (class 2606 OID 17764)
-- Name: events events_organizer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.users(id);


--
-- TOC entry 5082 (class 2606 OID 17539)
-- Name: favorite_cats favorite_cats_cat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorite_cats
    ADD CONSTRAINT favorite_cats_cat_id_fkey FOREIGN KEY (cat_id) REFERENCES public.cats(id);


--
-- TOC entry 5083 (class 2606 OID 17534)
-- Name: favorite_cats favorite_cats_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorite_cats
    ADD CONSTRAINT favorite_cats_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5101 (class 2606 OID 19333)
-- Name: lost_cats fk_owner; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lost_cats
    ADD CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5102 (class 2606 OID 19372)
-- Name: reports fk_reports_lost_cat; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT fk_reports_lost_cat FOREIGN KEY (lost_cat_id) REFERENCES public.lost_cats(id) ON DELETE SET NULL;


--
-- TOC entry 5098 (class 2606 OID 19313)
-- Name: post_likes post_likes_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.community_post(id) ON DELETE CASCADE;


--
-- TOC entry 5099 (class 2606 OID 19278)
-- Name: post_likes post_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5088 (class 2606 OID 19954)
-- Name: reply_comment reply_comment_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reply_comment
    ADD CONSTRAINT reply_comment_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comment(id) ON DELETE CASCADE;


--
-- TOC entry 5089 (class 2606 OID 19959)
-- Name: reply_comment reply_comment_parent_reply_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reply_comment
    ADD CONSTRAINT reply_comment_parent_reply_id_fkey FOREIGN KEY (parent_reply_id) REFERENCES public.reply_comment(id) ON DELETE CASCADE;


--
-- TOC entry 5090 (class 2606 OID 17678)
-- Name: reply_comment reply_comment_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reply_comment
    ADD CONSTRAINT reply_comment_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5103 (class 2606 OID 19362)
-- Name: reports reports_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id);


--
-- TOC entry 5104 (class 2606 OID 19367)
-- Name: reports reports_shelter_assigned_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_shelter_assigned_id_fkey FOREIGN KEY (shelter_assigned_id) REFERENCES public.users(id);


--
-- TOC entry 5105 (class 2606 OID 19964)
-- Name: rescue_assignments rescue_assignments_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_assignments
    ADD CONSTRAINT rescue_assignments_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.drivers(id) ON UPDATE CASCADE;


--
-- TOC entry 5106 (class 2606 OID 19921)
-- Name: rescue_assignments rescue_assignments_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_assignments
    ADD CONSTRAINT rescue_assignments_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.reports(id);


--
-- TOC entry 5107 (class 2606 OID 19931)
-- Name: rescue_assignments rescue_assignments_shelter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_assignments
    ADD CONSTRAINT rescue_assignments_shelter_id_fkey FOREIGN KEY (shelter_id) REFERENCES public.users(id);


--
-- TOC entry 5096 (class 2606 OID 17852)
-- Name: user_progress user_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5093 (class 2606 OID 17726)
-- Name: verification_log verification_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification_log
    ADD CONSTRAINT verification_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5094 (class 2606 OID 17731)
-- Name: verification_log verification_log_verifier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification_log
    ADD CONSTRAINT verification_log_verifier_id_fkey FOREIGN KEY (verifier_id) REFERENCES public.users(id);


-- Completed on 2025-11-23 21:02:55

--
-- PostgreSQL database dump complete
--

\unrestrict nX3CZFDUyUTgy0WGgjhaRe3aEAezKa7Ax8T2rhauCAwinooW1UtvFaFlQBvOXbU

