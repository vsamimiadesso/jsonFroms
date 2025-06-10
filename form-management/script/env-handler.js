const fs = require('fs');
const path = require('path');

const formManagementServicesURLDefault = "wfwp-dev.ais-dev.afida.io/form-management";

const formManagementServicesURL = process.env.FORM_MANAGEMENT_SERVICE_URL || formManagementServicesURLDefault;

const generatedFileName = fs.readdirSync(path.join(__dirname, '../../../../dist/insuria-iwp/browser/')).filter(fn => fn.startsWith('env-config-fm'))[0];
const target = path.join(__dirname, '../../../../dist/insuria-iwp/browser/', generatedFileName);

fs.writeFileSync(target, 'FORM_MANAGEMENT_CONFIG = {formManagementServicesUrl: "' + formManagementServicesURL + '"};');
console.log(target + " updated with " + formManagementServicesURL );
