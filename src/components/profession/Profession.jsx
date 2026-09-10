import { useEffect, useState } from "react";
import Roles from "./Roles";
import { supabase } from "../../lib/supabase";
import { useSiteContent } from "../../lib/siteContent";
import { scrollToSection } from "../../lib/scrollToSection";

const Profession = () => {
  const { content } = useSiteContent();
  const [services, setServices] = useState([]);

  useEffect(() => {
    if (!supabase) return;

    supabase
      .from("services")
      .select("id, title, description")
      .order("sort_order", { ascending: true })
      .then(({ data }) => setServices(data || []));
  }, []);

  if (!content) return null;

  return (
    <div
      className="content grid md:grid-cols-2 max-xxl:px-4 xxl:px-2 py-10 md:py-15 lg:py-37.5"
      id="services"
    >
      <div className="flex flex-col justify-between h-fit md:pe-8 lg:pe-35.75 max-md:text-center my-auto">
        <p className="section-title max-md:text-center">Services</p>
        <div className="mt-6 text-[14px]">
          <p className="text-xs sm:text-lg font-normal text-gray-400 mb-4">
            {content.services_text}
          </p>
          <p className="text-xs sm:text-lg font-normal text-gray-400">
            {content.about_text}
          </p>
        </div>
        <a
          href="#contact"
          onClick={(event) => scrollToSection(event, "contact")}
          className="mt-5 md:mt-12.5 btn btn-primary text-white w-fit md:py-3 md:px-6 text-[12px] sm:text-[16px] font-semibold max-md:mx-auto max-md:mb-5"
        >
          Contact me
        </a>
      </div>
      <div className="">
        {services.map((service) => (
          <Roles role={service} key={service.id} />
        ))}
      </div>
    </div>
  );
};

export default Profession;
