import React, { useEffect, useState } from "react"
import { getCurrentUser, updateProfile, generateStoryFromBio } from "@/lib/api"

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
        const data = await getCurrentUser()
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
      const updatedUser = await updateProfile(form)
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
      const story = await generateStoryFromBio(form.bio)
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