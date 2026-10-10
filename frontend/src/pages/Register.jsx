import "../App.css";

function Register({ onBack }) {
  const handleRegister = async (event) => {
    event.preventDefault();

    const name = event.target.name.value;
    const email = event.target.email.value;
    const password = event.target.password.value;

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      alert(data.message);
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>Create Account</h1>

        <p className="login-subtitle">
          Create your Museoras account
        </p>

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              required
            />
          </div>

          <button
            type="submit"
            className="login-submit"
          >
            Register
          </button>
        </form>

        <button
          type="button"
          className="back-btn"
          onClick={onBack}
        >
          ← Back to Gallery
        </button>
      </div>
    </div>
  );
}

export default Register;