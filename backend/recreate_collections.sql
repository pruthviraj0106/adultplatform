-- Drop dependent tables first
DROP TABLE IF EXISTS posts CASCADE;

-- Drop collections table
DROP TABLE IF EXISTS collections CASCADE;

-- Recreate collections table
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

-- Recreate posts table
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    collection_id INTEGER REFERENCES collections(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_data BYTEA,
    video_data BYTEA,
    duration VARCHAR(10),
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample collections with binary data
INSERT INTO collections (title, description, thumbnail_data, tier, type, price) VALUES
('Sensual Encounters Collection', 'Our entry-level collection featuring tasteful scenes and sensual content.', 
decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'), 
'BASIC', 'VIDEOS', '$9.99/month'),

('Basic Monthly Collection 2023', 'Our newest collection for Basic subscribers featuring fresh faces and basic content collection.', 
decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'), 
'BASIC', 'VIDEOS', '$24.99 one-time'),

('Medium Tier - Passionate Encounters', 'More explicit content for our Medium tier members. Features adventurous content focused on passion.', 
decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'), 
'MEDIUM', 'VIDEOS', '$19.99/month'),

('Hardcore Collection Vol. 1', 'Our most intense and explicit adult content featuring hardcore scenes for our dedicated fans.', 
decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'), 
'HARDCORE', 'VIDEOS', '$79.99 one-time');

-- Insert sample posts with binary data
INSERT INTO posts (collection_id, title, description, thumbnail_data, video_data, duration, views) VALUES
(1, 'Romantic Evening Session', 'A sensual evening with our featured model', 
decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'),
decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'),
'12:30', 2100),

(1, 'Intimate Moments', 'Intimate moments captured in high definition', 
decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'),
decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'),
'15:45', 1800),

(2, 'Sensual Dance', 'A mesmerizing dance performance', 
decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'),
decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'),
'08:20', 3200),

(2, 'Evening Desires', 'Explore your deepest desires', 
decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'),
decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'),
'18:15', 2700); 