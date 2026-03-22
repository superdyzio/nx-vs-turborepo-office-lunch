# Requirements Document

## Introduction

OfficeLunch is a standalone Angular frontend application that helps office teams coordinate daily lunch outings. It manages users, restaurants and menus, departure times, voting on where to eat, and menu ordering. All data is persisted in localStorage using JSON. The application lives in `/base/` and does not use monorepo tooling.

## Glossary

- **App**: The OfficeLunch Angular application
- **Admin**: A user with administrative privileges (the default account is admin/admin)
- **User**: Any authenticated person using the App
- **Restaurant**: A dining establishment with a name and a list of Dishes
- **Dish**: A single menu item belonging to a Restaurant
- **Voting_Round**: A session in which Users allocate points to Restaurants to decide where to eat
- **Veto**: A special vote that blocks a Restaurant from being chosen
- **Departure_Time**: The configured time at which the group leaves for lunch
- **Last_Choices**: A read-only list of the N most recently chosen Restaurants
- **LocalStorage_Service**: A service that provides read/write access to the browser localStorage
- **Repository_Service**: A service that accesses a specific data domain through the LocalStorage_Service, designed so it can be swapped for a real backend later
- **Testing_Helper**: A method exposed on `window.__initDb` that seeds the database with sample data

## Requirements

### Requirement 1: User Authentication

**User Story:** As a user, I want to log in with my credentials, so that I can access the application.

#### Acceptance Criteria

1. WHEN the App starts for the first time, THE App SHALL seed a default admin account with username "admin" and password "admin"
2. WHEN a user provides valid credentials, THE App SHALL authenticate the user and navigate to the main screen
3. WHEN a user provides invalid credentials, THE App SHALL display an error message and remain on the login screen
4. WHILE a user is not authenticated, THE App SHALL restrict access to all screens except the login screen

### Requirement 2: User Management

**User Story:** As an admin, I want to manage user accounts, so that I can control who has access to the application.

#### Acceptance Criteria

1. WHEN an admin adds a new user, THE App SHALL create the user with the default password "lunch"
2. WHEN an admin edits a user, THE App SHALL persist the updated user data to localStorage
3. WHEN an admin disables a user, THE App SHALL mark the user as disabled and prevent that user from logging in
4. WHEN an admin removes a user, THE App SHALL delete the user record from localStorage
5. THE App SHALL display a list of all users with their current status to the admin
6. WHILE a user account is disabled, THE App SHALL reject login attempts for that account


### Requirement 3: Menu Management

**User Story:** As an admin, I want to manage restaurants and their menus, so that users have up-to-date dining options to choose from.

#### Acceptance Criteria

1. WHEN an admin adds a restaurant, THE App SHALL persist the restaurant with its name and an empty dish list to localStorage
2. WHEN an admin adds a dish to a restaurant, THE App SHALL persist the dish under that restaurant
3. WHEN an admin disables a restaurant, THE App SHALL mark the restaurant as disabled and exclude it from the voting list
4. WHEN an admin enables a previously disabled restaurant, THE App SHALL include the restaurant in the voting list again
5. THE App SHALL display the full list of restaurants and their dishes to the admin
6. WHILE a user does not have admin privileges, THE App SHALL hide the Menu Management screen

### Requirement 4: Settings Management

**User Story:** As an admin, I want to configure application settings, so that the lunch coordination fits our office routine.

#### Acceptance Criteria

1. THE App SHALL store a setting for the number of last choices to display, defaulting to 5
2. THE App SHALL store a setting for the lunch event calendar name, defaulting to "Office Lunch"
3. THE App SHALL store a setting for the exact departure time, defaulting to 12:00 PM
4. WHEN an admin updates any setting, THE App SHALL persist the new value to localStorage immediately
5. THE App SHALL display placeholder sections for future integrations: Wolt, Outlook, Slack, Uber Eats, and Google Maps
6. WHEN the App loads settings, THE App SHALL use the stored values or fall back to the defined defaults

### Requirement 5: Departure Confirmation

**User Story:** As a user, I want to confirm whether I can leave at the scheduled departure time, so that the team knows who will be late.

#### Acceptance Criteria

