import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate= useNavigate();
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await axios.post("http://localhost:5000/register", { email, password });
      setSuccess("Registration successful! You can now log in.");
      navigate("/login");
    } catch (err) {
      setError("Failed to register. Try again.");
    }
  };

  return (
    <div>
      <h2>Register</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <form onSubmit={handleRegister}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
