-- Real Estate Due Diligence Agent — 50-property seed dataset
-- Matches the IMPLEMENTED 22-table schema in DATABASE_DESIGN.md.
--
-- PUBLIC FACTS: project/address references and selected published project facts.
-- SCENARIO FACTS: ownership, tax, mortgage, permits, zoning, flood, environmental,
-- utility, litigation, risk scores, comparable values and market aggregates are
-- synthetic scenario data for an internship demonstration. They are not claims
-- about the legal status of the referenced real-world properties.
-- Real-world authorities, banks and courts are used as entity context only.
-- Coordinates are approximate project/locality coordinates, not authoritative parcels.
--
-- Prerequisite: existing data.sql has inserted admin@example.com.
-- Adapted to the implemented live schema when integrated into the backend:
--   * market_trends.average_price -> avg_price_per_sqft (implemented column),
--     with the NOT NULL source column set to 'SEED_DATASET'.
--   * Every INSERT is idempotent (ON CONFLICT DO NOTHING) so the script can
--     run on every boot of the postgres profile.
--   * Identity sequences are advanced past the seeded explicit IDs.

-- Explicit IDs are used so foreign-key relationships are deterministic.

-- PUBLIC SOURCE URLS
-- 1001 | Casagrand Pallagio | https://www.casagrand.co.in/apartments-villas-plots/completed-projects/
-- 1002 | Casagrand Lanterns Court | https://www.casagrand.co.in/apartments-villas-plots/completed-projects/
-- 1003 | Casagrand Savoye | https://www.casagrand.co.in/apartments-villas-plots/completed-projects/
-- 1004 | Casagrand Bloom | https://www.casagrand.co.in/apartments-villas-plots/completed-projects/
-- 1005 | Casagrand Westend | https://www.casagrand.co.in/apartments-villas-plots/completed-projects/
-- 1006 | Casagrand Royce | https://www.casagrand.co.in/apartments-villas-plots/completed-projects/
-- 1007 | Casagrand Verdant | https://www.casagrand.co.in/apartments-villas-plots/completed-projects/
-- 1008 | Casagrand Esmeralda | https://www.casagrand.co.in/apartments-villas-plots/completed-projects/
-- 1009 | Casagrand Bellissimo | https://www.casagrand.co.in/apartments-villas-plots/completed-projects/
-- 1010 | Casagrand Marina Bay | https://www.casagrand.co.in/apartments-villas-plots/completed-projects/
-- 1011 | SOBHA OneWorld | https://www.sobha.com/new-launch-projects-in-bangalore/
-- 1012 | SOBHA Altair | https://www.sobha.com/new-launch-projects-in-bangalore/
-- 1013 | SOBHA Townpark | https://www.sobha.com/new-launch-projects-in-bangalore/
-- 1014 | SOBHA Neopolis | https://www.sobha.com/new-launch-projects-in-bangalore/
-- 1015 | SOBHA Ayana | https://www.sobha.com/new-launch-projects-in-bangalore/
-- 1016 | SOBHA Infinia | https://www.sobha.com/new-launch-projects-in-bangalore/
-- 1017 | SOBHA Magnus | https://www.sobha.com/new-launch-projects-in-bangalore/
-- 1018 | SOBHA Galera | https://www.sobha.com/new-launch-projects-in-bangalore/
-- 1019 | SOBHA Valley View | https://www.sobha.com/new-launch-projects-in-bangalore/
-- 1020 | SOBHA Insignia | https://www.sobha.com/new-launch-projects-in-bangalore/
-- 1021 | SOBHA Oakshire | https://www.sobha.com/new-launch-projects-in-bangalore/
-- 1022 | SOBHA Dream Gardens | https://www.sobha.com/new-launch-projects-in-bangalore/
-- 1023 | SOBHA Palm Court | https://www.sobha.com/new-launch-projects-in-bangalore/
-- 1024 | SOBHA Lifestyle Legacy | https://www.sobha.com/new-launch-projects-in-bangalore/
-- 1025 | SOBHA Royal Pavilion | https://www.sobha.com/new-launch-projects-in-bangalore/
-- 1026 | Lodha Belmondo | https://www.lodhagroup.com/projects/residential-property-in-pune/lodha-belmondo/location
-- 1027 | Godrej Park Springs | https://www.godrejproperties.com/pune/residential/godrej-park-springs
-- 1028 | Godrej Green Vistas | https://www.godrejproperties.com/pune/residential/godrej-park-springs
-- 1029 | Godrej Green Cove | https://www.godrejproperties.com/pune/residential/godrej-park-springs
-- 1030 | Lodha Giardino | https://www.lodhagroup.com/projects/residential-property-in-pune/lodha-belmondo/location
-- 1031 | Lodha One | https://www.lodhagroup.com/projects/residential-property-in-pune/lodha-belmondo/location
-- 1032 | Godrej Nurture | https://www.godrejproperties.com/pune/residential/godrej-park-springs
-- 1033 | Life Republic | https://www.koltepatil.com/pune/residential-properties/
-- 1034 | Three Jewels | https://www.koltepatil.com/pune/residential-properties/
-- 1035 | Little Earth | https://www.koltepatil.com/pune/residential-properties/
-- 1036 | Lodha Bellevue | https://www.lodhagroup.com/projects/residential-property-in-pune/lodha-belmondo/location
-- 1037 | Lodha World One | https://www.lodhagroup.com/projects/residential-property-in-pune/lodha-belmondo/location
-- 1038 | Lodha Vista | https://www.lodhagroup.com/projects/residential-property-in-pune/lodha-belmondo/location
-- 1039 | Lodha New Cuffe Parade | https://www.lodhagroup.com/projects/residential-property-in-pune/lodha-belmondo/location
-- 1040 | Lodha Worli | https://www.lodhagroup.com/projects/residential-property-in-pune/lodha-belmondo/location
-- 1041 | Casagrand Novus | https://www.casagrand.co.in/apartments-villas-plots/completed-projects/
-- 1042 | Casagrand Tulipso | https://www.casagrand.co.in/apartments-villas-plots/completed-projects/
-- 1043 | Casagrand Senate | https://www.casagrand.co.in/apartments-villas-plots/completed-projects/
-- 1044 | Casagrand Futura | https://www.casagrand.co.in/apartments-villas-plots/completed-projects/
-- 1045 | Casagrand White Oak | https://www.casagrand.co.in/apartments-villas-plots/completed-projects/
-- 1046 | Casagrand Maple | https://www.casagrand.co.in/apartments-villas-plots/completed-projects/
-- 1047 | Casagrand Trinity | https://www.casagrand.co.in/apartments-villas-plots/completed-projects/
-- 1048 | Casagrand Olympus | https://www.casagrand.co.in/apartments-villas-plots/completed-projects/
-- 1049 | Casagrand Boulevard | https://www.casagrand.co.in/apartments-villas-plots/completed-projects/
-- 1050 | Casagrand Orlena | https://www.casagrand.co.in/apartments-villas-plots/completed-projects/

