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
  await screen.findByRole("heading", { level: 1, name: /Bairro Alto Hotel/ }, { timeout: 3000 });
}

describe("rep 19: your fixes", () => {
  it("AVL-301 fixed: flexible dates toggles both ways", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByLabelText("Flexible dates"));
    expect(screen.getByLabelText("Flexibility note")).toHaveTextContent("Showing a day either side");
    await user.click(screen.getByLabelText("Flexible dates"));
    expect(screen.getByLabelText("Flexible dates")).not.toBeChecked();
    expect(screen.getByLabelText("Flexibility note")).toHaveTextContent("Exact dates only");
  });
  it("AVL-305 fixed: switching months clears the selection instead of crashing", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByLabelText("Day 3"));
    await user.selectOptions(screen.getByLabelText("Month"), "2027-03");
    await screen.findByLabelText("Day 12", {}, { timeout: 3000 });
    expect(screen.queryByTestId("crash")).not.toBeInTheDocument();
    expect(screen.getByText("Pick a check-in day on the grid.")).toBeInTheDocument();
  });
  it("AVL-309 fixed: seven nights are seven nights across the clock change", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.selectOptions(screen.getByLabelText("Month"), "2027-03");
    await screen.findByLabelText("Day 12", {}, { timeout: 3000 });
    await user.selectOptions(screen.getByLabelText("Nights"), "7");
    await user.click(screen.getByLabelText("Day 12"));
    expect(screen.getByLabelText("Night count")).toHaveTextContent("7");
    expect(screen.getByLabelText("Stay total")).toHaveTextContent("$2,247");
  });
  it("the rest of the page still works", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByLabelText("Day 3"));
    expect(screen.getByLabelText("Stay total")).toHaveTextContent("$1,299");
  });
});
