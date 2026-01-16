/**
 * Configurações de Emissões de CO₂ e Créditos de Carbono
 * 
 * FONTES DOS COEFICIENTES:
 * - EPA (Environmental Protection Agency): Fatores de emissão de transporte
 * - DEFRA (UK): Conversion factors for greenhouse gas reporting
 * - IPCC Guidelines: Metodologias para inventários de GEE
 * 
 * DISCLAIMER: Os valores são estimativas baseadas em médias. Emissões reais
 * variam conforme: modelo do veículo, combustível, ocupação, condições de tráfego,
 * manutenção e estilo de condução. Para cálculos precisos, consulte dados
 * específicos do fabricante ou estudos locais.
 */
const config = {
  // kg CO2 por km por pessoa (fontes: EPA, DEFRA, IPCC)
  co2Emissions: {
    bicycle: 0,        // 0 kg - Transporte neutro (EPA/DEFRA)
    car: 0.12,         // 120g/km - Veículo médio gasolina (EPA: 0.11-0.13 kg/km)
    bus: 0.089,        // 89g/km - Ocupação média 40 passageiros (DEFRA: 0.08-0.12 kg/km)
    truck: 0.960       // 960g/km - Caminhão médio 3.5-7.5t (DEFRA: 0.7-1.1 kg/km)
  },
  
  // Custo créditos de carbono (atualizado 2024)
  carbonCreditCost: 45.00, // R$ por crédito (média mercado brasileiro)
  carbonCreditKg: 1000,    // 1 crédito = 1000 kg CO2 (padrão internacional)
  
  // Variação de preço mercado brasileiro (2024)
  priceRange: {
    min: 25.00,  // R$ 25-85 por crédito (volatilidade do mercado)
    max: 85.00
  },
  
  // Nomes e especificações dos transportes
  transportNames: {
    bicycle: "Bicicleta",
    car: "Carro (médio, gasolina)",
    bus: "Ônibus (ocupação média)",
    truck: "Caminhão (3.5-7.5t)"
  },
  
  // Metadados das fontes (para referência)
  sources: {
    lastUpdate: "2024-01",
    references: [
      "EPA - Emission Factors for Greenhouse Gas Inventories",
      "DEFRA - Conversion factors for greenhouse gas reporting",
      "IPCC - Guidelines for National Greenhouse Gas Inventories",
      "Mercado Brasileiro de Créditos de Carbono - B3/CBIOS"
    ]
  },
  
  // Ícones e cores (aproximadas das imagens)
  transports: {
    bicycle: {
      name: "Bicicleta",
      icon: "assets/icons/bike.png",
      color: "#6b7280"
    },
    car: {
      name: "Carro",
      icon: "assets/icons/carro.png",
      color: "#ef4444"
    },
    bus: {
      name: "Ônibus",
      icon: "assets/icons/bus.png",
      color: "#16b78a"
    },
    truck: {
      name: "Caminhão",
      icon: "assets/icons/truck.png",
      color: "#dc2626"
    }
  }
};

/**
 * AVISO IMPORTANTE:
 * Este simulador utiliza valores médios para fins educativos. Para análises
 * comerciais ou científicas, recomenda-se:
 * 1. Dados específicos do veículo/rota
 * 2. Fatores de emissão locais atualizados
 * 3. Metodologias certificadas (ISO 14040, GHG Protocol)
 * 4. Validação por especialistas em sustentabilidade
 */
