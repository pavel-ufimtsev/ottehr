import { BrowserContext, expect, Page, test } from '@playwright/test';
import { waitForChartDataDeletion, waitForSaveChartDataResponse } from 'test-utils';
import { MDM_FIELD_DEFAULT_TEXT, TelemedAppointmentVisitTabs } from 'utils';
import { dataTestIds } from '../../../../src/constants/data-test-ids';
import { assignAppointmentIfNotYetAssignedToMeAndVerifyPreVideo } from '../../../e2e-utils/helpers/telemed.test-helpers';
import { ResourceHandler } from '../../../e2e-utils/resource-handler';
import { TelemedAssessmentPage } from '../../page/telemed/TelemedAssessmentPage';
import { TelemedProgressNotePage } from '../../page/telemed/TelemedProgressNotePage';

const resourceHandler = new ResourceHandler('telemed');
let telemedAssessmentPage: TelemedAssessmentPage;
let telemedProgressNotePage: TelemedProgressNotePage;
let context: BrowserContext;
let page: Page;

const DEFAULT_TIMEOUT = { timeout: 15000 };

const DIAGNOSIS_CODE = 'J45.901';
const DIAGNOSIS_NAME = 'injury';
const E_M_CODE = '99201';

test.describe.configure({ mode: 'serial' });

test.beforeAll(async ({ browser }) => {
  context = await browser.newContext();
  page = await context.newPage();
  telemedAssessmentPage = new TelemedAssessmentPage(page);
  telemedProgressNotePage = new TelemedProgressNotePage(page);
  await resourceHandler.setResources();
  await resourceHandler.waitTillAppointmentPreprocessed(resourceHandler.appointment!.id!);
});

test.afterAll(async () => {
  await page.close();
  await context.close();
  await resourceHandler.cleanupResources();
});

test('Check assessment page initial state and default MDM saving', async () => {
  await page.goto(`telemed/appointments/${resourceHandler.appointment.id}`);
  await assignAppointmentIfNotYetAssignedToMeAndVerifyPreVideo(page, { forceWaitForAssignButton: true });
  await page
    .getByTestId(dataTestIds.telemedEhrFlow.appointmentVisitTabs(TelemedAppointmentVisitTabs.assessment))
    .click();

  await telemedAssessmentPage.expectDiagnosisDropdown();
  await expect(page.getByTestId(dataTestIds.diagnosisContainer.primaryDiagnosis)).not.toBeVisible();
  await expect(page.getByTestId(dataTestIds.diagnosisContainer.secondaryDiagnosis)).not.toBeVisible();
  await telemedAssessmentPage.expectMdmField({ text: MDM_FIELD_DEFAULT_TEXT });
});

test('Remove MDM and check missing required fields on review and sign page', async () => {
  await page
    .getByTestId(dataTestIds.telemedEhrFlow.appointmentVisitTabs(TelemedAppointmentVisitTabs.assessment))
    .click();
  await telemedAssessmentPage.expectMdmField();
  await telemedAssessmentPage.fillMdmField('');
  await waitForChartDataDeletion(page);

  await page.getByTestId(dataTestIds.telemedEhrFlow.appointmentVisitTabs(TelemedAppointmentVisitTabs.sign)).click();
  await telemedProgressNotePage.expectLoaded();
  await telemedProgressNotePage.verifyReviewAndSignButtonDisabled();
  await expect(page.getByTestId(dataTestIds.progressNotePage.missingCard)).toBeVisible();
  await expect(page.getByTestId(dataTestIds.progressNotePage.emCodeLink)).toBeVisible();
  await expect(page.getByTestId(dataTestIds.progressNotePage.medicalDecisionLink)).toBeVisible();
  await page.getByTestId(dataTestIds.progressNotePage.primaryDiagnosisLink).click();
  await telemedAssessmentPage.expectDiagnosisDropdown();
  await telemedAssessmentPage.expectEmCodeDropdown();
  await telemedAssessmentPage.expectMdmField();
});

