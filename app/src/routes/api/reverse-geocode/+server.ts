import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const lat = url.searchParams.get('lat');
  const lng = url.searchParams.get('lng');

  if (!lat || !lng) {
    return json({ error: 'Latitude and longitude are required' }, { status: 400 });
  }

  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'PlanetTriviaApp/1.0 (https://your-app-url.com, your-email@example.com)' // Replace with your actual app URL and email
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error! status: ${response.status}`);
    }

    const data = await response.json();

    const city = data.address.city || data.address.town || data.address.village || data.address.hamlet || 'Unknown City';
    const region = data.address.state || data.address.province || 'Unknown Region';
    const country = data.address.country || 'Unknown Country';
    const displayName = data.display_name || `${city}, ${region}, ${country}`;

    return json({
      city,
      region,
      country,
      displayName,
    });
  } catch (error: unknown) {
    console.error('Error in reverse geocoding:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return json({ error: `Failed to get location data: ${errorMessage}` }, { status: 500 });
  }
};
