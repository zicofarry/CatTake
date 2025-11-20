--
-- PostgreSQL database dump
--

\restrict U1dD7lCPaLsKm2bab7PuhQCckRhefcYZkkKvhaX2xVPnN7CdcsfssFoY2YpoPDv

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

-- Started on 2025-11-19 15:08:04

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 224 (class 1259 OID 17505)
-- Name: adoptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.adoptions (
    id integer NOT NULL,
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
-- TOC entry 234 (class 1259 OID 17736)
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
-- TOC entry 223 (class 1259 OID 17488)
-- Name: cats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cats (
    id integer NOT NULL,
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
-- TOC entry 228 (class 1259 OID 17600)
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
-- TOC entry 230 (class 1259 OID 17640)
-- Name: comment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comment (
    id integer NOT NULL,
    user_id integer NOT NULL,
    post_id integer NOT NULL,
    content text NOT NULL,
    likes_count integer DEFAULT 0,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.comment OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 17622)
-- Name: community_post; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.community_post (
    id integer NOT NULL,
    author_id integer NOT NULL,
    content text NOT NULL,
    media_path character varying(255),
    likes_count integer DEFAULT 0,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.community_post OWNER TO postgres;

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
-- TOC entry 232 (class 1259 OID 17693)
-- Name: donations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.donations (
    id integer NOT NULL,
    donatur_id integer NOT NULL,
    shelter_id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    donation_date date NOT NULL,
    is_anonymus boolean DEFAULT false
);


ALTER TABLE public.donations OWNER TO postgres;

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
-- TOC entry 235 (class 1259 OID 17747)
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
-- TOC entry 236 (class 1259 OID 17769)
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
-- TOC entry 231 (class 1259 OID 17664)
-- Name: reply_comment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reply_comment (
    id integer NOT NULL,
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
-- TOC entry 226 (class 1259 OID 17544)
-- Name: reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reports (
    id integer NOT NULL,
    reporter_id integer NOT NULL,
    report_type character varying(50) NOT NULL,
    shelter_assigned_id integer,
    location character varying(255) NOT NULL,
    latitude numeric(10,8) NOT NULL,
    longitude numeric(11,8) NOT NULL,
    description text NOT NULL,
    photo character varying(255) NOT NULL,
    report_date date NOT NULL,
    CONSTRAINT check_report_type CHECK (((report_type)::text = ANY ((ARRAY['Missing'::character varying, 'Injured'::character varying, 'Abandoned'::character varying, 'Abuse'::character varying])::text[])))
);


ALTER TABLE public.reports OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 17570)
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
-- TOC entry 237 (class 1259 OID 17802)
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
-- TOC entry 233 (class 1259 OID 17714)
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
-- TOC entry 5175 (class 0 OID 17505)
-- Dependencies: 224
-- Data for Name: adoptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.adoptions (id, cat_id, applicant_id, statement_letter_path, status, applied_at, verified_at, updated_at) FROM stdin;
1	3	20	/docs/stmt_andi_1.pdf	pending	2025-11-15 15:00:00	\N	2025-11-15 15:00:00
\.


--
-- TOC entry 5185 (class 0 OID 17736)
-- Dependencies: 234
-- Data for Name: cat_facts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cat_facts (id, fact_text, source, image_path, is_verified, created_at) FROM stdin;
1	Kucing menghabiskan 70% hidupnya untuk tidur.	\N	\N	t	2025-01-01 00:00:00
2	Grup kucing disebut clowder.	\N	\N	t	2025-01-01 00:00:00
\.


--
-- TOC entry 5174 (class 0 OID 17488)
-- Dependencies: 223
-- Data for Name: cats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cats (id, shelter_id, name, age, gender, breed, description, health_status, adoption_status, photo) FROM stdin;
3	11	Simba	23	male	Maine Coon	Gagah dan berani, cocok untuk menjaga rumah dari tikus.	vaccinated	available	bradercat.png
4	10	Mueza	8	female	Persia	Manis, lembut, dan suka tidur di pangkuan.	healthy	available	mochacat.png
5	11	Kitty	36	female	Anggora	Tenang dan penyayang, sudah diadopsi.	vaccinated	adopted	kitty.png
1	10	Oyen	6	male	American Shorthair	Suka mencari keributan di komplek. Sering terlihat mencuri ikan asin tetangga.	vaccinated	available	oyencat.png
2	10	Abul	5	male	Domestik	Kucing pemalu tapi sangat manja jika sudah kenal.	healthy	available	minicat.png
\.


--
-- TOC entry 5179 (class 0 OID 17600)
-- Dependencies: 228
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chat_messages (id, assignment_id, sender_id, message, sent_at) FROM stdin;
1	1	30	Halo, saya driver Budi, sudah di jalan menuju lokasi Anda.	2025-11-18 10:35:00
2	1	20	Baik, Pak Budi. Hati-hati ya!	2025-11-18 10:36:00
\.


--
-- TOC entry 5181 (class 0 OID 17640)
-- Dependencies: 230
-- Data for Name: comment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comment (id, user_id, post_id, content, likes_count, created_at, updated_at) FROM stdin;
1	21	1	Mungkin dia kekurangan serat, coba berikan rumput gandum khusus.	0	2025-11-17 10:00:00	2025-11-17 10:00:00
2	10	1	Pastikan daunnya bukan tanaman beracun ya!	0	2025-11-17 10:15:00	2025-11-17 10:15:00
\.


--
-- TOC entry 5180 (class 0 OID 17622)
-- Dependencies: 229
-- Data for Name: community_post; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.community_post (id, author_id, content, media_path, likes_count, created_at, updated_at) FROM stdin;
1	20	Kucing saya Si Putih suka makan daun, apakah normal?	\N	0	2025-11-17 09:00:00	2025-11-17 09:00:00
2	10	Kami membuka kuota sterilisasi gratis bulan ini!	\N	0	2025-11-18 10:00:00	2025-11-18 10:00:00
\.


--
-- TOC entry 5171 (class 0 OID 17409)
-- Dependencies: 220
-- Data for Name: detail_user_individu; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detail_user_individu (id, full_name, birth_date, gender, profile_picture, bio, contact_phone, address, job, nik, ktp_file_path, is_verified, is_adopter_ready, donasi_history_count) FROM stdin;
20	Andi Gunawan	1995-05-10	male	\N	\N	081234567890	Jl. Adopsi No. 5, Bandung	Software Engineer	3273xxxxxxxxxxxx	\N	t	f	3
21	Budi Santoso	1990-01-20	male	\N	\N	081234567891	Jl. Donasi No. 10, Jakarta	Pengusaha	3174xxxxxxxxxxxx	\N	t	f	10
2	Azmi Tester	1990-01-01	male	\N	\N		alamat belum diverifikasi	Pelajar	3273100101900005	\N	f	f	0
6	Salman	\N	\N	\N	\N		\N	\N	\N	\N	f	f	0
5	Repa Pitriani	2005-11-05	female	repa.JPG	\N		alamat belum diverifikasi	Unknown	32731763530891182975	\N	f	f	0
7	Ajipati Alaga	\N	\N	\N	\N		\N	\N	\N	\N	f	f	0
3	Muhammad 'Azmi	2006-06-30	male	zicofarry.JPG	\N		alamat belum diverifikasi	Pelajar	3204323006060008	\N	f	f	0
\.


--
-- TOC entry 5172 (class 0 OID 17428)
-- Dependencies: 221
-- Data for Name: detail_user_shelter; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detail_user_shelter (id, shelter_name, established_date, organization_type, shelter_picture, bio, contact_phone, legal_certificate, donation_account_number, pj_name, pj_nik, is_verified_shelter, cat_capacity) FROM stdin;
10	Rumah Kucing Bandung	2015-08-17	Komunitas	\N	\N	0227654321	\N	1234567890	Rina Anggraini	3273zzzzzzzzzzzz	t	50
11	Panti Cat Sejahtera	2010-02-28	Yayasan	\N	\N	0219876543	\N	0987654321	Joko Susilo	3174yyyyyyyyyyyy	t	100
4	Shelter Kulalet	\N	Komunitas	\N	\N		\N	\N	Ahkam Ibadurrahman	3273PJ87252	f	0
\.


--
-- TOC entry 5183 (class 0 OID 17693)
-- Dependencies: 232
-- Data for Name: donations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.donations (id, donatur_id, shelter_id, amount, donation_date, is_anonymus) FROM stdin;
1	21	10	50000.00	2025-11-16	f
2	20	10	100000.00	2025-11-16	f
3	21	11	20000.00	2025-11-17	t
\.


--
-- TOC entry 5173 (class 0 OID 17450)
-- Dependencies: 222
-- Data for Name: drivers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.drivers (id, user_id, shelter_id, is_available, license_info, full_name) FROM stdin;
DRV-BDG-001	30	10	t	SIM C-2027	Budi Kurniawan
DRV-BDG-002	31	10	t	SIM C-2026	Cecep Supriadi
\.


--
-- TOC entry 5186 (class 0 OID 17747)
-- Dependencies: 235
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (id, organizer_id, title, description, event_date, start_time, location_name, location_address, registration_link, is_active, created_at) FROM stdin;
1	10	Bazar Adopsi Massal	Datang dan adopsi kucing lucu!	2025-12-05	10:00:00	Parkir Timur	Jl. Sukarno Hatta No. 100	\N	t	2025-11-10 10:00:00
\.


--
-- TOC entry 5187 (class 0 OID 17769)
-- Dependencies: 236
-- Data for Name: faq; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.faq (id, question, answer) FROM stdin;
1	Bagaimana cara adopsi?	Anda harus mengisi formulir adopsi, wawancara, dan survei rumah.
2	Apa itu kucing steril?	Kucing steril adalah kucing yang sudah diangkat indung telur/testisnya.
\.


--
-- TOC entry 5176 (class 0 OID 17526)
-- Dependencies: 225
-- Data for Name: favorite_cats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.favorite_cats (user_id, cat_id, created_at) FROM stdin;
20	2	2025-11-10 10:00:00
21	1	2025-11-11 11:00:00
20	3	2025-11-12 12:00:00
\.


--
-- TOC entry 5182 (class 0 OID 17664)
-- Dependencies: 231
-- Data for Name: reply_comment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reply_comment (id, user_id, comment_id, parent_reply_id, content, likes_count, created_at, updated_at) FROM stdin;
1	20	1	\N	Terima kasih sarannya Budi!	0	2025-11-17 10:30:00	2025-11-17 10:30:00
\.


--
-- TOC entry 5177 (class 0 OID 17544)
-- Dependencies: 226
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reports (id, reporter_id, report_type, shelter_assigned_id, location, latitude, longitude, description, photo, report_date) FROM stdin;
1	20	Injured	10	Jl. Kebon Jati, Bandung	-6.91470000	107.60980000	Kucing tertabrak, kaki belakang luka parah.	photo_report_1.jpg	2025-11-18
2	21	Abandoned	11	Jl. Thamrin, Jakarta	-6.17540000	106.82720000	Ditinggalkan di depan ruko, sangat kurus.	photo_report_2.jpg	2025-11-17
\.


--
-- TOC entry 5178 (class 0 OID 17570)
-- Dependencies: 227
-- Data for Name: rescue_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rescue_assignments (id, report_id, driver_id, shelter_id, assignment_status, assigned_at, started_transit_at, completed_at, estimated_pickup_time, notes) FROM stdin;
1	1	DRV-BDG-001	10	in_transit	2025-11-18 10:30:00	\N	\N	2025-11-18 11:30:00	\N
\.


--
-- TOC entry 5170 (class 0 OID 17393)
-- Dependencies: 219
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password_hash, role) FROM stdin;
10	shelter_bandung	shelter_bdg@mail.com	hashed_shelter_pw	shelter
11	shelter_jakarta	shelter_jkt@mail.com	hashed_shelter_pw	shelter
20	andi_adopter	andi@mail.com	hashed_andi_pw	individu
21	budi_donatur	budi@mail.com	hashed_budi_pw	individu
30	driver_budi	budi_drv@mail.com	hashed_driver_pw	driver
31	driver_cecep	cecep_drv@mail.com	hashed_driver_pw	driver
1	admin_super	admin@cattake.id	$2a$12$d/ZK/aMZymZ2cZZmeHG4lO96xdfnzf1aNUe4hPalXvA.ZJy5ZW6ae	admin
2	tester_azmi_001	azmi.test.001@mail.com	$2b$10$rW1H7VCzKWWmB34tZ/epmeh0HTDfFY4VucoY3P7hbg3t9sjjrsdiy	individu
3	zicofarry	mhmmdzmslm36@gmail.com	$2b$10$S/.SrKBrNC0Lt7QTIauaDe4KiQZJ4w3QxTa5Y4OnT.c07yIEMzd6S	individu
4	shelter-kulalet	shelterkulalet@gmail.com	$2b$10$wto/fuexiXksgWTxEaHvsObatUWRy9amQMRZqpBRJDLY2b1AomUWK	shelter
5	repa	repapit@gmail.com	$2b$10$Nh4VBkWfDYoC9k9AAjwOUuPJ6Lq6ytPzSi2Eek2FCFri214Knkb6.	individu
6	salman	salman@gmail.com	$2b$10$AeaVKPcAQVhjtauAtlPGY.qAeU.HdcnnxvMOfFh.7ks2VHXH5KRjy	individu
7	ajipati	ajipatialaga@gmail.com	$2b$10$lb.HCCUv0FzxgDf6qZ5cmOqYbqbU0kYoVnl9oYU7uwFHj9o88VxWu	individu
\.


--
-- TOC entry 5184 (class 0 OID 17714)
-- Dependencies: 233
-- Data for Name: verification_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.verification_log (id, user_id, verifier_id, verification_type, status, notes, created_at) FROM stdin;
\.


--
-- TOC entry 5194 (class 0 OID 0)
-- Dependencies: 237
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 7, true);


--
-- TOC entry 4969 (class 2606 OID 17515)
-- Name: adoptions adoptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adoptions
    ADD CONSTRAINT adoptions_pkey PRIMARY KEY (id);


--
-- TOC entry 4991 (class 2606 OID 17746)
-- Name: cat_facts cat_facts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_facts
    ADD CONSTRAINT cat_facts_pkey PRIMARY KEY (id);


--
-- TOC entry 4967 (class 2606 OID 17499)
-- Name: cats cats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cats
    ADD CONSTRAINT cats_pkey PRIMARY KEY (id);


--
-- TOC entry 4979 (class 2606 OID 17611)
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- TOC entry 4983 (class 2606 OID 17653)
-- Name: comment comment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_pkey PRIMARY KEY (id);


--
-- TOC entry 4981 (class 2606 OID 17634)
-- Name: community_post community_post_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.community_post
    ADD CONSTRAINT community_post_pkey PRIMARY KEY (id);


--
-- TOC entry 4953 (class 2606 OID 17422)
-- Name: detail_user_individu detail_user_individu_nik_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detail_user_individu
    ADD CONSTRAINT detail_user_individu_nik_key UNIQUE (nik);


--
-- TOC entry 4955 (class 2606 OID 17420)
-- Name: detail_user_individu detail_user_individu_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detail_user_individu
    ADD CONSTRAINT detail_user_individu_pkey PRIMARY KEY (id);


--
-- TOC entry 4957 (class 2606 OID 17442)
-- Name: detail_user_shelter detail_user_shelter_donation_account_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detail_user_shelter
    ADD CONSTRAINT detail_user_shelter_donation_account_number_key UNIQUE (donation_account_number);


--
-- TOC entry 4959 (class 2606 OID 17444)
-- Name: detail_user_shelter detail_user_shelter_pj_nik_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detail_user_shelter
    ADD CONSTRAINT detail_user_shelter_pj_nik_key UNIQUE (pj_nik);


--
-- TOC entry 4961 (class 2606 OID 17440)
-- Name: detail_user_shelter detail_user_shelter_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detail_user_shelter
    ADD CONSTRAINT detail_user_shelter_pkey PRIMARY KEY (id);


--
-- TOC entry 4987 (class 2606 OID 17703)
-- Name: donations donations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_pkey PRIMARY KEY (id);


--
-- TOC entry 4963 (class 2606 OID 17461)
-- Name: drivers drivers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_pkey PRIMARY KEY (id);


--
-- TOC entry 4965 (class 2606 OID 17463)
-- Name: drivers drivers_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_user_id_key UNIQUE (user_id);


--
-- TOC entry 4993 (class 2606 OID 17763)
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- TOC entry 4995 (class 2606 OID 17778)
-- Name: faq faq_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faq
    ADD CONSTRAINT faq_pkey PRIMARY KEY (id);


--
-- TOC entry 4971 (class 2606 OID 17533)
-- Name: favorite_cats favorite_cats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorite_cats
    ADD CONSTRAINT favorite_cats_pkey PRIMARY KEY (user_id, cat_id);


--
-- TOC entry 4985 (class 2606 OID 17677)
-- Name: reply_comment reply_comment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reply_comment
    ADD CONSTRAINT reply_comment_pkey PRIMARY KEY (id);


--
-- TOC entry 4973 (class 2606 OID 17559)
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- TOC entry 4975 (class 2606 OID 17582)
-- Name: rescue_assignments rescue_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_assignments
    ADD CONSTRAINT rescue_assignments_pkey PRIMARY KEY (id);


--
-- TOC entry 4977 (class 2606 OID 17584)
-- Name: rescue_assignments rescue_assignments_report_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_assignments
    ADD CONSTRAINT rescue_assignments_report_id_key UNIQUE (report_id);


--
-- TOC entry 4947 (class 2606 OID 17408)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4949 (class 2606 OID 17404)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4951 (class 2606 OID 17406)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4989 (class 2606 OID 17725)
-- Name: verification_log verification_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification_log
    ADD CONSTRAINT verification_log_pkey PRIMARY KEY (id);


--
-- TOC entry 5001 (class 2606 OID 17521)
-- Name: adoptions adoptions_applicant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adoptions
    ADD CONSTRAINT adoptions_applicant_id_fkey FOREIGN KEY (applicant_id) REFERENCES public.users(id);


--
-- TOC entry 5002 (class 2606 OID 17516)
-- Name: adoptions adoptions_cat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adoptions
    ADD CONSTRAINT adoptions_cat_id_fkey FOREIGN KEY (cat_id) REFERENCES public.cats(id);


--
-- TOC entry 5000 (class 2606 OID 17500)
-- Name: cats cats_shelter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cats
    ADD CONSTRAINT cats_shelter_id_fkey FOREIGN KEY (shelter_id) REFERENCES public.users(id);


--
-- TOC entry 5010 (class 2606 OID 17612)
-- Name: chat_messages chat_messages_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.rescue_assignments(id);


--
-- TOC entry 5011 (class 2606 OID 17617)
-- Name: chat_messages chat_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- TOC entry 5013 (class 2606 OID 17659)
-- Name: comment comment_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.community_post(id);


--
-- TOC entry 5014 (class 2606 OID 17654)
-- Name: comment comment_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5012 (class 2606 OID 17635)
-- Name: community_post community_post_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.community_post
    ADD CONSTRAINT community_post_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- TOC entry 4996 (class 2606 OID 17806)
-- Name: detail_user_individu detail_user_individu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detail_user_individu
    ADD CONSTRAINT detail_user_individu_id_fkey FOREIGN KEY (id) REFERENCES public.users(id);


--
-- TOC entry 4997 (class 2606 OID 17445)
-- Name: detail_user_shelter detail_user_shelter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detail_user_shelter
    ADD CONSTRAINT detail_user_shelter_id_fkey FOREIGN KEY (id) REFERENCES public.users(id);


--
-- TOC entry 5018 (class 2606 OID 17704)
-- Name: donations donations_donatur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_donatur_id_fkey FOREIGN KEY (donatur_id) REFERENCES public.users(id);


--
-- TOC entry 5019 (class 2606 OID 17709)
-- Name: donations donations_shelter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_shelter_id_fkey FOREIGN KEY (shelter_id) REFERENCES public.users(id);


--
-- TOC entry 4998 (class 2606 OID 17469)
-- Name: drivers drivers_shelter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_shelter_id_fkey FOREIGN KEY (shelter_id) REFERENCES public.users(id);


--
-- TOC entry 4999 (class 2606 OID 17464)
-- Name: drivers drivers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5022 (class 2606 OID 17764)
-- Name: events events_organizer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.users(id);


--
-- TOC entry 5003 (class 2606 OID 17539)
-- Name: favorite_cats favorite_cats_cat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorite_cats
    ADD CONSTRAINT favorite_cats_cat_id_fkey FOREIGN KEY (cat_id) REFERENCES public.cats(id);


--
-- TOC entry 5004 (class 2606 OID 17534)
-- Name: favorite_cats favorite_cats_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorite_cats
    ADD CONSTRAINT favorite_cats_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5015 (class 2606 OID 17683)
-- Name: reply_comment reply_comment_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reply_comment
    ADD CONSTRAINT reply_comment_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comment(id);


--
-- TOC entry 5016 (class 2606 OID 17688)
-- Name: reply_comment reply_comment_parent_reply_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reply_comment
    ADD CONSTRAINT reply_comment_parent_reply_id_fkey FOREIGN KEY (parent_reply_id) REFERENCES public.reply_comment(id);


--
-- TOC entry 5017 (class 2606 OID 17678)
-- Name: reply_comment reply_comment_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reply_comment
    ADD CONSTRAINT reply_comment_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5005 (class 2606 OID 17560)
-- Name: reports reports_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id);


