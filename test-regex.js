const text = `*MODELO DE FABRICACIÓN*
Modelos Siempre Disponibles
Talla desde la 34 a la 44 
 *_PRECIO:12,50$*_
Horma Normal`;

const priceMatch = text.match(/PRECIO[^0-9]*(\d+(?:[.,]\d+)?)/i);
const sizeMatch = text.match(/Talla[^0-9]*(\d+)[^0-9]*(\d+)/i);
const hormaMatch = text.match(/Horma\s+([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)/i);

console.log('Price:', priceMatch ? parseFloat(priceMatch[1].replace(',', '.')) : null);
console.log('Sizes:', sizeMatch ? [sizeMatch[1], sizeMatch[2]] : null);
console.log('Horma:', hormaMatch ? hormaMatch[1] : null);
console.log('Type:', /FABRICACI[OÓ]N/i.test(text) ? 'FABRICACIÓN' : null);
console.log('Available:', /Siempre\s+Disponible/i.test(text));
