import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { apiClient } from "../lib/apiClient.js";
import VideoCard from "../components/video/VideoCard.jsx";

function HomePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [pagination, setPagination] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentUser, setCurrentUser] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("query") || "";
  const page = Number(searchParams.get("page")) || 1;
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortType = searchParams.get("sortType") || "desc";

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const response = await apiClient(
          "/users/current-user"
        );

        setCurrentUser(response.data);
      } catch (error) {
        setCurrentUser(null);
      }
    }

    fetchCurrentUser();
  }, [location.pathname]);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    async function fetchVideos() {
      try {
        setError("");
        setIsLoading(true);

        const params = new URLSearchParams();

        if (query) {
          params.set("query", query);
        }

        params.set("page", page);
        params.set("limit", 10);

        if (query) {
          params.set("sortBy", sortBy);
          params.set("sortType", sortType);
        }

        const response = await apiClient(
          `/videos?${params.toString()}`,
          { signal: controller.signal }
        );

        if (isActive) {
          setVideos(response.data.docs);
          setPagination(response.data);
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

    fetchVideos();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [page, query, sortBy, sortType]);

  function handleClearSearch() {
    navigate("/");
  }

  function handleSortChange(event) {
    const [nextSortBy, nextSortType] = event.target.value.split("-");

    setSearchParams({
      query,
      page: "1",
      sortBy: nextSortBy,
      sortType: nextSortType,
    });
  }

  function handlePreviousPage() {
    if (!pagination?.hasPrevPage) {
      return;
    }

    const newParams = {
      page: String(pagination.prevPage),
    };

    if (query) {
      newParams.query = query;
      newParams.sortBy = sortBy;
      newParams.sortType = sortType;
    }

    setSearchParams(newParams);
  }

  function handleNextPage() {
    if (!pagination?.hasNextPage) {
      return;
    }

    const newParams = {
      page: String(pagination.nextPage),
    };

    if (query) {
      newParams.query = query;
      newParams.sortBy = sortBy;
      newParams.sortType = sortType;
    }

    setSearchParams(newParams);
  }

  if (isLoading) {
    return <p>Loading videos...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>
        {query ? `Search results for "${query}"` : "Home"}
      </h1>

      {currentUser && (
        <Link to="/history">
          Watch History
        </Link>
      )}

      {query && (
        <>
          <button onClick={handleClearSearch}>
            Clear search
          </button>

          <label>
            Sort by
            <select
              value={`${sortBy}-${sortType}`}
              onChange={handleSortChange}
            >
              <option value="createdAt-desc">Newest</option>
              <option value="createdAt-asc">Oldest</option>
              <option value="views-desc">Most viewed</option>
            </select>
          </label>
        </>
      )}

      {videos.length === 0 ? (
        <p>
          {query
            ? `No videos found for "${query}".`
            : "No videos found."}
        </p>
      ) : (
        <div>
          {videos.map((video) => (
            <VideoCard
              key={video._id}
              video={video}
            />
          ))}
        </div>
      )}

      {pagination && (
        <div>
          <button
            onClick={handlePreviousPage}
            disabled={!pagination.hasPrevPage}
          >
            Previous
          </button>

          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={!pagination.hasNextPage}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default HomePage;
