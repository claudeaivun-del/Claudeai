import axios, { AxiosInstance } from 'axios'
import { GeminiParser } from './gemini-parser'

export interface GeminiEngineOptions {
  timeout?: number
}

export class GeminiEngine {
  private client: AxiosInstance
  private baseURL = 'https://generativelanguage.googleapis.com/v1beta/models'
  private parser: GeminiParser

  constructor(private options: GeminiEngineOptions = {}) {
    this.parser = new GeminiParser()
    
    this.client = axios.create({
      timeout: options.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  async sendTextRequest(prompt: string): Promise<string> {
    try {
      const url = `${this.baseURL}/gemini-2.0-flash:generateContent`

      const response = await this.client.post(url, {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 1,
          maxOutputTokens: 4096,
        },
      })

      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return response.data.candidates[0].content.parts[0].text
      }

      throw new Error('Invalid Gemini response format')
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async *streamRequest(prompt: string): AsyncGenerator<string> {
    try {
      const url = `${this.baseURL}/gemini-2.0-flash:streamGenerateContent`

      const response = await this.client.post(
        url,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 1,
            maxOutputTokens: 4096,
          },
        },
        {
          responseType: 'stream',
          timeout: 60000,
        }
      )

      for await (const chunk of response.data) {
        const lines = chunk.toString().split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const json = JSON.parse(line.slice(6))
              if (json?.candidates?.[0]?.content?.parts?.[0]?.text) {
                yield json.candidates[0].content.parts[0].text
              }
            } catch (e) {
              // تجاهل أخطاء parsing
            }
          }
        }
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.sendTextRequest('Hello')
      return true
    } catch {
      return false
    }
  }

  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      return new Error(
        `Gemini API Error: ${error.response?.status} - ${error.response?.data?.error?.message || error.message}`
      )
    }
    return error instanceof Error ? error : new Error(String(error))
  }
}
