import { Outlet, Link, useNavigate, useLocation } from "react-router-dom"
import { getToken, clearToken } from "./api.js"
import NavBar from "./components/NavBar.jsx"

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const authed = Boolean(getToken())

  const handleLogout = () => {
    clearToken()
    navigate("/login")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold text-primary">
            The Trust Gambit
          </Link>
          <NavBar authed={authed} onLogout={handleLogout} />
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-6">
        {/* Show a simple hint to login if trying to access protected pages */}
        {!authed && !["/login", "/register"].includes(location.pathname) ? (
          <div className="card">
            <p className="mb-2">You are not logged in.</p>
            <div className="flex gap-2">
              <Link className="btn btn-primary" to="/login">
                Login
              </Link>
              <Link className="btn btn-secondary" to="/register">
                Register
              </Link>
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 text-sm text-neutral-600">
          © {new Date().getFullYear()} The Trust Gambit
        </div>
      </footer>
    </div>
  )
}
