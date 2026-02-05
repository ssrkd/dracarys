const FOCAL_GEMINI_API_KEY = "AIzaSyBf7rzr9CED8FGhUTeAVWjQ0JgPbXz6SDs";

export const focalAiService = {
    async analyzeStrategicData(context: {
        plans: any[];
        journal: any[];
        goals: any[];
    }) {
        const prompt = `
        Ты - Личный Коуч по Успеху и Продуктивности (FOCAL AI). Твоя задача - проанализировать личное состояние, задачи и цели пользователя.
        
        Данные для анализа:
        - Планы и Задачи: ${JSON.stringify(context.plans)}
        - Личный Журнал (энергия, настроение, инсайты): ${JSON.stringify(context.journal)}
        - Личные Цели: ${JSON.stringify(context.goals)}

        Проведи глубокий психологический и стратегический анализ. Твой ответ должен быть максимально персональным, поддерживающим и конструктивным.
        
        Предоставь ответ в формате JSON со следующими полями:
        {
            "executive_summary": "Краткое резюме состояния пользователя (2-3 предложения). Акцент на балансе и фокусе.",
            "pattern_detection": "Обнаруженные личные паттерны (например, зависимость настроения от выполнения задач)",
            "energy_productivity_correlation": "Анализ того, как уровень энергии влияет на завершение задач разного типа",
            "blind_spots": ["Области/категории, которые пользователь систематически игнорирует или откладывает"],
            "burnout_risk": "Уровень риска выгорания (Low/Medium/High) и персональный совет",
            "strategic_suggestions": ["3 конкретных шага для личного роста и продуктивности"],
            "productivity_score": "Оценка личной эффективности от 1 до 100",
            "overall_balance": "Ориентировочная оценка баланса работа/жизнь"
        }

        Отвечай строго в формате JSON, на русском языке. Будь проницательным наставником.
        `;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${FOCAL_GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('AI API Error:', errorData);
                throw new Error(errorData.error?.message || 'API Error');
            }

            const data = await response.json();
            if (!data.candidates || !data.candidates[0]) throw new Error('No candidates in AI response');

            let textResponse = data.candidates[0].content.parts[0].text;

            // Clean markdown artifacts
            const cleanJson = textResponse.replace(/```json|```/g, '').trim();

            try {
                return JSON.parse(cleanJson);
            } catch (pError) {
                console.error('JSON Parse Error in AI:', pError, 'Raw text:', textResponse);
                throw pError;
            }
        } catch (error: any) {
            console.error('Error in strategic AI analysis:', error);
            return {
                executive_summary: `Ошибка ИИ: ${error.message || 'Проверьте соединение'}`,
                pattern_detection: "Данные временно недоступны для анализа.",
                burnout_risk: "Unknown",
                strategic_suggestions: ["Попробуйте повторить запрос позже", "Проверьте стабильность интернета"],
                productivity_score: 0,
                overall_balance: "Не определено"
            };
        }
    },

    async getMorningBrief(context: {
        todayPlans: any[];
        yesterdayDiary?: any;
        currentTime?: string;
    }) {
        const prompt = `
        Ты - Личный Коуч (FOCAL AI). Текущее время пользователя: ${context.currentTime || "неизвестно"}.
        
        Твоя задача: Напиши ОЧЕНЬ короткое (2-3 предложения), премиальное и вдохновляющее приветствие для владельца.
        
        ПРАВИЛА ОФОРМЛЕНИЯ:
        1. ИСПОЛЬЗУЙ ТОЛЬКО ЧИСТЫЙ ТЕКСТ. Никакой разметки Markdown, никаких звездочек (** или *), никаких решеток.
        2. ПРИВЕТСТВИЕ ДОЛЖНО СООТВЕТСТВОВАТЬ ВРЕМЕНИ СУТОК (утро/день/вечер/ночь).
        3. Будь кратким и точным.
        
        ДАННЫЕ:
        - Сегодняшние задачи: ${JSON.stringify(context.todayPlans)}
        - Вчерашнее состояние: ${JSON.stringify(context.yesterdayDiary || "Нет данных")}
        
        Дай один мощный совет на чем сфокусироваться сейчас, исходя из задач и вчерашней энергии.
        `;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${FOCAL_GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();
            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (textResponse) {
                // Remove any markdown and bolding just in case AI ignores instructions
                return textResponse.replace(/\*\*/g, '').replace(/[*#]/g, '').trim();
            }

            // Time-aware fallback if AI returns empty
            const hour = new Date().getHours();
            if (hour < 5) return "Доброй ночи! Пора восстановить силы для завтрашних побед.";
            if (hour < 12) return "Доброе утро! Время великих дел и новых достижений.";
            if (hour < 18) return "Добрый день! Сохраняйте фокус на главном.";
            return "Добрый вечер! Время подвести итоги и запланировать завтрашний успех.";
        } catch (error) {
            return "С возвращением! Сегодня отличный день для реализации ваших целей.";
        }
    }
};
