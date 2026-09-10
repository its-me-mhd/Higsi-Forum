import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export const emptySiteContent = {
  id: "",
  full_name: "",
  job_title: "",
  bio_text: "",
  avatar_url: "",
  cv_url: "",
  email: "",
  github_url: "",
  linkedin_url: "",
};

export const useSiteContent = () => {
  const [content, setContent] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) return;

    const fetchContent = async () => {
      const { data, error: fetchError } = await supabase
        .from("site_content")
        .select(
          "id, full_name, job_title, bio_text, avatar_url, cv_url, email, github_url, linkedin_url",
        )
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      setContent(data);
    };

    fetchContent();
  }, []);

  return { content, error };
};