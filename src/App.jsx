import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Rectangle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Play, Pause, MapPin, Upload, Headphones, X, Calendar, User, Compass } from 'lucide-react';

// Bryant Neighborhood Bounding Box: [west, south, east, north] -> [[south, west], [north, east]]
const NEIGHBORHOOD_BOUNDS = [
  [44.9263, -93.2747], // Southwest (I-35W & 42nd St)
  [44.9342, -93.2625], // Northeast (Chicago Ave & 38th St)
];

const CENTER_COORDS = [44.93025, -93.2686];

// 3 Mock Oral History Data Points strictly inside Bryant, Minneapolis
const MOCK_STORIES = [
  {
    id: 1,
    title: "Summer Nights at Phelps Field Park",
    locationLabel: "Phelps Field Park • 39th St & Columbus Ave",
    narrator: "Dorothy Jenkins (Resident since 1962)",
    year: "1976",
    coords: [44.9319, -93.2644],
    excerpt: "In the seventies, the recreation center at Phelps Field was the heartbeat of Bryant. People gathered along Columbus Avenue for..",
    audioUrl: "https://soundhelix.com",
    duration: "1:42"
  },
  {
    id: 2,
    title: "Walking to Bryant Junior High",
    locationLabel: "38th St & 3rd Ave S",
    narrator: "Samuel Hightower",
    year: "1984",
    coords: [44.9336, -93.2718],
    excerpt: "Before the building became Sabathani Community Center, hundreds of us walked up 3rd Avenue every morning to get to school...",
    audioUrl: "https://soundhelix.com",
    duration: "2:15"
  },
  {
    id: 3,
    title: "Mr. Rubin’s Grocery Store & Game Room",
    locationLabel: "East 38th Street & 4th Ave S",
    narrator: "Kenneth Holt",
    year: "1985",
    coords: [44.9341, -93.2708],
    excerpt: "On 38 and 4th there was Mr. Rubin’s grocery store. He also had a game room where we played video games. The building was torn down and now it’s an empty lot [from the Minnepolis Interview Project]",
    audioUrl: "https://soundhelix.com",
    duration: "1:18"
  },
  {
    id: 4,
    title: "The Stone Gates at 42nd & 3rd",
    locationLabel: "Temple Israel Memorial Park • 4153 3rd Ave S",
    narrator: "Jocelyn White",
    year: "1979",
    coords: [44.9268, -93.2718],
    excerpt: "Founded in 1876, this is the oldest Jewish cemetery in Minneapolis. Growing up on 41st Street, we used to walk past the stone entrance gates and read the inscriptions.",
    audioUrl: "https://soundhelix.com",
    duration: "1:55"
  }
];

