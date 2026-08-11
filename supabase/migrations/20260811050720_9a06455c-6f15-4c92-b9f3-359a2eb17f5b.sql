CREATE TYPE public.severity_level AS ENUM ('CRITICAL','HIGH','MODERATE','LOW');
CREATE TYPE public.disaster_status AS ENUM ('REPORTED','VERIFIED','ACTIVE','CONTAINED','RESOLVED');

CREATE TABLE public.disasters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL,
  description text NOT NULL DEFAULT '',
  severity public.severity_level NOT NULL DEFAULT 'MODERATE',
  status public.disaster_status NOT NULL DEFAULT 'REPORTED',
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  area text NOT NULL,
  affected_people integer NOT NULL DEFAULT 0,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.disasters TO anon, authenticated;
GRANT ALL ON public.disasters TO service_role;
ALTER TABLE public.disasters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Disasters are publicly readable" ON public.disasters FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disaster_id uuid REFERENCES public.disasters(id) ON DELETE SET NULL,
  headline text NOT NULL,
  message text NOT NULL DEFAULT '',
  severity public.severity_level NOT NULL DEFAULT 'MODERATE',
  area text NOT NULL,
  issued_by text NOT NULL DEFAULT 'District Emergency Operations Centre',
  issued_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.alerts TO anon, authenticated;
GRANT ALL ON public.alerts TO service_role;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Alerts are publicly readable" ON public.alerts FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.shelters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  capacity integer NOT NULL DEFAULT 0,
  occupancy integer NOT NULL DEFAULT 0,
  facilities text[] NOT NULL DEFAULT '{}',
  contact_phone text,
  status text NOT NULL DEFAULT 'OPEN',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.shelters TO anon, authenticated;
GRANT ALL ON public.shelters TO service_role;
ALTER TABLE public.shelters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Shelters are publicly readable" ON public.shelters FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.hospitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  total_beds integer NOT NULL DEFAULT 0,
  available_beds integer NOT NULL DEFAULT 0,
  emergency_capable boolean NOT NULL DEFAULT true,
  specialities text[] NOT NULL DEFAULT '{}',
  contact_phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.hospitals TO anon, authenticated;
GRANT ALL ON public.hospitals TO service_role;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hospitals are publicly readable" ON public.hospitals FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.ngos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  focus_areas text[] NOT NULL DEFAULT '{}',
  coverage_area text NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  contact_phone text,
  contact_email text,
  website text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ngos TO anon, authenticated;
