import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { resetServer, saveLog } from "./api/server";

beforeEach(() => resetServer());

async function loadPage() {
  render(<App />);
  await screen.findByRole("heading", { level: 1, name: "Lisbon long weekend" }, { timeout: 4000 });
}
function dayCard(n: number) { return screen.getByRole("heading", { level: 3, name: new RegExp(`^Day ${n}:`) }).closest(".card") as HTMLElement; }

describe("app 02 acceptance", () => {
  it("renders days, items, and totals", async () => {
    await loadPage();
    expect(screen.getByLabelText("Trip total")).toHaveTextContent("$730");
    expect(screen.getByLabelText("Day 1 total")).toHaveTextContent("$635");
    expect(within(dayCard(2)).getByText("Alfama Food Walk")).toBeInTheDocument();
  });
  it("adds an item and updates totals", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.selectOptions(screen.getByLabelText("Kind for day 3"), "hotel");
    await user.type(screen.getByLabelText("Title for day 3"), "Bairro Alto Hotel");
    await user.type(screen.getByLabelText("Price for day 3"), "390");
    await user.click(screen.getByRole("button", { name: "Add to day 3" }));
    expect(within(dayCard(3)).getByText("Bairro Alto Hotel")).toBeInTheDocument();
    expect(screen.getByLabelText("Trip total")).toHaveTextContent("$1,120");
    expect(screen.getByLabelText("Title for day 3")).toHaveValue("");
  });
  it("moves within a day, disables at the ends, and undoes", async () => {
    const user = userEvent.setup();
    await loadPage();
    expect(screen.getByRole("button", { name: "Move up Airport transfer" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Move down Airport transfer" }));
    const titles = () => Array.from(dayCard(1).querySelectorAll("[data-testid='item-title']")).map((n) => n.textContent);
    expect(titles()[0]).toContain("Four Seasons Lisbon");
    await user.click(screen.getByLabelText("Undo"));
    expect(titles()[0]).toContain("Airport transfer");
    await user.click(screen.getByRole("button", { name: "Remove Airport transfer" }));
    expect(screen.getByLabelText("Trip total")).toHaveTextContent("$655");
    await user.click(screen.getByLabelText("Undo"));
    expect(screen.getByLabelText("Trip total")).toHaveTextContent("$730");
  });
  it("autosaves once after a burst of edits and reports status", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByRole("button", { name: "Remove Alfama Food Walk" }));
    await user.click(screen.getByRole("button", { name: "Move down Airport transfer" }));
    await user.click(screen.getByRole("button", { name: "Move up Four Seasons Lisbon" }));
    expect(screen.getByLabelText("Save status")).toHaveTextContent("Unsaved");
    await waitFor(() => expect(screen.getByLabelText("Save status")).toHaveTextContent("Saved"), { timeout: 4000 });
    expect(saveLog).toHaveLength(1);
    expect(saveLog[0].itemCount).toBe(2);
  });
  it("handles a 409 with an alert and a reload", async () => {
    const user = userEvent.setup();
    await loadPage();
    const { apiFetch } = await import("./api/server");
    const current = await (await apiFetch("/api/itineraries/7")).json();
    await apiFetch("/api/itineraries/7", { method: "PUT", body: JSON.stringify({ ...current, title: "Lisbon long weekend (edited elsewhere)" }) });
    await user.click(screen.getByRole("button", { name: "Remove Alfama Food Walk" }));
    expect(await screen.findByRole("alert", {}, { timeout: 4000 })).toHaveTextContent("Someone else edited this trip");
    expect(screen.getByLabelText("Save status")).toHaveTextContent("Unsaved");
    await user.click(screen.getByRole("button", { name: "Reload" }));
    await screen.findByRole("heading", { level: 1, name: "Lisbon long weekend (edited elsewhere)" }, { timeout: 4000 });
  });
});
