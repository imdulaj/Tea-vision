import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export default function useLiveLocation() {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);

  useEffect(() => {
    let subscription;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        async (loc) => {
          setLocation(loc.coords);

          // 🔁 Reverse Geocoding (Lat/Lon → City/Village)
          const geo = await Location.reverseGeocodeAsync({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });

          if (geo.length > 0) {
            setAddress(geo[0]);
          }
        }
      );
    })();

    return () => subscription && subscription.remove();
  }, []);

  return { location, address };
}
