// Define the structure of a Pokémon
export interface Pokemon {
  name: string;
  image: string;
}

export interface PokemonResponse {
  results: { name: string; url: string }[]; 
  count: number;
  next: string | null; 
  previous: string | null; 
}

const BASE_URL = "https://pokeapi.co/api/v2";
const LIMIT = 48;

const cache: {
  [key: string]: { pokemonList: Pokemon[]; totalCount: number };
} = {};

interface TypeResponse {
  pokemon: { pokemon: { name: string; url: string } }[]; 
}

const fetchDataByTypes = async (
  selectedTypes: string[]
): Promise<Set<string>> => {
  try {
    const promises = selectedTypes.map((type) =>
      fetch(`${BASE_URL}/type/${type}`).then((res) => res.json())
    );

    const typeData: TypeResponse[] = await Promise.all(promises);

    const pokemonSets = typeData.map(
      (type) => new Set<string>(type.pokemon.map((p) => p.pokemon.name))
    );

    const [firstSet, ...restSets] = pokemonSets;

    const intersection = Array.from(firstSet).filter((name) =>
      restSets.every((set) => set.has(name))
    );

    return new Set<string>(intersection);
  } catch (error) {
    console.error("Error fetching Pokémon by types:", error);
    throw new Error("Failed to fetch Pokémon by types.");
  }
};

// Fetch Pokémon data with pagination and filtering by type
export const fetchPokemonDataByPage = async (
  pageNumber: number,
  selectedTypes: string[] = []
): Promise<{ pokemonList: Pokemon[]; totalCount: number }> => {
  const cacheKey = `${pageNumber}-${selectedTypes.join("-") || "all"}`;

  if (cache[cacheKey]) {
    console.log(`Returning data from cache for page ${pageNumber}`);
    return cache[cacheKey];
  }

  const offset = (pageNumber - 1) * LIMIT;

  try {
    let pokemonList: Pokemon[] = [];
    let totalCount = 0;

    if (selectedTypes.length === 0) {
      // Default logic: Fetch all Pokémon with pagination
      const url = `${BASE_URL}/pokemon?limit=${LIMIT}&offset=${offset}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const data: PokemonResponse = await response.json();
      pokemonList = data.results.map((item) => ({
        name: item.name,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${
          item.url.split("/").slice(-2, -1)[0]
        }.png`,
      }));

      totalCount = data.count;
    } else {
      console.log("Selected Types:", selectedTypes);
      const matchingPokemonNames = await fetchDataByTypes(selectedTypes);

      const paginatedNames = Array.from(matchingPokemonNames).slice(
        offset,
        offset + LIMIT
      );

      const pokemonDetails = await Promise.all(
        paginatedNames.map(async (name) => {
          const res = await fetch(`${BASE_URL}/pokemon/${name}`);
          if (!res.ok) {
            throw new Error(
              `Failed to fetch data for ${name}: ${res.statusText}`
            );
          }
          const data = await res.json();
          return {
            name: data.name,
            image: data.sprites.other.home.front_default,
          };
        })
      );

      pokemonList = pokemonDetails;
      totalCount = matchingPokemonNames.size;
    }

    cache[cacheKey] = { pokemonList, totalCount };
    return cache[cacheKey];
  } catch (error) {
    console.error("Error fetching Pokémon data:", error);
    throw new Error("Failed to load Pokémon data. Please try again later.");
  }
};
