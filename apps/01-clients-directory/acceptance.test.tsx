import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

async function loadPage() {
  render(<App />);
  await waitFor(() => expect(screen.getByLabelText("Result count")).toHaveTextContent("12 clients"), { timeout: 4000 });
}
function rowFor(name: string) { return screen.getByText(name, { selector: "td, td *" }).closest("tr")!; }

describe("app 01 acceptance", () => {
  it("renders the list with a count, badges, and whole-dollar values", async () => {
    await loadPage();
    expect(screen.getAllByRole("row")).toHaveLength(13);
    expect(rowFor("Maya Okafor")).toHaveTextContent("$48,200");
    expect(rowFor("Maya Okafor").querySelector(".badge")).toHaveTextContent("active");
  });
  it("debounces search into one request and never shows stale results", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.type(screen.getByLabelText("Search clients"), "chic");
    await waitFor(() => expect(screen.getByLabelText("Result count")).toHaveTextContent("2 clients"), { timeout: 4000 });
    expect(screen.getByText("Leo Castellano")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Search clients"), { target: { value: "" } });
    await new Promise((r) => setTimeout(r, 320));
    fireEvent.change(screen.getByLabelText("Search clients"), { target: { value: "priya" } });
    await new Promise((r) => setTimeout(r, 1500));
    expect(screen.getByLabelText("Result count")).toHaveTextContent("1 clients");
    expect(screen.queryByText("Leo Castellano")).not.toBeInTheDocument();
  });
  it("filters by status immediately", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.selectOptions(screen.getByLabelText("Filter by status"), "prospect");
    await waitFor(() => expect(screen.getByLabelText("Result count")).toHaveTextContent("3 clients"), { timeout: 4000 });
  });
  it("sorts by lifetime value and flips", async () => {
    const user = userEvent.setup();
    await loadPage();
    const header = screen.getByRole("button", { name: /^Lifetime value/ });
    await user.click(header);
    const first = screen.getAllByRole("row")[1].textContent!;
    await user.click(header);
    const flipped = screen.getAllByRole("row")[1].textContent!;
    expect(first).not.toEqual(flipped);
    expect([first, flipped].some((t) => t.includes("Daniel Reyes"))).toBe(true);
  });
  it("selects a client, loads the panel, and shows trips", async () => {
    const user = userEvent.setup();
    await loadPage();
    expect(screen.getByLabelText("Client panel")).toHaveTextContent("Select a client");
    await user.click(rowFor("Maya Okafor"));
    expect(rowFor("Maya Okafor")).toHaveClass("selected");
    const panel = screen.getByLabelText("Client panel");
    await within(panel).findByRole("heading", { level: 2, name: "Maya Okafor" }, { timeout: 4000 });
    expect(within(panel).getByText("+1 718 555 0142")).toBeInTheDocument();
    expect(within(panel).getByText("Lisbon, Nov 3, 2026")).toBeInTheDocument();
  });
  it("shows an empty state", async () => {
    await loadPage();
    fireEvent.change(screen.getByLabelText("Search clients"), { target: { value: "zzzz" } });
    await screen.findByText("No clients match", {}, { timeout: 4000 });
  });
});
