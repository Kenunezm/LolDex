import { useState } from "react";
import {
  Box,
  Button,
  Heading,
  HStack,
  Input,
  InputGroup,
  Group,
  VStack,
} from "@chakra-ui/react";
import { FormControl } from "@chakra-ui/form-control";
import icon_lol from "/assets/icon_lol.svg";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSummoner } from "@/contexts/SummonerContext";

function Header() {
  const { summonerData, setSummonerData } = useSummoner();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const API_KEY = import.meta.env.VITE_API_KEY;
  const formik = useFormik({
    initialValues: {
      summonerName: "",
    },
    onSubmit: async (values) => {
      setLoading(true);
      setError("");

      const [name, tag] = values.summonerName.split("#");
      if (!name || !tag) {
        setError("Formato Inválido, Usa Nombre#TAG.");
        return error;
      }

      try {
        const response = await fetch(
          `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${name}/${tag}`,
          { headers: { "X-Riot-Token": API_KEY } }
        );
        console.log(response);
        if (!response.ok) {
          throw new Error("Nombre de Invocador No Encontrado.");
        }

        const data = await response.json();
        if (data.puuid && data.gameName !== summonerData?.gameName) {
          setSummonerData(data);
        }
        setLoading(false);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
          setLoading(false);
        } else {
          setError("Ocurrió un error inesperado.");
        }
      }
    },
    validationSchema: Yup.object({
      summonerName: Yup.string()
        .matches(/.+#.+/, "Debe incluir el # y el tag")
        .required("Obligatorio"),
    }),
  });
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      transition="transform 0.3s ease-in-out"
      backgroundColor="#18181b"
    >
      <Box maxWidth="1280px" margin="0 auto">
        <HStack
          px={16}
          sm={{ px: "5" }}
          py={4}
          justifyContent="space-between"
          alignItems="center"
        >
          <nav>
            <HStack gap={8}>
              <a href="">
                <img src={icon_lol} alt="Inicio" />
              </a>
              <Heading size="xl" hideBelow="md">
                LoLDex
              </Heading>
            </HStack>
          </nav>
          <form onSubmit={formik.handleSubmit}>
            <nav>
              <HStack gap={8}>
                <Group w="full">
                  <FormControl
                    isInvalid={Boolean(
                      formik.touched.summonerName && formik.errors.summonerName
                    )}
                  >
                    <VStack>
                      <InputGroup
                        startAddon="LoL Name:"
                        borderRadius="md"
                        boxShadow="lg"
                        color="black"
                        fontWeight="bold"
                      >
                        <Input
                          placeholder="Name#TAG"
                          minWidth="9vw"
                          sm={{ width: "45" }}
                          id="summoner"
                          {...formik.getFieldProps("summonerName")}
                          onBlur={() => {
                            formik.setFieldTouched("summonerName", true);
                          }}
                          bgColor="#2C2C2C"
                          color="#C0C0C0"
                          borderRadius="md"
                          borderColor="#3B3B3B"
                          _focus={{
                            borderColor: "#F4F4F4",
                            boxShadow: "0 0 0 2px #F4F4F4",
                          }}
                          padding="0.8rem"
                        />
                      </InputGroup>
                    </VStack>
                  </FormControl>
                  <Button
                    type="submit"
                    loading={loading}
                    bg="bg.subtle"
                    variant="outline"
                    bgColor="#F4F4F4"
                  >
                    <img src="/assets/arrow.png" alt="Buscar" width="25vw" />
                  </Button>
                </Group>
              </HStack>
            </nav>
          </form>
        </HStack>
      </Box>
    </Box>
  );
}

export default Header;
