const { Handler } = require('@netlify/functions');

const handler = Handler(async (event, context) => {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stotteyman.com';
    const sitemapUrl = `${siteUrl}/sitemap.xml`;
    
    // Ping Google
    const googlePingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    
    const googleResponse = await fetch(googlePingUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Stotteyman-Sitemap-Ping/1.0',
      },
    });
    
    // Ping Bing
    const bingPingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    
    const bingResponse = await fetch(bingPingUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Stotteyman-Sitemap-Ping/1.0',
      },
    });
    
    const results = {
      timestamp: new Date().toISOString(),
      siteUrl,
      sitemapUrl,
      google: {
        status: googleResponse.status,
        statusText: googleResponse.statusText,
        success: googleResponse.ok,
      },
      bing: {
        status: bingResponse.status,
        statusText: bingResponse.statusText,
        success: bingResponse.ok,
      },
    };
    
    console.log('Sitemap ping results:', results);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        message: 'Sitemap ping completed',
        results,
      }),
    };
    
  } catch (error) {
    console.error('Sitemap ping error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
});

module.exports = { handler };
