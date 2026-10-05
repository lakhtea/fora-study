import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { resetServer } from "../api/server";

beforeEach(() => resetServer());
async function loadPage() {
  render(<App />);
  await screen.findByText("6 of 6 travelers still need a room", {}, { timeout: 3000 });
}

describe("rep 14: your fixes", () => {
  it("RMB-701 fixed: switching blocks resets the form to that block's rooms", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.selectOptions(screen.getByLabelText("Room"), "3");
    await user.click(screen.getByRole("button", { name: "Open Casa Lima" }));
    expect(screen.getByLabelText("Assignment preview")).toHaveTextContent("Assigning to: Sea view");
    expect(screen.getByLabelText("Assignment preview")).not.toHaveTextContent("not in this block");
  });
  it("RMB-705 fixed: the room and traveler you picked are the ones assigned", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.selectOptions(screen.getByLabelText("Room"), "3");
    await user.selectOptions(screen.getByLabelText("Traveler"), "2");
    await user.click(screen.getByLabelText("Assign"));
    await waitFor(() => expect(screen.getByLabelText("Occupant Loft")).toHaveTextContent("Tunde Okafor"), { timeout: 3000 });
    expect(screen.getByLabelText("Occupant Garden room")).toHaveTextContent("Unassigned");
    await new Promise((r) => setTimeout(r, 200));
  });
  it("RMB-709 fixed: a rejected assignment shows the reason and the button recovers", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.selectOptions(screen.getByLabelText("Room"), "1");
    await user.selectOptions(screen.getByLabelText("Traveler"), "1");
    await user.click(screen.getByLabelText("Assign"));
    await waitFor(() => expect(screen.getByLabelText("Occupant Master suite")).toHaveTextContent("Maya Okafor"), { timeout: 3000 });
    await user.selectOptions(screen.getByLabelText("Room"), "2");
    await user.selectOptions(screen.getByLabelText("Traveler"), "2");
    const { apiFetch } = await import("../api/server");
    await apiFetch("/api/rooms/2/assign", { method: "POST", body: JSON.stringify({ travelerId: 6 }) });
    await user.click(screen.getByLabelText("Assign"));
    expect(await screen.findByRole("alert", {}, { timeout: 3000 })).toHaveTextContent(/already assigned/);
    expect(screen.getByLabelText("Assign")).toBeEnabled();
    await new Promise((r) => setTimeout(r, 200));
  });
  it("the rest of the page still works", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByRole("button", { name: "Open Casa Lima" }));
    expect(screen.getByLabelText("Rooms at Casa Lima")).toBeInTheDocument();
  });
});
