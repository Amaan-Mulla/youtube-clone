import { Link } from "react-router-dom";

function VideoCard({ video }) {
  return (
    <article>
      {/* VIDEO LINK */}

      <Link to={`/watch/${video._id}`}>
        <div>
          <img
            src={video.thumbnail}
            alt={video.title}
          />

          <h2>{video.title}</h2>
        </div>
      </Link>

      {/* CHANNEL LINK */}

      {video.owner?.username && (
        <Link to={`/channel/${video.owner.username}`}>
          {video.owner.username}
        </Link>
      )}

      {/* VIDEO INFO */}

      <p>{video.views} views</p>
    </article>
  );
}

export default VideoCard;