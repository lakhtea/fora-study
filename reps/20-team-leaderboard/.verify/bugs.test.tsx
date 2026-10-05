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

describe("rep 20: page works outside the planted bugs", () => {
  it("shows the board, my rank, and switches period", async () => {
    const user = userEvent.setup();
    await loadPage();
    expect(firstRow()).toContain("Maya Okafor");
    expect(screen.getByLabelText("My position")).toHaveTextContent("#1 this month");
    expect(screen.getByLabelText("Updated")).toHaveTextContent(/Updated \ds ago/);
    await user.selectOptions(screen.getByLabelText("Period"), "quarter");
    await waitFor(() => expect(screen.getByLabelText("My position")).toHaveTextContent("#2 this quarter"), { timeout: 3000 });
    expect(firstRow()).toContain("Leo Castellano");
  });
});

describe("rep 20: the three planted bugs reproduce", () => {
  it("LDB-410: every row re-renders on every clock tick", async () => {
    await loadPage();
    const before = renders(1);
    await new Promise((r) => setTimeout(r, 2200));
    expect(renders(1)).toBeGreaterThanOrEqual(before + 2);
  });
  it("LDB-414: viewing as an unranked advisor blanks the page", async () => {
    const user = userEvent.setup();
    await loadPage();
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await user.selectOptions(screen.getByLabelText("View as"), "7");
    await waitFor(() => expect(screen.getByTestId("crash")).toBeInTheDocument(), { timeout: 3000 });
    spy.mockRestore();
  });
  it("LDB-419: bottom first flips the order every second and the rank card follows", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByLabelText("Bottom first"));
    expect(firstRow()).toContain("Fatima El-Amin");
    await new Promise((r) => setTimeout(r, 1100));
    expect(firstRow()).toContain("Maya Okafor");
    await new Promise((r) => setTimeout(r, 1000));
    expect(firstRow()).toContain("Fatima El-Amin");
  });
});
