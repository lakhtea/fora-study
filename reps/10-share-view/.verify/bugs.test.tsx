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

describe("rep 10: page works outside the planted bugs", () => {
  it("shows the share, the day picker, day 1 items, and item details on demand", async () => {
    const user = userEvent.setup();
    await loadPage();
    expect(screen.getByLabelText("Day 1")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Prepared for Maya Okafor")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Details for Airport transfer" }));
    expect(screen.getByText(/Driver meets you at arrivals/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Copy link" }));
    expect(screen.getByRole("button", { name: "Copy link" })).toHaveTextContent("Link copied");
  });
  it("switches days when you wait for each to load", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByLabelText("Day 3"));
    await waitFor(() => expect(screen.getByLabelText("Day items")).toHaveTextContent("Checkout and transfer"), { timeout: 3000 });
    expect(within(screen.getByLabelText("Day items")).getAllByRole("listitem")).toHaveLength(1);
  });
});

describe("rep 10: the three planted bugs reproduce", () => {
  it("SHR-401: ticking show all details blanks the page", async () => {
    await loadPage();
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    fireEvent.click(screen.getByLabelText("Show all details"));
    await waitFor(() => expect(screen.getByTestId("crash")).toBeInTheDocument(), { timeout: 3000 });
    spy.mockRestore();
  });
  it("SHR-404: an expired link shows an empty itinerary with no explanation", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.selectOptions(screen.getByLabelText("Preview link"), "expired-77");
    await screen.findByRole("heading", { level: 1, name: "Your itinerary" }, { timeout: 3000 });
    expect(screen.getByText("No days planned yet.")).toBeInTheDocument();
    expect(screen.queryByText(/This link has expired/)).not.toBeInTheDocument();
  });
  it("SHR-408: switching Day 1 then Day 3 quickly shows Day 1's items under the Day 3 heading", async () => {
    await loadPage();
    fireEvent.click(screen.getByLabelText("Day 2"));
    await new Promise((r) => setTimeout(r, 600));
    fireEvent.click(screen.getByLabelText("Day 1"));
    fireEvent.click(screen.getByLabelText("Day 3"));
    await new Promise((r) => setTimeout(r, 1200));
    expect(screen.getByLabelText("Day heading")).toHaveTextContent("Day 3: Departure");
    expect(within(screen.getByLabelText("Day items")).getAllByRole("listitem")).toHaveLength(5);
    expect(screen.getByLabelText("Day items")).toHaveTextContent("Airport transfer");
  });
});
