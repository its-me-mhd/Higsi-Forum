import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export const emptySiteContent = {
  id: "",
  full_name: "Higsi Forum",
  job_title: "Development & Community Empowerment Organization",
  bio_text: "",
  home_text:
    "Welcome to Higsi Forum. We create educational opportunities, professional training, leadership development, entrepreneurship programs, and community-based initiatives that drive sustainable change.",
  about_text:
    "Higsi Forum is a development and community empowerment organization working to create educational opportunities, skills development, leadership enhancement, and support for community initiatives.",
  avatar_url: "",
  cv_url: "",
  email: "info@higsiforum.org",
  address: "Somalia",
  phone: "+252 [Phone Number]",
  github_url: "",
  linkedin_url: "",
  facebook_url: "",
  instagram_url: "",
  whatsapp_url: "",
  services_text:
    "Our programs respond to real community needs with learning that is relevant, inclusive, and designed to move people from possibility to action.",
  contact_text:
    "Have a project idea, partnership opportunity, training request, or question? We would be happy to hear from you.",
  experience_text: "",
  projects_completed_text: "",
  happy_clients_text: "",
  site_name: "Higsi Forum",
  home_heading: "Empowering communities, building sustainable futures.",
  about_heading: "Knowledge becomes powerful when communities can use it.",
  services_heading: "What I do?",
  contact_heading: "",
  contact_left_heading: "",
  contact_right_heading: "",
  logo_url: "",
  hero_eyebrow: "Development & Community Empowerment Organization",
  hero_heading: "Empowering communities, building sustainable futures.",
  hero_text:
    "Welcome to Higsi Forum. We create educational opportunities, professional training, leadership development, entrepreneurship programs, and community-based initiatives that drive sustainable change.",
  hero_note: "Rooted in people. Designed for lasting impact.",
  about_section_heading:
    "Knowledge becomes powerful when communities can use it.",
  about_text_secondary:
    "We believe a progressive society requires individuals equipped with knowledge, skills, confidence, creativity, and the power to make impactful decisions.",
  vision_text:
    "A skilled, empowered, resilient, and inclusive society where individuals and communities build sustainable futures.",
  mission_text:
    "To empower communities through inclusive education, capacity building, innovation, leadership, and sustainable initiatives.",
  founder_name: "Nadiira Abdirisak Jama",
  founder_role: "Founder & Chairperson",
  founder_bio:
    "With a background in Educational Management and Planning, Nadiira brings experience in education, training, capacity building, youth and women empowerment, leadership, and community development.",
  founder_image_url: "",
  programs_section_heading: "Practical programs. Meaningful progress.",
  programs_section_text:
    "Our programs respond to real community needs with learning that is relevant, inclusive, and designed to move people from possibility to action.",
  impact_section_heading:
    "Creating opportunities. Building capacity. Inspiring change.",
  impact_section_text:
    "Higsi Forum does not just provide training; we create opportunities that help people learn, grow, connect, build ideas, and turn them into action.",
  impact_youth: "320+",
  impact_women: "180+",
  impact_teachers: "200+",
  impact_communities: "15+",
  impact_partnerships: "12",
  impact_items: [],
  partnerships_heading: "Let’s build the next chapter together.",
  partnerships_text:
    "Higsi Forum welcomes partnerships with NGOs, development organizations, government institutions, universities, private-sector organizations, donors, and community stakeholders committed to meaningful impact.",
  collaboration_heading: "Collaboration areas",
  collaboration_items:
    "Project partnerships\nTraining partnerships\nCommunity development initiatives\nResearch and education programs\nYouth and women empowerment projects\nCapacity-building projects\nConsultancy and technical support\nJoint programs and events",
  contact_display_heading: "Have an idea? Let’s talk.",
  contact_display_text:
    "Have a project idea, partnership opportunity, training request, or question? We would be happy to hear from you.",
};

export const useSiteContent = () => {
  const [content, setContent] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const fetchContent = async () => {
      const { data, error: fetchError } = await supabase
        .from("site_content")
        .select("*")
        .limit(1)
        .maybeSingle();

      const mergeContent = (source) =>
        Object.fromEntries(
          Object.entries(emptySiteContent).map(([key, fallback]) => [
            key,
            source?.[key] ?? fallback,
          ]),
        );

      if (fetchError) {
        const { data: legacyData, error: legacyError } = await supabase
          .from("site_content")
          .select(
            "id, full_name, job_title, bio_text, avatar_url, cv_url, email, linkedin_url",
          )
          .limit(1)
          .maybeSingle();

        if (legacyError) setError(fetchError.message);
        else if (legacyData) {
          setContent(
            mergeContent({
              ...legacyData,
              home_text: legacyData.bio_text || emptySiteContent.home_text,
              about_text: legacyData.bio_text || emptySiteContent.about_text,
            }),
          );
        }
        setIsLoading(false);
        return;
      }

      setContent(mergeContent(data));
      setIsLoading(false);
    };

    fetchContent();
  }, []);

  return { content, error, isLoading };
};
