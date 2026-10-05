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
  await screen.findByRole("heading", { level: 2, name: "Maya Okafor" }, { timeout: 3000 });
}

describe("rep 13: page works outside the planted bugs", () => {
  it("lists travelers with days left, flags Yuki, opens a panel, and saves notes", async () => {
    const user = userEvent.setup();
    await loadPage();
    expect(screen.getByLabelText("Passport Tunde Okafor")).toHaveTextContent("253 days left");
    expect(screen.getByLabelText("Renewal Yuki Tanaka")).toBeInTheDocument();
    expect(screen.queryByLabelText("Renewal Tunde Okafor")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Open Ada Okafor" }));
    expect(screen.getByLabelText("Notes")).toHaveValue("Minor; needs consent letter when traveling with one parent.");
    await user.type(screen.getByLabelText("Notes"), " Updated.");
    await user.click(screen.getByRole("button", { name: "Save notes" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Save notes" })).toBeEnabled(), { timeout: 3000 });
  });
});

describe("rep 13: the three planted bugs reproduce", () => {
  it("TRV-610: opening a traveler with a renewal warning blanks the page", async () => {
    const user = userEvent.setup();
    await loadPage();
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await user.click(screen.getByRole("button", { name: "Open Yuki Tanaka" }));
    await waitFor(() => expect(screen.getByTestId("crash")).toBeInTheDocument(), { timeout: 3000 });
    expect(screen.getByTestId("crash")).toHaveTextContent(/hooks/);
    spy.mockRestore();
  });
  it("TRV-614: a traveler without a passport shows NaN days left", async () => {
    await loadPage();
    expect(screen.getByLabelText("Passport Noah Reyes")).toHaveTextContent("NaN days left");
  });
  it("TRV-618: Ada's May 1 passport isn't flagged though it's under six months after the trip", async () => {
    await loadPage();
    expect(screen.queryByLabelText("Renewal Ada Okafor")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Renewal Sofia Reyes")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Renewal Yuki Tanaka")).toBeInTheDocument();
  });
});
