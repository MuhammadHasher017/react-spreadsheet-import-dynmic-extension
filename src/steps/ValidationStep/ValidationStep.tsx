import { useCallback, useMemo, useState } from "react"
import { Box, Button, Heading, ModalBody, Switch, useStyleConfig, useToast } from "@chakra-ui/react"
import { ContinueButton } from "../../components/ContinueButton"
import { useRsi } from "../../hooks/useRsi"
import type { Meta } from "./types"
import { addErrorsAndRunHooks } from "./utils/dataMutations"
import { generateColumns } from "./components/columns"
import { Table } from "../../components/Table"
import { SubmitDataAlert } from "../../components/Alerts/SubmitDataAlert"
import type { Data } from "../../types"
import type { themeOverrides } from "../../theme"
import type { RowsChangeData } from "react-data-grid"
import { ImportMode, StepState, StepType } from "../UploadFlow"

type Props<T extends string> = {
  initialData: (Data<T> & Meta)[]
  file: File
  onNext?: (v: StepState) => void
  onBack?: () => void
}

export const ValidationStep = <T extends string>({ initialData, file, onNext, onBack }: Props<T>) => {
  const { translations, fields, rowHook, tableHook } = useRsi<T>()
  const styles = useStyleConfig(
    "ValidationStep",
  ) as (typeof themeOverrides)["components"]["ValidationStep"]["baseStyle"]

  const [data, setData] = useState<(Data<T> & Meta)[]>(initialData)
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<number | string>>(new Set())
  const [filterByErrors, setFilterByErrors] = useState(false)
  const [showSubmitAlert, setShowSubmitAlert] = useState(false)
  const [isLoading, setLoading] = useState(false)

  const updateData = useCallback(
    async (rows: typeof data, indexes?: number[]) => {
      const isAsync = rowHook?.constructor.name === "AsyncFunction" || tableHook?.constructor.name === "AsyncFunction"
      if (isAsync) setData(rows)

      const updatedData = await addErrorsAndRunHooks<T>(rows, fields, rowHook, tableHook, indexes)
      setData(updatedData)
    },
    [rowHook, tableHook, fields],
  )

  const deleteSelectedRows = () => {
    if (selectedRows.size) {
      const newData = data.filter((row) => !selectedRows.has(row.__index))
      updateData(newData)
      setSelectedRows(new Set())
    }
  }

  const updateRows = useCallback(
    (rows: typeof data, changedData?: RowsChangeData<(typeof data)[number]>) => {
      const changes = changedData?.indexes.reduce((acc, index) => {
        const realIndex = data.findIndex((value) => value.__index === rows[index].__index)
        acc[realIndex] = rows[index]
        return acc
      }, {} as Record<number, (typeof data)[number]>)

      const realIndexes = changes && Object.keys(changes).map(Number)
      const newData = Object.assign([], data, changes)
      updateData(newData, realIndexes)
    },
    [data, updateData],
  )

  const tableData = useMemo(() => {
    if (filterByErrors) {
      return data.filter((value) => {
        if (value?.__errors) {
          return Object.values(value.__errors)?.filter((err) => err.level === "error").length
        }
        return false
      })
    }
    return data
  }, [data, filterByErrors])

  const rowKeyGetter = useCallback((row: Data<T> & Meta) => row.__index, [])

  const invalidData = data.find((value) => {
    if (value?.__errors) {
      return !!Object.values(value.__errors)?.filter((err) => err.level === "error").length
    }
    return false
  })

  const onContinue = async () => {
    setLoading(true)

    if (invalidData) {
      setShowSubmitAlert(true)
    } else {
      onNext?.({ type: StepType.importMode, mode: ImportMode.append, data, file })
    }

    setLoading(false)
  }

  const submitInvalid = () => {
    onNext?.({ type: StepType.importMode, mode: ImportMode.append, data, file })
  }

  const columns = useMemo(() => generateColumns(fields), [fields])

  return (
    <>
      <SubmitDataAlert isOpen={showSubmitAlert} onClose={() => setShowSubmitAlert(false)} onConfirm={submitInvalid} />
      <ModalBody pb={0}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb="2rem" flexWrap="wrap" gap="8px">
          <Heading sx={styles.heading}>{translations.validationStep.title}</Heading>
          <Box display="flex" gap="16px" alignItems="center" flexWrap="wrap">
            <Button variant="outline" size="sm" onClick={deleteSelectedRows}>
              {translations.validationStep.discardButtonTitle}
            </Button>
            <Switch
              display="flex"
              alignItems="center"
              isChecked={filterByErrors}
              onChange={() => setFilterByErrors(!filterByErrors)}
            >
              {translations.validationStep.filterSwitchTitle}
            </Switch>
          </Box>
        </Box>
        <Table
          rowKeyGetter={rowKeyGetter}
          rows={tableData}
          onRowsChange={updateRows}
          columns={columns}
          selectedRows={selectedRows}
          onSelectedRowsChange={setSelectedRows}
          components={{
            noRowsFallback: (
              <Box display="flex" justifyContent="center" gridColumn="1/-1" mt="32px">
                {filterByErrors
                  ? translations.validationStep.noRowsMessageWhenFiltered
                  : translations.validationStep.noRowsMessage}
              </Box>
            ),
          }}
        />
      </ModalBody>
      <ContinueButton
        isLoading={isLoading}
        onContinue={onContinue}
        onBack={onBack}
        title={translations.validationStep.nextButtonTitle}
        backTitle={translations.validationStep.backButtonTitle}
      />
    </>
  )
}
