import { Component, type ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { resetServer } from "../api/server";

class Boundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(err: Error) { return { error: err.message }; }
  render() { return this.state.error ? <div data-testid="crash">{this.state.error}</div> : this.props.children; }
}
beforeEach(() => resetServer());
async function loadPage() {
  render(<Boundary><App /></Boundary>);
  await screen.findByRole("heading", { level: 1, name: /Good morning/ }, { timeout: 3000 });
}

describe("rep 25: page works outside the planted bugs", () => {
  it("lists tasks, opens one, completes another, and shows the spotlight contact details", async () => {
    const user = userEvent.setup();
    await loadPage();
    expect(screen.getByText("Today (4 open)")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Open Send Lisbon proposal v2" }));
    expect(screen.getByLabelText("Task panel")).toHaveTextContent("Maya Okafor");
    await user.click(screen.getByRole("button", { name: "Done Chase Kyoto rate" }));
    await waitFor(() => expect(screen.getByText("Today (3 open)")).toBeInTheDocument(), { timeout: 3000 });
    expect(screen.getByLabelText("Spotlight")).toHaveTextContent("+1 718 555 0142");
    expect(screen.getByLabelText("Spotlight trip")).toHaveTextContent("Lisbon long weekend: departs Nov 3, 2026, $6,400, booked");
  });
});

describe("rep 25: the three planted bugs reproduce", () => {
  it("DSH-910: the countdown freezes one second in", async () => {
    await loadPage();
    expect(screen.getByLabelText("Countdown")).toHaveTextContent("14:59");
    await new Promise((r) => setTimeout(r, 2600));
    expect(screen.getByLabelText("Countdown")).toHaveTextContent("14:58");
  });
  it("DSH-914: completing the task you have open blanks the page", async () => {
    const user = userEvent.setup();
    await loadPage();
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await user.click(screen.getByRole("button", { name: "Open Send Lisbon proposal v2" }));
    await user.click(screen.getByRole("button", { name: "Done Send Lisbon proposal v2" }));
    await waitFor(() => expect(screen.getByTestId("crash")).toBeInTheDocument(), { timeout: 3000 });
    spy.mockRestore();
  });
  it("DSH-918: the spotlight shows the trip name where the client's name belongs", async () => {
    await loadPage();
    expect(screen.getByLabelText("Spotlight name")).toHaveTextContent("Lisbon long weekend");
  });
});
