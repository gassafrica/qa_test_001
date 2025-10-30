import { sanitizeName } from './server';

describe('sanitizeName', () => {
  it('should remove apostrophes from names', () => {
    expect(sanitizeName("Luc O'Connor")).toBe("Luc OConnor");
    expect(sanitizeName("Sara O'Malley")).toBe("Sara OMalley");
    expect(sanitizeName("Renee O'Connor")).toBe("Renee OConnor");
  });

  it('should remove accents from characters', () => {
    expect(sanitizeName("María López")).toBe("Maria Lopez");
  });

  it('should handle curly apostrophes', () => {
    expect(sanitizeName("T'Challa Udaku")).toBe("TChalla Udaku");
  });

  it('should preserve regular names without special characters', () => {
    expect(sanitizeName("Aminah Bello")).toBe("Aminah Bello");
    expect(sanitizeName("Jason Smith")).toBe("Jason Smith");
    expect(sanitizeName("Noah Johnson")).toBe("Noah Johnson");
    expect(sanitizeName("Chidera Obi")).toBe("Chidera Obi");
  });

  it('should normalize multiple spaces to single space', () => {
    expect(sanitizeName("John    Doe")).toBe("John Doe");
  });

  it('should trim leading and trailing spaces', () => {
    expect(sanitizeName("  John Doe  ")).toBe("John Doe");
  });

  it('should remove other special characters', () => {
    expect(sanitizeName("John-Doe")).toBe("JohnDoe");
    expect(sanitizeName("Mary.Jane")).toBe("MaryJane");
  });
});