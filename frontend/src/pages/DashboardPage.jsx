import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/ui/Spinner.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import { apiClient } from "../lib/apiClient.js";

function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    async function fetchDashboardStats() {
      try {
        setError("");
        setIsLoading(true);

        await apiClient("/users/current-user", {
          signal: controller.signal,
        });

        const response = await apiClient("/dashboard/stats", {
          signal: controller.signal,
        });

        if (isActive) {
          setStats(response.data);
        }
      } catch (error) {
        if (!isActive || error.name === "AbortError") {
          return;
        }

        if (error.statusCode === 401) {
          navigate("/login");
          return;
        }

        setError(error.message);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    fetchDashboardStats();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [navigate]);

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!stats) {
    return <ErrorState message="Dashboard statistics are unavailable." />;
  }

  return (
    <div>
      <h1>Creator Dashboard</h1>

      <div>
        <article>
          <h2>Total Videos</h2>
          <p>{stats.totalVideos}</p>
        </article>

        <article>
          <h2>Total Views</h2>
          <p>{stats.totalViews}</p>
        </article>

        <article>
          <h2>Total Likes</h2>
          <p>{stats.totalLikes}</p>
        </article>

        <article>
          <h2>Total Comments</h2>
          <p>{stats.totalComments}</p>
        </article>

        <article>
          <h2>Total Subscribers</h2>
          <p>{stats.totalSubscribers}</p>
        </article>
      </div>
    </div>
  );
}

export default DashboardPage;
