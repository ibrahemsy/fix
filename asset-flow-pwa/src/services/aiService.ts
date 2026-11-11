export const getModelSuggestions = async (manufacturer: string, category: string): Promise<string[]> => {
  try {
    const response = await fetch('/api/gemini/suggest-models', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ manufacturer, category }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch suggestions');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching model suggestions:', error);
    return [];
  }
};
