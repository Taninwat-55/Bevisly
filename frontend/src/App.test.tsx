import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

describe("Sanity Check", () => {
  it("renders a simple component properly", () => {
    render(<div>Hello Vitest!</div>);
    expect(screen.getByText("Hello Vitest!")).toBeInTheDocument();
  });
});
