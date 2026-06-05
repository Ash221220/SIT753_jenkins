describe('Snaprition Basic Test', () => {
  test('Nutrition values should be positive', () => {
    const nutrition = {
      calories: 182,
      protein: 18.6,
      fat: 10.5,
      carbs: 2.18,
    };

    expect(nutrition.calories).toBeGreaterThan(0);
    expect(nutrition.protein).toBeGreaterThan(0);
    expect(nutrition.fat).toBeGreaterThan(0);
    expect(nutrition.carbs).toBeGreaterThan(0);
  });
});