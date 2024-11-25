import { Authsignal } from "@authsignal/node";

const apiSecretKey = process.env.AUTHSIGNAL_SECRET;
const apiUrl = process.env.AUTHSIGNAL_URL;

const authsignal = new Authsignal({ apiSecretKey, apiUrl });

export const handler = async (event) => {
  const userId = event.request.userAttributes.sub;
  const { token } = JSON.parse(event.request.challengeAnswer);

  // userId here is important to prevent users from using Authsignal tokens that don't match the Cognito session.
  const { state } = await authsignal.validateChallenge({ token, userId });

  event.response.answerCorrect = state === "CHALLENGE_SUCCEEDED";

  return event;
};
