import { createContext, ReactNode, useContext, useState } from "react";

interface summonerData {
  puuid: string;
  gameName: string;
  tagLine: string;
  iconId: string;
}

interface SummonerContextProps {
  setSummonerData: (data: summonerData | null) => void;
  summonerData: summonerData | null;
}

const SummonerContext = createContext<SummonerContextProps | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useSummoner = () => {
  const context = useContext(SummonerContext);
  if (!context) {
    throw new Error("useSummoner must be used within a SummonerProvider");
  }
  return context;
};

export const SummonerProvider = ({ children }: { children: ReactNode }) => {
  const [summonerData, setSummonerData] = useState<summonerData | null>(null);

  return (
    <SummonerContext.Provider value={{ summonerData, setSummonerData }}>
      {children}
    </SummonerContext.Provider>
  );
};
