import type { Climate, Soil } from "@/lib/types";

export type Place = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  zone: string;
  climate: Climate;
  rainIn: number;
  blurb: string;
};

export const PLACES: Place[] = [
  { id: "corvallis", name: "Corvallis, Oregon", lat: 44.5646, lon: -123.262, zone: "8b", climate: "marine", rainIn: 43, blurb: "Mild wet winters, dry gentle summers, and a lot of clay." },
  { id: "albany", name: "Albany, Oregon", lat: 44.6365, lon: -123.1059, zone: "8b", climate: "marine", rainIn: 42, blurb: "Willamette Valley. Wet winters, dry summers, heavy valley soil." },
  { id: "eugene", name: "Eugene, Oregon", lat: 44.0521, lon: -123.0868, zone: "8b", climate: "marine", rainIn: 46, blurb: "A touch warmer than Portland, still a marine wet-winter climate." },
  { id: "portland", name: "Portland, Oregon", lat: 45.5152, lon: -122.6784, zone: "8b", climate: "marine", rainIn: 36, blurb: "Marine. Gray winters, dry August, and gardens that forgive a lot." },
  { id: "salem", name: "Salem, Oregon", lat: 44.9429, lon: -123.0351, zone: "8b", climate: "marine", rainIn: 40, blurb: "Valley floor. Wet winters and a hotter August than the coast." },
  { id: "bend", name: "Bend, Oregon", lat: 44.0582, lon: -121.3153, zone: "6b", climate: "arid", rainIn: 12, blurb: "High desert. Cold nights, hard sun, and almost no summer rain." },
  { id: "medford", name: "Medford, Oregon", lat: 42.3265, lon: -122.8756, zone: "8a", climate: "mediterranean", rainIn: 19, blurb: "Hot dry summers and a colder winter than the valley north of it." },
  { id: "brookings", name: "Brookings, Oregon", lat: 42.0526, lon: -124.2839, zone: "9b", climate: "marine", rainIn: 75, blurb: "Mild, wet, and foggy. Almost frost-free, never dry for long." },
  { id: "seattle", name: "Seattle, Washington", lat: 47.6062, lon: -122.3321, zone: "8b", climate: "marine", rainIn: 38, blurb: "Marine. Cool summers, wet winters, and shade from cloud as much as trees." },
  { id: "boise", name: "Boise, Idaho", lat: 43.615, lon: -116.2023, zone: "7a", climate: "continental", rainIn: 12, blurb: "Cold winters, hot dry summers, and a short spring." },
  { id: "scottsdale", name: "Scottsdale, Arizona", lat: 33.4942, lon: -111.9261, zone: "9b", climate: "arid", rainIn: 8, blurb: "Low desert. Brutal summer sun, alkaline soil, and rain you can count on one hand." },
  { id: "phoenix", name: "Phoenix, Arizona", lat: 33.4484, lon: -112.074, zone: "9b", climate: "arid", rainIn: 8, blurb: "Same desert as Scottsdale. Heat, caliche, and irrigation or nothing." },
  { id: "tucson", name: "Tucson, Arizona", lat: 32.2226, lon: -110.9747, zone: "9a", climate: "arid", rainIn: 12, blurb: "Sonoran desert with a real monsoon. Still not a place for maples." },
  { id: "flagstaff", name: "Flagstaff, Arizona", lat: 35.1983, lon: -111.6513, zone: "6a", climate: "continental", rainIn: 22, blurb: "Mountain cold. A different Arizona than the desert floor." },
  { id: "los-angeles", name: "Los Angeles, California", lat: 34.0522, lon: -118.2437, zone: "10b", climate: "mediterranean", rainIn: 15, blurb: "Mild winters, dry summers, and a long planting season." },
  { id: "san-francisco", name: "San Francisco, California", lat: 37.7749, lon: -122.4194, zone: "10a", climate: "marine", rainIn: 23, blurb: "Cool fog, almost no frost, and summers that never heat up." },
  { id: "sacramento", name: "Sacramento, California", lat: 38.5816, lon: -121.4944, zone: "9b", climate: "mediterranean", rainIn: 18, blurb: "Hot dry summers and a winter that is wet, not frozen." },
  { id: "denver", name: "Denver, Colorado", lat: 39.7392, lon: -104.9903, zone: "6a", climate: "continental", rainIn: 15, blurb: "Intense sun, hail, and a winter that swings forty degrees." },
  { id: "albuquerque", name: "Albuquerque, New Mexico", lat: 35.0844, lon: -106.6504, zone: "7b", climate: "arid", rainIn: 9, blurb: "High and dry. Cold nights, strong sun, little rain." },
  { id: "dallas", name: "Dallas, Texas", lat: 32.7767, lon: -96.797, zone: "8a", climate: "humid", rainIn: 37, blurb: "Hot humid summers, sudden freezes, and heavy soil." },
  { id: "austin", name: "Austin, Texas", lat: 30.2672, lon: -97.7431, zone: "8b", climate: "humid", rainIn: 34, blurb: "Heat, humidity, and a limestone soil that surprises eastern plants." },
  { id: "houston", name: "Houston, Texas", lat: 29.7604, lon: -95.3698, zone: "9a", climate: "humid", rainIn: 50, blurb: "Heat, humidity, and rain that does not know when to stop." },
  { id: "chicago", name: "Chicago, Illinois", lat: 41.8781, lon: -87.6298, zone: "6a", climate: "continental", rainIn: 36, blurb: "Cold winters, humid summers, and wind off the lake." },
  { id: "minneapolis", name: "Minneapolis, Minnesota", lat: 44.9778, lon: -93.265, zone: "4b", climate: "continental", rainIn: 32, blurb: "A hard winter. Plant for zone 4 and do not argue with it." },
  { id: "new-york", name: "New York, New York", lat: 40.7128, lon: -74.006, zone: "7b", climate: "humid", rainIn: 47, blurb: "Humid summers, cold winters, and a lot of shade from buildings." },
  { id: "boston", name: "Boston, Massachusetts", lat: 42.3601, lon: -71.0589, zone: "6b", climate: "humid", rainIn: 44, blurb: "Cold, coastal, and humid when summer finally arrives." },
  { id: "atlanta", name: "Atlanta, Georgia", lat: 33.749, lon: -84.388, zone: "8a", climate: "humid", rainIn: 50, blurb: "Heat, humidity, and red clay. Afternoon storms, not a dry season." },
  { id: "miami", name: "Miami, Florida", lat: 25.7617, lon: -80.1918, zone: "11a", climate: "tropical", rainIn: 62, blurb: "No frost. Salt, storms, and a year-round growing season." },
  { id: "nashville", name: "Nashville, Tennessee", lat: 36.1627, lon: -86.7816, zone: "7a", climate: "humid", rainIn: 47, blurb: "Humid, with a winter that still freezes." },
  { id: "charleston", name: "Charleston, South Carolina", lat: 32.7765, lon: -79.9311, zone: "8b", climate: "humid", rainIn: 51, blurb: "Hot, wet, and mild in winter. Live oaks, not spruces." },
  { id: "anchorage", name: "Anchorage, Alaska", lat: 61.2181, lon: -149.9003, zone: "5b", climate: "continental", rainIn: 16, blurb: "Short summers and a winter that sets the plant list for you." },
];

