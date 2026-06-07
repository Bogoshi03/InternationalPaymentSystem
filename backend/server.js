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

let users = [
  {
    name: "John Doe",
    account: "12345678",
    password:
      "$2b$10$5xNpxGK36qocFgA6TI5Sb.MI26UcbSHndrFzFWEK/y7lhTxSms19y"
  }
];

let payments = [];

let employees = [
  {
    username: "employee1",
    password: "$2b$10$5xNpxGK36qocFgA6TI5Sb.MI26UcbSHndrFzFWEK/y7lhTxSms19y"
  }
];
let loginAttempts = {}; 

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
  console.log(req.body);

  const { username, password } = req.body;

  try {
    const employee = employees.find(
      e => e.username === username
    );

      console.log("USERNAME RECEIVED:", username);
      console.log("EMPLOYEE FOUND:", employee);

    if (!employee) {
      return res.status(400).json({
        message: "Employee not found"
      });
    }

    const isMatch = await bcrypt.compare(password, employee.password);

    console.log("PASSWORD MATCH:", isMatch);

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
    status: "Pending",
    verified: false
  };

  payments.push(payment);

  console.log("PAYMENT CREATED:", payment);

  res.json({
    message: "Payment submitted successfully"
  });
});

app.get("/payments", (req, res) => {
  res.json(payments);
});

app.post("/verify-payment", (req, res) => {

    const { index } = req.body;

    if (payments[index]) {

        payments[index].verified = true;
        payments[index].status = "Verified";

        return res.json({
            message: "Payment verified"
        });
    }

    res.status(404).json({
        message: "Payment not found"
    });

});

app.post("/submit-swift", (req, res) => {

    const { index } = req.body;

    if (payments[index]) {

        if (!payments[index].verified) {
            return res.status(400).json({
                message: "Payment must be verified first"
            });
        }

        payments[index].status = "Submitted To SWIFT";

        return res.json({
            message: "Payment submitted to SWIFT"
        });
    }

    res.status(404).json({
        message: "Payment not found"
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