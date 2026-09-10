import { useEffect, useState } from "react";
import {
  isAdminUser,
  isSupabaseConfigured,
  supabase,
} from "../../lib/supabase";
import AdminLogin from "./AdminLogin";
import Projects from "./Projects";
import UploadForm from "./UploadForm";
import card1 from "../../assets/images/portfolio-images/card-1.png";
import card2 from "../../assets/images/portfolio-images/card-2.png";
import card3 from "../../assets/images/portfolio-images/card-3.png";
import card4 from "../../assets/images/portfolio-images/card-4.png";
import card5 from "../../assets/images/portfolio-images/card-5.png";
import card6 from "../../assets/images/portfolio-images/card-6.png";

const fallbackProjects = [
  {
    id: "fallback-1",
    image: card1,
    category: "UI-UX DESIGN",
    title: "Product Admin Dashboard",
    description:
      "I focus on crafting smooth, responsive interfaces that balance aesthetic appeal with practical functionality.",
    link: "#!",
  },
  {
    id: "fallback-2",
    image: card2,
    category: "UI-UX DESIGN",
    title: "Product Admin Dashboard",
    description:
      "Designed an intuitive dashboard for product management, emphasizing clarity and user efficiency.",
    link: "#!",
  },
  {
    id: "fallback-3",
    image: card3,
    category: "UI-UX DESIGN",
    title: "Product Admin Dashboard",
    description:
      "Developed a modern admin panel with a focus on usability and seamless navigation for end users and so on.",
    link: "#!",
  },
  {
    id: "fallback-4",
    image: card4,
    category: "UI-UX DESIGN",
    title: "Product Admin Dashboard",
    description:
      "Created a responsive dashboard layout that adapts smoothly across devices and screen sizes and so on.",
    link: "#!",
  },
  {
    id: "fallback-5",
    image: card5,
    category: "UI-UX DESIGN",
    title: "Product Admin Dashboard",
    description:
      "Implemented interactive charts and widgets to visualize product data effectively for stakeholders.",
    link: "#!",
  },
  {
    id: "fallback-6",
    image: card6,
    category: "UI-UX DESIGN",
    title: "Product Admin Dashboard",
    description:
      "Enhanced user experience by streamlining workflows and optimizing interface components and so on.",
    link: "#!",
  },
];

const Portfolio = () => {
  const [projectData, setProjectData] = useState(fallbackProjects);
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
        setError(
          "Live projects are unavailable. Showing the portfolio preview.",
        );
        return;
      }

      if (data.length > 0) {
        setProjectData(
          data.map((project) => ({ ...project, image: project.image_url })),
        );
      }
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
