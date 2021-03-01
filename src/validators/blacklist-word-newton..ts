
import { AbstractControl, Validators, ValidatorFn } from '@angular/forms';
import { ContentProvider } from '../providers/content/content';
import { isPresent } from './lang';

// Modified from https://github.com/manjurulcis/ng4-validation

export const blacklistWordspharma = (content: ContentProvider): ValidatorFn => {
  // tslint:disable-next-line:cyclomatic-complexity
  // return (control: AbstractControl): { [key: string]: boolean } => {
  return (control: AbstractControl) => {

    // tslint:disable-next-line:cyclomatic-complexity
    return content.getBannedWords().then((res: any) => {

      const result = res.results;

      const words = result[0].attributes.words.banned;

       if (!words.length) return null;
       if (!isPresent(blacklistWordspharma)) return null;
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

      return validated ? { blacklistWords: true} : null;

    });
  };
};
