// Manipulação DOM (funções globais)
const ui = {
  currentTransport: 'bus', // padrão
  currentDistance: 430,    // padrão
  currentEmissions: null,

  /**
   * Atualiza o transporte selecionado
   */
  selectTransport(transport) {
    this.currentTransport = transport;
    
    // Remove seleção anterior
    document.querySelectorAll('.transport-option').forEach(el => {
      el.classList.remove('selected');
    });
    
    // Marca nova seleção
    const selected = document.querySelector(`[data-transport="${transport}"]`);
    if (selected) selected.classList.add('selected');
    
    this.updateResults();
  },

  /**
   * Atualiza a distância
   */
  setDistance(distance) {
    this.currentDistance = parseFloat(distance) || 0;
    const input = document.getElementById('distance-input');
    if (input) input.value = this.currentDistance;
    this.updateResults();
  },

  /**
   * Atualiza formulário (origin, destination, distance)
   */
  updateFormValues(origin, destination, distance) {
    document.getElementById('origin-input').value = origin;
    document.getElementById('destination-input').value = destination;
    this.setDistance(distance);
  },

  /**
   * Ativa/desativa entrada manual de distância
   */
  toggleManualDistance(checked) {
    const distInput = document.getElementById('distance-input');
    if (distInput) {
      distInput.disabled = !checked;
      if (checked) {
        distInput.focus();
        console.log('Modo manual ativado: você pode editar a distância');
      } else {
        console.log('Modo automático ativado: distância será obtida da API ao selecionar origem/destino');
      }
    }
  },

  /**
   * Atualiza todos os resultados na tela
   */
  updateResults() {
    if (this.currentDistance === 0) {
      console.warn('Distância inválida');
      return;
    }

    // Calcula emissões
    this.currentEmissions = calculator.calculateAllEmissions(this.currentDistance);
    const carEmission = this.currentEmissions.car;

    // Atualiza card de resumo
    this.updateSummaryCard(this.currentEmissions[this.currentTransport], carEmission);

    // Atualiza comparativo de transportes
    this.updateComparativeCards(this.currentEmissions, carEmission);

    // Atualiza créditos de carbono
    this.updateCarbonCredits(this.currentEmissions[this.currentTransport]);
  },

  /**
   * Atualiza card de resumo (rota, distância, emissão, economia)
   */
  updateSummaryCard(selectedEmission, carEmission) {
    const origin = document.getElementById('origin-input').value;
    const destination = document.getElementById('destination-input').value;
    const savings = calculator.calculateSavings(selectedEmission, carEmission);

    // Atualiza rota
    document.getElementById('route-text').textContent = `${origin} → ${destination}`;

    // Atualiza distância
    document.getElementById('distance-text').textContent = `${this.currentDistance} km`;

    // Atualiza emissão
    document.getElementById('emission-text').textContent = `${selectedEmission.toFixed(2)} kg CO₂`;

    // Atualiza label do transporte selecionado
    const transportName = config.transports[this.currentTransport].name;
    document.getElementById('emission-note').textContent = transportName;

    // Atualiza economia
    const economyEl = document.getElementById('economy-text');
    const economyPctEl = document.getElementById('economy-percentage');
    if (selectedEmission < carEmission) {
      economyEl.textContent = `${savings.savings} kg`;
      economyPctEl.textContent = `${savings.percentage}% menos emissões`;
    } else {
      economyEl.textContent = `+${(selectedEmission - carEmission).toFixed(2)} kg`;
      economyPctEl.textContent = `${100 - savings.percentage}% mais emissões`;
    }
  },

  /**
   * Atualiza cards comparativos por transporte
   */
  updateComparativeCards(emissions, carEmission) {
    const container = document.getElementById('comparative-container');
    container.innerHTML = '';

    const transports = ['bicycle', 'bus', 'car', 'truck'];
    transports.forEach(transport => {
      const emission = emissions[transport];
      const percentage = calculator.calculateRelativePercentage(emission, carEmission);
      const isSelected = transport === this.currentTransport;

      const card = document.createElement('div');
      card.className = `transport-card ${isSelected ? 'selected' : ''}`;
      card.innerHTML = `
        <div class="card-header">
          <img src="${config.transports[transport].icon}" alt="${config.transports[transport].name}" class="transport-icon">
          <h3>${config.transports[transport].name}</h3>
          ${isSelected ? '<span class="badge-selected">SELECIONADO</span>' : ''}
        </div>
        <div class="card-stats">
          <div class="stat">
            <label>EMISSÃO</label>
            <strong>${emission.toFixed(2)} kg CO₂</strong>
          </div>
          <div class="stat">
            <label>VS CARRO</label>
            <strong>${percentage.toFixed(2)}%</strong>
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${Math.min(percentage, 100)}%; background-color: ${this.getProgressColor(percentage)}"></div>
        </div>
      `;
      card.addEventListener('click', () => this.selectTransport(transport));
      container.appendChild(card);
    });
  },

  /**
   * Define cor da barra de progresso
   */
  getProgressColor(percentage) {
    if (percentage <= 50) return '#16b78a'; // verde
    if (percentage <= 100) return '#f59e0b'; // laranja
    return '#ef4444'; // vermelho
  },

  /**
   * Atualiza seção de créditos de carbono
   */
  updateCarbonCredits(selectedEmission) {
    const credits = calculator.calculateCarbonCredits(selectedEmission);
    const cost = calculator.calculateCost(credits);

    document.getElementById('credits-text').textContent = credits.toFixed(4);
    document.getElementById('cost-text').textContent = `R$ ${cost.base.toFixed(2)}`;
    document.getElementById('cost-range').textContent = `Variação: R$ ${cost.min.toFixed(2)} - R$ ${cost.max.toFixed(2)}`;
  },

  /**
   * Mostra loader
   */
  showLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'flex';
  },

  /**
   * Esconde loader
   */
  hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
  },

  /**
   * Simula cálculo com delay
   */
  async simulateCalculation(origin, destination, distance) {
    this.showLoader();
    
    // Atualiza formulário
    this.updateFormValues(origin, destination, distance);
    
    // Aguarda 1.5s para simular processamento
    return new Promise(resolve => {
      setTimeout(() => {
        this.hideLoader();
        this.updateResults();
        resolve();
      }, 1500);
    });
  }
};
