export * from './helpers';

export interface Secrets {
  [secretName: string]: string;
}

export const getOptionalSecret = (secretKey: string, secrets: Secrets | null): string | undefined => {
  return secrets != null ? secrets[secretKey] : process.env[secretKey];
};

export const getSecret = (secretKey: string, secrets: Secrets | null): string => {
  const value = getOptionalSecret(secretKey, secrets);
  if (value == null) {
    throw new Error(`Secret or Environment Variable with key ${secretKey} was not set.`);
  }
  return value;
};

export enum SecretsKeys {
  WEBSITE_URL = 'WEBSITE_URL',
  AUTH0_ENDPOINT = 'AUTH0_ENDPOINT',
  AUTH0_AUDIENCE = 'AUTH0_AUDIENCE',
  AUTH0_CLIENT = 'AUTH0_CLIENT',
  AUTH0_SECRET = 'AUTH0_SECRET',
  DEFAULT_BILLING_RESOURCE = 'DEFAULT_BILLING_RESOURCE',
  FHIR_API = 'FHIR_API',
  PROJECT_API = 'PROJECT_API',
  ENVIRONMENT = 'ENVIRONMENT',
  SENDGRID_API_KEY = 'SENDGRID_API_KEY',
  VIRTUAL_SENDGRID_EMAIL_BCC = 'VIRTUAL_SENDGRID_EMAIL_BCC',
  VIRTUAL_SENDGRID_CONFIRMATION_EMAIL_TEMPLATE_ID = 'VIRTUAL_SENDGRID_CONFIRMATION_EMAIL_TEMPLATE_ID',
  VIRTUAL_SENDGRID_CANCELLATION_EMAIL_TEMPLATE_ID = 'VIRTUAL_SENDGRID_CANCELLATION_EMAIL_TEMPLATE_ID',
  VIRTUAL_SENDGRID_ERROR_EMAIL_TEMPLATE_ID = 'VIRTUAL_SENDGRID_ERROR_EMAIL_TEMPLATE_ID',
  VIRTUAL_SENDGRID_VIDEO_CHAT_INVITATION_EMAIL_TEMPLATE_ID = 'VIRTUAL_SENDGRID_VIDEO_CHAT_INVITATION_EMAIL_TEMPLATE_ID',
  ORGANIZATION_ID = 'ORGANIZATION_ID',
  NLM_API_KEY = 'NLM_API_KEY',
  SENDGRID_EMAIL_BCC = 'SENDGRID_EMAIL_BCC',
  IN_PERSON_SENDGRID_CONFIRMATION_EMAIL_TEMPLATE_ID = 'IN_PERSON_SENDGRID_CONFIRMATION_EMAIL_TEMPLATE_ID',
  IN_PERSON_SENDGRID_CANCELLATION_EMAIL_TEMPLATE_ID = 'IN_PERSON_SENDGRID_CANCELLATION_EMAIL_TEMPLATE_ID',
  IN_PERSON_SENDGRID_SPANISH_CONFIRMATION_EMAIL_TEMPLATE_ID = 'IN_PERSON_SENDGRID_SPANISH_CONFIRMATION_EMAIL_TEMPLATE_ID',
  IN_PERSON_SENDGRID_SPANISH_CANCELLATION_EMAIL_TEMPLATE_ID = 'IN_PERSON_SENDGRID_SPANISH_CANCELLATION_EMAIL_TEMPLATE_ID',
  IN_PERSON_SENDGRID_ERROR_EMAIL_TEMPLATE_ID = 'IN_PERSON_SENDGRID_ERROR_EMAIL_TEMPLATE_ID',
  IN_PERSON_SENDGRID_ISSUE_REPORT_EMAIL_TEMPLATE_ID = 'IN_PERSON_SENDGRID_ISSUE_REPORT_EMAIL_TEMPLATE_ID',
  IN_PERSON_PREBOOK_DISPLAY_TOMORROW_SLOTS_AT_HOUR = 'IN_PERSON_PREBOOK_DISPLAY_TOMORROW_SLOTS_AT_HOUR',
  UC_SENDGRID_ISSUE_REPORT_EMAIL_TEMPLATE_ID = 'UC_SENDGRID_ISSUE_REPORT_EMAIL_TEMPLATE_ID',
  INTAKE_ISSUE_REPORT_EMAIL_GROUP_ID = 'INTAKE_ISSUE_REPORT_EMAIL_GROUP_ID',
  SENTRY_INTAKE_API_AUTH_TOKEN = 'SENTRY_INTAKE_API_AUTH_TOKEN',
  PROJECT_ID = 'PROJECT_ID',
  SENTRY_AUTH_TOKEN = 'SENTRY_AUTH_TOKEN',
  SENTRY_ORG = 'SENTRY_ORG',
  SENTRY_PROJECT = 'SENTRY_PROJECT',
  SENTRY_DSN = 'SENTRY_DSN',
  TELEMED_CLIENT_ID = 'TELEMED_CLIENT_ID',
  TELEMED_CLIENT_SECRET = 'TELEMED_CLIENT_SECRET',
  IN_PERSON_PREVISIT_QUESTIONNAIRE = 'IN_PERSON_PREVISIT_QUESTIONNAIRE',
  VIRTUAL_PREVISIT_QUESTIONNAIRE = 'VIRTUAL_PREVISIT_QUESTIONNAIRE',
  CANDID_CLIENT_ID = 'CANDID_CLIENT_ID',
  CANDID_CLIENT_SECRET = 'CANDID_CLIENT_SECRET',
  CANDID_ENV = 'CANDID_ENV',
  STRIPE_PUBLIC_KEY = 'STRIPE_PUBLIC_KEY',
  STRIPE_SECRET_KEY = 'STRIPE_SECRET_KEY',
  ANTHROPIC_API_KEY = 'ANTHROPIC_API_KEY',
}