--
-- TOC entry 5006 (class 2606 OID 17565)
-- Name: reports reports_shelter_assigned_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_shelter_assigned_id_fkey FOREIGN KEY (shelter_assigned_id) REFERENCES public.users(id);


--
-- TOC entry 5007 (class 2606 OID 17590)
-- Name: rescue_assignments rescue_assignments_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_assignments
    ADD CONSTRAINT rescue_assignments_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.drivers(id);


--
-- TOC entry 5008 (class 2606 OID 17585)
-- Name: rescue_assignments rescue_assignments_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_assignments
    ADD CONSTRAINT rescue_assignments_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.reports(id);


--
-- TOC entry 5009 (class 2606 OID 17595)
-- Name: rescue_assignments rescue_assignments_shelter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_assignments
    ADD CONSTRAINT rescue_assignments_shelter_id_fkey FOREIGN KEY (shelter_id) REFERENCES public.users(id);


--
-- TOC entry 5020 (class 2606 OID 17726)
-- Name: verification_log verification_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification_log
    ADD CONSTRAINT verification_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5021 (class 2606 OID 17731)
-- Name: verification_log verification_log_verifier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification_log
    ADD CONSTRAINT verification_log_verifier_id_fkey FOREIGN KEY (verifier_id) REFERENCES public.users(id);


-- Completed on 2025-11-19 15:08:05

--
-- PostgreSQL database dump complete
--

\unrestrict U1dD7lCPaLsKm2bab7PuhQCckRhefcYZkkKvhaX2xVPnN7CdcsfssFoY2YpoPDv

