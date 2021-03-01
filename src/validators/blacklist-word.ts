
import { AbstractControl, Validators, ValidatorFn } from '@angular/forms';

import { isPresent } from './lang';

// Modified from https://github.com/manjurulcis/ng4-validation

export const blacklistWords = (words: string[]): ValidatorFn => {
  // tslint:disable-next-line:cyclomatic-complexity
  return (control: AbstractControl): { [key: string]: boolean } => {

    if (!words.length) return null;
    if (!isPresent(blacklistWords)) return null;
    if (isPresent(Validators.required(control))) return null;

    const v = control.value.split(' ');
    let validated = false;

    // Value not equal
    for (const i in v) {
      if (words.indexOf(v[i]) > -1) {
        validated = true;
        break;
      }
    }

    // check upper case variants
    const upperCaseWords = words.map(a => a.toUpperCase());
    for (const i in v) {
      if (upperCaseWords.indexOf(v[i]) > -1) {
        validated = true;
        break;
      }
    }

    const capitalisedWords = words.map(a => a[0].toUpperCase() + a.slice(1));
    for (const i in v) {
      if (capitalisedWords.indexOf(v[i]) > -1) {
        validated = true;
        break;
      }
    }

    if (!validated) return null;

    return {
      blacklistWords: true
    };
  };
};
