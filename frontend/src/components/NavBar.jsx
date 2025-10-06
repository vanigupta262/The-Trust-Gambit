"use client"
import { Link } from "react-router-dom"

export default function NavBar({ authed, onLogout }) {
  return (
    <nav className="flex items-center gap-3 text-sm">
      {authed ? (
        <>
          <Link to="/" className="hover:text-primary">
            Dashboard
          </Link>
          <Link to="/leaderboard" className="hover:text-primary">
            Leaderboard
          </Link>
          <Link to="/rounds" className="hover:text-primary">
            Rounds
          </Link>
          <Link to="/self-ratings" className="hover:text-primary">
            Self Ratings
          </Link>
          <Link to="/profile" className="hover:text-primary">
            Profile
          </Link>
          <button className="btn btn-secondary" onClick={onLogout}>
            Logout
          </button>
        </>
      ) : (
        <>
          <Link to="/login" className="btn btn-primary">
            Login
          </Link>
          <Link to="/register" className="btn btn-secondary">
            Register
          </Link>
        </>
      )}
    </nav>
  )
}
