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
        .select(
          "id, full_name, job_title, site_name, home_heading, about_heading, services_heading, contact_heading, contact_left_heading, contact_right_heading, home_text, about_text, bio_text, avatar_url, cv_url, email, address, phone, linkedin_url, facebook_url, instagram_url, whatsapp_url, services_text, contact_text, experience_text, projects_completed_text, happy_clients_text",
        )
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

      setContent(data);
      setIsLoading(false);
    };

    fetchContent();
  }, []);

  return { content, error, isLoading };
};
