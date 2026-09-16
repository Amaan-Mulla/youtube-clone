import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../lib/apiClient.js";

function UploadPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    async function checkAuthentication() {
      try {
        await apiClient("/users/current-user");
      } catch (error) {
        navigate("/login");
      } finally {
        setIsAuthChecking(false);
      }
    }

    checkAuthentication();
  }, [navigate]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (isAuthChecking) {
      return;
    }

    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!description.trim()) {
      setError("Description is required");
      return;
    }

    if (!videoFile) {
      setError("Video file is required");
      return;
    }

    if (!thumbnail) {
      setError("Thumbnail is required");
      return;
    }

    const formData = new FormData();

    formData.append("title", title);
    formData.append("description", description);
    formData.append("videoFile", videoFile);
    formData.append("thumbnail", thumbnail);

    try {
      setIsUploading(true);

      const response = await apiClient("/videos", {
        method: "POST",
        body: formData,
      });

      console.log("Video uploaded successfully:", response);

      navigate("/");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div>
      <h1>Upload Video</h1>

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">
            Title
          </label>

          <input
            id="title"
            type="text"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            disabled={isUploading}
          />
        </div>

        <div>
          <label htmlFor="description">
            Description
          </label>

          <textarea
            id="description"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            disabled={isUploading}
          />
        </div>

        <div>
          <label htmlFor="videoFile">
            Video
          </label>

          <input
            id="videoFile"
            type="file"
            accept="video/*"
            onChange={(event) =>
              setVideoFile(event.target.files[0])
            }
            disabled={isUploading}
          />
        </div>

        <div>
          <label htmlFor="thumbnail">
            Thumbnail
          </label>

          <input
            id="thumbnail"
            type="file"
            accept="image/*"
            onChange={(event) =>
              setThumbnail(event.target.files[0])
            }
            disabled={isUploading}
          />
        </div>

        <button
          type="submit"
          disabled={isUploading || isAuthChecking}
        >
          {isUploading
            ? "Uploading..."
            : "Publish Video"}
        </button>
      </form>
    </div>
  );
}

export default UploadPage;