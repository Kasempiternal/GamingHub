import { NextRequest, NextResponse } from 'next/server';

// iTunes Search API - No authentication required!
// Docs: https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/

interface iTunesTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;
  previewUrl: string;
  releaseDate: string;
  trackTimeMillis: number;
}

interface iTunesSearchResponse {
  resultCount: number;
  results: iTunesTrack[];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
  }

  try {
    // iTunes Search API - completely free, no auth needed
    const response = await fetch(
      `https://itunes.apple.com/search?${new URLSearchParams({
        term: query,
        media: 'music',
        entity: 'song',
        limit: '25',
        country: 'ES', // Spanish market for better local results
      })}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('iTunes search error:', response.status);
      return NextResponse.json({ error: 'Search failed' }, { status: response.status });
    }

    const data: iTunesSearchResponse = await response.json();

    // Transform iTunes tracks to our format
    const tracks = data.results
      .filter(track => track.previewUrl) // Only include tracks with previews
      .map(track => ({
        id: `itunes_${track.trackId}`,
        title: track.trackName,
        artist: track.artistName,
        album: track.collectionName,
        albumArt: track.artworkUrl100.replace('100x100', '300x300'), // Get larger artwork
        releaseYear: new Date(track.releaseDate).getFullYear(),
        previewUrl: track.previewUrl, // 30-second preview URL
        duration: track.trackTimeMillis,
      }));

    return NextResponse.json({ success: true, tracks });
  } catch (err) {
    console.error('iTunes search error:', err);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
