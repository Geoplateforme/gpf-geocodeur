import handleIndexes from './indexes/index.js'

export default function search() {
  return async (req, res) => {
    const results = handleIndexes(req.query)

    res.send(results)
  }
}
