import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { apiClient } from "../lib/apiClient.js";
import VideoCard from "../components/video/VideoCard.jsx";

function ChannelPage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const videosPage = Number(searchParams.get("videosPage")) || 1;

  // ---------------- CHANNEL STATE ----------------

  const [channel, setChannel] = useState(null);
  const [channelLoading, setChannelLoading] = useState(true);
  const [channelError, setChannelError] = useState("");

  // ---------------- PLAYLIST STATE ----------------

  const [playlists, setPlaylists] = useState([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(true);
  const [playlistsError, setPlaylistsError] = useState("");
  const [playlistName, setPlaylistName] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState("");
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [createPlaylistError, setCreatePlaylistError] = useState("");
  const [editingPlaylistId, setEditingPlaylistId] = useState(null);
  const [editPlaylistName, setEditPlaylistName] = useState("");
  const [editPlaylistDescription, setEditPlaylistDescription] =
    useState("");
  const [isUpdatingPlaylist, setIsUpdatingPlaylist] = useState(false);
  const [updatePlaylistError, setUpdatePlaylistError] = useState("");
  const [deletingPlaylistId, setDeletingPlaylistId] = useState(null);
  const [deletePlaylistError, setDeletePlaylistError] = useState("");

  // ---------------- PUBLIC VIDEOS STATE ----------------

  const [videos, setVideos] = useState([]);
  const [videosPagination, setVideosPagination] = useState(null);
  const [videosLoading, setVideosLoading] = useState(true);
  const [videosError, setVideosError] = useState("");

  // ---------------- MY VIDEOS STATE ----------------

  const [myVideos, setMyVideos] = useState([]);
  const [myVideosLoading, setMyVideosLoading] = useState(false);
  const [myVideosError, setMyVideosError] = useState("");

  const [togglingVideoId, setTogglingVideoId] = useState(null);
  const [togglePublishError, setTogglePublishError] = useState("");

  const [deletingVideoId, setDeletingVideoId] = useState(null);
  const [deleteVideoError, setDeleteVideoError] = useState("");

  // ---------------- CURRENT USER STATE ----------------

  const [currentUser, setCurrentUser] = useState(null);

  // ---------------- SUBSCRIPTION STATE ----------------

  const [isSubscriptionLoading, setIsSubscriptionLoading] =
    useState(false);
  const [subscriptionError, setSubscriptionError] =
    useState("");

  // ---------------- FETCH CHANNEL ----------------

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    async function fetchChannel() {
      try {
        setChannelLoading(true);
        setChannelError("");

        const response = await apiClient(
          `/users/channel/${username}`,
          { signal: controller.signal }
        );

        if (isActive) {
          setChannel(response.data);
        }
      } catch (error) {
        if (isActive && error.name !== "AbortError") {
          setChannelError(error.message);
        }
      } finally {
        if (isActive) {
          setChannelLoading(false);
        }
      }
    }

    async function fetchCurrentUser() {
      try {
        const response = await apiClient(
          "/users/current-user",
          { signal: controller.signal }
        );

        if (isActive) {
          setCurrentUser(response.data);
        }
      } catch (error) {
        if (isActive && error.name !== "AbortError") {
          setCurrentUser(null);
        }
      }
    }

    fetchChannel();
    fetchCurrentUser();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [username]);

  // ---------------- FETCH CHANNEL PLAYLISTS ----------------

  useEffect(() => {
    if (!channel?._id) {
      return;
    }

    const controller = new AbortController();
    let isActive = true;

    async function fetchChannelPlaylists() {
      try {
        setPlaylistsLoading(true);
        setPlaylistsError("");

        const response = await apiClient(
          `/playlists/channel/${channel._id}`,
          { signal: controller.signal }
        );

        if (isActive) {
          setPlaylists(response.data);
        }
      } catch (error) {
        if (isActive && error.name !== "AbortError") {
          setPlaylistsError(error.message);
        }
      } finally {
        if (isActive) {
          setPlaylistsLoading(false);
        }
      }
    }

    fetchChannelPlaylists();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [channel?._id]);

  // ---------------- FETCH PUBLIC CHANNEL VIDEOS ----------------

  useEffect(() => {
    if (!channel?._id) {
      return;
    }

    const controller = new AbortController();
    let isActive = true;

    async function fetchChannelVideos() {
      try {
        setVideosError("");
        setVideosPagination(null);
        setVideosLoading(true);

        const response = await apiClient(
          `/videos/channel/${channel._id}?page=${videosPage}&limit=5`,
          { signal: controller.signal }
        );

        if (isActive) {
          setVideos(response.data.docs);
          setVideosPagination(response.data);
        }
      } catch (error) {
        if (isActive && error.name !== "AbortError") {
          setVideosError(error.message);
        }
      } finally {
        if (isActive) {
          setVideosLoading(false);
        }
      }
    }

    fetchChannelVideos();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [channel?._id, videosPage]);

  // ---------------- FETCH MY VIDEOS ----------------

  useEffect(() => {
    if (!channel?._id || !currentUser) {
      return;
    }

    const isOwner = currentUser._id === channel._id;

    if (!isOwner) {
      return;
    }

    const controller = new AbortController();
    let isActive = true;

    async function fetchMyVideos() {
      try {
        setMyVideosError("");
        setMyVideosLoading(true);

        const response = await apiClient(
          "/videos/my-videos?page=1&limit=5",
          { signal: controller.signal }
        );

        if (isActive) {
          setMyVideos(response.data.docs);
        }
      } catch (error) {
        if (isActive && error.name !== "AbortError") {
          setMyVideosError(error.message);
        }
      } finally {
        if (isActive) {
          setMyVideosLoading(false);
        }
      }
    }

    fetchMyVideos();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [channel?._id, currentUser?._id]);

  // ---------------- SUBSCRIPTION INFO ----------------

  useEffect(() => {
    if (!channel?._id || !currentUser) {
      return;
    }

    const controller = new AbortController();
    let isActive = true;

    async function fetchSubscriptionInfo() {
      try {
        const response = await apiClient(
          `/subscriptions/c/${channel._id}`,
          { signal: controller.signal }
        );

        if (isActive) {
          setChannel((previousChannel) => {
            if (previousChannel?._id !== channel._id) {
              return previousChannel;
            }

            return {
              ...previousChannel,
              subscribersCount:
                response.data.subscriberCount,
              isSubscribed:
                response.data.isSubscribed,
            };
          });
        }
      } catch (error) {
        if (isActive && error.name !== "AbortError") {
          console.error(
            "Failed to fetch subscription information:",
            error
          );
        }
      }
    }

    fetchSubscriptionInfo();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [channel?._id, currentUser]);

  // ---------------- UI STATES ----------------

  if (channelLoading) {
    return <p>Loading channel...</p>;
  }

  if (channelError) {
    return <p>{channelError}</p>;
  }

  if (!channel) {
    return <p>Channel not found.</p>;
  }

  // ---------------- OWNER CHECK ----------------

  const isChannelOwner =
    currentUser?._id === channel._id;

  // ---------------- SUBSCRIPTION ----------------

  async function handleSubscription() {
    if (!currentUser || isChannelOwner) {
      return;
    }

    try {
      setSubscriptionError("");
      setIsSubscriptionLoading(true);

      await apiClient(
        `/subscriptions/c/${channel._id}`,
        {
          method: "POST",
        }
      );

      const response = await apiClient(
        `/subscriptions/c/${channel._id}`
      );

      setChannel((previousChannel) => ({
        ...previousChannel,
        subscribersCount:
          response.data.subscriberCount,
        isSubscribed:
          response.data.isSubscribed,
      }));
    } catch (error) {
      console.error(
        "Failed to toggle subscription:",
        error
      );
      setSubscriptionError(error.message);
    } finally {
      setIsSubscriptionLoading(false);
    }
  }

  // ---------------- CREATE PLAYLIST ----------------

  async function handleCreatePlaylist(event) {
    event.preventDefault();

    if (!playlistName.trim()) {
      setCreatePlaylistError("Playlist name is required");
      return;
    }

    try {
      setCreatePlaylistError("");
      setIsCreatingPlaylist(true);

      const response = await apiClient("/playlists", {
        method: "POST",
        body: JSON.stringify({
          name: playlistName,
          description: playlistDescription,
        }),
      });

      setPlaylists((previousPlaylists) => [
        response.data,
        ...previousPlaylists,
      ]);
      setPlaylistName("");
      setPlaylistDescription("");
    } catch (error) {
      setCreatePlaylistError(error.message);
    } finally {
      setIsCreatingPlaylist(false);
    }
  }

  // ---------------- EDIT PLAYLIST ----------------

  function handleEditPlaylist(playlist) {
    setEditingPlaylistId(playlist._id);
    setEditPlaylistName(playlist.name);
    setEditPlaylistDescription(playlist.description);
    setUpdatePlaylistError("");
  }

  function handleCancelPlaylistEdit() {
    setEditingPlaylistId(null);
    setEditPlaylistName("");
    setEditPlaylistDescription("");
    setUpdatePlaylistError("");
  }

  async function handleUpdatePlaylist(event, playlistId) {
    event.preventDefault();

    if (!editPlaylistName.trim()) {
      setUpdatePlaylistError("Playlist name is required");
      return;
    }

    try {
      setUpdatePlaylistError("");
      setIsUpdatingPlaylist(true);

      const response = await apiClient(`/playlists/${playlistId}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editPlaylistName,
          description: editPlaylistDescription,
        }),
      });

      setPlaylists((previousPlaylists) =>
        previousPlaylists.map((playlist) =>
          playlist._id === playlistId
            ? response.data
            : playlist
        )
      );
      handleCancelPlaylistEdit();
    } catch (error) {
      setUpdatePlaylistError(error.message);
    } finally {
      setIsUpdatingPlaylist(false);
    }
  }

  // ---------------- DELETE PLAYLIST ----------------

  async function handleDeletePlaylist(playlistId) {
    if (deletingPlaylistId === playlistId) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this playlist?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletePlaylistError("");
      setDeletingPlaylistId(playlistId);

      await apiClient(`/playlists/${playlistId}`, {
        method: "DELETE",
      });

      setPlaylists((previousPlaylists) =>
        previousPlaylists.filter(
          (playlist) => playlist._id !== playlistId
        )
      );
    } catch (error) {
      setDeletePlaylistError(error.message);
    } finally {
      setDeletingPlaylistId(null);
    }
  }

  // ---------------- TOGGLE PUBLISH ----------------

  async function handleTogglePublish(videoId) {
    try {
      setTogglePublishError("");
      setTogglingVideoId(videoId);

      const response = await apiClient(
        `/videos/${videoId}/toggle-publish`,
        {
          method: "PATCH",
        }
      );

      setMyVideos((previousVideos) =>
        previousVideos.map((previousVideo) =>
          previousVideo._id === videoId
            ? {
                ...response.data,
                owner: previousVideo.owner,
              }
            : previousVideo
        )
      );
    } catch (error) {
      setTogglePublishError(error.message);
    } finally {
      setTogglingVideoId(null);
    }
  }

  // ---------------- DELETE VIDEO ----------------

  async function handleDeleteVideo(videoId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this video?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteVideoError("");
      setDeletingVideoId(videoId);

      await apiClient(`/videos/${videoId}`, {
        method: "DELETE",
      });

      setMyVideos((previousVideos) =>
        previousVideos.filter(
          (video) => video._id !== videoId
        )
      );

      setVideos((previousVideos) =>
        previousVideos.filter(
          (video) => video._id !== videoId
        )
      );
    } catch (error) {
      setDeleteVideoError(error.message);
    } finally {
      setDeletingVideoId(null);
    }
  }

  // ---------------- PAGE ----------------

  return (
    <div>
      {/* COVER IMAGE */}

      {channel.coverImage && (
        <img
          src={channel.coverImage}
          alt={`${channel.username} cover`}
          width="100%"
        />
      )}

      {/* CHANNEL INFORMATION */}

      <section>
        <img
          src={channel.avatar}
          alt={channel.username}
          width="100"
        />

        <h1>{channel.fullName}</h1>

        <p>@{channel.username}</p>

        <p>{channel.subscribersCount} subscribers</p>

        {currentUser && (
          <>
            {isChannelOwner ? (
              <span>Your Channel</span>
            ) : (
              <button
                onClick={handleSubscription}
                disabled={isSubscriptionLoading}
              >
                {isSubscriptionLoading
                  ? "Loading..."
                  : channel.isSubscribed
                    ? "Unsubscribe"
                    : "Subscribe"}
              </button>
            )}

            {subscriptionError && (
              <p>{subscriptionError}</p>
            )}
          </>
        )}
      </section>

      {/* PLAYLISTS */}

      <section>
        <h2>Playlists</h2>

        {currentUser && isChannelOwner && (
          <form onSubmit={handleCreatePlaylist}>
            <div>
              <label htmlFor="playlistName">Playlist name</label>
              <input
                id="playlistName"
                type="text"
                value={playlistName}
                onChange={(event) => setPlaylistName(event.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="playlistDescription">
                Description
              </label>
              <textarea
                id="playlistDescription"
                value={playlistDescription}
                onChange={(event) =>
                  setPlaylistDescription(event.target.value)
                }
              />
            </div>

            {createPlaylistError && (
              <p>{createPlaylistError}</p>
            )}

            <button type="submit" disabled={isCreatingPlaylist}>
              {isCreatingPlaylist
                ? "Creating..."
                : "Create Playlist"}
            </button>
          </form>
        )}

        {deletePlaylistError && (
          <p>{deletePlaylistError}</p>
        )}

        {playlistsLoading && (
          <p>Loading playlists...</p>
        )}

        {playlistsError && (
          <p>{playlistsError}</p>
        )}

        {!playlistsLoading &&
          !playlistsError &&
          playlists.length === 0 && (
            <p>No playlists found.</p>
          )}

        {!playlistsLoading &&
          !playlistsError &&
          playlists.length > 0 && (
            <div>
              {playlists.map((playlist) => (
                <article key={playlist._id}>
                  {editingPlaylistId === playlist._id ? (
                    <form
                      onSubmit={(event) =>
                        handleUpdatePlaylist(event, playlist._id)
                      }
                    >
                      <div>
                        <label htmlFor="editPlaylistName">
                          Playlist name
                        </label>
                        <input
                          id="editPlaylistName"
                          type="text"
                          value={editPlaylistName}
                          onChange={(event) =>
                            setEditPlaylistName(event.target.value)
                          }
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="editPlaylistDescription">
                          Description
                        </label>
                        <textarea
                          id="editPlaylistDescription"
                          value={editPlaylistDescription}
                          onChange={(event) =>
                            setEditPlaylistDescription(event.target.value)
                          }
                        />
                      </div>

                      {updatePlaylistError && (
                        <p>{updatePlaylistError}</p>
                      )}

                      <button
                        type="submit"
                        disabled={isUpdatingPlaylist}
                      >
                        {isUpdatingPlaylist
                          ? "Saving..."
                          : "Save Playlist"}
                      </button>

                      <button
                        type="button"
                        onClick={handleCancelPlaylistEdit}
                        disabled={isUpdatingPlaylist}
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <>
                      <Link to={`/playlists/${playlist._id}`}>
                        <h3>{playlist.name}</h3>
                      </Link>

                      <p>{playlist.description}</p>
                      <p>{playlist.videos.length} videos</p>

                      {currentUser && isChannelOwner && (
                        <>
                          <button
                            onClick={() => handleEditPlaylist(playlist)}
                            disabled={isUpdatingPlaylist}
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDeletePlaylist(playlist._id)
                            }
                            disabled={
                              deletingPlaylistId === playlist._id
                            }
                          >
                            {deletingPlaylistId === playlist._id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </>
                      )}
                    </>
                  )}
                </article>
              ))}
            </div>
          )}
      </section>

      {/* PUBLIC VIDEOS */}

      <section>
        <h2>Videos</h2>

        {videosLoading && (
          <p>Loading videos...</p>
        )}

        {videosError && (
          <p>{videosError}</p>
        )}

        {!videosLoading &&
          !videosError &&
          videos.length === 0 && (
            <p>No videos found.</p>
          )}

        {!videosLoading &&
          !videosError &&
          videos.length > 0 && (
            <div>
              {videos.map((video) => (
                <VideoCard
                  key={video._id}
                  video={video}
                />
              ))}
            </div>
          )}

        {videosPagination && (
          <div>
            <button
              onClick={() =>
                setSearchParams({
                  videosPage: String(videosPagination.prevPage),
                })
              }
              disabled={!videosPagination.hasPrevPage}
            >
              Previous
            </button>

            <span>
              Page {videosPagination.page} of {videosPagination.totalPages}
            </span>

            <button
              onClick={() =>
                setSearchParams({
                  videosPage: String(videosPagination.nextPage),
                })
              }
              disabled={!videosPagination.hasNextPage}
            >
              Next
            </button>
          </div>
        )}
      </section>

      {/* OWNER'S VIDEOS */}

      {isChannelOwner && (
        <section>
          <h2>Your Channel</h2>

          <button onClick={() => navigate("/upload")}>
            Upload Video
          </button>

          <h2>Your Videos</h2>

          {myVideosLoading && (
            <p>Loading your videos...</p>
          )}

          {myVideosError && (
            <p>{myVideosError}</p>
          )}

          {togglePublishError && (
            <p>{togglePublishError}</p>
          )}

          {deleteVideoError && (
            <p>{deleteVideoError}</p>
          )}

          {!myVideosLoading &&
            !myVideosError &&
            myVideos.length === 0 && (
              <p>No videos found.</p>
            )}

          {!myVideosLoading &&
            !myVideosError &&
            myVideos.length > 0 && (
              <div>
                {myVideos.map((video) => (
                  <article key={video._id}>
                    <VideoCard video={video} />

                    <p>
                      Status:{" "}
                      {video.isPublished
                        ? "Published"
                        : "Unpublished"}
                    </p>

                    {/* PUBLISH / UNPUBLISH */}

                    <button
                      onClick={() =>
                        handleTogglePublish(video._id)
                      }
                      disabled={
                        togglingVideoId === video._id ||
                        deletingVideoId === video._id
                      }
                    >
                      {togglingVideoId === video._id
                        ? "Updating..."
                        : video.isPublished
                          ? "Unpublish"
                          : "Publish"}
                    </button>

                    {/* EDIT */}

                    <button
                      onClick={() =>
                        navigate(`/watch/${video._id}`, {
                          state: {
                            openEdit: true,
                          },
                        })
                      }
                      disabled={
                        togglingVideoId === video._id ||
                        deletingVideoId === video._id
                      }
                    >
                      Edit
                    </button>

                    {/* DELETE */}

                    <button
                      onClick={() =>
                        handleDeleteVideo(video._id)
                      }
                      disabled={
                        togglingVideoId === video._id ||
                        deletingVideoId === video._id
                      }
                    >
                      {deletingVideoId === video._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </article>
                ))}
              </div>
            )}
        </section>
      )}
    </div>
  );
}

export default ChannelPage;
