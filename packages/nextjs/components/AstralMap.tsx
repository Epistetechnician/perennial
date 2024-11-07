import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface AstralMapProps {
  initialLatitude?: number;
  initialLongitude?: number;
  onLocationSelect?: (lat: number, lng: number) => void;
  isViewOnly?: boolean;
}

interface SearchResult {
  place_name: string;
  center: [number, number];
}

// Use a known working token
mapboxgl.accessToken = 'pk.eyJ1IjoiZXBpc3RldGVjaCIsImEiOiJjbTJkZzE3cjgwZGo4MmxzYjV3bG1nZWNnIn0.6UmLgZTagCdK7iETTy2JeA';

// Add a CSS class for hover effect
const searchResultStyle = {
  padding: '0.75rem',
  cursor: 'pointer',
  color: 'white',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'background-color 0.2s ease'
} as const;

const AstralMap: React.FC<AstralMapProps> = ({
  initialLatitude,
  initialLongitude,
  onLocationSelect,
  isViewOnly = false
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${mapboxgl.accessToken}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data.features.map((feature: any) => ({
        place_name: feature.place_name,
        center: feature.center,
      })));
    } catch (error) {
      console.error('Error searching location:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSelect = (result: SearchResult) => {
    if (map.current && onLocationSelect) {
      // First zoom out slightly for a better animation
      map.current.easeTo({
        zoom: 2,
        duration: 1000,
        easing: (t) => t * (2 - t)
      });

      // Then after zooming out, fly to the location
      setTimeout(() => {
        if (map.current) {
          map.current.flyTo({
            center: result.center,
            zoom: 8,
            duration: 2500,
            pitch: 60,
            bearing: 0,
            essential: true,
            curve: 1.42,
            easing: (t) => {
              return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            },
          });

          // Add a marker at the selected location
          const marker = new mapboxgl.Marker({
            color: "#10B981",
            scale: 0.8
          })
            .setLngLat(result.center)
            .addTo(map.current);
        }
      }, 1000);

      // Only call onLocationSelect if it exists
      onLocationSelect(result.center[1], result.center[0]);
      setSearchResults([]);
      setSearchQuery(result.place_name);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const initializeMap = async () => {
      try {
        const newMap = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/dark-v11', // Changed to dark style
          projection: 'globe',
          zoom: 1.5,
          center: [0, 20],
          pitch: 45,
          antialias: true,
          attributionControl: false
        });

        map.current = newMap;

        // Wait for map to load before adding features
        await new Promise(resolve => newMap.on('load', resolve));

        newMap.setFog({
          color: 'rgb(186, 210, 235)',
          'high-color': 'rgb(36, 92, 223)',
          'horizon-blend': 0.02,
          'space-color': 'rgb(11, 11, 25)',
          'star-intensity': 0.6
        });

        newMap.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.terrain-rgb',
          tileSize: 512,
          maxzoom: 14
        });

        newMap.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

        // Add navigation control
        newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Add click handler with null check
        if (!isViewOnly && onLocationSelect) { // Only add click handler if not view-only and onLocationSelect exists
          newMap.on('click', (e) => {
            onLocationSelect(e.lngLat.lat, e.lngLat.lng);
          });
        }

        // Auto-rotation
        let rotationInterval = setInterval(() => {
          if (newMap && !newMap.isMoving()) {
            newMap.easeTo({
              bearing: (newMap.getBearing() + 0.5) % 360,
              duration: 50,
              easing: (t) => t
            });
          }
        }, 50);

        return () => {
          clearInterval(rotationInterval);
        };

      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [onLocationSelect, isViewOnly]);

  return (
    <div style={{ width: '100%', height: '400px', position: 'relative' }}>
      <div 
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          right: '1rem',
          zIndex: 2,
        }}
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            searchLocation(e.target.value);
          }}
          placeholder="Search for a location..."
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: 'none',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            color: 'white',
            outline: 'none',
          }}
        />
        {searchResults.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              borderRadius: '0.5rem',
              marginTop: '0.5rem',
              maxHeight: '200px',
              overflowY: 'auto',
            }}
          >
            {searchResults.map((result, index) => (
              <div
                key={index}
                onClick={() => handleSearchSelect(result)}
                className="search-result-item"
                style={searchResultStyle}
              >
                {result.place_name}
              </div>
            ))}
          </div>
        )}
      </div>
      <div 
        ref={mapContainer} 
        style={{ 
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          borderRadius: '0.5rem',
          overflow: 'hidden'
        }}
      />
      <div 
        style={{
          position: 'absolute',
          bottom: '1rem',
          left: '1rem',
          backgroundColor: 'rgba(0,0,0,0.75)',
          color: 'white',
          padding: '0.5rem',
          borderRadius: '0.375rem',
          zIndex: 1
        }}
      >
      
      </div>
    </div>
  );
};

export default AstralMap;
