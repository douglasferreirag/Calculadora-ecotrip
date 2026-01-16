// ========== GOOGLE MAPS INITIALIZATION CALLBACK ==========
// Esta função é chamada automaticamente quando o Google Maps script termina de carregar
window.initMap = function() {
  console.log('=== [CALLBACK initMap] Inicializando Places Autocomplete ===');
  try {
    const originInput = document.getElementById('origin-input');
    const destinationInput = document.getElementById('destination-input');
    if (!originInput || !destinationInput) {
      console.warn('Inputs de origem/destino não encontrados no DOM.');
      return;
    }

    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.warn('google.maps.places ainda não está disponível.');
      return;
    }

    const opts = {
      fields: ['formatted_address', 'geometry', 'name'],
      componentRestrictions: { country: 'br' }
    };

    // Usa o Autocomplete legado (estável e bem suportado)
    let originAutocomplete = null;
    let destAutocomplete = null;
    try {
      originAutocomplete = new google.maps.places.Autocomplete(originInput, opts);
      destAutocomplete = new google.maps.places.Autocomplete(destinationInput, opts);
      console.log('✓ Autocomplete inicializado (API legada)');
    } catch (err) {
      console.error('Erro ao inicializar Autocomplete:', err);
      return;
    }

    // Guarda dados de place (coordenadas) para fallback haversine
    let originPlaceData = null;
    let destPlaceData = null;

    // Função auxiliar para atualizar distância automaticamente
    async function updateDistanceAutomatically() {
      const origin = originInput.value.trim();
      const destination = destinationInput.value.trim();
      
      if (!origin || !destination) {
        console.log('Aguardando origem e destino...');
        return;
      }

      console.log('Obtendo distância automaticamente para:', origin, '→', destination);
      
      // Verifica se distanceApi está disponível
      if (!window.distanceApi || typeof window.distanceApi.getDistance !== 'function') {
        console.warn('⚠️ window.distanceApi não está disponível. Tente inserir a distância manualmente.');
        return;
      }

      try {
        ui.showLoader();
        const km = await window.distanceApi.getDistance(origin, destination, 'DRIVING');
        ui.hideLoader();
        
        if (km && km > 0) {
          document.getElementById('distance-input').value = km;
          ui.setDistance(km);
          console.log('✓ Distância atualizada:', km, 'km');
        } else {
          ui.hideLoader();
          console.warn('Distância inválida:', km);
        }
      } catch (err) {
        ui.hideLoader();
        console.warn('Não foi possível obter distância automaticamente:', err.message);

        // Se o problema foi ZERO_RESULTS, e tivermos coordenadas das duas localidades,
        // usamos o fallback de distância em linha reta (haversine).
        try {
          const msg = (err && err.message) ? err.message : '';
          if ((/ZERO_RESULTS/i.test(msg) || /Rota não encontrada/i.test(msg)) && originPlaceData && destPlaceData) {
            const kmFallback = window.distanceApi && typeof window.distanceApi.haversineKm === 'function'
              ? window.distanceApi.haversineKm(originPlaceData.lat, originPlaceData.lng, destPlaceData.lat, destPlaceData.lng)
              : null;

            if (kmFallback && kmFallback > 0) {
              console.log('Usando fallback (linha reta) para distância:', kmFallback, 'km');
              document.getElementById('distance-input').value = kmFallback;
              ui.setDistance(kmFallback);
              // opcional: indicar visualmente que é um valor aproximado
              ui.showToast && ui.showToast('Distância aproximada (linha reta) aplicada.');
              return;
            }
          }
        } catch (fallbackErr) {
          console.warn('Fallback haversine falhou:', fallbackErr);
        }

        console.log('Inserir distância manualmente ou clicar em "Calcular Emissões"');
      }
    }

    // Função utilitária para ligar listeners de seleção, cobrindo diferentes implementações
    function attachPlaceListener(autocompleteInstance, inputEl, onPlaceSelected) {
      if (!autocompleteInstance || !inputEl) return;

      // API legada (Autocomplete) fornece addListener + getPlace
      if (typeof autocompleteInstance.addListener === 'function') {
        autocompleteInstance.addListener('place_changed', () => {
          try {
            const place = typeof autocompleteInstance.getPlace === 'function'
              ? autocompleteInstance.getPlace()
              : null;
            if (place && (place.formatted_address || place.formattedAddress)) {
              const addr = place.formatted_address || place.formattedAddress;
              inputEl.value = addr;
              // extrai coordenadas se disponíveis
              try {
                if (place.geometry && place.geometry.location) {
                  const lat = typeof place.geometry.location.lat === 'function' ? place.geometry.location.lat() : place.geometry.location.lat;
                  const lng = typeof place.geometry.location.lng === 'function' ? place.geometry.location.lng() : place.geometry.location.lng;
                  if (onPlaceSelected && typeof onPlaceSelected === 'function') onPlaceSelected({ lat, lng, addr });
                } else {
                  if (onPlaceSelected && typeof onPlaceSelected === 'function') onPlaceSelected(null);
                }
              } catch (gErr) {
                console.warn('Erro ao extrair geometry do place:', gErr);
              }

              console.log(inputEl.id + ' selecionado:', addr);
              setTimeout(updateDistanceAutomatically, 100);
            }
          } catch (err) {
            console.warn('Erro ao ler place_changed:', err);
          }
        });
        return;
      }
    }

    // Anexa listeners para origem e destino. Passa callbacks para armazenar coordenadas
    attachPlaceListener(originAutocomplete, originInput, (placeData) => {
      originPlaceData = placeData;
      // debug
      if (placeData) console.log('Origem coords:', placeData.lat, placeData.lng);
    });
    attachPlaceListener(destAutocomplete, destinationInput, (placeData) => {
      destPlaceData = placeData;
      if (placeData) console.log('Destino coords:', placeData.lat, placeData.lng);
    });

    console.log('✓ Places Autocomplete inicializado com sucesso!');
  } catch (err) {
    console.error('Erro ao inicializar Places Autocomplete:', err);
  }
};

