import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { resetServer } from "../api/server";

beforeEach(() => resetServer());
async function loadPage() {
  render(<App />);
  await screen.findByText("6 of 6 travelers still need a room", {}, { timeout: 3000 });
}

describe("rep 14: page works outside the planted bugs", () => {
  it("assigns Maya to the master suite and updates the counts", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.selectOptions(screen.getByLabelText("Room"), "1");
    await user.selectOptions(screen.getByLabelText("Traveler"), "1");
    await user.click(screen.getByLabelText("Assign"));
    await waitFor(() => expect(screen.getByLabelText("Occupant Master suite")).toHaveTextContent("Maya Okafor"), { timeout: 3000 });
    expect(screen.getByText("5 of 6 travelers still need a room")).toBeInTheDocument();
    expect(screen.getByLabelText("Assign")).toBeEnabled();
    await new Promise((r) => setTimeout(r, 200));
  });
});

describe("rep 14: the three planted bugs reproduce", () => {
  it("RMB-701: after switching blocks the form still targets the previous block's room", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.selectOptions(screen.getByLabelText("Room"), "3");
    await user.click(screen.getByRole("button", { name: "Open Casa Lima" }));
    expect(screen.getByRole("heading", { level: 2, name: "Assign a room at Casa Lima" })).toBeInTheDocument();
    expect(screen.getByLabelText("Assignment preview")).toHaveTextContent("Loft (not in this block)");
  });
  it("RMB-705: assigning Tunde to the Loft puts Ada in the Garden room", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.selectOptions(screen.getByLabelText("Room"), "3");
    await user.selectOptions(screen.getByLabelText("Traveler"), "2");
    await user.click(screen.getByLabelText("Assign"));
    await waitFor(() => expect(screen.getByLabelText("Occupant Garden room")).toHaveTextContent("Ada Okafor"), { timeout: 3000 });
    expect(screen.getByLabelText("Occupant Loft")).toHaveTextContent("Unassigned");
    await new Promise((r) => setTimeout(r, 200));
  });
  it("RMB-709: a rejected assignment leaves the button on Assigning", async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await loadPage();
    await user.selectOptions(screen.getByLabelText("Room"), "3");
    await user.selectOptions(screen.getByLabelText("Traveler"), "2");
    await user.click(screen.getByLabelText("Assign"));
    await waitFor(() => expect(screen.getByLabelText("Assign")).toBeEnabled(), { timeout: 3000 });
    await user.click(screen.getByLabelText("Assign"));
    await new Promise((r) => setTimeout(r, 1000));
    expect(screen.getByLabelText("Assign")).toHaveTextContent("Assigning");
    expect(screen.getByLabelText("Assign")).toBeDisabled();
    expect(screen.queryByText(/already assigned/)).not.toBeInTheDocument();
    spy.mockRestore();
  });
});