// Custom styled pin icon that highlights when selected or playing
function createCustomPin(isSelected, isPlaying) {
  const color = isPlaying ? '#d97706' : isSelected ? '#0f172a' : '#475569';
  const scale = isSelected || isPlaying ? 1.25 : 1;

  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="transform: scale(${scale}); transition: transform 0.15s ease;">
        <svg xmlns="http://w3.org" width="32" height="32" viewBox="0 0 24 24" fill="${color}" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3" fill="#ffffff"/>
        </svg>
      </div>
    `,
    iconSize: L.point(32, 32),
    iconAnchor: L.point(16, 32),
  });
}


// Smoothly pans map when a story is selected from the sidebar
function MapController({ selectedStory }) {
  const map = useMap();
  useEffect(() => {
    if (selectedStory) {
      map.panTo(selectedStory.coords, { animate: true });
    }
  }, [selectedStory, map]);
  return null;
}

export default function App() {
  const [selectedStory, setSelectedStory] = useState(MOCK_STORIES[0]);
  const [activeAudioStory, setActiveAudioStory] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const audioRef = useRef(null);

  const handleToggleAudio = (story) => {
    setSelectedStory(story);

    // If clicking play/pause on the currently loaded track
    if (activeAudioStory?.id === story.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
      return;
    }

    // Load and play a new story track
    setActiveAudioStory(story);
    if (audioRef.current) {
      audioRef.current.src = story.audioUrl;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Hidden Global Audio Element */}
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white border-b border-slate-200 shadow-xs z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
            <Headphones className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
              Bryant Voices: Oral History Archive
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              Hover or select any pin in Bryant (38th–42nd St, I-35W–Chicago Ave) to listen
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Compass className="w-3.5 h-3.5" />
            AR Walk Mode (Phase 2)
          </span>
          <button
            onClick={() => setShowLoginModal(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Contributor Login</span>
          </button>
        </div>
      </header>

      {/* Main Content Split: Map + Responsive Drawer/Sidebar */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Map Container */}
        <main className="relative flex-1 h-1/2 md:h-full">
          <MapContainer
            center={CENTER_COORDS}
            zoom={16}
            maxBounds={NEIGHBORHOOD_BOUNDS}
            maxBoundsViscosity={0.85}
            minZoom={15}
            className="w-full h-full z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapController selectedStory={selectedStory} />

            {/* Bryant Neighborhood Boundary */}
            <Rectangle
              bounds={NEIGHBORHOOD_BOUNDS}
              pathOptions={{
                color: '#d97706',
                weight: 2,
                dashArray: '6, 6',
                fillOpacity: 0.04,
              }}
            />

            {MOCK_STORIES.map((story) => {
              const isSelected = selectedStory?.id === story.id;
              const isStoryPlaying = activeAudioStory?.id === story.id && isPlaying;

              return (
                <Marker
                  key={story.id}
                  position={story.coords}
                  icon={createCustomPin(isSelected, isStoryPlaying)}
                  eventHandlers={{
                    mouseover: () => setSelectedStory(story),
                    click: () => setSelectedStory(story),
                  }}
                />
              );
            })}
          </MapContainer>
        </main>

        {/* Responsive Story Panel: Bottom Sheet on Mobile, Right Sidebar on Desktop */}
        <aside className="w-full md:w-96 lg:w-[420px] h-1/2 md:h-full bg-white border-t md:border-t-0 md:border-l border-slate-200 flex flex-col justify-between shadow-lg z-10 overflow-y-auto">
          {selectedStory ? (
            <div className="p-5 sm:p-6 flex-1 flex flex-col">
              {/* Location & Year Metadata */}
              <div className="flex items-center justify-between gap-2 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  A story from {selectedStory.year}
                </span>
                <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded-md border border-amber-200">
                  {selectedStory.duration}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug mb-2">
                {selectedStory.title}
              </h2>

              {/* Street Intersection & Narrator */}
              <div className="space-y-1 mb-4 pb-4 border-b border-slate-100 text-xs sm:text-sm text-slate-600">
                <p className="flex items-center gap-1.5 font-medium text-slate-800">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                  {selectedStory.locationLabel}
                </p>
                <p className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  {selectedStory.narrator}
                </p>
              </div>

              {/* Transcript Excerpt */}
              <div className="flex-1 mb-5">
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed italic">
                  "{selectedStory.excerpt}"
                </p>
              </div>

              {/* Primary Audio Action Button */}
              <button
                onClick={() => handleToggleAudio(selectedStory)}
                className={
                  activeAudioStory?.id === selectedStory.id && isPlaying
                    ? "w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer bg-amber-600 text-white hover:bg-amber-700"
                    : "w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer bg-slate-900 text-white hover:bg-slate-800"
                }
              >
                {activeAudioStory?.id === selectedStory.id && isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause Oral History</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Play Oral History ({selectedStory.duration})</span>
                  </>
                )}
              </button>
            </div>
          ) : null}

          {/* Quick Story Switcher Footer inside Sidebar/Drawer */}
          <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 shrink-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              All Bryant Stories ({MOCK_STORIES.length})
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {MOCK_STORIES.map((story, idx) => {
                const isCurrent = selectedStory?.id === story.id;
                return (
                  <button
                    key={story.id}
                    onClick={() => setSelectedStory(story)}
                    className={
                      isCurrent
                        ? "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer bg-slate-900 text-white"
                        : "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }
                  >
                    #{idx + 1} • {story.year}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* Mock Contributor Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Bryant Archivist Portal
              </h2>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Authenticated neighborhood archivists log in here to upload oral history recordings paired with GPX location waypoints. Public visitors browse freely without an account.
            </p>
            <div className="space-y-3 mb-5">
              <input
                type="email"
                disabled
                placeholder="archivist@bryantvoices.org"
                className="w-full px-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg text-slate-500"
              />
              <div className="p-3 border-2 border-dashed border-slate-300 rounded-lg text-center text-xs text-slate-500">
                + Upload Audio (.mp3/.wav) & GPX Location File
              </div>
            </div>
            <button
              onClick={() => setShowLoginModal(false)}
              className="w-full py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
