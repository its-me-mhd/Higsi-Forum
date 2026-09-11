import { useEffect, useState } from "react";
import emailjs from "@emailjs/browser";
import { supabase } from "../lib/supabase";
import { emptySiteContent, useSiteContent } from "../lib/siteContent";

const focusAreas = [
  "Education",
  "Skills Development",
  "Youth Empowerment",
  "Women Empowerment",
  "Leadership",
  "Community Development",
];

const defaultPrograms = [
  {
    number: "01",
    title: "Youth Empowerment & Skills Development",
    text: "Practical pathways to confidence, employability, leadership, communication, entrepreneurship, and career readiness.",
    tags: "Life skills · Public speaking · CV & interview skills",
  },
  {
    number: "02",
    title: "Women Empowerment",
    text: "Inclusive development programs that strengthen personal growth, digital confidence, financial awareness, and business capacity.",
    tags: "Business skills · Leadership · Digital skills",
  },
  {
    number: "03",
    title: "Teacher Training & Professional Development",
    text: "Relevant, classroom-ready learning for educators who want to improve teaching quality and support every learner.",
    tags: "Active learning · AI in education · Safeguarding",
  },
  {
    number: "04",
    title: "Education & Capacity Building",
    text: "Workshops and training-of-trainers programs that turn knowledge into capability across institutions and communities.",
    tags: "Academic skills · Educational leadership · Community education",
  },
  {
    number: "05",
    title: "Leadership & Personal Development",
    text: "Human-centered development for people ready to lead with self-awareness, resilience, good judgment, and purpose.",
    tags: "Emotional intelligence · Decision making · Conflict management",
  },
  {
    number: "06",
    title: "Community Development",
    text: "Locally grounded initiatives that build participation, awareness, resilience, innovation, and shared ownership.",
    tags: "Youth participation · Women participation · Local innovation",
  },
  {
    number: "07",
    title: "Entrepreneurship & Innovation",
    text: "A practical space for new ideas, business capacity, and economic opportunities, especially for youth and women.",
    tags: "Ideas · Business capacity · Economic opportunity",
  },
];

const defaultImpactItems = [
  ["320+", "Youth trained and empowered"],
  ["180+", "Women reached through capacity building"],
  ["200+", "Teachers supported through development"],
  ["15+", "Communities engaged in initiatives"],
  ["12", "Partnerships with local stakeholders"],
];

