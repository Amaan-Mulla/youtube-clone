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
    <main className="dashboard-page">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Creator Dashboard</h1>
        <p className="dashboard-subtitle">
          Overview of your channel performance
        </p>
      </header>

      <section className="dashboard-stats-grid">
        <article className="dashboard-stat-card">
          <h2 className="dashboard-stat-label">Total Videos</h2>
          <p className="dashboard-stat-value">{stats.totalVideos}</p>
        </article>

        <article className="dashboard-stat-card">
          <h2 className="dashboard-stat-label">Total Views</h2>
          <p className="dashboard-stat-value">{stats.totalViews}</p>
        </article>

        <article className="dashboard-stat-card">
          <h2 className="dashboard-stat-label">Total Likes</h2>
          <p className="dashboard-stat-value">{stats.totalLikes}</p>
        </article>

        <article className="dashboard-stat-card">
          <h2 className="dashboard-stat-label">Total Comments</h2>
          <p className="dashboard-stat-value">{stats.totalComments}</p>
        </article>

        <article className="dashboard-stat-card">
          <h2 className="dashboard-stat-label">Total Subscribers</h2>
          <p className="dashboard-stat-value">{stats.totalSubscribers}</p>
        </article>
      </section>
    </main>
  );
}

export default DashboardPage;