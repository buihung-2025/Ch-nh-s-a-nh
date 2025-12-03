import { GoogleGenAI, Modality } from "@google/genai";
import { AttireOption, PhotoSize, BackgroundColor } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const editIdPhoto = async (
  base64Image: string,
  mimeType: string,
  attire: AttireOption,
  photoSize: PhotoSize,
  backgroundColor: BackgroundColor,
  beautify: boolean,
  smoothSkin: boolean,
  makeup: boolean,
): Promise<string> => {
  try {
    let attireInstruction: string;
    switch (attire) {
      case AttireOption.Shirt:
        attireInstruction = "Thay trang phục hiện tại của người trong ảnh bằng một chiếc áo sơ mi trắng hiện đại, có cổ, trông gọn gàng và chuyên nghiệp. Kiểu dáng nên đẹp và hợp thời trang, phù hợp cho cả nam và nữ.";
        break;
      case AttireOption.Suit:
        attireInstruction = "Thay trang phục hiện tại của người trong ảnh bằng một bộ vest công sở lịch sự (màu tối như xanh navy hoặc xám đậm) với áo sơ mi trắng bên trong. Trang phục phải trông chuyên nghiệp, phù hợp với tiêu chuẩn ảnh thẻ.";
        break;
      case AttireOption.AoDai:
        attireInstruction = "Thay trang phục hiện tại của người trong ảnh bằng một chiếc áo dài trắng truyền thống của Việt Nam. Áo dài phải có cổ cao, trông thanh lịch, trang trọng và chuyên nghiệp, phù hợp với tiêu chuẩn ảnh thẻ.";
        if (backgroundColor === BackgroundColor.White) {
            attireInstruction += " Quan trọng: Vì phông nền cũng là màu trắng, hãy đảm bảo có sự tách biệt rõ ràng giữa áo dài trắng và phông nền. Bạn có thể sử dụng bóng đổ rất tinh tế hoặc một đường viền mờ để áo không bị hòa lẫn vào nền, nhưng tuyệt đối không được làm thay đổi khuôn mặt, cổ hoặc đường viền tóc của người trong ảnh.";
        }
        break;
      case AttireOption.Original:
        attireInstruction = "Giữ nguyên trang phục gốc của người trong ảnh. Nếu cần, hãy làm cho nó trông gọn gàng và chuyên nghiệp hơn, nhưng không thay đổi loại trang phục.";
        break;
      default:
        attireInstruction = "Giữ nguyên trang phục gốc của người trong ảnh.";
        break;
    }

    const sizeDescription = photoSize === PhotoSize.ThreeFour ? '3x4' : '4x6';
    const isWhiteBackground = backgroundColor === BackgroundColor.White;
    const backgroundDescription = isWhiteBackground 
        ? 'màu trắng tinh khiết (#FFFFFF)' 
        : 'xanh dương chuyên nghiệp (#0079FF)';

    const enhancementInstructions: string[] = [];
    if (beautify) {
        enhancementInstructions.push("Làm đẹp ảnh tổng thể một cách tự nhiên, tăng độ sắc nét và cân bằng màu sắc.");
    }
    if (smoothSkin) {
        enhancementInstructions.push("Làm mịn da một cách tinh tế, che đi các khuyết điểm nhỏ nhưng vẫn giữ được cấu trúc da tự nhiên.");
    }
    if (makeup) {
        enhancementInstructions.push("Áp dụng một lớp trang điểm nhẹ nhàng, chuyên nghiệp, bao gồm làm đều màu da, một chút son môi màu tự nhiên và kẻ mắt mỏng để đôi mắt trông to và rõ hơn.");
    }

    const whiteBackgroundNote = isWhiteBackground
        ? `\n**YÊU CẦU CỰC KỲ QUAN TRỌNG VỚI NỀN TRẮNG:** Việc bảo toàn đường viền tóc và khuôn mặt là ưu tiên cao nhất. Phải cực kỳ cẩn thận để không làm thay đổi, làm mờ hay cắt mất bất kỳ phần nào của tóc hoặc khuôn mặt khi thay nền. Đảm bảo mọi sợi tóc đều được giữ lại và trông tự nhiên trên nền trắng.`
        : '';

    const prompt = `Bạn là một chuyên gia chỉnh sửa ảnh thẻ. Nhiệm vụ của bạn là chỉnh sửa hình ảnh được cung cấp theo các yêu cầu sau.
**QUY TẮC QUAN TRỌNG NHẤT: BẢO TOÀN TUYỆT ĐỐI KHUÔN MẶT, TÓC VÀ ĐẦU.**
Khi thực hiện bất kỳ thay đổi nào, bạn PHẢI giữ nguyên 100% khuôn mặt, nét mặt, kiểu tóc (từng sợi tóc), màu da và hình dạng đầu của người trong ảnh gốc. Không được thay đổi danh tính của người đó. Sự tương đồng về khuôn mặt phải là tuyệt đối. Chỉ thay đổi quần áo và phần vai nếu cần để khớp với trang phục mới.${whiteBackgroundNote}

**Yêu cầu chi tiết:**
1.  **Phông Nền:** Chuyển nền thành ${backgroundDescription}.
2.  **Cắt & Tỷ Lệ:** Cắt ảnh theo tỷ lệ ${sizeDescription} (chiều cao lớn hơn chiều rộng). Căn chỉnh đầu, vai và thân trên của người trong ảnh một cách chuyên nghiệp để phù hợp với tiêu chuẩn ảnh thẻ.
3.  **Trang Phục:** ${attireInstruction}
4.  **Chất Lượng & Ánh Sáng:** Nâng cao chất lượng ảnh. Đảm bảo khuôn mặt được chiếu sáng đều, rõ nét, không bị mờ, không có bóng đổ. Mắt phải nhìn thẳng vào máy ảnh. Toàn bộ ảnh phải đạt tiêu chuẩn nghiêm ngặt của ảnh hộ chiếu.
${enhancementInstructions.length > 0 ? `5.  **Cải Thiện Chân Dung:**\n- ${enhancementInstructions.join('\n- ')}\n` : ''}
6.  **Đầu Ra:** Chỉ trả về hình ảnh đã được chỉnh sửa. Không trả về bất kỳ văn bản hay giải thích nào.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });
    
    // The Gemini vision model can return multiple parts. We need to find the image part.
    const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imagePart && imagePart.inlineData) {
      const mime = imagePart.inlineData.mimeType;
      const data = imagePart.inlineData.data;
      return `data:${mime};base64,${data}`;
    } else {
      // Sometimes the model might return text explaining why it failed.
      const textResponse = response.text;
      throw new Error(`Không thể tạo ảnh. Phản hồi từ AI: ${textResponse || 'Không nhận được ảnh hợp lệ.'}`);
    }
  } catch (error) {
    console.error("Error editing photo with Gemini API:", error);
    throw new Error("Đã xảy ra lỗi khi giao tiếp với dịch vụ AI. Vui lòng thử lại.");
  }
};