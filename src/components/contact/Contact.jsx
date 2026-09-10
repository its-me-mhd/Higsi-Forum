import Form from "./Form";
import SocialMedia from "../common/socialMedia/SocialMedia";
import { useSiteContent } from "../../lib/siteContent";
import {
  faEnvelope,
  faLocationDot,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import Address from "./Address";

const Contact = () => {
  const { content } = useSiteContent();

  if (!content) return null;

  return (
    <div className="relative -bottom-15 -mt-15 z-10 px-2">
      <div
        className="content p-4 md:p-10 lg:p-22 bg-white rounded-2xl shadow-[0px_0px_90px_9px_rgba(0,0,0,0.1)]"
        id="contact"
      >
        <div className="flex flex-col-reverse lg:gap-5 xl:gap-25.75 lg:flex-row justify-between">
          <div>
            <div>
              <p className="text-[35px] max-lg:hidden font-semibold text-nowrap text-[#132238]">
                {content.job_title}
              </p>
              <p className="text-[12px] xs:text-[14px] sm:text-lg md:text-lg max-lg:text-center pt-4 font-normal text-soft-dark">
                {content.contact_text}
              </p>
            </div>
            <div className="my-8.75 sm:max-lg:flex justify-between items-center">
              <Address
                item={{
                  icon: faLocationDot,
                  title: "Location",
                  description: content.address,
                }}
              />
              <Address
                item={{
                  icon: faEnvelope,
                  title: "Email",
                  description: content.email,
                }}
              />
              <Address
                item={{
                  icon: faPhone,
                  title: "Call me",
                  description: content.phone,
                }}
              />
            </div>
            <div className="w-full max-lg:text-center max-md:mb-4">
              <SocialMedia content={content} />
            </div>
          </div>
          <div className="w-full overflow-y-scroll py-6.5">
            <p className="text-xl mb-2 xs:text-2xl sm:text-2xl md:text-[38px] font-semibold text-[#132238] lg:hidden text-center">
              {content.job_title}
            </p>
            <Form content={content} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
