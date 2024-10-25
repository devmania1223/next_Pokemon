"use client";

import { useEffect, useState } from "react";
import { fetchPokemonDataByPage, Pokemon } from "@/api/fetchPokemonDataByPage";
import { PokemonType, fetchPokemonType } from "@/api/fetchPokemonType";

const LIMIT = 48;

export default function Home() {
  const [pageNumber, setPageNumber] = useState(1);
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [typeList, setTypeList] = useState<PokemonType[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPokemon = async () => {
      setLoading(true);
      setError(null);
      try {
        const { pokemonList, totalCount } = await fetchPokemonDataByPage(
          pageNumber,
          selectedTypes
        );
        setPokemon(pokemonList);
        setTotalCount(totalCount);
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    loadPokemon();
  }, [pageNumber, selectedTypes]);

  useEffect(() => {
    const loadTypes = async () => {
      try {
        const types = await fetchPokemonType();
        setTypeList(types);
      } catch (err: any) {
        console.error("Error fetching types:", err);
      }
    };

    loadTypes();
  }, []);

  const handleTypeClick = (typeName: string) => {
    setSelectedTypes((prevSelected) =>
      prevSelected.includes(typeName)
        ? prevSelected.filter((name) => name !== typeName)
        : [...prevSelected, typeName]
    );
    setPageNumber(1); 
  };

  const totalPages = Math.ceil(totalCount / LIMIT);

  if (loading)
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <p>Loading...</p>
      </main>
    );
  if (error)
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <p>Error: {error}</p>
      </main>
    );

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-center my-4 mx-4">
          <div className="font-bold mr-2">Types:</div>
          <div>
            {typeList.map((type: PokemonType) => (
              <button
                key={type.url}
                onClick={() => handleTypeClick(type.name)}
                className={`px-2 py-2 my-2 border-2 rounded-md font-bold ${
                  selectedTypes.includes(type.name)
                    ? "text-white bg-red-900 border-red-900"
                    : "text-red-900 border-red-900"
                }`}
                style={{ margin: "8px" }}
              >
                {type.name}
              </button>
            ))}
          </div>
        </div>

        <div className="my-12 font-bold mx-4">{totalCount} results found.</div>

        {totalCount === 0 ? (
          <p className="text-center text-xl font-bold mt-8">No Results Found</p>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {pokemon.map((item) => (
              <div
                key={item.name}
                className="border border-gray-300 rounded-lg p-4 text-center bg-gray-50"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-auto"
                />
                <p className="mt-2 text-black">{item.name}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <button
            className="p-2 bg-red-900 text-white rounded-md mr-4 disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
            disabled={pageNumber === 1}
          >
            Prev
          </button>
          <button
            className="p-2 bg-red-900 text-white rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={() => setPageNumber((prev) => prev + 1)}
            disabled={pageNumber >= totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
}
