import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import SocialMedia from "../common/socialMedia/SocialMedia";
import { useSiteContent } from "../../lib/siteContent";

const Profile = () => {
  const { content: profile } = useSiteContent();

  if (!profile) return null;

  const bioParagraphs = profile.about_text.split(/\n\s*\n/).filter(Boolean);

  return (
    <>
      <div
        className="relative mx-4 xxl:mx-0.5 -bottom-20 lg:-bottom-28 z-10 rounded-2xl bg-white drop-shadow-2xl max-xl:mb-5 shadow-white xl:p-28 lg:p-20 md:p-16 sm:p-10 p-4"
        id="profile"
      >
        <div className="flex max-md:flex-col justify-between items-center gap-6">
          {/* Profile image */}
          <div className="xxl:max-w-106 w-auto h-auto xxl:max-h-126">
            <div className="max-w-106 h-117 object-fill overflow-hidden rounded-xl">
              <img
                className="bg-soft-white h-[120%] object-cover"
                src={profile.avatar_url}
                alt={profile.full_name}
              />
            </div>
            {/* Social media section */}
            <div className="relative bottom-9">
              <div className="flex justify-center">
                <div className="px-6 max-w-66 py-3 z-50 text-center bg-white rounded-sm center shadow-2xl drop-shadow-2xl shadow-white">
                  <SocialMedia content={profile} />
                </div>
              </div>
            </div>
          </div>

          <div className="max-sm:w-full w-132">
            <p className="mb-3 text-lg text-gray-500 max-md:text-center">
                {profile.full_name}
            </p>
            <h2 className="text-2xl xxs:text-3xl sm:text-4xl lg:text-[38px] text-[min(24px,38px)] max-md:text-center font-semibold mb-8">
              {profile.job_title}
            </h2>
            <div className="text-xs xs:text-[16px] lg:text-lg font-normal max-md:text-center text-gray-600">
              {bioParagraphs.map((paragraph) => (
                <p className="mt-3 first:mt-0" key={paragraph}>
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="mt-8 flex max-md:justify-center">
              <a
                className="btn xxs:btn-lg px-6 max-xs:px-2 xxs:py-3 btn-primary text-xs xxs:text-[14px] sm:text-[16px]"
                href="#services"
              >
                My Services
              </a>
              <a
                className="btn xxs:btn-lg px-6 max-xs:px-2 xxs:py-3 hover:border-picto-primary bg-white duration-300 transition-all hover:text-picto-primary ms-4 text-xs xxs:text-[14px] sm:text-[16px]"
                href={profile.cv_url}
                target="_blank"
                rel="noreferrer"
              >
                <FontAwesomeIcon icon={faDownload} /> Download CV
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
