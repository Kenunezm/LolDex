import "./App.css";
import Header from "./components/Header";
import SummonerSection from "./components/SummonerSection";
import SummonerSectionMobile from "./components/SummonerSectionMobile";
import { SummonerProvider } from "./contexts/SummonerContext";
import { useBreakpointValue } from "@chakra-ui/react";

function App() {
  const isMobile = useBreakpointValue({ base: true, sm: true, md: false });

  return (
    <SummonerProvider>
      <Header />
      <main>{isMobile ? <SummonerSectionMobile /> : <SummonerSection />}</main>
    </SummonerProvider>
  );
}

export default App;
