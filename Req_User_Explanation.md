by the developer (you). |
| **`userId`** | **Database Models (Foreign Key)** | In your `Investor` and `Startup` models, you likely have a field named `userId` to link that profile back to the main `User` account. 

---

## 2. Tracing the User ID Flow

Here is the journey of the User ID through your code:

### Step 1: Login (The "Packing")
**File:** `backend/controllers/authController.js`

When a user logs in, we modify their database `_id` into a token.

```javascript
// We take existingUser._id (from DB) and put it into 'id' (token payload)
const token = jwt.sign({
    id: existingUser._id, 
    email: existingUser.email
}, process.env.JWT_SECRET, ...);
```

### Step 2: Middleware (The "Unpacking")
**File:** `backend/middleware/authMiddleware.js`

When the user makes a request (e.g., "Get My Profile"), the middleware checks the token.

```javascript# Understanding `req.userId`, `_id`, and `user_id`

## 1. Why is there ambiguity? (`_id` vs `user_id` vs `userId`)

The confusion comes from the fact that the same piece of data (the user's unique identifier) is named differently depending on **where** it is living at that moment.

| Name | Where it is found | Why? |
| :--- | :--- | :--- |
| **`_id`** | **MongoDB Database** | This is the default unique identifier created by MongoDB for every document (User, Investor, Startup, etc.). It always starts with an underscore. |
| **`id`** | **JWT Token** | When you log in, we "pack" the user's `_id` into a token. In your `authController.js`, the code uses `id` as the key for this payload (`jwt.sign({ id: user._id ... })`). |
| **`userId`** | **Express Request (`req`)** | In your `authMiddleware.js`, we unpack the token and save the ID into the request object as `req.userId`. This is a custom name chosen 
// We verify the token and get the original payload back
const decoded_message = jwt.verify(token, process.env.JWT_SECRET);

// decoded_message look like: { id: "65b...", email: "..." }

// We take 'id' from the payload and attach it to the request object as 'userId'
req.userId = decoded_message.id; 
```
> **Why do we do this?**
> By attaching it to `req`, we pass this information to the *next* function (the controller). The controller doesn't need to decode the token again; it just looks at `req.userId`.

### Step 3: Controller (The "Usage")
**File:** `backend/controllers/investorController.js`

Now the controller runs. It needs to know *who* is asking.

```javascript
const matchStartup = async (req, res) => {
    // We grab the ID that the middleware attached
    const userId = req.userId;

    // We use it to find the Investor profile
    // Here, 'userId' is the field name in your Investor Schema
    const investor = await Investor.findOne({ 
        userId: userId 
    });
}
```

---

## 3. Why store it in the `req` variable?

Using `req.userId` (or `req.user`) is the standard way in Express to maintain **"Session Context"**.

Imagine `req` as a backpack that gets passed from function to function during a single API call.
1.  **Auth Middleware** checks the ID card (Token), verifies it's real, and puts a "Name Tag" (`userId`) in the backpack.
2.  **Controller** opens the backpack, sees the "Name Tag", and knows exactly which user data to fetch from the database.

Without this, every single controller function (matchStartup, getProfile, etc.) would have to manually decode the token, which would be repetitive and messy code.

## 4. Summary of Variable Names

*   **`_id`**: The raw ID inside the User collection.
*   **`req.userId`**: The helper variable we created in the middleware to easily access the ID in controllers.
*   **`user_id` (snake_case)**: You might see this in some Python examples or SQL databases, but in your current JavaScript/Node.js codebase, you are consistently using **camelCase (`userId`)**. If you see `user_id` somewhere, it might be a typo or a specific field in a 3rd party API, but your core logic uses `userId`.
