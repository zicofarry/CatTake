--
-- PostgreSQL database dump
--

\restrict MjlAMjdm52YWub6l2q0sOCdZsDs6IcpMn0rifgB9wXL1iLAxLU78cQSZrjdqS6T

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

-- Started on 2025-11-21 15:39:34

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
-- TOC entry 245 (class 1259 OID 17880)
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
-- TOC entry 232 (class 1259 OID 17736)
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
-- TOC entry 244 (class 1259 OID 17878)
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
-- TOC entry 227 (class 1259 OID 17600)
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_messages (
    id integer NOT NULL,
    assignment_id integer NOT NULL,
    sender_id integer NOT NULL,
    message text NOT NULL,
    sent_at timestamp without time zone NOT NULL
);


ALTER TABLE public.chat_messages OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 19264)
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
-- TOC entry 228 (class 1259 OID 17640)
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
-- TOC entry 252 (class 1259 OID 19289)
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
-- TOC entry 249 (class 1259 OID 19268)
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
-- TOC entry 251 (class 1259 OID 19288)
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
-- TOC entry 5290 (class 0 OID 0)
-- Dependencies: 251
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
    CONSTRAINT check_org_type CHECK (((organization_type)::text = ANY ((ARRAY['Yayasan'::character varying, 'Komunitas'::character varying, 'Pribadi'::character varying])::text[])))
);


ALTER TABLE public.detail_user_shelter OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 17693)
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
-- TOC entry 246 (class 1259 OID 18341)
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
-- TOC entry 5291 (class 0 OID 0)
-- Dependencies: 246
-- Name: donations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.donations_id_seq OWNED BY public.donations.id;


--
-- TOC entry 243 (class 1259 OID 17858)
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
-- TOC entry 242 (class 1259 OID 17857)
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
-- TOC entry 5292 (class 0 OID 0)
-- Dependencies: 242
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
    full_name character varying(255) NOT NULL
);


ALTER TABLE public.drivers OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 17747)
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
-- TOC entry 234 (class 1259 OID 17769)
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
-- TOC entry 237 (class 1259 OID 17812)
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
-- TOC entry 236 (class 1259 OID 17811)
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
-- TOC entry 5293 (class 0 OID 0)
-- Dependencies: 236
-- Name: global_achievements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.global_achievements_id_seq OWNED BY public.global_achievements.id;


--
-- TOC entry 239 (class 1259 OID 17827)
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
-- TOC entry 238 (class 1259 OID 17826)
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
-- TOC entry 5294 (class 0 OID 0)
-- Dependencies: 238
-- Name: global_quests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.global_quests_id_seq OWNED BY public.global_quests.id;


--
-- TOC entry 254 (class 1259 OID 19319)
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
-- TOC entry 253 (class 1259 OID 19318)
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
-- TOC entry 5295 (class 0 OID 0)
-- Dependencies: 253
-- Name: lost_cats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lost_cats_id_seq OWNED BY public.lost_cats.id;


--
-- TOC entry 250 (class 1259 OID 19270)
-- Name: post_likes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post_likes (
    user_id integer NOT NULL,
    post_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.post_likes OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 19266)
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
-- TOC entry 229 (class 1259 OID 17664)
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
-- TOC entry 256 (class 1259 OID 19344)
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
    CONSTRAINT check_report_type CHECK (((report_type)::text = ANY ((ARRAY['Missing'::character varying, 'Injured'::character varying, 'Abandoned'::character varying, 'Abuse'::character varying, 'Found_Missing'::character varying])::text[])))
);


ALTER TABLE public.reports OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 19343)
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
-- TOC entry 5296 (class 0 OID 0)
-- Dependencies: 255
-- Name: reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reports_id_seq OWNED BY public.reports.id;


