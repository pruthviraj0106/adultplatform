-- First, let's clear existing sample data
DELETE FROM posts;
DELETE FROM collections;

-- Reset sequences
ALTER SEQUENCE collections_id_seq RESTART WITH 1;
ALTER SEQUENCE posts_id_seq RESTART WITH 1;

-- Insert collections with proper binary data
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

-- Insert posts with proper binary data
INSERT INTO posts (collection_id, title, description, thumbnail_data, video_data, type, duration) VALUES
(1, 'Romantic Evening Session', 'A sensual evening with our featured model', 
  decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'),
  decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'),
  'Video', '12:30'),

(1, 'Intimate Moments', 'Intimate moments captured in high definition', 
  decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'),
  decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'),
  'Video', '15:45'),

(2, 'Sensual Dance', 'A mesmerizing dance performance', 
  decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'),
  decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'),
  'Video', '08:20'),

(2, 'Evening Desires', 'Explore your deepest desires', 
  decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'),
  decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'),
  'Video', '18:15'); 