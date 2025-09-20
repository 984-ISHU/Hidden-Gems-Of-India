import React, { useState, useEffect } from "react";
import api from "../lib/api";

// --- Navbar ---
function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white shadow">
      <div className="text-2xl font-bold text-indigo-700">Hidden Gems of India</div>
      <div>
        <a href="#search" className="mx-3 text-gray-700 hover:text-indigo-700">Search</a>
        <a href="#events" className="mx-3 text-gray-700 hover:text-indigo-700">Events</a>
        <a href="#about" className="mx-3 text-gray-700 hover:text-indigo-700">About</a>
      </div>
    </nav>
  );
}

// --- Hero Section ---
function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center h-[50vh] bg-gradient-to-br from-teal-400 via-teal-500 to-teal-600 text-center px-4">
      <div className="flex items-center mb-6">
        <div className="bg-cream-100 rounded-lg p-6 mr-6 shadow-lg">
          <h2 className="text-orange-700 text-2xl font-bold mb-2">Handmade Traditions,</h2>
          <h2 className="text-orange-700 text-2xl font-bold mb-4">Crafted for You.</h2>
          <p className="text-gray-700 text-sm">Every craft tells a story...</p>
        </div>
        <div className="hidden md:block">
          <img 
            src="/api/placeholder/200/200" 
            alt="Artisan crafting" 
            className="w-48 h-48 object-contain"
          />
        </div>
      </div>
      <a href="#search" className="px-8 py-3 bg-orange-600 text-white rounded-lg shadow-lg hover:bg-orange-700 transition-colors font-semibold">
        Discover Artisans
      </a>
    </section>
  );
}

