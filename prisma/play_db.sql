--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3
-- Dumped by pg_dump version 16.3

-- Started on 2025-05-21 17:06:56

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 851 (class 1247 OID 65550)
-- Name: bookingStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."bookingStatus" AS ENUM (
    'available',
    'pending',
    'confirmed',
    'completed',
    'cancelled'
);


ALTER TYPE public."bookingStatus" OWNER TO postgres;

--
-- TOC entry 854 (class 1247 OID 65562)
-- Name: paymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."paymentStatus" AS ENUM (
    'pending',
    'paid',
    'failed'
);


ALTER TYPE public."paymentStatus" OWNER TO postgres;

--
-- TOC entry 848 (class 1247 OID 65538)
-- Name: sports; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.sports AS ENUM (
    'cricket',
    'football',
    'basketball',
    'badminton',
    'tabletennis'
);


ALTER TYPE public.sports OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 217 (class 1259 OID 65586)
-- Name: ground; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ground (
    "groundId" text NOT NULL,
    name text NOT NULL,
    description text,
    latitude text NOT NULL,
    longitude text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    "startTime" timestamp(3) without time zone NOT NULL,
    "endTime" timestamp(3) without time zone NOT NULL,
    "Amenities" text[],
    "imageUrls" text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.ground OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 65609)
-- Name: groundBooking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."groundBooking" (
    "bookingId" text NOT NULL,
    duration integer NOT NULL,
    "bookingCost" double precision NOT NULL,
    "numberOfPlayers" integer NOT NULL,
    "dateForPlay" timestamp(3) without time zone NOT NULL,
    "startTime" timestamp(3) without time zone NOT NULL,
    "endTime" timestamp(3) without time zone NOT NULL,
    "courtId" text NOT NULL,
    "bookBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "groundId" text NOT NULL,
    "matchId" text,
    razorpay_order_id text DEFAULT ''::text NOT NULL,
    razorpay_payment_id text DEFAULT ''::text NOT NULL,
    razorpay_signature text DEFAULT ''::text NOT NULL
);


ALTER TABLE public."groundBooking" OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 65601)
-- Name: groundCourts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."groundCourts" (
    "groundCourtId" text NOT NULL,
    "courtName" text NOT NULL,
    "pricePerHour" double precision NOT NULL,
    "sportType" public.sports NOT NULL,
    dimentions text,
    "surfaceType" text,
    "playersCapacity" integer NOT NULL,
    "groundId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."groundCourts" OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 65594)
-- Name: groundRating; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."groundRating" (
    "ratingId" text NOT NULL,
    rating integer NOT NULL,
    "userId" text NOT NULL,
    "groundId" text NOT NULL
);


ALTER TABLE public."groundRating" OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 65619)
-- Name: matches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.matches (
    "matchId" text NOT NULL,
    name text NOT NULL,
    description character varying(1024),
    date timestamp(3) without time zone NOT NULL,
    "sportType" public.sports NOT NULL,
    "noOfPlayers" integer DEFAULT 1 NOT NULL,
    "groundId" text NOT NULL,
    "hostId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.matches OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 81921)
-- Name: pendingRequests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."pendingRequests" (
    id text NOT NULL,
    "matchId" text NOT NULL,
    "userId" text NOT NULL
);


ALTER TABLE public."pendingRequests" OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 65628)
-- Name: teamMembers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."teamMembers" (
    id text NOT NULL,
    "matchId" text NOT NULL,
    "userId" text NOT NULL,
    "isHost" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."teamMembers" OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 65569)
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    "userId" text NOT NULL,
    name text NOT NULL,
    username text NOT NULL,
    "emailAddress" text NOT NULL,
    "mobileNumber" text,
    password text NOT NULL,
    "dateOfBirth" timestamp(3) without time zone,
    gender text,
    "profileImageUrl" text DEFAULT 'https://images.vexels.com/content/154255/preview/cat-animal-avatar-8eb2ea.png'::text,
    address text,
    city text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 65578)
