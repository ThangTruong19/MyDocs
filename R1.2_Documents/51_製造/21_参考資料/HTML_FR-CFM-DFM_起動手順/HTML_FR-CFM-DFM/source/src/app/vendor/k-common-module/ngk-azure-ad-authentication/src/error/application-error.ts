export abstract class ApplicationError implements Error {
  public name: string;

  protected constructor(public message: string) {
    this.name = new.target.name;
  }

  toString() {
    return this.name + ': ' + this.message;
  }
}
