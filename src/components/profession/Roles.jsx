import { useState } from "react";

const Roles = ({ role }) => {
  const [mouseHover, setMouseHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setMouseHover(true)}
      onMouseLeave={() => setMouseHover(false)}
      className="group p-6 xs:p-8 bg-white hover:shadow-xl h-auto shadow-gray-300 ease-out duration-500 rounded-lg my-6 flex relative overflow-hidden border border-transparent hover:border-picto-primary/20"
    >
      <p
        className={`bg-picto-primary absolute inset-s-0 top-0 w-0 h-full transition-all duration-300 ${mouseHover ? "w-1.5" : ""}`}
      />
      <div>
        <p className="text-xl sm:text-2xl font-semibold text-gray-900 pb-4">
          {role?.title}
        </p>
        <p className="text-[13px] sm:text-[16px] font-normal text-gray-700">
          {role?.description}
        </p>
      </div>
    </div>
  );
};

export default Roles;
