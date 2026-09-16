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
    return <p>Loading playlist...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!playlist) {
    return <p>Playlist not found.</p>;
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
    <div>
      <h1>{playlist.name}</h1>
      <p>{playlist.description}</p>
      <p>{playlist.videos.length} videos</p>

      {removeVideoError && <p>{removeVideoError}</p>}

      {playlist.videos.length === 0 ? (
        <p>No videos in this playlist.</p>
      ) : (
        <div>
          {playlist.videos.map((video) => (
            <div key={video._id}>
              <VideoCard video={video} />

              {isPlaylistOwner && (
                <button
                  onClick={() => handleRemoveVideo(video._id)}
                  disabled={removingVideoId === video._id}
                >
                  {removingVideoId === video._id
                    ? "Removing..."
                    : "Remove"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PlaylistPage;
