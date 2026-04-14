// Lógica duplicada del backend para previsualizar al usuario
export function getEstimatedDeliveryText(): string {
  const CUTOFF_DAY = 2; // Martes
  const CUTOFF_HOUR = 18; // 18:00 (6 PM)
  const DELIVERY_DAY = 6; // Sábado

  const date = new Date();
  const currentDay = date.getDay();
  const currentHour = date.getHours();

  let isBeforeCutoff = false;
  if (currentDay < CUTOFF_DAY) {
    isBeforeCutoff = true;
  } else if (currentDay === CUTOFF_DAY && currentHour < CUTOFF_HOUR) {
    isBeforeCutoff = true;
  }

  const factoryOrderDate = new Date(date.getTime());
  let daysToCutoff = CUTOFF_DAY - currentDay;
  if (!isBeforeCutoff) {
     daysToCutoff += 7;
  }
  
  factoryOrderDate.setDate(date.getDate() + daysToCutoff);
  factoryOrderDate.setHours(CUTOFF_HOUR, 0, 0, 0);

  const estimatedDeliveryAt = new Date(factoryOrderDate.getTime());
  const daysFromFactoryToDelivery = DELIVERY_DAY - CUTOFF_DAY;
  
  estimatedDeliveryAt.setDate(factoryOrderDate.getDate() + daysFromFactoryToDelivery);
  
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  return estimatedDeliveryAt.toLocaleDateString('es-EC', options);
}
