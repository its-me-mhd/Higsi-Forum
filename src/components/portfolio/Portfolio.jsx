import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Projects from "./Projects";

const Portfolio = () => {
  const [projectData, setProjectData] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) return;

    const fetchProjects = async () => {
      const { data, error: fetchError } = await supabase
        .from("projects")
        .select("id, image_url, category, title, description, link")
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      setProjectData(
        data.map((project) => ({ ...project, image: project.image_url })),
      );
    };

    fetchProjects();
  }, []);

  return (
    <div
      className="content mt-10 md:mt-15 xl:mt-25 mb-10 md:mb-25 max-xxl:p-2"
      id="portfolio"
    >
      <div className="xl:mb-17.5 mb-5">
        <div className="max-sm:px-2 text-center mx-auto max-w-144.25">
          <p className="section-title ">Portfolio</p>
          <p className="font-normal text-[18px] max-sm:text-[14px] pt-6 text-gray-400">
            Here's a selection of my recent work, showcasing my skills in
            creating user-centric and visually appealing interfaces.
          </p>
        </div>
      </div>
      {error && (
        <p className="mb-6 text-center text-sm text-red-600">{error}</p>
      )}
      <div className="mx-auto flex justify-center">
        <div className="grid xl:grid-cols-3 md:grid-cols-2 gap-6">
          {projectData.map((data) => (
            <Projects
              data={{ ...data, image: data.image_url, link: data.project_url }}
              key={data.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
