import { hello } from "../src";

it("Index file default export", () => {
  expect(hello).toBe("Hello from Index");
});
