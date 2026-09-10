import Introduction from "../components/introduction/Introduction";
import Profile from "../components/profile/Profile";
import WorkTogether from "../components/workTogether/WorkTogether";
import Profession from "../components/profession/Profession";
import Contact from "../components/contact/Contact";
import { useSiteContent } from "../lib/siteContent";
import "../../index.css";

const Home = () => {
  const { content, error, isLoading } = useSiteContent();

  if (isLoading) {
    return <main className="min-h-screen bg-white" />;
  }

  if (!content) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white p-8 text-center">
        <p className="max-w-lg text-gray-600">
          {error ||
            "Add your site content in the admin dashboard to publish the website."}
        </p>
      </main>
    );
  }

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
