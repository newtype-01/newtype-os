export function createSessionWaitGraph() {
  const targets = new Map<string, string>()

  function reserve(caller: string, target: string) {
    if (caller === target) return blocked([caller, target])

    const chain = [caller, target]
    const seen = new Set([caller])
    let current = target

    while (targets.has(current)) {
      current = targets.get(current)!
      chain.push(current)
      if (current === caller) return blocked(chain)
      if (seen.has(current)) break
      seen.add(current)
    }

    if (targets.has(caller)) {
      return {
        allowed: false as const,
        message: `❌ Task resume blocked: session ${caller} is already waiting for ${targets.get(caller)}.`,
      }
    }

    const existingCaller = [...targets.entries()].find((entry) => entry[1] === target)?.[0]
    if (existingCaller) {
      return {
        allowed: false as const,
        message: `❌ Task resume blocked: session ${target} is already being resumed by ${existingCaller}.`,
      }
    }

    targets.set(caller, target)
    let released = false
    return {
      allowed: true as const,
      release: () => {
        if (released) return
        released = true
        if (targets.get(caller) === target) targets.delete(caller)
      },
    }
  }

  return { reserve }
}

function blocked(chain: string[]) {
  return {
    allowed: false as const,
    message: [
      "❌ Task resume blocked: circular session wait detected.",
      "",
      `Wait chain: ${chain.join(" -> ")}`,
      "Return the current result to the caller instead of resuming a session in this chain.",
    ].join("\n"),
  }
}
