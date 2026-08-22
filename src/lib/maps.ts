/**
 * Builds a Google Maps "get directions to this address" URL using the
 * documented Maps URLs API, so it opens directly into turn-by-turn
 * directions to that address without needing coordinates.
 */
export function getDirectionsUrl(address: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}
