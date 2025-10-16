import { ComplexityLevel, COMPLEXITY_CONFIGS, BranchOption } from '../types';
import { GeminiClient } from './gemini';

export class Planner {
  private gemini: GeminiClient;

  constructor() {
    this.gemini = new GeminiClient();
  }

  async planBranch(
    parentPrompt: string,
    hint: string | undefined,
    k: number | undefined,
    complexity: ComplexityLevel
  ): Promise<BranchOption[]> {
    const config = COMPLEXITY_CONFIGS[complexity];
    const branchCount = k || config.defaultBranches;
    const clampedK = Math.max(2, Math.min(8, branchCount));

    try {
      const result = await this.gemini.branch(parentPrompt, hint, clampedK);
      
      return result.options.map((opt: any) => ({
        title: opt.title,
        summary: opt.rationale,
        type: 'llm' as const,
        reasoning: opt.outline,
        hints: [],
      }));
    } catch (error) {
      console.error('Branch planning error:', error);
      throw new Error('Failed to plan branch');
    }
  }

  async planDeepDive(
    parentPrompt: string,
    description: string | undefined,
    complexity: ComplexityLevel
  ): Promise<Array<{ title: string; type: 'llm' | 'research'; summary: string }>> {
    const config = COMPLEXITY_CONFIGS[complexity];
    const cuBudget = config.cu;

    try {
      const result = await this.gemini.deepDive(parentPrompt, description, cuBudget);
      
      // Ensure we don't exceed CU budget
      let totalCU = 0;
      const steps: Array<{ title: string; type: 'llm' | 'research'; summary: string }> = [];
      
      for (const step of result.steps) {
        const stepCost = step.type === 'research' ? 2 : 1;
        if (totalCU + stepCost <= cuBudget) {
          steps.push({
            title: step.title,
            type: step.type,
            summary: step.summary,
          });
          totalCU += stepCost;
        } else {
          break;
        }
      }

      return steps;
    } catch (error) {
      console.error('Deep dive planning error:', error);
      throw new Error('Failed to plan deep dive');
    }
  }

  calculateCost(nodeCount: number, nodeType: 'llm' | 'research' = 'llm'): number {
    // Rough cost estimation: 1 cent per LLM node, 2 cents per research node
    const baseCost = nodeType === 'research' ? 2 : 1;
    return nodeCount * baseCost;
  }

  calculateCU(nodeType: 'llm' | 'research', count: number = 1): number {
    return nodeType === 'research' ? count * 2 : count;
  }
}

