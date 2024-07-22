import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

async function postAuthsignalToken(navigate: ReturnType<typeof useNavigate>) {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const session = localStorage.getItem("session");
  const username = localStorage.getItem("username");

  if (!token || !session || !username) {
    navigate("/");
    return;
  }

  try {
    const response = await fetch("http://localhost:4000/callback", {
      method: "POST",
      body: JSON.stringify({ username, token, session }),
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status !== 200) {
      return;
    }

    const responseBody = await response.json();

    localStorage.setItem("token", token);
    if (responseBody.RefreshToken) {
      localStorage.setItem("refreshToken", responseBody.RefreshToken);
    }

    if (responseBody.AccessToken) {
      localStorage.setItem("accessToken", responseBody.AccessToken);
    }

    navigate("/");

  } catch (err) {
    // do nothing
  }
}

export function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    postAuthsignalToken(navigate);
  }, [navigate]);

  return (
    <div>
      <h1>LOADING!!!!!</h1>
    </div>
  );
}