import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function formatDateTimeFull(date: Date) {
  return format(date, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr });
}
