// Practice-related interfaces
export interface QuestionnaireData {
  practices: Practice[];
}

export interface Practice {
  practice: string;
  sdlcPhases: SDLCPhase[];
}

export interface SDLCPhase {
  phase: string;
  activities: Activity[];
}

export interface Activity {
  activity: string;
  description?: string;
}