// --- Artisan Profile Popup ---
function ArtisanPopup({ artisan, products, onClose }) {
  if (!artisan) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-indigo-700 text-xl" onClick={onClose}>&times;</button>
        <div className="flex flex-col items-center">
          <img
            src={artisan.profile_photo_url || "/default-avatar.png"}
            alt={artisan.name}
            className="w-24 h-24 rounded-full object-cover mb-2"
          />
          <h3 className="text-2xl font-bold text-indigo-800 mb-1">{artisan.name}</h3>
          <div className="text-gray-600 mb-2">{artisan.location}</div>
          <div className="mb-2">
            <span className="font-semibold">Skills:</span>{" "}
            {artisan.skills && artisan.skills.length > 0 ? artisan.skills.join(", ") : "N/A"}
          </div>
          <div className="mb-4 text-sm text-gray-700">{artisan.bio}</div>
        </div>
        <div>
          <h4 className="font-semibold text-indigo-700 mb-2">Products</h4>
          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {products.map(prod => (
                <div key={prod.id} className="border rounded p-2 flex items-center gap-3">
                  {prod.images && prod.images[0] && (
                    <img src={prod.images[0]} alt={prod.name} className="w-12 h-12 object-cover rounded" />
                  )}
                  <div>
                    <div className="font-bold">{prod.name}</div>
                    <div className="text-sm text-gray-600">{prod.description}</div>
                    <div className="text-indigo-700 font-semibold">₹{prod.price}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">No products listed.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Artisan Grid Component ---
function ArtisanGrid({ artisan, onClick }) {
  const primarySkill = artisan.skills && artisan.skills.length > 0 
    ? artisan.skills[0] 
    : artisan.skill || "Artisan";

  return (
    <div 
      onClick={() => onClick(artisan)}
      className="bg-gradient-to-br from-orange-400 to-amber-500 h-32 w-full flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 relative overflow-hidden"
    >
      {/* Decorative patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1 right-1 w-3 h-3 border border-white rotate-45"></div>
        <div className="absolute bottom-1 left-1 w-2 h-2 border border-white rotate-12"></div>
      </div>

      {/* Profile Image */}
      <div className="relative mb-1 z-10">
        {artisan.profile_photo_url ? (
          <img
            src={artisan.profile_photo_url}
            alt={artisan.name}
            className="w-8 h-8 rounded-full object-cover border border-white shadow-sm"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        <div className={`w-8 h-8 rounded-full bg-white bg-opacity-30 border border-white shadow-sm flex items-center justify-center ${artisan.profile_photo_url ? 'hidden' : 'flex'}`}>
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
      </div>

      {/* Name */}
      <h3 className="font-semibold text-gray-800 text-center mb-1 px-1 z-10 text-xs leading-tight truncate w-full">
        {artisan.name}
      </h3>

      {/* Skill */}
      <div className="bg-white bg-opacity-90 rounded-full px-2 py-0.5 mb-1 z-10">
        <p className="text-xs font-medium text-gray-700 text-center truncate">
          {primarySkill}
        </p>
      </div>

      {/* Location */}
      <div className="flex items-center text-gray-700 z-10">
        <svg className="w-2 h-2 mr-1" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        <p className="text-xs font-medium text-center truncate">
          {artisan.location || "Unknown"}
        </p>
      </div>
    </div>
  );
}

// --- Search Section ---
function SearchSection({ onSelectArtisan }) {
  const [location, setLocation] = useState("");
  const [skill, setSkill] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allArtisans, setAllArtisans] = useState([]);
  const [displayedArtisans, setDisplayedArtisans] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ARTISANS_PER_PAGE = 12; // 4x3 grid

  // Load all artisans on component mount
  useEffect(() => {
    const loadAllArtisans = async () => {
      try {
        const data = await api.getArtisans();
        const artisansArray = Array.isArray(data) ? data : [];
        setAllArtisans(artisansArray);
        setResults(artisansArray);
        // Show first 12 artisans initially
        setDisplayedArtisans(artisansArray.slice(0, ARTISANS_PER_PAGE));
        setCurrentPage(1);
      } catch (err) {
        console.error("Error loading artisans:", err);
        setAllArtisans([]);
        setResults([]);
        setDisplayedArtisans([]);
      }
    };

    loadAllArtisans();
  }, []);

  // Update displayed artisans when results change
  useEffect(() => {
    setDisplayedArtisans(results.slice(0, ARTISANS_PER_PAGE));
    setCurrentPage(1);
  }, [results]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let filteredResults = allArtisans;

      // Filter by location if provided
      if (location.trim()) {
        filteredResults = filteredResults.filter(artisan => 
          artisan.location && 
          artisan.location.toLowerCase().includes(location.toLowerCase())
        );
      }

      // Filter by skill if provided
      if (skill.trim()) {
        filteredResults = filteredResults.filter(artisan =>
          artisan.skills && 
          artisan.skills.some(s => 
            s.toLowerCase().includes(skill.toLowerCase())
          )
        );
      }

      setResults(filteredResults);
    } catch (err) {
      console.error("Error searching artisans:", err);
      setResults([]);
    }
    
    setLoading(false);
  };

  const clearFilters = () => {
    setLocation("");
    setSkill("");
    setResults(allArtisans);
  };

  const loadMore = () => {
    const nextPage = currentPage + 1;
    const startIndex = currentPage * ARTISANS_PER_PAGE;
    const endIndex = nextPage * ARTISANS_PER_PAGE;
    const newArtisans = results.slice(startIndex, endIndex);
    
    setDisplayedArtisans(prev => [...prev, ...newArtisans]);
    setCurrentPage(nextPage);
  };

  const hasMore = displayedArtisans.length < results.length;

  return (
    <section id="search" className="py-16 bg-gray-700 text-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold mb-4 text-white text-center">Search</h2>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-12 justify-center max-w-4xl mx-auto">
          <input
            type="text"
            placeholder="Location (e.g., Mumbai, Delhi)"
            className="border-0 rounded-lg px-4 py-3 flex-1 text-gray-800 bg-white shadow-md"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
          <input
            type="text"
            placeholder="Skill (e.g., pottery, weaving)"
            className="border-0 rounded-lg px-4 py-3 flex-1 text-gray-800 bg-white shadow-md"
            value={skill}
            onChange={e => setSkill(e.target.value)}
          />
          <button
            type="submit"
            className="px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold shadow-md"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="px-8 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold shadow-md"
          >
            Clear
          </button>
        </form>
        
        {/* Results count */}
        <div className="text-center text-gray-300 mb-8 text-lg">
          {loading ? "Loading..." : `Showing ${displayedArtisans.length} of ${results.length} artisan${results.length !== 1 ? 's' : ''}`}
        </div>

        {/* Artisans Grid - 4 columns fixed height */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {displayedArtisans.map(artisan => (
            <ArtisanGrid
              key={artisan.id}
              artisan={artisan}
              onClick={onSelectArtisan}
            />
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && !loading && (
          <div className="text-center mb-8">
            <button
              onClick={loadMore}
              className="px-12 py-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold text-lg shadow-lg"
            >
              Load More Artisans
            </button>
          </div>
        )}
        
        {results.length === 0 && !loading && (
          <div className="text-center text-gray-300 mt-12 text-lg">
            No artisans found. Try adjusting your search criteria.
          </div>
        )}
      </div>
    </section>
  );
}

// --- Events Section ---
function EventsSection() {
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAllEvents = async () => {
    setLoading(true);
    try {
      const data = await api.getAllEvents();
      // Handle the API response structure with "results" array
      const eventsArray = data && Array.isArray(data.results) ? data.results : [];
      setAllEvents(eventsArray);
      // Show top 5 events initially
      setEvents(eventsArray.slice(0, 5));
    } catch (err) {
      console.error("Error fetching all events:", err);
      setAllEvents([]);
      setEvents([]);
    }
    setLoading(false);
  };

  const filterEvents = () => {
    let filteredResults = allEvents;

    // Filter by location if provided
    if (location.trim()) {
      filteredResults = filteredResults.filter(event => 
        event["Venue of Event"] && 
        event["Venue of Event"].toLowerCase().includes(location.toLowerCase())
      );
    }

    // Filter by start date if provided
    if (startDate) {
      filteredResults = filteredResults.filter(event => {
        const eventDate = new Date(event["Event Start Date"]);
        return eventDate >= new Date(startDate);
      });
    }

    // Filter by end date if provided
    if (endDate) {
      filteredResults = filteredResults.filter(event => {
        const eventDate = new Date(event["Event End Date"] || event["Event Start Date"]);
        return eventDate <= new Date(endDate);
      });
    }

    // Show only top 5 filtered results
    setEvents(filteredResults.slice(0, 5));
  };

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    
    // Validate date range
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      alert("Start date cannot be after end date");
      return;
    }
    
    filterEvents();
  };

  const clearFilters = () => {
    setLocation("");
    setStartDate("");
    setEndDate("");
    // Reset to show top 5 events
    setEvents(allEvents.slice(0, 5));
  };

  return (
    <section id="events" className="p-8 bg-cream-100 rounded-lg h-full">
      <h2 className="text-3xl font-bold text-red-700 mb-6">Upcoming events</h2>
      <form onSubmit={handleFilter} className="flex flex-col gap-4 mb-6">
        <input
          type="text"
          placeholder="Location (e.g., Mumbai, Delhi)"
          className="border border-gray-300 rounded-lg px-4 py-3 bg-white shadow-sm"
          value={location}
          onChange={e => setLocation(e.target.value)}
        />
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-2 font-medium">Start Date</label>
            <input
              type="date"
              className="border border-gray-300 rounded-lg px-4 py-3 w-full bg-white shadow-sm"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-2 font-medium">End Date</label>
            <input
              type="date"
              className="border border-gray-300 rounded-lg px-4 py-3 w-full bg-white shadow-sm"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex-1 font-semibold"
            disabled={loading}
          >
            {loading ? "Filtering..." : "Filter Events"}
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
          >
            Clear
          </button>
        </div>
      </form>
      
      <div className="text-sm text-gray-600 mb-4">
        {loading ? "Loading..." : `Showing ${events.length} of ${allEvents.length} event${allEvents.length !== 1 ? 's' : ''} (top 5)`}
      </div>
      
      <div className="space-y-4 max-h-80 overflow-y-auto">
        {events.length > 0 ? events.map((event, index) => (
          <div key={event._id || index} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <div className="font-bold text-gray-900 mb-2">{event["Event Title"]}</div>
            <div className="text-sm text-gray-600 mb-2">
              📍 {event["Venue of Event"]} | 📅 {event["Event Start Date"]}
              {event["Event End Date"] && event["Event End Date"] !== event["Event Start Date"] && 
                ` - ${event["Event End Date"]}`
              }
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="text-gray-700">
                <span className="font-medium">Type:</span> {event["Event Types"]}
              </div>
              {event["Total no. of Stalls"] && (
                <div className="text-indigo-600 font-medium">
                  {event["Total no. of Stalls"]} stalls
                </div>
              )}
            </div>
            {event["Event Apply Closing Date"] && (
              <div className="text-xs text-red-600 mt-2">
                Apply by: {new Date(event["Event Apply Closing Date"]).toLocaleDateString()}
              </div>
            )}
          </div>
        )) : (
          <div className="text-gray-500 text-center py-8 bg-white rounded-lg border border-gray-200">
            {loading ? "Loading events..." : "No events found. Try adjusting your filter criteria."}
          </div>
        )}
      </div>
    </section>
  );
}

// --- About Us Section ---
function AboutSection() {
  return (
    <section id="about" className="p-8 bg-red-600 text-white rounded-lg h-full flex flex-col">
      <h2 className="text-4xl font-bold text-yellow-300 mb-6">About Us</h2>
      <div className="flex-grow">
        <p className="text-white mb-4 text-lg leading-relaxed">
          <b>Hidden Gems of India</b> is a platform dedicated to showcasing and empowering India's talented artisans.
          We connect you with authentic craftspeople, promote traditional skills, and help preserve our rich cultural heritage.
        </p>
        <p className="text-white mb-4 text-lg leading-relaxed">
          Our mission is to make it easy for anyone to discover, connect with, and support local artisans across India.
        </p>
        <p className="text-gray-200 text-base">
          Every craft tells a story, and every artisan preserves a piece of our heritage. Join us in celebrating 
          the incredible diversity and skill of India's craftspeople.
        </p>
      </div>
    </section>
  );
}

// --- Main Home Page ---
export default function Home() {
  const [selectedArtisan, setSelectedArtisan] = useState(null);
  const [artisanProducts, setArtisanProducts] = useState([]);

  // When an artisan is selected, fetch their products
  useEffect(() => {
    if (selectedArtisan) {
      api.getArtisanProducts(selectedArtisan.id)
        .then(data => setArtisanProducts(Array.isArray(data) ? data : []))
        .catch(err => {
          console.error("Error fetching artisan products:", err);
          setArtisanProducts([]);
        });
    }
  }, [selectedArtisan]);

  return (
    <div className="min-h-screen bg-teal-500">
      <Navbar />
      <HeroSection />
      <SearchSection onSelectArtisan={artisan => setSelectedArtisan(artisan)} />
      {selectedArtisan && (
        <ArtisanPopup
          artisan={selectedArtisan}
          products={artisanProducts}
          onClose={() => setSelectedArtisan(null)}
        />
      )}
      <div className="bg-teal-500 py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-6">
          <EventsSection />
          <AboutSection />
        </div>
      </div>
    </div>
  );
}