import { NextRequest } from 'next/server';
import { LLMClient, Message } from 'coze-coding-dev-sdk';

// 平台托管的 DeepSeek 模型（无需用户提供 API Key）
const MODEL_ID = 'deepseek-v3-2-251201';

// 强制末尾提示词 — 必须在 prompt 模板中显式声明，并配合后端代码段拼接双重保证
const MANDATORY_DISCLAIMER =
  '【提示】本内容由 AI 生成，仅作为文书整理参考，具体诊断和治疗请遵从执业医师的指导。';

const SYSTEM_PROMPT = `你是一位资深中医临床辅助助手。请根据医师提供的四诊信息（主诉、舌象、脉象、面色、神情、体质、辨证），给出：
1. 辨证分析：病位、病性、可能的证型
2. 参考药方：经典方剂 + 加减建议（仅供医师参考，不构成处方）
3. 针灸/推拿穴位方：主穴 + 配穴
4. 医嘱建议：饮食、起居、情志

要求：
- 输出专业、简洁、可操作
- 必须使用中医术语
- 必须以规范的 Markdown 格式输出
- 在回答末尾必须包含免责声明：${MANDATORY_DISCLAIMER}`;

function buildUserPrompt(payload: Record<string, unknown>): string {
  const patient = (payload.patient as Record<string, unknown>) || {};
  const syndrome = (payload.syndrome as Record<string, unknown>) || {};
  return `【患者基本信息】
姓名：${patient.name ?? '未知'} · ${patient.gender ?? '?'} · ${patient.age ?? '?'} 岁

【主诉】
${payload.chiefComplaint || '（未提供）'}

【四诊信息】
舌象：${payload.tongue || '（未提供）'}
脉象：${payload.pulse || '（未提供）'}
面色与神情：${payload.face || '（未提供）'}

【体质与辨证】
体质：${payload.constitution || '（未提供）'}
病位：${Array.isArray(syndrome.location) ? syndrome.location.join('、') : syndrome.location || '（未提供）'}
病性：${Array.isArray(syndrome.nature) ? syndrome.nature.join('、') : syndrome.nature || '（未提供）'}
医师初步辨证：${syndrome.name || '（未提供）'}

请基于以上信息，给出辨证分析与参考处方建议。`;
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const client = new LLMClient();
    const messages: Message[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(payload) },
    ];

    // 关键：使用流式输出，前端打字机式渲染
    const streamGen = client.stream(messages, {
      model: MODEL_ID,
      temperature: 0.4,
      streaming: true,
    });

    // 构造 SSE 响应
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamGen) {
            // AIMessageChunk 可能有 content 字段
            const text =
              typeof chunk === 'string'
                ? chunk
                : ((chunk as unknown as { content?: string | Array<{ type: string; text?: string }> })
                    .content ?? '');
            const textStr =
              typeof text === 'string'
                ? text
                : Array.isArray(text)
                  ? text
                      .map((p) => (p.type === 'text' ? p.text : ''))
                      .join('')
                  : '';
            if (textStr) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: textStr })}\n\n`),
              );
            }
          }
          // 流末尾再次附加免责声明（双重保证）
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ text: '\n\n---\n' + MANDATORY_DISCLAIMER })}\n\n`,
            ),
          );
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: (err as Error).message })}\n\n`,
            ),
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message || 'AI 辨证失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({
      ok: true,
      model: MODEL_ID,
      message: 'POST 四诊信息到此端点获取 AI 辨证参考',
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
}
