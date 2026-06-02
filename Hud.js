/**
 * Interfaccia a schermo: contatore mostri e messaggio di morte.
 */
class Hud {
  constructor(counterElementId, deathElementId) {
    this.counterElement = document.getElementById(counterElementId);
    this.deathElement = document.getElementById(deathElementId);
  }

  updateMonsterCount(count) {
    if (!this.counterElement) {
      return;
    }

    this.counterElement.textContent = `Mostri rimasti: ${count}`;
  }

  showDeathMessage() {
    if (!this.deathElement) {
      return;
    }

    this.deathElement.textContent = "Sei morto";
    this.deathElement.classList.add("visible");
  }
}
