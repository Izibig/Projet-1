import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function suggestFix(v: {
  ruleId: string;
  description: string;
  htmlSnippet: string;
}) {
  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system:
      "Tu es un expert accessibilité web. On te donne une erreur axe-core. " +
      "Renvoie UNIQUEMENT le HTML/CSS corrigé dans un bloc de code, " +
      "suivi d'une phrase d'explication. Pas de préambule.",
    messages: [
      {
        role: "user",
        content:
          `Règle: ${v.ruleId}\nProblème: ${v.description}\n` +
          `Code fautif:\n${v.htmlSnippet}`,
      },
    ],
  });
  const block = msg.content.find((c) => c.type === "text");
  return block?.type === "text" ? block.text : "";
}
