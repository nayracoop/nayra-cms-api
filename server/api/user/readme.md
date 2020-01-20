# USER ENDPOINTS DOCUMENTATION



## POST api/login
  #### Request 
```
{
  username,
  password
}
``` 
  #### Response
```
{
  // now it is returning the full user object
  "emailConfirmed",
  "deleted",
  "username",
  "email" ,
  "accountId" ,
  "url" ,
  "id" ,
  "firstName" // (if present),
  "lastName" // (if present),
  "createdAt" // (if present),
  "createdBy" // (if present),
}
``` 

## POST api/users
  #### Request
```
{
  email,
  username,
  password
  accountId,
}
``` 
 #### Response
```
{
  // now it is returning the full user object
  "emailConfirmed",
  "deleted",
  "username",
  "email" ,
  "accountId" ,
  "url" ,
  "id" ,
  "firstName" // (if present),
  "lastName" // (if present),
  "createdAt" // (if present),
  "createdBy" // (if present),
}
``` 

## GET api/users
  #### Request 
```
{
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
  #### Response
```
{
  "count":,
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

      "previousHashes" //(?),
      "failedLoginAttempts" //(?),
      "hash" //(?),
      "salt" //(?)
    }
  ]
}
``` 


## GET api/users/:id
  #### Request 
```
{
  // ?
}
``` 
  #### Response
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

  "previousHashes" //(?),
  "failedLoginAttempts" //(?),
  "hash" //(?),
  "salt" //(?)
}
``` 

## PUT api/users/:id
Currently not working. 
  #### Request 
```
{
  // ?

}
``` 
  #### Response
```
{
  // returning full document right now
}
``` 


## DELETE api/users/:id
Currently not working. 
  #### Request 
```
{
  // ?

}
``` 
  #### Response
```
{
  // returning full document right now
}
``` 


## POST api/users/signup
Currently not working. 
  #### Request 
```
{
  // ?

}
``` 
  #### Response
```
{
  // ?
}
``` 


## POST api/users/confirmEmail
Currently not working. 
  #### Request 
```
{
  // ?

}
``` 
  #### Response
```
{
  // ?
}
``` 