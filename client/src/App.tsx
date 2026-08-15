import { BackgroundMusic } from "./components/common/BackgroundMusic";
import { AppRouter } from "./router";

export function App() {
  return (
    <>
      <AppRouter />
      <BackgroundMusic />
    </>
  );
}
