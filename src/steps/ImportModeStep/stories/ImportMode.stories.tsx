import { mockRsiValues } from "../../../stories/mockRsiValues"
import { Providers } from "../../../components/Providers"
import { defaultTheme } from "../../../ReactSpreadsheetImportDynamicExtension"
import { ModalWrapper } from "../../../components/ModalWrapper"
import { ImportModeStep } from "../ImportModeStep"

export default {
  title: "Import Mode Step",
  parameters: { layout: "fullscreen" },
}

const file = new File([""], "file.csv")

export const Basic = () => {
  return (
    <Providers theme={defaultTheme} rsiValues={mockRsiValues}>
      <ModalWrapper isOpen={true} onClose={() => {}}>
        <ImportModeStep initialData={[]} file={file} />
      </ModalWrapper>
    </Providers>
  )
}
