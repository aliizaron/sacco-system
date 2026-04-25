import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const analyzeLoanRisk = async (borrowerData: {
  income: number;
  loanAmount: number;
  loanPurpose: string;
  collateral: {
    type: string;
    description: string;
    estimatedValue?: number;
  };
  history: {
    totalLoans: number;
    paidOnTime: number;
    latePayments: number;
    activeLoansBalance: number;
  };
  transactions: {
    avgMonthlyInflow: number;
    avgMonthlyOutflow: number;
    totalTransactionsCount: number;
    currentBalance: number;
  };
}) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const prompt = `Conduct a rigorous comparative analysis for a SACCO loan application. Weigh multiple factors to determine if the loan should be approved or rejected.

  FACTORS TO ANALYZE:
  1. Financial Standing:
     - Monthly Income: UGX ${borrowerData.income.toLocaleString()}
     - Requested Loan: UGX ${borrowerData.loanAmount.toLocaleString()}
     - Income-to-Loan Ratio: ${(borrowerData.income / borrowerData.loanAmount).toFixed(2)}
     - Current Wallet Balance: UGX ${borrowerData.transactions.currentBalance.toLocaleString()}

  2. Loan History & Reliability:
     - Total Previous Loans: ${borrowerData.history.totalLoans}
     - Repaid On Time: ${borrowerData.history.paidOnTime}
     - Late Payments: ${borrowerData.history.latePayments}
     - Outstanding Debt: UGX ${borrowerData.history.activeLoansBalance.toLocaleString()}

  3. Economic Behavior (Transactions):
     - Avg Monthly Deposits/Inflow: UGX ${borrowerData.transactions.avgMonthlyInflow.toLocaleString()}
     - Avg Monthly Withdrawals/Outflow: UGX ${borrowerData.transactions.avgMonthlyOutflow.toLocaleString()}
     - Transaction Volume: ${borrowerData.transactions.totalTransactionsCount} transactions
     - Cash Flow Health: ${borrowerData.transactions.avgMonthlyInflow > borrowerData.transactions.avgMonthlyOutflow ? "Positive (Surplus)" : "Negative (Deficit)"}

  4. Collateral Security:
     - Type: ${borrowerData.collateral.type}
     - Description: ${borrowerData.collateral.description}
     - Estimated Value (if provided): ${borrowerData.collateral.estimatedValue ? 'UGX ' + borrowerData.collateral.estimatedValue.toLocaleString() : 'Not evaluated'}

  TASK:
  - Provide a 'Comparative Analysis' explaining WHY the decision was made, explicitly referencing how their payment history compares to their current request.
  - Evaluate the Collateral adequacy (Coverage Ratio).
  - Categorize Risk Level (Low, Medium, High, Critical).
  - Determine Qualification (Qualified, Not Qualified, Conditional).
  - List 3-5 specific verification checks the bank officer should perform.

  Output strictly as JSON.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          riskScore: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] },
          qualificationStatus: { type: Type.STRING, enum: ["Qualified", "Not Qualified", "Conditional"] },
          suggestedAmount: { 
            type: Type.NUMBER, 
            description: "If NOT Qualified, suggest an alternative maximum loan amount they would qualify for based on their current financials." 
          },
          justification: { type: Type.STRING },
          collateralEvaluation: { type: Type.STRING },
          verificationChecks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                check: { type: Type.STRING },
                status: { type: Type.STRING, enum: ["Passed", "Failed", "Warning"] },
                reason: { type: Type.STRING }
              },
              required: ["check", "status", "reason"]
            }
          }
        },
        required: ["riskScore", "qualificationStatus", "justification", "verificationChecks", "collateralEvaluation", "suggestedAmount"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const chatWithGemini = async (message: string, history: ChatMessage[]) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const contents = [
    ...history.map(h => ({
      role: h.role,
      parts: [{ text: h.content }]
    })),
    { role: 'user', parts: [{ text: message }] }
  ];

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents,
    config: {
      systemInstruction: "You are a professional SACCO Loan Risk Advisor. You have access to user financial data (income, history, transactions). Your goal is to help users understand their loan eligibility, explain why applications might be rejected, and provide actionable tips to improve their creditworthiness (e.g., increasing transaction volume, paying off small debts, or providing better collateral)."
    }
  });

  return response.text;
};
