
import { GoogleGenAI } from "@google/genai";
import { Order } from "../types";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const analyzeOrders = async (orders: Order[], retryCount = 0): Promise<string> => {
  if (!process.env.API_KEY) return "ERROR_NO_KEY";
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const orderSummary = orders.slice(0, 10).map(o => ({
    id: o.id,
    status: o.status,
    total: o.totalAmount,
    items: o.items.map(i => i.name).join(', ')
  }));

  const prompt = `
    Dưới đây là danh sách 10 đơn hàng gần nhất:
    ${JSON.stringify(orderSummary)}

    Hãy thực hiện phân tích nhanh:
    1. Tổng hợp tình trạng đơn hàng.
    2. Đề xuất ưu đãi cho các mặt hàng bán chạy.
    3. 1 lời khuyên quản lý kho.
    
    Phản hồi bằng tiếng Việt, ngắn gọn dưới dạng gạch đầu dòng Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });
    
    const text = response.text;
    if (!text) {
        throw new Error("Empty response from AI");
    }

    return text;
  } catch (error: any) {
    const errorMessage = error?.message || "";
    console.warn("Gemini Service Exception:", errorMessage);

    if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('Resource exhausted')) {
      return "ERROR_QUOTA_EXHAUSTED";
    }

    return "ERROR_GENERIC";
  }
};
