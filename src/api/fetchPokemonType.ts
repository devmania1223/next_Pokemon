// Define the structure of the response from the Pokémon Types API
export interface TypeResponse {
  results: PokemonType[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface PokemonType {
  name: string; 
  url: string; 
}

// Base URL for the Pokémon Types API
const BASE_URL = "https://pokeapi.co/api/v2/type";

let typeCache: PokemonType[] | null = null;

export const fetchPokemonType = async (): Promise<PokemonType[]> => {
  const LIMIT = 20;
  const url = `${BASE_URL}?limit=${LIMIT}`;

  if (typeCache) {
    console.log("Returning Types data from cache");
    return typeCache;
  }

  console.log("Fetching Types data from network");
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const data: TypeResponse = await response.json();
    
    typeCache = data.results;
    
    return data.results;
  } catch (error) {
    console.error("Error fetching Types data:", error);
    throw new Error("Failed to load Types data. Please try again later.");
  }
};

