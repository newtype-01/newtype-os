import { describe, test, expect } from "bun:test"
import { DEFAULT_CATEGORIES, CATEGORY_PROMPT_APPENDS, CATEGORY_DESCRIPTIONS, CHIEF_TASK_DESCRIPTION } from "./constants"
import type { CategoryConfig } from "../../config/schema"
import { createTaskGuard } from "./task-guard"

function resolveCategoryConfig(
  categoryName: string,
  userCategories?: Record<string, CategoryConfig>
): { config: CategoryConfig; promptAppend: string } | null {
  const defaultConfig = DEFAULT_CATEGORIES[categoryName]
  const userConfig = userCategories?.[categoryName]
  const defaultPromptAppend = CATEGORY_PROMPT_APPENDS[categoryName] ?? ""

  if (!defaultConfig && !userConfig) {
    return null
  }

  const config: CategoryConfig = {
    ...defaultConfig,
    ...userConfig,
  }

  let promptAppend = defaultPromptAppend
  if (userConfig?.prompt_append) {
    promptAppend = defaultPromptAppend
      ? defaultPromptAppend + "\n\n" + userConfig.prompt_append
      : userConfig.prompt_append
  }

  return { config, promptAppend }
}

describe("chief-task", () => {
  describe("task circuit breaker", () => {
    test("blocks after max_per_session reservations", () => {
      // #given
      const guard = createTaskGuard({ max_per_session: 2 })
      const first = guard.reserve("root", "first")
      const second = guard.reserve("root", "second")

      // #when
      const third = guard.reserve("root", "third")

      // #then
      expect(first.allowed).toBe(true)
      expect(second.allowed).toBe(true)
      expect(third.allowed).toBe(false)
      if (!third.allowed) {
        expect(third.message).toContain("session task limit")
      }
    })

    test("release frees a failed reservation", () => {
      // #given
      const guard = createTaskGuard({ max_per_session: 1 })
      const first = guard.reserve("root", "first")
      if (!first.allowed) throw new Error("expected first reservation")

      // #when
      first.release()
      const second = guard.reserve("root", "second")

      // #then
      expect(second.allowed).toBe(true)
    })

    test("commit tracks descendant depth", () => {
      // #given
      const guard = createTaskGuard({ max_depth: 1 })
      const first = guard.reserve("root", "first")
      if (!first.allowed) throw new Error("expected first reservation")
      first.commit("child")

      // #when
      const nested = guard.reserve("child", "nested")

      // #then
      expect(nested.allowed).toBe(false)
      if (!nested.allowed) {
        expect(nested.message).toContain("maximum task depth")
      }
    })

    test("blocks rapid task creation by max_per_minute", () => {
      // #given
      const guard = createTaskGuard({ max_per_minute: 1 })
      const first = guard.reserve("root", "first")

      // #when
      const second = guard.reserve("root", "second")

      // #then
      expect(first.allowed).toBe(true)
      expect(second.allowed).toBe(false)
      if (!second.allowed) {
        expect(second.message).toContain("rate limit")
      }
    })

    test("blocks repeated equivalent tasks", () => {
      // #given
      const guard = createTaskGuard({ max_duplicate_tasks: 2 })
      const first = guard.reserve("root", "ocr page", "Read /tmp/pages/page_15.png")
      const second = guard.reserve("root", "ocr page", "Read /tmp/pages/page_15.png")

      // #when
      const third = guard.reserve("root", "ocr page", "Read /tmp/pages/page_15.png")

      // #then
      expect(first.allowed).toBe(true)
      expect(second.allowed).toBe(true)
      expect(third.allowed).toBe(false)
      if (!third.allowed) {
        expect(third.message).toContain("duplicate task loop")
      }
    })

    test("does not collapse distinct numbered files", () => {
      // #given
      const guard = createTaskGuard({ max_duplicate_tasks: 1 })
      const first = guard.reserve("root", "ocr page", "Read /tmp/pages/page_15.png")

      // #when
      const second = guard.reserve("root", "ocr page", "Read /tmp/pages/page_16.png")

      // #then
      expect(first.allowed).toBe(true)
      expect(second.allowed).toBe(true)
    })

    test("chief_task blocks before creating an extra session", async () => {
      // #given
      const { createChiefTask } = require("./tools")
      let created = 0
      let promptMessageID = ""
      const mockManager = { launch: async () => ({}) }
      const mockClient = {
        session: {
          create: async () => {
            created++
            return { data: { id: `session-${created}` } }
          },
          promptAsync: async ({ body }: { body: { messageID: string } }) => {
            promptMessageID = body.messageID
            return { data: {} }
          },
          status: async () => ({ data: {} }),
          messages: async () => ({
            data: [
              {
                info: { role: "assistant", parentID: promptMessageID, time: { created: Date.now() } },
                parts: [{ type: "text", text: "done" }],
              },
            ],
          }),
        },
      }

      const tool = createChiefTask({
        manager: mockManager,
        client: mockClient,
        taskCircuitBreaker: { max_per_session: 1 },
      })

      const ctx = {
        sessionID: "root",
        messageID: "message",
        agent: "chief",
        abort: new AbortController().signal,
      }

      await tool.execute(
        {
          description: "first",
          prompt: "Do it",
          category: "writing",
          run_in_background: false,
          skills: [],
        },
        ctx
      )

      // #when
      const result = await tool.execute(
        {
          description: "second",
          prompt: "Do it again",
          category: "writing",
          run_in_background: false,
          skills: [],
        },
        ctx
      )

      // #then
      expect(created).toBe(1)
      expect(result).toContain("Task circuit breaker")
    })
  })

  describe("DEFAULT_CATEGORIES", () => {
    test("research category has temperature only (no hardcoded model)", () => {
      // #given
      const category = DEFAULT_CATEGORIES["research"]

      // #when / #then
      expect(category).toBeDefined()
      expect(category.model).toBeUndefined()
      expect(category.temperature).toBe(0.5)
    })

    test("writing category has temperature only (no hardcoded model)", () => {
      // #given
      const category = DEFAULT_CATEGORIES["writing"]

      // #when / #then
      expect(category).toBeDefined()
      expect(category.model).toBeUndefined()
      expect(category.temperature).toBe(0.7)
    })
  })

  describe("CATEGORY_PROMPT_APPENDS", () => {
    test("research category has researcher-focused prompt", () => {
      // #given
      const promptAppend = CATEGORY_PROMPT_APPENDS["research"]

      // #when / #then
      expect(promptAppend).toContain("RESEARCH")
      expect(promptAppend).toContain("Researcher")
    })

    test("writing category has writer prompt", () => {
      // #given
      const promptAppend = CATEGORY_PROMPT_APPENDS["writing"]

      // #when / #then
      expect(promptAppend).toContain("WRITING")
      expect(promptAppend).toContain("Writer")
    })
  })

  describe("CATEGORY_DESCRIPTIONS", () => {
    test("has description for all default categories", () => {
      // #given
      const defaultCategoryNames = Object.keys(DEFAULT_CATEGORIES)

      // #when / #then
      for (const name of defaultCategoryNames) {
        expect(CATEGORY_DESCRIPTIONS[name]).toBeDefined()
        expect(CATEGORY_DESCRIPTIONS[name].length).toBeGreaterThan(0)
      }
    })

    test("fact-check category exists and has description", () => {
      // #given / #when
      const description = CATEGORY_DESCRIPTIONS["fact-check"]

      // #then
      expect(description).toBeDefined()
      expect(description).toContain("verification")
    })
  })

  describe("CHIEF_TASK_DESCRIPTION", () => {
    test("documents background parameter", () => {
      // #given / #when / #then
      expect(CHIEF_TASK_DESCRIPTION).toContain("background")
      expect(CHIEF_TASK_DESCRIPTION).toContain("run_in_background")
    })

    test("documents agent types", () => {
      // #given / #when / #then
      expect(CHIEF_TASK_DESCRIPTION).toContain("researcher")
      expect(CHIEF_TASK_DESCRIPTION).toContain("writer")
    })

    test("documents explicit downstream skill propagation", () => {
      // #given / #when / #then
      expect(CHIEF_TASK_DESCRIPTION).toContain("Skill Propagation")
      expect(CHIEF_TASK_DESCRIPTION).toContain("do not automatically propagate")
      expect(CHIEF_TASK_DESCRIPTION).toContain("skills=[\"super-writer\"]")
    })
  })

  describe("resolveCategoryConfig", () => {
    test("returns null for unknown category without user config", () => {
      // #given
      const categoryName = "unknown-category"

      // #when
      const result = resolveCategoryConfig(categoryName)

      // #then
      expect(result).toBeNull()
    })

    test("returns default config for builtin category (no model)", () => {
      // #given
      const categoryName = "research"

      // #when
      const result = resolveCategoryConfig(categoryName)

      // #then
      expect(result).not.toBeNull()
      expect(result!.config.model).toBeUndefined()
      expect(result!.promptAppend).toContain("RESEARCH")
    })

    test("user config overrides default model", () => {
      // #given
      const categoryName = "research"
      const userCategories = {
        "research": { model: "anthropic/claude-opus-4-5" },
      }

      // #when
      const result = resolveCategoryConfig(categoryName, userCategories)

      // #then
      expect(result).not.toBeNull()
      expect(result!.config.model).toBe("anthropic/claude-opus-4-5")
    })

    test("user prompt_append is appended to default", () => {
      // #given
      const categoryName = "research"
      const userCategories = {
        "research": {
          model: "google/antigravity-gemini-3-pro-high",
          prompt_append: "Custom instructions here",
        },
      }

      // #when
      const result = resolveCategoryConfig(categoryName, userCategories)

      // #then
      expect(result).not.toBeNull()
      expect(result!.promptAppend).toContain("RESEARCH")
      expect(result!.promptAppend).toContain("Custom instructions here")
    })

    test("user can define custom category", () => {
      // #given
      const categoryName = "my-custom"
      const userCategories = {
        "my-custom": {
          model: "openai/gpt-5.2",
          temperature: 0.5,
          prompt_append: "You are a custom agent",
        },
      }

      // #when
      const result = resolveCategoryConfig(categoryName, userCategories)

      // #then
      expect(result).not.toBeNull()
      expect(result!.config.model).toBe("openai/gpt-5.2")
      expect(result!.config.temperature).toBe(0.5)
      expect(result!.promptAppend).toBe("You are a custom agent")
    })

    test("user category overrides temperature", () => {
      // #given
      const categoryName = "research"
      const userCategories = {
        "research": {
          model: "google/antigravity-gemini-3-pro-high",
          temperature: 0.3,
        },
      }

      // #when
      const result = resolveCategoryConfig(categoryName, userCategories)

      // #then
      expect(result).not.toBeNull()
      expect(result!.config.temperature).toBe(0.3)
    })
  })

  describe("skills parameter", () => {
    test("CHIEF_TASK_DESCRIPTION documents skills parameter", () => {
      // #given / #when / #then
      expect(CHIEF_TASK_DESCRIPTION).toContain("skills")
      expect(CHIEF_TASK_DESCRIPTION).toContain("Array of skill names")
    })

    test("skills parameter is required - returns error when not provided", async () => {
      // #given
      const { createChiefTask } = require("./tools")
      
      const mockManager = { launch: async () => ({}) }
      const mockClient = {
        app: { agents: async () => ({ data: [] }) },
        session: {
          create: async () => ({ data: { id: "test-session" } }),
          prompt: async () => ({ data: {} }),
          messages: async () => ({ data: [] }),
        },
      }
      
      const tool = createChiefTask({
        manager: mockManager,
        client: mockClient,
      })
      
      const toolContext = {
        sessionID: "parent-session",
        messageID: "parent-message",
        agent: "chief",
        abort: new AbortController().signal,
      }
      
      // #when - skills not provided (undefined)
      const result = await tool.execute(
        {
          description: "Test task",
          prompt: "Do something",
          category: "research",
          run_in_background: false,
        },
        toolContext
      )
      
      // #then - should return error about missing skills
      expect(result).toContain("skills")
      expect(result).toContain("REQUIRED")
    })
  })

  describe("resume with background parameter", () => {
  test("resume with background=false should wait for result and return content", async () => {
    // #given
    const { createChiefTask } = require("./tools")
    
    const mockTask = {
      id: "task-123",
      sessionID: "ses_resume_test",
      description: "Resumed task",
      agent: "researcher",
      status: "running",
    }
    
    const mockManager = {
      resume: async () => mockTask,
      launch: async () => mockTask,
    }
    
    let submittedID = ""
    let submittedAgent = ""
    let submittedModel = ""
    const mockClient = {
      session: {
        get: async () => ({ data: { id: "parent-session" } }),
        status: async () => ({ data: {} }),
        abort: async () => ({ data: true }),
        promptAsync: async (input: { body: { messageID: string } }) => {
          submittedID = input.body.messageID
          submittedAgent = (input.body as { agent?: string }).agent ?? ""
          submittedModel = (input.body as { model?: { modelID?: string } }).model?.modelID ?? ""
          return { data: {} }
        },
        messages: async () => ({
          data: [
            {
              info: {
                role: "user",
                agent: "researcher",
                model: { providerID: "openai", modelID: "test-model" },
                time: { created: 1 },
              },
              parts: [{ type: "text", text: "Original task" }],
            },
            {
              info: { role: "assistant", parentID: submittedID, time: { created: Date.now() } },
              parts: [{ type: "text", text: "This is the resumed task result" }],
            },
          ],
        }),
      },
      app: {
        agents: async () => ({ data: [] }),
      },
    }
    
    const tool = createChiefTask({
      manager: mockManager,
      client: mockClient,
      pollIntervalMs: 1,
    })
    
    const toolContext = {
      sessionID: "parent-session",
      messageID: "parent-message",
      agent: "chief",
      abort: new AbortController().signal,
    }
    
    // #when
    const result = await tool.execute(
      {
        description: "Resume test",
        prompt: "Continue the task",
        resume: "ses_resume_test",
        run_in_background: false,
        skills: [],
      },
      toolContext
    )
    
    // #then - should contain actual result, not just "Background task resumed"
    expect(result).toContain("This is the resumed task result")
    expect(result).not.toContain("Background task resumed")
    expect(submittedAgent).toBe("researcher")
    expect(submittedModel).toBe("test-model")
  })

  test("resume with background=true should return immediately without waiting", async () => {
    // #given
    const { createChiefTask } = require("./tools")
    
    const mockTask = {
      id: "task-456",
      sessionID: "ses_bg_resume",
      description: "Background resumed task",
      agent: "researcher",
      status: "running",
    }
    
    const mockManager = {
      resume: async () => mockTask,
    }
    
    const mockClient = {
      session: {
        get: async () => ({ data: { id: "parent-session" } }),
        status: async () => ({ data: {} }),
        prompt: async () => ({ data: {} }),
        messages: async () => ({
          data: [],
        }),
      },
    }
    
    const tool = createChiefTask({
      manager: mockManager,
      client: mockClient,
    })
    
    const toolContext = {
      sessionID: "parent-session",
      messageID: "parent-message",
      agent: "chief",
      abort: new AbortController().signal,
    }
    
    // #when
    const result = await tool.execute(
      {
        description: "Resume bg test",
        prompt: "Continue in background",
        resume: "ses_bg_resume",
        run_in_background: true,
        skills: [],
      },
      toolContext
    )
    
    // #then - should return background message
    expect(result).toContain("Background task resumed")
    expect(result).toContain("task-456")
  })
})

describe("buildSystemContent", () => {
    test("returns undefined when no skills and no category promptAppend", () => {
      // #given
      const { buildSystemContent } = require("./tools")

      // #when
      const result = buildSystemContent({ skills: undefined, categoryPromptAppend: undefined })

      // #then
      expect(result).toBeUndefined()
    })

    test("returns skill content only when skills provided without category", () => {
      // #given
      const { buildSystemContent } = require("./tools")
      const skillContent = "You are a playwright expert"

      // #when
      const result = buildSystemContent({ skillContent, categoryPromptAppend: undefined })

      // #then
      expect(result).toBe(skillContent)
    })

    test("returns category promptAppend only when no skills", () => {
      // #given
      const { buildSystemContent } = require("./tools")
      const categoryPromptAppend = "Focus on visual design"

      // #when
      const result = buildSystemContent({ skillContent: undefined, categoryPromptAppend })

      // #then
      expect(result).toBe(categoryPromptAppend)
    })

    test("combines skill content and category promptAppend with separator", () => {
      // #given
      const { buildSystemContent } = require("./tools")
      const skillContent = "You are a playwright expert"
      const categoryPromptAppend = "Focus on visual design"

      // #when
      const result = buildSystemContent({ skillContent, categoryPromptAppend })

      // #then
      expect(result).toContain(skillContent)
      expect(result).toContain(categoryPromptAppend)
      expect(result).toContain("\n\n")
    })
  })
})
