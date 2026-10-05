import { Component, type ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

class Boundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(err: Error) { return { error: err.message }; }
  render() { return this.state.error ? <div data-testid="crash">{this.state.error}</div> : this.props.children; }
}
async function loadPage() {
  render(<Boundary><App /></Boundary>);
  await screen.findByRole("heading", { level: 1, name: /Bairro Alto Hotel/ }, { timeout: 3000 });
}

describe("rep 19: page works outside the planted bugs", () => {
  it("picks a check-in, prices the stay, and switches months", async () => {
    const user = userEvent.setup();
    await loadPage();
    expect(screen.getByLabelText("Day 5")).toBeDisabled();
    await user.click(screen.getByLabelText("Day 3"));
    expect(screen.getByLabelText("Night count")).toHaveTextContent("3");
    expect(screen.getByLabelText("Stay total")).toHaveTextContent("$1,299");
    await user.selectOptions(screen.getByLabelText("Nights"), "5");
    expect(screen.getByLabelText("Night count")).toHaveTextContent("5");
    expect(screen.getByLabelText("Stay total")).toHaveTextContent("$2,165");
  });
});

describe("rep 19: the three planted bugs reproduce", () => {
  it("AVL-301: the flexible dates box can't be unticked", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByLabelText("Flexible dates"));
    expect(screen.getByLabelText("Flexible dates")).toBeChecked();
    expect(screen.getByLabelText("Flexibility note")).toHaveTextContent("Showing a day either side");
    await user.click(screen.getByLabelText("Flexible dates"));
    expect(screen.getByLabelText("Flexible dates")).toBeChecked();
    expect(screen.getByLabelText("Flexibility note")).toHaveTextContent("Showing a day either side");
  });
  it("AVL-305: switching months with a day selected blanks the page", async () => {
    const user = userEvent.setup();
    await loadPage();
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await user.click(screen.getByLabelText("Day 3"));
    await user.selectOptions(screen.getByLabelText("Month"), "2027-03");
    await waitFor(() => expect(screen.getByTestId("crash")).toBeInTheDocument(), { timeout: 3000 });
    spy.mockRestore();
  });
  it("AVL-309: a seven-night March stay across the clock change counts six nights", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.selectOptions(screen.getByLabelText("Month"), "2027-03");
    await screen.findByLabelText("Day 12", {}, { timeout: 3000 });
    await user.selectOptions(screen.getByLabelText("Nights"), "7");
    await user.click(screen.getByLabelText("Day 12"));
    expect(screen.getByText("Mar 19, 2027")).toBeInTheDocument();
    expect(screen.getByLabelText("Night count")).toHaveTextContent("6");
    expect(screen.getByLabelText("Stay total")).toHaveTextContent("$1,926");
  });
});
