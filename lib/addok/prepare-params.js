export function prepareParams(params) {
  if (!params.center) {
    return params
  }

  const preparedParams = {
    ...params,
    lon: params.center[0],
    lat: params.center[1]
  }

  delete preparedParams.center
  return preparedParams
}
