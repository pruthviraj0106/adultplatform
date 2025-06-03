-- Create the database (run this separately)
-- CREATE DATABASE adultcontent;

-- Connect to the database and run these commands:

-- Drop existing types if they exist
DROP TYPE IF EXISTS subscription_types CASCADE;
DROP TYPE IF EXISTS tiers CASCADE;
DROP TYPE IF EXISTS content_types CASCADE;

-- Create custom types
CREATE TYPE subscription_types AS ENUM ('Monthly', 'One-time');
CREATE TYPE tiers AS ENUM ('BASIC', 'MEDIUM', 'HARDCORE');
CREATE TYPE content_types AS ENUM ('VIDEOS', 'IMAGES');

-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS images CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS admin CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    subscription_status INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create admin table
CREATE TABLE IF NOT EXISTS admin (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL
);

-- Create sessions table for express-session
CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR(255) PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP NOT NULL
);

-- Create index on sessions expire
CREATE INDEX IF NOT EXISTS sessions_expire_idx ON sessions(expire);

-- Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    price TEXT NOT NULL,
    period subscription_types NOT NULL,
    description TEXT NOT NULL,
    features TEXT[],
    highlighted BOOLEAN DEFAULT false
);

-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    thumbnail_data BYTEA NOT NULL,
    tier tiers NOT NULL,
    type content_types NOT NULL,
    price TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    duration TEXT NOT NULL,
    thumbnail BYTEA NOT NULL,
    tier tiers NOT NULL,
    collection_id INTEGER REFERENCES collections(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create images table
CREATE TABLE IF NOT EXISTS images (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    thumbnail BYTEA NOT NULL,
    tier tiers NOT NULL,
    collection_id INTEGER REFERENCES collections(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create posts table with proper binary data columns
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    collection_id INTEGER REFERENCES collections(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_data BYTEA,
    video_data BYTEA,
    type VARCHAR(50) NOT NULL DEFAULT 'Video',
    duration VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id)
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration_days INTEGER NOT NULL,
    features TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    subscription_id INTEGER REFERENCES subscriptions(id),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT INTO admin (username, password) 
VALUES ('admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBAQN3J9QqJ8Hy')
ON CONFLICT (username) DO NOTHING;

-- Insert new admin user (password: admin123)
INSERT INTO admin (username, password) 
VALUES ('superadmin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBAQN3J9QqJ8Hy')
ON CONFLICT (username) DO NOTHING;

-- Insert default subscription plans
INSERT INTO subscription_plans (title, price, period, description, features, highlighted) VALUES
('Basic Monthly', '$9.99', 'Monthly', 'Basic monthly subscription', ARRAY['Access to Basic content', 'HD streaming', 'Cancel anytime', 'New content weekly'], false),
('Basic One-off', '$24.99', 'One-time', 'Basic one-time subscription', ARRAY['Lifetime access to Basic content', 'HD streaming', 'One-time payment', 'Basic content archive'], false),
('Medium Monthly', '$19.99', 'Monthly', 'Medium monthly subscription', ARRAY['Access to Basic & Medium content', '4K streaming', 'Cancel anytime', 'New content daily', 'Premium support'], true),
('Medium One-off', '$49.99', 'One-time', 'Medium one-time subscription', ARRAY['Lifetime access to Basic & Medium content', '4K streaming', 'One-time payment', 'Medium content archive', 'Premium support'], false),
('Hardcore One-off', '$79.99', 'One-time', 'Hardcore one-time subscription', ARRAY['Lifetime access to ALL content tiers', '8K streaming', 'One-time payment', 'Complete content archive', 'Priority support', 'Early access to new releases'], false)
ON CONFLICT DO NOTHING;

-- Insert default collections
INSERT INTO collections (title, description, thumbnail_data, tier, type, price) VALUES
('Sensual Encounters Collection', 'Our entry-level collection featuring tasteful scenes and sensual content.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop&crop=face', 'BASIC', 'VIDEOS', '$9.99/month'),
('Basic Monthly Collection 2023', 'Our newest collection for Basic subscribers featuring fresh faces and basic content collection.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=200&fit=crop&crop=face', 'BASIC', 'VIDEOS', '$24.99 one-time'),
('Medium Tier - Passionate Encounters', 'More explicit content for our Medium tier members. Features adventurous content focused on passion.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=200&fit=crop&crop=face', 'MEDIUM', 'VIDEOS', '$19.99/month'),
('Hardcore Collection Vol. 1', 'Our most intense and explicit adult content featuring hardcore scenes for our dedicated fans.', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=200&fit=crop&crop=face', 'HARDCORE', 'VIDEOS', '$79.99 one-time')
ON CONFLICT DO NOTHING;

-- Insert sample posts for collections
INSERT INTO posts (collection_id, title, description, thumbnail_data, video_data, duration, views) VALUES
(1, 'Romantic Evening Session', 'A sensual evening with our featured model', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop&crop=face', 'https://example.com/videos/romantic-evening.mp4', '12:30', 2100),
(1, 'Intimate Moments', 'Intimate moments captured in high definition', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=200&fit=crop&crop=face', 'https://example.com/videos/intimate-moments.mp4', '15:45', 1800),
(2, 'Sensual Dance', 'A mesmerizing dance performance', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=200&fit=crop&crop=face', 'https://example.com/videos/sensual-dance.mp4', '08:20', 3200),
(2, 'Evening Desires', 'Explore your deepest desires', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=200&fit=crop&crop=face', 'https://example.com/videos/evening-desires.mp4', '18:15', 2700),
(3, 'Passionate Adventures', 'Intense moments of passion', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=200&fit=crop&crop=face', 'https://example.com/videos/passionate-adventures.mp4', '22:15', 4100),
(3, 'Intense Moments', 'Raw and passionate encounters', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=200&fit=crop&crop=face', 'https://example.com/videos/intense-moments.mp4', '19:45', 3800),
(4, 'Extreme Encounters', 'Our most intense content', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop&crop=face', 'https://example.com/videos/extreme-encounters.mp4', '25:30', 5200),
(4, 'Intense Sessions', 'Hardcore content for dedicated fans', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=200&fit=crop&crop=face', 'https://example.com/videos/intense-sessions.mp4', '28:45', 6100)
ON CONFLICT DO NOTHING; 