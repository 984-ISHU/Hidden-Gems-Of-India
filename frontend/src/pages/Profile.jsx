import React, { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import { Clipboard } from "lucide-react"
import { User, Camera, MapPin, Briefcase, BookOpen, Heart, Save, Sparkles, Upload } from "lucide-react"
import api from "../lib/api"

const Profile = () => {
  const [user, setUser] = useState(null)
  const [form, setForm] = useState({
    name: "",
    phone: "",
    location: "",
    bio: "",
    shop_name: "",
    story: "",
    skills: [],
    profile_photo: null,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [generatedStory, setGeneratedStory] = useState(null)
  const [newSkill, setNewSkill] = useState("")
  const [isGeneratingStory, setIsGeneratingStory] = useState(false)

  // Fetch user profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await api.getCurrentUser()
        setUser(data)
        setForm({
          name: data.name || "",
          phone: data.phone || "",
          location: data.location || "",
          bio: data.bio || "",
          shop_name: data.shop_name || "",
          story: data.story || "",
          skills: data.skills || [],
          profile_photo: data.profile_photo || null,
        })
      } catch (err) {
        setError(err.message)
      }
    }
    fetchUser()
  }, [])

  // Handle field change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  // Add skill
  const handleAddSkill = () => {
    if (newSkill.trim() && !form.skills.includes(newSkill.trim())) {
      setForm({
        ...form,
        skills: [...form.skills, newSkill.trim()]
      })
      setNewSkill("")
    }
  }

  // Remove skill
  const handleRemoveSkill = (skillToRemove) => {
    setForm({
      ...form,
      skills: form.skills.filter(skill => skill !== skillToRemove)
    })
  }

  // Save profile updates
  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      // Create profile data according to ArtisanProfileUpdate schema
      const profileData = {
        name: form.name || null,
        phone: form.phone || null,
        location: form.location || null,
        bio: form.bio || null,
        shop_name: form.shop_name || null,
        story: form.story || null,
        skills: form.skills.length > 0 ? form.skills : null,
        profile_photo: form.profile_photo || null,
      }
      
      const updatedUser = await api.updateArtisanProfile(user.id, profileData)
      setUser({ ...user, ...updatedUser })
      
      // Show success message
      const successDiv = document.createElement('div')
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
      successDiv.textContent = 'Profile updated successfully!'
      document.body.appendChild(successDiv)
      setTimeout(() => document.body.removeChild(successDiv), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Generate story from bio
  const handleGenerateStory = async () => {
    if (!form.bio.trim()) {
      setError("Please add a bio first to generate your story")
      return
    }
    // You need to have the artisan's user_id available here
    const artisanId = form.user_id || (user && user.user_id) || (user && user.id) || "";
    setIsGeneratingStory(true)
    try {
  const result = await api.generateStoryFromBio(artisanId, form.bio)
  setGeneratedStory(result)
  // Optionally auto-fill the story field
  setForm({ ...form, story: result.story })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsGeneratingStory(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2D5A87 0%, #1E3A5F 100%)' }}>
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-screen" style={{ background: 'linear-gradient(135deg, #2D5A87 0%, #1E3A5F 100%)' }}>
      {/* Header */}
      <header className="p-6 text-white">
        <h1 className="text-3xl font-bold text-yellow-300 mb-2" style={{ fontFamily: 'serif' }}>
          Artisan Profile
        </h1>
        <p className="text-blue-200">Manage your artisan identity and showcase your craft</p>
      </header>

      <div className="px-6 pb-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          {/* Profile Photo Section */}
          <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  {form.profile_photo ? (
                    <img 
                      src={form.profile_photo} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>
                <button className="absolute -bottom-2 -right-2 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full shadow-lg">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {form.name || user.username}
                </h2>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-blue-600 font-semibold">{form.shop_name || "Artisan Workshop"}</p>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Your full name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+91-XXXXXXXXXX"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-green-600" />
                  Business Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Shop/Workshop Name</label>
                    <input
                      type="text"
                      name="shop_name"
                      placeholder="Your shop or workshop name"
                      value={form.shop_name}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      placeholder="City, State"
                      value={form.location}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Skills & Expertise
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a skill"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                      >
                        {skill}
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-600" />
                  About You
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    name="bio"
                    placeholder="Tell us about your craft, passion, and experience..."
                    value={form.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Story Section */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  Your Artisan Story
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleGenerateStory}
                      disabled={isGeneratingStory || !form.bio.trim()}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      {isGeneratingStory ? "Generating..." : "Generate from Bio"}
                    </button>
                  </div>
                  <textarea
                    name="story"
                    placeholder="Your inspiring artisan journey and story..."
                    value={form.story}
                    onChange={handleChange}
                    rows={6}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Generated Story Display */}
              {generatedStory && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                    AI Generated Story
                    <button
                      type="button"
                      title="Copy story to clipboard"
                      className="ml-2 p-1 rounded hover:bg-purple-100"
                      onClick={() => {
                        if (generatedStory.story) {
                          navigator.clipboard.writeText(generatedStory.story)
                        }
                      }}
                    >
                      <Clipboard className="w-4 h-4 text-purple-600" />
                    </button>
                  </h4>
                  <div className="prose prose-purple max-w-none mb-2">
                    <ReactMarkdown>{generatedStory.story || ''}</ReactMarkdown>
                  </div>
                  <div className="text-sm text-purple-600">
                    Generated on: {generatedStory.generated_at ? new Date(generatedStory.generated_at).toLocaleString() : new Date().toLocaleString()} | 
                    Words: {generatedStory.story ? generatedStory.story.split(/\s+/).filter(Boolean).length : 0}
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="pt-6 border-t">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <Save className="w-5 h-5" />
                  {loading ? "Saving Profile..." : "Save Profile"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile