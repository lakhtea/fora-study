import { Component, type ReactNode } from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

class Boundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(err: Error) { return { error: err.message }; }
  render() { return this.state.error ? <div data-testid="crash">{this.state.error}</div> : this.props.children; }
}
async function loadPage() {
  render(<Boundary><App /></Boundary>);
  await screen.findByRole("heading", { level: 1, name: "Lisbon long weekend" }, { timeout: 3000 });
  await waitFor(() => expect(within(screen.getByLabelText("Day items")).getAllByRole("listitem")).toHaveLength(5), { timeout: 3000 });
}

describe("rep 10: your fixes", () => {
  it("SHR-401 fixed: show all details opens every item and can be turned off again", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByLabelText("Show all details"));
    expect(screen.queryByTestId("crash")).not.toBeInTheDocument();
    expect(screen.getByText(/Driver meets you at arrivals/)).toBeInTheDocument();
    expect(screen.getByText(/Tasting menu/)).toBeInTheDocument();
    await user.click(screen.getByLabelText("Show all details"));
    expect(screen.queryByText(/Tasting menu/)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Details for Airport transfer" }));
    expect(screen.getByText(/Driver meets you at arrivals/)).toBeInTheDocument();
  });
  it("SHR-404 fixed: an expired link says so", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.selectOptions(screen.getByLabelText("Preview link"), "expired-77");
    expect(await screen.findByText(/This link has expired/, {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.queryByText("No days planned yet.")).not.toBeInTheDocument();
  });
  it("SHR-408 fixed: the items always match the heading", async () => {
    await loadPage();
    fireEvent.click(screen.getByLabelText("Day 2"));
    await new Promise((r) => setTimeout(r, 600));
    fireEvent.click(screen.getByLabelText("Day 1"));
    fireEvent.click(screen.getByLabelText("Day 3"));
    await new Promise((r) => setTimeout(r, 1200));
    expect(screen.getByLabelText("Day heading")).toHaveTextContent("Day 3: Departure");
    expect(within(screen.getByLabelText("Day items")).getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByLabelText("Day items")).toHaveTextContent("Checkout and transfer");
  });
  it("the rest of the page still works", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByRole("button", { name: "Copy link" }));
    expect(screen.getByRole("button", { name: "Copy link" })).toHaveTextContent("Link copied");
  });
});
