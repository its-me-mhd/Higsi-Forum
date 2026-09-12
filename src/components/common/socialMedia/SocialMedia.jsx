import {
  faFacebook,
  faInstagram,
  faLinkedin,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const SocialMedia = ({ content }) => {
  const socialIcons = [
    { icon: faFacebook, link: content.facebook_url, label: "Facebook" },
    { icon: faInstagram, link: content.instagram_url, label: "Instagram" },
    { icon: faWhatsapp, link: content.whatsapp_url, label: "WhatsApp" },
    { icon: faLinkedin, link: content.linkedin_url, label: "LinkedIn" },
  ].filter((item) => item.link);

  return socialIcons.map((item) => (
    <a
      href={item.link}
      aria-label={item.label}
      target="_blank"
      rel="noreferrer"
      className={`text-picto-primary hover:bg-picto-primary p-2 pt-3 xs:p-2.5 xs:pt-3.75 sm:pt-4 md:pt-5 sm:p-3 md:p-3.75 hover:text-white rounded-md`}
      key={item.label}
    >
      <FontAwesomeIcon
        icon={item.icon}
        className={`text-xl w-4.5 aspect-square`}
      />
    </a>
  ));
};

export default SocialMedia;
