import { useEffect, useState } from "react";
import { isAdminUser, isSupabaseConfigured, supabase } from "../lib/supabase";
import { emptySiteContent } from "../lib/siteContent";

const tabs = ["Website content", "Programs", "Impact", "Settings"];
const contentFields = [
  ["hero_eyebrow", "Hero eyebrow", "input"],
  ["hero_heading", "Hero heading", "input"],
  ["hero_text", "Hero introduction", "textarea"],
  ["hero_note", "Hero note", "input"],
  ["about_section_heading", "About section heading", "input"],
  ["about_text", "About main text", "textarea"],
  ["about_text_secondary", "About supporting text", "textarea"],
  ["vision_text", "Vision", "textarea"],
  ["mission_text", "Mission", "textarea"],
  ["founder_name", "Founder name", "input"],
  ["founder_role", "Founder role", "input"],
  ["founder_bio", "Founder biography", "textarea"],
  ["programs_section_heading", "Programs section heading", "input"],
  ["programs_section_text", "Programs introduction", "textarea"],
  ["impact_section_heading", "Impact section heading", "input"],
  ["impact_section_text", "Impact introduction", "textarea"],
  ["partnerships_heading", "Partnerships heading", "input"],
  ["partnerships_text", "Partnerships introduction", "textarea"],
  ["collaboration_heading", "Collaboration heading", "input"],
  ["collaboration_items", "Collaboration areas (one per line)", "textarea"],
  ["contact_display_heading", "Contact heading", "input"],
  ["contact_display_text", "Contact introduction", "textarea"],
  ["email", "Contact email", "input"],
  ["phone", "Contact phone", "input"],
  ["address", "Contact location", "input"],
];
const contentColumns = [
  "full_name",
  "site_name",
  "job_title",
  "home_heading",
  "about_heading",
  "services_heading",
  "contact_heading",
  "contact_left_heading",
  "contact_right_heading",
  "email",
  "address",
  "phone",
  "home_text",
  "about_text",
  "services_text",
  "contact_text",
  "experience_text",
  "projects_completed_text",
  "happy_clients_text",
  "facebook_url",
  "instagram_url",
  "whatsapp_url",
  "linkedin_url",
  "avatar_url",
  "cv_url",
  ...contentFields.map(([field]) => field),
  "logo_url",
  "impact_youth",
  "impact_women",
  "impact_teachers",
  "impact_communities",
  "impact_partnerships",
  "impact_items",
  "founder_image_url",
];

const defaultImpactItems = [
  { metric: "320+", label: "Youth trained and empowered" },
  { metric: "180+", label: "Women reached through capacity building" },
  { metric: "200+", label: "Teachers supported through development" },
  { metric: "15+", label: "Communities engaged in initiatives" },
  { metric: "12", label: "Partnerships with local stakeholders" },
];
const defaultPrograms = [
  [
    "Youth Empowerment & Skills Development",
    "Practical pathways to confidence, employability, leadership, communication, entrepreneurship, and career readiness.",
  ],
  [
    "Women Empowerment",
    "Inclusive development programs that strengthen personal growth, digital confidence, financial awareness, and business capacity.",
  ],
  [
    "Teacher Training & Professional Development",
    "Relevant, classroom-ready learning for educators who want to improve teaching quality and support every learner.",
  ],
  [
    "Education & Capacity Building",
    "Workshops and training-of-trainers programs that turn knowledge into capability across institutions and communities.",
  ],
  [
    "Leadership & Personal Development",
    "Human-centered development for people ready to lead with self-awareness, resilience, good judgment, and purpose.",
  ],
  [
    "Community Development",
    "Locally grounded initiatives that build participation, awareness, resilience, innovation, and shared ownership.",
  ],
  [
    "Entrepreneurship & Innovation",
    "A practical space for new ideas, business capacity, and economic opportunities, especially for youth and women.",
  ],
];

