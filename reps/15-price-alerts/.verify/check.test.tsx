import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { resetServer } from "../api/server";

beforeEach(() => resetServer());
async function loadPage() {
  render(<App />);
  await screen.findByText(/2 bookings watched/, {}, { timeout: 3000 });
}
function submitWatcher() {
  const seen = { fired: false, prevented: false };
  const handler = (e: Event) => { seen.fired = true; seen.prevented = e.defaultPrevented; };
  document.addEventListener("submit", handler);
  return { seen, stop: () => document.removeEventListener("submit", handler) };
}

describe("rep 15: your fixes", () => {
  it("PRD-810 fixed: Subscribe is handled in the page, and Enter still submits", async () => {
    const user = userEvent.setup();
    await loadPage();
    const watcher = submitWatcher();
    await user.type(screen.getByLabelText("Booking reference"), "FORA-610518{Enter}");
    expect(watcher.seen.fired).toBe(true);
    expect(watcher.seen.prevented).toBe(true);
    watcher.stop();
    await waitFor(() => expect(screen.getByLabelText("Summary")).toHaveTextContent("3 bookings watched"), { timeout: 3000 });
    expect(screen.getByLabelText("Booking reference")).toHaveValue("");
  });
  it("PRD-814 fixed: Look up previews the booking, however the reference is typed", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.type(screen.getByLabelText("Booking reference"), " fora-610233 ");
    await user.click(screen.getByRole("button", { name: "Look up" }));
    expect(screen.getByLabelText("Booking preview")).toHaveTextContent("Four Seasons Lisbon for Maya Okafor");
    expect(screen.queryByText("No booking with that reference")).not.toBeInTheDocument();
  });
  it("PRD-818 fixed: next check is the day after the last check", async () => {
    await loadPage();
    expect(screen.getByLabelText("Last check FORA-610298")).toHaveTextContent("Oct 4");
    expect(screen.getByLabelText("Next check FORA-610298")).toHaveTextContent("Oct 5");
  });
  it("the rest of the page still works", async () => {
    await loadPage();
    expect(screen.getByLabelText("Summary")).toHaveTextContent("$25 a night in drops found");
  });
});
