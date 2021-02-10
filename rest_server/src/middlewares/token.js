const axios = require('axios');
const createError = require('http-errors');
const jwtDecode = require('jwt-decode');

const idpUrl = process.env.IDP_URL || '';

const getTokenInfo = async token => {
  const queryUrl = `${idpUrl}/api/v2/tokens/check`;
  return axios.get(queryUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const getUserInfo = async (userName, token) => {
  const queryUrl = `${idpUrl}/api/v2/users/${userName}`;
  return axios.get(queryUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const createHttpErrorFromAxiosError = error => {
  let httpError;
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    httpError = createError(
      error.response.status,
      error.response.data.code,
      error.response.data.message,
    );
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    httpError = createError('BadRequest', error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    httpError = createError('InternalServerError', error.message);
  }
  return httpError;
};

const checkAuthAndGetTokenInfo = async (req, res, next) => {
  if (!req.headers.authorization) {
    return next(
      createError(
        'Unauthorized',
        'UnauthorizedUserError',
        'Guest is not allowed to do this operation.',
      ),
    );
  }
  const token = req.headers.authorization.split(' ')[1];
  let tokenInfo = {};
  try {
    const response = await getTokenInfo(token);
    tokenInfo = response.data;
  } catch (err) {
    const httpError = createHttpErrorFromAxiosError(err);
    return res.status(httpError.status).send(httpError.message);
  }
  req.tokenInfo = tokenInfo;
  next();
};

const checkAuthAndGetUserInfo = async (req, res, next) => {
  if (!req.headers.authorization) {
    return next(
      createError(
        'Unauthorized',
        'UnauthorizedUserError',
        'Guest is not allowed to do this operation.',
      ),
    );
  }
  const token = req.headers.authorization.split(' ')[1];
  const tokenInfo = jwtDecode(token);
  if (!tokenInfo.username) {
    return next(
      createError(
        'Unauthorized',
        'UnauthorizedUserError',
        'Guest is not allowed to do this operation.',
      ),
    );
  }
  let userInfo = {};
  try {
    const response = await getUserInfo(tokenInfo.username, token);
    userInfo = response.data;
  } catch (err) {
    const httpError = createHttpErrorFromAxiosError(err);
    return res.status(httpError.status).send(httpError.message);
  }
  req.userInfo = userInfo;
  next();
};

const tokenInfoEcho = async (req, res) => {
  res.status(200);
  res.send(req.tokenInfo);
};

const userInfoEcho = async (req, res) => {
  res.status(200);
  res.send(req.userInfo);
};

module.exports = {
  checkAuthAndGetTokenInfo,
  checkAuthAndGetUserInfo,
  tokenInfoEcho,
  userInfoEcho,
};
