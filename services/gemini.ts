import { GoogleGenerativeAI } from "@google/generative-ai";
import { OnboardingData } from "../types";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
    console.warn("Gemini API Key is missing. Affirmations will not be generated.");
}

const genAI = new GoogleGenerativeAI(API_KEY || "");

export interface Affirmation {
    id: string;
    text: string;
    category?: string;
}

/**
 * Generates a batch of affirmations to optimize API usage and prevent rate limits.
 * Supports both single category and multi-category (custom mix) generation.
 */
export const generateAffirmationsBatch = async (
    userData: OnboardingData,
    count: number = 5,
    category?: string,
    categories?: string[]  // NEW: Multiple categories for custom mix
): Promise<Affirmation[]> => {
    try {
        if (!API_KEY) {
            throw new Error("API Key missing");
        }

        // Initialize model with JSON constraint
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash", // Reverting to 2.0-flash as 1.5 was not found (404)
            generationConfig: { responseMimeType: "application/json" }
        });

        // validate user data to avoid "undefined" in prompt
        const safeName = userData.name || "Usuario";
        const safeAge = userData.ageRange || "Adulto";

        // Category Theme Mapping
        const categoryThemes: Record<string, string[]> = {
            // Core categories
            'GENERAL': ["gratitud", "fuerza interior", "esperanza", "calma", "éxito", "amor propio", "confianza", "presente"],
            'MY_PHRASES': ["empoderamiento", "autenticidad", "voz interior", "sabiduría personal"],
            'FAVORITES': ["bienestar", "paz interior", "felicidad", "plenitud"],

            // Wellbeing
            'MINDFULNESS': ["mindfulness", "atención plena", "respiración consciente", "calma interior", "vivir el presente", "paz mental"],
            'ANXIETY': ["calma", "seguridad", "esto pasará", "respiración", "fortaleza interior", "paz", "tranquilidad"],
            'STRESS': ["alivio", "soltar tensión", "relajación profunda", "calma absoluta"],

            // Energy & Motivation
            'MOTIVATION': ["éxito", "propósito", "valentía", "determinación", "superación"],
            'ENERGY': ["energía", "vitalidad", "poder interior", "dinamismo"],

            // Self-care & Rest
            'SELFCARE': ["autocuidado", "amor propio", "compasión", "ternura", "descanso"],
            'SLEEP': ["descanso", "sueño profundo", "paz nocturna", "relajación"],

            // Mental clarity
            'FOCUS': ["concentración", "claridad", "enfoque", "atención"],
            'OVERTHINKING': ["calma mental", "soltar pensamientos", "paz interior", "presente"],
            'PEACE': ["paz", "serenidad", "armonía", "tranquilidad"],

            // Personal growth
            'GRATITUDE': ["gratitud", "apreciación", "reconocimiento", "abundancia"],
            'CONFIDENCE': ["confianza", "seguridad personal", "autenticidad", "fuerza"],
            'GROWTH': ["crecimiento", "evolución", "aprendizaje", "transformación"],

            // Relationships & Boundaries
            'BOUNDARIES': ["límites", "respeto propio", "dignidad", "protección"],
            'RELATIONSHIPS': ["conexión", "amor", "empatía", "relaciones sanas"],
            'CHANGE': ["cambio", "adaptación", "flexibilidad", "nueva etapa"],

            // Seasonal & Time-based
            'WINTER': ["calma invernal", "introspección", "renovación", "paz fría"],
            'MORNING': ["mañana", "nuevo comienzo", "energía matutina", "despertar"],
        };

        let themes: string[] = [];
        let additionalInstruction = "";

        // CUSTOM MIX MODE: Blend multiple category themes
        if (categories && categories.length > 0) {
            themes = categories.flatMap(cat => categoryThemes[cat] || []);
            // Remove duplicates
            themes = Array.from(new Set(themes));

            additionalInstruction = `IMPORTANTE: Genera afirmaciones que combinen los siguientes temas: ${themes.slice(0, 10).join(", ")}. 
Cada afirmación debe reflejar al menos 2-3 de estos temas de forma cohesiva y natural. No fuerces las combinaciones; busca conexiones orgánicas entre los conceptos.`;
        }
        // SINGLE CATEGORY MODE
        else if (category) {
            // First try to get specific themes for this category
            themes = categoryThemes[category] || [];

            // Add specific instructions for special categories
            if (category === 'MINDFULNESS') {
                additionalInstruction = "IMPORTANTE: Genera afirmaciones EXCLUSIVAMENTE sobre Mindfulness (Atención Plena). Deben invitar a respirar, pausar, observar y estar en el aquí y ahora. Usa un tono calmado, lento y profundo. Nada de éxito o productividad.";
            } else if (category === 'ANXIETY') {
                additionalInstruction = "IMPORTANTE: Genera afirmaciones para aliviar la ANSIEDAD. Deben transmitir seguridad, protección y la certeza de que todo estará bien. Usa un tono suave, protector y de calma absoluta. Nada de presión ni expectativas.";
            } else if (themes.length === 0) {
                // If category not found in map, fallback to General themes
                themes = [
                    "gratitud", "fuerza interior", "esperanza", "calma", "éxito",
                    "amor propio", "confianza", "presente", "superación", "paz mental",
                    "propósito", "valentía", "claridad", "autocuidado", "resiliencia",
                    "creatividad", "equilibrio", "libertad", "sabiduría", "autenticidad"
                ];
            } else {
                // For other specific categories (Winter, Energy, etc.), add a generic instruction to focus on the themes
                additionalInstruction = `IMPORTANTE: Enfócate en los temas: ${themes.join(", ")}.`;
            }
        } else {
            // Default General Fallback (no category provided)
            themes = [
                "gratitud", "fuerza interior", "esperanza", "calma", "éxito",
                "amor propio", "confianza", "presente", "superación", "paz mental",
                "propósito", "valentía", "claridad", "autocuidado", "resiliencia",
                "creatividad", "equilibrio", "libertad", "sabiduría", "autenticidad"
            ];
        }

        // Shuffle themes
        const shuffledThemes = themes.sort(() => 0.5 - Math.random()).slice(0, count);

        const prompt = `
      Eres un experto redactor de contenido "premium" para una app de bienestar.
      
      Usuario: ${safeName}, Edad: ${safeAge}.
      Temas sugeridos: ${shuffledThemes.join(", ")}.

      ${additionalInstruction}

      Genera ${count} afirmaciones ÚNICAS y PROFUNDAS.
      
      ESTILO "PREMIUM" (OBLIGATORIO):
      - Frases CORTAS y PODEROSAS (Máximo 10 palabras).
      - Tono: Seguro, calmado, elegante y directo al corazón.
      - Gramática PERFECTA.
      - EVITA lo cursi, lo genérico o lo infantil.
      - EVITA "Intro" o "Relleno".

      REGLAS CRÍTICAS:
      1. Responde SOLAMENTE con un ARRAY JSON de strings.
      2. Ejemplo: ["Soy suficiente.", "Mi paz es innegociable."]
      3. Si no puedes generar afirmaciones por alguna razón (seguridad, falta de datos), devuelve un array vacío [].
      4. NUNCA incluyas texto fuera del JSON.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        console.log("Gemini Raw Response:", text);

        let cleanAffirmations: string[] = [];

        try {
            cleanAffirmations = JSON.parse(text);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            // Fallback: try to find JSON array in text if MD blocks were used
            const match = text.match(/\[.*\]/s);
            if (match) {
                try {
                    cleanAffirmations = JSON.parse(match[0]);
                } catch (e2) {
                    throw new Error("Failed to parse JSON response");
                }
            } else {
                throw new Error("Invalid response format");
            }
        }

        if (!Array.isArray(cleanAffirmations) || cleanAffirmations.length === 0) {
            throw new Error("Empty or invalid affirmation array");
        }

        // Ensure we strictly respect the requested count
        const finalAffirmations = cleanAffirmations.slice(0, count);

        return finalAffirmations.map(t => ({
            id: Date.now().toString() + "-" + Math.random().toString(36).substr(2, 9),
            text: t,
            category: "Personalizado"
        }));

    } catch (error) {
        console.warn("Error generating batch (JSON Mode), using fallback:", error);

        const fallbacks = [
            "Soy capaz de superar cualquier desafío.",
            "Merezco todo lo bueno.",
            "Mi paz interior es prioridad.",
            "Cada día es una nueva oportunidad.",
            "Confío en mi intuición.",
            "Soy suficiente tal y como soy.",
            "Atraigo energía positiva.",
            "Me perdono y avanzo.",
            "Acepto mis emociones.",
            "Crezco con cada paso."
        ];

        const shuffled = fallbacks.sort(() => 0.5 - Math.random()).slice(0, Math.min(count, fallbacks.length));

        return shuffled.map(t => ({
            id: Date.now().toString() + "-fallback-" + Math.random().toString(36).substr(2, 9),
            text: t,
            category: "Fallback"
        }));
    }
};

/**
 * Legacy single generation - now uses the batch function under the hood.
 */
export const generateAffirmation = async (userData: OnboardingData, context?: string): Promise<Affirmation> => {
    const batch = await generateAffirmationsBatch(userData, 1);
    return batch[0];
};
