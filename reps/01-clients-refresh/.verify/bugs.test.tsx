import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

async function loadPage() { render(<App />); await screen.findByText("13 shown", {}, { timeout: 3000 }); }
function rowFor(name: string) { return screen.getByText(name, { selector: "td" }).closest("tr")!; }
function cells(row: HTMLElement) { return Array.from(row.querySelectorAll("td")).map((td) => td.textContent); }

describe("rep 01: page works outside the planted bugs", () => {
  it("renders clients, last-booking column, and the panel empty state", async () => {
    await loadPage();
    expect(screen.getByText("Select a client to see details.")).toBeInTheDocument();
    expect(cells(rowFor("Daniel Reyes"))[4]).toBe("Scottsdale, 4 nights");
    expect(cells(rowFor("Priya Natarajan"))[4]).toBe("None yet");
  });
  it("search, status filter, and sort work", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.type(screen.getByLabelText("Search clients"), "chicago");
    await screen.findByText("2 shown", {}, { timeout: 3000 });
    await user.clear(screen.getByLabelText("Search clients"));
    await screen.findByText("13 shown", {}, { timeout: 3000 });
    await user.selectOptions(screen.getByLabelText("Filter by status"), "prospect");
    await screen.findByText("3 shown", {}, { timeout: 3000 });
    await user.selectOptions(screen.getByLabelText("Filter by status"), "all");
    await screen.findByText("13 shown", {}, { timeout: 3000 });
    const header = screen.getByRole("button", { name: /^Client( \u2191| \u2193)?$/u });
    await user.click(header);
    const before = screen.getAllByRole("row")[1].textContent;
    await user.click(header);
    expect(screen.getAllByRole("row")[1].textContent).not.toEqual(before);
  });
  it("loads details with phone, notes, and the correct client-since date", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(rowFor("Daniel Reyes"));
    const panel = (await screen.findByRole("heading", { level: 2, name: "Daniel Reyes" }, { timeout: 3000 })).closest(".panel")!;
    expect(within(panel).getByText("+1 512 555 0199")).toBeInTheDocument();
    expect(within(panel).getByText("Nov 2, 2022")).toBeInTheDocument();
    expect(rowFor("Daniel Reyes")).toHaveClass("selected");
  });
});

describe("rep 01: the three planted bugs reproduce", () => {
  it("CLI-204: upcoming trips never show", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(rowFor("Maya Okafor"));
    const panel = (await screen.findByRole("heading", { level: 2, name: "Maya Okafor" }, { timeout: 3000 })).closest(".panel")!;
    expect(within(panel).getByText("No upcoming trips")).toBeInTheDocument();
  });
  it("CLI-209: the refreshed counter freezes at 1s", async () => {
    await loadPage();
    await screen.findByText(/Last refreshed \ds ago/);
    await new Promise((r) => setTimeout(r, 2600));
    expect(screen.getByText("Last refreshed 1s ago")).toBeInTheDocument();
  });
  it("CLI-213: Client since is wrong only for clients with a booking", async () => {
    await loadPage();
    expect(cells(rowFor("Daniel Reyes"))[3]).toBe("May 28, 2026");
    expect(cells(rowFor("Tom Lindqvist"))[3]).toBe("Jan 15, 2024");
    expect(cells(rowFor("Priya Natarajan"))[3]).toBe("Sep 1, 2026");
  });
});
