import React, { useEffect, useState } from "react"
import api from "../lib/api"

const Profile = () => {
  const [user, setUser] = useState(null)
  const [form, setForm] = useState({
    email: "",
    password: "",
    skill: "",
    location: "",
    story: "",
    bio: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [generatedStory, setGeneratedStory] = useState(null)

  // fetch user profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await api.getCurrentUser()
        setUser(data)
        setForm({
          email: data.email || "",
          password: "",
          skill: data.skill || "",
          location: data.location || "",
          story: data.story || "",
          bio: data.bio || "",
        })
      } catch (err) {
        setError(err.message)
      }
    }
    fetchUser()
  }, [])

  // handle field change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  // save profile updates
  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Only send fields that are allowed by backend
      const profileData = {
        email: form.email,
        password: form.password || undefined,
        skill: form.skill,
        location: form.location,
        story: form.story,
        bio: form.bio,
      }
      // Use user.id or user._id or user.artisan_id as per backend, here assuming user.id
      const updatedUser = await api.updateArtisanProfile(user.id, profileData)
      setUser(updatedUser)
      alert("Profile updated successfully!")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // generate story from bio
  const handleGenerateStory = async () => {
    try {
      const story = await api.generateStoryFromBio()
      setGeneratedStory(story)
    } catch (err) {
      setError(err.message)
    }
  }

  if (!user) return <p>Loading profile...</p>

  return (
    <div>
      <h1>Profile</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSave}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <br />
        <input
          type="password"
          name="password"
          placeholder="New Password"
          value={form.password}
          onChange={handleChange}
        />
        <br />
        <input
          name="skill"
          placeholder="Skill"
          value={form.skill}
          onChange={handleChange}
        />
        <br />
        <input
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
        />
        <br />
        <textarea
          name="bio"
          placeholder="Your Bio"
          value={form.bio}
          onChange={handleChange}
        />
        <br />
        <textarea
          name="story"
          placeholder="Your Story"
          value={form.story}
          onChange={handleChange}
        />
        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </form>

      <h2>AI Generated Story</h2>
      <button onClick={handleGenerateStory}>Generate from Bio</button>
      {generatedStory && <pre>{JSON.stringify(generatedStory, null, 2)}</pre>}
    </div>
  )
}

export default Profile