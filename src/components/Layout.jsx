import Sidebar from "@/components/Sidebar";

const Layout = ({ children }) => (
  <div className="flex min-h-screen">
    <Sidebar />
    <main className="ml-64 flex-1 bg-[#F8FAFC] min-h-screen overflow-x-hidden">
      {children}
    </main>
  </div>
);

export default Layout;
