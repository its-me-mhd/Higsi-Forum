import { useEffect, useState } from "react";
import { isAdminUser, isSupabaseConfigured, supabase } from "../lib/supabase";
import { emptySiteContent } from "../lib/siteContent";

const emptyProject = {
  title: "",
  description: "",
  image_url: "",
  project_url: "",
  category: "",
};

const contentFields = [
  ["full_name", "Full name", "text"],
  ["job_title", "Job title", "text"],
  ["email", "Email", "email"],
  ["github_url", "GitHub URL", "url"],
  ["linkedin_url", "LinkedIn URL", "url"],
  ["bio_text", "Bio", "textarea"],
];

const assetPath = (file) => `${crypto.randomUUID()}-${file.name}`;

const uploadAsset = async (file, folder) => {
  const path = `${folder}/${assetPath(file)}`;
  const { error } = await supabase.storage
    .from("site-assets")
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) {
    if (error.message?.toLowerCase().includes("bucket not found")) {
      throw new Error(
        "The site-assets bucket is missing. Run supabase/site-content.sql in Supabase SQL Editor.",
      );
    }
    throw error;
  }

  return supabase.storage.from("site-assets").getPublicUrl(path).data.publicUrl;
};

const Admin = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [content, setContent] = useState(emptySiteContent);
  const [projects, setProjects] = useState([]);
  const [project, setProject] = useState(emptyProject);
  const [avatarFile, setAvatarFile] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [projectImage, setProjectImage] = useState(null);
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

    const loadDashboard = async () => {
      const [
        { data: contentData, error: contentError },
        { data: projectData, error: projectError },
      ] = await Promise.all([
        supabase.from("site_content").select("*").limit(1).maybeSingle(),
        supabase
          .from("projects")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      if (contentError || projectError) {
        const databaseError = contentError?.message || projectError?.message;
        setError(
          databaseError?.toLowerCase().includes("schema cache")
            ? "The CMS database is not installed yet. Run supabase/site-content.sql in Supabase SQL Editor, then reload this page."
            : databaseError || "Unable to load dashboard.",
        );
        return;
      }

      if (contentData) setContent(contentData);
      setProjects(projectData || []);
    };

    loadDashboard();
  }, [user]);

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

    try {
      const values = { ...content };
      delete values.id;

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

  const addProject = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      const values = { ...project };
      if (projectImage)
        values.image_url = await uploadAsset(projectImage, "projects");
      const { data, error: insertError } = await supabase
        .from("projects")
        .insert(values)
        .select()
        .single();

      if (insertError) throw insertError;
      setProjects((currentProjects) => [data, ...currentProjects]);
      setProject(emptyProject);
      setProjectImage(null);
      event.target.reset();
      setMessage("Project added.");
    } catch (insertError) {
      setError(insertError.message);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteProject = async (id) => {
    setError("");
    const { error: deleteError } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setProjects((currentProjects) =>
      currentProjects.filter((item) => item.id !== id),
    );
  };

  if (isLoading) return <main className="min-h-screen p-8" />;

  if (!isSupabaseConfigured) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <p className="text-red-600">Supabase is not configured.</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main data-theme="light" className="flex min-h-screen items-center justify-center bg-[#f5f7fb] p-4 text-[#172033]">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md rounded-lg border border-[#e3e8ef] bg-white p-8 shadow-xl"
        >
          <h1 className="mb-2 text-3xl font-semibold text-[#172033]">
            Admin CMS
          </h1>
          <p className="mb-6 text-gray-500">Sign in to manage the portfolio.</p>
          <div className="flex flex-col gap-4">
            <input
              className="input input-bordered w-full border-[#cbd5e1] bg-white text-[#172033] placeholder:text-[#8a96a8] focus:border-picto-primary focus:outline-none"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              required
            />
            <input
              className="input input-bordered w-full border-[#cbd5e1] bg-white text-[#172033] placeholder:text-[#8a96a8] focus:border-picto-primary focus:outline-none"
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
  }

  return (
    <main data-theme="light" className="min-h-screen bg-[#f5f7fb] p-4 text-[#172033] sm:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-picto-primary">
              Content management
            </p>
            <h1 className="text-3xl font-semibold text-gray-900">
              Admin dashboard
            </h1>
          </div>
          <button
            className="btn border-[#dbe1ea] bg-white text-[#172033] hover:border-picto-primary hover:bg-white hover:text-picto-primary"
            type="button"
            onClick={() => supabase.auth.signOut()}
          >
            Sign out
          </button>
        </header>
        <div className="mb-6 flex w-fit gap-1 rounded-lg border border-[#e3e8ef] bg-white p-1">
          <button
            className={`rounded-md px-4 py-2 text-sm font-medium ${tab === "general" ? "bg-picto-primary text-white" : "text-[#526071] hover:bg-[#f3edff]"}`}
            onClick={() => setTab("general")}
            type="button"
          >
            General settings
          </button>
          <button
            className={`rounded-md px-4 py-2 text-sm font-medium ${tab === "projects" ? "bg-picto-primary text-white" : "text-[#526071] hover:bg-[#f3edff]"}`}
            onClick={() => setTab("projects")}
            type="button"
          >
            Manage projects
          </button>
        </div>
        {error && <p className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {message && <p className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</p>}
        {tab === "general" ? (
          <form
            onSubmit={saveContent}
            className="rounded-lg border border-[#e3e8ef] bg-white p-6 shadow-sm"
          >
            <div className="grid gap-4 md:grid-cols-2">
              {contentFields.map(([name, label, type]) => (
                <label
                  key={name}
                  className={`flex flex-col gap-2 text-sm font-medium text-[#344054] ${type === "textarea" ? "md:col-span-2" : ""}`}
                >
                  {label}
                  {type === "textarea" ? (
                    <textarea
                      className="textarea textarea-bordered min-h-40 border-[#cbd5e1] bg-white text-[#172033] placeholder:text-[#8a96a8] focus:border-picto-primary focus:outline-none"
                      name={name}
                      value={content[name]}
                      onChange={(event) =>
                        setContent({ ...content, [name]: event.target.value })
                      }
                      required
                    />
                  ) : (
                    <input
                      className="input input-bordered border-[#cbd5e1] bg-white text-[#172033] placeholder:text-[#8a96a8] focus:border-picto-primary focus:outline-none"
                      type={type}
                      name={name}
                      value={content[name]}
                      onChange={(event) =>
                        setContent({ ...content, [name]: event.target.value })
                      }
                      required
                    />
                  )}
                </label>
              ))}
              <label className="flex flex-col gap-2 text-sm font-medium text-[#344054]">
                Profile photo
                <input
                  className="file-input file-input-bordered border-[#cbd5e1] bg-white text-[#172033]"
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
                  className="file-input file-input-bordered border-[#cbd5e1] bg-white text-[#172033]"
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
              onSubmit={addProject}
              className="rounded-lg border border-[#e3e8ef] bg-white p-6 shadow-sm"
            >
              <h2 className="mb-5 text-xl font-semibold">Add project</h2>
              <div className="flex flex-col gap-4">
                <input
                  className="input input-bordered border-[#cbd5e1] bg-white text-[#172033] placeholder:text-[#8a96a8] focus:border-picto-primary focus:outline-none"
                  placeholder="Title"
                  value={project.title}
                  onChange={(event) =>
                    setProject({ ...project, title: event.target.value })
                  }
                  required
                />
                <input
                  className="input input-bordered border-[#cbd5e1] bg-white text-[#172033] placeholder:text-[#8a96a8] focus:border-picto-primary focus:outline-none"
                  placeholder="Category"
                  value={project.category}
                  onChange={(event) =>
                    setProject({ ...project, category: event.target.value })
                  }
                  required
                />
                <textarea
                  className="textarea textarea-bordered min-h-32 border-[#cbd5e1] bg-white text-[#172033] placeholder:text-[#8a96a8] focus:border-picto-primary focus:outline-none"
                  placeholder="Description"
                  value={project.description}
                  onChange={(event) =>
                    setProject({ ...project, description: event.target.value })
                  }
                  required
                />
                <input
                  className="input input-bordered border-[#cbd5e1] bg-white text-[#172033] placeholder:text-[#8a96a8] focus:border-picto-primary focus:outline-none"
                  type="url"
                  placeholder="Project URL"
                  value={project.project_url}
                  onChange={(event) =>
                    setProject({ ...project, project_url: event.target.value })
                  }
                  required
                />
                <input
                  className="file-input file-input-bordered border-[#cbd5e1] bg-white text-[#172033]"
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setProjectImage(event.target.files?.[0] || null)
                  }
                  required
                />
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving ? "Adding..." : "Add project"}
                </button>
              </div>
            </form>
            <section className="space-y-4">
              {projects.map((item) => (
                <article
                  className="flex gap-4 rounded-lg border border-[#e3e8ef] bg-white p-4 shadow-sm"
                  key={item.id}
                >
                  <img
                    className="h-24 w-32 rounded object-cover"
                    src={item.image_url}
                    alt={item.title}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase text-gray-500">
                      {item.category}
                    </p>
                    <h2 className="font-semibold">{item.title}</h2>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <button
                    className="btn btn-sm btn-error btn-outline h-fit"
                    type="button"
                    onClick={() => deleteProject(item.id)}
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
