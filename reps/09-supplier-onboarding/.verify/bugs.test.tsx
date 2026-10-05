import { Component, type ReactNode } from "react";
import { render, screen, within } from "@testing-library/react";
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

describe("rep 09: page works outside the planted bugs", () => {
  it("shows the checklist, the ring, and gates submit on completion", async () => {
    const user = userEvent.setup();
    await loadPage();
    expect(within(screen.getByLabelText("Checklist")).getAllByRole("listitem")).toHaveLength(4);
    expect(screen.getByLabelText("Completion")).toHaveTextContent("50%");
    expect(screen.getByLabelText("Submit onboarding")).toBeDisabled();
    await user.selectOptions(screen.getByLabelText("Supplier type"), "activity");
    await user.click(screen.getByLabelText("Received W-9"));
    expect(screen.getByLabelText("Submit onboarding")).toBeEnabled();
  });
  it("reviews an uploaded document", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.selectOptions(screen.getByLabelText("Document to review"), "insurance");
    expect(screen.getByLabelText("Review details")).toHaveTextContent("bah-liability.pdf");
    expect(screen.getByLabelText("Review details")).toHaveTextContent("Received");
  });
});

describe("rep 09: the three planted bugs reproduce", () => {
  it("ONB-301: typing the supplier name re-renders every checklist row", async () => {
    const user = userEvent.setup();
    await loadPage();
    const before = renders("insurance");
    await user.type(screen.getByLabelText("Supplier name"), "xyz");
    expect(renders("insurance")).toBe(before + 3);
    expect(renders("bank")).toBeGreaterThan(1);
  });
  it("ONB-305: picking a document that was never uploaded blanks the page", async () => {
    const user = userEvent.setup();
    await loadPage();
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await user.selectOptions(screen.getByLabelText("Document to review"), "bank");
    expect(screen.getByTestId("crash")).toBeInTheDocument();
    spy.mockRestore();
  });
  it("ONB-309: switching the supplier type doesn't update the ring until a box is ticked", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.selectOptions(screen.getByLabelText("Supplier type"), "activity");
    expect(screen.getByText("3 required documents")).toBeInTheDocument();
    expect(screen.getByLabelText("Completion")).toHaveTextContent("50%");
    await user.click(screen.getByLabelText("Received W-9"));
    expect(screen.getByLabelText("Completion")).toHaveTextContent("100%");
  });
});
