// ================= distance-api.js =================
// API gratuita usando OSRM + OpenStreetMap

const distanceApi = {
  /**
   * Obtém distância de rota real em KM
   * @param {string} origin
   * @param {string} destination
   * @returns {Promise<number>}
   */
  async getDistance(origin, destination) {
    try {
      // 1️⃣ Geocodificar origem e destino
      const [orig, dest] = await Promise.all([
        this.geocode(origin),
        this.geocode(destination)
      ]);

      // 2️⃣ Calcular rota no OSRM
      const url = `https://router.project-osrm.org/route/v1/driving/${orig.lon},${orig.lat};${dest.lon},${dest.lat}?overview=false`;

      const res = await fetch(url);
      const data = await res.json();

      if (!data.routes || !data.routes.length) {
        throw new Error('Rota não encontrada');
      }

      const meters = data.routes[0].distance;
      return parseFloat((meters / 1000).toFixed(2));
    } catch (err) {
      console.error('Erro OSRM:', err);
      throw err;
    }
  },

  /**
   * Converte endereço em latitude/longitude
   */
  async geocode(address) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.length) {
      throw new Error(`Endereço não encontrado: ${address}`);
    }

    return {
      lat: data[0].lat,
      lon: data[0].lon
    };
  }
};

// expõe globalmente
window.distanceApi = distanceApi;
