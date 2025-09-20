import React, { useState } from "react"
import api from "../lib/api"

const Login = () => {
  const [isSignup, setIsSignup] = useState(false)

  // form fields
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [skill, setSkill] = useState("")
  const [location, setLocation] = useState("")
  const [bio, setBio] = useState("")

  // states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isSignup) {
        // signup requires extra fields
        await api.signup({ email, password, skill, location, bio })
      } else {
        await api.login({ email, password })
      }

      // fetch logged-in user
      const userData = await api.getCurrentUser()
      setUser(userData)

      // reset form
      setEmail("")
      setPassword("")
      setSkill("")
      setLocation("")
      setBio("")
    } catch (err) {
      setError(err.response?.data?.detail || err.message)
    } finally {
      setLoading(false)
    }
  }

  if (user) {
    return (
      <div>
        <h1>Welcome, {user.email}!</h1>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </div>
    )
  }

  return (
    <div>
      <h1>{isSignup ? "Sign Up" : "Login"}</h1>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />

        {isSignup && (
          <>
            <input
              placeholder="Skill"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              required
            />
            <br />
            <input
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
            <br />
            <textarea
              placeholder="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <br />
          </>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
        </button>
      </form>

      <button onClick={() => setIsSignup((prev) => !prev)}>
        {isSignup ? "Already have an account? Login" : "New here? Sign Up"}
      </button>
    </div>
  )
}

export default Login