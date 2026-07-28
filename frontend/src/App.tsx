import { Toaster } from "react-hot-toast";
import { LibraryPage } from "@/components/layout/LibraryPage";
import { Navbar } from "@/components/layout/Navbar";
import { useSyncThemeClass } from "@/hooks/useSyncThemeClass";

function App() {
  useSyncThemeClass();

  return (
    <div className="min-h-screen bg-paper-50 dark:bg-ink-950">
      <Navbar />
      <LibraryPage />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "var(--color-ink-900)",
            color: "var(--color-ink-50)",
            fontSize: "14px",
          },
        }}
      />
    </div>
  );
}

export default App;
