import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || "" });

export interface EvaluationResult {
  candidateInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  atsScore: number;
  skills: {
    technical: string[];
    soft: string[];
  };
  experience: {
    role: string;
    company: string;
    duration: string;
    description: string;
  }[];
  jobMatch: {
    score: number;
    alignedSkills: string[];
    missingSkills: string[];
    recommendations: string[];
  };
  resumeImprovements: string[];
}

/**
 * Analyzes resume text against an optional job description using the Gemini API (Frontend).
 */
export async function analyzeResume(resumeText: string, jobDescription?: string): Promise<EvaluationResult> {
  const model = "gemini-3-flash-preview";

  const prompt = `
    Analyze the following resume text. 
    ${jobDescription ? `Compare it against this job description: "${jobDescription}"` : "Perform a general professional analysis."}
    
    Provide a comprehensive evaluation including:
    1. Candidate contact details.
    2. An ATS score (0-100) based on industry standards (keyword density, formatting suitability, clarity).
    3. Extracted technical and soft skills.
    4. Professional experience summary.
    5. Job match score and specific gaps/recommendations if a job description was provided.
    6. Practical resume improvement suggestions.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        { parts: [{ text: prompt }, { text: `RESUME TEXT:\n${resumeText}` }] }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            candidateInfo: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                location: { type: Type.STRING }
              },
              required: ["name", "email"]
            },
            atsScore: { type: Type.INTEGER },
            skills: {
              type: Type.OBJECT,
              properties: {
                technical: { type: Type.ARRAY, items: { type: Type.STRING } },
                soft: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            experience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  role: { type: Type.STRING },
                  company: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  description: { type: Type.STRING }
                }
              }
            },
            jobMatch: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.INTEGER },
                alignedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            resumeImprovements: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["atsScore", "candidateInfo", "skills", "experience"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Empty response from AI engine.");
    }

    return JSON.parse(response.text) as EvaluationResult;
  } catch (error: any) {
    console.error("Gemini Analysis Failure:", error);
    throw new Error(`AI Analysis failed: ${error.message}`);
  }
}

/**
 * Generates tailored interview questions based on evaluation results.
 */
export async function generateInterviewQuestions(evaluation: EvaluationResult) {
  const model = "gemini-3-flash-preview";
  const prompt = `
    Based on the following candidate evaluation, generate 5 highly specific and challenging interview questions.
    Include:
    - 2 Technical questions based on their skills: ${evaluation.skills.technical.join(', ')}
    - 1 Role-specific question for their background as: ${evaluation.experience[0]?.role || 'Professional'}
    - 1 Behavioral question based on their experience.
    - 1 "Growth mindset" question.

    For each question, provide a short "What to look for in the answer" tip.
    
    Candidate Name: ${evaluation.candidateInfo.name}
    Job Match Score: ${evaluation.jobMatch.score}%
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              category: { type: Type.STRING },
              lookFor: { type: Type.STRING }
            },
            required: ["question", "category", "lookFor"]
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Interview Question Generation Failure:", error);
    return [];
  }
}

/**
 * Specialized chat tailored to the candidate's specific resume analysis.
 */
export async function chatAboutResume(
  userMessage: string, 
  history: { role: 'user' | 'model', text: string }[],
  context: EvaluationResult
) {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    You are TalentLens AI Assistant, an expert career coach and technical recruiter.
    You are helping ${context.candidateInfo.name} with their resume analysis results.
    
    Current Analysis Context:
    - ATS Score: ${context.atsScore}/100
    - Job Match: ${context.jobMatch.score}%
    - Key Technical Skills: ${context.skills.technical.slice(0, 5).join(', ')}
    - Recommendations: ${context.jobMatch.recommendations.join(', ')}
    
    Be professional, encouraging, and data-driven. If the user asks how to improve, refer to the recommendations provided. 
    Keep responses brief and actionable.
  `;

  try {
    const chatHistory = history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    }));

    const response = await ai.models.generateContent({
      model,
      contents: [...chatHistory, { role: 'user', parts: [{ text: userMessage }] }],
      config: {
        systemInstruction,
      }
    });

    return response.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("AI Chat Failure:", error);
    return "I'm having trouble connecting to my AI core right now. Please try again in a moment.";
  }
}
