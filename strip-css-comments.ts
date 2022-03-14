import isRegExp from 'is-regexp';

type Option = {
  preserve?: boolean | RegExp | ((comment: string) => boolean)
  all?: boolean
}

export const stripCSSComments = (str: string, opts: Option = {}) => {
	str = str.toString();

	let preserveFilter;
	let comment = '';
	let currentChar = '';
	let insideString: boolean | string = false;
	let preserveImportant = !(opts.preserve === false || opts.all === true);
	let ret = '';

	if (typeof opts.preserve === 'function') {
		preserveImportant = false;
		preserveFilter = opts.preserve;
	} else if (isRegExp(opts.preserve)) {
		preserveImportant = false;
		preserveFilter = (comment: string) => (opts.preserve as RegExp).test(comment);
	}

	for (let i = 0; i < str.length; i++) {
		currentChar = str[i];

		if (str[i - 1] !== '\\') {
			if (currentChar === '"' || currentChar === '\'') {
				if (insideString === currentChar) {
					insideString = false;
				} else if (!insideString) {
					insideString = currentChar;
				}
			}
		}

		// find beginning of /* type comment
		if (!insideString && currentChar === '/' && str[i + 1] === '*') {
			// ignore important comment when configured to preserve comments using important syntax: /*!
			if (!(preserveImportant && str[i + 2] === '!')) {
				let j = i + 2;

				// iterate over comment
				for (; j < str.length; j++) {
					// find end of comment
					if (str[j] === '*' && str[j + 1] === '/') {
						if (preserveFilter) {
							// evaluate comment text
							ret = preserveFilter(comment) ? `${ret}/*${comment}*/` : ret;
							comment = '';
						}

						break;
					}

					// store comment text to be evaluated by the filter when the end of the comment is reached
					if (preserveFilter) {
						comment += str[j];
					}
				}

				// resume iteration over CSS string from the end of the comment
				i = j + 1;

				continue;
			}
		}

		ret += currentChar;
	}

	return ret;
};
