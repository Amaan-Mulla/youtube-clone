import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../lib/apiClient.js";

function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!avatar) {
      setError("Avatar is required");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();

      formData.append("fullName", fullName);
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("avatar", avatar);

      if (coverImage) {
        formData.append("coverImage", coverImage);
      }

      const response = await apiClient("/users/register", {
        method: "POST",
        body: formData,
      });

      console.log("Registration successful:", response);

      navigate("/login");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h1>Register</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="avatar">Avatar</label>
          <input
            id="avatar"
            type="file"
            accept="image/*"
            onChange={(event) => setAvatar(event.target.files[0])}
          />
        </div>

        <div>
          <label htmlFor="coverImage">Cover Image</label>
          <input
            id="coverImage"
            type="file"
            accept="image/*"
            onChange={(event) => setCoverImage(event.target.files[0])}
          />
        </div>

        {error && <p>{error}</p>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Register"}
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;