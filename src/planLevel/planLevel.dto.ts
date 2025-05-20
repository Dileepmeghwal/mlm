export interface CreatePlanLevelDto {
  plan: string;
  levelName: string;
  levelCreditAmount: number;
  levelBonusAmount: number;
  levelBonusDuration: {
    value: number;
    unit: "day" | "days" | "month" | "months";
  };
  bonusTeam?: number;
}

export interface UpdatePlanLevelDto extends CreatePlanLevelDto {
  id: string;
}
