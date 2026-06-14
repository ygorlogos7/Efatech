/** Utilitários de período (mês/ano) para relatórios — evita misturar meses na listagem. */

export const TIMEZONE_BR = "America/Sao_Paulo";

export type PeriodoRelatorio = {
  dataInicio: string;
  dataFim: string;
};

export type FiltrosComPeriodo = {
  dataInicio?: string;
  dataFim?: string;
  mesAno?: string;
};

const MESES_PT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function getMesAnoAtual(): string {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIMEZONE_BR,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((p) => p.type === "year")?.value ?? "";
  const month = parts.find((p) => p.type === "month")?.value ?? "";
  return `${year}-${month}`;
}

/** Converte `YYYY-MM` (input type="month") em primeiro e último dia do mês. */
export function mesAnoParaIntervalo(mesAno: string): PeriodoRelatorio {
  const [anoStr, mesStr] = mesAno.split("-");
  const ano = Number(anoStr);
  const mes = Number(mesStr);
  if (!ano || !mes || mes < 1 || mes > 12) {
    return mesAnoParaIntervalo(getMesAnoAtual());
  }
  const ultimoDia = new Date(ano, mes, 0).getDate();
  return {
    dataInicio: `${anoStr}-${mesStr}-01`,
    dataFim: `${anoStr}-${mesStr}-${String(ultimoDia).padStart(2, "0")}`,
  };
}

export function labelMesAno(mesAno: string): string {
  const [anoStr, mesStr] = mesAno.split("-");
  const mes = Number(mesStr);
  if (!mes || mes < 1 || mes > 12) return mesAno;
  return `${MESES_PT[mes - 1]} de ${anoStr}`;
}

/** Período padrão ao abrir qualquer relatório: mês corrente. */
export function filtrosPeriodoPadrao(): PeriodoRelatorio & { mesAno: string } {
  const mesAno = getMesAnoAtual();
  return { mesAno, ...mesAnoParaIntervalo(mesAno) };
}

/**
 * Garante intervalo sempre definido no servidor.
 * Prioridade: dataInicio+dataFim (período customizado) → mesAno → mês atual.
 */
export function resolverPeriodoRelatorio(
  filtros?: FiltrosComPeriodo | null
): PeriodoRelatorio & { mesAno: string } {
  if (filtros?.dataInicio && filtros?.dataFim) {
    return {
      mesAno: filtros.mesAno || filtros.dataInicio.slice(0, 7),
      dataInicio: filtros.dataInicio,
      dataFim: filtros.dataFim,
    };
  }
  if (filtros?.mesAno) {
    return { mesAno: filtros.mesAno, ...mesAnoParaIntervalo(filtros.mesAno) };
  }
  return filtrosPeriodoPadrao();
}

/** Início/fim do dia no fuso de São Paulo (UTC-3). */
export function inicioDiaBr(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00-03:00`);
}

export function fimDiaBr(isoDate: string): Date {
  return new Date(`${isoDate}T23:59:59.999-03:00`);
}

/** Chave YYYY-MM-DD no calendário brasileiro (evita deslocamento com toISOString/UTC). */
export function dataParaChaveBr(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE_BR,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export function criarWhereDataCampo(
  campo: string,
  periodo: PeriodoRelatorio
): Record<string, unknown> {
  return {
    [campo]: {
      gte: inicioDiaBr(periodo.dataInicio),
      lte: fimDiaBr(periodo.dataFim),
    },
  };
}
