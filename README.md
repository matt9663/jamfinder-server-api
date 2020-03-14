# JamFinder Server

## [Live Link](https://jamfinder-app.now.sh/)

This repo houses all the files for the server of my JamFinder app. This Node/Express server connects to the PostgreSQL database, where user data, band details, and message board messages are stored. The client side was constructed using React. [Client Repo](https://github.com/matt9663/jamfinder-client-app)

## Summary

Jamfinder is intended to be a social network for musicans to help them start bands and find people to play music with. Users can create bands or search for bands that already existed based on name, genre, or geographic location. They can join bands that are open to new members and then send messages to other members via a shared message board. The hope is that they'll be able to use the message board to plan rehearsals, share song ideas, or discuss anything else band-related.

The current version supports several features, such as creating a band, joining existing bands that are open to new members, and posting to the band message board when the user is a member of the group. 

## API

The base URL for the API is `https://enigmatic-river-05952.herokuapp.com/`

## Open Endpoints

* ### **Login**:
`POST /api/auth/login`

  Example request: 
  ```json
    {
      "user_name": [valid-user-name],
      "password": [valid-password]
    }
  ```

* ### **Create Account**
 `POST /api/users`
  Example request:
  ```json
  {
    "user_name": [valid-user-name],
    "password": [8 or more characters, 1 lower, upper, number , special character],
    "instrument": [string],
    "genre": [string],
    "influences": [string]
  }
  ```
* ### **Get list of bands**
`GET /api/bands`
Example response:
```json
{
  "id": 1,
  "band_name": "Super cool band",
  "genre": "Indie rock",
  "location": "Richmond, VA",
  "description": "A fun new band from the River City",
  "bandleader": 1,
  "new_members": false,
  "members": [1,2,3,4]
}
```
## Protected Endpoints
Protected endpoints require a valid JWT token in the request header. One can be acquired via the login endpoint above.

* ### **Get Specific User**
`GET /api/users/:user_id`
Example response:
```json
  {
    "id": 1,
    "user_name": "example_user1",
    "instrument": "Guitar",
    "genre": "Rock",
    "influences": "Jimi Hendrix, Eric Clapton",
    "bands": [1,3,5]
  }
```
* ### **Get Users by Band**
`GET /api/users/bands/:band_id`
Example response:
```json
  {
    "id": 1,
    "user_name": "example_user1",
    "instrument": "Guitar",
    "genre": "Rock",
    "influences": "Jimi Hendrix, Eric Clapton",
    "bands": [1,3,5]
  },

  {
    "id": 2,
    "user_name": "example_user2",
    "instrument": "Bass",
    "genre": "Rock",
    "influences": "Ginger Baker",
    "bands": [1,2,4]
  }
```
* ### **Update User Info**
`PATCH /api/users/:user_id`
Example request (only the included fields will be updated):
```json
  {
    "instrument": "Violin",
    "genre": "Classical"
  }
```

* ### **Get Bands By User ID**
`GET /api/bands/user/user:id`
Example response: 
```json
  {
    "id": 1,
    "band_name": "Super cool band",
    "genre": "Indie rock",
    "location": "Richmond, VA",
    "description": "A fun new band from the River City",
    "bandleader": 1,
    "new_members": false,
    "members": [1,2,3,4]
  },
  {
    "id": 2,
    "band_name": "Other cool band",
    "genre": "Jazz",
    "location": "Washington, DC",
    "description": "Smoothest jazz ever",
    "bandleader": 2,
    "new_members": false,
    "members": [1,2,3,4]
  }
```

* ### **Create New Band**
`POST /api/bands`
Example request:
```json
  {
    "band_name": "Some band name",
    "location": "Los Angeles, CA",
    "genre": "Metal",
    "new_members": true,
    "bandleader": 1,
    "members": [1]
  }
```

* ### **Update Band Info
`PATCH /api/bands/:band_id`
Example request (will only update sent fields):
```json
  {
    "band_name": "Cool new name",
    "new_members": true
  }
```

* ### **Get Band Messages**
`GET /api/messages/:band_id`
Example response:
```json
  {
    "id": 1,
    "author_id": 2,
    "author_user_name": "test-user2",
    "band": 2,
    "date_published": "3/11/2020 9:00:00 AM",
    "message": "Howdy y'all!"
  }
```
* ### **Post new band message**
`POST /api/messages/:band_id`
Example response:
```json
  {
    "author_id": 1,
    "author_user_name": "test-user1",
    "band": 1,
    "date_published": "3/11/2020 9:00:00 AM",
    "message": "This is a message"
  }
```