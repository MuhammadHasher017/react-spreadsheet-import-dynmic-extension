import { useEffect, useState } from "react"
import {
  Box,
  Heading,
  ModalBody,
  RadioGroup,
  Radio,
  useStyleConfig,
  useToast,
  Text,
  CheckboxGroup,
  Checkbox,
  Stack,
} from "@chakra-ui/react"
import { ContinueButton } from "../../components/ContinueButton"
import { useRsi } from "../../hooks/useRsi"
import { Meta } from "../ValidationStep/types"
import { Data } from "src/types"
import { themeOverrides } from "src/theme"
import { ImportMode } from "../UploadFlow"
import { DataObject } from "./types"
import { startCase } from "lodash"

type Props<T extends string> = {
  data: (Data<T> & Meta)[]
  file: File
  onBack?: () => void
}

export const ImportModeStep = <T extends string>({ data, file, onBack }: Props<T>) => {
  const { translations, onSubmit, onClose } = useRsi<T>()
  const styles = useStyleConfig(
    "ImportModeStep",
  ) as (typeof themeOverrides)["components"]["ImportModeStep"]["baseStyle"]

  const [isSubmitting, setSubmitting] = useState(false)
  const [selectedMode, setSelectedMode] = useState<ImportMode>(ImportMode.append)
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])

  const toast = useToast()

  const submitData = async () => {
    const calculatedData = data.reduce(
      (acc, value) => {
        const { __index, __errors, ...values } = value
        if (__errors) {
          for (const key in __errors) {
            if (__errors[key].level === "error") {
              acc.invalidData.push(values as unknown as Data<T>)
              return acc
            }
          }
        }
        acc.validData.push(values as unknown as Data<T>)
        return acc
      },
      { validData: [] as Data<T>[], invalidData: [] as Data<T>[], all: data },
    )

    setSubmitting(true)
    try {
      await onSubmit({
        importMode: selectedMode, // The selected import mode
        primaryKeys: selectedColumns, // The selected columns
        data: calculatedData, // The calculated data that you processed
        file, // The file being processed
      })
      onClose()
    } catch (err: any) {
      toast({
        status: "error",
        variant: "left-accent",
        position: "bottom-left",
        title: translations.alerts.submitError.title,
        description: err?.message || translations.alerts.submitError.defaultMessage,
        isClosable: true,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const onConfirm = async () => {
    setSubmitting(true)
    await submitData()
  }

  const getFirstObjectKeys = (data: DataObject[]): string[] => {
    // Check if the data array is valid and has at least one object
    if (!Array.isArray(data) || data.length === 0) {
      return [] // Return an empty array if data is empty or not an array
    }

    const firstObject = data[0]

    // Ensure firstObject is indeed an object
    if (typeof firstObject !== "object" || firstObject === null) {
      return [] // Return an empty array if firstObject is not an object
    }

    return Object.keys(firstObject).filter((key) => key !== "__errors" && key !== "__index")
  }

  const keys = getFirstObjectKeys(data)

  // Effect to clear selectedColumns when the append mode is selected
  useEffect(() => {
    if (selectedMode === ImportMode.append) {
      setSelectedColumns([]) // Clear selected columns if mode is "append"
    }
  }, [selectedMode])

  return (
    <>
      <ModalBody pb={0}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb="2rem" flexWrap="wrap" gap="8px">
          <Heading sx={styles.heading}>{translations.importModeStep.title}</Heading>
        </Box>

        <Box mb={6}>
          <RadioGroup onChange={(value: string) => setSelectedMode(value as ImportMode)} value={selectedMode}>
            <Box display="flex" flexDirection="column" gap="12px">
              <Radio value="append">{translations.importModeStep.fields.radio.label.append}</Radio>
              <Radio value="update">{translations.importModeStep.fields.radio.label.update}</Radio>
              <Radio value="append/update">{translations.importModeStep.fields.radio.label.appendUpdate}</Radio>
            </Box>
          </RadioGroup>
        </Box>

        <Box display="flex" flexDirection="column" gap="12px" mb={6} hidden={selectedMode === "append"}>
          <Text fontWeight="bold" fontSize="lg">
            {translations.importModeStep.fields.select.label}
          </Text>
          <CheckboxGroup value={selectedColumns} onChange={(value: string[]) => setSelectedColumns(value)}>
            <Stack spacing={[1, 5]} direction={["column", "row"]}>
              {keys.map((key) => (
                <Checkbox key={key} value={key}>
                  {startCase(key)}
                </Checkbox>
              ))}
            </Stack>
          </CheckboxGroup>
        </Box>
      </ModalBody>

      <ContinueButton
        isLoading={isSubmitting}
        onContinue={onConfirm}
        onBack={onBack}
        title={translations.importModeStep.nextButtonTitle}
        backTitle={translations.importModeStep.backButtonTitle}
      />
    </>
  )
}