const Admin = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Website content");
  const [content, setContent] = useState(emptySiteContent);
  const [services, setServices] = useState([]);
  const [service, setService] = useState({
    title: "",
    description: "",
    sort_order: 0,
  });
  const [impactItems, setImpactItems] = useState(defaultImpactItems);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newLogo, setNewLogo] = useState(null);
  const [newFounderImage, setNewFounderImage] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return undefined;
    }
    const loadSession = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(isAdminUser(data.user) ? data.user : null);
      setLoading(false);
    };
    loadSession();
    const { data } = supabase.auth.onAuthStateChange((_event, session) =>
      setUser(isAdminUser(session?.user) ? session.user : null),
    );
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
      if (contentResult.error) setError(contentResult.error.message);
      if (contentResult.data) {
        setContent(
          Object.fromEntries(
            Object.entries(emptySiteContent).map(([key, fallback]) => [
              key,
              contentResult.data[key] ?? fallback,
            ]),
          ),
        );
        if (
          Array.isArray(contentResult.data.impact_items) &&
          contentResult.data.impact_items.length
        )
          setImpactItems(contentResult.data.impact_items);
      }
      if (servicesResult.error)
        setError(
          (current) =>
            current ||
            "The services table is not available. Run the services migration.",
        );
      setServices(servicesResult.data || []);
    });
  }, [user]);

  const updateContent = (field, value) =>
    setContent((current) => ({ ...current, [field]: value }));
  const restoreDefaultContent = () => {
    setContent({ ...emptySiteContent, id: content.id });
    setImpactItems(defaultImpactItems.map((item) => ({ ...item })));
    setNewLogo(null);
    setMessage("Default content loaded. Review it, then save when ready.");
    setError("");
  };
  const uploadLogo = async () => {
    if (!newLogo) return content.logo_url;
    const path = `logos/${crypto.randomUUID()}-${newLogo.name}`;
    const { error: uploadError } = await supabase.storage
      .from("site-assets")
      .upload(path, newLogo, { cacheControl: "3600", upsert: false });
    if (uploadError) throw uploadError;
    return supabase.storage.from("site-assets").getPublicUrl(path).data
      .publicUrl;
  };
  const uploadFounderImage = async () => {
    if (!newFounderImage) return content.founder_image_url;
    const path = `founders/${crypto.randomUUID()}-${newFounderImage.name}`;
    const { error: uploadError } = await supabase.storage
      .from("site-assets")
      .upload(path, newFounderImage, { cacheControl: "3600", upsert: false });
    if (uploadError) throw uploadError;
    return supabase.storage.from("site-assets").getPublicUrl(path).data
      .publicUrl;
  };

  const saveContent = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const logoUrl = await uploadLogo();
      const founderImageUrl = await uploadFounderImage();
      const values = Object.fromEntries(
        contentColumns.map((field) => [
          field,
          content[field] ?? emptySiteContent[field] ?? "",
        ]),
      );
      values.logo_url = logoUrl || null;
      values.founder_image_url = founderImageUrl || "";
      const runSave = (saveValues) =>
        content.id
          ? supabase
              .from("site_content")
              .update(saveValues)
              .eq("id", content.id)
              .select()
              .single()
          : supabase.from("site_content").insert(saveValues).select().single();
      let founderMigrationMissing = false;
      let { data, error: saveError } = await runSave(values);
      if (saveError?.message?.includes("founder_image_url")) {
        founderMigrationMissing = true;
        const fallbackValues = { ...values };
        delete fallbackValues.founder_image_url;
        ({ data, error: saveError } = await runSave(fallbackValues));
      }
      if (saveError) throw saveError;
      setContent({ ...emptySiteContent, ...data });
      setNewLogo(null);
      setNewFounderImage(null);
      setMessage(
        founderMigrationMissing
          ? "Website content saved. Run fix-founder-image.sql before uploading a profile image."
          : "Website content saved.",
      );
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const addService = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const { data, error: serviceError } = await supabase
      .from("services")
      .insert({ ...service, sort_order: services.length })
      .select()
      .single();
    if (serviceError) setError(serviceError.message);
    else {
      setServices((items) => [...items, data]);
      setService({ title: "", description: "", sort_order: 0 });
      setMessage("Program added to the public site.");
    }
    setSaving(false);
  };

  const deleteService = async (id) => {
    const { error: deleteError } = await supabase
      .from("services")
      .delete()
      .eq("id", id);
    if (deleteError) setError(deleteError.message);
    else {
      setServices((items) => items.filter((item) => item.id !== id));
      setMessage("Program removed from the public site.");
    }
  };

  const restoreDefaultPrograms = async () => {
    setSaving(true);
    setError("");
    const { error: deleteError } = await supabase
      .from("services")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (deleteError) setError(deleteError.message);
    else {
      const { data, error: insertError } = await supabase
        .from("services")
        .insert(
          defaultPrograms.map(([title, description], sort_order) => ({
            title,
            description,
            sort_order,
          })),
        )
        .select()
        .order("sort_order", { ascending: true });
      if (insertError) setError(insertError.message);
      else {
        setServices(data || []);
        setMessage("Default programs restored. You can edit them afterward.");
      }
    }
    setSaving(false);
  };

  const restoreDefaultImpact = () => {
    setImpactItems(defaultImpactItems.map((item) => ({ ...item })));
    setMessage("Default impact numbers loaded. Save to publish them.");
  };

  const saveImpact = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const values = {
      impact_items: impactItems.filter(
        (item) => item.metric.trim() && item.label.trim(),
      ),
    };
    const { error: saveError } = content.id
      ? await supabase.from("site_content").update(values).eq("id", content.id)
      : {
          error: new Error(
            "Save website content once before saving impact metrics.",
          ),
        };
    if (saveError) setError(saveError.message);
    else {
      setContent((current) => ({ ...current, ...values }));
      setMessage("Impact metrics saved to the public site.");
    }
    setSaving(false);
  };

  const updateAccount = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    const updates = {};
    if (email && email !== user.email) updates.email = email;
    if (password) updates.password = password;
    if (!Object.keys(updates).length) {
      setError("Enter a new email or password first.");
      setSaving(false);
      return;
    }
    const { data, error: updateError } =
      await supabase.auth.updateUser(updates);
    if (updateError) setError(updateError.message);
    else {
      setUser(data.user);
      setEmail("");
      setPassword("");
      setMessage(
        updates.email
          ? "Email updated. Confirm it from your new inbox if Supabase requests confirmation."
          : "Password updated.",
      );
    }
    setSaving(false);
  };

  const login = async (event) => {
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

  if (loading) return <main className="admin-loading" />;
  if (!isSupabaseConfigured)
    return (
      <main className="admin-login">
        <div className="admin-login-card">
          <p className="admin-kicker">Higsi Forum</p>
          <h1>Supabase is not configured.</h1>
          <p>Add the Supabase values to `.env.local`, then restart Vite.</p>
        </div>
      </main>
    );
  if (!user)
    return (
      <main className="admin-login">
        <form className="admin-login-card" onSubmit={login}>
          <p className="admin-kicker">Higsi Forum Admin</p>
          <h1>Welcome back.</h1>
          <p>Manage the real content published on your website.</p>
          <label>
            Email address
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error && <div className="admin-error">{error}</div>}
          <button className="admin-button" type="submit">
            Sign in
          </button>
        </form>
      </main>
    );

  const renderContent = () => (
    <form
      className="admin-panel admin-form content-editor"
      onSubmit={saveContent}
    >
      <div className="admin-panel-heading">
        <div>
          <p className="admin-kicker">Website content</p>
          <h2>Edit what visitors see</h2>
        </div>
        <span>Saved to Supabase</span>
      </div>
      <div className="content-actions">
        <button
          className="admin-link"
          type="button"
          onClick={restoreDefaultContent}
        >
          Keep the default content
        </button>
        <small>
          Loads the original Higsi Forum text into every field. You can edit
          individual sections before saving.
        </small>
      </div>
      <div className="settings-grid">
        {contentFields.map(([field, label, type]) => (
          <label
            className={type === "textarea" ? "full-field" : ""}
            key={field}
          >
            {label}
            {type === "textarea" ? (
              <textarea
                rows="4"
                value={content[field] || ""}
                onChange={(event) => updateContent(field, event.target.value)}
              />
            ) : (
              <input
                value={content[field] || ""}
                onChange={(event) => updateContent(field, event.target.value)}
              />
            )}
          </label>
        ))}
        <label className="full-field">
          Logo
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={(event) => setNewLogo(event.target.files?.[0] || null)}
          />
          <small>
            {content.logo_url
              ? "A custom logo is active. Leave empty to keep it."
              : "No custom logo yet. The default H mark will be used."}
          </small>
        </label>
        <label className="full-field">
          Founder profile image
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) =>
              setNewFounderImage(event.target.files?.[0] || null)
            }
          />
          <small>
            {content.founder_image_url
              ? "A founder profile image is active. Upload another to replace it."
              : "No profile image yet. The default initial will be used."}
          </small>
        </label>
      </div>
      <button className="admin-button" disabled={saving}>
        {saving ? "Saving..." : "Save website content"}
      </button>
    </form>
  );
  const renderPrograms = () => (
    <>
      <div className="admin-page-title">
        <div>
          <p className="admin-kicker">Public website</p>
          <h1>Programs</h1>
        </div>
        <span className="admin-pill">{services.length} published</span>
      </div>
      <div className="content-actions">
        <button
          className="admin-link"
          type="button"
          onClick={restoreDefaultPrograms}
          disabled={saving}
        >
          Keep the default programs
        </button>
        <small>
          Restores the original program list, then you can remove or add
          individual programs.
        </small>
      </div>
      <div className="admin-two-column">
        <form className="admin-panel admin-form" onSubmit={addService}>
          <div className="admin-panel-heading">
            <h2>Add program</h2>
            <span>Appears on the site</span>
          </div>
          <label>
            Program title
            <input
              required
              value={service.title}
              placeholder="Program title"
              onChange={(event) =>
                setService({ ...service, title: event.target.value })
              }
            />
          </label>
          <label>
            Program description
            <textarea
              required
              rows="6"
              value={service.description}
              placeholder="What does this program offer?"
              onChange={(event) =>
                setService({ ...service, description: event.target.value })
              }
            />
          </label>
          <button className="admin-button" disabled={saving}>
            Add program
          </button>
        </form>
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <h2>Published programs</h2>
            <span>Shown in order</span>
          </div>
          {services.map((item) => (
            <div className="program-admin-row" key={item.id}>
              <div>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>
              <button
                className="delete-button"
                type="button"
                onClick={() => deleteService(item.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </section>
      </div>
    </>
  );
  const renderImpact = () => (
    <form className="admin-panel admin-form impact-form" onSubmit={saveImpact}>
      <div className="admin-panel-heading">
        <div>
          <p className="admin-kicker">Public website</p>
          <h2>Impact numbers</h2>
        </div>
        <span>Shown in section 03</span>
      </div>
      <p>Add, edit, or remove the rows shown in the public Impact section.</p>
      <div className="content-actions">
        <button
          className="admin-link"
          type="button"
          onClick={restoreDefaultImpact}
        >
          Keep the default impact
        </button>
        <small>Loads the original impact rows for review before saving.</small>
      </div>
      <div className="impact-editor-list">
        {impactItems.map((item, index) => (
          <div className="impact-editor-row" key={`${index}-${item.label}`}>
            <input
              aria-label="Impact number"
              value={item.metric}
              placeholder="320+"
              onChange={(event) =>
                setImpactItems((items) =>
                  items.map((current, itemIndex) =>
                    itemIndex === index
                      ? { ...current, metric: event.target.value }
                      : current,
                  ),
                )
              }
            />
            <input
              aria-label="Impact label"
              value={item.label}
              placeholder="Youth trained"
              onChange={(event) =>
                setImpactItems((items) =>
                  items.map((current, itemIndex) =>
                    itemIndex === index
                      ? { ...current, label: event.target.value }
                      : current,
                  ),
                )
              }
            />
            <button
              className="delete-button"
              type="button"
              onClick={() =>
                setImpactItems((items) =>
                  items.filter((_current, itemIndex) => itemIndex !== index),
                )
              }
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        className="admin-link"
        type="button"
        onClick={() =>
          setImpactItems((items) => [...items, { metric: "", label: "" }])
        }
      >
        + Add impact row
      </button>
      <button className="admin-button" disabled={saving}>
        {saving ? "Saving..." : "Save impact numbers"}
      </button>
    </form>
  );
  const renderSettings = () => (
    <form
      className="admin-panel admin-form settings-form"
      onSubmit={updateAccount}
    >
      <div className="admin-panel-heading">
        <div>
          <p className="admin-kicker">Account security</p>
          <h2>Admin account</h2>
        </div>
        <span>Supabase Auth</span>
      </div>
      <p>
        Change the login email or password without opening Supabase. Leave
        either field empty to keep it unchanged.
      </p>
      <label>
        New admin email
        <input
          type="email"
          value={email}
          placeholder={user.email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <label>
        New password
        <input
          type="password"
          minLength="6"
          value={password}
          placeholder="At least 6 characters"
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      <button className="admin-button" disabled={saving}>
        {saving ? "Updating..." : "Update account"}
      </button>
    </form>
  );

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/">
          <span className="brand-mark">H</span>
          <span>
            <strong>Higsi</strong> Forum <small>Admin</small>
          </span>
        </a>
        <nav>
          {tabs.map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => {
                setActiveTab(tab);
                setMessage("");
                setError("");
              }}
            >
              <span>{["▤", "◫", "◈", "⚙"][tabs.indexOf(tab)]}</span>
              {tab}
            </button>
          ))}
        </nav>
        <button
          className="admin-signout"
          onClick={() => supabase.auth.signOut()}
        >
          ↪ Sign out
        </button>
      </aside>
      <section className="admin-main">
        <header className="admin-topbar">
          <span>Higsi Forum / {activeTab}</span>
          <div>
            <span className="admin-avatar">
              {user.email?.charAt(0).toUpperCase()}
            </span>
            {user.email}
          </div>
        </header>
        {message && <div className="admin-success">{message}</div>}
        {error && <div className="admin-error admin-banner">{error}</div>}
        <div className="admin-content">
          {activeTab === "Website content" && renderContent()}
          {activeTab === "Programs" && renderPrograms()}
          {activeTab === "Impact" && renderImpact()}
          {activeTab === "Settings" && renderSettings()}
        </div>
      </section>
    </main>
  );
};

export default Admin;
