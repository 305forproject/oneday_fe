import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import { CardHeader } from "../../components/ui/card";

const Layout = () => {
  return (
    <div className="layout-container">
      <CardHeader />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
