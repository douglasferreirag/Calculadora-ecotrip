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

  // Estado
  let routeCalculated = false;

  // ===== TRANSPORTE =====
  document.querySelectorAll('.transport-option').forEach(btn => {
    btn.addEventListener('click', () => {
      ui.selectTransport(btn.dataset.transport);
    });
  });

  // ===== DISTÂNCIA MANUAL =====
  manualCheckbox.addEventListener('change', e => {
    const manual = e.target.checked;
    ui.toggleManualDistance(manual);

    if (manual) {
      routeCalculated = true;
      calcButton.disabled = false;
      routeButton.disabled = true;
    } else {
      distanceInput.value = '';
      routeCalculated = false;
      calcButton.disabled = true;
      routeButton.disabled = false;
      routeButton.textContent = 'Calcular rota';
    }
  });

  distanceInput.addEventListener('input', e => {
    ui.setDistance(e.target.value);
  });

  // Sempre que mudar origem/destino, libera recálculo
  [originInput, destinationInput].forEach(input => {
    input.addEventListener('input', () => {
      routeCalculated = false;
      calcButton.disabled = true;
      routeButton.disabled = false;
      routeButton.textContent = 'Calcular rota';
    });
  });

  // ===== CALCULAR ROTA =====
  routeButton.addEventListener('click', async () => {
    const origin = originInput.value.trim();
    const destination = destinationInput.value.trim();

    if (!origin || !destination) {
      alert('Informe origem e destino');
      return;
    }

    // 🔒 Proteção crítica
    if (!window.distanceApi || typeof distanceApi.getDistance !== 'function') {
      alert(
        'Serviço de rota indisponível.\n' +
        'Abra o projeto via http://localhost (não file://).'
      );
      return;
    }

    try {
      ui.showLoader();

      const km = await distanceApi.getDistance(origin, destination);

      if (!km || km <= 0) {
        throw new Error('Distância inválida');
      }

      ui.updateFormValues(origin, destination, km);

      routeCalculated = true;
      calcButton.disabled = false;

      routeButton.textContent = 'Rota calculada ✓';
      routeButton.disabled = true;

    } catch (err) {
      console.error('Erro rota:', err);
      alert(err.message || 'Erro ao calcular rota');
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
  ui.updateResults();
});
