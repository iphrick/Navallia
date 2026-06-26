/**
 * Utilitários de Data e Hora
 */

// Adiciona minutos a um horário "HH:mm"
export function addMinutesToTime(time: string, minutesToAdd: number): string {
  const [hours, minutes] = time.split(':').map(Number);
  
  const totalMinutes = (hours * 60) + minutes + minutesToAdd;
  
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;
  
  return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
}

// Verifica se dois períodos de tempo se sobrepõem
export function isTimeOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  return startA < endB && endA > startB;
}

// Pega os slots de horários do dia (ex: 08:00, 08:30, 09:00...)
export function generateTimeSlots(start: string = "08:00", end: string = "20:00", intervalMin: number = 30): string[] {
  const slots: string[] = [];
  let current = start;
  
  while (current < end) {
    slots.push(current);
    current = addMinutesToTime(current, intervalMin);
  }
  
  return slots;
}

// Formata data ISO para PT-BR
export function formatDateBR(dateString: string): string {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}
