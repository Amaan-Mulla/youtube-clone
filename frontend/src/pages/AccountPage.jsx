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
    return (
      <main className="account-page">
        <p className="account-status-message">
          Loading account...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="account-page">
        <p className="account-error">{error}</p>
      </main>
    );
  }

  if (!currentUser) {
    return (
      <main className="account-page">
        <p className="account-status-message">
          User information not found.
        </p>
      </main>
    );
  }

  return (
    <main className="account-page">
      <h1 className="account-title">My Account</h1>

      <section className="account-profile-section">
        {currentUser.coverImage && (
          <img
            className="account-cover-image"
            src={currentUser.coverImage}
            alt="Cover"
          />
        )}

        <div className="account-profile-content">
          <img
            className="account-avatar"
            src={currentUser.avatar}
            alt={currentUser.username}
          />

          <div className="account-profile-info">
            <h2>{currentUser.fullName}</h2>
            <p>@{currentUser.username}</p>
          </div>
        </div>
      </section>

      <section className="account-section">
        <div className="account-section-header">
          <div>
            <h2>Profile Images</h2>
            <p>Update your avatar and cover image.</p>
          </div>
        </div>

        <div className="account-image-actions">
          <form
            className="account-image-form"
            onSubmit={handleAvatarSubmit}
          >
            <label className="account-field-label">
              Change Avatar
            </label>

            <input
              className="account-file-input"
              type="file"
              accept="image/*"
              onChange={(event) => {
                setSelectedAvatar(event.target.files[0] || null);
                setAvatarError("");
              }}
            />

            {avatarError && (
              <p className="account-error">
                {avatarError}
              </p>
            )}

            <button
              className="account-primary-button"
              type="submit"
              disabled={isUpdatingAvatar}
            >
              {isUpdatingAvatar ? "Uploading..." : "Update Avatar"}
            </button>
          </form>

          <form
            className="account-image-form"
            onSubmit={handleCoverImageSubmit}
          >
            <label className="account-field-label">
              Change Cover Image
            </label>

            <input
              className="account-file-input"
              type="file"
              accept="image/*"
              disabled={isUpdatingCoverImage}
              onChange={(event) => {
                setSelectedCoverImage(event.target.files[0] || null);
                setCoverImageError("");
              }}
            />

            {coverImageError && (
              <p className="account-error">
                {coverImageError}
              </p>
            )}

            <button
              className="account-primary-button"
              type="submit"
              disabled={isUpdatingCoverImage}
            >
              {isUpdatingCoverImage
                ? "Uploading..."
                : "Update Cover Image"}
            </button>
          </form>
        </div>
      </section>

      <section className="account-section">
        <div className="account-section-header">
          <div>
            <h2>Account Details</h2>
            <p>Manage your personal account information.</p>
          </div>
        </div>

        {isEditing ? (
          <form
            className="account-form"
            onSubmit={handleSubmit}
          >
            <label className="account-field">
              <span>Full Name</span>

              <input
                className="account-input"
                type="text"
                value={editFullName}
                onChange={(event) =>
                  setEditFullName(event.target.value)
                }
              />
            </label>

            <label className="account-field">
              <span>Email</span>

              <input
                className="account-input"
                type="email"
                value={editEmail}
                onChange={(event) =>
                  setEditEmail(event.target.value)
                }
              />
            </label>

            {updateError && (
              <p className="account-error">
                {updateError}
              </p>
            )}

            <div className="account-button-group">
              <button
                className="account-primary-button"
                type="submit"
                disabled={isUpdating}
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>

              <button
                className="account-secondary-button"
                type="button"
                onClick={handleCancel}
                disabled={isUpdating}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="account-details">
            <div className="account-detail-row">
              <span>Name</span>
              <strong>{currentUser.fullName}</strong>
            </div>

            <div className="account-detail-row">
              <span>Username</span>
              <strong>@{currentUser.username}</strong>
            </div>

            <div className="account-detail-row">
              <span>Email</span>
              <strong>{currentUser.email}</strong>
            </div>

            <button
              className="account-primary-button"
              type="button"
              onClick={handleEditAccount}
            >
              Edit Account
            </button>
          </div>
        )}
      </section>

      <section className="account-section">
        <div className="account-section-header">
          <div>
            <h2>Change Password</h2>
            <p>Update your password to keep your account secure.</p>
          </div>
        </div>

        <form
          className="account-form"
          onSubmit={handleChangePassword}
        >
          <label className="account-field">
            <span>Current Password</span>

            <input
              className="account-input"
              type="password"
              value={currentPassword}
              onChange={(event) =>
                setCurrentPassword(event.target.value)
              }
            />
          </label>

          <label className="account-field">
            <span>New Password</span>

            <input
              className="account-input"
              type="password"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(event.target.value)
              }
            />
          </label>

          <label className="account-field">
            <span>Confirm New Password</span>

            <input
              className="account-input"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
            />
          </label>

          {passwordError && (
            <p className="account-error">
              {passwordError}
            </p>
          )}

          {passwordSuccess && (
            <p className="account-success">
              {passwordSuccess}
            </p>
          )}

          <button
            className="account-primary-button"
            type="submit"
            disabled={isChangingPassword}
          >
            {isChangingPassword
              ? "Changing Password..."
              : "Change Password"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default AccountPage;