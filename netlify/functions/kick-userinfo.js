exports.handler = async function handler(event) {
  const authorization = event.headers.authorization || event.headers.Authorization;

  if (!authorization) {
    return {
      statusCode: 401,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'missing_authorization_header' }),
    };
  }

  try {
    const response = await fetch('https://api.kick.com/public/v1/users', {
      headers: {
        Authorization: authorization,
        Accept: 'application/json',
      },
    });

    const payload = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };
    }

    const user = Array.isArray(payload?.data) ? payload.data[0] : null;

    if (!user || !user.user_id) {
      return {
        statusCode: 502,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'invalid_kick_userinfo_response', payload }),
      };
    }

    const username = typeof user.name === 'string' ? user.name.trim() : '';

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      body: JSON.stringify({
        sub: String(user.user_id),
        id: String(user.user_id),
        user_id: user.user_id,
        email: typeof user.email === 'string' ? user.email : null,
        name: username || null,
        preferred_username: username || null,
        username: username || null,
        picture: typeof user.profile_picture === 'string' ? user.profile_picture : null,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'kick_userinfo_proxy_failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};