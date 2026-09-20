import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { apiClient } from "../../lib/apiClient.js";

function Header({ onSidebarToggle }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [searchQuery, setSearchQuery] = useState(() =>
    new URLSearchParams(location.search).get("query") || ""
  );

  useEffect(() => {
    setSearchQuery(
      new URLSearchParams(location.search).get("query") || ""
    );
  }, [location.search]);

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        setIsCheckingAuth(true);

        const response = await apiClient("/users/current-user");

        setCurrentUser(response.data);
      } catch (error) {
        setCurrentUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    }

    fetchCurrentUser();
  }, [location.pathname]);

  async function handleLogout() {
    try {
      await apiClient("/users/logout", {
        method: "POST",
      });

      setCurrentUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  function handleSearch(event) {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) {
      navigate("/");
      return;
    }

    const searchParams = new URLSearchParams({
      query,
      page: "1",
    });

    navigate({
      pathname: "/",
      search: `?${searchParams.toString()}`,
    });
  }

  return (
    <header className="app-header">
      <button
        type="button"
        className="app-menu-button"
        onClick={onSidebarToggle}
        aria-label="Toggle sidebar"
      >
        ☰
      </button>

      <Link
        to="/"
        className="app-logo"
        aria-label="Home"
      >
        YouTube Clone
      </Link>

      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search videos..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          aria-label="Search videos"
        />
        <button type="submit">Search</button>
      </form>

      {!isCheckingAuth && (
        <>
          {currentUser ? (
            <>
              <Link to={`/channel/${currentUser.username}`}>
                My Channel
              </Link>
              <Link to="/history">History</Link>
              <Link to="/account">Account</Link>
              <Link to="/dashboard">Dashboard</Link>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <button onClick={() => navigate("/login")}>
              Login
            </button>
          )}
        </>
      )}
    </header>
  );
}

export default Header;
