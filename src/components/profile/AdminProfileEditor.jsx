import { useEffect, useState } from "react";
import { isAdminUser, supabase } from "../../lib/supabase";

const emptyProfile = {
  id: "",
  name: "",
  title: "",
  bio_text: "",
  avatar_url: "",
  cv_url: "",
};

const fields = [
  { name: "name", label: "Name", type: "text" },
  { name: "title", label: "Title", type: "text" },
  { name: "bio_text", label: "Bio", type: "textarea" },
  { name: "avatar_url", label: "Profile image URL", type: "url" },
  { name: "cv_url", label: "CV URL", type: "url" },
];

const AdminProfileEditor = ({ onSaved }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [profile, setProfile] = useState(emptyProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return undefined;
    }

    let isMounted = true;

    const loadAdminProfile = async (user) => {
      if (!isMounted) return;

      setAdminUser(user);
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data: profileData, error: fetchError } = await supabase
        .from("profile_settings")
        .select("id, name, title, bio_text, avatar_url, cv_url")
        .limit(1)
        .maybeSingle();

      if (fetchError) setError(fetchError.message);
      if (profileData) setProfile(profileData);
      setIsLoading(false);
    };

    supabase.auth.getUser().then(({ data }) => {
      loadAdminProfile(isAdminUser(data.user) ? data.user : null);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user || null;
      loadAdminProfile(isAdminUser(user) ? user : null);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((currentProfile) => ({ ...currentProfile, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!adminUser) return;

    setError("");
    setMessage("");
    setIsSaving(true);

    const profileValues = {
      name: profile.name,
      title: profile.title,
      bio_text: profile.bio_text,
      avatar_url: profile.avatar_url,
      cv_url: profile.cv_url,
    };

    const query = profile.id
      ? supabase
          .from("profile_settings")
          .update(profileValues)
          .eq("id", profile.id)
          .select()
          .single()
      : supabase
          .from("profile_settings")
          .insert(profileValues)
          .select()
          .single();

    const { data, error: saveError } = await query;

    if (saveError) {
      setError(saveError.message);
    } else {
      setProfile(data);
      setMessage("Profile saved.");
      onSaved(data);
    }

    setIsSaving(false);
  };

  if (isLoading || !adminUser) return null;

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-10 max-w-3xl rounded-lg border border-gray-200 bg-white p-6 shadow-lg"
    >
      <h2 className="mb-6 text-2xl font-semibold text-gray-900">
        Edit profile
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <label
            key={field.name}
            className={`flex flex-col gap-2 text-sm font-medium text-gray-700 ${
              field.type === "textarea" ? "md:col-span-2" : ""
            }`}
          >
            {field.label}
            {field.type === "textarea" ? (
              <textarea
                name={field.name}
                value={profile[field.name]}
                onChange={handleChange}
                className="textarea textarea-bordered min-h-32 w-full"
                required
              />
            ) : (
              <input
                type={field.type}
                name={field.name}
                value={profile[field.name]}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
              />
            )}
          </label>
        ))}
      </div>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
      <button
        type="submit"
        disabled={isSaving}
        className="btn btn-primary mt-6 rounded-sm px-6 font-semibold"
      >
        {isSaving ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
};

export default AdminProfileEditor;