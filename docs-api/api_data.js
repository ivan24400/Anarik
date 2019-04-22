define({ "api": [
  {
    "type": "post",
    "url": "/user",
    "title": "Add a new user",
    "version": "1.0.0",
    "name": "AddUser",
    "group": "User",
    "filename": "routes/user.js",
    "groupTitle": "User",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Only authenticated users can access the endpoint.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Unauthorized response",
          "content": "HTTP 401 Unauthorized\n{\n  \"msg\": \"Invalid credentials\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "put",
    "url": "/user",
    "title": "Update an existing user",
    "version": "1.0.0",
    "name": "UpdateUser",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "username",
            "description": "<p>registered username</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "oldPassword",
            "description": "<p>current user's password</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "newPassword",
            "description": "<p>new password</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "boolean",
            "optional": false,
            "field": "-",
            "description": "<p>operation status</p>"
          }
        ]
      }
    },
    "filename": "routes/user.js",
    "groupTitle": "User",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Only authenticated users can access the endpoint.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Unauthorized response",
          "content": "HTTP 401 Unauthorized\n{\n  \"msg\": \"Invalid credentials\"\n}",
          "type": "json"
        }
      ]
    }
  }
] });
