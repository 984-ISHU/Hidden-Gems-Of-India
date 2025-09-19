import React, { useEffect, useState } from "react"
import {
  getProductsByArtisan,
  addProduct,
  deleteProduct,
  getMarketingOutput,
  getRAGOutput,
  getEvents,
} from "@/lib/api"

const Dashboard = () => {
  const [products, setProducts] = useState([])
  const [events, setEvents] = useState([])
  const [marketingOutput, setMarketingOutput] = useState(null)
  const [ragOutput, setRagOutput] = useState(null)

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // ⚡ replace with logged-in artisan ID
  const artisanId = "12345"

  // fetch products + events on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const productsData = await getProductsByArtisan(artisanId)
        setProducts(productsData)

        const eventsData = await getEvents("India") // default
        setEvents(eventsData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [artisanId])

  // add new product
  const handleAddProduct = async (e) => {
    e.preventDefault()
    try {
      const product = await addProduct(artisanId, newProduct)
      setProducts((prev) => [...prev, product])
      setNewProduct({ name: "", description: "", price: "" })
    } catch (err) {
      setError(err.message)
    }
  }

  // delete product
  const handleDeleteProduct = async (productId) => {
    try {
      await deleteProduct(productId)
      setProducts((prev) => prev.filter((p) => p.id !== productId))
    } catch (err) {
      setError(err.message)
    }
  }

  // fetch AI outputs
  const handleGenerateMarketing = async () => {
    try {
      const output = await getMarketingOutput(artisanId)
      setMarketingOutput(output)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleGenerateRAG = async () => {
    try {
      const output = await getRAGOutput(artisanId)
      setRagOutput(output)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h1>Dashboard</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p>Loading...</p>}

      {/* Products Section */}
      <h2>Your Products</h2>
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            {p.name} - ₹{p.price}{" "}
            <button onClick={() => handleDeleteProduct(p.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleAddProduct}>
        <input
          placeholder="Product Name"
          value={newProduct.name}
          onChange={(e) =>
            setNewProduct({ ...newProduct, name: e.target.value })
          }
        />
        <br />
        <input
          placeholder="Description"
          value={newProduct.description}
          onChange={(e) =>
            setNewProduct({ ...newProduct, description: e.target.value })
          }
        />
        <br />
        <input
          type="number"
          placeholder="Price"
          value={newProduct.price}
          onChange={(e) =>
            setNewProduct({ ...newProduct, price: e.target.value })
          }
        />
        <br />
        <button type="submit">Add Product</button>
      </form>

      {/* Marketing + RAG */}
      <h2>AI Generated Content</h2>
      <button onClick={handleGenerateMarketing}>Generate Marketing Output</button>
      {marketingOutput && <pre>{JSON.stringify(marketingOutput, null, 2)}</pre>}

      <button onClick={handleGenerateRAG}>Generate RAG Output</button>
      {ragOutput && <pre>{JSON.stringify(ragOutput, null, 2)}</pre>}

      {/* Events Section */}
      <h2>Events</h2>
      <ul>
        {events.map((e, i) => (
          <li key={i}>
            {e["Event Name"]} - {e["Venue of Event"]}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Dashboard