--
-- TOC entry 226 (class 1259 OID 17570)
-- Name: rescue_assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rescue_assignments (
    id integer NOT NULL,
    report_id integer NOT NULL,
    driver_id character varying(50) NOT NULL,
    shelter_id integer NOT NULL,
    assignment_status character varying(50) NOT NULL,
    assigned_at timestamp without time zone NOT NULL,
    started_transit_at timestamp without time zone,
    completed_at timestamp without time zone,
    estimated_pickup_time timestamp without time zone,
    notes text,
    CONSTRAINT check_assignment_status CHECK (((assignment_status)::text = ANY ((ARRAY['assigned'::character varying, 'in_transit'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.rescue_assignments OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 17839)
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
-- TOC entry 240 (class 1259 OID 17838)
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
-- TOC entry 5297 (class 0 OID 0)
-- Dependencies: 240
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
-- TOC entry 235 (class 1259 OID 17802)
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
-- TOC entry 231 (class 1259 OID 17714)
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
-- TOC entry 4984 (class 2604 OID 19292)
-- Name: community_post id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.community_post ALTER COLUMN id SET DEFAULT nextval('public.community_post_id_seq1'::regclass);


--
-- TOC entry 4973 (class 2604 OID 18342)
-- Name: donations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.donations ALTER COLUMN id SET DEFAULT nextval('public.donations_id_seq'::regclass);


--
-- TOC entry 4982 (class 2604 OID 17861)
-- Name: driver_locations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_locations ALTER COLUMN id SET DEFAULT nextval('public.driver_locations_id_seq'::regclass);


--
-- TOC entry 4977 (class 2604 OID 17815)
-- Name: global_achievements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.global_achievements ALTER COLUMN id SET DEFAULT nextval('public.global_achievements_id_seq'::regclass);


--
-- TOC entry 4978 (class 2604 OID 17830)
-- Name: global_quests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.global_quests ALTER COLUMN id SET DEFAULT nextval('public.global_quests_id_seq'::regclass);


--
-- TOC entry 4986 (class 2604 OID 19322)
-- Name: lost_cats id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lost_cats ALTER COLUMN id SET DEFAULT nextval('public.lost_cats_id_seq'::regclass);


--
-- TOC entry 4990 (class 2604 OID 19347)
-- Name: reports id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports ALTER COLUMN id SET DEFAULT nextval('public.reports_id_seq'::regclass);


--
-- TOC entry 4979 (class 2604 OID 17842)
-- Name: user_progress id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_progress ALTER COLUMN id SET DEFAULT nextval('public.user_progress_id_seq'::regclass);


--
-- TOC entry 5252 (class 0 OID 17505)
-- Dependencies: 224
-- Data for Name: adoptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.adoptions (id, cat_id, applicant_id, statement_letter_path, status, applied_at, verified_at, updated_at) FROM stdin;
1	3	20	/docs/stmt_andi_1.pdf	pending	2025-11-15 15:00:00	\N	2025-11-15 15:00:00
2	6	20	/docs/surat_pernyataan_andi_luna.pdf	pending	2025-11-20 10:00:00	\N	2025-11-20 10:00:00
3	7	3	/docs/stmt_mimi.pdf	completed	2025-10-01 10:00:00	2025-10-03 14:00:00	2025-10-05 09:00:00
4	8	3	/docs/stmt_popo.pdf	completed	2025-10-05 11:00:00	2025-10-06 16:00:00	2025-10-08 10:30:00
5	9	3	/docs/stmt_lili.pdf	completed	2025-10-10 09:00:00	2025-10-12 13:00:00	2025-10-14 11:00:00
6	10	3	/docs/stmt_gembul.pdf	completed	2025-10-15 14:00:00	2025-10-17 10:00:00	2025-10-20 15:00:00
7	11	3	/docs/stmt_chiko.pdf	completed	2025-10-20 08:00:00	2025-10-21 11:00:00	2025-10-23 16:00:00
8	3	3	identity-3-1763694145368	pending	2025-11-21 10:02:28.366243	\N	2025-11-21 10:02:28.366243
9	1	3	identity-3-1763694328683.jpg	pending	2025-11-21 10:05:28.846627	\N	2025-11-21 10:05:28.846627
10	1	3	stmt-3-1763695099635.jpg	pending	2025-11-21 10:18:19.808177	\N	2025-11-21 10:18:19.808177
11	1	3	stmt-3-1763695418652.jpg	pending	2025-11-21 10:23:38.775822	\N	2025-11-21 10:23:38.775822
12	1	3	stmt-3-1763696674748.jpg	pending	2025-11-21 10:44:34.873486	\N	2025-11-21 10:44:34.873486
13	3	3	stmt-3-1763696749954.jpg	pending	2025-11-21 10:45:50.067367	\N	2025-11-21 10:45:50.067367
14	2	8	stmt-8-1763697336774.jpg	pending	2025-11-21 10:55:36.921567	\N	2025-11-21 10:55:36.921567
\.


--
-- TOC entry 5260 (class 0 OID 17736)
-- Dependencies: 232
-- Data for Name: cat_facts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cat_facts (id, fact_text, source, image_path, is_verified, created_at) FROM stdin;
1	Kucing menghabiskan 70% hidupnya untuk tidur.	\N	\N	t	2025-01-01 00:00:00
2	Grup kucing disebut clowder.	\N	\N	t	2025-01-01 00:00:00
\.


--
-- TOC entry 5251 (class 0 OID 17488)
-- Dependencies: 223
-- Data for Name: cats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cats (id, shelter_id, name, age, gender, breed, description, health_status, adoption_status, photo) FROM stdin;
3	11	Simba	23	male	Maine Coon	Gagah dan berani, cocok untuk menjaga rumah dari tikus.	vaccinated	available	bradercat.png
4	10	Mueza	8	female	Persia	Manis, lembut, dan suka tidur di pangkuan.	healthy	available	mochacat.png
5	11	Kitty	36	female	Anggora	Tenang dan penyayang, sudah diadopsi.	vaccinated	adopted	kitty.png
1	10	Oyen	6	male	American Shorthair	Suka mencari keributan di komplek. Sering terlihat mencuri ikan asin tetangga.	vaccinated	available	oyencat.png
2	10	Abul	5	male	Domestik	Kucing pemalu tapi sangat manja jika sudah kenal.	healthy	available	minicat.png
6	4	Luna	12	female	Domestik	Sangat aktif dan suka bermain.	healthy	available	luna.jpg
7	4	Mimi	12	female	Domestik	Kucing calico yang tenang.	vaccinated	adopted	mimi.jpg
8	4	Popo	24	male	Persia	Sangat manja dan suka disisir.	healthy	adopted	popo.jpg
9	4	Lili	5	female	Anggora	Aktif bermain bola.	vaccinated	adopted	lili.jpg
10	4	Gembul	36	male	British Shorthair	Suka tidur seharian.	healthy	adopted	gembul.jpg
11	4	Chiko	18	male	Domestik	Pandai berburu mainan tikus.	vaccinated	adopted	chiko.jpg
\.


--
-- TOC entry 5255 (class 0 OID 17600)
-- Dependencies: 227
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chat_messages (id, assignment_id, sender_id, message, sent_at) FROM stdin;
1	1	30	Halo, saya driver Budi, sudah di jalan menuju lokasi Anda.	2025-11-18 10:35:00
2	1	20	Baik, Pak Budi. Hati-hati ya!	2025-11-18 10:36:00
\.


--
-- TOC entry 5256 (class 0 OID 17640)
-- Dependencies: 228
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
\.


--
-- TOC entry 5280 (class 0 OID 19289)
-- Dependencies: 252
-- Data for Name: community_post; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.community_post (id, author_id, title, content, media_path, likes_count, created_at, updated_at) FROM stdin;
1	20	Tanya Dokter Hewan	Kucing saya Si Putih suka makan daun, apakah normal?	\N	1	2025-11-17 09:00:00	2025-11-17 09:00:00
2	10	Info Steril Gratis	Kami membuka kuota sterilisasi gratis bulan ini!	\N	1	2025-11-18 10:00:00	2025-11-18 10:00:00
3	5	Kenapa Sterilisasi itu Penting?	Halo semua, aku mau share pengalaman tentang sterilisasi kucing. Ternyata banyak banget manfaatnya, bukan cuma untuk mengontrol populasi, tapi juga bagus untuk kesehatan si kucing dalam jangka panjang. Kucingku jadi lebih tenang dan gak gampang stres.	postingan1.png	2159	2025-11-21 10:46:30.278576	2025-11-21 12:46:30.278576
4	6	3 Anak Kucing Butuh Rumah Baru	Halo Cat Lovers! Aku lagi foster 3 anak kucing manis yang ditemukan di depan rumah. Usianya sekitar 2 bulan, sudah bisa makan wet food dan pup di pasir. Semuanya sehat dan manja. Butuh rumah baru yang sayang sama mereka. Lokasi di Jakarta Selatan.	postingan2.png	1113	2025-11-20 18:46:30.358292	2025-11-21 12:46:30.358292
5	7	Kucing Terlantar di Depan Minimarket	Teman-teman, tadi pagi aku lihat seekor kucing betina kurus banget di depan minimarket deket rumah. Kayaknya habis melahirkan dan kelaparan. Aku udah kasih makan, tapi kasian banget. Ada yang bisa bantu foster atau adopsi? Please bantu share ya.	postingan3.jpg	877	2025-11-21 09:46:30.38444	2025-11-21 12:46:30.38444
\.


--
-- TOC entry 5248 (class 0 OID 17409)
-- Dependencies: 220
-- Data for Name: detail_user_individu; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detail_user_individu (id, full_name, birth_date, gender, profile_picture, bio, contact_phone, address, job, nik, ktp_file_path, is_verified, is_adopter_ready, donasi_history_count) FROM stdin;
20	Andi Gunawan	1995-05-10	male	\N	\N	081234567890	Jl. Adopsi No. 5, Bandung	Software Engineer	3273xxxxxxxxxxxx	\N	t	f	1
21	Budi Santoso	1990-01-20	male	\N	\N	081234567891	Jl. Donasi No. 10, Jakarta	Pengusaha	3174xxxxxxxxxxxx	\N	t	f	2
2	Azmi Tester	1990-01-01	male	\N	\N		alamat belum diverifikasi	Pelajar	3273100101900005	\N	f	f	0
6	Salman	\N	\N	\N	\N		\N	\N	\N	\N	f	f	0
5	Repa Pitriani	2005-11-05	female	repa.JPG	\N		alamat belum diverifikasi	Unknown	32731763530891182975	\N	f	f	1
3	Muhammad 'Azmi Salam	2006-06-30	male	zicofarry.JPG	saya adalah pencinta kucing dari umur 3 tahun, nama kucing tercinta saya sejak kecil adalah son goku.	085850603196	RA Ulul 'Azmi Kulalet, RT. 01/RW. 09, Kec. Baleendah, Kab. Bandung, Prov. Jawa Barat	Mahasiswa	3204323006060008	ktp-3-1763696749944.jpg	t	t	5
8	Anas Bekasi	2006-01-29	male	\N	saya adalah manusia bekasi	085850603147	Bekasi	Mahasiswa	3232290120060008	ktp-8-1763697336713.jpg	f	f	0
9	Ahkam Ibadurrahman	\N	\N	\N	\N		\N	\N	\N	\N	f	f	0
7	Ajipati Alaga	\N	\N	ajipati.JPG	\N		\N	\N	\N	\N	f	f	0
\.


--
-- TOC entry 5249 (class 0 OID 17428)
-- Dependencies: 221
-- Data for Name: detail_user_shelter; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detail_user_shelter (id, shelter_name, established_date, organization_type, shelter_picture, bio, contact_phone, legal_certificate, donation_account_number, pj_name, pj_nik, is_verified_shelter, cat_capacity) FROM stdin;
10	Rumah Kucing Bandung	2015-08-17	Komunitas	\N	\N	0227654321	\N	1234567890	Rina Anggraini	3273zzzzzzzzzzzz	t	50
11	Panti Cat Sejahtera	2010-02-28	Yayasan	\N	\N	0219876543	\N	0987654321	Joko Susilo	3174yyyyyyyyyyyy	t	100
4	Shelter Gerlong	2024-12-21	Komunitas	\N	\N		\N	\N	Ahkam Ibadurrahman	3273PJ87252	f	0
\.


--
-- TOC entry 5258 (class 0 OID 17693)
-- Dependencies: 230
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
\.


--
-- TOC entry 5271 (class 0 OID 17858)
-- Dependencies: 243
-- Data for Name: driver_locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.driver_locations (id, driver_id, assignment_id, latitude, longitude, "timestamp") FROM stdin;
1	DRV-BDG-001	1	-6.91400000	107.60800000	2025-11-19 16:17:54.863664+07
2	DRV-BDG-001	1	-6.91450000	107.60900000	2025-11-19 16:22:54.863664+07
\.


--
-- TOC entry 5250 (class 0 OID 17450)
-- Dependencies: 222
-- Data for Name: drivers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.drivers (id, user_id, shelter_id, is_available, license_info, full_name) FROM stdin;
DRV-BDG-001	30	10	t	SIM C-2027	Budi Kurniawan
DRV-BDG-002	31	10	t	SIM C-2026	Cecep Supriadi
\.


--
-- TOC entry 5261 (class 0 OID 17747)
-- Dependencies: 233
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (id, organizer_id, title, description, event_date, start_time, location_name, location_address, registration_link, is_active, created_at) FROM stdin;
1	10	Bazar Adopsi Massal	Datang dan adopsi kucing lucu!	2025-12-05	10:00:00	Parkir Timur	Jl. Sukarno Hatta No. 100	\N	t	2025-11-10 10:00:00
\.


--
-- TOC entry 5262 (class 0 OID 17769)
-- Dependencies: 234
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
-- TOC entry 5253 (class 0 OID 17526)
-- Dependencies: 225
-- Data for Name: favorite_cats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.favorite_cats (user_id, cat_id, created_at) FROM stdin;
20	2	2025-11-10 10:00:00
21	1	2025-11-11 11:00:00
20	3	2025-11-12 12:00:00
3	4	2025-11-20 21:28:51.089669
3	1	2025-11-20 21:38:18.3317
\.


--
-- TOC entry 5265 (class 0 OID 17812)
-- Dependencies: 237
-- Data for Name: global_achievements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.global_achievements (id, name, description, target_condition, points) FROM stdin;
1	Donasi Pertama	Berhasil melakukan donasi pertama.	FIRST_DONATION	5
2	Donasi 100 Ribu	Total akumulasi donasi mencapai Rp 100.000.	TOTAL_DONATION_100K	15
3	Warga Teladan	Berhasil menyelesaikan 5 Quest.	COMPLETE_5_QUESTS	25
\.


--
-- TOC entry 5267 (class 0 OID 17827)
-- Dependencies: 239
-- Data for Name: global_quests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.global_quests (id, name, target_value, points, type) FROM stdin;
1	Warga Forum	5.00	2	FORUM_POST_COUNT
2	1 Tahun Bersama	365.00	15	DAYS_SINCE_JOIN
3	Donasi 1 Juta	1000000.00	15	TOTAL_DONATION_AMOUNT
4	Donatur Sejati	1.00	25	HAS_DONATED
\.


--
-- TOC entry 5282 (class 0 OID 19319)
-- Dependencies: 254
-- Data for Name: lost_cats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lost_cats (id, owner_id, name, age, breed, color, description, last_seen_address, last_seen_lat, last_seen_long, photo, reward_amount, status, created_at) FROM stdin;
\.


--
-- TOC entry 5278 (class 0 OID 19270)
-- Dependencies: 250
-- Data for Name: post_likes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.post_likes (user_id, post_id, created_at) FROM stdin;
3	1	2025-11-21 12:28:12.272893
3	2	2025-11-21 12:28:55.313075
3	4	2025-11-21 12:48:27.321307
3	5	2025-11-21 12:48:29.925136
3	3	2025-11-21 12:48:32.821195
\.


--
-- TOC entry 5257 (class 0 OID 17664)
-- Dependencies: 229
-- Data for Name: reply_comment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reply_comment (id, user_id, comment_id, parent_reply_id, content, likes_count, created_at, updated_at) FROM stdin;
1	20	1	\N	Terima kasih sarannya Budi!	0	2025-11-17 10:30:00	2025-11-17 10:30:00
\.


--
-- TOC entry 5284 (class 0 OID 19344)
-- Dependencies: 256
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reports (id, reporter_id, report_type, lost_cat_id, shelter_assigned_id, location, latitude, longitude, description, photo, report_date) FROM stdin;
1	20	Injured	\N	10	Jl. Kebon Jati, Bandung	-6.91470000	107.60980000	Kucing tertabrak, kaki belakang luka parah.	photo_report_1.jpg	2025-11-18
2	21	Abandoned	\N	11	Jl. Thamrin, Jakarta	-6.17540000	106.82720000	Ditinggalkan di depan ruko, sangat kurus.	photo_report_2.jpg	2025-11-17
\.


--
-- TOC entry 5254 (class 0 OID 17570)
-- Dependencies: 226
-- Data for Name: rescue_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rescue_assignments (id, report_id, driver_id, shelter_id, assignment_status, assigned_at, started_transit_at, completed_at, estimated_pickup_time, notes) FROM stdin;
1	1	DRV-BDG-001	10	in_transit	2025-11-18 10:30:00	\N	\N	2025-11-18 11:30:00	\N
\.


--
-- TOC entry 5269 (class 0 OID 17839)
-- Dependencies: 241
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
-- TOC entry 5247 (class 0 OID 17393)
-- Dependencies: 219
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password_hash, role) FROM stdin;
20	andi_adopter	andi@mail.com	hashed_andi_pw	individu
21	budi_donatur	budi@mail.com	hashed_budi_pw	individu
30	driver_budi	budi_drv@mail.com	hashed_driver_pw	driver
31	driver_cecep	cecep_drv@mail.com	hashed_driver_pw	driver
1	admin_super	admin@cattake.id	$2a$12$d/ZK/aMZymZ2cZZmeHG4lO96xdfnzf1aNUe4hPalXvA.ZJy5ZW6ae	admin
2	tester_azmi_001	azmi.test.001@mail.com	$2b$10$rW1H7VCzKWWmB34tZ/epmeh0HTDfFY4VucoY3P7hbg3t9sjjrsdiy	individu
3	zicofarry	mhmmdzmslm36@gmail.com	$2b$10$S/.SrKBrNC0Lt7QTIauaDe4KiQZJ4w3QxTa5Y4OnT.c07yIEMzd6S	individu
5	repa	repapit@gmail.com	$2b$10$Nh4VBkWfDYoC9k9AAjwOUuPJ6Lq6ytPzSi2Eek2FCFri214Knkb6.	individu
6	salman	salman@gmail.com	$2b$10$AeaVKPcAQVhjtauAtlPGY.qAeU.HdcnnxvMOfFh.7ks2VHXH5KRjy	individu
7	ajipati	ajipatialaga@gmail.com	$2b$10$lb.HCCUv0FzxgDf6qZ5cmOqYbqbU0kYoVnl9oYU7uwFHj9o88VxWu	individu
8	anas	anasmifta@gmail.com	$2b$10$JDKS8/kOsH3voDP3fwHFdeJfC5tgyJr7GwbsBtSNLfJ7w3gxyWpFW	individu
11	shelter-jakarta	shelter_jkt@mail.com	$2a$12$EyaNgDWLl4uXeK5luSp6NeNg3rnl3v3wJ8MZhnQIMCmYCK2/MYxBy	shelter
4	shelter-gerlong	sheltergerlong@gmail.com	$2a$12$0c7TwUaK9VKllvejqx9kbOzwggL9YfrA43s3VYY/.h.RDY6.PiRve	shelter
10	shelter-bandung	shelter_bdg@mail.com	$2a$12$QYCFZ1l2CA56uhoWCg9HKugM5c9kPn8Hib1/G06mfTAukH/wk3QyG	shelter
9	ahkam	ahkam@gmail.com	$2b$10$8M1t/X/qTGKo0z0BW/1ErORz/APS2A9AB6kXEk.NY/0smvg6PoVYy	individu
\.


--
-- TOC entry 5259 (class 0 OID 17714)
-- Dependencies: 231
-- Data for Name: verification_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.verification_log (id, user_id, verifier_id, verification_type, status, notes, created_at) FROM stdin;
\.


--
-- TOC entry 5298 (class 0 OID 0)
-- Dependencies: 245
-- Name: adoptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.adoptions_id_seq', 14, true);


--
-- TOC entry 5299 (class 0 OID 0)
-- Dependencies: 244
-- Name: cats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cats_id_seq', 11, true);


--
-- TOC entry 5300 (class 0 OID 0)
-- Dependencies: 247
-- Name: comment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comment_id_seq', 14, true);


--
-- TOC entry 5301 (class 0 OID 0)
-- Dependencies: 249
-- Name: community_post_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.community_post_id_seq', 5, true);


--
-- TOC entry 5302 (class 0 OID 0)
-- Dependencies: 251
-- Name: community_post_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.community_post_id_seq1', 1, false);


--
-- TOC entry 5303 (class 0 OID 0)
-- Dependencies: 246
-- Name: donations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.donations_id_seq', 9, true);


--
-- TOC entry 5304 (class 0 OID 0)
-- Dependencies: 242
-- Name: driver_locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.driver_locations_id_seq', 2, true);


--
-- TOC entry 5305 (class 0 OID 0)
-- Dependencies: 236
-- Name: global_achievements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.global_achievements_id_seq', 1, false);


--
-- TOC entry 5306 (class 0 OID 0)
-- Dependencies: 238
-- Name: global_quests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.global_quests_id_seq', 1, false);


--
-- TOC entry 5307 (class 0 OID 0)
-- Dependencies: 253
-- Name: lost_cats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lost_cats_id_seq', 1, false);


--
-- TOC entry 5308 (class 0 OID 0)
-- Dependencies: 248
-- Name: reply_comment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reply_comment_id_seq', 1, true);


--
-- TOC entry 5309 (class 0 OID 0)
-- Dependencies: 255
-- Name: reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reports_id_seq', 2, true);


--
-- TOC entry 5310 (class 0 OID 0)
-- Dependencies: 240
-- Name: user_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_progress_id_seq', 12, true);


--
-- TOC entry 5311 (class 0 OID 0)
-- Dependencies: 235
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 9, true);


--
-- TOC entry 5025 (class 2606 OID 17515)
-- Name: adoptions adoptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adoptions
    ADD CONSTRAINT adoptions_pkey PRIMARY KEY (id);


--
-- TOC entry 5043 (class 2606 OID 17746)
-- Name: cat_facts cat_facts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_facts
    ADD CONSTRAINT cat_facts_pkey PRIMARY KEY (id);


--
-- TOC entry 5023 (class 2606 OID 17499)
-- Name: cats cats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cats
    ADD CONSTRAINT cats_pkey PRIMARY KEY (id);


--
-- TOC entry 5033 (class 2606 OID 17611)
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- TOC entry 5035 (class 2606 OID 17653)
-- Name: comment comment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_pkey PRIMARY KEY (id);


--
-- TOC entry 5061 (class 2606 OID 19302)
-- Name: community_post community_post_pkey1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.community_post
    ADD CONSTRAINT community_post_pkey1 PRIMARY KEY (id);


--
-- TOC entry 5009 (class 2606 OID 17422)
-- Name: detail_user_individu detail_user_individu_nik_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detail_user_individu
    ADD CONSTRAINT detail_user_individu_nik_key UNIQUE (nik);


--
-- TOC entry 5011 (class 2606 OID 17420)
-- Name: detail_user_individu detail_user_individu_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detail_user_individu
    ADD CONSTRAINT detail_user_individu_pkey PRIMARY KEY (id);


--
-- TOC entry 5013 (class 2606 OID 17442)
-- Name: detail_user_shelter detail_user_shelter_donation_account_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detail_user_shelter
    ADD CONSTRAINT detail_user_shelter_donation_account_number_key UNIQUE (donation_account_number);


--
-- TOC entry 5015 (class 2606 OID 17444)
-- Name: detail_user_shelter detail_user_shelter_pj_nik_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detail_user_shelter
    ADD CONSTRAINT detail_user_shelter_pj_nik_key UNIQUE (pj_nik);


--
-- TOC entry 5017 (class 2606 OID 17440)
-- Name: detail_user_shelter detail_user_shelter_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detail_user_shelter
    ADD CONSTRAINT detail_user_shelter_pkey PRIMARY KEY (id);


--
-- TOC entry 5039 (class 2606 OID 17703)
-- Name: donations donations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_pkey PRIMARY KEY (id);


--
-- TOC entry 5057 (class 2606 OID 17867)
-- Name: driver_locations driver_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_locations
    ADD CONSTRAINT driver_locations_pkey PRIMARY KEY (id);


--
-- TOC entry 5019 (class 2606 OID 17461)
-- Name: drivers drivers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_pkey PRIMARY KEY (id);


--
-- TOC entry 5021 (class 2606 OID 17463)
-- Name: drivers drivers_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_user_id_key UNIQUE (user_id);


--
-- TOC entry 5045 (class 2606 OID 17763)
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- TOC entry 5047 (class 2606 OID 17778)
-- Name: faq faq_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faq
    ADD CONSTRAINT faq_pkey PRIMARY KEY (id);


--
-- TOC entry 5027 (class 2606 OID 17533)
-- Name: favorite_cats favorite_cats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorite_cats
    ADD CONSTRAINT favorite_cats_pkey PRIMARY KEY (user_id, cat_id);


--
-- TOC entry 5049 (class 2606 OID 17823)
-- Name: global_achievements global_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.global_achievements
    ADD CONSTRAINT global_achievements_pkey PRIMARY KEY (id);


--
-- TOC entry 5051 (class 2606 OID 17825)
-- Name: global_achievements global_achievements_target_condition_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.global_achievements
    ADD CONSTRAINT global_achievements_target_condition_key UNIQUE (target_condition);


--
-- TOC entry 5053 (class 2606 OID 17837)
-- Name: global_quests global_quests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.global_quests
    ADD CONSTRAINT global_quests_pkey PRIMARY KEY (id);


--
-- TOC entry 5063 (class 2606 OID 19332)
-- Name: lost_cats lost_cats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lost_cats
    ADD CONSTRAINT lost_cats_pkey PRIMARY KEY (id);


--
-- TOC entry 5059 (class 2606 OID 19277)
-- Name: post_likes post_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_pkey PRIMARY KEY (user_id, post_id);


--
-- TOC entry 5037 (class 2606 OID 17677)
-- Name: reply_comment reply_comment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reply_comment
    ADD CONSTRAINT reply_comment_pkey PRIMARY KEY (id);


--
-- TOC entry 5065 (class 2606 OID 19361)
-- Name: reports reports_pkey1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey1 PRIMARY KEY (id);


--
-- TOC entry 5029 (class 2606 OID 17582)
-- Name: rescue_assignments rescue_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_assignments
    ADD CONSTRAINT rescue_assignments_pkey PRIMARY KEY (id);


--
-- TOC entry 5031 (class 2606 OID 17584)
-- Name: rescue_assignments rescue_assignments_report_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_assignments
    ADD CONSTRAINT rescue_assignments_report_id_key UNIQUE (report_id);


--
-- TOC entry 5055 (class 2606 OID 17851)
-- Name: user_progress user_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_pkey PRIMARY KEY (id);


--
-- TOC entry 5003 (class 2606 OID 17408)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 5005 (class 2606 OID 17404)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5007 (class 2606 OID 17406)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 5041 (class 2606 OID 17725)
-- Name: verification_log verification_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification_log
    ADD CONSTRAINT verification_log_pkey PRIMARY KEY (id);


--
-- TOC entry 5071 (class 2606 OID 17521)
-- Name: adoptions adoptions_applicant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adoptions
    ADD CONSTRAINT adoptions_applicant_id_fkey FOREIGN KEY (applicant_id) REFERENCES public.users(id);


--
-- TOC entry 5072 (class 2606 OID 17516)
-- Name: adoptions adoptions_cat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adoptions
    ADD CONSTRAINT adoptions_cat_id_fkey FOREIGN KEY (cat_id) REFERENCES public.cats(id);


--
-- TOC entry 5070 (class 2606 OID 17500)
-- Name: cats cats_shelter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cats
    ADD CONSTRAINT cats_shelter_id_fkey FOREIGN KEY (shelter_id) REFERENCES public.users(id);


--
-- TOC entry 5078 (class 2606 OID 17612)
-- Name: chat_messages chat_messages_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.rescue_assignments(id);


--
-- TOC entry 5079 (class 2606 OID 17617)
-- Name: chat_messages chat_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- TOC entry 5080 (class 2606 OID 19308)
-- Name: comment comment_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.community_post(id);


--
-- TOC entry 5081 (class 2606 OID 17654)
-- Name: comment comment_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5095 (class 2606 OID 19303)
-- Name: community_post community_post_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.community_post
    ADD CONSTRAINT community_post_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- TOC entry 5066 (class 2606 OID 17806)
-- Name: detail_user_individu detail_user_individu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detail_user_individu
    ADD CONSTRAINT detail_user_individu_id_fkey FOREIGN KEY (id) REFERENCES public.users(id);


--
-- TOC entry 5067 (class 2606 OID 17445)
-- Name: detail_user_shelter detail_user_shelter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detail_user_shelter
    ADD CONSTRAINT detail_user_shelter_id_fkey FOREIGN KEY (id) REFERENCES public.users(id);


--
-- TOC entry 5085 (class 2606 OID 17704)
-- Name: donations donations_donatur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_donatur_id_fkey FOREIGN KEY (donatur_id) REFERENCES public.users(id);


--
-- TOC entry 5086 (class 2606 OID 17709)
-- Name: donations donations_shelter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_shelter_id_fkey FOREIGN KEY (shelter_id) REFERENCES public.users(id);


--
-- TOC entry 5091 (class 2606 OID 17873)
-- Name: driver_locations driver_locations_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_locations
    ADD CONSTRAINT driver_locations_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.rescue_assignments(id) ON DELETE CASCADE;


--
-- TOC entry 5092 (class 2606 OID 17868)
-- Name: driver_locations driver_locations_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_locations
    ADD CONSTRAINT driver_locations_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.drivers(id) ON DELETE CASCADE;


--
-- TOC entry 5068 (class 2606 OID 17469)
-- Name: drivers drivers_shelter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_shelter_id_fkey FOREIGN KEY (shelter_id) REFERENCES public.users(id);


--
-- TOC entry 5069 (class 2606 OID 17464)
-- Name: drivers drivers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5089 (class 2606 OID 17764)
-- Name: events events_organizer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.users(id);


--
-- TOC entry 5073 (class 2606 OID 17539)
-- Name: favorite_cats favorite_cats_cat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorite_cats
    ADD CONSTRAINT favorite_cats_cat_id_fkey FOREIGN KEY (cat_id) REFERENCES public.cats(id);


--
-- TOC entry 5074 (class 2606 OID 17534)
-- Name: favorite_cats favorite_cats_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorite_cats
    ADD CONSTRAINT favorite_cats_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5096 (class 2606 OID 19333)
-- Name: lost_cats fk_owner; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lost_cats
    ADD CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5097 (class 2606 OID 19372)
-- Name: reports fk_reports_lost_cat; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT fk_reports_lost_cat FOREIGN KEY (lost_cat_id) REFERENCES public.lost_cats(id) ON DELETE SET NULL;


--
-- TOC entry 5093 (class 2606 OID 19313)
-- Name: post_likes post_likes_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.community_post(id) ON DELETE CASCADE;


--
-- TOC entry 5094 (class 2606 OID 19278)
-- Name: post_likes post_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5082 (class 2606 OID 17683)
-- Name: reply_comment reply_comment_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reply_comment
    ADD CONSTRAINT reply_comment_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comment(id);


--
-- TOC entry 5083 (class 2606 OID 17688)
-- Name: reply_comment reply_comment_parent_reply_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reply_comment
    ADD CONSTRAINT reply_comment_parent_reply_id_fkey FOREIGN KEY (parent_reply_id) REFERENCES public.reply_comment(id);


--
-- TOC entry 5084 (class 2606 OID 17678)
-- Name: reply_comment reply_comment_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reply_comment
    ADD CONSTRAINT reply_comment_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5098 (class 2606 OID 19362)
-- Name: reports reports_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id);


--
-- TOC entry 5099 (class 2606 OID 19367)
-- Name: reports reports_shelter_assigned_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_shelter_assigned_id_fkey FOREIGN KEY (shelter_assigned_id) REFERENCES public.users(id);


--
-- TOC entry 5075 (class 2606 OID 17590)
-- Name: rescue_assignments rescue_assignments_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_assignments
    ADD CONSTRAINT rescue_assignments_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.drivers(id);


--
-- TOC entry 5076 (class 2606 OID 19377)
-- Name: rescue_assignments rescue_assignments_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_assignments
    ADD CONSTRAINT rescue_assignments_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.reports(id);


--
-- TOC entry 5077 (class 2606 OID 17595)
-- Name: rescue_assignments rescue_assignments_shelter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_assignments
    ADD CONSTRAINT rescue_assignments_shelter_id_fkey FOREIGN KEY (shelter_id) REFERENCES public.users(id);


--
-- TOC entry 5090 (class 2606 OID 17852)
-- Name: user_progress user_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5087 (class 2606 OID 17726)
-- Name: verification_log verification_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification_log
    ADD CONSTRAINT verification_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5088 (class 2606 OID 17731)
-- Name: verification_log verification_log_verifier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification_log
    ADD CONSTRAINT verification_log_verifier_id_fkey FOREIGN KEY (verifier_id) REFERENCES public.users(id);


-- Completed on 2025-11-21 15:39:35

--
-- PostgreSQL database dump complete
--

\unrestrict MjlAMjdm52YWub6l2q0sOCdZsDs6IcpMn0rifgB9wXL1iLAxLU78cQSZrjdqS6T

