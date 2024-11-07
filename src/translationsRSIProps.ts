import type { DeepPartial } from "ts-essentials"

export const translations = {
  uploadStep: {
    title: "Upload file",
    manifestTitle: "Data that we expect:",
    manifestDescription: "(You will have a chance to rename or remove columns in next steps)",
    maxRecordsExceeded: (maxRecords: string) => `Too many records. Up to ${maxRecords} allowed`,
    dropzone: (title?: string) => {
      return {
        title: title,
        errorToastDescription: "upload rejected",
        activeDropzoneTitle: "Drop file here...",
        buttonTitle: "Select file",
        loadingTitle: "Processing...",
      }
    },
    selectSheet: {
      title: "Select the sheet to use",
      nextButtonTitle: "Next",
      backButtonTitle: "Back",
    },
  },
  selectHeaderStep: {
    title: "Select header row",
    nextButtonTitle: "Next",
    backButtonTitle: "Back",
  },
  matchColumnsStep: {
    title: "Match Columns",
    nextButtonTitle: "Next",
    backButtonTitle: "Back",
    userTableTitle: "Your table",
    templateTitle: "Will become",
    selectPlaceholder: "Select column...",
    ignoredColumnText: "Column ignored",
    subSelectPlaceholder: "Select...",
    matchDropdownTitle: "Match",
    unmatched: "Unmatched",
    duplicateColumnWarningTitle: "Another column unselected",
    duplicateColumnWarningDescription: "Columns cannot duplicate",
  },
  validationStep: {
    title: "Validate data",
    nextButtonTitle: "Next",
    backButtonTitle: "Back",
    noRowsMessage: "No data found",
    noRowsMessageWhenFiltered: "No data containing errors",
    discardButtonTitle: "Discard selected rows",
    filterSwitchTitle: "Show only rows with errors",
  },
  importModeStep: {
    title: "Import Mode",
    nextButtonTitle: "Confirm",
    backButtonTitle: "Back",
    fields: {
      radio: {
        label: {
          append: "Append: Add new records to the destination table",
          update: "Update: Modify existing records in the destination table with matching source records",
          appendUpdate: "Append/Update: Update records if they exist in the destination, otherwise add them",
        },
      },
      checkBox: {
        label: "Select Primary Key Column",
        placeholder: "Choose the column(s) to be used as the unique key (e.g., EmployeeID, Email).",
      },
    },
    message: "No primary keys available for selection. Please ensure the data contains at least one unique identifier.",
  },
  alerts: {
    confirmClose: {
      headerTitle: "Exit import flow",
      bodyText: "Are you sure? Your current information will not be saved.",
      cancelButtonTitle: "Cancel",
      exitButtonTitle: "Exit flow",
    },
    submitIncomplete: {
      headerTitle: "Errors detected",
      bodyText: "There are still some rows that contain errors. Rows with errors will be ignored when submitting.",
      bodyTextSubmitForbidden: "There are still some rows containing errors.",
      cancelButtonTitle: "Cancel",
      finishButtonTitle: "Submit",
    },
    submitError: {
      title: "Error",
      defaultMessage: "An error occurred while submitting data",
    },
    unmatchedRequiredFields: {
      headerTitle: "Not all columns matched",
      bodyText: "There are required columns that are not matched or ignored. Do you want to continue?",
      listTitle: "Columns not matched:",
      cancelButtonTitle: "Cancel",
      continueButtonTitle: "Continue",
    },
    toast: { error: "Error" },
    primaryKeys: {
      title: "Select Unique Identifier(s)",
      description: "Please choose one or more columns to serve as unique identifiers, such as EmployeeID or Email.",
    },
  },
}

export type TranslationsRSIProps = DeepPartial<typeof translations>
export type Translations = typeof translations
