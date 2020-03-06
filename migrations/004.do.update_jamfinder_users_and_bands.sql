ALTER TABLE jamfinder_users
ALTER COLUMN bands SET DEFAULT '{}';

ALTER TABLE jamfinder_bands
ALTER COLUMN members SET DEFAULT '{}';