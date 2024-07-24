const handler = async (event) => {
  const { session } = event.request;

  if (session.length === 0) {
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
    event.response.challengeName = "CUSTOM_CHALLENGE";
    return event;
  }

  if (
    session.length === 1 &&
    session[0].challengeName === "CUSTOM_CHALLENGE" &&
    session[0].challengeResult === true
  ) {
    event.response.issueTokens = true;
    event.response.failAuthentication = false;
    return event;
  }

  event.response.issueTokens = false;
  event.response.failAuthentication = true;
  return event;
};

export { handler };
