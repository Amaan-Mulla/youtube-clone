import { Link } from "react-router-dom";

function VideoCard({ video }) {
  return (
    <article className="video-card">
      {/* VIDEO LINK */}

      <Link
        to={`/watch/${video._id}`}
        className="video-card-link"
      >
        <div className="video-thumbnail-wrapper">
          <img
            className="video-thumbnail"
            src={video.thumbnail}
            alt={video.title}
          />
        </div>

        <h2 className="video-card-title">
          {video.title}
        </h2>
      </Link>

      {/* CHANNEL LINK */}

      {video.owner?.username && (
        <Link
          to={`/channel/${video.owner.username}`}
          className="video-card-channel"
        >
          {video.owner.username}
        </Link>
      )}

      {/* VIDEO INFO */}

      <p className="video-card-views">
        {video.views} views
      </p>
    </article>
  );
}

export default VideoCard;