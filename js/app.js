// ================= APP.JS =================
document.addEventListener('DOMContentLoaded', () => {
  console.log('Eco Trip iniciado');

  // ===== ELEMENTOS =====
  const originInput = document.getElementById('origin-input');
  const destinationInput = document.getElementById('destination-input');
  const distanceInput = document.getElementById('distance-input');

  const manualCheckbox = document.getElementById('manual-distance-checkbox');
  const routeButton = document.getElementById('route-button');
  const calcButton = document.getElementById('calc-button');

  // ===== ESTADO =====
  let routeCalculated = false;

  // ===== FUNÇÕES AUXILIARES =====
  function enableEmissionsCalculation() {
    routeCalculated = true;
    calcButton.disabled = false;
  }

  function resetRouteState() {
    routeCalculated = false;
    calcButton.disabled = true;
    routeButton.disabled = false;
    routeButton.textContent = 'Calcular rota';
  }

  // ===== TRANSPORTE =====
  document.querySelectorAll('.transport-option').forEach(btn => {
    btn.addEventListener('click', () => {
      ui.selectTransport(btn.dataset.transport);
    });
  });

  // ===== ALTERAÇÃO DE ORIGEM / DESTINO =====
  originInput.addEventListener('input', resetRouteState);
  destinationInput.addEventListener('input', resetRouteState);

  // ===== DISTÂNCIA MANUAL =====
  manualCheckbox.addEventListener('change', e => {
    const manual = e.target.checked;
    ui.toggleManualDistance(manual);

    if (manual) {
      enableEmissionsCalculation();
    } else {
      distanceInput.value = '';
      resetRouteState();
    }
  });

  // ===== CALCULAR ROTA =====
  routeButton.addEventListener('click', async () => {
    const origin = originInput.value.trim();
    const destination = destinationInput.value.trim();

    if (!origin || !destination) {
      alert('Informe origem e destino');
      return;
    }

    try {
      ui.showLoader();

      const km = await distanceApi.getDistance(origin, destination);

      ui.updateFormValues(origin, destination, km);

      enableEmissionsCalculation();

      routeButton.textContent = 'Rota calculada ✓';
      routeButton.disabled = true;

    } catch (err) {
      console.error(err);
      alert('Erro ao calcular rota');
    } finally {
      ui.hideLoader();
    }
  });

  // ===== CALCULAR EMISSÕES =====
  calcButton.addEventListener('click', async () => {
    if (!routeCalculated) {
      alert('Calcule a rota primeiro');
      return;
    }

    const distance = parseFloat(distanceInput.value);
    if (!distance || distance <= 0) {
      alert('Distância inválida');
      return;
    }

    await ui.simulateCalculation(
      originInput.value,
      destinationInput.value,
      distance
    );
  });

  // ===== ESTADO INICIAL =====
  calcButton.disabled = true;
});
