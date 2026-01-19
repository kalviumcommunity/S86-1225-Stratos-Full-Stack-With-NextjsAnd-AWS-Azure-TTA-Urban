import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!query && (!lat || !lon)) {
      return NextResponse.json(
        { error: 'Query or coordinates required' },
        { status: 400 }
      );
    }

    let url = '';
    
    if (query) {
      // Forward geocoding (address to coordinates)
      url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
    } else if (lat && lon) {
      // Reverse geocoding (coordinates to address)
      url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TTA-Urban-Grievance-System/1.0',
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error('Geocoding service error');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Geocoding error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch location data' },
      { status: 500 }
    );
  }
}
