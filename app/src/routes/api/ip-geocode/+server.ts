import type { RequestHandler } from './$types';
import geoip from 'geoip-lite';

export const GET: RequestHandler = async ({ request }) => {
  try {
    // Get the client's IP address from the request headers
    // Vercel uses 'x-forwarded-for', but 'cf-connecting-ip' is also common for Cloudflare
    // For local development, 'remoteAddress' might be available, but often resolves to '::1' or '127.0.0.1'
    // When running locally, the IP will often be localhost (::1 or 127.0.0.1), which geoip-lite cannot resolve to a real location.
    // To test local geolocation, we can use a mock IP for Victoria, BC.
    const hostHeader = request.headers.get('host');
    const isLocalhost = hostHeader && (hostHeader.startsWith('localhost:') || hostHeader === 'localhost' || hostHeader === '127.0.0.1' || hostHeader === '::1');
    const ip = isLocalhost ? '24.84.0.0' : request.headers.get('x-forwarded-for') || request.headers.get('cf-connecting-ip') || request.headers.get('x-real-ip');

    if (!ip) {
      // Fallback to London if IP cannot be determined
      const londonLocation = {
        latitude: 51.5074,
        longitude: 0.1278,
        city: 'London',
        region: 'England',
        country: 'United Kingdom',
        displayName: 'London, England, United Kingdom (Default)'
      };
      return new Response(JSON.stringify(londonLocation), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const geo = geoip.lookup(ip);

    if (geo) {
      const locationData = {
        latitude: geo.ll[0],
        longitude: geo.ll[1],
        city: geo.city || 'Unknown City',
        region: geo.region || 'Unknown Region',
        country: geo.country || 'Unknown Country',
        displayName: `${geo.city || 'Unknown City'}, ${geo.region || 'Unknown Region'}, ${geo.country || 'Unknown Country'}`
      };
      return new Response(JSON.stringify(locationData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // Fallback to London if geoip lookup fails
      const londonLocation = {
        latitude: 51.5074,
        longitude: 0.1278,
        city: 'London',
        region: 'England',
        country: 'United Kingdom',
        displayName: 'London, England, United Kingdom (Default)'
      };
      return new Response(JSON.stringify(londonLocation), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error in IP geolocation API:', error);
    // Fallback to London on error
    const londonLocation = {
      latitude: 51.5074,
      longitude: 0.1278,
      city: 'London',
      region: 'England',
      country: 'United Kingdom',
      displayName: 'London, England, United Kingdom (Default)'
    };
    return new Response(JSON.stringify(londonLocation), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
