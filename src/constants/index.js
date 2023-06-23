// App_Init
export const APP_INIT = "APP_INIT";
export const APP_TITLE = "Template";

// Error Code
export const E_PICKER_CANCELLED = "E_PICKER_CANCELLED";
export const E_PICKER_CANNOT_RUN_CAMERA_ON_SIMULATOR =
  "E_PICKER_CANNOT_RUN_CAMERA_ON_SIMULATOR";
export const E_PERMISSION_MISSING = "E_PERMISSION_MISSING";
export const E_PICKER_NO_CAMERA_PERMISSION = "E_PICKER_NO_CAMERA_PERMISSION";
export const E_USER_CANCELLED = "E_USER_CANCELLED";
export const E_UNKNOWN = "E_UNKNOWN";
export const E_DEVELOPER_ERROR = "E_DEVELOPER_ERROR";
export const TIMEOUT_NETWORK = "ECONNABORTED"; // request service timeout
export const NOT_CONNECT_NETWORK = "NOT_CONNECT_NETWORK";

//////////////// Localization Begin ////////////////
export const NETWORK_CONNECTION_MESSAGE =
  "Cannot connect to server, Please try again.";
export const NETWORK_TIMEOUT_MESSAGE =
  "A network timeout has occurred, Please try again.";
export const UPLOAD_PHOTO_FAIL_MESSAGE =
  "An error has occurred. The photo was unable to upload.";

// export const apiUrl = "http://localhost:2009/api/ALA_clinic/";
// export const apiUrl = "http://alaclinic.3bbddns.com:53141/api/ALA_clinic/";
export const apiUrl = "https://asia-southeast1-ala-clinic.cloudfunctions.net/alaclinicBackend/api/ALA_clinic/";


export const YES = "YES";
export const NO = "NO";
export const OK = "ok";
export const NOK = "nok";

export const themeColor1 = '#E9C070'
export const themeColor2 = '#55C5D9'

export const server = {
  LOGIN_URL: `authen/login`,
  REGISTER_URL: `authen/register`,
  USER_URL: `manage_user/user`,

  CHANGE_LV_URL: 'manage_user/changeLevel',
  FIND_USER_URL: 'manage_user/find/user',

  LAST_PATIENT_ID_URL: 'patient/last_patient_id',
  PATIENT_DATA_URL: 'patient/patientData',
  FIND_PATIENT_DATA_URL: 'patient/find/patientData',
  STATUS_PATIENT_DATA_URL: 'patient/status/patientData',

  PROMOTIONS_DATA_URL: 'promotions/master',
  PROMOTIONS_CATEGORY_URL: 'promotions/category',
  FIND_PROMOTIONS_DATA_URL: 'promotions/find/master',

  PROCESS_TRANSACTION_URL: 'transactions/process',

  PANTIENT_HISTORY_URL: 'patient/patientHistory',
  PAYMENT_URL: 'payment/payment',
  PAYMENT_LIST_URL: 'payment/payment_list',

  REPORT_GENERAL_URL: 'report/general',
  REPORT_DAILY_SALES_URL: 'report/dailtSalesDetail',
  REPORT_SALES_ANALYSIS_URL: 'report/salesAnalysis',

  REPORT_NEW_CUSTOMER_URL: 'report/dailyNewCustomer',
  CUSTOMER_IMAGE_URL: 'customer_images/images',
  CUSTOMER_FULL_IMAGE_URL: 'customer_images/full_images',

  APPOINTMENT_URL: 'appointment/appointment',
  APPOINTMENT_PANTIENT_URL: 'appointment/appointment_pantient',
  APPOINTMENT_DATE_URL: 'appointment/appointment_date',

  product: {
    product: 'product/product',
    sugressionProductType: 'product/sugressionProductType',
    findProduct: 'product/findProduct'
  },

  stock: {
    stock: 'stock/stock',
    issue: 'stock/issue',
    stockTracking: 'stock/stockTracking',
    detail: 'stock/detail',
    summary: 'stock/summary',

  }
};

export const key = {
  LOGIN_PASSED: `LOGIN_PASSED`,
  USER_LV: `USER_LV`,
  USER_NAME: "USER_NAME",
  TOKEN: "TOKEN",
  TIME_LOGIN: 'TIME_LOGIN',
};