-- Name: userSettings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."userSettings" (
    "settingId" text NOT NULL,
    "userId" text NOT NULL,
    "emailService" boolean DEFAULT false NOT NULL,
    "locationService" boolean DEFAULT false NOT NULL,
    "notificationService" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."userSettings" OWNER TO postgres;

--
-- TOC entry 4869 (class 0 OID 65586)
-- Dependencies: 217
-- Data for Name: ground; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.ground VALUES ('GROUND_001', 'SportsKnock', 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Soluta adipisci dicta voluptatem ut voluptatibus veniam, accusantium perferendis obcaecati. Debitis tempora cum asperiores dolore nulla? Nihil id deserunt maiores autem a.', '18.652231233217538', '73.77192854366746', 'Near Sant Tukaram Garden, City Pride School, Sector No. 27, Nigdi Pradhikaran, Nigdi', 'Pimpri Chinchwad', '2023-02-01 10:00:00', '2023-02-01 20:00:00', '{"Facility One","Facility Two","Facility Three"}', '{https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFyzQPzYs8G21pMIdg77aK06kp-AZTQYJ6NA&s}', '2025-04-10 11:55:25.119');
INSERT INTO public.ground VALUES ('GROUND_002', 'Dr. D. Y. Patil ACS Ground', 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Soluta adipisci dicta voluptatem ut voluptatibus veniam, accusantium perferendis obcaecati. Debitis tempora cum asperiores dolore nulla? Nihil id deserunt maiores autem a.', '18.620307319321427', '73.81955672691788', 'Pimpri', 'Pimpri Chinchwad', '2023-02-01 10:00:00', '2023-02-01 20:00:00', '{"Facility One","Facility Two","Facility Three"}', '{https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFyzQPzYs8G21pMIdg77aK06kp-AZTQYJ6NA&s}', '2025-04-10 11:59:07.667');


--
-- TOC entry 4872 (class 0 OID 65609)
-- Dependencies: 220
-- Data for Name: groundBooking; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."groundBooking" VALUES ('330cdf86-7910-443a-889d-aa09e55b814a', 4, 3596, 1, '2025-04-26 00:00:00', '2025-04-26 04:30:00', '2025-04-26 08:30:00', 'COURT_001', 'aed05fde-6fac-4901-b43d-fe0a09f6beb7', '2025-04-26 09:49:49.159', 'GROUND_001', NULL, '', '', '');
INSERT INTO public."groundBooking" VALUES ('d6bbec0f-2e88-4b3e-bb6e-d580b5462871', 4, 3596, 1, '2025-04-26 00:00:00', '2025-04-26 04:30:00', '2025-04-26 08:30:00', 'COURT_001', 'aed05fde-6fac-4901-b43d-fe0a09f6beb7', '2025-04-26 09:56:13.343', 'GROUND_001', NULL, '', '', '');
INSERT INTO public."groundBooking" VALUES ('936ed27a-29ab-4134-aa37-89c7ac035f12', 4, 3596, 1, '2025-04-26 00:00:00', '2025-04-26 04:30:00', '2025-04-26 08:30:00', 'COURT_001', 'aed05fde-6fac-4901-b43d-fe0a09f6beb7', '2025-04-26 09:59:09.991', 'GROUND_001', NULL, '', '', '');
INSERT INTO public."groundBooking" VALUES ('e256cdf5-adb8-4180-b0ab-d5256ab15a93', 4, 3596, 1, '2025-04-26 00:00:00', '2025-04-26 04:30:00', '2025-04-26 08:30:00', 'COURT_001', '6cbb2fed-8970-4300-aa56-41b0e149ef0b', '2025-04-26 08:32:18.354', 'GROUND_001', 'bd8528b4-a3a3-4fca-a619-1eeba5608461', '', '', '');
INSERT INTO public."groundBooking" VALUES ('5921b382-4fdc-49ea-9200-c9bb0f3ec1a1', 2, 2000, 10, '2025-05-17 00:00:00', '2025-05-17 06:30:00', '2025-05-17 07:30:00', 'COURT_002', '6cbb2fed-8970-4300-aa56-41b0e149ef0b', '2025-05-15 19:21:23.493', 'GROUND_002', '1232e0f0-8b74-490d-aee5-e9e4fd0b8aed', 'order_QVJmB7ghcoWOPz', 'pay_QVJmXh93Y7epmU', 'f60bee5d64f8d60dc8c9b0b3db5890bb66129a49643665747406616cf97af46b');
INSERT INTO public."groundBooking" VALUES ('7ef52af0-2dc0-4a2c-87b3-f489d7b7a7c5', 2, 2000, 10, '2025-05-17 00:00:00', '2025-05-17 06:30:00', '2025-05-17 08:30:00', 'COURT_002', '6cbb2fed-8970-4300-aa56-41b0e149ef0b', '2025-05-15 18:59:26.635', 'GROUND_002', NULL, 'order_QVJOsXTLvQyJOb', 'pay_QVJPKnWgR436jp', '6129ea3ec997fb3a3d447d961ece63f0b7d84230d1bc8a59da15d1adc409023a');


--
-- TOC entry 4871 (class 0 OID 65601)
-- Dependencies: 219
-- Data for Name: groundCourts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."groundCourts" VALUES ('COURT_001', '8x10 mtr Basic Court', 899, 'cricket', '8x10', 'green', 25, 'GROUND_001', '2025-04-25 14:19:39.842');
INSERT INTO public."groundCourts" VALUES ('COURT_002', '3x4 and 4x5', 100, 'badminton', '7x9', 'dusty', 25, 'GROUND_002', '2025-05-15 22:27:32.674');


--
-- TOC entry 4870 (class 0 OID 65594)
-- Dependencies: 218
-- Data for Name: groundRating; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4873 (class 0 OID 65619)
-- Dependencies: 221
-- Data for Name: matches; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.matches VALUES ('bd8528b4-a3a3-4fca-a619-1eeba5608461', 'Cover Drive Practice Match', 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat, ducimus rerum mollitia id fugit quis, minima enim officia possimus quasi voluptatibus. Minus, illo aliquam amet omnis asperiores alias laudantium reiciendis ab deleniti tempora veritatis aliquid eum? Similique voluptates quod excepturi fugit repellendus iusto, commodi repudiandae laborum nostrum laboriosam fuga quas!', '2025-05-07 00:00:00', 'cricket', 10, 'GROUND_001', '6cbb2fed-8970-4300-aa56-41b0e149ef0b', '2025-05-07 04:31:17.889');
INSERT INTO public.matches VALUES ('1232e0f0-8b74-490d-aee5-e9e4fd0b8aed', 'Practice Session', '', '2025-05-17 00:00:00', 'badminton', 1, 'GROUND_002', '6cbb2fed-8970-4300-aa56-41b0e149ef0b', '2025-05-15 19:23:00.577');


--
-- TOC entry 4875 (class 0 OID 81921)
-- Dependencies: 223
-- Data for Name: pendingRequests; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4874 (class 0 OID 65628)
-- Dependencies: 222
-- Data for Name: teamMembers; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."teamMembers" VALUES ('2d601764-b40c-4b1d-b3fb-97e77ca9d089', 'bd8528b4-a3a3-4fca-a619-1eeba5608461', '6cbb2fed-8970-4300-aa56-41b0e149ef0b', true);
INSERT INTO public."teamMembers" VALUES ('11e4d01b-d511-48bf-903b-e8c4bace1ae3', 'bd8528b4-a3a3-4fca-a619-1eeba5608461', '27aa4793-435a-4bf0-a3d7-1e6dc4e69ee6', false);
INSERT INTO public."teamMembers" VALUES ('945d35e5-6bb5-45b8-9e01-e3195129cd0f', 'bd8528b4-a3a3-4fca-a619-1eeba5608461', 'aed05fde-6fac-4901-b43d-fe0a09f6beb7', false);
INSERT INTO public."teamMembers" VALUES ('80c247b2-9ddd-4fcf-9693-016c5380fb7c', '1232e0f0-8b74-490d-aee5-e9e4fd0b8aed', '6cbb2fed-8970-4300-aa56-41b0e149ef0b', true);
INSERT INTO public."teamMembers" VALUES ('c602f9a3-6f14-41d3-9f7b-6ab0472b64a9', '1232e0f0-8b74-490d-aee5-e9e4fd0b8aed', 'aed05fde-6fac-4901-b43d-fe0a09f6beb7', false);


--
-- TOC entry 4867 (class 0 OID 65569)
-- Dependencies: 215
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."user" VALUES ('27aa4793-435a-4bf0-a3d7-1e6dc4e69ee6', 'Ali baba', 'alibaba_chor_40', 'alibaba@chor.com', NULL, '$2b$18$wa6lqAzTKND3mRDN.ikhZORfyQ3jpYZ6ZzyHFDR9FjkCOzFzG9ssK', NULL, NULL, 'https://res.cloudinary.com/debltzrg8/image/upload/v1747231883/user_profile_images/ein8aboyxekbwgetoo2m.jpg', NULL, NULL, '2025-05-14 14:04:16.294');
INSERT INTO public."user" VALUES ('aed05fde-6fac-4901-b43d-fe0a09f6beb7', 'Guddu Lohar', 'dnyaneshlohar75', 'dnyaneshlohar75@gmail.com', '7499378600', '$2b$18$iSqbJxodv.emZWB26RjrgOKkufnFGKiTYYI1loIxH/sODUnqU0Bea', NULL, 'male', 'https://res.cloudinary.com/debltzrg8/image/upload/v1746781695/user_profile_images/anv1ga7zgm9vecx1majw.jpg', NULL, NULL, '2025-04-08 15:32:51.223');
INSERT INTO public."user" VALUES ('6cbb2fed-8970-4300-aa56-41b0e149ef0b', 'Dhawal Wani', 'pannalal07', 'abc@gmail.com', '9422076443', '$2b$18$keT1tRX31jTgeQFjaYf2ouaSwpX0R7rjxQJXyJpdcyq2kKYL9PTQ2', NULL, 'male', 'https://res.cloudinary.com/debltzrg8/image/upload/v1747231923/user_profile_images/z29tmo43gqx3deljv3wx.jpg', NULL, NULL, '2025-05-07 02:53:26.212');


--
-- TOC entry 4868 (class 0 OID 65578)
-- Dependencies: 216
-- Data for Name: userSettings; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4702 (class 2606 OID 65618)
-- Name: groundBooking groundBooking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."groundBooking"
    ADD CONSTRAINT "groundBooking_pkey" PRIMARY KEY ("bookingId");


--
-- TOC entry 4699 (class 2606 OID 65608)
-- Name: groundCourts groundCourts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."groundCourts"
    ADD CONSTRAINT "groundCourts_pkey" PRIMARY KEY ("groundCourtId");


--
-- TOC entry 4697 (class 2606 OID 65600)
-- Name: groundRating groundRating_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."groundRating"
    ADD CONSTRAINT "groundRating_pkey" PRIMARY KEY ("ratingId");


--
-- TOC entry 4695 (class 2606 OID 65593)
-- Name: ground ground_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ground
    ADD CONSTRAINT ground_pkey PRIMARY KEY ("groundId");


--
-- TOC entry 4704 (class 2606 OID 65627)
-- Name: matches matches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_pkey PRIMARY KEY ("matchId");


--
-- TOC entry 4709 (class 2606 OID 81927)
-- Name: pendingRequests pendingRequests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."pendingRequests"
    ADD CONSTRAINT "pendingRequests_pkey" PRIMARY KEY (id);


--
-- TOC entry 4706 (class 2606 OID 65634)
-- Name: teamMembers teamMembers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."teamMembers"
    ADD CONSTRAINT "teamMembers_pkey" PRIMARY KEY (id);


--
-- TOC entry 4692 (class 2606 OID 65585)
-- Name: userSettings userSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."userSettings"
    ADD CONSTRAINT "userSettings_pkey" PRIMARY KEY ("settingId");


--
-- TOC entry 4690 (class 2606 OID 65577)
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY ("userId");


--
-- TOC entry 4700 (class 1259 OID 81948)
-- Name: groundBooking_matchId_groundId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "groundBooking_matchId_groundId_key" ON public."groundBooking" USING btree ("matchId", "groundId");


--
-- TOC entry 4707 (class 1259 OID 81939)
-- Name: pendingRequests_matchId_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "pendingRequests_matchId_userId_key" ON public."pendingRequests" USING btree ("matchId", "userId");


--
-- TOC entry 4693 (class 1259 OID 81952)
-- Name: userSettings_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "userSettings_userId_key" ON public."userSettings" USING btree ("userId");


--
-- TOC entry 4688 (class 1259 OID 65635)
-- Name: user_emailAddress_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "user_emailAddress_key" ON public."user" USING btree ("emailAddress");


--
-- TOC entry 4714 (class 2606 OID 65661)
-- Name: groundBooking groundBooking_bookBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."groundBooking"
    ADD CONSTRAINT "groundBooking_bookBy_fkey" FOREIGN KEY ("bookBy") REFERENCES public."user"("userId") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4715 (class 2606 OID 65656)
-- Name: groundBooking groundBooking_courtId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."groundBooking"
    ADD CONSTRAINT "groundBooking_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES public."groundCourts"("groundCourtId") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4716 (class 2606 OID 73738)
-- Name: groundBooking groundBooking_groundId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."groundBooking"
    ADD CONSTRAINT "groundBooking_groundId_fkey" FOREIGN KEY ("groundId") REFERENCES public.ground("groundId") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4717 (class 2606 OID 81940)
-- Name: groundBooking groundBooking_matchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."groundBooking"
    ADD CONSTRAINT "groundBooking_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES public.matches("matchId") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4713 (class 2606 OID 65651)
-- Name: groundCourts groundCourts_groundId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."groundCourts"
    ADD CONSTRAINT "groundCourts_groundId_fkey" FOREIGN KEY ("groundId") REFERENCES public.ground("groundId") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4711 (class 2606 OID 65646)
-- Name: groundRating groundRating_groundId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."groundRating"
    ADD CONSTRAINT "groundRating_groundId_fkey" FOREIGN KEY ("groundId") REFERENCES public.ground("groundId") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4712 (class 2606 OID 65641)
-- Name: groundRating groundRating_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."groundRating"
    ADD CONSTRAINT "groundRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"("userId") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4718 (class 2606 OID 65666)
-- Name: matches matches_groundId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT "matches_groundId_fkey" FOREIGN KEY ("groundId") REFERENCES public.ground("groundId") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4719 (class 2606 OID 65671)
-- Name: matches matches_hostId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT "matches_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES public."user"("userId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4722 (class 2606 OID 81928)
-- Name: pendingRequests pendingRequests_matchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."pendingRequests"
    ADD CONSTRAINT "pendingRequests_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES public.matches("matchId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4723 (class 2606 OID 81933)
-- Name: pendingRequests pendingRequests_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."pendingRequests"
    ADD CONSTRAINT "pendingRequests_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"("userId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4720 (class 2606 OID 65676)
-- Name: teamMembers teamMembers_matchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."teamMembers"
    ADD CONSTRAINT "teamMembers_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES public.matches("matchId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4721 (class 2606 OID 65681)
-- Name: teamMembers teamMembers_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."teamMembers"
    ADD CONSTRAINT "teamMembers_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"("userId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4710 (class 2606 OID 65636)
-- Name: userSettings userSettings_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."userSettings"
    ADD CONSTRAINT "userSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"("userId") ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2025-05-21 17:06:56

--
-- PostgreSQL database dump complete
--

