import "../App.css";

function Login({ onBack, onRegister }) {
  const handleLogin = async (event) => {
  event.preventDefault();

  const email = event.target.email.value;
  const password = event.target.password.value;

  try {
    const response = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    alert(data.message);

if (response.ok && data.message === "Login successful!") {
  onBack();
}
  } catch (error) {
    console.error("Login error:", error);
    alert("Login failed. Please try again.");
  }
};

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>Welcome Back</h1>
        <p className="login-subtitle">
          Login to your Museoras account
        </p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" placeholder="Enter your email" required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" placeholder="Enter your password" required />
          </div>

          <button type="submit" className="login-submit">
            Login
          </button>
        </form>

        <p className="register-text">
          Don't have an account?{" "}
          <button type="button" onClick={onRegister}>
  Register
</button>
        </p>

        <button className="back-btn" onClick={onBack}>
          ← Back to Gallery
        </button>
      </div>
    </div>
  );
}

export default Login;