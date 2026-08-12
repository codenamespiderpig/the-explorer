export type SkillId = 'hunt' | 'build'

export interface Skill {
  id: SkillId
  name: string
  description: string
  cost: Partial<Record<'wood' | 'stone', number>>
}

export const SKILLS: Record<SkillId, Skill> = {
  hunt: {
    id: 'hunt',
    name: 'Hunt',
    description: 'Learn to hunt animals and craft hunting gear.',
    cost: { wood: 5 },
  },
  build: {
    id: 'build',
    name: 'Build',
    description: 'Learn to craft advanced buildings like a workbench.',
    cost: { stone: 5 },
  },
}

export const SKILL_LIST = Object.values(SKILLS)
