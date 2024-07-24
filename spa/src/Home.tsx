import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const clearData = async () => {
  localStorage.setItem("username", "");
  localStorage.setItem("session", "");
  localStorage.setItem("token", "");
  localStorage.setItem("refreshToken", "");
  localStorage.setItem("accessToken", "");
}

export function Home() {
  const [accessToken, setAccessToken] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (!username) {
      navigate("/sign-in");
    }
  }, [navigate]);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      setAccessToken(accessToken);
    }

    const username = localStorage.getItem("username");
    if (username) {
      setUsername(username);
    }
  }, []);

  if (!username) {
    return null;
  }

  return (
    <main>
      <section>
        <h1>Example SPA with Cognito integration via express backend</h1>
        <div>Cognito username: {username}</div>
        <div>Cognito accessToken: {accessToken}</div>
        <button
          onClick={() => {
            clearData();
            navigate("/sign-in");
          }}
        >
          Sign out
        </button>
      </section>
    </main>
  );
}