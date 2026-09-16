import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../lib/apiClient.js";

function AccountPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [selectedCoverImage, setSelectedCoverImage] = useState(null);
  const [isUpdatingCoverImage, setIsUpdatingCoverImage] = useState(false);
  const [coverImageError, setCoverImageError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        setError("");

        const response = await apiClient(
          "/users/current-user"
        );

        setCurrentUser(response.data);
      } catch (error) {
        if (error.statusCode === 401) {
          navigate("/login");
          return;
        }

        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCurrentUser();
  }, [navigate]);

  function handleEditAccount() {
    setIsEditing(true);
    setEditFullName(currentUser.fullName);
    setEditEmail(currentUser.email);
    setUpdateError("");
  }

  async function handleAvatarSubmit(event) {
    event.preventDefault();

    if (!selectedAvatar) {
      setAvatarError("Please select an avatar.");
      return;
    }

    try {
      setIsUpdatingAvatar(true);
      setAvatarError("");

      const formData = new FormData();
      formData.append("avatar", selectedAvatar);

      const response = await apiClient(
        "/users/update-avatar",
        {
          method: "PATCH",
          body: formData,
        }
      );

      setCurrentUser(response.data);
      setSelectedAvatar(null);
      setAvatarError("");
    } catch (error) {
      setAvatarError(error.message);
    } finally {
      setIsUpdatingAvatar(false);
    }
  }

  async function handleCoverImageSubmit(event) {
    event.preventDefault();

    if (!selectedCoverImage) {
      setCoverImageError("Please select a cover image.");
      return;
    }

    try {
      setIsUpdatingCoverImage(true);
      setCoverImageError("");

      const formData = new FormData();
      formData.append("coverImage", selectedCoverImage);

      const response = await apiClient(
        "/users/update-cover-image",
        {
          method: "PATCH",
          body: formData,
        }
      );

      setCurrentUser(response.data);
      setSelectedCoverImage(null);
      setCoverImageError("");
    } catch (error) {
      setCoverImageError(error.message);
    } finally {
      setIsUpdatingCoverImage(false);
    }
  }

  async function handleChangePassword(event) {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    try {
      setIsChangingPassword(true);

      await apiClient(
        "/users/change-password",
        {
          method: "POST",
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      setPasswordSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordError(error.message);
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!editFullName.trim() || !editEmail.trim()) {
      setUpdateError("Full name and email are required.");
      return;
    }

    try {
      setIsUpdating(true);
      setUpdateError("");

      const response = await apiClient(
        "/users/update-account-details",
        {
          method: "PATCH",
          body: JSON.stringify({
            fullName: editFullName,
            email: editEmail,
          }),
        }
      );

      setCurrentUser(response.data);
      setIsEditing(false);
    } catch (error) {
      setUpdateError(error.message);
    } finally {
      setIsUpdating(false);
    }
  }

  function handleCancel() {
    setIsEditing(false);
    setUpdateError("");
  }

  if (isLoading) {
    return <p>Loading account...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!currentUser) {
    return <p>User information not found.</p>;
  }

  return (
    <div>
      <h1>My Account</h1>

      {currentUser.coverImage && (
        <img
          src={currentUser.coverImage}
          alt="Cover"
        />
      )}

      <form onSubmit={handleCoverImageSubmit}>
        <label>
          Cover Image
          <input
            type="file"
            accept="image/*"
            disabled={isUpdatingCoverImage}
            onChange={(event) => {
              setSelectedCoverImage(event.target.files[0] || null);
              setCoverImageError("");
            }}
          />
        </label>

        {coverImageError && <p>{coverImageError}</p>}

        <button type="submit" disabled={isUpdatingCoverImage}>
          {isUpdatingCoverImage ? "Uploading..." : "Update Cover Image"}
        </button>
      </form>

      <div>
        <img
          src={currentUser.avatar}
          alt={currentUser.username}
          width="100"
          height="100"
        />

        <form onSubmit={handleAvatarSubmit}>
          <label>
            Change Avatar
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                setSelectedAvatar(event.target.files[0] || null);
                setAvatarError("");
              }}
            />
          </label>

          {avatarError && <p>{avatarError}</p>}

          <button type="submit" disabled={isUpdatingAvatar}>
            {isUpdatingAvatar ? "Uploading..." : "Update Avatar"}
          </button>
        </form>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <label>
            Full Name
            <input
              type="text"
              value={editFullName}
              onChange={(event) => setEditFullName(event.target.value)}
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={editEmail}
              onChange={(event) => setEditEmail(event.target.value)}
            />
          </label>

          {updateError && <p>{updateError}</p>}

          <button type="submit" disabled={isUpdating}>
            {isUpdating ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" onClick={handleCancel} disabled={isUpdating}>
            Cancel
          </button>
        </form>
      ) : (
        <>
          <h2>{currentUser.fullName}</h2>

          <p>@{currentUser.username}</p>

          <p>{currentUser.email}</p>

          <button type="button" onClick={handleEditAccount}>
            Edit Account
          </button>
        </>
      )}

      <form onSubmit={handleChangePassword}>
        <h2>Change Password</h2>

        <label>
          Current Password
          <input
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
        </label>

        <label>
          New Password
          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
        </label>

        <label>
          Confirm New Password
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </label>

        {passwordError && <p>{passwordError}</p>}
        {passwordSuccess && <p>{passwordSuccess}</p>}

        <button type="submit" disabled={isChangingPassword}>
          {isChangingPassword ? "Changing Password..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}

export default AccountPage;