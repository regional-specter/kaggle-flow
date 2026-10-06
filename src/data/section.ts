import type { StudySection, StudyTone } from '../types/curator'

export function sec(
  tone: StudyTone,
  toneLabel: string,
  points: [string, string][],
): StudySection {
  return {
    tone,
    toneLabel,
    points: points.map(([title, detail]) => ({ title, detail })),
  }
}
