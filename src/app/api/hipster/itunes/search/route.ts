import { NextRequest, NextResponse } from 'next/server';

// iTunes Search API - No authentication required!
// Docs: https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/

// Simple in-memory cache to reduce iTunes API calls
const searchCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

function getCachedResult(query: string) {
  const cached = searchCache.get(query.toLowerCase());
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCachedResult(query: string, data: unknown) {
  // Limit cache size to prevent memory issues
  if (searchCache.size > 500) {
    // Remove oldest entries
    const entries = Array.from(searchCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    entries.slice(0, 100).forEach(([key]) => searchCache.delete(key));
  }
  searchCache.set(query.toLowerCase(), { data, timestamp: Date.now() });
}

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

// Keywords to filter out non-original tracks (live, remix, etc.)
const FILTERED_TRACK_KEYWORDS = [
  'live', 'remix', 'acoustic', 'remaster', 'remastered',
  'radio edit', 'extended', 'demo', 'cover', 'tribute',
  'karaoke', 'instrumental', 'reprise', 'unplugged', 'session'
];

function isOriginalTrack(trackName: string): boolean {
  const lowerName = trackName.toLowerCase();
  return !FILTERED_TRACK_KEYWORDS.some(keyword => lowerName.includes(keyword));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
  }

  // Check cache first
  const cached = getCachedResult(query);
  if (cached) {
    return NextResponse.json(cached);
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
      // On rate limit, return empty results instead of error (graceful degradation)
      if (response.status === 429) {
        return NextResponse.json({ success: true, tracks: [], rateLimited: true });
      }
      return NextResponse.json({ error: 'Search failed' }, { status: response.status });
    }

    const data: iTunesSearchResponse = await response.json();

    // Transform iTunes tracks to our format (filter out live/remix versions)
    const tracks = data.results
      .filter(track => track.previewUrl && isOriginalTrack(track.trackName))
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

    const result = { success: true, tracks };

    // Cache successful results
    setCachedResult(query, result);

    return NextResponse.json(result);
  } catch (err) {
    console.error('iTunes search error:', err);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
