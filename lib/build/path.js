import fg from 'fast-glob'

export async function getPath(basePath, fileName) {
  const [filePath] = await fg(
    ['**/' + fileName],
    {absolute: true, unique: true, cwd: basePath, caseSensitiveMatch: false}
  )

  return filePath
}
