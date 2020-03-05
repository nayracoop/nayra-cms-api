# Users

Users belong to a particular account and can create and modify resources. 

### `POST` Login
- path: `POST` api/login
- small description: Login with registered username/email and password. Returns token to be used as authentication throughout the API.
- path parameters:  null
- query parameters:  null
- request body:
	``
	username: {type: string, required: true, value: registered username or email},
	password: {type: string, required: true, value: registered password}
	``
- responses:
	- 200: {} response model : user and token?
	- 400: (wrong data)
	- 401: unauthorized

**errors right now:**
    -  :warning: ASSERT wrong type of username and password? **didn't find** :point_left:
    -  :warning: ASSERT missing required keys? **didn't find** :point_left:
    -  :warning: ASSERT wrong type of request body? **didn't find** :point_left:
    -  provided username does not exist in db? 401 "Not authenticated."
    -  provided password is not valid? 401 "Not authenticated"
	
### `POST` Sign up
- path: `POST` api/users/login
- small description: creates a new user in the default account -> _how do we setup default account?_
- path parameters: 
- query parameters: 
- request body:
- responses:
	- 200:
	- 400: (wrong data)

**errors**
	- ASSERT request body is not a valid object: check error code
	- :warning: ASSERT required fields are present && valid types right after the assert of the Object type. **didn't find** :point_left:

:warning:**Right now, this is taking the account ID from the req.body. So multiple new accounts can be created. Also, if req.body does not have an account, it searches for a name:"demo" account.**
:warning: *Check if `try { await something } catch (e) {} ` is working or not in here*
:warning: *Check if user controller.signup is using userController.createNew or if it is using _baseController.createNew . In the former case, there is being a lot of duplicated code*


### `POST` Create new users
- path: `POST` api/users
- small description: Creates a new user in the same account of the creator's token. 
- path parameters: null
- query parameters: null
- request body: [{user schema}] or {user schema}?
- responses:
	- 200: {} response model : new user created
	- 400: (wrong data)
	- 401: unauthorized

**errores**
	- No authentication header >  AuthenticationError(5, 401, "Not authenticated."); (maybe a better text in here)  [checkJWT]
	- User in JWT does not exist >  AuthenticationError(7, 401, "Not authenticated."); (maybe a better text in here)  [passport conf]
	- If JWT authentication does not return a user > 401 "invalid authorization code"(maybe a better text in here, and pass it upwards)   [checkJWT]
	- ASSERT request body is an object
	- ASSERT req.user (coming from checkJWT) is a valid object (write better error message)
	- ASSERT password is required
	- :warning: ASSERT all required fields are present & assert all fields are the correct type **didn't find** :point_left:
	-  ASSERT body is an object [_baseController.createNew]

### `GET` Get all users
- path: `GET` api/users
- small description: Returns all users of the same account of the creator's token. If query params are provided, then returns only the users matching those filters. 
- path parameters: null
- query parameters: 
    ```
    {
      **perPage**, // defaults to 5
      firstName,
      lastName,
      email,
      username, 
      accountId,
      deleted //(not working),
      emailConfirmed //(not working),
      createdBy //(not working)  ?
      createdAt //(not working)  ?
    }
    ```
- request body: null
- responses:
	- 200
        ```
        // response example
	    {
          "count": number,
          "list":  [
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
          ]
        }
        ```
	- 400: (wrong data)
	- 401: unauthorized

**errores**
	- No authentication header >  AuthenticationError(5, 401, "Not authenticated."); (maybe a better text in here)  [checkJWT]
	- User in JWT does not exist >  AuthenticationError(7, 401, "Not authenticated."); (maybe a better text in here)  [passport conf]
	- If JWT authentication does not return a user > 401 "invalid authorization code"(maybe a better text in here, and pass it upwards)   [checkJWT]
	
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