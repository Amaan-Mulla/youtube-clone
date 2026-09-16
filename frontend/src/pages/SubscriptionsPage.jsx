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
    return <p>Loading subscriptions...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const validSubscriptions = subscriptions.filter(
    (subscription) => subscription.channel
  );

  if (validSubscriptions.length === 0) {
    return <p>You haven't subscribed to any channels yet.</p>;
  }

  return (
    <div>
      <h1>Subscriptions</h1>

      <div>
        {validSubscriptions.map((subscription) => {
          const channel = subscription.channel;

          return (
            <Link
              key={subscription._id}
              to={`/channel/${channel.username}`}
            >
              <article>
                <img
                  src={channel.avatar}
                  alt={channel.username}
                  width="80"
                  height="80"
                />

                <h2>{channel.fullName}</h2>

                <p>@{channel.username}</p>
              </article>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default SubscriptionsPage;