const byId = new Map(PLACES.map((place) => [place.id, place]));

export function getPlace(id: string) {
  return byId.get(id) ?? null;
}

export function zoneRank(zone: string) {
  const match = /^(\d{1,2})\s*([ab])?$/i.exec(zone.trim());
  if (!match) return 16;
  return Number(match[1]) * 2 + ((match[2] || "a").toLowerCase() === "b" ? 1 : 0);
}

export function climateLabel(climate: Climate) {
  switch (climate) {
    case "marine":
      return "a wet-winter marine climate";
    case "arid":
      return "a dry, hot climate";
    case "mediterranean":
      return "a dry-summer climate";
    case "continental":
      return "a cold-winter climate";
    case "humid":
      return "a humid climate";
    case "tropical":
      return "a tropical climate";
  }
}

export function suggestedSoil(climate: Climate): Soil {
  if (climate === "marine") return "clay";
  if (climate === "arid") return "sand";
  return "loam";
}

function milesBetween(aLat: number, aLon: number, bLat: number, bLon: number) {
  const r = 3958.8;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLon = ((bLon - aLon) * Math.PI) / 180;
  const la1 = (aLat * Math.PI) / 180;
  const la2 = (bLat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function nearestPlace(lat: number, lon: number) {
  let best = PLACES[0];
  let bestMiles = Infinity;
  for (const place of PLACES) {
    const miles = milesBetween(lat, lon, place.lat, place.lon);
    if (miles < bestMiles) {
      best = place;
      bestMiles = miles;
    }
  }
  return { place: best, miles: bestMiles };
}

export const QUICK_PLACES = ["corvallis", "scottsdale", "seattle", "bend", "austin", "chicago"];
