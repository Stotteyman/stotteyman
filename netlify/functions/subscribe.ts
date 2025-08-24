export async function handler(event: any) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { email } = JSON.parse(event.body || '{}')
    if (!email) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Email is required' }) }
    }

    // Here you would add your subscription logic, e.g., saving to a mailing list provider
    return { statusCode: 200, body: JSON.stringify({ message: 'Subscription successful' }) }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: 'Server error' }) }
  }
}
