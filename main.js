// main.js - lógica, validaciones y accesos
document.addEventListener('DOMContentLoaded', () => {
  // Elementos
  const btnGamas = Array.from(document.querySelectorAll('.btn-gama'));
  const precioNuevo = document.getElementById('precio-nuevo');
  const precioAntiguo = document.getElementById('precio-antiguo');
  const inputGama = document.getElementById('tipo-gama');
  const sticker = document.getElementById('sticker-preview');
  const perfumeInput = document.getElementById('perfume');

  const form = document.getElementById('miFormulario');
  const clienteInput = document.getElementById('cliente');
  const direccionInput = document.getElementById('direccion');
  const pagoSelect = document.getElementById('pago');

  const currentYear = document.getElementById('year');
  if (currentYear) currentYear.textContent = new Date().getFullYear();

  // Gamas - estado accesible
  const GAMAS = {
    estandar: { precio: '$300 MXN', antiguo: '$499', label: 'Estándar ($300)' },
    alta: { precio: '$400 MXN', antiguo: '$599', label: 'Alta Gama ($400)' }
  };

  btnGamas.forEach(btn => {
    btn.addEventListener('click', () => {
      const selected = btn.getAttribute('data-gama');
      // Update aria
      btnGamas.forEach(b => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');

      const data = GAMAS[selected] || GAMAS.estandar;
      precioNuevo.textContent = data.precio;
      precioAntiguo.textContent = data.antiguo;
      inputGama.value = data.label;
    });
  });

  // Actualizar frasco cuando el usuario escribe
  perfumeInput.addEventListener('input', () => {
    const text = perfumeInput.value.trim();
    sticker.textContent = text ? text.toUpperCase() : 'TU PERFUME';
  });

  // Validaciones (regex)
  const validators = {
    perfume: val => val.trim().length >= 3,
    cliente: val => /^[A-Za-zÀ-ÖØ-öø-ÿ\s]{3,}$/.test(val.trim()),
    direccion: val => val.trim().length >= 6,
    pago: val => val.trim().length > 0
  };

  const errorEls = {
    perfume: document.getElementById('perfume-err'),
    cliente: document.getElementById('cliente-err'),
    direccion: document.getElementById('direccion-err'),
    pago: document.getElementById('pago-err')
  };

  function showError(field, message) {
    if (errorEls[field]) errorEls[field].textContent = message;
    const el = document.getElementById(field);
    if (el) el.setAttribute('aria-invalid', 'true');
  }
  function clearError(field) {
    if (errorEls[field]) errorEls[field].textContent = '';
    const el = document.getElementById(field);
    if (el) el.removeAttribute('aria-invalid');
  }

  // Validación en tiempo real
  perfumeInput.addEventListener('blur', () => {
    const ok = validators.perfume(perfumeInput.value);
    ok ? clearError('perfume') : showError('perfume', 'Ingresa al menos 3 caracteres para el perfume.');
  });
  clienteInput.addEventListener('blur', () => {
    const ok = validators.cliente(clienteInput.value);
    ok ? clearError('cliente') : showError('cliente', 'Nombre inválido. Usa sólo letras y espacios.');
  });
  direccionInput.addEventListener('blur', () => {
    const ok = validators.direccion(direccionInput.value);
    ok ? clearError('direccion') : showError('direccion', 'Dirección demasiado corta.');
  });
  pagoSelect.addEventListener('change', () => {
    const ok = validators.pago(pagoSelect.value);
    ok ? clearError('pago') : showError('pago', 'Selecciona un método de pago.');
  });

  // Submit: construir enlace de WhatsApp de forma segura
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validar todos
    const fields = {
      perfume: perfumeInput.value,
      cliente: clienteInput.value,
      direccion: direccionInput.value,
      pago: pagoSelect.value
    };

    let allValid = true;
    if (!validators.perfume(fields.perfume)) { showError('perfume', 'Ingresa al menos 3 caracteres para el perfume.'); allValid=false; }
    if (!validators.cliente(fields.cliente)) { showError('cliente', 'Nombre inválido. Usa sólo letras y espacios.'); allValid=false; }
    if (!validators.direccion(fields.direccion)) { showError('direccion', 'Dirección demasiado corta.'); allValid=false; }
    if (!validators.pago(fields.pago)) { showError('pago', 'Selecciona un método de pago.'); allValid=false; }

    if (!allValid) {
      // Llevar foco al primer error
      const firstErrorField = Object.keys(errorEls).find(k => errorEls[k].textContent);
      if (firstErrorField) {
        const el = document.getElementById(firstErrorField);
        if (el) el.focus();
      }
      return;
    }

    // Datos limpios
    const perfume = fields.perfume.trim();
    const cliente = fields.cliente.trim();
    const direccion = fields.direccion.trim();
    const pago = fields.pago.trim();
    const gama = inputGama.value;

    // Número de la marca — CAMBIA A TU NÚMERO real (formato internacional sin +, ej: 52155...)
    const telefonoMarca = '5215500000000'; // <<--- cambiar por tu número

    // Construir mensaje con encodeURIComponent
    const mensajePlain =
      `Hola, quiero hacer un pedido en Aroma a Medida:%0A%0A` +
      `Perfume: ${perfume}%0A` +
      `Gama: ${gama}%0A` +
      `Cliente: ${cliente}%0A` +
      `Entrega: ${direccion}%0A` +
      `Pago: ${pago}`;

    const url = `https://wa.me/${telefonoMarca}?text=${encodeURIComponent(mensajePlain)}`;

    // Abrir enlace de forma segura (noopener noreferrer)
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

});
