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
  await screen.findByText("Alfama Food Walk", { selector: "li span span, li span" }, { timeout: 3000 }).catch(() => null);
}

describe("rep 02: page works outside the planted bugs", () => {
  it("loads the trip, totals, and the default activity list", async () => {
    await loadPage();
    expect(screen.getByLabelText("Trip total")).toHaveTextContent("$1,120");
    const results = await screen.findByLabelText("Supplier results", {}, { timeout: 3000 });
    await within(results).findByText(/Louvre After Hours/, {}, { timeout: 3000 });
  });
  it("adds a supplier to a day, moves items, and updates totals", async () => {
    const user = userEvent.setup();
    await loadPage();
    const results = screen.getByLabelText("Supplier results");
    await within(results).findByText(/Louvre After Hours/, {}, { timeout: 3000 });
    await user.selectOptions(screen.getByLabelText("Target day"), "1");
    await user.click(within(within(results).getByText(/Louvre After Hours/).closest("li")!).getByRole("button", { name: "Add" }));
    expect(screen.getByLabelText("Trip total")).toHaveTextContent("$1,330");
    expect(screen.getByText(/5 items/)).toBeInTheDocument();
    const dayTwo = screen.getByText(/Day 2:/).closest(".card")!;
    const titles = () => Array.from(dayTwo.querySelectorAll(".item .grow > div:first-child")).map((n) => n.textContent);
    expect(titles()).toEqual(["Alfama Food Walk", "Louvre After Hours"]);
    await user.click(screen.getByRole("button", { name: "Move Louvre After Hours up" }));
    expect(titles()).toEqual(["Louvre After Hours", "Alfama Food Walk"]);
  });
});

describe("rep 02: the three planted bugs reproduce", () => {
  it("ITN-311: switching Hotels then Transfers quickly ends up showing hotels", async () => {
    await loadPage();
    const select = screen.getByLabelText("Supplier category");
    fireEvent.change(select, { target: { value: "hotel" } });
    fireEvent.change(select, { target: { value: "transfer" } });
    await new Promise((r) => setTimeout(r, 1200));
    expect((select as HTMLSelectElement).value).toBe("transfer");
    const results = screen.getByLabelText("Supplier results");
    expect(within(results).getByText(/Belmond Hotel Cipriani/)).toBeInTheDocument();
  });
  it("ITN-315: removing the selected item crashes the page", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByRole("button", { name: "Open Alfama Food Walk" }));
    expect(screen.getByRole("heading", { level: 2, name: "Alfama Food Walk" })).toBeInTheDocument();
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await user.click(screen.getByRole("button", { name: "Remove Alfama Food Walk" }));
    expect(screen.getByTestId("crash")).toBeInTheDocument();
    spy.mockRestore();
  });
  it("ITN-318: after removing the first item, its note shows on the next item", async () => {
    const user = userEvent.setup();
    await loadPage();
    const transferNote = screen.getByLabelText("Note for Airport transfer") as HTMLTextAreaElement;
    expect(transferNote.value).toBe("Flight lands 7:40am");
    await user.click(screen.getByRole("button", { name: "Remove Airport transfer" }));
    const hotelNote = screen.getByLabelText("Note for Four Seasons Lisbon") as HTMLTextAreaElement;
    expect(hotelNote.value).toBe("Flight lands 7:40am");
  });
});