const Home = () => {
  const { content: savedContent } = useSiteContent();
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [programs, setPrograms] = useState(defaultPrograms);
  const content = { ...emptySiteContent, ...savedContent };
  const impactItems =
    Array.isArray(content.impact_items) && content.impact_items.length
      ? content.impact_items.map((item) => [item.metric, item.label])
      : defaultImpactItems;

  useEffect(() => {
    if (!supabase) return undefined;
    supabase
      .from("services")
      .select("id, title, description, sort_order")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data?.length) {
          setPrograms(
            data.map((item, index) => ({
              number: String(index + 1).padStart(2, "0"),
              title: item.title,
              text: item.description,
              tags: "Community-led learning · Practical skills",
            })),
          );
        }
      });
    return undefined;
  }, []);

  const handleContactSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setIsSending(true);
    setSubmitted(false);
    setSendError("");

    try {
      const formData = new FormData(form);
      const templateParams = Object.fromEntries(formData.entries());
      templateParams.to_email = import.meta.env.VITE_ADMIN_EMAIL;
      templateParams.user_name = templateParams.from_name;
      templateParams.user_email = templateParams.reply_to;
      templateParams.user_phone = templateParams.phone;
      templateParams.user_message = templateParams.message;
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      );
      form.reset();
      setSubmitted(true);
    } catch (error) {
      const errorText = [
        error?.text,
        error?.message,
        error?.status ? `EmailJS status ${error.status}.` : "",
      ]
        .filter(Boolean)
        .join(" ");
      setSendError(
        errorText.toLowerCase().includes("invalid grant")
          ? "Email delivery is temporarily unavailable. Please reconnect the Gmail account in EmailJS, then try again."
          : errorText || "Your message could not be sent. Please try again.",
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="higsi-site">
      <header className="site-header">
        <div className="site-container header-inner">
          <a className="brand" href="#home" onClick={() => setMenuOpen(false)}>
            <span className="brand-mark">H</span>
            <span>
              <strong>Higsi</strong> Forum
            </span>
          </a>
          <button
            className="menu-toggle"
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            ☰
          </button>
          <nav className={`site-nav ${menuOpen ? "is-open" : ""}`}>
            {[
              "Home",
              "About Us",
              "Programs",
              "Our Impact",
              "Partnerships",
              "Contact Us",
            ].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replaceAll(" ", "-")}`}
                onClick={() => setMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <a
              className="nav-cta"
              href="#contact-us"
              onClick={() => setMenuOpen(false)}
            >
              Partner with us
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero-section" id="home">
          <div className="site-container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">{content.hero_eyebrow}</p>
              <h1>{content.hero_heading}</h1>
              <p className="hero-text">{content.hero_text}</p>
              <div className="hero-actions">
                <a className="button button-primary" href="#programs">
                  Explore our programs <span>↗</span>
                </a>
                <a className="button button-quiet" href="#about-us">
                  About Higsi Forum
                </a>
              </div>
              <div className="hero-note">
                <span className="note-line" /> {content.hero_note}
              </div>
            </div>
            <div
              className="hero-visual"
              aria-label="Higsi Forum community development illustration"
            >
              <div className="visual-orbit orbit-one" />
              <div className="visual-orbit orbit-two" />
              <div className={`visual-card visual-main ${content.logo_url ? "has-custom-logo" : ""}`}>
                {content.logo_url ? (
                  <img className="visual-logo" src={content.logo_url} alt="Higsi Forum" />
                ) : (
                  <span>H</span>
                )}
                {!content.logo_url && <><strong>People first.</strong><small>Progress together.</small></>}
              </div>
              <div className="visual-card visual-stat">
                <strong>7</strong>
                <small>focus areas</small>
              </div>
              <div className="visual-card visual-quote">
                “Change begins when people have the opportunity to lead it.”
              </div>
            </div>
          </div>
          <div className="site-container focus-strip">
            <span>Our focus</span>
            {focusAreas.map((area) => (
              <span key={area}>{area}</span>
            ))}
          </div>
        </section>

        <section className="section about-section" id="about-us">
          <div className="site-container about-grid">
            <div>
              <p className="eyebrow">01 / About us</p>
              <h2>{content.about_section_heading}</h2>
            </div>
            <div className="about-body">
              <p className="lead">{content.about_text}</p>
              <p>{content.about_text_secondary}</p>
              <div className="principles">
                <div>
                  <strong>Our vision</strong>
                  <p>{content.vision_text}</p>
                </div>
                <div>
                  <strong>Our mission</strong>
                  <p>{content.mission_text}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="site-container founder-row">
            <div className="founder-avatar">
              {content.founder_name?.charAt(0) || "N"}
            </div>
            <div>
              <p className="eyebrow">Leadership profile</p>
              <h3>
                {content.founder_name} <span>{content.founder_role}</span>
              </h3>
              <p>{content.founder_bio}</p>
            </div>
          </div>
        </section>

        <section className="section programs-section" id="programs">
          <div className="site-container">
            <div className="section-heading">
              <div>
                <p className="eyebrow">02 / Programs</p>
                <h2>{content.programs_section_heading}</h2>
              </div>
              <p>{content.programs_section_text}</p>
            </div>
            <div className="program-grid">
              {programs.map((program) => (
                <article className="program-card" key={program.number}>
                  <span className="program-number">{program.number}</span>
                  <h3>{program.title}</h3>
                  <p>{program.text}</p>
                  <small>{program.tags}</small>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="impact-section" id="our-impact">
          <div className="site-container">
            <div className="section-heading impact-heading">
              <div>
                <p className="eyebrow">03 / Our impact</p>
                <h2>{content.impact_section_heading}</h2>
              </div>
              <p>{content.impact_section_text}</p>
            </div>
            <div className="impact-grid">
              {impactItems.map(([metric, label]) => (
                <div className="impact-item" key={label}>
                  <strong>{metric}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section partnership-section" id="partnerships">
          <div className="site-container partnership-grid">
            <div>
              <p className="eyebrow">04 / Partnerships</p>
              <h2>{content.partnerships_heading}</h2>
              <p className="lead">{content.partnerships_text}</p>
              <a className="button button-primary" href="#contact-us">
                Partner with Higsi Forum <span>↗</span>
              </a>
            </div>
            <div className="collaboration-list">
              <p>{content.collaboration_heading}</p>
              {content.collaboration_items
                .split("\n")
                .filter(Boolean)
                .map((area) => (
                  <div key={area}>
                    <span>✓</span>
                    {area}
                  </div>
                ))}
            </div>
          </div>
        </section>

        <section className="section contact-section" id="contact-us">
          <div className="site-container contact-grid">
            <div>
              <p className="eyebrow">05 / Contact us</p>
              <h2>{content.contact_display_heading}</h2>
              <p className="lead">{content.contact_display_text}</p>
              <div className="contact-details">
                <p>
                  <small>Email</small>
                  <a href={`mailto:${content.email}`}>{content.email}</a>
                </p>
                <p>
                  <small>Phone</small>
                  <span>{content.phone}</span>
                </p>
                <p>
                  <small>Location</small>
                  <span>{content.address}</span>
                </p>
              </div>
            </div>
            <form className="contact-form" onSubmit={handleContactSubmit}>
              <div className="form-row">
                <label>
                  Full name
                  <input name="from_name" required placeholder="Your name" />
                </label>
                <label>
                  Organization
                  <input name="organization" placeholder="Organization name" />
                </label>
              </div>
              <div className="form-row">
                <label>
                  Email address
                  <input
                    name="reply_to"
                    required
                    type="email"
                    placeholder="you@example.com"
                  />
                </label>
                <label>
                  Phone number
                  <input name="phone" placeholder="+252 ..." />
                </label>
              </div>
              <label>
                Subject
                <input
                  name="subject"
                  required
                  placeholder="How can we collaborate?"
                />
              </label>
              <label>
                Message
                <textarea
                  name="message"
                  required
                  rows="5"
                  placeholder="Tell us a little about your idea..."
                />
              </label>
              {sendError && <p className="form-error">{sendError}</p>}
              <button
                className="button button-primary"
                type="submit"
                disabled={isSending}
              >
                {isSending
                  ? "Sending..."
                  : submitted
                    ? "Message sent"
                    : "Send message"}{" "}
                <span>↗</span>
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-container footer-grid">
          <div>
            <a className="brand" href="#home">
              <span className="brand-mark">H</span>
              <span>
                <strong>Higsi</strong> Forum
              </span>
            </a>
            <p>
              Empowering communities,
              <br />
              building sustainable futures.
            </p>
          </div>
          <div>
            <p className="footer-label">Explore</p>
            <a href="#about-us">About us</a>
            <a href="#programs">Programs</a>
            <a href="#our-impact">Our impact</a>
            <a href="#partnerships">Partnerships</a>
          </div>
          <div>
            <p className="footer-label">Focus areas</p>
            <span>Youth · Women · Education</span>
            <span>Skills · Leadership · Community</span>
          </div>
        </div>
        <div className="site-container footer-bottom">
          <span>© 2026 Higsi Forum. All rights reserved.</span>
          <span>Development & Community Empowerment Organization</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;
