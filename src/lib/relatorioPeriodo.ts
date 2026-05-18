/** Utilitários de período (mês/ano) para relatórios — evita misturar meses na listagem. */

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
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${mes}`;
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
 * Prioridade: mesAno → dataInicio+dataFim → mês atual.
 */
export function resolverPeriodoRelatorio(
  filtros?: FiltrosComPeriodo | null
): PeriodoRelatorio & { mesAno: string } {
  if (filtros?.mesAno) {
    return { mesAno: filtros.mesAno, ...mesAnoParaIntervalo(filtros.mesAno) };
  }
  if (filtros?.dataInicio && filtros?.dataFim) {
    const mesAno = filtros.dataInicio.slice(0, 7);
    return {
      mesAno,
      dataInicio: filtros.dataInicio,
      dataFim: filtros.dataFim,
    };
  }
  return filtrosPeriodoPadrao();
}

export function criarWhereDataCampo(
  campo: string,
  periodo: PeriodoRelatorio
): Record<string, unknown> {
  return {
    [campo]: {
      gte: new Date(`${periodo.dataInicio}T00:00:00`),
      lte: new Date(`${periodo.dataFim}T23:59:59`),
    },
  };
}
