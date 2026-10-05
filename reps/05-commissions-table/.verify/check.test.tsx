import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

async function loadPage() {
  render(<App />);
  await screen.findByText("12 bookings this quarter", {}, { timeout: 3000 });
}

describe("rep 05: your fixes", () => {
  it("COM-702 fixed: one keypress starts one export, with the current filters", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.selectOptions(screen.getByLabelText("Status"), "pending");
    await user.selectOptions(screen.getByLabelText("Status"), "all");
    await user.selectOptions(screen.getByLabelText("Status"), "pending");
    fireEvent.keyDown(window, { key: "e" });
    await waitFor(() => expect(screen.getByLabelText("Exports started")).toHaveTextContent("Exports started: 1"), { timeout: 3000 });
    await new Promise((r) => setTimeout(r, 500));
    expect(screen.getByLabelText("Exports started")).toHaveTextContent("Exports started: 1");
    expect(screen.getByLabelText("Export log")).toHaveTextContent("5 rows (pending, all dates)");
  });
  it("COM-705 fixed: Paid shows the five paid bookings", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.selectOptions(screen.getByLabelText("Status"), "paid");
    expect(screen.getByLabelText("Total label")).toHaveTextContent("Total for 5 bookings");
    expect(screen.getByLabelText("Total commission")).toHaveTextContent("$2,422");
  });
  it("COM-709 fixed: the range includes both ends", async () => {
    await loadPage();
    fireEvent.change(screen.getByLabelText("Travel from"), { target: { value: "2026-10-01" } });
    fireEvent.change(screen.getByLabelText("Travel to"), { target: { value: "2026-10-15" } });
    expect(screen.getByLabelText("Total label")).toHaveTextContent("Total for 6 bookings");
    expect(screen.getByText("Fatima El-Amin")).toBeInTheDocument();
    expect(screen.getByText("Leo Castellano")).toBeInTheDocument();
    expect(screen.queryByText("Chloe Dubois")).not.toBeInTheDocument();
  });
  it("the rest of the page still works", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByRole("button", { name: "Export filtered rows" }));
    await waitFor(() => expect(screen.getByLabelText("Exports started")).toHaveTextContent("Exports started: 1"), { timeout: 3000 });
  });
});
