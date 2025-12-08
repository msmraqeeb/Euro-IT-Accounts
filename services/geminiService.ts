import { GoogleGenAI } from "@google/genai";
import { AppData } from "../types";

const getClient = () => {
  // Use the provided API Key directly
  // This avoids relying on 'process' which causes crashes in the Google library
  const apiKey = 'AlzaSyDT0QNK856nXgTDynd1738nNjU_g-VXyrY';
  
  if (!apiKey) {
    // This error is caught by generateFinancialInsight to prevent app crash
    throw new Error("API_KEY is missing.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateFinancialInsight = async (data: AppData): Promise<string> => {
  try {
    const ai = getClient();
    const model = 'gemini-2.5-flash';

    // Prepare a summary for the AI
    // Calculate Income (Received - Refunds)
    const totalIncome = data.payments.reduce((sum, p) => {
      if (p.type === 'REFUND') return sum - p.amount;
      return sum + p.amount;
    }, 0);
    
    const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalIncome - totalExpenses;

    const totalDue = data.clients.reduce((sum, client) => {
        const clientPayments = data.payments.filter(p => p.clientId === client.id);
        const paid = clientPayments.reduce((acc, p) => {
          return p.type === 'REFUND' ? acc - p.amount : acc + p.amount;
        }, 0);
        const billed = client.totalBilled || 0;
        const due = billed - paid;
        return sum + (due > 0 ? due : 0);
    }, 0);
    
    const expenseBreakdown = data.expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

    const prompt = `
      Act as a financial advisor for a small business.
      Here is the current financial summary:
      - Total Revenue (after refunds): ৳${totalIncome.toFixed(2)}
      - Total Expenses: ৳${totalExpenses.toFixed(2)}
      - Net Profit: ৳${netProfit.toFixed(2)}
      - Total Outstanding Payments (Due from clients): ৳${totalDue.toFixed(2)}
      
      Expense Breakdown by Category:
      ${JSON.stringify(expenseBreakdown, null, 2)}

      Please provide a concise paragraph (max 100 words) analyzing the financial health. 
      Highlight one area of strength and one area for potential improvement (especially regarding pending dues if high).
      Keep the tone professional and encouraging.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Unable to generate insight at this time.";
  } catch (error) {
    console.error("Error generating insight:", error);
    return "AI insights are currently unavailable. (Check API Key)";
  }
};