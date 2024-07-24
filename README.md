# Introduction

This repository contains example code for integrating Authsignal into AWS Cognito to create a passwordless authentication flow.
For more information please visit [our docs site](https://docs.authsignal.com/integrations/aws-cognito-express-backend).

# Installation

Please run the following command in both the `spa` and `backend` folders.

```bash
yarn install
```

# Running the SPA

```bash
yarn run dev
```

# Running the Express backend

```bash
COGNITO_CLIENT_ID=<ID_HERE> COGNITO_CLIENT_SECRET=<SECRET_HERE> COGNITO_USER_POOL_ID=<USER_POOL_ID_HERE> node app.js
```
