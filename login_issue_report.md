# Issue Report: Login and Registration Failures

## Diagnosis
The login and registration functionality is failing because the frontend application cannot communicate with the backend server. This is caused by a **malformed URL** in the API configuration.

## The Root Cause
In the file `frontend/src/utils/api.js`, the `baseURL` for the Axios instance is defined with a typo:

```javascript
// Current incorrect code (Line 4 in frontend/src/utils/api.js)
baseURL:"http:/localhost:5000/api"
```

Notice the protocol part `http:/` has only one slash. The correct format for a URL requires two slashes after the colon: `http://`.

## Why this breaks the app
When the frontend tries to send a request (e.g., to `/auth/login`), Axios prepends this `baseURL`.
1.  **Expected Request**: `http://localhost:5000/api/auth/login`
2.  **Actual Request**: `http:/localhost:5000/api/auth/login` (or similar malformed string depending on browser interpretation)

The browser or the networking library treats this as an invalid URL scheme or cannot resolve the host correctly, leading to a "Network Error" or a failed request before it even reaches the backend.

## Solution to this problem
To fix this issue, you need to correct the `baseURL` string in `frontend/src/utils/api.js` by adding the missing slash:

**Change this:**
```javascript
baseURL:"http:/localhost:5000/api"
```

**To this:**
```javascript
baseURL:"http://localhost:5000/api"
```

Once this typo is fixed, the frontend will be able to successfully send requests to your backend server running on port 5000.
