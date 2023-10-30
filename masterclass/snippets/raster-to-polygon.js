const result = {
  grid: [
    [1, 1, 0, 0],
    [1, 1, 1, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
  ],
  width: 4,
  height: 4,
};

function compare(v1, v2, threshold) {
  return Math.abs(v1 - v2) < threshold;
}

function categorizeOne(result, categories, category, i, j, value, threshold) {
  if (i < 0 || i >= result.height || j < 0 || j >= result.width) {
    console.log("out of bounds", i, j);
    return;
  }

  if (categories[i][j]) {
    return;
  }
  if (!compare(value, result.grid[i][j], threshold)) {
    return;
  }

  categories[i][j] = category;
  categorizeOne(result, categories, category, i + 1, j, value, threshold);
  categorizeOne(result, categories, category, i - 1, j, value, threshold);
  categorizeOne(result, categories, category, i, j + 1, value, threshold);
  categorizeOne(result, categories, category, i, j - 1, value, threshold);
}

function categorizeAll(result, threshold = 0.01) {
  const categories = [
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
  ];

  let category = 0;
  for (let i = 0; i < result.height; i++) {
    for (let j = 0; j < result.width; j++) {
      if (!categories[i][j]) {
        categorizeOne(
          result,
          categories,
          category,
          i,
          j,
          result.grid[i][j],
          threshold
        );
        category++;
      }
    }
  }

  return categories;
}

console.log(categorizeAll(result));
