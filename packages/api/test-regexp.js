const text = "🏭 *MODELO DE FABRICACIÓN* 🛍️ ✅ Modelos Siempre Disponibles👟👠          👉🏻 Talla desde la 34 a la 44 👈🏻           🎲 *_PRECIO:12,50$*_ 💸 🪙  🎱 Horma Normal 🎯 Foto referencial";

const result = {
  price: null,
  sizeMin: null,
  sizeMax: null,
  horma: null,
  type: null,
  isAvailable: true,
};

const priceMatch = text.match(/PRECIO[^0-9]*(\d+(?:[.,]\d+)?)/i);
if (priceMatch) {
  result.price = parseFloat(priceMatch[1].replace(',', '.'));
}

const sizeMatch = text.match(/Talla[^0-9]*(\d+)[^0-9]*(\d+)/i);
if (sizeMatch) {
  result.sizeMin = parseInt(sizeMatch[1], 10);
  result.sizeMax = parseInt(sizeMatch[2], 10);
}

const hormaMatch = text.match(/Horma\s+([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)/i);
if (hormaMatch) {
  result.horma = hormaMatch[1].trim();
}

console.log(result);
