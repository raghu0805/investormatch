# What is Bcrypt?

**Bcrypt** is a password-hashing function designed to be slow and computationally expensive, making it resistant to brute-force attacks. It is widely used to securely store user passwords in databases.

Unlike simple encryption (which can be decrypted), hashing is a one-way process. Bcrypt adds an extra layer of security by using a **salt**—a random string added to the password before hashing—ensuring that even if two users have the same password, their stored hashes will be different.

---

# Why is it used in this project?

In the **InvestMatch** project, we use Bcrypt for **Authentication security**.

1.  **Protecting User Data**: We never store passwords in plain text (e.g., "password123") in the database. If the database were ever compromised, hackers would see the plain passwords and could access user accounts.
2.  **Compliance**: Storing hashed passwords is a standard security practice and often a requirement for data protection regulations.

---

# What methods are used?

The project uses the `bcrypt` library in the backend. Here are the specific methods used:

### 1. `bcrypt.genSalt(rounds)`
*   **Purpose**: Generates a random "salt" to be added to the password.
*   **Used in**: Signup process.
*   **Code**: `const salt = await bcrypt.genSalt(10);`
    *   `10` is the "cost factor" (or rounds), determining how much time is needed to calculate a single potential hash. 10 is a standard balance between security and performance.

### 2. `bcrypt.hash(password, salt)`
*   **Purpose**: Takes the plain text password and the generated salt, and produces the secure hash string.
*   **Used in**: Signup process (before saving the user to the database).
*   **Code**: `const hashedpassword = await bcrypt.hash(password, salt);`

### 3. `bcrypt.compare(plainPassword, hashedPassword)`
*   **Purpose**: Checks if a plain text password (entered by the user during login) matches the stored hashed password.
*   **Used in**: Login process.
*   **Code**: `const isMatch = await bcrypt.compare(password, existingUser.password);`
    *   It re-hashes the input password using the salt from the stored hash and checks if the result matches.

---

# Where is it used?

**File**: `backend/controllers/authController.js`

### 1. **Signup Controller (`signup`)**
When a new user registers:
```javascript
// backend/controllers/authController.js

// 1. Generate a salt
const salt = await bcrypt.genSalt(10);

// 2. Hash the user's password with the salt
const hashedpassword = await bcrypt.hash(password, salt);

// 3. Save the 'hashedpassword' to the database, NOT the original 'password'
const newUser = await User.create({
  // ...
  password: hashedpassword, 
  // ...
});
```

### 2. **Login Controller (`login`)**
When a user attempts to log in:
```javascript
// backend/controllers/authController.js

// 1. Get the user from the database
const existingUser = await User.findOne({ email: normalizedEmail });

// 2. Compare the entered password with the stored hash
// returns true if match, false otherwise
const isMatch = await bcrypt.compare(password, existingUser.password);

if (!isMatch) {
  return res.status(400).json({ error: "Invalid details" });
}
```
