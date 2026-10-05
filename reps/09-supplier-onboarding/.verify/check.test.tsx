import { Component, type ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

class Boundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(err: Error) { return { error: err.message }; }
  render() { return this.state.error ? <div data-testid="crash">{this.state.error}</div> : this.props.children; }
}
async function loadPage() {
  render(<Boundary><App /></Boundary>);
  await screen.findByLabelText("Checklist", {}, { timeout: 3000 });
}
const renders = (kind: string) => Number(screen.getByTestId(`row-${kind}`).getAttribute("data-renders"));

describe("rep 09: your fixes", () => {
  it("ONB-301 fixed: typing doesn't re-render rows, and toggling one row re-renders only that row", async () => {
    const user = userEvent.setup();
    await loadPage();
    const insuranceBefore = renders("insurance");
    const bankBefore = renders("bank");
    await user.type(screen.getByLabelText("Supplier name"), "xyz");
    expect(renders("insurance")).toBe(insuranceBefore);
    expect(renders("bank")).toBe(bankBefore);
    await user.click(screen.getByLabelText("Received W-9"));
    expect(renders("insurance")).toBe(insuranceBefore);
    expect(renders("w9")).toBeGreaterThan(1);
  });
  it("ONB-305 fixed: a missing document shows as not uploaded instead of crashing", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.selectOptions(screen.getByLabelText("Document to review"), "bank");
    expect(screen.queryByTestId("crash")).not.toBeInTheDocument();
    expect(screen.getByText(/not been uploaded/i)).toBeInTheDocument();
    const option = screen.getByRole("option", { name: /Bank details/ });
    expect(option).toHaveTextContent(/missing/i);
  });
  it("ONB-309 fixed: the ring follows the supplier type", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.selectOptions(screen.getByLabelText("Supplier type"), "activity");
    expect(screen.getByLabelText("Completion")).toHaveTextContent("67%");
    await user.selectOptions(screen.getByLabelText("Supplier type"), "transfer");
    expect(screen.getByLabelText("Completion")).toHaveTextContent("50%");
  });
  it("the rest of the page still works", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.selectOptions(screen.getByLabelText("Document to review"), "insurance");
    expect(screen.getByLabelText("Review details")).toHaveTextContent("bah-liability.pdf");
  });
});