GRANT ALL ON public.ngos TO service_role;
ALTER TABLE public.ngos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "NGOs are publicly readable" ON public.ngos FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.disasters (id, title, type, description, severity, status, latitude, longitude, area, affected_people, occurred_at, resolved_at) VALUES
('11111111-1111-4111-8111-000000000001','Brahmaputra embankment breach','Flood','A 40-metre embankment breach has submerged low-lying wards along the north bank. Boat rescue teams are evacuating families to higher ground.','CRITICAL','ACTIVE',26.1445,91.7362,'Guwahati, Assam',48200,now() - interval '9 hours',NULL),
('11111111-1111-4111-8111-000000000002','Coastal cyclone landfall — Cyclone Meghna','Cyclone','Category 3 system made landfall with sustained winds of 165 km/h. Power distribution and coastal roads are severely damaged.','CRITICAL','ACTIVE',19.8135,85.8312,'Puri, Odisha',132000,now() - interval '22 hours',NULL),
('11111111-1111-4111-8111-000000000003','Hillside landslide on NH-707','Landslide','Continuous rainfall triggered a debris slide blocking both carriageways. Two villages are cut off from road access.','HIGH','ACTIVE',30.9010,77.0967,'Shimla, Himachal Pradesh',3400,now() - interval '2 days',NULL),
('11111111-1111-4111-8111-000000000004','Urban flash flooding in eastern suburbs','Flood','Cloudburst over the catchment overwhelmed storm drains; underpasses and ground-floor homes are waterlogged.','HIGH','CONTAINED',12.9716,77.5946,'Bengaluru, Karnataka',18700,now() - interval '4 days',NULL),
('11111111-1111-4111-8111-000000000005','Industrial chemical leak — ammonia','Industrial','An ammonia storage line ruptured at a cold-storage unit. A 1.5 km exclusion zone is in force downwind.','HIGH','VERIFIED',22.5726,88.3639,'Howrah, West Bengal',2100,now() - interval '16 hours',NULL),
('11111111-1111-4111-8111-000000000006','Moderate earthquake — magnitude 5.4','Earthquake','Shallow tremor felt across the valley. Structural assessment teams are inspecting older masonry buildings.','MODERATE','VERIFIED',34.0837,74.7973,'Srinagar, Jammu & Kashmir',9800,now() - interval '1 day',NULL),
('11111111-1111-4111-8111-000000000007','Forest fire on the eastern ridge','Wildfire','Dry undergrowth fire spreading uphill. Fire lines are being cut ahead of the leading edge.','MODERATE','ACTIVE',11.4102,76.6950,'Nilgiris, Tamil Nadu',1200,now() - interval '3 days',NULL),
('11111111-1111-4111-8111-000000000008','Severe heatwave advisory','Heatwave','Daytime maxima 6°C above normal for a fifth consecutive day. Heat-stroke admissions are rising.','MODERATE','ACTIVE',26.9124,75.7873,'Jaipur, Rajasthan',54000,now() - interval '5 days',NULL),
('11111111-1111-4111-8111-000000000009','Building collapse in old market lane','Structural','A four-storey structure collapsed during renovation work. Search and rescue with canine units is under way.','CRITICAL','CONTAINED',19.0760,72.8777,'Mumbai, Maharashtra',85,now() - interval '30 hours',NULL),
('11111111-1111-4111-8111-000000000010','Glacial lake outburst warning','Flood','Rapid lake level rise detected by upstream sensors. Downstream settlements are on evacuation standby.','LOW','REPORTED',27.3389,88.6065,'Gangtok, Sikkim',600,now() - interval '7 hours',NULL),
('11111111-1111-4111-8111-000000000011','Monsoon river flooding — Kosi basin','Flood','Sustained flooding across the basin displaced villages for eleven days. Waters have now receded and camps are closed.','HIGH','RESOLVED',25.5941,85.1376,'Patna, Bihar',76000,now() - interval '96 days',now() - interval '82 days'),
('11111111-1111-4111-8111-000000000012','Cyclone Aarav — western coast','Cyclone','Category 2 landfall with significant crop and fishing-fleet losses. Restoration completed last quarter.','HIGH','RESOLVED',21.1702,72.8311,'Surat, Gujarat',41000,now() - interval '410 days',now() - interval '392 days'),
('11111111-1111-4111-8111-000000000013','Cold wave across northern plains','Cold Wave','Prolonged sub-normal temperatures; night shelters were expanded until conditions normalised.','MODERATE','RESOLVED',28.6139,77.2090,'Delhi NCR',23000,now() - interval '520 days',now() - interval '505 days');

