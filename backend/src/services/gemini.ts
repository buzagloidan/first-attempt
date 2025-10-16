import { GoogleGenerativeAI, GenerativeModel, GenerateContentResult } from '@google/generative-ai';
import { config } from '../config';

export class GeminiClient {
  private client: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(modelId: string = config.gemini.model) {
    this.client = new GoogleGenerativeAI(config.gemini.apiKey);
    this.model = this.client.getGenerativeModel({ model: modelId });
  }

  async generateContent(prompt: string, systemInstruction?: string): Promise<GenerateContentResult> {
    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction: systemInstruction ? { role: 'system', parts: [{ text: systemInstruction }] } : undefined,
      });
      return result;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  async generateJSON<T = any>(prompt: string, systemInstruction?: string): Promise<T> {
    const result = await this.generateContent(prompt, systemInstruction);
    const text = result.response.text();
    
    // Extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || text.match(/(\{[\s\S]*\})/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    
    return JSON.parse(text);
  }

  async *generateContentStream(prompt: string, systemInstruction?: string): AsyncGenerator<string> {
    try {
      const result = await this.model.generateContentStream({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction: systemInstruction ? { role: 'system', parts: [{ text: systemInstruction }] } : undefined,
      });

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          yield text;
        }
      }
    } catch (error) {
      console.error('Gemini streaming error:', error);
      throw error;
    }
  }

  async branch(parentPrompt: string, hint: string | undefined, k: number): Promise<any> {
    const systemPrompt = `You are a reasoning assistant. Generate ${k} distinct, decision-oriented alternatives to explore the given topic. 
Each option should have a short title and a 1-paragraph rationale explaining why this direction is valuable.
Return your response as a JSON object with this exact structure:
{
  "options": [
    {
      "title": "Short descriptive title",
      "rationale": "One paragraph explaining the value of this direction",
      "outline": "Optional brief outline of sub-topics"
    }
  ]
}
No preamble, just the JSON.`;

    const prompt = hint 
      ? `Topic: ${parentPrompt}\n\nSpecial focus: ${hint}\n\nGenerate ${k} distinct exploration paths.`
      : `Topic: ${parentPrompt}\n\nGenerate ${k} distinct exploration paths.`;

    return await this.generateJSON(prompt, systemPrompt);
  }

  async deepDive(parentPrompt: string, description: string | undefined, cuBudget: number): Promise<any> {
    const systemPrompt = `You are a reasoning assistant that plans research subtrees. Given a topic and CU budget, plan a series of exploration steps.
Each step costs 1 CU for an LLM node or 2 CU for a research node.
For each step, provide a title, type (llm or research), and a brief summary of what this step explores.
Return your response as a JSON object with this exact structure:
{
  "steps": [
    {
      "title": "Step title",
      "type": "llm",
      "summary": "Brief description of what this step explores"
    }
  ]
}
No preamble, just the JSON.`;

    const prompt = description
      ? `Topic: ${parentPrompt}\n\nFocus: ${description}\n\nCU Budget: ${cuBudget}\n\nPlan exploration steps within budget.`
      : `Topic: ${parentPrompt}\n\nCU Budget: ${cuBudget}\n\nPlan exploration steps within budget.`;

    return await this.generateJSON(prompt, systemPrompt);
  }

  async flatten(nodes: Array<{ id: string; title: string; summary: string }>): Promise<string> {
    const systemPrompt = `You are a summarization assistant. Given a list of reasoning nodes from a decision tree, create a cohesive summary.
Remove duplicate information and organize insights into clear sections.
Include relevant citations and attribute ideas to their source nodes.
Return clean Markdown with sections, bullet points for key insights, and a citations list at the end.`;

    const nodesList = nodes.map((n, i) => `${i + 1}. [${n.id}] ${n.title}: ${n.summary}`).join('\n');
    const prompt = `Summarize these reasoning nodes into a cohesive document:\n\n${nodesList}`;

    const result = await this.generateContent(prompt, systemPrompt);
    return result.response.text();
  }

  async executeNode(prompt: string, type: 'llm' | 'research'): Promise<string> {
    const systemPrompt = type === 'research'
      ? 'You are a research assistant. Provide factual, well-reasoned information with specific claims. Mark any uncertainty.'
      : 'You are a reasoning assistant. Provide clear, logical analysis.';

    const result = await this.generateContent(prompt, systemPrompt);
    return result.response.text();
  }
}

