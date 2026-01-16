// Serviço para obter distância usando Google Maps JavaScript API (DistanceMatrixService)
// Requer que o script do Google Maps seja carregado em index.html com a sua API key:
// <script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"></script>

const distanceApi = {
  /**
   * Obtém a distância (em km) entre duas localidades usando Google Maps JS API
   * @param {string} origin - endereço de origem (string)
   * @param {string} destination - endereço de destino (string)
   * @param {string} travelMode - opcional: 'DRIVING'|'WALKING'|'BICYCLING'|'TRANSIT'
   * @returns {Promise<number>} - distância em km (float)
   */
  getDistance(origin, destination, travelMode = 'DRIVING') {
    const timeoutMs = 5000; // tempo máximo para aguardar o carregamento do Google Maps

    function waitForGoogleMaps(timeout = timeoutMs, intervalMs = 200) {
      const start = Date.now();
      return new Promise((resolve, reject) => {
        if (window.google && window.google.maps && window.google.maps.DistanceMatrixService) {
          resolve();
          return;
        }

        const iv = setInterval(() => {
          if (window.google && window.google.maps && window.google.maps.DistanceMatrixService) {
            clearInterval(iv);
            resolve();
            return;
          }

          if (Date.now() - start >= timeout) {
            clearInterval(iv);
            reject(new Error('Google Maps API não carregada após ' + timeout + 'ms'));
            return;
          }
        }, intervalMs);
      });
    }

    return new Promise((resolve, reject) => {
      waitForGoogleMaps().then(() => {
        try {
          const service = new google.maps.DistanceMatrixService();
          service.getDistanceMatrix(
            {
              origins: [origin],
              destinations: [destination],
              travelMode: google.maps.TravelMode[travelMode] || google.maps.TravelMode.DRIVING,
              unitSystem: google.maps.UnitSystem.METRIC,
              avoidHighways: false,
              avoidTolls: false
            },
            (response, status) => {
              if (status !== 'OK') {
                reject(new Error('DistanceMatrixService falhou: ' + status));
                return;
              }

              try {
                const element = response.rows[0].elements[0];
                if (element.status !== 'OK') {
                  reject(new Error('Rota não encontrada: ' + element.status));
                  return;
                }

                const meters = element.distance.value;
                const km = meters / 1000;
                resolve(parseFloat(km.toFixed(2)));
              } catch (err) {
                reject(err);
              }
            }
          );
        } catch (err) {
          reject(err);
        }
      }).catch(err => {
        reject(err);
      });
    });
  }
};

// Adiciona utilitário Haversine (distância em linha reta, km)
distanceApi.haversineKm = function(lat1, lon1, lat2, lon2) {
  function toRad(deg) { return deg * Math.PI / 180; }
  const R = 6371; // raio da Terra em km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return parseFloat((R * c).toFixed(2));
};

// Expor no escopo global para uso por scripts não-modulares
window.distanceApi = distanceApi;
