type AcceptedTypes = {
  [key: string]: string[]
}

const acceptedTypes: AcceptedTypes = {
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "text/csv": [".csv"],
}

export function getAcceptedTypes(inputExtensions: string[]): AcceptedTypes {
  const result: AcceptedTypes = {}

  inputExtensions.forEach((extension) => {
    for (const [mimeType, extensions] of Object.entries(acceptedTypes)) {
      if (extensions.includes(extension)) {
        result[mimeType] = extensions
      }
    }
  })

  return result
}
