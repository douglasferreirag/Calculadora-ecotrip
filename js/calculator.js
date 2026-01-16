// Lógica de cálculos (funções globais)
const calculator = {
  /**
   * Calcula emissões de CO2 para um transporte
   * @param {number} distance - distância em km
   * @param {string} transport - tipo de transporte (bicycle, car, bus, truck)
   * @returns {number} emissão em kg CO2
   */
  calculateEmission(distance, transport) {
    const emission = config.co2Emissions[transport] || 0;
    return parseFloat((distance * emission).toFixed(2));
  },

  /**
   * Calcula todas as emissões para comparação
   * @param {number} distance - distância em km
   * @returns {object} emissões por transporte
   */
  calculateAllEmissions(distance) {
    return {
      bicycle: this.calculateEmission(distance, 'bicycle'),
      car: this.calculateEmission(distance, 'car'),
      bus: this.calculateEmission(distance, 'bus'),
      truck: this.calculateEmission(distance, 'truck')
    };
  },

  /**
   * Calcula percentual relativo ao carro
   * @param {number} emission - emissão em kg
   * @param {number} carEmission - emissão do carro
   * @returns {number} percentual (0-100 ou mais)
   */
  calculateRelativePercentage(emission, carEmission) {
    if (carEmission === 0) return 0;
    return parseFloat(((emission / carEmission) * 100).toFixed(2));
  },

  /**
   * Calcula economia vs carro
   * @param {number} transportEmission - emissão do transporte
   * @param {number} carEmission - emissão do carro
   * @returns {object} { savings, percentage }
   */
  calculateSavings(transportEmission, carEmission) {
    const savings = parseFloat((carEmission - transportEmission).toFixed(2));
    const percentage = carEmission > 0 
      ? parseFloat(((savings / carEmission) * 100).toFixed(2))
      : 0;
    return { savings, percentage };
  },

  /**
   * Calcula créditos de carbono necessários
   * @param {number} emission - emissão total em kg
   * @returns {number} número de créditos (fracionado)
   */
  calculateCarbonCredits(emission) {
    return parseFloat((emission / config.carbonCreditKg).toFixed(4));
  },

  /**
   * Calcula custo estimado
   * @param {number} credits - número de créditos
   * @returns {object} { base, min, max }
   */
  calculateCost(credits) {
    const baseCost = parseFloat((credits * config.carbonCreditCost).toFixed(2));
    const minCost = parseFloat((credits * config.priceRange.min).toFixed(2));
    const maxCost = parseFloat((credits * config.priceRange.max).toFixed(2));
    return { base: baseCost, min: minCost, max: maxCost };
  }
};
