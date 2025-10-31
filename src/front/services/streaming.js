export async function getStreamingAvailability(title) {
  //  Funcion auxiliar para limpiar el titulo (quita subttulos y guiones)
  const cleanTitle = title.replace(/:.*$/, "").trim();

  const countries = ["es", "us", "mx"]; // España, EE.UU. y México
  let foundPlatforms = [];

  for (const country of countries) {
    const API_URL = `https://streaming-availability.p.rapidapi.com/v2/search/title?title=${encodeURIComponent(
      cleanTitle
    )}&country=${country}&show_type=movie&output_language=es`;

    try {
      const response = await fetch(API_URL, {
        headers: {
          "x-rapidapi-key": import.meta.env.VITE_RAPIDAPI_KEY,
          "x-rapidapi-host": "streaming-availability.p.rapidapi.com",
        },
      });

      const data = await response.json();

      if (!data.result || data.result.length === 0) continue;

      const streamingInfo = data.result[0]?.streamingInfo?.[country];
      if (!streamingInfo) continue;

      foundPlatforms = Object.keys(streamingInfo).map((p) => p.toUpperCase());
      if (foundPlatforms.length > 0) break; // si encontro, no sigue buscando
    } catch (error) {
      console.error("Error al obtener plataformas:", error);
    }
  }

  return foundPlatforms;
}
