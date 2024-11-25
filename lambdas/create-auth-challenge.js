import { Authsignal } from "@authsignal/node";

const apiSecretKey = process.env.AUTHSIGNAL_SECRET;
const apiUrl = process.env.AUTHSIGNAL_URL;

const authsignal = new Authsignal({ apiSecretKey, apiUrl });

export const handler = async (event) => {
  const userId = event.request.userAttributes.sub;
  const email = event.request.userAttributes.email;

  if (event.request.challengeName !== "CUSTOM_CHALLENGE") {
    return event;
  }

  if (event.request.session.length !== 0) {
    return event;
  }

  if (!userId || !email) {
    throw new Error("user doesn't exist");
  }

  const { url } = await authsignal.track({
    userId,
    action: "cognitoAuth",
    attributes: {
      email,
      redirectUrl: "http://localhost:5173/callback",
    },
  });

  event.response.publicChallengeParameters = { url };

  return event;
};
