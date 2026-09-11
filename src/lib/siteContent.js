import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export const emptySiteContent = {
  id: "",
  full_name: "",
  job_title: "",
  bio_text: "",
  home_text: "",
  about_text: "",
  avatar_url: "",
  cv_url: "",
  email: "",
  address: "",
  phone: "",
  github_url: "",
  linkedin_url: "",
  facebook_url: "",
  instagram_url: "",
  whatsapp_url: "",
  services_text: "",
  contact_text: "",
  experience_text: "",
  projects_completed_text: "",
  happy_clients_text: "",
  site_name: "",
  home_heading: "",
  about_heading: "",
  services_heading: "What I do?",
  contact_heading: "",
  contact_left_heading: "",
  contact_right_heading: "",
  hero_eyebrow: "Development & Community Empowerment Organization",
  about_supporting_text: "",
  vision_text: "",
  mission_text: "",
  programs_heading: "Practical programs. Meaningful progress.",
  programs_text: "",
  impact_heading: "Creating opportunities. Building capacity. Inspiring change.",
  impact_text: "",
  partnerships_heading: "Let’s build the next chapter together.",
  partnerships_text: "",
  collaboration_heading: "Collaboration areas",
  collaboration_items: "",
  impact_youth: "320+",
  impact_women: "180+",
  impact_teachers: "200+",
  impact_communities: "15+",
  impact_partnerships: "12",
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
          setContent({
            ...emptySiteContent,
            ...legacyData,
            home_text: legacyData.bio_text || "",
            about_text: legacyData.bio_text || "",
          });
        }
        setIsLoading(false);
        return;
      }

      setContent({ ...emptySiteContent, ...data });
      setIsLoading(false);
    };

    fetchContent();
  }, []);

  return { content, error, isLoading };
};
