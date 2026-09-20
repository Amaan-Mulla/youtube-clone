import { useState } from "react";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";

function AppLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  function handleSidebarToggle() {
    setIsSidebarOpen((previousState) => !previousState);
  }

  return (
    <>
      <Header
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={handleSidebarToggle}
      />

      <div
        className={`app-layout ${
          isSidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
        <Sidebar isOpen={isSidebarOpen} />

        <main className="app-content">{children}</main>
      </div>
    </>
  );
}

export default AppLayout;