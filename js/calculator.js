// ================= CALCULATOR.JS =================
const calculator = {

  // Fatores de emissão (kg CO2 por km)
  emissionFactors: {
    bicycle: 0,
    bus: 0.089,
    car: 0.192,
    truck: 0.27
  },

  /**
   * Calcula emissão para um transporte específico
   */
  calculateEmission(distance, transport) {
    const factor = this.emissionFactors[transport] || 0;
    return distance * factor;
  },

  /**
   * Calcula emissão para todos os transportes
   */
  calculateAllEmissions(distance) {
    const result = {};

    Object.keys(this.emissionFactors).forEach(transport => {
      result[transport] = this.calculateEmission(distance, transport);
    });

    return result;
  },

  /**
   * Calcula economia em relação ao carro
   */
  calculateSavings(selectedEmission, carEmission) {
    if (carEmission === 0) {
      return { savings: 0, percentage: 0 };
    }

    const savings = carEmission - selectedEmission;
    const percentage = (savings / carEmission) * 100;

    return {
      savings: Math.abs(savings).toFixed(2),
      percentage: Math.abs(percentage).toFixed(2)
    };
  },

  /**
   * Percentual relativo em relação ao carro
   */
  calculateRelativePercentage(emission, carEmission) {
    if (carEmission === 0) return 0;
    return (emission / carEmission) * 100;
  },

  /**
   * ✅ MÉTODO QUE ESTAVA FALTANDO
   * Calcula créditos de carbono (1 crédito = 1 tonelada CO₂)
   */
  calculateCarbonCredits(emissionKg) {
    return emissionKg / 1000;
  },

  /**
   * Cálculo de custo estimado dos créditos
   */
  calculateCost(credits) {
    const base = credits * 50; // R$ 50 por crédito
    return {
      base,
      min: base * 0.8,
      max: base * 1.2
    };
  }
};

// Expor globalmente
window.calculator = calculator;
