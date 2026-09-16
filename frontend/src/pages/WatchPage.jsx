import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { apiClient } from "../lib/apiClient.js";

function WatchPage() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const commentsPage = Number(searchParams.get("commentsPage")) || 1;

  // ---------------- VIDEO STATE ----------------

  const [video, setVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // ---------------- LIKE STATE ----------------

  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  // ---------------- SUBSCRIPTION STATE ----------------

  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // ---------------- COMMENT STATE ----------------

  const [comments, setComments] = useState([]);
  const [commentsPagination, setCommentsPagination] =
    useState(null);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState("");

  const [commentText, setCommentText] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [addCommentError, setAddCommentError] = useState("");
  const [commentLikes, setCommentLikes] = useState({});
  const [togglingCommentLikeId, setTogglingCommentLikeId] =
    useState(null);
  const [commentLikeError, setCommentLikeError] = useState("");

  // ---------------- CURRENT USER STATE ----------------

  const [currentUser, setCurrentUser] = useState(null);

  const [isTogglingSubscription, setIsTogglingSubscription] =
    useState(false);
  const [subscriptionError, setSubscriptionError] = useState("");

  // ---------------- PLAYLIST STATE ----------------

  const [playlists, setPlaylists] = useState([]);
  const [isPlaylistSelectorOpen, setIsPlaylistSelectorOpen] =
    useState(false);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [playlistsError, setPlaylistsError] = useState("");
  const [isAddingToPlaylist, setIsAddingToPlaylist] = useState(false);
  const [addToPlaylistError, setAddToPlaylistError] = useState("");
  const [addToPlaylistSuccess, setAddToPlaylistSuccess] = useState("");
  const isPlaylistSelectorRequestInFlight = useRef(false);

  // ---------------- EDIT COMMENT STATE ----------------

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);
  const [updateCommentError, setUpdateCommentError] = useState("");

  // ---------------- DELETE COMMENT STATE ----------------

  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [deleteCommentError, setDeleteCommentError] = useState("");

  // ---------------- EDIT VIDEO STATE ----------------

  const [isEditingVideo, setIsEditingVideo] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editThumbnail, setEditThumbnail] = useState(null);

  const [isUpdatingVideo, setIsUpdatingVideo] = useState(false);
  const [updateVideoError, setUpdateVideoError] = useState("");

  // ---------------- DELETE VIDEO STATE ----------------

  const [isDeletingVideo, setIsDeletingVideo] = useState(false);
  const [deleteVideoError, setDeleteVideoError] = useState("");

  // ---------------- PUBLISH VIDEO STATE ----------------

  const [isTogglingPublish, setIsTogglingPublish] = useState(false);
  const [togglePublishError, setTogglePublishError] = useState("");

  // ---------------- WATCH TRACKING ----------------

  const hasTrackedWatch = useRef(false);

  // ---------------- FETCH DATA ----------------

  const fetchComments = useCallback(
    async ({ signal, isActive } = {}) => {
      const shouldUpdate = isActive || (() => true);

      try {
        if (shouldUpdate()) {
          setCommentsError("");
          setCommentsPagination(null);
          setCommentsLoading(true);
        }

        const response = await apiClient(
          `/comments/${videoId}?page=${commentsPage}&limit=10`,
          { signal }
        );

        if (shouldUpdate()) {
          setComments(response.data.docs);
          setCommentsPagination(response.data);
        }
      } catch (error) {
        if (shouldUpdate() && error.name !== "AbortError") {
          setCommentsError(error.message);
        }
      } finally {
        if (shouldUpdate()) {
          setCommentsLoading(false);
        }
      }
    },
    [videoId, commentsPage]
  );

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    async function fetchVideo() {
      try {
        setIsLoading(true);
        setError("");

        const response = await apiClient(`/videos/${videoId}`, {
          signal: controller.signal,
        });

        if (isActive) {
          setVideo(response.data);
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

    fetchVideo();
    fetchCurrentUser();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [videoId]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const controller = new AbortController();
    let isActive = true;

    async function fetchLikeInfo() {
      try {
        const response = await apiClient(
          `/likes/video/${videoId}`,
          { signal: controller.signal }
        );

        if (isActive) {
          setLikeCount(response.data.likeCount);
          setIsLiked(response.data.isLiked);
        }
      } catch (error) {
        if (isActive && error.name !== "AbortError") {
          console.error(
            "Failed to fetch like information:",
            error
          );
        }
      }
    }

    fetchLikeInfo();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [videoId, currentUser]);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    fetchComments({
      signal: controller.signal,
      isActive: () => isActive,
    });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [fetchComments]);

  useEffect(() => {
    if (!currentUser || comments.length === 0) {
      return;
    }

    const controller = new AbortController();
    let isActive = true;

    async function fetchCommentLikeInfo() {
      try {
        const likeInfoEntries = await Promise.all(
          comments.map(async (comment) => {
            const response = await apiClient(
              `/comment-likes/${comment._id}`,
              { signal: controller.signal }
            );

            return [comment._id, response.data];
          })
        );

        if (isActive) {
          setCommentLikes((previousLikes) => ({
            ...previousLikes,
            ...Object.fromEntries(likeInfoEntries),
          }));
        }
      } catch (error) {
        if (isActive && error.name !== "AbortError") {
          setCommentLikeError(error.message);
        }
      }
    }

    fetchCommentLikeInfo();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [videoId, comments, currentUser]);

  // ---------------- OPEN EDIT MODE FROM CHANNEL PAGE ----------------

  useEffect(() => {
    if (!video || !currentUser) {
      return;
    }

    const isVideoOwner =
      currentUser._id === video.owner?._id;

    if (!isVideoOwner) {
      return;
    }

    if (location.state?.openEdit) {
      setEditTitle(video.title);
      setEditDescription(video.description);
      setEditThumbnail(null);
      setUpdateVideoError("");
      setIsEditingVideo(true);

      // Remove the navigation state after opening edit mode.
      // This prevents refresh from opening edit mode again.
      navigate(location.pathname, {
        replace: true,
        state: null,
      });
    }
  }, [
    video,
    currentUser,
    location.state,
    location.pathname,
    navigate,
  ]);

  // ---------------- SUBSCRIPTION INFO ----------------

  useEffect(() => {
    if (
      !video?.owner?._id ||
      !currentUser ||
      video._id !== videoId
    ) {
      return;
    }

    const controller = new AbortController();
    let isActive = true;

    async function fetchSubscriptionInfo() {
      try {
        const response = await apiClient(
          `/subscriptions/c/${video.owner._id}`,
          { signal: controller.signal }
        );

        if (isActive) {
          setSubscriberCount(response.data.subscriberCount);
          setIsSubscribed(response.data.isSubscribed);
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
  }, [videoId, video, currentUser]);

  // ---------------- WATCH ----------------

  async function handlePlay() {
    if (!currentUser) {
      return;
    }

    if (hasTrackedWatch.current) {
      return;
    }

    try {
      await apiClient(`/videos/${videoId}/watch`, {
        method: "POST",
      });

      hasTrackedWatch.current = true;
    } catch (error) {
      console.error("Failed to track watch:", error);
    }
  }

  // ---------------- LIKE ----------------

  async function handleLike() {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    try {
      await apiClient(`/likes/toggle/${videoId}`, {
        method: "POST",
      });

      const response = await apiClient(
        `/likes/video/${videoId}`
      );

      setLikeCount(response.data.likeCount);
      setIsLiked(response.data.isLiked);
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  }

  // ---------------- SUBSCRIPTION ----------------

  async function handleToggleSubscription() {
    if (!video?.owner?._id) {
      return;
    }

    if (isTogglingSubscription) {
      return;
    }

    try {
      setSubscriptionError("");
      setIsTogglingSubscription(true);

      await apiClient(
        `/subscriptions/c/${video.owner._id}`,
        {
          method: "POST",
        }
      );

      setSubscriberCount((previousCount) =>
        isSubscribed
          ? previousCount - 1
          : previousCount + 1
      );
      setIsSubscribed((previousValue) => !previousValue);
    } catch (error) {
      setSubscriptionError(error.message);
    } finally {
      setIsTogglingSubscription(false);
    }
  }

  // ---------------- ADD TO PLAYLIST ----------------

  async function handleOpenPlaylistSelector() {
    if (
      isPlaylistSelectorOpen ||
      playlistsLoading ||
      isPlaylistSelectorRequestInFlight.current
    ) {
      return;
    }

    try {
      isPlaylistSelectorRequestInFlight.current = true;
      setIsPlaylistSelectorOpen(true);
      setPlaylistsLoading(true);
      setPlaylistsError("");
      setAddToPlaylistError("");
      setAddToPlaylistSuccess("");

      const response = await apiClient("/playlists");

      setPlaylists(response.data);
    } catch (error) {
      setPlaylistsError(error.message);
    } finally {
      isPlaylistSelectorRequestInFlight.current = false;
      setPlaylistsLoading(false);
    }
  }

  async function handleAddToPlaylist(playlistId) {
    if (isAddingToPlaylist) {
      return;
    }

    try {
      setAddToPlaylistError("");
      setIsAddingToPlaylist(true);

      await apiClient(
        `/playlists/${playlistId}/videos/${videoId}`,
        {
          method: "POST",
        }
      );

      setIsPlaylistSelectorOpen(false);
      setAddToPlaylistSuccess("Video added to playlist.");
    } catch (error) {
      setAddToPlaylistError(error.message);
    } finally {
      setIsAddingToPlaylist(false);
    }
  }

  // ---------------- EDIT VIDEO ----------------

  function handleEditVideoClick() {
    setEditTitle(video.title);
    setEditDescription(video.description);
    setEditThumbnail(null);

    setUpdateVideoError("");
    setIsEditingVideo(true);
  }

  function handleCancelVideoEdit() {
    setIsEditingVideo(false);

    setEditTitle("");
    setEditDescription("");
    setEditThumbnail(null);

    setUpdateVideoError("");
  }

  async function handleUpdateVideo(event) {
    event.preventDefault();

    if (!editTitle.trim()) {
      setUpdateVideoError("Title is required");
      return;
    }

    if (!editDescription.trim()) {
      setUpdateVideoError("Description is required");
      return;
    }

    try {
      setUpdateVideoError("");
      setIsUpdatingVideo(true);

      const formData = new FormData();

      formData.append("title", editTitle.trim());

      formData.append(
        "description",
        editDescription.trim()
      );

      // Thumbnail is optional.
      // Only send it when the user selected a new one.
      if (editThumbnail) {
        formData.append("thumbnail", editThumbnail);
      }

      const response = await apiClient(
        `/videos/${videoId}`,
        {
          method: "PATCH",
          body: formData,
        }
      );

      console.log("Video updated:", response);

      setVideo((previousVideo) => ({
        ...response.data,
        owner: previousVideo.owner,
      }));

      setIsEditingVideo(false);

      setEditTitle("");
      setEditDescription("");
      setEditThumbnail(null);
    } catch (error) {
      setUpdateVideoError(error.message);
    } finally {
      setIsUpdatingVideo(false);
    }
  }

  // ---------------- DELETE VIDEO ----------------

  async function handleDeleteVideo() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this video?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteVideoError("");
      setIsDeletingVideo(true);

      await apiClient(`/videos/${videoId}`, {
        method: "DELETE",
      });

      navigate("/");
    } catch (error) {
      setDeleteVideoError(error.message);
    } finally {
      setIsDeletingVideo(false);
    }
  }

  // ---------------- TOGGLE VIDEO PUBLISH ----------------

  async function handleTogglePublish() {
    try {
      setTogglePublishError("");
      setIsTogglingPublish(true);

      const response = await apiClient(
        `/videos/${videoId}/toggle-publish`,
        {
          method: "PATCH",
        }
      );

      setVideo((previousVideo) => ({
        ...response.data,
        owner: previousVideo.owner,
      }));
    } catch (error) {
      setTogglePublishError(error.message);
    } finally {
      setIsTogglingPublish(false);
    }
  }

  // ---------------- ADD COMMENT ----------------

  async function handleAddComment(event) {
    event.preventDefault();

    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (!commentText.trim()) {
      return;
    }

    try {
      setAddCommentError("");
      setIsAddingComment(true);

      await apiClient(
        `/comments/${videoId}`,
        {
          method: "POST",
          body: JSON.stringify({
            content: commentText,
          }),
        }
      );

      await fetchComments();
      setCommentText("");
    } catch (error) {
      setAddCommentError(error.message);
    } finally {
      setIsAddingComment(false);
    }
  }

  async function handleToggleCommentLike(commentId) {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (togglingCommentLikeId === commentId) {
      return;
    }

    try {
      setCommentLikeError("");
      setTogglingCommentLikeId(commentId);

      const isLiked = commentLikes[commentId]?.isLiked;

      await apiClient(
        `/comment-likes/${commentId}`,
        {
          method: isLiked ? "DELETE" : "POST",
        }
      );

      const response = await apiClient(
        `/comment-likes/${commentId}`
      );

      setCommentLikes((previousLikes) => ({
        ...previousLikes,
        [commentId]: response.data,
      }));
    } catch (error) {
      setCommentLikeError(error.message);
    } finally {
      setTogglingCommentLikeId(null);
    }
  }

  // ---------------- EDIT COMMENT ----------------

  function handleEditClick(comment) {
    setEditingCommentId(comment._id);
    setEditingCommentText(comment.content);
    setUpdateCommentError("");
  }

  async function handleUpdateComment(commentId) {
    if (!editingCommentText.trim()) {
      return;
    }

    try {
      setUpdateCommentError("");
      setIsUpdatingComment(true);

      const response = await apiClient(
        `/comments/${commentId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            content: editingCommentText,
          }),
        }
      );

      setComments((previousComments) =>
        previousComments.map((comment) =>
          comment._id === commentId
            ? response.data
            : comment
        )
      );

      setEditingCommentId(null);
      setEditingCommentText("");
    } catch (error) {
      setUpdateCommentError(error.message);
    } finally {
      setIsUpdatingComment(false);
    }
  }

  // ---------------- DELETE COMMENT ----------------

  async function handleDeleteComment(commentId) {
    try {
      setDeleteCommentError("");
      setDeletingCommentId(commentId);

      await apiClient(`/comments/${commentId}`, {
        method: "DELETE",
      });

      setComments((previousComments) =>
        previousComments.filter(
          (comment) => comment._id !== commentId
        )
      );

      setCommentLikes((previousLikes) => {
        const nextLikes = { ...previousLikes };
        delete nextLikes[commentId];
        return nextLikes;
      });
    } catch (error) {
      setDeleteCommentError(error.message);
    } finally {
      setDeletingCommentId(null);
    }
  }

  // ---------------- UI STATES ----------------

  if (isLoading) {
    return <p>Loading video...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!video) {
    return <p>Video not found.</p>;
  }

  // ---------------- OWNER CHECK ----------------

  const isVideoOwner =
    currentUser?._id === video.owner?._id;

  // ---------------- PAGE ----------------

  return (
    <div>
      <h1>
        {isEditingVideo
          ? "Edit Video"
          : video.title}
      </h1>

      <video
        src={video.videoFile}
        controls
        width="800"
        onPlay={handlePlay}
      />

      {/* CHANNEL */}

      {video.owner?.username && (
        <Link to={`/channel/${video.owner.username}`}>
          {video.owner.username}
        </Link>
      )}

      {currentUser && (
        <div>
          <span>{subscriberCount} subscribers</span>

          {isVideoOwner ? (
            <span>Your Channel</span>
          ) : (
            <button
              onClick={handleToggleSubscription}
              disabled={isTogglingSubscription}
            >
              {isTogglingSubscription
                ? "Updating..."
                : isSubscribed
                  ? "Subscribed"
                  : "Subscribe"}
            </button>
          )}

          {subscriptionError && (
            <p>{subscriptionError}</p>
          )}
        </div>
      )}

      {currentUser && (
        <section>
          <button
            onClick={handleOpenPlaylistSelector}
            disabled={playlistsLoading || isAddingToPlaylist}
          >
            Add to Playlist
          </button>

          {addToPlaylistSuccess && (
            <p>{addToPlaylistSuccess}</p>
          )}

          {isPlaylistSelectorOpen && (
            <div>
              {playlistsLoading && (
                <p>Loading playlists...</p>
              )}

              {playlistsError && (
                <p>{playlistsError}</p>
              )}

              {addToPlaylistError && (
                <p>{addToPlaylistError}</p>
              )}

              {!playlistsLoading &&
                !playlistsError &&
                playlists.length === 0 && (
                  <p>You don't have any playlists yet.</p>
                )}

              {!playlistsLoading &&
                !playlistsError &&
                playlists.length > 0 && (
                  <div>
                    {playlists.map((playlist) => (
                      <button
                        key={playlist._id}
                        onClick={() =>
                          handleAddToPlaylist(playlist._id)
                        }
                        disabled={isAddingToPlaylist}
                      >
                        {isAddingToPlaylist
                          ? "Adding..."
                          : playlist.name}
                      </button>
                    ))}
                  </div>
                )}
            </div>
          )}
        </section>
      )}

      {/* VIDEO OWNER CONTROLS */}

      {/* VIDEO EDIT FORM */}

      {isVideoOwner && isEditingVideo && (
        <div>
            <form onSubmit={handleUpdateVideo}>
              <div>
                <label htmlFor="editTitle">
                  Title
                </label>

                <input
                  id="editTitle"
                  type="text"
                  value={editTitle}
                  onChange={(event) =>
                    setEditTitle(event.target.value)
                  }
                  disabled={isUpdatingVideo}
                />
              </div>

              <div>
                <label htmlFor="editDescription">
                  Description
                </label>

                <textarea
                  id="editDescription"
                  value={editDescription}
                  onChange={(event) =>
                    setEditDescription(
                      event.target.value
                    )
                  }
                  disabled={isUpdatingVideo}
                />
              </div>

              <div>
                <label htmlFor="editThumbnail">
                  New Thumbnail
                </label>

                <input
                  id="editThumbnail"
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setEditThumbnail(
                      event.target.files[0] || null
                    )
                  }
                  disabled={isUpdatingVideo}
                />
              </div>

              {updateVideoError && (
                <p>{updateVideoError}</p>
              )}

              <button
                type="submit"
                disabled={isUpdatingVideo}
              >
                {isUpdatingVideo
                  ? "Saving..."
                  : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={handleCancelVideoEdit}
                disabled={isUpdatingVideo}
              >
                Cancel
              </button>
            </form>
          {deleteVideoError && (
            <p>{deleteVideoError}</p>
          )}
        </div>
      )}
      

      {/* NORMAL VIDEO INFORMATION */}

      {!isEditingVideo && (
        <>
          <p>{video.views} views</p>

          <p>{video.description}</p>

          {/* LIKE */}

          <button onClick={handleLike}>
            {isLiked ? "Unlike" : "Like"}
          </button>

          <span> {likeCount} likes</span>

          {/* COMMENTS */}

          <section>
            <h2>Comments</h2>

            {/* ADD COMMENT */}

            <form onSubmit={handleAddComment}>
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(event) =>
                  setCommentText(event.target.value)
                }
              />

              <button
                type="submit"
                disabled={isAddingComment}
              >
                {isAddingComment
                  ? "Adding..."
                  : "Add Comment"}
              </button>
            </form>

            {addCommentError && (
              <p>{addCommentError}</p>
            )}

            {/* COMMENT LIST */}

            {commentsLoading && (
              <p>Loading comments...</p>
            )}

            {commentsError && (
              <p>{commentsError}</p>
            )}

            {deleteCommentError && (
              <p>{deleteCommentError}</p>
            )}

            {commentLikeError && (
              <p>{commentLikeError}</p>
            )}

            {!commentsLoading &&
              !commentsError &&
              comments.length === 0 && (
                <p>No comments yet.</p>
              )}

            {!commentsLoading &&
              !commentsError &&
              comments.length > 0 && (
                <div>
                  {comments.map((comment) => (
                    <article key={comment._id}>
                      <img
                        src={comment.owner?.avatar}
                        alt={comment.owner?.username}
                        width="40"
                      />

                      <strong>
                        {comment.owner?.username}
                      </strong>

                      {commentLikes[comment._id] && (
                        <span>
                          {commentLikes[comment._id].likeCount} likes
                        </span>
                      )}

                      {currentUser && (
                        <button
                          onClick={() =>
                            handleToggleCommentLike(comment._id)
                          }
                          disabled={
                            togglingCommentLikeId === comment._id
                          }
                        >
                          {togglingCommentLikeId === comment._id
                            ? "Liking..."
                            : commentLikes[comment._id]?.isLiked
                              ? "Unlike"
                              : "Like"}
                        </button>
                      )}

                      {/* EDITING MODE */}

                      {editingCommentId ===
                      comment._id ? (
                        <div>
                          <input
                            type="text"
                            value={editingCommentText}
                            onChange={(event) =>
                              setEditingCommentText(
                                event.target.value
                              )
                            }
                          />

                          <button
                            onClick={() =>
                              handleUpdateComment(
                                comment._id
                              )
                            }
                            disabled={
                              isUpdatingComment
                            }
                          >
                            {isUpdatingComment
                              ? "Saving..."
                              : "Save"}
                          </button>

                          <button
                            onClick={() => {
                              setEditingCommentId(null);
                              setEditingCommentText("");
                              setUpdateCommentError("");
                            }}
                            disabled={
                              isUpdatingComment
                            }
                          >
                            Cancel
                          </button>

                          {updateCommentError && (
                            <p>
                              {updateCommentError}
                            </p>
                          )}
                        </div>
                      ) : (
                        <>
                          {/* NORMAL COMMENT */}

                          <p>{comment.content}</p>

                          {/* EDIT / DELETE ONLY FOR COMMENT OWNER */}

                          {currentUser &&
                            comment.owner?._id ===
                              currentUser._id && (
                              <div>
                                <button
                                  onClick={() =>
                                    handleEditClick(
                                      comment
                                    )
                                  }
                                >
                                  Edit
                                </button>

                                <button
                                  onClick={() =>
                                    handleDeleteComment(
                                      comment._id
                                    )
                                  }
                                  disabled={
                                    deletingCommentId ===
                                    comment._id
                                  }
                                >
                                  {deletingCommentId ===
                                  comment._id
                                    ? "Deleting..."
                                    : "Delete"}
                                </button>
                              </div>
                            )}
                        </>
                      )}
                    </article>
                  ))}
                </div>
              )}

            {commentsPagination && (
              <div>
                <button
                  onClick={() => {
                    const nextSearchParams = new URLSearchParams(
                      searchParams
                    );
                    nextSearchParams.set(
                      "commentsPage",
                      String(commentsPagination.prevPage)
                    );
                    setSearchParams(nextSearchParams);
                  }}
                  disabled={!commentsPagination.hasPrevPage}
                >
                  Previous
                </button>

                <span>
                  Page {commentsPagination.page} of {commentsPagination.totalPages}
                </span>

                <button
                  onClick={() => {
                    const nextSearchParams = new URLSearchParams(
                      searchParams
                    );
                    nextSearchParams.set(
                      "commentsPage",
                      String(commentsPagination.nextPage)
                    );
                    setSearchParams(nextSearchParams);
                  }}
                  disabled={!commentsPagination.hasNextPage}
                >
                  Next
                </button>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default WatchPage;
