/** Server-derived onboarding state. This does NOT assert a widget was installed or tested. */
export type SetupEvidence = {
  workspaceName: string;
  allowedOrigins: string[];
  knowledgeCount: number;
};

export function setupStatus(evidence: SetupEvidence) {
  const steps = [
    {key:'workspace', label:'Owner workspace created', complete: evidence.workspaceName.trim().length > 0},
    {key:'origin', label:'At least one approved website origin', complete: evidence.allowedOrigins.length > 0},
    {key:'knowledge', label:'At least one approved knowledge article', complete: evidence.knowledgeCount > 0},
    {key:'widget', label:'Widget installation and handoff tested by owner', complete: false},
  ] as const;
  return {
    steps,
    preparatoryStepsComplete: steps.slice(0,3).every(s=>s.complete),
    widgetVerified: false,
    productionApproved: false,
    note: 'Workspace configuration is not proof that a widget is installed, that answers are correct, or that customer-data/hosted acceptance passed.',
  };
}
