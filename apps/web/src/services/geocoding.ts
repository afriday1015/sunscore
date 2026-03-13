/**
 * Reverse geocoding service
 * Uses Nominatim API to convert coordinates to Korean address components
 */

export interface AddressComponents {
  province?: string;      // 시/도 (state/province)
  city?: string;          // 시/군/구 (city/county/district)
  neighborhood?: string;  // 동/읍/면 (neighborhood/township)
}

const geocodeCache = new Map<string, AddressComponents | null>();
let lastRequestTime = 0;

/**
 * Reverse geocode coordinates to Korean address.
 * Uses Nominatim API with Korean language.
 * Results are cached by rounded coordinates (~11m precision).
 * Respects Nominatim rate limit (1 request/second).
 */
export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<AddressComponents | null> {
  // Round to 4 decimal places (~11m precision) for cache key
  const key = `${lat.toFixed(4)},${lon.toFixed(4)}`;

  if (geocodeCache.has(key)) {
    return geocodeCache.get(key) ?? null;
  }

  // Rate limit: max 1 request per second (Nominatim policy)
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < 1000) {
    await new Promise(resolve =>
      setTimeout(resolve, 1000 - timeSinceLastRequest)
    );
  }
  lastRequestTime = Date.now();

  try {
    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('format', 'json');
    url.searchParams.set('lat', lat.toString());
    url.searchParams.set('lon', lon.toString());
    url.searchParams.set('accept-language', 'ko');
    url.searchParams.set('addressdetails', '1');

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'SunScore/1.0'
      }
    });

    if (!response.ok) {
      console.warn('Reverse geocoding failed:', response.status);
      geocodeCache.set(key, null);
      return null;
    }

    const data = await response.json();

    if (!data || !data.address) {
      console.warn('No address data in response');
      geocodeCache.set(key, null);
      return null;
    }

    const address = data.address;

    // 한국 주소 체계 기반 매핑
    // 특별시/광역시는 state/province 없이 city 필드에 직접 들어옴
    let provinceValue = address.state || address.province;
    let usedCityAsProvince = false;

    if (!provinceValue && address.city) {
      provinceValue = address.city;
      usedCityAsProvince = true;
    }

    // 시/군/구: 특별시인 경우 borough에서, 일반 도인 경우 city에서
    let cityValue: string | undefined;
    if (usedCityAsProvince) {
      cityValue = address.borough || address.county || address.district;
    } else {
      cityValue = address.city;
    }

    // 동/읍/면: 특별시인 경우 suburb 등에서, 일반 도인 경우 borough 우선
    let neighborhoodValue: string | undefined;
    if (usedCityAsProvince) {
      neighborhoodValue = address.suburb || address.quarter ||
                          address.neighbourhood || address.village || address.hamlet;
    } else {
      neighborhoodValue = address.borough || address.suburb || address.quarter ||
                          address.city_district || address.neighbourhood ||
                          address.village || address.hamlet;
    }

    const result: AddressComponents = {
      province: provinceValue,
      city: cityValue,
      neighborhood: neighborhoodValue
    };

    geocodeCache.set(key, result);
    return result;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    geocodeCache.set(key, null);
    return null;
  }
}
