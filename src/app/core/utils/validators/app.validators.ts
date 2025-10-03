import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class AppValidators {
  static isCPF(control: AbstractControl): ValidationErrors | null {
    const cpf = control.value.replace(/\D/g, "");

    if (/^(\d)\1+$/.test(cpf)) {
      return { isCPF: true };
    }

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }

    let rest = 11 - (sum % 11);
    if (rest === 10 || rest === 11) {
      rest = 0;
    }

    if (rest !== parseInt(cpf.charAt(9))) {
      return { isCPF: true };
    }

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }

    rest = 11 - (sum % 11);
    if (rest === 10 || rest === 11) {
      rest = 0;
    }

    if (rest !== parseInt(cpf.charAt(10))) {
      return { isCPF: true };
    }
    return null;
  }

  static minDate(min: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const [dd, mm, yyyy] = control.value
        .split("/")
        .map((a: string) => a || 0)
        .map(Number);

      const date = new Date(yyyy, mm - 1, dd);
      if (date.getTime() > min.getTime()) {
        return null;
      }
      return { mindDate: min };
    };
  }
  static isCPNJ(control: AbstractControl): ValidationErrors | null {
    const cnpj = control.value.replace(/\D/g, "");

    if (/^(\d)\1+$/.test(cnpj)) {
      return { isCNPJ: true };
    }

    let size = cnpj.length - 2;
    let numbers = cnpj.substring(0, size);
    let digits = cnpj.substring(size);
    let sum = 0;
    let position = size - 7;
    for (let i = size; i >= 1; i--) {
      sum += numbers.charAt(size - i) * position--;
      if (position < 2) {
        position = 9;
      }
    }
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result != digits.charAt(0)) {
      return { isCPNJ: true };
    }
    size = size + 1;
    numbers = cnpj.substring(0, size);
    sum = 0;
    position = size - 7;
    for (let i = size; i >= 1; i--) {
      sum += numbers.charAt(size - i) * position--;
      if (position < 2) position = 9;
    }
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result != digits.charAt(1)) {
      return { isCPNJ: true };
    }

    return null;
  }
}
