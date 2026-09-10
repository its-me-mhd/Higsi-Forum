import { useEffect, useState } from "react";
import {
  isAdminUser,
  isSupabaseConfigured,
  supabase,
} from "../../lib/supabase";
import AdminLogin from "./AdminLogin";
import Projects from "./Projects";
import UploadForm from "./UploadForm";

const Portfolio = () => {
  const [projectData, setProjectData] = useState([]);
  const [adminUser, setAdminUser] = useState(null);
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

  useEffect(() => {
    if (!supabase) return;

    let isMounted = true;

    const loadAdminUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (isMounted) setAdminUser(isAdminUser(data.user) ? data.user : null);
    };

    loadAdminUser();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user || null;
      if (isMounted) setAdminUser(isAdminUser(user) ? user : null);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
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
      {adminUser && (
        <UploadForm
          adminUser={adminUser}
          onUploaded={(project) =>
            setProjectData((projects) => [
              { ...project, image: project.image_url },
              ...projects,
            ])
          }
        />
      )}
      {error && (
        <p className="mb-6 text-center text-sm text-red-600">{error}</p>
      )}
      <div className="mx-auto flex justify-center">
        <div className="grid xl:grid-cols-3 md:grid-cols-2 gap-6">
          {projectData.map((data) => (
            <Projects data={data} key={data.id} />
          ))}
        </div>
      </div>
      <AdminLogin
        adminUser={adminUser}
        onAuthenticated={(user) =>
          setAdminUser(isAdminUser(user) ? user : null)
        }
      />
      <div className="text-center">
        <a
          href="#!"
          className="btn btn-primary py-3 px-6 mt-12.5 text-center text-[16px] font-semibold"
        >
          More Project
        </a>
      </div>
      {!isSupabaseConfigured && (
        <p className="mb-6 text-center text-sm text-gray-500">
          Supabase is not configured yet. Add the values from your Supabase
          project to .env.local.
        </p>
      )}
    </div>
  );
};

export default Portfolio;
