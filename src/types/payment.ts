
export interface BasePlano {
  id: string;
  clientName: string;
  type: 'plano' | 'semanal';
  amount: number;
  dueDate: string;
  created: string;
  active: boolean;
}

export interface PlanoMensal extends BasePlano {
  type: 'plano';
  month: number;
  totalMonths: number;
}

export interface PlanoSemanal extends BasePlano {
  type: 'semanal';
  week: number;
  totalWeeks: number;
}

export type Plano = PlanoMensal | PlanoSemanal;
