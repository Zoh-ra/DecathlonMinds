-- Connect to the database
\c decathlon_minds_db;

-- Insert sample walking routes
INSERT INTO walking_routes 
(name, description, difficulty_level, distance_meters, estimated_duration_minutes,
start_point_latitude, start_point_longitude, end_point_latitude, end_point_longitude,
elevation_gain_meters, route_type) VALUES
(
    'Parcours Zen du Parc',
    'Un parcours tranquille à travers un parc paisible, idéal pour la méditation en marchant',
    'LOW',
    2000,
    30,
    48.8566,
    2.3522,
    48.8580,
    2.3530,
    10,
    'PARK_TRAIL'
),
(
    'Circuit Énergisant Urbain',
    'Un parcours dynamique en milieu urbain avec plusieurs points d''intérêt',
    'MEDIUM',
    3500,
    45,
    48.8610,
    2.3500,
    48.8640,
    2.3550,
    25,
    'URBAN_TRAIL'
),
(
    'Sentier Nature Thérapeutique',
    'Une immersion dans la nature pour reconnecter corps et esprit',
    'MEDIUM',
    5000,
    75,
    48.8700,
    2.3400,
    48.8750,
    2.3450,
    50,
    'NATURE_TRAIL'
);

-- Insert emotional recommendations
INSERT INTO emotional_recommendations 
(emotion, intensity, route_id, recommendation_text, scientific_benefits, weather_conditions) 
VALUES
(
    'STRESSED',
    'HIGH',
    (SELECT id FROM walking_routes WHERE name = 'Parcours Zen du Parc'),
    'Ce parcours tranquille vous aidera à réduire votre niveau de stress grâce à son environnement calme et verdoyant',
    ARRAY['Réduction du cortisol', 'Augmentation de la sérotonine', 'Amélioration de la clarté mentale'],
    ARRAY['SUNNY', 'CLOUDY', 'LIGHT_RAIN']
),
(
    'ANXIOUS',
    'MEDIUM',
    (SELECT id FROM walking_routes WHERE name = 'Sentier Nature Thérapeutique'),
    'La connexion avec la nature sur ce parcours aide à apaiser l''anxiété et à retrouver son calme intérieur',
    ARRAY['Diminution de l''anxiété', 'Régulation du rythme cardiaque', 'Amélioration de la respiration'],
    ARRAY['SUNNY', 'CLOUDY']
),
(
    'TIRED',
    'MEDIUM',
    (SELECT id FROM walking_routes WHERE name = 'Circuit Énergisant Urbain'),
    'Ce parcours dynamique stimulera votre énergie tout en vous permettant de découvrir la ville',
    ARRAY['Boost d''énergie naturel', 'Amélioration de la circulation sanguine', 'Stimulation cognitive'],
    ARRAY['SUNNY', 'CLOUDY', 'LIGHT_RAIN']
);

-- Insert route points for the Zen Park Trail
INSERT INTO route_points 
(route_id, sequence_number, latitude, longitude, elevation_meters)
SELECT 
    id as route_id,
    generate_series(1, 5) as sequence_number,
    48.8566 + (generate_series(1, 5)::decimal * 0.0002) as latitude,
    2.3522 + (generate_series(1, 5)::decimal * 0.0002) as longitude,
    10 + (generate_series(1, 5) * 2) as elevation_meters
FROM walking_routes 
WHERE name = 'Parcours Zen du Parc';
