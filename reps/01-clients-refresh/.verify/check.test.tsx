import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

async function loadPage() { render(<App />); await screen.findByText("13 shown", {}, { timeout: 3000 }); }
function rowFor(name: string) { return screen.getByText(name, { selector: "td" }).closest("tr")!; }
function cells(row: HTMLElement) { return Array.from(row.querySelectorAll("td")).map((td) => td.textContent); }

describe("rep 01: your fixes", () => {
  it("CLI-204 fixed: Maya shows Lisbon, Priya shows none", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(rowFor("Maya Okafor"));
    let panel = (await screen.findByRole("heading", { level: 2, name: "Maya Okafor" }, { timeout: 3000 })).closest(".panel")!;
    expect(within(panel).getByText(/Lisbon, Nov 3, 2026 to Nov 10, 2026/)).toBeInTheDocument();
    await user.click(rowFor("Priya Natarajan"));
    panel = (await screen.findByRole("heading", { level: 2, name: "Priya Natarajan" }, { timeout: 3000 })).closest(".panel")!;
    expect(within(panel).getByText("No upcoming trips")).toBeInTheDocument();
  });
  it("CLI-209 fixed: the counter advances past 2s", async () => {
    await loadPage();
    await screen.findByText(/Last refreshed \ds ago/);
    await new Promise((r) => setTimeout(r, 2600));
    expect(Number(screen.getByText(/Last refreshed \ds ago/).textContent!.match(/(\d)s/)![1])).toBeGreaterThanOrEqual(2);
  });
  it("CLI-213 fixed: Client since matches the panel and the booking column still works", async () => {
    await loadPage();
    expect(cells(rowFor("Daniel Reyes"))[3]).toBe("Nov 2, 2022");
    expect(cells(rowFor("Tom Lindqvist"))[3]).toBe("May 22, 2021");
    expect(cells(rowFor("Priya Natarajan"))[3]).toBe("Sep 1, 2026");
    expect(cells(rowFor("Daniel Reyes"))[4]).toBe("Scottsdale, 4 nights");
    expect(cells(rowFor("Priya Natarajan"))[4]).toBe("None yet");
  });
  it("the rest of the page still works", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.type(screen.getByLabelText("Search clients"), "chicago");
    await screen.findByText("2 shown", {}, { timeout: 3000 });
  });
});
