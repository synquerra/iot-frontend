// src/utils/location.js

// Reverse-geo lookup using Nominatim (free, no billing, no API key)
export async function getLocationName(lat, lng) {
    try {
      if (!lat || !lng) return "Unknown";
  
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
  
      const res = await fetch(url, {
        headers: {
          "User-Agent": "YourAppName/1.0"  // required
        }
      });
  
      const data = await res.json();
  
      return (
        data?.display_name ||
        data?.address?.city ||
        data?.address?.town ||
        data?.address?.village ||
        "Unknown"
      );
    } catch (err) {
      console.error("Location lookup error:", err);
      return "Unknown";
    }
  }
  