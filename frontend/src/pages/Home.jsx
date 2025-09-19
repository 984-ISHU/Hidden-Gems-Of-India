import React, { useEffect, useState } from "react"
import {
  getArtisans,
  getArtisansBySkill,
  getArtisansByLocation,
  getEvents,
} from "@/lib/api"

const Home = () => {
  const [artisans, setArtisans] = useState([])
  const [events, setEvents] = useState([])

  const [skillFilter, setSkillFilter] = useState("")
  const [locationFilter, setLocationFilter] = useState("")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch artisans + events on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch artisans
        let artisanData = []
        if (skillFilter) {
          artisanData = await getArtisansBySkill(skillFilter)
        } else if (locationFilter) {
          artisanData = await getArtisansByLocation(locationFilter)
        } else {
          artisanData = await getArtisans()
        }

        setArtisans(artisanData)

        // Fetch events (you could pass locationFilter if needed)
        const eventData = await getEvents(locationFilter || "")
        setEvents(eventData)
      } catch (err) {
        setError(err.response?.data || err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [skillFilter, locationFilter]) // re-fetch when filters change

  // Render barebones logic
  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div>
      <h1>Home Page</h1>

      {/* Filters */}
      <div>
        <input
          placeholder="Filter by skill"
          value={skillFilter}
          onChange={(e) => {
            setSkillFilter(e.target.value)
            setLocationFilter("") // reset other filter
          }}
        />
        <input
          placeholder="Filter by location"
          value={locationFilter}
          onChange={(e) => {
            setLocationFilter(e.target.value)
            setSkillFilter("") // reset other filter
          }}
        />
      </div>

      {/* Artisans */}
      <section>
        <h2>Artisans</h2>
        {artisans.length > 0 ? (
          <ul>
            {artisans.map((a) => (
              <li key={a.id}>
                {a.name} — {a.craft} ({a.location})
              </li>
            ))}
          </ul>
        ) : (
          <p>No artisans found.</p>
        )}
      </section>

      {/* Events */}
      <section>
        <h2>Events</h2>
        {events.length > 0 ? (
          <ul>
            {events.map((e) => (
              <li key={e.id}>
                {e.title} — {e.time || "No time specified"}
              </li>
            ))}
          </ul>
        ) : (
          <p>No events found.</p>
        )}
      </section>
    </div>
  )
}

export default Home