test('Search and select diagnoses', async () => {
  await page
    .getByTestId(dataTestIds.telemedEhrFlow.appointmentVisitTabs(TelemedAppointmentVisitTabs.assessment))
    .click();
  await telemedAssessmentPage.expectDiagnosisDropdown();

  // Test ICD 10 code search
  await test.step('Search for ICD 10 code', async () => {
    await telemedAssessmentPage.selectDiagnosis({ diagnosisCode: DIAGNOSIS_CODE });
    await waitForSaveChartDataResponse(
      page,
      (json) =>
        !!json.chartData.diagnosis?.some((x) => x.code.toLocaleLowerCase().includes(DIAGNOSIS_CODE.toLocaleLowerCase()))
    );
  });

  let primaryDiagnosisValue;
  let primaryDiagnosis;
  await test.step('Verify primary diagnosis is visible', async () => {
    primaryDiagnosis = page.getByTestId(dataTestIds.diagnosisContainer.primaryDiagnosis);
    await expect(primaryDiagnosis).toBeVisible();

    primaryDiagnosisValue = await primaryDiagnosis.textContent();
    expect(primaryDiagnosisValue).toContain(DIAGNOSIS_CODE);
  });

  // Test diagnosis name search
  await test.step('Search for diagnosis name', async () => {
    await telemedAssessmentPage.selectDiagnosis({ diagnosisNamePart: DIAGNOSIS_NAME });
    await waitForSaveChartDataResponse(
      page,
      (json) =>
        !!json.chartData.diagnosis?.some((x) =>
          x.display.toLocaleLowerCase().includes(DIAGNOSIS_NAME.toLocaleLowerCase())
        )
    );
  });

  let secondaryDiagnosis;
  let secondaryDiagnosisValue;
  await test.step('Verify secondary diagnosis is visible', async () => {
    secondaryDiagnosis = page.getByTestId(dataTestIds.diagnosisContainer.secondaryDiagnosis);
    await expect(secondaryDiagnosis).toBeVisible();

    secondaryDiagnosisValue = await secondaryDiagnosis.textContent();
    expect(secondaryDiagnosisValue?.toLocaleLowerCase()).toContain(DIAGNOSIS_NAME.toLocaleLowerCase());
  });

  // Verify diagnoses on Review and Sign page
  await test.step('Verify diagnoses on Review and Sign page', async () => {
    await page.getByTestId(dataTestIds.telemedEhrFlow.appointmentVisitTabs(TelemedAppointmentVisitTabs.sign)).click();
    await telemedProgressNotePage.expectLoaded();

    // Verify both diagnoses are present
    await expect(page.getByText(primaryDiagnosisValue!, { exact: false })).toBeVisible();
    await expect(page.getByText(secondaryDiagnosisValue!, { exact: false })).toBeVisible();
  });
});

test('Change primary diagnosis', async () => {
  await page
    .getByTestId(dataTestIds.telemedEhrFlow.appointmentVisitTabs(TelemedAppointmentVisitTabs.assessment))
    .click();
  await telemedAssessmentPage.expectDiagnosisDropdown();
  // Get initial values
  const initialPrimaryDiagnosis = page.getByTestId(dataTestIds.diagnosisContainer.primaryDiagnosis);
  const initialSecondaryDiagnosis = page.getByTestId(dataTestIds.diagnosisContainer.secondaryDiagnosis);
  const initialPrimaryValue = await initialPrimaryDiagnosis.textContent();
  const initialSecondaryValue = await initialSecondaryDiagnosis.textContent();

  // Make secondary diagnosis primary
  await test.step('Make secondary diagnosis primary', async () => {
    await page.getByTestId(dataTestIds.diagnosisContainer.makePrimaryButton).click();
    await waitForSaveChartDataResponse(page);

    // After the primary diagnosis is updated, the secondary diagnosis should be updated, they should be swapped
    const newPrimaryDiagnosis = page.getByTestId(dataTestIds.diagnosisContainer.primaryDiagnosis);
    const newSecondaryDiagnosis = page.getByTestId(dataTestIds.diagnosisContainer.secondaryDiagnosis);
    await expect(newPrimaryDiagnosis).toHaveText(initialSecondaryValue!, { ignoreCase: true });
    await expect(newSecondaryDiagnosis).toHaveText(initialPrimaryValue!, { ignoreCase: true });
  });

  // Verify on Review and Sign page
  await test.step('Verify swapped diagnoses on Review and Sign page', async () => {
    await page.getByTestId(dataTestIds.telemedEhrFlow.appointmentVisitTabs(TelemedAppointmentVisitTabs.sign)).click();
    await telemedProgressNotePage.expectLoaded();

    // Verify both diagnoses are present
    await expect(page.getByText(initialSecondaryValue!, { exact: false })).toBeVisible();
    await expect(page.getByText(initialPrimaryValue!, { exact: false })).toBeVisible();
  });
});

