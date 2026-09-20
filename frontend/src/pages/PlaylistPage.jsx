import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import VideoCard from "../components/video/VideoCard.jsx";
import { apiClient } from "../lib/apiClient.js";

function PlaylistPage() {
  const { playlistId } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [removingVideoId, setRemovingVideoId] = useState(null);
  const [removeVideoError, setRemoveVideoError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    async function fetchPlaylist() {
      try {
        setIsLoading(true);
        setError("");

        const response = await apiClient(`/playlists/${playlistId}`, {
          signal: controller.signal,
        });

        if (isActive) {
          setPlaylist(response.data);
        }
      } catch (error) {
        if (isActive && error.name !== "AbortError") {
          setError(error.message);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    fetchPlaylist();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [playlistId]);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    async function fetchCurrentUser() {
      try {
        const response = await apiClient("/users/current-user", {
          signal: controller.signal,
        });

        if (isActive) {
          setCurrentUser(response.data);
        }
      } catch (error) {
        if (isActive && error.name !== "AbortError") {
          setCurrentUser(null);
        }
      }
    }

    fetchCurrentUser();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [playlistId]);

  if (isLoading) {
    return (
      <main className="playlist-page">
        <p className="playlist-status-message">
          Loading playlist...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="playlist-page">
        <p className="playlist-error">{error}</p>
      </main>
    );
  }

  if (!playlist) {
    return (
      <main className="playlist-page">
        <p className="playlist-status-message">
          Playlist not found.
        </p>
      </main>
    );
  }

  const isPlaylistOwner =
    currentUser?._id === playlist.owner;

  async function handleRemoveVideo(videoId) {
    if (removingVideoId === videoId) {
      return;
    }

    const confirmed = window.confirm(
      "Remove this video from the playlist?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setRemoveVideoError("");
      setRemovingVideoId(videoId);

      await apiClient(
        `/playlists/${playlistId}/videos/${videoId}`,
        {
          method: "DELETE",
        }
      );

      setPlaylist((previousPlaylist) => ({
        ...previousPlaylist,
        videos: previousPlaylist.videos.filter(
          (video) => video._id !== videoId
        ),
      }));
    } catch (error) {
      setRemoveVideoError(error.message);
    } finally {
      setRemovingVideoId(null);
    }
  }

  return (
    <main className="playlist-page">
      <header className="playlist-header">
        <div className="playlist-header-content">
          <h1 className="playlist-title">{playlist.name}</h1>

          {playlist.description && (
            <p className="playlist-description">
              {playlist.description}
            </p>
          )}

          <p className="playlist-video-count">
            {playlist.videos.length}{" "}
            {playlist.videos.length === 1 ? "video" : "videos"}
          </p>
        </div>
      </header>

      {removeVideoError && (
        <p className="playlist-error playlist-remove-error">
          {removeVideoError}
        </p>
      )}

      {playlist.videos.length === 0 ? (
        <p className="playlist-status-message playlist-empty-message">
          No videos in this playlist.
        </p>
      ) : (
        <div className="playlist-video-grid">
          {playlist.videos.map((video) => (
            <article
              className="playlist-video-item"
              key={video._id}
            >
              <VideoCard video={video} />

              {isPlaylistOwner && (
                <button
                  className="playlist-remove-button"
                  onClick={() => handleRemoveVideo(video._id)}
                  disabled={removingVideoId === video._id}
                >
                  {removingVideoId === video._id
                    ? "Removing..."
                    : "Remove from Playlist"}
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default PlaylistPage;