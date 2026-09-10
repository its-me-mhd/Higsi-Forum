import { useState } from "react";
import { supabase } from "../../lib/supabase";

const AdminLogin = ({ adminUser, onAuthenticated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const { data, error: loginError } = await supabase.auth.signInWithPassword(
      { email, password },
    );

    if (loginError) {
      setError("Unable to sign in with those credentials.");
    } else {
      setPassword("");
      setIsOpen(false);
      onAuthenticated(data.user);
    }

    setIsSubmitting(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onAuthenticated(null);
  };

  return (
    <div className="mt-10 text-center">
      {adminUser ? (
        <button
          type="button"
          onClick={handleSignOut}
          className="text-sm text-gray-400 underline hover:text-picto-primary"
        >
          Sign out owner mode
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            setError("");
            setIsOpen(true);
          }}
          className="text-sm text-gray-400 underline hover:text-picto-primary"
        >
          Owner login
        </button>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-login-title"
        >
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-lg bg-white p-6 text-left shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 id="admin-login-title" className="text-xl font-semibold text-gray-900">
                Owner login
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-2xl text-gray-400 hover:text-gray-900"
                aria-label="Close owner login"
              >
                &times;
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email"
                autoComplete="email"
                className="input input-bordered w-full"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                className="input input-bordered w-full"
                required
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary rounded-sm font-semibold"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;