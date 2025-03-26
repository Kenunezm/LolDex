import { useSummoner } from "@/contexts/SummonerContext";
import "@fontsource/bebas-neue/400.css";

import {
  getMatchesDetails,
  getRankedDetails,
  getSummonerDetails,
  getChampionName,
} from "@/services/getAccountDetails";
import {
  Card,
  Box,
  VStack,
  Heading,
  HStack,
  Image,
  Grid,
  Skeleton,
  IconButton,
  SkeletonCircle,
} from "@chakra-ui/react";
import { PieChart, Pie, Cell } from "recharts";
import { useState, useEffect } from "react";
import { MdArrowForward, MdArrowBack } from "react-icons/md";

interface SummonerDetails {
  gameName: string;
  tagLine: string;
  puuid: string;
}

interface MatchesDetails {
  matchId: string;
  isWin: boolean | false;
  gameDuration: number | 0;
  gameMode: string | "";
  championId: number | 0;
  kills: number | 0;
  deaths: number | 0;
  assists: number | 0;
  items: number[];
}

interface RankDetails {
  tier: string;
  rank: string;
  wins: number;
  losses: number;
  totalGames: number;
  winrate: number;
  iconId: string;
  summonerLevel: string;
  matches: MatchesDetails[];
}

function SummonerSectionMobile() {
  const { summonerData } = useSummoner();

  const [summonerDetails, setSummonerDetails] = useState<SummonerDetails>({
    gameName: "",
    tagLine: "",
    puuid: "",
  });

  const [rankDetails, setRankDetails] = useState<RankDetails>({
    tier: "",
    rank: "",
    wins: 0,
    losses: 0,
    totalGames: 0,
    winrate: 0,
    iconId: "",
    summonerLevel: "",
    matches: [],
  });

  const [startIndex, setStartIndex] = useState(0);
  const [championNames, setChampionNames] = useState<{ [key: number]: string }>(
    {}
  );

  const data02 = [
    { name: "Wins", value: rankDetails.wins },
    { name: "Losses", value: rankDetails.losses },
  ];

  useEffect(() => {
    if (summonerData) {
      setSummonerDetails({
        gameName: summonerData.gameName,
        tagLine: summonerData.tagLine,
        puuid: summonerData.puuid,
      });
      setStartIndex(0);
    }
  }, [summonerData]);

  useEffect(() => {
    const fetchRankDetails = async () => {
      try {
        if (summonerDetails.puuid) {
          const detailsRanked = await getRankedDetails(summonerDetails.puuid);
          const detailsAccount = await getSummonerDetails(
            summonerDetails.puuid
          );
          const detailsMatches = await getMatchesDetails(summonerDetails.puuid);
          const calculatedWinrate =
            (detailsRanked[0].wins /
              (detailsRanked[0].wins + detailsRanked[0].losses)) *
            100;
          setRankDetails({
            tier: detailsRanked[0].tier,
            rank: detailsRanked[0].rank,
            wins: detailsRanked[0].wins,
            losses: detailsRanked[0].losses,
            totalGames: detailsRanked[0].wins + detailsRanked[0].losses,
            winrate: calculatedWinrate,
            iconId: detailsAccount.profileIconId,
            summonerLevel: detailsAccount.summonerLevel,
            matches: detailsMatches,
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchRankDetails();
  }, [summonerDetails.puuid]);

  useEffect(() => {
    const fetchChampionNames = async () => {
      try {
        const newChampionNames: { [key: number]: string } = {};
        for (const match of rankDetails.matches) {
          if (match.championId && !newChampionNames[match.championId]) {
            const championName = await getChampionName(match.championId);
            if (championName) {
              newChampionNames[match.championId] = championName;
            }
          }
        }
        setChampionNames((prevState) => ({
          ...prevState,
          ...newChampionNames,
        }));
      } catch (err) {
        console.error(err);
      }
    };
    if (rankDetails.matches.length > 0) {
      fetchChampionNames();
    }
  }, [rankDetails.matches]);

  const handleNext = () => {
    if (startIndex + 3 < rankDetails.matches.length) {
      setStartIndex(startIndex + 1);
    }
  };

  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  return (
    <VStack minWidth="100%" minHeight="100%" pt="10%" display="flex">
      <Box pt="3vh">
        <Card.Root
          width="100vw"
          height="100%"
          overflow="hidden"
          bgColor="#121212   "
          border="none"
        >
          <Card.Header pb={10}>
            <VStack gap={12}>
              <VStack gap={10} alignItems="center">
                <Grid alignItems="center">
                  <Heading
                    size="3xl"
                    fontFamily="Bebas Neue"
                    color="#FFFFFF"
                    textAlign="start"
                  >
                    {rankDetails.tier ? (
                      `${summonerDetails.gameName}#${summonerDetails.tagLine}`
                    ) : (
                      <Skeleton height="4vh" width="80vw" borderRadius="md" />
                    )}
                  </Heading>
                </Grid>

                {/* Tier y Range mas Icono de Tier */}
                <HStack
                  gap={2}
                  bgColor="#2C2C2C "
                  width="90vw"
                  borderRadius="sm"
                >
                  <Image
                    borderRadius="md"
                    objectFit="cover"
                    width="20vw"
                    height="20vw"
                    src={
                      rankDetails.iconId
                        ? `/assets/profileicon/${rankDetails.iconId}.png`
                        : `/assets/profileicon/29.png`
                    }
                    alt="Icon Summoner"
                  />
                  {rankDetails.tier ? (
                    <Image
                      borderRadius="md"
                      objectFit="cover"
                      width="25vw"
                      height="15vw"
                      src={`/assets/tiericon/${rankDetails.tier}.png`}
                      alt="Icon Summoner"
                    />
                  ) : (
                    <Skeleton height="13vh" width="27vw" borderRadius="md" />
                  )}
                  <VStack>
                    <Heading size="lg" fontFamily="Bebas Neue" color="#FFFFFF">
                      {rankDetails.tier ? (
                        `Clasificatoria Solo/Duo`
                      ) : (
                        <Skeleton height="3vh" width="35vw" />
                      )}
                    </Heading>
                    <Heading size="lg" fontFamily="Bebas Neue" color="#C0C0C0">
                      {rankDetails.tier ? (
                        `${rankDetails.tier} ${rankDetails.rank}`
                      ) : (
                        <Skeleton height="3vh" width="35vw" />
                      )}
                    </Heading>
                  </VStack>
                </HStack>
              </VStack>
              {/* Graficos de Winrate */}
              {rankDetails.tier ? (
                <HStack borderRadius="sm" height="20vh">
                  <PieChart width={200} height={250}>
                    <Pie
                      data={data02}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={70}
                      fill="#D4AF37"
                      startAngle={90}
                      endAngle={-270}
                      pointerEvents="none"
                    >
                      <Cell fill="#3C8DAD" />
                      <Cell fill="#FF4F4F" />
                    </Pie>

                    <text
                      x="50%"
                      y="45%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="20px"
                      fontFamily="Bebas Neue"
                      fill="#fff"
                    >
                      Winrate
                    </text>
                    <text
                      x="50%"
                      y="55%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="20px"
                      fontFamily="Bebas Neue"
                      fill="#fff"
                    >
                      {`${rankDetails.winrate.toFixed(1)} %`}
                    </text>
                  </PieChart>
                  <PieChart width={250} height={250}>
                    <Pie
                      data={[{ name: "Total", value: 100 }]}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={70}
                      fill="#D4AF37"
                      pointerEvents="none"
                    ></Pie>

                    <text
                      x="50%"
                      y="45%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="20px"
                      fontFamily="Bebas Neue"
                      fill="#fff"
                    >
                      Total Games
                    </text>
                    <text
                      x="50%"
                      y="55%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="20px"
                      fontFamily="Bebas Neue"
                      fill="#fff"
                    >
                      {rankDetails.totalGames}
                    </text>
                  </PieChart>
                </HStack>
              ) : (
                <HStack>
                  <SkeletonCircle size="16vh" />
                  <SkeletonCircle size="16vh" />
                </HStack>
              )}
            </VStack>
          </Card.Header>

          <Card.Body alignItems="center" padding={3}>
            {rankDetails.matches.length > 0 ? (
              <Heading size="lg" fontFamily="Bebas Neue" color="#FFFFFF">
                Historial de Partidas:
              </Heading>
            ) : (
              <Skeleton height="95%" width="85%" borderRadius="md" />
            )}

            <HStack width="100%" height="100%" gap={3} pt={10}>
              {rankDetails.matches.length > 1 ? (
                <IconButton
                  aria-label="Previous"
                  onClick={handlePrev}
                  disabled={startIndex === 0}
                  bgColor="#2C2C2C"
                  borderRadius="sm"
                  color="white"
                  _hover={{ bg: "#333" }}
                  size="lg"
                >
                  <MdArrowBack />
                </IconButton>
              ) : (
                ""
              )}

              {rankDetails.tier
                ? rankDetails.matches
                    .slice(startIndex, startIndex + 1)
                    .map((match, i) => (
                      <Card.Root
                        key={match.matchId || i}
                        width="100%"
                        height="20vh"
                        bgColor="#2C2C2C"
                        borderRadius="md"
                        border="none"
                        position="relative"
                        overflow="hidden"
                      >
                        <Box
                          position="absolute"
                          width="100%"
                          height="100%"
                          backgroundImage={`url(${
                            match.championId !== 0
                              ? `/assets/championimages/${
                                  championNames[match.championId]
                                }_0.jpg`
                              : "/assets/profileicon/29.png"
                          })`}
                          backgroundSize="cover"
                          backgroundPosition="center 0%"
                          backgroundRepeat="no-repeat"
                          filter="brightness(0.3)"
                        />

                        <Card.Body
                          position="relative"
                          zIndex="1"
                          color="white"
                          fontFamily="Bebas Neue"
                        >
                          <VStack gap={1}>
                            <Heading
                              size="lg"
                              color={
                                match.gameDuration > 300
                                  ? match.isWin
                                    ? "green.400"
                                    : "red.400"
                                  : "#C0C0C0"
                              }
                            >
                              {match.gameDuration > 300
                                ? match.isWin
                                  ? "Victoria"
                                  : "Derrota"
                                : "Cancelado"}
                            </Heading>
                            <Heading
                              size="sm"
                              fontFamily="Bebas Neue"
                              color="#FFFFFF"
                            >
                              {match.gameMode}
                            </Heading>
                            <Heading fontSize="lg">
                              {match.kills}/{match.deaths}/{match.assists}
                            </Heading>
                            <HStack>
                              {match.items
                                .filter((itemId) => itemId !== 0)
                                .map((itemId) => (
                                  <Image
                                    height="50%"
                                    src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/item/${itemId}.png`}
                                  ></Image>
                                ))}
                            </HStack>
                          </VStack>
                        </Card.Body>
                      </Card.Root>
                    ))
                : ""}
              {rankDetails.matches.length > 1 ? (
                <IconButton
                  aria-label="Next"
                  onClick={handleNext}
                  disabled={startIndex + 3 >= rankDetails.matches.length}
                  bgColor="#2C2C2C"
                  borderRadius="sm"
                  color="white"
                  _hover={{ bg: "#333" }}
                  size="lg"
                >
                  <MdArrowForward />
                </IconButton>
              ) : (
                ""
              )}
            </HStack>
          </Card.Body>

          <Card.Footer />
        </Card.Root>
      </Box>
    </VStack>
  );
}

export default SummonerSectionMobile;
