import Introduction from "../components/introduction/Introduction";
import Profile from "../components/profile/Profile";
import WorkTogether from "../components/workTogether/WorkTogether";
import Profession from "../components/profession/Profession";
import Contact from "../components/contact/Contact";
import "../../index.css";

const Home = () => {
  return (
    <div className="relative">
      <div className="introduction-profile-background">
        <div className="content">
          <Introduction />
          <Profile />
        </div>
      </div>
      <Profession />
      <div className="bg-gray-900">
        <WorkTogether />
      </div>
      <Contact />
    </div>
  );
};

export default Home;
