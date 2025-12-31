
import { GoogleGenAI } from "@google/genai";
import { Order } from "../types";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const analyzeOrders = async (orders: Order[], retryCount = 0): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const orderSummary = orders.map(o => ({
    id: o.id,
    status: o.status,
    total: o.totalAmount,
    items: o.items.map(i => i.name).join(', ')
  }));

  const prompt = `
    Dưới đây là danh sách đơn hàng gần đây của shop quần áo:
    ${JSON.stringify(orderSummary)}

    Hãy thực hiện phân tích nhanh:
    1. Tổng hợp tình trạng đơn hàng.
    2. Đề xuất chiến lược bán hàng hoặc ưu đãi dựa trên các mặt hàng đang bán chạy.
    3. Đưa ra 1 lời khuyên quản lý kho bãi.
    
    Phản hồi bằng tiếng Việt, ngắn gọn, súc tích dưới dạng các gạch đầu dòng Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });
    
    if (!response.text) {
        throw new Error("Empty response from AI");
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);

    // Xử lý lỗi 429 (Too Many Requests / Quota Exhausted)
    if (error?.message?.includes('429') || error?.status === 429) {
      if (retryCount < 1) {
        // Thử lại một lần sau 2 giây nếu là lần đầu tiên lỗi
        await sleep(2000);
        return analyzeOrders(orders, retryCount + 1);
      }
      return "ERROR_QUOTA_EXHAUSTED";
    }

    return "ERROR_GENERIC";
  }
};
