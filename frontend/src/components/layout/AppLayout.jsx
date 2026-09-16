import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";

function AppLayout({ children }) {
  return (
    <>
      <Header />
      <div className="app-layout">
        <Sidebar />
        <main className="app-content">{children}</main>
      </div>
    </>
  );
}

export default AppLayout;