INSERT INTO public.alerts (disaster_id, headline, message, severity, area, issued_by, issued_at, expires_at) VALUES
('11111111-1111-4111-8111-000000000001','Immediate evacuation — north bank wards 4, 5 and 9','Move to designated relief camps now. Do not attempt to cross flooded roads on foot or by two-wheeler.','CRITICAL','Guwahati, Assam','State Disaster Response Authority',now() - interval '8 hours',now() + interval '16 hours'),
('11111111-1111-4111-8111-000000000002','Cyclone red warning — remain indoors','Stay away from windows and coastal roads until the all-clear is issued. Fishing operations suspended.','CRITICAL','Puri, Odisha','India Meteorological Department',now() - interval '26 hours',now() + interval '10 hours'),
('11111111-1111-4111-8111-000000000002','Power restoration schedule — coastal grid','Feeders 3 and 7 expected to energise by tonight. Report live wires to the control room immediately.','MODERATE','Puri, Odisha','State Electricity Board',now() - interval '5 hours',now() + interval '24 hours'),
('11111111-1111-4111-8111-000000000003','NH-707 closed between km 42 and km 58','Use the Kotkhai bypass. Heavy vehicles are prohibited until slope stabilisation is complete.','HIGH','Shimla, Himachal Pradesh','Highway Authority',now() - interval '2 days',now() + interval '3 days'),
('11111111-1111-4111-8111-000000000004','Waterlogging advisory — eastern suburbs','Avoid underpasses. Municipal pumps are operating at Marathahalli and Bellandur junctions.','MODERATE','Bengaluru, Karnataka','City Municipal Corporation',now() - interval '3 days',now() + interval '6 hours'),
('11111111-1111-4111-8111-000000000005','Ammonia exclusion zone — 1.5 km radius','Shelter in place with windows closed. Anyone with breathing difficulty must call the medical hotline.','HIGH','Howrah, West Bengal','District Emergency Operations Centre',now() - interval '15 hours',now() + interval '9 hours'),
('11111111-1111-4111-8111-000000000006','Aftershock advisory','Expect aftershocks up to magnitude 4. Avoid damaged masonry structures until cleared by inspectors.','MODERATE','Srinagar, Jammu & Kashmir','Seismological Centre',now() - interval '20 hours',now() + interval '2 days'),
('11111111-1111-4111-8111-000000000007','Smoke advisory for ridge settlements','Keep children and elderly indoors during afternoon hours. Fire lines are holding on the eastern face.','MODERATE','Nilgiris, Tamil Nadu','Forest Department',now() - interval '2 days',now() + interval '1 day'),
('11111111-1111-4111-8111-000000000008','Heat action plan — level 2','Avoid outdoor exposure between 11:00 and 16:00. Cooling centres are open at all ward offices.','HIGH','Jaipur, Rajasthan','District Health Office',now() - interval '4 days',now() + interval '4 days'),
('11111111-1111-4111-8111-000000000009','Search and rescue in progress — market lane closed','Keep the corridor clear for heavy lifting equipment and ambulances.','CRITICAL','Mumbai, Maharashtra','Fire and Rescue Services',now() - interval '28 hours',now() + interval '5 hours'),
('11111111-1111-4111-8111-000000000010','Evacuation standby for downstream hamlets','Prepare essential documents and medication. Await the siren before moving to assembly points.','LOW','Gangtok, Sikkim','State Disaster Response Authority',now() - interval '6 hours',now() + interval '18 hours'),
(NULL,'Emergency helpline numbers active statewide','Dial 1070 for the state control room or 1077 for the district control room. Both lines are staffed 24/7.','LOW','Statewide','State Disaster Response Authority',now() - interval '12 hours',now() + interval '30 days'),
(NULL,'Volunteer registration open for relief logistics','Verified NGOs are coordinating loading and distribution shifts at three depots.','LOW','Guwahati, Assam','Relief Coordination Cell',now() - interval '7 hours',now() + interval '5 days'),
('11111111-1111-4111-8111-000000000001','Drinking water contamination warning','Boil or chlorinate all water from hand pumps in the affected wards before use.','HIGH','Guwahati, Assam','Public Health Engineering',now() - interval '4 hours',now() + interval '3 days'),
('11111111-1111-4111-8111-000000000011','Kosi basin all-clear issued','Flood waters have receded. Relief camps are closed and rehabilitation grants are being processed.','LOW','Patna, Bihar','State Disaster Response Authority',now() - interval '82 days',now() - interval '75 days');

INSERT INTO public.shelters (name, address, latitude, longitude, capacity, occupancy, facilities, contact_phone, status) VALUES
('Kamrup Relief Camp A','Govt. Higher Secondary School, Bhangagarh, Guwahati',26.1510,91.7570,1200,1140,'{"Medical post","Drinking water","Kitchen","Women''s section"}','+91 361 220 1450','OPEN'),
('Kamrup Relief Camp B','Community Hall, Jalukbari, Guwahati',26.1520,91.6650,800,410,'{"Drinking water","Kitchen","Child care"}','+91 361 220 1466','OPEN'),
('Puri Cyclone Shelter 1','Multipurpose Cyclone Shelter, Chakratirtha Road, Puri',19.8000,85.8290,900,870,'{"Generator","Medical post","Kitchen","Livestock pen"}','+91 6752 22 3311','OPEN'),
('Puri Cyclone Shelter 3','Sea Beach Road Shelter, Puri',19.8090,85.8395,600,220,'{"Generator","Drinking water"}','+91 6752 22 3390','OPEN'),
('Shimla Ridge Transit Camp','Ridge Community Centre, Shimla',30.8990,77.1730,300,95,'{"Blankets","Medical post","Kitchen"}','+91 177 265 4400','OPEN'),
('Bellandur Municipal Shelter','Ward Office Complex, Bellandur, Bengaluru',12.9250,77.6780,450,60,'{"Drinking water","Child care"}','+91 80 2222 7700','OPEN'),
('Howrah Safe Assembly Point','Municipal Sports Hall, Howrah',22.5850,88.3100,500,180,'{"Medical post","Oxygen support","Drinking water"}','+91 33 2641 5200','OPEN'),
('Srinagar Valley Shelter','Sports Stadium Annexe, Srinagar',34.0900,74.8100,700,140,'{"Blankets","Kitchen","Medical post"}','+91 194 245 6600','OPEN'),
('Jaipur Cooling Centre — Ward 12','Ward 12 Community Hall, Jaipur',26.9200,75.8000,250,190,'{"Cooling","Drinking water","ORS counter"}','+91 141 260 3300','OPEN'),
('Mumbai Transit Shelter — E Ward','Municipal School, Byculla, Mumbai',18.9760,72.8320,350,88,'{"Medical post","Kitchen","Counselling"}','+91 22 2300 4400','OPEN');

