BEGIN;

TRUNCATE
  jamfinder_band_messages,
  jamfinder_bands,
  jamfinder_users
  RESTART IDENTITY CASCADE;

INSERT INTO jamfinder_users (user_name, password, genres, instrument, influences, bands)
VALUES
  ('JamfinderEnthusiast', '$2a$12$GRIGk/ncsfWQNlnyI.c60.pc5W/BciuE1fcSPlrMkwjmxsR1z0T2e', 'Funk/R&B', 'Electric guitar', 'James Brown, Isaiah Sharkey', '{"1","2","3"}'),
  ('John_Bonhams_Ghost', '$2a$12$GRIGk/ncsfWQNlnyI.c60.pc5W/BciuE1fcSPlrMkwjmxsR1z0T2e', 'Classic Rock', 'Drums', 'Bernard Purdie', '{"1","2"}'),
  ('Jamerson_fanatic', '$2a$12$GRIGk/ncsfWQNlnyI.c60.pc5W/BciuE1fcSPlrMkwjmxsR1z0T2e', 'Soul/Motown', 'Bass', 'James Jamerson, Bob Babbit', '{"1","3"}');

INSERT INTO jamfinder_bands (band_name, genre, description, new_members, location, members, bandleader)
VALUES
  ('The Funk Avengers', 'Funk/Soul', 'Heavy grooves and serious soul', true, 'Hitsville, USA', '{"1","2","3"}', 1),
  ('Drum Duo Extravaganza', 'Drumcore', 'Its a lot of drums. Cant be much clearer than that', false, 'Los Angeles, CA', '{"1","2"}', 2),
  ('Boistrous Oysters', 'Indie-rock', 'Angsty songs by dudes who are a little too old to be this angsty', true, 'Portland, OR', '{"1","3"}', 3);

INSERT INTO jamfinder_band_messages (band, author, author_user_name, date_published, message)
VALUES
  (1, 1, 'JamfinderEnthusiast', '2/18/2020 9:00:00 AM', 'Since we have a show next week, are you guys available to meet for rehearsal this Saturday afternoon at 2pm?'),
  (1, 2, 'John_Bonhams_Ghost', '2/18/2020 10:00:00 AM', 'Yeah that works for me, see you then!'),
  (1, 3, 'Jamerson_fanatic', '2/17/2020 9:00:00 AM', 'Nice to meet everyone, thanks for letting me join the group. Excited to make some music will you guys');

COMMIT;