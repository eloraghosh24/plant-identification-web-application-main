'use server';

/**
 * @fileOverview Identifies a plant from an image and provides information about it.
 *
 * - identifyPlant - A function that handles the plant identification process.
 * - IdentifyPlantInput - The input type for the identifyPlant function.
 * - IdentifyPlantOutput - The return type for the identifyPlant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyPlantInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IdentifyPlantInput = z.infer<typeof IdentifyPlantInputSchema>;

const IdentifyPlantOutputSchema = z.object({
  commonName: z.string().describe('The common name of the plant.'),
  scientificName: z.string().describe('The scientific name of the plant.'),
  description: z.string().describe('A detailed description of the plant.'),
  growthHabit: z.string().describe('The growth habit of the plant (e.g., Shrub, Tree, Herb).'),
  idealClimate: z.string().describe('The ideal climate for the plant (e.g., Tropical, Temperate).'),
  lightRequirement: z.string().describe('The light requirement for the plant (e.g., Full Sun, Partial Shade).'),
  waterNeeds: z.string().describe('The water needs for the plant (e.g., Low, Medium, High).'),
  toxicityToPets: z.string().describe('Toxicity information for pets (e.g., Yes, No, Mildly toxic).'),
  nativeRegion: z.string().describe('The native region of the plant (e.g., Asia, Africa).'),
  maintenanceLevel: z.string().describe('The maintenance level for the plant (e.g., Easy, Moderate, High).'),
  careTips: z.string().describe('Detailed care tips for the plant, including soil, fertilizer, and pruning.'),
});
export type IdentifyPlantOutput = z.infer<typeof IdentifyPlantOutputSchema>;

export async function identifyPlant(input: IdentifyPlantInput): Promise<IdentifyPlantOutput> {
  return identifyPlantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyPlantPrompt',
  input: {schema: IdentifyPlantInputSchema},
  output: {schema: IdentifyPlantOutputSchema},
  prompt: `Please identify the plant in the image. Provide its common and scientific names, a general description, and detailed information for the following attributes: growth habit, ideal climate, light requirement, water needs, toxicity to pets, native region, and maintenance level. Also include a section with general care tips.

{{media url=photoDataUri}}`,
});

const identifyPlantFlow = ai.defineFlow(
  {
    name: 'identifyPlantFlow',
    inputSchema: IdentifyPlantInputSchema,
    outputSchema: IdentifyPlantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
