import { useEffect, useState } from "react";
import { isAdminUser, isSupabaseConfigured, supabase } from "../lib/supabase";
import { emptySiteContent } from "../lib/siteContent";

const defaultImpact = {
  youth: "320+",
  women: "180+",
  teachers: "200+",
  communities: "15+",
};

const tabs = ["Overview", "Programs", "Impact", "Inquiries", "Settings"];

const Admin = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");
  const [content, setContent] = useState(emptySiteContent);
  const [services, setServices] = useState([]);
  const [service, setService] = useState({ title: "", description: "", sort_order: 0 });
  const [impact, setImpact] = useState(() => JSON.parse(localStorage.getItem("higsi-impact") || JSON.stringify(defaultImpact)));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!supabase) { setLoading(false); return undefined; }
    const loadSession = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(isAdminUser(data.user) ? data.user : null);
      setLoading(false);
    };
    loadSession();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(isAdminUser(session?.user) ? session.user : null));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [{ data: contentData, error: contentError }, { data: serviceData, error: serviceError }] = await Promise.all([
        supabase.from("site_content").select("*").limit(1).maybeSingle(),
        supabase.from("services").select("*").order("sort_order", { ascending: true }),
      ]);
      if (contentError) setError(contentError.message);
      if (contentData) setContent({ ...emptySiteContent, ...contentData });
      if (serviceError) setError((current) => current || "The services table is not available yet. Run the Supabase migration.");
      setServices(serviceData || []);
    };
    load();
  }, [user]);

  const login = async (event) => {
    event.preventDefault(); setError("");
    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError || !isAdminUser(data.user)) { await supabase.auth.signOut(); setError("These credentials are not authorized for this dashboard."); }
  };

  const saveContent = async (event) => {
    event.preventDefault(); setSaving(true); setError(""); setMessage("");
    const fields = [
      "full_name", "site_name", "job_title", "home_heading", "about_heading",
      "services_heading", "contact_heading", "contact_left_heading", "contact_right_heading",
      "email", "address", "phone", "home_text", "about_text", "services_text", "contact_text",
      "experience_text", "projects_completed_text", "happy_clients_text", "facebook_url",
      "instagram_url", "whatsapp_url", "linkedin_url", "avatar_url", "cv_url", "hero_eyebrow",
      "about_supporting_text", "vision_text", "mission_text", "programs_heading", "programs_text",
      "impact_heading", "impact_text", "partnerships_heading", "partnerships_text",
      "collaboration_heading", "collaboration_items",
      "impact_youth", "impact_women", "impact_teachers", "impact_communities", "impact_partnerships",
    ];
    const values = Object.fromEntries(fields.map((field) => [field, content[field] || null]));
    const query = content.id ? supabase.from("site_content").update(values).eq("id", content.id).select().single() : supabase.from("site_content").insert(values).select().single();
    const { data, error: saveError } = await query;
    if (saveError) setError(saveError.message); else { setContent({ ...emptySiteContent, ...data }); setMessage("Organization profile saved."); }
    setSaving(false);
  };

  const addService = async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    const { data, error: serviceError } = await supabase.from("services").insert(service).select().single();
    if (serviceError) setError(serviceError.message); else { setServices((items) => [...items, data]); setService({ title: "", description: "", sort_order: 0 }); setMessage("Program added."); }
    setSaving(false);
  };

  const deleteService = async (id) => {
    const { error: deleteError } = await supabase.from("services").delete().eq("id", id);
    if (deleteError) setError(deleteError.message); else setServices((items) => items.filter((item) => item.id !== id));
  };

  const saveImpact = async (event) => {
    event.preventDefault();
    setSaving(true);
    const nextContent = { ...content, impact_youth: impact.youth, impact_women: impact.women, impact_teachers: impact.teachers, impact_communities: impact.communities, impact_partnerships: impact.partnerships || "12" };
    setContent(nextContent);
    const fields = ["impact_youth", "impact_women", "impact_teachers", "impact_communities", "impact_partnerships"];
    const values = Object.fromEntries(fields.map((field) => [field, nextContent[field]]));
    const { error: saveError } = content.id ? await supabase.from("site_content").update(values).eq("id", content.id) : { error: new Error("Save organization profile first, then save impact metrics.") };
    if (saveError) setError(saveError.message); else setMessage("Impact metrics saved to the public site.");
    setSaving(false);
  };

  if (loading) return <main className="admin-loading" />;
  if (!isSupabaseConfigured) return <main className="admin-login"><div className="admin-login-card"><p className="admin-kicker">Higsi Forum</p><h1>Supabase is not configured.</h1><p>Add the Supabase values to `.env.local`, then restart Vite.</p></div></main>;
  if (!user) return <main className="admin-login"><form className="admin-login-card" onSubmit={login}><p className="admin-kicker">Higsi Forum Admin</p><h1>Welcome back.</h1><p>Sign in to manage programs, impact, and inquiries.</p><label>Email address<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Password<input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label><label className="remember"><input type="checkbox" /> Remember me</label>{error && <div className="admin-error">{error}</div>}<button className="admin-button" type="submit">Sign in to dashboard</button></form></main>;

  const renderOverview = () => <><div className="admin-page-title"><div><p className="admin-kicker">Good to see you</p><h1>Dashboard overview</h1></div><span className="admin-date">September 2026</span></div><div className="admin-stat-grid"><div><span>Active programs</span><strong>{services.length || 7}</strong><small>Across 7 focus areas</small></div><div><span>Partnership requests</span><strong>14</strong><small className="gold-text">Pending review</small></div><div><span>Youth trained</span><strong>{impact.youth}</strong><small>Impact metric</small></div><div><span>Unread messages</span><strong>5</strong><small>Needs your attention</small></div></div><div className="admin-content-grid"><section className="admin-panel"><div className="admin-panel-heading"><h2>Recent activity</h2><span>Last 30 days</span></div>{["Program content updated", "New partnership inquiry received", "Impact metrics reviewed", "Teacher training program added"].map((item, index) => <div className="activity-row" key={item}><span className="activity-dot" /><div><strong>{item}</strong><small>{index + 1} day{index ? "s" : ""} ago · Higsi Forum CMS</small></div></div>)}</section><section className="admin-panel admin-callout"><p className="admin-kicker">Keep moving</p><h2>Your work creates the conditions for people to thrive.</h2><p>Keep the public site current with the programs, partnerships, and impact stories your community needs to see.</p><button className="admin-link" onClick={() => setActiveTab("Programs")}>Manage programs →</button></section></div></>;

  const renderPrograms = () => <><div className="admin-page-title"><div><p className="admin-kicker">Content management</p><h1>Programs manager</h1></div><span className="admin-pill">{services.length} published</span></div><div className="admin-two-column"><form className="admin-panel admin-form" onSubmit={addService}><div className="admin-panel-heading"><h2>Add new program</h2><span>Publish instantly</span></div><label>Program title<input required value={service.title} placeholder="e.g. Youth Empowerment" onChange={(event) => setService({ ...service, title: event.target.value })} /></label><label>Short description<textarea required rows="5" value={service.description} placeholder="What will participants gain?" onChange={(event) => setService({ ...service, description: event.target.value })} /></label><button className="admin-button" disabled={saving}>Add program</button></form><section className="admin-panel"><div className="admin-panel-heading"><h2>Active programs</h2><span>Manage content</span></div>{services.length ? services.map((item) => <div className="program-admin-row" key={item.id}><div><strong>{item.title}</strong><p>{item.description}</p></div><button className="delete-button" onClick={() => deleteService(item.id)}>Delete</button></div>) : <p className="admin-empty">No programs yet. Add your first program to publish it.</p>}</section></div></>;

  const renderImpact = () => <><div className="admin-page-title"><div><p className="admin-kicker">Public website</p><h1>Impact metrics</h1></div><span className="admin-pill">Live content</span></div><form className="admin-panel impact-form" onSubmit={saveImpact}><div className="admin-panel-heading"><h2>Numbers that tell the story</h2><span>Update anytime</span></div><p>These counters make your community impact visible at a glance. Keep them current as programs grow.</p><div className="impact-input-grid">{[["youth", "Youth trained & empowered"], ["women", "Women reached"], ["teachers", "Teachers supported"], ["communities", "Communities engaged"], ["partnerships", "Partnerships created"]].map(([key, label]) => <label key={key}>{label}<input value={impact[key] || ""} onChange={(event) => setImpact({ ...impact, [key]: event.target.value })} /></label>)}</div><button className="admin-button" type="submit" disabled={saving}>{saving ? "Saving..." : "Save impact metrics"}</button></form></>;

  const renderInquiries = () => <><div className="admin-page-title"><div><p className="admin-kicker">Stay connected</p><h1>Partnership & contact inquiries</h1></div><span className="admin-pill">5 unread</span></div><section className="admin-panel inquiry-panel"><div className="inquiry-tabs"><button className="active" type="button">All inquiries</button><button type="button">Partnerships</button><button type="button">General queries</button></div><div className="inquiry-table"><div className="inquiry-head"><span>Sender</span><span>Organization</span><span>Type</span><span>Status</span><span /></div>{[["Amina Yusuf", "Community Learning Hub", "Partnership", "Pending"], ["Mohamed Ali", "Somali Educators Network", "Training", "Reviewed"], ["Sahra Hassan", "Independent", "General query", "Pending"]].map((item) => <div className="inquiry-row" key={item[0]}><strong>{item[0]}</strong><span>{item[1]}</span><span>{item[2]}</span><b className={item[3].toLowerCase()}>{item[3]}</b><button type="button">View</button></div>)}</div></section></>;

  const updateContent = (field, value) => setContent((current) => ({ ...current, [field]: value }));
  const renderSettings = () => <><div className="admin-page-title"><div><p className="admin-kicker">Organization profile</p><h1>Settings</h1></div></div><form className="admin-panel admin-form settings-form" onSubmit={saveContent}><div className="admin-panel-heading"><h2>Public website content</h2><span>Supabase connected</span></div><div className="settings-grid"><label>Organization name<input value={content.full_name || "Higsi Forum"} onChange={(event) => updateContent("full_name", event.target.value)} /></label><label>Official email<input type="email" value={content.email || ""} onChange={(event) => updateContent("email", event.target.value)} /></label><label>Phone number<input value={content.phone || ""} onChange={(event) => updateContent("phone", event.target.value)} /></label><label>Location / office<input value={content.address || ""} onChange={(event) => updateContent("address", event.target.value)} /></label><label>Hero eyebrow<input value={content.hero_eyebrow || ""} onChange={(event) => updateContent("hero_eyebrow", event.target.value)} /></label><label>Home title<input value={content.home_heading || ""} onChange={(event) => updateContent("home_heading", event.target.value)} /></label><label className="full-field">Home introduction<textarea rows="4" value={content.home_text || ""} onChange={(event) => updateContent("home_text", event.target.value)} /></label><label>About title<input value={content.about_heading || ""} onChange={(event) => updateContent("about_heading", event.target.value)} /></label><label>About supporting text<textarea rows="3" value={content.about_supporting_text || ""} onChange={(event) => updateContent("about_supporting_text", event.target.value)} /></label><label className="full-field">About main text<textarea rows="4" value={content.about_text || ""} onChange={(event) => updateContent("about_text", event.target.value)} /></label><label>Vision<textarea rows="3" value={content.vision_text || ""} onChange={(event) => updateContent("vision_text", event.target.value)} /></label><label>Mission<textarea rows="3" value={content.mission_text || ""} onChange={(event) => updateContent("mission_text", event.target.value)} /></label><label>Programs section title<input value={content.programs_heading || ""} onChange={(event) => updateContent("programs_heading", event.target.value)} /></label><label>Programs introduction<textarea rows="3" value={content.programs_text || ""} onChange={(event) => updateContent("programs_text", event.target.value)} /></label><label>Impact section title<input value={content.impact_heading || ""} onChange={(event) => updateContent("impact_heading", event.target.value)} /></label><label>Impact introduction<textarea rows="3" value={content.impact_text || ""} onChange={(event) => updateContent("impact_text", event.target.value)} /></label><label>Partnership section title<input value={content.partnerships_heading || ""} onChange={(event) => updateContent("partnerships_heading", event.target.value)} /></label><label>Partnership introduction<textarea rows="3" value={content.partnerships_text || ""} onChange={(event) => updateContent("partnerships_text", event.target.value)} /></label><label>Collaboration heading<input value={content.collaboration_heading || ""} onChange={(event) => updateContent("collaboration_heading", event.target.value)} /></label><label>Collaboration areas<textarea rows="5" placeholder="One area per line" value={content.collaboration_items || ""} onChange={(event) => updateContent("collaboration_items", event.target.value)} /></label><label>Contact heading<input value={content.contact_heading || ""} onChange={(event) => updateContent("contact_heading", event.target.value)} /></label><label>Contact introduction<textarea rows="3" value={content.contact_text || ""} onChange={(event) => updateContent("contact_text", event.target.value)} /></label></div><button className="admin-button" type="submit" disabled={saving}>{saving ? "Saving..." : "Save website content"}</button></form></>;

  return <main className="admin-shell"><aside className="admin-sidebar"><a className="admin-brand" href="/"><span className="brand-mark">H</span><span><strong>Higsi</strong> Forum <small>Admin</small></span></a><nav>{tabs.map((tab) => <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => { setActiveTab(tab); setMessage(""); setError(""); }}><span>{["⌂", "◫", "◈", "◎", "⚙"][tabs.indexOf(tab)]}</span>{tab}</button>)}</nav><button className="admin-signout" onClick={() => supabase.auth.signOut()}>↪ Sign out</button></aside><section className="admin-main"><header className="admin-topbar"><span>Higsi Forum / {activeTab}</span><div><span className="admin-avatar">{user.email?.charAt(0).toUpperCase()}</span>{user.email}</div></header>{message && <div className="admin-success">{message}</div>}{error && <div className="admin-error admin-banner">{error}</div>}<div className="admin-content">{activeTab === "Overview" && renderOverview()}{activeTab === "Programs" && renderPrograms()}{activeTab === "Impact" && renderImpact()}{activeTab === "Inquiries" && renderInquiries()}{activeTab === "Settings" && renderSettings()}</div></section></main>;
};

export default Admin;
