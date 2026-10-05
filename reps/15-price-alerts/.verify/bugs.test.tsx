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

describe("rep 15: page works outside the planted bugs", () => {
  it("lists alerts with savings and subscribes a new booking", async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await loadPage();
    expect(screen.getByLabelText("Summary")).toHaveTextContent("$25 a night in drops found");
    expect(screen.getByLabelText("Last check FORA-610298")).toHaveTextContent("Oct 4");
    await user.type(screen.getByLabelText("Booking reference"), "FORA-610233");
    await user.click(screen.getByRole("button", { name: "Subscribe" }));
    await waitFor(() => expect(screen.getByLabelText("Summary")).toHaveTextContent("3 bookings watched"), { timeout: 3000 });
    expect(screen.getByText("Four Seasons Lisbon")).toBeInTheDocument();
    spy.mockRestore();
  });
});

describe("rep 15: the three planted bugs reproduce", () => {
  it("PRD-810: Subscribe submits the form the browser way (a full reload outside the test)", async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await loadPage();
    const watcher = submitWatcher();
    await user.type(screen.getByLabelText("Booking reference"), "FORA-610518");
    await user.click(screen.getByRole("button", { name: "Subscribe" }));
    expect(watcher.seen.fired).toBe(true);
    expect(watcher.seen.prevented).toBe(false);
    watcher.stop();
    await new Promise((r) => setTimeout(r, 400));
    spy.mockRestore();
  });
  it("PRD-814: Look up never finds a valid reference", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.type(screen.getByLabelText("Booking reference"), "FORA-610233");
    await user.click(screen.getByRole("button", { name: "Look up" }));
    expect(screen.getByText("No booking with that reference")).toBeInTheDocument();
    expect(screen.queryByLabelText("Booking preview")).not.toBeInTheDocument();
  });
  it("PRD-818: next check shows the same day as the last check", async () => {
    await loadPage();
    expect(screen.getByLabelText("Last check FORA-610298")).toHaveTextContent("Oct 4");
    expect(screen.getByLabelText("Next check FORA-610298")).toHaveTextContent("Oct 4");
  });
});
