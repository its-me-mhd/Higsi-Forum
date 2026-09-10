import "./introduction.css";
import { useSiteContent } from "../../lib/siteContent";
import InformationSummary from "./InformationSummary";

const Introduction = () => {
  const { content } = useSiteContent();

  if (!content) return null;

  const stats = [
    { id: "experience", title: "Experience", description: content.experience_text },
    { id: "projects", title: "Projects completed", description: content.projects_completed_text },
    { id: "clients", title: "Happy clients", description: content.happy_clients_text },
  ].filter((item) => item.description);

  return (
    <div
      className="flex max-lg:flex-col-reverse sm:justify-between pt-10 lg:pt-31.5 lg:mb-27.5 max-xl:gap-2 p-2 max-xxl:px-4"
      id="introduction"
    >
      <div className="w-full flex flex-col justify-between max-lg:text-center">
        <div className="pt-13 me-31.5 w-full lg:w-auto transition-all duration-500">
          <p className="text-3xl xxs:text-4xl sm:max-xl:text-5xl xl:text-6xl font-semibold w-full">
            {content.full_name}
            <span className="text-nowrap shrink-0 inline-block w-full">
              {content.job_title}
            </span>
          </p>
          <p className="text-xs xxs:text-lg lg:text-[18px] my-6">
            {content.home_text}
          </p>
          <p className="text-center lg:text-start">
            <a
              className="btn-primary btn btn-xs xxs:btn-lg text-white"
              href="#contact"
            >
              Contact me
            </a>
          </p>
        </div>
        <div className="mx-auto lg:mx-0 relative">
          <div className="grid max-xxs:grid-flow-col grid-cols-3 w-fit mt-10 gap-1">
            {stats.map((item) => <InformationSummary key={item.id} item={item} />)}
          </div>
        </div>
      </div>
      <div
        className="max-w-134 w-full h-full max-lg:mx-auto aspect-[536/636] relative"
      >
        <img
          className={`shadow-2xl shadow-gray-200 w-full h-full absolute bottom-0 object-cover bg-white rounded-3xl`}
          src={content.avatar_url}
          alt={content.full_name}
        />
      </div>
    </div>
  );
};

export default Introduction;
