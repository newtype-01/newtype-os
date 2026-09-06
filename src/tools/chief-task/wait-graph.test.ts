import { describe, expect, test } from "bun:test"
import { createSessionWaitGraph } from "./wait-graph"

describe("session wait graph", () => {
  test("blocks self waits", () => {
    const graph = createSessionWaitGraph()

    const result = graph.reserve("session-a", "session-a")

    expect(result.allowed).toBe(false)
    if (!result.allowed) expect(result.message).toContain("circular session wait")
  })

  test("blocks a two-session cycle", () => {
    const graph = createSessionWaitGraph()
    const first = graph.reserve("session-a", "session-b")

    const result = graph.reserve("session-b", "session-a")

    expect(first.allowed).toBe(true)
    expect(result.allowed).toBe(false)
    if (!result.allowed) expect(result.message).toContain("session-b -> session-a -> session-b")
  })

  test("blocks a longer cycle", () => {
    const graph = createSessionWaitGraph()
    graph.reserve("session-a", "session-b")
    graph.reserve("session-b", "session-c")

    const result = graph.reserve("session-c", "session-a")

    expect(result.allowed).toBe(false)
    if (!result.allowed) expect(result.message).toContain("session-c -> session-a -> session-b -> session-c")
  })

  test("allows a new wait after release", () => {
    const graph = createSessionWaitGraph()
    const first = graph.reserve("session-a", "session-b")
    if (!first.allowed) throw new Error(first.message)
    first.release()

    const result = graph.reserve("session-b", "session-a")

    expect(result.allowed).toBe(true)
  })

  test("blocks concurrent resumes of the same target", () => {
    const graph = createSessionWaitGraph()
    graph.reserve("session-a", "session-c")

    const result = graph.reserve("session-b", "session-c")

    expect(result.allowed).toBe(false)
    if (!result.allowed) expect(result.message).toContain("already being resumed")
  })
})
