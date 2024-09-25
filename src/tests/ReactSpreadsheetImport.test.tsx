import "@testing-library/jest-dom"
import { render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ReactSpreadsheetImportDynamicExtension } from "../ReactSpreadsheetImport"
import { mockRsiValues } from "../stories/mockRsiValues"

test("Close modal", async () => {
  let isOpen = true
  const onClose = jest.fn(() => {
    isOpen = !isOpen
  })
  const { getByText, getByLabelText } = render(
    <ReactSpreadsheetImportDynamicExtension {...mockRsiValues} onClose={onClose} isOpen={isOpen} />,
  )

  const closeButton = getByLabelText("Close modal")

  await userEvent.click(closeButton)

  const confirmButton = getByText("Exit flow")

  await userEvent.click(confirmButton)
  expect(onClose).toBeCalled()
})
