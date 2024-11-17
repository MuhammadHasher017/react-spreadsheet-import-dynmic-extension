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
  Flex,
} from "@chakra-ui/react"
import { ContinueButton } from "../../components/ContinueButton"
import { useRsi } from "../../hooks/useRsi"
import { Meta } from "../ValidationStep/types"
import { Data } from "src/types"
import { themeOverrides } from "src/theme"
import { ImportMode } from "../UploadFlow"
import { DataObject } from "./types"
import { startCase } from "lodash"
import { MdWarning } from "react-icons/md"

type Props<T extends string> = {
  data: (Data<T> & Meta)[]
  file: File
  onBack?: () => void
}

export const ImportModeStep = <T extends string>({ data, file, onBack }: Props<T>) => {
  const { translations, fields, onSubmit, onClose } = useRsi<T>()
  const styles = useStyleConfig(
    "ImportModeStep",
  ) as (typeof themeOverrides)["components"]["ImportModeStep"]["baseStyle"]

  const [isSubmitting, setSubmitting] = useState(false)
  const [selectedMode, setSelectedMode] = useState<ImportMode>(ImportMode.append)
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])

  const toast = useToast()

  const handleFormSubmission = async () => {
    if (selectedMode !== ImportMode.append && selectedColumns.length === 0) {
      toast({
        status: "error",
        variant: "left-accent",
        position: "bottom-left",
        title: translations.alerts.primaryKeys.title,
        description: translations.alerts.primaryKeys.description,
        isClosable: true,
      })
      return
    }

    const processedData = processData(data)

    setSubmitting(true)
    try {
      await onSubmit({
        importMode: selectedMode,
        primaryKeys: selectedColumns,
        data: processedData,
        file,
      })
      onClose()
    } catch (err: any) {
      toast({
        status: "error",
        variant: "left-accent",
        position: "bottom-left",
        title: translations.alerts.submitError.title,
        description: err.message || translations.alerts.submitError.defaultMessage,
        isClosable: true,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const processData = (data: (Data<T> & Meta)[]) => {
    return data.reduce(
      (acc, item) => {
        const { __errors, __index, ...values } = item

        if (__errors && Object.values(__errors).some((error) => error.level === "error")) {
          acc.invalidData.push(values as unknown as Data<T>)
        } else {
          acc.validData.push(values as unknown as Data<T>)
        }

        return acc
      },
      { validData: [] as Data<T>[], invalidData: [] as Data<T>[], all: data },
    )
  }

  const getPrimaryKeys = (): string[] => {
    // Filter fields to find those marked as primary keys and map to their keys
    return fields
      .filter((field) => field.isPrimaryKey) // Filter to get only primary key fields
      .map((field) => field.key) // Map to get the keys of those fields
  }

  // Get primary keys
  const primaryKeys = getPrimaryKeys()

  useEffect(() => {
    if (selectedMode === ImportMode.append) setSelectedColumns([])
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
              <Radio value={ImportMode.append}>{translations.importModeStep.fields.radio.label.append}</Radio>
              {/* <Radio value={ImportMode.update}>{translations.importModeStep.fields.radio.label.update}</Radio>
              <Radio value={ImportMode.appendUpdate}>
                {translations.importModeStep.fields.radio.label.appendUpdate}
              </Radio> */}
            </Box>
          </RadioGroup>
        </Box>

        {selectedMode !== ImportMode.append && (
          <Box display="flex" flexDirection="column" gap="12px" mb={6}>
            <Text fontWeight="bold" fontSize="lg">
              {translations.importModeStep.fields.checkBox.label}
            </Text>
            {primaryKeys.length > 0 ? (
              <CheckboxGroup value={selectedColumns} onChange={(value: string[]) => setSelectedColumns(value)}>
                <Stack spacing={[1, 5]} direction={["column", "row"]}>
                  {primaryKeys.map((key) => (
                    <Checkbox key={key} value={key}>
                      {startCase(key)}
                    </Checkbox>
                  ))}
                </Stack>
              </CheckboxGroup>
            ) : (
              <Flex
                alignItems="center"
                bg="yellow.50"
                p={4}
                borderRadius="md"
                border="1px solid"
                borderColor="yellow.300"
              >
                <MdWarning color="yellow.500" size={20} style={{ marginRight: "8px" }} />
                <Text color="yellow.700" fontWeight="medium">
                  {translations.importModeStep.message}
                </Text>
              </Flex>
            )}
          </Box>
        )}
      </ModalBody>

      <ContinueButton
        isLoading={isSubmitting}
        onContinue={handleFormSubmission}
        onBack={onBack}
        title={translations.importModeStep.nextButtonTitle}
        backTitle={translations.importModeStep.backButtonTitle}
      />
    </>
  )
}