test('Delete primary diagnosis', async () => {
  await page
    .getByTestId(dataTestIds.telemedEhrFlow.appointmentVisitTabs(TelemedAppointmentVisitTabs.assessment))
    .click();
  await telemedAssessmentPage.expectDiagnosisDropdown();
  const primaryDiagnosis = page.getByTestId(dataTestIds.diagnosisContainer.primaryDiagnosis);
  const primaryDiagnosisValue = await primaryDiagnosis.textContent();

  // Get secondary diagnosis value before deletion
  const secondaryDiagnosis = page.getByTestId(dataTestIds.diagnosisContainer.secondaryDiagnosis);
  const secondaryDiagnosisValue = await secondaryDiagnosis.textContent();

  // Delete primary diagnosis
  await test.step('Delete primary diagnosis', async () => {
    await page.getByTestId(dataTestIds.diagnosisContainer.primaryDiagnosisDeleteButton).first().click();
    await waitForChartDataDeletion(page);
    await waitForSaveChartDataResponse(page);

    // Verify secondary diagnosis is promoted to primary
    await expect(page.getByTestId(dataTestIds.diagnosisContainer.primaryDiagnosis)).toBeVisible();
    await expect(page.getByTestId(dataTestIds.diagnosisContainer.secondaryDiagnosis)).not.toBeVisible();

    const newPrimaryDiagnosis = page.getByTestId(dataTestIds.diagnosisContainer.primaryDiagnosis);
    const newPrimaryValue = await newPrimaryDiagnosis.textContent();
    expect(newPrimaryValue?.toLocaleLowerCase()).toEqual(secondaryDiagnosisValue?.toLocaleLowerCase());
  });

  // Verify on Review and Sign page
  await test.step('Verify promoted diagnosis on Review and Sign page, deleted diagnosis is not present', async () => {
    await page.getByTestId(dataTestIds.telemedEhrFlow.appointmentVisitTabs(TelemedAppointmentVisitTabs.sign)).click();
    await telemedProgressNotePage.expectLoaded();

    // Verify only one diagnosis is present
    await expect(page.getByText(secondaryDiagnosisValue!, { exact: false })).toBeVisible();
    await expect(page.getByText(primaryDiagnosisValue!, { exact: false })).not.toBeVisible(DEFAULT_TIMEOUT);
  });
});

test('Medical Decision Making functionality', async () => {
  await page
    .getByTestId(dataTestIds.telemedEhrFlow.appointmentVisitTabs(TelemedAppointmentVisitTabs.assessment))
    .click();
  await telemedAssessmentPage.expectDiagnosisDropdown();

  // Check default text
  await telemedAssessmentPage.expectMdmField({ text: '' });

  // Edit the text
  const newText = 'Updated medical decision making text';
  await telemedAssessmentPage.fillMdmField(newText);

  // Verify text is updated
  await telemedAssessmentPage.expectMdmField({ text: newText });

  // Navigate to Review and Sign to verify text is displayed
  await page.getByTestId(dataTestIds.telemedEhrFlow.appointmentVisitTabs(TelemedAppointmentVisitTabs.sign)).click();
  await telemedProgressNotePage.expectLoaded();
  await expect(page.getByText(newText)).toBeVisible();
});

test('Add E&M code', async () => {
  await page
    .getByTestId(dataTestIds.telemedEhrFlow.appointmentVisitTabs(TelemedAppointmentVisitTabs.assessment))
    .click();
  await telemedAssessmentPage.expectDiagnosisDropdown();

  // Select E&M code
  await test.step('Select E&M code', async () => {
    await telemedAssessmentPage.selectEmCode(E_M_CODE);
    await waitForSaveChartDataResponse(page, (json) => json.chartData.emCode?.code === E_M_CODE);
  });

  await test.step('Verify E&M code is added', async () => {
    const value = await page.getByTestId(dataTestIds.assessmentPage.emCodeDropdown).locator('input').inputValue();

    // Navigate to Review and Sign to verify code is displayed
    await page.getByTestId(dataTestIds.telemedEhrFlow.appointmentVisitTabs(TelemedAppointmentVisitTabs.sign)).click();
    await telemedProgressNotePage.expectLoaded();
    await expect(page.getByText(value)).toBeVisible();
  });

  await test.step('Verify E&M code is added', async () => {
    await page.getByTestId(dataTestIds.telemedEhrFlow.appointmentVisitTabs(TelemedAppointmentVisitTabs.sign)).click();
    await telemedProgressNotePage.expectLoaded();
    await expect(page.getByText(E_M_CODE)).toBeVisible();
  });
});
