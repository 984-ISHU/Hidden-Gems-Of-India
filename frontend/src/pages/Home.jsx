import React, { useState } from "react"
import { User, Calendar, Info, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import ArtisanCard from "../components/ArtisanCard"

// Mock artisan data
const artisanData = [
  { id: 1, name: "Aarav", craft: "Pottery", location: "Rajasthan" },
  { id: 2, name: "Meera", craft: "Weaving", location: "Gujarat" },
  { id: 3, name: "Arjun", craft: "Jewelry", location: "Kerala" },
  { id: 4, name: "Lata", craft: "Woodwork", location: "Karnataka" },
  { id: 5, name: "Ravi", craft: "Textiles", location: "West Bengal" },
  { id: 6, name: "Priya", craft: "Painting", location: "Uttar Pradesh" },
  { id: 7, name: "Dev", craft: "Metalwork", location: "Maharashtra" },
  { id: 8, name: "Anjali", craft: "Embroidery", location: "Odisha" },
]

// Mock event data
const eventData = [
  {
    id: 1,
    title: "Virtual Pottery Workshop",
    description: "Learn traditional pottery techniques from master craftspeople.",
    time: "Tomorrow, 2:00 PM IST",
    color: "border-yellow-500",
  },
  {
    id: 2,
    title: "Handloom Textile Fair",
    description: "Discover regional weaving traditions and connect with artisans.",
    time: "This Weekend",
    color: "border-red-600",
  },
]

const Home = () => {
  const [search, setSearch] = useState("")

  const filteredArtisans = artisanData.filter(
    (artisan) =>
      artisan.name.toLowerCase().includes(search.toLowerCase()) ||
      artisan.craft.toLowerCase().includes(search.toLowerCase()) ||
      artisan.location.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#F4E1C1]">
      {/* Header */}
      <header className="shadow-md bg-[#2A9D8F]">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#E3A008]">
              <MapPin className="w-6 h-6 text-[#264653]" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              Hidden Gems Of India
            </h1>
          </div>
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#F4E1C1]">
            <User className="w-6 h-6 text-[#264653]" />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="rounded-xl p-8 md:p-12 mb-16 shadow-lg bg-[#2A9D8F] flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="lg:w-3/5">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Handmade Traditions. <br />
              <span className="text-[#E3A008]">Digital Job Fair.</span>
            </h2>
            <p className="text-xl md:text-2xl font-medium text-[#F4E1C1]">
              Every craft tells a story.
            </p>
          </div>
          <div className="lg:w-2/5 flex justify-center">
            <Card className="w-64 h-48 shadow-lg flex items-center justify-center bg-[#F4E1C1]">
              <CardContent className="text-center text-[#264653]">
                <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center shadow-md bg-[#E3A008]">
                  <User className="w-10 h-10 text-[#264653]" />
                </div>
                <p className="text-lg font-semibold">Traditional Artisan</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search + Artisans */}
        <div className="mb-16">
          <div className="text-center mb-6">
            <h3 className="text-3xl md:text-4xl font-bold mb-2 text-[#264653]">
              Featured Artisans
            </h3>
            <p className="text-lg text-[#264653]/80">
              Discover master craftspeople from across India
            </p>
          </div>

          <div className="max-w-md mx-auto mb-10">
            <Input
              placeholder="Search artisans by name, craft, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-[#2A9D8F] focus-visible:ring-[#E3A008]"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredArtisans.length > 0 ? (
              filteredArtisans.map((artisan) => (
                <ArtisanCard key={artisan.id} artisan={artisan} />
              ))
            ) : (
              <p className="col-span-full text-center text-[#264653]">
                No artisans found.
              </p>
            )}
          </div>
        </div>

        {/* Bottom Sections */}
        <div className="grid md:grid-cols-2 gap-10">
          {/* Events */}
          <Card className="bg-[#F4E1C1]">
            <CardHeader className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#2A9D8F]">
                <Calendar className="w-6 h-6 text-[#F4E1C1]" />
              </div>
              <CardTitle className="text-2xl font-bold text-[#264653]">
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {eventData.map((event) => (
                <div
                  key={event.id}
                  className={`p-6 rounded-xl border-l-4 shadow-sm hover:shadow-md transition-shadow duration-200 bg-[#2A9D8F] ${event.color}`}
                >
                  <h4 className="font-bold text-lg text-white mb-2">
                    {event.title}
                  </h4>
                  <p className="text-sm mb-3 text-[#F4E1C1]">
                    {event.description}
                  </p>
                  <p className="text-xs font-medium text-[#E3A008]">
                    {event.time}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* About Us */}
          <Card className="bg-[#B3392A] text-[#F4E1C1]">
            <CardHeader className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#E3A008]">
                <Info className="w-6 h-6 text-[#264653]" />
              </div>
              <CardTitle className="text-2xl font-bold">About Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p>
                Connecting India's master artisans with global opportunities
                through our innovative digital platform.
              </p>
              <p>
                Preserving traditional crafts while empowering craftspeople with
                modern tools and market access.
              </p>
              <Button className="bg-[#E3A008] text-[#264653] hover:opacity-90 hover:scale-105 transition-all duration-200">
                Learn More
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default Home
