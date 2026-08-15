import { BackgroundMusic } from "./components/common/BackgroundMusic";
import { EntranceReturnButton } from "./components/common/EntranceReturnButton";
import { AppRouter } from "./router";

export function App() {
  return (
    <>
      <AppRouter />
      <EntranceReturnButton />
      <BackgroundMusic />
    </>
  );
}
