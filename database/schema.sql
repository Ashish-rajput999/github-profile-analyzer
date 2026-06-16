-- database/schema.sql
-- Run this file in your MySQL client to create the required table.
-- Command: mysql -u root -p github_analyzer < database/schema.sql

-- Create the database if it doesn't exist yet
CREATE DATABASE IF NOT EXISTS github_analyzer;

-- Use the database
USE github_analyzer;

-- Create the github_profiles table
CREATE TABLE IF NOT EXISTS github_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,         -- Unique ID for each row, auto-increments
  username VARCHAR(100) NOT NULL UNIQUE,     -- GitHub username, must be unique (no duplicates)
  name VARCHAR(255),                         -- Full name from GitHub profile
  avatar_url TEXT,                           -- URL to profile picture
  bio TEXT,                                  -- Profile bio/description
  followers INT DEFAULT 0,                   -- Number of followers
  following INT DEFAULT 0,                   -- Number of people they follow
  public_repos INT DEFAULT 0,                -- Number of public repositories
  public_gists INT DEFAULT 0,                -- Number of public gists
  profile_url VARCHAR(255),                  -- Link to their GitHub profile page
  account_created DATE,                      -- Date their GitHub account was created
  account_age_years DECIMAL(4,2),            -- How many years old the account is
  followers_following_ratio DECIMAL(10,2),   -- Ratio of followers to following
  repos_per_year DECIMAL(10,2),              -- Average repos created per year
  popularity_score INT,                      -- Calculated popularity score
  analyzed_at DATETIME,                      -- When our API last analyzed this profile
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,                    -- When record was first inserted
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Auto-updates on row change
);
