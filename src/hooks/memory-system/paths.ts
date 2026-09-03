import { join } from "node:path"

export interface MemoryPaths {
  project: string
  rootName: string
  root: string
  memory: string
  full: string
  longTerm: string
  index: string
  migrations: string
  learnings: string
  evals: string
}

export function createMemoryPaths(project: string, rootName = ".opencode"): MemoryPaths {
  const root = join(project, rootName)
  const memory = join(root, "memory")
  return {
    project,
    rootName,
    root,
    memory,
    full: join(memory, "full"),
    longTerm: join(root, "MEMORY.md"),
    index: join(memory, "index.json"),
    migrations: join(memory, "migrations"),
    learnings: join(root, "learnings"),
    evals: join(root, "evals"),
  }
}
