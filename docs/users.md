# Users

Users belong to a particular account and can create and modify resources. 

### `POST` Login
- path: `POST` api/login
- small description: Login with registered username/email and password. Returns token to be used as authentication throughout the API.
- path parameters:  null
- query parameters:
    ``
    username: {type: string, required: true, value: registered username or email},
    password: {type: string, required: true, value: registered password}
    ``
- request body: null
- responses:
	- 200: 
      ```JSON
      // response example
      {
        "user": {
            "emailConfirmed": true,
            "deleted": false,
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
	- 400: (wrong data)
	- 401: unauthorized

**errors right now:**
    -  :warning: ASSERT wrong type of username and password? :point_right: -> query param is always a string
    -  :warning: ASSERT missing required keys? **didn't find** :point_left: -> :warning: now 500 unexpected
    -  provided username does not exist in db?  401  3 "Not authenticated."
    -  provided password is not valid? 401 1 "Not authenticated"


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
	- 200:
  ```JSON
    {
      "emailConfirmed": true,
      "deleted": false,
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
	- 400: (wrong data)

**errors**
	- ASSERT request body is not a valid object: check error code -> :warning: now its throwing 500 Unexpected Error, not OK
	- :warning: ASSERT required fields are present :warning: **not working for password**
  - :warning: ASSERT valid types right after the assert of the Object type. :warning: **working for everything but for the password**
  - :warning: Duplicated key for username and email **now throwing 500 ERROR** should throw 400 duplicate key or something


  - :warning: all new users are assigned to the same account
  - :warning: **right now emailConfirmed can be set to true or false from signup, this is not ok.**
  - :warning: *Check if `try { await something } catch (e) {} ` is working or not in here*
  - :warning: *Check if user controller.signup is using userController.createNew or if it is using _baseController.createNew . In the former case, there is being a lot of duplicated code*


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
	- 200:
    ```JSON
    {
        "emailConfirmed": true,
        "deleted": false,
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
	- 400: (wrong data)
	- 401: Unauthorized

**errores**
	- No authentication header >  AuthenticationError(5, 401, "Not authenticated."); (maybe a better text in here)  [checkJWT]
	- User in JWT does not exist >  AuthenticationError(7, 401, "Not authenticated."); (maybe a better text in here)  [passport conf]
	- If JWT authentication does not return a user > 401 "invalid authorization code"(maybe a better text in here, and pass it upwards) [checkJWT]
	- ASSERT req.user (coming from checkJWT) is a valid object (write better error message) [wouldn't know how to replicate...]
	- ASSERT all required fields are present (works but password gets a different error than username and email)
  - :warning: ASSERT all fields are the correct type **Doesn't work with password -> 500 unexpected** :point_left:
	- :warning: ASSERT body is an object **not working, throwing 422 "Created user must have a password"**


### `GET` Get all users
- path: `GET` api/users
- small description: Returns all users of the same account of the creator's token. If query params are provided, then returns only the users matching those filters. 
- path parameters: null
- query parameters: 
    ```
      perPage: number,// defaults to 5
      firstName: string,
      lastName: string,
      email: string,
      username: string, 
      accountId: ObjectId to string,
      emailConfirmed: boolean,
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
              "deleted": false,
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
	- 422: ValidationError
	- 401: unauthorized

**errores**
	- No authentication header >  AuthenticationError(5, 401, "Not authenticated."); (maybe a better text in here)  [checkJWT]
	- User in JWT does not exist >  AuthenticationError(7, 401, "Not authenticated."); (maybe a better text in here)  [passport conf]
	- If JWT authentication does not return a user > 401 "invalid authorization code"(maybe a better text in here, and pass it upwards)   [checkJWT]
  - ASSERT invalid query param : 422 ValidationError
  - ASSERT invalid query param type : 422 ValidationError  :warning: not working for some string fields throwing **500 "/[/: Unterminated character class &&& date  500 Cast to date failed for value"** 

  -:warning: **Count is not working, always return total user documents in db**
  -:warning: **query params `deleted`  not working (not throwing invalid param error & not filtering either)**


### `GET` Get user by ID
- path: `GET` api/users/{id}
- small description: Returns user by ID
- path parameters: 
    ` id: {type: string, required:true, description: the ID of the user} `
- query parameters: null
- request body: null
- responses:
	- 200: 
		```
    	// response example
    	{
          "emailConfirmed",
          "deleted",
          "username":,
          "email": ,
          "accountId": ,
          "url": ,
          "id": ,
          "firstName" // (if present),
          "lastName" // (if present),
          "createdAt" // (if present),
          "createdBy" // (if present),
          "__v" //(? if present),
        }
        ```
	- 400: (wrong data)
	- 401: unauthorized
	- 404: User not found

**errores**
	- No authentication header >  AuthenticationError(5, 401, "Not authenticated."); (maybe a better text in here)  [checkJWT]
	- User in JWT does not exist >  AuthenticationError(7, 401, "Not authenticated."); (maybe a better text in here)  [passport conf]
	- If JWT authentication does not return a user > 401 "invalid authorization code"(maybe a better text in here, and pass it upwards)   [checkJWT]
	
### `PUT` Update user by ID
- path: `PUT` api/users/{id}
- small description: Updates user by ID
- path parameters: 
    ` id: {type: string, required:true, description: the ID of the user}`
- query parameters: null
- request body: {user schema} -> modifiable params
- responses:
	- 200: {} response model 
    	```
    	{
          "emailConfirmed",
          "deleted",
          "username":,
          "email": ,
          "accountId": ,
          "url": ,
          "id": ,
          "firstName" // (if present),
          "lastName" // (if present),
          "createdAt" // (if present),
          "createdBy" // (if present),
          "__v" //(? if present),
        }
        ```
	- 400: (wrong data)
	- 401: unauthorized
	- 404: User not found
	
**errores**
	- No authentication header >  AuthenticationError(5, 401, "Not authenticated."); (maybe a better text in here)  [checkJWT]
	- User in JWT does not exist >  AuthenticationError(7, 401, "Not authenticated."); (maybe a better text in here)  [passport conf]
	- If JWT authentication does not return a user > 401 "invalid authorization code"(maybe a better text in here, and pass it upwards)   [checkJWT]


### `DELETE` Delete user by ID
- path: `DELETE` api/users/{id}
- small description: Deletes user by ID
- path parameters: 
    ` id: {type: string, required:true, description: the ID of the user}`
- query parameters: null
- request body: null
- responses:
	- 200: {} response model : ?????
	- 400: (wrong data)
	- 401: unauthorized
	- 404: User not found


**errores**
	- No authentication header >  AuthenticationError(5, 401, "Not authenticated."); (maybe a better text in here)  [checkJWT]
	- User in JWT does not exist >  AuthenticationError(7, 401, "Not authenticated."); (maybe a better text in here)  [passport conf]
	- If JWT authentication does not return a user > 401 "invalid authorization code"(maybe a better text in here, and pass it upwards)   [checkJWT]