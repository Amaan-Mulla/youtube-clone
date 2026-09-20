import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { apiClient } from "../../lib/apiClient.js";

function Sidebar({ isOpen }) {
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
    <aside
      className={`app-sidebar ${isOpen ? "sidebar-visible" : "sidebar-hidden"
        }`}
      aria-label="Primary navigation"
    >
      <nav>
        <Link to="/">Home</Link>

        {currentUser && (
          <Link to="/subscriptions">
            Subscriptions
          </Link>
        )}
        <Link to="/history">History</Link>

      </nav>
    </aside>
  );
}

export default Sidebar;