1. WHEN a user logs in, THE App SHALL display a departure confirmation screen asking "Can you leave at <departure_time>?" Where <departure_time> is taken from the settings.
2. WHEN a user selects YES, THE App SHALL record the user as available at the scheduled departure time
3. WHEN a user selects NO, THE App SHALL display an additional input for the user to specify the time they can leave
4. WHEN a user submits an alternative departure time, THE App SHALL persist that time for the current session
5. THE App SHALL use the departure time from the Settings for the confirmation prompt

### Requirement 6: Voting

**User Story:** As a user, I want to vote on which restaurant to visit, so that the group can decide where to eat.

#### Acceptance Criteria

1. THE App SHALL display a list of all enabled restaurants to the user during a Voting_Round
2. WHEN a user votes, THE App SHALL require the user to assign exactly 3 points to one restaurant, 2 points to another, and 1 point to a third
3. WHEN a user casts a veto, THE App SHALL record the veto against the selected restaurant and associate it with that user
4. WHEN an admin ends the Voting_Round, THE App SHALL calculate the restaurant with the highest total points that has received zero vetoes as the winner
5. IF all restaurants with the highest points have at least one veto, THEN THE App SHALL display "Consensus not reached" and show the username of each user who cast a blocking veto
6. THE App SHALL display the last N chosen restaurants as a read-only list during the Voting_Round, where N is the value from Settings
7. WHILE a Voting_Round is active, THE App SHALL prevent users from changing their vote after submission
8. WHEN a user has not yet voted in an active Voting_Round, THE App SHALL show the voting form

### Requirement 7: Menu Ordering

**User Story:** As a user, I want to choose what I want to eat from the winning restaurant's menu, so that the admin can place orders.

#### Acceptance Criteria

1. WHEN the Voting_Round ends with a winner, THE App SHALL display the winning restaurant's menu to all users
2. WHEN a user selects a dish, THE App SHALL persist the order for that user
3. WHILE a user indicated they cannot leave at the departure time, THE App SHALL require that user to place an order from the menu
4. WHILE a user indicated they can leave at the departure time, THE App SHALL allow but not require that user to place an order
5. THE App SHALL display all submitted orders to the admin in an Admin Dashboard view
6. WHEN the admin views the Admin Dashboard, THE App SHALL show each user's name, their selected dish, and their departure status

### Requirement 8: Data Persistence Layer

**User Story:** As a developer, I want a clean data access layer using localStorage, so that switching to a real backend in the future is straightforward.

#### Acceptance Criteria

1. THE LocalStorage_Service SHALL provide generic read, write, and delete operations for JSON data in localStorage
2. THE App SHALL access each data domain (users, restaurants, settings, votes, orders) through a dedicated Repository_Service
3. WHEN a Repository_Service writes data, THE Repository_Service SHALL delegate to the LocalStorage_Service
4. WHEN a Repository_Service reads data, THE Repository_Service SHALL retrieve and deserialize JSON from the LocalStorage_Service

### Requirement 9: Testing Helper

**User Story:** As a developer, I want a quick way to seed the database with sample data, so that I can test the application without manual setup.

#### Acceptance Criteria

1. THE App SHALL expose a method on `window.__initDb` that can be called from the browser console
2. WHEN `window.__initDb()` is invoked, THE Testing_Helper SHALL clear all OfficeLunch data from localStorage
3. WHEN `window.__initDb()` is invoked, THE Testing_Helper SHALL create 5 regular users and 1 admin user
4. WHEN `window.__initDb()` is invoked, THE Testing_Helper SHALL create 7 restaurants with 4 dishes each

### Requirement 10: Angular Architecture

**User Story:** As a developer, I want the application to use modern Angular patterns, so that the codebase is maintainable and idiomatic.

#### Acceptance Criteria

1. THE App SHALL use standalone components exclusively (no NgModules for component declarations)
2. THE App SHALL use Angular Signals for reactive state management
3. THE App SHALL use the control flow syntax (@if, @for, @switch) instead of structural directives
4. THE App SHALL use lazy-loaded routes for each feature module (UserManagement, MenuManagement, Settings, Departure, Voting, Ordering)
5. THE App SHALL be generated as a standard Angular CLI project without monorepo tooling