INSERT INTO property_details
(property_id, address, city, state, postal_code, latitude, longitude, property_type, created_at, updated_at)
VALUES
(1001, 'Casagrand Pallagio, Thoraipakkam, Rajiv Gandhi Salai, Chennai, Tamil Nadu 600097', 'Chennai', 'Tamil Nadu', '600097', 13.05195000, 80.23690000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1002, 'Casagrand Lanterns Court, Bharathiyar Nagar Main Road, Thoraipakkam, OMR, Chennai, Tamil Nadu 600097', 'Chennai', 'Tamil Nadu', '600097', 13.05530000, 80.23570000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1003, 'Kuppuswamy Street, Thoraipakkam, Sholinganallur, Chennai, Tamil Nadu 600097', 'Chennai', 'Tamil Nadu', '600097', 12.94380000, 80.23290000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1004, 'Casagrand Bloom, Thirumudivakkam, Chennai, Tamil Nadu 600044', 'Chennai', 'Tamil Nadu', '600044', 12.95350000, 80.11390000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1005, 'Casagrand Westend, Poonamallee, Chennai, Tamil Nadu 600056', 'Chennai', 'Tamil Nadu', '600056', 13.04720000, 80.11150000, 'LAND', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1006, 'Casagrand Royce, Hoodi, Bengaluru, Karnataka 560048', 'Bengaluru', 'Karnataka', '560048', 12.99150000, 77.71560000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1007, 'Casagrand Verdant, Vedapatti, Coimbatore, Tamil Nadu 641007', 'Coimbatore', 'Tamil Nadu', '641007', 11.02040000, 76.88660000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1008, 'Casagrand Esmeralda, Sarjapur, Bengaluru, Karnataka 562125', 'Bengaluru', 'Karnataka', '562125', 12.87100000, 77.76890000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1009, 'Casagrand Bellissimo, Alandur, Chennai, Tamil Nadu 600016', 'Chennai', 'Tamil Nadu', '600016', 13.00430000, 80.20430000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1010, 'Casagrand Marina Bay, Thiruvanmiyur, Chennai, Tamil Nadu 600041', 'Chennai', 'Tamil Nadu', '600041', 12.98370000, 80.25920000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1011, 'SOBHA OneWorld, Greater Whitefield, Bengaluru, Karnataka 560049', 'Bengaluru', 'Karnataka', '560049', 13.02030000, 77.75120000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1012, 'SOBHA Altair, Sarjapur Main Road, Bengaluru, Karnataka 560035', 'Bengaluru', 'Karnataka', '560035', 12.90380000, 77.70650000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1013, 'SOBHA Townpark, Electronic City, Bengaluru, Karnataka 560100', 'Bengaluru', 'Karnataka', '560100', 12.83900000, 77.66670000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1014, 'SOBHA Neopolis, Panathur, Bengaluru, Karnataka 560103', 'Bengaluru', 'Karnataka', '560103', 12.95920000, 77.70870000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1015, 'SOBHA Ayana, Panathur, Bengaluru, Karnataka 560103', 'Bengaluru', 'Karnataka', '560103', 12.96210000, 77.70610000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1016, 'SOBHA Infinia, Koramangala, Bengaluru, Karnataka 560034', 'Bengaluru', 'Karnataka', '560034', 12.93450000, 77.62490000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1017, 'SOBHA Magnus, Bannerghatta Main Road, Bengaluru, Karnataka 560076', 'Bengaluru', 'Karnataka', '560076', 12.88980000, 77.59880000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1018, 'SOBHA Galera, Kannamangala, Bengaluru, Karnataka 560067', 'Bengaluru', 'Karnataka', '560067', 13.02070000, 77.74950000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1019, 'SOBHA Valley View, Banashankari, Bengaluru, Karnataka 560085', 'Bengaluru', 'Karnataka', '560085', 12.92340000, 77.54710000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1020, 'SOBHA Insignia, Bhoganahalli, Bengaluru, Karnataka 560103', 'Bengaluru', 'Karnataka', '560103', 12.95190000, 77.69940000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1021, 'SOBHA Oakshire, IVC Road, Devanahalli, Bengaluru, Karnataka 562110', 'Bengaluru', 'Karnataka', '562110', 13.24790000, 77.68260000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1022, 'SOBHA Dream Gardens, Thanisandra Main Road, Bengaluru, Karnataka 560077', 'Bengaluru', 'Karnataka', '560077', 13.05870000, 77.64250000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1023, 'SOBHA Palm Court, Kogilu Main Road, Yelahanka, Bengaluru, Karnataka 560064', 'Bengaluru', 'Karnataka', '560064', 13.09990000, 77.60650000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1024, 'SOBHA Lifestyle Legacy, IVC Road, Devanahalli, Bengaluru, Karnataka 562110', 'Bengaluru', 'Karnataka', '562110', 13.23500000, 77.69050000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1025, 'SOBHA Royal Pavilion, Hadosiddapura, Sarjapur Road, Bengaluru, Karnataka 560035', 'Bengaluru', 'Karnataka', '560035', 12.90050000, 77.69980000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1026, 'Lodha Belmondo, Mumbai-Pune Expressway, opposite MCA Cricket Stadium, Maharashtra 412101', 'Pune', 'Maharashtra', '412101', 18.67120000, 73.74550000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1027, 'Godrej Park Springs, Manjari Road, Pune, Maharashtra 412307', 'Pune', 'Maharashtra', '412307', 18.52080000, 73.98320000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1028, 'Godrej Green Vistas, Mahalunge, Mulshi, Pune, Maharashtra 411045', 'Pune', 'Maharashtra', '411045', 18.57970000, 73.70780000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1029, 'Godrej Green Cove, Mahalunge, Mulshi, Pune, Maharashtra 411045', 'Pune', 'Maharashtra', '411045', 18.57810000, 73.70490000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1030, 'Lodha Giardino, Upper Kharadi Main Road, Wagholi, Pune, Maharashtra 412207', 'Pune', 'Maharashtra', '412207', 18.56280000, 73.98310000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1031, 'Lodha One, Bund Garden Road, Pune, Maharashtra 411001', 'Pune', 'Maharashtra', '411001', 18.53610000, 73.88330000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1032, 'Godrej Nurture, Mamurdi, Pune, Maharashtra 412101', 'Pune', 'Maharashtra', '412101', 18.69100000, 73.73550000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1033, 'Life Republic, Marunji, Hinjawadi-Marunji-Kasarsai Road, Pune, Maharashtra 411057', 'Pune', 'Maharashtra', '411057', 18.58360000, 73.71290000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1034, 'Three Jewels, Tilekar Nagar, Kondhwa Budruk, Pune, Maharashtra 411048', 'Pune', 'Maharashtra', '411048', 18.46790000, 73.89160000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1035, 'Little Earth, Kiwale-Mamurdi Road, Pune, Maharashtra 412101', 'Pune', 'Maharashtra', '412101', 18.68200000, 73.74050000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1036, 'Lodha Bellevue, Opp. Vivarea, Mahalaxmi, Mumbai, Maharashtra 400011', 'Mumbai', 'Maharashtra', '400011', 18.97760000, 72.82030000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1037, 'Lodha World One, Lodha Place, off Senapati Bapat Marg, Worli, Mumbai, Maharashtra 400013', 'Mumbai', 'Maharashtra', '400013', 19.01570000, 72.81710000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1038, 'Lodha Vista, Sitaram Jadhav Marg, Lower Parel, Mumbai, Maharashtra 400013', 'Mumbai', 'Maharashtra', '400013', 18.99940000, 72.82470000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1039, 'Lodha New Cuffe Parade, Wadala East, Mumbai, Maharashtra 400037', 'Mumbai', 'Maharashtra', '400037', 19.02440000, 72.87800000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1040, 'Lodha Worli, Worli Sewri Connector, Worli, Mumbai, Maharashtra 400030', 'Mumbai', 'Maharashtra', '400030', 19.00350000, 72.81760000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1041, 'Casagrand Novus, No.77/1-2, New Boag Road, T. Nagar, Chennai, Tamil Nadu 600017', 'Chennai', 'Tamil Nadu', '600017', 13.04020000, 80.23750000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1042, 'Casagrand Tulipso, Pallikaranai, Chennai, Tamil Nadu 600100', 'Chennai', 'Tamil Nadu', '600100', 12.93600000, 80.21350000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1043, 'Casagrand Senate, New No.15, Old No.61, Gajapathy Street, Shenoy Nagar, Chennai, Tamil Nadu 600030', 'Chennai', 'Tamil Nadu', '600030', 13.07890000, 80.22550000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1044, 'Casagrand Futura, Off SH 57, 6 Lane Highway, Near Nokia Factory, Sriperumbudur, Kanchipuram, Tamil Nadu 602105', 'Sriperumbudur', 'Tamil Nadu', '602105', 12.96830000, 79.94100000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1045, 'Casagrand White Oak, 2nd Cross Street, Radhakrishan Nagar, Adyar, Chennai, Tamil Nadu 600004', 'Chennai', 'Tamil Nadu', '600004', 13.00210000, 80.25650000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1046, 'Casagrand Maple, No.77/27-28, Ellaiamman Kovil Street, Vanathurai, Adyar, Chennai, Tamil Nadu 600020', 'Chennai', 'Tamil Nadu', '600020', 13.00020000, 80.26750000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1047, 'Casagrand Trinity, Adyar, Chennai, Tamil Nadu 600020', 'Chennai', 'Tamil Nadu', '600020', 13.00150000, 80.26050000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1048, 'Casagrand Olympus, Norton Road, Mandavelipakkam, Raja Annamalai Puram, Chennai, Tamil Nadu 600004', 'Chennai', 'Tamil Nadu', '600004', 13.02800000, 80.27000000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1049, 'Casagrand Boulevard, Hennur Main Road, Bengaluru, Karnataka 560077', 'Bengaluru', 'Karnataka', '560077', 13.04390000, 77.64670000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00'),
(1050, 'Casagrand Orlena, Thanisandra Main Road, Ashwath Nagar, HBR Layout, Bengaluru, Karnataka 560077', 'Bengaluru', 'Karnataka', '560077', 13.04490000, 77.63270000, 'RESIDENTIAL', TIMESTAMP '2026-09-22 10:00:00', TIMESTAMP '2026-09-22 10:00:00')
ON CONFLICT DO NOTHING;

INSERT INTO ownership_details
(ownership_id, property_id, owner_name, ownership_type, record_date, source, external_record_id)
VALUES
(2001, 1001, 'Aarav Mehta', 'JOINT_OWNERSHIP', DATE '2021-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1001'),
(2002, 1002, 'Nisha Kapoor', 'FREEHOLD', DATE '2022-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1002'),
(2003, 1003, 'Rohan Iyer', 'FREEHOLD', DATE '2023-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1003'),
(2004, 1004, 'Kavya Menon', 'FREEHOLD', DATE '2024-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1004'),
(2005, 1005, 'Vikram Desai', 'FREEHOLD', DATE '2021-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1005'),
(2006, 1006, 'Ananya Rao', 'JOINT_OWNERSHIP', DATE '2022-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1006'),
(2007, 1007, 'Aditya Kulkarni', 'FREEHOLD', DATE '2023-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1007'),
(2008, 1008, 'Meera Nair', 'FREEHOLD', DATE '2024-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1008'),
(2009, 1009, 'Rahul Bhat', 'FREEHOLD', DATE '2021-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1009'),
(2010, 1010, 'Ishita Shah', 'FREEHOLD', DATE '2022-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1010'),
(2011, 1011, 'Neel Joshi', 'JOINT_OWNERSHIP', DATE '2023-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1011'),
(2012, 1012, 'Pooja Krishnan', 'FREEHOLD', DATE '2024-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1012'),
(2013, 1013, 'Siddharth Jain', 'FREEHOLD', DATE '2021-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1013'),
(2014, 1014, 'Riya Malhotra', 'FREEHOLD', DATE '2022-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1014'),
(2015, 1015, 'Arjun Sethi', 'FREEHOLD', DATE '2023-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1015'),
(2016, 1016, 'Tanvi Rao', 'JOINT_OWNERSHIP', DATE '2024-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1016'),
(2017, 1017, 'Karan Mehta', 'FREEHOLD', DATE '2021-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1017'),
(2018, 1018, 'Maya Iyer', 'FREEHOLD', DATE '2022-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1018'),
(2019, 1019, 'Devansh Gupta', 'FREEHOLD', DATE '2023-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1019'),
(2020, 1020, 'Aditi Nair', 'FREEHOLD', DATE '2024-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1020'),
(2021, 1021, 'Aarav Mehta', 'JOINT_OWNERSHIP', DATE '2021-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1021'),
(2022, 1022, 'Nisha Kapoor', 'FREEHOLD', DATE '2022-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1022'),
(2023, 1023, 'Rohan Iyer', 'FREEHOLD', DATE '2023-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1023'),
(2024, 1024, 'Kavya Menon', 'FREEHOLD', DATE '2024-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1024'),
(2025, 1025, 'Vikram Desai', 'FREEHOLD', DATE '2021-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1025'),
(2026, 1026, 'Ananya Rao', 'JOINT_OWNERSHIP', DATE '2022-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1026'),
(2027, 1027, 'Aditya Kulkarni', 'FREEHOLD', DATE '2023-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1027'),
(2028, 1028, 'Meera Nair', 'FREEHOLD', DATE '2024-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1028'),
(2029, 1029, 'Rahul Bhat', 'FREEHOLD', DATE '2021-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1029'),
(2030, 1030, 'Ishita Shah', 'FREEHOLD', DATE '2022-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1030'),
(2031, 1031, 'Neel Joshi', 'JOINT_OWNERSHIP', DATE '2023-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1031'),
(2032, 1032, 'Pooja Krishnan', 'FREEHOLD', DATE '2024-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1032'),
(2033, 1033, 'Siddharth Jain', 'FREEHOLD', DATE '2021-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1033'),
(2034, 1034, 'Riya Malhotra', 'FREEHOLD', DATE '2022-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1034'),
(2035, 1035, 'Arjun Sethi', 'FREEHOLD', DATE '2023-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1035'),
(2036, 1036, 'Tanvi Rao', 'JOINT_OWNERSHIP', DATE '2024-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1036'),
(2037, 1037, 'Karan Mehta', 'FREEHOLD', DATE '2021-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1037'),
(2038, 1038, 'Maya Iyer', 'FREEHOLD', DATE '2022-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1038'),
(2039, 1039, 'Devansh Gupta', 'FREEHOLD', DATE '2023-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1039'),
(2040, 1040, 'Aditi Nair', 'FREEHOLD', DATE '2024-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1040'),
(2041, 1041, 'Aarav Mehta', 'JOINT_OWNERSHIP', DATE '2021-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1041'),
(2042, 1042, 'Nisha Kapoor', 'FREEHOLD', DATE '2022-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1042'),
(2043, 1043, 'Rohan Iyer', 'FREEHOLD', DATE '2023-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1043'),
(2044, 1044, 'Kavya Menon', 'FREEHOLD', DATE '2024-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1044'),
(2045, 1045, 'Vikram Desai', 'FREEHOLD', DATE '2021-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1045'),
(2046, 1046, 'Ananya Rao', 'JOINT_OWNERSHIP', DATE '2022-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1046'),
(2047, 1047, 'Aditya Kulkarni', 'FREEHOLD', DATE '2023-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1047'),
(2048, 1048, 'Meera Nair', 'FREEHOLD', DATE '2024-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1048'),
(2049, 1049, 'Rahul Bhat', 'FREEHOLD', DATE '2021-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1049'),
(2050, 1050, 'Ishita Shah', 'FREEHOLD', DATE '2022-06-15', 'DUE_DILIGENCE_SCENARIO', 'OWN-1050')
ON CONFLICT DO NOTHING;

INSERT INTO tax_details
(tax_id, property_id, tax_pay_date, tax_amount, tax_due, payment_status, source, external_record_id, retrieved_at)
VALUES
(3001, 1001, '2026-04-15', 18500.00, 0.00, 'PAID', 'Greater Chennai Corporation', 'TAX-1001-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3002, 1002, '2026-04-15', 22700.00, 0.00, 'PAID', 'Greater Chennai Corporation', 'TAX-1002-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3003, 1003, '2026-05-10', 26900.00, 10760.00, 'PARTIALLY_PAID', 'Greater Chennai Corporation', 'TAX-1003-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3004, 1004, NULL, 31100.00, 31100.00, 'OVERDUE', 'Greater Chennai Corporation', 'TAX-1004-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3005, 1005, '2026-04-15', 35300.00, 0.00, 'PAID', 'Greater Chennai Corporation', 'TAX-1005-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3006, 1006, '2026-04-15', 39500.00, 0.00, 'PAID', 'Bruhat Bengaluru Mahanagara Palike', 'TAX-1006-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3007, 1007, '2026-04-15', 43700.00, 0.00, 'PAID', 'Coimbatore City Municipal Corporation', 'TAX-1007-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3008, 1008, '2026-05-10', 47900.00, 19160.00, 'PARTIALLY_PAID', 'Bruhat Bengaluru Mahanagara Palike', 'TAX-1008-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3009, 1009, NULL, 18500.00, 18500.00, 'OVERDUE', 'Greater Chennai Corporation', 'TAX-1009-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3010, 1010, '2026-04-15', 22700.00, 0.00, 'PAID', 'Greater Chennai Corporation', 'TAX-1010-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3011, 1011, '2026-04-15', 26900.00, 0.00, 'PAID', 'Bruhat Bengaluru Mahanagara Palike', 'TAX-1011-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3012, 1012, '2026-04-15', 31100.00, 0.00, 'PAID', 'Bruhat Bengaluru Mahanagara Palike', 'TAX-1012-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3013, 1013, '2026-05-10', 35300.00, 14120.00, 'PARTIALLY_PAID', 'Bruhat Bengaluru Mahanagara Palike', 'TAX-1013-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3014, 1014, NULL, 39500.00, 39500.00, 'OVERDUE', 'Bruhat Bengaluru Mahanagara Palike', 'TAX-1014-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3015, 1015, '2026-04-15', 43700.00, 0.00, 'PAID', 'Bruhat Bengaluru Mahanagara Palike', 'TAX-1015-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3016, 1016, '2026-04-15', 47900.00, 0.00, 'PAID', 'Bruhat Bengaluru Mahanagara Palike', 'TAX-1016-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3017, 1017, '2026-04-15', 18500.00, 0.00, 'PAID', 'Bruhat Bengaluru Mahanagara Palike', 'TAX-1017-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3018, 1018, '2026-05-10', 22700.00, 9080.00, 'PARTIALLY_PAID', 'Bruhat Bengaluru Mahanagara Palike', 'TAX-1018-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3019, 1019, NULL, 26900.00, 26900.00, 'OVERDUE', 'Bruhat Bengaluru Mahanagara Palike', 'TAX-1019-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3020, 1020, '2026-04-15', 31100.00, 0.00, 'PAID', 'Bruhat Bengaluru Mahanagara Palike', 'TAX-1020-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3021, 1021, '2026-04-15', 35300.00, 0.00, 'PAID', 'Bruhat Bengaluru Mahanagara Palike', 'TAX-1021-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3022, 1022, '2026-04-15', 39500.00, 0.00, 'PAID', 'Bruhat Bengaluru Mahanagara Palike', 'TAX-1022-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3023, 1023, '2026-05-10', 43700.00, 17480.00, 'PARTIALLY_PAID', 'Bruhat Bengaluru Mahanagara Palike', 'TAX-1023-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3024, 1024, NULL, 47900.00, 47900.00, 'OVERDUE', 'Bruhat Bengaluru Mahanagara Palike', 'TAX-1024-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3025, 1025, '2026-04-15', 18500.00, 0.00, 'PAID', 'Bruhat Bengaluru Mahanagara Palike', 'TAX-1025-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3026, 1026, '2026-04-15', 22700.00, 0.00, 'PAID', 'Pune Municipal Corporation', 'TAX-1026-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3027, 1027, '2026-04-15', 26900.00, 0.00, 'PAID', 'Pune Municipal Corporation', 'TAX-1027-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3028, 1028, '2026-05-10', 31100.00, 12440.00, 'PARTIALLY_PAID', 'Pune Municipal Corporation', 'TAX-1028-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3029, 1029, NULL, 35300.00, 35300.00, 'OVERDUE', 'Pune Municipal Corporation', 'TAX-1029-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3030, 1030, '2026-04-15', 39500.00, 0.00, 'PAID', 'Pune Municipal Corporation', 'TAX-1030-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3031, 1031, '2026-04-15', 43700.00, 0.00, 'PAID', 'Pune Municipal Corporation', 'TAX-1031-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3032, 1032, '2026-04-15', 47900.00, 0.00, 'PAID', 'Pune Municipal Corporation', 'TAX-1032-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3033, 1033, '2026-05-10', 18500.00, 7400.00, 'PARTIALLY_PAID', 'Pune Municipal Corporation', 'TAX-1033-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3034, 1034, NULL, 22700.00, 22700.00, 'OVERDUE', 'Pune Municipal Corporation', 'TAX-1034-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3035, 1035, '2026-04-15', 26900.00, 0.00, 'PAID', 'Pune Municipal Corporation', 'TAX-1035-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3036, 1036, '2026-04-15', 31100.00, 0.00, 'PAID', 'Municipal Corporation of Greater Mumbai', 'TAX-1036-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3037, 1037, '2026-04-15', 35300.00, 0.00, 'PAID', 'Municipal Corporation of Greater Mumbai', 'TAX-1037-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3038, 1038, '2026-05-10', 39500.00, 15800.00, 'PARTIALLY_PAID', 'Municipal Corporation of Greater Mumbai', 'TAX-1038-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3039, 1039, NULL, 43700.00, 43700.00, 'OVERDUE', 'Municipal Corporation of Greater Mumbai', 'TAX-1039-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3040, 1040, '2026-04-15', 47900.00, 0.00, 'PAID', 'Municipal Corporation of Greater Mumbai', 'TAX-1040-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3041, 1041, '2026-04-15', 18500.00, 0.00, 'PAID', 'Greater Chennai Corporation', 'TAX-1041-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3042, 1042, '2026-04-15', 22700.00, 0.00, 'PAID', 'Greater Chennai Corporation', 'TAX-1042-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3043, 1043, '2026-05-10', 26900.00, 10760.00, 'PARTIALLY_PAID', 'Greater Chennai Corporation', 'TAX-1043-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3044, 1044, NULL, 31100.00, 31100.00, 'OVERDUE', 'Town Panchayat / Local Body', 'TAX-1044-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3045, 1045, '2026-04-15', 35300.00, 0.00, 'PAID', 'Greater Chennai Corporation', 'TAX-1045-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3046, 1046, '2026-04-15', 39500.00, 0.00, 'PAID', 'Greater Chennai Corporation', 'TAX-1046-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3047, 1047, '2026-04-15', 43700.00, 0.00, 'PAID', 'Greater Chennai Corporation', 'TAX-1047-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3048, 1048, '2026-05-10', 47900.00, 19160.00, 'PARTIALLY_PAID', 'Greater Chennai Corporation', 'TAX-1048-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3049, 1049, NULL, 18500.00, 18500.00, 'OVERDUE', 'Bruhat Bengaluru Mahanagara Palike', 'TAX-1049-2026', TIMESTAMP '2026-09-22 10:00:00'),
(3050, 1050, '2026-04-15', 22700.00, 0.00, 'PAID', 'Bruhat Bengaluru Mahanagara Palike', 'TAX-1050-2026', TIMESTAMP '2026-09-22 10:00:00')
ON CONFLICT DO NOTHING;

INSERT INTO zoning_details
(zoning_id, property_id, zoning_code, zoning_status, allowed_use, effective_from, effective_to, source, retrieved_at)
VALUES
(4001, 1001, 'R-100', 'COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Chennai Metropolitan Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4002, 1002, 'R-101', 'COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Chennai Metropolitan Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4003, 1003, 'R-102', 'COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Chennai Metropolitan Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4004, 1004, 'R-103', 'PENDING', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Chennai Metropolitan Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4005, 1005, 'R-104', 'NON_COMPLIANT', 'Residential Layout / Approved Land Use', DATE '2020-01-01', NULL, 'Chennai Metropolitan Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4006, 1006, 'R-105', 'COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Bengaluru Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4007, 1007, 'R-106', 'COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Coimbatore Local Planning Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4008, 1008, 'R-100', 'COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Bengaluru Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4009, 1009, 'R-101', 'PENDING', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Chennai Metropolitan Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4010, 1010, 'R-102', 'NON_COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Chennai Metropolitan Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4011, 1011, 'R-103', 'COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Bengaluru Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4012, 1012, 'R-104', 'COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Bengaluru Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4013, 1013, 'R-105', 'COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Bengaluru Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4014, 1014, 'R-106', 'PENDING', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Bengaluru Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4015, 1015, 'R-100', 'NON_COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Bengaluru Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4016, 1016, 'R-101', 'COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Bengaluru Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4017, 1017, 'R-102', 'COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Bengaluru Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4018, 1018, 'R-103', 'COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Bengaluru Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4019, 1019, 'R-104', 'PENDING', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Bengaluru Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4020, 1020, 'R-105', 'NON_COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Bengaluru Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4021, 1021, 'R-106', 'COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Bengaluru Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4022, 1022, 'R-100', 'COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Bengaluru Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4023, 1023, 'R-101', 'COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Bengaluru Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4024, 1024, 'R-102', 'PENDING', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Bengaluru Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4025, 1025, 'R-103', 'NON_COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Bengaluru Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4026, 1026, 'R-104', 'COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Pune Metropolitan Region Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4027, 1027, 'R-105', 'COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Pune Metropolitan Region Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4028, 1028, 'R-106', 'COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Pune Metropolitan Region Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4029, 1029, 'R-100', 'PENDING', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Pune Metropolitan Region Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4030, 1030, 'R-101', 'NON_COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Pune Metropolitan Region Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4031, 1031, 'R-102', 'COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Pune Metropolitan Region Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4032, 1032, 'R-103', 'COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Pune Metropolitan Region Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4033, 1033, 'R-104', 'COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Pune Metropolitan Region Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4034, 1034, 'R-105', 'PENDING', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Pune Metropolitan Region Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4035, 1035, 'R-106', 'NON_COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Pune Metropolitan Region Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4036, 1036, 'R-100', 'COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Mumbai Metropolitan Region Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4037, 1037, 'R-101', 'COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Mumbai Metropolitan Region Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4038, 1038, 'R-102', 'COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Mumbai Metropolitan Region Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4039, 1039, 'R-103', 'PENDING', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Mumbai Metropolitan Region Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4040, 1040, 'R-104', 'NON_COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Mumbai Metropolitan Region Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4041, 1041, 'R-105', 'COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Chennai Metropolitan Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4042, 1042, 'R-106', 'COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Chennai Metropolitan Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4043, 1043, 'R-100', 'COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Chennai Metropolitan Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4044, 1044, 'R-101', 'PENDING', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'CMDA', TIMESTAMP '2026-09-22 10:00:00'),
(4045, 1045, 'R-102', 'NON_COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Chennai Metropolitan Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4046, 1046, 'R-103', 'COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Chennai Metropolitan Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4047, 1047, 'R-104', 'COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Chennai Metropolitan Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4048, 1048, 'R-105', 'COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Chennai Metropolitan Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4049, 1049, 'R-106', 'PENDING', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Bengaluru Development Authority', TIMESTAMP '2026-09-22 10:00:00'),
(4050, 1050, 'R-100', 'NON_COMPLIANT', 'Residential / Group Housing', DATE '2020-01-01', NULL, 'Bengaluru Development Authority', TIMESTAMP '2026-09-22 10:00:00')
ON CONFLICT DO NOTHING;

INSERT INTO flood_zone_details
(flood_zone_id, property_id, zone, risk_level, source, effective_date, retrieved_at)
VALUES
(5001, 1001, 'ZONE-C', 'LOW', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5002, 1002, 'ZONE-C', 'LOW', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5003, 1003, 'ZONE-B', 'MEDIUM', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5004, 1004, 'ZONE-A', 'HIGH', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5005, 1005, 'UNASSESSED', 'UNKNOWN', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5006, 1006, 'ZONE-C', 'LOW', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5007, 1007, 'ZONE-C', 'LOW', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5008, 1008, 'ZONE-B', 'MEDIUM', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5009, 1009, 'ZONE-A', 'HIGH', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5010, 1010, 'UNASSESSED', 'UNKNOWN', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5011, 1011, 'ZONE-C', 'LOW', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5012, 1012, 'ZONE-C', 'LOW', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5013, 1013, 'ZONE-B', 'MEDIUM', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5014, 1014, 'ZONE-A', 'HIGH', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5015, 1015, 'UNASSESSED', 'UNKNOWN', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5016, 1016, 'ZONE-C', 'LOW', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5017, 1017, 'ZONE-C', 'LOW', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5018, 1018, 'ZONE-B', 'MEDIUM', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5019, 1019, 'ZONE-A', 'HIGH', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5020, 1020, 'UNASSESSED', 'UNKNOWN', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5021, 1021, 'ZONE-C', 'LOW', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5022, 1022, 'ZONE-C', 'LOW', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5023, 1023, 'ZONE-B', 'MEDIUM', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5024, 1024, 'ZONE-A', 'HIGH', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5025, 1025, 'UNASSESSED', 'UNKNOWN', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5026, 1026, 'ZONE-C', 'LOW', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5027, 1027, 'ZONE-C', 'LOW', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5028, 1028, 'ZONE-B', 'MEDIUM', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5029, 1029, 'ZONE-A', 'HIGH', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5030, 1030, 'UNASSESSED', 'UNKNOWN', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5031, 1031, 'ZONE-C', 'LOW', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5032, 1032, 'ZONE-C', 'LOW', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5033, 1033, 'ZONE-B', 'MEDIUM', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5034, 1034, 'ZONE-A', 'HIGH', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5035, 1035, 'UNASSESSED', 'UNKNOWN', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5036, 1036, 'ZONE-C', 'LOW', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5037, 1037, 'ZONE-C', 'LOW', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5038, 1038, 'ZONE-B', 'MEDIUM', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5039, 1039, 'ZONE-A', 'HIGH', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5040, 1040, 'UNASSESSED', 'UNKNOWN', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5041, 1041, 'ZONE-C', 'LOW', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5042, 1042, 'ZONE-C', 'LOW', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5043, 1043, 'ZONE-B', 'MEDIUM', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5044, 1044, 'ZONE-A', 'HIGH', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5045, 1045, 'UNASSESSED', 'UNKNOWN', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5046, 1046, 'ZONE-C', 'LOW', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5047, 1047, 'ZONE-C', 'LOW', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5048, 1048, 'ZONE-B', 'MEDIUM', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5049, 1049, 'ZONE-A', 'HIGH', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00'),
(5050, 1050, 'UNASSESSED', 'UNKNOWN', 'URBAN_FLOOD_SCENARIO', DATE '2026-06-01', TIMESTAMP '2026-09-22 10:00:00')
ON CONFLICT DO NOTHING;

INSERT INTO environmental_details
(environmental_id, property_id, record_type, status, risk_level, description, source, external_record_id, retrieved_at)
VALUES
(6001, 1001, 'SITE_SCREENING', 'CLEAR', 'LOW', 'No adverse environmental indicator in the scenario dataset.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1001', TIMESTAMP '2026-09-22 10:00:00'),
(6002, 1002, 'SITE_SCREENING', 'CLEAR', 'LOW', 'No adverse environmental indicator in the scenario dataset.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1002', TIMESTAMP '2026-09-22 10:00:00'),
(6003, 1003, 'SITE_SCREENING', 'PENDING', 'MEDIUM', 'Environmental record requires additional review.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1003', TIMESTAMP '2026-09-22 10:00:00'),
(6004, 1004, 'SITE_SCREENING', 'FLAGGED', 'HIGH', 'Scenario contains an environmental review flag.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1004', TIMESTAMP '2026-09-22 10:00:00'),
(6005, 1005, 'SITE_SCREENING', 'NOT_FOUND', 'UNKNOWN', 'No environmental record available in the scenario dataset.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1005', TIMESTAMP '2026-09-22 10:00:00'),
(6006, 1006, 'SITE_SCREENING', 'CLEAR', 'LOW', 'No adverse environmental indicator in the scenario dataset.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1006', TIMESTAMP '2026-09-22 10:00:00'),
(6007, 1007, 'SITE_SCREENING', 'CLEAR', 'LOW', 'No adverse environmental indicator in the scenario dataset.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1007', TIMESTAMP '2026-09-22 10:00:00'),
(6008, 1008, 'SITE_SCREENING', 'PENDING', 'MEDIUM', 'Environmental record requires additional review.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1008', TIMESTAMP '2026-09-22 10:00:00'),
(6009, 1009, 'SITE_SCREENING', 'FLAGGED', 'HIGH', 'Scenario contains an environmental review flag.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1009', TIMESTAMP '2026-09-22 10:00:00'),
(6010, 1010, 'SITE_SCREENING', 'NOT_FOUND', 'UNKNOWN', 'No environmental record available in the scenario dataset.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1010', TIMESTAMP '2026-09-22 10:00:00'),
(6011, 1011, 'SITE_SCREENING', 'CLEAR', 'LOW', 'No adverse environmental indicator in the scenario dataset.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1011', TIMESTAMP '2026-09-22 10:00:00'),
(6012, 1012, 'SITE_SCREENING', 'CLEAR', 'LOW', 'No adverse environmental indicator in the scenario dataset.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1012', TIMESTAMP '2026-09-22 10:00:00'),
(6013, 1013, 'SITE_SCREENING', 'PENDING', 'MEDIUM', 'Environmental record requires additional review.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1013', TIMESTAMP '2026-09-22 10:00:00'),
(6014, 1014, 'SITE_SCREENING', 'FLAGGED', 'HIGH', 'Scenario contains an environmental review flag.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1014', TIMESTAMP '2026-09-22 10:00:00'),
(6015, 1015, 'SITE_SCREENING', 'NOT_FOUND', 'UNKNOWN', 'No environmental record available in the scenario dataset.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1015', TIMESTAMP '2026-09-22 10:00:00'),
(6016, 1016, 'SITE_SCREENING', 'CLEAR', 'LOW', 'No adverse environmental indicator in the scenario dataset.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1016', TIMESTAMP '2026-09-22 10:00:00'),
(6017, 1017, 'SITE_SCREENING', 'CLEAR', 'LOW', 'No adverse environmental indicator in the scenario dataset.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1017', TIMESTAMP '2026-09-22 10:00:00'),
(6018, 1018, 'SITE_SCREENING', 'PENDING', 'MEDIUM', 'Environmental record requires additional review.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1018', TIMESTAMP '2026-09-22 10:00:00'),
(6019, 1019, 'SITE_SCREENING', 'FLAGGED', 'HIGH', 'Scenario contains an environmental review flag.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1019', TIMESTAMP '2026-09-22 10:00:00'),
(6020, 1020, 'SITE_SCREENING', 'NOT_FOUND', 'UNKNOWN', 'No environmental record available in the scenario dataset.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1020', TIMESTAMP '2026-09-22 10:00:00'),
(6021, 1021, 'SITE_SCREENING', 'CLEAR', 'LOW', 'No adverse environmental indicator in the scenario dataset.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1021', TIMESTAMP '2026-09-22 10:00:00'),
(6022, 1022, 'SITE_SCREENING', 'CLEAR', 'LOW', 'No adverse environmental indicator in the scenario dataset.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1022', TIMESTAMP '2026-09-22 10:00:00'),
(6023, 1023, 'SITE_SCREENING', 'PENDING', 'MEDIUM', 'Environmental record requires additional review.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1023', TIMESTAMP '2026-09-22 10:00:00'),
(6024, 1024, 'SITE_SCREENING', 'FLAGGED', 'HIGH', 'Scenario contains an environmental review flag.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1024', TIMESTAMP '2026-09-22 10:00:00'),
(6025, 1025, 'SITE_SCREENING', 'NOT_FOUND', 'UNKNOWN', 'No environmental record available in the scenario dataset.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1025', TIMESTAMP '2026-09-22 10:00:00'),
(6026, 1026, 'SITE_SCREENING', 'CLEAR', 'LOW', 'No adverse environmental indicator in the scenario dataset.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1026', TIMESTAMP '2026-09-22 10:00:00'),
(6027, 1027, 'SITE_SCREENING', 'CLEAR', 'LOW', 'No adverse environmental indicator in the scenario dataset.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1027', TIMESTAMP '2026-09-22 10:00:00'),
(6028, 1028, 'SITE_SCREENING', 'PENDING', 'MEDIUM', 'Environmental record requires additional review.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1028', TIMESTAMP '2026-09-22 10:00:00'),
(6029, 1029, 'SITE_SCREENING', 'FLAGGED', 'HIGH', 'Scenario contains an environmental review flag.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1029', TIMESTAMP '2026-09-22 10:00:00'),
(6030, 1030, 'SITE_SCREENING', 'NOT_FOUND', 'UNKNOWN', 'No environmental record available in the scenario dataset.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1030', TIMESTAMP '2026-09-22 10:00:00'),
(6031, 1031, 'SITE_SCREENING', 'CLEAR', 'LOW', 'No adverse environmental indicator in the scenario dataset.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1031', TIMESTAMP '2026-09-22 10:00:00'),
(6032, 1032, 'SITE_SCREENING', 'CLEAR', 'LOW', 'No adverse environmental indicator in the scenario dataset.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1032', TIMESTAMP '2026-09-22 10:00:00'),
(6033, 1033, 'SITE_SCREENING', 'PENDING', 'MEDIUM', 'Environmental record requires additional review.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1033', TIMESTAMP '2026-09-22 10:00:00'),
(6034, 1034, 'SITE_SCREENING', 'FLAGGED', 'HIGH', 'Scenario contains an environmental review flag.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1034', TIMESTAMP '2026-09-22 10:00:00'),
(6035, 1035, 'SITE_SCREENING', 'NOT_FOUND', 'UNKNOWN', 'No environmental record available in the scenario dataset.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1035', TIMESTAMP '2026-09-22 10:00:00'),
(6036, 1036, 'SITE_SCREENING', 'CLEAR', 'LOW', 'No adverse environmental indicator in the scenario dataset.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1036', TIMESTAMP '2026-09-22 10:00:00'),
(6037, 1037, 'SITE_SCREENING', 'CLEAR', 'LOW', 'No adverse environmental indicator in the scenario dataset.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1037', TIMESTAMP '2026-09-22 10:00:00'),
(6038, 1038, 'SITE_SCREENING', 'PENDING', 'MEDIUM', 'Environmental record requires additional review.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1038', TIMESTAMP '2026-09-22 10:00:00'),
(6039, 1039, 'SITE_SCREENING', 'FLAGGED', 'HIGH', 'Scenario contains an environmental review flag.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1039', TIMESTAMP '2026-09-22 10:00:00'),
(6040, 1040, 'SITE_SCREENING', 'NOT_FOUND', 'UNKNOWN', 'No environmental record available in the scenario dataset.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1040', TIMESTAMP '2026-09-22 10:00:00'),
(6041, 1041, 'SITE_SCREENING', 'CLEAR', 'LOW', 'No adverse environmental indicator in the scenario dataset.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1041', TIMESTAMP '2026-09-22 10:00:00'),
(6042, 1042, 'SITE_SCREENING', 'CLEAR', 'LOW', 'No adverse environmental indicator in the scenario dataset.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1042', TIMESTAMP '2026-09-22 10:00:00'),
(6043, 1043, 'SITE_SCREENING', 'PENDING', 'MEDIUM', 'Environmental record requires additional review.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1043', TIMESTAMP '2026-09-22 10:00:00'),
(6044, 1044, 'SITE_SCREENING', 'FLAGGED', 'HIGH', 'Scenario contains an environmental review flag.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1044', TIMESTAMP '2026-09-22 10:00:00'),
(6045, 1045, 'SITE_SCREENING', 'NOT_FOUND', 'UNKNOWN', 'No environmental record available in the scenario dataset.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1045', TIMESTAMP '2026-09-22 10:00:00'),
(6046, 1046, 'SITE_SCREENING', 'CLEAR', 'LOW', 'No adverse environmental indicator in the scenario dataset.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1046', TIMESTAMP '2026-09-22 10:00:00'),
(6047, 1047, 'SITE_SCREENING', 'CLEAR', 'LOW', 'No adverse environmental indicator in the scenario dataset.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1047', TIMESTAMP '2026-09-22 10:00:00'),
(6048, 1048, 'SITE_SCREENING', 'PENDING', 'MEDIUM', 'Environmental record requires additional review.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1048', TIMESTAMP '2026-09-22 10:00:00'),
(6049, 1049, 'SITE_SCREENING', 'FLAGGED', 'HIGH', 'Scenario contains an environmental review flag.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1049', TIMESTAMP '2026-09-22 10:00:00'),
(6050, 1050, 'SITE_SCREENING', 'NOT_FOUND', 'UNKNOWN', 'No environmental record available in the scenario dataset.', 'ENVIRONMENTAL_SCENARIO', 'ENV-1050', TIMESTAMP '2026-09-22 10:00:00')
ON CONFLICT DO NOTHING;

INSERT INTO utility_details
(utility_id, property_id, utility_type, provider, availability_status, source, retrieved_at)
VALUES
(7001, 1001, 'ELECTRICITY', 'Tamil Nadu Generation and Distribution Corporation', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7002, 1001, 'WATER', 'Chennai Metropolitan Water Supply and Sewerage Board', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7003, 1001, 'SEWERAGE', 'Greater Chennai Corporation', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7004, 1002, 'ELECTRICITY', 'Tamil Nadu Generation and Distribution Corporation', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7005, 1002, 'WATER', 'Chennai Metropolitan Water Supply and Sewerage Board', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7006, 1002, 'SEWERAGE', 'Greater Chennai Corporation', 'UNKNOWN', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7007, 1003, 'ELECTRICITY', 'Tamil Nadu Generation and Distribution Corporation', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7008, 1003, 'WATER', 'Chennai Metropolitan Water Supply and Sewerage Board', 'UNKNOWN', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7009, 1003, 'SEWERAGE', 'Greater Chennai Corporation', 'NOT_VERIFIED', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7010, 1004, 'ELECTRICITY', 'Tamil Nadu Generation and Distribution Corporation', 'UNKNOWN', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7011, 1004, 'WATER', 'Chennai Metropolitan Water Supply and Sewerage Board', 'NOT_VERIFIED', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7012, 1004, 'SEWERAGE', 'Greater Chennai Corporation', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7013, 1005, 'ELECTRICITY', 'Tamil Nadu Generation and Distribution Corporation', 'NOT_VERIFIED', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7014, 1005, 'WATER', 'Chennai Metropolitan Water Supply and Sewerage Board', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7015, 1005, 'SEWERAGE', 'Greater Chennai Corporation', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7016, 1006, 'ELECTRICITY', 'Bangalore Electricity Supply Company', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7017, 1006, 'WATER', 'Bangalore Water Supply and Sewerage Board', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7018, 1006, 'SEWERAGE', 'Bruhat Bengaluru Mahanagara Palike', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7019, 1007, 'ELECTRICITY', 'Tamil Nadu Generation and Distribution Corporation', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7020, 1007, 'WATER', 'Coimbatore City Municipal Corporation', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7021, 1007, 'SEWERAGE', 'Coimbatore City Municipal Corporation', 'UNKNOWN', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7022, 1008, 'ELECTRICITY', 'Bangalore Electricity Supply Company', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7023, 1008, 'WATER', 'Bangalore Water Supply and Sewerage Board', 'UNKNOWN', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7024, 1008, 'SEWERAGE', 'Bruhat Bengaluru Mahanagara Palike', 'NOT_VERIFIED', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7025, 1009, 'ELECTRICITY', 'Tamil Nadu Generation and Distribution Corporation', 'UNKNOWN', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7026, 1009, 'WATER', 'Chennai Metropolitan Water Supply and Sewerage Board', 'NOT_VERIFIED', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7027, 1009, 'SEWERAGE', 'Greater Chennai Corporation', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7028, 1010, 'ELECTRICITY', 'Tamil Nadu Generation and Distribution Corporation', 'NOT_VERIFIED', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7029, 1010, 'WATER', 'Chennai Metropolitan Water Supply and Sewerage Board', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7030, 1010, 'SEWERAGE', 'Greater Chennai Corporation', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7031, 1011, 'ELECTRICITY', 'Bangalore Electricity Supply Company', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7032, 1011, 'WATER', 'Bangalore Water Supply and Sewerage Board', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7033, 1011, 'SEWERAGE', 'Bruhat Bengaluru Mahanagara Palike', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7034, 1012, 'ELECTRICITY', 'Bangalore Electricity Supply Company', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7035, 1012, 'WATER', 'Bangalore Water Supply and Sewerage Board', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7036, 1012, 'SEWERAGE', 'Bruhat Bengaluru Mahanagara Palike', 'UNKNOWN', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7037, 1013, 'ELECTRICITY', 'Bangalore Electricity Supply Company', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7038, 1013, 'WATER', 'Bangalore Water Supply and Sewerage Board', 'UNKNOWN', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7039, 1013, 'SEWERAGE', 'Bruhat Bengaluru Mahanagara Palike', 'NOT_VERIFIED', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7040, 1014, 'ELECTRICITY', 'Bangalore Electricity Supply Company', 'UNKNOWN', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7041, 1014, 'WATER', 'Bangalore Water Supply and Sewerage Board', 'NOT_VERIFIED', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7042, 1014, 'SEWERAGE', 'Bruhat Bengaluru Mahanagara Palike', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7043, 1015, 'ELECTRICITY', 'Bangalore Electricity Supply Company', 'NOT_VERIFIED', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7044, 1015, 'WATER', 'Bangalore Water Supply and Sewerage Board', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7045, 1015, 'SEWERAGE', 'Bruhat Bengaluru Mahanagara Palike', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7046, 1016, 'ELECTRICITY', 'Bangalore Electricity Supply Company', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7047, 1016, 'WATER', 'Bangalore Water Supply and Sewerage Board', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7048, 1016, 'SEWERAGE', 'Bruhat Bengaluru Mahanagara Palike', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7049, 1017, 'ELECTRICITY', 'Bangalore Electricity Supply Company', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7050, 1017, 'WATER', 'Bangalore Water Supply and Sewerage Board', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7051, 1017, 'SEWERAGE', 'Bruhat Bengaluru Mahanagara Palike', 'UNKNOWN', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7052, 1018, 'ELECTRICITY', 'Bangalore Electricity Supply Company', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7053, 1018, 'WATER', 'Bangalore Water Supply and Sewerage Board', 'UNKNOWN', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7054, 1018, 'SEWERAGE', 'Bruhat Bengaluru Mahanagara Palike', 'NOT_VERIFIED', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7055, 1019, 'ELECTRICITY', 'Bangalore Electricity Supply Company', 'UNKNOWN', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7056, 1019, 'WATER', 'Bangalore Water Supply and Sewerage Board', 'NOT_VERIFIED', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7057, 1019, 'SEWERAGE', 'Bruhat Bengaluru Mahanagara Palike', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7058, 1020, 'ELECTRICITY', 'Bangalore Electricity Supply Company', 'NOT_VERIFIED', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7059, 1020, 'WATER', 'Bangalore Water Supply and Sewerage Board', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7060, 1020, 'SEWERAGE', 'Bruhat Bengaluru Mahanagara Palike', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7061, 1021, 'ELECTRICITY', 'Bangalore Electricity Supply Company', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7062, 1021, 'WATER', 'Bangalore Water Supply and Sewerage Board', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7063, 1021, 'SEWERAGE', 'Bruhat Bengaluru Mahanagara Palike', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7064, 1022, 'ELECTRICITY', 'Bangalore Electricity Supply Company', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7065, 1022, 'WATER', 'Bangalore Water Supply and Sewerage Board', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7066, 1022, 'SEWERAGE', 'Bruhat Bengaluru Mahanagara Palike', 'UNKNOWN', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7067, 1023, 'ELECTRICITY', 'Bangalore Electricity Supply Company', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7068, 1023, 'WATER', 'Bangalore Water Supply and Sewerage Board', 'UNKNOWN', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7069, 1023, 'SEWERAGE', 'Bruhat Bengaluru Mahanagara Palike', 'NOT_VERIFIED', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7070, 1024, 'ELECTRICITY', 'Bangalore Electricity Supply Company', 'UNKNOWN', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7071, 1024, 'WATER', 'Bangalore Water Supply and Sewerage Board', 'NOT_VERIFIED', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7072, 1024, 'SEWERAGE', 'Bruhat Bengaluru Mahanagara Palike', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7073, 1025, 'ELECTRICITY', 'Bangalore Electricity Supply Company', 'NOT_VERIFIED', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7074, 1025, 'WATER', 'Bangalore Water Supply and Sewerage Board', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7075, 1025, 'SEWERAGE', 'Bruhat Bengaluru Mahanagara Palike', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7076, 1026, 'ELECTRICITY', 'Maharashtra State Electricity Distribution Company', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7077, 1026, 'WATER', 'Pune Municipal Corporation', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7078, 1026, 'SEWERAGE', 'Pune Municipal Corporation', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7079, 1027, 'ELECTRICITY', 'Maharashtra State Electricity Distribution Company', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7080, 1027, 'WATER', 'Pune Municipal Corporation', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7081, 1027, 'SEWERAGE', 'Pune Municipal Corporation', 'UNKNOWN', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7082, 1028, 'ELECTRICITY', 'Maharashtra State Electricity Distribution Company', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7083, 1028, 'WATER', 'Pune Municipal Corporation', 'UNKNOWN', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7084, 1028, 'SEWERAGE', 'Pune Municipal Corporation', 'NOT_VERIFIED', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7085, 1029, 'ELECTRICITY', 'Maharashtra State Electricity Distribution Company', 'UNKNOWN', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7086, 1029, 'WATER', 'Pune Municipal Corporation', 'NOT_VERIFIED', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7087, 1029, 'SEWERAGE', 'Pune Municipal Corporation', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7088, 1030, 'ELECTRICITY', 'Maharashtra State Electricity Distribution Company', 'NOT_VERIFIED', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7089, 1030, 'WATER', 'Pune Municipal Corporation', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7090, 1030, 'SEWERAGE', 'Pune Municipal Corporation', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7091, 1031, 'ELECTRICITY', 'Maharashtra State Electricity Distribution Company', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7092, 1031, 'WATER', 'Pune Municipal Corporation', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7093, 1031, 'SEWERAGE', 'Pune Municipal Corporation', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7094, 1032, 'ELECTRICITY', 'Maharashtra State Electricity Distribution Company', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7095, 1032, 'WATER', 'Pune Municipal Corporation', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7096, 1032, 'SEWERAGE', 'Pune Municipal Corporation', 'UNKNOWN', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7097, 1033, 'ELECTRICITY', 'Maharashtra State Electricity Distribution Company', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7098, 1033, 'WATER', 'Pune Municipal Corporation', 'UNKNOWN', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7099, 1033, 'SEWERAGE', 'Pune Municipal Corporation', 'NOT_VERIFIED', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7100, 1034, 'ELECTRICITY', 'Maharashtra State Electricity Distribution Company', 'UNKNOWN', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7101, 1034, 'WATER', 'Pune Municipal Corporation', 'NOT_VERIFIED', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7102, 1034, 'SEWERAGE', 'Pune Municipal Corporation', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7103, 1035, 'ELECTRICITY', 'Maharashtra State Electricity Distribution Company', 'NOT_VERIFIED', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7104, 1035, 'WATER', 'Pune Municipal Corporation', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7105, 1035, 'SEWERAGE', 'Pune Municipal Corporation', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7106, 1036, 'ELECTRICITY', 'Adani Electricity Mumbai', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7107, 1036, 'WATER', 'Municipal Corporation of Greater Mumbai', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7108, 1036, 'SEWERAGE', 'Municipal Corporation of Greater Mumbai', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7109, 1037, 'ELECTRICITY', 'Adani Electricity Mumbai', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7110, 1037, 'WATER', 'Municipal Corporation of Greater Mumbai', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7111, 1037, 'SEWERAGE', 'Municipal Corporation of Greater Mumbai', 'UNKNOWN', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7112, 1038, 'ELECTRICITY', 'Adani Electricity Mumbai', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7113, 1038, 'WATER', 'Municipal Corporation of Greater Mumbai', 'UNKNOWN', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7114, 1038, 'SEWERAGE', 'Municipal Corporation of Greater Mumbai', 'NOT_VERIFIED', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7115, 1039, 'ELECTRICITY', 'Adani Electricity Mumbai', 'UNKNOWN', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7116, 1039, 'WATER', 'Municipal Corporation of Greater Mumbai', 'NOT_VERIFIED', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7117, 1039, 'SEWERAGE', 'Municipal Corporation of Greater Mumbai', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7118, 1040, 'ELECTRICITY', 'Adani Electricity Mumbai', 'NOT_VERIFIED', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7119, 1040, 'WATER', 'Municipal Corporation of Greater Mumbai', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7120, 1040, 'SEWERAGE', 'Municipal Corporation of Greater Mumbai', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7121, 1041, 'ELECTRICITY', 'Tamil Nadu Generation and Distribution Corporation', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7122, 1041, 'WATER', 'Chennai Metropolitan Water Supply and Sewerage Board', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7123, 1041, 'SEWERAGE', 'Greater Chennai Corporation', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7124, 1042, 'ELECTRICITY', 'Tamil Nadu Generation and Distribution Corporation', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7125, 1042, 'WATER', 'Chennai Metropolitan Water Supply and Sewerage Board', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7126, 1042, 'SEWERAGE', 'Greater Chennai Corporation', 'UNKNOWN', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7127, 1043, 'ELECTRICITY', 'Tamil Nadu Generation and Distribution Corporation', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7128, 1043, 'WATER', 'Chennai Metropolitan Water Supply and Sewerage Board', 'UNKNOWN', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7129, 1043, 'SEWERAGE', 'Greater Chennai Corporation', 'NOT_VERIFIED', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7130, 1044, 'ELECTRICITY', 'Tamil Nadu Generation and Distribution Corporation', 'UNKNOWN', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7131, 1044, 'WATER', 'Local Water Supply Authority', 'NOT_VERIFIED', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7132, 1044, 'SEWERAGE', 'Town Panchayat / Local Body', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7133, 1045, 'ELECTRICITY', 'Tamil Nadu Generation and Distribution Corporation', 'NOT_VERIFIED', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7134, 1045, 'WATER', 'Chennai Metropolitan Water Supply and Sewerage Board', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7135, 1045, 'SEWERAGE', 'Greater Chennai Corporation', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7136, 1046, 'ELECTRICITY', 'Tamil Nadu Generation and Distribution Corporation', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7137, 1046, 'WATER', 'Chennai Metropolitan Water Supply and Sewerage Board', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7138, 1046, 'SEWERAGE', 'Greater Chennai Corporation', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7139, 1047, 'ELECTRICITY', 'Tamil Nadu Generation and Distribution Corporation', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7140, 1047, 'WATER', 'Chennai Metropolitan Water Supply and Sewerage Board', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7141, 1047, 'SEWERAGE', 'Greater Chennai Corporation', 'UNKNOWN', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7142, 1048, 'ELECTRICITY', 'Tamil Nadu Generation and Distribution Corporation', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7143, 1048, 'WATER', 'Chennai Metropolitan Water Supply and Sewerage Board', 'UNKNOWN', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7144, 1048, 'SEWERAGE', 'Greater Chennai Corporation', 'NOT_VERIFIED', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7145, 1049, 'ELECTRICITY', 'Bangalore Electricity Supply Company', 'UNKNOWN', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7146, 1049, 'WATER', 'Bangalore Water Supply and Sewerage Board', 'NOT_VERIFIED', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7147, 1049, 'SEWERAGE', 'Bruhat Bengaluru Mahanagara Palike', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7148, 1050, 'ELECTRICITY', 'Bangalore Electricity Supply Company', 'NOT_VERIFIED', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7149, 1050, 'WATER', 'Bangalore Water Supply and Sewerage Board', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(7150, 1050, 'SEWERAGE', 'Bruhat Bengaluru Mahanagara Palike', 'AVAILABLE', 'UTILITY_SCENARIO', TIMESTAMP '2026-09-22 10:00:00')
ON CONFLICT DO NOTHING;

INSERT INTO building_permit_details
(permit_id, property_id, permit_number, permit_type, permit_status, issue_date, completion_date, description, source, external_record_id, retrieved_at)
VALUES
(8001, 1001, 'BP-1001-A', 'BUILDING', 'APPROVED', DATE '2019-02-10', DATE '2020-08-20', 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1001', TIMESTAMP '2026-09-22 10:00:00'),
(8002, 1002, 'BP-1002-A', 'BUILDING', 'APPROVED', DATE '2020-02-10', DATE '2021-08-20', 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1002', TIMESTAMP '2026-09-22 10:00:00'),
(8003, 1003, 'BP-1003-A', 'BUILDING', 'COMPLETED', DATE '2021-02-10', DATE '2022-08-20', 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1003', TIMESTAMP '2026-09-22 10:00:00'),
(8004, 1004, 'BP-1004-A', 'BUILDING', 'PENDING', DATE '2022-02-10', NULL, 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1004', TIMESTAMP '2026-09-22 10:00:00'),
(8005, 1005, 'BP-1005-A', 'BUILDING', 'EXPIRED', DATE '2023-02-10', NULL, 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1005', TIMESTAMP '2026-09-22 10:00:00'),
(8006, 1006, 'BP-1006-A', 'BUILDING', 'APPROVED', DATE '2019-02-10', DATE '2020-08-20', 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1006', TIMESTAMP '2026-09-22 10:00:00'),
(8007, 1007, 'BP-1007-A', 'BUILDING', 'APPROVED', DATE '2020-02-10', DATE '2021-08-20', 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1007', TIMESTAMP '2026-09-22 10:00:00'),
(8008, 1008, 'BP-1008-A', 'BUILDING', 'COMPLETED', DATE '2021-02-10', DATE '2022-08-20', 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1008', TIMESTAMP '2026-09-22 10:00:00'),
(8009, 1009, 'BP-1009-A', 'BUILDING', 'PENDING', DATE '2022-02-10', NULL, 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1009', TIMESTAMP '2026-09-22 10:00:00'),
(8010, 1010, 'BP-1010-A', 'BUILDING', 'EXPIRED', DATE '2023-02-10', NULL, 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1010', TIMESTAMP '2026-09-22 10:00:00'),
(8011, 1011, 'BP-1011-A', 'BUILDING', 'APPROVED', DATE '2019-02-10', DATE '2020-08-20', 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1011', TIMESTAMP '2026-09-22 10:00:00'),
(8012, 1012, 'BP-1012-A', 'BUILDING', 'APPROVED', DATE '2020-02-10', DATE '2021-08-20', 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1012', TIMESTAMP '2026-09-22 10:00:00'),
(8013, 1013, 'BP-1013-A', 'BUILDING', 'COMPLETED', DATE '2021-02-10', DATE '2022-08-20', 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1013', TIMESTAMP '2026-09-22 10:00:00'),
(8014, 1014, 'BP-1014-A', 'BUILDING', 'PENDING', DATE '2022-02-10', NULL, 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1014', TIMESTAMP '2026-09-22 10:00:00'),
(8015, 1015, 'BP-1015-A', 'BUILDING', 'EXPIRED', DATE '2023-02-10', NULL, 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1015', TIMESTAMP '2026-09-22 10:00:00'),
(8016, 1016, 'BP-1016-A', 'BUILDING', 'APPROVED', DATE '2019-02-10', DATE '2020-08-20', 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1016', TIMESTAMP '2026-09-22 10:00:00'),
(8017, 1017, 'BP-1017-A', 'BUILDING', 'APPROVED', DATE '2020-02-10', DATE '2021-08-20', 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1017', TIMESTAMP '2026-09-22 10:00:00'),
(8018, 1018, 'BP-1018-A', 'BUILDING', 'COMPLETED', DATE '2021-02-10', DATE '2022-08-20', 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1018', TIMESTAMP '2026-09-22 10:00:00'),
(8019, 1019, 'BP-1019-A', 'BUILDING', 'PENDING', DATE '2022-02-10', NULL, 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1019', TIMESTAMP '2026-09-22 10:00:00'),
(8020, 1020, 'BP-1020-A', 'BUILDING', 'EXPIRED', DATE '2023-02-10', NULL, 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1020', TIMESTAMP '2026-09-22 10:00:00'),
(8021, 1021, 'BP-1021-A', 'BUILDING', 'APPROVED', DATE '2019-02-10', DATE '2020-08-20', 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1021', TIMESTAMP '2026-09-22 10:00:00'),
(8022, 1022, 'BP-1022-A', 'BUILDING', 'APPROVED', DATE '2020-02-10', DATE '2021-08-20', 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1022', TIMESTAMP '2026-09-22 10:00:00'),
(8023, 1023, 'BP-1023-A', 'BUILDING', 'COMPLETED', DATE '2021-02-10', DATE '2022-08-20', 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1023', TIMESTAMP '2026-09-22 10:00:00'),
(8024, 1024, 'BP-1024-A', 'BUILDING', 'PENDING', DATE '2022-02-10', NULL, 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1024', TIMESTAMP '2026-09-22 10:00:00'),
(8025, 1025, 'BP-1025-A', 'BUILDING', 'EXPIRED', DATE '2023-02-10', NULL, 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1025', TIMESTAMP '2026-09-22 10:00:00'),
(8026, 1026, 'BP-1026-A', 'BUILDING', 'APPROVED', DATE '2019-02-10', DATE '2020-08-20', 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1026', TIMESTAMP '2026-09-22 10:00:00'),
(8027, 1027, 'BP-1027-A', 'BUILDING', 'APPROVED', DATE '2020-02-10', DATE '2021-08-20', 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1027', TIMESTAMP '2026-09-22 10:00:00'),
(8028, 1028, 'BP-1028-A', 'BUILDING', 'COMPLETED', DATE '2021-02-10', DATE '2022-08-20', 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1028', TIMESTAMP '2026-09-22 10:00:00'),
(8029, 1029, 'BP-1029-A', 'BUILDING', 'PENDING', DATE '2022-02-10', NULL, 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1029', TIMESTAMP '2026-09-22 10:00:00'),
(8030, 1030, 'BP-1030-A', 'BUILDING', 'EXPIRED', DATE '2023-02-10', NULL, 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1030', TIMESTAMP '2026-09-22 10:00:00'),
(8031, 1031, 'BP-1031-A', 'BUILDING', 'APPROVED', DATE '2019-02-10', DATE '2020-08-20', 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1031', TIMESTAMP '2026-09-22 10:00:00'),
(8032, 1032, 'BP-1032-A', 'BUILDING', 'APPROVED', DATE '2020-02-10', DATE '2021-08-20', 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1032', TIMESTAMP '2026-09-22 10:00:00'),
(8033, 1033, 'BP-1033-A', 'BUILDING', 'COMPLETED', DATE '2021-02-10', DATE '2022-08-20', 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1033', TIMESTAMP '2026-09-22 10:00:00'),
(8034, 1034, 'BP-1034-A', 'BUILDING', 'PENDING', DATE '2022-02-10', NULL, 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1034', TIMESTAMP '2026-09-22 10:00:00'),
(8035, 1035, 'BP-1035-A', 'BUILDING', 'EXPIRED', DATE '2023-02-10', NULL, 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1035', TIMESTAMP '2026-09-22 10:00:00'),
(8036, 1036, 'BP-1036-A', 'BUILDING', 'APPROVED', DATE '2019-02-10', DATE '2020-08-20', 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1036', TIMESTAMP '2026-09-22 10:00:00'),
(8037, 1037, 'BP-1037-A', 'BUILDING', 'APPROVED', DATE '2020-02-10', DATE '2021-08-20', 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1037', TIMESTAMP '2026-09-22 10:00:00'),
(8038, 1038, 'BP-1038-A', 'BUILDING', 'COMPLETED', DATE '2021-02-10', DATE '2022-08-20', 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1038', TIMESTAMP '2026-09-22 10:00:00'),
(8039, 1039, 'BP-1039-A', 'BUILDING', 'PENDING', DATE '2022-02-10', NULL, 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1039', TIMESTAMP '2026-09-22 10:00:00'),
(8040, 1040, 'BP-1040-A', 'BUILDING', 'EXPIRED', DATE '2023-02-10', NULL, 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1040', TIMESTAMP '2026-09-22 10:00:00'),
(8041, 1041, 'BP-1041-A', 'BUILDING', 'APPROVED', DATE '2019-02-10', DATE '2020-08-20', 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1041', TIMESTAMP '2026-09-22 10:00:00'),
(8042, 1042, 'BP-1042-A', 'BUILDING', 'APPROVED', DATE '2020-02-10', DATE '2021-08-20', 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1042', TIMESTAMP '2026-09-22 10:00:00'),
(8043, 1043, 'BP-1043-A', 'BUILDING', 'COMPLETED', DATE '2021-02-10', DATE '2022-08-20', 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1043', TIMESTAMP '2026-09-22 10:00:00'),
(8044, 1044, 'BP-1044-A', 'BUILDING', 'PENDING', DATE '2022-02-10', NULL, 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1044', TIMESTAMP '2026-09-22 10:00:00'),
(8045, 1045, 'BP-1045-A', 'BUILDING', 'EXPIRED', DATE '2023-02-10', NULL, 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1045', TIMESTAMP '2026-09-22 10:00:00'),
(8046, 1046, 'BP-1046-A', 'BUILDING', 'APPROVED', DATE '2019-02-10', DATE '2020-08-20', 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1046', TIMESTAMP '2026-09-22 10:00:00'),
(8047, 1047, 'BP-1047-A', 'BUILDING', 'APPROVED', DATE '2020-02-10', DATE '2021-08-20', 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1047', TIMESTAMP '2026-09-22 10:00:00'),
(8048, 1048, 'BP-1048-A', 'BUILDING', 'COMPLETED', DATE '2021-02-10', DATE '2022-08-20', 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1048', TIMESTAMP '2026-09-22 10:00:00'),
(8049, 1049, 'BP-1049-A', 'BUILDING', 'PENDING', DATE '2022-02-10', NULL, 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1049', TIMESTAMP '2026-09-22 10:00:00'),
(8050, 1050, 'BP-1050-A', 'BUILDING', 'EXPIRED', DATE '2023-02-10', NULL, 'Building approval scenario for the referenced property.', 'MUNICIPAL_PERMIT_SCENARIO', 'PERMIT-1050', TIMESTAMP '2026-09-22 10:00:00')
ON CONFLICT DO NOTHING;

INSERT INTO comparable_property_details
(comparable_id, property_id, external_listing_id, city, locality, property_type, bhk, area_sqft, price, price_per_sqft, rera_id, verified, source, retrieved_at)
VALUES
(9001, 1001, 'LIST-1050', 'Bengaluru', 'Casagrand Orlena', 'RESIDENTIAL', '3BHK', 1600, 8320000.00, 5200.00, 'SCENARIO-RERA-1050', TRUE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9002, 1001, 'LIST-1002', 'Chennai', 'Casagrand Lanterns Court', 'RESIDENTIAL', '3BHK', 1450, 8555000.00, 5900.00, 'SCENARIO-RERA-1002', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9003, 1002, 'LIST-1001', 'Chennai', 'Casagrand Pallagio', 'RESIDENTIAL', '4BHK', 2634, 15541000.00, 5900.15, 'SCENARIO-RERA-1001', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9004, 1002, 'LIST-1003', 'Chennai', 'Casagrand Savoye', 'RESIDENTIAL', '3BHK', 1650, 10890000.00, 6600.00, 'SCENARIO-RERA-1003', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9005, 1003, 'LIST-1002', 'Chennai', 'Casagrand Lanterns Court', 'RESIDENTIAL', '3BHK', 1450, 9570000.00, 6600.00, 'SCENARIO-RERA-1002', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9006, 1003, 'LIST-1004', 'Chennai', 'Casagrand Bloom', 'RESIDENTIAL', '3BHK', 1700, 12410000.00, 7300.00, 'TN/01/Layout/0018/2019', TRUE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9007, 1004, 'LIST-1003', 'Chennai', 'Casagrand Savoye', 'RESIDENTIAL', '3BHK', 1650, 12045000.00, 7300.00, 'SCENARIO-RERA-1003', TRUE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9008, 1004, 'LIST-1005', 'Chennai', 'Casagrand Westend', 'LAND', 'LAND', 20000, 160000000.00, 8000.00, 'SCENARIO-RERA-1005', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9009, 1005, 'LIST-1004', 'Chennai', 'Casagrand Bloom', 'RESIDENTIAL', '3BHK', 1700, 13600000.00, 8000.00, 'TN/01/Layout/0018/2019', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9010, 1005, 'LIST-1006', 'Bengaluru', 'Casagrand Royce', 'RESIDENTIAL', '3BHK', 1600, 13920000.00, 8700.00, 'SCENARIO-RERA-1006', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9011, 1006, 'LIST-1005', 'Chennai', 'Casagrand Westend', 'LAND', 'LAND', 20000, 174000000.00, 8700.00, 'SCENARIO-RERA-1005', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9012, 1006, 'LIST-1007', 'Coimbatore', 'Casagrand Verdant', 'RESIDENTIAL', '2BHK', 1250, 6500000.00, 5200.00, 'SCENARIO-RERA-1007', TRUE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9013, 1007, 'LIST-1006', 'Bengaluru', 'Casagrand Royce', 'RESIDENTIAL', '3BHK', 1600, 8320000.00, 5200.00, 'SCENARIO-RERA-1006', TRUE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9014, 1007, 'LIST-1008', 'Bengaluru', 'Casagrand Esmeralda', 'RESIDENTIAL', '3BHK', 1750, 10325000.00, 5900.00, 'SCENARIO-RERA-1008', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9015, 1008, 'LIST-1007', 'Coimbatore', 'Casagrand Verdant', 'RESIDENTIAL', '2BHK', 1250, 7375000.00, 5900.00, 'SCENARIO-RERA-1007', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9016, 1008, 'LIST-1009', 'Chennai', 'Casagrand Bellissimo', 'RESIDENTIAL', '3BHK', 1580, 10428000.00, 6600.00, 'TN/01/Building/0028/2017', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9017, 1009, 'LIST-1008', 'Bengaluru', 'Casagrand Esmeralda', 'RESIDENTIAL', '3BHK', 1750, 11550000.00, 6600.00, 'SCENARIO-RERA-1008', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9018, 1009, 'LIST-1010', 'Chennai', 'Casagrand Marina Bay', 'RESIDENTIAL', '3BHK', 1800, 13140000.00, 7300.00, 'SCENARIO-RERA-1010', TRUE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9019, 1010, 'LIST-1009', 'Chennai', 'Casagrand Bellissimo', 'RESIDENTIAL', '3BHK', 1580, 11534000.00, 7300.00, 'TN/01/Building/0028/2017', TRUE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9020, 1010, 'LIST-1011', 'Bengaluru', 'SOBHA OneWorld', 'RESIDENTIAL', '3BHK', 1850, 14800000.00, 8000.00, 'PRM/KA/RERA/1250/304/PR/080526/008634', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9021, 1011, 'LIST-1010', 'Chennai', 'Casagrand Marina Bay', 'RESIDENTIAL', '3BHK', 1800, 14400000.00, 8000.00, 'SCENARIO-RERA-1010', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9022, 1011, 'LIST-1012', 'Bengaluru', 'SOBHA Altair', 'RESIDENTIAL', '3BHK', 1800, 15660000.00, 8700.00, 'SCENARIO-RERA-1012', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9023, 1012, 'LIST-1011', 'Bengaluru', 'SOBHA OneWorld', 'RESIDENTIAL', '3BHK', 1850, 16095000.00, 8700.00, 'PRM/KA/RERA/1250/304/PR/080526/008634', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9024, 1012, 'LIST-1013', 'Bengaluru', 'SOBHA Townpark', 'RESIDENTIAL', '2BHK', 1350, 7020000.00, 5200.00, 'SCENARIO-RERA-1013', TRUE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9025, 1013, 'LIST-1012', 'Bengaluru', 'SOBHA Altair', 'RESIDENTIAL', '3BHK', 1800, 9360000.00, 5200.00, 'SCENARIO-RERA-1012', TRUE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9026, 1013, 'LIST-1014', 'Bengaluru', 'SOBHA Neopolis', 'RESIDENTIAL', '3BHK', 2100, 12390000.00, 5900.00, 'SCENARIO-RERA-1014', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9027, 1014, 'LIST-1013', 'Bengaluru', 'SOBHA Townpark', 'RESIDENTIAL', '2BHK', 1350, 7965000.00, 5900.00, 'SCENARIO-RERA-1013', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9028, 1014, 'LIST-1015', 'Bengaluru', 'SOBHA Ayana', 'RESIDENTIAL', '2BHK', 1450, 9570000.00, 6600.00, 'SCENARIO-RERA-1015', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9029, 1015, 'LIST-1014', 'Bengaluru', 'SOBHA Neopolis', 'RESIDENTIAL', '3BHK', 2100, 13860000.00, 6600.00, 'SCENARIO-RERA-1014', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9030, 1015, 'LIST-1016', 'Bengaluru', 'SOBHA Infinia', 'RESIDENTIAL', '3BHK', 2200, 16060000.00, 7300.00, 'SCENARIO-RERA-1016', TRUE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9031, 1016, 'LIST-1015', 'Bengaluru', 'SOBHA Ayana', 'RESIDENTIAL', '2BHK', 1450, 10585000.00, 7300.00, 'SCENARIO-RERA-1015', TRUE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9032, 1016, 'LIST-1017', 'Bengaluru', 'SOBHA Magnus', 'RESIDENTIAL', '3BHK', 1900, 15200000.00, 8000.00, 'SCENARIO-RERA-1017', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9033, 1017, 'LIST-1016', 'Bengaluru', 'SOBHA Infinia', 'RESIDENTIAL', '3BHK', 2200, 17600000.00, 8000.00, 'SCENARIO-RERA-1016', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9034, 1017, 'LIST-1018', 'Bengaluru', 'SOBHA Galera', 'RESIDENTIAL', '3BHK', 1700, 14790000.00, 8700.00, 'SCENARIO-RERA-1018', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9035, 1018, 'LIST-1017', 'Bengaluru', 'SOBHA Magnus', 'RESIDENTIAL', '3BHK', 1900, 16530000.00, 8700.00, 'SCENARIO-RERA-1017', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9036, 1018, 'LIST-1019', 'Bengaluru', 'SOBHA Valley View', 'RESIDENTIAL', '3BHK', 1650, 8580000.00, 5200.00, 'SCENARIO-RERA-1019', TRUE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9037, 1019, 'LIST-1018', 'Bengaluru', 'SOBHA Galera', 'RESIDENTIAL', '3BHK', 1700, 8840000.00, 5200.00, 'SCENARIO-RERA-1018', TRUE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9038, 1019, 'LIST-1020', 'Bengaluru', 'SOBHA Insignia', 'RESIDENTIAL', '4BHK', 2400, 14160000.00, 5900.00, 'SCENARIO-RERA-1020', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9039, 1020, 'LIST-1019', 'Bengaluru', 'SOBHA Valley View', 'RESIDENTIAL', '3BHK', 1650, 9735000.00, 5900.00, 'SCENARIO-RERA-1019', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9040, 1020, 'LIST-1021', 'Bengaluru', 'SOBHA Oakshire', 'RESIDENTIAL', '3BHK', 1850, 12210000.00, 6600.00, 'SCENARIO-RERA-1021', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9041, 1021, 'LIST-1020', 'Bengaluru', 'SOBHA Insignia', 'RESIDENTIAL', '4BHK', 2400, 15840000.00, 6600.00, 'SCENARIO-RERA-1020', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9042, 1021, 'LIST-1022', 'Bengaluru', 'SOBHA Dream Gardens', 'RESIDENTIAL', '2BHK', 1200, 8760000.00, 7300.00, 'SCENARIO-RERA-1022', TRUE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9043, 1022, 'LIST-1021', 'Bengaluru', 'SOBHA Oakshire', 'RESIDENTIAL', '3BHK', 1850, 13505000.00, 7300.00, 'SCENARIO-RERA-1021', TRUE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9044, 1022, 'LIST-1023', 'Bengaluru', 'SOBHA Palm Court', 'RESIDENTIAL', '3BHK', 1700, 13600000.00, 8000.00, 'SCENARIO-RERA-1023', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9045, 1023, 'LIST-1022', 'Bengaluru', 'SOBHA Dream Gardens', 'RESIDENTIAL', '2BHK', 1200, 9600000.00, 8000.00, 'SCENARIO-RERA-1022', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9046, 1023, 'LIST-1024', 'Bengaluru', 'SOBHA Lifestyle Legacy', 'RESIDENTIAL', '4BHK', 2600, 22620000.00, 8700.00, 'SCENARIO-RERA-1024', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9047, 1024, 'LIST-1023', 'Bengaluru', 'SOBHA Palm Court', 'RESIDENTIAL', '3BHK', 1700, 14790000.00, 8700.00, 'SCENARIO-RERA-1023', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9048, 1024, 'LIST-1025', 'Bengaluru', 'SOBHA Royal Pavilion', 'RESIDENTIAL', '3BHK', 1800, 9360000.00, 5200.00, 'SCENARIO-RERA-1025', TRUE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9049, 1025, 'LIST-1024', 'Bengaluru', 'SOBHA Lifestyle Legacy', 'RESIDENTIAL', '4BHK', 2600, 13520000.00, 5200.00, 'SCENARIO-RERA-1024', TRUE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9050, 1025, 'LIST-1026', 'Pune', 'Lodha Belmondo', 'RESIDENTIAL', '2BHK', 1500, 8850000.00, 5900.00, 'P52100020190', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9051, 1026, 'LIST-1025', 'Bengaluru', 'SOBHA Royal Pavilion', 'RESIDENTIAL', '3BHK', 1800, 10620000.00, 5900.00, 'SCENARIO-RERA-1025', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9052, 1026, 'LIST-1027', 'Pune', 'Godrej Park Springs', 'RESIDENTIAL', '3BHK', 1450, 9570000.00, 6600.00, 'SCENARIO-RERA-1027', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9053, 1027, 'LIST-1026', 'Pune', 'Lodha Belmondo', 'RESIDENTIAL', '2BHK', 1500, 9900000.00, 6600.00, 'P52100020190', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9054, 1027, 'LIST-1028', 'Pune', 'Godrej Green Vistas', 'RESIDENTIAL', '3BHK', 1550, 11315000.00, 7300.00, 'SCENARIO-RERA-1028', TRUE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9055, 1028, 'LIST-1027', 'Pune', 'Godrej Park Springs', 'RESIDENTIAL', '3BHK', 1450, 10585000.00, 7300.00, 'SCENARIO-RERA-1027', TRUE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9056, 1028, 'LIST-1029', 'Pune', 'Godrej Green Cove', 'RESIDENTIAL', '2BHK', 1250, 10000000.00, 8000.00, 'SCENARIO-RERA-1029', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9057, 1029, 'LIST-1028', 'Pune', 'Godrej Green Vistas', 'RESIDENTIAL', '3BHK', 1550, 12400000.00, 8000.00, 'SCENARIO-RERA-1028', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9058, 1029, 'LIST-1030', 'Pune', 'Lodha Giardino', 'RESIDENTIAL', '3BHK', 1750, 15225000.00, 8700.00, 'SCENARIO-RERA-1030', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9059, 1030, 'LIST-1029', 'Pune', 'Godrej Green Cove', 'RESIDENTIAL', '2BHK', 1250, 10875000.00, 8700.00, 'SCENARIO-RERA-1029', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9060, 1030, 'LIST-1031', 'Pune', 'Lodha One', 'RESIDENTIAL', '3BHK', 2100, 10920000.00, 5200.00, 'SCENARIO-RERA-1031', TRUE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9061, 1031, 'LIST-1030', 'Pune', 'Lodha Giardino', 'RESIDENTIAL', '3BHK', 1750, 9100000.00, 5200.00, 'SCENARIO-RERA-1030', TRUE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9062, 1031, 'LIST-1032', 'Pune', 'Godrej Nurture', 'RESIDENTIAL', '2BHK', 1300, 7670000.00, 5900.00, 'SCENARIO-RERA-1032', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9063, 1032, 'LIST-1031', 'Pune', 'Lodha One', 'RESIDENTIAL', '3BHK', 2100, 12390000.00, 5900.00, 'SCENARIO-RERA-1031', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9064, 1032, 'LIST-1033', 'Pune', 'Life Republic', 'RESIDENTIAL', '2BHK', 1200, 7920000.00, 6600.00, 'SCENARIO-RERA-1033', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9065, 1033, 'LIST-1032', 'Pune', 'Godrej Nurture', 'RESIDENTIAL', '2BHK', 1300, 8580000.00, 6600.00, 'SCENARIO-RERA-1032', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9066, 1033, 'LIST-1034', 'Pune', 'Three Jewels', 'RESIDENTIAL', '2BHK', 1150, 8395000.00, 7300.00, 'SCENARIO-RERA-1034', TRUE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9067, 1034, 'LIST-1033', 'Pune', 'Life Republic', 'RESIDENTIAL', '2BHK', 1200, 8760000.00, 7300.00, 'SCENARIO-RERA-1033', TRUE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9068, 1034, 'LIST-1035', 'Pune', 'Little Earth', 'RESIDENTIAL', '2BHK', 1100, 8800000.00, 8000.00, 'SCENARIO-RERA-1035', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9069, 1035, 'LIST-1034', 'Pune', 'Three Jewels', 'RESIDENTIAL', '2BHK', 1150, 9200000.00, 8000.00, 'SCENARIO-RERA-1034', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9070, 1035, 'LIST-1036', 'Mumbai', 'Lodha Bellevue', 'RESIDENTIAL', '3BHK', 2100, 18270000.00, 8700.00, 'P51900046567', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9071, 1036, 'LIST-1035', 'Pune', 'Little Earth', 'RESIDENTIAL', '2BHK', 1100, 9570000.00, 8700.00, 'SCENARIO-RERA-1035', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9072, 1036, 'LIST-1037', 'Mumbai', 'Lodha World One', 'RESIDENTIAL', '3BHK', 2600, 13520000.00, 5200.00, 'SCENARIO-RERA-1037', TRUE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9073, 1037, 'LIST-1036', 'Mumbai', 'Lodha Bellevue', 'RESIDENTIAL', '3BHK', 2100, 10920000.00, 5200.00, 'P51900046567', TRUE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9074, 1037, 'LIST-1038', 'Mumbai', 'Lodha Vista', 'RESIDENTIAL', '3BHK', 1900, 11210000.00, 5900.00, 'SCENARIO-RERA-1038', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9075, 1038, 'LIST-1037', 'Mumbai', 'Lodha World One', 'RESIDENTIAL', '3BHK', 2600, 15340000.00, 5900.00, 'SCENARIO-RERA-1037', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9076, 1038, 'LIST-1039', 'Mumbai', 'Lodha New Cuffe Parade', 'RESIDENTIAL', '2BHK', 1400, 9240000.00, 6600.00, 'SCENARIO-RERA-1039', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9077, 1039, 'LIST-1038', 'Mumbai', 'Lodha Vista', 'RESIDENTIAL', '3BHK', 1900, 12540000.00, 6600.00, 'SCENARIO-RERA-1038', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9078, 1039, 'LIST-1040', 'Mumbai', 'Lodha Worli', 'RESIDENTIAL', '3BHK', 2300, 16790000.00, 7300.00, 'SCENARIO-RERA-1040', TRUE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9079, 1040, 'LIST-1039', 'Mumbai', 'Lodha New Cuffe Parade', 'RESIDENTIAL', '2BHK', 1400, 10220000.00, 7300.00, 'SCENARIO-RERA-1039', TRUE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9080, 1040, 'LIST-1041', 'Chennai', 'Casagrand Novus', 'RESIDENTIAL', '3BHK', 1450, 11600000.00, 8000.00, 'SCENARIO-RERA-1041', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9081, 1041, 'LIST-1040', 'Mumbai', 'Lodha Worli', 'RESIDENTIAL', '3BHK', 2300, 18400000.00, 8000.00, 'SCENARIO-RERA-1040', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9082, 1041, 'LIST-1042', 'Chennai', 'Casagrand Tulipso', 'RESIDENTIAL', '3BHK', 1550, 13485000.00, 8700.00, 'SCENARIO-RERA-1042', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9083, 1042, 'LIST-1041', 'Chennai', 'Casagrand Novus', 'RESIDENTIAL', '3BHK', 1450, 12615000.00, 8700.00, 'SCENARIO-RERA-1041', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9084, 1042, 'LIST-1043', 'Chennai', 'Casagrand Senate', 'RESIDENTIAL', '2BHK', 1300, 6760000.00, 5200.00, 'SCENARIO-RERA-1043', TRUE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9085, 1043, 'LIST-1042', 'Chennai', 'Casagrand Tulipso', 'RESIDENTIAL', '3BHK', 1550, 8060000.00, 5200.00, 'SCENARIO-RERA-1042', TRUE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9086, 1043, 'LIST-1044', 'Sriperumbudur', 'Casagrand Futura', 'RESIDENTIAL', '3BHK', 1800, 10620000.00, 5900.00, 'SCENARIO-RERA-1044', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9087, 1044, 'LIST-1043', 'Chennai', 'Casagrand Senate', 'RESIDENTIAL', '2BHK', 1300, 7670000.00, 5900.00, 'SCENARIO-RERA-1043', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9088, 1044, 'LIST-1045', 'Chennai', 'Casagrand White Oak', 'RESIDENTIAL', '3BHK', 1600, 10560000.00, 6600.00, 'SCENARIO-RERA-1045', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9089, 1045, 'LIST-1044', 'Sriperumbudur', 'Casagrand Futura', 'RESIDENTIAL', '3BHK', 1800, 11880000.00, 6600.00, 'SCENARIO-RERA-1044', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9090, 1045, 'LIST-1046', 'Chennai', 'Casagrand Maple', 'RESIDENTIAL', '3BHK', 1500, 10950000.00, 7300.00, 'SCENARIO-RERA-1046', TRUE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9091, 1046, 'LIST-1045', 'Chennai', 'Casagrand White Oak', 'RESIDENTIAL', '3BHK', 1600, 11680000.00, 7300.00, 'SCENARIO-RERA-1045', TRUE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9092, 1046, 'LIST-1047', 'Chennai', 'Casagrand Trinity', 'RESIDENTIAL', '2BHK', 1250, 10000000.00, 8000.00, 'SCENARIO-RERA-1047', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9093, 1047, 'LIST-1046', 'Chennai', 'Casagrand Maple', 'RESIDENTIAL', '3BHK', 1500, 12000000.00, 8000.00, 'SCENARIO-RERA-1046', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9094, 1047, 'LIST-1048', 'Chennai', 'Casagrand Olympus', 'RESIDENTIAL', '3BHK', 1650, 14355000.00, 8700.00, 'SCENARIO-RERA-1048', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9095, 1048, 'LIST-1047', 'Chennai', 'Casagrand Trinity', 'RESIDENTIAL', '2BHK', 1250, 10875000.00, 8700.00, 'SCENARIO-RERA-1047', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9096, 1048, 'LIST-1049', 'Bengaluru', 'Casagrand Boulevard', 'RESIDENTIAL', '3BHK', 1750, 9100000.00, 5200.00, 'SCENARIO-RERA-1049', TRUE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9097, 1049, 'LIST-1048', 'Chennai', 'Casagrand Olympus', 'RESIDENTIAL', '3BHK', 1650, 8580000.00, 5200.00, 'SCENARIO-RERA-1048', TRUE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9098, 1049, 'LIST-1050', 'Bengaluru', 'Casagrand Orlena', 'RESIDENTIAL', '3BHK', 1600, 9440000.00, 5900.00, 'SCENARIO-RERA-1050', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9099, 1050, 'LIST-1049', 'Bengaluru', 'Casagrand Boulevard', 'RESIDENTIAL', '3BHK', 1750, 10325000.00, 5900.00, 'SCENARIO-RERA-1049', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00'),
(9100, 1050, 'LIST-1001', 'Chennai', 'Casagrand Pallagio', 'RESIDENTIAL', '4BHK', 2634, 17384000.00, 6599.85, 'SCENARIO-RERA-1001', FALSE, 'PROPERTY_COMPARABLE_SCENARIO', TIMESTAMP '2026-09-22 10:00:00')
ON CONFLICT DO NOTHING;

INSERT INTO risk_assessment_details
(risk_assessment_id, property_id, tax_risk, legal_risk, flood_risk, permit_compliance, zoning_compliance, ownership_verification, overall_score, assessed_at)
VALUES
(10001, 1001, 5.00, 10.00, 5.00, 10.00, 5.00, 10.00, 7.75, TIMESTAMP '2026-09-22 10:05:00'),
(10002, 1002, 10.00, 15.00, 10.00, 10.00, 5.00, 10.00, 10.50, TIMESTAMP '2026-09-22 10:05:00'),
(10003, 1003, 35.00, 35.00, 35.00, 25.00, 20.00, 25.00, 29.75, TIMESTAMP '2026-09-22 10:05:00'),
(10004, 1004, 75.00, 45.00, 75.00, 45.00, 45.00, 35.00, 52.50, TIMESTAMP '2026-09-22 10:05:00'),
(10005, 1005, 5.00, 80.00, 50.00, 60.00, 85.00, 70.00, 60.50, TIMESTAMP '2026-09-22 10:05:00'),
(10006, 1006, 5.00, 10.00, 5.00, 10.00, 5.00, 10.00, 7.75, TIMESTAMP '2026-09-22 10:05:00'),
(10007, 1007, 10.00, 15.00, 10.00, 10.00, 5.00, 10.00, 10.50, TIMESTAMP '2026-09-22 10:05:00'),
(10008, 1008, 35.00, 35.00, 35.00, 25.00, 20.00, 25.00, 29.75, TIMESTAMP '2026-09-22 10:05:00'),
(10009, 1009, 75.00, 45.00, 75.00, 45.00, 45.00, 35.00, 52.50, TIMESTAMP '2026-09-22 10:05:00'),
(10010, 1010, 5.00, 80.00, 50.00, 60.00, 85.00, 70.00, 60.50, TIMESTAMP '2026-09-22 10:05:00'),
(10011, 1011, 5.00, 10.00, 5.00, 10.00, 5.00, 10.00, 7.75, TIMESTAMP '2026-09-22 10:05:00'),
(10012, 1012, 10.00, 15.00, 10.00, 10.00, 5.00, 10.00, 10.50, TIMESTAMP '2026-09-22 10:05:00'),
(10013, 1013, 35.00, 35.00, 35.00, 25.00, 20.00, 25.00, 29.75, TIMESTAMP '2026-09-22 10:05:00'),
(10014, 1014, 75.00, 45.00, 75.00, 45.00, 45.00, 35.00, 52.50, TIMESTAMP '2026-09-22 10:05:00'),
(10015, 1015, 5.00, 80.00, 50.00, 60.00, 85.00, 70.00, 60.50, TIMESTAMP '2026-09-22 10:05:00'),
(10016, 1016, 5.00, 10.00, 5.00, 10.00, 5.00, 10.00, 7.75, TIMESTAMP '2026-09-22 10:05:00'),
(10017, 1017, 10.00, 15.00, 10.00, 10.00, 5.00, 10.00, 10.50, TIMESTAMP '2026-09-22 10:05:00'),
(10018, 1018, 35.00, 35.00, 35.00, 25.00, 20.00, 25.00, 29.75, TIMESTAMP '2026-09-22 10:05:00'),
(10019, 1019, 75.00, 45.00, 75.00, 45.00, 45.00, 35.00, 52.50, TIMESTAMP '2026-09-22 10:05:00'),
(10020, 1020, 5.00, 80.00, 50.00, 60.00, 85.00, 70.00, 60.50, TIMESTAMP '2026-09-22 10:05:00'),
(10021, 1021, 5.00, 10.00, 5.00, 10.00, 5.00, 10.00, 7.75, TIMESTAMP '2026-09-22 10:05:00'),
(10022, 1022, 10.00, 15.00, 10.00, 10.00, 5.00, 10.00, 10.50, TIMESTAMP '2026-09-22 10:05:00'),
(10023, 1023, 35.00, 35.00, 35.00, 25.00, 20.00, 25.00, 29.75, TIMESTAMP '2026-09-22 10:05:00'),
(10024, 1024, 75.00, 45.00, 75.00, 45.00, 45.00, 35.00, 52.50, TIMESTAMP '2026-09-22 10:05:00'),
(10025, 1025, 5.00, 80.00, 50.00, 60.00, 85.00, 70.00, 60.50, TIMESTAMP '2026-09-22 10:05:00'),
(10026, 1026, 5.00, 10.00, 5.00, 10.00, 5.00, 10.00, 7.75, TIMESTAMP '2026-09-22 10:05:00'),
(10027, 1027, 10.00, 15.00, 10.00, 10.00, 5.00, 10.00, 10.50, TIMESTAMP '2026-09-22 10:05:00'),
(10028, 1028, 35.00, 35.00, 35.00, 25.00, 20.00, 25.00, 29.75, TIMESTAMP '2026-09-22 10:05:00'),
(10029, 1029, 75.00, 45.00, 75.00, 45.00, 45.00, 35.00, 52.50, TIMESTAMP '2026-09-22 10:05:00'),
(10030, 1030, 5.00, 80.00, 50.00, 60.00, 85.00, 70.00, 60.50, TIMESTAMP '2026-09-22 10:05:00'),
(10031, 1031, 5.00, 10.00, 5.00, 10.00, 5.00, 10.00, 7.75, TIMESTAMP '2026-09-22 10:05:00'),
(10032, 1032, 10.00, 15.00, 10.00, 10.00, 5.00, 10.00, 10.50, TIMESTAMP '2026-09-22 10:05:00'),
(10033, 1033, 35.00, 35.00, 35.00, 25.00, 20.00, 25.00, 29.75, TIMESTAMP '2026-09-22 10:05:00'),
(10034, 1034, 75.00, 45.00, 75.00, 45.00, 45.00, 35.00, 52.50, TIMESTAMP '2026-09-22 10:05:00'),
(10035, 1035, 5.00, 80.00, 50.00, 60.00, 85.00, 70.00, 60.50, TIMESTAMP '2026-09-22 10:05:00'),
(10036, 1036, 5.00, 10.00, 5.00, 10.00, 5.00, 10.00, 7.75, TIMESTAMP '2026-09-22 10:05:00'),
(10037, 1037, 10.00, 15.00, 10.00, 10.00, 5.00, 10.00, 10.50, TIMESTAMP '2026-09-22 10:05:00'),
(10038, 1038, 35.00, 35.00, 35.00, 25.00, 20.00, 25.00, 29.75, TIMESTAMP '2026-09-22 10:05:00'),
(10039, 1039, 75.00, 45.00, 75.00, 45.00, 45.00, 35.00, 52.50, TIMESTAMP '2026-09-22 10:05:00'),
(10040, 1040, 5.00, 80.00, 50.00, 60.00, 85.00, 70.00, 60.50, TIMESTAMP '2026-09-22 10:05:00'),
(10041, 1041, 5.00, 10.00, 5.00, 10.00, 5.00, 10.00, 7.75, TIMESTAMP '2026-09-22 10:05:00'),
(10042, 1042, 10.00, 15.00, 10.00, 10.00, 5.00, 10.00, 10.50, TIMESTAMP '2026-09-22 10:05:00'),
(10043, 1043, 35.00, 35.00, 35.00, 25.00, 20.00, 25.00, 29.75, TIMESTAMP '2026-09-22 10:05:00'),
(10044, 1044, 75.00, 45.00, 75.00, 45.00, 45.00, 35.00, 52.50, TIMESTAMP '2026-09-22 10:05:00'),
(10045, 1045, 5.00, 80.00, 50.00, 60.00, 85.00, 70.00, 60.50, TIMESTAMP '2026-09-22 10:05:00'),
(10046, 1046, 5.00, 10.00, 5.00, 10.00, 5.00, 10.00, 7.75, TIMESTAMP '2026-09-22 10:05:00'),
(10047, 1047, 10.00, 15.00, 10.00, 10.00, 5.00, 10.00, 10.50, TIMESTAMP '2026-09-22 10:05:00'),
(10048, 1048, 35.00, 35.00, 35.00, 25.00, 20.00, 25.00, 29.75, TIMESTAMP '2026-09-22 10:05:00'),
(10049, 1049, 75.00, 45.00, 75.00, 45.00, 45.00, 35.00, 52.50, TIMESTAMP '2026-09-22 10:05:00'),
(10050, 1050, 5.00, 80.00, 50.00, 60.00, 85.00, 70.00, 60.50, TIMESTAMP '2026-09-22 10:05:00')
ON CONFLICT DO NOTHING;

INSERT INTO due_diligence_reports
(report_id, property_id, generated_by, risk_assessment_id, executive_summary, status, generated_at, updated_at)
SELECT x.report_id, x.property_id,
       (SELECT user_id FROM users WHERE email = 'admin@example.com'),
       x.risk_assessment_id, x.executive_summary, 'COMPLETED',
       TIMESTAMP '2026-09-22 10:10:00', TIMESTAMP '2026-09-22 10:10:00'
FROM (

SELECT 11001 report_id, 1001 property_id, 10001 risk_assessment_id, 'Casagrand Pallagio — scenario assessment indicates Low demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11002 report_id, 1002 property_id, 10002 risk_assessment_id, 'Casagrand Lanterns Court — scenario assessment indicates Moderate demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11003 report_id, 1003 property_id, 10003 risk_assessment_id, 'Casagrand Savoye — scenario assessment indicates Elevated demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11004 report_id, 1004 property_id, 10004 risk_assessment_id, 'Casagrand Bloom — scenario assessment indicates High demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11005 report_id, 1005 property_id, 10005 risk_assessment_id, 'Casagrand Westend — scenario assessment indicates Moderate demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11006 report_id, 1006 property_id, 10006 risk_assessment_id, 'Casagrand Royce — scenario assessment indicates Low demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11007 report_id, 1007 property_id, 10007 risk_assessment_id, 'Casagrand Verdant — scenario assessment indicates Moderate demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11008 report_id, 1008 property_id, 10008 risk_assessment_id, 'Casagrand Esmeralda — scenario assessment indicates Elevated demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11009 report_id, 1009 property_id, 10009 risk_assessment_id, 'Casagrand Bellissimo — scenario assessment indicates High demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11010 report_id, 1010 property_id, 10010 risk_assessment_id, 'Casagrand Marina Bay — scenario assessment indicates Moderate demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11011 report_id, 1011 property_id, 10011 risk_assessment_id, 'SOBHA OneWorld — scenario assessment indicates Low demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11012 report_id, 1012 property_id, 10012 risk_assessment_id, 'SOBHA Altair — scenario assessment indicates Moderate demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11013 report_id, 1013 property_id, 10013 risk_assessment_id, 'SOBHA Townpark — scenario assessment indicates Elevated demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11014 report_id, 1014 property_id, 10014 risk_assessment_id, 'SOBHA Neopolis — scenario assessment indicates High demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11015 report_id, 1015 property_id, 10015 risk_assessment_id, 'SOBHA Ayana — scenario assessment indicates Moderate demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11016 report_id, 1016 property_id, 10016 risk_assessment_id, 'SOBHA Infinia — scenario assessment indicates Low demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11017 report_id, 1017 property_id, 10017 risk_assessment_id, 'SOBHA Magnus — scenario assessment indicates Moderate demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11018 report_id, 1018 property_id, 10018 risk_assessment_id, 'SOBHA Galera — scenario assessment indicates Elevated demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11019 report_id, 1019 property_id, 10019 risk_assessment_id, 'SOBHA Valley View — scenario assessment indicates High demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11020 report_id, 1020 property_id, 10020 risk_assessment_id, 'SOBHA Insignia — scenario assessment indicates Moderate demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11021 report_id, 1021 property_id, 10021 risk_assessment_id, 'SOBHA Oakshire — scenario assessment indicates Low demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11022 report_id, 1022 property_id, 10022 risk_assessment_id, 'SOBHA Dream Gardens — scenario assessment indicates Moderate demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11023 report_id, 1023 property_id, 10023 risk_assessment_id, 'SOBHA Palm Court — scenario assessment indicates Elevated demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11024 report_id, 1024 property_id, 10024 risk_assessment_id, 'SOBHA Lifestyle Legacy — scenario assessment indicates High demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11025 report_id, 1025 property_id, 10025 risk_assessment_id, 'SOBHA Royal Pavilion — scenario assessment indicates Moderate demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11026 report_id, 1026 property_id, 10026 risk_assessment_id, 'Lodha Belmondo — scenario assessment indicates Low demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11027 report_id, 1027 property_id, 10027 risk_assessment_id, 'Godrej Park Springs — scenario assessment indicates Moderate demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11028 report_id, 1028 property_id, 10028 risk_assessment_id, 'Godrej Green Vistas — scenario assessment indicates Elevated demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11029 report_id, 1029 property_id, 10029 risk_assessment_id, 'Godrej Green Cove — scenario assessment indicates High demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11030 report_id, 1030 property_id, 10030 risk_assessment_id, 'Lodha Giardino — scenario assessment indicates Moderate demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11031 report_id, 1031 property_id, 10031 risk_assessment_id, 'Lodha One — scenario assessment indicates Low demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11032 report_id, 1032 property_id, 10032 risk_assessment_id, 'Godrej Nurture — scenario assessment indicates Moderate demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11033 report_id, 1033 property_id, 10033 risk_assessment_id, 'Life Republic — scenario assessment indicates Elevated demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11034 report_id, 1034 property_id, 10034 risk_assessment_id, 'Three Jewels — scenario assessment indicates High demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11035 report_id, 1035 property_id, 10035 risk_assessment_id, 'Little Earth — scenario assessment indicates Moderate demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11036 report_id, 1036 property_id, 10036 risk_assessment_id, 'Lodha Bellevue — scenario assessment indicates Low demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11037 report_id, 1037 property_id, 10037 risk_assessment_id, 'Lodha World One — scenario assessment indicates Moderate demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11038 report_id, 1038 property_id, 10038 risk_assessment_id, 'Lodha Vista — scenario assessment indicates Elevated demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11039 report_id, 1039 property_id, 10039 risk_assessment_id, 'Lodha New Cuffe Parade — scenario assessment indicates High demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11040 report_id, 1040 property_id, 10040 risk_assessment_id, 'Lodha Worli — scenario assessment indicates Moderate demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11041 report_id, 1041 property_id, 10041 risk_assessment_id, 'Casagrand Novus — scenario assessment indicates Low demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11042 report_id, 1042 property_id, 10042 risk_assessment_id, 'Casagrand Tulipso — scenario assessment indicates Moderate demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11043 report_id, 1043 property_id, 10043 risk_assessment_id, 'Casagrand Senate — scenario assessment indicates Elevated demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11044 report_id, 1044 property_id, 10044 risk_assessment_id, 'Casagrand Futura — scenario assessment indicates High demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11045 report_id, 1045 property_id, 10045 risk_assessment_id, 'Casagrand White Oak — scenario assessment indicates Moderate demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11046 report_id, 1046 property_id, 10046 risk_assessment_id, 'Casagrand Maple — scenario assessment indicates Low demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11047 report_id, 1047 property_id, 10047 risk_assessment_id, 'Casagrand Trinity — scenario assessment indicates Moderate demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11048 report_id, 1048 property_id, 10048 risk_assessment_id, 'Casagrand Olympus — scenario assessment indicates Elevated demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11049 report_id, 1049 property_id, 10049 risk_assessment_id, 'Casagrand Boulevard — scenario assessment indicates High demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
UNION ALL
SELECT 11050 report_id, 1050 property_id, 10050 risk_assessment_id, 'Casagrand Orlena — scenario assessment indicates Moderate demonstration risk. Review ownership, tax, permit, zoning, flood and environmental records before relying on the result.' executive_summary
) x
ON CONFLICT DO NOTHING;

INSERT INTO property_history
(history_id, property_id, ownership_id, tax_id, permit_id, zoning_id, flood_zone_id, environmental_id, utility_id, captured_at)
VALUES
(12001, 1001, 2001, 3001, 8001, 4001, 5001, 6001, 7001, TIMESTAMP '2026-09-22 10:00:00'),
(12002, 1002, 2002, 3002, 8002, 4002, 5002, 6002, 7004, TIMESTAMP '2026-09-22 10:00:00'),
(12003, 1003, 2003, 3003, 8003, 4003, 5003, 6003, 7007, TIMESTAMP '2026-09-22 10:00:00'),
(12004, 1004, 2004, 3004, 8004, 4004, 5004, 6004, 7010, TIMESTAMP '2026-09-22 10:00:00'),
(12005, 1005, 2005, 3005, 8005, 4005, 5005, 6005, 7013, TIMESTAMP '2026-09-22 10:00:00'),
(12006, 1006, 2006, 3006, 8006, 4006, 5006, 6006, 7016, TIMESTAMP '2026-09-22 10:00:00'),
(12007, 1007, 2007, 3007, 8007, 4007, 5007, 6007, 7019, TIMESTAMP '2026-09-22 10:00:00'),
(12008, 1008, 2008, 3008, 8008, 4008, 5008, 6008, 7022, TIMESTAMP '2026-09-22 10:00:00'),
(12009, 1009, 2009, 3009, 8009, 4009, 5009, 6009, 7025, TIMESTAMP '2026-09-22 10:00:00'),
(12010, 1010, 2010, 3010, 8010, 4010, 5010, 6010, 7028, TIMESTAMP '2026-09-22 10:00:00'),
(12011, 1011, 2011, 3011, 8011, 4011, 5011, 6011, 7031, TIMESTAMP '2026-09-22 10:00:00'),
(12012, 1012, 2012, 3012, 8012, 4012, 5012, 6012, 7034, TIMESTAMP '2026-09-22 10:00:00'),
(12013, 1013, 2013, 3013, 8013, 4013, 5013, 6013, 7037, TIMESTAMP '2026-09-22 10:00:00'),
(12014, 1014, 2014, 3014, 8014, 4014, 5014, 6014, 7040, TIMESTAMP '2026-09-22 10:00:00'),
(12015, 1015, 2015, 3015, 8015, 4015, 5015, 6015, 7043, TIMESTAMP '2026-09-22 10:00:00'),
(12016, 1016, 2016, 3016, 8016, 4016, 5016, 6016, 7046, TIMESTAMP '2026-09-22 10:00:00'),
(12017, 1017, 2017, 3017, 8017, 4017, 5017, 6017, 7049, TIMESTAMP '2026-09-22 10:00:00'),
(12018, 1018, 2018, 3018, 8018, 4018, 5018, 6018, 7052, TIMESTAMP '2026-09-22 10:00:00'),
(12019, 1019, 2019, 3019, 8019, 4019, 5019, 6019, 7055, TIMESTAMP '2026-09-22 10:00:00'),
(12020, 1020, 2020, 3020, 8020, 4020, 5020, 6020, 7058, TIMESTAMP '2026-09-22 10:00:00'),
(12021, 1021, 2021, 3021, 8021, 4021, 5021, 6021, 7061, TIMESTAMP '2026-09-22 10:00:00'),
(12022, 1022, 2022, 3022, 8022, 4022, 5022, 6022, 7064, TIMESTAMP '2026-09-22 10:00:00'),
(12023, 1023, 2023, 3023, 8023, 4023, 5023, 6023, 7067, TIMESTAMP '2026-09-22 10:00:00'),
(12024, 1024, 2024, 3024, 8024, 4024, 5024, 6024, 7070, TIMESTAMP '2026-09-22 10:00:00'),
(12025, 1025, 2025, 3025, 8025, 4025, 5025, 6025, 7073, TIMESTAMP '2026-09-22 10:00:00'),
(12026, 1026, 2026, 3026, 8026, 4026, 5026, 6026, 7076, TIMESTAMP '2026-09-22 10:00:00'),
(12027, 1027, 2027, 3027, 8027, 4027, 5027, 6027, 7079, TIMESTAMP '2026-09-22 10:00:00'),
(12028, 1028, 2028, 3028, 8028, 4028, 5028, 6028, 7082, TIMESTAMP '2026-09-22 10:00:00'),
(12029, 1029, 2029, 3029, 8029, 4029, 5029, 6029, 7085, TIMESTAMP '2026-09-22 10:00:00'),
(12030, 1030, 2030, 3030, 8030, 4030, 5030, 6030, 7088, TIMESTAMP '2026-09-22 10:00:00'),
(12031, 1031, 2031, 3031, 8031, 4031, 5031, 6031, 7091, TIMESTAMP '2026-09-22 10:00:00'),
(12032, 1032, 2032, 3032, 8032, 4032, 5032, 6032, 7094, TIMESTAMP '2026-09-22 10:00:00'),
(12033, 1033, 2033, 3033, 8033, 4033, 5033, 6033, 7097, TIMESTAMP '2026-09-22 10:00:00'),
(12034, 1034, 2034, 3034, 8034, 4034, 5034, 6034, 7100, TIMESTAMP '2026-09-22 10:00:00'),
(12035, 1035, 2035, 3035, 8035, 4035, 5035, 6035, 7103, TIMESTAMP '2026-09-22 10:00:00'),
(12036, 1036, 2036, 3036, 8036, 4036, 5036, 6036, 7106, TIMESTAMP '2026-09-22 10:00:00'),
(12037, 1037, 2037, 3037, 8037, 4037, 5037, 6037, 7109, TIMESTAMP '2026-09-22 10:00:00'),
(12038, 1038, 2038, 3038, 8038, 4038, 5038, 6038, 7112, TIMESTAMP '2026-09-22 10:00:00'),
(12039, 1039, 2039, 3039, 8039, 4039, 5039, 6039, 7115, TIMESTAMP '2026-09-22 10:00:00'),
(12040, 1040, 2040, 3040, 8040, 4040, 5040, 6040, 7118, TIMESTAMP '2026-09-22 10:00:00'),
(12041, 1041, 2041, 3041, 8041, 4041, 5041, 6041, 7121, TIMESTAMP '2026-09-22 10:00:00'),
(12042, 1042, 2042, 3042, 8042, 4042, 5042, 6042, 7124, TIMESTAMP '2026-09-22 10:00:00'),
(12043, 1043, 2043, 3043, 8043, 4043, 5043, 6043, 7127, TIMESTAMP '2026-09-22 10:00:00'),
(12044, 1044, 2044, 3044, 8044, 4044, 5044, 6044, 7130, TIMESTAMP '2026-09-22 10:00:00'),
(12045, 1045, 2045, 3045, 8045, 4045, 5045, 6045, 7133, TIMESTAMP '2026-09-22 10:00:00'),
(12046, 1046, 2046, 3046, 8046, 4046, 5046, 6046, 7136, TIMESTAMP '2026-09-22 10:00:00'),
(12047, 1047, 2047, 3047, 8047, 4047, 5047, 6047, 7139, TIMESTAMP '2026-09-22 10:00:00'),
(12048, 1048, 2048, 3048, 8048, 4048, 5048, 6048, 7142, TIMESTAMP '2026-09-22 10:00:00'),
(12049, 1049, 2049, 3049, 8049, 4049, 5049, 6049, 7145, TIMESTAMP '2026-09-22 10:00:00'),
(12050, 1050, 2050, 3050, 8050, 4050, 5050, 6050, 7148, TIMESTAMP '2026-09-22 10:00:00')
ON CONFLICT DO NOTHING;
INSERT INTO market_trends
(market_trend_id, city, locality, period, avg_price_per_sqft, supply_count, demand_pulse, source, retrieved_at)
VALUES
(13001, 'Chennai', 'OMR', '2024-Q4', 10300000.00, 50, 62.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13002, 'Chennai', 'OMR', '2025-Q4', 11000000.00, 47, 66.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13003, 'Chennai', 'OMR', '2026-Q3', 11700000.00, 44, 70.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13004, 'Chennai', 'Adyar', '2024-Q4', 10660000.00, 60, 62.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13005, 'Chennai', 'Adyar', '2025-Q4', 11360000.00, 57, 66.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13006, 'Chennai', 'Adyar', '2026-Q3', 12060000.00, 54, 70.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13007, 'Chennai', 'T. Nagar', '2024-Q4', 11200000.00, 40, 62.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13008, 'Chennai', 'T. Nagar', '2025-Q4', 11900000.00, 37, 66.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13009, 'Chennai', 'T. Nagar', '2026-Q3', 12600000.00, 34, 70.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13010, 'Bengaluru', 'Whitefield', '2024-Q4', 11920000.00, 50, 64.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13011, 'Bengaluru', 'Whitefield', '2025-Q4', 12620000.00, 47, 68.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13012, 'Bengaluru', 'Whitefield', '2026-Q3', 13320000.00, 44, 72.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13013, 'Bengaluru', 'Sarjapur', '2024-Q4', 11560000.00, 40, 64.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13014, 'Bengaluru', 'Sarjapur', '2025-Q4', 12260000.00, 37, 68.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13015, 'Bengaluru', 'Sarjapur', '2026-Q3', 12960000.00, 34, 72.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13016, 'Bengaluru', 'Thanisandra', '2024-Q4', 12100000.00, 55, 64.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13017, 'Bengaluru', 'Thanisandra', '2025-Q4', 12800000.00, 52, 68.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13018, 'Bengaluru', 'Thanisandra', '2026-Q3', 13500000.00, 49, 72.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13019, 'Pune', 'Hinjawadi', '2024-Q4', 10840000.00, 45, 59.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13020, 'Pune', 'Hinjawadi', '2025-Q4', 11540000.00, 42, 63.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13021, 'Pune', 'Hinjawadi', '2026-Q3', 12240000.00, 39, 67.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13022, 'Pune', 'Kharadi', '2024-Q4', 10480000.00, 35, 59.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13023, 'Pune', 'Kharadi', '2025-Q4', 11180000.00, 32, 63.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13024, 'Pune', 'Kharadi', '2026-Q3', 11880000.00, 29, 67.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13025, 'Pune', 'Mahalunge', '2024-Q4', 10840000.00, 45, 59.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13026, 'Pune', 'Mahalunge', '2025-Q4', 11540000.00, 42, 63.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13027, 'Pune', 'Mahalunge', '2026-Q3', 12240000.00, 39, 67.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13028, 'Mumbai', 'Mahalaxmi', '2024-Q4', 11200000.00, 45, 61.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13029, 'Mumbai', 'Mahalaxmi', '2025-Q4', 11900000.00, 42, 65.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13030, 'Mumbai', 'Mahalaxmi', '2026-Q3', 12600000.00, 39, 69.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13031, 'Mumbai', 'Worli', '2024-Q4', 10480000.00, 60, 61.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13032, 'Mumbai', 'Worli', '2025-Q4', 11180000.00, 57, 65.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13033, 'Mumbai', 'Worli', '2026-Q3', 11880000.00, 54, 69.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13034, 'Mumbai', 'Wadala', '2024-Q4', 10660000.00, 65, 61.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13035, 'Mumbai', 'Wadala', '2025-Q4', 11360000.00, 62, 65.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13036, 'Mumbai', 'Wadala', '2026-Q3', 12060000.00, 59, 69.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13037, 'Coimbatore', 'Vedapatti', '2024-Q4', 11920000.00, 45, 65.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13038, 'Coimbatore', 'Vedapatti', '2025-Q4', 12620000.00, 42, 69.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13039, 'Coimbatore', 'Vedapatti', '2026-Q3', 13320000.00, 39, 73.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13040, 'Coimbatore', 'Kurichi', '2024-Q4', 11560000.00, 35, 65.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13041, 'Coimbatore', 'Kurichi', '2025-Q4', 12260000.00, 32, 69.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13042, 'Coimbatore', 'Kurichi', '2026-Q3', 12960000.00, 29, 73.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13043, 'Sriperumbudur', 'Sriperumbudur', '2024-Q4', 13180000.00, 65, 68.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13044, 'Sriperumbudur', 'Sriperumbudur', '2025-Q4', 13880000.00, 62, 72.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00'),
(13045, 'Sriperumbudur', 'Sriperumbudur', '2026-Q3', 14580000.00, 59, 76.00, 'SEED_DATASET', TIMESTAMP '2026-09-22 10:00:00')
ON CONFLICT DO NOTHING;

-- Supporting documents, monitoring, notifications, activity_logs and api_logs are intentionally
-- not seeded: they represent runtime/user actions, stored files, monitoring state and telemetry.

-- Advance identity sequences past the seeded explicit IDs so runtime
-- inserts (nextval) never collide with the 1001+ seed range.
SELECT setval(pg_get_serial_sequence('property_details', 'property_id'),
              COALESCE((SELECT MAX(property_id) FROM property_details), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('ownership_details', 'ownership_id'),
              COALESCE((SELECT MAX(ownership_id) FROM ownership_details), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('tax_details', 'tax_id'),
              COALESCE((SELECT MAX(tax_id) FROM tax_details), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('zoning_details', 'zoning_id'),
              COALESCE((SELECT MAX(zoning_id) FROM zoning_details), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('flood_zone_details', 'flood_zone_id'),
              COALESCE((SELECT MAX(flood_zone_id) FROM flood_zone_details), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('environmental_details', 'environmental_id'),
              COALESCE((SELECT MAX(environmental_id) FROM environmental_details), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('utility_details', 'utility_id'),
              COALESCE((SELECT MAX(utility_id) FROM utility_details), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('building_permit_details', 'permit_id'),
              COALESCE((SELECT MAX(permit_id) FROM building_permit_details), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('comparable_property_details', 'comparable_id'),
              COALESCE((SELECT MAX(comparable_id) FROM comparable_property_details), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('risk_assessment_details', 'risk_assessment_id'),
              COALESCE((SELECT MAX(risk_assessment_id) FROM risk_assessment_details), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('due_diligence_reports', 'report_id'),
              COALESCE((SELECT MAX(report_id) FROM due_diligence_reports), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('property_history', 'history_id'),
              COALESCE((SELECT MAX(history_id) FROM property_history), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('market_trends', 'market_trend_id'),
              COALESCE((SELECT MAX(market_trend_id) FROM market_trends), 0) + 1, false);
