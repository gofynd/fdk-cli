export const getGlobalConfigValue = (globalConfig, id) => {
return (globalConfig?.props?.[id] ) ?? '';
}

export const getSocialIcon = (title) =>
  title && typeof title === 'string' ? `footer-${title.toLowerCase()}` : '';

export function replaceQueryPlaceholders(queryFormat, value1, value2) {
  return queryFormat.replace('{}', value1).replace('{}', value2);
}

export const singleValuesFilters = {
  sortOn: true,
};

export const numberWithCommas = (number) => {
  let num = number;
  if (number?.toString()[0] === '-') {
      num = number.toString().substring(1);
  }

  if (num) {
      let no =
          num.toString().split('.')[0].length > 3
              ? num
                    .toString()
                    .substring(0, num.toString().split('.')[0].length - 3)
                    .replace(/\B(?=(\d{2})+(?!\d))/g, ',') +
                ',' +
                num
                    .toString()
                    .substring(num.toString().split('.')[0].length - 3)
              : num.toString();

      if (number.toString()[0] === '-') {
          no = '-' + no;
      }
      return no;
  } else {
      return 0;
  }
};
export function isRunningOnClient() {
	if (typeof window !== 'undefined') {
		return globalThis === window;
	}

	return false;
}

export function convertDate(dateString) {
  const date = new Date(dateString);

  const options = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    timeZone: 'UTC',
  };

  const formatter = new Intl.DateTimeFormat('en-US', options);
  const formattedDate = formatter.format(date);

  return formattedDate;
}

export function validateEmailField(value) {
  let emailPattern =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailPattern.test(value);
}

export function validatePhone(phoneNo) {
  const re = /^[0-9]{10}$/;
  return phoneNo && phoneNo.length && re.test(phoneNo.trim());
}

export function validatePasswordField(value) {
  let passwordPattern =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[`~\!@#\$%\^\&\*\(\)\-_\=\+\[\{\}\]\\|;:\'",<.>\/\?€£¥₹§±])[A-Za-z\d`~\!@#\$%\^\&\*\(\)\-_\=\+\[\{\}\]\\|;:\'",<.>\/\?€£¥₹§±]{8,}$/;
  return passwordPattern.test(value);
}

export function checkIfNumber(value) {
  let numberPattern = /^[0-9]+$/;
  return numberPattern.test(value);
}

