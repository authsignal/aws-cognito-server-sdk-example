const express = require("express");
const { createHmac } = require("node:crypto");
const {
  CognitoIdentityProviderClient,
  AdminInitiateAuthCommand,
  AdminRespondToAuthChallengeCommand,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminGetUserCommand,
} = require("@aws-sdk/client-cognito-identity-provider");
const crypto = require("node:crypto");

const cognitoClientId = process.env.COGNITO_CLIENT_ID;
const cognitoClientSecret = process.env.COGNITO_CLIENT_SECRET;
const cognitoUserPoolId = process.env.COGNITO_USER_POOL_ID;

if (!cognitoClientId || !cognitoClientSecret || !cognitoUserPoolId) {
  console.error(
    "Missing one or more environment variables: COGNITO_CLIENT_ID, COGNITO_CLIENT_SECRET, COGNITO_USER_POOL_ID"
  );
  process.exit(1);
}

const app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "*");
  next();
});

const cognitoClient = new CognitoIdentityProviderClient({
  region: "us-west-2",
});

const signUserUp = async (username) => {
  const adminCreateUserCommand = new AdminCreateUserCommand({
    ForceAliasCreation: false, // this is important to prevent email migration.
    UserPoolId: cognitoUserPoolId,
    Username: username,
    MessageAction: "SUPPRESS",
    UserAttributes: [
      {
        Name: "email_verified",
        Value: "true",
      },
      {
        Name: "email",
        Value: username,
      },
    ],
  });

  const password = crypto.randomBytes(32).toString("base64");

  const adminSetUserPasswordCommand = new AdminSetUserPasswordCommand({
    Password: password,
    Username: username,
    UserPoolId: cognitoUserPoolId,
    Permanent: true,
  });

  await cognitoClient.send(adminCreateUserCommand);
  await cognitoClient.send(adminSetUserPasswordCommand);
};

const signUserIn = async (username) => {
  const messageHmac = createHmac("sha256", cognitoClientSecret);

  messageHmac.update(username + cognitoClientId);
  const digest = messageHmac.digest("base64");

  const adminInitiateAuthInput = {
    UserPoolId: cognitoUserPoolId,
    ClientId: cognitoClientId,
    AuthFlow: "CUSTOM_AUTH",
    AuthParameters: {
      USERNAME: username,
      SECRET_HASH: digest,
    },
  };

  const adminInitiateAuthCommand = new AdminInitiateAuthCommand(
    adminInitiateAuthInput
  );

  return await cognitoClient.send(adminInitiateAuthCommand);
};

const getUserByUsername = async (username) => {
  const adminGetUserInput = {
    UserPoolId: cognitoUserPoolId,
    Username: username,
  };
  const adminGetUserCommand = new AdminGetUserCommand(adminGetUserInput);
  return await cognitoClient.send(adminGetUserCommand);
};

const responseToAuthChallenge = async (username, session, token) => {
  const messageHmac = createHmac("sha256", cognitoClientSecret);

  messageHmac.update(username + cognitoClientId);
  const digest = messageHmac.digest("base64");

  const adminRespondToAuthChallengeInput = {
    ChallengeName: "CUSTOM_CHALLENGE",
    ClientId: cognitoClientId,
    Session: session,
    UserPoolId: cognitoUserPoolId,
    ChallengeResponses: {
      USERNAME: username,
      ANSWER: JSON.stringify({ token }),
      SECRET_HASH: digest,
    },
  };

  const adminRespondToAuthChallengeCommand =
    new AdminRespondToAuthChallengeCommand(adminRespondToAuthChallengeInput);

  return await cognitoClient.send(adminRespondToAuthChallengeCommand);
};

app.post("/sign-in", async function (req, res) {
  const username = req.body?.username;

  await getUserByUsername(username).catch(async (err) => {
    if (err.name === "UserNotFoundException") {
      await signUserUp(username);
    }
  });

  try {
    const signInResponse = await signUserIn(username);
    const response = {
      url: signInResponse.ChallengeParameters.url,
      session: signInResponse.Session,
    };
    res.send(response);
    console.log({ status: 200, path: "/sign-in", username: username });
  } catch (err) {
    res.status(500).send({ errorMessage: "Something went wrong" });
    console.log({ status: 500, path: "/sign-in", username: username, err });
  }
});

app.post("/callback", async function (req, res) {
  const token = req.body?.token;
  const session = req.body?.session;
  const username = req.body?.username;

  if (!token || !session || !username) {
    throw new Error("Missing required fields: token, session, or username");
  }

  try {
    const authChallengeResponse = await responseToAuthChallenge(
      username,
      session,
      token
    );

    const response = {
      AccessToken: authChallengeResponse.AuthenticationResult.AccessToken,
      RefreshToken: authChallengeResponse.AuthenticationResult.RefreshToken,
    };
    res.send(response);
    console.log({ status: 200, path: "/callback", username: username });
  } catch (err) {
    res.status(500).send({ errorMessage: "Something went wrong" });
    console.log({
      status: 500,
      path: "/callback",
      username: username,
      error: err.name,
    });
    console.log(
      '"NotAuthorizedException" errors can happen in dev because React Strict mode runs this POST call twice.'
    );
  }
});

app.listen(4000, () => {
  console.log(`Example app listening on port 4000`);
});
