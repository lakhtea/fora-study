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

describe("rep 25: your fixes", () => {
  it("DSH-910 fixed: the countdown keeps counting", async () => {
    await loadPage();
    await new Promise((r) => setTimeout(r, 2600));
    const text = screen.getByLabelText("Countdown").textContent!;
    expect(Number(text.split(":")[1])).toBeLessThanOrEqual(57);
  });
  it("DSH-914 fixed: completing the open task clears the panel", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByRole("button", { name: "Open Send Lisbon proposal v2" }));
    await user.click(screen.getByRole("button", { name: "Done Send Lisbon proposal v2" }));
    await waitFor(() => expect(screen.getByText("Today (3 open)")).toBeInTheDocument(), { timeout: 3000 });
    expect(screen.queryByTestId("crash")).not.toBeInTheDocument();
    expect(screen.getByText("Open a task to see the details.")).toBeInTheDocument();
  });
  it("DSH-918 fixed: the spotlight shows the client's name and the trip's name in their places", async () => {
    await loadPage();
    expect(screen.getByLabelText("Spotlight name")).toHaveTextContent("Maya Okafor");
    expect(screen.getByLabelText("Spotlight trip")).toHaveTextContent("Lisbon long weekend");
  });
  it("the rest of the page still works", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByRole("button", { name: "Done Chase Kyoto rate" }));
    await waitFor(() => expect(screen.getByText("Today (3 open)")).toBeInTheDocument(), { timeout: 3000 });
  });
});
