import React, { useState } from "react";

function App() {
  const [name, setName] = useState("");
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("");
  const [provider, setProvider] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [beneficiaryAccount, setBeneficiaryAccount] = useState("");

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!passwordRegex.test(password)) {
      setMessage("Password must be strong (8 chars, uppercase, number, symbol)");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          account,
          password,
        }),
      });

      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage("Error connecting to server");
    }
  };

const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ account, password }),
    });

    const data = await response.json();

    if (response.ok) {
      setMessage("Login successful");

      // 🔐 STORE TOKEN
      localStorage.setItem("token", data.token);

      console.log("Token saved:", data.token);
    } else {
      setMessage(data.message);
    }

  } catch (error) {
    setMessage("Error connecting to server");
  };
};

const accessDashboard = async () => {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch("http://localhost:5000/dashboard", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    setMessage(data.message);

  } catch (error) {
    setMessage("Access denied");
  }
};

const handlePayment = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch(
      "http://localhost:5000/payment",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          currency,
          provider,
          swiftCode,
          beneficiaryAccount,
        }),
      }
    );

    const data = await response.json();
    setMessage(data.message);

  } catch (error) {
    console.error(error);
    setMessage("Payment failed");
  }
};

  return (
    <div style={{ padding: "20px" }}>
      <h2>Register</h2>

      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <br />
        <br />

        <input
          type="text"
          placeholder="Account Number"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
        />
        <br />
        <br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <br />

        <button type="submit">Register</button>
      </form>

      <p>{message}</p>

      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Account Number"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
        />
        <br />
        <br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <br />

        <button type="submit">Login</button>
      </form>

      <br />
      <button onClick={accessDashboard}>Access Dashboard</button>
      <hr />

<h2>International Payment</h2>

<form onSubmit={handlePayment}>

  <input
    type="number"
    placeholder="Amount"
    value={amount}
    onChange={(e) => setAmount(e.target.value)}
  />

  <br /><br />

  <input
    type="text"
    placeholder="Currency (USD)"
    value={currency}
    onChange={(e) => setCurrency(e.target.value)}
  />

  <br /><br />

  <input
    type="text"
    placeholder="Provider (SWIFT)"
    value={provider}
    onChange={(e) => setProvider(e.target.value)}
  />

  <br /><br />

  <input
    type="text"
    placeholder="SWIFT Code"
    value={swiftCode}
    onChange={(e) => setSwiftCode(e.target.value)}
  />

  <br /><br />

  <input
    type="text"
    placeholder="Beneficiary Account"
    value={beneficiaryAccount}
    onChange={(e) =>
      setBeneficiaryAccount(e.target.value)
    }
  />

  <br /><br />

  <button type="submit">
    Pay Now
  </button>

</form>
    </div>
  );
}

export default App;
