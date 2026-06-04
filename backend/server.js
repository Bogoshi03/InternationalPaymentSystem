const express = require("express");
const app = express();
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later."
});

app.use(limiter);
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  if (req.headers["x-forwarded-proto"] !== "https") {
    console.log("Warning: Connection not secure (HTTP)");
  }
  next();
});

let users = [];
let payments = [];

let employees = [
  {
    username: "employee1",
    password: "$2b$10$UjS2pN5wQKk2xWf8cT8J8eM5xYjD2kVxV8rK2nR1vYwF9xQJm5JbS"
  }
];
let loginAttempts = {}; 

// ================= REGISTER =================
app.post("/register", async (req, res) => {
  try {
    const { name, account, password } = req.body;

    if (!name || !account || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const existingUser = users.find(u => u.account === account);
    if (existingUser) {
      return res.status(400).json({ message: "Account already exists" });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({ message: "Weak password" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    users.push({
      name,
      account,
      password: hashedPassword
    });

    console.log("USER SAVED:", users);

    res.json({ message: "User registered successfully" });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= LOGIN =================
app.post("/login", async (req, res) => {
  const { account, password } = req.body;

  try {
    // 🔐 Track attempts
    if (!loginAttempts[account]) {
      loginAttempts[account] = 0;
    }

    loginAttempts[account]++;

    if (loginAttempts[account] > 5) {
      return res.status(429).json({ message: "Too many login attempts" });
    }

    const user = users.find(u => u.account === account);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ Reset attempts on success
    loginAttempts[account] = 0;

    const token = jwt.sign(
      { account: user.account },
      "supersecretkey",
      { expiresIn: "1h" }
    );

    console.log("LOGIN SUCCESS");

    res.json({ message: "Login successful", token });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/employee-login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const employee = employees.find(
      e => e.username === username
    );

    if (!employee) {
      return res.status(400).json({
        message: "Employee not found"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      employee.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      {
        username: employee.username,
        role: "employee"
      },
      "supersecretkey",
      { expiresIn: "1h" }
    );

    res.json({
      message: "Employee login successful",
      token
    });

  } catch (err) {
    res.status(500).json({
      message: "Server error"
    });
  }
});

app.post("/payment", (req, res) => {

  console.log("PAYMENT ROUTE HIT");
  console.log(req.body);

  const {
    amount,
    currency,
    provider,
    swiftCode,
    beneficiaryAccount
  } = req.body;

  if (
    !amount ||
    !currency ||
    !provider ||
    !swiftCode ||
    !beneficiaryAccount
  ) {
    return res.status(400).json({
      message: "Missing payment information"
    });
  }

  const payment = {
    id: payments.length + 1,
    amount,
    currency,
    provider,
    swiftCode,
    beneficiaryAccount,
    status: "Pending"
  };

  payments.push(payment);

  console.log("PAYMENT CREATED:", payment);

  res.json({
    message: "Payment submitted successfully"
  });
});

// ================= DASHBOARD =================
app.get("/dashboard", (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Access denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    jwt.verify(token, "supersecretkey");
    res.json({ message: "Welcome to secure dashboard" });
  } catch {
    res.status(403).json({ message: "Invalid token" });
  }
});

app.get("/test", (req, res) => {
  res.json({
    message: "Backend is updated"
  });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});