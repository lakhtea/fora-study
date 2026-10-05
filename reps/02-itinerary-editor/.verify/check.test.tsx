import { Component, type ReactNode } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
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
}

describe("rep 02: your fixes", () => {
  it("ITN-311 fixed: the list matches the category after fast switching", async () => {
    await loadPage();
    const select = screen.getByLabelText("Supplier category");
    fireEvent.change(select, { target: { value: "hotel" } });
    fireEvent.change(select, { target: { value: "transfer" } });
    await new Promise((r) => setTimeout(r, 1200));
    const results = screen.getByLabelText("Supplier results");
    expect(within(results).getByText(/Bella Vista Transfers/)).toBeInTheDocument();
    expect(within(results).queryByText(/Belmond Hotel Cipriani/)).not.toBeInTheDocument();
  });
  it("ITN-315 fixed: removing the selected item clears the panel instead of crashing", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByRole("button", { name: "Open Alfama Food Walk" }));
    await user.click(screen.getByRole("button", { name: "Remove Alfama Food Walk" }));
    expect(screen.queryByTestId("crash")).not.toBeInTheDocument();
    expect(screen.getByText("Select an item to see its details.")).toBeInTheDocument();
  });
  it("ITN-318 fixed: notes stay with their items after a removal", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByRole("button", { name: "Remove Airport transfer" }));
    const hotelNote = screen.getByLabelText("Note for Four Seasons Lisbon") as HTMLTextAreaElement;
    expect(hotelNote.value).toBe("Requested high floor");
  });
  it("the rest of the page still works", async () => {
    const user = userEvent.setup();
    await loadPage();
    const results = screen.getByLabelText("Supplier results");
    await within(results).findByText(/Louvre After Hours/, {}, { timeout: 3000 });
    await user.click(within(within(results).getByText(/Louvre After Hours/).closest("li")!).getByRole("button", { name: "Add" }));
    expect(screen.getByLabelText("Trip total")).toHaveTextContent("$1,330");
  });
});
