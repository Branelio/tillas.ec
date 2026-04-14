export function calculateDeliveryDates(orderDate: Date): { factoryOrderDate: Date, estimatedDeliveryAt: Date } {
  // Configuración de negocio
  const CUTOFF_DAY = 2; // Martes (0=Domingo, 1=Lunes, 2=Martes...)
  const CUTOFF_HOUR = 18; // 18:00 (6 PM)
  const DELIVERY_DAY = 6; // Sábado
  const DELIVERY_HOUR = 13; // 13:00 (1 PM)

  // Clonar la fecha para no mutar el argumento
  const date = new Date(orderDate.getTime());
  
  const currentDay = date.getDay();
  const currentHour = date.getHours();

  // Determinar si la orden entró ANTES o DESPUÉS del corte de esta semana
  // Es antes del corte si: es día anterior al martes, o si es martes pero antes de las 18:00
  let isBeforeCutoff = false;
  if (currentDay < CUTOFF_DAY) {
    isBeforeCutoff = true;
  } else if (currentDay === CUTOFF_DAY && currentHour < CUTOFF_HOUR) {
    isBeforeCutoff = true;
  }

  // 1. Calcular Fecha de Pedido a Fábrica (factoryOrderDate)
  // Siempre se pide el Martes a las 18:00 aplicable.
  const factoryOrderDate = new Date(date.getTime());
  
  let daysToCutoff = CUTOFF_DAY - currentDay;
  if (!isBeforeCutoff) {
     // Si ya pasó el corte de esta semana, el pedido a fábrica es el martes de la *siguiente* semana
     daysToCutoff += 7;
  }
  
  factoryOrderDate.setDate(date.getDate() + daysToCutoff);
  factoryOrderDate.setHours(CUTOFF_HOUR, 0, 0, 0);

  // 2. Calcular Fecha Estimada de Entrega (estimatedDeliveryAt)
  // Siempre se entrega el Sábado (13:00) de la *misma semana* en la que se pide a fábrica.
  const estimatedDeliveryAt = new Date(factoryOrderDate.getTime());
  
  // Como factoryOrderDate siempre cae en Martes (2), y queremos el Sábado (6) de esa semana:
  const daysFromFactoryToDelivery = DELIVERY_DAY - CUTOFF_DAY; // 6 - 2 = 4 días
  
  estimatedDeliveryAt.setDate(factoryOrderDate.getDate() + daysFromFactoryToDelivery);
  estimatedDeliveryAt.setHours(DELIVERY_HOUR, 0, 0, 0);

  return {
    factoryOrderDate,
    estimatedDeliveryAt
  };
}
