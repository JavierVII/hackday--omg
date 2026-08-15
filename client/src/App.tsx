import { useState } from "react";
import SceneLoadingPage from "./pages/SceneLoadingPage";
import ExplorePage from "./pages/ExplorePage";
import "./App.css";

export default function App() {
  const [entered, setEntered] = useState(false);
  return (
    <div className="stage">
      <div className="phone-frame">
        {entered ? (
          <ExplorePage />
        ) : (
          <SceneLoadingPage sceneName="乌龟潭实景" onDone={() => setEntered(true)} />
        )}
      </div>
    </div>
  );
}
