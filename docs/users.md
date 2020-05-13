# Users

Users belong to a particular account and can create and modify resources. 

### `POST` Login
- path: `POST` api/login
- small description: Login with registered username/email and password. Returns token to be used as authentication throughout the API.
- path parameters:  null
- query parameters: null
- request body: 
    ```Javascript
    {
      username: (type: string, required: true, value: registered username or email),
      password: (type: string, required: true, value: registered password)
    }
    ```
- responses:
	- 200: 
      ```JSON
      // response example
      {
        "user": {
            "emailConfirmed": true,
            "_id": "user_id_goes_here",
            "firstName": "Super",
            "lastName": "Admin",
            "username": "admin",
            "email": "admin@nayra.coop",
            "accountId": "5e220b2889d3765282d4db93",
            "updated": [],
            "url": "/api/users/user_id_goes_here",
            "id": "user_id_goes_here"
        },
        "token": "valid_token_goes_here"
    }
      ```
	- 422: Validation error   ( wrong data type or missing required fields )
	- 401: Not authenticated  ( wrong username or password )


### `POST` Sign up
- path: `POST` api/users/login
- small description: creates a new user in the default account -> _how do we setup default account?_
- path parameters: null
- query parameters: null
- request body:
  ```Javascript
    { 
      "username": {type: string, required: true, unique:true},
      "email": {type: string, required: true, unique:true},
      "password": {type: string, required: true},
      "firstName": {type: string, required: false},
      "lastName": {type: string, required: false}
    }
  ```
- responses:
	- 201:
  ```JSON
    {
      "emailConfirmed": true,
      "_id": "new_user_id_goes_here",
      "firstName": "Super",
      "lastName": "Admin",
      "username": "newUser",
      "email": "newUser@nayra.coop",
      "accountId": "5e220b2889d3765282d4db93",
      "updated": [],
      "url": "/api/users/new_user_id_goes_here",
      "id": "new_user_id_goes_here"
    }
  ```
  - 400: Bad request (wrong JSON body syntax) 
	- 422: Not available (duplicated username or email) | Validation error (missing required field)

:warning: all users created by this endpoint are assigned to the main account set in .env file :warning:

**errors**
	- ASSERT request body is not a valid object: check error code -> :warning: now its throwing 500 Unexpected Error, not OK
  - :warning: ASSERT valid types right after the assert of the Object type. :warning: **working for everything but for the password**
<<<<<<< HEAD
  - :warning: **right now emailConfirmed can be set to true or false from signup, this is not ok.**
=======
  - :warning: all new users are assigned to the same account
>>>>>>> 410beb128b13a394886297ee205ea55ef4fcf5b8


### `POST` Create new user
- path: `POST` api/users
- small description: Creates a new user in the same account of the creator's token. 
- path parameters: null
- query parameters: null
- request body:
    ```Javascript
      { 
        "username": {type: string, required: true, unique:true},
        "email": {type: string, required: true, unique:true},
        "password": {type: string, required: true},
        "firstName": {type: string, required: false},
        "lastName": {type: string, required: false}
      }
    ```
- responses:
	- 201:
    ```JSON
    {
        "emailConfirmed": true,
        "_id": "new_user_id_goes_here",
        "firstName": "Super",
        "lastName": "Admin",
        "username": "newUser",
        "email": "newUser@nayra.coop",
        "accountId": "5e220b2889d3765282d4db93",
        "updated": [],
        "url": "/api/users/new_user_id_goes_here",
        "id": "new_user_id_goes_here",
        "createdBy": "creator_id_goes_here",
        "createdAt": "some ISO Date"
    }
    ```
	- 422: Validation error (missing required fields, wrong type)
	- 401: Not authenticated


### `GET` Get all users
- path: `GET` api/users
- small description: Returns all users of the same account of the requester's token. If query params are provided, then it returns only the users matching those filters. 
- path parameters: null
- query parameters: 
    ```
      perPage: number,// defaults to 5
      firstName: string,
      lastName: string,
      email: string,
      username: string, 
      emailConfirmed: boolean (true | false),
      createdBy: ObjectId to string,
      createdAt: ISO Date
    ```
- request body: null
- responses:
	- 200
      ```JSON
        // response example
	    {
          "count": 1,
          "list":  [
            {
              "emailConfirmed": true,
              "username": "user_name",
              "email": "user_email",
              "accountId": "account_id",
              "url": "api/users/user_id",
              "id": "user_id",
              "firstName": "first_name", // (if present),
              "lastName": "last_name", // (if present),
              "createdAt": "2020-01-20T19:25:48.000Z", // (if present),
              "createdBy": "creator_id", // (if present),
              "__v" : 0
            }
          ]
        }
        ```
	- 422  Validation error (invalid param, wrong type)
	- 401: Not authenticated


### `GET` Get user by ID
- path: `GET` api/users/{id}
- small description: Returns user by ID
- path parameters: 
    ` id: {type: string, required:true, description: the ID of the user} `
- query parameters: null
- request body: null
- responses:
	- 200: 
		```JSON
      {
          "emailConfirmed": true,
          "_id": "new_user_id_goes_here",
          "firstName": "Super",
          "lastName": "Admin",
          "username": "user",
          "email": "user@nayra.coop",
          "accountId": "5e220b2889d3765282d4db93",
          "updated": [],
          "url": "/api/users/user_id_goes_here",
          "id": "user_id_goes_here"
      }
    ```
	- 401: Not authenticated
	- 404: User not found
  - 422: Validation Error (wrong type)

	
### `PUT` Update user by ID
- path: `PUT` api/users/{id}
- small description: Updates user by ID
- path parameters: 
    ` id: {type: string, required:true, description: the ID of the user}`
- query parameters: null
- request body:
  ```
    // one or many of the following fields can be provided
    { 
      "username": {type: string},
      "email": {type: string},
      "password": {type: string},
      "firstName": {type: string},
      "lastName": {type: string},
      "emailConfirmed": {type: boolean}

    }
  ```
- responses:
	- 200: {} response model 
    ```JSON
      {
          "emailConfirmed": true,
          "_id": "user_id_goes_here",
          "firstName": "Super",
          "lastName": "Admin",
          "username": "user",
          "email": "user@nayra.coop",
          "accountId": "5e220b2889d3765282d4db93",
          "updated": [],
          "url": "/api/users/user_id_goes_here",
          "id": "user_id_goes_here",
          "updated":
            [
              "by": "autor_of_update",
              "at": "2020-01-23T15:37:22.000Z"
            ]
      }
    ```
	- 401: Not authenticated
	- 404: User not found
  - 422: Validation error ( wrong data type, invalid fields )


### `DELETE` Delete user by ID
- path: `DELETE` api/users/{id}
- small description: Deletes user by ID
- path parameters: 
    ` id: {type: string, required:true, description: the ID of the user}`
- query parameters: null
- request body: null
- responses:
	- 204: no content (deletion was OK)
	- 401: Not authenticated
	- 404: Not found
  - 422: Wrong data (ValidationError)
