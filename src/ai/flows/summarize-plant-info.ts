'use server';

/**
 * @fileOverview Summarizes key information about a plant.
 *
 * - summarizePlantInfo - A function that summarizes the plant information.
 * - SummarizePlantInfoInput - The input type for the summarizePlantInfo function.
 * - SummarizePlantInfoOutput - The return type for the summarizePlantInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizePlantInfoInputSchema = z.object({
  plantName: z.string().describe('The common name of the plant.'),
  description: z.string().describe('A detailed description of the plant.'),
  scientificClassification: z.string().describe('The scientific classification of the plant.'),
  careNeeds: z.string().describe('Detailed care needs for the plant, including watering, light, and temperature.'),
  toxicityInfo: z.string().describe('Information about the plant’s toxicity to pets and humans.'),
});
export type SummarizePlantInfoInput = z.infer<typeof SummarizePlantInfoInputSchema>;

const SummarizePlantInfoOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the key information about the plant.'),
});
export type SummarizePlantInfoOutput = z.infer<typeof SummarizePlantInfoOutputSchema>;

export async function summarizePlantInfo(input: SummarizePlantInfoInput): Promise<SummarizePlantInfoOutput> {
  return summarizePlantInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizePlantInfoPrompt',
  input: {schema: SummarizePlantInfoInputSchema},
  output: {schema: SummarizePlantInfoOutputSchema},
  prompt: `You are an expert botanist who is skilled at summarizing plant information for non-experts.

  Given the following information about a plant, please provide a concise summary of the key information about the plant, such as its primary characteristics and care needs.

  Plant Name: {{{plantName}}}
  Description: {{{description}}}
  Scientific Classification: {{{scientificClassification}}}
  Care Needs: {{{careNeeds}}}
  Toxicity Info: {{{toxicityInfo}}}

  Summary: `,
});

const summarizePlantInfoFlow = ai.defineFlow(
  {
    name: 'summarizePlantInfoFlow',
    inputSchema: SummarizePlantInfoInputSchema,
    outputSchema: SummarizePlantInfoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
