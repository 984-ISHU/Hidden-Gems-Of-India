import React, { useEffect, useState } from "react"
import api from "../lib/api"

const Dashboard = () => {
  // ⚡ replace with logged-in artisan ID
  const artisanId = "12345"

  // Product states
  const [products, setProducts] = useState([])
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
  })
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [productError, setProductError] = useState(null)

  // Events
  const [events, setEvents] = useState([])
  const [loadingEvents, setLoadingEvents] = useState(false)

  // Marketing Studio
  const [marketingOutput, setMarketingOutput] = useState(null)
  const [loadingMarketing, setLoadingMarketing] = useState(false)

  // Chatbot
  const [chatInput, setChatInput] = useState("")
  const [chatHistory, setChatHistory] = useState([])
  const [loadingChat, setLoadingChat] = useState(false)

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true)
      try {
        const data = await api.getArtisanProducts(artisanId)
        setProducts(data)
      } catch (err) {
        setProductError("Failed to load products")
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
        const data = await api.findEvents({ location: "India" })
        setEvents(data)
      } catch {
        setEvents([])
      }
      setLoadingEvents(false)
    }
    fetchEvents()
  }, [])

  // Add product
  const handleAddProduct = async (e) => {
    e.preventDefault()
    setProductError(null)
    try {
      const product = await api.addArtisanProduct(artisanId, newProduct)
      setProducts((prev) => [...prev, product])
      setNewProduct({ name: "", description: "", price: "" })
    } catch (err) {
      setProductError("Failed to add product")
    }
  }

  // Delete product
  const handleDeleteProduct = async (productId) => {
    setProductError(null)
    try {
      await api.deleteArtisanProduct(artisanId, productId)
      setProducts((prev) => prev.filter((p) => p.id !== productId))
    } catch (err) {
      setProductError("Failed to delete product")
    }
  }

  // Marketing Studio
  const handleGenerateMarketing = async () => {
    setLoadingMarketing(true)
    try {
      const output = await api.getMarketingOutput(artisanId)
      setMarketingOutput(output)
    } catch {
      setMarketingOutput({ error: "Failed to generate marketing output" })
    }
    setLoadingMarketing(false)
  }

  // Chatbot
  const handleChatSubmit = async (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    setLoadingChat(true)
    setChatHistory((prev) => [...prev, { role: "user", content: chatInput }])
    try {
      const res = await api.assistantChat({
        messages: [...chatHistory, { role: "user", content: chatInput }],
        context: "government schemes for artisans",
      })
      setChatHistory((prev) => [
        ...prev,
        { role: "user", content: chatInput },
        {
          role: "assistant",
          content: res.answer || res.content || "No answer.",
        },
      ])
    } catch {
      setChatHistory((prev) => [
        ...prev,
        { role: "user", content: chatInput },
        { role: "assistant", content: "Sorry, I couldn't fetch an answer." },
      ])
    }
    setChatInput("")
    setLoadingChat(false)
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Section 1: Add/Delete Products */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold mb-4">Your Products</h1>
        {productError && <p className="text-red-600">{productError}</p>}
        {loadingProducts ? (
          <p>Loading products...</p>
        ) : (
          <ul className="mb-4">
            {products.map((p) => (
              <li key={p.id} className="flex items-center gap-2 mb-2">
                <span className="font-semibold">{p.name}</span> - ₹{p.price}
                <button
                  className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
                  onClick={() => handleDeleteProduct(p.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
        <form
          onSubmit={handleAddProduct}
          className="flex flex-col md:flex-row gap-2"
        >
          <input
            placeholder="Product Name"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
            className="border rounded px-2 py-1"
            required
          />
          <input
            placeholder="Description"
            value={newProduct.description}
            onChange={(e) =>
              setNewProduct({ ...newProduct, description: e.target.value })
            }
            className="border rounded px-2 py-1"
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={newProduct.price}
            onChange={(e) =>
              setNewProduct({ ...newProduct, price: e.target.value })
            }
            className="border rounded px-2 py-1"
            required
          />
          <button
            type="submit"
            className="bg-indigo-700 text-white px-4 py-1 rounded"
            disabled={loadingProducts}
          >
            Add Product
          </button>
        </form>
      </div>

      {/* Section 2: Vertically divided cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upcoming Events */}
        <div className="bg-white rounded shadow p-4 flex flex-col">
          <h2 className="text-xl font-bold mb-2">Upcoming Events</h2>
          {loadingEvents ? (
            <p>Loading events...</p>
          ) : events.length > 0 ? (
            <ul className="space-y-2">
              {events.slice(0, 5).map((e) => (
                <li key={e.id || e.name || e.title} className="border-b pb-1">
                  <div className="font-semibold">{e.name || e.title}</div>
                  <div className="text-sm text-gray-600">
                    {e.location} | {e.date}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No events found.</p>
          )}
        </div>

        {/* Marketing Studio */}
        <div className="bg-white rounded shadow p-4 flex flex-col">
          <h2 className="text-xl font-bold mb-2">Marketing Studio (GenAI)</h2>
          <button
            className="bg-indigo-700 text-white px-4 py-2 rounded mb-2"
            onClick={handleGenerateMarketing}
            disabled={loadingMarketing}
          >
            {loadingMarketing
              ? "Generating..."
              : "Generate Marketing Output"}
          </button>
          {marketingOutput && (
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
              {JSON.stringify(marketingOutput, null, 2)}
            </pre>
          )}
        </div>

        {/* Self-help Chatbot */}
        <div className="bg-white rounded shadow p-4 flex flex-col h-full">
          <h2 className="text-xl font-bold mb-2">Govt. Schemes Chatbot (GenAI)</h2>
          <div className="flex-1 overflow-y-auto mb-2 max-h-48">
            {chatHistory.length === 0 && (
              <div className="text-gray-500 text-sm">
                Ask about any government scheme for artisans.
              </div>
            )}
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-1 text-sm ${
                  msg.role === "user"
                    ? "text-indigo-800"
                    : "text-green-700"
                }`}
              >
                <b>{msg.role === "user" ? "You" : "Bot"}:</b> {msg.content}
              </div>
            ))}
          </div>
          <form onSubmit={handleChatSubmit} className="flex gap-2">
            <input
              className="border rounded px-2 py-1 flex-1"
              placeholder="Type your question..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={loadingChat}
            />
            <button
              type="submit"
              className="bg-indigo-700 text-white px-3 py-1 rounded"
              disabled={loadingChat}
            >
              {loadingChat ? "..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Dashboard