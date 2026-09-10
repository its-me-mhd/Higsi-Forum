import { useEffect, useState } from "react";
import { isAdminUser, isSupabaseConfigured, supabase } from "../lib/supabase";
import { emptySiteContent } from "../lib/siteContent";

const emptyService = { title: "", description: "", sort_order: 0 };
const contentFields = [
  ["full_name", "Full name", "text", true],
  ["job_title", "Job title", "text", true],
  ["email", "Contact email", "email", true],
  ["address", "Location / address", "text", true],
  ["phone", "Phone number", "tel", true],
  ["home_text", "Home introduction", "textarea", true],
  ["about_text", "About text", "textarea", true],
  ["services_text", "Services introduction", "textarea", true],
  ["contact_text", "Contact introduction", "textarea", true],
  ["experience_text", "Experience value", "text", false, "e.g. 10 years"],
  ["projects_completed_text", "Completed projects value", "text", false, "e.g. 50+"],
  ["happy_clients_text", "Happy clients value", "text", false, "e.g. 100+"],
  ["facebook_url", "Facebook URL", "url", false, "https://facebook.com/yourname"],
  ["instagram_url", "Instagram URL", "url", false, "https://instagram.com/yourname"],
  ["whatsapp_url", "WhatsApp URL", "url", false, "https://wa.me/491234567890"],
  ["linkedin_url", "LinkedIn URL", "url", false, "https://linkedin.com/in/yourname"],
];

