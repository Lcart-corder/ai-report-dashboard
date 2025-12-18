import { OmikujiConfig, OmikujiResult, OmikujiDailyState, Contact } from "@/types/schema";

// Mock Data Store (In-memory for demo)
const dailyStates: Record<string, OmikujiDailyState> = {};
const contactPoints: Record<string, number> = {};

export interface OmikujiExecutionResult {
  success: boolean;
  message: string;
  points_awarded?: number;
  result_name?: string;
  is_blocked?: boolean;
}

export function executeOmikuji(
  omikuji: OmikujiConfig,
  results: OmikujiResult[],
  contact: Contact,
  now: Date = new Date()
): OmikujiExecutionResult {
  const today = now.toISOString().split('T')[0];
  const stateKey = `${omikuji.tenant_id}:${omikuji.id}:${contact.id}`;
  
  // 1. Check Daily Limit
  const lastState = dailyStates[stateKey];
  if (lastState && lastState.last_played_date === today) {
    return {
      success: false,
      message: "本日は既におみくじを引いています。",
      is_blocked: true
    };
  }

  // 2. Lottery Logic (Weighted Random)
  const totalWeight = results.reduce((sum, r) => sum + r.weight, 0);
  let random = Math.random() * totalWeight;
  let selectedResult: OmikujiResult | undefined;

  for (const result of results) {
    random -= result.weight;
    if (random <= 0) {
      selectedResult = result;
      break;
    }
  }

  if (!selectedResult) {
    // Fallback to the last one if something goes wrong (floating point issues)
    selectedResult = results[results.length - 1];
  }

  // 3. Update State
  dailyStates[stateKey] = {
    tenant_id: omikuji.tenant_id,
    omikuji_id: omikuji.id,
    contact_id: contact.id,
    last_played_date: today,
    last_result_id: selectedResult.id,
    updated_at: now.toISOString()
  };

  // 4. Award Points
  const currentPoints = contactPoints[contact.id] || 0;
  contactPoints[contact.id] = currentPoints + selectedResult.points_delta;

  return {
    success: true,
    message: selectedResult.name, // In real app, this would be the template content
    points_awarded: selectedResult.points_delta,
    result_name: selectedResult.name
  };
}

export function getContactPoints(contactId: string): number {
  return contactPoints[contactId] || 0;
}

export function resetDailyStatesForTesting() {
  for (const key in dailyStates) {
    delete dailyStates[key];
  }
}
