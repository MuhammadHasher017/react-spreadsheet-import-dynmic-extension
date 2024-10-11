import { useState } from "react"
import { Box, Heading, ModalBody, RadioGroup, Radio, useStyleConfig, useToast } from "@chakra-ui/react"
import { ContinueButton } from "../../components/ContinueButton"
import { useRsi } from "../../hooks/useRsi"
import { Meta } from "../ValidationStep/types"
import { Data } from "src/types"
import { themeOverrides } from "src/theme"

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
  const [selectedMode, setSelectedMode] = useState("append")

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
      const response = await onSubmit(selectedMode, calculatedData, file)
      if (response?.then) {
        await response
      }
      onClose()
    } catch (err: any) {
      toast({
        status: "error",
        variant: "left-accent",
        position: "bottom-left",
        title: `${translations.alerts.submitError.title}`,
        description: err?.message || `${translations.alerts.submitError.defaultMessage}`,
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

  return (
    <>
      <ModalBody pb={0}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb="2rem" flexWrap="wrap" gap="8px">
          <Heading sx={styles.heading}>{translations.importModeStep.title}</Heading>
        </Box>

        <RadioGroup onChange={setSelectedMode} value={selectedMode}>
          <Box display="flex" flexDirection="column" gap="8px">
            <Radio value="append">Append: Add new records to the destination table</Radio>
            <Radio value="update">
              Update: Modify existing records in the destination table with matching source records
            </Radio>
            <Radio value="append/update">
              Append/Update: Update records if they exist in the destination, otherwise add them
            </Radio>
          </Box>
        </RadioGroup>
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