const Admin = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [content, setContent] = useState(emptySiteContent);
  const [services, setServices] = useState([]);
  const [service, setService] = useState(emptyService);
  const [avatarFile, setAvatarFile] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [tab, setTab] = useState("general");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return undefined;
    }
    const loadSession = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(isAdminUser(data.user) ? data.user : null);
      setIsLoading(false);
    };
    loadSession();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(isAdminUser(session?.user) ? session.user : null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("site_content").select("*").limit(1).maybeSingle(),
      supabase
        .from("services")
        .select("*")
        .order("sort_order", { ascending: true }),
    ]).then(([contentResult, servicesResult]) => {
      const databaseError = contentResult.error || servicesResult.error;
      if (databaseError) {
        const message = databaseError.message || "";
        setError(
          message.toLowerCase().includes("services")
            ? "The Services table is missing. Run supabase/add-services.sql, then reload this page."
            : message.toLowerCase().includes("schema cache")
              ? "The CMS fields are not installed yet. Run supabase/add-profile-content-fields.sql, then reload this page."
              : message,
        );
        return;
      }
      if (contentResult.data) setContent(contentResult.data);
      setServices(servicesResult.data || []);
    });
  }, [user]);

  const uploadAsset = async (file, folder) => {
    const path = `${folder}/${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("site-assets")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (uploadError) throw uploadError;
    return supabase.storage.from("site-assets").getPublicUrl(path).data
      .publicUrl;
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (loginError || !isAdminUser(data.user)) {
      await supabase.auth.signOut();
      setError("These credentials are not authorized for this dashboard.");
    }
  };

  const saveContent = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSaving(true);
    if (!/^[A-Za-z][A-Za-z '-]*$/.test(content.full_name)) {
      setError("Full name must contain letters only.");
      setIsSaving(false);
      return;
    }
    try {
      const values = {
        full_name: content.full_name,
        job_title: content.job_title,
        email: content.email,
        address: content.address,
        phone: content.phone,
        home_text: content.home_text,
        about_text: content.about_text,
        services_text: content.services_text,
        contact_text: content.contact_text,
        experience_text: content.experience_text || null,
        projects_completed_text: content.projects_completed_text || null,
        happy_clients_text: content.happy_clients_text || null,
        facebook_url: content.facebook_url || null,
        instagram_url: content.instagram_url || null,
        whatsapp_url: content.whatsapp_url || null,
        linkedin_url: content.linkedin_url || null,
        avatar_url: content.avatar_url || null,
        cv_url: content.cv_url || null,
      };
      if (avatarFile)
        values.avatar_url = await uploadAsset(avatarFile, "avatars");
      if (cvFile) values.cv_url = await uploadAsset(cvFile, "cv");
      const query = content.id
        ? supabase
            .from("site_content")
            .update(values)
            .eq("id", content.id)
            .select()
            .single()
        : supabase.from("site_content").insert(values).select().single();
      const { data, error: saveError } = await query;
      if (saveError) throw saveError;
      setContent(data);
      setAvatarFile(null);
      setCvFile(null);
      setMessage("General settings saved.");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  };

  const addService = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSaving(true);
    const { data, error: insertError } = await supabase
      .from("services")
      .insert(service)
      .select()
      .single();
    if (insertError) setError(insertError.message);
    else {
      setServices((items) => [...items, data]);
      setService(emptyService);
      event.target.reset();
      setMessage("Service added.");
    }
    setIsSaving(false);
  };

  const deleteService = async (id) => {
    const { error: deleteError } = await supabase
      .from("services")
      .delete()
      .eq("id", id);
    if (deleteError) setError(deleteError.message);
    else setServices((items) => items.filter((item) => item.id !== id));
  };

  if (isLoading) return <main className="min-h-screen p-8" />;
  if (!isSupabaseConfigured)
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        Supabase is not configured.
      </main>
    );

  if (!user)
    return (
      <main
        data-theme="light"
        className="flex min-h-screen items-center justify-center bg-[#f5f7fb] p-4 text-[#172033]"
      >
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md rounded-lg border border-[#e3e8ef] bg-white p-8 shadow-xl"
        >
          <h1 className="mb-2 text-3xl font-semibold">Admin CMS</h1>
          <p className="mb-6 text-gray-500">Sign in to manage the site.</p>
          <div className="flex flex-col gap-4">
            <input
              className="input input-bordered w-full bg-white text-[#172033]"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              required
            />
            <input
              className="input input-bordered w-full bg-white text-[#172033]"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              required
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button className="btn btn-primary" type="submit">
              Sign in
            </button>
          </div>
        </form>
      </main>
    );

  return (
    <main
      data-theme="light"
      className="min-h-screen bg-[#f5f7fb] p-4 text-[#172033] sm:p-8"
    >
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-picto-primary">
              Content management
            </p>
            <h1 className="text-3xl font-semibold">Admin dashboard</h1>
          </div>
          <button
            className="btn border-[#dbe1ea] bg-white text-[#172033]"
            type="button"
            onClick={() => supabase.auth.signOut()}
          >
            Sign out
          </button>
        </header>
        <div className="mb-6 flex w-fit gap-1 rounded-lg border border-[#e3e8ef] bg-white p-1">
          <button
            className={`rounded-md px-4 py-2 text-sm font-medium ${tab === "general" ? "bg-picto-primary text-white" : "text-[#526071]"}`}
            onClick={() => setTab("general")}
            type="button"
          >
            General settings
          </button>
          <button
            className={`rounded-md px-4 py-2 text-sm font-medium ${tab === "services" ? "bg-picto-primary text-white" : "text-[#526071]"}`}
            onClick={() => setTab("services")}
            type="button"
          >
            Manage services
          </button>
        </div>
        {error && (
          <p className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {message && (
          <p className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {message}
          </p>
        )}
        {tab === "general" ? (
          <form
            onSubmit={saveContent}
            className="rounded-lg border border-[#e3e8ef] bg-white p-6 shadow-sm"
          >
            <div className="grid gap-4 md:grid-cols-2">
              {contentFields.map(([name, label, type, required, placeholder]) => (
                <label
                  key={name}
                  className={`flex flex-col gap-2 text-sm font-medium text-[#344054] ${type === "textarea" ? "md:col-span-2" : ""}`}
                >
                  {label}
                  {type === "textarea" ? (
                    <textarea
                      className="textarea textarea-bordered min-h-32 bg-white text-[#172033]"
                      name={name}
                      value={content[name] || ""}
                      placeholder={placeholder}
                      onChange={(event) =>
                        setContent({ ...content, [name]: event.target.value })
                      }
                      required={required}
                    />
                  ) : (
                    <input
                      className="input input-bordered bg-white text-[#172033]"
                      type={type}
                      name={name}
                      value={content[name] || ""}
                      onChange={(event) =>
                        setContent({ ...content, [name]: event.target.value })
                      }
                      required={required}
                      pattern={type === "url" ? "https?://.+" : undefined}
                    />
                  )}
                </label>
              ))}
              <label className="flex flex-col gap-2 text-sm font-medium text-[#344054]">
                Profile photo
                <input
                  className="file-input file-input-bordered bg-white"
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setAvatarFile(event.target.files?.[0] || null)
                  }
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-[#344054]">
                CV document
                <input
                  className="file-input file-input-bordered bg-white"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(event) =>
                    setCvFile(event.target.files?.[0] || null)
                  }
                />
              </label>
            </div>
            <button
              className="btn btn-primary mt-6"
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save settings"}
            </button>
          </form>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
            <form
              onSubmit={addService}
              className="rounded-lg border border-[#e3e8ef] bg-white p-6 shadow-sm"
            >
              <h2 className="mb-5 text-xl font-semibold">Add service</h2>
              <div className="flex flex-col gap-4">
                <input
                  className="input input-bordered bg-white text-[#172033]"
                  placeholder="Service title"
                  value={service.title}
                  onChange={(event) =>
                    setService({ ...service, title: event.target.value })
                  }
                  required
                />
                <textarea
                  className="textarea textarea-bordered min-h-32 bg-white text-[#172033]"
                  placeholder="Service description"
                  value={service.description}
                  onChange={(event) =>
                    setService({ ...service, description: event.target.value })
                  }
                  required
                />
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving ? "Adding..." : "Add service"}
                </button>
              </div>
            </form>
            <section className="space-y-4">
              {services.map((item) => (
                <article
                  className="flex items-start gap-4 rounded-lg border border-[#e3e8ef] bg-white p-5 shadow-sm"
                  key={item.id}
                >
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold">{item.title}</h2>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <button
                    className="btn btn-sm btn-error btn-outline"
                    type="button"
                    onClick={() => deleteService(item.id)}
                  >
                    Delete
                  </button>
                </article>
              ))}
            </section>
          </div>
        )}
      </div>
    </main>
  );
};

export default Admin;