INSERT INTO public.hospitals (name, address, latitude, longitude, total_beds, available_beds, emergency_capable, specialities, contact_phone) VALUES
('Gauhati Medical College Hospital','Bhangagarh, Guwahati, Assam',26.1465,91.7590,1400,118,true,'{"Trauma","Burns","ICU","Dialysis"}','+91 361 252 9457'),
('Guwahati District Civil Hospital','Panbazar, Guwahati, Assam',26.1860,91.7460,320,44,true,'{"General surgery","Paediatrics"}','+91 361 254 1122'),
('Puri District Headquarters Hospital','Grand Road, Puri, Odisha',19.8085,85.8250,480,26,true,'{"Trauma","ICU","Obstetrics"}','+91 6752 22 2033'),
('Indira Gandhi Medical College','Ridge, Shimla, Himachal Pradesh',30.9050,77.1700,760,131,true,'{"Trauma","Orthopaedics","ICU"}','+91 177 280 3073'),
('Bengaluru East Multispeciality','Old Airport Road, Bengaluru, Karnataka',12.9600,77.6480,540,205,true,'{"ICU","Cardiology","Paediatrics"}','+91 80 2555 8899'),
('Howrah General Hospital','Belilious Road, Howrah, West Bengal',22.5830,88.3320,410,72,true,'{"Respiratory","Toxicology","ICU"}','+91 33 2641 3018'),
('SMHS Hospital','Karan Nagar, Srinagar, Jammu & Kashmir',34.0740,74.8020,650,160,true,'{"Trauma","Neurosurgery","ICU"}','+91 194 245 2015'),
('Sawai Man Singh Hospital','JLN Marg, Jaipur, Rajasthan',26.8990,75.8140,1200,240,true,'{"Heat illness","ICU","Nephrology"}','+91 141 256 0291');

INSERT INTO public.ngos (name, description, focus_areas, coverage_area, verified, contact_phone, contact_email, website) VALUES
('Brahmaputra Relief Collective','Boat-based evacuation and dry-ration distribution across river islands during flood season.','{"Evacuation","Food relief","Water"}','Assam',true,'+91 361 240 9090','ops@brahmaputrarelief.org','https://brahmaputrarelief.org'),
('Coastal Shield Foundation','Cyclone preparedness drills, shelter management support and post-landfall damage surveys.','{"Shelter","Preparedness","Damage assessment"}','Odisha and Andhra coast',true,'+91 6752 24 1177','contact@coastalshield.org','https://coastalshield.org'),
('Himalaya Rescue Network','Mountain search and rescue, rope teams and high-altitude medical evacuation.','{"Search and rescue","Medical"}','Himachal Pradesh and Uttarakhand',true,'+91 177 281 5566','team@himalayarescue.in','https://himalayarescue.in'),
('Urban Resilience Trust','Flood mapping, drainage advocacy and low-income neighbourhood response in metro areas.','{"Urban flooding","Mapping","Community training"}','Bengaluru, Chennai, Hyderabad',true,'+91 80 4111 2323','hello@urbanresilience.org','https://urbanresilience.org'),
('Sanjeevani Medical Volunteers','Mobile medical camps, ambulance support and psychosocial first aid after disasters.','{"Medical","Mental health"}','Nationwide',true,'+91 22 4066 7788','care@sanjeevanivolunteers.org','https://sanjeevanivolunteers.org'),
('Annapurna Kitchen Brigade','Community kitchens serving hot meals at relief camps within 12 hours of activation.','{"Food relief","Logistics"}','North and East India',true,'+91 33 2288 4545','kitchen@annapurnabrigade.org','https://annapurnabrigade.org'),
('Jal Suraksha Initiative','Water purification units, borewell chlorination and sanitation kits for relief camps.','{"Water","Sanitation"}','Bihar, Jharkhand, West Bengal',false,'+91 612 223 6767','water@jalsuraksha.org','https://jalsuraksha.org'),
('Desert Care Alliance','Heatwave outreach, ORS distribution and cooling-centre staffing in arid districts.','{"Heat relief","Health outreach"}','Rajasthan and Gujarat',true,'+91 141 270 8181','info@desertcarealliance.org','https://desertcarealliance.org');