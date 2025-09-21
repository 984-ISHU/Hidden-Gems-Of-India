import React, { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, User, Plus } from "lucide-react"
import api from "../lib/api"

const Dashboard = () => {
  const artisanId = "12345"

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
  const [showRetrievedDocs, setShowRetrievedDocs] = useState(false)

  // Events display
  const [showEvents, setShowEvents] = useState(false)
  const [eventFilter, setEventFilter] = useState({ location: "", date: "", dateRange: false })

  // Story Generator
  const [showStoryGenerator, setShowStoryGenerator] = useState(false)
  const [storyExtraInfo, setStoryExtraInfo] = useState("")
  const [generatedStory, setGeneratedStory] = useState(null)
  const [loadingStory, setLoadingStory] = useState(false)

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true)
      try {
        const data = await api.getArtisanProducts(artisanId)
        setProducts(data)
      } catch (err) {
        console.error("Failed to load products")
      }
      setLoadingProducts(false)
    }
    fetchProducts()
  }, [artisanId])

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true)
      try {
        // Try to get events by location first, fallback to all events
        const data = await api.findEvents({ location: "India" })
        console.log("Events fetched:", data)
        setEvents(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("Error fetching events:", err)
        // If location-based search fails, try to get all events
        try {
          const allEvents = await api.getAllEvents()
          console.log("All events fetched as fallback:", allEvents)
          setEvents(Array.isArray(allEvents) ? allEvents : [])
        } catch (fallbackErr) {
          console.error("Error fetching all events:", fallbackErr)
          setEvents([])
        }
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
    try {
      const product = await api.addArtisanProduct(artisanId, newProduct)
      setProducts((prev) => [...prev, product])
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
      console.error("Failed to add product")
    }
  }

  // Marketing Studio
  const handleGenerateMarketing = async (customPrompt = null, customImage = null) => {
    setLoadingMarketing(true)
    try {
      const prompt = customPrompt || marketingPrompt || "handcrafted artisan products"
      const image = customImage || marketingImage
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
      
      if (eventFilter.dateRange && eventFilter.date) {
        // Use date range filtering
        filteredEvents = await api.findEventsByDateRange(
          eventFilter.date,
          null,
          eventFilter.location || null
        )
      } else {
        // Use regular location/date filtering
        const params = {}
        if (eventFilter.location.trim()) params.location = eventFilter.location
        if (eventFilter.date) params.date = eventFilter.date
        
        if (Object.keys(params).length > 0) {
          filteredEvents = await api.findEvents(params)
        } else {
          filteredEvents = await api.getAllEvents()
        }
      }
      
      console.log("Filtered events:", filteredEvents)
      setEvents(Array.isArray(filteredEvents) ? filteredEvents : [])
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
      console.log("Sending chat request:", chatRequest)
      const res = await api.assistantChat(chatRequest)
      console.log("Chat response received:", res)
      console.log("Retrieved documents:", res.retrieved)
      
      // Handle the response structure from ChatResponse model
      const answer = res.answer || res.content || "No answer provided."
      const retrieved = Array.isArray(res.retrieved) ? res.retrieved : []
      
      console.log("Processed answer:", answer)
      console.log("Processed retrieved docs count:", retrieved.length)
      
      const assistantMessage = {
        role: "assistant",
        content: answer,
        retrieved: retrieved,
        query: res.query || chatInput
      }
      
      setChatHistory((prev) => [...prev, assistantMessage])
    } catch (err) {
      console.error("Chat error:", err)
      const errorMessage = err.response?.data?.detail || err.message || "Sorry, I couldn't fetch an answer."
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${errorMessage}` },
      ])
    }
    setChatInput("")
    setLoadingChat(false)
  }

  // Get visible products for carousel
  const getVisibleProducts = () => {
    if (products.length === 0) return []
    const visible = []
    for (let i = 0; i < 3; i++) {
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
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-gray-600" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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

          {/* Story Generator Card */}
          <div 
            className="h-48 rounded-lg shadow-xl cursor-pointer transform hover:scale-105 transition-all p-6 flex flex-col justify-between"
            style={{ background: 'linear-gradient(135deg, #E67E22 0%, #D35400 100%)' }}
            onClick={() => setShowStoryGenerator(!showStoryGenerator)}
          >
            <h3 className="text-white font-bold text-xl" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              STORY MAKER
            </h3>
            <div className="text-white text-sm opacity-90">
              Generate compelling artisan stories using AI
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
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-bold">Govt. Schemes Chatbot (GenAI)</h3>
                  <button
                    onClick={() => setShowRetrievedDocs(!showRetrievedDocs)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                  >
                    {showRetrievedDocs ? "Hide Sources" : "Show Sources"}
                  </button>
                </div>
                <button
                  onClick={() => {
                    setShowChat(false)
                    setChatHistory([])
                    setShowRetrievedDocs(false)
                  }}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto mb-4 p-4 border rounded-lg bg-gray-50">
                {chatHistory.length === 0 && (
                  <div className="text-gray-500 text-sm">
                    Ask about any government scheme for artisans. I can help you find information about subsidies, loans, training programs, and more.
                  </div>
                )}
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className="mb-4">
                    <div
                      className={`p-3 rounded-lg ${
                        msg.role === "user"
                          ? "bg-blue-100 text-blue-800 ml-8"
                          : "bg-green-100 text-green-800 mr-8"
                      }`}
                    >
                      <div className="font-semibold mb-1">
                        {msg.role === "user" ? "You" : "Assistant"}
                      </div>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                    
                    {/* Show retrieved documents for assistant responses */}
                    {msg.role === "assistant" && msg.retrieved && msg.retrieved.length > 0 && showRetrievedDocs && (
                      <div className="mt-2 mr-8">
                        <div className="text-xs font-semibold text-gray-600 mb-2">
                          📚 Knowledge Sources ({msg.retrieved.length} documents):
                        </div>
                        <div className="space-y-2">
                          {msg.retrieved.map((doc, docIdx) => (
                            <div key={doc._id || doc.id || docIdx} className="bg-gray-100 p-2 rounded text-xs">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-medium">Source {docIdx + 1}</span>
                                <span className="text-gray-500">Score: {doc.score?.toFixed(3) || 'N/A'}</span>
                              </div>
                              <div className="text-gray-700">
                                {doc.text && doc.text.length > 200 
                                  ? doc.text.substring(0, 200) + "..." 
                                  : doc.text || "No content available"}
                              </div>
                              {doc._id && (
                                <div className="text-gray-500 text-xs mt-1">
                                  ID: {doc._id.substring(0, 8)}...
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {loadingChat && (
                  <div className="flex items-center justify-center py-4">
                    <div className="text-blue-600">Thinking...</div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <input
                  className="flex-1 border rounded-lg px-3 py-2"
                  placeholder="Ask about government schemes, subsidies, loans, training programs..."
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
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
                  disabled={loadingChat || !chatInput.trim()}
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
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Events & Exhibitions</h3>
                <button
                  onClick={() => {
                    setShowEvents(false)
                    setEventFilter({ location: "", date: "", dateRange: false })
                  }}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>

              {/* Event Filters */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-3">Filter Events</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Mumbai, Delhi, India"
                      value={eventFilter.location}
                      onChange={(e) => setEventFilter(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={eventFilter.date}
                      onChange={(e) => setEventFilter(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleFilterEvents}
                      disabled={loadingEvents}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm"
                    >
                      {loadingEvents ? "Searching..." : "Search Events"}
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <label className="flex items-center text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={eventFilter.dateRange}
                      onChange={(e) => setEventFilter(prev => ({ ...prev, dateRange: e.target.checked }))}
                      className="mr-2"
                    />
                    Use date as start date for range search
                  </label>
                </div>
              </div>

              {/* Events Summary */}
              {!loadingEvents && events.length > 0 && (
                <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{events.length}</div>
                    <div className="text-sm text-blue-800">Total Events</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {events.filter(e => new Date(e["Event Start Date"]) > new Date()).length}
                    </div>
                    <div className="text-sm text-green-800">Upcoming Events</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {events.filter(e => new Date(e["Event Apply Closing Date"]) > new Date()).length}
                    </div>
                    <div className="text-sm text-orange-800">Open for Applications</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {events.reduce((sum, e) => sum + parseInt(e["Total no. of Stalls"] || 0), 0)}
                    </div>
                    <div className="text-sm text-purple-800">Total Stalls</div>
                  </div>
                </div>
              )}

              {/* Events List */}
              {loadingEvents ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-blue-600">Searching events...</div>
                </div>
              ) : events.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                    Found {events.length} event{events.length !== 1 ? 's' : ''} • Gandhi Shilp Bazaar Exhibitions
                  </div>
                  {events.map((event, index) => {
                    const startDate = new Date(event["Event Start Date"]).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })
                    const endDate = new Date(event["Event End Date"]).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short', 
                      year: 'numeric'
                    })
                    const applyDate = new Date(event["Event Apply Closing Date"]).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })
                    const isUpcoming = new Date(event["Event Start Date"]) > new Date()
                    const isApplicationOpen = new Date(event["Event Apply Closing Date"]) > new Date()
                    
                    return (
                      <div key={event._id || index} className="border-2 rounded-xl p-5 hover:shadow-lg transition-all bg-gradient-to-r from-white to-blue-50">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-blue-900 mb-1">
                              {event["Event Title"]}
                            </h4>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                isUpcoming ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {isUpcoming ? '🔮 Upcoming' : '📅 Past Event'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {event["Event Types"]}
                              </span>
                            </div>
                          </div>
                          {event._event_url && (
                            <a
                              href={event._event_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-semibold"
                            >
                              View Details
                            </a>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center text-gray-700">
                              <span className="text-blue-600 mr-2">📍</span>
                              <span className="font-medium">{event["Venue of Event"]}</span>
                            </div>
                            
                            <div className="flex items-center text-gray-700">
                              <span className="text-green-600 mr-2">📅</span>
                              <span>{startDate} - {endDate}</span>
                            </div>
                            
                            <div className="flex items-center text-gray-700">
                              <span className="text-orange-600 mr-2">🏪</span>
                              <span>{event["Total no. of Stalls"]} Stalls Available</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center text-gray-700">
                              <span className="text-red-600 mr-2">⏰</span>
                              <div>
                                <div className="text-sm">Application Deadline:</div>
                                <div className={`font-medium ${isApplicationOpen ? 'text-green-600' : 'text-red-600'}`}>
                                  {applyDate}
                                  {isApplicationOpen && <span className="ml-1 text-xs">(Open)</span>}
                                  {!isApplicationOpen && <span className="ml-1 text-xs">(Closed)</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {isUpcoming && isApplicationOpen && (
                          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center text-green-800">
                              <span className="mr-2">✅</span>
                              <span className="font-semibold text-sm">Applications Open! Apply before {applyDate}</span>
                            </div>
                          </div>
                        )}
                        
                        {isUpcoming && !isApplicationOpen && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center text-red-800">
                              <span className="mr-2">❌</span>
                              <span className="font-semibold text-sm">Application deadline passed on {applyDate}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎪</div>
                  <p className="text-gray-500 mb-4 text-lg">No Gandhi Shilp Bazaar events found matching your criteria.</p>
                  <p className="text-gray-400 mb-6 text-sm">Try adjusting your search filters or browse all available events.</p>
                  <button
                    onClick={() => {
                      setEventFilter({ location: "", date: "", dateRange: false })
                      handleFilterEvents()
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    Show All Events
                  </button>
                </div>
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

        {/* Story Generator Modal */}
        {showStoryGenerator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">AI Story Generator</h3>
                <button
                  onClick={() => {
                    setShowStoryGenerator(false)
                    setStoryExtraInfo("")
                    setGeneratedStory(null)
                  }}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>

              {!generatedStory && !loadingStory && (
                <div className="space-y-4">
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-start">
                      <span className="text-orange-600 mr-2 text-lg">✨</span>
                      <div>
                        <h4 className="font-semibold text-orange-800">Create Your Artisan Story</h4>
                        <p className="text-orange-700 text-sm mt-1">
                          I'll create an inspiring story about your craft journey using your profile information. 
                          Add any extra details you'd like to include!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Information (Optional)
                    </label>
                    <textarea
                      placeholder="Tell me more about your craft journey, achievements, inspirations, or special techniques you'd like to highlight in your story..."
                      value={storyExtraInfo}
                      onChange={(e) => setStoryExtraInfo(e.target.value)}
                      rows={4}
                      className="w-full border rounded-lg px-3 py-2 resize-none"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Leave blank to generate a story using only your existing profile information.
                    </div>
                  </div>

                  <button
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold w-full"
                    onClick={handleGenerateStory}
                  >
                    Generate My Artisan Story
                  </button>
                </div>
              )}

              {loadingStory && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                    <div className="text-orange-600 font-semibold">Crafting your story...</div>
                    <div className="text-gray-500 text-sm mt-1">This may take a few moments</div>
                  </div>
                </div>
              )}

              {generatedStory && (
                <div className="space-y-4">
                  {generatedStory.error ? (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                      <div className="flex items-center text-red-800">
                        <span className="mr-2">❌</span>
                        <div>
                          <h4 className="font-semibold">Error Generating Story</h4>
                          <p className="text-sm mt-1">{generatedStory.error}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                        <div className="flex items-center text-green-800 mb-2">
                          <span className="mr-2">📖</span>
                          <h4 className="font-semibold">Your Artisan Story</h4>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-6 rounded-lg border">
                        <div className="prose prose-sm max-w-none">
                          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                            {generatedStory.story}
                          </div>
                        </div>
                      </div>

                      {generatedStory.original_context && (
                        <details className="bg-blue-50 border border-blue-200 rounded-lg">
                          <summary className="p-3 cursor-pointer text-blue-800 font-medium">
                            View Profile Information Used
                          </summary>
                          <div className="px-3 pb-3 text-sm text-blue-700 whitespace-pre-wrap border-t border-blue-200 mt-2 pt-2">
                            {generatedStory.original_context}
                          </div>
                        </details>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
                      onClick={() => {
                        if (generatedStory.story) {
                          navigator.clipboard.writeText(generatedStory.story)
                          alert("Story copied to clipboard!")
                        }
                      }}
                      disabled={generatedStory.error}
                    >
                      Copy Story
                    </button>
                    <button
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold"
                      onClick={() => {
                        setGeneratedStory(null)
                        setStoryExtraInfo("")
                      }}
                    >
                      Generate New Story
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