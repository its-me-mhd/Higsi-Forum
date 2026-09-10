import { useSiteContent } from "../../../lib/siteContent";

/* Footer nabLinks */
const navItems = [
  { id: 1, name: "Home", url: "Home" },
  { id: 2, name: "About", url: "About" },
  { id: 3, name: "Portfolio", url: "Portfolio" },
  { id: 4, name: "Contact", url: "Contact" },
];

const Footer = () => {
  const { content } = useSiteContent();

  return (
    <div className="pt-25 md:pt-40 content max-2xl:px-3">
      <div className="flex max-md:flex-col justify-between mx-0 items-center h-full w-full text-neutral-200">
        <a href="#" className="flex items-center border-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-picto-primary text-lg font-semibold text-white sm:h-14 sm:w-14 sm:text-2xl">
            {content?.full_name?.charAt(0)}
          </span>
          <p className="text-3xl sm:text-[32px] my-auto ms-3 font-semibold">
            {content?.full_name}
          </p>
        </a>
        <div className="mx-7 max-md:my-7 text-center">
          {navItems.map((item) => (
            <a
              key={item.id}
              className="mx-2 group inline-block relative w-fit text-[12px] sm:text-[16px]"
              href={`#${item.url.toLowerCase()}`}
            >
              {item.name}
              <span className="absolute left-0 bottom-0 h-0.5 w-full bg-white scale-x-0 duration-300 group-hover:scale-x-100"></span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Footer;
