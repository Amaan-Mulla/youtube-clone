import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { apiClient } from "../../lib/apiClient.js";

function Sidebar() {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);

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

  return (
    <aside className="app-sidebar" aria-label="Primary navigation">
      <nav>
        <Link to="/">Home</Link>

        {currentUser && (
          <Link to="/subscriptions">
            Subscriptions
          </Link>
        )}
      </nav>
    </aside>
  );
}

export default Sidebar;