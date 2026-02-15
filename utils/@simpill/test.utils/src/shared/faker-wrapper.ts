import { Faker, en } from "@faker-js/faker";
import { FAKE } from "./constants";

export interface FakerWrapperOptions {
  seed?: number;
}

export class FakerWrapper {
  private readonly faker: Faker;

  constructor(options: FakerWrapperOptions = {}) {
    const seed = options.seed ?? FAKE.MIN_NUMBER + 1;
    this.faker = new Faker({ locale: [en], seed });
  }

  string(length: number = FAKE.STRING_LENGTH): string {
    return this.faker.string.alphanumeric(length);
  }

  number(min: number = FAKE.MIN_NUMBER, max: number = FAKE.MAX_NUMBER): number {
    return this.faker.number.int({ min, max });
  }

  boolean(): boolean {
    return this.faker.datatype.boolean();
  }

  email(localPart?: string): string {
    const local = localPart ?? this.faker.string.alphanumeric(8);
    return `${local}@${FAKE.EMAIL_DOMAIN}`;
  }

  uuid(): string {
    return this.faker.string.uuid();
  }

  date(from?: Date, to?: Date): Date {
    const fromDate = from ?? new Date(2000, 0, 1);
    const toDate = to ?? new Date(2030, 11, 31);
    return this.faker.date.between({ from: fromDate, to: toDate });
  }

  pick<T>(arr: ReadonlyArray<T>): T {
    if (arr.length === 0) {
      throw new Error("FakerWrapper.pick: array must not be empty");
    }
    return this.faker.helpers.arrayElement(arr as T[]);
  }
}

export function createFaker(options?: FakerWrapperOptions): FakerWrapper {
  return new FakerWrapper(options);
}
