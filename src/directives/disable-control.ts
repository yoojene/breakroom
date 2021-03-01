import { NgControl } from '@angular/forms';
import { Directive, Input } from '@angular/core';

/** https://netbasal.com/disabling-form-controls-when-working-with-reactive-
 * forms-in-angular-549dd7b42110 */

@Directive({
  selector: '[disableControl]'
})
export class DisableControlDirective {

  @Input() set disableControl( condition: boolean ) {
    const action = condition ? 'disable' : 'enable';
    this.ngControl.control[action]();
  }

  constructor( private ngControl: NgControl ) {
  }

}
