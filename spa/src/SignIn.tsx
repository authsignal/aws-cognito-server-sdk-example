import { useState } from "react";

async function postSignInAndRedirect(username: string) {
  const response = await fetch("http://localhost:4000/sign-in", {
    method: "POST",
    body: JSON.stringify({ username }),
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const responseBody = await response.json();

  localStorage.setItem("session", responseBody.session);
  localStorage.setItem("username", username);
  localStorage.setItem("token", "");
  localStorage.setItem("refreshToken", "");
  localStorage.setItem("accessToken", "");

  window.location.href = responseBody.url;
}

export function SignIn() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <main>
      <section>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          name="email"
          onChange={(event) => setUsername(event.target.value)}
          required
        />
        <button
          onClick={async () => {
            setLoading(true);

            await postSignInAndRedirect(username);

            setLoading(false);
          }}
        >
          {loading ? "Loading" : "Sign in"}
        </button>
      </section>
    </main>
  );
}