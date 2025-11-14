export function formatGold(value: number) {
  return `${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} GOLD`;
}

export function formatUsd(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "USD",
  });
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
