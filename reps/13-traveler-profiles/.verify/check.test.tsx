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
  await screen.findByRole("heading", { level: 2, name: "Maya Okafor" }, { timeout: 3000 });
}

describe("rep 13: your fixes", () => {
  it("TRV-610 fixed: switching between flagged and unflagged travelers never crashes, and the acknowledgement works", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByRole("button", { name: "Open Yuki Tanaka" }));
    await user.click(screen.getByLabelText("Acknowledge renewal"));
    expect(screen.getByLabelText("Acknowledge renewal")).toBeChecked();
    await user.click(screen.getByRole("button", { name: "Open Noah Reyes" }));
    expect(screen.queryByTestId("crash")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Noah Reyes" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Open Yuki Tanaka" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/Renewal needed/);
  });
  it("TRV-614 fixed: no passport reads as such, never NaN", async () => {
    await loadPage();
    expect(screen.getByLabelText("Passport Noah Reyes")).toHaveTextContent(/No passport on file/);
    expect(screen.getByLabelText("Passport Tunde Okafor")).toHaveTextContent("253 days left");
  });
  it("TRV-618 fixed: under six months flags, exactly six months doesn't", async () => {
    await loadPage();
    expect(screen.getByLabelText("Renewal Ada Okafor")).toBeInTheDocument();
    expect(screen.getByLabelText("Renewal Yuki Tanaka")).toBeInTheDocument();
    expect(screen.queryByLabelText("Renewal Sofia Reyes")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Renewal Tunde Okafor")).not.toBeInTheDocument();
  });
  it("the rest of the page still works", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByRole("button", { name: "Open Ada Okafor" }));
    expect(screen.getByLabelText("Notes")).toHaveValue("Minor; needs consent letter when traveling with one parent.");
  });
});
