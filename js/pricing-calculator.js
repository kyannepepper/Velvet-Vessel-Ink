/**
 * pricing-calculator.js — shared estimate logic used on the homepage
 * pricing preview and the booking page's live calculator.
 */

const PricingCalculator = (function () {
  function getTiers() {
    return window.SITE_CONFIG?.PRICING || {};
  }

  /**
   * @param {'small'|'medium'|'large'} sizeKey
   * @param {'black_gray'|'color'} colorPreference
   */
  function estimate(sizeKey, colorPreference) {
    const tiers = getTiers();
    const tier = tiers[sizeKey];
    if (!tier) return { min: null, max: null };
    let { min, max } = tier;
    if (colorPreference === 'color' && tiers.colorSurcharge) {
      min = Math.round(min * (1 + tiers.colorSurcharge));
      max = Math.round(max * (1 + tiers.colorSurcharge));
    }
    return { min, max };
  }

  function sizeKeyFromLabel(label = '') {
    const l = label.toLowerCase();
    if (l.startsWith('s')) return 'small';
    if (l.startsWith('m')) return 'medium';
    if (l.startsWith('l')) return 'large';
    return null;
  }

  return { estimate, getTiers, sizeKeyFromLabel };
})();

window.PricingCalculator = PricingCalculator;
