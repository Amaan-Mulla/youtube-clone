import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "../lib/apiClient.js";

function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        setError("");

        await apiClient("/users/current-user");

        const response = await apiClient(
          "/subscriptions/my-subscriptions"
        );

        setSubscriptions(response.data);
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

    fetchSubscriptions();
  }, [navigate]);

  if (isLoading) {
    return (
      <main className="subscriptions-page">
        <p className="subscriptions-status-message">
          Loading subscriptions...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="subscriptions-page">
        <p className="subscriptions-error">{error}</p>
      </main>
    );
  }

  const validSubscriptions = subscriptions.filter(
    (subscription) => subscription.channel
  );

  if (validSubscriptions.length === 0) {
    return (
      <main className="subscriptions-page">
        <p className="subscriptions-status-message">
          You haven't subscribed to any channels yet.
        </p>
      </main>
    );
  }

  return (
    <main className="subscriptions-page">
      <h1 className="subscriptions-title">Subscriptions</h1>

      <div className="subscriptions-grid">
        {validSubscriptions.map((subscription) => {
          const channel = subscription.channel;

          return (
            <Link
              key={subscription._id}
              to={`/channel/${channel.username}`}
              className="subscription-card-link"
            >
              <article className="subscription-card">
                <img
                  className="subscription-avatar"
                  src={channel.avatar}
                  alt={channel.username}
                />

                <div className="subscription-info">
                  <h2 className="subscription-channel-name">
                    {channel.fullName}
                  </h2>

                  <p className="subscription-username">
                    @{channel.username}
                  </p>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </main>
  );
}

export default SubscriptionsPage;