import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("");
  const [provider, setProvider] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [beneficiaryAccount, setBeneficiaryAccount] = useState("");
  const [employeeUsername, setEmployeeUsername] = useState("");
  const [employeePassword, setEmployeePassword] = useState("");
  const [employeeLoggedIn, setEmployeeLoggedIn] = useState(false);
  const [payments, setPayments] = useState([]);

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  const nameRegex = /^[A-Za-z ]+$/;

  const accountRegex = /^[0-9]{6,12}$/;

  const currencyRegex = /^(USD|EUR|GBP|ZAR)$/;

  const providerRegex = /^(SWIFT)$/;

  const swiftRegex =
  /^[A-Z0-9]{6,11}$/;

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

      const employeeLogin = async () => {

    try {

        const response = await axios.post(
            "http://localhost:5000/employee-login",
            {
                username: employeeUsername,
                password: employeePassword
            }
        );

        alert(response.data.message);

        setEmployeeLoggedIn(true);

        loadPayments();

    } catch (error) {

        alert(
            error.response?.data?.message ||
            "Employee login failed"
        );

    }
};

const loadPayments = async () => {
  try {
    const response = await axios.get(
      "http://localhost:5000/payments"
    );

    setPayments(response.data);
  } catch (error) {
    console.error(error);
  }
};

const verifyPayment = async (index) => {
  try {
    const response = await axios.post(
      "http://localhost:5000/verify-payment",
      { index }
    );

    alert(response.data.message);

    loadPayments();
  } catch (error) {
    console.error(error);
  }
};

const submitToSwift = async (index) => {

    try {

        const response =
            await axios.post(
                "http://localhost:5000/submit-swift",
                { index }
            );

        alert(response.data.message);

        loadPayments();

    } catch (error) {

        alert(
            error.response?.data?.message ||
            "Failed to submit payment"
        );

    }
};


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

  if (!accountRegex.test(beneficiaryAccount)) {
  setMessage("Invalid beneficiary account");
  return;
}

if (!currencyRegex.test(currency)) {
  setMessage("Currency must be USD, EUR, GBP or ZAR");
  return;
}

if (!providerRegex.test(provider)) {
  setMessage("Provider must be SWIFT");
  return;
}

if (!swiftRegex.test(swiftCode)) {
  setMessage("Invalid SWIFT code");
  return;
}

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

const loadPayments = async () => {

    try {

        const response =
            await axios.get(
                "http://localhost:5000/payments"
            );

        setPayments(response.data);

    } catch (error) {

        console.error(error);

    }
};

const employeeLogin = async () => {

    try {

        const response =
            await axios.post(
                "http://localhost:5000/employee-login",
                {
                    username: employeeUsername,
                    password: employeePassword
                }
            );

        alert(response.data.message);

        setEmployeeLoggedIn(true);

        loadPayments();

    } catch (error) {

        alert("Employee login failed");

    }
};

const verifyPayment = async (index) => {

    try {

        await axios.post(
            "http://localhost:5000/verify-payment",
            { index }
        );

        loadPayments();

    } catch (error) {

        console.error(error);

    }
};

const submitToSwift = async (index) => {

    try {

        const response =
            await axios.post(
                "http://localhost:5000/submit-swift",
                { index }
            );

        alert(response.data.message);

        loadPayments();

    } catch (error) {

        alert(
            error.response?.data?.message ||
            "Failed to submit payment"
        );

    }
};

  return (
    <div style={{ padding: "20px" }}>

    <p>
Customer Account: 12345678
<br />
Customer Password: password123
</p>
      
      <h2>Login</h2>

      <p> {message}</p>

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

      <hr />



<h1>Employee Portal</h1>

<input
    placeholder="Username"
    value={employeeUsername}
    onChange={(e) =>
        setEmployeeUsername(e.target.value)
    }
/>

<br /><br />

<input
    type="password"
    placeholder="Password"
    value={employeePassword}
    onChange={(e) =>
        setEmployeePassword(e.target.value)
    }
/>

<br /><br />

<button onClick={employeeLogin}>
    Employee Login
</button>

{
employeeLoggedIn && (

<div>

<h2>Pending Payments</h2>

{
payments.map((payment, index) => (

<div key={payment.id}>

<p>
Amount:
{payment.amount}
{" "}
{payment.currency}
</p>

<p>
Provider:
{payment.provider}
</p>

<p>
SWIFT:
{payment.swiftCode}
</p>

<p>
Account:
{payment.beneficiaryAccount}
</p>

<p>
Status:
{payment.status}
</p>

<p>
  Verified: {payment.verified ? "Yes" : "No"}
</p>

<button
onClick={() =>
verifyPayment(index)
}
>
Verify
</button>

<button
onClick={() =>
submitToSwift(index)
}
>
Submit To SWIFT
</button>

<hr />

</div>

))
}

</div>

)
}

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
