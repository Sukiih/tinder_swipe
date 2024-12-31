const decision_threshold = 80;
let isAnimating = false;
let pullDeltaX = 0; // Distancia desde la tarjeta que se está arrastrando
let actualCard;

// Manejo de opacidad de la elección
function updateChoiceOpacity(card, deltaX) {
  const opacity = Math.abs(deltaX) / 100;
  const isRight = deltaX > 0;
  const choiceEl = isRight
    ? card.querySelector('.choice.like')
    : card.querySelector('.choice.nope');
  if (choiceEl) choiceEl.style.opacity = opacity;
}

// Resetear la tarjeta después de la animación
function resetCard() {
  actualCard.removeAttribute('style');
  actualCard.classList.remove('reset');
  pullDeltaX = 0;
  isAnimating = false;
}

// Iniciar evento de arrastre
function startDrag(event) {
  if (isAnimating) return;

  // Obtener el primer elemento de artículo
  actualCard = event.target.closest('article');
  if (!actualCard) return;

  // Obtener la posición inicial del mouse o dedo
  const startX = event.pageX ?? event.touches[0].pageX;

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onEnd);

  document.addEventListener('touchmove', onMove, { passive: true });
  document.addEventListener('touchend', onEnd, { passive: true });

  // Manejar evento de movimiento
  function onMove(event) {
    const currentX = event.pageX ?? event.touches[0].pageX;
    pullDeltaX = currentX - startX;

    // Sin distancia recorrida en el eje X
    if (pullDeltaX === 0) return;

    isAnimating = true;

    // Calcular la rotación de la tarjeta usando la distancia
    const deg = pullDeltaX / 14;

    // Aplicar la transformación a la tarjeta
    actualCard.style.transform = `translateX(${pullDeltaX}px) rotate(${deg}deg)`;

    actualCard.style.cursor = 'grabbing';

    // Actualizar opacidad
    updateChoiceOpacity(actualCard, pullDeltaX);
  }

  //fin de arrastre
  function onEnd() {
    // Eliminar los escuchadores de eventos
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onEnd);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onEnd);

    // Decidir si el usuario tomó una decisión
    const decisionMade = Math.abs(pullDeltaX) >= decision_threshold;

    if (decisionMade) {
      const goRight = pullDeltaX >= 0;

      // Agregar la clase según la decisión
      actualCard.classList.add(goRight ? 'go-right' : 'go-left');
      actualCard.addEventListener('transitionend', () => {
        actualCard.remove();
      });
    } else {
      actualCard.classList.add('reset');
      actualCard.classList.remove('go-right', 'go-left');

      actualCard.querySelectorAll('.choice').forEach(choice => {
        choice.style.opacity = 0;
      });
    }

    // Resetear variables después de la transición
    actualCard.addEventListener('transitionend', () => {
      resetCard();
    });
  }
}

document.addEventListener('mousedown', startDrag);
document.addEventListener('touchstart', startDrag, { passive: true });