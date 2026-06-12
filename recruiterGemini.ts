import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || "" });

export interface JDAnalysis {
  title: string;
  requiredSkills: string[];
  experienceLevel: string;
  keywords: string[];
  qualityScore: number;
  marketInsights: {
    skillDemand: string;
    salaryTrend: string;
    hiringCompetitiveness: string;
  };
}

export interface CandidateMatch {
  name: string;
  score: number;
  skillsMatch: string[];
  experienceRaw: string;
}

export async function analyzeJD(jdText: string): Promise<JDAnalysis> {
  const model = "gemini-3-flash-preview";

  const prompt = `
    Analyze the following Job Description (JD) text. 
    Extract the following details in JSON format:
    1. A professional title for the job.
    2. A list of required technical and soft skills.
    3. The expected experience level (e.g., Junior, Mid, Senior, Lead).
    4. Key industry keywords.
    5. A JD Quality Score (0-100) based on how well-defined the responsibilities and requirements are.
    6. Market insights (Skill demand, Salary trend, Hiring competitiveness) for this specific role.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        { parts: [{ text: prompt }, { text: `JD TEXT:\n${jdText}` }] }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            experienceLevel: { type: Type.STRING },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            qualityScore: { type: Type.INTEGER },
            marketInsights: {
              type: Type.OBJECT,
              properties: {
                skillDemand: { type: Type.STRING },
                salaryTrend: { type: Type.STRING },
                hiringCompetitiveness: { type: Type.STRING }
              }
            }
          },
          required: ["title", "requiredSkills", "experienceLevel", "qualityScore"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Empty response from AI engine.");
    }

    return JSON.parse(response.text) as JDAnalysis;
  } catch (error: any) {
    console.error("JD Analysis Failure:", error);
    throw new Error(`JD Analysis failed: ${error.message}`);
  }
}

export async function matchCandidates(jdAnalysis: JDAnalysis, resumeTexts: string[]): Promise<CandidateMatch[]> {
  const model = "gemini-3-flash-preview";

  const prompt = `
    Compare the following resumes against this Job Description requirement:
    JD Title: ${jdAnalysis.title}
    Required Skills: ${jdAnalysis.requiredSkills.join(", ")}
    Experience Level: ${jdAnalysis.experienceLevel}

    For each resume, provide:
    1. Candidate Name
    2. Match Score (0-100)
    3. Matching Skills (from the JD list)
    4. Experience Summary (brief)
    
    Return a JSON array of matches.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        { parts: [{ text: prompt }, { text: `RESUMES:\n${resumeTexts.join("\n---NEW RESUME---\n")}` }] }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              score: { type: Type.INTEGER },
              skillsMatch: { type: Type.ARRAY, items: { type: Type.STRING } },
              experienceRaw: { type: Type.STRING }
            },
            required: ["name", "score"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]") as CandidateMatch[];
  } catch (error: any) {
    console.error("Match Failure:", error);
    return [];
  }
}

/**
 * Generates a full professional Job Description based on a short title or basic requirements.
 */
export async function generateJD(prompt: string): Promise<string> {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    You are an expert technical recruiter and professional writer.
    Your task is to write a comprehensive, high-quality Job Description.
    Include standard sections: Job Title, About the Role, Key Responsibilities, Required Skills (Technical & Soft), and Nice-to-haves.
    Use professional formatting with markdown (bolding, lists).
    Make it attractive to top-tier talent.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: `Generate a Job Description for: ${prompt}` }] }],
      config: {
        systemInstruction,
      }
    });

    return response.text || "Failed to generate JD content. Please try a more specific prompt.";
  } catch (error) {
    console.error("JD Generation Failure:", error);
    return "I'm sorry, I couldn't generate the JD at this moment.";
  }
}
