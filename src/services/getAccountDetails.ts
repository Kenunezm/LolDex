const API_KEY = import.meta.env.VITE_API_KEY;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface Participant {
  puuid: string;
  win: boolean;
}

export const getSummonerDetails = async (puuid: string) => {
  try {
    const response = await fetch(
      `https://la2.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      { headers: { "X-Riot-Token": API_KEY } }
    );

    if (!response.ok)
      throw new Error("No se pudo obtener los detalles del invocador.");

    return await response.json();
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getRankedDetails = async (puuid: string) => {
  try {
    const response = await fetch(
      `https://la2.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`,
      { headers: { "X-Riot-Token": API_KEY } }
    );

    if (!response.ok)
      throw new Error("No se pudo obtener los detalles de las rankeds.");

    return await response.json();
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getMatchesDetails = async (puuid: string) => {
  try {
    const responseMatchesId = await fetch(
      `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20`,
      { headers: { "X-Riot-Token": API_KEY } }
    );

    if (!responseMatchesId.ok)
      throw new Error("No se pudo obtener el historial.");

    const matchesID: string[] = await responseMatchesId.json();

    const responseDetails = await Promise.all(
      matchesID.map(async (matchId: string, index: number) => {
        if (index > 0) {
          await sleep(1000);
        }

        const response = await fetch(
          `https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}`,
          { headers: { "X-Riot-Token": API_KEY } }
        );

        if (!response.ok)
          throw new Error(`No se pudo obtener el match ${matchId}`);

        return await response.json();
      })
    );

    return responseDetails.map((matchData) => {
      const participant = matchData.info.participants.find(
        (p: Participant) => p.puuid === puuid
      );

      if (!participant) {
        return {
          matchId: matchData.metadata.matchId,
          gameDuration: null,
          gameMode: null,
          isWin: null,
          championId: null,
          kills: null,
          deaths: null,
          assists: null,
          items: [],
        };
      }

      return {
        matchId: matchData.metadata.matchId,
        isWin: participant ? participant.win : null,
        gameDuration: matchData.info.gameDuration,
        gameMode:
          matchData.info.queueId === 420
            ? "Solo/Duo Ranked"
            : matchData.info.queueId === 440
            ? "Flex Ranked"
            : matchData.info.queueId === 400
            ? "Normal (Reclutamiento)"
            : matchData.info.queueId === 480
            ? "Normal (Partida Casual)"
            : matchData.info.queueId === 450
            ? "ARAM"
            : matchData.info.queueId === 1700
            ? "Arena"
            : matchData.info.queueId === 0
            ? "Personalizada"
            : matchData.info.queueId === 2000
            ? "Herramienta de Práctica"
            : "",
        championId: participant.championId,
        kills: participant.kills,
        deaths: participant.deaths,
        assists: participant.assists,
        items: [
          participant.item0,
          participant.item1,
          participant.item2,
          participant.item3,
          participant.item4,
          participant.item5,
          participant.item6,
        ],
      };
    });
    return responseDetails;
  } catch (err) {
    console.error(err);
    return [];
  }
};

const championCache: { [key: number]: string | null } = {};

export const getChampionName = async (championId: number) => {
  if (championCache[championId]) {
    return championCache[championId];
  }

  try {
    const response = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/15.6.1/data/en_US/champion.json`
    );
    if (!response.ok) {
      throw new Error("No se pudo obtener la data de campeones.");
    }
    const data = await response.json();
    const dataChampions = data.data;

    for (const champ in dataChampions) {
      if (dataChampions[champ].key === championId.toString()) {
        const championName = dataChampions[champ].id;
        championCache[championId] = championName;

        return championName;
      }
    }
    return null;
  } catch (err) {
    console.error(err);
  }
};