// ========== APP INITIALIZATION ==========
// Inicialização e eventos
document.addEventListener('DOMContentLoaded', function() {
  console.log('App inicializado');

  // Se Maps já carregou antes do DOMContentLoaded, chama initMap
  if (window.google && window.google.maps && window.google.maps.places) {
    console.log('Google Maps já está disponível, inicializando Places...');
    if (typeof window.initMap === 'function') {
      window.initMap();
    }
  }

  // Aguarda o carregamento do Google Maps (se necessário) antes de inicializar Autocomplete
  function waitForGoogleMaps(timeoutMs = 5000, intervalMs = 200) {
    const start = Date.now();
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps && window.google.maps.places) {
        resolve();
        return;
      }

      const iv = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          clearInterval(iv);
          resolve();
          return;
        }

        if (Date.now() - start >= timeoutMs) {
          clearInterval(iv);
          reject(new Error('Google Maps/Places não carregado após ' + timeoutMs + 'ms'));
          return;
        }
      }, intervalMs);
    });
  }

  // Não inicializamos aqui para evitar duplicidade: a inicialização do Maps chama window.initMap()
  // quando o script terminar de carregar (veja initMapCallback em index.html).

  // ========== Event Listeners ==========

  // Botões de seleção de transporte
  document.querySelectorAll('.transport-option').forEach(btn => {
    btn.addEventListener('click', function() {
      const transport = this.dataset.transport;
      ui.selectTransport(transport);
    });
  });

  // Input de distância manual
  const distanceInput = document.getElementById('distance-input');
  if (distanceInput) {
    distanceInput.addEventListener('change', function() {
      ui.setDistance(this.value);
    });
  }

  // Checkbox para entrada manual de distância
  const manualCheckbox = document.getElementById('manual-distance-checkbox');
  if (manualCheckbox) {
    manualCheckbox.addEventListener('change', function() {
      ui.toggleManualDistance(this.checked);
    });
    // Define estado inicial do campo de distância conforme o checkbox (padrão: desmarcado => automático)
    ui.toggleManualDistance(manualCheckbox.checked);
  }

  // Botão de enviar formulário
  const calcButton = document.getElementById('calc-button');
  if (calcButton) {
    calcButton.addEventListener('click', async function() {
      const origin = document.getElementById('origin-input').value;
      const destination = document.getElementById('destination-input').value;
      const manualCheckbox = document.getElementById('manual-distance-checkbox');

      if (!origin || !destination) {
        alert('Por favor, preencha Origem e Destino.');
        return;
      }

      // Se o usuário estiver inserindo distância manualmente, use o valor do input
      if (manualCheckbox && manualCheckbox.checked) {
        const distance = parseFloat(document.getElementById('distance-input').value);
        if (!distance || distance <= 0) {
          alert('Por favor, informe uma distância válida.');
          return;
        }
        await ui.simulateCalculation(origin, destination, distance);
        return;
      }

      // Caso contrário, tente obter a distância via Google Distance Matrix
      try {
        // mostra loader enquanto obtemos a distância
        ui.showLoader();
        if (!window.distanceApi) throw new Error('distanceApi não disponível. Verifique se o script foi carregado.');
        const km = await window.distanceApi.getDistance(origin, destination, 'DRIVING');
        ui.hideLoader();

        if (!km || km <= 0) {
          alert('Não foi possível obter a distância automaticamente. Tente inserir manualmente.');
          return;
        }

        await ui.simulateCalculation(origin, destination, km);
      } catch (err) {
        ui.hideLoader();
        console.error(err);
        alert('Erro ao obter distância automaticamente: ' + (err.message || err));
      }
    });
  }

  // Botão "Compensar Emissões"
  const compensateButton = document.getElementById('compensate-button');
  if (compensateButton) {
    compensateButton.addEventListener('click', function() {
      alert('Função de compensação em desenvolvimento. Total a pagar: R$ ' + 
            (ui.currentEmissions[ui.currentTransport] * 0.01).toFixed(2));
    });
  }

  // Carrega dados padrão (São Paulo → Rio)
  ui.updateResults();
});
