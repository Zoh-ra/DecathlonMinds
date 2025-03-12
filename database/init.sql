-- Create database if it doesn't exist
CREATE DATABASE decathlon_minds_db;

-- Connect to the database
\c decathlon_minds_db;

-- Create enum types for emotions and activity levels
CREATE TYPE emotion_type AS ENUM (
    'HAPPY', 'SAD', 'ANXIOUS', 'STRESSED', 'CALM', 'ENERGETIC', 'TIRED', 'FRUSTRATED'
);

CREATE TYPE intensity_level AS ENUM (
    'LOW', 'MEDIUM', 'HIGH'
);

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create emotional_entries table
CREATE TABLE emotional_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    emotion emotion_type NOT NULL,
    intensity intensity_level NOT NULL,
    description TEXT,
    triggers TEXT[],
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    location_latitude DECIMAL(9,6),
    location_longitude DECIMAL(9,6),
    weather_condition VARCHAR(50)
);

-- Create walking_routes table
CREATE TABLE walking_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty_level intensity_level NOT NULL,
    distance_meters INTEGER NOT NULL,
    estimated_duration_minutes INTEGER NOT NULL,
    start_point_latitude DECIMAL(9,6) NOT NULL,
    start_point_longitude DECIMAL(9,6) NOT NULL,
    end_point_latitude DECIMAL(9,6) NOT NULL,
    end_point_longitude DECIMAL(9,6) NOT NULL,
    elevation_gain_meters INTEGER,
    route_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create route_points table for detailed route coordinates
CREATE TABLE route_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL REFERENCES walking_routes(id),
    sequence_number INTEGER NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    elevation_meters INTEGER,
    UNIQUE(route_id, sequence_number)
);

-- Create emotional_recommendations table
CREATE TABLE emotional_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emotion emotion_type NOT NULL,
    intensity intensity_level NOT NULL,
    route_id UUID NOT NULL REFERENCES walking_routes(id),
    recommendation_text TEXT NOT NULL,
    scientific_benefits TEXT[],
    weather_conditions VARCHAR(50)[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_activities table
CREATE TABLE user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    route_id UUID NOT NULL REFERENCES walking_routes(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    distance_covered_meters INTEGER,
    average_pace_seconds INTEGER,
    emotional_state_before emotion_type,
    emotional_state_after emotion_type,
    weather_condition VARCHAR(50),
    notes TEXT
);

-- Create indexes for better query performance
CREATE INDEX idx_emotional_entries_user_id ON emotional_entries(user_id);
CREATE INDEX idx_emotional_entries_emotion ON emotional_entries(emotion);
CREATE INDEX idx_emotional_entries_recorded_at ON emotional_entries(recorded_at);
CREATE INDEX idx_walking_routes_difficulty ON walking_routes(difficulty_level);
CREATE INDEX idx_route_points_route_id ON route_points(route_id);
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_route_id ON user_activities(route_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
