import React, { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, User, Plus, LogOut } from "lucide-react"
import api from "../lib/api"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../lib/AuthContext"

const Dashboard = () => {
  const [currentArtisan, setCurrentArtisan] = useState(null)
  const [artisanId, setArtisanId] = useState(null) // This will be the user_id for marketing/story APIs
  const [userEmail, setUserEmail] = useState(null) // This will be the email for product APIs
  const { user, login, logout } = useAuth()

  // Ensure userEmail is set from the authenticated user
  useEffect(() => {
    if (user && user.email) {
      setUserEmail(user.email)
    }
  }, [user])

  // Product states
  const [products, setProducts] = useState([])
  const [currentProductIndex, setCurrentProductIndex] = useState(0)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    images: [],
    availability: true,
    product_link: "",
  })
  const [loadingProducts, setLoadingProducts] = useState(false)

  // Events
  const [events, setEvents] = useState([])
  const [loadingEvents, setLoadingEvents] = useState(false)

  // Marketing Studio
  const [marketingOutput, setMarketingOutput] = useState(null)
  const [loadingMarketing, setLoadingMarketing] = useState(false)
  const [showMarketing, setShowMarketing] = useState(false)
  const [marketingPrompt, setMarketingPrompt] = useState("")
  const [marketingImage, setMarketingImage] = useState(null)

  // Poster Generator
  const [showPosterGenerator, setShowPosterGenerator] = useState(false)
  const [posterImage, setPosterImage] = useState(null)
  const [posterProductName, setPosterProductName] = useState("")
  const [generatedPoster, setGeneratedPoster] = useState(null)
  const [loadingPoster, setLoadingPoster] = useState(false)

  // Chatbot
  const [chatInput, setChatInput] = useState("")
  const [chatHistory, setChatHistory] = useState([])
  const [loadingChat, setLoadingChat] = useState(false)
  const [showChat, setShowChat] = useState(false)

  // Events display
  const [showEvents, setShowEvents] = useState(false)
  const [eventFilter, setEventFilter] = useState({ location: null, date: null, dateRange: false })
  // Event counts
  const now = new Date()
  const upcomingEvents = events.filter(e => {
    const start = new Date(e["Event Start Date"] || e.date || e.start_date)
    return start >= now
  })
  const pastEvents = events.filter(e => {
    const end = new Date(e["Event End Date"] || e.date || e.end_date || e["Event Start Date"])
    return end < now
  })

  // Story Generator
  const [showStoryGenerator, setShowStoryGenerator] = useState(false)
  const [storyExtraInfo, setStoryExtraInfo] = useState("")
  const [generatedStory, setGeneratedStory] = useState(null)
  const [loadingStory, setLoadingStory] = useState(false)

  const navigate = useNavigate();

  // Logout handler
    const handleLogout = async () => {
    try {
      await logout()
      navigate("/")
    } catch (err) {
      console.error("Logout error:", err)
    }
  }

  // Get current user's artisan profile
  useEffect(() => {
    const getArtisan = async () => {
      if (!userEmail) {
        console.log("No authenticated user found")
        return
      }
      
      try {
        console.log("Getting artisan for user email:", userEmail)
        const artisan = await api.getCurrentUserArtisan()
        setCurrentArtisan(artisan)
        if (artisan && artisan.user_id && typeof artisan.user_id === 'string' && !artisan.user_id.toLowerCase().includes('bio')) {
          setArtisanId(artisan.user_id) // Use artisan's user_id for marketing/story APIs
          console.log("Set artisanId to user_id:", artisan.user_id)
        } else {
          setArtisanId(null)
          console.warn("Artisan user_id is invalid, not setting artisanId:", artisan.user_id)
        }
        console.log("Found artisan:", artisan)
      } catch (err) {
        console.error("Failed to get artisan profile:", err)
        
        // If user doesn't have an artisan profile, try to create one
        try {
          console.log("Creating artisan profile for user email:", userEmail)
          const newArtisan = await api.createArtisanProfileByEmail(userEmail)
          setCurrentArtisan(newArtisan)
          if (newArtisan && newArtisan.user_id && typeof newArtisan.user_id === 'string' && !newArtisan.user_id.toLowerCase().includes('bio')) {
            setArtisanId(newArtisan.user_id) // Use the new artisan's user_id
            console.log("Set artisanId to user_id:", newArtisan.user_id)
          } else {
            setArtisanId(null)
            console.warn("New artisan user_id is invalid, not setting artisanId:", newArtisan.user_id)
          }
          console.log("Created new artisan profile:", newArtisan)
        } catch (createErr) {
          console.error("Failed to create artisan profile:", createErr)
          // Fallback: we'll handle this in individual functions
          console.log("Will handle API calls individually")
        }
      }
    }
    
    getArtisan()
  }, [userEmail])

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      if (!userEmail) return
      
      setLoadingProducts(true)
      console.log("[DEBUG] Fetching products for userEmail:", userEmail);
      try {
        const data = await api.getArtisanProductsByEmail(userEmail);
        console.log("[DEBUG] Products fetched:", data);
        setProducts(data);
      } catch (err) {
        console.log("[DEBUG] Error fetching products:", err);
        setProducts([]);
      }
      setLoadingProducts(false);
    }
    fetchProducts()
  }, [userEmail])

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true)
      try {
        const data = await api.findEvents({})
        // The backend returns { results: [...], count: N }
        setEvents(Array.isArray(data.results) ? data.results : [])
      } catch {
        setEvents([])
      }
      setLoadingEvents(false)
    }
    fetchEvents()
  }, [])

  // Product carousel navigation
  const nextProduct = () => {
    setCurrentProductIndex((prev) => (prev + 1) % products.length)
  }

  const prevProduct = () => {
    setCurrentProductIndex((prev) => (prev - 1 + products.length) % products.length)
  }

  // Add product
  const handleAddProduct = async (e) => {
    e.preventDefault()
    
    if (!userEmail) {
      alert("User email not available. Please refresh the page.")
      return
    }
    
    try {
      const product = await api.addArtisanProductByEmail(userEmail, newProduct)
      console.log("Product added successfully:", product)
      
      // Refresh the products list
      const data = await api.getArtisanProductsByEmail(userEmail)
      setProducts(data)
      
      setNewProduct({ 
        name: "", 
        description: "", 
        price: "", 
        category: "",
        images: [],
        availability: true,
        product_link: "",
      })
      setShowAddForm(false)
    } catch (err) {
      console.error("Failed to add product:", err)
      alert("Failed to add product: " + (err.response?.data?.detail || err.message))
    }
  }

  // Marketing Studio
  const handleGenerateMarketing = async (customPrompt = null, customImage = null) => {
    setLoadingMarketing(true)
    try {
      const prompt = customPrompt || marketingPrompt || "handcrafted artisan products"
      const image = customImage || marketingImage
      
      if (!artisanId) {
        throw new Error("Artisan ID not available. Please refresh the page.")
      }
      
      console.log("Using artisan ID for marketing:", artisanId)
      const output = await api.getMarketingOutput(artisanId, prompt, image)
      setMarketingOutput(output)
    } catch (err) {
      console.error("Marketing generation error:", err)
      setMarketingOutput({ error: "Failed to generate marketing output: " + (err.message || err) })
    }
    setLoadingMarketing(false)
  }

  // Poster Generator
  const handleGeneratePoster = async () => {
    if (!posterImage) {
      alert("Please select an image to generate a poster")
      return
    }
    
    setLoadingPoster(true)
    try {
      console.log("Generating poster with image:", posterImage.name, "product name:", posterProductName)
      const posterBlob = await api.generatePoster(posterImage, posterProductName)
      console.log("Received blob:", posterBlob)
      
      if (!(posterBlob instanceof Blob)) {
        throw new Error("Response is not a valid blob")
      }
      
      const posterUrl = URL.createObjectURL(posterBlob)
      console.log("Created blob URL:", posterUrl)
      setGeneratedPoster(posterUrl)
    } catch (err) {
      console.error("Poster generation error:", err)
      alert("Failed to generate poster: " + (err.message || err))
    }
    setLoadingPoster(false)
  }

  // Download poster
  const handleDownloadPoster = () => {
    if (generatedPoster) {
      console.log("Downloading poster from URL:", generatedPoster)
      const link = document.createElement('a')
      link.href = generatedPoster
      link.download = 'marketing-poster.jpg'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // Helper function to check if an event matches current filters
  const matchesEventFilter = (event) => {
    const eventLocation = event["Venue of Event"]?.toLowerCase() || ""
    const eventStartDate = event["Event Start Date"]
    
    // Location filter
    if (eventFilter.location.trim()) {
      const locationSearch = eventFilter.location.toLowerCase()
      if (!eventLocation.includes(locationSearch)) {
        return false
      }
    }
    
    // Date filter
    if (eventFilter.date) {
      const filterDate = new Date(eventFilter.date)
      const startDate = new Date(eventStartDate)
      const endDate = new Date(event["Event End Date"])
      
      if (eventFilter.dateRange) {
        // Event should start on or after the filter date
        return startDate >= filterDate
      } else {
        // Event should be active on the filter date (date falls within event period)
        return filterDate >= startDate && filterDate <= endDate
      }
    }
    
    return true
  }

  // Filter events
  const handleFilterEvents = async () => {
    setLoadingEvents(true)
    try {
      let filteredEvents = []
      const params = {}
      if (eventFilter.location && eventFilter.location.trim()) {
        params.location = eventFilter.location.trim()
      }
      if (eventFilter.date) {
        params.date = eventFilter.date
      }
      
      const data = await api.findEvents(params)
      filteredEvents = Array.isArray(data.results) ? data.results : []
      
      console.log("Filtered events:", filteredEvents)
      setEvents(filteredEvents)
    } catch (err) {
      console.error("Error filtering events:", err)
      setEvents([])
    }
    setLoadingEvents(false)
  }

  // Story Generator
  const handleGenerateStory = async () => {
    setLoadingStory(true)
    try {
      if (!artisanId) {
        throw new Error("Artisan ID not available. Please refresh the page.")
      }
      
      console.log("Generating story for artisan:", artisanId)
      const result = await api.generateStoryFromBio(artisanId, storyExtraInfo)
      console.log("Story generation result:", result)
      setGeneratedStory(result)
    } catch (err) {
      console.error("Story generation error:", err)
      const errorMessage = err.response?.data?.detail || err.message || "Failed to generate story"
      setGeneratedStory({ error: errorMessage })
    }
    setLoadingStory(false)
  }

  // Cleanup blob URLs when component unmounts or poster changes
  useEffect(() => {
    return () => {
      if (generatedPoster && generatedPoster.startsWith('blob:')) {
        URL.revokeObjectURL(generatedPoster)
      }
    }
  }, [generatedPoster])

  // Chatbot
  const handleChatSubmit = async (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    setLoadingChat(true)
    setChatHistory((prev) => [...prev, { role: "user", content: chatInput }])
    try {
      const chatRequest = {
        query: chatInput,
        top_k: 5
      }
      const res = await api.assistantChat(chatRequest)
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: res.answer || "No answer." },
      ])
    } catch {
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't fetch an answer." },
      ])
    }
    setChatInput("")
    setLoadingChat(false)
  }

  // Get visible products for carousel
  const getVisibleProducts = () => {
    if (products.length === 0) return []
    // Only show up to the number of available products
    const visibleCount = Math.min(3, products.length)
    const visible = []
    for (let i = 0; i < visibleCount; i++) {
      const index = (currentProductIndex + i) % products.length
      visible.push(products[index])
    }
    return visible
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #2D5A87 0%, #1E3A5F 100%)' }}>
      {/* Header */}
      <header className="flex justify-between items-center p-4 text-white">
        <h1 className="text-2xl font-bold text-yellow-300" style={{ fontFamily: 'serif' }}>
          Artisan Dashboard
        </h1>
        <div className="flex items-center gap-3">
          <button
            className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center hover:ring-2 hover:ring-yellow-400 transition"
            onClick={() => navigate("/profile")}
            title="Go to Profile"
          >
            <User className="w-6 h-6 text-gray-600" />
          </button>
          <button
            className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center hover:ring-2 hover:ring-red-400 transition"
            onClick={handleLogout}
            title="Log out"
          >
            <LogOut className="w-6 h-6 text-gray-600" />
          </button>
          <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </header>

      <div className="px-4 pb-8">
        {/* Your Products Section */}
        <div 
          className="rounded-lg p-6 mb-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)' }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'serif', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              Your Products
            </h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Products
            </button>
          </div>

          {/* Product Carousel */}
          <div className="relative flex items-center justify-center">
            <button 
              onClick={prevProduct}
              className="absolute left-2 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all"
              disabled={products.length <= 3}
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            <div className="flex gap-4 justify-center">
              {loadingProducts ? (
                <div className="text-white text-lg">Loading products...</div>
              ) : products.length === 0 ? (
                <div className="text-white text-lg">No products yet. Add your first product!</div>
              ) : (
                getVisibleProducts().map((product, idx) => (
                  <div 
                    key={`${product.id}-${idx}`}
                    className="w-32 h-32 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg shadow-xl flex flex-col items-center justify-center p-2 transform hover:scale-105 transition-transform"
                  >
                    {/* 3D Box Icon */}
                    <div className="w-12 h-12 mb-2 relative">
                      <div className="w-full h-full bg-yellow-200 rounded transform rotate-12 absolute"></div>
                      <div className="w-full h-full bg-yellow-300 rounded transform -rotate-6 absolute"></div>
                      <div className="w-full h-full bg-yellow-400 rounded relative flex items-center justify-center">
                        <div className="w-6 h-1 bg-yellow-600 rounded"></div>
                      </div>
                    </div>
                    <div className="text-white text-xs font-semibold text-center">
                      {product.name.length > 15 ? product.name.slice(0, 15) + '...' : product.name}
                    </div>
                    <div className="text-white text-xs">₹{product.price}</div>
                    {product.category && (
                      <div className="text-white text-xs opacity-80">{product.category}</div>
                    )}
                  </div>
                ))
              )}
            </div>

            <button 
              onClick={nextProduct}
              className="absolute right-2 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all"
              disabled={products.length <= 3}
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Add Product Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold mb-4">Add New Product</h3>
              <div className="space-y-4">
                <input
                  placeholder="Product Name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
                <input
                  placeholder="Description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
                <input
                  placeholder="Category"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
                <input
                  placeholder="Product Link (optional)"
                  value={newProduct.product_link}
                  onChange={(e) => setNewProduct({ ...newProduct, product_link: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="availability"
                    checked={newProduct.availability}
                    onChange={(e) => setNewProduct({ ...newProduct, availability: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="availability" className="text-sm">Product Available</label>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      handleAddProduct(e)
                    }}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold"
                  >
                    Add Product
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-500 text-white py-2 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Create Ads Card */}
          <div 
            className="h-48 rounded-lg shadow-xl cursor-pointer transform hover:scale-105 transition-all p-6 flex flex-col justify-between"
            style={{ background: 'linear-gradient(135deg, #C0392B 0%, #8E2D20 100%)' }}
            onClick={() => setShowMarketing(!showMarketing)}
          >
            <h3 className="text-white font-bold text-xl" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              CREATE ADS
            </h3>
            <div className="text-white text-sm opacity-90">
              Generate AI-powered marketing content for your products
            </div>
          </div>

          {/* Chat Bot Card */}
          <div 
            className="h-48 rounded-lg shadow-xl cursor-pointer transform hover:scale-105 transition-all p-6 flex flex-col justify-between"
            style={{ background: 'linear-gradient(135deg, #F39C12 0%, #D68910 100%)' }}
            onClick={() => setShowChat(!showChat)}
          >
            <h3 className="text-white font-bold text-xl" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              CHAT BOT
            </h3>
            <div className="text-white text-sm opacity-90">
              Get help with government schemes and artisan programs
            </div>
          </div>

          {/* Events Card */}
          <div 
            className="h-48 rounded-lg shadow-xl cursor-pointer transform hover:scale-105 transition-all p-6 flex flex-col justify-between"
            style={{ background: 'linear-gradient(135deg, #27AE60 0%, #229954 100%)' }}
            onClick={() => setShowEvents(!showEvents)}
          >
            <h3 className="text-white font-bold text-xl" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              EVENTS
            </h3>
            <div className="text-white text-sm opacity-90">
              Find craft fairs and exhibitions near you
            </div>
          </div>

          {/* Poster Generator Card */}
          <div 
            className="h-48 rounded-lg shadow-xl cursor-pointer transform hover:scale-105 transition-all p-6 flex flex-col justify-between"
            style={{ background: 'linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%)' }}
            onClick={() => setShowPosterGenerator(!showPosterGenerator)}
          >
            <h3 className="text-white font-bold text-xl" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              POSTER MAKER
            </h3>
            <div className="text-white text-sm opacity-90">
              Generate professional marketing posters for your products
            </div>
          </div>
        </div>

        {/* Marketing Studio Modal */}
        {showMarketing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Marketing Studio (GenAI)</h3>
                <button
                  onClick={() => {
                    setShowMarketing(false)
                    setMarketingOutput(null)
                    setMarketingPrompt("")
                    setMarketingImage(null)
                  }}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>
              
              {!marketingOutput && !loadingMarketing && (
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Marketing Prompt *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., handcrafted pottery, wooden sculptures, traditional textiles"
                      value={marketingPrompt}
                      onChange={(e) => setMarketingPrompt(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Image (optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setMarketingImage(e.target.files[0] || null)}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold w-full"
                    onClick={handleGenerateMarketing}
                    disabled={!marketingPrompt.trim()}
                  >
                    Generate Marketing Content
                  </button>
                </div>
              )}
              
              {loadingMarketing && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-blue-600">Generating marketing content...</div>
                </div>
              )}
              
              {marketingOutput && (
                <div className="space-y-4">
                  <div className="bg-gray-100 p-4 rounded-lg">
                    {marketingOutput.error ? (
                      <div className="text-red-600">
                        <strong>Error:</strong> {marketingOutput.error}
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-semibold text-lg mb-2">Generated Marketing Content:</h4>
                        <p className="text-gray-800 whitespace-pre-wrap">{marketingOutput.content}</p>
                        {marketingOutput.note && (
                          <p className="text-sm text-gray-600 mt-2">
                            <em>Note: {marketingOutput.note}</em>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                    onClick={() => {
                      setMarketingOutput(null)
                      setMarketingPrompt("")
                      setMarketingImage(null)
                    }}
                  >
                    Generate New Content
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat Bot Modal */}
        {showChat && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 h-96 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Govt. Schemes Chatbot (GenAI)</h3>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 overflow-y-auto mb-4 p-4 border rounded-lg bg-gray-50">
                {chatHistory.length === 0 && (
                  <div className="text-gray-500 text-sm">
                    Ask about any government scheme for artisans.
                  </div>
                )}
                {chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`mb-2 p-2 rounded ${
                      msg.role === "user"
                        ? "bg-blue-100 text-blue-800 ml-8"
                        : "bg-green-100 text-green-800 mr-8"
                    }`}
                  >
                    <b>{msg.role === "user" ? "You" : "Bot"}:</b> {msg.content}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 border rounded-lg px-3 py-2"
                  placeholder="Type your question..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={loadingChat}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleChatSubmit(e)
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    handleChatSubmit(e)
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                  disabled={loadingChat}
                >
                  {loadingChat ? "..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Events Modal */}
        {showEvents && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Events</h3>
                <button
                  onClick={() => setShowEvents(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>
              
              {/* Event Filter Section */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-3">Filter Events</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Mumbai, Delhi"
                      value={eventFilter.location || ""}
                      onChange={(e) => setEventFilter({ ...eventFilter, location: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={eventFilter.date || ""}
                      onChange={(e) => setEventFilter({ ...eventFilter, date: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleFilterEvents}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => {
                      setEventFilter({ location: null, date: null, dateRange: false })
                      // Fetch all events again
                      const fetchAll = async () => {
                        setLoadingEvents(true)
                        try {
                          const data = await api.findEvents({})
                          setEvents(Array.isArray(data.results) ? data.results : [])
                        } catch {
                          setEvents([])
                        }
                        setLoadingEvents(false)
                      }
                      fetchAll()
                    }}
                    className="text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>

              <div className="mb-4 flex gap-4 text-sm">
                <span className="font-semibold">Total: {events.length}</span>
                <span className="text-green-700">Upcoming: {upcomingEvents.length}</span>
                <span className="text-gray-500">Past: {pastEvents.length}</span>
              </div>
              
              {loadingEvents ? (
                <p>Loading events...</p>
              ) : events.length > 0 ? (
                <div className="space-y-4">
                  {events.map((event, index) => (
                    <div key={event._id || index} className="border rounded-lg p-4 bg-white shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-lg text-blue-800 mb-2">
                            {event["Event Title"] || event.title || "Untitled Event"}
                          </h4>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Type:</span> {event["Event Types"] || "N/A"}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Venue:</span> {event["Venue of Event"] || event.location || "N/A"}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Stalls:</span> {event["Total no. of Stalls"] || "N/A"}
                          </p>
                        </div>
                        <div>
                          <div className="space-y-2">
                            <p className="text-sm">
                              <span className="font-medium text-green-700">Start:</span> {event["Event Start Date"] || "N/A"}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium text-red-700">End:</span> {event["Event End Date"] || "N/A"}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium text-orange-700">Apply By:</span> {
                                event["Event Apply Closing Date"] 
                                  ? new Date(event["Event Apply Closing Date"]).toLocaleDateString()
                                  : "N/A"
                              }
                            </p>
                          </div>
                          {event._event_url && (
                            <div className="mt-3">
                              <a 
                                href={event._event_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                              >
                                View Details
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No events found.</p>
              )}
            </div>
          </div>
        )}

        {/* Poster Generator Modal */}
        {showPosterGenerator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Marketing Poster Generator</h3>
                <button
                  onClick={() => {
                    setShowPosterGenerator(false)
                    setPosterImage(null)
                    setPosterProductName("")
                    setGeneratedPoster(null)
                  }}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>

              {!generatedPoster && !loadingPoster && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Image *
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPosterImage(e.target.files[0] || null)}
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    />
                    {posterImage && (
                      <div className="mt-2">
                        <img
                          src={URL.createObjectURL(posterImage)}
                          alt="Selected product"
                          className="max-h-32 rounded-lg border"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Handcrafted Pottery Vase"
                      value={posterProductName}
                      onChange={(e) => setPosterProductName(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  <button
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold w-full"
                    onClick={handleGeneratePoster}
                    disabled={!posterImage}
                  >
                    Generate Marketing Poster
                  </button>
                </div>
              )}

              {loadingPoster && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <div className="text-purple-600 font-semibold">Generating your poster...</div>
                  </div>
                </div>
              )}

              {generatedPoster && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Generated Marketing Poster:</h4>
                  <div className="flex justify-center">
                    <img
                      src={generatedPoster}
                      alt="Generated marketing poster"
                      className="max-w-full max-h-96 rounded-lg border shadow-lg"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
                      onClick={handleDownloadPoster}
                    >
                      Download Poster
                    </button>
                    <button
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold"
                      onClick={() => {
                        setGeneratedPoster(null)
                        setPosterImage(null)
                        setPosterProductName("")
                      }}
                    >
                      Generate New Poster
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard