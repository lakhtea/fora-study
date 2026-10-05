import { Component, type ReactNode } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

class Boundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(err: Error) { return { error: err.message }; }
  render() { return this.state.error ? <div data-testid="crash">{this.state.error}</div> : this.props.children; }
}
async function loadPage() {
  render(<Boundary><App /></Boundary>);
  await screen.findByLabelText("Board", {}, { timeout: 3000 });
}
const firstRow = () => within(screen.getByLabelText("Board")).getAllByRole("row")[1].textContent ?? "";
const renders = (id: number) => Number(screen.getByTestId(`row-${id}`).getAttribute("data-renders"));

describe("rep 20: your fixes", () => {
  it("LDB-410 fixed: the clock ticks and the rows stay put", async () => {
    await loadPage();
    const before = renders(1);
    const updatedBefore = screen.getByLabelText("Updated").textContent;
    await new Promise((r) => setTimeout(r, 2200));
    expect(screen.getByLabelText("Updated").textContent).not.toEqual(updatedBefore);
    expect(renders(1)).toBe(before);
  });
  it("LDB-414 fixed: an unranked advisor sees that they're not ranked yet", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.selectOptions(screen.getByLabelText("View as"), "7");
    expect(screen.queryByTestId("crash")).not.toBeInTheDocument();
    expect(screen.getByLabelText("My position")).toHaveTextContent(/Not ranked yet/);
  });
  it("LDB-419 fixed: bottom first is stable and reversible, and the rank card is unaffected", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByLabelText("Bottom first"));
    expect(firstRow()).toContain("Fatima El-Amin");
    await new Promise((r) => setTimeout(r, 1100));
    expect(firstRow()).toContain("Fatima El-Amin");
    expect(screen.getByLabelText("My position")).toHaveTextContent("#1 this month");
    expect(screen.getByText(/You lead the board/)).toBeInTheDocument();
    await user.click(screen.getByLabelText("Bottom first"));
    expect(firstRow()).toContain("Maya Okafor");
  });
  it("the rest of the page still works", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.selectOptions(screen.getByLabelText("Period"), "quarter");
    await waitFor(() => expect(screen.getByLabelText("My position")).toHaveTextContent("#2 this quarter"), { timeout: 3000 });
  });
});
