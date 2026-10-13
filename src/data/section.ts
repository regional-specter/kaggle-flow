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

export function ask(
  tone: StudyTone,
  toneLabel: string,
  points: [string, string, string, string][],
): StudySection {
  return {
    tone,
    toneLabel,
    points: points.map(([title, problem, question, detail]) => ({
      title,
      problem,
      question,
      detail,
    })),
  }
}
