import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../lib/apiClient.js";
import VideoCard from "../components/video/VideoCard.jsx";

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingVideoId, setRemovingVideoId] = useState(null);
  const [removeError, setRemoveError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchHistory() {
      try {
        setError("");

        await apiClient("/users/current-user");

        const response = await apiClient("/history");

        setHistory(response.data);
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

    fetchHistory();
  }, [navigate]);

  async function handleRemove(videoId) {
    try {
      setRemoveError("");
      setRemovingVideoId(videoId);

      await apiClient(`/history/${videoId}`, {
        method: "DELETE",
      });

      setHistory((previousHistory) =>
        previousHistory.filter(
          (historyItem) =>
            historyItem.video &&
            historyItem.video._id !== videoId
        )
      );
    } catch (error) {
      setRemoveError(error.message);
    } finally {
      setRemovingVideoId(null);
    }
  }

  if (isLoading) {
    return <p className="history-status-message">Loading history...</p>;
  }

  if (error) {
    return <p className="history-error">{error}</p>;
  }

  const validHistory = history.filter(
    (historyItem) => historyItem.video
  );

  if (validHistory.length === 0) {
    return <p className="history-status-message">No watch history found.</p>;
  }

  return (
    <div className="history-page">
      <h1 className="history-title">Watch History</h1>

      {removeError && <p className="history-error">{removeError}</p>}

      <div  className="history-list">
        {validHistory.map((historyItem) => {
          const videoId = historyItem.video._id;

          return (
            <div className="history-item" key={historyItem._id}>
              <VideoCard video={historyItem.video} />

              <button
                className="history-remove-button"
                type="button"
                onClick={() => handleRemove(videoId)}
                disabled={removingVideoId === videoId}
              >
                {removingVideoId === videoId
                  ? "Removing..."
                  : "Remove"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default HistoryPage;