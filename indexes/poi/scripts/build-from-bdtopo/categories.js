import {zipObject, mapValues} from 'lodash-es'

export function createAccumulator(mainCategories) {
  const sets = mapValues(zipObject(mainCategories), () => new Set())

  function addCategories(categories) {
    const mainCategory = categories.find(c => c in sets)

    if (!mainCategory) {
      return
    }

    for (const category of categories) {
      if (category !== mainCategory) {
        sets[mainCategory].add(category)
      }
    }
  }

  function getSummary() {
    return mapValues(sets, set => [...set])
  }

  return {addCategories, getSummary}
}
