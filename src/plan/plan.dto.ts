export interface CreatePlan {
  name: string;
  enrollAmount: number;
}

export interface UpdatePlan extends CreatePlan {
  id: string;
}
